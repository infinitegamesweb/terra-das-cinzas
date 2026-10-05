// src/systems/multiplayer/PartyManager.js
// ═══════════════════════════════════════════════════════════════
//  GUERRA DAS CINZAS — Sistema de Grupos / Party (HUD de Aliados)
//  Barras de vida em tempo real, convites interativos, chat /p e partilha de XP
// ═══════════════════════════════════════════════════════════════

import { cinzasNet } from './CinzasNet.js';

export class PartyManager {
  constructor() {
    this.hudNode = null;
    this.inviteToastNode = null;
    this.currentParty = null;
    this.pendingInvite = null;
    this.vitalsTimer = null;
  }

  init() {
    if (this.hudNode) return;
    this.injectStyles();
    this.createDOM();
    this.bindEvents();

    // Conecta eventos do CinzasNet
    cinzasNet.onPartyUpdate = (party) => this.handlePartyUpdate(party);
    cinzasNet.onPartyInvite = (invite) => this.handlePartyInvite(invite);

    // Loop de sincronização de vida com o grupo
    clearInterval(this.vitalsTimer);
    this.vitalsTimer = setInterval(() => this.syncLocalVitals(), 1200);
  }

  injectStyles() {
    if (document.getElementById('cinzas-party-styles')) return;
    const style = document.createElement('style');
    style.id = 'cinzas-party-styles';
    style.textContent = `
      /* HUD de Grupo no Canto Superior Esquerdo */
      .cinzas-party-hud {
        position: absolute;
        top: 68px;
        left: 20px;
        z-index: 48;
        display: none;
        flex-direction: column;
        gap: 6px;
        width: 195px;
        font-family: 'Outfit', sans-serif;
        user-select: none;
        pointer-events: auto;
      }
      .cinzas-party-hud.active {
        display: flex;
      }
      .cinzas-party-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: linear-gradient(180deg, rgba(20, 26, 38, 0.85) 0%, rgba(12, 16, 24, 0.92) 100%);
        backdrop-filter: blur(4px);
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 4px;
        padding: 4px 8px;
      }
      .cinzas-party-title {
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.8px;
        color: #f59e0b;
        text-transform: uppercase;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .cinzas-party-leave-btn {
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.35);
        color: #fca5a5;
        font-size: 9.5px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 3px;
        cursor: pointer;
        transition: background 0.15s;
      }
      .cinzas-party-leave-btn:hover {
        background: rgba(239, 68, 68, 0.4);
        color: #fff;
      }
      .cinzas-party-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .party-member-card {
        background: linear-gradient(180deg, rgba(16, 22, 34, 0.88) 0%, rgba(9, 13, 20, 0.94) 100%);
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 5px;
        padding: 6px 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s, transform 0.1s;
      }
      .party-member-card:hover {
        border-color: rgba(245, 158, 11, 0.4);
        background: rgba(22, 30, 46, 0.95);
        transform: translateX(2px);
      }
      .party-member-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .party-member-info {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .party-member-avatar {
        width: 18px;
        height: 18px;
        border-radius: 3px;
        background: #0b0f17;
        border: 1px solid rgba(245, 158, 11, 0.3);
        overflow: hidden;
        flex-shrink: 0;
      }
      .party-member-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        image-rendering: pixelated;
      }
      .party-member-name {
        font-size: 11.5px;
        font-weight: 700;
        color: #f1f5f9;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 110px;
      }
      .party-leader-crown {
        color: #facc15;
        font-size: 11px;
      }
      .party-member-lvl {
        font-size: 10px;
        font-weight: 600;
        color: #94a3b8;
      }
      .party-hp-wrap {
        width: 100%;
        height: 8px;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 3px;
        overflow: hidden;
        position: relative;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .party-hp-fill {
        height: 100%;
        background: linear-gradient(90deg, #ef4444 0%, #22c55e 100%);
        border-radius: 2px;
        transition: width 0.3s ease;
      }
      .party-hp-text {
        position: absolute;
        inset: 0;
        font-size: 8px;
        font-weight: 700;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
      }

      /* Notificação Toast de Convite */
      .cinzas-party-invite-toast {
        position: fixed;
        bottom: 120px;
        right: 24px;
        z-index: 100;
        background: linear-gradient(180deg, #171d2b 0%, #0d121c 100%);
        border: 1px solid rgba(245, 158, 11, 0.5);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.85), 0 0 16px rgba(245, 158, 11, 0.2);
        border-radius: 8px;
        padding: 12px 16px;
        width: 290px;
        display: none;
        flex-direction: column;
        gap: 10px;
        font-family: 'Outfit', sans-serif;
        animation: cinzasToastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes cinzasToastSlideIn {
        from { opacity: 0; transform: translateY(16px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .cinzas-party-invite-toast.active {
        display: flex;
      }
      .cinzas-toast-title {
        font-size: 13px;
        font-weight: 700;
        color: #f8fafc;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .cinzas-toast-body {
        font-size: 11.5px;
        color: #cbd5e1;
        line-height: 1.4;
      }
      .cinzas-toast-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 2px;
      }
      .cinzas-toast-btn {
        flex: 1;
        padding: 6px 10px;
        border-radius: 4px;
        font-family: inherit;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: filter 0.15s;
        text-align: center;
      }
      .cinzas-toast-btn.accept {
        background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
        border: 1px solid #22c55e;
        color: #fff;
      }
      .cinzas-toast-btn.decline {
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.4);
        color: #fca5a5;
      }
      .cinzas-toast-btn:hover {
        filter: brightness(1.2);
      }
    `;
    document.head.appendChild(style);
  }

