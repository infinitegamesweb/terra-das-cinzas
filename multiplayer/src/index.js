import { DurableObject } from 'cloudflare:workers';

const CHANNEL_COUNT = 12;
const CHANNEL_CAPACITY = 100;
const TICKET_TTL_MS = 30_000;
const CHANNELS = Array.from({ length: CHANNEL_COUNT }, (_, index) => index + 1);

function channelIdFromPath(path, prefix) {
  const match = path.match(new RegExp(`^${prefix}/(\\d{1,2})$`));
  if (!match) return null;
  const id = Number(match[1]);
  return CHANNELS.includes(id) ? id : null;
}

function channelName(id) {
  return `world-${String(id).padStart(2, '0')}`;
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = new Set((env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean));
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  });
  if (origin && allowed.has(origin)) headers.set('Access-Control-Allow-Origin', origin);
  return headers;
}

function json(request, env, data, status = 200) {
  const headers = corsHeaders(request, env);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { status, headers });
}

function errorResponse(request, env, code, status, message) {
  return json(request, env, { error: code, message }, status);
}

function getChannel(env, id) {
  return env.GAME_CHANNEL.getByName(channelName(id));
}

async function getSupabaseUser(request, env) {
  const authorization = request.headers.get('Authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return { error: 'login_required', status: 401 };
  if (!env.SUPABASE_ANON_KEY) return { error: 'auth_service_not_configured', status: 503 };

  let response;
  try {
    response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${match[1]}`,
        apikey: env.SUPABASE_ANON_KEY
      },
      signal: AbortSignal.timeout(5000)
    });
  } catch {
    return { error: 'auth_service_unavailable', status: 503 };
  }
  if (!response.ok) return { error: 'invalid_session', status: 401 };

  const user = await response.json().catch(() => null);
  if (!user || typeof user.id !== 'string' || !user.id) return { error: 'invalid_session', status: 401 };
  const metadata = user.user_metadata || {};
  const displayName = String(metadata.display_name || metadata.name || user.email?.split('@')[0] || 'Aventureiro')
    .replace(/[<>\u0000-\u001f]/g, '')
    .slice(0, 24) || 'Aventureiro';
  return { userId: user.id, displayName };
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  if (url.pathname === '/' && request.method === 'GET') {
    return json(request, env, {
      service: 'terra-das-cinzas-multiplayer',
      message: 'Servidor de canais ativo. A raiz não é uma página do jogo; use os endpoints abaixo.',
      channels: CHANNEL_COUNT,
      capacityPerChannel: CHANNEL_CAPACITY,
      totalCapacity: CHANNEL_COUNT * CHANNEL_CAPACITY,
      endpoints: {
        health: '/health',
        channels: '/api/channels',
        join: 'POST /api/channels/{id}/ticket',
        websocket: '/ws/{id}?ticket=...'
      }
    });
  }
  if (url.pathname === '/health' && request.method === 'GET') {
    return json(request, env, { ok: true, service: 'terra-das-cinzas-multiplayer', channels: CHANNEL_COUNT, capacityPerChannel: CHANNEL_CAPACITY });
  }

  if (url.pathname === '/api/channels' && request.method === 'GET') {
    try {
      const channels = await Promise.all(CHANNELS.map(async (id) => {
        const status = await getChannel(env, id).getStatus();
        return {
          id,
          name: `Canal ${String(id).padStart(2, '0')}`,
          online: status.online,
          capacity: CHANNEL_CAPACITY,
          available: status.online < CHANNEL_CAPACITY
        };
      }));
      return json(request, env, { channels, totalCapacity: CHANNEL_COUNT * CHANNEL_CAPACITY });
    } catch (error) {
      console.error(JSON.stringify({ event: 'channel_list_failed', error: String(error) }));
      return errorResponse(request, env, 'channel_service_unavailable', 503, 'Não foi possível consultar os canais.');
    }
  }

  const ticketMatch = url.pathname.match(/^\/api\/channels\/(\d{1,2})\/ticket$/);
  if (ticketMatch && request.method === 'POST') {
    const id = Number(ticketMatch[1]);
    if (!CHANNELS.includes(id)) return errorResponse(request, env, 'channel_not_found', 404, 'Esse canal não existe.');
    const user = await getSupabaseUser(request, env);
    if (user.error) return errorResponse(request, env, user.error, user.status, 'Entre na sua conta para acessar um canal.');
    try {
      const ticket = await getChannel(env, id).createJoinTicket(user.userId, user.displayName);
      if (!ticket.ok) return errorResponse(request, env, ticket.error, ticket.status, ticket.message);
      return json(request, env, { channelId: id, ticket: ticket.value, expiresInMs: TICKET_TTL_MS });
    } catch (error) {
      console.error(JSON.stringify({ event: 'channel_ticket_failed', channelId: id, error: String(error) }));
      return errorResponse(request, env, 'channel_service_unavailable', 503, 'Não foi possível reservar a entrada.');
    }
  }

  const socketChannelId = channelIdFromPath(url.pathname, '/ws');
  if (socketChannelId && request.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
    const origin = request.headers.get('Origin');
    const allowedOrigins = new Set((env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean));
    if (!origin || !allowedOrigins.has(origin)) return new Response('Origem não autorizada.', { status: 403 });
    return getChannel(env, socketChannelId).fetch(request);
  }

  return errorResponse(request, env, 'not_found', 404, 'Rota não encontrada.');
}

export class GameChannel extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS join_tickets (
          token_hash TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          display_name TEXT NOT NULL,
          expires_at INTEGER NOT NULL
        )
      `);
      this.ctx.storage.sql.exec('CREATE INDEX IF NOT EXISTS join_tickets_expiry ON join_tickets(expires_at)');
    });
  }

  async getStatus() {
    return { online: this.ctx.getWebSockets().length, capacity: CHANNEL_CAPACITY };
  }

  async createJoinTicket(userId, displayName) {
    const now = Date.now();
    this.ctx.storage.sql.exec('DELETE FROM join_tickets WHERE expires_at <= ?', now);
    const sockets = this.ctx.getWebSockets();
    const players = sockets.map((socket) => socket.deserializeAttachment()).filter(Boolean);
    if (players.some((player) => player.userId === userId)) {
      return { ok: false, error: 'already_in_channel', status: 409, message: 'Sua conta já está conectada neste canal.' };
    }
    if (sockets.length >= CHANNEL_CAPACITY) {
      return { ok: false, error: 'channel_full', status: 409, message: 'Este canal atingiu 100 jogadores.' };
    }

    const ticket = crypto.randomUUID();
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ticket));
    const tokenHash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    this.ctx.storage.sql.exec(
      'INSERT INTO join_tickets (token_hash, user_id, display_name, expires_at) VALUES (?, ?, ?, ?)',
      tokenHash, userId, displayName.slice(0, 24), now + TICKET_TTL_MS
    );
    return { ok: true, value: ticket };
  }

  async fetch(request) {
    const url = new URL(request.url);
    const ticket = url.searchParams.get('ticket');
    if (!ticket || ticket.length > 80) return new Response('Ticket obrigatório.', { status: 401 });

    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ticket));
    const tokenHash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    const now = Date.now();
    const row = this.ctx.storage.sql.exec(
      'DELETE FROM join_tickets WHERE token_hash = ? AND expires_at > ? RETURNING user_id, display_name',
      tokenHash, now
    ).toArray()[0];
    if (!row) return new Response('Ticket inválido ou expirado.', { status: 401 });

    const existingSockets = this.ctx.getWebSockets();
    const players = existingSockets.map((socket) => socket.deserializeAttachment()).filter(Boolean);
    if (players.some((player) => player.userId === row.user_id)) return new Response('Conta já conectada.', { status: 409 });
    if (existingSockets.length >= CHANNEL_CAPACITY) return new Response('Canal cheio.', { status: 409 });

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    const player = { userId: row.user_id, displayName: row.display_name, joinedAt: now };
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(player);

    server.send(JSON.stringify({
      type: 'welcome',
      channelId: Number(channelNameFromRequest(url)),
      player: { name: player.displayName },
      online: existingSockets.length + 1,
      capacity: CHANNEL_CAPACITY,
      note: 'Canal de presença ativo; movimento, combate e progresso ainda não são sincronizados.'
    }));
    const joined = JSON.stringify({ type: 'player_joined', player: { name: player.displayName }, online: existingSockets.length + 1 });
    for (const socket of existingSockets) this.safeSend(socket, joined);
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(socket, message) {
    if (typeof message !== 'string' || message.length > 256) {
      socket.close(4400, 'Mensagem inválida.');
      return;
    }
    let payload;
    try { payload = JSON.parse(message); } catch {
      socket.close(4400, 'JSON inválido.');
      return;
    }
    if (payload?.type === 'ping') {
      this.safeSend(socket, JSON.stringify({ type: 'pong', at: Date.now() }));
      return;
    }
    socket.close(4400, 'Tipo de mensagem ainda não suportado.');
  }

  webSocketClose(socket, code, reason) {
    const player = socket.deserializeAttachment();
    const online = this.ctx.getWebSockets().length;
    if (!player) return;
    const left = JSON.stringify({ type: 'player_left', player: { name: player.displayName }, online });
    for (const client of this.ctx.getWebSockets()) {
      if (client !== socket) this.safeSend(client, left);
    }
    console.log(JSON.stringify({ event: 'channel_player_left', code, reason, online }));
  }

  webSocketError(socket, error) {
    console.warn(JSON.stringify({ event: 'channel_socket_error', error: String(error) }));
    try { socket.close(1011, 'Conexão instável.'); } catch {}
  }

  safeSend(socket, data) {
    try { socket.send(data); } catch {}
  }
}

function channelNameFromRequest(url) {
  return url.pathname.split('/').filter(Boolean).at(-1) || 'canal';
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      console.error(JSON.stringify({ event: 'request_failed', error: String(error) }));
      return errorResponse(request, env, 'internal_error', 500, 'O servidor encontrou um erro.');
    }
  }
};
