// src/systems/multiplayer/CinzasNet.js
// ═══════════════════════════════════════════════════════════════
//  GUERRA DAS CINZAS — Cliente Multiplayer Autoritativo (CinzasNet)
//  Conexão WebSocket em tempo real, LERP suave e login Solana/SIWS
// ═══════════════════════════════════════════════════════════════

export class CinzasNet {
  constructor(serverUrl) {
    this.serverUrl = serverUrl || this.resolveServerUrl();
    this.ws = null;
    this.token = null;
    this.me = null;
    this.myId = null;
    this.channel = null;
    this.isConnected = false;
    this.joined = false;
    this.world = { w: 2000, h: 2000 };

    // Mapa de jogadores remotos: id -> { id, name, x, y, tx, ty, color, msg, msgAt }
    this.remotePlayers = new Map();

    // Callbacks de eventos
    this.onState = () => {};
    this.onChat = () => {};
    this.onJoined = () => {};
    this.onDisconnect = () => {};

    this.lastInputDx = 0;
    this.lastInputDy = 0;
  }

  resolveServerUrl() {
    if (typeof window !== 'undefined' && window.__TDC_NET_URL__) {
      return window.__TDC_NET_URL__.replace(/\/$/, '');
    }
    if (typeof location !== 'undefined') {
      if (['localhost', '127.0.0.1'].includes(location.hostname)) {
        return 'http://localhost:3000';
      }
      return `${location.protocol}//${location.host}`;
    }
    return 'http://localhost:3000';
  }

