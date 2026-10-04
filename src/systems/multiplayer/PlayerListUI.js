// src/systems/multiplayer/PlayerListUI.js
// ═══════════════════════════════════════════════════════════════
//  GUERRA DAS CINZAS — Lista de Jogadores Online no Canal (Tab)
//  Painel rápido com classes, níveis, latência (ping) e sussurro
// ═══════════════════════════════════════════════════════════════

import { cinzasNet } from './CinzasNet.js';

export class PlayerListUI {
  constructor() {
    this.overlay = null;
    this.listContainer = null;
    this.channelTitleNode = null;
    this.countNode = null;
    this.pingNode = null;
    this.isOpen = false;
    this.refreshTimer = null;
  }

  init() {
    if (this.overlay) return;
    this.injectStyles();
    this.createDOM();
    this.bindEvents();
  }

  injectStyles() {
    if (document.getElementById('cinzas-playerlist-styles')) return;
    const style = document.createElement('style');
    style.id = 'cinzas-playerlist-styles';
    style.textContent = `
      .playerlist-overlay {
        position: fixed;
        inset: 0;
        z-index: 95;
        background: rgba(5, 7, 12, 0.75);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        font-family: 'Outfit', sans-serif;
      }
      .playerlist-overlay.open {
        opacity: 1;
        pointer-events: auto;
      }
      .playerlist-dialog {
        background: linear-gradient(180deg, #141824 0%, #0c0f18 100%);
        border: 1px solid rgba(245, 158, 11, 0.4);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245, 158, 11, 0.15);
        border-radius: 8px;
        width: 480px;
        max-width: 90vw;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .playerlist-header {
        padding: 14px 18px;
        background: rgba(245, 158, 11, 0.08);
        border-bottom: 1px solid rgba(245, 158, 11, 0.2);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .playerlist-title-group small {
        font-size: 10px;
        letter-spacing: 1.5px;
        font-weight: 700;
        color: #f59e0b;
        text-transform: uppercase;
        display: block;
      }
      .playerlist-title-group h2 {
        margin: 2px 0 0;
        font-size: 17px;
        font-weight: 700;
        color: #f8fafc;
      }
      .playerlist-meta {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .playerlist-ping {
        font-size: 11px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 4px;
        background: rgba(34, 197, 94, 0.15);
        color: #4ade80;
        border: 1px solid rgba(34, 197, 94, 0.3);
      }
      .playerlist-count {
        font-size: 12px;
        font-weight: 600;
        color: #94a3b8;
      }
      .playerlist-close {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 20px;
        cursor: pointer;
        padding: 0 4px;
        line-height: 1;
      }
      .playerlist-close:hover {
        color: #f8fafc;
      }
      .playerlist-body {
        padding: 12px 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 50vh;
      }
      .player-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        border-radius: 6px;
        background: rgba(18, 24, 38, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.06);
        transition: background 0.15s, border-color 0.15s;
      }
      .player-card:hover {
        background: rgba(26, 34, 52, 0.85);
        border-color: rgba(245, 158, 11, 0.3);
      }
      .player-card.is-local {
        border-color: rgba(74, 222, 128, 0.35);
        background: rgba(16, 44, 28, 0.45);
      }
      .player-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .player-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 6px #22c55e;
      }
      .player-name-group {
        display: flex;
        flex-direction: column;
      }
      .player-name {
        font-size: 13px;
        font-weight: 700;
        color: #f1f5f9;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .player-badge-local {
        font-size: 9.5px;
        background: rgba(34, 197, 94, 0.25);
        color: #4ade80;
        padding: 1px 5px;
        border-radius: 3px;
        font-weight: 600;
      }
      .player-class-level {
        font-size: 11px;
        color: #94a3b8;
      }
      .player-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .player-btn-whisper {
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.35);
        color: #fbbf24;
        font-size: 10.5px;
        font-weight: 700;
        padding: 4px 9px;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.15s;
      }
      .player-btn-whisper:hover {
        background: rgba(245, 158, 11, 0.3);
      }
      .playerlist-footer {
        padding: 10px 18px;
        background: rgba(10, 13, 20, 0.9);
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11px;
        color: #64748b;
      }
      .playerlist-footer kbd {
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 3px;
        color: #cbd5e1;
        font-family: inherit;
        font-weight: 700;
      }
    `;
    document.head.appendChild(style);
  }

