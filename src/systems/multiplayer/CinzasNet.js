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
    this.ping = 0;
    this.pingTimer = null;

    // Mapa de jogadores remotos: id -> { id, name, x, y, tx, ty, color, msg, msgAt }
    this.remotePlayers = new Map();

    // Callbacks de eventos
    this.onState = () => {};
    this.onChat = () => {};
    this.onWhisper = () => {};
    this.onAction = () => {};
    this.onJoined = () => {};
    this.onDisconnect = () => {};
    this.onPartyUpdate = () => {};
    this.onPartyInvite = () => {};
    this.onPartyChat = () => {};
    this.onMobSync = () => {};
    this.onMobDefeated = () => {};
    this.onTradeRequest = () => {};
    this.onTradeStart = () => {};
    this.onTradeUpdate = () => {};
    this.onTradeComplete = () => {};
    this.onTradeCancelled = () => {};
    this.onTradeDeclined = () => {};

    this.party = null;

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
  connect(channel = 'bosque-1', initialX = null, initialY = null, classId = null) {
    return new Promise((resolve, reject) => {
      if (!this.token) {
        return reject(new Error('Autentique-se antes de conectar ao canal.'));
      }
      this.disconnect();

      const p = typeof window !== 'undefined' ? window._tdcPlayer : null;
      const sx = Number.isFinite(initialX) ? initialX : (p && Number.isFinite(p.x) ? Math.round(p.x) : 1000);
      const sy = Number.isFinite(initialY) ? initialY : (p && Number.isFinite(p.y) ? Math.round(p.y) : 1000);
      const cls = classId || (p && p.classId) || 'guerreiro';
      const lvl = (p && Number.isFinite(p.lvl)) ? Math.round(p.lvl) : 1;

      try {
        const ws = new WebSocket(this.getWsUrl());
        this.ws = ws;

        ws.onopen = () => {
          this.isConnected = true;
          ws.send(JSON.stringify({ t: 'join', channel, x: sx, y: sy, classId: cls, lvl }));
          this.startPingLoop();
        };

        ws.onerror = (err) => {
          if (!this.joined) reject(new Error('Falha ao conectar no servidor multiplayer.'));
        };

        ws.onclose = (ev) => {
          this.isConnected = false;
          this.joined = false;
          const wasJoined = this.joined;
          this.remotePlayers.clear();
          clearInterval(this.pingTimer);
          this.pingTimer = null;
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
          } else if (m.t === 'whisper') {
            this.handleWhisperMessage(m);
          } else if (m.t === 'action') {
            this.handleActionMessage(m);
          } else if (m.t === 'party_update') {
            this.party = m.party;
            this.onPartyUpdate(m.party);
          } else if (m.t === 'party_invite') {
            this.onPartyInvite(m);
          } else if (m.t === 'party_chat') {
            this.onPartyChat(m);
          } else if (m.t === 'mob_sync') {
            this.onMobSync(m);
          } else if (m.t === 'mob_defeated') {
            this.onMobDefeated(m);
          } else if (m.t === 'trade_request') {
            this.onTradeRequest(m);
          } else if (m.t === 'trade_start') {
            this.onTradeStart(m);
          } else if (m.t === 'trade_update') {
            this.onTradeUpdate(m);
          } else if (m.t === 'trade_complete') {
            this.onTradeComplete(m);
          } else if (m.t === 'trade_cancelled') {
            this.onTradeCancelled(m);
          } else if (m.t === 'trade_declined') {
            this.onTradeDeclined(m);
          } else if (m.t === 'pong') {
            this.handlePong(m);
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
          classId: p.classId || 'guerreiro',
          lvl: p.lvl || 1,
          x: p.x,
          y: p.y,
          tx: p.x,
          ty: p.y,
          dx: p.dx || 0,
          dy: p.dy || 0,
          dir: 'south',
          face: 1,
          moving: false,
          walk: 0,
          attackAt: 0,
          color: this.playerColor(p.id),
          msg: null,
          msgAt: 0
        };
        this.remotePlayers.set(p.id, existing);
      } else {
        existing.tx = p.x;
        existing.ty = p.y;
        existing.dx = p.dx || 0;
        existing.dy = p.dy || 0;
        if (p.classId) existing.classId = p.classId;
        if (p.lvl) existing.lvl = p.lvl;
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

  handleActionMessage(m) {
    const p = this.remotePlayers.get(m.fromId);
    if (p) {
      p.attackAt = performance.now();
      if (m.dir) p.dir = m.dir;
    }
    if (m.kind === 'party_invite' && (m.toId === this.myId || (this.me?.name && m.to === this.me.name))) {
      const inviter = m.fromName || (p && p.name) || 'Um aventureiro';
      window.CinzasChat?.addMessage({
        from: 'GRUPO',
        text: `🛡️ ${inviter} convidou você para o grupo!`,
        type: 'system',
        time: new Date()
      });
    }
    this.onAction(m);
  }

  // ─── Atualização de Física / Interpolação Suave (Frame a Frame)
  update(dt = 0.016) {
    const factor = Math.min(1, 14 * dt);
    for (const p of this.remotePlayers.values()) {
      const diffX = p.tx - p.x;
      const diffY = p.ty - p.y;
      p.x += diffX * factor;
      p.y += diffY * factor;

      const isMoving = Math.hypot(p.dx || 0, p.dy || 0) > 0 || Math.hypot(diffX, diffY) > 1.2;
      p.moving = isMoving;
      if (isMoving) {
        p.walk += dt * 11;
        const moveX = p.dx || (Math.abs(diffX) > 0.6 ? Math.sign(diffX) : 0);
        const moveY = p.dy || (Math.abs(diffY) > 0.6 ? Math.sign(diffY) : 0);
        if (moveX || moveY) {
          const ax = Math.abs(moveX), ay = Math.abs(moveY);
          if (ax > ay * 2) p.dir = moveX > 0 ? 'east' : 'west';
          else if (ay > ax * 2) p.dir = moveY > 0 ? 'south' : 'north';
          else p.dir = moveY > 0 ? (moveX > 0 ? 'south-east' : 'south-west') : (moveX > 0 ? 'north-east' : 'north-west');
          if (moveX) p.face = Math.sign(moveX);
        }
      }

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

  sendWhisper(to, text) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    const sanitized = String(text || '').trim().slice(0, 140);
    const target = String(to || '').trim();
    if (!sanitized || !target) return;
    this.ws.send(JSON.stringify({ t: 'whisper', to: target, text: sanitized }));
  }

  handleWhisperMessage(m) {
    this.onWhisper(m);
  }

  sendPartyInvite(to, toId) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    this.ws.send(JSON.stringify({ t: 'party_invite', to: String(to || ''), toId: Number(toId) || undefined }));
  }

  sendPartyAccept(fromId) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    this.ws.send(JSON.stringify({ t: 'party_accept', fromId: Number(fromId) }));
  }

  sendPartyDecline(fromId) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    this.ws.send(JSON.stringify({ t: 'party_decline', fromId: Number(fromId) }));
  }

  sendPartyLeave() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    this.ws.send(JSON.stringify({ t: 'party_leave' }));
  }

  sendPartyChat(text) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    const sanitized = String(text || '').trim().slice(0, 140);
    if (!sanitized) return;
    this.ws.send(JSON.stringify({ t: 'party_chat', text: sanitized }));
  }

  sendPartyVitals(hp, maxHp, lvl) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    this.ws.send(JSON.stringify({
      t: 'party_vitals',
      hp: Number.isFinite(hp) ? Math.round(hp) : undefined,
      maxHp: Number.isFinite(maxHp) ? Math.round(maxHp) : undefined,
      lvl: Number.isFinite(lvl) ? Math.round(lvl) : undefined
    }));
  }

  // ─── Sistema de Trocas (Trade) ───────────────────────────────
  sendTradeRequest(to, toId) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    this.ws.send(JSON.stringify({ t: 'trade_request', to: String(to || ''), toId: Number(toId) || undefined }));
  }

  sendTradeAccept(fromId) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    this.ws.send(JSON.stringify({ t: 'trade_accept', fromId: Number(fromId) }));
  }

  sendTradeDecline(fromId) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    this.ws.send(JSON.stringify({ t: 'trade_decline', fromId: Number(fromId) }));
  }

  sendTradeOffer(gold, items = [], locked = false) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    this.ws.send(JSON.stringify({
      t: 'trade_offer',
      gold: Math.max(0, Math.round(Number(gold) || 0)),
      items: Array.isArray(items) ? items : [],
      locked: Boolean(locked)
    }));
  }

  sendTradeConfirm() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    this.ws.send(JSON.stringify({ t: 'trade_confirm' }));
  }

  sendTradeCancel() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    this.ws.send(JSON.stringify({ t: 'trade_cancel' }));
  }

  sendAction(action = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    this.ws.send(JSON.stringify({
      t: 'action',
      kind: action.kind || 'slash',
      x: Math.round(Number(action.x) || 0),
      y: Math.round(Number(action.y) || 0),
      color: action.color || '#f5d37b',
      dir: action.dir || 'south'
    }));
  }

  sendMobHit({ mobId, dmg, hp, maxHp, isCrit = false, boss = false, mobName = '', x = 0, y = 0 }) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.joined) return;
    this.ws.send(JSON.stringify({
      t: 'mob_hit',
      mobId: String(mobId),
      dmg: Math.max(1, Math.round(Number(dmg) || 1)),
      hp: Math.max(0, Math.round(Number(hp) || 0)),
      maxHp: Math.max(1, Math.round(Number(maxHp) || 200)),
      isCrit: Boolean(isCrit),
      boss: Boolean(boss),
      mobName: String(mobName || ''),
      x: Math.round(Number(x) || 0),
      y: Math.round(Number(y) || 0)
    }));
  }

  startPingLoop() {
    clearInterval(this.pingTimer);
    this.sendPing();
    this.pingTimer = setInterval(() => {
      if (this.isConnected && this.joined) this.sendPing();
    }, 4000);
  }

  sendPing() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ t: 'ping', ctime: performance.now() }));
  }

  handlePong(m) {
    if (m && typeof m.ctime === 'number') {
      this.ping = Math.max(1, Math.round(performance.now() - m.ctime));
    }
  }

  getAllChannelPlayers() {
    const list = [];
    const p = typeof window !== 'undefined' ? window._tdcPlayer : null;
    if (this.joined) {
      list.push({
        id: this.myId,
        name: this.me?.name || 'Você',
        classId: (p && p.classId) || 'guerreiro',
        lvl: (p && p.lvl) || 1,
        ping: this.ping,
        isLocal: true,
        color: '#4ade80'
      });
    }
    for (const r of this.remotePlayers.values()) {
      list.push({
        id: r.id,
        name: r.name,
        classId: r.classId || 'guerreiro',
        lvl: r.lvl || 1,
        ping: this.ping,
        isLocal: false,
        color: r.color
      });
    }
    return list;
  }

  disconnect() {
    this.isConnected = false;
    this.joined = false;
    this.myId = null;
    this.channel = null;
    clearInterval(this.pingTimer);
    this.pingTimer = null;
    this.ping = 0;
    if (this.ws) {
      try { this.ws.close(1000, 'Desconexão do cliente'); } catch {}
      this.ws = null;
    }
    this.remotePlayers.clear();
    this.party = null;
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
