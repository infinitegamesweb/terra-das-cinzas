// src/systems/ui/TutorialManager.js
// Guia do Aventureiro e Tutorial Interativo para Guerra das Cinzas

const STORAGE_KEY = 'terra_guide_seen_v1';

export const GUIDE_SECTIONS = Object.freeze([
  {
    id: 'controls',
    title: 'Controles & Atalhos',
    icon: '️',
    html: `
      <div class="guide-grid">
        <div class="guide-item">
          <span class="guide-badge">W A S D</span>
          <div>
            <strong>Movimentação</strong>
            <p>Use W, A, S, D ou as setas para guiar seu aventureiro pelo mapa e masmorras.</p>
          </div>
        </div>
        <div class="guide-item">
          <span class="guide-badge">CLIQUE / TOQUE</span>
          <div>
            <strong>Destino e Combate</strong>
            <p>Clique em qualquer ponto do terreno para caminhar até lá. Clique em inimigos para focar o ataque.</p>
          </div>
        </div>
        <div class="guide-item">
          <span class="guide-badge">TECLA E</span>
          <div>
            <strong>Interagir e Coletar</strong>
            <p>Pressione E próximo a NPCs (como a Vigia Maerin), minérios raros, baús e portais de masmorra.</p>
          </div>
        </div>
        <div class="guide-item">
          <span class="guide-badge">TECLA Z / AUTO</span>
          <div>
            <strong>Modo Automático</strong>
            <p>Pressione <strong>Z</strong> ou clique no botão AUTO para ativar combate e coleta autônomos.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'combat',
    title: 'Combate & Habilidades',
    icon: '️',
    html: `
      <div class="guide-grid">
        <div class="guide-item">
          <span class="guide-badge">1 · </span>
          <div>
            <strong>Poção de Cura</strong>
            <p>Restaura vida instantaneamente (consome 1 poção). Compre mais na aba Bolsa ou faça o Ritual da Brasa.</p>
          </div>
        </div>
        <div class="guide-item">
          <span class="guide-badge">2 · </span>
          <div>
            <strong>Raio Arcano</strong>
            <p>Disparo mágico de longo alcance (220 px) que atinge até 3 alvos próximos com dano arcano puro.</p>
          </div>
        </div>
        <div class="guide-item">
          <span class="guide-badge">3 · ️</span>
          <div>
            <strong>Escudo de Cinzas</strong>
            <p>Ergue uma barreira mística que absorve a maior parte do dano recebido durante 6 segundos.</p>
          </div>
        </div>
        <div class="guide-item">
          <span class="guide-badge">4 · </span>
          <div>
            <strong>Investida Rápida</strong>
            <p>Desliza rapidamente para a direção que você está olhando, ideal para esquivar de golpes de chefe.</p>
          </div>
        </div>
      </div>
      <div class="guide-tip">
        <span class="tip-icon"></span>
        <p><strong>Dica de Combate:</strong> Chefes mostram círculos de perigo no chão antes de desferirem ataques pesados. Use a Investida (4) ou ande para fora do círculo para evitar dano crítico!</p>
      </div>
    `
  },
  {
    id: 'dungeons',
    title: 'Masmorras & Chefes',
    icon: '️',
    html: `
      <div class="guide-grid">
        <div class="guide-item">
          <span class="guide-badge">NPCs LOCAIS</span>
          <div>
            <strong>Contratos de Expedição</strong>
            <p>Fale com o NPC de cada região (ex: Vigia Maerin, Barqueira Ysold) para aceitar o contrato da masmorra.</p>
          </div>
        </div>
        <div class="guide-item">
          <span class="guide-badge">10 ANDARES</span>
          <div>
            <strong>Expedição Solo Completa</strong>
            <p>Explore todos os 10 andares no protótipo. Andares 1–5 têm dificuldade moderada; andares 6–10 oferecem desafio supremo.</p>
          </div>
        </div>
        <div class="guide-item">
          <span class="guide-badge">ANDARES 5 E 10</span>
          <div>
            <strong>Chefes das Profundezas</strong>
            <p>Enfrente sub-chefes no andar 5 e o Guardião Supremo no andar 10 com fases de ataque e saques épicos.</p>
          </div>
        </div>
        <div class="guide-item">
          <span class="guide-badge">MINÉRIOS RAROS</span>
          <div>
            <strong>Recursos Exclusivos</strong>
            <p>Minério Abissal, Pedra de Sangue e Prata Astral só existem nas masmorras e servem para o Códice e recompensas.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'progression',
    title: 'Progressão & Classes',
    icon: '',
    html: `
      <div class="guide-grid">
        <div class="guide-item">
          <span class="guide-badge">NÍVEL 1 A 100</span>
          <div>
            <strong>Evolução do Herói</strong>
            <p>Ganhe XP abatendo criaturas e cumprindo contratos. A cada 5 níveis você ganha <b>1 Ponto de Talento</b> na aba Personagem!</p>
          </div>
        </div>
        <div class="guide-item">
          <span class="guide-badge">PENALIDADE DE MORTE</span>
          <div>
            <strong>Morte Segura</strong>
            <p>Ao tombar em batalha, perde-se apenas 5% do XP da barra atual e 10 ouros. <b>Seu nível nunca diminui!</b></p>
          </div>
        </div>
        <div class="guide-item">
          <span class="guide-badge">6 CLASSES</span>
          <div>
            <strong>Estilos Distintos</strong>
            <p>Guerreiro (equilíbrio e armadura), Arqueiro (ataque à distância), Assassino (críticos letais), Mago (dano arcano), Bárbaro (vida massiva) e Clérigo (cura amplificada).</p>
          </div>
        </div>
        <div class="guide-item">
          <span class="guide-badge">5 REGIÕES</span>
          <div>
            <strong>Mundo Aberto</strong>
            <p>Do Bosque das Ruínas (1–20) até o Trono do Eclipse (81–100). Derrote o chefe de cada região para desbloquear a seguinte.</p>
          </div>
        </div>
      </div>
    `
  }
]);

