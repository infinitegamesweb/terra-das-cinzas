// src/systems/multiplayer/OnboardingManager.js
// Modal Dark Fantasy de Onboarding e Criação de Avatar / Nickname / Aura para Guerra das Cinzas

const STORAGE_KEY = 'guerra-cinzas-profile';
const LEGACY_KEY = 'tdc-mp-profile';

export const AURA_PALETTES = [
  { id: 'ember', name: 'Brasa Carmesim', hex: '#ef4444', desc: 'Fogo primordial forjado no calor das cinzas' },
  { id: 'gold', name: 'Ouro de Miraluz', hex: '#f59e0b', desc: 'Luz dourada sagrada dos paladinos da alvorada' },
  { id: 'emerald', name: 'Esmeralda dos Ermos', hex: '#10b981', desc: 'Vigor vital e cura das florestas sussurrantes' },
  { id: 'cyan', name: 'Gelo Celestial', hex: '#06b6d4', desc: 'Ar gélido e ventos rúnicos das montanhas' },
  { id: 'void', name: 'Vazio Espectral', hex: '#a855f7', desc: 'Mistérios arcanos e energia das sombras cósmicas' },
  { id: 'ash', name: 'Cinza Vulcânica', hex: '#94a3b8', desc: 'Poeira das batalhas antigas e sobriedade de ferro' }
];

const RANDOM_NAMES = [
  'Alden', 'Thorgar', 'Kaelen', 'Vaelor', 'Naeva',
  'Morwen', 'Bran', 'Elyon', 'Zephir', 'Corvus',
  'Valerius', 'Roric', 'Astrid', 'Nyx', 'Dorian',
  'Galahad', 'Elora', 'Soren', 'Vesper', 'Aurelius'
];

export class OnboardingManager {
  constructor() {
    this.overlay = null;
    this.resolvePromise = null;
    this.rejectPromise = null;
    this.selectedClassId = 'guerreiro';
    this.selectedNick = '';
    this.selectedAuraColor = '#f59e0b';

    if (typeof window !== 'undefined') {
      window.CinzasOnboarding = this;
    }
  }

  getSavedProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && typeof data.name === 'string' && data.name.trim().length >= 2) {
        return {
          name: data.name.trim().slice(0, 20),
          classId: data.classId || 'guerreiro',
          auraColor: data.auraColor || '#f59e0b'
        };
      }
    } catch (e) {
      console.warn('Erro ao carregar perfil salvo:', e);
    }
    return null;
  }

  saveProfile(name, classId, auraColor) {
    const profile = {
      name: name.trim().slice(0, 20),
      classId: classId || 'guerreiro',
      auraColor: auraColor || this.selectedAuraColor || '#f59e0b',
      updatedAt: Date.now()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      localStorage.setItem(LEGACY_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Erro ao salvar perfil no localStorage:', e);
    }
    if (typeof window !== 'undefined' && window._tdcPlayer) {
      window._tdcPlayer.name = profile.name;
      window._tdcPlayer.classId = profile.classId;
      window._tdcPlayer.auraColor = profile.auraColor;
    }
    if (typeof window !== 'undefined' && window.CinzasNet) {
      window.CinzasNet.updateProfile(profile.name, profile.classId, profile.auraColor);
    }
    if (typeof window !== 'undefined') {
      const hudPortrait = document.querySelector('#hudPortrait') || document.querySelector('.hud-portrait');
      if (hudPortrait && window.GameClasses?.get && window.GameClasses?.portrait) {
        const cls = window.GameClasses.get(profile.classId);
        if (cls) {
          hudPortrait.src = window.GameClasses.portrait(cls);
          hudPortrait.setAttribute('data-loaded-class', cls.id);
        }
      }
      const headerAvatar = document.querySelector('#headerAvatarImg');
      if (headerAvatar && window.GameClasses?.get && window.GameClasses?.portrait) {
        const cls = window.GameClasses.get(profile.classId);
        if (cls) headerAvatar.src = window.GameClasses.portrait(cls);
      }
      const heroClassName = document.querySelector('#heroClassName');
      if (heroClassName && window.GameClasses?.get) {
        const cls = window.GameClasses.get(profile.classId);
        if (cls) heroClassName.textContent = `${profile.name} · ${cls.name}`;
      }
    }
    return profile;
  }

  async ensureProfile(forceModal = false) {
    const existing = this.getSavedProfile();
    if (existing && !forceModal) {
      if (typeof window !== 'undefined' && window._tdcPlayer) {
        window._tdcPlayer.name = existing.name;
        if (existing.classId) window._tdcPlayer.classId = existing.classId;
        if (existing.auraColor) window._tdcPlayer.auraColor = existing.auraColor;
      }
      return existing;
    }

    return new Promise((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;
      this.openModal(existing);
    });
  }

  getRandomName() {
    const base = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const num = Math.floor(10 + Math.random() * 89);
    return `${base}_${num}`;
  }

  getClassesList() {
    if (typeof window !== 'undefined' && window.GameClasses?.all) {
      return window.GameClasses.all;
    }
    return [
      { id: 'guerreiro', name: 'Guerreiro', role: 'Combatente equilibrado', weapon: 'Espada', hp: 120 },
      { id: 'arqueiro', name: 'Arqueiro', role: 'Batedor da mata', weapon: 'Arco', hp: 108 },
      { id: 'mago', name: 'Mago', role: 'Tecelão de cinzas', weapon: 'Cajado', hp: 100 },
      { id: 'assasino', name: 'Assassino', role: 'Lâmina das sombras', weapon: 'Adagas', hp: 104 },
      { id: 'barbaro', name: 'Bárbaro', role: 'Quebra-escudos', weapon: 'Machado', hp: 145 },
      { id: 'clerigo', name: 'Clérigo', role: 'Guardião da brasa', weapon: 'Maça', hp: 130 }
    ];
  }

  getClassPortraitUrl(cls) {
    if (typeof window !== 'undefined' && window.GameClasses?.portrait) {
      try {
        return window.GameClasses.portrait(cls);
      } catch (_) {}
    }
    const paths = {
      guerreiro: 'assets/characters/guerreiro/Create_an_original_chibi-Idle/Idle/rotations/south.png',
      arqueiro: 'assets/characters/arqueiro/animations/walk/south/frame_000.png',
      mago: 'assets/characters/mago(a)/animations/walk/south/frame_000.png',
      assasino: 'assets/characters/assasino/animations/walk/south/frame_000.png',
      barbaro: 'assets/characters/barbaro/animations/walk/south/frame_000.png',
      clerigo: 'assets/characters/clerigo/animations/walk/south/frame_000.png'
    };
    return paths[cls.id] || paths.guerreiro;
  }

  openModal(initialProfile = null) {
    this.closeModal();

    const currentPlayer = typeof window !== 'undefined' ? window._tdcPlayer : null;
    this.selectedClassId = initialProfile?.classId || currentPlayer?.classId || 'guerreiro';
    this.selectedNick = initialProfile?.name || currentPlayer?.name || this.getRandomName();
    this.selectedAuraColor = initialProfile?.auraColor || currentPlayer?.auraColor || '#f59e0b';

    const overlay = document.createElement('div');
    overlay.className = 'cinzas-onboarding-overlay';
    overlay.innerHTML = `
      <div class="cinzas-onboarding-modal" role="dialog" aria-modal="true">
        <div class="cinzas-onboarding-header">
          <div class="cinzas-onboarding-badges">
            <span class="cinzas-onboarding-tag">GUERRA DAS CINZAS</span>
            <span class="cinzas-onboarding-tag sub">${initialProfile ? 'PERSONALIZAÇÃO' : 'PRIMEIRA CONEXÃO'}</span>
          </div>
          <h2 class="cinzas-onboarding-title">Criar Seu Avatar & Alcunha</h2>
          <p class="cinzas-onboarding-subtitle">
            Defina sua alcunha, vocação e o matiz da sua aura rúnica entre os errantes.
          </p>
        </div>

        <div class="cinzas-onboarding-body">
          <!-- Seção de Nickname -->
          <div class="cinzas-onboarding-section">
            <label class="cinzas-field-label" for="cinzas-nick-input">
              <span>Alcunha do Aventureiro (Nickname)</span>
              <span id="cinzas-nick-counter" class="cinzas-field-counter">${this.selectedNick.length} / 18</span>
            </label>
            <div class="cinzas-input-row">
              <input
                id="cinzas-nick-input"
                type="text"
                maxlength="18"
                class="cinzas-text-input"
                placeholder="Ex: Alden_Sombra, Valerius..."
                value="${this.selectedNick}"
                autocomplete="off"
                spellcheck="false"
              />
              <button id="cinzas-random-nick-btn" type="button" class="cinzas-dice-btn" title="Sortear nome aleatório">
                🎲 Sortear
              </button>
            </div>
            <div id="cinzas-nick-feedback" class="cinzas-field-feedback"></div>
          </div>

          <!-- Seção de Seleção de Classe / Avatar -->
          <div class="cinzas-onboarding-section">
            <label class="cinzas-field-label">
              <span>Escolha sua Vocação & Avatar Pixel Art</span>
            </label>
            <div class="cinzas-class-grid" id="cinzas-class-grid"></div>
          </div>

          <!-- Seção de Aura / Matiz Rúnico Cosmético -->
          <div class="cinzas-onboarding-section">
            <label class="cinzas-field-label">
              <span>Aura Rúnica & Matiz Cosmético</span>
              <span id="cinzas-aura-name" class="cinzas-field-counter" style="color: ${this.selectedAuraColor}; font-weight: 700;"></span>
            </label>
            <div class="cinzas-aura-grid" id="cinzas-aura-grid"></div>
          </div>

          <!-- Destaque da Classe e Aura Selecionadas -->
          <div class="cinzas-class-preview" id="cinzas-class-preview"></div>
        </div>

        <div class="cinzas-onboarding-footer">
          <button id="cinzas-onboarding-cancel" type="button" class="cinzas-btn-ghost">
            Voltar
          </button>
          <button id="cinzas-onboarding-confirm" type="button" class="cinzas-btn-gold">
            ⚔️ Confirmar & Entrar no Mundo
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlay = overlay;

    this.injectStyles();
    this.renderClassesGrid();
    this.renderAurasGrid();
    this.updatePreview();
    this.bindEvents();

    const input = overlay.querySelector('#cinzas-nick-input');
    if (input) {
      setTimeout(() => {
        input.focus();
        input.select();
      }, 100);
    }
  }

  injectStyles() {
    if (document.getElementById('cinzas-onboarding-styles')) return;
    const style = document.createElement('style');
    style.id = 'cinzas-onboarding-styles';
    style.textContent = `
      .cinzas-onboarding-overlay {
        position: fixed;
        inset: 0;
        z-index: 10000;
        background: rgba(5, 5, 8, 0.88);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: cinzasFadeIn 0.25s ease-out;
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      @keyframes cinzasFadeIn {
        from { opacity: 0; transform: scale(0.98); }
        to { opacity: 1; transform: scale(1); }
      }

      .cinzas-onboarding-modal {
        background: linear-gradient(175deg, #181520 0%, #0d0b12 100%);
        border: 1px solid rgba(245, 158, 11, 0.35);
        border-radius: 12px;
        width: 100%;
        max-width: 640px;
        max-height: 94vh;
        overflow-y: auto;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75), 0 0 30px rgba(245, 158, 11, 0.12);
        color: #f1f5f9;
        display: flex;
        flex-direction: column;
      }

      .cinzas-onboarding-header {
        padding: 20px 24px 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(0, 0, 0, 0.25);
      }

      .cinzas-onboarding-badges {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }

      .cinzas-onboarding-tag {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 4px;
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      .cinzas-onboarding-tag.sub {
        background: rgba(56, 189, 248, 0.12);
        color: #38bdf8;
        border-color: rgba(56, 189, 248, 0.3);
      }

      .cinzas-onboarding-title {
        margin: 0 0 6px;
        font-size: 22px;
        font-weight: 700;
        color: #f8fafc;
        letter-spacing: -0.01em;
      }

      .cinzas-onboarding-subtitle {
        margin: 0;
        font-size: 13px;
        color: #94a3b8;
        line-height: 1.45;
      }

      .cinzas-onboarding-body {
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .cinzas-onboarding-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .cinzas-field-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        font-weight: 700;
        color: #e2e8f0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .cinzas-field-counter {
        font-size: 11px;
        color: #64748b;
        font-weight: 600;
      }

      .cinzas-input-row {
        display: flex;
        gap: 8px;
      }

      .cinzas-text-input {
        flex: 1;
        background: rgba(10, 8, 15, 0.75);
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 6px;
        padding: 10px 14px;
        font-size: 15px;
        font-weight: 600;
        color: #f8fafc;
        outline: none;
        transition: all 0.2s;
      }

      .cinzas-text-input:focus {
        border-color: #f59e0b;
        box-shadow: 0 0 12px rgba(245, 158, 11, 0.3);
        background: rgba(15, 12, 22, 0.95);
      }

      .cinzas-dice-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 6px;
        color: #cbd5e1;
        font-size: 13px;
        font-weight: 600;
        padding: 0 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .cinzas-dice-btn:hover {
        background: rgba(245, 158, 11, 0.15);
        border-color: rgba(245, 158, 11, 0.4);
        color: #fbbf24;
      }

      .cinzas-field-feedback {
        font-size: 12px;
        min-height: 16px;
        color: #f87171;
      }

      .cinzas-class-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }

      @media (max-width: 520px) {
        .cinzas-class-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .cinzas-class-card {
        background: rgba(18, 15, 26, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        user-select: none;
      }

      .cinzas-class-card:hover {
        background: rgba(26, 21, 38, 0.85);
        border-color: rgba(245, 158, 11, 0.4);
        transform: translateY(-2px);
      }

      .cinzas-class-card.selected {
        background: linear-gradient(180deg, rgba(245, 158, 11, 0.16) 0%, rgba(26, 21, 38, 0.95) 100%);
        border-color: #f59e0b;
        box-shadow: 0 0 16px rgba(245, 158, 11, 0.35);
      }

      .cinzas-class-card.selected::after {
        content: '✓';
        position: absolute;
        top: 6px;
        right: 8px;
        font-size: 11px;
        font-weight: 800;
        color: #f59e0b;
      }

      .cinzas-class-avatar-box {
        width: 54px;
        height: 54px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 6px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        overflow: hidden;
      }

      .cinzas-class-avatar-img {
        width: 48px;
        height: 48px;
        object-fit: contain;
        image-rendering: pixelated;
        image-rendering: -moz-crisp-edges;
        image-rendering: crisp-edges;
        transition: transform 0.2s;
      }

      .cinzas-class-card:hover .cinzas-class-avatar-img {
        transform: scale(1.1);
      }

      .cinzas-class-card-name {
        font-size: 13px;
        font-weight: 700;
        color: #f8fafc;
        margin-bottom: 2px;
      }

      .cinzas-class-card-weapon {
        font-size: 11px;
        color: #94a3b8;
      }

      .cinzas-aura-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 8px;
      }

      @media (max-width: 520px) {
        .cinzas-aura-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      .cinzas-aura-btn {
        background: rgba(18, 15, 26, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 8px 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        user-select: none;
      }

      .cinzas-aura-btn:hover {
        transform: translateY(-2px);
        background: rgba(28, 23, 40, 0.95);
      }

      .cinzas-aura-btn.selected {
        border-color: #f59e0b;
        background: rgba(35, 28, 50, 0.95);
        box-shadow: 0 0 12px rgba(245, 158, 11, 0.35);
      }

      .cinzas-aura-btn.selected::after {
        content: '✓';
        position: absolute;
        top: 2px;
        right: 4px;
        font-size: 10px;
        font-weight: 800;
        color: #f59e0b;
      }

      .cinzas-aura-dot {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.3);
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .cinzas-aura-btn:hover .cinzas-aura-dot {
        transform: scale(1.15);
      }

      .cinzas-aura-name {
        font-size: 10px;
        font-weight: 700;
        color: #cbd5e1;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
      }

      .cinzas-class-preview {
        background: rgba(10, 8, 14, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 16px;
        transition: all 0.25s;
      }

      .cinzas-preview-left {
        width: 60px;
        height: 60px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.25s;
      }

      .cinzas-preview-avatar {
        width: 52px;
        height: 52px;
        object-fit: contain;
        image-rendering: pixelated;
      }

      .cinzas-preview-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .cinzas-preview-title {
        font-size: 14px;
        font-weight: 700;
        color: #fbbf24;
      }

      .cinzas-preview-desc {
        font-size: 12px;
        color: #cbd5e1;
        line-height: 1.4;
      }

      .cinzas-preview-meta {
        font-size: 11px;
        color: #94a3b8;
        display: flex;
        gap: 12px;
        margin-top: 2px;
      }

      .cinzas-onboarding-footer {
        padding: 14px 24px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      .cinzas-btn-ghost {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #94a3b8;
        border-radius: 6px;
        padding: 9px 18px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .cinzas-btn-ghost:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #f1f5f9;
      }

      .cinzas-btn-gold {
        background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
        border: 1px solid #fbbf24;
        color: #0b0906;
        border-radius: 6px;
        padding: 9px 22px;
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 0.02em;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
        transition: all 0.2s;
      }

      .cinzas-btn-gold:hover {
        background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
      }

      .cinzas-btn-gold:active {
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  }

  renderClassesGrid() {
    const grid = this.overlay?.querySelector('#cinzas-class-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const classes = this.getClassesList();
    for (const cls of classes) {
      const card = document.createElement('div');
      card.className = `cinzas-class-card ${cls.id === this.selectedClassId ? 'selected' : ''}`;
      card.dataset.classId = cls.id;

      const portraitUrl = this.getClassPortraitUrl(cls);
      card.innerHTML = `
        <div class="cinzas-class-avatar-box">
          <img src="${portraitUrl}" alt="${cls.name}" class="cinzas-class-avatar-img" />
        </div>
        <div class="cinzas-class-card-name">${cls.name}</div>
        <div class="cinzas-class-card-weapon">${cls.weapon || 'Arma'}</div>
      `;

      card.onclick = () => {
        this.selectedClassId = cls.id;
        grid.querySelectorAll('.cinzas-class-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.updatePreview();
      };

      grid.appendChild(card);
    }
  }

  renderAurasGrid() {
    const grid = this.overlay?.querySelector('#cinzas-aura-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const auraLabel = this.overlay?.querySelector('#cinzas-aura-name');

    for (const pal of AURA_PALETTES) {
      const isSelected = pal.hex.toLowerCase() === this.selectedAuraColor.toLowerCase();
      if (isSelected && auraLabel) {
        auraLabel.textContent = pal.name;
        auraLabel.style.color = pal.hex;
      }

      const btn = document.createElement('div');
      btn.className = `cinzas-aura-btn ${isSelected ? 'selected' : ''}`;
      btn.dataset.hex = pal.hex;
      btn.title = `${pal.name} · ${pal.desc}`;
      btn.innerHTML = `
        <div class="cinzas-aura-dot" style="background: ${pal.hex}; box-shadow: 0 0 10px ${pal.hex}88;"></div>
        <span class="cinzas-aura-name">${pal.name.split(' ')[0]}</span>
      `;

      btn.onclick = () => {
        this.selectedAuraColor = pal.hex;
        grid.querySelectorAll('.cinzas-aura-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        if (auraLabel) {
          auraLabel.textContent = pal.name;
          auraLabel.style.color = pal.hex;
        }
        this.updatePreview();
      };

      grid.appendChild(btn);
    }
  }

  updatePreview() {
    const preview = this.overlay?.querySelector('#cinzas-class-preview');
    if (!preview) return;

    const classes = this.getClassesList();
    const cls = classes.find(c => c.id === this.selectedClassId) || classes[0];
    const portraitUrl = this.getClassPortraitUrl(cls);
    const aura = AURA_PALETTES.find(a => a.hex.toLowerCase() === this.selectedAuraColor.toLowerCase()) || AURA_PALETTES[1];

    preview.innerHTML = `
      <div class="cinzas-preview-left" style="background: radial-gradient(circle, ${aura.hex}33 0%, rgba(0, 0, 0, 0.6) 80%); border: 1px solid ${aura.hex}77; box-shadow: 0 0 16px ${aura.hex}44;">
        <img src="${portraitUrl}" alt="${cls.name}" class="cinzas-preview-avatar" />
      </div>
      <div class="cinzas-preview-info">
        <div class="cinzas-preview-title">${cls.name} · ${cls.role || 'Vocação'}</div>
        <div class="cinzas-preview-desc">${cls.description || 'Guerreiro forjado nas cinzas da terra ancestral.'}</div>
        <div class="cinzas-preview-meta">
          <span>Arma: <strong>${cls.weapon || 'Espada'}</strong></span>
          <span>Aura: <strong style="color: ${aura.hex};">${aura.name}</strong></span>
        </div>
      </div>
    `;
  }

  validateNick(nick) {
    const trimmed = (nick || '').trim();
    if (trimmed.length < 2) {
      return 'O nome deve ter no mínimo 2 caracteres.';
    }
    if (trimmed.length > 18) {
      return 'O nome deve ter no máximo 18 caracteres.';
    }
    const valid = /^[a-zA-Z0-9_\- áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+$/i.test(trimmed);
    if (!valid) {
      return 'O nome contém caracteres inválidos. Use apenas letras, números ou _';
    }
    return null;
  }

  bindEvents() {
    const input = this.overlay?.querySelector('#cinzas-nick-input');
    const counter = this.overlay?.querySelector('#cinzas-nick-counter');
    const feedback = this.overlay?.querySelector('#cinzas-nick-feedback');
    const randomBtn = this.overlay?.querySelector('#cinzas-random-nick-btn');
    const confirmBtn = this.overlay?.querySelector('#cinzas-onboarding-confirm');
    const cancelBtn = this.overlay?.querySelector('#cinzas-onboarding-cancel');

    if (input) {
      input.oninput = () => {
        this.selectedNick = input.value;
        if (counter) counter.textContent = `${input.value.length} / 18`;
        if (feedback) feedback.textContent = '';
      };
      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.submit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.cancel();
        }
      };
    }

    if (randomBtn) {
      randomBtn.onclick = () => {
        const rand = this.getRandomName();
        this.selectedNick = rand;
        if (input) {
          input.value = rand;
          input.focus();
        }
        if (counter) counter.textContent = `${rand.length} / 18`;
        if (feedback) feedback.textContent = '';
      };
    }

    if (confirmBtn) {
      confirmBtn.onclick = () => this.submit();
    }

    if (cancelBtn) {
      cancelBtn.onclick = () => this.cancel();
    }
  }

  submit() {
    const error = this.validateNick(this.selectedNick);
    const feedback = this.overlay?.querySelector('#cinzas-nick-feedback');
    if (error) {
      if (feedback) feedback.textContent = error;
      const input = this.overlay?.querySelector('#cinzas-nick-input');
      input?.focus();
      return;
    }

    const profile = this.saveProfile(this.selectedNick, this.selectedClassId, this.selectedAuraColor);
    this.closeModal();

    if (this.resolvePromise) {
      this.resolvePromise(profile);
      this.resolvePromise = null;
      this.rejectPromise = null;
    }
  }

  cancel() {
    this.closeModal();
    if (this.rejectPromise) {
      this.rejectPromise(new Error('Criação de personagem cancelada.'));
      this.resolvePromise = null;
      this.rejectPromise = null;
    }
  }

  closeModal() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
  }
}

export const onboardingManager = new OnboardingManager();