  createDOM() {
    // HUD de Grupo
    const hud = document.createElement('div');
    hud.className = 'cinzas-party-hud';
    hud.id = 'cinzasPartyHud';
    hud.innerHTML = `
      <div class="cinzas-party-header">
        <span class="cinzas-party-title" id="cinzasPartyCount">🛡️ GRUPO (1/4)</span>
        <button type="button" class="cinzas-party-leave-btn" id="cinzasPartyLeaveBtn" title="Abandonar o grupo">Sair</button>
      </div>
      <div class="cinzas-party-list" id="cinzasPartyList"></div>
    `;
    const app = document.querySelector('#app') || document.body;
    app.appendChild(hud);
    this.hudNode = hud;

    // Toast de Convite
    const toast = document.createElement('div');
    toast.className = 'cinzas-party-invite-toast';
    toast.id = 'cinzasPartyInviteToast';
    toast.innerHTML = `
      <div class="cinzas-toast-title">
        <span>🛡️</span> Convite para Grupo
      </div>
      <div class="cinzas-toast-body" id="cinzasPartyInviteBody">
        Um aventureiro convidou você para formar um grupo!
      </div>
      <div class="cinzas-toast-actions">
        <button type="button" class="cinzas-toast-btn accept" id="cinzasInviteAcceptBtn">Aceitar</button>
        <button type="button" class="cinzas-toast-btn decline" id="cinzasInviteDeclineBtn">Recusar</button>
      </div>
    `;
    document.body.appendChild(toast);
    this.inviteToastNode = toast;
  }

  bindEvents() {
    this.hudNode.querySelector('#cinzasPartyLeaveBtn')?.addEventListener('click', () => {
      this.leaveParty();
    });

    this.inviteToastNode.querySelector('#cinzasInviteAcceptBtn')?.addEventListener('click', () => {
      this.acceptPendingInvite();
    });

    this.inviteToastNode.querySelector('#cinzasInviteDeclineBtn')?.addEventListener('click', () => {
      this.declinePendingInvite();
    });
  }

  handlePartyUpdate(party) {
    const prevCount = this.currentParty?.members?.length || 0;
    const newCount = party?.members?.length || 0;
    if (party && newCount > prevCount && prevCount > 0) {
      window.GameAudio?.playPartyJoin?.();
    }
    this.currentParty = party;
    this.render();
  }

