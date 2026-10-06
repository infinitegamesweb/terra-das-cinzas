// src/systems/quests/QuestUI.js
// ─────────────────────────────────────────────────────────────
// GUERRA DAS CINZAS · Diário de Missões (J), Diálogo de NPCs e HUD Tracker
// ─────────────────────────────────────────────────────────────

import { questManager, QUEST_DATABASE } from './QuestManager.js';

export class QuestUI {
  constructor() {
    this.logModal = null;
    this.hudTracker = null;
    this.dialogBox = null;
    this.isOpen = false;
    this.currentTab = 'active';
    this.trackedQuestId = null;
  }

  init() {
    this.createHudTracker();
    this.createLogModal();
    this.createDialogBox();

    window.addEventListener('quests-updated', () => {
      this.updateHudTracker();
      if (this.isOpen) this.renderLogModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'j' || e.key === 'J') {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        this.toggleLogModal();
      }
    });

    this.updateHudTracker();
  }

  // ─── 1. HUD TRACKER (Canto Superior Direito / Lateral) ────────
  createHudTracker() {
    if (this.hudTracker) return;
    const el = document.createElement('div');
    el.id = 'hudQuestTracker';
    el.className = 'hud-quest-tracker';
    el.innerHTML = `
      <div class="hqt-header">
        <span class="hqt-icon">📜</span>
        <span class="hqt-title">MISSÃO ATIVA</span>
        <span class="hqt-shortcut" title="Abrir Diário de Missões">Tecla [J]</span>
      </div>
      <div class="hqt-body" id="hqtBody">
        <span class="hqt-quest-name" id="hqtQuestName">Nenhuma missão rastreada</span>
        <div class="hqt-objectives" id="hqtObjectives"></div>
      </div>
    `;

    const style = document.createElement('style');
    style.id = 'questUiStyles';
    style.textContent = `
      /* ─── HUD QUEST TRACKER ─── */
      .hud-quest-tracker {
        position: fixed;
        top: 224px;
        left: 18px;
        width: 250px;
        background: linear-gradient(180deg, rgba(17, 24, 39, 0.90) 0%, rgba(10, 15, 26, 0.95) 100%);
        border: 1px solid rgba(245, 158, 11, 0.35);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.65);
        color: #f1f5f9;
        font-family: 'Outfit', sans-serif;
        padding: 8px 12px;
        z-index: 60;
        pointer-events: auto;
        backdrop-filter: blur(4px);
        transition: opacity 0.2s ease, transform 0.2s ease;
      }
      .hud-quest-tracker.hidden {
        opacity: 0;
        pointer-events: none;
        transform: translateY(-8px);
      }
      .hqt-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(245, 158, 11, 0.25);
        padding-bottom: 4px;
        margin-bottom: 6px;
      }
      .hqt-icon {
        font-size: 13px;
        margin-right: 4px;
      }
      .hqt-title {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.5px;
        color: #f59e0b;
        font-family: 'Cinzel', serif;
      }
      .hqt-shortcut {
        font-size: 9px;
        color: #94a3b8;
        background: rgba(0, 0, 0, 0.3);
        padding: 1px 4px;
        border-radius: 3px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .hqt-quest-name {
        font-size: 12px;
        font-weight: 600;
        color: #fef08a;
        display: block;
        margin-bottom: 4px;
      }
      .hqt-obj-item {
        font-size: 11px;
        color: #cbd5e1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2px;
      }
      .hqt-obj-item.done {
        color: #4ade80;
      }
      .hqt-obj-count {
        font-weight: 600;
        color: #93c5fd;
      }
      .hqt-obj-item.done .hqt-obj-count {
        color: #4ade80;
      }
      .hqt-turnin-badge {
        margin-top: 6px;
        padding: 3px 6px;
        background: rgba(34, 197, 94, 0.2);
        border: 1px solid #22c55e;
        color: #86efac;
        font-size: 10px;
        font-weight: 700;
        text-align: center;
        border-radius: 4px;
        animation: hqtPulse 1.4s infinite;
      }
      @keyframes hqtPulse {
        0%, 100% { opacity: 0.85; }
        50% { opacity: 1; filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.6)); }
      }

      /* ─── QUEST LOG MODAL (TECLA J) ─── */
      .quest-log-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 120;
        backdrop-filter: blur(4px);
      }
      .quest-log-overlay.open {
        display: flex;
      }
      .quest-log-panel {
        width: 680px;
        max-width: 95vw;
        height: 520px;
        max-height: 90vh;
        background: #101216;
        border: 1px solid #854d0e;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(245, 158, 11, 0.3);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        color: #f1f5f9;
        font-family: 'Outfit', sans-serif;
      }
      .ql-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 18px;
        background: linear-gradient(180deg, #1e1b18 0%, #121417 100%);
        border-bottom: 1px solid #78350f;
      }
      .ql-title {
        font-family: 'Cinzel', serif;
        font-size: 16px;
        font-weight: 700;
        color: #fef08a;
        letter-spacing: 0.8px;
      }
      .ql-close {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 20px;
        cursor: pointer;
      }
      .ql-close:hover { color: #f87171; }
      .ql-tabs {
        display: flex;
        background: #090a0d;
        border-bottom: 1px solid #292524;
      }
      .ql-tab-btn {
        flex: 1;
        padding: 10px 14px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        color: #94a3b8;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .ql-tab-btn.active {
        color: #f59e0b;
        border-bottom-color: #f59e0b;
        background: rgba(245, 158, 11, 0.08);
      }
      .ql-body {
        display: flex;
        flex: 1;
        overflow: hidden;
      }
      .ql-list {
        width: 250px;
        border-right: 1px solid #292524;
        overflow-y: auto;
        padding: 8px;
      }
      .ql-item {
        padding: 10px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        margin-bottom: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .ql-item:hover, .ql-item.selected {
        background: rgba(245, 158, 11, 0.12);
        border-color: #d97706;
      }
      .ql-item-title {
        font-size: 12px;
        font-weight: 600;
        color: #fef08a;
      }
      .ql-item-meta {
        font-size: 10px;
        color: #94a3b8;
        margin-top: 3px;
        display: flex;
        justify-content: space-between;
      }
      .ql-details {
        flex: 1;
        padding: 16px 20px;
        overflow-y: auto;
      }

      /* ─── NPC DIALOGUE BOX ─── */
      .npc-dialog-overlay {
        position: fixed;
        bottom: 25px;
        left: 50%;
        transform: translateX(-50%);
        width: 720px;
        max-width: 92vw;
        background: linear-gradient(180deg, rgba(20, 24, 33, 0.96) 0%, rgba(10, 13, 18, 0.98) 100%);
        border: 1px solid #b45309;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(245, 158, 11, 0.25);
        border-radius: 10px;
        padding: 16px 20px;
        z-index: 130;
        display: none;
        backdrop-filter: blur(6px);
        font-family: 'Outfit', sans-serif;
        color: #f1f5f9;
        animation: dialogPop 0.2s ease-out;
      }
      @keyframes dialogPop {
        from { opacity: 0; transform: translate(-50%, 15px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
      .npc-dialog-overlay.open {
        display: flex;
        gap: 16px;
      }
      .npc-avatar-box {
        width: 64px;
        height: 64px;
        background: #1c1917;
        border: 1px solid #78350f;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        flex-shrink: 0;
      }
      .npc-content-box {
        flex: 1;
      }
      .npc-name {
        font-family: 'Cinzel', serif;
        font-size: 15px;
        font-weight: 700;
        color: #f59e0b;
        letter-spacing: 0.5px;
      }
      .npc-speech {
        font-size: 13px;
        line-height: 1.5;
        color: #e2e8f0;
        margin-top: 6px;
        margin-bottom: 12px;
      }
      .npc-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .npc-btn {
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }
      .npc-btn-primary {
        background: linear-gradient(180deg, #d97706 0%, #b45309 100%);
        color: #fff;
      }
      .npc-btn-primary:hover { background: #f59e0b; }
      .npc-btn-secondary {
        background: rgba(255, 255, 255, 0.08);
        color: #cbd5e1;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
      .npc-btn-secondary:hover { background: rgba(255, 255, 255, 0.15); color: #fff; }

      /* ─── BANNER DE MISSÃO CONCLUÍDA ─── */
      .quest-completion-banner {
        position: fixed;
        top: 55px;
        left: 50%;
        transform: translateX(-50%) scale(0.9);
        min-width: 380px;
        max-width: 90vw;
        background: linear-gradient(90deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.96) 15%, rgba(15, 23, 42, 0.96) 85%, rgba(15, 23, 42, 0) 100%);
        border-top: 1px solid rgba(245, 158, 11, 0.7);
        border-bottom: 1px solid rgba(245, 158, 11, 0.7);
        box-shadow: 0 0 35px rgba(245, 158, 11, 0.35);
        padding: 12px 28px;
        text-align: center;
        z-index: 150;
        pointer-events: none;
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: 'Outfit', sans-serif;
      }
      .quest-completion-banner.active {
        opacity: 1;
        transform: translateX(-50%) scale(1);
      }
      .qcb-badge {
        font-family: 'Cinzel', serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 2.5px;
        color: #f59e0b;
        text-shadow: 0 0 10px rgba(245, 158, 11, 0.8);
        text-transform: uppercase;
      }
      .qcb-title {
        font-size: 16px;
        font-weight: 700;
        color: #ffffff;
        margin: 4px 0 6px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.8);
      }
      .qcb-rewards {
        display: flex;
        justify-content: center;
        gap: 12px;
        font-size: 12px;
        font-weight: 600;
        color: #fef08a;
      }
      .qcb-reward-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(el);
    this.hudTracker = el;
  }

  updateHudTracker() {
    if (!this.hudTracker) return;
    const activeList = questManager.getActiveQuestsList();
    if (activeList.length === 0) {
      this.hudTracker.classList.add('hidden');
      return;
    }
    this.hudTracker.classList.remove('hidden');

    const activeQuest = this.trackedQuestId ? activeList.find(q => q.id === this.trackedQuestId) || activeList[0] : activeList[0];
    const nameEl = this.hudTracker.querySelector('#hqtQuestName');
    const objEl = this.hudTracker.querySelector('#hqtObjectives');

    if (nameEl) nameEl.textContent = activeQuest.title;
    if (objEl) {
      objEl.replaceChildren();
      activeQuest.objectives.forEach(o => {
        const isDone = o.current >= o.required;
        const row = document.createElement('div');
        row.className = `hqt-obj-item ${isDone ? 'done' : ''}`;
        row.innerHTML = `
          <span>${isDone ? '✓' : '•'} ${o.label}</span>
          <span class="hqt-obj-count">${o.current} / ${o.required}</span>
        `;
        objEl.appendChild(row);
      });

      if (activeQuest.isReady) {
        const badge = document.createElement('div');
        badge.className = 'hqt-turnin-badge';
        badge.textContent = `✨ Pronto! Fale com ${activeQuest.giver}`;
        objEl.appendChild(badge);
      }
    }

    // Sync MMORPG HUD Quest Card
    const hudQuestCard = document.querySelector('#hudQuestCard');
    const hudQuestTitle = document.querySelector('#hudQuestTitle');
    const hudQuestObj = document.querySelector('#hudQuestObjective');
    const hudQuestProgress = document.querySelector('#hudQuestProgress');
    const hudQuestActionBtn = document.querySelector('#hudQuestActionBtn');

    if (hudQuestCard && activeQuest) {
      hudQuestCard.style.display = 'block';
      if (hudQuestTitle) hudQuestTitle.textContent = activeQuest.title;
      if (activeQuest.objectives && activeQuest.objectives.length > 0) {
        const firstObj = activeQuest.objectives.find(o => o.current < o.required) || activeQuest.objectives[0];
        if (hudQuestObj) {
          hudQuestObj.textContent = activeQuest.isReady 
            ? `Fale com ${activeQuest.giver}` 
            : firstObj.label;
        }
        if (hudQuestProgress) {
          hudQuestProgress.textContent = `${firstObj.current}/${firstObj.required}`;
        }
      }
      if (hudQuestActionBtn) {
        hudQuestActionBtn.textContent = activeQuest.isReady ? `✦ Entregar (${activeQuest.giver})` : `✦ Falar com Vigia`;
        hudQuestActionBtn.onclick = (e) => {
          e.stopPropagation();
          this.openLogModal();
        };
      }
    }
  }

  // ─── 2. DIÁRIO DE MISSÕES MODAL (J) ───────────────────────────
  createLogModal() {
    if (this.logModal) return;
    const modal = document.createElement('div');
    modal.id = 'questLogModal';
    modal.className = 'quest-log-overlay';
    modal.innerHTML = `
      <div class="quest-log-panel">
        <header class="ql-header">
          <span class="ql-title">📜 DIÁRIO DE MISSÕES</span>
          <button type="button" class="ql-close" id="qlCloseBtn">✕</button>
        </header>
        <div class="ql-tabs">
          <button type="button" class="ql-tab-btn active" data-tab="active">Ativas</button>
          <button type="button" class="ql-tab-btn" data-tab="available">Disponíveis</button>
          <button type="button" class="ql-tab-btn" data-tab="completed">Concluídas</button>
        </div>
        <div class="ql-body">
          <div class="ql-list" id="qlList"></div>
          <div class="ql-details" id="qlDetails"></div>
        </div>
      </div>
    `;

    modal.querySelector('#qlCloseBtn')?.addEventListener('click', () => this.closeLogModal());
    modal.querySelectorAll('.ql-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.ql-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTab = btn.dataset.tab;
        this.renderLogModal();
      });
    });

    document.body.appendChild(modal);
    this.logModal = modal;
  }

  toggleLogModal() {
    if (this.isOpen) this.closeLogModal();
    else this.openLogModal();
  }

  openLogModal() {
    if (!this.logModal) this.createLogModal();
    this.isOpen = true;
    this.logModal.classList.add('open');
    this.renderLogModal();
  }

  closeLogModal() {
    if (!this.logModal) return;
    this.isOpen = false;
    this.logModal.classList.remove('open');
  }

  renderLogModal() {
    if (!this.logModal) return;
    const listEl = this.logModal.querySelector('#qlList');
    const detailsEl = this.logModal.querySelector('#qlDetails');
    if (!listEl || !detailsEl) return;

    listEl.replaceChildren();
    detailsEl.replaceChildren();

    let quests = [];
    if (this.currentTab === 'active') {
      quests = questManager.getActiveQuestsList();
    } else if (this.currentTab === 'available') {
      const pLvl = window._tdcPlayer?.lvl || 1;
      const regId = window._tdcRegionId || 1;
      quests = questManager.getAvailableQuestsForRegion(regId, pLvl);
    } else {
      quests = QUEST_DATABASE.filter(q => questManager.isQuestCompleted(q.id));
    }

    if (quests.length === 0) {
      listEl.innerHTML = `<div style="color: #64748b; font-size: 11px; padding: 10px;">Nenhuma missão nesta categoria.</div>`;
      detailsEl.innerHTML = `<div style="color: #64748b; font-size: 13px; text-align: center; margin-top: 100px;">Selecione uma missão para ver os detalhes.</div>`;
      return;
    }

    quests.forEach((q, idx) => {
      const item = document.createElement('div');
      item.className = `ql-item ${idx === 0 ? 'selected' : ''}`;
      item.innerHTML = `
        <div class="ql-item-title">${q.title}</div>
        <div class="ql-item-meta">
          <span>${q.giver}</span>
          <span style="color: ${q.isReady ? '#4ade80' : '#f59e0b'}">${q.isReady ? 'Concluída' : q.category}</span>
        </div>
      `;
      item.addEventListener('click', () => {
        listEl.querySelectorAll('.ql-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        this.renderQuestDetails(q);
      });
      listEl.appendChild(item);
    });

    this.renderQuestDetails(quests[0]);
  }

  renderQuestDetails(q) {
    const detailsEl = this.logModal.querySelector('#qlDetails');
    if (!detailsEl || !q) return;

    const base = questManager.getQuest(q.id) || q;
    const active = questManager.getActiveQuest(q.id);

    detailsEl.innerHTML = `
      <div style="border-bottom: 1px solid #332b20; padding-bottom: 10px; margin-bottom: 12px;">
        <h3 style="font-family: 'Cinzel', serif; font-size: 18px; color: #fef08a; margin: 0;">${base.title}</h3>
        <small style="color: #94a3b8; font-size: 11px;">Concedida por: <strong style="color: #f59e0b;">${base.giver}</strong> · Região ${base.regionId}</small>
      </div>

      <p style="font-size: 13px; line-height: 1.5; color: #cbd5e1; margin-bottom: 16px;">${base.summary}</p>

      <h4 style="font-size: 12px; color: #f59e0b; margin-bottom: 8px; text-transform: uppercase;">Objetivos da Missão:</h4>
      <div style="margin-bottom: 16px;">
        ${(active?.objectives || base.objectives).map(o => {
          const isDone = o.current >= o.required;
          return `
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: ${isDone ? '#4ade80' : '#e2e8f0'};">
              <span>${isDone ? '✓' : '○'} ${o.label}</span>
              <strong>${o.current || 0} / ${o.required}</strong>
            </div>
          `;
        }).join('')}
      </div>

      <h4 style="font-size: 12px; color: #f59e0b; margin-bottom: 8px; text-transform: uppercase;">Recompensas:</h4>
      <div style="display: flex; gap: 12px; font-size: 12px; color: #cbd5e1; margin-bottom: 20px;">
        ${base.rewards.xp ? `<span>⭐ +${base.rewards.xp} XP</span>` : ''}
        ${base.rewards.gold ? `<span>💰 +${base.rewards.gold} Ouro</span>` : ''}
        ${base.rewards.crystals ? `<span>💎 +${base.rewards.crystals} Cristais</span>` : ''}
        ${base.rewards.emberShards ? `<span>🔥 +${base.rewards.emberShards} Brasa</span>` : ''}
      </div>

      ${this.currentTab === 'available' ? `
        <button type="button" class="npc-btn npc-btn-primary" id="qlAcceptBtn">Aceitar Esta Missão</button>
      ` : this.currentTab === 'active' ? `
        <button type="button" class="npc-btn npc-btn-secondary" id="qlTrackBtn">${this.trackedQuestId === q.id ? '★ Rastreada no HUD' : '☆ Rastrear no HUD'}</button>
      ` : ''}
    `;

    detailsEl.querySelector('#qlAcceptBtn')?.addEventListener('click', () => {
      questManager.acceptQuest(q.id);
      this.currentTab = 'active';
      this.renderLogModal();
    });

    detailsEl.querySelector('#qlTrackBtn')?.addEventListener('click', () => {
      this.trackedQuestId = q.id;
      this.updateHudTracker();
      this.renderQuestDetails(q);
    });
  }

  // ─── 3. BALÃO DE DIÁLOGO DE NPCS ─────────────────────────────
  createDialogBox() {
    if (this.dialogBox) return;
    const el = document.createElement('div');
    el.id = 'npcDialogBox';
    el.className = 'npc-dialog-overlay';
    el.innerHTML = `
      <div class="npc-avatar-box" id="npcAvatar">🧙‍♂️</div>
      <div class="npc-content-box">
        <div class="npc-name" id="npcDialogName">Nome do NPC</div>
        <div class="npc-speech" id="npcDialogSpeech">Texto de fala...</div>
        <div class="npc-actions" id="npcDialogActions"></div>
      </div>
    `;

    document.body.appendChild(el);
    this.dialogBox = el;
  }

  openNpcDialog({ name, title, speech, icon, actions = [] }) {
    if (!this.dialogBox) this.createDialogBox();

    const nameEl = this.dialogBox.querySelector('#npcDialogName');
    const speechEl = this.dialogBox.querySelector('#npcDialogSpeech');
    const avatarEl = this.dialogBox.querySelector('#npcAvatar');
    const actionsEl = this.dialogBox.querySelector('#npcDialogActions');

    if (nameEl) nameEl.textContent = `${name} ${title ? `· ${title}` : ''}`;
    if (speechEl) speechEl.textContent = speech;
    if (avatarEl) avatarEl.textContent = icon || '👤';

    if (actionsEl) {
      actionsEl.replaceChildren();
      actions.forEach(act => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `npc-btn ${act.primary ? 'npc-btn-primary' : 'npc-btn-secondary'}`;
        btn.textContent = act.label;
        btn.addEventListener('click', () => {
          this.closeNpcDialog();
          if (typeof act.onClick === 'function') act.onClick();
        });
        actionsEl.appendChild(btn);
      });

      // Ação padrão de fechar
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'npc-btn npc-btn-secondary';
      closeBtn.textContent = 'Até logo';
      closeBtn.addEventListener('click', () => this.closeNpcDialog());
      actionsEl.appendChild(closeBtn);
    }

    this.dialogBox.classList.add('open');
  }

  closeNpcDialog() {
    if (!this.dialogBox) return;
    this.dialogBox.classList.remove('open');
  }

  showCompletionBanner(title, rewards = {}) {
    let banner = document.querySelector('#questCompletionBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'questCompletionBanner';
      banner.className = 'quest-completion-banner';
      document.body.appendChild(banner);
    }

    const rewardParts = [];
    if (rewards.xp) rewardParts.push(`<span class="qcb-reward-item">✨ +${rewards.xp} XP</span>`);
    if (rewards.gold) rewardParts.push(`<span class="qcb-reward-item">🪙 +${rewards.gold} Ouro</span>`);
    if (rewards.crystals) rewardParts.push(`<span class="qcb-reward-item">💎 +${rewards.crystals} Cristais</span>`);
    if (rewards.emberShards) rewardParts.push(`<span class="qcb-reward-item">🔥 +${rewards.emberShards} Brasa</span>`);
    if (rewards.potions) rewardParts.push(`<span class="qcb-reward-item">🧪 +${rewards.potions} Poções</span>`);

    banner.innerHTML = `
      <div class="qcb-badge">⚔ Missão Concluída ⚔</div>
      <div class="qcb-title">${title}</div>
      <div class="qcb-rewards">${rewardParts.join(' ')}</div>
    `;

    void banner.offsetWidth;
    banner.classList.add('active');

    clearTimeout(this._bannerTimeout);
    this._bannerTimeout = setTimeout(() => {
      banner.classList.remove('active');
    }, 3800);
  }
}

export const questUI = new QuestUI();
if (typeof window !== 'undefined') {
  window.QuestUI = questUI;
}
