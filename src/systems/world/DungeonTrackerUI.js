// src/systems/world/DungeonTrackerUI.js
// ─────────────────────────────────────────────────────────────
// GUERRA DAS CINZAS · HUD Rastreador de Masmorras e Objetivos
// ─────────────────────────────────────────────────────────────

export class DungeonTrackerUI {
  constructor() {
    this.container = null;
    this.visible = false;
    this.onLeaveCallback = null;
  }

  init(onLeaveCallback = null) {
    if (this.container) return;
    this.onLeaveCallback = onLeaveCallback;

    const el = document.createElement('aside');
    el.id = 'dungeonTracker';
    el.className = 'dungeon-tracker-panel';
    el.setAttribute('aria-label', 'Rastreador da Masmorra');
    el.innerHTML = `
      <div class="dt-header">
        <div class="dt-title-row">
          <span class="dt-icon">🏰</span>
          <span class="dt-name" id="dtName">Masmorra</span>
        </div>
        <span class="dt-floor-badge" id="dtFloor">Andar 01/10</span>
      </div>

      <div class="dt-content">
        <div class="dt-stat-row">
          <span class="dt-stat-label">💀 Criaturas:</span>
          <span class="dt-stat-val" id="dtMobs">0 / 0 restantes</span>
        </div>
        <div class="dt-progress-bar">
          <div class="dt-progress-fill" id="dtMobsFill" style="width: 0%;"></div>
        </div>

        <div class="dt-stat-row" style="margin-top: 6px;">
          <span class="dt-stat-label">📦 Baús de Saque:</span>
          <span class="dt-stat-val" id="dtChests">0 / 0</span>
        </div>

        <div class="dt-stairs-status" id="dtStairs">
          <span class="dt-stairs-icon">🔒</span>
          <span class="dt-stairs-text">Elimine as criaturas para abrir as escadas</span>
        </div>

        <button type="button" class="dt-leave-btn" id="dtLeaveBtn" title="Retornar à superfície e sair da masmorra">
          🚪 Retornar à Superfície
        </button>
      </div>
    `;

    // Estilos CSS incorporados com identidade Dark Fantasy
    const style = document.createElement('style');
    style.id = 'dungeonTrackerStyles';
    style.textContent = `
      .dungeon-tracker-panel {
        position: fixed;
        top: 68px;
        right: 18px;
        width: 250px;
        background: linear-gradient(180deg, rgba(20, 16, 24, 0.94) 0%, rgba(12, 10, 15, 0.97) 100%);
        border: 1px solid #78350f;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(245, 158, 11, 0.2);
        border-radius: 8px;
        font-family: 'Outfit', sans-serif;
        color: #e2e8f0;
        z-index: 85;
        padding: 10px 12px;
        display: none;
        backdrop-filter: blur(4px);
        animation: dtSlideIn 0.25s ease-out;
      }
      @keyframes dtSlideIn {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .dungeon-tracker-panel.show {
        display: block;
      }
      .dt-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(180, 83, 9, 0.3);
        padding-bottom: 6px;
        margin-bottom: 8px;
      }
      .dt-title-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .dt-icon {
        font-size: 14px;
      }
      .dt-name {
        font-family: 'Cinzel', serif;
        font-size: 13px;
        font-weight: 700;
        color: #fef08a;
        letter-spacing: 0.5px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.8);
      }
      .dt-floor-badge {
        font-size: 10px;
        font-weight: 700;
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.3);
        padding: 2px 6px;
        border-radius: 4px;
      }
      .dt-floor-badge.boss-floor {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.2);
        border-color: #ef4444;
        box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
      }
      .dt-stat-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11px;
        color: #cbd5e1;
        margin-bottom: 3px;
      }
      .dt-stat-val {
        font-weight: 600;
        color: #93c5fd;
      }
      .dt-progress-bar {
        width: 100%;
        height: 5px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 3px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .dt-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #22c55e, #4ade80);
        transition: width 0.3s ease;
      }
      .dt-stairs-status {
        margin-top: 8px;
        padding: 5px 8px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 4px;
        font-size: 10px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .dt-stairs-status.unlocked {
        background: rgba(34, 197, 94, 0.15);
        border-color: #22c55e;
        color: #86efac;
        box-shadow: 0 0 10px rgba(34, 197, 94, 0.25);
      }
      .dt-stairs-status.unlocked .dt-stairs-icon {
        color: #4ade80;
      }
      .dt-leave-btn {
        width: 100%;
        margin-top: 8px;
        padding: 5px 8px;
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #fca5a5;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
      }
      .dt-leave-btn:hover {
        background: rgba(239, 68, 68, 0.25);
        border-color: #ef4444;
        color: #fff;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(el);
    this.container = el;

    el.querySelector('#dtLeaveBtn')?.addEventListener('click', () => {
      if (confirm('Deseja deixar a masmorra e retornar ao acampamento na superfície?')) {
        if (typeof this.onLeaveCallback === 'function') {
          this.onLeaveCallback();
        }
      }
    });
  }

  show() {
    if (!this.container) this.init();
    this.visible = true;
    this.container.classList.add('show');
  }

  hide() {
    if (!this.container) return;
    this.visible = false;
    this.container.classList.remove('show');
  }

  update({ dungeonName, floor, totalFloors, mobsAlive, mobsTotal, chestsOpen, chestsTotal, isCleared, isBossFloor, bossAlive }) {
    if (!this.container) return;
    if (!this.visible) this.show();

    const nameNode = this.container.querySelector('#dtName');
    const floorNode = this.container.querySelector('#dtFloor');
    const mobsNode = this.container.querySelector('#dtMobs');
    const mobsFill = this.container.querySelector('#dtMobsFill');
    const chestsNode = this.container.querySelector('#dtChests');
    const stairsNode = this.container.querySelector('#dtStairs');
    const stairsText = stairsNode?.querySelector('.dt-stairs-text');
    const stairsIcon = stairsNode?.querySelector('.dt-stairs-icon');

    if (nameNode) nameNode.textContent = dungeonName || 'Masmorra';
    if (floorNode) {
      floorNode.textContent = `Andar ${String(floor).padStart(2, '0')}/${totalFloors || 10}${isBossFloor ? ' 👑' : ''}`;
      floorNode.classList.toggle('boss-floor', Boolean(isBossFloor));
    }

    if (mobsNode) {
      if (isBossFloor && bossAlive) {
        mobsNode.textContent = '👑 Chefe Ativo!';
        mobsNode.style.color = '#ef4444';
      } else if (mobsAlive > 0) {
        mobsNode.textContent = `${mobsAlive} restante${mobsAlive > 1 ? 's' : ''}`;
        mobsNode.style.color = '#93c5fd';
      } else {
        mobsNode.textContent = '✨ Área Limpa!';
        mobsNode.style.color = '#4ade80';
      }
    }

    if (mobsFill) {
      const pct = mobsTotal > 0 ? Math.max(0, Math.min(100, Math.round(((mobsTotal - mobsAlive) / mobsTotal) * 100))) : 100;
      mobsFill.style.width = `${pct}%`;
      mobsFill.style.background = isCleared ? 'linear-gradient(90deg, #22c55e, #10b981)' : 'linear-gradient(90deg, #f59e0b, #eab308)';
    }

    if (chestsNode) {
      chestsNode.textContent = `${chestsOpen || 0} / ${chestsTotal || 0} abertos`;
    }

    if (stairsNode) {
      stairsNode.classList.toggle('unlocked', Boolean(isCleared));
      if (isCleared) {
        if (stairsIcon) stairsIcon.textContent = '🪜';
        if (stairsText) stairsText.textContent = floor >= (totalFloors || 10) ? '✨ Saída da Masmorra Desbloqueada!' : '✨ Escadas Liberadas! [E] para descer';
      } else {
        if (stairsIcon) stairsIcon.textContent = '🔒';
        if (stairsText) stairsText.textContent = isBossFloor ? 'Derrote o Chefe para abrir a passagem!' : 'Elimine as criaturas para abrir as escadas';
      }
    }
  }
}

export const dungeonTrackerUI = new DungeonTrackerUI();