  createDOM() {
    const overlay = document.createElement('div');
    overlay.className = 'playerlist-overlay';
    overlay.id = 'playerListOverlay';
    overlay.innerHTML = `
      <div class="playerlist-dialog" role="dialog" aria-modal="true">
        <header class="playerlist-header">
          <div class="playerlist-title-group">
            <small>GUERRA DAS CINZAS · MULTIPLAYER</small>
            <h2 id="playerListChannel">Aventureiros no Canal</h2>
          </div>
          <div class="playerlist-meta">
            <span class="playerlist-ping" id="playerListPing">⚡ 0 ms</span>
            <span class="playerlist-count" id="playerListCount">0 jogadores</span>
            <button type="button" class="playerlist-close" aria-label="Fechar lista">×</button>
          </div>
        </header>
        <div class="playerlist-body" id="playerListItems"></div>
        <footer class="playerlist-footer">
          <span>Pressione <kbd>TAB</kbd> ou <kbd>ESC</kbd> para fechar</span>
          <span>Sincronização em tempo real · Servidor autoritativo</span>
        </footer>
      </div>
    `;
    const app = document.querySelector('#app') || document.body;
    app.appendChild(overlay);

    this.overlay = overlay;
    this.channelTitleNode = overlay.querySelector('#playerListChannel');
    this.pingNode = overlay.querySelector('#playerListPing');
    this.countNode = overlay.querySelector('#playerListCount');
    this.listContainer = overlay.querySelector('#playerListItems');
  }

  bindEvents() {
    this.overlay.querySelector('.playerlist-close')?.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Tecla Tab para alternar
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
        e.preventDefault();
      }
    });

    // Botão de presença no topo do HUD também abre
    const onlinePresence = document.querySelector('.online');
    if (onlinePresence) {
      onlinePresence.style.cursor = 'pointer';
      onlinePresence.title = 'Ver jogadores online no canal (Tecla Tab)';
      onlinePresence.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    this.isOpen = true;
    this.overlay.classList.add('open');
    this.render();
    clearInterval(this.refreshTimer);
    this.refreshTimer = setInterval(() => this.render(), 1000);
  }

  close() {
    this.isOpen = false;
    this.overlay.classList.remove('open');
    clearInterval(this.refreshTimer);
    this.refreshTimer = null;
  }

  render() {
    if (!this.isOpen) return;

    const channelName = cinzasNet.channel || 'Desconectado';
    if (this.channelTitleNode) {
      this.channelTitleNode.textContent = `Canal: ${channelName}`;
    }

    const ping = cinzasNet.ping || 0;
    if (this.pingNode) {
      this.pingNode.textContent = `⚡ ${ping} ms`;
      if (ping < 60) this.pingNode.style.color = '#4ade80';
      else if (ping < 140) this.pingNode.style.color = '#facc15';
      else this.pingNode.style.color = '#f87171';
    }

    const players = cinzasNet.getAllChannelPlayers();
    if (this.countNode) {
      this.countNode.textContent = `${players.length} online`;
    }

    if (!this.listContainer) return;
    this.listContainer.replaceChildren();

    if (players.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'player-card';
      empty.textContent = 'Nenhum aventureiro conectado neste canal no momento.';
      empty.style.color = '#64748b';
      empty.style.fontStyle = 'italic';
      this.listContainer.appendChild(empty);
      return;
    }

    for (const p of players) {
      const card = document.createElement('div');
      card.className = `player-card ${p.isLocal ? 'is-local' : ''}`;

      const classNameFormatted = {
        guerreiro: 'Guerreiro',
        arqueiro: 'Arqueiro',
        barbaro: 'Bárbaro',
        clerigo: 'Clérigo',
        mago: 'Mago',
        assasino: 'Assassino'
      }[p.classId] || p.classId;

      card.innerHTML = `
        <div class="player-info">
          <div class="player-dot" style="background: ${p.color || '#22c55e'}; box-shadow: 0 0 6px ${p.color || '#22c55e'}"></div>
          <div class="player-name-group">
            <span class="player-name">
              ${p.name}
              ${p.isLocal ? '<span class="player-badge-local">VOCÊ</span>' : ''}
            </span>
            <span class="player-class-level">${classNameFormatted} · Nível ${p.lvl || 1}</span>
          </div>
        </div>
        <div class="player-actions">
          ${!p.isLocal ? `<button type="button" class="player-btn-whisper" data-whisper="${p.name}">Sussurrar</button>` : ''}
        </div>
      `;

      if (!p.isLocal) {
        card.querySelector('[data-whisper]')?.addEventListener('click', () => {
          this.close();
          const chat = window.CinzasChat;
          if (chat) {
            chat.focusChat();
            if (chat.input) {
              chat.input.value = `/w ${p.name} `;
              chat.input.focus();
            }
          }
        });
      }

      this.listContainer.appendChild(card);
    }
  }
}

export const playerListUI = new PlayerListUI();
if (typeof window !== 'undefined') {
  window.CinzasPlayerList = playerListUI;
}