export class TutorialManager {
  constructor() {
    this.modal = null;
    this.activeTab = 0;
  }

  buildModal() {
    if (this.modal) return this.modal;
    this.modal = document.createElement('div');
    this.modal.className = 'account-overlay guide-overlay';
    this.modal.hidden = true;
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-labelledby', 'guideTitle');

    const navButtons = GUIDE_SECTIONS.map((sec, idx) => `
      <button type="button" class="guide-tab-btn ${idx === this.activeTab ? 'active' : ''}" data-idx="${idx}">
        <span>${sec.icon}</span> <b>${sec.title}</b>
      </button>
    `).join('');

    this.modal.innerHTML = `
      <div class="account-card guide-card">
        <button class="account-close" id="guideClose" type="button" aria-label="Fechar Guia">×</button>
        <p class="menu-kicker">GUERRA DAS CINZAS · GUIA DO AVENTUREIRO</p>
        <h2 id="guideTitle">Instruções da Jornada</h2>
        <div class="guide-tabs">${navButtons}</div>
        <div class="guide-content" id="guideContent">
          ${GUIDE_SECTIONS[this.activeTab].html}
        </div>
        <div class="guide-footer">
          <label class="guide-checkbox-label">
            <input type="checkbox" id="guideDontShow"> Não exibir automaticamente ao iniciar
          </label>
          <button class="menu-button menu-primary" id="guideDismiss" type="button">ENTENDIDO, VAMOS LÁ!</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    const closeBtn = this.modal.querySelector('#guideClose');
    const dismissBtn = this.modal.querySelector('#guideDismiss');
    const dontShow = this.modal.querySelector('#guideDontShow');
    const content = this.modal.querySelector('#guideContent');

    const close = () => {
      if (dontShow?.checked) {
        localStorage.setItem(STORAGE_KEY, 'true');
      }
      this.hide();
    };

    if (closeBtn) closeBtn.onclick = close;
    if (dismissBtn) dismissBtn.onclick = close;

    this.modal.querySelectorAll('.guide-tab-btn').forEach((btn) => {
      btn.onclick = () => {
        this.activeTab = Number(btn.dataset.idx);
        this.modal.querySelectorAll('.guide-tab-btn').forEach((b, i) => b.classList.toggle('active', i === this.activeTab));
        content.innerHTML = GUIDE_SECTIONS[this.activeTab].html;
      };
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) close();
    });

    return this.modal;
  }

  show(tabIndex = 0) {
    const el = this.buildModal();
    this.activeTab = tabIndex;
    el.querySelectorAll('.guide-tab-btn').forEach((b, i) => b.classList.toggle('active', i === this.activeTab));
    const content = el.querySelector('#guideContent');
    if (content) content.innerHTML = GUIDE_SECTIONS[this.activeTab].html;
    el.hidden = false;
  }

  hide() {
    if (this.modal) this.modal.hidden = true;
  }

  toggle() {
    if (!this.modal || this.modal.hidden) this.show(0);
    else this.hide();
  }

  maybeShowFirstTime() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTimeout(() => {
        this.show(0);
      }, 600);
    }
  }
}

export const tutorialManager = new TutorialManager();

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (e.key === 'h' || e.key === 'H' || e.key === 'F1') {
      e.preventDefault();
      tutorialManager.toggle();
    }
  });

  window.GameTutorial = {
    show: (idx) => tutorialManager.show(idx),
    hide: () => tutorialManager.hide(),
    toggle: () => tutorialManager.toggle(),
    maybeShowFirstTime: () => tutorialManager.maybeShowFirstTime()
  };
}
