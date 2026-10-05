// src/systems/multiplayer/ChannelManager.js
// ═══════════════════════════════════════════════════════════════
//  GUERRA DAS CINZAS — Gerenciador de Canais Multiplayer
//  Suporta o servidor autoritativo CinzasNet e canais regionais
// ═══════════════════════════════════════════════════════════════

import { cinzasNet } from './CinzasNet.js';
import { onboardingManager } from './OnboardingManager.js';

class ChannelManager {
  constructor() {
    this.socket = null;
    this.overlay = null;
    this.statusNode = null;
    this.listNode = null;
    this.serverBase = this.resolveServerBase();
    this.refreshTimer = null;
    this.activeChannelId = null;
  }

  resolveServerBase() {
    const configured = (typeof __TDC_MULTIPLAYER_URL__ === 'string' ? __TDC_MULTIPLAYER_URL__ : '').trim();
    if (configured) return configured.replace(/\/$/, '');
    if (typeof location !== 'undefined' && ['localhost', '127.0.0.1'].includes(location.hostname)) {
      return 'http://localhost:3000';
    }
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
        <p class="channels-capacity-note">Canais em tempo real · até 50 jogadores por canal · sincronização autoritativa</p>
        <p class="channels-stage-note">Movimentação síncrona e chat em tempo real ativos neste canal.</p>
        <p class="channels-status" role="status" aria-live="polite"></p>
        <div class="channels-list" aria-label="Lista de canais"></div>
        <footer>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="channels-edit-avatar" type="button" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; border-radius: 4px; padding: 5px 10px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">👤 Meu Avatar / Nick</button>
            <button class="channels-disconnect" type="button" hidden>Desconectar</button>
          </div>
          <span>Guerra das Cinzas · Aventureiro com avatar e chat online.</span>
        </footer>
      </section>`;
    overlay.addEventListener('click', async (event) => {
      if (event.target === overlay || event.target.closest('.channels-close')) this.close();
      const button = event.target.closest('[data-channel-id]');
      if (button) this.join(button.dataset.channelId);
      if (event.target.closest('.channels-disconnect')) this.disconnect();
      if (event.target.closest('.channels-edit-avatar')) {
        await onboardingManager.ensureProfile(true);
      }
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

    // Tenta primeiro o servidor autoritativo CinzasNet
    try {
      const netUrl = cinzasNet.serverUrl || 'http://localhost:3000';
      const response = await fetch(`${netUrl}/channels`, { cache: 'no-store' });
      if (response.ok) {
        const rawChannels = await response.json();
        const formatted = rawChannels.map((c, idx) => ({
          id: c.id,
          name: `Canal ${c.id.toUpperCase()}`,
          online: c.players,
          capacity: c.max || 50,
          available: c.players < (c.max || 50)
        }));
        this.renderChannels(formatted);
        if (!cinzasNet.isConnected) this.setStatus('Escolha um canal disponível para entrar.');
        return;
      }
    } catch {
      // Falha silenciosa, tenta o endpoint legado abaixo
    }

    // Fallback legado
    try {
      const response = await fetch(`${this.serverBase}/api/channels`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Servidor respondeu ${response.status}`);
      const { channels } = await response.json();
      this.renderChannels(Array.isArray(channels) ? channels : []);
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) this.setStatus('Escolha um canal disponível.');
    } catch (error) {
      this.setStatus('Servidor multiplayer desconectado. Inicie o servidor local para conectar.', 'error');
      this.renderChannels([]);
    }
  }

  renderChannels(channels) {
    if (!this.listNode) return;
    this.listNode.replaceChildren();

    const isConnected = cinzasNet.isConnected || (this.socket?.readyState === WebSocket.OPEN);
    const activeId = cinzasNet.channel || this.socketChannelId;

    for (const channel of channels) {
      const card = document.createElement('article');
      card.className = 'channels-card';
      const info = document.createElement('div');
      info.className = 'channels-card-info';
      const title = document.createElement('strong');
      title.textContent = channel.name || `Canal ${channel.id}`;
      const count = document.createElement('small');
      count.textContent = `${channel.online} / ${channel.capacity} jogadores`;
      const progress = document.createElement('span');
      progress.className = 'channels-progress';
      const fill = document.createElement('i');
      fill.style.width = `${Math.min(100, Math.max(0, channel.online / channel.capacity * 100))}%`;
      progress.append(fill);
      info.append(title, count, progress);

      const isCurrent = isConnected && String(activeId) === String(channel.id);
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.channelId = channel.id;
      button.textContent = isCurrent ? 'CONECTADO' : (channel.available ? 'ENTRAR' : 'LOTADO');
      button.disabled = !channel.available || isCurrent;
      card.append(info, button);
      this.listNode.append(card);
    }
    this.overlay?.querySelector('.channels-disconnect')?.toggleAttribute('hidden', !isConnected);
  }

  async join(channelId) {
    const button = this.listNode?.querySelector(`[data-channel-id="${channelId}"]`);
    if (button) button.disabled = true;

    // 0. Garante avatar e nickname na primeira conexão multijogador
    let profile = null;
    try {
      profile = await onboardingManager.ensureProfile();
    } catch (cancelErr) {
      if (button) button.disabled = false;
      this.setStatus('Criação de avatar cancelada.', 'info');
      return;
    }

    this.setStatus(`Conectando ao Canal ${channelId}…`);

    // 1. Tenta conectar via CinzasNet
    try {
      if (!cinzasNet.token) {
        // Tenta carteira se conectada, senão convidado com o nickname escolhido
        try {
          if (window.solana && window.solana.isPhantom) {
            await cinzasNet.loginWithWallet();
          } else {
            await cinzasNet.loginAsGuest(profile?.name);
          }
        } catch {
          await cinzasNet.loginAsGuest(profile?.name);
        }
      }

      await cinzasNet.connect(channelId, null, null, profile?.classId, profile?.name, profile?.auraColor);
      this.activeChannelId = channelId;
      this.setStatus(`Conectado com sucesso ao Canal ${channelId}!`, 'success');
      this.setHeaderStatus(`Canal ${channelId} · Online`);
      await this.loadChannels();
      return;
    } catch (netErr) {
      console.warn('CinzasNet join falhou, tentando fallback legado:', netErr);
    }

    // 2. Fallback legado se CinzasNet não estiver disponível
    try {
      const token = await window.GameAuth?.getAccessToken?.();
      if (!token) return this.setStatus('Inicie o servidor multiplayer local para jogar online.', 'error');

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
        this.setStatus(`Conectado ao Canal ${channelId}.`, 'success');
        this.setHeaderStatus(`Canal ${channelId} · presença`);
        this.loadChannels();
      });
      socket.addEventListener('close', () => {
        this.disconnect();
      });
    } catch (error) {
      await this.loadChannels();
      this.setStatus(error.message || 'Não foi possível entrar no canal.', 'error');
    }
  }

  disconnect() {
    if (cinzasNet.isConnected) {
      cinzasNet.disconnect();
    }
    const socket = this.socket;
    this.socket = null;
    this.socketChannelId = null;
    this.activeChannelId = null;
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close(1000, 'Jogador saiu do canal.');
    this.overlay?.querySelector('.channels-disconnect')?.setAttribute('hidden', '');
    this.setHeaderStatus('Mundo solo · desconectado');
    this.setStatus('Você saiu do canal.');
    this.loadChannels();
  }

  setHeaderStatus(message) {
    const label = document.querySelector('.online span');
    if (label) label.textContent = message;
    const dot = document.querySelector('.online i');
    if (dot) {
      dot.style.background = message.includes('Online') ? '#22c55e' : '';
    }
  }
}

export const channelManager = new ChannelManager();