  getWsUrl() {
    const httpUrl = new URL(this.serverUrl);
    const proto = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${httpUrl.host}/ws?token=${encodeURIComponent(this.token || '')}`;
  }

  // ─── Autenticação com Carteira (Phantom / Solflare / SIWS) ────
  async loginWithWallet() {
    const provider = typeof window !== 'undefined' ? window.solana : null;
    if (!provider || !provider.signMessage) {
      throw new Error('Nenhuma carteira Solana com suporte a assinatura (signMessage) detectada.');
    }
    const connectResult = await provider.connect();
    const publicKey = (connectResult?.publicKey || provider.publicKey).toString();

    // 1. Obter nonce do servidor
    const nonceRes = await fetch(`${this.serverUrl}/auth/nonce`, { method: 'POST' });
    if (!nonceRes.ok) throw new Error('Não foi possível obter credencial do servidor multiplayer.');
    const { nonce, message } = await nonceRes.json();

    // 2. Assinar mensagem com chave privada
    const encoded = new TextEncoder().encode(message);
    const signResult = await provider.signMessage(encoded, 'utf8');
    const signature = Array.from(signResult.signature || signResult);

    // 3. Validar no servidor
    const verifyRes = await fetch(`${this.serverUrl}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey, nonce, signature })
    });
    if (!verifyRes.ok) {
      const err = await verifyRes.json();
      throw new Error(err.error || 'Falha na validação da assinatura.');
    }
    const data = await verifyRes.json();
    this.token = data.token;
    this.me = data;
    return data;
  }

  // ─── Login Convidado (Desenvolvimento / Teste Local) ─────────
  async loginAsGuest(guestName) {
    const res = await fetch(`${this.serverUrl}/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: guestName })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Modo convidado indisponível no servidor.');
    }
    const data = await res.json();
    this.token = data.token;
    this.me = data;
    return data;
  }

  // ─── Conexão WebSocket ───────────────────────────────────────
  connect(channel = 'bosque-1', initialX = null, initialY = null) {
    return new Promise((resolve, reject) => {
      if (!this.token) {
        return reject(new Error('Autentique-se antes de conectar ao canal.'));
      }
      this.disconnect();

      const p = typeof window !== 'undefined' ? window._tdcPlayer : null;
      const sx = Number.isFinite(initialX) ? initialX : (p && Number.isFinite(p.x) ? Math.round(p.x) : 1000);
      const sy = Number.isFinite(initialY) ? initialY : (p && Number.isFinite(p.y) ? Math.round(p.y) : 1000);

      try {
        const ws = new WebSocket(this.getWsUrl());
        this.ws = ws;

        ws.onopen = () => {
          this.isConnected = true;
          ws.send(JSON.stringify({ t: 'join', channel, x: sx, y: sy }));
        };

        ws.onerror = (err) => {
          if (!this.joined) reject(new Error('Falha ao conectar no servidor multiplayer.'));
        };

        ws.onclose = (ev) => {
          this.isConnected = false;
          this.joined = false;
          const wasJoined = this.joined;
          this.remotePlayers.clear();
          this.onDisconnect(ev);
          if (!wasJoined && ev.code !== 1000) {
            reject(new Error(ev.reason || 'Conexão encerrada pelo servidor.'));
          }
        };

        ws.onmessage = (ev) => {
          let m;
          try { m = JSON.parse(ev.data); } catch { return; }

          if (m.t === 'joined') {
            this.joined = true;
            this.myId = m.id;
            this.channel = m.channel;
            this.world = m.world || this.world;
            this.onJoined(m);
            resolve(m);
          } else if (m.t === 'state') {
            this.handleServerState(m.players || []);
          } else if (m.t === 'chat') {
            this.handleChatMessage(m);
          } else if (m.t === 'error') {
            reject(new Error(m.error || 'Erro no canal'));
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  // ─── Processamento de Estado e Interpolação LERP ──────────────
  handleServerState(playersList) {
    const seen = new Set();
    const now = performance.now();

    for (const p of playersList) {
      if (p.id === this.myId) continue; // Jogador local é tratado pelo loop principal
      seen.add(p.id);

      let existing = this.remotePlayers.get(p.id);
      if (!existing) {
        existing = {
          id: p.id,
          name: p.name || `Errante #${p.id}`,
          x: p.x,
          y: p.y,
          tx: p.x,
          ty: p.y,
          color: this.playerColor(p.id),
          msg: null,
          msgAt: 0
        };
        this.remotePlayers.set(p.id, existing);
      } else {
        existing.tx = p.x;
        existing.ty = p.y;
        if (p.name) existing.name = p.name;
      }
    }

    // Remove desconectados
    for (const id of Array.from(this.remotePlayers.keys())) {
      if (!seen.has(id)) this.remotePlayers.delete(id);
    }

    this.onState(Array.from(this.remotePlayers.values()));
  }

  handleChatMessage(m) {
    // Procura o jogador pelo nome para balão de fala
    for (const p of this.remotePlayers.values()) {
      if (p.name === m.from) {
        p.msg = m.text;
        p.msgAt = performance.now();
      }
    }
    this.onChat(m);
  }

  // ─── Atualização de Física / Interpolação Suave (Frame a Frame)
  update(dt = 0.016) {
    const factor = Math.min(1, 14 * dt);
    for (const p of this.remotePlayers.values()) {
      p.x += (p.tx - p.x) * factor;
      p.y += (p.ty - p.y) * factor;
      // Expira balão de fala após 5 segundos
      if (p.msg && performance.now() - p.msgAt > 5000) {
        p.msg = null;
      }
    }
  }

  // ─── Envio de Intenção de Movimento ───────────────────────────
  setInput(dx, dy) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    const nx = Math.max(-1, Math.min(1, Math.sign(dx || 0)));
    const ny = Math.max(-1, Math.min(1, Math.sign(dy || 0)));
    if (nx === this.lastInputDx && ny === this.lastInputDy) return;
    this.lastInputDx = nx;
    this.lastInputDy = ny;
    this.ws.send(JSON.stringify({ t: 'input', dx: nx, dy: ny }));
  }

  sendChat(text) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    const sanitized = String(text || '').trim().slice(0, 140);
    if (!sanitized) return;
    this.ws.send(JSON.stringify({ t: 'chat', text: sanitized }));
  }

  disconnect() {
    this.isConnected = false;
    this.joined = false;
    this.myId = null;
    this.channel = null;
    if (this.ws) {
      try { this.ws.close(1000, 'Desconexão do cliente'); } catch {}
      this.ws = null;
    }
    this.remotePlayers.clear();
  }

  getRemotePlayers() {
    return Array.from(this.remotePlayers.values());
  }

  playerColor(id) {
    const colors = ['#38bdf8', '#4ade80', '#f59e0b', '#ec4899', '#a855f7', '#06b6d4'];
    return colors[Math.abs(Number(id) || 0) % colors.length];
  }
}

// Instância singleton global acessível por todo o jogo
export const cinzasNet = new CinzasNet();
if (typeof window !== 'undefined') {
  window.CinzasNet = cinzasNet;
}
