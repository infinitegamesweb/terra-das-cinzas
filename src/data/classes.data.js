// src/data/classes.data.js
// Definições e balanceamento das 6 classes jogáveis de Terra das Cinzas

export const GAME_CLASSES = Object.freeze([
  {
    id: 'guerreiro',
    name: 'Guerreiro',
    role: 'Combatente equilibrado',
    description: 'Equilíbrio entre resistência e dano corpo a corpo.',
    icon: '',
    hp: 120,
    hpPerLevel: 14,
    melee: 1,
    arcane: 1,
    armor: 2,
    healing: 1,
    critChance: 0.06,
    critMultiplier: 1.5,
    weapon: 'Espada',
    weaponIcon: '',
    walkRoot: 'assets/characters/guerreiro',
    idleRoot: 'assets/characters/guerreiro/Create_an_original_chibi-Idle/Idle',
    actionRoot: 'assets/characters/guerreiro/Create_an_original_chibi-Idle/Idle/animations',
    nativeWalkRoot: 'assets/characters/guerreiro/Create_an_original_chibi-Idle/Idle/animations/Walking',
    skill2: { name: 'Corte de Guarda', desc: 'Golpe concentrado que interrompe inimigos próximos.' },
    skill5: { id: 'vortice_aco', name: 'Vórtice de Aço', key: 'Q / 5', icon: '', iconImg: 'assets/icons/skills/Icon25.png', cd: 8, desc: 'Gira desferindo cortes devastadores em 360° em todos os inimigos com sangramento.', type: 'aoe' },
    skill6: { id: 'furia_tita', name: 'Fúria do Titã', key: 'R / 6', icon: '', iconImg: 'assets/icons/skills/Icon20.png', cd: 24, desc: 'SUPREMA: Onda de choque sísmica com fissuras, tamanho aumentado e imunidade a dano por 6s.', type: 'ultimate' }
  },
  {
    id: 'arqueiro',
    name: 'Arqueiro',
    role: 'Batedor da mata',
    description: 'Ataques físicos à distância e boa mobilidade.',
    icon: '',
    hp: 108,
    hpPerLevel: 12,
    melee: 1.08,
    arcane: 1.08,
    armor: 1,
    healing: 1,
    critChance: 0.12,
    critMultiplier: 1.55,
    range: 140,
    weapon: 'Arco',
    weaponIcon: '',
    walkRoot: 'assets/characters/arqueiro',
    idleRoot: null,
    skill2: { name: 'Disparo Perfurante', desc: 'Flecha rápida que perfura alvos próximos.' },
    skill5: { id: 'chuva_flechas', name: 'Chuva de Flechas', key: 'Q / 5', icon: '', iconImg: 'assets/icons/skills/Icon16.png', cd: 8, desc: 'Dispara uma saraivada massiva para o alto que cai em área perfurando múltiplos inimigos.', type: 'aoe' },
    skill6: { id: 'flecha_dragao', name: 'Flecha do Dragão Astral', key: 'R / 6', icon: '', iconImg: 'assets/icons/skills/Icon46.png', cd: 22, desc: 'SUPREMA: Dispara um dragão espectral celestial em linha reta que perfura com 100% de crítico.', type: 'ultimate' }
  },
  {
    id: 'assasino',
    name: 'Assassino',
    role: 'Lâmina das sombras',
    description: 'Dano físico elevado e chance de golpe crítico.',
    icon: '',
    hp: 104,
    hpPerLevel: 11,
    melee: 1.2,
    arcane: 0.9,
    armor: 0,
    healing: 1,
    critChance: 0.18,
    critMultiplier: 1.7,
    weapon: 'Adagas',
    weaponIcon: '',
    walkRoot: 'assets/characters/assasino',
    idleRoot: null,
    skill2: { name: 'Lâmina Sombria', desc: 'Corte veloz que marca vários inimigos com energia das sombras.' },
    skill5: { id: 'danca_sombras', name: 'Dança das Sombras', key: 'Q / 5', icon: '', iconImg: 'assets/icons/skills/Icon5.png', cd: 7, desc: 'Passo espectral cortando em zigue-zague os inimigos próximos com dano crítico.', type: 'aoe' },
    skill6: { id: 'execucao_fantasma', name: 'Execução Fantasma', key: 'R / 6', icon: '', iconImg: 'assets/icons/skills/Icon6.png', cd: 20, desc: 'SUPREMA: Desfere 5 cortes imperceptíveis nos pontos vitais do alvo com dano puro brutal.', type: 'ultimate' }
  },
  {
    id: 'barbaro',
    name: 'Bárbaro',
    role: 'Quebra-escudos',
    description: 'Grande vitalidade e golpes pesados.',
    icon: '',
    hp: 145,
    hpPerLevel: 18,
    melee: 1.12,
    arcane: 0.8,
    armor: 2,
    healing: 1,
    critChance: 0.08,
    critMultiplier: 1.6,
    weapon: 'Machado',
    weaponIcon: '',
    walkRoot: 'assets/characters/barbaro',
    idleRoot: null,
    skill2: { name: 'Golpe Demolidor', desc: 'Golpe pesado que empurra inimigos em alcance curto.' },
    skill5: { id: 'fenda_sismica', name: 'Fenda Sísmica', key: 'Q / 5', icon: '', iconImg: 'assets/icons/skills/Icon27.png', cd: 9, desc: 'Golpeia o chão partindo o solo em cone, atordoando e lançando inimigos pelos ares.', type: 'aoe' },
    skill6: { id: 'ira_implacavel', name: 'Ira Implacável', key: 'R / 6', icon: '', iconImg: 'assets/icons/skills/Icon10.png', cd: 25, desc: 'SUPREMA: Fúria berserker cega com roubo de vida massivo e velocidade de ataque dobrada.', type: 'ultimate' }
  },
  {
    id: 'clerigo',
    name: 'Clérigo',
    role: 'Guardião da brasa',
    description: 'Resistência e poder arcano para sustentar a jornada.',
    icon: '',
    hp: 130,
    hpPerLevel: 15,
    melee: 0.9,
    arcane: 1.12,
    armor: 1,
    healing: 1.35,
    critChance: 0.05,
    critMultiplier: 1.5,
    weapon: 'Maça',
    weaponIcon: '',
    walkRoot: 'assets/characters/clerigo',
    idleRoot: null,
    skill2: { name: 'Selo Radiante', desc: 'Marca inimigos próximos com energia sagrada.' },
    skill5: { id: 'julgamento_sagrado', name: 'Julgamento Sagrado', key: 'Q / 5', icon: '', iconImg: 'assets/icons/skills/Icon31.png', cd: 9, desc: 'Invoca um pilar de luz celeste que purifica os monstros e regenera a vida do herói.', type: 'aoe' },
    skill6: { id: 'avatar_luz', name: 'Avatar da Luz Divina', key: 'R / 6', icon: '', iconImg: 'assets/icons/skills/Icon49.png', cd: 26, desc: 'SUPREMA: Manifesta asas angélicas celestiais, cura instantânea máxima e barreira sagrada inviolável.', type: 'ultimate' }
  },
  {
    id: 'mago',
    name: 'Mago',
    role: 'Tecelão de cinzas',
    description: 'Poder arcano elevado, mas pouca defesa física.',
    icon: '',
    hp: 100,
    hpPerLevel: 10,
    melee: 0.78,
    arcane: 1.45,
    armor: 0,
    healing: 1,
    critChance: 0.08,
    critMultiplier: 1.55,
    weapon: 'Cajado',
    weaponIcon: '',
    walkRoot: 'assets/characters/mago(a)',
    idleRoot: null,
    skill2: { name: 'Raio Arcano', desc: 'Corrente de energia que atinge vários alvos.' },
    skill5: { id: 'chuva_meteoros', name: 'Tempestade de Meteoros', key: 'Q / 5', icon: '', iconImg: 'assets/icons/skills/Icon45.png', cd: 9, desc: 'Faz chover meteoros ardentes na área de combate, incendiando o solo com dano arcano e fogo.', type: 'aoe' },
    skill6: { id: 'supernova_vazio', name: 'Supernova do Vazio', key: 'R / 6', icon: '', iconImg: 'assets/icons/skills/Icon38.png', cd: 24, desc: 'SUPREMA: Vórtice gravitacional que suga todos os inimigos para o núcleo e explode com dano cósmico devastador.', type: 'ultimate' }
  }
]);

export const GAME_CLASSES_BY_ID = Object.freeze(
  Object.fromEntries(GAME_CLASSES.map((entry) => [entry.id, entry]))
);

export function getClassById(id) {
  return GAME_CLASSES_BY_ID[id] || GAME_CLASSES_BY_ID.guerreiro;
}

export function getClassPortrait(entry) {
  return entry.idleRoot
    ? `${entry.idleRoot}/rotations/south.png`
    : `${entry.walkRoot}/animations/walk/south/frame_000.png`;
}

if (typeof window !== 'undefined') {
  window.GameClasses = {
    all: GAME_CLASSES,
    get: getClassById,
    portrait: getClassPortrait
  };
}