  handlePartyInvite(invite) {
    this.pendingInvite = invite;
    window.GameAudio?.playPartyInvite?.();
    const bodyNode = this.inviteToastNode.querySelector('#cinzasPartyInviteBody');
    if (bodyNode) {
      bodyNode.innerHTML = `<strong>${invite.fromName || 'Um aventureiro'}</strong> convidou você para caçar e explorar em grupo!`;
    }
    this.inviteToastNode.classList.add('active');

    // Notifica também no chat
    window.CinzasChat?.addMessage({
      from: 'GRUPO',
      text: `⚔️ ${invite.fromName || 'Um aventureiro'} convidou você para o grupo! Digite /accept para aceitar ou /decline para recusar.`,
      type: 'system',
      time: new Date()
    });

    // Auto-dismiss após 25 segundos
    clearTimeout(this.inviteTimeout);
    this.inviteTimeout = setTimeout(() => {
      if (this.pendingInvite === invite) {
        this.closeInviteToast();
      }
    }, 25000);
  }

  acceptPendingInvite() {
    if (!this.pendingInvite) return;
    window.GameAudio?.playPartyJoin?.();
    cinzasNet.sendPartyAccept(this.pendingInvite.fromId);
    this.closeInviteToast();
  }

  declinePendingInvite() {
    if (!this.pendingInvite) return;
    cinzasNet.sendPartyDecline(this.pendingInvite.fromId);
    this.closeInviteToast();
  }

  closeInviteToast() {
    this.pendingInvite = null;
    this.inviteToastNode?.classList.remove('active');
  }

  leaveParty() {
    if (!this.currentParty) return;
    window.GameAudio?.playPartyLeave?.();
    cinzasNet.sendPartyLeave();
    this.currentParty = null;
    this.render();
  }

  syncLocalVitals() {
    if (!this.currentParty || !cinzasNet.isConnected) return;
    const p = typeof window !== 'undefined' ? window._tdcPlayer : null;
    if (!p) return;
    const hp = Number(p.hp) || 100;
    const maxHp = Number(p.max) || 100;
    const lvl = Number(p.lvl) || 1;
    cinzasNet.sendPartyVitals(hp, maxHp, lvl);
  }

  render() {
    const listNode = this.hudNode.querySelector('#cinzasPartyList');
    const countNode = this.hudNode.querySelector('#cinzasPartyCount');
    if (!listNode || !countNode) return;

    if (!this.currentParty || !this.currentParty.members || this.currentParty.members.length <= 1) {
      this.hudNode.classList.remove('active');
      listNode.replaceChildren();
      return;
    }

    this.hudNode.classList.add('active');
    const members = this.currentParty.members;
    countNode.textContent = `🛡️ GRUPO (${members.length}/4)`;
    listNode.replaceChildren();

    // Renderiza apenas os outros membros do grupo no HUD (para economizar espaço na tela)
    const allies = members.filter(m => m.id !== cinzasNet.myId);

    for (const ally of allies) {
      const card = document.createElement('div');
      card.className = 'party-member-card';

      const cls = window.GameClasses?.get ? window.GameClasses.get(ally.classId) : null;
      let portraitUrl = 'assets/characters/barbaro/animations/walk/south/frame_000.png';
      if (cls && window.GameClasses?.portrait) {
        try { portraitUrl = window.GameClasses.portrait(cls); } catch {}
      }

      const hp = Math.max(0, ally.hp || 100);
      const maxHp = Math.max(1, ally.maxHp || 100);
      const hpPct = Math.min(100, Math.max(0, Math.round((hp / maxHp) * 100)));

      card.innerHTML = `
        <div class="party-member-top">
          <div class="party-member-info">
            <div class="party-member-avatar">
              <img src="${portraitUrl}" alt="${ally.name}" />
            </div>
            <span class="party-member-name" title="${ally.name}">
              ${ally.name}
              ${ally.isLeader ? '<span class="party-leader-crown" title="Líder do Grupo">👑</span>' : ''}
            </span>
          </div>
          <span class="party-member-lvl">Nv.${ally.lvl || 1}</span>
        </div>
        <div class="party-hp-wrap">
          <div class="party-hp-fill" style="width: ${hpPct}%;"></div>
          <span class="party-hp-text">${hp}/${maxHp} HP</span>
        </div>
      `;

      card.addEventListener('click', (e) => {
        window.CinzasContextMenu?.showForPlayer(ally, e);
      });

      listNode.appendChild(card);
    }
  }
}

export const partyManager = new PartyManager();
if (typeof window !== 'undefined') {
  window.CinzasParty = partyManager;
}
