// src/systems/multiplayer/PlayerListUI.js
// ═══════════════════════════════════════════════════════════════
//  GUERRA DAS CINZAS — Lista de Jogadores & Painel de Amigos (Tab / O)
//  Aba de canal, amigos favoritos, status online/offline e ações
// ═══════════════════════════════════════════════════════════════

import { cinzasNet } from './CinzasNet.js';
import { playerContextMenu } from './PlayerContextMenu.js';
import { friendsManager } from './FriendsManager.js';
import { tradeManager } from './TradeManager.js';

export class PlayerListUI {
  constructor() {
    this.overlay = null;
    this.listContainer = null;
    this.channelTitleNode = null;
    this.countNode = null;
    this.pingNode = null;
    this.tabCountNode = null;
    this.friendsCountNode = null;
    this.currentTab = 'channel'; // 'channel' | 'friends'
    this.isOpen = false;
    this.refreshTimer = null;
  }

  init() {
    if (this.overlay) return;
    playerContextMenu.init();
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
        width: 520px;
        max-width: 92vw;
        max-height: 82vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .playerlist-header {
        padding: 14px 18px 10px;
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
      .playerlist-tabs {
        display: flex;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(0, 0, 0, 0.25);
        padding: 0 12px;
      }
      .playerlist-tab {
        background: transparent;
        border: none;
        border-bottom: 2px solid transparent;
        color: #94a3b8;
        font-family: inherit;
        font-size: 12.5px;
        font-weight: 700;
        padding: 9px 16px;
        cursor: pointer;
        transition: all 0.15s;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .playerlist-tab:hover {
        color: #f1f5f9;
        background: rgba(255, 255, 255, 0.03);
      }
      .playerlist-tab.active {
        color: #fbbf24;
        border-bottom-color: #f59e0b;
        background: rgba(245, 158, 11, 0.08);
      }
      .playerlist-body {
        padding: 12px 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 52vh;
        min-height: 200px;
      }
      .friends-add-bar {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
        background: rgba(18, 24, 38, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 6px;
        padding: 6px 10px;
      }
      .friends-add-input {
        flex: 1;
        background: transparent;
        border: none;
        color: #f8fafc;
        font-family: inherit;
        font-size: 12.5px;
        outline: none;
      }
      .friends-add-input::placeholder {
        color: #64748b;
      }
      .friends-add-btn {
        background: rgba(245, 158, 11, 0.2);
        border: 1px solid rgba(245, 158, 11, 0.4);
        color: #fbbf24;
        font-family: inherit;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s;
        white-space: nowrap;
      }
      .friends-add-btn:hover {
        background: rgba(245, 158, 11, 0.35);
        color: #fef08a;
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
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 6px #22c55e;
        flex-shrink: 0;
      }
      .player-dot.offline {
        background: #64748b;
        box-shadow: none;
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
      .player-star-btn {
        background: transparent;
        border: none;
        color: #64748b;
        font-size: 14px;
        cursor: pointer;
        padding: 3px;
        border-radius: 4px;
        transition: transform 0.15s, color 0.15s;
        line-height: 1;
      }
      .player-star-btn:hover {
        transform: scale(1.2);
        color: #f59e0b;
      }
      .player-star-btn.is-fav {
        color: #f59e0b;
        text-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
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
      .player-btn-actions {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: #e2e8f0;
        font-size: 10.5px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s, color 0.15s;
      }
      .player-btn-actions:hover {
        background: rgba(245, 158, 11, 0.22);
        border-color: rgba(245, 158, 11, 0.4);
        color: #fef08a;
      }
      .player-btn-remove {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #f87171;
        font-size: 10.5px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.15s;
      }
      .player-btn-remove:hover {
        background: rgba(239, 68, 68, 0.3);
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
            <h2 id="playerListChannel">Aventureiros & Amigos</h2>
          </div>
          <div class="playerlist-meta">
            <span class="playerlist-ping" id="playerListPing">⚡ 0 ms</span>
            <span class="playerlist-count" id="playerListCount">0 jogadores</span>
            <button type="button" class="playerlist-close" aria-label="Fechar lista">×</button>
          </div>
        </header>

        <div class="playerlist-tabs">
          <button type="button" class="playerlist-tab active" data-tab="channel">
            🌐 Todos no Canal (<span id="playerListTabCount">0</span>)
          </button>
          <button type="button" class="playerlist-tab" data-tab="friends">
            ⭐ Amigos & Favoritos (<span id="playerListFriendsCount">0</span>)
          </button>
        </div>

        <div class="playerlist-body" id="playerListItems"></div>

        <footer class="playerlist-footer">
          <span>Pressione <kbd>TAB</kbd> ou <kbd>O</kbd> para fechar</span>
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
    this.tabCountNode = overlay.querySelector('#playerListTabCount');
    this.friendsCountNode = overlay.querySelector('#playerListFriendsCount');
    this.listContainer = overlay.querySelector('#playerListItems');
  }

  bindEvents() {
    this.overlay.querySelector('.playerlist-close')?.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Alternar abas
    this.overlay.querySelectorAll('.playerlist-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.currentTab = btn.dataset.tab;
        this.overlay.querySelectorAll('.playerlist-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.render();
      });
    });

    // Teclas Tab e O para alternar
    window.addEventListener('keydown', (e) => {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;

      if (e.key === 'Tab' || e.key.toLowerCase() === 'o') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
        e.preventDefault();
      }
    });

    // Botão de presença no topo do HUD
    const onlinePresence = document.querySelector('.online');
    if (onlinePresence) {
      onlinePresence.style.cursor = 'pointer';
      onlinePresence.title = 'Ver jogadores e amigos online (Tecla Tab ou O)';
      onlinePresence.addEventListener('click', () => this.toggle());
    }

    // Botão AMIGOS / Social no topo se existir
    const socialTop = document.querySelector('#socialTop');
    if (socialTop) {
      socialTop.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open(tab = null) {
    if (tab) this.currentTab = tab;
    this.isOpen = true;
    this.overlay.classList.add('open');
    this.updateTabButtons();
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

  updateTabButtons() {
    this.overlay.querySelectorAll('.playerlist-tab').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === this.currentTab);
    });
  }

  render() {
    if (!this.isOpen) return;

    const channelName = cinzasNet.channel || 'Desconectado';
    if (this.channelTitleNode) {
      this.channelTitleNode.textContent = this.currentTab === 'friends' ? 'Amigos & Favoritos' : `Canal: ${channelName}`;
    }

    const ping = cinzasNet.ping || 0;
    if (this.pingNode) {
      this.pingNode.textContent = `⚡ ${ping} ms`;
      if (ping < 60) this.pingNode.style.color = '#4ade80';
      else if (ping < 140) this.pingNode.style.color = '#facc15';
      else this.pingNode.style.color = '#f87171';
    }

    const channelPlayers = cinzasNet.getAllChannelPlayers();
    const friends = friendsManager.getFriends();

    if (this.countNode) {
      this.countNode.textContent = `${channelPlayers.length} online`;
    }
    if (this.tabCountNode) {
      this.tabCountNode.textContent = channelPlayers.length;
    }
    if (this.friendsCountNode) {
      this.friendsCountNode.textContent = friends.length;
    }

    if (!this.listContainer) return;
    this.listContainer.replaceChildren();

    if (this.currentTab === 'friends') {
      this.renderFriendsTab(friends, channelPlayers);
    } else {
      this.renderChannelTab(channelPlayers);
    }
  }

  renderChannelTab(players) {
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

      const isFav = !p.isLocal && friendsManager.isFriend(p.name);

      card.innerHTML = `
        <div class="player-info">
          <div class="player-dot" style="background: ${p.color || '#22c55e'}; box-shadow: 0 0 6px ${p.color || '#22c55e'}"></div>
          <div class="player-name-group">
            <span class="player-name">
              ${p.name}
              ${p.isLocal ? '<span class="player-badge-local">VOCÊ</span>' : ''}
              ${!p.isLocal ? `
                <button type="button" class="player-star-btn ${isFav ? 'is-fav' : ''}" data-star="${p.name}" title="${isFav ? 'Remover dos favoritos' : 'Favoritar amigo'}">
                  ${isFav ? '⭐' : '☆'}
                </button>
              ` : ''}
            </span>
            <span class="player-class-level">${classNameFormatted} · Nível ${p.lvl || 1}</span>
          </div>
        </div>
        <div class="player-actions">
          ${!p.isLocal ? `
            <button type="button" class="player-btn-whisper" data-whisper="${p.name}">Sussurrar</button>
            <button type="button" class="player-btn-actions" data-actions="${p.name}">Ações ▾</button>
          ` : ''}
        </div>
      `;

      if (!p.isLocal) {
        card.querySelector('[data-star]')?.addEventListener('click', (e) => {
          e.stopPropagation();
          friendsManager.toggleFriend(p.name, p.classId, p.color);
          this.render();
        });

        card.querySelector('[data-whisper]')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.close();
          playerContextMenu.triggerWhisper(p.name);
        });

        card.querySelector('[data-actions]')?.addEventListener('click', (e) => {
          e.stopPropagation();
          playerContextMenu.showForPlayer(p, e);
        });

        card.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          playerContextMenu.showForPlayer(p, e);
        });
      }

