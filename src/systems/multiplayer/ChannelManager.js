class ChannelManager {
  constructor() {
    this.socket = null;
    this.overlay = null;
    this.statusNode = null;
    this.listNode = null;
    this.serverBase = this.resolveServerBase();
    this.refreshTimer = null;
  }

  resolveServerBase() {
    const configured = (typeof __TDC_MULTIPLAYER_URL__ === 'string' ? __TDC_MULTIPLAYER_URL__ : '').trim();
    if (configured) return configured.replace(/\/$/, '');
    if (['localhost', '127.0.0.1'].includes(location.hostname)) return 'http://127.0.0.1:8787';
    return 'https://terra-das-cinzas-multiplayer.infinited3signer.workers.dev';
  }

  init() {
    const button = document.querySelector('#channelsTop');
    if (button) button.addEventListener('click', () => this.open());
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.overlay && !this.overlay.hidden) this.close();
    });
  }

  createOverlay() {
    if (this.overlay) return;
    const overlay = document.createElement('div');
    overlay.className = 'channels-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <section class="channels-dialog" role="dialog" aria-modal="true" aria-labelledby="channelsTitle">
        <header class="channels-dialog-header">
          <div><small>JORNADA MULTIJOGADOR</small><h2 id="channelsTitle">Canais do mundo</h2></div>
          <button class="channels-close" type="button" aria-label="Fechar canais">×</button>
        </header>
        <p class="channels-capacity-note">12 canais · até 100 jogadores por canal · capacidade total de 1.200 conexões</p>
        <p class="channels-stage-note">Nesta etapa, os canais validam a presença e a lotação. Movimento, combate, inimigos, XP e saques ainda ficam locais.</p>
        <p class="channels-status" role="status" aria-live="polite"></p>
        <div class="channels-list" aria-label="Lista de canais"></div>
        <footer><button class="channels-disconnect" type="button" hidden>Desconectar</button><span>Entre na sua conta para acessar um canal.</span></footer>
      </section>`;
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay || event.target.closest('.channels-close')) this.close();
      const button = event.target.closest('[data-channel-id]');
      if (button) this.join(Number(button.dataset.channelId));
      if (event.target.closest('.channels-disconnect')) this.disconnect();
    });
    document.querySelector('#app')?.append(overlay);
    this.overlay = overlay;
    this.statusNode = overlay.querySelector('.channels-status');
    this.listNode = overlay.querySelector('.channels-list');
  }

  async open() {
    this.createOverlay();
    if (!this.overlay) return;
    this.overlay.hidden = false;
    this.overlay.querySelector('.channels-close')?.focus();
    await this.loadChannels();
    clearInterval(this.refreshTimer);
    this.refreshTimer = setInterval(() => this.loadChannels(), 5000);
  }

  close() {
    if (this.overlay) this.overlay.hidden = true;
    clearInterval(this.refreshTimer);
    this.refreshTimer = null;
  }

  setStatus(message, kind = '') {
    if (!this.statusNode) return;
    this.statusNode.textContent = message;
    this.statusNode.dataset.kind = kind;
  }

  async loadChannels() {
    if (!this.listNode) return;
    if (!this.serverBase) {
      this.setStatus('Servidor de canais ainda não configurado para este site.', 'error');
      this.renderChannels([]);
      return;
    }
    try {
      const response = await fetch(`${this.serverBase}/api/channels`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Servidor respondeu ${response.status}`);
      const { channels } = await response.json();
      this.renderChannels(Array.isArray(channels) ? channels : []);
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) this.setStatus('Escolha um canal disponível.');
    } catch (error) {
      this.setStatus('Não foi possível conectar ao servidor de canais. Tente novamente em instantes.', 'error');
      this.renderChannels([]);
      console.warn('Falha ao consultar canais:', error);
    }
  }

  renderChannels(channels) {
    if (!this.listNode) return;
    this.listNode.replaceChildren();
    for (const channel of channels) {
      const card = document.createElement('article');
      card.className = 'channels-card';
      const info = document.createElement('div');
      info.className = 'channels-card-info';
      const title = document.createElement('strong');
      title.textContent = channel.name || `Canal ${String(channel.id).padStart(2, '0')}`;
      const count = document.createElement('small');
      count.textContent = `${channel.online} / ${channel.capacity} jogadores`;
      const progress = document.createElement('span');
      progress.className = 'channels-progress';
      const fill = document.createElement('i');
      fill.style.width = `${Math.min(100, Math.max(0, channel.online / channel.capacity * 100))}%`;
      progress.append(fill);
      info.append(title, count, progress);
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.channelId = channel.id;
      button.textContent = this.socket?.readyState === WebSocket.OPEN && Number(this.socketChannelId) === channel.id
        ? 'CONECTADO'
        : channel.available ? 'ENTRAR' : 'LOTADO';
      button.disabled = !channel.available || (this.socket?.readyState === WebSocket.OPEN && Number(this.socketChannelId) === channel.id);
      card.append(info, button);
      this.listNode.append(card);
    }
    this.overlay?.querySelector('.channels-disconnect')?.toggleAttribute('hidden', !this.socket || this.socket.readyState !== WebSocket.OPEN);
  }

  async join(channelId) {
    if (!this.serverBase) return this.setStatus('Servidor de canais não configurado.', 'error');
    const token = await window.GameAuth?.getAccessToken?.();
    if (!token) return this.setStatus('Entre na sua conta pelo botão CONTA antes de conectar.', 'error');

    const button = this.listNode?.querySelector(`[data-channel-id="${channelId}"]`);
    if (button) button.disabled = true;
    this.setStatus(`Conectando ao Canal ${String(channelId).padStart(2, '0')}…`);
    try {
      const response = await fetch(`${this.serverBase}/api/channels/${channelId}/ticket`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || result.error || `Servidor respondeu ${response.status}`);

      this.disconnect();
      const socketUrl = new URL(`${this.serverBase}/ws/${channelId}`);
      socketUrl.protocol = socketUrl.protocol === 'https:' ? 'wss:' : 'ws:';
      socketUrl.searchParams.set('ticket', result.ticket);
      const socket = new WebSocket(socketUrl);
      this.socket = socket;
      this.socketChannelId = channelId;
      socket.addEventListener('open', () => {
        this.setStatus(`Conectado ao Canal ${String(channelId).padStart(2, '0')}.`, 'success');
        this.setHeaderStatus(`Canal ${String(channelId).padStart(2, '0')} · presença`);
        this.loadChannels();
      });
      socket.addEventListener('message', (event) => this.handleMessage(event));
      socket.addEventListener('close', (event) => {
        if (this.socket !== socket) return;
        this.socket = null;
        this.socketChannelId = null;
        this.setHeaderStatus('Mundo solo · desconectado');
        this.setStatus(event.code === 1000 ? 'Você saiu do canal.' : 'Conexão encerrada. Você continua no modo local.', event.code === 1000 ? '' : 'error');
        this.loadChannels();
      });
      socket.addEventListener('error', () => this.setStatus('Falha na conexão. Confira sua rede e tente novamente.', 'error'));
    } catch (error) {
      await this.loadChannels();
      this.setStatus(error.message || 'Não foi possível entrar no canal.', 'error');
    }
  }

  handleMessage(event) {
    let payload;
    try { payload = JSON.parse(event.data); } catch { return; }
    if (payload.type === 'welcome') {
      this.setStatus(`Presença confirmada · ${payload.online}/${payload.capacity} jogadores.`, 'success');
    } else if (payload.type === 'player_joined' || payload.type === 'player_left') {
      this.setStatus(`${payload.player?.name || 'Um aventureiro'} ${payload.type === 'player_joined' ? 'entrou no' : 'saiu do'} canal · ${payload.online}/100 online.`);
    }
  }

  disconnect() {
    const socket = this.socket;
    this.socket = null;
    this.socketChannelId = null;
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close(1000, 'Jogador saiu do canal.');
    this.overlay?.querySelector('.channels-disconnect')?.setAttribute('hidden', '');
    this.setHeaderStatus('Mundo solo · desconectado');
  }

  setHeaderStatus(message) {
    const label = document.querySelector('.online span');
    if (label) label.textContent = message;
  }
}

export const channelManager = new ChannelManager();
