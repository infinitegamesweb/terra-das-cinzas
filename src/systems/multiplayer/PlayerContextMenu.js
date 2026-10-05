// src/systems/multiplayer/PlayerContextMenu.js
// ═══════════════════════════════════════════════════════════════
//  GUERRA DAS CINZAS — Menu de Contexto e Inspeção de Jogadores
//  Ações rápidas: Sussurrar, Inspecionar, Convidar para Grupo e Copiar Nome
// ═══════════════════════════════════════════════════════════════

import { cinzasNet } from './CinzasNet.js';

export class PlayerContextMenu {
  constructor() {
    this.menuNode = null;
    this.inspectModal = null;
    this.activePlayer = null;
    this.isOpen = false;
  }

  init() {
    if (this.menuNode) return;
    this.injectStyles();
    this.createDOM();
    this.bindEvents();
  }

  injectStyles() {
    if (document.getElementById('cinzas-contextmenu-styles')) return;
    const style = document.createElement('style');
    style.id = 'cinzas-contextmenu-styles';
    style.textContent = `
      .cinzas-context-menu {
        position: fixed;
        z-index: 120;
        min-width: 190px;
        background: linear-gradient(180deg, #161b26 0%, #0d111a 100%);
        border: 1px solid rgba(245, 158, 11, 0.4);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.85), 0 0 14px rgba(245, 158, 11, 0.15);
        border-radius: 6px;
        padding: 5px;
        display: none;
        flex-direction: column;
        gap: 3px;
        font-family: 'Outfit', sans-serif;
        user-select: none;
        animation: cinzasContextMenuFadeIn 0.15s ease-out;
      }
      @keyframes cinzasContextMenuFadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      .cinzas-context-menu.active {
        display: flex;
      }
      .cinzas-context-header {
        padding: 6px 8px;
        background: rgba(245, 158, 11, 0.08);
        border-bottom: 1px solid rgba(245, 158, 11, 0.2);
        border-radius: 4px 4px 0 0;
        margin-bottom: 3px;
      }
      .cinzas-context-title {
        font-size: 12.5px;
        font-weight: 700;
        color: #f8fafc;
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
      }
      .cinzas-context-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 6px #22c55e;
      }
      .cinzas-context-sub {
        font-size: 10px;
        color: #94a3b8;
        margin-top: 1px;
      }
      .cinzas-context-item {
        background: transparent;
        border: 1px solid transparent;
        color: #e2e8f0;
        font-family: inherit;
        font-size: 11.5px;
        font-weight: 600;
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.12s, border-color 0.12s, color 0.12s;
        text-align: left;
        width: 100%;
      }
      .cinzas-context-item:hover {
        background: rgba(245, 158, 11, 0.16);
        border-color: rgba(245, 158, 11, 0.35);
        color: #fef08a;
      }
      .cinzas-context-item.danger:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.4);
        color: #fca5a5;
      }
      .cinzas-context-item .icon {
        font-size: 13px;
        line-height: 1;
      }

      /* Modal de Inspeção de Jogador */
      .cinzas-inspect-overlay {
        position: fixed;
        inset: 0;
        z-index: 130;
        background: rgba(5, 7, 12, 0.82);
        backdrop-filter: blur(6px);
        display: none;
        align-items: center;
        justify-content: center;
        font-family: 'Outfit', sans-serif;
      }
      .cinzas-inspect-overlay.active {
        display: flex;
      }
      .cinzas-inspect-card {
        background: linear-gradient(180deg, #151a26 0%, #0a0d14 100%);
        border: 1px solid rgba(245, 158, 11, 0.45);
        box-shadow: 0 16px 45px rgba(0, 0, 0, 0.9), 0 0 24px rgba(245, 158, 11, 0.18);
        border-radius: 8px;
        width: 440px;
        max-width: 92vw;
        overflow: hidden;
        animation: cinzasModalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes cinzasModalPop {
        from { opacity: 0; transform: scale(0.92) translateY(8px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .cinzas-inspect-header {
        padding: 14px 18px;
        background: rgba(245, 158, 11, 0.09);
        border-bottom: 1px solid rgba(245, 158, 11, 0.25);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .cinzas-inspect-header h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        color: #f59e0b;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      .cinzas-inspect-close {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 22px;
        cursor: pointer;
        padding: 0 4px;
        line-height: 1;
      }
      .cinzas-inspect-close:hover {
        color: #fff;
      }
      .cinzas-inspect-body {
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .cinzas-inspect-hero {
        display: flex;
        align-items: center;
        gap: 16px;
        background: rgba(18, 24, 38, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 6px;
        padding: 12px;
      }
      .cinzas-inspect-avatar-box {
        width: 68px;
        height: 68px;
        border-radius: 6px;
        background: #0d1118;
        border: 2px solid rgba(245, 158, 11, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex-shrink: 0;
      }
      .cinzas-inspect-avatar-box img {
        width: 52px;
        height: 52px;
        image-rendering: pixelated;
        object-fit: contain;
      }
      .cinzas-inspect-hero-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .cinzas-inspect-name {
        font-size: 16px;
        font-weight: 700;
        color: #f8fafc;
      }
      .cinzas-inspect-badge-row {
        display: flex;
        gap: 6px;
        align-items: center;
        flex-wrap: wrap;
      }
      .cinzas-inspect-badge {
        font-size: 10.5px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 4px;
        text-transform: uppercase;
      }
      .badge-lvl {
        background: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.4);
      }
      .badge-role {
        background: rgba(56, 189, 248, 0.15);
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.35);
      }
      .cinzas-inspect-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .cinzas-inspect-stat {
        background: rgba(13, 17, 26, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
      }
      .cinzas-inspect-stat .label {
        font-size: 10px;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 600;
      }
      .cinzas-inspect-stat .val {
        font-size: 13px;
        color: #f1f5f9;
        font-weight: 700;
        margin-top: 2px;
      }
      .cinzas-inspect-actions {
        padding: 12px 18px;
        background: rgba(10, 13, 20, 0.95);
        border-top: 1px solid rgba(255, 255, 255, 0.07);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
      }
      .cinzas-inspect-btn {
        padding: 6px 14px;
        border-radius: 4px;
        font-family: inherit;
        font-size: 11.5px;
        font-weight: 700;
        cursor: pointer;
        transition: filter 0.15s, transform 0.08s;
      }
      .cinzas-inspect-btn.primary {
        background: linear-gradient(180deg, #d97706 0%, #b45309 100%);
        border: 1px solid #f59e0b;
        color: #fff;
      }
      .cinzas-inspect-btn.secondary {
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #cbd5e1;
      }
      .cinzas-inspect-btn:hover {
        filter: brightness(1.15);
      }
      .cinzas-inspect-btn:active {
        transform: scale(0.97);
      }
    `;
    document.head.appendChild(style);
  }