      this.listContainer.appendChild(card);
    }
  }

  renderFriendsTab(friends, channelPlayers) {
    // Barra de adicionar amigo
    const addBar = document.createElement('div');
    addBar.className = 'friends-add-bar';
    addBar.innerHTML = `
      <input type="text" class="friends-add-input" id="friendsAddInput" placeholder="Digitar nome de aventureiro para adicionar..." maxlength="18" />
      <button type="button" class="friends-add-btn" id="friendsAddBtn">+ Adicionar</button>
    `;
    this.listContainer.appendChild(addBar);

    const input = addBar.querySelector('#friendsAddInput');
    const addBtn = addBar.querySelector('#friendsAddBtn');

    const handleAdd = () => {
      const name = input?.value?.trim();
      if (name && name.length >= 2) {
        friendsManager.addFriend(name);
        input.value = '';
        this.render();
      }
    };

    addBtn?.addEventListener('click', handleAdd);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    });

    if (friends.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'player-card';
      empty.style.flexDirection = 'column';
      empty.style.alignItems = 'flex-start';
      empty.style.gap = '6px';
      empty.innerHTML = `
        <span style="color: #cbd5e1; font-weight: 600;">Sua lista de amigos está vazia.</span>
        <span style="color: #64748b; font-size: 11px;">Clique na estrela ⭐ ao lado de qualquer aventureiro no canal ou digite o nome acima para favoritá-lo.</span>
      `;
      this.listContainer.appendChild(empty);
      return;
    }

    for (const friend of friends) {
      const onlinePartner = channelPlayers.find(p => p.name.toLowerCase() === friend.name.toLowerCase());
      const isOnline = Boolean(onlinePartner);

      const card = document.createElement('div');
      card.className = 'player-card';

      const classNameFormatted = {
        guerreiro: 'Guerreiro',
        arqueiro: 'Arqueiro',
        barbaro: 'Bárbaro',
        clerigo: 'Clérigo',
        mago: 'Mago',
        assasino: 'Assassino'
      }[friend.classId] || friend.classId;

      card.innerHTML = `
        <div class="player-info">
          <div class="player-dot ${isOnline ? '' : 'offline'}" style="background: ${isOnline ? (onlinePartner.color || '#22c55e') : '#64748b'};"></div>
          <div class="player-name-group">
            <span class="player-name">
              ${friend.name}
              <span class="player-star-btn is-fav" title="Favorito">⭐</span>
            </span>
            <span class="player-class-level">
              ${classNameFormatted} · ${isOnline ? '<strong style="color: #4ade80;">Online no Canal</strong>' : '<span style="color: #64748b;">Offline / Outro Canal</span>'}
            </span>
          </div>
        </div>
        <div class="player-actions">
          <button type="button" class="player-btn-whisper" data-whisper="${friend.name}">Sussurrar</button>
          ${isOnline ? `
            <button type="button" class="player-btn-actions" data-party="${friend.name}">Grupo</button>
            <button type="button" class="player-btn-actions" data-trade="${friend.name}">Trocar</button>
          ` : ''}
          <button type="button" class="player-btn-remove" data-remove="${friend.name}" title="Remover da lista de amigos">✕</button>
        </div>
      `;

      card.querySelector('[data-whisper]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
        playerContextMenu.triggerWhisper(friend.name);
      });

      if (isOnline) {
        card.querySelector('[data-party]')?.addEventListener('click', (e) => {
          e.stopPropagation();
          playerContextMenu.triggerPartyInvite(onlinePartner);
        });

        card.querySelector('[data-trade]')?.addEventListener('click', (e) => {
          e.stopPropagation();
          tradeManager.requestTrade(onlinePartner);
        });
      }

      card.querySelector('[data-remove]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        friendsManager.removeFriend(friend.name);
        this.render();
      });

      this.listContainer.appendChild(card);
    }
  }
}

export const playerListUI = new PlayerListUI();
if (typeof window !== 'undefined') {
  window.CinzasPlayerList = playerListUI;
}
