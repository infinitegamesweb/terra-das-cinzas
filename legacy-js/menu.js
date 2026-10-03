(() => {
  const SAVE_KEY = 'terra-das-cinzas-save-v1';

  function initMenu({ onContinue, onNewGame, autoStart = false }) {
    const root = document.querySelector('#mainMenu');
    const home = document.querySelector('#menuHome');
    const subview = document.querySelector('#menuSubview');
    const continueButton = document.querySelector('#menuContinue');
    const hasSave = () => !!localStorage.getItem(SAVE_KEY);

    if (autoStart) {
      root.hidden = true;
    }

    function showHome() {
      subview.hidden = true;
      subview.innerHTML = '';
      home.hidden = false;
    }

    function showInfo(title, body) {
      home.hidden = true;
      subview.hidden = false;
      subview.innerHTML = `<p class="menu-kicker">${title}</p><div class="menu-info">${body}</div><button class="menu-button menu-back" id="menuBack">VOLTAR</button>`;
      document.querySelector('#menuBack').onclick = showHome;
    }

    function showClassSelection() {
      home.hidden = true;
      subview.hidden = false;
      let selected = window.GameClasses.get('guerreiro');
      const cards = window.GameClasses.all.map((entry) => `
        <button type="button" class="class-choice ${entry.id === selected.id ? 'selected' : ''}" data-class="${entry.id}">
          <span class="class-choice-portrait"><img src="${window.GameClasses.portrait(entry)}" alt=""></span>
          <span class="class-choice-copy"><b>${entry.name}</b><small>${entry.role}</small><i>${entry.description}</i></span>
          <span class="class-choice-mark">${entry.icon}</span>
        </button>`).join('');
      subview.innerHTML = `<p class="menu-kicker">ESCOLHA SUA CLASSE</p><p class="class-select-note">Cada classe tem atributos e estilo próprios. A escolha define esta jornada.</p><div class="menu-class-grid">${cards}</div><button class="menu-button menu-primary class-start" id="classStart">INICIAR COMO GUERREIRO</button><button class="menu-button menu-back" id="classBack">VOLTAR</button>`;

      const start = document.querySelector('#classStart');
      subview.querySelectorAll('[data-class]').forEach((button) => {
        button.onclick = () => {
          selected = window.GameClasses.get(button.dataset.class);
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

    continueButton.textContent = hasSave() ? 'CONTINUAR JORNADA' : 'ESCOLHER CLASSE';
    continueButton.onclick = () => {
      if (!hasSave()) return showClassSelection();
      root.hidden = true;
      onContinue();
    };
    document.querySelector('#menuNew').onclick = showClassSelection;
    document.querySelector('#menuGuide')?.addEventListener('click', () => window.GameTutorial?.show());
    document.querySelector('#menuOptions').onclick = () => showInfo('OPÇÕES', '<p><b>W A S D</b> ou setas — mover</p><p><b>Clique</b> — mover e interagir</p><p><b>E</b> — recolher itens</p><p><b>1–4</b> — usar habilidades</p>');
    document.querySelector('#menuCredits').onclick = () => showInfo('CRÉDITOS', '<p><b>TERRA DAS CINZAS</b></p><p>Uma aventura independente nas ruínas de Miraluz.</p>');
    document.addEventListener('keydown', (event) => {
      if (root.hidden) return;
      if (event.key === 'Enter' && subview.hidden) {
        event.preventDefault();
        continueButton.click();
      } else if (event.key === 'Escape' && !subview.hidden) showHome();
    });
  }

  window.GameMenu = { initMenu };
})();