  createDOM() {
    // Menu suspenso
    const menu = document.createElement('div');
    menu.className = 'cinzas-context-menu';
    menu.id = 'cinzasContextMenu';
    menu.innerHTML = `
      <div class="cinzas-context-header">
        <div class="cinzas-context-title">
          <span class="cinzas-context-dot" id="cinzasCtxDot"></span>
          <span id="cinzasCtxName">Aventureiro</span>
        </div>
        <div class="cinzas-context-sub" id="cinzasCtxSub">Guerreiro · Nível 1</div>
      </div>
      <button type="button" class="cinzas-context-item" data-action="whisper">
        <span class="icon">💬</span> Sussurrar
      </button>
      <button type="button" class="cinzas-context-item" data-action="inspect">
        <span class="icon">🔍</span> Inspecionar Perfil
      </button>
      <button type="button" class="cinzas-context-item" data-action="party">
        <span class="icon">🛡️</span> Convidar para Grupo
      </button>
      <button type="button" class="cinzas-context-item" data-action="trade">
        <span class="icon">⚖️</span> Negociar / Trocar
      </button>
      <button type="button" class="cinzas-context-item" data-action="copy">
        <span class="icon">📋</span> Copiar Nome
      </button>
      <button type="button" class="cinzas-context-item danger" data-action="close">
        <span class="icon">✕</span> Cancelar
      </button>
    `;
    document.body.appendChild(menu);
    this.menuNode = menu;

    // Modal de inspeção
    const modal = document.createElement('div');
    modal.className = 'cinzas-inspect-overlay';
    modal.id = 'cinzasInspectModal';
    modal.innerHTML = `
      <div class="cinzas-inspect-card" role="dialog" aria-modal="true">
        <div class="cinzas-inspect-header">
          <h3>Inspeção de Aventureiro</h3>
          <button type="button" class="cinzas-inspect-close" aria-label="Fechar">×</button>
        </div>
        <div class="cinzas-inspect-body">
          <div class="cinzas-inspect-hero">
            <div class="cinzas-inspect-avatar-box">
              <img id="inspectAvatarImg" src="assets/sprites/barbaro/south.png" alt="Avatar da Classe" />
            </div>
            <div class="cinzas-inspect-hero-info">
              <div class="cinzas-inspect-name" id="inspectPlayerName">Nome</div>
              <div class="cinzas-inspect-badge-row">
                <span class="cinzas-inspect-badge badge-lvl" id="inspectPlayerLvl">NÍVEL 1</span>
                <span class="cinzas-inspect-badge badge-role" id="inspectPlayerRole">COMBATENTE</span>
              </div>
            </div>
          </div>
          <div class="cinzas-inspect-grid">
            <div class="cinzas-inspect-stat">
              <span class="label">Vida Estimada</span>
              <span class="val" id="inspectStatHp">120 HP</span>
            </div>
            <div class="cinzas-inspect-stat">
              <span class="label">Armadura Base</span>
              <span class="val" id="inspectStatArmor">35 Def</span>
            </div>
            <div class="cinzas-inspect-stat">
              <span class="label">Arma de Combate</span>
              <span class="val" id="inspectStatWeapon">Machado Duplo</span>
            </div>
            <div class="cinzas-inspect-stat">
              <span class="label">Canal Atual</span>
              <span class="val" id="inspectStatChannel">bosque-1</span>
            </div>
          </div>
        </div>
        <div class="cinzas-inspect-actions">
          <button type="button" class="cinzas-inspect-btn secondary" id="inspectPartyBtn">🛡️ Convidar Grupo</button>
          <button type="button" class="cinzas-inspect-btn primary" id="inspectWhisperBtn">💬 Sussurrar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    this.inspectModal = modal;
  }

  bindEvents() {
    // Ações do menu suspenso
    this.menuNode.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      this.handleAction(action);
    });

    // Fechar ao clicar fora
    window.addEventListener('pointerdown', (e) => {
      if (this.isOpen && !this.menuNode.contains(e.target)) {
        this.close();
      }
    });

    // Fechar ao pressionar ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isOpen) this.close();
        if (this.inspectModal.classList.contains('active')) this.closeInspect();
      }
    });

    // Fechar modal de inspeção
    this.inspectModal.querySelector('.cinzas-inspect-close')?.addEventListener('click', () => this.closeInspect());
    this.inspectModal.addEventListener('click', (e) => {
      if (e.target === this.inspectModal) this.closeInspect();
    });

    // Botões dentro do modal de inspeção
    this.inspectModal.querySelector('#inspectWhisperBtn')?.addEventListener('click', () => {
      const p = this.activePlayer;
      this.closeInspect();
      if (p) this.triggerWhisper(p.name);
    });

    this.inspectModal.querySelector('#inspectPartyBtn')?.addEventListener('click', () => {
      const p = this.activePlayer;
      if (p) this.triggerPartyInvite(p);
    });
  }

  showForPlayer(player, eventOrCoords) {
    if (!player) return;
    this.activePlayer = player;
    this.isOpen = true;
    window.GameAudio?.playTargetSelect?.();

    // Atualiza cabeçalho do menu
    const nameNode = this.menuNode.querySelector('#cinzasCtxName');
    const subNode = this.menuNode.querySelector('#cinzasCtxSub');
    const dotNode = this.menuNode.querySelector('#cinzasCtxDot');

    const classNameFormatted = {
      guerreiro: 'Guerreiro',
      arqueiro: 'Arqueiro',
      barbaro: 'Bárbaro',
      clerigo: 'Clérigo',
      mago: 'Mago',
      assasino: 'Assassino'
    }[player.classId] || player.classId || 'Guerreiro';

    if (nameNode) nameNode.textContent = player.name;
    if (subNode) subNode.textContent = `${classNameFormatted} · Nível ${player.lvl || 1}`;
    if (dotNode) {
      dotNode.style.background = player.color || '#22c55e';
      dotNode.style.boxShadow = `0 0 6px ${player.color || '#22c55e'}`;
    }

    // Calcula coordenadas
    let clientX = 100;
    let clientY = 100;
    if (eventOrCoords && typeof eventOrCoords.clientX === 'number') {
      clientX = eventOrCoords.clientX;
      clientY = eventOrCoords.clientY;
    } else if (eventOrCoords && typeof eventOrCoords.x === 'number') {
      clientX = eventOrCoords.x;
      clientY = eventOrCoords.y;
    }

    // Posiciona e previne overflow
    this.menuNode.classList.add('active');
    const rect = this.menuNode.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 12;
    const maxY = window.innerHeight - rect.height - 12;

    const finalX = Math.min(Math.max(10, clientX + 4), maxX);
    const finalY = Math.min(Math.max(10, clientY + 4), maxY);

    this.menuNode.style.left = `${finalX}px`;
    this.menuNode.style.top = `${finalY}px`;
  }

  close() {
    this.isOpen = false;
    this.menuNode?.classList.remove('active');
  }

  handleAction(action) {
    const player = this.activePlayer;
    this.close();
    if (!player) return;

    if (action === 'whisper') {
      this.triggerWhisper(player.name);
    } else if (action === 'inspect') {
      this.openInspectModal(player);
    } else if (action === 'party') {
      this.triggerPartyInvite(player);
    } else if (action === 'trade') {
      this.triggerTradeRequest(player);
    } else if (action === 'copy') {
      this.copyPlayerName(player.name);
    }
  }

  triggerWhisper(targetName) {
    // Fecha modal de lista caso esteja aberta
    window.CinzasPlayerList?.close();
    const chat = window.CinzasChat;
    if (chat) {
      chat.focusChat();
      if (chat.input) {
        chat.input.value = `/w ${targetName} `;
        chat.input.focus();
      }
    }
  }

  triggerPartyInvite(player) {
    if (cinzasNet?.isConnected) {
      cinzasNet.sendPartyInvite(player.name, player.id);
    }
  }

  triggerTradeRequest(player) {
    if (cinzasNet?.isConnected) {
      cinzasNet.sendTradeRequest(player.name, player.id);
    } else {
      window.CinzasChat?.addMessage({
        from: 'SISTEMA',
        text: 'Você precisa estar conectado ao servidor multiplayer para negociar.',
        type: 'system',
        time: new Date()
      });
    }
  }

  copyPlayerName(name) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(name).then(() => {
        window.CinzasChat?.addMessage({
          from: 'SISTEMA',
          text: `Nome '${name}' copiado para a área de transferência.`,
          type: 'system',
          time: new Date()
        });
      }).catch(() => {});
    }
  }

  openInspectModal(player) {
    this.activePlayer = player;
    const cls = window.GameClasses?.get ? window.GameClasses.get(player.classId) : null;
    const lvl = Number(player.lvl) || 1;

    const nameNode = this.inspectModal.querySelector('#inspectPlayerName');
    const lvlNode = this.inspectModal.querySelector('#inspectPlayerLvl');
    const roleNode = this.inspectModal.querySelector('#inspectPlayerRole');
    const hpNode = this.inspectModal.querySelector('#inspectStatHp');
    const armorNode = this.inspectModal.querySelector('#inspectStatArmor');
    const weaponNode = this.inspectModal.querySelector('#inspectStatWeapon');
    const channelNode = this.inspectModal.querySelector('#inspectStatChannel');
    const avatarImg = this.inspectModal.querySelector('#inspectAvatarImg');

    if (nameNode) nameNode.textContent = player.name;
    if (lvlNode) lvlNode.textContent = `NÍVEL ${lvl}`;
    if (roleNode) roleNode.textContent = cls?.role ? cls.role.toUpperCase() : 'COMBATENTE';

    const estimatedHp = cls ? (cls.baseHp || 100) + (lvl - 1) * (cls.hpPerLevel || 10) : 100 + lvl * 10;
    if (hpNode) hpNode.textContent = `${estimatedHp} HP`;
    if (armorNode) armorNode.textContent = `${cls?.armor || 30} Defesa`;
    if (weaponNode) weaponNode.textContent = cls?.weapon ? cls.weapon.toUpperCase() : 'Arma Básica';
    if (channelNode) channelNode.textContent = cinzasNet.channel || 'bosque-1';

    if (avatarImg && cls && window.GameClasses?.portrait) {
      try {
        avatarImg.src = window.GameClasses.portrait(cls);
      } catch {
        avatarImg.src = 'assets/sprites/barbaro/south.png';
      }
    }

    this.inspectModal.classList.add('active');
  }

  closeInspect() {
    this.inspectModal?.classList.remove('active');
  }
}

export const playerContextMenu = new PlayerContextMenu();
if (typeof window !== 'undefined') {
  window.CinzasContextMenu = playerContextMenu;
}
