// src/systems/ui/MenuManager.js
// Gerenciador do Menu Principal e Seleção de Classes

import { GAME_CLASSES, getClassById, getClassPortrait } from '../../data/classes.data.js';
import { tutorialManager } from './TutorialManager.js';

const SAVE_KEY = 'terra-das-cinzas-save-v1';

export class MenuManager {
  initMenu({ onContinue, onNewGame, autoStart = false }) {
    const root = document.querySelector('#mainMenu');
    const home = document.querySelector('#menuHome');
    const subview = document.querySelector('#menuSubview');
    const continueButton = document.querySelector('#menuContinue');
    const hasSave = () => !!localStorage.getItem(SAVE_KEY);

    if (autoStart && root) {
      root.hidden = true;
    }

    function showHome() {
      if (subview) {
        subview.hidden = true;
        subview.innerHTML = '';
      }
      if (home) home.hidden = false;
    }

    function showInfo(title, body) {
      if (!home || !subview) return;
      home.hidden = true;
      subview.hidden = false;
      subview.innerHTML = `<p class="menu-kicker">${title}</p><div class="menu-info">${body}</div><button class="menu-button menu-back" id="menuBack">VOLTAR</button>`;
      document.querySelector('#menuBack').onclick = showHome;
    }

    function showClassSelection() {
      if (!home || !subview) return;
      home.hidden = true;
      subview.hidden = false;
      let selected = getClassById('guerreiro');
      const cards = GAME_CLASSES.map((entry) => `
        <button type="button" class="class-choice ${entry.id === selected.id ? 'selected' : ''}" data-class="${entry.id}">
          <span class="class-choice-portrait"><img src="${getClassPortrait(entry)}" alt=""></span>
          <span class="class-choice-copy"><b>${entry.name}</b><small>${entry.role}</small><i>${entry.description}</i></span>
          <span class="class-choice-mark">${entry.icon}</span>
        </button>`).join('');
      subview.innerHTML = `<p class="menu-kicker">ESCOLHA SUA CLASSE</p><p class="class-select-note">Cada classe tem atributos e estilo próprios. A escolha define esta jornada.</p><div class="menu-class-grid">${cards}</div><button class="menu-button menu-primary class-start" id="classStart">INICIAR COMO GUERREIRO</button><button class="menu-button menu-back" id="classBack">VOLTAR</button>`;

      const start = document.querySelector('#classStart');
      subview.querySelectorAll('[data-class]').forEach((button) => {
        button.onclick = () => {
          selected = getClassById(button.dataset.class);
          subview.querySelectorAll('[data-class]').forEach((card) => card.classList.toggle('selected', card === button));
          start.textContent = `INICIAR COMO ${selected.name.toLocaleUpperCase('pt-BR')}`;
        };
      });
      start.onclick = () => {
        if (hasSave() && !confirm('Começar uma nova jornada como ' + selected.name + '? O salvamento atual será apagado.')) return;
        start.disabled = true;
        start.textContent = 'INICIANDO...';
        root.hidden = true;
        onNewGame(selected.id);
      };
      document.querySelector('#classBack').onclick = showHome;
    }

    if (continueButton) {
      continueButton.textContent = hasSave() ? 'CONTINUAR JORNADA' : 'ESCOLHER CLASSE';
      continueButton.onclick = () => {
        if (!hasSave()) return showClassSelection();
        root.hidden = true;
        onContinue();
      };
    }
    document.querySelector('#menuNew')?.addEventListener('click', showClassSelection);
    document.querySelector('#menuGuide')?.addEventListener('click', () => tutorialManager.show());
    document.querySelector('#menuOptions')?.addEventListener('click', () => showInfo('OPÇÕES', '<p><b>W A S D</b> ou setas — mover</p><p><b>Clique</b> — mover e interagir</p><p><b>E</b> — recolher itens</p><p><b>1–4</b> — usar habilidades</p>'));
    document.querySelector('#menuCredits')?.addEventListener('click', () => showInfo('CRÉDITOS', '<p><b>GUERRA DAS CINZAS</b></p><p>Uma aventura independente nas ruínas de Miraluz.</p>'));
    
    document.addEventListener('keydown', (event) => {
      if (!root || root.hidden) return;
      if (event.key === 'Enter' && subview?.hidden) {
        event.preventDefault();
        continueButton?.click();
      } else if (event.key === 'Escape' && !subview?.hidden) showHome();
    });
  }
}

export const menuManager = new MenuManager();

if (typeof window !== 'undefined') {
  window.GameMenu = {
    initMenu: (opts) => menuManager.initMenu(opts)
  };
}
