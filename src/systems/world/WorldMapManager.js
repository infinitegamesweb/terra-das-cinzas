// src/systems/world/WorldMapManager.js
  // ═══════════════════════════════════════════════════════════════
  //  TERRA DAS CINZAS — World Map Overlay  (tecla M)
  //  5 Modos · 30 Mapas · Nível 1–300
  // ═══════════════════════════════════════════════════════════════

  const MODES = [
    { id: 'normal',    label: 'Normal',   icon: '', color: '#4ade80', range: [1,   60],  tag: 'NORMAL'   },
    { id: 'dificil',   label: 'Difícil',  icon: '', color: '#60a5fa', range: [61,  140], tag: 'DIFÍCIL'  },
    { id: 'pesadelo',  label: 'Pesadelo', icon: '', color: '#a78bfa', range: [141, 200], tag: 'PESADELO' },
    { id: 'brasa',     label: 'Brasa',    icon: '', color: '#fb923c', range: [201, 260], tag: 'BRASA'    },
    { id: 'cinzas',    label: 'Cinzas',   icon: '', color: '#94a3b8', range: [261, 300], tag: 'CINZAS'   },
    { id: 'dungeons',  label: 'Dungeons', icon: '', color: '#f43f5e', range: [10,  300], tag: 'DUNGEONS', special: true },
    { id: 'mining',   label: 'Mineração', icon: '', color: '#78716c', range: [5, 300], tag: 'MINERAÇÃO', special: true }
  ];

  const WORLD_MAPS = [
    // ─── NORMAL (1–60) ──────────────────────────────────────────
    { id:  1, mode: 'normal',   name: 'Bosque das Ruínas',       sub: 'Ruínas de Miraluz',         min:  1,  max: 10,  enemy: 'Shade',             boss: 'Guardião da Raiz',      color: '#18351f', icon: '' },
    { id:  2, mode: 'normal',   name: 'Clareira dos Ecos',       sub: 'Fragmentos do primeiro dia',min: 11,  max: 20,  enemy: 'Espectro de Raiz',  boss: 'Eco da Raiz-Mãe',       color: '#1a3822', icon: '' },
    { id:  3, mode: 'normal',   name: 'Margem Afogada',          sub: 'Águas que sussurram',       min: 21,  max: 30,  enemy: 'Lobo Espectral',    boss: 'Alfa das Névoas',       color: '#183638', icon: '' },
    { id:  4, mode: 'normal',   name: 'Pântano Espectral',       sub: 'Brumas sem retorno',        min: 31,  max: 40,  enemy: 'Cobra do Vazio',    boss: 'Serpente Náufraga',     color: '#1a3c3a', icon: '' },
    { id:  5, mode: 'normal',   name: 'Trilha do Degelo',        sub: 'Neve e cinzas misturadas',  min: 41,  max: 50,  enemy: 'Golem de Pedra',    boss: 'Sentinela de Basalto',  color: '#2e2820', icon: '' },
    { id:  6, mode: 'normal',   name: 'Montanhas Rubras',        sub: 'Cinzas sob a neve',         min: 51,  max: 60,  enemy: 'Golem da Fornalha', boss: 'Colosso Rubrum',        color: '#3a2925', icon: '' },
    // ─── DIFÍCIL (61–140) ────────────────────────────────────────
    { id:  7, mode: 'dificil',  name: 'Portão Partido',          sub: 'Cidadela das Cinzas',       min: 61,  max: 75,  enemy: 'Escriturário Sombrio', boss: 'Arquivista das Cinzas', color: '#30253b', icon: '' },
    { id:  8, mode: 'dificil',  name: 'Torre das Brasas',        sub: 'O último farol',            min: 76,  max: 90,  enemy: 'Guardião Arcano',   boss: 'Vigília da Torre',      color: '#2c2038', icon: '' },
    { id:  9, mode: 'dificil',  name: 'Campos Crepusculares',    sub: 'O confronto eterno',        min: 91,  max: 100, enemy: 'Entidade do Eclipse', boss: 'Vharok (1ª Forma)',    color: '#29202c', icon: '' },
    { id: 10, mode: 'dificil',  name: 'Cavernas do Vazio',       sub: 'Sombras sem nome',          min: 101, max: 110, enemy: 'Larva do Abismo',   boss: 'Rainha das Larvas',     color: '#1a1520', icon: '' },
    { id: 11, mode: 'dificil',  name: 'Labirinto de Ferro',      sub: 'Engrenagens da ruína',      min: 111, max: 120, enemy: 'Autômato Ferrugento', boss: 'Núcleo Central',       color: '#201e24', icon: '' },
    { id: 12, mode: 'dificil',  name: 'Forjas Malditas',         sub: 'O calor que queima a alma', min: 121, max: 130, enemy: 'Demônio de Magma',  boss: 'Mestre das Forjas',     color: '#2a1810', icon: '' },
    { id: 13, mode: 'dificil',  name: 'Abismo Sombrio',          sub: 'Sem fundo nem retorno',     min: 131, max: 140, enemy: 'Corruptor Sombrio', boss: 'O Sem-Nome do Abismo',  color: '#160f1e', icon: '' },
    // ─── PESADELO (141–200) ──────────────────────────────────────
    { id: 14, mode: 'pesadelo', name: 'Cripta Eterna',           sub: 'Os mortos não descansam',   min: 141, max: 150, enemy: 'Lich Menor',        boss: 'Senhor das Criptas',    color: '#1c1030', icon: '' },
    { id: 15, mode: 'pesadelo', name: 'Floresta Amaldiçoada',    sub: 'Raízes que drenam vida',    min: 151, max: 160, enemy: 'Árvore Corrompida', boss: 'Espírito da Floresta',   color: '#0e1a10', icon: '' },
    { id: 16, mode: 'pesadelo', name: 'Torres do Esquecimento',  sub: 'Memórias apagadas',         min: 161, max: 170, enemy: 'Fantasma Ancião',   boss: 'O Esquecedor',          color: '#1a1428', icon: '' },
    { id: 17, mode: 'pesadelo', name: 'Mar de Cinzas',           sub: 'Um oceano de pó e sombra',  min: 171, max: 180, enemy: 'Golem de Cinzas',   boss: 'Leviatã das Cinzas',    color: '#201e20', icon: '' },
    { id: 18, mode: 'pesadelo', name: 'Núcleo do Vulcão',        sub: 'O coração que nunca esfria',min: 181, max: 190, enemy: 'Elemental de Fogo', boss: 'Coração do Vulcão',     color: '#2a1000', icon: '' },
    { id: 19, mode: 'pesadelo', name: 'Altar do Caos',           sub: 'Onde as leis se quebram',   min: 191, max: 200, enemy: 'Entidade do Caos',  boss: 'Arauto do Fim',         color: '#20101e', icon: '' },
    // ─── BRASA (201–260) ─────────────────────────────────────────
    { id: 20, mode: 'brasa',    name: 'Planalto Incandescente',  sub: 'A terra brilha de dentro',  min: 201, max: 215, enemy: 'Salamandra Rubra',  boss: 'Grande Salamandra',     color: '#2a1200', icon: '' },
    { id: 21, mode: 'brasa',    name: 'Rio de Magma',            sub: 'Correntes que não se cruzam',min: 216, max: 225, enemy: 'Elemental de Lava', boss: 'Senhor do Rio de Fogo', color: '#300e00', icon: '' },
    { id: 22, mode: 'brasa',    name: 'Cidade Fantasma',         sub: 'Construída sobre as brasas', min: 226, max: 235, enemy: 'Habitante Espectral', boss: 'Prefeito das Sombras', color: '#1e1418', icon: '' },
    { id: 23, mode: 'brasa',    name: 'Pico dos Condenados',     sub: 'Ninguém desce vivo',        min: 236, max: 245, enemy: 'Demônio Alado',     boss: 'Rei dos Condenados',    color: '#251020', icon: '' },
    { id: 24, mode: 'brasa',    name: 'Domínio de Vharok',       sub: 'O senhor do eclipse',       min: 246, max: 255, enemy: 'Servo de Vharok',   boss: 'Vharok (Forma Oculta)', color: '#1e0a24', icon: '' },
    { id: 25, mode: 'brasa',    name: 'Câmara do Primeiro Fogo', sub: 'Onde tudo começou',         min: 256, max: 260, enemy: 'Guardião Primordial', boss: 'O Primeiro Cinzeiro',  color: '#2a1408', icon: '' },
    // ─── CINZAS (261–300) ────────────────────────────────────────
    { id: 26, mode: 'cinzas',   name: 'Véu do Eclipse Final',    sub: 'Luz que não aquece',        min: 261, max: 270, enemy: 'Sombra do Eclipse', boss: 'Juiz do Véu',           color: '#181624', icon: '' },
    { id: 27, mode: 'cinzas',   name: 'Dimensão das Sombras',    sub: 'Além da percepção',         min: 271, max: 280, enemy: 'Entidade Sem Forma', boss: 'O Sem-Forma',           color: '#0e0e18', icon: '' },
    { id: 28, mode: 'cinzas',   name: 'Coração do Vazio',        sub: 'O silêncio absoluto',       min: 281, max: 290, enemy: 'Fragmento do Vazio', boss: 'Coração Pulsante',      color: '#0a0a10', icon: '' },
    { id: 29, mode: 'cinzas',   name: 'Terra das Cinzas Eternas',sub: 'O fim de tudo',             min: 291, max: 300, enemy: 'Vharok Eterno',     boss: 'Vharok, A Última Cinza', color: '#050508', icon: '' }
  ];

  // ─── DUNGEONS DATA ─────────────────────────────────────────────
  // groupMode: 'solo'=Nv10-40 | 'group'=Nv41-280 | 'both'=Nv281+
  const DUNGEONS = [
    { id: 'd1', name: 'Caverna do Iniciado', sub: 'As primeiras trevas',
      minLvl: 10, maxLvl: 20, groupMode: 'solo',
      boss: 'Guardião das Profundezas', key: 'Chave do Iniciado', color: '#1a2a1a', icon: '', floors: 5,
      drops: [
        { name: 'Espada de Ferro Forjado',    rarity: 'raro',     chance: 0.08    },
        { name: 'Anel do Neófito',            rarity: 'incomum',  chance: 0.20    },
        { name: 'Manto das Primeiras Cinzas', rarity: 'epico',    chance: 0.015   },
        { name: 'Cristal da Raiz Ancestral',  rarity: 'lendario', chance: 0.00002 },
        { name: 'Essência do Bosque Eterno',  rarity: 'supremo',  chance: 0.00001 }
      ]
    },
    { id: 'd2', name: 'Cripta das Sombras', sub: 'Os mortos guardam segredos',
      minLvl: 21, maxLvl: 40, groupMode: 'solo',
      boss: 'Négrim, Lich das Sombras', key: 'Chave da Cripta', color: '#1a1228', icon: '', floors: 7,
      drops: [
        { name: 'Adaga Espectral',            rarity: 'raro',     chance: 0.07    },
        { name: 'Amuleto das Sombras',        rarity: 'epico',    chance: 0.012   },
        { name: 'Lâmina da Água Morta',       rarity: 'lendario', chance: 0.00002 },
        { name: 'Coração do Pântano Eterno',  rarity: 'supremo',  chance: 0.00001 }
      ]
    },
    { id: 'd3', name: 'Fortaleza das Brumas', sub: 'Ninguém escapa da névoa',
      minLvl: 41, maxLvl: 60, groupMode: 'group', groupMin: 2,
      boss: 'Sentinela das Brumas', key: 'Chave da Fortaleza', color: '#2a1e10', icon: '', floors: 8,
      drops: [
        { name: 'Martelo de Basalto',         rarity: 'raro',     chance: 0.07    },
        { name: 'Peitoral de Pedra Vulcânica', rarity: 'epico',    chance: 0.012   },
        { name: 'Núcleo do Golem Primordial',  rarity: 'lendario', chance: 0.00002 },
        { name: 'Fragmento do Primeiro Golem',rarity: 'supremo',  chance: 0.00001 }
      ]
    },
    { id: 'd4', name: 'Torre dos Condenados', sub: 'A torre que toca o eclipse',
      minLvl: 61, maxLvl: 100, groupMode: 'group', groupMin: 2,
      boss: 'Arquivista das Cinzas', key: 'Glifo da Torre', color: '#28163c', icon: '', floors: 10,
      drops: [
        { name: 'Gládio do Arquivista',       rarity: 'epico',    chance: 0.012   },
        { name: 'Olho do Bibliophage',        rarity: 'lendario', chance: 0.00002 },
        { name: 'Palavra que Devora',         rarity: 'supremo',  chance: 0.00001 }
      ]
    },
    { id: 'd5', name: 'Abismo Espectral', sub: 'O abismo que devolve o olhar',
      minLvl: 101, maxLvl: 140, groupMode: 'group', groupMin: 2,
      boss: 'Rainha das Larvas do Vazio', key: 'Fragmento do Abismo', color: '#100818', icon: '', floors: 10,
      drops: [
        { name: 'Lança do Eclipse',           rarity: 'epico',    chance: 0.012   },
        { name: 'Anel de Vharok',             rarity: 'lendario', chance: 0.00002 },
        { name: 'Essência do Eclipse Eterno', rarity: 'supremo',  chance: 0.00001 }
      ]
    },
    { id: 'd6', name: 'Labirinto de Ferro', sub: 'Engrenagens que nunca param',
      minLvl: 141, maxLvl: 180, groupMode: 'group', groupMin: 2,
      boss: 'Núcleo Central Corrompido', key: 'Chave-Máquina', color: '#1a1c20', icon: '️', floors: 10,
      drops: [
        { name: 'Machado do Abismo',          rarity: 'epico',    chance: 0.012   },
        { name: 'Núcleo do Sem-Nome',         rarity: 'lendario', chance: 0.00002 },
        { name: 'Sombra Cristalizada',        rarity: 'supremo',  chance: 0.00001 }
      ]
    },
    { id: 'd7', name: 'Forjas do Infernão', sub: 'O calor forja o impossível',
      minLvl: 181, maxLvl: 220, groupMode: 'group', groupMin: 2,
      boss: 'Mestre das Forjas Eternas', key: 'Brasa-Chave', color: '#280e00', icon: '', floors: 10,
      drops: [
        { name: 'Cajado do Caos',             rarity: 'epico',    chance: 0.012   },
        { name: 'Alma Petrificada',           rarity: 'lendario', chance: 0.00002 },
        { name: 'Fragmento do Caos',          rarity: 'supremo',  chance: 0.00001 }
      ]
    },
    { id: 'd8', name: 'Catedral Maldita', sub: 'Bênção corrompida por sombras',
      minLvl: 221, maxLvl: 280, groupMode: 'group', groupMin: 2,
      boss: 'Prelado das Cinzas', key: 'Selo Máldito', color: '#1e0a20', icon: '', floors: 10,
      drops: [
        { name: 'Espada do Primeiro Fogo',    rarity: 'epico',    chance: 0.012   },
        { name: 'Anel da Grande Salamandra',  rarity: 'lendario', chance: 0.00002 },
        { name: 'Essência do Primeiro Fogo',  rarity: 'supremo',  chance: 0.00001 }
      ]
    },
    { id: 'd9', name: 'Domínio do Eclipse Final', sub: 'O fim começa aqui',
      minLvl: 281, maxLvl: 295, groupMode: 'both',
      boss: 'Vharok — Forma Oculta', key: 'Cristal do Eclipse', color: '#140a22', icon: '', floors: 10,
      drops: [
        { name: 'Lâmina das Cinzas Eternas',  rarity: 'lendario', chance: 0.00002 },
        { name: 'Vharok Supremo — Núcleo',   rarity: 'supremo',  chance: 0.00001 }
      ]
    },
    { id: 'd10', name: 'Câmara da Última Cinza', sub: 'Onde tudo termina e começa',
      minLvl: 296, maxLvl: 300, groupMode: 'both',
      boss: 'Vharok, A Última Cinza', key: 'Chave do Fim', color: '#080508', icon: '', floors: 10,
      drops: [
        { name: 'Coroa das Cinzas Eternas',   rarity: 'lendario', chance: 0.00002 },
        { name: 'Essência da Última Cinza',   rarity: 'supremo',  chance: 0.00001 }
      ]
    }
  ];


  // ─── Estado ────────────────────────────────────────────────────
  let activeMode = 'normal';
  let overlay = null;
  let visible = false;

  const RARITY_META = {
    incomum:  { label: 'Incomum',  color: '#4ade80' },
    raro:     { label: 'Raro',     color: '#60a5fa' },
    epico:    { label: 'Épico',    color: '#c084fc' },
    lendario: { label: 'Lendário', color: '#fbbf24' },
    supremo:  { label: 'Supremo',  color: '#f43f5e' }
  };
  function fmtChance(c) {
    const pct = c * 100;
    if (pct >= 1)    return pct.toFixed(1) + '%';
    if (pct >= 0.01) return pct.toFixed(3) + '%';
    return pct.toFixed(5).replace(/\.?0+$/, '') + '%';
  }
  function getDgStatus(d, lvl) {
    if (lvl < d.minLvl) return 'locked';
    if (lvl > d.maxLvl) return 'cleared';
    return 'available';
  }
  function getGroupLabel(d) {
    if (d.groupMode === 'solo') return { icon: '', text: 'Solo (Nv. 10–40)',         color: '#4ade80' };
    if (d.groupMode === 'both') return { icon: '', text: 'Solo ou Grupo (Nv. 281+)',   color: '#fbbf24' };
    return                             { icon: '', text: 'Grupo 2+ obrigatório',   color: '#60a5fa' };
  }

  // ─── Helpers ───────────────────────────────────────────────────
  function getModeProgress(playerLevel) {
    return MODES.map(m => {
      const maps = WORLD_MAPS.filter(w => w.mode === m.id);
      const unlocked = maps.filter(w => playerLevel >= w.min).length;
      return { ...m, maps, unlocked, total: maps.length };
    });
  }

  function getMapStatus(map, playerLevel) {
    if (playerLevel < map.min) return 'locked';
    if (window._wmIsMapCleared?.(map.id)) return 'cleared';
    return 'available';
  }

  function getDifficultyMode(playerLevel) {
    if (playerLevel >= 261) return 'cinzas';
    if (playerLevel >= 201) return 'brasa';
    if (playerLevel >= 141) return 'pesadelo';
    if (playerLevel >= 61)  return 'dificil';
    return 'normal';
  }

  // ─── Render ────────────────────────────────────────────────────
  function render(playerLevel) {
    const modesData = getModeProgress(playerLevel);
    const currentMode = modesData.find(m => m.id === activeMode);
    const playerModeId = getDifficultyMode(playerLevel);

    const modeTabs = modesData.map(m => {
      const isCurrent = m.id === activeMode;
      const isPlayerMode = m.id === playerModeId;
      const isLocked = playerLevel < m.range[0];
      return `
        <button class="wm-tab ${isCurrent ? 'active' : ''} ${isLocked ? 'locked' : ''}"
                data-wm-mode="${m.id}" ${isLocked ? 'disabled' : ''} title="Nv. ${m.range[0]}–${m.range[1]}">
          <span class="wm-tab-icon">${m.icon}</span>
          <span class="wm-tab-label">${m.label}</span>
          <span class="wm-tab-range">Nv. ${m.range[0]}–${m.range[1]}</span>
          ${isPlayerMode ? '<span class="wm-tab-you">▶ VOCÊ</span>' : ''}
          ${isLocked ? '<span class="wm-lock-badge"></span>' : `<span class="wm-tab-prog">${m.unlocked}/${m.total}</span>`}
        </button>`;
    }).join('');

    const mapCards = currentMode.maps.map(map => {
      const status = getMapStatus(map, playerLevel);
      const isLocked = status === 'locked';
      const isCleared = status === 'cleared';
      const isCurrent = window._wmGetCurrentMapId
        ? window._wmGetCurrentMapId() === map.id
        : playerLevel >= map.min && playerLevel <= map.max;
      const isPlayable = window._wmCanNavigateTo ? window._wmCanNavigateTo(map.id) : true;
      const gateReason = window._wmGateReason ? window._wmGateReason(map.id) : '';
      return `
        <article class="wm-card ${isLocked ? 'wm-locked' : ''} ${isCleared ? 'wm-cleared' : ''} ${isCurrent ? 'wm-current' : ''} ${!isPlayable ? 'wm-unavailable' : ''}"
                 style="--map-color: ${map.color}" data-wm-map="${map.id}" ${isLocked ? 'data-locked' : ''}>
          <div class="wm-card-header">
            <span class="wm-card-icon">${map.icon}</span>
            <div class="wm-card-titles">
              <b class="wm-card-name">${map.name}</b>
              <small class="wm-card-sub">${map.sub}</small>
            </div>
            <div class="wm-card-badge ${status}">
              ${isLocked ? ` Nv. ${map.min}` : !isPlayable ? ' Em produção' : gateReason ? ' Chefe pendente' : isCleared ? ' Concluído' : isCurrent ? '▶ Aqui' : ' Disponível'}
            </div>
          </div>
          <div class="wm-card-body">
            <div class="wm-card-row">
              <span class="wm-card-stat"> ${map.enemy}</span>
              <span class="wm-card-range">Nv. ${map.min}–${map.max}</span>
            </div>
            <div class="wm-card-row">
              <span class="wm-card-boss"> ${map.boss}</span>
            </div>
            ${isLocked
              ? `<div class="wm-lock-info">Requer nível <b>${map.min}</b> · faltam <b>${map.min - playerLevel}</b> níveis</div>`
              : !isPlayable
                ? '<div class="wm-lock-info">Esta região ainda não está conectada ao mundo jogável.</div>'
                : gateReason
                  ? `<div class="wm-lock-info">${gateReason}</div>`
              : isCurrent
                ? `<button class="wm-btn-enter" data-wm-goto="${map.id}">▶ EXPLORAR</button>`
                : isCleared
                  ? `<button class="wm-btn-revisit" data-wm-goto="${map.id}">↺ REVISITAR</button>`
                  : `<button class="wm-btn-enter available" data-wm-goto="${map.id}">▶ ENTRAR</button>`
            }
          </div>
        </article>`;
    }).join('');

    const currentId = window._wmGetCurrentMapId?.();
    const currentMap = WORLD_MAPS.find((map) => map.id === currentId)
      || WORLD_MAPS.find(m => playerLevel >= m.min && playerLevel <= m.max);
    const headerInfo = currentMap
      ? `<span class="wm-header-loc">${currentMap.icon} ${currentMap.name} · Nv. ${currentMap.min}–${currentMap.max}</span>`
      : `<span class="wm-header-loc">Nível ${playerLevel}</span>`;

    overlay.querySelector('.wm-tabs').innerHTML = modeTabs;
    if (activeMode === 'dungeons' || activeMode === 'mining') {
      overlay.querySelector('.wm-grid').innerHTML = activeMode === 'mining' ? renderMiningTab(playerLevel) : renderDungeonTab(playerLevel);
    } else {
      overlay.querySelector('.wm-grid').innerHTML = mapCards;
    }
    overlay.querySelector('.wm-header-right').innerHTML = `
      <span class="wm-level-badge"> Nível ${playerLevel}</span>
      ${headerInfo}
      <button class="wm-close-btn" id="wmClose" title="Fechar (M ou Esc)"></button>`;

    bindEvents();
  }


  function renderDungeonTab(playerLevel) {
    const ri = playerLevel < 10
      ? { icon: '', text: 'Nível 10 mínimo para dungeons', color: '#6b7280' }
      : playerLevel <= 40
      ? { icon: '', text: 'Nv. 10–40 · Solo permitido', color: '#4ade80' }
      : playerLevel <= 280
      ? { icon: '', text: 'Nv. 41–280 · Grupo de 2+ obrigatório', color: '#60a5fa' }
      : { icon: '', text: 'Nv. 281+ · Solo ou Grupo liberado', color: '#fbbf24' };
    const banner = `<div class="wm-dg-banner" style="border-color:${ri.color}22;background:${ri.color}0a">
      <span class="wm-dg-banner-icon">${ri.icon}</span>
      <div class="wm-dg-banner-text">
        <b style="color:${ri.color}">${ri.text}</b>
        <span>Solo (10–40) · Grupo 2+ (41–280) · Livre (281–300)</span>
      </div>
    </div>`;

    const cards = DUNGEONS.map(d => {
      const status = getDgStatus(d, playerLevel);
      const isLocked   = status === 'locked';
      const isCleared  = status === 'cleared';
      const isCurrent  = status === 'available';
      const gl = getGroupLabel(d);
      const topDrops = d.drops.filter(dr => ['lendario','supremo','epico'].includes(dr.rarity));
      const dropHTML = topDrops.slice(0, 4).map(dr => {
        const m = RARITY_META[dr.rarity] || {};
        return `<div class="wm-drop-row"><span class="wm-rarity-dot" style="background:${m.color}"></span><span style="color:${m.color};font-size:10px">${m.label}</span><span class="wm-drop-name">${dr.name}</span><small>${fmtChance(dr.chance)}</small></div>`;
      }).join('') || `<div class="wm-drop-row"><small style="color:#5a5040">Itens comuns e incomuns</small></div>`;

      return `<article class="wm-card wm-dg-card ${isLocked?'wm-locked':''} ${isCleared?'wm-cleared':''} ${isCurrent?'wm-current':''}" style="--map-color:${d.color}">
        <div class="wm-card-header">
          <span class="wm-card-icon">${d.icon}</span>
          <div class="wm-card-titles">
            <b class="wm-card-name">${d.name}</b>
            <small class="wm-card-sub">${d.sub}</small>
          </div>
          <div class="wm-card-badge ${status}">${isLocked?' Nv.'+d.minLvl:isCleared?' Concluído':'▶ Disponível'}</div>
        </div>
        <div class="wm-dg-body">
          <div class="wm-dg-stats">
            <span class="wm-dg-group-tag" style="color:${gl.color}">${gl.icon} ${gl.text}</span>
            <span class="wm-card-range">Nv. ${d.minLvl}–${d.maxLvl}</span>
          </div>
          <div class="wm-dg-stats">
            <span style="color:#e87070;font-size:11px"> ${d.boss}</span>
            <span style="color:#7a6848;font-size:10px"> ${d.key} · ${d.floors} andares</span>
          </div>
          <div class="wm-drop-table">${dropHTML}</div>
          ${isLocked
            ? `<div class="wm-lock-info">Requer nível <b>${d.minLvl}</b> · faltam <b>${d.minLvl - playerLevel}</b> níveis</div>`
            : `<button class="wm-btn-enter ${isCurrent?'available':''}">${d.groupMode==='group'?' ':''}${isCleared?'↺ REVISITAR':'▶ ENTRAR'}</button>`
          }
        </div>
      </article>`;
    }).join('');

    return banner + `<div class="wm-dg-grid">${cards}</div>`;
  }

  function bindEvents() {
    overlay.querySelectorAll('[data-wm-mode]').forEach(btn => {
      btn.onclick = () => {
        activeMode = btn.dataset.wmMode;
        const playerLevel = window._wmGetPlayerLevel ? window._wmGetPlayerLevel() : 1;
        render(playerLevel);
      };
    });
    overlay.querySelectorAll('[data-wm-goto]').forEach(btn => {
      btn.onclick = () => {
        const mapId = parseInt(btn.dataset.wmGoto);
        if (window._wmNavigateTo) window._wmNavigateTo(mapId);
        hide();
      };
    });
    const closeBtn = overlay.querySelector('#wmClose');
    if (closeBtn) closeBtn.onclick = hide;
  }

  // ─── Show / Hide ───────────────────────────────────────────────
  function show(playerLevel) {
    if (!overlay) build();
    visible = true;
    activeMode = getDifficultyMode(playerLevel);
    render(playerLevel);
    overlay.removeAttribute('hidden');
    overlay.classList.add('wm-entering');
    setTimeout(() => overlay.classList.remove('wm-entering'), 300);
  }

  function hide() {
    if (!overlay) return;
    visible = false;
    overlay.classList.add('wm-leaving');
    setTimeout(() => {
      overlay.setAttribute('hidden', '');
      overlay.classList.remove('wm-leaving');
    }, 200);
  }

  function toggle(playerLevel) {
    if (visible) hide(); else show(playerLevel);
  }

  // ─── Build DOM ─────────────────────────────────────────────────
  function build() {
    overlay = document.createElement('div');
    overlay.id = 'worldMapOverlay';
    overlay.className = 'wm-overlay';
    overlay.setAttribute('hidden', '');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Mapa do Mundo');
    overlay.innerHTML = `
      <div class="wm-panel">
        <header class="wm-header">
          <div class="wm-header-left">
            <span class="wm-header-title"> MAPA DO MUNDO</span>
            <kbd class="wm-key-hint">M</kbd>
          </div>
          <div class="wm-header-right"></div>
        </header>
        <nav class="wm-tabs" role="tablist" aria-label="Modos de dificuldade"></nav>
        <div class="wm-body">
          <div class="wm-grid" role="list"></div>
        </div>
      </div>
      <div class="wm-backdrop"></div>`;
    overlay.querySelector('.wm-backdrop').onclick = hide;
    document.getElementById('app').appendChild(overlay);
  }

  // ─── Exports ───────────────────────────────────────────────────

  function renderMiningTab(playerLevel) {
    if (!window.MiningDungeons) return '<div style="color:#5a4040;padding:20px;text-align:center">Sistema de Mineração carregando...</div>';
    const { MINING_DUNGEONS, ORE_TYPES, GOLD_CHESTS } = window.MiningDungeons;
    const rarityColor = { incomum:'#4ade80', raro:'#60a5fa', epico:'#c084fc', lendario:'#fbbf24', supremo:'#f43f5e' };
    const rarityLabel = { incomum:'Incomum', raro:'Raro', epico:'Épico', lendario:'Lendário (0.002%)', supremo:'Supremo (0.001%)' };
    const banner = '<div class="wm-dg-banner" style="border-color:#78716c22;background:#78716c0a">'
      + '<span class="wm-dg-banner-icon"></span>'
      + '<div class="wm-dg-banner-text"><b style="color:#d6d3d1">Masmorras de Mineração</b>'
      + '<span>Mine minérios raros, épicos, lendários e colete baús de ouro</span></div></div>';

    const cards = MINING_DUNGEONS.map(d => {
      const isLocked  = playerLevel < d.minLvl;
      const isCleared = playerLevel > d.maxLvl;
      const isCurrent = !isLocked && !isCleared;
      const gl = d.groupMode === 'solo' ? { icon: '', text: 'Solo', color: '#4ade80' }
               : d.groupMode === 'both' ? { icon: '', text: 'Solo ou Grupo', color: '#fbbf24' }
               : { icon: '', text: 'Grupo 2+', color: '#60a5fa' };

      const oreHTML = d.ores.map(oid => {
        const ore = ORE_TYPES.find(o => o.id === oid);
        if (!ore) return '';
        const rc = rarityColor[ore.rarity] || '#9ca3af';
        return '<span class="wm-ore-chip" style="border-color:' + rc + '44;color:' + rc + '">' + ore.icon + ' ' + ore.name + '</span>';
      }).join('');

      const chestHTML = d.chests.map(cid => {
        const ch = GOLD_CHESTS.find(c => c.id === cid);
        if (!ch) return '';
        return '<span class="wm-ore-chip" style="border-color:' + ch.color + '44;color:' + ch.color + '">' + ch.icon + ' ' + ch.name + ' (' + ch.goldMin + '-' + ch.goldMax + 'G)</span>';
      }).join('');

      let html = '<article class="wm-card wm-dg-card ' + (isLocked?'wm-locked':'') + ' ' + (isCleared?'wm-cleared':'') + ' ' + (isCurrent?'wm-current':'') + '" style="--map-color:' + d.color + '">';
      html += '<div class="wm-card-header">';
      html += '<span class="wm-card-icon">' + d.icon + '</span>';
      html += '<div class="wm-card-titles"><b class="wm-card-name">' + d.name + '</b><small class="wm-card-sub">' + d.sub + '</small></div>';
      html += '<div class="wm-card-badge ' + (isLocked?'locked':isCleared?'cleared':'available') + '">' + (isLocked?' Nv.'+d.minLvl:isCleared?' Concluído':'▶ Disponível') + '</div>';
      html += '</div>';
      html += '<div class="wm-dg-body">';
      html += '<div class="wm-dg-stats"><span style="color:' + gl.color + ';font-size:11px">' + gl.icon + ' ' + gl.text + '</span><span class="wm-card-range">Nv. ' + d.minLvl + '–' + d.maxLvl + '</span></div>';
      html += '<div style="font-size:10px;color:#7a6848;margin-bottom:2px"> ' + d.oreNodesPerFloor + ' veios/andar ·  ' + d.floors + ' andares</div>';
      html += '<div class="wm-mine-ores">' + oreHTML + '</div>';
      html += '<div style="font-size:10px;color:#7a6848;margin-top:4px">Baús por andar: ' + d.chestsPerFloor + '</div>';
      html += '<div class="wm-mine-ores">' + chestHTML + '</div>';
      if (isLocked) {
        html += '<div class="wm-lock-info">Requer nível <b>' + d.minLvl + '</b> · faltam <b>' + (d.minLvl - playerLevel) + '</b></div>';
      } else {
        html += '<button class="wm-btn-enter ' + (isCurrent?'available':'') + '">' + (isCleared?'↺ REVISITAR':' ENTRAR') + '</button>';
      }
      html += '</div></article>';
      return html;
    }).join('');

    return banner + '<div class="wm-dg-grid">' + cards + '</div>';
  }

  window.WorldMap = { show, hide, toggle, WORLD_MAPS, MODES, DUNGEONS, getMapStatus };


export const worldMap = window.WorldMap;
