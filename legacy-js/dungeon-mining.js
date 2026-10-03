(() => {
// ═══════════════════════════════════════════════════════════════
//  TERRA DAS CINZAS — Masmorras de Mineração
//  Minérios: Incomum · Raro · Épico · Lendário (0.002%) · Supremo (0.001%)
//  Baús de Ouro: Bronze · Prata · Ouro · Rubi · Lendário
// ═══════════════════════════════════════════════════════════════

const ORE_TYPES = [
  { id: 'cobre',       name: 'Minério de Cobre',        rarity: 'incomum',  color: '#b87333', chance: 0.45,    goldValue: 8,   icon: '🟤' },
  { id: 'ferro',       name: 'Minério de Ferro',         rarity: 'incomum',  color: '#9ca3af', chance: 0.30,    goldValue: 12,  icon: '⬜' },
  { id: 'basalto',     name: 'Basalto das Cinzas',       rarity: 'raro',     color: '#60a5fa', chance: 0.12,    goldValue: 40,  icon: '🔷' },
  { id: 'cristal_cinzas', name: 'Cristal das Cinzas',   rarity: 'raro',     color: '#67e8f9', chance: 0.08,    goldValue: 65,  icon: '💎' },
  { id: 'ferrum',      name: 'Ferrum Sombrio',           rarity: 'epico',    color: '#c084fc', chance: 0.035,   goldValue: 200, icon: '🟣' },
  { id: 'eclipse',     name: 'Veia do Eclipse',          rarity: 'epico',    color: '#a78bfa', chance: 0.020,   goldValue: 320, icon: '🌑' },
  { id: 'nucleo_vazio',name: 'Núcleo do Vazio',          rarity: 'lendario', color: '#fbbf24', chance: 0.00002, goldValue: 2500, icon: '⭐' },
  { id: 'cristal_vharok', name: 'Cristal de Vharok',    rarity: 'lendario', color: '#f59e0b', chance: 0.00002, goldValue: 3000, icon: '✨' },
  { id: 'essencia_primordial', name: 'Essência Primordial', rarity: 'supremo', color: '#f43f5e', chance: 0.00001, goldValue: 8000, icon: '🔮' }
];

const GOLD_CHESTS = [
  { id: 'bronze',   name: 'Baú de Bronze',   icon: '📦', color: '#b87333', goldMin: 50,    goldMax: 150,  chance: 0.50,   xpBonus: 0.02  },
  { id: 'prata',    name: 'Baú de Prata',    icon: '🪙', color: '#94a3b8', goldMin: 150,   goldMax: 400,  chance: 0.28,   xpBonus: 0.04  },
  { id: 'ouro',     name: 'Baú de Ouro',     icon: '💰', color: '#fbbf24', goldMin: 400,   goldMax: 900,  chance: 0.15,   xpBonus: 0.08  },
  { id: 'rubi',     name: 'Baú de Rubi',     icon: '💎', color: '#f43f5e', goldMin: 900,   goldMax: 2500, chance: 0.06,   xpBonus: 0.15  },
  { id: 'lendario', name: 'Baú Lendário',    icon: '👑', color: '#fbbf24', goldMin: 2500,  goldMax: 8000, chance: 0.01,   xpBonus: 0.30  }
];

const MINING_DUNGEONS = [
  {
    id: 'mv1', name: 'Mina das Ruínas',        sub: 'Filões esquecidos do bosque',
    minLvl: 5,  maxLvl: 25,  groupMode: 'solo',
    color: '#1a200e', icon: '⛏', floors: 3,
    ores: ['cobre', 'ferro', 'basalto'],
    chests: ['bronze', 'prata'],
    chestsPerFloor: 2, oreNodesPerFloor: 6
  },
  {
    id: 'mv2', name: 'Caverna Espectral',       sub: 'Cristais que sussurram no escuro',
    minLvl: 26, maxLvl: 55,  groupMode: 'solo',
    color: '#101828', icon: '💎', floors: 5,
    ores: ['ferro', 'basalto', 'cristal_cinzas'],
    chests: ['prata', 'ouro'],
    chestsPerFloor: 2, oreNodesPerFloor: 8
  },
  {
    id: 'mv3', name: 'Forja das Profundezas',   sub: 'Calor que atrai o épico',
    minLvl: 56, maxLvl: 100, groupMode: 'group', groupMin: 2,
    color: '#200c08', icon: '🔥', floors: 7,
    ores: ['basalto', 'cristal_cinzas', 'ferrum'],
    chests: ['ouro', 'rubi'],
    chestsPerFloor: 3, oreNodesPerFloor: 10
  },
  {
    id: 'mv4', name: 'Abismo dos Cristais',     sub: 'Onde o vazio se solidifica',
    minLvl: 101,maxLvl: 180, groupMode: 'group', groupMin: 2,
    color: '#0c0818', icon: '🌑', floors: 8,
    ores: ['ferrum', 'eclipse', 'nucleo_vazio'],
    chests: ['ouro', 'rubi', 'lendario'],
    chestsPerFloor: 3, oreNodesPerFloor: 12
  },
  {
    id: 'mv5', name: 'Núcleo da Cinza Eterna',  sub: 'O centro de tudo que restou',
    minLvl: 181,maxLvl: 260, groupMode: 'group', groupMin: 2,
    color: '#180808', icon: '⭐', floors: 10,
    ores: ['eclipse', 'nucleo_vazio', 'cristal_vharok'],
    chests: ['rubi', 'lendario'],
    chestsPerFloor: 4, oreNodesPerFloor: 14
  },
  {
    id: 'mv6', name: 'Veias da Essência',       sub: 'Apenas os supremos alcançam',
    minLvl: 261,maxLvl: 300, groupMode: 'both',
    color: '#0a0208', icon: '🔮', floors: 10,
    ores: ['nucleo_vazio', 'cristal_vharok', 'essencia_primordial'],
    chests: ['lendario'],
    chestsPerFloor: 5, oreNodesPerFloor: 16
  }
];

// ─── Roll ore drop ──────────────────────────────────────────────
function rollOre(dungeonId, playerLevel) {
  const dg = MINING_DUNGEONS.find(d => d.id === dungeonId);
  if (!dg) return null;
  const pool = ORE_TYPES.filter(o => dg.ores.includes(o.id));
  const r = Math.random();
  let cum = 0;
  for (const ore of pool) {
    cum += ore.chance;
    if (r < cum) return { ...ore };
  }
  return { ...pool[0] }; // fallback to first (common for this dungeon)
}

// ─── Roll chest drop ────────────────────────────────────────────
function rollChest(dungeonId) {
  const dg = MINING_DUNGEONS.find(d => d.id === dungeonId);
  if (!dg) return null;
  const pool = GOLD_CHESTS.filter(c => dg.chests.includes(c.id));
  const r = Math.random();
  let cum = 0;
  for (const chest of pool) {
    cum += chest.chance;
    if (r < cum) return {
      ...chest,
      gold: Math.floor(Math.random() * (chest.goldMax - chest.goldMin) + chest.goldMin)
    };
  }
  return { ...pool[0], gold: pool[0].goldMin };
}

window.MiningDungeons = { ORE_TYPES, GOLD_CHESTS, MINING_DUNGEONS, rollOre, rollChest };
})();