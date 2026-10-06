// src/game.js
// Ponto de Entrada Modular de Terra das Cinzas

import { GAME_CLASSES, getClassById, getClassPortrait } from './data/classes.data.js';
import { RARITY, DUNGEON_ITEMS } from './data/drops.data.js';
import { ORE_TYPES, GOLD_CHESTS, MINING_DUNGEONS } from './data/mining.data.js';
import { DUNGEON_CRAFTPIX_DATA } from './data/craftpix.data.js';
import worldMapLayouts from './data/worldMapLayouts.json';

import { soundSystem } from './systems/audio/SoundSystem.js';
import { authManager } from './systems/auth/AuthManager.js';
import { dropManager } from './systems/drops/DropManager.js';
import { miningManager } from './systems/mining/MiningManager.js';
import { terraSpriteAnimations } from './systems/animation/BossAnimation.js';
import { gameProgression } from './systems/progression/ProgressionManager.js';
import { tutorialManager } from './systems/ui/TutorialManager.js';
import { menuManager } from './systems/ui/MenuManager.js';
import { uiManager, renderUI } from './systems/ui/UIManager.js';
import { inventoryUI } from './systems/ui/InventoryUI.js';
import { channelManager } from './systems/multiplayer/ChannelManager.js';
import { cinzasNet } from './systems/multiplayer/CinzasNet.js';
import { dungeonTrackerUI } from './systems/world/DungeonTrackerUI.js';
import { chatUI } from './systems/multiplayer/ChatUI.js';
import { playerListUI } from './systems/multiplayer/PlayerListUI.js';
import { partyManager } from './systems/multiplayer/PartyManager.js';
import { tradeManager } from './systems/multiplayer/TradeManager.js';
import { onboardingManager } from './systems/multiplayer/OnboardingManager.js';
import { questManager } from './systems/quests/QuestManager.js';
import { questUI } from './systems/quests/QuestUI.js';
import { createHeroSprites, faceDirection, drawHero, slashVFXSprites } from './entities/Player.js';
import { getRegionThumbnail } from './data/regionThumbnails.js';

import './systems/world/WorldManager.js';
import './systems/world/WorldMapManager.js';
import './systems/talents/TalentManager.js';
import './systems/inventory/InventoryManager.js';
import './systems/castle/CastleHubManager.js';
import './systems/marketplace/MarketManager.js';

(async () => {
  const progression = gameProgression;
  const terrain = window.GameWorld;
  const audio = soundSystem;
const c = document.querySelector('#game');
  const g = c.getContext('2d');
  const radarCanvas = document.querySelector('#radar');
  const radarCtx = radarCanvas ? radarCanvas.getContext('2d') : null;
  const world = document.querySelector('#world');
  const $ = (q) => document.querySelector(q);

  const W = { w: 1900 * 6, h: 1450 * 5 };
  const ZONE_W = 1900;
  const ZONE_H = 1450;
  const MAX_POTIONS = 9;
  const key = new Set();
  const R = (a, b) => a + Math.random() * (b - a);
  const C = (v, a, b) => Math.max(a, Math.min(b, v));
  const MOB_DIRECTIONS = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'];
  function directionFromVector(dx, dy) {
    const sector = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
    return MOB_DIRECTIONS[sector];
  }

  let cam = { x: 0, y: 0 };
  let last = 0;
  let resettingSave = false;
  let autoStart = false;
  try {
    autoStart = !!sessionStorage.getItem('terra-das-cinzas-auto-start');
    sessionStorage.removeItem('terra-das-cinzas-auto-start');
  } catch (e) {}
  let menuOpen = !autoStart;
  let autoPlay = false;
  let goal = null;
  let enemy = null;
  let object = null;
  let selectedPlayer = null;
  window._tdcSelectedTarget = () => ({ enemy, object, selectedPlayer });
  window._tdcMobs = () => mobs;
  let toast = 0;
  let kills = 0;
  let ore = 0;
  let loot = 0;
  let claimed = false;
  let guildJoined = false;
  let savedRegionId = 0;
  let regionStates = {};
  let questStates = {};
  let bossDefeats = {};
  let legacyMapSave = false;
  let regionNpcRewards = {};
  let route = [];
  let autoTarget = null;
  let dungeonMode = false;
  let dungeonSession = null;
  let dungeonReturn = null;
  let dungeonProgress = {};
  let dungeonMissions = {};
  let dungeonInventory = [];
  let dungeonMaterials = {};
  let codexKills = {};
  let codexMilestones = {};
  let pendingOffline = null;
  let hazardZones = [];
  let screenShake = 0;
  const DUNGEON_FLOORS = 10;
  const NEW_CLASS_KEY = 'terra-das-cinzas-new-class';
  let requestedClass = 'guerreiro';
  try {
    requestedClass = sessionStorage.getItem(NEW_CLASS_KEY) || requestedClass;
    sessionStorage.removeItem(NEW_CLASS_KEY);
  } catch (e) {}
  const initialClass = window.GameClasses.get(requestedClass);

  const CASTLE_HUB = window.GameCastleHub?.CASTLE_REGION || {
    id: 0,
    name: 'Castelo em Cinzas',
    subtitle: 'Refúgio Ancestral dos Errantes (Zona Segura)',
    col: 1,
    row: 2,
    min: 1,
    max: 300,
    unlocks: 1,
    safeZone: true,
    bg: '#141118',
    path: '#3d3647',
    tree: '#231d2b',
    accent: '#f59e0b',
    enemy: null,
    hp: 0,
    sp: 0,
    ambientColor: '#fcd34d',
    bossName: null,
    bossSprite: null,
    dungeonName: 'Masmorras do Castelo',
    npcName: 'Oráculo Kaelen',
    points: [
      ['Pátio Central da Forja', 960, 750],
      ['Portal das Masmorras', 960, 420],
      ['Bazar dos Mercadores', 640, 750],
      ['Salão das Missões', 1280, 750],
      ['Mercado de Jogadores', 780, 860]
    ]
  };

  const INITIAL_FOREST =
    { id: 1, name: 'Bosque das Ruínas', subtitle: 'Ruínas de Miraluz', col: 0, row: 0, min: 1, max: 10, unlocks: 1, bg: '#18351f', path: '#a69b75', tree: '#42763a', accent: '#d4a234', enemy: 'shade', hp: 78, sp: 74, ambientColor: '#facc15', bossName: 'Guardião da Raiz Cinzenta', bossSprite: 'boss_ashroot_guardian', dungeonName: 'Catacumbas de Miraluz', dungeonBossFive: 'Lorde de Magma Ignis (Colosso de Obsidiana)', dungeonBossTen: 'Raiz-Mãe do Subsolo', npcName: 'Vigia Maerin', points: [['Margens de Miraluz', 340, 350], ['Bosque Velado', 1510, 350], ['Clareira dos Ecos', 340, 1080], ['Ruínas Afundadas', 1510, 1080], ['Selo da Raiz', 960, 1260]] };

  const MAP_REGIONS = (window.WorldMap?.WORLD_MAPS || [])
    .filter((map) => map.id > 1)
    .map((map) => {
      const layout = worldMapLayouts[String(map.id)];
      if (!layout) return null;
      const palette = layout.palette;
      const hp = Math.round(110 + map.min * 4.2);
      const sp = Math.round(30 + map.min * 0.72);
      const points = layout.areas.map((area) => [area.name, area.x, area.y]);
      return {
        id: map.id,
        name: map.name,
        subtitle: map.sub,
        col: layout.col,
        row: layout.row,
        min: map.min,
        max: map.max,
        unlocks: map.min,
        bg: palette.bg,
        path: palette.path,
        tree: palette.tree,
        accent: palette.accent,
        ambientColor: palette.ambientColor,
        enemy: layout.enemySprite,
        enemyName: map.enemy,
        hp,
        sp,
        bossName: map.boss,
        bossSprite: layout.bossSprite,
        dungeonName: `Masmorras de ${map.name}`,
        dungeonBossFive: map.boss,
        dungeonBossTen: `Guardião Ancestral de ${map.name}`,
        npcName: layout.npcName,
        points,
        areas: layout.areas,
        biome: layout.biome,
        generatedMap: true
      };
    })
    .filter(Boolean);

  const REGIONS = [
    CASTLE_HUB,
    INITIAL_FOREST,
    ...MAP_REGIONS
  ];

  const WORLD_MAP_LAYOUT_VERSION = 5;
  const REGIONAL_LANDMARKS = {
    1: [
      { x: 555, y: 1005, kind: 'ruined_statue', s: 1.15 },
      { x: 1450, y: 1000, kind: 'cave_dungeon_entrance', s: 1.1 },
      { x: 880, y: 520, kind: 'stone_archway_ruin_1', s: 1.2 },
      { x: 1120, y: 560, kind: 'ruin_pillar', s: 1.1 },
      { x: 740, y: 880, kind: 'ruin_campfire_cold', s: 1.0 },
      { x: 1320, y: 780, kind: 'ruin_chest', s: 1.0 },
      { x: 420, y: 640, kind: 'tree_oak_giant', s: 1.25 }
    ],
    2: [
      { x: 560, y: 1000, kind: 'stone_stairs', s: 1.15 },
      { x: 1450, y: 995, kind: 'cave_dungeon_entrance', s: 1.1 },
      { x: 960, y: 520, kind: 'swamp_mossy_log', s: 1.25 },
      { x: 260, y: 390, kind: 'mangrove_water_roots_3', s: 1.2 },
      { x: 1610, y: 330, kind: 'water_lotus_bloom_double', s: 1.25 },
      { x: 420, y: 1110, kind: 'swamp_mud_mound', s: 1.15 },
      { x: 1390, y: 1110, kind: 'cattail_water_cluster', s: 1.2 }
    ],
    3: [
      { x: 590, y: 470, kind: 'stone_stairs', s: 1.1 },
      { x: 1450, y: 985, kind: 'cave_dungeon_entrance', s: 1.1 },
      { x: 1050, y: 1110, kind: 'arcane_brazier', s: 1.1 }
    ],
    4: [
      { x: 555, y: 1000, kind: 'ruined_statue', s: 1.2 },
      { x: 1450, y: 990, kind: 'stone_gargoyle', s: 1.15 }
    ],
    5: [
      { x: 555, y: 1000, kind: 'stone_gargoyle', s: 1.2 },
      { x: 1450, y: 990, kind: 'cave_dungeon_entrance', s: 1.1 },
      { x: 1050, y: 1110, kind: 'arcane_brazier', s: 1.1 }
    ]
  };

  const REGIONAL_GUIDES = {
    1: { id: 'herbalist_mira', name: 'Mira, Erveira', title: 'Ervas para a estrada', sprite: 'shop_maeve', color: '#77d78a', x: 720, y: 790, reward: '2 poções de cura', kind: 'potions' },
    2: { id: 'fisher_tomas', name: 'Tomas, Barqueiro', title: 'Remédios das águas mortas', sprite: 'marsh_ferryman', color: '#67d9d2', x: 700, y: 820, reward: 'cura e 1 poção', kind: 'heal' },
    3: { id: 'miner_vedra', name: 'Vedra, Mineradora', title: 'Achado da pedreira', sprite: 'forge_ignis', color: '#f2a06d', x: 730, y: 830, reward: 'ouro e cristais', kind: 'ore' },
    4: { id: 'scribe_lyra', name: 'Lyra, Copista', title: 'Fragmento de arquivo', sprite: 'lore_ether', color: '#c99af0', x: 690, y: 830, reward: 'cristais e experiência', kind: 'lore' },
    5: { id: 'scout_sera', name: 'Sera, Batedora', title: 'Último suprimento', sprite: 'sentinel_lyanna', color: '#f2c96d', x: 700, y: 830, reward: 'fragmento de brasa', kind: 'ember' },
    6: { id: 'alchemist_kael', name: 'Kael, Alquimista', title: 'Destilados das Cinzas', sprite: 'lore_ether', color: '#a78bfa', x: 710, y: 810, reward: 'cristais e experiência', kind: 'lore' },
    7: { id: 'smith_bram', name: 'Bram, Armeiro', title: 'Lâminas Reforçadas', sprite: 'forge_ignis', color: '#fb923c', x: 720, y: 820, reward: 'ouro e minério', kind: 'ore' },
    8: { id: 'hunter_dane', name: 'Dane, Rastreador', title: 'Suprimentos da Caçada', sprite: 'marsh_ferryman', color: '#4ade80', x: 700, y: 800, reward: '2 poções de caça', kind: 'potions' },
    9: { id: 'mystic_selene', name: 'Selene, Mística', title: 'Bênção Noturna', sprite: 'shop_maeve', color: '#38bdf8', x: 710, y: 820, reward: 'cura e 1 poção', kind: 'heal' },
    10: { id: 'sentinel_varon', name: 'Varon, Vigia do Abismo', title: 'Última Trincheira', sprite: 'sentinel_lyanna', color: '#fbbf24', x: 730, y: 810, reward: 'fragmento de brasa', kind: 'ember' }
  };

  function regionAreas(regionData) {
    return regionData.points.map(([name, x, y], index) => {
      if (index === 4) return { name, min: regionData.max, max: regionData.max, x, y, boss: true };
      const combatSpan = Math.max(1, regionData.max - regionData.min);
      const min = regionData.min + Math.floor(combatSpan * index / 4);
      const max = Math.min(regionData.max - 1, Math.max(min, regionData.min + Math.floor(combatSpan * (index + 1) / 4) - 1));
      return { name, min, max, x, y, boss: false };
    });
  }
  REGIONS.forEach((r) => {
    if (!Array.isArray(r.areas)) r.areas = regionAreas(r);
  });

  let regionIndex = 0;
  let region = REGIONS[regionIndex];

  const p = {
    classId: initialClass.id,
    x: 2860,
    y: 3650,
    hp: initialClass.hp,
    max: initialClass.hp,
    xp: 0,
    need: progression.xpNeeded(1) || 250,
    lvl: 1,
    gold: 0,
    crystal: 0,
    emberShards: 0,
    talentPoints: 0,
    talents: [],
    potions: 3,
    en: 100,
    face: 1,
    dir: 'south',
    moving: false,
    walk: 0,
    shield: 0,
    swordEquipped: true,
    weaponTier: 0,
    shieldEquipped: true,
    cd: [0, 0, 0, 0, 0, 0, 0],
    dashTrail: []
  };

  const pet = {
    name: 'Corvo das Cinzas',
    x: p.x - 30,
    y: p.y - 35,
    state: 'idle',
    targetDrop: null
  };

  function syncPetToPlayer() {
    pet.x = p.x - 30;
    pet.y = p.y - 35;
    pet.targetDrop = null;
  }

  const mobs = [];
  const nodes = [];
  const drops = [];
  const chests = [];
  const parts = [];
  const combatEffects = [];
  const floatingTexts = [];
  const lightningArcs = [];
  const arrowShots = [];
  const ambientParticles = [];
  const lightSources = [];
  const trees = [];
  const decor = [];

  const SAVE_KEY = 'terra-das-cinzas-save-v1';
  let legacyBossProgress = {};
  if (window.GameAuth?.bootstrap) {
    try { await window.GameAuth.bootstrap(SAVE_KEY); } catch (e) { console.warn(e); }
  }
  try {
    const s = autoStart ? null : JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (s) {
      Object.assign(p, s.player || {});
      legacyMapSave = Number(s.worldMapLayoutVersion || 0) < WORLD_MAP_LAYOUT_VERSION;
      kills = s.kills || 0;
      ore = s.ore || 0;
      loot = s.loot || 0;
      claimed = !!s.claimed;
      guildJoined = !!s.guildJoined;
      savedRegionId = Number(s.regionId) || 0;
      regionStates = s.regions && typeof s.regions === 'object' ? s.regions : {};
      questStates = s.quests && typeof s.quests === 'object' ? s.quests : {};
      bossDefeats = s.bossDefeats && typeof s.bossDefeats === 'object' ? s.bossDefeats : {};
      regionNpcRewards = s.regionNpcRewards && typeof s.regionNpcRewards === 'object' ? s.regionNpcRewards : {};
      if (legacyMapSave) {
        // Region IDs 2–5 used to describe different maps. Keep core character
        // progress, but discard map-local state that cannot be safely migrated.
        legacyBossProgress = { ...bossDefeats };
        savedRegionId = 0;
        regionStates = {};
        questStates = {};
        regionNpcRewards = {};
        bossDefeats = {};
      }
      dungeonProgress = s.dungeonProgress && typeof s.dungeonProgress === 'object' ? s.dungeonProgress : {};
      dungeonMissions = s.dungeonMissions && typeof s.dungeonMissions === 'object' ? s.dungeonMissions : {};
      dungeonInventory = Array.isArray(s.dungeonInventory) ? s.dungeonInventory : [];
      dungeonMaterials = s.dungeonMaterials && typeof s.dungeonMaterials === 'object' ? s.dungeonMaterials : {};
      codexKills = s.codexKills && typeof s.codexKills === 'object' ? s.codexKills : {};
      codexMilestones = s.codexMilestones && typeof s.codexMilestones === 'object' ? s.codexMilestones : {};
      const minutesAway = Math.min(360, Math.max(0, Math.floor((Date.now() - (Number(s.savedAt) || Date.now())) / 60000)));
      const offlineKills = Math.floor((minutesAway / 60) * 8 * 0.45);
      if (offlineKills > 0) pendingOffline = { minutes: minutesAway, kills: offlineKills };
    }
  } catch (e) {}

  p.classId = window.GameClasses.get(p.classId).id;

  function regionForLevel(level) {
    const candidate = REGIONS.find((entry) => entry.id > 0 && level >= entry.min && level <= entry.max);
    const index = candidate ? REGIONS.indexOf(candidate) : -1;
    return index < 0 ? 0 : index;
  }

  p.lvl = C(Math.floor(Number(p.lvl) || 1), 1, 300);
  if (legacyMapSave) {
    // Preserve only map milestones represented by cleared legacy bosses.
    const legacyMilestones = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 };
    Object.entries(legacyMilestones).forEach(([oldId, oldMax]) => {
      if (!legacyBossProgress[oldId]) return;
      (window.WorldMap?.WORLD_MAPS || []).filter((map) => map.max <= oldMax && map.max <= p.lvl)
        .forEach((map) => { bossDefeats[map.id] = true; });
    });
  }
  const isRegionUnlocked = (id) => {
    const candidate = REGIONS.find((entry) => entry.id === id);
    if (!candidate || p.lvl < candidate.unlocks) return false;
    if (id <= 1) return true;
    const previous = REGIONS.find((entry) => entry.id === id - 1);
    return !previous?.bossName || Boolean(bossDefeats[previous.id]);
  };
  const positionRegion = regionAt(p.x, p.y);
  regionIndex = !legacyMapSave && positionRegion && isRegionUnlocked(positionRegion.id)
    ? REGIONS.indexOf(positionRegion)
    : !legacyMapSave && savedRegionId !== undefined && REGIONS.some(r => r.id === savedRegionId) && isRegionUnlocked(savedRegionId)
      ? REGIONS.findIndex(r => r.id === savedRegionId)
      : 0;
  if (regionIndex < 0 || regionIndex >= REGIONS.length) regionIndex = 0;
  region = REGIONS[regionIndex];
  if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !positionRegion || positionRegion.id !== region.id) {
    p.x = region.col * ZONE_W + ZONE_W / 2;
    p.y = region.row * ZONE_H + ZONE_H / 2;
  }
  syncPetToPlayer();
  window._tdcPlayer = p;
  const savedProfile = onboardingManager.getSavedProfile();
  if (savedProfile) {
    p.name = savedProfile.name;
    if (savedProfile.classId && window.GameClasses?.get) {
      p.classId = window.GameClasses.get(savedProfile.classId).id;
    }
    if (savedProfile.auraColor) {
      p.auraColor = savedProfile.auraColor;
    }
  }
  window._tdcRegions = REGIONS;
  p.potions = Number.isFinite(p.potions) ? C(Math.floor(p.potions), 0, MAX_POTIONS) : 3;
  p.emberShards = C(Math.floor(Number(p.emberShards) || 0), 0, 999999);
  p.talentPoints = C(Math.floor(Number(p.talentPoints) || 0), 0, 999);
  p.talents = Array.isArray(p.talents) ? [...new Set(p.talents.filter((id) => ['brutal','stone','fire','iron','storm','warcry','avatar','last-ember'].includes(id)))] : [];
  p.weaponTier = C(Math.floor(Number(p.weaponTier) || 0), 0, 5);
  p.need = progression.xpNeeded(p.lvl);
  p.xp = p.need ? C(Math.floor(Number(p.xp) || 0), 0, p.need - 1) : 0;

  function captureCurrentRegion() {
    if (!region || dungeonMode) return;
    const now = performance.now();
    regionStates[region.id] = {
      savedAt: Date.now(),
      mapLayoutVersion: WORLD_MAP_LAYOUT_VERSION,
      mobs: mobs.filter((m) => !m.isMinion).map((m) => ({ ...m, deathStartedAt: null, back: m.alive ? 0 : Math.max(0, m.back - now), hit: 0, atk: 0 })),
      nodes: nodes.map((n) => ({ ...n, back: n.alive ? 0 : Math.max(0, n.back - now) })),
      drops: drops.map((d) => ({ ...d })),
      chests: chests.map((z) => ({ ...z })),
      trees: trees.map((t) => ({ ...t })),
      decor: decor.map((d) => ({ ...d }))
    };
  }

  function save() {
    if (resettingSave) return;
    try {
      captureCurrentRegion();
      const serialized = JSON.stringify({
          version: 5,
          worldMapLayoutVersion: WORLD_MAP_LAYOUT_VERSION,
          savedAt: Date.now(),
          regionId: region.id,
          regions: regionStates,
          quests: questStates,
          bossDefeats,
          regionNpcRewards,
          dungeonProgress,
          dungeonMissions,
          dungeonInventory,
          dungeonMaterials,
          codexKills,
          codexMilestones,
          player: {
            x: dungeonMode && dungeonReturn ? dungeonReturn.x : p.x,
            y: dungeonMode && dungeonReturn ? dungeonReturn.y : p.y,
            hp: p.hp,
            max: p.max,
            xp: p.xp,
            need: p.need,
            lvl: p.lvl,
            gold: p.gold,
            crystal: p.crystal,
            emberShards: p.emberShards,
            talentPoints: p.talentPoints,
            talents: p.talents,
            lastEmberAt: p.lastEmberAt || 0,
            potions: p.potions,
            en: p.en,
            face: p.face,
            swordEquipped: p.swordEquipped,
            weaponTier: p.weaponTier,
            shieldEquipped: p.shieldEquipped,
            classId: p.classId
          },
          kills,
          ore,
          loot,
          claimed,
          guildJoined
        });
      localStorage.setItem(SAVE_KEY, serialized);
      window.GameAuth?.queueSave?.(serialized);
    } catch (e) {}
  }

  const heroSprites = createHeroSprites(p.classId);

  // Mana Seed Animated NPC Sprites
  const npcSprites = {};
  [
    'forge_ignis', 'shop_maeve', 'portal_kaelen', 'quest_vane',
    'market_silas', 'sentinel_lyanna', 'lore_ether', 'bard_dorian',
    'marsh_ferryman'
  ].forEach((id) => {
    const im = new Image();
    im.src = `assets/characters/npcs/${id}_idle.png`;
    npcSprites[id] = im;
  });

  // Castle Hub & Map Icons
  const hubIcons = {};
  [
    'forge_anvil', 'alchemy_potion', 'oracle_portal', 'quest_scroll',
    'market_scales', 'lore_book', 'sentinel_shield', 'bard_lute'
  ].forEach((name) => {
    const im = new Image();
    im.src = `assets/icons/${name}.png`;
    hubIcons[name] = im;
  });

  // DungeonFog Battlemaps preloader
  const dungeonMaps = {};
  [1, 2, 3, 4, 5].forEach((id) => {
    const im = new Image();
    im.src = `assets/maps/dungeons/dungeon_region_${id}.png`;
    dungeonMaps[id] = im;
  });

  // Dungeon CraftPix Animated VFX & Tactical Map Preloader
  const dungeonVFXSprites = {
    torchStrip: new Image(),
    trapStrip: new Image(),
    craftpixMap: new Image()
  };
  dungeonVFXSprites.torchStrip.src = 'assets/dungeon/torch_flame_strip.png';
  dungeonVFXSprites.trapStrip.src = 'assets/dungeon/spike_trap_strip.png';
  dungeonVFXSprites.craftpixMap.src = 'assets/dungeon/dungeon_craftpix_level1.png';

  // Medieval Village Houses Preloader
  const houseSprites = {};
  [
    'medieval_blacksmith',
    'medieval_apothecary',
    'medieval_tavern',
    'medieval_house_blue',
    'medieval_house_wood',
    'medieval_house_red'
  ].forEach((name) => {
    const im = new Image();
    im.src = `assets/props/houses/${name}.png`;
    houseSprites[name] = im;
  });

  const dropSprites = { gold: new Image(), crystal: new Image() };
  dropSprites.gold.src = 'assets/items/gold-coin.svg';
  dropSprites.crystal.src = 'assets/items/forest-crystal.svg';

  const projectileSprites = { arrow: {}, magic: {} };
  const PROJECTILE_DIRS = ['east', 'south_east', 'south', 'south_west', 'west', 'north_west', 'north', 'north_east'];
  PROJECTILE_DIRS.forEach((dir) => {
    const aImg = new Image();
    aImg.src = `assets/projectiles/arrow/arrow_${dir}.png`;
    projectileSprites.arrow[dir] = aImg;

    const mImg = new Image();
    mImg.src = `assets/projectiles/magic/magic_${dir}.png`;
    projectileSprites.magic[dir] = mImg;
  });

  // Load Sprites (Props, Nature, World, Chests, Ores, Monsters, Mountains)
  const propSprites = {};
  const propList = [
    'chest_closed', 'chest_open_gold', 'chest_open_empty', 'chest_royal',
    'ore_iron', 'ore_crystal', 'ore_gold', 'ore_gem',
    'barrel', 'barrel_stack', 'crate', 'crate_stack', 'pottery',
    'lamp_post', 'sign_post', 'pillar', 'campfire',
    'mine_cart_1', 'mine_cart_2',
    'stalagmite_1', 'stalagmite_2', 'stalagmite_3', 'stalagmite_4', 'stalagmite_5',
    'rock_pile_1', 'rock_pile_2',
    'rock_cave_1', 'rock_cave_2', 'rock_cave_4', 'rock_cave_6',
    'cave_hole_1', 'cave_hole_2', 'cave_hole_3',
    'training_dummy', 'ruined_statue', 'arcane_brazier',
    'library_bookshelf', 'stone_gargoyle', 'stone_dragon_statue',
    'cave_dungeon_entrance', 'stone_stairs',
    'ruin_chest', 'ruin_pillar', 'ruin_campfire_cold'
  ];
  propList.forEach((n) => {
    propSprites[n] = new Image();
    propSprites[n].src = 'assets/props/' + n + '.png';
  });
  propSprites.tree_oak_giant = new Image();
  propSprites.tree_oak_giant.src = 'assets/props/nature/tree_oak_giant.png';
  propSprites.stone_archway_ruin_1 = new Image();
  propSprites.stone_archway_ruin_1.src = 'assets/props/ruins/stone_archway_ruin_1.png';
  propSprites.stone_gate_portal = new Image();
  propSprites.stone_gate_portal.src = 'assets/environment/gates/gate_stone_01.png';

  const swampPropList = [
    'mangrove_tree_dense', 'mangrove_tree_broad', 'mangrove_tree_tall',
    'swamp_dead_tree_1', 'swamp_dead_tree_2',
    'mangrove_water_roots_1', 'mangrove_water_roots_2', 'mangrove_water_roots_3', 'mangrove_water_roots_4', 'mangrove_water_roots_5',
    'cattail_water_1', 'cattail_water_2', 'cattail_water_cluster', 'swamp_cattail_tall',
    'duckweed_algae_dense', 'duckweed_algae_scattered',
    'swamp_bush_dense', 'swamp_bush_flat', 'swamp_bush_small_1', 'swamp_bush_small_2',
    'swamp_fallen_branches', 'swamp_mossy_log', 'swamp_mossy_rock',
    'swamp_mud_mound', 'swamp_mud_water_hole',
    'swamp_reeds_dense', 'swamp_reeds_water', 'swamp_twigs_debris',
    'water_lily_bud_cluster', 'water_lily_cluster_3', 'water_lily_lotus_flower_1', 'water_lily_lotus_flower_2', 'water_lily_single',
    'water_lotus_bloom_double', 'water_lotus_bloom_single', 'water_pads_small'
  ];
  swampPropList.forEach((n) => {
    propSprites[n] = new Image();
    propSprites[n].src = 'assets/props/swamp/' + n + '.png';
  });

  const chestSprites = {};
  const chestList = [
    'chest_stone_moss_closed', 'chest_stone_moss_open',
    'chest_goblin_rusty_closed', 'chest_goblin_rusty_open',
    'chest_spectral_teal_closed', 'chest_spectral_teal_open',
    'chest_cursed_spiked_closed', 'chest_cursed_spiked_open'
  ];
  chestList.forEach((n) => {
    chestSprites[n] = new Image();
    chestSprites[n].src = 'assets/props/chests/' + n + '.png';
  });

  const oreSprites = {};
  const oreList = [
    'ore_cyan_fissure', 'ore_magma_lava', 'ore_amethyst_spire',
    'ore_gold_vein', 'ore_iron_silver', 'ore_white_quartz'
  ];
  oreList.forEach((n) => {
    oreSprites[n] = new Image();
    oreSprites[n].src = 'assets/props/ores/' + n + '.png';
  });
  const dungeonOreSprites = {
    ore_abyssal: oreSprites.ore_cyan_fissure,
    ore_bloodstone: oreSprites.ore_magma_lava,
    ore_astral: oreSprites.ore_amethyst_spire
  };

  const monsterSprites = {};
  const monsterList = [
    'monster_snail_beast', 'monster_haunted_grimoire', 'monster_skeleton_warrior',
    'monster_spiked_crawler', 'monster_giant_eyeball', 'monster_mushroom_fiend',
    'monster_shadow_spirit', 'monster_void_serpent',
    'stone_golem_idle', 'monster_fire_skull', 'monster_hell_hound',
    'monster_ghost_spectre', 'monster_flying_demon', 'monster_reaper_death',
    'monster_giant_frog', 'monster_treant', 'monster_swamp_witch',
    'monster_vampire_lord', 'monster_cave_ogre'
  ];
  monsterList.forEach((n) => {
    monsterSprites[n] = new Image();
    monsterSprites[n].src = 'assets/monsters/' + n + '.png';
  });
  monsterSprites.boss_ashroot_guardian = new Image();
  monsterSprites.boss_ashroot_guardian.src = 'assets/monsters/guardian-ashroot/south.png';
  monsterSprites.boss_ashen_golem = new Image();
  monsterSprites.boss_ashen_golem.src = 'assets/monsters/boss_ashen_golem/anchor-s.png';

  const slimeList = [
    'slime_green', 'slime_pink', 'slime_magma', 'slime_crystal',
    'slime_leaf', 'slime_gold', 'slime_shadow_cat', 'slime_electric', 'slime_dark_void'
  ];
  slimeList.forEach((n) => {
    monsterSprites[n] = new Image();
    monsterSprites[n].src = 'assets/monsters/slimes/' + n + '.png';
  });

  const mountainSprites = {};
  const mountainList = [
    'mountain_peak', 'mountain_mesa', 'mountain_crag',
    'rock_plateau', 'rock_moss_cluster', 'rock_pebbles'
  ];
  mountainList.forEach((n) => {
    mountainSprites[n] = new Image();
    mountainSprites[n].src = 'assets/world/' + n + '.png';
  });

  const natureSprites = {};
  const natureList = [
    'rock_small', 'rock_moss', 'rock_large',
    'stump', 'log', 'firewood',
    'mushroom_red', 'mushroom_purple', 'mushroom_blue', 'mushroom_brown',
    'bush_lush', 'bush_berries', 'bush_flowers', 'fence'
  ];
  natureList.forEach((n) => {
    natureSprites[n] = new Image();
    natureSprites[n].src = 'assets/world/' + n + '.png';
  });

  const worldSprites = {};
  ['pine', 'bush', 'flowers', 'rocks', 'ruin'].forEach((n) => {
    worldSprites[n] = new Image();
    worldSprites[n].src = 'assets/world/' + n + '.svg';
  });
  worldSprites.tree = new Image();
  worldSprites.tree.src = 'assets/props/nature/tree_elm_medium.png';

  // Floating text / combat numbers
  function addFloatingText(x, y, text, color = '#ffd464', size = 13) {
    floatingTexts.push({
      x: x + R(-10, 10),
      y: y - 15,
      text,
      color,
      size,
      alpha: 1,
      vy: -35,
      life: 0.95
    });
  }

  function mob(x, y, t = region.enemy, options = {}) {
    const level = C(Math.floor(options.level || R(region.min, region.max + 1)), region.min, region.max);
    const boss = !!options.boss;
    const levelScale = Math.pow(1.035, Math.max(0, level - region.min));
    const hp = Math.round(region.hp * levelScale * (options.hpScale || 1) * (boss ? 8 : t === 'golem' ? 1.15 : 1));
    const mobId = options.id || (boss ? `boss_r${region.id}` : `mob_${region.id}_${Math.round(x)}_${Math.round(y)}`);
    mobs.push({
      id: mobId,
      x,
      y,
      ox: x,
      oy: y,
      t,
      level,
      boss,
      facing: options.facing || 'south',
      isMoving: false,
      bossName: options.name || '',
      hp,
      max: hp,
      sp: boss ? Math.round(region.sp * 0.62) : t === 'golem' ? Math.round(region.sp * 0.7) : region.sp,
      hit: 0,
      atk: 0,
      phase: R(0, 9),
      alive: true,
      back: 0,
      aggro: false,
      windup: false,
      windupAt: 0,
      attackCount: 0
    });
  }

  function dungeonNpcPosition(targetRegion = region) {
    const layout = worldMapLayouts[String(targetRegion.id)];
    if (layout?.npcSpawn) {
      return {
        x: targetRegion.col * ZONE_W + layout.npcSpawn.x,
        y: targetRegion.row * ZONE_H + layout.npcSpawn.y
      };
    }
    return { x: targetRegion.col * ZONE_W + 1010, y: targetRegion.row * ZONE_H + 690 };
  }

  function regionalGuidePosition(targetRegion = region) {
    const guide = REGIONAL_GUIDES[targetRegion.id];
    if (!guide) return null;
    return { ...guide, x: targetRegion.col * ZONE_W + guide.x, y: targetRegion.row * ZONE_H + guide.y };
  }

  function captureCombatContext() {
    return { regionId: region.id, inDungeon: dungeonMode, floor: dungeonSession?.floor || 0 };
  }

  function isCombatContextCurrent(context) {
    return region.id === context.regionId
      && dungeonMode === context.inDungeon
      && (!context.inDungeon || dungeonSession?.floor === context.floor);
  }

  function speakWithRegionalGuide(guide = regionalGuidePosition()) {
    if (!guide) return false;

    const activeList = questManager.getActiveQuestsList();
    const readyQuest = activeList.find(q => (q.giverId === guide.id || (guide.id === 'herbalist_mira' && q.regionId === 1)) && q.isReady);
    const ongoingQuest = activeList.find(q => (q.giverId === guide.id || (guide.id === 'herbalist_mira' && q.regionId === 1)) && !q.isReady);
    const available = questManager.getAvailableQuestsForRegion(region.id, p.lvl).filter(q => q.giverId === guide.id || (guide.id === 'herbalist_mira' && q.regionId === 1));

    const actions = [];
    let speech = `Saudações, errante. Que os ventos das cinzas guiem seus passos pelo bosque.`;

    if (readyQuest) {
      speech = readyQuest.dialogComplete || `Excelente trabalho! Sabia que podia confiar em sua lâmina.`;
      actions.push({
        label: `📜 Entregar Missão: ${readyQuest.title}`,
        primary: true,
        onClick: () => {
          const rewards = questManager.turnInQuest(readyQuest.id);
          if (rewards) {
            if (rewards.xp) xp(rewards.xp);
            if (rewards.gold) p.gold += rewards.gold;
            if (rewards.crystals) p.crystal += rewards.crystals;
            if (rewards.emberShards) p.emberShards += rewards.emberShards;
            if (rewards.potions) p.potions = Math.min(MAX_POTIONS, p.potions + rewards.potions);
            audio.playLevelUp?.();
            sparks(guide.x, guide.y - 20, '#f59e0b', 30);
            addFloatingText(p.x, p.y - 45, `MISSÃO CONCLUÍDA! +${rewards.xp} XP`, '#f59e0b', 16);
            questUI.showCompletionBanner?.(readyQuest.title, rewards);
            renderUI({ p, kills, ore, loot, quest: currentQuest() });
            save();
          }
        }
      });
    } else if (available.length > 0) {
      const q = available[0];
      speech = q.dialogIntro || `Preciso de sua ajuda urgente em uma tarefa crucial para nosso acampamento.`;
      actions.push({
        label: `📜 Aceitar Missão: ${q.title}`,
        primary: true,
        onClick: () => {
          questManager.acceptQuest(q.id);
          addFloatingText(p.x, p.y - 40, `MISSÃO ACEITA: ${q.title}`, '#38bdf8', 15);
          audio.playSave?.();
        }
      });
    } else if (ongoingQuest) {
      speech = ongoingQuest.dialogProgress || `Continue em sua missão, errante. O destino de nosso povo repousa em suas mãos.`;
    }

    if (!regionNpcRewards[guide.id]) {
      actions.push({
        label: `🎁 Suprimento Regional (${guide.reward || 'Ajuda'})`,
        primary: !readyQuest && available.length === 0,
        onClick: () => {
          regionNpcRewards[guide.id] = true;
          if (guide.kind === 'potions') {
            const gained = Math.min(2, MAX_POTIONS - p.potions);
            p.potions += gained;
            if (gained < 2) p.gold += (2 - gained) * 35;
            msg(guide.name + ' entregou ' + gained + ' poções' + (gained < 2 ? ' e ouro pelo estoque cheio' : '') + '.');
          } else if (guide.kind === 'heal') {
            const healed = Math.min(p.max - p.hp, Math.round(p.max * 0.35));
            p.hp += healed;
            const gained = Math.min(1, MAX_POTIONS - p.potions);
            p.potions += gained;
            msg(guide.name + ' restaurou ' + healed + ' de vida e entregou uma poção.');
          } else if (guide.kind === 'ore') {
            const gold = 120 + region.id * 35;
            p.gold += gold;
            p.crystal += 2;
            msg(guide.name + ' dividiu o achado: +' + gold + ' ouro e +2 cristais.');
          } else if (guide.kind === 'lore') {
            p.crystal += 3;
            const rewardXp = Math.max(25, Math.round((progression.xpNeeded(p.lvl) || 0) * 0.12));
            xp(rewardXp);
            msg(guide.name + ' compartilhou um fragmento: +3 cristais e +' + rewardXp + ' XP.');
          } else {
            p.emberShards = Math.min(999999, p.emberShards + 1);
            p.potions = Math.min(MAX_POTIONS, p.potions + 1);
            msg(guide.name + ' entregou +1 Fragmento de Brasa e uma poção.');
          }
          sparks(guide.x, guide.y - 22, guide.color, 22);
          audio.playLevelUp?.();
          renderUI({ p, kills, ore, loot, quest: currentQuest() });
          save();
        }
      });
    }

    questUI.openNpcDialog({
      name: guide.name,
      title: guide.title,
      speech: speech,
      icon: '🌿',
      actions: actions
    });

    return true;
  }

  function speakWithDungeonNpc() {
    const npcPos = dungeonNpcPosition();
    const npcQuotes = {
      1: 'As catacumbas guardam a Raiz-Mãe. Cuidado quando o Guardião fizer o solo se abrir em espinhos!',
      2: 'As águas mortas corroem tudo. Jamais permaneça sobre as poças ácidas da Serpente!',
      3: 'O magma da fornalha é implacável! Desvie do terremoto do Colosso antes do impacto!',
      4: 'O Arquivista ergue barreiras com seus tomos. Espere o escudo rúnico cair para contra-atacar!',
      5: 'Vharok convoca o fim dos tempos. Desvie da chuva do eclipse e liberte Miraluz!'
    };
    const defaultQuote = npcQuotes[region.id] || 'Contratos e expedições de masmorra aguardam sua lâmina.';

    const activeList = questManager.getActiveQuestsList();
    const readyQuest = activeList.find(q => (q.giverId === 'npc_maerin' || q.giver === region.npcName || q.regionId === region.id) && q.isReady);
    const ongoingQuest = activeList.find(q => (q.giverId === 'npc_maerin' || q.giver === region.npcName || q.regionId === region.id) && !q.isReady);
    const available = questManager.getAvailableQuestsForRegion(region.id, p.lvl).filter(q => q.giverId === 'npc_maerin' || q.giver === region.npcName || q.giverId?.startsWith('npc_'));

    const actions = [];
    let speech = defaultQuote;

    if (readyQuest) {
      speech = readyQuest.dialogComplete || `Excelente trabalho! Sabia que podia confiar em sua lâmina.`;
      actions.push({
        label: `📜 Entregar Missão: ${readyQuest.title}`,
        primary: true,
        onClick: () => {
          const rewards = questManager.turnInQuest(readyQuest.id);
          if (rewards) {
            if (rewards.xp) xp(rewards.xp);
            if (rewards.gold) p.gold += rewards.gold;
            if (rewards.crystals) p.crystal += rewards.crystals;
            if (rewards.emberShards) p.emberShards += rewards.emberShards;
            if (rewards.potions) p.potions = Math.min(MAX_POTIONS, p.potions + rewards.potions);
            audio.playLevelUp?.();
            sparks(npcPos.x, npcPos.y - 20, '#f59e0b', 30);
            addFloatingText(p.x, p.y - 45, `MISSÃO CONCLUÍDA! +${rewards.xp} XP`, '#f59e0b', 16);
            questUI.showCompletionBanner?.(readyQuest.title, rewards);
            renderUI({ p, kills, ore, loot, quest: currentQuest() });
            save();
          }
        }
      });
    } else if (available.length > 0) {
      const q = available[0];
      speech = q.dialogIntro || `Preciso de sua ajuda urgente em uma tarefa crucial para nosso acampamento.`;
      actions.push({
        label: `📜 Aceitar Missão: ${q.title}`,
        primary: true,
        onClick: () => {
          questManager.acceptQuest(q.id);
          addFloatingText(p.x, p.y - 40, `MISSÃO ACEITA: ${q.title}`, '#38bdf8', 15);
          audio.playSave?.();
        }
      });
    } else if (ongoingQuest) {
      speech = ongoingQuest.dialogProgress || defaultQuote;
    }

    actions.push({
      label: `⚔️ Expedição & Contratos de Masmorra`,
      primary: !readyQuest && available.length === 0,
      onClick: () => {
        showTab(4);
        msg((region.npcName || 'Guardião') + ' · contratos e expedições de masmorra.');
      }
    });

    questUI.openNpcDialog({
      name: region.npcName || 'Guardião Regional',
      title: 'Guardião das Catacumbas & Contratos',
      speech: speech,
      icon: '🛡️',
      actions: actions
    });

    return true;
  }

  function currentDungeonMission(regionId = region.id) {
    if (!dungeonMissions[regionId]) {
      dungeonMissions[regionId] = { accepted: false, ore: 0, chests: 0, boss: false, claimed: false };
    }
    return dungeonMissions[regionId];
  }

  function dungeonFloorLevel(floorNumber = dungeonSession?.floor || 1) {
    return Math.round(region.min + (floorNumber - 1) * (region.max - region.min) / (DUNGEON_FLOORS - 1));
  }

  function populateDungeonFloor(floorNumber) {
    mobs.length = 0;
    nodes.length = 0;
    drops.length = 0;
    chests.length = 0;
    trees.length = 0;
    decor.length = 0;
    lightSources.length = 0;
    dungeonSession.floor = floorNumber;
    dungeonSession.cleared = false;
    dungeonSession.exit = { x: region.col * ZONE_W + 960, y: region.row * ZONE_H + 145 };
    dungeonSession.stairs = { x: region.col * ZONE_W + 960, y: region.row * ZONE_H + 1305 };

    const ox = region.col * ZONE_W;
    const oy = region.row * ZONE_H;
    const themeMonsters = {
      1: ['monster_treant', 'monster_skeleton_warrior', 'stone_golem_idle', 'monster_fire_skull'],
      2: ['monster_giant_frog', 'monster_swamp_witch', 'monster_ghost_spectre', 'monster_void_serpent'],
      3: ['monster_cave_ogre', 'monster_hell_hound', 'slime_magma', 'monster_spiked_crawler'],
      4: ['monster_vampire_lord', 'monster_flying_demon', 'monster_haunted_grimoire', 'monster_reaper_death'],
      5: ['monster_vampire_lord', 'monster_reaper_death', 'monster_void_serpent', 'monster_hell_hound']
    };
    const pool = themeMonsters[region.id];
    const level = dungeonFloorLevel(floorNumber);
    const positions = [[370, 420], [760, 355], [1320, 420], [510, 760], [1110, 760], [730, 1020], [1380, 1050]];
    const count = Math.min(positions.length, 3 + Math.ceil(floorNumber / 2));
    for (let i = 0; i < count; i++) {
      const [x, y] = positions[i];
      mob(ox + x, oy + y, pool[(i + floorNumber) % pool.length], {
        level: Math.min(region.max, level + (i % 2)), hpScale: 1.22
      });
    }
    if (floorNumber % 5 === 0) {
      const isFloorFive = floorNumber === 5;
      const bossSprite = isFloorFive ? 'boss_ashen_golem' : region.bossSprite;
      const bossName = isFloorFive ? (region.dungeonBossFive || 'Lorde de Magma Ignis (Colosso de Obsidiana)') : region.dungeonBossTen;
      mob(ox + 960, oy + 835, bossSprite, {
        level, boss: true, name: bossName + ' · Andar ' + floorNumber,
        hpScale: isFloorFive ? 1.45 : 1.2
      });
    }

    const rareOres = ['ore_abyssal', 'ore_bloodstone', 'ore_astral'];
    const orePositions = [[270, 590], [1580, 590], [285, 960], [1580, 960], [610, 1180], [1310, 1180]];
    orePositions.forEach(([x, y], index) => nodes.push({
      x: ox + x, y: oy + y, kind: rareOres[(index + floorNumber + region.id) % rareOres.length],
      alive: true, back: 0, dungeonRare: true
    }));

    [[690, 570], [1210, 570], [960, 1135]].forEach(([x, y], index) => chests.push({
      x: ox + x, y: oy + y, open: false, dungeon: true,
      type: index === 2 ? 'chest_cursed_spiked' : floorNumber % 2 ? 'chest_spectral_teal' : 'chest_stone_moss',
      name: 'Baú da masmorra'
    }));

    // Cavern scenery & props (mine carts, stalagmites, rock piles, chasms)
    const caveDecors = [
      { x: ox + 330, y: oy + 610, kind: floorNumber % 2 ? 'mine_cart_1' : 'mine_cart_2', s: 1.0 },
      { x: ox + 1520, y: oy + 980, kind: floorNumber % 2 ? 'mine_cart_2' : 'mine_cart_1', s: 1.0 },
      { x: ox + 180, y: oy + 260, kind: 'stalagmite_1', s: 1.1 },
      { x: ox + 1720, y: oy + 260, kind: 'stalagmite_2', s: 1.2 },
      { x: ox + 160, y: oy + 780, kind: 'stalagmite_3', s: 1.0 },
      { x: ox + 1740, y: oy + 780, kind: 'stalagmite_4', s: 1.1 },
      { x: ox + 220, y: oy + 1200, kind: 'stalagmite_5', s: 1.1 },
      { x: ox + 1680, y: oy + 1200, kind: 'stalagmite_1', s: 1.0 },
      { x: ox + 450, y: oy + 480, kind: 'rock_pile_1', s: 0.9 },
      { x: ox + 1440, y: oy + 510, kind: 'rock_pile_2', s: 0.9 },
      { x: ox + 820, y: oy + 1150, kind: 'rock_cave_1', s: 1.0 },
      { x: ox + 1100, y: oy + 1150, kind: 'rock_cave_4', s: 1.0 },
      { x: ox + 480, y: oy + 920, kind: 'cave_hole_1', s: 0.8 },
      { x: ox + 1400, y: oy + 920, kind: 'cave_hole_2', s: 0.8 }
    ];
    caveDecors.forEach((d) => decor.push(d));

    addRegionLights(ox, oy);
    updateRegionUI();
    save();
  }

  function enterDungeon(force = false) {
    const mission = currentDungeonMission();
    const npc = dungeonNpcPosition();
    if (dungeonMode) return msg('Você já está dentro de uma masmorra.');
    if (!force) {
      if (D(p, npc) > 105) return msg('Fale com ' + region.npcName + ' para receber a missão e entrar.');
      if (!mission.accepted) return msg('Aceite o contrato de ' + region.npcName + ' antes de entrar.');
    } else {
      mission.accepted = true;
    }
    if (p.lvl < region.unlocks) return msg('Nível ' + region.unlocks + ' necessário para explorar esta masmorra.');
    const nextFloor = C(Number(dungeonProgress[region.id]) || 1, 1, DUNGEON_FLOORS);
    if (nextFloor > 5 && !dungeonProgress[region.id + ':soloWarned']) {
      msg('[Aviso de Alta Dificuldade] Andares 6–10 foram concebidos para grupos no futuro MMORPG. No protótipo solo, avance com poções preparadas!');
      dungeonProgress[region.id + ':soloWarned'] = true;
    }

    captureCurrentRegion();
    dungeonReturn = { x: p.x, y: p.y };
    dungeonMode = true;
    dungeonSession = { regionId: region.id, floor: nextFloor, cleared: false };
    p.x = region.col * ZONE_W + 960;
    p.y = region.row * ZONE_H + 230;
    syncPetToPlayer();
    goal = null;
    route = [];
    enemy = object = null;
    populateDungeonFloor(nextFloor);
    dungeonTrackerUI.init(() => leaveDungeon());
    dungeonTrackerUI.show();
    updateRegionUI();
    msg(region.dungeonName + ' · Andar ' + nextFloor + ' de ' + DUNGEON_FLOORS);
  }

  function leaveDungeon() {
    if (!dungeonMode || !dungeonReturn) return;
    dungeonTrackerUI.hide();
    dungeonMode = false;
    dungeonSession = null;
    p.x = dungeonReturn.x;
    p.y = dungeonReturn.y;
    syncPetToPlayer();
    dungeonReturn = null;
    goal = null;
    route = [];
    enemy = object = null;
    populateRegion();
    updateRegionUI();
    save();
    msg('Você deixou a masmorra e voltou para ' + region.name + '.');
  }

  function useDungeonStairs() {
    if (!dungeonMode || !dungeonSession) return;
    if (!dungeonSession.cleared) return msg('Derrote todas as criaturas deste andar antes de avançar.');
    if (dungeonSession.floor >= DUNGEON_FLOORS) {
      const mission = currentDungeonMission();
      if (mission.accepted) mission.boss = true;
      dungeonProgress[region.id] = DUNGEON_FLOORS;
      const relicReward = 'Coroa das Profundezas · ' + region.dungeonName;
      if (!dungeonInventory.some((it) => it.name === relicReward)) {
        dungeonInventory.push({ name: relicReward, rarity: 'Mítico', region: region.id });
        p.emberShards += 2;
        p.gold += 500;
        xp(Math.round(progression.xpNeeded(p.lvl) * 0.8));
        addFloatingText(p.x, p.y - 35, ' ANDAR 10 CONQUISTADO! ', '#ffd700', 20);
        audio.playLevelUp();
        sparks(p.x, p.y, '#ffd700', 50);
        msg('VITÓRIA HEROICA! Você conquistou todos os 10 andares de ' + region.dungeonName + '!');
      } else {
        msg('Você concluiu o 10º andar de ' + region.dungeonName + ' novamente!');
      }
      save();
      return leaveDungeon();
    }
    const nextFloor = dungeonSession.floor + 1;
    if (dungeonSession.floor === 5) {
      currentDungeonMission().boss = true;
      questManager.onProgress('dungeon_floor', 1, { floor: 5 });
    }
    questManager.onProgress('dungeon_floor', 1, { floor: nextFloor });
    dungeonProgress[region.id] = nextFloor;
    p.x = region.col * ZONE_W + 960;
    p.y = region.row * ZONE_H + 230;
    syncPetToPlayer();
    populateDungeonFloor(nextFloor);
    msg('Masmorra · Andar ' + nextFloor + ' de ' + DUNGEON_FLOORS + ' · Nv. recomendado ' + dungeonFloorLevel(nextFloor));
    if (nextFloor > 5 && !dungeonProgress[region.id + ':soloWarned']) {
      msg('[Aviso Solo] Andares 6–10 trazem desafio avançado. Cuidado redobrado com os chefes!');
      dungeonProgress[region.id + ':soloWarned'] = true;
    }
  }

  function claimDungeonMission() {
    const mission = currentDungeonMission();
    if (D(p, dungeonNpcPosition()) > 105) return msg('Volte e fale com ' + region.npcName + ' para entregar o contrato.');
    if (mission.claimed) return msg('Contrato de masmorra já concluído nesta região.');
    if (!mission.accepted || mission.ore < 3 || mission.chests < 2 || !mission.boss) {
      return msg('Objetivos: extraia 3 veios raros, abra 2 baús e derrote o chefe do andar 5.');
    }
    mission.claimed = true;
    const goldReward = region.id * 180;
    const xpReward = Math.round(progression.xpNeeded(p.lvl) * 0.7);
    p.gold += goldReward;
    p.emberShards++;
    xp(xpReward);
    dungeonInventory.push({ name: 'Selo do Explorador · ' + region.dungeonName, rarity: 'Raro', region: region.id });
    msg('Contrato entregue · +' + goldReward + ' ouro, +' + xpReward + ' XP, +1 Fragmento de Brasa e um Selo do Explorador.');
    save();
    showTab(4);
  }

  function rollDungeonLoot(x, y, isBoss = false) {
    if (!dungeonMode) return;
    if (window.DungeonDrops) {
      const drop = window.DungeonDrops.rollDrop(dungeonFloorLevel(), isBoss);
      if (drop) {
        dungeonInventory.push({ name: drop.name, rarity: drop.rarity, slot: drop.slot, icon: drop.icon, region: region.id });
        if (drop.id && window.GameItems?.addItem) {
          window.GameItems.addItem(drop.id);
        }
        const rar = window.DungeonDrops.RARITY[drop.rarity] || { color: '#60a5fa', label: drop.rarity };
        const isSuper = drop.rarity === 'supremo' || drop.rarity === 'lendario';
        addFloatingText(x, y - 32, (drop.icon || '') + ' ' + drop.name + ' (' + rar.label + ')!', rar.color, isSuper ? 18 : 13);
        sparks(x, y, rar.color, isSuper ? 45 : 20);
        if (isSuper) audio.playLevelUp();
        msg(`Saque de masmorra [${rar.label}]: ${drop.name}!`);
        return;
      }
    }
    const roll = Math.random();
    if (roll < 1 / 100000) {
      const name = ['Coração da Primeira Cinza', 'Coroa do Vazio', 'Fragmento de Miraluz'][Math.floor(R(0, 3))];
      dungeonInventory.push({ name, rarity: 'Mítico', region: region.id });
      addFloatingText(x, y - 35, ' RELÍQUIA MÍTICA! ', '#ff75dc', 20);
      sparks(x, y, '#ff75dc', 45);
      audio.playLevelUp();
      msg('RELÍQUIA MÍTICA ENCONTRADA! ' + name + ' · (Sorteio do cliente local: 1 em 100.000)');
    } else if (roll < 0.03) {
      const name = ['Anel da Galeria', 'Lâmina Sepultada', 'Manto das Veias'][Math.floor(R(0, 3))];
      dungeonInventory.push({ name, rarity: 'Raro', region: region.id });
      addFloatingText(x, y - 28, 'ITEM RARO!', '#72dcf3', 16);
      sparks(x, y, '#72dcf3', 20);
      msg('Item raro de masmorra encontrado: ' + name + '!');
    }
  }

  function initAmbientParticles() {
    ambientParticles.length = 0;
    const isAshBiome = region.id === 29 || region.theme === 'ash' || region.id >= 26;
    const isLavaBiome = region.theme === 'lava' || region.theme === 'chaos';
    const isSnowBiome = region.theme === 'snow';
    const count = isAshBiome ? 65 : 45;

    for (let i = 0; i < count; i++) {
      ambientParticles.push({
        x: R(0, c.width || 800),
        y: R(0, c.height || 600),
        vx: R(-14, 14),
        vy: (isAshBiome || isSnowBiome) ? R(12, 32) : (isLavaBiome ? R(-28, -12) : R(-14, -4)),
        size: isAshBiome ? R(1.8, 3.8) : R(1.5, 3.2),
        alpha: R(0.25, 0.75),
        phase: R(0, Math.PI * 2)
      });
    }
  }

  function addRegionLights(ox, oy) {
    if (region.id === 0) return;
    const isAsh = region.id === 29 || region.theme === 'ash' || region.id >= 26;
    const isLava = region.theme === 'lava' || region.theme === 'chaos';
    const lightColor = isAsh ? '#94a3b8' : (isLava ? '#ff5722' : (region.accent || '#fca311'));
    lightSources.push(
      { x: ox + 960, y: oy + 750, type: isAsh ? 'arcane_brazier' : 'campfire', rad: isAsh ? 145 : 130, color: lightColor },
      { x: ox + 430, y: oy + 410, type: isAsh ? 'arcane_brazier' : 'lamp_post', rad: 110, color: lightColor },
      { x: ox + 1470, y: oy + 410, type: isAsh ? 'arcane_brazier' : 'lamp_post', rad: 110, color: lightColor },
      { x: ox + 430, y: oy + 1080, type: isAsh ? 'arcane_brazier' : 'lamp_post', rad: 110, color: lightColor },
      { x: ox + 1470, y: oy + 1080, type: isAsh ? 'arcane_brazier' : 'lamp_post', rad: 110, color: lightColor }
    );
  }

  function restoreRegionState() {
    if (region.id === 0) return false;
    const saved = regionStates[region.id];
    if (!saved) return false;
    if (region.id !== 1 && saved.mapLayoutVersion !== WORLD_MAP_LAYOUT_VERSION) return false;
    const now = performance.now();
    const offline = Math.max(0, Date.now() - (Number(saved.savedAt) || Date.now()));
    (saved.mobs || []).filter((m) => !m.isMinion).forEach((m, index) => {
      const savedMaxHp = Math.max(1, Number(m.max) || 100);
      const level = C(Number(m.level) || region.min + (index % 20), region.min, region.max);
      const tunedMaxHp = Math.round(region.hp * Math.pow(1.035, Math.max(0, level - region.min)) * (m.boss ? 8 : m.t === 'golem' ? 1.15 : 1));
      const maxHp = region.id === 1 ? Math.max(savedMaxHp, tunedMaxHp) : savedMaxHp;
      const rawHp = Number(m.hp);
      const isAlive = Boolean(m.alive) && !isNaN(rawHp) && rawHp > 0;
      const mobId = m.id || (m.boss ? `boss_r${region.id}` : `mob_${region.id}_${Math.round(m.ox || m.x)}_${Math.round(m.oy || m.y)}`);
      mobs.push({
        id: mobId,
        boss: !!m.boss,
        bossName: m.bossName || '',
        windup: false,
        attackCount: 0,
        ...m,
        level,
        hp: isAlive ? Math.min(maxHp, Math.round(maxHp * rawHp / savedMaxHp)) : 0,
        max: maxHp,
        alive: isAlive,
        t: region.id === 1 && m.boss && m.t === 'monster_mushroom_fiend' ? region.bossSprite : m.t,
        facing: MOB_DIRECTIONS.includes(m.facing) ? m.facing : 'south',
        isMoving: false,
        back: isAlive ? 0 : now + Math.max(0, (Number(m.back) || 0) - offline),
        hit: 0,
        atk: 0
      });
    });
    if (!mobs.some((m) => m.boss)) {
      const bossArea = region.areas[4];
      mob(region.col * ZONE_W + bossArea.x, region.row * ZONE_H + bossArea.y, region.bossSprite, {
        level: region.max, boss: true, name: region.bossName
      });
    }
    (saved.nodes || []).forEach((n) => nodes.push({
      ...n,
      back: n.alive ? 0 : now + Math.max(0, (Number(n.back) || 0) - offline)
    }));
    drops.push(...(saved.drops || []).map((d) => ({ ...d })));
    chests.push(...(saved.chests || []).map((z) => ({ ...z })));
    if (saved.mapLayoutVersion === WORLD_MAP_LAYOUT_VERSION) {
      trees.push(...(saved.trees || []).map((t) => ({ ...t })));
      decor.push(...(saved.decor || []).map((d) => ({ ...d })));
    } else {
      populateRegionEnvironment(region.col * ZONE_W, region.row * ZONE_H);
    }
    return true;
  }

  function populateRegionEnvironment(ox, oy) {
    if (region.generatedMap) {
      const layout = worldMapLayouts[String(region.id)];
      (layout?.landmarks || []).forEach((item) => decor.push({
        ...item,
        x: ox + item.x,
        y: oy + item.y
      }));
      return;
    }
    const treeCountByRegion = { 1: 88, 2: 48, 3: 14, 4: 20, 5: 8 };
    const treeCount = treeCountByRegion[region.id] || 36;
    for (let i = 0; i < treeCount; i++) {
      const x = ox + R(70, 1830);
      const y = oy + R(60, 1390);
      const lx = x - ox;
      const ly = y - oy;
      if (onTrail(lx, ly, 86) || isRegionLandmarkKeepout(lx, ly)) continue;
      const kind = region.id === 1
        ? (i % 3 === 0 ? 'pine' : 'tree')
        : region.id === 2
          ? (i % 5 === 0 ? 'mangrove_tree_broad' : (i % 4 === 0 ? 'swamp_dead_tree_1' : (i % 3 === 0 ? 'swamp_dead_tree_2' : (i % 2 === 0 ? 'mangrove_tree_tall' : 'mangrove_tree_dense'))))
          : 'pine';
      trees.push({ x, y, s: R(0.85, 1.2), kind });
    }

    const landmarkTrees = region.id === 1
      ? [[370, 300], [1530, 310], [375, 1195], [1515, 1190], [550, 330], [1350, 330]]
      : region.id === 2
        ? [[350, 310], [1540, 315], [360, 1180], [1540, 1180], [960, 950], [680, 550], [1240, 550]]
        : [];
    landmarkTrees.forEach(([x, y]) => trees.push({
      x: ox + x,
      y: oy + y,
      s: region.id === 2 ? 1.35 : 1.4,
      kind: region.id === 2 ? 'mangrove_tree_dense' : 'tree'
    }));

    const propTypesByRegion = {
      1: ['rock_moss', 'rock_small', 'stump', 'log', 'mushroom_red', 'mushroom_purple', 'mushroom_blue', 'mushroom_brown', 'bush_berries', 'bush_flowers', 'bush_lush'],
      2: [
        'water_lily_cluster_3', 'water_lily_lotus_flower_1', 'water_lily_lotus_flower_2', 'water_lotus_bloom_double', 'water_lotus_bloom_single', 'water_pads_small', 'water_lily_bud_cluster', 'water_lily_single',
        'cattail_water_cluster', 'cattail_water_1', 'cattail_water_2', 'swamp_cattail_tall',
        'swamp_reeds_dense', 'swamp_reeds_water', 'duckweed_algae_dense', 'duckweed_algae_scattered',
        'mangrove_water_roots_1', 'mangrove_water_roots_2', 'mangrove_water_roots_3', 'mangrove_water_roots_4', 'mangrove_water_roots_5',
        'swamp_mossy_log', 'swamp_fallen_branches', 'swamp_twigs_debris',
        'swamp_mud_mound', 'swamp_mossy_rock', 'swamp_mud_water_hole',
        'swamp_bush_dense', 'swamp_bush_small_1', 'swamp_bush_small_2', 'swamp_bush_flat',
        'mushroom_purple', 'mushroom_blue'
      ],
      3: ['rock_large', 'rock_small', 'stump', 'firewood', 'mushroom_red', 'arcane_brazier', 'pillar'],
      4: ['rock_moss', 'rock_large', 'stump', 'pillar', 'ruined_statue', 'stone_gargoyle', 'fence'],
      5: ['rock_large', 'rock_small', 'pillar', 'mushroom_purple', 'mushroom_red', 'arcane_brazier', 'stone_gargoyle']
    };
    const propTypes = propTypesByRegion[region.id] || propTypesByRegion[1];
    const propCountByRegion = { 1: 65, 2: 78, 3: 42, 4: 48, 5: 38 };
    for (let i = 0; i < (propCountByRegion[region.id] || 50); i++) {
      const x = ox + R(70, 1830);
      const y = oy + R(65, 1385);
      const lx = x - ox;
      const ly = y - oy;
      if (onTrail(lx, ly, 78) || isRegionLandmarkKeepout(lx, ly)) continue;
      decor.push({ x, y, s: R(0.8, 1.15), kind: propTypes[Math.floor(R(0, propTypes.length))] });
    }

    (REGIONAL_LANDMARKS[region.id] || []).forEach((item) => {
      decor.push({ ...item, x: ox + item.x, y: oy + item.y });
    });
    // Vila removida da Região 1 conforme solicitado: a civilização e os serviços ficam concentrados no Castelo em Cinzas (Região 0)
  }

  function isRegionLandmarkKeepout(x, y) {
    const landmarks = [
      ...(REGIONAL_LANDMARKS[region.id] || []),
      { x: 220, y: 260 }, { x: 1680, y: 260 },
      { x: 240, y: 1240 }, { x: 1660, y: 1230 }
    ];
    return landmarks.some((item) => Math.hypot(x - item.x, y - item.y) < 110);
  }

  function populateRegion() {
    mobs.length = 0;
    nodes.length = 0;
    drops.length = 0;
    chests.length = 0;
    trees.length = 0;
    decor.length = 0;
    lightSources.length = 0;

    const ox = region.col * ZONE_W;
    const oy = region.row * ZONE_H;

    if (region.id === 0 || region.safeZone) {
      decor.push(
        // ─── BIBLIOTECA DE LIVROS NAS PAREDES (Parede Oeste & Noroeste) ───
        { x: ox + 245, y: oy + 540, s: 1.05, kind: 'library_bookshelf' },
        { x: ox + 245, y: oy + 630, s: 1.05, kind: 'library_bookshelf' },
        { x: ox + 245, y: oy + 720, s: 1.05, kind: 'library_bookshelf' },
        { x: ox + 245, y: oy + 810, s: 1.05, kind: 'library_bookshelf' },
        { x: ox + 245, y: oy + 900, s: 1.05, kind: 'library_bookshelf' },
        { x: ox + 360, y: oy + 195, s: 0.95, kind: 'library_bookshelf' },
        { x: ox + 460, y: oy + 195, s: 0.95, kind: 'library_bookshelf' },
        { x: ox + 560, y: oy + 195, s: 0.95, kind: 'library_bookshelf' },

        // ─── ESTÁTUAS DE MONSTROS EM PEDRA (Bastiões, Muralhas e Portões) ───
        // Bastiões dos 4 cantos
        { x: ox + 220, y: oy + 180, s: 1.15, kind: 'stone_gargoyle' },
        { x: ox + 1700, y: oy + 180, s: 1.15, kind: 'stone_dragon_statue' },
        { x: ox + 220, y: oy + 1300, s: 1.15, kind: 'stone_dragon_statue' },
        { x: ox + 1700, y: oy + 1300, s: 1.15, kind: 'stone_gargoyle' },

        // Guardiões do Portal do Bosque (Ala Sul)
        { x: ox + 830, y: oy + 1280, s: 1.15, kind: 'stone_dragon_statue' },
        { x: ox + 1090, y: oy + 1280, s: 1.15, kind: 'stone_dragon_statue' },

        // Guardiões da Muralha Norte
        { x: ox + 760, y: oy + 190, s: 1.05, kind: 'stone_gargoyle' },
        { x: ox + 1160, y: oy + 190, s: 1.05, kind: 'stone_gargoyle' },

        // Muralha Leste
        { x: ox + 1700, y: oy + 540, s: 1.05, kind: 'stone_gargoyle' },
        { x: ox + 1700, y: oy + 900, s: 1.05, kind: 'stone_gargoyle' }
      );

      // Apenas a Chama Ancestral Central e suave luz ambiente das alas (SEM postes nos quadrantes)
      lightSources.push(
        { x: ox + 960, y: oy + 720, rad: 220, color: '#f59e0b', pulse: 0.2 },
        { x: ox + 960, y: oy + 230, rad: 180, color: '#38bdf8', pulse: 0.22 },
        { x: ox + 960, y: oy + 1260, rad: 160, color: '#4ade80', pulse: 0.2 },
        { x: ox + 1620, y: oy + 650, rad: 170, color: '#f97316', pulse: 0.18 },
        { x: ox + 300, y: oy + 790, rad: 160, color: '#a855f7', pulse: 0.15 }
      );

      captureCurrentRegion();
      return;
    }

    if (restoreRegionState()) {
      addRegionLights(ox, oy);
      return;
    }


    // Thematic Monsters & Enemies by Region
    const regionMonsters = {
      1: ['slime_green', 'monster_treant', 'stone_golem_idle', 'monster_fire_skull', 'monster_mushroom_fiend'],
      2: ['monster_giant_frog', 'monster_swamp_witch', 'monster_ghost_spectre', 'monster_shadow_spirit'],
      3: ['monster_cave_ogre', 'monster_hell_hound', 'slime_magma', 'monster_spiked_crawler'],
      4: ['monster_vampire_lord', 'monster_flying_demon', 'monster_haunted_grimoire', 'slime_dark_void'],
      5: ['monster_reaper_death', 'monster_vampire_lord', 'monster_void_serpent', 'slime_gold']
    };
    const mobPool = region.generatedMap
      ? [region.enemy, region.enemy, region.enemy, 'monster_shadow_spirit']
      : regionMonsters[region.id] || regionMonsters[1];

    region.areas.slice(0, 4).forEach((area, areaIndex) => {
      for (let i = 0; i < 3; i++) {
        const chosenMob = mobPool[(areaIndex * 3 + i) % mobPool.length];
        const level = Math.floor(R(area.min, area.max + 1));
        mob(ox + area.x + R(-145, 145), oy + area.y + R(-100, 100), chosenMob, { level });
      }
    });
    const bossArea = region.areas[4];
    mob(ox + bossArea.x, oy + bossArea.y, region.bossSprite, {
      level: region.max, boss: true, name: region.bossName
    });

    // Thematic Resource Ore Nodes (Cursed, Magma, Gold, Iron, Amethyst, Quartz)
    const regionalOres = {
      1: ['ore_iron_silver', 'ore_gold_vein', 'ore_white_quartz'],
      2: ['ore_cyan_fissure', 'ore_amethyst_spire', 'ore_white_quartz'],
      3: ['ore_magma_lava', 'ore_gold_vein', 'ore_iron_silver'],
      4: ['ore_amethyst_spire', 'ore_cyan_fissure', 'ore_white_quartz'],
      5: ['ore_magma_lava', 'ore_cyan_fissure', 'ore_amethyst_spire']
    };
    const biomeOres = {
      swamp: ['ore_cyan_fissure', 'ore_amethyst_spire', 'ore_white_quartz'],
      snow: ['ore_white_quartz', 'ore_iron_silver', 'ore_cyan_fissure'],
      mountain: ['ore_magma_lava', 'ore_gold_vein', 'ore_iron_silver'],
      fortress: ['ore_amethyst_spire', 'ore_iron_silver', 'ore_white_quartz'],
      eclipse: ['ore_amethyst_spire', 'ore_cyan_fissure', 'ore_white_quartz'],
      cavern: ['ore_cyan_fissure', 'ore_white_quartz', 'ore_iron_silver'],
      iron: ['ore_iron_silver', 'ore_gold_vein', 'ore_cyan_fissure'],
      lava: ['ore_magma_lava', 'ore_gold_vein', 'ore_iron_silver'],
      abyss: ['ore_cyan_fissure', 'ore_amethyst_spire', 'ore_white_quartz'],
      crypt: ['ore_white_quartz', 'ore_amethyst_spire', 'ore_iron_silver'],
      tower: ['ore_amethyst_spire', 'ore_cyan_fissure', 'ore_white_quartz'],
      ash: ['ore_iron_silver', 'ore_white_quartz', 'ore_gold_vein'],
      chaos: ['ore_amethyst_spire', 'ore_cyan_fissure', 'ore_magma_lava'],
      ghosttown: ['ore_iron_silver', 'ore_gold_vein', 'ore_white_quartz']
    };
    const orePool = region.generatedMap
      ? biomeOres[region.biome] || regionalOres[1]
      : regionalOres[region.id] || regionalOres[1];

    for (let i = 0; i < 10; i++) {
      const kind = orePool[i % orePool.length];
      let x;
      let y;
      let attempts = 0;
      do {
        x = ox + R(460, 1480);
        y = oy + R(340, 1150);
        attempts++;
      } while (onTrail(x - ox, y - oy, 58) && attempts < 24);
      nodes.push({
        x,
        y,
        kind: kind,
        alive: true,
        back: 0
      });
    }

    // Mountain Landmarks and Formations
    const mountainFormations = region.generatedMap ? [] : [
      { x: ox + 220, y: oy + 260, kind: region.id === 3 ? 'mountain_mesa' : 'mountain_peak', s: 1.4 },
      { x: ox + 1680, y: oy + 260, kind: 'mountain_crag', s: 1.3 },
      { x: ox + 240, y: oy + 1240, kind: 'rock_plateau', s: 1.2 },
      { x: ox + 1660, y: oy + 1230, kind: region.id === 1 ? 'rock_moss_cluster' : 'mountain_crag', s: 1.3 }
    ];
    mountainFormations.forEach((mf) => decor.push(mf));

    // Thematic Chests by Region
    if (region.generatedMap) {
      const chestByBiome = {
        swamp: 'chest_spectral_teal', snow: 'chest_stone_moss', mountain: 'chest_goblin_rusty',
        fortress: 'chest_cursed_spiked', eclipse: 'chest_cursed_spiked', cavern: 'chest_spectral_teal',
        iron: 'chest_goblin_rusty', lava: 'chest_cursed_spiked', abyss: 'chest_spectral_teal',
        crypt: 'chest_stone_moss', tower: 'chest_spectral_teal', ash: 'chest_stone_moss',
        chaos: 'chest_cursed_spiked', ghosttown: 'chest_goblin_rusty'
      };
      const chestType = chestByBiome[region.biome] || 'chest_stone_moss';
      chests.push(
        { x: ox + 760, y: oy + 540, open: false, type: chestType, name: `Baú de ${region.name}` },
        { x: ox + 1240, y: oy + 520, open: false, type: chestType, name: `Relicário de ${region.name}` },
        { x: ox + 1300, y: oy + 920, open: false, type: chestType, name: `Tesouro de ${region.name}` }
      );
    } else if (region.id === 1) {
      // Bosque das Ruínas: Baú de Pedra com Musgo e Baú Goblin
      chests.push(
        { x: ox + 760, y: oy + 540, open: false, type: 'chest_stone_moss', name: 'Baú de Pedra das Ruínas' },
        { x: ox + 1240, y: oy + 520, open: false, type: 'chest_goblin_rusty', name: 'Baú Goblin Enferrujado' },
        { x: ox + 1300, y: oy + 920, open: false, type: 'chest_stone_moss', name: 'Baú de Pedra Antigo' }
      );
    } else if (region.id === 2) {
      // Pântano Espectral: Baú Espectral Rúnico e Baú de Pedra
      chests.push(
        { x: ox + 760, y: oy + 540, open: false, type: 'chest_spectral_teal', name: 'Baú Espectral de Mana' },
        { x: ox + 1240, y: oy + 520, open: false, type: 'chest_stone_moss', name: 'Baú Perdido do Pântano' },
        { x: ox + 1300, y: oy + 920, open: false, type: 'chest_spectral_teal', name: 'Baú de Cristal Arcano' }
      );
    } else if (region.id === 3) {
      // Montanhas Rubras: Baú Goblin e Baú de Obsidiana
      chests.push(
        { x: ox + 760, y: oy + 540, open: false, type: 'chest_goblin_rusty', name: 'Baú dos Saqueadores' },
        { x: ox + 1240, y: oy + 520, open: false, type: 'chest_cursed_spiked', name: 'Baú de Ferro Vulcânico' },
        { x: ox + 1300, y: oy + 920, open: false, type: 'chest_goblin_rusty', name: 'Tesouro da Montanha' }
      );
    } else {
      // Cidadela & Trono: Baú Amaldiçoado e Baú Espectral Rúnico
      chests.push(
        { x: ox + 760, y: oy + 540, open: false, type: 'chest_cursed_spiked', name: 'Baú Proibido de Obsidiana' },
        { x: ox + 1240, y: oy + 520, open: false, type: 'chest_spectral_teal', name: 'Relicário do Eclipse' },
        { x: ox + 1300, y: oy + 920, open: false, type: 'chest_cursed_spiked', name: 'Baú das Almas Negras' }
      );
    }

    // Dynamic Light Sources (Campfires, Lamp posts, Torches)
    addRegionLights(ox, oy);

    populateRegionEnvironment(ox, oy);
    captureCurrentRegion();
  }

  populateRegion();
  initAmbientParticles();
  if (legacyMapSave) save();

  function regionAt(x, y) {
    const col = Math.floor(x / ZONE_W);
    const row = Math.floor(y / ZONE_H);
    return REGIONS.find((r) => r.col === col && r.row === row) || null;
  }

  function currentQuest() {
    if (!questStates[region.id]) {
      questStates[region.id] = {
        kills: region.id === 1 ? Math.min(kills, 4) : 0,
        ore: region.id === 1 ? Math.min(ore, 5) : 0,
        loot: region.id === 1 ? Math.min(loot, 4) : 0,
        claimed: region.id === 1 && claimed
      };
    }
    const quest = questStates[region.id];
    quest.kills = C(Number(quest.kills) || 0, 0, 4);
    quest.ore = C(Number(quest.ore) || 0, 0, 5);
    quest.loot = C(Number(quest.loot) || 0, 0, 4);
    quest.claimed = !!quest.claimed;
    return quest;
  }

  function progressQuest(kind, amount = 1) {
    const quest = currentQuest();
    const limit = kind === 'kills' ? 4 : kind === 'ore' ? 5 : 4;
    quest[kind] = Math.min(limit, quest[kind] + amount);
    if (kind === 'kills') questManager.onProgress('kill', amount);
    if (kind === 'ore') questManager.onProgress('mine', amount);
    if (kind === 'loot') questManager.onProgress('chest', amount);
  }

  function onTrail(lx, ly, margin = 72) {
    return Math.abs(lx - 960) < margin || Math.abs(ly - 704) < margin;
  }

  function updateWorldRegion() {
    if (dungeonMode) return;
    const next = regionAt(p.x, p.y);
    if (!next) {
      p.x = C(p.x, region.col * ZONE_W + 30, (region.col + 1) * ZONE_W - 30);
      p.y = C(p.y, region.row * ZONE_H + 30, (region.row + 1) * ZONE_H - 30);
      goal = null;
      route = [];
      return;
    }
    const previous = REGIONS.find((candidate) => candidate.id === next.id - 1);
    const bossGateLocked = Boolean(previous?.bossName && !bossDefeats[previous.id]);
    if (!isRegionUnlocked(next.id)) {
      p.x = C(p.x, region.col * ZONE_W + 30, (region.col + 1) * ZONE_W - 30);
      p.y = C(p.y, region.row * ZONE_H + 30, (region.row + 1) * ZONE_H - 30);
      goal = null;
      route = [];
      if (!updateWorldRegion.locked) {
        msg(p.lvl < next.unlocks
          ? 'Nível ' + next.unlocks + ' necessário para entrar em ' + next.name
          : 'Derrote ' + previous.bossName + ' para abrir o caminho.');
        updateWorldRegion.locked = true;
      }
      return;
    }
    updateWorldRegion.locked = false;
    if (next.id !== region.id) {
      captureCurrentRegion();
      regionIndex = REGIONS.findIndex((candidate) => candidate.id === next.id);
      region = next;
      enemy = null;
      object = null;
      route = [];
      populateRegion();
      updateRegionUI();
      audio.startAmbientMusic(region.id);
      save();
      msg('Nova região: ' + region.name);
    }
  }

  function D(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function movePlayer(dx, dy) {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 10));
    const stepX = dx / steps;
    const stepY = dy / steps;
    for (let i = 0; i < steps; i++) {
      const ox = region.col * ZONE_W;
      const oy = region.row * ZONE_H;
      const nextX = dungeonMode ? C(p.x + stepX, ox + 110, ox + ZONE_W - 110) : C(p.x + stepX, ox + 30, ox + ZONE_W - 30);
      const nextY = dungeonMode ? C(p.y + stepY, oy + 100, oy + ZONE_H - 100) : C(p.y + stepY, oy + 30, oy + ZONE_H - 30);
      if (!terrain.blockedAt(nextX, p.y, 14, trees, decor)) p.x = nextX;
      if (!terrain.blockedAt(p.x, nextY, 14, trees, decor)) p.y = nextY;
    }
  }

  function setDestination(point) {
    const targetRegion = regionAt(point.x, point.y);
    route = targetRegion?.id === region.id
      ? terrain.findPath(p, point, region, ZONE_W, ZONE_H, trees, decor)
      : [];
    goal = route.length ? route.shift() : point;
  }

  function msg(t) {
    const toastEl = $('#toast');
    if (!toastEl) return;
    toastEl.textContent = t;
    toastEl.classList.add('show');
    toast = 2.4;
  }
  if (window.TalentTree) window._ttMsg = msg;

  function updateRegionUI() {
    const z = document.querySelector('.zone');
    if (z) {
      z.innerHTML = dungeonMode
        ? '<span class="zone-tag">MASMORRA · ANDAR ' + String(dungeonSession?.floor || 1).padStart(2, '0') + '</span><b>' + region.dungeonName + '</b>'
        :
        '<span class="zone-tag">REGIÃO ' +
        String(region.id).padStart(2, '0') +
        ' · ' +
        region.name +
        '</span><b>' +
        region.subtitle +
        '</b>';
      z.dataset.region = region.id;
    }
    const a = document.querySelector('#world');
    if (a) a.dataset.region = region.id;
    const m = document.querySelector('.map');
    if (m) m.title = dungeonMode ? region.dungeonName + ' · andar ' + (dungeonSession?.floor || 1) : region.name + ' · níveis ' + region.min + '–' + region.max;

    if (dungeonMode && dungeonSession) {
      const aliveMobs = mobs.filter(f => f.alive && !isNaN(f.hp) && f.hp > 0);
      const isBossFloor = dungeonSession.floor % 5 === 0;
      const bossAlive = aliveMobs.some(f => f.boss);
      const chestsOpen = chests.filter(c => c.open).length;
      dungeonTrackerUI.update({
        dungeonName: region.dungeonName,
        floor: dungeonSession.floor,
        totalFloors: DUNGEON_FLOORS,
        mobsAlive: aliveMobs.length,
        mobsTotal: mobs.length,
        chestsOpen,
        chestsTotal: chests.length,
        isCleared: dungeonSession.cleared || aliveMobs.length === 0,
        isBossFloor,
        bossAlive
      });
    } else {
      dungeonTrackerUI.hide();
    }
  }
  updateRegionUI();

  function syncAutoButton() {
    const b = $('#autoToggle');
    if (!b) return;
    b.setAttribute('aria-pressed', String(autoPlay));
    b.classList.toggle('active', autoPlay);
    const s = b.querySelector('.auto-state');
    if (s) s.textContent = autoPlay ? 'ON' : 'OFF';
  }

  function setAutoPlay(enabled) {
    autoPlay = enabled;
    key.clear();
    route = [];
    autoTarget = null;
    goal = null;
    enemy = null;
    object = null;
    syncAutoButton();
    msg(autoPlay ? 'Automático ligado · combate, cura, coleta e exploração' : 'Automático desligado');
  }

  function xp(n) {
    if (cinzasNet?.party?.members?.length > 1) {
      n = Math.round(n * 1.20);
    }
    const MAX = progression.MAX_LEVEL || 300;
    if (p.lvl >= MAX) {
      p.xp = 0;
      p.need = 0;
      msg('Nível máximo alcançado · ' + MAX);
      return;
    }
    p.xp += n;
    addFloatingText(p.x, p.y - 20, '+' + n + ' XP', '#6ee5e8', 12);
    while (p.xp >= p.need && p.lvl < MAX) {
      p.xp -= p.need;
      p.lvl++;
      if (p.lvl % 5 === 0) {
        p.talentPoints++;
        addFloatingText(p.x, p.y - 55, '+1 PONTO DE TALENTO', '#d5a8ff', 12);
      }
      p.need = progression.xpNeeded(p.lvl);
      p.max += window.GameClasses.get(p.classId).hpPerLevel;
      p.hp = p.max;
      audio.playLevelUp();
      addFloatingText(p.x, p.y - 35, 'LEVEL UP! Nv. ' + p.lvl, '#ffd700', 16);
      sparks(p.x, p.y, '#ffd700', 25);
      const unlocked = REGIONS[regionForLevel(p.lvl)];
      if (unlocked && unlocked.unlocks === p.lvl) msg('Nível ' + p.lvl + '! ' + unlocked.name + ' requer o guardião da região anterior.');
      else msg('Nível ' + p.lvl + '! Vida restaurada.');
    }
    if (p.lvl >= MAX) {
      p.xp = 0;
      p.need = 0;
    }
    save();
    renderUI({ p, kills, ore, loot, quest: currentQuest() });
  }

  function sparks(x, y, col, n) {
    for (let i = 0; i < n; i++) {
      parts.push({
        x,
        y,
        vx: R(-80, 80),
        vy: R(-90, 25),
        t: R(0.3, 0.7),
        maxT: R(0.3, 0.7),
        col
      });
    }
  }

  function emitCombatEffect(kind, x, y, color, options = {}) {
    combatEffects.push({ kind, x, y, color, started: performance.now(), duration: options.duration || 420, radius: options.radius || 72, dir: options.dir || p.dir || 'south' });
    if (combatEffects.length > 48) combatEffects.splice(0, combatEffects.length - 48);
  }

  function hurt(m, now, dmg = progression.meleeDamage(p.lvl, p.swordEquipped, p.weaponTier, p.classId) + (window.GameItems?.getEquipmentBonuses?.()?.damage || 0), damageType = 'physical', force = false) {
    const hasTalent = (id) => p.talents.includes(id);
    if (!m.alive || (!force && now - m.hit < (hasTalent('storm') ? 365 : 430))) return;
    if (p.classId === 'barbaro' && p.berserkUntil > now) dmg = Math.round(dmg * 1.4);
    m.hit = now;
    p.attackAt = now;
    p.attackTarget = { x: m.x, y: m.y };
    const attackStyle = {
      arqueiro: ['burst', '#8ee5a5'], assasino: ['slash', '#c084fc'],
      barbaro: ['impact', '#fb704d'], clerigo: ['holy', '#ffe17a'],
      mago: ['arcane', '#75d9ff'], guerreiro: ['impact', '#f5d37b']
    }[p.classId] || ['impact', '#f5d37b'];
    emitCombatEffect(attackStyle[0], m.x, m.y - 12, attackStyle[1], { duration: 310, radius: 42, dir: p.dir });
    if (cinzasNet?.isConnected) {
      cinzasNet.sendAction({ kind: attackStyle[0], x: m.x, y: m.y - 12, color: attackStyle[1], dir: p.dir });
    }

    // 3-Hit Combo System
    p.combo = (p.combo || 0);
    const comboAge = now - (p.lastComboAt || 0);
    if (comboAge < 850) {
      p.combo = (p.combo + 1) % 3;
    } else {
      p.combo = 0;
    }
    p.lastComboAt = now;

    let comboDamageMult = 1.0;
    let isFinisher = false;
    if (p.combo === 1) {
      comboDamageMult = 1.18;
    } else if (p.combo === 2) {
      comboDamageMult = 1.6;
      isFinisher = true;
      screenShake = Math.max(screenShake, 6);
      sparks(m.x, m.y, '#f59e0b', 24);
      emitCombatEffect('ground_explosion', m.x, m.y - 10, '#f59e0b', { duration: 640, radius: 96 });
      addFloatingText(p.x, p.y - 48, ' COMBO 3: ESTOCADA! ', '#f59e0b', 16);
    }

    const equipBonuses = window.GameItems?.getEquipmentBonuses?.() || { damage: 0, defense: 0, hp: 0, arcane: 0, crit: 0, lifesteal: 0 };
    const levelEdge = p.lvl - m.level;
    const defense = Math.max(0, Math.floor(m.level * 0.08)) + (m.boss ? 4 : 0);
    const characterClass = (window.GameClasses?.get ? window.GameClasses.get(p.classId) : null) || {};
    const critMult = Number(characterClass.critMultiplier) || 1.5;
    const totalCrit = (Number(characterClass.critChance) || 0.05) + (Number(equipBonuses.crit) || 0) + (isFinisher ? 0.35 : 0);
    const critical = totalCrit > 0 && Math.random() < totalCrit;
    if (critical) screenShake = Math.max(screenShake, isFinisher ? 8 : 4.5);
    const adjustedDamage = (Number(dmg) || 10) + (levelEdge === 0 ? 3 : levelEdge > 0 ? Math.min(12, levelEdge) : -Math.min(12, Math.abs(levelEdge))) - defense;
    const ttLevel = (id) => (window.TalentTree ? window.TalentTree.getInvested(id) : 0);
    const treeDamageBonus = 1 + (ttLevel('g_golpe') * 0.04) + (ttLevel('g_berserker') * 0.08)
      + (ttLevel('a_perfuro') * 0.05) + (ttLevel('as_lamina') * 0.05) + (ttLevel('b_furia1') * 0.05)
      + (damageType === 'arcane' ? (ttLevel('m_fogo1') * 0.06 + ttLevel('m_arc1') * 0.05 + ttLevel('c_sag1') * 0.06 + equipBonuses.arcane * 0.01) : 0);
    const talentMultiplier = (damageType === 'arcane'
      ? (hasTalent('fire') ? 1.1 : 1) * (hasTalent('warcry') ? 1.12 : 1) * (hasTalent('avatar') ? 1.12 : 1)
      : (hasTalent('brutal') ? 1.08 : 1) * (hasTalent('avatar') ? 1.12 : 1)) * treeDamageBonus;
    let finalDamage = Math.max(1, Math.round((Number(adjustedDamage) || 1) * (critical ? critMult : 1) * (Number(talentMultiplier) || 1) * (Number(comboDamageMult) || 1)));
    if (isNaN(finalDamage) || !isFinite(finalDamage) || finalDamage < 1) finalDamage = 1;
    if (m.boss && m.runeShield && now < m.runeShield) {
      finalDamage = Math.max(1, Math.round(finalDamage * 0.5));
      addFloatingText(m.x, m.y - 25, 'ESCUDO RÚNICO (−50%)', '#cd77f7', 12);
    }
    const lifesteal = ttLevel('g_sede') * 0.02 + ttLevel('pa_luz2') * 0.01 + (equipBonuses.lifesteal || 0);
    if (lifesteal > 0 && p.hp < p.max) {
      p.hp = Math.min(p.max, p.hp + Math.max(1, Math.round(finalDamage * lifesteal)));
    }
    m.hp = (Number(m.hp) || 0) - finalDamage;

    // Sincronização de combate cooperativo em tempo real
    if (cinzasNet?.isConnected && m.id) {
      cinzasNet.sendMobHit({
        mobId: m.id,
        dmg: finalDamage,
        hp: m.hp,
        maxHp: m.max,
        isCrit: critical,
        boss: m.boss,
        mobName: m.bossName || m.t,
        x: m.x,
        y: m.y
      });
    }

    if (m.boss && m.hp > 0 && m.hp <= m.max * 0.5 && !m.phase2Triggered) {
      m.phase2Triggered = true;
      m.sp = Math.round(m.sp * 1.25);
      addFloatingText(m.x, m.y - 82, ' FASE 2: FÚRIA! ', '#ff3344', 16);
      if (audio?.playLevelUp) audio.playLevelUp();
      sparks(m.x, m.y, '#ff4d4d', 35);
      msg(m.bossName + ' entrou na FASE 2 (FÚRIA)! Habilidades e velocidade aumentadas!');
    }
    if (p.classId === 'arqueiro') {
      arrowShots.push({ x1: p.x, y1: p.y - 18, x2: m.x, y2: m.y - 22, life: 0.24, maxLife: 0.24, type: 'arrow' });
    } else if (p.classId === 'mago') {
      arrowShots.push({ x1: p.x, y1: p.y - 22, x2: m.x, y2: m.y - 22, life: 0.28, maxLife: 0.28, type: 'magic' });
    }
    if (audio?.playSlash) audio.playSlash();
    if (audio?.playHit) audio.playHit();
    sparks(m.x, m.y, '#ffe49e', 10);
    emitCombatEffect('hit_spark', m.x, m.y - 12, '#ffe49e', { duration: 220, radius: 48 });
    addFloatingText(m.x, m.y - 10, (critical ? 'CRÍTICO ' : '') + '-' + finalDamage, critical ? '#ffd65a' : '#ff5555', m.boss ? 17 : 14);

    if (isNaN(m.hp) || m.hp <= 0) {
      killMob(m, now);
    }
  }

  function killMob(m, now = performance.now()) {
    if (!m || !m.alive) return;
    m.hp = 0;
    m.alive = false;
    m.windup = false;
    m.aggro = false;
    if (m.t === 'boss_ashen_golem') m.deathStartedAt = now;
    m.back = now + (m.boss ? 120000 : 16000);
    if (enemy === m) enemy = null;

    try {
      kills++;
      if (m.t !== 'boss_ashen_golem') {
        emitCombatEffect('enemy_death', m.x, m.y - 15, '#e86e8a', { duration: 580, radius: 64 });
      }
      const codexKey = m.boss ? 'boss:' + region.id : String(m.t || 'criatura');
      codexKills[codexKey] = (Number(codexKills[codexKey]) || 0) + 1;
      const codexTotal = Object.values(codexKills).reduce((sum, count) => sum + (Number(count) || 0), 0);
      [[25, '25'], [75, '75'], [150, '150']].forEach(([milestone, key]) => {
        if (codexTotal >= milestone && !codexMilestones[key]) {
          codexMilestones[key] = true;
          p.talentPoints++;
          p.emberShards++;
          msg(`Codex ${milestone} registros · +1 ponto de talento e +1 Fragmento de Brasa`);
        }
      });
      if (!dungeonMode) progressQuest('kills');
      const reward = progression.enemyXp(m.level, p.lvl, m.elite ? 'elite' : m.boss ? 'boss' : 'comum');
      xp(reward);
      sparks(m.x, m.y, '#e86e8a', 20);
      drops.push({
        x: m.x,
        y: m.y,
        kind: m.boss ? 'gold' : Math.random() < 0.6 ? 'crystal' : 'gold',
        v: m.boss ? 100 + region.id * 60 : 18 + region.id * 6,
        dungeon: dungeonMode,
        phase: 0
      });
      const firstRegionClear = m.boss && !dungeonMode && !bossDefeats[region.id];
      if (m.boss) {
        // Encerra imediatamente lacaios invocados pelo chefe
        mobs.forEach((minion) => {
          if (minion.isMinion && minion.alive) {
            minion.alive = false;
            minion.hp = 0;
            emitCombatEffect('enemy_death', minion.x, minion.y - 10, '#e86e8a', { duration: 360, radius: 36 });
          }
        });
        if (!dungeonMode) {
          bossDefeats[region.id] = true;
          questManager.onProgress('boss', 1, { regionId: region.id });
          if (firstRegionClear) {
            p.emberShards += 2;
            msg('Guardião vencido pela primeira vez · +2 Fragmentos de Brasa');
          }
        } else {
          questManager.onProgress('dungeon_boss', 1, { regionId: region.id, floor: dungeonSession?.floor });
        }
        drops.push({ x: m.x + 24, y: m.y, kind: 'crystal', amount: region.id + 1, dungeon: dungeonMode, phase: 0 });
        msg((dungeonMode
          ? 'Chefe do andar ' + dungeonSession.floor + ' derrotado · saque especial disponível!'
          : REGIONS.some((candidate) => candidate.id === region.id + 1)
            ? 'Guardião derrotado · caminho para ' + REGIONS.find((candidate) => candidate.id === region.id + 1).name + ' aberto!'
            : 'Vharok derrotado · você concluiu a jornada até o nível 300!') + (firstRegionClear ? ' · +2 Fragmentos de Brasa' : ''));
      } else {
        msg('Inimigo Nv. ' + m.level + ' derrotado · +' + reward + ' XP');
      }

      // Chance de saque do Arsenal Heroico (Armas da Classe, Elmos, Escudos, Anéis e Amuletos)
      if (!dungeonMode && (m.boss || (m.elite && Math.random() < 0.35))) {
        const reg = Math.min(5, region.id || 0);
        const numStr = (reg === 0) ? ['01', '02', '03']
                     : (reg === 1) ? ['04', '05', '06']
                     : (reg === 2) ? ['07', '08', '09', '10']
                     : (reg === 3) ? ['11', '12', '13', '14']
                     : (reg === 4) ? ['14', '15', '16', '17']
                     : ['17', '18', '19', '20'];
        const pickNum = numStr[Math.floor(Math.random() * numStr.length)];
        
        let dropItemId;
        if (Math.random() < 0.55) {
          const classWeaponPrefix = {
            guerreiro: 'sword_hero',
            arqueiro: 'w_bow_hero',
            barbaro: 'w_axe_hero',
            clerigo: 'w_mace_hero',
            assasino: 'w_dagger_hero',
            mago: 'w_staff_hero'
          };
          const pPrefix = classWeaponPrefix[p.classId] || 'sword_hero';
          if (pPrefix === 'sword_hero') {
            const swordMap = {
              '01': 'w_adaga_errante', '02': 'w_espada_treino', '03': 'w_gladio_guarnicao',
              '04': 'w_espada_larga_ferro', '05': 'w_bastarda_forjada', '06': 'w_longa_aco',
              '07': 'w_florete_duelo', '08': 'w_lamina_esmeralda_pantano', '09': 'w_flamberge_cruzado', '10': 'w_lamina_bronze_antigo',
              '11': 'w_montante_pedra', '12': 'w_espada_safira_azul', '13': 'w_lamina_prata_vigilia', '14': 'w_cimitarra_deserto',
              '15': 'w_espada_meia_noite', '16': 'w_lamina_sol_radiante', '17': 'w_espada_obsidiana_abismo',
              '18': 'w_espada_ametista_espectral', '19': 'w_sagrada_aurora_eterna', '20': 'w_reliquia_cinco_selos'
            };
            dropItemId = swordMap[pickNum] || 'w_adaga_errante';
          } else {
            dropItemId = `${pPrefix}_${pickNum}`;
          }
        } else {
          const gearTypes = ['hl_hero', 'sh_hero', 'acc_ring_hero', 'acc_amulet_hero'];
          const chosenGear = gearTypes[Math.floor(Math.random() * gearTypes.length)];
          dropItemId = `${chosenGear}_${pickNum}`;
        }

        if (window.GameItems?.addItem && dropItemId) {
          window.GameItems.addItem(dropItemId);
          const base = window.GameItems.ITEM_DATABASE[dropItemId];
          if (base) {
            const rar = window.DungeonDrops?.RARITY[base.rarity] || { color: '#fbbf24', label: base.rarity };
            msg(`${base.icon || ''} Saque Heroico: ${base.name} [${(base.rarity || 'comum').toUpperCase()}]!`);
            addFloatingText(m.x, m.y - 35, `${base.icon || ''} ${base.name}!`, rar.color, 16);
            if (audio?.playLevelUp) audio.playLevelUp();
          }
        }
      }
      if (dungeonMode) {
        rollDungeonLoot(m.x, m.y, !!m.boss);
        if (m.boss && dungeonSession.floor % 5 === 0) {
          dungeonSession.bossDefeated = true;
          const ox = region.col * ZONE_W;
          const oy = region.row * ZONE_H;
          const cx = ox + 960;
          const cy = oy + 760;
          if (!chests.some(c => c.bossChest && Math.hypot(c.x - cx, c.y - cy) < 60)) {
            chests.push({
              x: cx,
              y: cy,
              open: false,
              dungeon: true,
              bossChest: true,
              floor: dungeonSession.floor,
              type: 'chest_cursed_spiked',
              name: 'Grande Baú do Chefe da Masmorra'
            });
            addFloatingText(cx, cy - 35, '✨ GRANDE BAÚ DO CHEFE SURGIU! ✨', '#ffd700', 20);
            sparks(cx, cy, '#ffd700', 60);
            if (audio?.playLevelUp) audio.playLevelUp();
            msg('👑 O Chefe sucumbiu! O Grande Baú do Chefe surgiu no centro da arena!');
          }
        }
        dungeonSession.cleared = mobs.every((foe) => !foe.alive);
        if (dungeonSession.cleared && dungeonSession.floor === 5 && dungeonSession.bossDefeated) currentDungeonMission().boss = true;
      }
      renderUI({ p, kills, ore, loot, quest: currentQuest() });
      save();
      if (m.boss && tabs[0]?.classList.contains('active')) showTab(0);
      if (dungeonMode && tabs[4]?.classList.contains('active')) showTab(4);
      if (tabs[5]?.classList.contains('active')) showTab(5);
      if (tabs[2]?.classList.contains('active')) updateBagUI();
    } catch (err) {
      console.error('Erro no processamento da morte do inimigo:', err);
    }
  }

  function skill(k, now) {
    k = Number(k);
    if (p.cd[k] > 0) return;
    const castContext = captureCombatContext();

    if (k === 1) {
      if (p.hp >= p.max) return msg('Sua vida já está completa.');
      if (p.potions <= 0) return msg('Você não tem poções de cura.');
      const heal = Math.round(42 * window.GameClasses.get(p.classId).healing);
      p.hp = Math.min(p.max, p.hp + heal);
      p.potions--;
      p.cd[1] = 9;
      audio.playHeal();
      sparks(p.x, p.y, '#52f582', 20);
      for (let i = 0; i < 14; i++) {
        parts.push({
          x: p.x + R(-14, 14),
          y: p.y + R(-10, 10),
          vx: R(-15, 15),
          vy: R(-65, -30),
          t: R(0.5, 0.8),
          maxT: 0.8,
          col: '#52f582'
        });
      }
      addFloatingText(p.x, p.y - 25, '+' + heal + ' HP', '#52f582', 16);
      msg('Poção de cura usada · +' + heal + ' HP.');
    }

    if (k === 2) {
      p.cd[2] = 6;
      let targets = mobs
        .filter((m) => m.alive && D(m, p) < 220)
        .sort((a, b) => D(a, p) - D(b, p))
        .slice(0, 3);

      if (!targets.length) {
        p.cd[2] = 1;
        msg('Nenhum inimigo ao alcance.');
      } else {
        const signature = {
          guerreiro: { color: '#f5d37b', kind: 'impact', type: 'physical', name: 'Corte de Guarda' },
          arqueiro: { color: '#8ee5a5', kind: 'burst', type: 'physical', name: 'Disparo Perfurante' },
          assasino: { color: '#c084fc', kind: 'slash', type: 'physical', name: 'Lâmina Sombria' },
          barbaro: { color: '#fb704d', kind: 'impact', type: 'physical', name: 'Golpe Demolidor' },
          clerigo: { color: '#ffe17a', kind: 'holy', type: 'holy', name: 'Selo Radiante' },
          mago: { color: '#75d9ff', kind: 'arcane', type: 'arcane', name: 'Raio Arcano' }
        }[p.classId];
        audio.playArcane();
        emitCombatEffect('ring', p.x, p.y, signature.color, { duration: 460, radius: 84 });
        targets.forEach((m) => {
          if (p.classId === 'mago') {
            lightningArcs.push({ sx: p.x, sy: p.y - 15, tx: m.x, ty: m.y - 15, life: 0.25 });
          } else if (p.classId === 'arqueiro') {
            arrowShots.push({ x1: p.x, y1: p.y - 18, x2: m.x, y2: m.y - 18, life: 0.22, maxLife: 0.22, type: 'arrow' });
          } else {
            emitCombatEffect(signature.kind, m.x, m.y - 10, signature.color, { duration: 360, radius: 46 });
          }
          const damage = p.classId === 'mago' || p.classId === 'clerigo'
            ? progression.arcaneDamage(p.lvl, p.classId)
            : Math.round(progression.meleeDamage(p.lvl, p.swordEquipped, p.weaponTier, p.classId) * (p.classId === 'barbaro' ? 1.2 : 1.05));
          hurt(m, now, damage, signature.type, true);
          if (p.classId === 'barbaro' && m.alive) {
            const len = Math.max(1, D(m, p));
            m.x += ((m.x - p.x) / len) * 22;
            m.y += ((m.y - p.y) / len) * 22;
          }
        });
        msg(signature.name + ' · ' + targets.length + ' alvo(s).');
      }
    }

    if (k === 3) {
      p.shield = 6;
      p.cd[3] = 12;
      audio.playShield();
      const shieldColor = { arqueiro: '#8ee5a5', assasino: '#c084fc', barbaro: '#fb704d', clerigo: '#ffe17a', mago: '#75d9ff', guerreiro: '#7cebf4' }[p.classId] || '#7cebf4';
      emitCombatEffect('ring', p.x, p.y, shieldColor, { duration: 620, radius: 76 });
      sparks(p.x, p.y, shieldColor, 16);
      addFloatingText(p.x, p.y - 25, 'ESCUDO ATIVO', shieldColor, 12);
      msg('Escudo de cinzas ativo.');
    }

    if (k === 4) {
      p.cd[4] = 4;
      audio.playDash();
      const dashDist = 140;
      const startX = p.x;
      const startY = p.y;
      const dashVector = {
        east: [1, 0], west: [-1, 0], north: [0, -1], south: [0, 1],
        'north-east': [Math.SQRT1_2, -Math.SQRT1_2], 'north-west': [-Math.SQRT1_2, -Math.SQRT1_2],
        'south-east': [Math.SQRT1_2, Math.SQRT1_2], 'south-west': [-Math.SQRT1_2, Math.SQRT1_2]
      }[p.dir] || [p.face, 0];
      movePlayer(dashVector[0] * dashDist, dashVector[1] * dashDist);

      p.dashTrail.push(
        { x: startX, y: startY, alpha: 0.8 },
        { x: (startX + p.x) / 2, y: (startY + p.y) / 2, alpha: 0.6 }
      );
      const dashColor = { arqueiro: '#8ee5a5', assasino: '#c084fc', barbaro: '#fb704d', clerigo: '#ffe17a', mago: '#75d9ff', guerreiro: '#d9f7bd' }[p.classId] || '#d9f7bd';
      emitCombatEffect('burst', startX, startY, dashColor, { duration: 420, radius: 54 });
      emitCombatEffect('ring', p.x, p.y, dashColor, { duration: 360, radius: 44 });

      sparks(p.x, p.y, '#d9f7bd', 16);
      for (let i = 0; i < 10; i++) {
        parts.push({
          x: startX + R(-8, 8),
          y: startY + R(-6, 6),
          vx: R(-25, 25),
          vy: R(-20, 10),
          t: R(0.25, 0.45),
          maxT: 0.45,
          col: '#ded8bd'
        });
      }
      msg('Investida rápida!');
    }

    if (k === 5) {
      const cls = window.GameClasses?.get ? window.GameClasses.get(p.classId) : {};
      const sk5 = cls.skill5 || { cd: 8, name: 'Habilidade de Área' };
      p.cd[5] = sk5.cd || 8;
      const skillColor = { arqueiro: '#86efac', assasino: '#d8b4fe', barbaro: '#fb704d', clerigo: '#fde047', mago: '#fb923c', guerreiro: '#fde047' }[p.classId] || '#fde047';
      emitCombatEffect('ring', enemy?.alive ? enemy.x : p.x, enemy?.alive ? enemy.y : p.y, skillColor, { duration: 650, radius: 150 });

      if (p.classId === 'mago') {
        if (audio.playMeteor) audio.playMeteor();
        else audio.playArcane();
        msg('Tempestade de Meteoros invocada!');
        addFloatingText(p.x, p.y - 35, '️ METEOROS!', '#f97316', 17);
        const targetX = enemy?.alive ? enemy.x : p.x + p.face * 110;
        const targetY = enemy?.alive ? enemy.y : p.y;
        for (let m = 0; m < 3; m++) {
          const mx = targetX + R(-75, 75);
          const my = targetY + R(-55, 55);
          hazardZones.push({
            x: mx, y: my, rad: 55, createdAt: now + m * 200, duration: 650,
            color: '#ff6622', label: 'METEORO', damage: Math.round(progression.arcaneDamage(p.lvl, p.classId) * 1.8),
            isPlayerZone: true
          });
        }
      } else if (p.classId === 'arqueiro') {
        audio.playArcane();
        msg('Chuva de Flechas disparada!');
        addFloatingText(p.x, p.y - 35, ' CHUVA DE FLECHAS!', '#86efac', 17);
        const targetX = enemy?.alive ? enemy.x : p.x + p.face * 130;
        const targetY = enemy?.alive ? enemy.y : p.y;
        for (let a = 0; a < 8; a++) {
          const ax = targetX + R(-80, 80);
          const ay = targetY + R(-60, 60);
          arrowShots.push({
            x1: ax + R(-25, 25),
            y1: ay - 320,
            x2: ax,
            y2: ay,
            life: 0.35 + a * 0.04,
            maxLife: 0.35 + a * 0.04,
            type: 'arrow'
          });
        }
        setTimeout(() => {
          if (!isCombatContextCurrent(castContext)) return;
          mobs.filter(m => m.alive && Math.hypot(m.x - targetX, m.y - targetY) < 120).forEach(m => {
            hurt(m, performance.now(), Math.round(progression.meleeDamage(p.lvl, p.swordEquipped, p.weaponTier, p.classId) * 1.6), 'physical', true);
            sparks(m.x, m.y, '#86efac', 14);
          });
        }, 320);
      } else if (p.classId === 'assasino') {
        audio.playSlash();
        msg('Dança das Sombras ativada!');
        addFloatingText(p.x, p.y - 35, '️ DANÇA DAS SOMBRAS!', '#d8b4fe', 17);
        const targets = mobs.filter(m => m.alive && D(m, p) < 240).slice(0, 4);
        targets.forEach((m, idx) => {
          setTimeout(() => {
            if (!isCombatContextCurrent(castContext) || !m.alive || !mobs.includes(m)) return;
            p.dashTrail.push({ x: p.x, y: p.y, alpha: 0.8 });
            p.x = m.x - p.face * 20;
            p.y = m.y;
            hurt(m, performance.now(), Math.round(progression.meleeDamage(p.lvl, p.swordEquipped, p.weaponTier, p.classId) * 1.9), 'critical', true);
            audio.playSlash();
            sparks(m.x, m.y, '#c084fc', 16);
          }, idx * 110);
        });
        if (!targets.length) msg('Nenhum inimigo próximo para a Dança.');
      } else if (p.classId === 'clerigo') {
        audio.playShield();
        const heal = Math.round(95 * (cls.healing || 1.35));
        p.hp = Math.min(p.max, p.hp + heal);
        emitCombatEffect('holy', p.x, p.y - 4, '#fef08a', { duration: 760, radius: 190 });
        addFloatingText(p.x, p.y - 35, '️ +' + heal + ' HP SAGRADO!', '#fef08a', 18);
        sparks(p.x, p.y, '#fef08a', 30);
        mobs.filter(m => m.alive && D(m, p) < 180).forEach(m => {
          hurt(m, now, Math.round(progression.arcaneDamage(p.lvl, p.classId) * 1.65), 'holy', true);
          sparks(m.x, m.y, '#fde047', 15);
        });
        msg('Julgamento Sagrado: vida regenerada e inimigos purificados!');
      } else if (p.classId === 'barbaro') {
        if (audio.playBossSlam) audio.playBossSlam();
        const vector = { east: [1, 0], west: [-1, 0], north: [0, -1], south: [0, 1], 'north-east': [0.7, -0.7], 'north-west': [-0.7, -0.7], 'south-east': [0.7, 0.7], 'south-west': [-0.7, 0.7] }[p.dir] || [p.face, 0];
        const cx = p.x + vector[0] * 88;
        const cy = p.y + vector[1] * 88;
        emitCombatEffect('impact', cx, cy, '#fb704d', { duration: 760, radius: 205 });
        screenShake = Math.max(screenShake, 7);
        let hitCount = 0;
        mobs.filter((m) => m.alive).forEach((m) => {
          const dx = m.x - p.x, dy = m.y - p.y;
          const distance = Math.hypot(dx, dy);
          const facingDot = distance ? (dx * vector[0] + dy * vector[1]) / distance : 1;
          if (distance <= 225 && facingDot > 0.15) {
            hitCount++;
            hurt(m, now, Math.round(progression.meleeDamage(p.lvl, p.swordEquipped, p.weaponTier, p.classId) * 2.15), 'physical', true);
            m.x += vector[0] * 28;
            m.y += vector[1] * 28;
            sparks(m.x, m.y, '#fb704d', 18);
          }
        });
        addFloatingText(p.x, p.y - 35, 'FENDA SÍSMICA!', '#ff9b6b', 18);
        msg('Fenda Sísmica · ' + hitCount + ' inimigo(s) atingido(s).');
      } else {
        if (audio.playWhirlwind) audio.playWhirlwind();
        else audio.playSlash();
        addFloatingText(p.x, p.y - 35, '️ VÓRTICE DE LÂMINAS!', '#fde047', 18);
        sparks(p.x, p.y, '#fde047', 28);
        for (let ang = 0; ang < Math.PI * 2; ang += Math.PI / 4) {
          parts.push({
            x: p.x + Math.cos(ang) * 45,
            y: p.y + Math.sin(ang) * 45,
            vx: Math.cos(ang) * 130,
            vy: Math.sin(ang) * 130,
            t: 0.35,
            maxT: 0.35,
            col: '#fde047'
          });
        }
        let hitCount = 0;
        mobs.filter(m => m.alive && D(m, p) < 140).forEach(m => {
          hitCount++;
          hurt(m, now, Math.round(progression.meleeDamage(p.lvl, p.swordEquipped, p.weaponTier, p.classId) * 1.95), 'critical', true);
          sparks(m.x, m.y, '#ef4444', 16);
          addFloatingText(m.x, m.y - 20, 'SANGRAMENTO!', '#f87171', 12);
        });
        msg(`Vórtice de Lâminas! ${hitCount} inimigos atingidos.`);
      }
    }

    if (k === 6) {
      const cls = window.GameClasses?.get ? window.GameClasses.get(p.classId) : {};
      const sk6 = cls.skill6 || { cd: 24, name: 'Habilidade Suprema' };
      p.cd[6] = sk6.cd || 24;
      if (audio.playUltimate) audio.playUltimate();

      if (p.classId === 'mago') {
        emitCombatEffect('arcane', p.x, p.y, '#c084fc', { duration: 900, radius: 310 });
        addFloatingText(p.x, p.y - 45, ' SUPERNOVA DO VAZIO!', '#c084fc', 22);
        msg('SUPREMA: Supernova do Vazio desencadeada!');
        const cx = p.x;
        const cy = p.y;
        mobs.filter(m => m.alive && D(m, p) < 380).forEach(m => {
          m.x = (m.x + cx) / 2;
          m.y = (m.y + cy) / 2;
        });
        setTimeout(() => {
          if (!isCombatContextCurrent(castContext)) return;
          emitCombatEffect('ring', cx, cy, '#e879f9', { duration: 800, radius: 330 });
          if (audio.playBossSlam) audio.playBossSlam();
          sparks(cx, cy, '#c084fc', 45);
          sparks(cx, cy, '#38bdf8', 35);
          mobs.filter(m => m.alive && D(m, { x: cx, y: cy }) < 320).forEach(m => {
            hurt(m, performance.now(), Math.round(progression.arcaneDamage(p.lvl, p.classId) * 3.4), 'cosmic', true);
            addFloatingText(m.x, m.y - 25, 'COLAPSO CÓSMICO!', '#e879f9', 16);
          });
        }, 500);
      } else if (p.classId === 'arqueiro') {
        emitCombatEffect('burst', p.x, p.y, '#34d399', { duration: 720, radius: 260 });
        addFloatingText(p.x, p.y - 45, ' DRAGÃO ASTRAL!', '#34d399', 22);
        msg('SUPREMA: Flecha do Dragão Celestial disparada!');
        const angle = p.dir === 'east' ? 0 : p.dir === 'west' ? Math.PI : p.dir === 'south' ? Math.PI / 2 : p.dir === 'north' ? -Math.PI / 2 : (p.dir === 'south-east' ? Math.PI / 4 : p.dir === 'south-west' ? 3 * Math.PI / 4 : p.dir === 'north-east' ? -Math.PI / 4 : -3 * Math.PI / 4);
        const dist = 800;
        const endX = p.x + Math.cos(angle) * dist;
        const endY = p.y + Math.sin(angle) * dist;
        arrowShots.push({
          x1: p.x, y1: p.y - 10, x2: endX, y2: endY,
          life: 0.65, maxLife: 0.65, type: 'magic'
        });
        mobs.filter(m => m.alive).forEach(m => {
          const dToLine = Math.abs((endY - p.y) * m.x - (endX - p.x) * m.y + endX * p.y - endY * p.x) / dist;
          if (dToLine < 55 && D(m, p) < dist) {
            hurt(m, now, Math.round(progression.meleeDamage(p.lvl, p.swordEquipped, p.weaponTier, p.classId) * 3.6), 'critical', true);
            sparks(m.x, m.y, '#34d399', 25);
            addFloatingText(m.x, m.y - 25, 'GOLPE DRACÔNICO!', '#6ee7b7', 16);
          }
        });
      } else if (p.classId === 'assasino') {
        const target = mobs.filter((m) => m.alive && D(m, p) < 380).sort((a, b) => D(a, p) - D(b, p))[0];
        if (!target) {
          p.cd[6] = 1;
          msg('Execução Fantasma: nenhum alvo ao alcance.');
        } else {
          const startX = p.x, startY = p.y;
          emitCombatEffect('slash', target.x, target.y, '#d8b4fe', { duration: 820, radius: 95 });
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              if (isCombatContextCurrent(castContext) && target.alive && mobs.includes(target)) emitCombatEffect('slash', target.x + R(-18, 18), target.y + R(-12, 12), '#c084fc', { duration: 360, radius: 54 });
            }, i * 75);
          }
          arrowShots.push({ x1: startX, y1: startY - 18, x2: target.x, y2: target.y - 18, life: 0.35, maxLife: 0.35, type: 'magic' });
          hurt(target, now, Math.round(progression.meleeDamage(p.lvl, p.swordEquipped, p.weaponTier, p.classId) * 4.4), 'critical', true);
          sparks(target.x, target.y, '#d8b4fe', 38);
          addFloatingText(target.x, target.y - 32, 'EXECUÇÃO FANTASMA!', '#e9d5ff', 18);
        }
      } else if (p.classId === 'barbaro') {
        p.berserkUntil = now + 7000;
        p.shield = 2.5;
        emitCombatEffect('impact', p.x, p.y, '#fb704d', { duration: 950, radius: 300 });
        screenShake = Math.max(screenShake, 9);
        const targets = mobs.filter((m) => m.alive && D(m, p) < 245);
        targets.forEach((m) => {
          hurt(m, now, Math.round(progression.meleeDamage(p.lvl, p.swordEquipped, p.weaponTier, p.classId) * 2.4), 'physical', true);
          sparks(m.x, m.y, '#fb704d', 18);
        });
        addFloatingText(p.x, p.y - 45, 'IRA IMPLACÁVEL · +40% DANO!', '#ff9b6b', 19);
        msg('Ira Implacável: dano aumentado por 7 segundos.');
      } else if (p.classId === 'clerigo') {
        const healed = p.max - p.hp;
        p.hp = p.max;
        p.shield = 8;
        emitCombatEffect('holy', p.x, p.y, '#fff2a8', { duration: 1100, radius: 330 });
        mobs.filter((m) => m.alive && D(m, p) < 260).forEach((m) => {
          hurt(m, now, Math.round(progression.arcaneDamage(p.lvl, p.classId) * 2.65), 'holy', true);
          sparks(m.x, m.y, '#fde047', 20);
        });
        sparks(p.x, p.y, '#fff2a8', 50);
        addFloatingText(p.x, p.y - 45, 'AVATAR DA LUZ · +' + healed + ' HP!', '#fff2a8', 19);
        msg('Avatar da Luz: vida restaurada e barreira sagrada ativada.');
      } else {
        p.ultimateBuffUntil = now + 6500;
        p.shield = 6.5;
        addFloatingText(p.x, p.y - 45, ' FÚRIA DO TITÃ! INVIOLÁVEL!', '#fbbf24', 22);
        msg('SUPREMA: Fúria do Titã ativada! Imunidade a dano e poder descomunal por 6s!');
        if (audio.playBossSlam) audio.playBossSlam();
        sparks(p.x, p.y, '#fbbf24', 45);
        emitCombatEffect('impact', p.x, p.y, '#fbbf24', { duration: 1100, radius: 330 });
        for (let r = 50; r <= 220; r += 45) {
          setTimeout(() => {
            if (!isCombatContextCurrent(castContext)) return;
            hazardZones.push({
              x: p.x, y: p.y, rad: r, createdAt: performance.now(), duration: 550,
              color: '#f59e0b', label: 'TERREMOTO', damage: Math.round(progression.meleeDamage(p.lvl, p.swordEquipped, p.weaponTier, p.classId) * 2.3),
              isPlayerZone: true
            });
          }, (r - 50) * 2.5);
        }
      }
    }

    renderUI({ p, kills, ore, loot, quest: currentQuest() });
    save();
  }

  function at(e) {
    let r = c.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (c.width / r.width) + cam.x,
      y: (e.clientY - r.top) * (c.height / r.height) + cam.y
    };
  }

  c.onpointerdown = (e) => {
    if (autoPlay) setAutoPlay(false);
    route = [];
    let q = at(e);

    // Menu de contexto ao clicar em outro jogador online no mundo
    if (cinzasNet?.isConnected) {
      const remotePlayers = cinzasNet.getRemotePlayers();
      const hitPlayer = remotePlayers.find(op => Math.hypot(op.x - q.x, (op.y - 20) - q.y) < 38 || Math.hypot(op.x - q.x, op.y - q.y) < 32);
      if (hitPlayer) {
        selectedPlayer = hitPlayer;
        enemy = object = null;
        audio.playTargetSelect?.();
        window.CinzasContextMenu?.showForPlayer(hitPlayer, e);
        return;
      }
    }
    window.CinzasContextMenu?.close();
    if (!dungeonMode) {
      if (region.id === 0 && window.GameCastleHub?.CASTLE_NPCS) {
        const castleNpc = window.GameCastleHub.CASTLE_NPCS.find(n => D(q, n) < 80);
        if (castleNpc) {
          if (castleNpc.isDummy) {
            if (D(p, castleNpc) < 150) {
              audio.playHit();
              sparks(castleNpc.x, castleNpc.y - 30, '#ef4444', 12);
              const weapon = window.GameItems?.equipped?.weapon;
              const baseDmg = 12 + (p.lvl * 2) + ((weapon?.enhanceLevel || 0) * 4);
              const hasBuff = p.sentinelBuffUntil && Date.now() < p.sentinelBuffUntil;
              const isCrit = Math.random() < (0.15 + (hasBuff ? 0.10 : 0));
              const dmg = Math.round((baseDmg * (isCrit ? 1.85 : 1.0)) * (0.9 + Math.random() * 0.2));
              addFloatingText(castleNpc.x + (Math.random() * 20 - 10), castleNpc.y - 50, (isCrit ? ' ' : '') + dmg + (isCrit ? ' CRÍTICO!' : ''), isCrit ? '#fde047' : '#ffffff', isCrit ? 18 : 14);
              p.atk = Date.now();
            } else {
              setDestination(castleNpc);
            }
            return;
          }
          if (D(p, castleNpc) < 130) {
            castleNpc.open();
          } else {
            enemy = object = null;
            setDestination(castleNpc);
          }
          return;
        }
        if (D(q, { x: 2860, y: 4160 }) < 70) {
          if (D(p, { x: 2860, y: 4160 }) < 95) travelRegion(1);
          else setDestination({ x: 2860, y: 4160 });
          return;
        }
      } else if (region.id === 1 && D(q, { x: 960, y: 100 }) < 70) {
        if (D(p, { x: 960, y: 100 }) < 95) travelRegion(0);
        else setDestination({ x: 960, y: 100 });
        return;
      }
      const guide = regionalGuidePosition();
      if (guide && D(q, guide) < 64) {
        if (D(p, guide) < 86) speakWithRegionalGuide(guide);
        else { enemy = object = null; setDestination(guide); }
        return;
      }
      const npc = dungeonNpcPosition();
      if (D(q, npc) < 64) {
        if (D(p, npc) < 82) {
          speakWithDungeonNpc();
        } else {
          enemy = object = null;
          setDestination(npc);
        }
        return;
      }
    } else if (dungeonSession && (D(q, dungeonSession.exit) < 75 || D(q, dungeonSession.stairs) < 75)) {
      setDestination(q);
      return;
    }
    let n = [...mobs.filter((m) => m.alive && !isNaN(m.hp) && m.hp > 0), ...nodes.filter((n) => n.alive), ...chests.filter((z) => !z.open)].sort(
      (a, b) => Math.hypot(a.x - q.x, a.y - q.y) - Math.hypot(b.x - q.x, b.y - q.y)
    )[0];

    if (n && Math.hypot(n.x - q.x, n.y - q.y) < 56) {
      selectedPlayer = null;
      audio.playTargetSelect?.();
      if ('hp' in n) {
        enemy = n;
        object = null;
      } else {
        object = n;
        enemy = null;
      }
      if ('hp' in n) {
        const range = window.GameClasses.get(p.classId).range || 50;
        const dx = p.x - n.x;
        const dy = p.y - n.y;
        const length = Math.max(1, Math.hypot(dx, dy));
        const stopAt = Math.max(28, range - 12);
        setDestination({ x: n.x + (dx / length) * stopAt, y: n.y + (dy / length) * stopAt });
      } else setDestination({ x: n.x - p.face * 28, y: n.y });
    } else {
      enemy = object = selectedPlayer = null;
      setDestination(q);
    }
  };

  c.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    let q = at(e);
    if (cinzasNet?.isConnected) {
      const remotePlayers = cinzasNet.getRemotePlayers();
      const hitPlayer = remotePlayers.find(op => Math.hypot(op.x - q.x, (op.y - 20) - q.y) < 45 || Math.hypot(op.x - q.x, op.y - q.y) < 36);
      if (hitPlayer) {
        selectedPlayer = hitPlayer;
        enemy = object = null;
        audio.playTargetSelect?.();
        window.CinzasContextMenu?.showForPlayer(hitPlayer, e);
      }
    }
  });

  addEventListener('keydown', (e) => {
    if (menuOpen || p.isDying) return;
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) return;
    let k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
      if (autoPlay) setAutoPlay(false);
      key.add(k);
      route = [];
      goal = null;
      e.preventDefault();
    }
    if (k === 'e') collect();
    if ('123456'.includes(k)) skill(k, performance.now());
    if (k === 'q') { skill(5, performance.now()); e.preventDefault(); }
    if (k === 'r') { skill(6, performance.now()); e.preventDefault(); }
    if (k === 'z') {
      setAutoPlay(!autoPlay);
      e.preventDefault();
    }
    if (k === 'c') {
      window.GameCastleHub?.teleportToCastle();
      e.preventDefault();
    }
    if (k === 'i' || k === 'b') {
      if (window.GameItems?.toggleInventoryModal) window.GameItems.toggleInventoryModal();
      else showTab(2);
      e.preventDefault();
    }
    if (k === 'm' && window.WorldMap) {
      window.WorldMap.toggle(p.lvl);
      e.preventDefault();
    }
    if (k === 't' && window.TalentTree) {
      window.TalentTree.toggleTT(p.lvl, p.classId);
      e.preventDefault();
    }
    if (k === 'p') {
      onboardingManager.ensureProfile(true);
      e.preventDefault();
    }
    if (k === 'tab' || k === 'o') {
      playerListUI.toggle();
      e.preventDefault();
    }
    if (k === 'escape') {
      if (window.GameItems?.closeInventoryModal) window.GameItems.closeInventoryModal();
      if (window.WorldMap) window.WorldMap.hide();
      if (window.TalentTree) window.TalentTree.hideTT();
      if (playerListUI.isOpen) playerListUI.close();
      document.querySelectorAll('.hub-modal-overlay').forEach((el) => el.remove());
    }
  });

  addEventListener('keyup', (e) => key.delete(e.key.toLowerCase()));
  addEventListener('blur', () => key.clear());

  function updateClassSkillIcons() {
    const cls = window.GameClasses?.get ? window.GameClasses.get(p.classId) : null;
    if (!cls) return;

    // Slot 1: Cura / Poção de Vida
    const s1 = $('#skillIcon1');
    if (s1) s1.innerHTML = '<img src="assets/items/consumables/potion_health_heart.png" alt="Cura" />';

    // Slot 2: Habilidade Principal da Classe
    const s2 = $('#skillIcon2');
    let s2Img = 'assets/icons/skills/heroic/guerreiro_corte_arco.png';
    if (cls.id === 'mago') s2Img = 'assets/icons/skills/heroic/mago_bola_fogo.png';
    else if (cls.id === 'arqueiro') s2Img = 'assets/icons/skills/heroic/arqueiro_chuva_flechas.png';
    else if (cls.id === 'barbaro') s2Img = 'assets/icons/skills/heroic/barbaro_redemoinho.png';
    else if (cls.id === 'assasino') s2Img = 'assets/icons/skills/heroic/assassino_adaga_furtiva.png';
    else if (cls.id === 'clerigo') s2Img = 'assets/icons/skills/Icon35.png';
    if (s2) s2.innerHTML = '<img src="' + s2Img + '" alt="' + cls.name + '" />';

    // Slot 3: Habilidade Tática / Defesa
    const s3 = $('#skillIcon3');
    let s3Img = 'assets/icons/skills/heroic/guerreiro_postura_escudo.png';
    if (cls.id === 'mago') s3Img = 'assets/icons/skills/heroic/mago_cristais_gelo.png';
    else if (cls.id === 'arqueiro') s3Img = 'assets/icons/skills/heroic/arqueiro_olho_aguia.png';
    else if (cls.id === 'barbaro') s3Img = 'assets/icons/skills/heroic/barbaro_martelo_sismico.png';
    else if (cls.id === 'assasino') s3Img = 'assets/icons/skills/heroic/assassino_passo_sombrio.png';
    else if (cls.id === 'clerigo') s3Img = 'assets/icons/skills/Icon43.png';
    if (s3) s3.innerHTML = '<img src="' + s3Img + '" alt="Defesa" />';

    // Slot 4: Investida / Habilidade de Poder
    const s4 = $('#skillIcon4');
    let s4Img = 'assets/icons/skills/heroic/guerreiro_grito_guerra.png';
    if (cls.id === 'mago') s4Img = 'assets/icons/skills/heroic/mago_raio_eletrico.png';
    else if (cls.id === 'arqueiro') s4Img = 'assets/icons/skills/heroic/arqueiro_flecha_veneno.png';
    else if (cls.id === 'barbaro') s4Img = 'assets/icons/skills/heroic/barbaro_furia_berserker.png';
    else if (cls.id === 'assasino') s4Img = 'assets/icons/skills/heroic/assassino_nuvem_veneno.png';
    else if (cls.id === 'clerigo') s4Img = 'assets/icons/skills/Icon24.png';
    if (s4) s4.innerHTML = '<img src="' + s4Img + '" alt="Poder" />';

    // Slot 5: Habilidade em Área (Tecla Q)
    const s5 = $('#skillIcon5');
    const sk5Img = cls.skill5?.iconImg || 'assets/icons/skills/Icon25.png';
    if (s5) s5.innerHTML = '<img src="' + sk5Img + '" alt="' + (cls.skill5?.name || 'Área') + '" />';

    // Slot 6: Habilidade Suprema (Tecla R)
    const s6 = $('#skillIcon6');
    const sk6Img = cls.skill6?.iconImg || 'assets/icons/skills/Icon20.png';
    if (s6) s6.innerHTML = '<img src="' + sk6Img + '" alt="' + (cls.skill6?.name || 'Suprema') + '" />';

    if (cls.skill5) $('#skillBtn5')?.setAttribute('title', cls.skill5.name + ' · ' + cls.skill5.desc + ' (Tecla Q)');
    if (cls.skill6) $('#skillBtn6')?.setAttribute('title', 'SUPREMA: ' + cls.skill6.name + ' · ' + cls.skill6.desc + ' (Tecla R)');
  }
  updateClassSkillIcons();

  document.querySelectorAll('.action').forEach((b) => {
    b.onclick = () => skill(b.dataset.k, performance.now());
  });

  $('#autoToggle').onclick = () => setAutoPlay(!autoPlay);
  syncAutoButton();

  // Sound Toggle button
  const soundBtn = $('#soundToggle');
  if (soundBtn) {
    soundBtn.onclick = () => {
      const muted = audio.toggleMute();
      const soundIcon = $('#soundIcon');
      if (soundIcon) soundIcon.textContent = muted ? '' : '';
      msg(muted ? 'Áudio desativado' : 'Áudio ativado');
    };
  }

  // Castle Hub, Inventory, Forge, Market & Shop top bar buttons
  const castleTopBtn = $('#castleTop');
  if (castleTopBtn) {
    castleTopBtn.onclick = () => window.GameCastleHub?.teleportToCastle();
  }
  const invTopBtn = $('#invTop');
  if (invTopBtn) {
    invTopBtn.onclick = () => window.GameItems?.toggleInventoryModal();
  }
  const forgeTopBtn = $('#forgeTop');
  if (forgeTopBtn) {
    forgeTopBtn.onclick = () => window.GameCastleHub?.openForgeModal();
  }
  const marketTopBtn = $('#marketTop');
  if (marketTopBtn) {
    marketTopBtn.onclick = () => window.GameMarketplace?.open();
  }
  const shopTopBtn = $('#shopTop');
  if (shopTopBtn) {
    shopTopBtn.onclick = () => window.GameCastleHub?.openShopModal();
  }

  // Map & Talent top bar buttons
  const mapTopBtn = $('#mapTop');
  if (mapTopBtn) {
    mapTopBtn.onclick = () => {
      if (window.WorldMap) window.WorldMap.toggle(p.lvl);
    };
  }
  const talentsTopBtn = $('#talentsTop');
  if (talentsTopBtn) {
    talentsTopBtn.onclick = () => {
      if (window.TalentTree) window.TalentTree.toggleTT(p.lvl, p.classId);
    };
  }
  const radarMapBtn = $('#mapContainer');
  if (radarMapBtn) {
    radarMapBtn.style.cursor = 'pointer';
    radarMapBtn.onclick = () => {
      if (window.WorldMap) window.WorldMap.toggle(p.lvl);
    };
  }

  // MMORPG Top Bar Navigation & Shortcuts
  const navHero = $('#navHero');
  if (navHero) {
    navHero.onclick = () => {
      if (window.TalentTree) window.TalentTree.toggleTT(p.lvl, p.classId);
    };
  }
  const navInv = $('#navInv');
  if (navInv) {
    navInv.onclick = () => window.GameItems?.toggleInventoryModal();
  }
  const navWorld = $('#navWorld');
  if (navWorld) {
    navWorld.onclick = () => {
      if (window.WorldMap) window.WorldMap.toggle(p.lvl);
    };
  }
  const navCraft = $('#navCraft');
  if (navCraft) {
    navCraft.onclick = () => window.GameCastleHub?.openForgeModal();
  }
  const navQuests = $('#navQuests');
  if (navQuests) {
    navQuests.onclick = () => {
      if (window.QuestUI?.toggleLogModal) window.QuestUI.toggleLogModal();
      else if (questUI?.toggleLogModal) questUI.toggleLogModal();
    };
  }

  // MMORPG Hotbar Aux & Compass Buttons
  const hudBagBtn = $('#hudBagBtn');
  if (hudBagBtn) hudBagBtn.onclick = () => window.GameItems?.toggleInventoryModal();
  const hudTalentsBtn = $('#hudTalentsBtn');
  if (hudTalentsBtn) hudTalentsBtn.onclick = () => window.TalentTree?.toggleTT(p.lvl, p.classId);
  const hudMapBtn = $('#hudMapBtn');
  if (hudMapBtn) hudMapBtn.onclick = () => window.WorldMap?.toggle(p.lvl);
  const hudCompass = $('#hudMinimapCompass');
  if (hudCompass) hudCompass.onclick = () => window.WorldMap?.toggle(p.lvl);

  const hudQuestDetailsBtn = $('#hudQuestDetailsBtn');
  if (hudQuestDetailsBtn) {
    hudQuestDetailsBtn.onclick = () => {
      if (window.QuestUI?.toggleLogModal) window.QuestUI.toggleLogModal();
      else if (questUI?.toggleLogModal) questUI.toggleLogModal();
    };
  }

  // Dynamic MMORPG Region Sidebar & HUD Tracker
  function updateRegionUI() {
    // 1. Minimap zone label
    const zoneNameEl = $('#hrcZoneName');
    if (zoneNameEl) {
      zoneNameEl.textContent = `${region.name}${region.min !== undefined ? ' · Nv. ' + region.min + '–' + region.max : ''}`;
    }

    // 2. Right sidebar regions journey list
    const regionsListEl = $('#hrcRegionsList');
    if (regionsListEl) {
      regionsListEl.innerHTML = REGIONS.map((r) => {
        const locked = dungeonMode || !isRegionUnlocked(r.id);
        const isCurrent = region.id === r.id;
        const thumbUrl = getRegionThumbnail(r.id);
        const statusText = r.safeZone
          ? 'HUB SEGURO'
          : bossDefeats[r.id]
          ? 'GUARDIÃO DERROTADO'
          : r.id < 29
          ? 'CHEFE NV. ' + r.max
          : 'CHEFE FINAL NV. 300';
        return `
          <button class="hrc-region-card ${isCurrent ? 'current' : ''} ${locked ? 'locked' : ''}" data-region="${r.id}" ${locked ? 'disabled' : ''} title="${r.name} (Nv. ${r.min}–${r.max})">
            <div class="hrc-card-thumb">
              <img src="${thumbUrl}" alt="${r.name}" loading="lazy" />
              ${locked ? '<div class="hrc-card-lock-badge">🔒</div>' : ''}
              ${isCurrent ? '<div class="hrc-card-current-tag">Região Atual</div>' : ''}
            </div>
            <div class="hrc-card-info">
              <div class="hrc-card-header">
                <span class="hrc-card-num">${String(r.id).padStart(2, '0')}</span>
                <span class="hrc-card-name">${r.name}</span>
              </div>
              <div class="hrc-card-sub">
                <span class="hrc-card-level">Nv. ${r.min}–${r.max}</span>
                <span class="hrc-card-status">${statusText}</span>
              </div>
            </div>
          </button>
        `;
      }).join('');

      regionsListEl.querySelectorAll('.hrc-region-card').forEach((btn) => {
        btn.onclick = () => {
          const regId = Number(btn.dataset.region);
          if (!isNaN(regId)) travelRegion(regId);
        };
      });
    }
  }
  updateRegionUI();
  window._tdcUpdateRegionUI = updateRegionUI;

  const side = document.querySelector('.inside');
  const missionBase = side ? side.innerHTML : '';
  const missionView = () => {
    const journey = `<div class="title">JORNADA ATÉ O NÍVEL 300</div><div class="region-track">${REGIONS.map(
      (r) => {
        const locked = dungeonMode || !isRegionUnlocked(r.id);
        const status = r.safeZone ? 'HUB SEGURO' : bossDefeats[r.id] ? 'GUARDIÃO DERROTADO' : r.id < 29 ? 'CHEFE NV. ' + r.max : 'CHEFE FINAL NV. 300';
        return `<button class="region-card ${region.id === r.id ? 'current' : ''} ${locked ? 'locked' : ''}" data-region="${r.id}" ${locked ? 'disabled' : ''}><b>0${r.id}</b><span>${r.name}</span><small>Nv. ${r.min}–${r.max}</small><i>${status}</i></button>`;
      }
    ).join('')}</div><div class="area-track">${region.areas.map((area, index) => {
      const cleared = area.boss && bossDefeats[region.id];
      const active = p.lvl >= area.min && p.lvl <= area.max && !cleared;
      return `<article class="area-card ${area.boss ? 'boss' : ''} ${cleared ? 'cleared' : ''} ${active ? 'active' : ''}"><b>${area.boss ? '' : String(index + 1).padStart(2, '0')} · ${area.name}</b><small>NV. ${area.min === area.max ? area.min : area.min + '–' + area.max}</small>${area.boss ? '<span>' + (cleared ? 'DERROTADO' : region.bossName) + '</span>' : ''}</article>`;
    }).join('')}</div><div class="progression-note"><b>PROGRESSÃO E RISCO</b><span>XP escalado por nível. Morte: perde até 5% do XP atual; chefe: até 10% (dobro), sem perder nível. Chefes causam 4× dano-base e têm +4 de defesa.</span></div><div class="title">MISSÕES · ${region.name.toUpperCase()}</div>`;
    return missionBase
      .replace('<div class="title">MISS\u00d5ES DO BOSQUE', journey)
      .replace('Derrote os invasores do bosque.', `Derrote criaturas de ${region.name}.`)
      .replace('Extraia minério das ruínas antigas.', `Extraia minérios em ${region.name}.`)
      .replace('Recolha cristais e abra baús.', `Encontre cristais e baús em ${region.name}.`);
  };

  const tabs = [...document.querySelectorAll('.tabs button')];

  const TALENTS = [
    ['brutal',5,'','Golpe Brutal','Dano físico +8%'], ['stone',5,'⬡','Pele de Pedra','Vida máxima +10%'],
    ['fire',10,'','Fúria Ígnea','Dano arcano +10%'], ['iron',10,'','Vontade de Ferro','Reduz dano recebido em 2'],
    ['storm',15,'','Tormenta de Aço','Ataques básicos 15% mais rápidos'], ['warcry',15,'◉','Grito de Guerra','Dano de habilidades +12%'],
    ['avatar',20,'','Avatar da Cinza','Dano físico e arcano +12%'], ['last-ember',20,'','Última Brasa','Evita uma morte a cada 5 minutos']
  ];

  function unlockTalent(id) {
    const talent = TALENTS.find((entry) => entry[0] === id);
    if (!talent || p.talents.includes(id)) return;
    if (p.lvl < talent[1]) return msg(`Esse talento exige nível ${talent[1]}.`);
    if (p.talentPoints < 1) return msg('Você precisa de um ponto de talento. Ganhe 1 a cada 5 níveis.');
    p.talentPoints--;
    p.talents.push(id);
    if (id === 'stone') { p.max = Math.round(p.max * 1.1); p.hp = Math.min(p.max, p.hp + Math.round(p.max * 0.1)); }
    audio.playLevelUp();
    sparks(p.x, p.y, '#d4a4ff', 18);
    msg(`${talent[3]} aprendido · ${talent[4]}`);
    save();
    renderUI({ p, kills, ore, loot, quest: currentQuest() });
    showTab(1);
  }

  function codexView() {
    const entries = [...new Set([...Object.keys(codexKills).filter((key) => !key.startsWith('boss:')), ...REGIONS.map((r) => r.enemy)])];
    const total = Object.values(codexKills).reduce((sum, count) => sum + (Number(count) || 0), 0);
    const names = { shade: 'Sombra errante', wolf: 'Fera do pântano', golem: 'Golem antigo' };
    return `<div class="title">CÓDICE DAS CINZAS <small>REGISTRO DA JORNADA</small></div><article class="codex-summary"><span>CRIATURAS REGISTRADAS</span><b>${total}</b><small>Marcos: 25 · 75 · 150 registros. Cada marco concede 1 ponto de talento e 1 Fragmento de Brasa.</small><div class="codex-milestones">${[25,75,150].map((n)=>`<i class="${total>=n?'complete':''}">${total>=n?'':n}</i>`).join('')}</div></article><div class="character-section-heading"><span>AVISTAMENTOS</span><small>ABATES POR ESPÉCIE</small></div><div class="codex-list">${entries.map((key)=>`<article><span></span><b>${names[key] || key.replaceAll('_',' ')}</b><strong>${Number(codexKills[key])||0}</strong><small>${codexKills[key]?'REGISTRADO':'AINDA NÃO ENCONTRADO'}</small></article>`).join('')} ${REGIONS.map((r)=>`<article class="${codexKills['boss:'+r.id]?'boss-found':''}"><span></span><b>${r.bossName}</b><strong>${Number(codexKills['boss:'+r.id])||0}</strong><small>${codexKills['boss:'+r.id]?'GUARDIÃO REGISTRADO':'LOCALIZADO EM '+r.name.toUpperCase()}</small></article>`).join('')}</div><p class="currency-lore">O Códice guarda seus encontros neste dispositivo. Futuramente, ele poderá registrar variantes, fraquezas, saques descobertos e conquistas sincronizadas.</p>`;
  }

  function characterView() {
    const characterClass = window.GameClasses.get(p.classId);
    const damage = progression.meleeDamage(p.lvl, p.swordEquipped, p.weaponTier, p.classId);
    const equipment = [
      ['head', 'Elmo', '', false], ['amulet', 'Amuleto', '', false], ['weapon', characterClass.weapon, characterClass.weaponIcon, true],
      ['chest', 'Peitoral', '⬟', false], ['shield', 'Escudo', 'shield', true], ['belt', 'Cinto', '═', false],
      ['gloves', 'Manoplas', '', false], ['legs', 'Calças', '▤', false], ['boots', 'Botas', '', false],
      ['ring1', 'Anel I', '◉', false], ['ring2', 'Anel II', '◉', false]
    ];
    const slots = equipment.map(([slot, label, icon, supported]) => {
      const isSword = slot === 'weapon';
      const equipped = isSword ? p.swordEquipped : slot === 'shield' ? p.shieldEquipped : false;
      const image = isSword ? `<span class="class-weapon-icon">${characterClass.weaponIcon}</span>` : slot === 'shield' ? '<img src="assets/items/ashen-shield.svg" alt="">' : `<span>${icon}</span>`;
      return `<button type="button" class="paperdoll-slot ${equipped ? 'is-equipped' : ''} ${supported ? '' : 'is-locked'}" ${supported ? `id="equip${isSword ? 'Sword' : 'Shield'}" aria-pressed="${equipped}"` : 'disabled'} title="${supported ? (equipped ? 'Clique para remover' : 'Clique para equipar') : 'Este espaço ainda não possui equipamento no protótipo'}">${image}<small>${label}</small>${equipped ? '<i>EQUIPADO</i>' : ''}</button>`;
    }).join('');
    const skills = [
      ['1', 'assets/items/health-potion.svg', 'Poção de cura', `Restaura ${Math.round(42 * characterClass.healing)} HP · consome 1 poção`, p.potions > 0 && p.hp < p.max && p.cd[1] <= 0],
      ['2', '', 'Raio arcano', 'Atinge até 3 inimigos próximos', p.cd[2] <= 0],
      ['3', '⬡', 'Escudo de cinzas', 'Reduz dano recebido por 6 s', p.cd[3] <= 0],
      ['4', '', 'Investida rápida', 'Avança para a direção do personagem', p.cd[4] <= 0]
    ];
    return `<section class="character-screen">
      <header class="character-heading"><div><span class="character-kicker">FICHA DO AVENTUREIRO</span><h2>${p.name || 'O ERRANTE'}</h2><p>${characterClass.name} · <span id="charLevelText">Nível ${p.lvl}</span></p></div><span class="character-level">NV.<b id="charLevel">${p.lvl}</b></span></header>
      <div class="character-top-grid">
        <div class="character-portrait"><div class="portrait-frame"><img src="${window.GameClasses.portrait(characterClass)}" alt="${characterClass.name}, retrato do personagem"></div><span>${characterClass.role.toLocaleUpperCase('pt-BR')}</span><button type="button" id="editAvatarInSheet" style="margin:4px 0;background:rgba(245,158,11,0.18);border:1px solid rgba(245,158,11,0.45);color:#fbbf24;border-radius:4px;padding:3px 7px;font-size:10px;font-weight:700;cursor:pointer;" onclick="window.CinzasOnboarding?.ensureProfile?.(true)">?? Personalizar</button><div class="character-xp"><i id="charXpBar" style="width:${p.need ? Math.min(100, p.xp / p.need * 100) : 100}%"></i></div><small id="charXpText">${p.lvl >= (progression.MAX_LEVEL || 300) ? 'NÍVEL MÁXIMO' : `${p.xp} / ${p.need} XP`}</small></div>
        <div class="character-stats"><div class="character-section-label">ATRIBUTOS DE COMBATE</div><div><span>Vida</span><b id="charHp">${Math.ceil(p.hp)} <small>/ ${p.max}</small></b></div><div><span>Dano Físico</span><b id="charMelee">${damage}</b></div><div><span>Defesa</span><b id="charDefense">${(p.shieldEquipped ? 4 : 0) + characterClass.armor}</b></div><div><span>Dano Arcano</span><b id="charArcane">${progression.arcaneDamage(p.lvl, p.classId)}</b></div><div><span>Poções</span><b id="charPotions">${p.potions} / ${MAX_POTIONS}</b></div></div>
      </div>
      <div class="character-section-heading"><span>EQUIPAMENTO</span><small>TOQUE EM ARMA OU ESCUDO PARA ALTERNAR</small></div>
      <div class="paperdoll">${slots}</div>
      <div class="equipment-summary"><span>${characterClass.weapon} ${p.swordEquipped ? `+${p.weaponTier} equipado` : 'guardado'}</span><span>Escudo ${p.shieldEquipped ? `equipado · −${4 + characterClass.armor} dano` : 'guardado'}</span></div>
      <div class="character-section-heading"><span>HABILIDADES</span><small>ATALHOS 1–4 · CLIQUE PARA USAR</small></div>
      <div class="character-skills">${skills.map(([key, icon, name, description, enabled]) => `<button type="button" class="character-skill" data-skill="${key}" ${enabled ? '' : 'disabled'}><span class="skill-key">${key}</span><span class="skill-icon">${String(icon).startsWith('assets/') ? `<img src="${icon}" alt="">` : icon}</span><span class="skill-copy"><b>${name}</b><small>${description}</small></span><span class="skill-use">${p.cd[Number(key)] > 0 ? Math.ceil(p.cd[Number(key)]) + 's' : '↗'}</span></button>`).join('')}</div>
      <div class="talent-roadmap"><div><b>ÁRVORE DE TALENTOS · ${p.talentPoints} PONTOS DISPONÍVEIS</b><small>Ganhe 1 ponto a cada 5 níveis. Escolha sua especialização; cada ponto é permanente.</small></div><div class="talent-milestones">${TALENTS.map(([id,level,icon,name,effect]) => { const learned=p.talents.includes(id), locked=p.lvl<level, unavailable=!learned&&(locked||p.talentPoints<1); return `<button type="button" class="talent-node ${learned?'learned':''}" data-talent="${id}" ${learned||unavailable?'disabled':''}><i>${icon}</i><span><b>${name}</b><small>NV ${level} · ${effect}</small></span><strong>${learned?'APRENDIDO':locked?'':'+1 PONTO'}</strong></button>`; }).join('')}</div></div>
    </section>`;
  }

  function updateBagUI() {
    const values = {
      bagGold: p.gold,
      bagCrystal: p.crystal,
      bagEmber: p.emberShards,
      bagCrystalItem: p.crystal,
      bagPotions: p.potions,
      bagOre: ore,
      bagLoot: loot
    };
    Object.entries(values).forEach(([id, value]) => {
      const e = document.getElementById(id);
      if (e) e.textContent = value;
    });
    const relicList = document.getElementById('bagDungeonItems');
    if (relicList) {
      const html = dungeonInventory.length
        ? dungeonInventory.slice(-8).reverse().map((item) => `<li class="${item.rarity === 'Mítico' ? 'loot-mythic' : 'loot-rare'}"><span>${item.name}</span><b>${item.rarity}</b></li>`).join('')
        : '<li class="empty-loot">Nenhum item especial de masmorra.</li>';
      if (relicList.innerHTML !== html) relicList.innerHTML = html;
    }
    window.GameItems?.renderInventoryUI?.();
    const potion = document.querySelector('#usePotion');
    if (potion) {
      potion.disabled = p.hp >= p.max || p.cd[1] > 0 || p.potions <= 0;
      potion.textContent =
        p.cd[1] > 0 ? 'POÇÃO EM RECARGA' : p.hp >= p.max ? 'VIDA COMPLETA' : p.potions <= 0 ? 'SEM POÇÕES' : `USAR POÇÃO · +42 HP (${p.potions})`;
    }
    const buyPotionButton = document.querySelector('#buyPotion');
    if (buyPotionButton) {
      buyPotionButton.disabled = p.gold < 35 || p.potions >= MAX_POTIONS;
      buyPotionButton.textContent = p.potions >= MAX_POTIONS ? 'BOLSA DE POÇÕES CHEIA' : 'COMPRAR POÇÃO · 35 OURO';
    }
    const forgeButton = document.querySelector('#forgeWeapon');
    if (forgeButton) {
      const crystalCost = 6 + p.weaponTier * 4;
      const goldCost = 60 + p.weaponTier * 45;
      forgeButton.disabled = p.weaponTier >= 5 || p.crystal < crystalCost || p.gold < goldCost;
      const weaponName = window.GameClasses.get(p.classId).weapon.toLocaleUpperCase('pt-BR');
      forgeButton.textContent = p.weaponTier >= 5 ? `${weaponName} NO NÍVEL MÁXIMO` : `APRIMORAR ${weaponName} +${p.weaponTier + 1} · ${crystalCost} CRISTAIS + ${goldCost} OURO`;
    }
    const emberSupply = document.querySelector('#emberSupply');
    if (emberSupply) {
      emberSupply.disabled = p.emberShards < 1 || p.potions > MAX_POTIONS - 2;
      emberSupply.textContent = p.potions > MAX_POTIONS - 2 ? 'BOLSA SEM ESPAÇO PARA 2 POÇÕES' : 'RITUAL DA BRASA · 1 FRAGMENTO → 2 POÇÕES';
    }
  }

  function forgeWeapon() {
    const cost = 6 + p.weaponTier * 4;
    const goldCost = 60 + p.weaponTier * 45;
    const weaponName = window.GameClasses.get(p.classId).weapon;
    if (p.weaponTier >= 5) return msg('Sua arma já alcançou o nível máximo.');
    if (p.crystal < cost || p.gold < goldCost) return msg(`A forja exige ${cost} cristais e ${goldCost} ouros.`);
    p.crystal -= cost;
    p.gold -= goldCost;
    p.weaponTier++;
    audio.playLevelUp();
    sparks(p.x, p.y, '#ffd464', 24);
    addFloatingText(p.x, p.y - 30, `${weaponName.toUpperCase()} +${p.weaponTier}`, '#ffd464', 16);
    msg(`${weaponName} aprimorado para +${p.weaponTier} · ataque aumentado`);
    save();
    renderUI({ p, kills, ore, loot, quest: currentQuest() });
    updateBagUI();
  }

  function buyPotion() {
    if (p.potions >= MAX_POTIONS) return msg('Você já carrega o máximo de poções.');
    if (p.gold < 35) return msg('Você precisa de 35 ouros para comprar uma poção.');
    p.gold -= 35;
    p.potions++;
    audio.playLoot();
    msg('Poção comprada · -35 ouro');
    save();
    renderUI({ p, kills, ore, loot, quest: currentQuest() });
    updateBagUI();
  }

  function buyEmberSupply() {
    if (p.potions > MAX_POTIONS - 2) return msg('Libere espaço para receber duas poções.');
    if (p.emberShards < 1) return msg('Você precisa de 1 Fragmento de Brasa. Consiga-o em contratos, marcos do Códice e primeiros guardiões.');
    p.emberShards--;
    p.potions += 2;
    audio.playLoot();
    msg('Ritual concluído · +2 poções de cura');
    save();
    renderUI({ p, kills, ore, loot, quest: currentQuest() });
    updateBagUI();
  }

  function travelRegion(id) {
    if (dungeonMode) return msg('Saia da masmorra antes de viajar para outra região.');
    const target = REGIONS.find((r) => r.id === id);
    if (!target) return;
    if (p.lvl < target.unlocks) {
      return msg('Alcance o nível ' + target.unlocks + ' para desbloquear esta região.');
    }
    if (!isRegionUnlocked(target.id)) {
      const previous = REGIONS.find((entry) => entry.id === target.id - 1);
      if (p.lvl < target.unlocks) return msg('Alcance o nível ' + target.unlocks + ' para desbloquear esta região.');
      return msg('Derrote ' + (previous?.bossName || 'o guardião anterior') + ' antes de viajar para essa região.');
    }
    captureCurrentRegion();
      regionIndex = REGIONS.findIndex((candidate) => candidate.id === target.id);
    region = target;
      const targetLayout = worldMapLayouts[String(target.id)];
      p.x = target.col * ZONE_W + (targetLayout?.playerSpawn?.x ?? ZONE_W / 2);
      p.y = target.row * ZONE_H + (targetLayout?.playerSpawn?.y ?? ZONE_H / 2);
    syncPetToPlayer();
    goal = null;
    route = [];
    populateRegion();
    updateRegionUI();
    initAmbientParticles();
    audio.startAmbientMusic(region.id);
    save();
    msg('Você viajou até ' + region.name);
    showTab(0);
  }

  window._tdcSetRegion = travelRegion;
  window._tdcForceTravel = (id) => {
    const target = REGIONS.find((r) => r.id === id);
    if (!target) return;
    captureCurrentRegion();
    regionIndex = REGIONS.findIndex((candidate) => candidate.id === target.id);
    region = target;
    const targetLayout = worldMapLayouts[String(target.id)];
    p.x = target.col * ZONE_W + (targetLayout?.playerSpawn?.x ?? ZONE_W / 2);
    p.y = target.row * ZONE_H + (targetLayout?.playerSpawn?.y ?? ZONE_H / 2);
    syncPetToPlayer();
    goal = null;
    route = [];
    populateRegion();
    updateRegionUI();
    initAmbientParticles();
    audio.startAmbientMusic(region.id);
    msg('Teleporte de teste: ' + region.name);
    showTab(0);
  };

  // World Map overlay callbacks
  window._wmGetPlayerLevel = () => p.lvl;
  window._wmGetCurrentMapId = () => region.id;
  window._wmIsMapCleared = (mapId) => Boolean(bossDefeats[mapId]);
  window._wmCanNavigateTo = (mapId) => {
    return Boolean(window.WorldMap?.WORLD_MAPS.some((entry) => entry.id === mapId)
      && REGIONS.some((candidate) => candidate.id === mapId));
  };
  window._wmGateReason = (mapId) => {
    const map = window.WorldMap?.WORLD_MAPS.find((entry) => entry.id === mapId);
    if (!map) return 'Mapa não encontrado.';
    if (p.lvl < map.min) return `Requer nível ${map.min}.`;
    if (!isRegionUnlocked(map.id)) {
      const previous = REGIONS.find((candidate) => candidate.id === map.id - 1);
      if (previous?.bossName) return `Derrote ${previous.bossName} primeiro.`;
    }
    return '';
  };
  window._wmEnterDungeon = (dungeonId) => {
    if (dungeonMode) {
      msg('Você já está explorando uma masmorra.');
      return;
    }
    const dgMap = {
      d1: { regionId: 1, minLvl: 10, name: 'Caverna do Iniciado / Catacumbas' },
      d2: { regionId: 2, minLvl: 21, name: 'Cripta das Sombras' },
      d3: { regionId: 3, minLvl: 41, name: 'Fortaleza das Brumas' },
      d4: { regionId: 4, minLvl: 61, name: 'Torre dos Condenados' },
      d5: { regionId: 5, minLvl: 101, name: 'Abismo Espectral' }
    };
    const target = dgMap[dungeonId] || dgMap.d1;
    if (p.lvl < target.minLvl) {
      msg(`Nível ${target.minLvl} necessário para entrar em ${target.name}.`);
      if (audio?.playHit) audio.playHit();
      return;
    }
    if (region.id !== target.regionId) {
      travelRegion(target.regionId);
      setTimeout(() => {
        enterDungeon(true);
      }, 150);
    } else {
      enterDungeon(true);
    }
  };

  window._wmNavigateTo = (mapId) => {
    if (!window.WorldMap) return;
    const map = window.WorldMap.WORLD_MAPS.find(m => m.id === mapId);
    if (!map) return;
    if (p.lvl < map.min) {
      msg('Nível ' + map.min + ' necessário para acessar ' + map.name + '.');
      return;
    }
    const target = REGIONS.find((candidate) => candidate.id === map.id && candidate.id !== CASTLE_HUB.id);
    if (target) travelRegion(target.id);
    else msg('O mapa ' + map.name + ' ainda não está conectado a uma região jogável.');
  };


  function showTab(i) {
    tabs.forEach((b, n) => {
      b.classList.toggle('active', i === n);
      b.setAttribute('aria-pressed', String(i === n));
    });
    if (!side) return;

    if (i === 0) {
      side.innerHTML = missionView();
      side.querySelectorAll('.region-card:not([disabled])').forEach((b) => {
        b.onclick = () => travelRegion(Number(b.dataset.region));
      });
      const cl = $('#claim');
      if (cl) {
        const quest = currentQuest();
        const goldReward = 250 + (region.id - 1) * 75;
        const xpReward = Math.max(40, Math.round(progression.xpNeeded(p.lvl) * 0.35));
        cl.onclick = claimContract;
        cl.textContent = quest.claimed ? 'CONTRATO CONCLUÍDO' : `RECOMPENSA: ${goldReward} G + ${xpReward} XP`;
        cl.disabled = quest.claimed;
      }
    } else if (i === 1) {
      side.innerHTML = characterView();
      $('#equipSword').onclick = () => {
        p.swordEquipped = !p.swordEquipped;
        save();
        msg(p.swordEquipped ? 'Espada equipada · dano aumentado' : 'Espada removida');
        showTab(1);
      };
      $('#equipShield').onclick = () => {
        p.shieldEquipped = !p.shieldEquipped;
        save();
        msg(p.shieldEquipped ? 'Escudo equipado · -4 dano recebido' : 'Escudo removido');
        showTab(1);
      };
      side.querySelectorAll('[data-skill]').forEach((button) => {
        button.onclick = () => skill(Number(button.dataset.skill), performance.now());
      });
      side.querySelectorAll('[data-talent]').forEach((button) => {
        button.onclick = () => unlockTalent(button.dataset.talent);
      });
    } else if (i === 2) {
      side.innerHTML = `<div class="title">BOLSA DO ERRANTE <small>RECURSOS E RELÍQUIAS</small></div><div class="bag-wallet"><div><img src="assets/items/gold-coin.svg" alt=""><span>OURO</span><b id="bagGold">${p.gold}</b></div><div><img src="assets/items/forest-crystal.svg" alt=""><span>CRISTAIS</span><b id="bagCrystal">${p.crystal}</b></div><div class="ember-wallet"><span>•</span><span>FRAGMENTOS DE BRASA</span><b id="bagEmber">${p.emberShards}</b></div></div><div id="gameInventoryContainer"></div><article class="card bag-panel"><strong>RECURSOS BRUTOS</strong><div class="bag-grid"><div class="bag-item"><img src="assets/items/health-potion.svg" alt=""><span>Poção de cura<small>Restaura 42 HP · máx. 9</small></span><b id="bagPotions">${p.potions}</b></div><div class="bag-item"><img src="assets/items/forest-crystal.svg" alt=""><span>Cristal da mata<small>Recurso mágico</small></span><b id="bagCrystalItem">${p.crystal}</b></div><div class="bag-item"><span class="bag-emoji"></span><span>Minério<small>Material de forja</small></span><b id="bagOre">${ore}</b></div><div class="bag-item"><span class="bag-emoji"></span><span>Relíquias<small>Itens encontrados</small></span><b id="bagLoot">${loot}</b></div></div><div class="rare-item-box"><b>SAQUES DE MASMORRA</b><ul id="bagDungeonItems"></ul></div><p class="currency-lore">Fragmentos de Brasa são raros e vêm de contratos regionais, primeiras vitórias contra guardiões e marcos do Códice. Use-os no Ritual da Brasa para obter poções.</p><button class="use-potion" id="usePotion">USAR POÇÃO · +42 HP</button><button id="buyPotion">COMPRAR POÇÃO · 35 OURO</button><button id="emberSupply">RITUAL DA BRASA · 1 FRAGMENTO → 2 POÇÕES</button><button id="forgeWeapon">FORJAR ESPADA · 6 CRISTAIS + 60 OURO</button></article>`;
      $('#usePotion').onclick = () => skill(1, performance.now());
      $('#buyPotion').onclick = buyPotion;
      $('#emberSupply').onclick = buyEmberSupply;
      $('#forgeWeapon').onclick = forgeWeapon;
      updateBagUI();
    } else if (i === 3) {
      side.innerHTML = `<div class="title">GUILDA DOS ERRANTES <small>REGIÃO ${String(region.id).padStart(2, '0')}</small></div><article class="card"><strong>${guildJoined ? 'Você faz parte da guilda!' : 'Um lugar para aventureiros'}</strong><p>${guildJoined ? 'Sua jornada agora faz parte da história dos Errantes.' : 'Una-se a outros exploradores e deixe seu nome nas ruínas de Miraluz.'}</p><button id="guildJoin" ${guildJoined ? 'disabled' : ''}>${guildJoined ? 'MEMBRO DOS ERRANTES' : 'ENTRAR NA GUILDA'}</button></article><article class="card"><strong>Mural da guilda</strong><p>Contrato coletivo: derrote invasores e reúna relíquias para proteger o bosque.</p><div class="progress"><i style="width:${Math.min(100, Math.round(((kills + loot) / 8) * 100))}%"></i></div><p>${Math.min(8, kills + loot)} / 8 contribuições</p></article>`;
      $('#guildJoin').onclick = () => {
        guildJoined = true;
        save();
        msg('Você entrou para a Guilda dos Errantes!');
        showTab(3);
      };
    } else if (i === 4) {
      const mission = currentDungeonMission();
      const nearNpc = !dungeonMode && D(p, dungeonNpcPosition()) < 105;
      const floor = Number(dungeonProgress[region.id]) || 1;
      const enterDisabled = dungeonMode || !nearNpc || p.lvl < region.unlocks || !mission.accepted;
      const inventoryItems = dungeonInventory.filter((item) => item.region === region.id).slice(-5).reverse();
      const materials = Object.entries(dungeonMaterials).filter(([key, amount]) => key.startsWith(region.id + ':') && amount > 0)
        .map(([key, amount]) => {
          const kind = key.split(':')[1];
          return `<li>${kind === 'ore_abyssal' ? 'Minério Abissal' : kind === 'ore_bloodstone' ? 'Pedra de Sangue' : 'Prata Astral'} <b>×${amount}</b></li>`;
        }).join('');
      const itemList = inventoryItems.length
        ? inventoryItems.map((item) => `<li class="${item.rarity === 'Mítico' ? 'loot-mythic' : 'loot-rare'}"><span>${item.name}</span><b>${item.rarity}</b></li>`).join('')
        : '<li class="empty-loot">Nenhum saque especial encontrado ainda.</li>';
      const complete = mission.ore >= 3 && mission.chests >= 2 && mission.boss;
      side.innerHTML = `<div class="title">EXPEDIÇÃO DE MASMORRA <small>REGIÃO ${String(region.id).padStart(2, '0')}</small></div><article class="dungeon-card"><div class="dungeon-emblem"></div><strong>${region.dungeonName}</strong><p>${region.npcName} conhece uma passagem selada sob estas terras. As minas e os baús desta instância não aparecem no mapa aberto.</p><div class="dungeon-facts"><span>NÍVEIS <b>1–10</b></span><span>RECOMENDADO <b>${dungeonFloorLevel(floor)}+</b></span><span>ANDARES DE CHEFE <b>5 E 10</b></span></div><p class="dungeon-npc-note">${nearNpc ? 'Você está falando com ' + region.npcName + '.' : 'Encontre ' + region.npcName + ' no mapa e pressione E para aceitar a missão.'}</p>${!mission.accepted ? `<button class="dungeon-button" id="acceptDungeon" ${!nearNpc || dungeonMode ? 'disabled' : ''}>ACEITAR CONTRATO</button>` : ''}<div class="dungeon-contract"><b>CONTRATO · A RELÍQUIA SEPULTADA</b><span class="${mission.ore >= 3 ? 'done' : ''}">Veios minerais raros: ${Math.min(3, mission.ore)} / 3</span><span class="${mission.chests >= 2 ? 'done' : ''}">Baús da masmorra: ${Math.min(2, mission.chests)} / 2</span><span class="${mission.boss ? 'done' : ''}">Chefe do andar 5: ${mission.boss ? 'DERROTADO' : 'PENDENTE'}</span><button class="dungeon-button ${complete ? 'ready' : ''}" id="claimDungeon" ${!complete || mission.claimed || !nearNpc || dungeonMode ? 'disabled' : ''}>${mission.claimed ? 'CONTRATO CONCLUÍDO' : 'ENTREGAR CONTRATO · ' + region.id * 180 + ' OURO + 70% XP'}</button></div><div class="dungeon-rules"><b>MODO SOLO E RISCO</b><span>Solo no protótipo: todos os 10 andares liberados para exploração! Andares 6–10 trazem desafio avançado (planejados para coop no futuro MMORPG).</span><span>Chefes nos andares 5 e 10. Morte aplica 5% de perda de XP da barra (o dobro contra chefes).</span></div><button class="dungeon-button enter" id="enterDungeon" ${enterDisabled ? 'disabled' : ''}>${dungeonMode ? 'JÁ ESTÁ NA MASMORRA' : 'ENTRAR · ANDAR ' + floor + ' DE 10'}</button>${floor > 5 ? '<p class="dungeon-lock" style="color:#f59e0b">Andares 6–10: Dificuldade heroica avançada. Prepare poções!</p>' : ''}</article><article class="card dungeon-loot"><strong>SAQUES EXCLUSIVOS · ${region.dungeonName}</strong><ul>${itemList}</ul>${materials ? '<b class="material-title">MINÉRIOS RAROS</b><ul>' + materials + '</ul>' : ''}<p>Itens raros: chance-base de 3%. Itens míticos: raridade lendária extrema (1 em 100.000 — sorteio local do protótipo, auditado no servidor no MMORPG).</p></article>${dungeonMode ? '<article class="card dungeon-live"><strong>EXPEDIÇÃO EM CURSO · ANDAR ' + dungeonSession.floor + '</strong><p>' + (dungeonSession.cleared ? 'Andar limpo. Vá às escadas douradas e pressione E para avançar.' : 'Derrote todos os inimigos e procure minérios e baús. Use o portal azul para voltar ao mapa.') + '</p><button class="dungeon-button" id="leaveDungeon">SAIR PARA O MAPA</button></article>' : ''}`;
      const accept = $('#acceptDungeon');
      if (accept) accept.onclick = () => {
        if (!nearNpc) return msg('Fale com ' + region.npcName + ' no mapa para aceitar o contrato.');
        mission.accepted = true;
        save();
        msg(region.npcName + ' entregou o contrato da masmorra.');
        showTab(4);
      };
      const enter = $('#enterDungeon');
      if (enter) enter.onclick = enterDungeon;
      const claim = $('#claimDungeon');
      if (claim) claim.onclick = claimDungeonMission;
      const leave = $('#leaveDungeon');
      if (leave) leave.onclick = leaveDungeon;
    } else if (i === 5) {
      side.innerHTML = codexView();
    }
  }

  function claimContract() {
    const quest = currentQuest();
    if (quest.claimed) return msg('Contrato desta região já resgatado.');
    if (quest.kills < 4 || quest.ore < 5 || quest.loot < 4) return msg('Complete as missões desta região primeiro.');
    quest.claimed = true;
    if (region.id === 1) claimed = true;
    const goldReward = 250 + (region.id - 1) * 75;
    const xpReward = Math.max(40, Math.round(progression.xpNeeded(p.lvl) * 0.35));
    p.gold += goldReward;
    p.emberShards++;
    xp(xpReward);
    audio.playLevelUp();
    sparks(p.x, p.y, '#ffd700', 30);
    msg(`Contrato concluído! +${goldReward} ouro, +${xpReward} XP e +1 Fragmento de Brasa`);
    save();
    renderUI({ p, kills, ore, loot, quest: currentQuest() });
    if (tabs[0]?.classList.contains('active')) showTab(0);
  }

  tabs.forEach((b, i) => (b.onclick = () => showTab(i)));

  function collectDrop(d, collector = p) {
    const idx = drops.indexOf(d);
    if (idx === -1) return;
    drops.splice(idx, 1);
    if (pet.targetDrop === d) pet.targetDrop = null;
    audio.playLoot();

    if (d.kind === 'crystal') {
      const amount = Math.max(1, Number(d.amount) || 1);
      p.crystal += amount;
      if (!d.dungeon) {
        loot += amount;
        progressQuest('loot', amount);
      }
      addFloatingText(collector.x, collector.y - 15, '+' + amount + ' Cristal' + (amount > 1 ? 'is' : ''), '#6ee5e8', 13);
      msg(amount > 1 ? amount + ' cristais antigos recolhidos!' : 'Cristal antigo recolhido!');
    } else {
      const val = d.v || 10;
      p.gold += val;
      addFloatingText(collector.x, collector.y - 15, '+' + val + ' Ouro', '#ffd464', 13);
      msg('+' + val + ' ouro recolhido.');
    }
    renderUI({ p, kills, ore, loot, quest: currentQuest() });
    save();
  }

  function collect() {
    if (dungeonMode && dungeonSession) {
      if (D(p, dungeonSession.exit) < 82) return leaveDungeon();
      if (D(p, dungeonSession.stairs) < 92) return useDungeonStairs();
    }
    if (!dungeonMode && region.id === 0 && window.GameCastleHub?.CASTLE_NPCS) {
      const nearCastleNpc = window.GameCastleHub.CASTLE_NPCS.find(n => D(p, n) < 130);
      if (nearCastleNpc) {
        nearCastleNpc.open();
        return;
      }
      // Portal das Masmorras (Ala Norte do Castelo)
      if (D(p, { x: 2860, y: 3320 }) < 110) {
        if (window.WorldMap?.openTab) window.WorldMap.openTab('dungeons');
        else if (window.WorldMap?.toggle) window.WorldMap.toggle(p.lvl || 1);
        msg('🔮 Portal das Masmorras ativado! Escolha seu destino.');
        return;
      }
      if (D(p, { x: 2860, y: 4160 }) < 95) {
        return travelRegion(1);
      }
    }
    if (!dungeonMode && region.id === 1 && D(p, { x: 960, y: 100 }) < 95) {
      return travelRegion(0);
    }
    const guide = !dungeonMode ? regionalGuidePosition() : null;
    if (guide && D(p, guide) < 86) return speakWithRegionalGuide(guide);
    if (!dungeonMode && D(p, dungeonNpcPosition()) < 82) {
      return speakWithDungeonNpc();
    }
    let d = drops.find((z) => D(z, p) < 64);
    if (!d) return msg('Aproxime-se de um item para coletar.');
    faceDirection(p, d.x - p.x, d.y - p.y);
    p.pickupAt = performance.now();
    collectDrop(d, p);
  }

  function open(z) {
    if (z.dungeon) {
      z.open = true;
      audio.playChest();
      if (z.bossChest) {
        const gold = 350 + region.id * 160 + dungeonSession.floor * 45;
        const crystals = 12 + region.id * 5;
        p.gold += gold;
        p.crystal += crystals;
        p.emberShards = (p.emberShards || 0) + 1;
        loot++;
        const mission = currentDungeonMission();
        if (mission.accepted) mission.chests++;

        // Drop garantido de Arma/Equipamento Heroico da classe
        const reg = Math.min(5, region.id || 1);
        const numStr = (reg === 1) ? ['05', '06', '07']
                     : (reg === 2) ? ['08', '09', '10']
                     : (reg === 3) ? ['12', '13', '14']
                     : (reg === 4) ? ['15', '16', '17']
                     : ['18', '19', '20'];
        const pickNum = numStr[Math.floor(Math.random() * numStr.length)];
        const classWeaponPrefix = {
          guerreiro: 'sword_hero',
          arqueiro: 'w_bow_hero',
          barbaro: 'w_axe_hero',
          clerigo: 'w_mace_hero',
          assasino: 'w_dagger_hero',
          mago: 'w_staff_hero'
        };
        const pPrefix = classWeaponPrefix[p.classId] || 'sword_hero';
        let dropItemId;
        if (pPrefix === 'sword_hero') {
          const swordMap = {
            '05': 'w_bastarda_forjada', '06': 'w_longa_aco', '07': 'w_florete_duelo',
            '08': 'w_lamina_esmeralda_pantano', '09': 'w_flamberge_cruzado', '10': 'w_lamina_bronze_antigo',
            '12': 'w_espada_safira_azul', '13': 'w_lamina_prata_vigilia', '14': 'w_cimitarra_deserto',
            '15': 'w_espada_meia_noite', '16': 'w_lamina_sol_radiante', '17': 'w_espada_obsidiana_abismo',
            '18': 'w_espada_ametista_espectral', '19': 'w_sagrada_aurora_eterna', '20': 'w_reliquia_cinco_selos'
          };
          dropItemId = swordMap[pickNum] || 'w_longa_aco';
        } else {
          dropItemId = `${pPrefix}_${pickNum}`;
        }

        if (window.GameItems?.addItem && dropItemId) {
          window.GameItems.addItem(dropItemId);
          const base = window.GameItems.ITEM_DATABASE[dropItemId];
          if (base) {
            msg(`👑 RECOMPENSA DO CHEFE: ${base.icon || '⚔️'} ${base.name} [${(base.rarity || 'épico').toUpperCase()}]!`);
          }
        }

        sparks(z.x, z.y, '#ffd700', 80);
        sparks(z.x, z.y, '#c084fc', 40);
        if (audio?.playLevelUp) audio.playLevelUp();
        addFloatingText(z.x, z.y - 45, '👑 BAÚ DO CHEFE CONQUISTADO! 👑', '#ffd700', 22);
        addFloatingText(z.x, z.y - 18, `+${gold} Ouro · +${crystals} Cristais · +1 Brasa`, '#fef08a', 15);
        msg(`Grande Baú do Chefe aberto · +${gold} ouro, +${crystals} cristais e +1 Fragmento de Brasa.`);
      } else {
        const gold = 70 + region.id * 35 + dungeonSession.floor * 12;
        const crystals = 2 + Math.floor(dungeonSession.floor / 3);
        p.gold += gold;
        p.crystal += crystals;
        loot++;
        const mission = currentDungeonMission();
        if (mission.accepted) mission.chests++;
        sparks(z.x, z.y, '#c58cff', 30);
        msg('Baú da masmorra aberto · +' + gold + ' ouro, +' + crystals + ' cristais.');
        rollDungeonLoot(z.x, z.y, false);
      }
      if (window.MiningDungeons) {
        const dgId = 'mv' + Math.min(6, Math.max(1, Math.ceil(p.lvl / 50)));
        const ch = window.MiningDungeons.rollChest(dgId);
        if (ch) {
          p.gold += ch.gold;
          if (ch.xpBonus) xp(Math.round(progression.xpNeeded(p.lvl) * ch.xpBonus));
          addFloatingText(z.x, z.y - 35, ch.icon + ' ' + ch.name + ' (+' + ch.gold + ' Ouro)!', ch.color, ch.id === 'lendario' ? 20 : 13);
          if (ch.id === 'lendario') {
            audio.playLevelUp();
            msg('BAÚ LENDÁRIO ENCONTRADO: +' + ch.gold + ' OURO!');
          }
        }
      }
      renderUI({ p, kills, ore, loot, quest: currentQuest() });
      save();
      if (tabs[4]?.classList.contains('active')) showTab(4);
      return;
    }
    z.open = true;
    audio.playChest();

    let goldReward = 35;
    let crystalReward = 1;
    let potionReward = 1;
    let xpReward = 0;
    let sparkColor = '#ffd04e';
    let flareColor = '#ffd700';

    if (z.type === 'chest_spectral_teal') {
      goldReward = 60;
      crystalReward = 3;
      xpReward = 20;
      sparkColor = '#79f6ff';
      flareColor = '#79f6ff';
      addFloatingText(z.x, z.y - 20, '+60 Ouro & 3 Cristais!', '#79f6ff', 14);
      msg('Baú Espectral aberto! +60 ouro, +3 cristais');
    } else if (z.type === 'chest_cursed_spiked') {
      goldReward = 100;
      crystalReward = 4;
      potionReward = 2;
      xpReward = 45;
      sparkColor = '#d946ef';
      flareColor = '#c084fc';
      addFloatingText(z.x, z.y - 20, '+100 Ouro & 4 Cristais!', '#f43f5e', 14);
      msg('Baú Amaldiçoado aberto! Recompensa épica!');
    } else if (z.type === 'chest_goblin_rusty') {
      goldReward = 45;
      crystalReward = 2;
      sparkColor = '#ffd04e';
      flareColor = '#fbbf24';
      addFloatingText(z.x, z.y - 20, '+45 Ouro & 2 Cristais!', '#ffd700', 14);
      msg('Baú Goblin aberto! +45 ouro');
    } else {
      addFloatingText(z.x, z.y - 20, '+35 Ouro & 1 Cristal!', '#ffd700', 14);
      msg('Baú de Pedra aberto! +35 ouro');
    }

    p.gold += goldReward;
    p.crystal += crystalReward;
    p.potions = Math.min(MAX_POTIONS, p.potions + potionReward);
    if (xpReward) xp(xpReward);
    loot++;
    progressQuest('loot');
    addFloatingText(z.x, z.y - 38, `+${potionReward} Poção${potionReward > 1 ? 'ões' : ''}`, '#8ff1a4', 13);

    drops.push({ x: z.x + 20, y: z.y, kind: 'gold', v: 20, phase: 0 });
    sparks(z.x, z.y, sparkColor, 32);
    msg(`Baú aberto · +${goldReward} ouro, +${crystalReward} cristais, +${potionReward} poção${potionReward > 1 ? 'ões' : ''}`);
    renderUI({ p, kills, ore, loot, quest: currentQuest() });
    save();
  }

  function mine(n, now) {
    n.alive = false;
    n.back = now + 11000;
    p.en = Math.max(0, p.en - 7);
    audio.playPickaxe();

    ore++;
    if (!dungeonMode) progressQuest('ore');
    if (n.dungeonRare) {
      const names = { ore_abyssal: 'Minério Abissal', ore_bloodstone: 'Pedra de Sangue', ore_astral: 'Prata Astral' };
      const name = names[n.kind] || 'Minério de Masmorra';
      const materialKey = region.id + ':' + n.kind;
      dungeonMaterials[materialKey] = (Number(dungeonMaterials[materialKey]) || 0) + 1;
      p.crystal += 2;
      loot++;
      const mission = currentDungeonMission();
      if (mission.accepted) mission.ore++;
      addFloatingText(n.x, n.y - 15, '+1 ' + name, '#d8b5ff', 13);
      msg(name + ' extraído · +2 cristais');
      rollDungeonLoot(n.x, n.y);
    }
    if (window.MiningDungeons && (dungeonMode || Math.random() < 0.35)) {
      const dgId = 'mv' + Math.min(6, Math.max(1, Math.ceil(p.lvl / 50)));
      const oreDrop = window.MiningDungeons.rollOre(dgId, p.lvl);
      if (oreDrop) {
        p.gold += oreDrop.goldValue;
        const isRareOre = oreDrop.rarity === 'lendario' || oreDrop.rarity === 'supremo';
        addFloatingText(n.x, n.y - 30, oreDrop.icon + ' ' + oreDrop.name + ' (+' + oreDrop.goldValue + 'G)!', oreDrop.color, isRareOre ? 18 : 12);
        sparks(n.x, n.y, oreDrop.color, isRareOre ? 40 : 18);
        if (isRareOre) {
          audio.playLevelUp();
          msg('MINÉRIO LENDÁRIO ENCONTRADO: ' + oreDrop.name + '!');
        }
      }
    }
    if (n.dungeonRare) {
      // already processed above
    } else if (n.kind.includes('iron')) {
      p.gold += 6;
      addFloatingText(n.x, n.y - 15, '+1 Ferro', '#d4d2b4', 13);
      msg('Minério de ferro +1');
    } else if (n.kind.includes('gold')) {
      p.gold += 15;
      addFloatingText(n.x, n.y - 15, '+15 Ouro', '#ffd464', 14);
      msg('Veio de ouro extraído!');
    } else if (n.kind.includes('amethyst') || n.kind.includes('gem')) {
      p.crystal += 2;
      loot += 2;
      progressQuest('loot', 2);
      addFloatingText(n.x, n.y - 15, '+2 Gemas', '#d478ff', 14);
      msg('Gemas raras extraídas!');
    } else {
      p.crystal++;
      loot++;
      progressQuest('loot');
      addFloatingText(n.x, n.y - 15, '+1 Cristal', '#79f6ff', 13);
      msg('Cristal da mata +1');
    }
    const sparkColor = n.dungeonRare
      ? (n.kind === 'ore_abyssal' ? '#a855f7' : n.kind === 'ore_bloodstone' ? '#ef4444' : '#38bdf8')
      : n.kind.includes('crystal') ? '#79f6ff' : n.kind.includes('gold') ? '#ffd464' : '#d4d2b4';
    sparks(n.x, n.y, sparkColor, 18);
    const gatherReward = 10 + region.id * 2;
    xp(gatherReward);
    renderUI({ p, kills, ore, loot, quest: currentQuest() });
    save();
    if (dungeonMode && tabs[4]?.classList.contains('active')) showTab(4);
  }

  const claimBtnInit = $('#claim');
  if (claimBtnInit) claimBtnInit.onclick = claimContract;

  function autoPilot(now) {
    if (p.hp < p.max * 0.62 && p.potions > 0 && p.cd[1] <= 0) skill(1, now);
    const nearest = (items) => items.filter((item) => item.alive !== false && item.open !== true && (!('hp' in item) || (Number(item.hp) > 0 && !isNaN(item.hp))))
      .sort((a, b) => D(a, p) - D(b, p))[0] || null;
    const closeEnemy = nearest(mobs);

    if (closeEnemy && D(closeEnemy, p) < 300) {
      if (autoTarget !== closeEnemy) goal = null;
      autoTarget = closeEnemy;
      enemy = closeEnemy;
      object = null;
      route = [];
      faceDirection(p, enemy.x - p.x, enemy.y - p.y);
      return;
    }

    enemy = null;
    const drop = nearest(drops);
    if (drop) {
      if (autoTarget !== drop) {
        autoTarget = drop;
        goal = null;
        route = [];
      }
      object = null;
      if (D(drop, p) < 58) collect();
      else if (!goal) setDestination(drop);
      return;
    }

    const objectives = [];
    const quest = currentQuest();
    if (quest.ore < 5) objectives.push(...nodes.filter((n) => n.alive));
    if (quest.loot < 4) objectives.push(...chests.filter((z) => !z.open));
    const resource = nearest(objectives);
    if (resource) {
      if (autoTarget !== resource) {
        autoTarget = resource;
        goal = null;
        route = [];
      }
      object = resource;
      if (!goal) setDestination({ x: resource.x - p.face * 25, y: resource.y });
      return;
    }

    object = null;
    enemy = nearest(mobs);
    if (enemy) {
      if (autoTarget !== enemy) goal = null;
      autoTarget = enemy;
      route = [];
      faceDirection(p, enemy.x - p.x, enemy.y - p.y);
    } else if (!drop && !objectives.length) {
      autoTarget = null;
      goal = null;
    }
  }

  function update(dt, now) {
    if (autoPlay) autoPilot(now);

    p.moving = false;
    let dx =
      (key.has('d') || key.has('arrowright')) - (key.has('a') || key.has('arrowleft'));
    let dy =
      (key.has('s') || key.has('arrowdown')) - (key.has('w') || key.has('arrowup'));

    if (dx || dy) {
      let n = Math.hypot(dx, dy);
      movePlayer((dx / n) * 220 * dt, (dy / n) * 220 * dt);
      faceDirection(p, dx, dy);
      p.moving = true;
      goal = null;
      if (cinzasNet?.isConnected) cinzasNet.setInput(dx, dy);
    } else if (goal) {
      dx = goal.x - p.x;
      dy = goal.y - p.y;
      let n = Math.hypot(dx, dy);
      if (n < 5) {
        if (route.length) goal = route.shift();
        else goal = null;
      } else {
        p.moving = true;
        movePlayer((dx / n) * Math.min(n, 220 * dt), (dy / n) * Math.min(n, 220 * dt));
        faceDirection(p, dx, dy);
        if (cinzasNet?.isConnected) cinzasNet.setInput(dx, dy);
      }
    } else {
      if (cinzasNet?.isConnected) cinzasNet.setInput(0, 0);
    }

    if (p.moving) p.walk += dt * 13;

    p.x = C(p.x, 30, W.w - 30);
    p.y = C(p.y, 30, W.h - 30);
    updateWorldRegion();

    if (enemy?.alive && (Number(enemy.hp) > 0)) {
      const attackRange = window.GameClasses.get(p.classId).range || 50;
      if (D(enemy, p) > attackRange) {
        if (!goal) {
          const distance = Math.max(1, D(enemy, p));
          const stopDistance = Math.max(28, attackRange - 12);
          setDestination({ x: p.x + ((enemy.x - p.x) / distance) * stopDistance, y: p.y + ((enemy.y - p.y) / distance) * stopDistance });
        }
      } else {
        route = [];
        goal = null;
        hurt(enemy, now);
      }
    } else {
      enemy = null;
    }

    if (object) {
      if (D(object, p) > 45) {
        if (!goal) setDestination({ x: object.x - p.face * 25, y: object.y });
      }
      else {
        goal = null;
        'open' in object ? open(object) : mine(object, now);
        object = null;
      }
    }

    // Update Mobs
    for (let i = mobs.length - 1; i >= 0; i--) {
      const m = mobs[i];
      if (m.alive && (isNaN(m.hp) || m.hp <= 0)) {
        killMob(m, now);
        if (m.isMinion) mobs.splice(i, 1);
        continue;
      }
      if (!m.alive) {
        if (m.isMinion) {
          mobs.splice(i, 1);
          continue;
        }
        if (!dungeonMode && now > m.back) {
          m.alive = true;
          m.hp = m.max;
          m.x = m.ox;
          m.y = m.oy;
          m.aggro = false;
          delete m.deathStartedAt;
        }
        continue;
      }
      m.phase += dt;
      m.isMoving = false;
      if (now < (p.respawnGraceUntil || 0)) {
        m.aggro = false;
        m.windup = false;
        continue;
      }
      if (D(m, p) < 250) m.aggro = true;
      if (m.aggro) {
        let d = D(m, p);
        if (d > 700) {
          m.x = m.ox;
          m.y = m.oy;
          m.aggro = false;
          continue;
        }

        // Boss Phase 2 Enrage Trigger (at <50% HP)
        if (m.boss && m.hp < m.max * 0.5 && !m.phase2Triggered) {
          m.phase2Triggered = true;
          if (audio.playBossRoar) audio.playBossRoar();
          addFloatingText(m.x, m.y - 85, ' ENFURECIDO! FASE 2 INICIADA! ', '#ff2244', 20);
          msg(' O GUARDIÃO SE ENFURECEU! Ataques mais rápidos e fúria destrutiva!');
          sparks(m.x, m.y, '#ff1133', 45);
          // Knockback wave pushing player away
          const pDx = p.x - m.x;
          const pDy = p.y - m.y;
          const pLen = Math.max(1, Math.hypot(pDx, pDy));
          movePlayer((pDx / pLen) * 95, (pDy / pLen) * 95);
          m.sp = Math.round(m.sp * 1.35);
          // Summon 2 shadow shades to assist boss
          if (!m.minionsSummoned) {
            m.minionsSummoned = true;
            for (let s = 0; s < 2; s++) {
              const sx = m.x + (s === 0 ? -60 : 60);
              const sy = m.y + 35;
              mobs.push({
                id: mobs.length + 1000,
                t: 'gargoyle_stone',
                name: 'Sombra do Guardião',
                x: sx, y: sy, ox: sx, oy: sy,
                hp: Math.round(m.max * 0.16), max: Math.round(m.max * 0.16),
                sp: 100, level: Math.max(1, m.level - 2),
                alive: true, aggro: true, phase: 0, atk: now, hit: 0, isMinion: true
              });
            }
          }
        }

        // Boss Special Skills (Triggers at any combat range d < 480)
        if (m.boss && now - (m.lastSpecialAt || 0) > (m.phase2Triggered ? 3400 : 5200)) {
          m.lastSpecialAt = now;
          if (region.id === 1) {
            addFloatingText(m.x, m.y - 76, 'ERUPÇÃO DE RAÍZES!', '#8eed5d', 16);
            hazardZones.push({
              x: p.x, y: p.y, rad: 58, createdAt: now, duration: 800,
              color: '#8eed5d', label: 'RAÍZES', damage: Math.round(m.level * 0.45 + 10), level: m.level
            });
            if (m.phase2Triggered) {
              hazardZones.push({
                x: p.x + R(-60, 60), y: p.y + R(-60, 60), rad: 50, createdAt: now + 180, duration: 800,
                color: '#8eed5d', label: 'RAÍZES', damage: Math.round(m.level * 0.38 + 8), level: m.level
              });
            }
          } else if (region.id === 2) {
            addFloatingText(m.x, m.y - 76, 'MARÉ ÁCIDA DO ABISMO!', '#4be3c8', 16);
            hazardZones.push({
              x: p.x, y: p.y, rad: 56, createdAt: now, duration: 750,
              color: '#4be3c8', label: 'ÁCIDO', damage: Math.round(m.level * 0.40 + 12), level: m.level,
              lingeringUntil: now + 4200
            });
            // Fire acid projectile towards player if distant
            if (d > 70) {
              arrowShots.push({
                x1: m.x, y1: m.y - 20, x2: p.x, y2: p.y,
                life: 0.4, maxLife: 0.4, type: 'magic'
              });
            }
          } else if (region.id === 3) {
            addFloatingText(m.x, m.y - 76, m.phase2Triggered ? 'TERREMOTO DE MAGMA!' : 'ONDA DE BRASA!', '#ff7733', 16);
            if (audio.playBossSlam) audio.playBossSlam();
            hazardZones.push({
              x: m.x, y: m.y, rad: m.phase2Triggered ? 135 : 90, createdAt: now, duration: 850,
              color: '#ff6622', label: 'MAGMA', damage: Math.round(m.level * 0.48 + 15), level: m.level
            });
            if (m.phase2Triggered && d > 75) {
              hazardZones.push({
                x: p.x, y: p.y, rad: 60, createdAt: now + 200, duration: 800,
                color: '#ea580c', label: 'CRATERA', damage: Math.round(m.level * 0.42 + 12), level: m.level
              });
            }
          } else if (region.id === 4) {
            addFloatingText(m.x, m.y - 76, 'GLIFOS DO CONHECIMENTO!', '#c577e8', 16);
            hazardZones.push({
              x: p.x, y: p.y, rad: 62, createdAt: now, duration: 800,
              color: '#c577e8', label: 'GLIFO', damage: Math.round(m.level * 0.50 + 16), level: m.level
            });
            if (m.phase2Triggered && (!m.runeShield || now > m.runeShield + 6000)) {
              m.runeShield = now + 4500;
              addFloatingText(m.x, m.y - 92, 'ESCUDO RÚNICO (DEFESA +50%)', '#cd77f7', 14);
            }
          } else if (region.id === 5) {
            addFloatingText(m.x, m.y - 76, 'CHUVA CÓSMICA DO ECLIPSE!', '#ff4d79', 18);
            for (let s = 0; s < (m.phase2Triggered ? 3 : 2); s++) {
              hazardZones.push({
                x: p.x + R(-80, 80), y: p.y + R(-80, 80), rad: 56, createdAt: now + s * 160, duration: 850,
                color: '#e84d79', label: 'ECLIPSE', damage: Math.round(m.level * 0.55 + 20), level: m.level
              });
            }
          }
        }

        if (d > 42) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const mx = (dx / d) * m.sp * dt;
          const my = (dy / d) * m.sp * dt;
          m.facing = directionFromVector(dx, dy);
          const beforeX = m.x;
          const beforeY = m.y;
          if (!terrain.blockedAt(m.x + mx, m.y, 12, trees, decor)) m.x += mx;
          if (!terrain.blockedAt(m.x, m.y + my, 12, trees, decor)) m.y += my;
          m.isMoving = Math.abs(m.x-beforeX) + Math.abs(m.y-beforeY) > 0.01;
        } else if (m.boss) {
          if (m.windup && now - m.windupAt >= 720) {
            m.windup = false;
            m.atk = now;
            m.lastAttackTime = now;
            if (m.t === 'boss_ashen_golem') {
              screenShake = Math.max(screenShake, 15);
              sparks(m.x, m.y + 10, '#ff4400', 32);
              sparks(m.x, m.y + 10, '#ffbb00', 24);
            }
            if (region.id === 3 && m.t === region.bossSprite) {
              m.impactAt = now;
              m.impactX = p.x;
              m.impactY = p.y + 5;
            }
            const base = Math.max(5, Math.round(5 + m.level * 0.11));
            let incoming = p.shield ? 2 : Math.max(1, base * 4 - (p.shieldEquipped ? 4 : 0) - window.GameClasses.get(p.classId).armor - (p.talents.includes('iron') ? 2 : 0));
            if (p.ultimateBuffUntil && now < p.ultimateBuffUntil) incoming = 0; // Ultimate invulnerability!
            if (incoming > 0) {
              p.hp = Math.max(0, p.hp - incoming);
              p.hurtAt = now;
              audio.playHit();
              sparks(p.x, p.y, '#ef6c5d', 12);
              addFloatingText(p.x, p.y - 15, '-' + incoming, '#ff3344', 16);
              if (!p.hp) playerDeath(true, now);
            } else {
              addFloatingText(p.x, p.y - 15, 'BLOQUEIO TITÂNICO!', '#fbbf24', 14);
            }
            m.attackCount++;
            renderUI({ p, kills, ore, loot, quest: currentQuest() });
          } else if (!m.windup && now - m.atk > (m.phase2Triggered ? 1600 : 2100)) {
            m.windup = true;
            m.windupAt = now;
            m.lastAttackTime = now;
            addFloatingText(m.x, m.y - 76, m.t === 'boss_ashen_golem' ? 'MARTELADA DE MAGMA!' : 'GOLPE DO CHEFE!', '#ffb46e', 14);
          }
        } else if (now - m.atk > 1150) {
          m.atk = now;
          let incoming = Math.max(10, Math.round(10 + m.level * 0.32));
          if (m.t === 'golem') incoming = Math.round(incoming * 1.45);
          if (p.shield) incoming = 2;
          if (!p.shield) incoming = Math.max(1, incoming - (p.shieldEquipped ? 4 : 0) - window.GameClasses.get(p.classId).armor - (p.talents.includes('iron') ? 2 : 0));
          p.hp = Math.max(0, p.hp - incoming);
          p.hurtAt = now;
          audio.playHit();
          sparks(p.x, p.y, '#ef6c5d', 8);
          addFloatingText(p.x, p.y - 15, '-' + incoming, '#ff3344', 14);

          if (!p.hp) playerDeath(false, now);
          renderUI({ p, kills, ore, loot, quest: currentQuest() });
        }
      }
    }

    // Update Nodes
    nodes.forEach((n) => {
      if (!n.alive && now > n.back) n.alive = true;
    });

    // Update Hazard Zones (Boss mechanics)
    for (let i = hazardZones.length - 1; i >= 0; i--) {
      const hz = hazardZones[i];
      const age = now - hz.createdAt;
      if (!hz.detonated && age >= hz.duration) {
        hz.detonated = true;
        audio.playHit();
        sparks(hz.x, hz.y, hz.color, 18);
        if (hz.isPlayerZone) {
          emitCombatEffect('impact', hz.x, hz.y, hz.color, { duration: 600, radius: hz.rad });
          mobs.filter(m => m.alive && D(m, hz) < hz.rad).forEach(m => {
            hurt(m, now, hz.damage || 30, 'aoe', true);
            sparks(m.x, m.y, hz.color, 14);
          });
        } else {
          if (D(p, hz) < hz.rad) {
            let dmg = Math.max(1, Math.round(hz.damage - (p.shieldEquipped ? 4 : 0) - window.GameClasses.get(p.classId).armor));
            if (p.shield) dmg = Math.max(1, Math.round(dmg * 0.35));
            if (p.ultimateBuffUntil && now < p.ultimateBuffUntil) dmg = 0;
            if (dmg > 0) {
              p.hp = Math.max(0, p.hp - dmg);
              audio.playHit();
              addFloatingText(p.x, p.y - 20, (hz.label ? hz.label + ' ' : '') + '-' + dmg, hz.color, 16);
              if (!p.hp) playerDeath(true, now);
              renderUI({ p, kills, ore, loot, quest: currentQuest() });
            } else {
              addFloatingText(p.x, p.y - 20, 'BLOQUEIO TITÂNICO!', '#fbbf24', 14);
            }
          }
        }
      }
      if (hz.detonated) {
        if (hz.lingeringUntil && now < hz.lingeringUntil) {
          if (D(p, hz) < hz.rad && (!p.lastPoisonTick || now - p.lastPoisonTick > 750)) {
            p.lastPoisonTick = now;
            const poisonDmg = Math.max(1, Math.round(2 + hz.level * 0.05));
            p.hp = Math.max(0, p.hp - poisonDmg);
            addFloatingText(p.x, p.y - 12, '-' + poisonDmg + ' VENENO', '#4be3c8', 13);
            if (!p.hp) playerDeath(true, now);
            renderUI({ p, kills, ore, loot, quest: currentQuest() });
          }
        } else {
          hazardZones.splice(i, 1);
        }
      }
    }

    // Update Dungeon Spike Traps Hazard
    if (dungeonMode && window.DungeonCraftPixData?.traps) {
      const trapAnimSteps = [0, 0, 0, 1, 2, 3, 4, 4, 2, 0];
      const trapStep = Math.floor((now / 200) % trapAnimSteps.length);
      const isSpikeLethal = trapAnimSteps[trapStep] >= 3;
      if (isSpikeLethal && (!p.lastTrapHit || now - p.lastTrapHit > 850)) {
        const ox = region.col * ZONE_W;
        const oy = region.row * ZONE_H;
        for (const tr of window.DungeonCraftPixData.traps) {
          const tx = ox + tr.x;
          const ty = oy + tr.y;
          if (Math.hypot(p.x - tx, p.y - ty) < 22) {
            p.lastTrapHit = now;
            const trapDmg = Math.max(6, Math.round(p.max * 0.08));
            p.hp = Math.max(0, p.hp - trapDmg);
            p.hurtAt = now;
            screenShake = Math.max(screenShake, 5);
            audio.playHit();
            sparks(p.x, p.y, '#ef4444', 20);
            addFloatingText(p.x, p.y - 18, '-' + trapDmg + ' [ARMADILHA]', '#ef4444', 15);
            if (!p.hp) playerDeath(true, now);
            renderUI({ p, kills, ore, loot, quest: currentQuest() });
            break;
          }
        }
      }
    }

    // Update Particles
    for (let i = parts.length - 1; i >= 0; i--) {
      const z = parts[i];
      z.x += z.vx * dt;
      z.y += z.vy * dt;
      z.vy += 110 * dt;
      z.t -= dt;
      if (z.t <= 0) parts.splice(i, 1);
    }

    for (let i = combatEffects.length - 1; i >= 0; i--) {
      if (now - combatEffects[i].started >= combatEffects[i].duration) combatEffects.splice(i, 1);
    }

    // Update Floating texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      ft.alpha = Math.max(0, ft.life / 0.95);
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }

    // Update Lightning arcs
    for (let i = lightningArcs.length - 1; i >= 0; i--) {
      const la = lightningArcs[i];
      la.life -= dt;
      if (la.life <= 0) lightningArcs.splice(i, 1);
    }

    // Update Arrow and Magic projectile shots
    for (let i = arrowShots.length - 1; i >= 0; i--) {
      arrowShots[i].life -= dt;
      if (arrowShots[i].life <= 0) arrowShots.splice(i, 1);
    }

    // Update Dash trail
    if (p.dashTrail && p.dashTrail.length) {
      for (let i = p.dashTrail.length - 1; i >= 0; i--) {
        p.dashTrail[i].alpha -= dt * 3;
        if (p.dashTrail[i].alpha <= 0) p.dashTrail.splice(i, 1);
      }
    }

    // Update Ambient particles
    ambientParticles.forEach((ap) => {
      ap.x += ap.vx * dt + Math.sin(ap.phase) * (dt * 12);
      ap.y += ap.vy * dt;
      ap.phase += dt * 2;
      if (ap.vy < 0 && ap.y < -10) {
        ap.y = c.height + 10;
        ap.x = R(0, c.width);
      } else if (ap.vy > 0 && ap.y > c.height + 10) {
        ap.y = -10;
        ap.x = R(0, c.width);
      }
      if (ap.x < -10) ap.x = c.width + 10;
      if (ap.x > c.width + 10) ap.x = -10;
    });

    // Update Cooldowns & Buffs
    for (let i = 1; i <= 6; i++) p.cd[i] = Math.max(0, (p.cd[i] || 0) - dt);
    p.shield = Math.max(0, p.shield - dt);
    p.en = Math.min(100, p.en + dt * 1.5);

    toast -= dt;
    if (toast <= 0) $('#toast').classList.remove('show');

    const nearDrop = drops.some((d) => D(d, p) < 62);
    const nearNpc = !dungeonMode && D(p, dungeonNpcPosition()) < 82;
    const guide = !dungeonMode ? regionalGuidePosition() : null;
    const nearGuide = !!guide && D(p, guide) < 82;
    const nearExit = dungeonMode && dungeonSession && D(p, dungeonSession.exit) < 82;
    const nearStairs = dungeonMode && dungeonSession && D(p, dungeonSession.stairs) < 92;
    const nearCastlePortal = !dungeonMode && region.id === 0 && D(p, { x: 2860, y: 3320 }) < 110;
    const showHint = nearDrop || nearNpc || nearGuide || nearExit || nearStairs || nearCastlePortal;
    $('#hint').classList.toggle('show', showHint);
    if (nearDrop) $('#hint').textContent = 'E · RECOLHER ITEM';
    else if (nearCastlePortal) $('#hint').textContent = 'E · PORTAL DAS MASMORRAS';
    else if (nearGuide) $('#hint').textContent = regionNpcRewards[guide.id] ? 'E · CONVERSAR COM ' + guide.name.toUpperCase() : 'E · RECEBER AJUDA DE ' + guide.name.toUpperCase();
    else if (nearNpc) $('#hint').textContent = 'E · FALAR COM ' + region.npcName.toUpperCase();
    else if (nearExit) $('#hint').textContent = 'E · SAIR DA MASMORRA';
    else if (nearStairs) $('#hint').textContent = dungeonSession.cleared ? 'E · DESCER AO PRÓXIMO ANDAR' : 'ELIMINE AS CRIATURAS PARA LIBERAR AS ESCADAS';

    cam.x = C(p.x - c.width / 2, 0, Math.max(0, W.w - c.width));
    cam.y = C(p.y - c.height * 0.53, 0, Math.max(0, W.h - c.height));

    renderUI({ p, kills, ore, loot, quest: currentQuest() });
    updateBagUI();
  }

  function box(a, b, w, h, col) {
    g.fillStyle = col;
    g.fillRect(a, b, w, h);
  }

  function floor() {
    if (dungeonMode) {
      drawDungeonFloor();
      return;
    }
    if (terrain.drawFloor(g, region, ZONE_W, ZONE_H, cam, { w: c.width, h: c.height })) return;
    const left = Math.max(0, cam.x - 80);
    const top = Math.max(0, cam.y - 80);
    const right = Math.min(W.w, cam.x + c.width + 80);
    const bottom = Math.min(W.h, cam.y + c.height + 80);
    const hash = (x, y, seed) => {
      let n = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041)) | 0;
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
    };

    for (let zoneY = Math.floor(top / ZONE_H); zoneY <= Math.floor(bottom / ZONE_H); zoneY++) {
      for (let zoneX = Math.floor(left / ZONE_W); zoneX <= Math.floor(right / ZONE_W); zoneX++) {
        const sampleX = zoneX * ZONE_W + ZONE_W / 2;
        const sampleY = zoneY * ZONE_H + ZONE_H / 2;
        const biome = regionAt(sampleX, sampleY) || region;
        const ox = zoneX * ZONE_W;
        const oy = zoneY * ZONE_H;
        g.fillStyle = biome.bg;
        g.fillRect(ox, oy, ZONE_W, ZONE_H);
        for (let i = 0; i < 230; i++) {
          const px = ox + hash(i, biome.id, 19) * ZONE_W;
          const py = oy + hash(i, biome.id, 47) * ZONE_H;
          const radius = 14 + hash(i, biome.id, 83) * 42;
          g.globalAlpha = 0.05 + hash(i, biome.id, 131) * 0.09;
          g.fillStyle = i % 4 === 0 ? biome.accent : i % 2 ? biome.tree : biome.bg;
          g.beginPath();
          g.ellipse(px, py, radius * 1.3, radius * 0.48, hash(i, biome.id, 151) * Math.PI, 0, Math.PI * 2);
          g.fill();
        }
        g.globalAlpha = 1;

        const offset = (biome.id - 3) * 18;
        const path = new Path2D();
        path.moveTo(ox + 936 + offset, oy - 50);
        path.bezierCurveTo(ox + 1000 + offset, oy + 190, ox + 875 + offset, oy + 330, ox + 952 + offset, oy + 520);
        path.bezierCurveTo(ox + 1030 + offset, oy + 720, ox + 874 + offset, oy + 875, ox + 954 + offset, oy + 1085);
        path.bezierCurveTo(ox + 1004 + offset, oy + 1230, ox + 884 + offset, oy + 1350, ox + 955 + offset, oy + ZONE_H + 50);
        path.moveTo(ox - 50, oy + 730 + offset * 0.4);
        path.bezierCurveTo(ox + 350, oy + 690 + offset * 0.4, ox + 595, oy + 775 + offset * 0.4, ox + 940, oy + 730 + offset * 0.4);
        path.bezierCurveTo(ox + 1220, oy + 690 + offset * 0.4, ox + 1540, oy + 770 + offset * 0.4, ox + ZONE_W + 50, oy + 725 + offset * 0.4);
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.strokeStyle = 'rgba(12, 13, 11, 0.3)';
        g.lineWidth = 100;
        g.stroke(path);
        g.strokeStyle = biome.path;
        g.lineWidth = 82;
        g.stroke(path);

        for (let i = 0; i < 380; i++) {
          const px = ox + hash(i, biome.id, 211) * ZONE_W;
          const py = oy + hash(i, biome.id, 223) * ZONE_H;
          g.globalAlpha = 0.14 + hash(i, biome.id, 229) * 0.2;
          g.fillStyle = i % 6 ? biome.tree : biome.accent;
          g.beginPath();
          g.ellipse(px, py, 1.7, 1, hash(i, biome.id, 233) * Math.PI, 0, Math.PI * 2);
          g.fill();
        }
        g.globalAlpha = 1;
      }
    }
  }

  function drawDungeonFloor() {
    const ox = region.col * ZONE_W;
    const oy = region.row * ZONE_H;

    const craftpixImg = region.id === 1 ? dungeonVFXSprites.craftpixMap : null;
    const customDungeonMap = (craftpixImg?.complete && craftpixImg.naturalWidth) ? craftpixImg : dungeonMaps[region.id];
    if (customDungeonMap?.complete && customDungeonMap.naturalWidth) {
      // 1. High-Resolution CraftPix / DungeonFog Tactical Battlemap
      g.drawImage(customDungeonMap, ox, oy, ZONE_W, ZONE_H);

      // Subtle atmospheric floor lighting overlay based on dungeon theme
      const glow = g.createRadialGradient(ox + 960, oy + 710, 80, ox + 960, oy + 710, 1120);
      glow.addColorStop(0, region.id === 3 || region.id === 5 ? 'rgba(176,65,35,.15)' : 'rgba(67,131,133,.10)');
      glow.addColorStop(1, 'rgba(4,7,10,.62)');
      g.fillStyle = glow;
      g.fillRect(ox, oy, ZONE_W, ZONE_H);

      // 2. Animated Spike Traps from Dungeon1.tmx
      if (window.DungeonCraftPixData?.traps && dungeonVFXSprites.trapStrip?.complete) {
        const trapAnimSteps = [0, 0, 0, 1, 2, 3, 4, 4, 2, 0];
        const trapStep = Math.floor((last / 200) % trapAnimSteps.length);
        const trapFrame = trapAnimSteps[trapStep];
        for (const tr of window.DungeonCraftPixData.traps) {
          const rx = ox + tr.x;
          const ry = oy + tr.y;
          g.drawImage(dungeonVFXSprites.trapStrip, trapFrame * 32, 0, 32, 32, rx - 16, ry - 16, 32, 32);
        }
      }

      // 3. Animated Wall Torches with Dynamic Radial Glow
      if (window.DungeonCraftPixData?.torches && dungeonVFXSprites.torchStrip?.complete) {
        const torchFrame = Math.floor((last / 120) % 6);
        for (const t of window.DungeonCraftPixData.torches) {
          const tx = ox + t.x;
          const ty = oy + t.y;
          g.drawImage(dungeonVFXSprites.torchStrip, torchFrame * 32, 0, 32, 32, tx - 16, ty - 24, 32, 32);

          const flicker = Math.sin(last / 80 + tx) * 4;
          const torchGlow = g.createRadialGradient(tx, ty - 8, 2, tx, ty - 8, 48 + flicker);
          torchGlow.addColorStop(0, 'rgba(251, 191, 36, 0.42)');
          torchGlow.addColorStop(0.5, 'rgba(249, 115, 22, 0.16)');
          torchGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          g.fillStyle = torchGlow;
          g.beginPath();
          g.arc(tx, ty - 8, 48 + flicker, 0, Math.PI * 2);
          g.fill();
        }
      }

      // DungeonFog dynamic boss chamber rune pulsing
      const runePulse = 0.7 + Math.sin(last / 320) * 0.2;
      g.save();
      g.globalAlpha = runePulse;
      g.strokeStyle = region.id === 1 ? '#4ade80' : region.id === 2 ? '#38bdf8' : region.id === 3 ? '#f97316' : '#c084fc';
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(ox + 960, oy + 720, 140, 0, Math.PI * 2);
      g.stroke();
      g.restore();

      // Dungeon Name and Floor Header
      g.fillStyle = '#d9c58a';
      g.textAlign = 'center';
      g.font = '700 16px "Cinzel", serif';
      g.fillText(region.dungeonName.toUpperCase(), ox + 960, oy + 91);
      g.fillStyle = '#b8a47a';
      g.font = '700 11px "Outfit", sans-serif';
      g.fillText('ANDAR ' + String(dungeonSession.floor).padStart(2, '0') + ' / ' + DUNGEON_FLOORS + ' · NV. RECOMENDADO ' + dungeonFloorLevel(), ox + 960, oy + 116);
      return;
    }

    const palette = ['#25282a', '#2b2a28', '#202528', '#302b2a'];
    g.fillStyle = '#111517';
    g.fillRect(ox, oy, ZONE_W, ZONE_H);
    const glow = g.createRadialGradient(ox + 960, oy + 710, 80, ox + 960, oy + 710, 1120);
    glow.addColorStop(0, region.id === 3 || region.id === 5 ? 'rgba(176,65,35,.24)' : 'rgba(67,131,133,.16)');
    glow.addColorStop(1, 'rgba(4,7,10,.72)');
    g.fillStyle = glow;
    g.fillRect(ox, oy, ZONE_W, ZONE_H);

    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 32; col++) {
        const offset = row % 2 ? 25 : 0;
        const x = ox + 105 + col * 54 + offset;
        const y = oy + 106 + row * 50;
        const shade = (row * 11 + col * 7 + region.id + dungeonSession.floor) % palette.length;
        g.globalAlpha = 0.28 + ((row * 5 + col * 3) % 5) * 0.035;
        g.fillStyle = palette[shade];
        g.fillRect(x, y, 47, 42);
        g.fillStyle = 'rgba(5,8,10,.45)';
        g.fillRect(x + 3, y + 37, 40, 4);
      }
    }
    g.globalAlpha = 1;

    const accents = {
      1: { color: '#72c989', label: 'fungos fosforescentes' },
      2: { color: '#55cbd0', label: 'poços espectrais' },
      3: { color: '#f0743e', label: 'fendas de magma' },
      4: { color: '#b97bd9', label: 'runas sepultadas' },
      5: { color: '#ec667f', label: 'fissuras do vazio' }
    }[region.id];
    [[350, 760, 98], [1510, 720, 112], [960, 500, 65]].forEach(([x, y, radius], index) => {
      const featureGlow = g.createRadialGradient(ox + x, oy + y, 2, ox + x, oy + y, radius);
      featureGlow.addColorStop(0, accents.color + '50');
      featureGlow.addColorStop(1, accents.color + '00');
      g.fillStyle = featureGlow;
      g.beginPath();
      g.ellipse(ox + x, oy + y, radius, radius * (index === 1 ? 0.48 : 0.62), 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = accents.color + '55';
      g.lineWidth = index === 2 ? 3 : 5;
      g.beginPath();
      g.ellipse(ox + x, oy + y, radius * 0.68, radius * 0.3, (region.id + index) * 0.4, 0, Math.PI * 2);
      g.stroke();
    });

    // Rough cavern walls and supporting pillars.
    g.fillStyle = '#14191b';
    g.fillRect(ox + 55, oy + 55, ZONE_W - 110, 60);
    g.fillRect(ox + 55, oy + ZONE_H - 115, ZONE_W - 110, 60);
    g.fillRect(ox + 55, oy + 55, 65, ZONE_H - 110);
    g.fillRect(ox + ZONE_W - 120, oy + 55, 65, ZONE_H - 110);
    [[210, 260], [1690, 260], [210, 1180], [1690, 1180], [480, 720], [1420, 720]].forEach(([x, y]) => {
      g.fillStyle = '#3a3733';
      g.fillRect(ox + x - 15, oy + y - 24, 30, 48);
      g.fillStyle = '#595149';
      g.fillRect(ox + x - 21, oy + y - 24, 42, 8);
      g.fillRect(ox + x - 19, oy + y + 16, 38, 8);
    });
    g.strokeStyle = 'rgba(132,148,139,.2)';
    g.lineWidth = 2;
    [[330, 490, 405, 540], [1450, 400, 1500, 465], [560, 1090, 635, 1050], [1260, 970, 1340, 1030]].forEach(([x1, y1, x2, y2]) => {
      g.beginPath();
      g.moveTo(ox + x1, oy + y1);
      g.lineTo(ox + (x1 + x2) / 2, oy + (y1 + y2) / 2 + 22);
      g.lineTo(ox + x2, oy + y2);
      g.stroke();
    });
    g.fillStyle = '#d9c58a';
    g.textAlign = 'center';
    g.font = '700 16px "Cinzel", serif';
    g.fillText(region.dungeonName.toUpperCase(), ox + 960, oy + 91);
    g.fillStyle = '#b8a47a';
    g.font = '700 11px "Outfit", sans-serif';
    g.fillText('ANDAR ' + String(dungeonSession.floor).padStart(2, '0') + ' / ' + DUNGEON_FLOORS + ' · NV. RECOMENDADO ' + dungeonFloorLevel(), ox + 960, oy + 116);
  }

  function playerDeath(fromBoss, now) {
    if (p.talents.includes('last-ember') && Date.now() - (p.lastEmberAt || 0) >= 300000) {
      p.lastEmberAt = Date.now();
      p.hp = Math.ceil(p.max * 0.35);
      p.shield = 0;
      p.respawnGraceUntil = now + 2200;
      p.x = region.col * ZONE_W + ZONE_W / 2;
      p.y = region.row * ZONE_H + ZONE_H / 2;
      syncPetToPlayer();
      goal = null;
      route = [];
      enemy = object = null;
      autoTarget = null;
      mobs.forEach((m) => { m.x = m.ox; m.y = m.oy; m.aggro = false; m.windup = false; });
      msg('Última Brasa se consumiu · você resistiu à morte!');
      sparks(p.x, p.y, '#ff9a55', 30);
      renderUI({ p, kills, ore, loot, quest: currentQuest() });
      save();
      return;
    }

    // Inicia animação de morte do herói
    p.deathStartedAt = now;
    p.isDying = true;
    key.clear();
    route = [];
    goal = null;
    autoTarget = null;
    addFloatingText(p.x, p.y - 25, 'VOCÊ SUCUMBIU ÀS CINZAS...', '#ef4444', 20);
    msg('Você sucumbiu em batalha... Renascendo nas chamas ancestrais.');

    setTimeout(() => {
      const loss = Math.min(p.xp, progression.deathXp(p.lvl, fromBoss));
      p.xp -= loss;
      p.hp = p.max;
      p.gold = Math.max(0, p.gold - 10);
      p.shield = 0;
      p.isDying = false;
      p.deathStartedAt = null;
      p.respawnGraceUntil = performance.now() + 2500;
      p.x = region.col * ZONE_W + ZONE_W / 2;
      p.y = region.row * ZONE_H + ZONE_H / 2;
    syncPetToPlayer();
    goal = null;
    route = [];
    enemy = null;
    object = null;
    autoTarget = null;
    key.clear();
    mobs.forEach((m) => {
      m.x = m.ox;
      m.y = m.oy;
      m.aggro = false;
      m.windup = false;
    });
    msg(loss
      ? 'Você retornou ao acampamento · -' + loss + ' XP' + (fromBoss ? ' (chefe: perda dobrada)' : '') + ' · -10 ouro'
      : 'Você retornou ao acampamento · -10 ouro');
      renderUI({ p, kills, ore, loot, quest: currentQuest() });
      save();
    }, 900);
  }

  function groundShadow(x, y, rx = 15, ry = 5, opacity = 0.3) {
    const gradient = g.createRadialGradient(x, y, 1, x, y, rx);
    gradient.addColorStop(0, `rgba(3, 6, 4, ${opacity})`);
    gradient.addColorStop(1, 'rgba(3, 6, 4, 0)');
    g.fillStyle = gradient;
    g.beginPath();
    g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    g.fill();
  }

  function tree(t) {
    const { x, y, s, kind = 'tree' } = t;
    const isOak = kind === 'mana_seed_oak_tree';
    const isMangrove = kind.startsWith('mangrove_tree_') || kind.startsWith('swamp_dead_tree_');
    const im = isOak ? propSprites.tree_oak_giant : (isMangrove ? propSprites[kind] : (worldSprites[kind] || worldSprites.tree));
    const scale = s || 1;
    const w = (kind === 'pine' ? 74 : isOak ? 104 : isMangrove ? 116 : kind === 'tree' ? 79 : 70) * scale;
    const h = (kind === 'pine' ? 110 : isOak ? 124 : isMangrove ? 212 : kind === 'tree' ? 120 : 62) * scale;
    groundShadow(x, y - 2, (kind === 'pine' ? 21 : isOak ? 32 : isMangrove ? 38 : 28) * scale, 8 * scale, 0.32);
    if (im?.complete && im.naturalWidth) {
      const overlapsHero = Math.abs(p.x - x) < w * 0.38 + 12 && p.y < y + 12 && p.y > y - h * 0.72;
      g.save();
      if (overlapsHero) g.globalAlpha *= 0.38;
      g.drawImage(im, x - w / 2, y - h + 14, w, h);
      g.restore();
    }
  }

  function drawDecor(d) {
    if (houseSprites[d.kind]) {
      const im = houseSprites[d.kind];
      if (im?.complete && im.naturalWidth) {
        const scale = 0.58 * (d.s || 1);
        const w = im.naturalWidth * scale;
        const h = im.naturalHeight * scale;
        groundShadow(d.x, d.y + 4, w * 0.44, 16, 0.48);
        g.drawImage(im, d.x - w / 2, d.y - h + 14, w, h);
        if (d.title) {
          g.save();
          g.fillStyle = 'rgba(15, 12, 22, 0.88)';
          g.strokeStyle = '#f59e0b';
          g.lineWidth = 1.2;
          const tw = g.measureText ? g.measureText(d.title).width + 16 : 120;
          g.beginPath();
          g.roundRect(d.x - tw / 2, d.y - h - 18, tw, 20, 4);
          g.fill();
          g.stroke();
          g.fillStyle = '#fde68a';
          g.font = '700 10.5px "Outfit", sans-serif';
          g.textAlign = 'center';
          g.fillText(d.title, d.x, d.y - h - 4);
          g.restore();
        }
      }
      return;
    }

    const im = mountainSprites[d.kind] || propSprites[d.kind] || natureSprites[d.kind] || worldSprites[d.kind];
    if (im?.complete && im.naturalWidth) {
      const isBookshelf = d.kind === 'library_bookshelf';
      const isStatue = d.kind === 'stone_gargoyle' || d.kind === 'stone_dragon_statue';
      const isMountain = d.kind.startsWith('mountain_') || d.kind.startsWith('rock_plateau') || d.kind.startsWith('rock_moss_cluster');
      const isCaveProp = d.kind.startsWith('stalagmite_') || d.kind.startsWith('mine_cart_') || d.kind.startsWith('rock_pile_') || d.kind.startsWith('rock_cave_') || d.kind.startsWith('cave_hole_');
      const isPixelProp = d.kind === 'ruined_statue' || d.kind === 'arcane_brazier' || d.kind === 'training_dummy';
      const isSwampWaterFlora = d.kind.startsWith('water_lily') || d.kind.startsWith('water_lotus') || d.kind.startsWith('water_pads') || d.kind.startsWith('duckweed');
      const isSwampProp = d.kind.startsWith('swamp_') || d.kind.startsWith('cattail_') || d.kind.startsWith('mangrove_water_roots') || isSwampWaterFlora;
      const scale = isBookshelf ? 0.088 * d.s : isStatue ? 0.095 * d.s : isMountain ? 0.42 * d.s : isCaveProp ? 0.22 * d.s : isPixelProp ? 0.82 * d.s : isSwampProp ? 0.85 * d.s : 0.24 * d.s;
      const w = im.naturalWidth * scale;
      const h = im.naturalHeight * scale;

      if (isSwampWaterFlora) {
        // Floating water flora: subtle ripple ring on murky water and gentle bobbing
        const bob = Math.sin((last / 380) + d.x * 0.15) * 2;
        g.save();
        g.strokeStyle = 'rgba(45, 212, 191, 0.22)';
        g.lineWidth = 1.2;
        g.beginPath();
        g.ellipse(d.x, d.y + 2, w * 0.38, 5, 0, 0, Math.PI * 2);
        g.stroke();
        g.drawImage(im, d.x - w / 2, d.y - h + 6 + bob, w, h);
        g.restore();
        return;
      }

      if (d.kind.startsWith('cave_hole_')) {
        g.save();
        g.globalAlpha = 0.88;
        g.drawImage(im, d.x - w / 2, d.y - h / 2, w, h);
        g.restore();
      } else {
        g.drawImage(im, d.x - w / 2, d.y - h + 10, w, h);
      }

      // Arcane crystal brazier glow
      if (d.kind === 'arcane_brazier') {
        g.save();
        const pulse = Math.sin(last / 220 + d.x) * 4;
        g.fillStyle = 'rgba(56, 189, 248, 0.28)';
        g.beginPath();
        g.arc(d.x, d.y - 36, 18 + pulse, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }

      // Bioluminescent mushroom glow
      if (d.kind === 'mushroom_blue' || d.kind === 'mushroom_purple') {
        const glowCol = d.kind === 'mushroom_blue' ? 'rgba(94, 234, 212, 0.35)' : 'rgba(192, 132, 252, 0.35)';
        g.save();
        g.fillStyle = glowCol;
        g.beginPath();
        g.arc(d.x, d.y - 8, 22 + Math.sin(last / 300 + d.x) * 3, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }
    }
  }

  function drawDungeonNpc() {
    if (dungeonMode) return;
    const npc = dungeonNpcPosition();
    const x = npc.x;
    const y = npc.y;
    g.save();
    groundShadow(x, y + 3, 19, 7, 0.42);
    g.strokeStyle = 'rgba(232, 190, 96, 0.62)';
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(x, y + 3, 24, 10, 0, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = '#64462d';
    g.beginPath();
    g.moveTo(x - 13, y - 25);
    g.lineTo(x + 13, y - 25);
    g.lineTo(x + 17, y + 1);
    g.lineTo(x - 17, y + 1);
    g.closePath();
    g.fill();
    g.fillStyle = '#cba66f';
    g.fillRect(x - 8, y - 43, 16, 17);
    g.fillStyle = '#2a2222';
    g.fillRect(x - 11, y - 47, 22, 8);
    g.fillRect(x - 7, y - 53, 14, 8);
    g.fillStyle = '#d9c58a';
    g.fillRect(x + 18, y - 38, 3, 43);
    g.fillStyle = '#8fe5e6';
    g.beginPath();
    g.arc(x + 20, y - 42, 5, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#fff0bf';
    g.font = '700 11px "Outfit", sans-serif';
    g.textAlign = 'center';
    g.fillText(region.npcName, x, y - 66);
    g.fillStyle = '#e9c878';
    g.font = '700 9px "Outfit", sans-serif';
    g.fillText('E · CONTRATOS DE MASMORRA', x, y - 53);
    g.restore();
  }

  function drawRegionalGuide(n) {
    g.save();
    const nearby = D(p, n) < 92;
    groundShadow(n.x, n.y + 3, 20, 7, 0.38);
    g.globalAlpha = 0.76;
    g.strokeStyle = n.color;
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(n.x, n.y + 2, 25, 9, 0, 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 1;
    const spr = npcSprites[n.sprite];
    if (spr?.complete && spr.naturalWidth) {
      const spriteSize = n.spriteSize || 104;
      const feetOffset = (45 / 64) * spriteSize;
      g.drawImage(spr, 0, 0, 64, 64, n.x - spriteSize / 2, n.y - feetOffset, spriteSize, spriteSize);
    }
    const bannerY = n.y - (nearby ? 104 : 91);
    g.fillStyle = 'rgba(14, 18, 17, 0.9)';
    g.strokeStyle = n.color;
    g.lineWidth = 1.2;
    g.beginPath();
    g.roundRect(n.x - 76, bannerY, 152, nearby ? 34 : 22, 5);
    g.fill();
    g.stroke();
    g.textAlign = 'center';
    g.fillStyle = '#fff4d2';
    g.font = '700 10px "Outfit", sans-serif';
    g.fillText(n.name, n.x, bannerY + 12);
    if (nearby) {
      g.fillStyle = regionNpcRewards[n.id] ? '#b9c0b5' : '#f5d77b';
      g.font = '600 8px "Outfit", sans-serif';
      g.fillText(regionNpcRewards[n.id] ? 'E · CONVERSAR' : 'E · ' + n.reward.toUpperCase(), n.x, bannerY + 26);
    }
    g.restore();
  }

  function drawCastleNpc(n, t) {
    const x = n.x;
    const y = n.y;
    g.save();

    // Ground Shadow & Runic Base Ring
    groundShadow(x, y + 3, 24, 9, 0.48);
    // NPC Shadow
    g.fillStyle = 'rgba(0, 0, 0, 0.45)';
    g.beginPath();
    g.ellipse(x, y + 2, 22, 9, 0, 0, Math.PI * 2);
    g.fill();

    // Subtle magical ground aura
    const dist = D(p, n);

    // ─── 1. CASO ESPECIAL: ALTAR DA CHAMA ANCESTRAL (Centro do Pátio) ───
    if (n.isAltar) {
      // Golden magical runic base
      const pulse = 0.5 + Math.sin(t / 260) * 0.2;
      g.strokeStyle = '#f59e0b';
      g.globalAlpha = pulse;
      g.lineWidth = 3;
      g.beginPath();
      g.ellipse(x, y + 4, 38, 16, 0, 0, Math.PI * 2);
      g.stroke();

      // Stone brazier
      g.fillStyle = '#261a15';
      g.beginPath();
      g.arc(x, y - 8, 22, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#78350f';
      g.lineWidth = 2.5;
      g.stroke();

      // Sacred Eternal Fire VFX
      const flameWobble = Math.sin(t / 140) * 3;
      const flameHeight = 28 + Math.sin(t / 90) * 4;
      const flameGrad = g.createRadialGradient(x, y - 16, 2, x, y - 16, 24);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.3, '#fde047');
      flameGrad.addColorStop(0.7, '#f97316');
      flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      g.fillStyle = flameGrad;
      g.beginPath();
      g.arc(x + flameWobble, y - 16, 20, 0, Math.PI * 2);
      g.fill();

      // Flame Spire
      g.fillStyle = '#fef08a';
      g.beginPath();
      g.moveTo(x - 12, y - 12);
      g.lineTo(x + 12, y - 12);
      g.lineTo(x + flameWobble, y - 12 - flameHeight);
      g.closePath();
      g.fill();

      // Ascending Spark Motes
      for (let s = 0; s < 3; s++) {
        const sy = (t / 8 + s * 14) % 36;
        const sx = Math.sin(t / 200 + s * 2) * 8;
        g.fillStyle = s % 2 === 0 ? '#fde047' : '#f97316';
        g.fillRect(x + sx - 1, y - 18 - sy, 2, 2);
      }

      // Proximity interaction hint: only when close!
      if (dist < 90) {
        const hintY = y - 62;
        g.fillStyle = 'rgba(15, 12, 22, 0.94)';
        g.strokeStyle = '#f59e0b';
        g.lineWidth = 1.5;
        g.beginPath();
        g.roundRect(x - 95, hintY, 190, 26, 6);
        g.fill();
        g.stroke();

        g.fillStyle = '#fde68a';
        g.font = '700 11px "Outfit", sans-serif';
        g.textAlign = 'center';
        g.fillText('• [E] Descansar na Chama Ancestral', x, hintY + 12);
        g.font = '600 8.5px "Outfit", sans-serif';
        g.fillStyle = '#86efac';
        g.fillText('Restaura 100% Vida & Energia', x, hintY + 22);
      }
      g.restore();
      return;
    }

    // ─── 2. NPCS DAS ALAS RADIAIS & BONECOS DE TREINO ───
    groundShadow(x, y + 3, 22, 8, 0.45);

    if (n.isDummy) {
      const dummyImg = propSprites['training_dummy'];
      if (dummyImg?.complete && dummyImg.naturalWidth) {
        const wobble = Math.sin(t / 300) * 1.5;
        g.drawImage(dummyImg, x - 24 + wobble, y - 64, 48, 64);
      } else {
        g.fillStyle = '#854d0e';
        g.fillRect(x - 3, y - 48, 6, 48);
        g.fillStyle = '#ef4444';
        g.beginPath();
        g.arc(x, y - 32, 14, 0, Math.PI * 2);
        g.fill();
      }
    } else {
      // Mana Seed Animated Character Sprite (Harmonized size: ~58px tall, crisp 2x scale)
      const spriteId = n.sprite || n.id;
      const idleSprite = npcSprites[spriteId];
      const spr = idleSprite?.complete && idleSprite.naturalWidth ? idleSprite : null;

      if (spr) {
        const sw = 120 * (n.spriteScale || 1);
        const sh = sw;
        const feetOffset = (45 / 64) * sh;
        g.drawImage(spr, 0, 0, 64, 64, x - sw / 2, y - feetOffset, sw, sh);
      } else {
        g.fillStyle = n.color || '#f59e0b';
        g.beginPath();
        g.moveTo(x - 14, y - 36);
        g.lineTo(x + 14, y - 36);
        g.lineTo(x + 18, y);
        g.lineTo(x - 18, y);
        g.closePath();
        g.fill();

        g.fillStyle = '#fcd34d';
        g.beginPath();
        g.arc(x, y - 46, 10, 0, Math.PI * 2);
        g.fill();
      }
    }

    // ─── 3. HIERARQUIA VISUAL LIMPA (Sem poluição de texto à distância) ───
    const isNearby = dist <= 90;

    if (!isNearby) {
      // À distância (> 2.5 tiles): apenas um mini-ícone elegante e discreto flutuando sobre a cabeça
      const miniY = y - 68;
      const iconKey = n.iconImg ? n.iconImg.split('/').pop().replace('.png', '') : null;
      const customIcon = iconKey ? (hubIcons[iconKey] || propSprites[iconKey]) : null;

      g.fillStyle = 'rgba(15, 12, 22, 0.82)';
      g.strokeStyle = n.color || '#f59e0b';
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(x, miniY, 13, 0, Math.PI * 2);
      g.fill();
      g.stroke();

      if (customIcon?.complete && customIcon.naturalWidth) {
        g.drawImage(customIcon, x - 9, miniY - 9, 18, 18);
      } else {
        g.font = '11px sans-serif';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(n.icon || '!', x, miniY + 1);
      }
    } else {
      // Na proximidade (≤ 2.5 tiles): banner compacto e elegante com nome e ação rápida [E]
      const bannerY = n.isDummy ? y - 82 : y - 100;
      const bannerW = 126;
      const bannerH = 26;

      g.fillStyle = 'rgba(12, 10, 18, 0.94)';
      g.strokeStyle = n.color || '#f59e0b';
      g.lineWidth = 1.5;
      g.beginPath();
      g.roundRect(x - bannerW / 2, bannerY, bannerW, bannerH, 5);
      g.fill();
      g.stroke();

      g.fillStyle = '#ffffff';
      g.font = '700 11px "Outfit", sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'alphabetic';
      g.fillText(n.name, x, bannerY + 12);

      g.fillStyle = '#fde68a';
      g.font = '700 9px "Outfit", sans-serif';
      g.fillText('▶ [E] ' + (n.actionLabel ? n.actionLabel.split(' ')[0] : 'Interagir'), x, bannerY + 22);
    }
    g.restore();
  }

  const remoteHeroSpritesCache = {};
  function getRemoteHeroSprites(classId = 'guerreiro') {
    const id = classId || 'guerreiro';
    if (!remoteHeroSpritesCache[id]) {
      remoteHeroSpritesCache[id] = createHeroSprites(id);
    }
    return remoteHeroSpritesCache[id];
  }

  function drawOnlinePlayer(op, t) {
    const x = op.x;
    const y = op.y;
    g.save();
    groundShadow(x, y + 2, 16, 6, 0.35);
    if (op.color) {
      g.save();
      const aPulse = 1 + Math.sin((t + ((op.id || 1) * 130)) / 280) * 0.08;
      g.translate(x, y + 2);
      g.scale(1, 0.5);
      g.fillStyle = op.color + '22';
      g.beginPath();
      g.arc(0, 0, 18 * aPulse, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = op.color + '77';
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(0, 0, 16 * aPulse, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    }

    // Aura rúnica no chão para aliados de grupo
    const isPartyMember = Boolean(cinzasNet?.party?.members?.some(m => m.id === op.id || m.name === op.name));
    const isLeader = Boolean(cinzasNet?.party && (cinzasNet.party.leaderId === op.id || cinzasNet.party.leader === op.name));
    if (isPartyMember) {
      g.save();
      const pulse = 1 + Math.sin(t / 220) * 0.08;
      const rot = (t / 750) % (Math.PI * 2);
      g.translate(x, y + 2);
      g.scale(1, 0.52);

      g.fillStyle = 'rgba(45, 212, 191, 0.09)';
      g.beginPath();
      g.arc(0, 0, 26 * pulse, 0, Math.PI * 2);
      g.fill();

      g.rotate(rot);
      g.strokeStyle = 'rgba(45, 212, 191, 0.75)';
      g.shadowColor = '#2dd4bf';
      g.shadowBlur = 8;
      g.lineWidth = 1.8;
      g.setLineDash([6, 5]);
      g.beginPath();
      g.arc(0, 0, 24 * pulse, 0, Math.PI * 2);
      g.stroke();

      g.fillStyle = '#2dd4bf';
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        g.fillRect(Math.cos(a) * 24 * pulse - 1.5, Math.sin(a) * 24 * pulse - 1.5, 3, 3);
      }
      g.restore();
    }

    const classId = op.classId || 'guerreiro';
    const fakeP = {
      x: op.x,
      y: op.y,
      classId: classId,
      dir: op.dir || 'south',
      face: op.face || 1,
      moving: Boolean(op.moving),
      walk: op.walk || 0,
      attackAt: op.attackAt || 0
    };

    let drewSprite = false;
    try {
      const sprites = getRemoteHeroSprites(classId);
      const idleImg = sprites?.idle?.[fakeP.dir];
      if (idleImg && idleImg.complete && idleImg.naturalWidth) {
        drawHero(g, fakeP, t, sprites, null);
        drewSprite = true;
      }
    } catch (e) {}

    if (!drewSprite) {
      g.fillStyle = op.color || '#38bdf8';
      g.beginPath();
      g.arc(x, y - 24, 8, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#262626';
      g.fillRect(x - 6, y - 16, 12, 14);
    }

    // Nameplate com indicação de grupo e líder
    g.fillStyle = isPartyMember ? 'rgba(12, 26, 28, 0.94)' : 'rgba(10, 10, 15, 0.85)';
    if (isPartyMember) {
      g.strokeStyle = 'rgba(45, 212, 191, 0.6)';
      g.lineWidth = 1;
    }
    g.beginPath();
    g.roundRect(x - 58, y - 50, 116, 16, 4);
    g.fill();
    if (isPartyMember) g.stroke();

    // Online indicator dot: Ciano se for do grupo, verde normal caso contrário
    g.fillStyle = isPartyMember ? '#2dd4bf' : '#22c55e';
    g.beginPath();
    g.arc(x - 49, y - 42, 3, 0, Math.PI * 2);
    g.fill();

    const displayName = (isLeader ? '👑 ' : '') + op.name;
    g.fillStyle = isPartyMember ? '#ccfbf1' : '#e2e8f0';
    g.font = '700 9px "Outfit", sans-serif';
    g.textAlign = 'center';
    g.fillText(displayName, x + 3, y - 39);

    // Chat speech bubble
    if (op.msg) {
      g.fillStyle = 'rgba(30, 27, 40, 0.94)';
      g.strokeStyle = '#c084fc';
      g.lineWidth = 1;
      const bw = Math.min(200, Math.max(60, op.msg.length * 6.5 + 16));
      g.beginPath();
      g.roundRect(x - bw / 2, y - 76, bw, 20, 5);
      g.fill();
      g.stroke();
      g.fillStyle = '#f3e8ff';
      g.font = '600 9px "Outfit", sans-serif';
      g.fillText(op.msg, x, y - 63);
    }
    g.restore();
  }

  function drawDungeonPortal(point, label, enabled, color) {
    g.save();
    g.globalAlpha = enabled ? 1 : 0.48;

    const isStairs = label.includes('DESCER') || label.includes('LIMPE') || label.includes('VOLTAR');
    const sprite = isStairs ? propSprites.stone_stairs : (propSprites.stone_gate_portal?.complete && propSprites.stone_gate_portal.naturalWidth ? propSprites.stone_gate_portal : propSprites.cave_dungeon_entrance);

    if (sprite?.complete && sprite.naturalWidth) {
      // Glow behind
      const glow = g.createRadialGradient(point.x, point.y - 12, 4, point.x, point.y - 12, isStairs ? 52 : 78);
      glow.addColorStop(0, color + '77');
      glow.addColorStop(0.7, color + '22');
      glow.addColorStop(1, color + '00');
      g.fillStyle = glow;
      g.beginPath();
      g.arc(point.x, point.y - 12, isStairs ? 52 : 78, 0, Math.PI * 2);
      g.fill();

      // Shadow below
      groundShadow(point.x, point.y + 14, isStairs ? 32 : 46, 12, 0.46);

      // Draw sprite
      const scale = (sprite === propSprites.stone_gate_portal) ? 0.72 : 1.5;
      const w = sprite.naturalWidth * scale;
      const h = sprite.naturalHeight * scale;
      g.drawImage(sprite, point.x - w / 2, point.y - h + 18, w, h);
    } else {
      const glow = g.createRadialGradient(point.x, point.y - 12, 2, point.x, point.y - 12, 78);
      glow.addColorStop(0, color + '99');
      glow.addColorStop(1, color + '00');
      g.fillStyle = glow;
      g.beginPath();
      g.arc(point.x, point.y - 12, 78, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = color;
      g.lineWidth = 8;
      g.beginPath();
      g.ellipse(point.x, point.y - 12, 34, 47, 0, Math.PI, Math.PI * 2);
      g.lineTo(point.x + 34, point.y + 9);
      g.lineTo(point.x - 34, point.y + 9);
      g.closePath();
      g.stroke();
      g.fillStyle = '#0b1215';
      g.beginPath();
      g.ellipse(point.x, point.y - 8, 25, 35, 0, 0, Math.PI * 2);
      g.fill();
    }

    g.fillStyle = '#fde68a';
    g.font = '700 11px "Outfit", sans-serif';
    g.textAlign = 'center';
    g.shadowColor = '#000000';
    g.shadowBlur = 5;
    g.fillText(label, point.x, point.y + 30);
    g.restore();
  }

  function drawDynamicLighting(t) {
    // Multi-layered light sources
    lightSources.forEach((light) => {
      const flicker = Math.sin(t / 90 + light.x) * 6 + Math.sin(t / 40 + light.y) * 4;
      const radius = light.rad + flicker;

      // Draw light halo
      let grad = g.createRadialGradient(light.x, light.y - 20, 4, light.x, light.y - 20, radius);
      grad.addColorStop(0, 'rgba(255, 245, 200, 0.85)');
      grad.addColorStop(0.3, light.color ? light.color + '55' : 'rgba(255, 170, 40, 0.35)');
      grad.addColorStop(0.7, 'rgba(212, 106, 21, 0.12)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      g.save();
      g.fillStyle = grad;
      g.beginPath();
      g.arc(light.x, light.y - 20, radius, 0, Math.PI * 2);
      g.fill();
      g.restore();

      // Render the lamp/campfire prop
      if (light.type === 'campfire') {
        const im = propSprites.campfire;
        if (im?.complete && im.naturalWidth) {
          const w = im.naturalWidth * 0.26;
          const h = im.naturalHeight * 0.26;
          g.drawImage(im, light.x - w / 2, light.y - h + 8, w, h);
        }
      } else if (light.type === 'lamp_post') {
        const im = propSprites.lamp_post;
        if (im?.complete && im.naturalWidth) {
          const w = im.naturalWidth * 0.26;
          const h = im.naturalHeight * 0.26;
          g.drawImage(im, light.x - w / 2, light.y - h + 10, w, h);
        }
      } else if (light.type === 'arcane_brazier') {
        const im = propSprites.arcane_brazier || propSprites.campfire;
        if (im?.complete && im.naturalWidth) {
          const w = im.naturalWidth * 0.28;
          const h = im.naturalHeight * 0.28;
          g.drawImage(im, light.x - w / 2, light.y - h + 8, w, h);
        }
      }
    });
  }

  function drawGroundMist(t) {
    if (dungeonMode) return;
    const isAsh = region.id === 29 || region.theme === 'ash' || region.id >= 26;
    const isSwamp = region.id === 2 || region.biome === 'swamp' || region.theme === 'swamp';
    const isCrypt = region.biome === 'crypt' || region.biome === 'abyss' || region.biome === 'ghosttown';
    if (!isAsh && !isSwamp && !isCrypt) return;

    g.save();
    const mistColor = isAsh ? '148, 163, 184' : isSwamp ? '45, 212, 191' : '168, 85, 247';
    const baseAlpha = isAsh ? 0.055 : isSwamp ? 0.045 : 0.04;
    const speed = 0.018;

    const vw = c.width;
    const vh = c.height;
    const mistBands = [
      { yRatio: 0.25, rx: 280, ry: 60, offset: 0, speedMult: 1.0 },
      { yRatio: 0.55, rx: 340, ry: 75, offset: 500, speedMult: 0.8 },
      { yRatio: 0.85, rx: 310, ry: 65, offset: 1100, speedMult: 1.2 }
    ];

    mistBands.forEach((b) => {
      const cycle = vw + b.rx * 2;
      const screenX = ((t * speed * b.speedMult + b.offset) % cycle) - b.rx;
      const worldX = cam.x + screenX;
      const worldY = cam.y + vh * b.yRatio;

      let grad = g.createRadialGradient(worldX, worldY, 10, worldX, worldY, b.rx);
      grad.addColorStop(0, `rgba(${mistColor}, ${baseAlpha})`);
      grad.addColorStop(0.6, `rgba(${mistColor}, ${baseAlpha * 0.5})`);
      grad.addColorStop(1, `rgba(${mistColor}, 0)`);

      g.fillStyle = grad;
      g.beginPath();
      g.ellipse(worldX, worldY, b.rx, b.ry, 0, 0, Math.PI * 2);
      g.fill();
    });
    g.restore();
  }

  function resource(n) {
    const im = oreSprites[n.kind] || dungeonOreSprites[n.kind] || propSprites[n.kind] || propSprites.ore_iron;
    g.save();
    g.translate(n.x, n.y);

    if (im?.complete && im.naturalWidth) {
      const w = im.naturalWidth * 0.24;
      const h = im.naturalHeight * 0.24;

      // Crystalline and Magma pulsating light auras
      if (n.dungeonRare) {
        const glowColor = n.kind === 'ore_abyssal' ? 'rgba(122, 215, 238, 0.42)' : n.kind === 'ore_bloodstone' ? 'rgba(255, 88, 53, 0.4)' : 'rgba(209, 137, 255, 0.42)';
        g.fillStyle = glowColor;
        g.beginPath();
        g.arc(0, -12, 30 + Math.sin(last / 230 + n.x) * 4, 0, Math.PI * 2);
        g.fill();
      } else if (n.kind === 'ore_cyan_fissure' || n.kind === 'ore_amethyst_spire') {
        const glowColor = n.kind === 'ore_cyan_fissure' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(192, 132, 252, 0.35)';
        g.fillStyle = glowColor;
        g.beginPath();
        g.arc(0, -12, 28 + Math.sin(last / 250 + n.x) * 4, 0, Math.PI * 2);
        g.fill();
      } else if (n.kind === 'ore_magma_lava') {
        g.fillStyle = 'rgba(249, 115, 22, 0.32)';
        g.beginPath();
        g.arc(0, -12, 26 + Math.sin(last / 200 + n.y) * 4, 0, Math.PI * 2);
        g.fill();
      } else if (n.kind === 'ore_gold_vein') {
        g.fillStyle = 'rgba(251, 191, 36, 0.28)';
        g.beginPath();
        g.arc(0, -10, 22 + Math.sin(last / 300 + n.x) * 3, 0, Math.PI * 2);
        g.fill();
      }

      g.drawImage(im, -w / 2, -h + 8, w, h);
    } else {
      g.fillStyle = '#4e5750';
      g.beginPath();
      g.arc(0, -10, 18, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }

  function chest(z) {
    g.save();
    g.translate(z.x, z.y);

    const baseType = z.type || 'chest_stone_moss';
    const spriteKey = z.open ? baseType + '_open' : baseType + '_closed';
    const im = chestSprites[spriteKey] || propSprites[z.open ? 'chest_open_gold' : 'chest_closed'];

    if (im?.complete && im.naturalWidth) {
      const w = im.naturalWidth * 0.25;
      const h = im.naturalHeight * 0.25;

      // Thematic glow when open
      if (z.open) {
        g.save();
        let grad = g.createRadialGradient(0, -15, 2, 0, -15, 52);
        if (baseType === 'chest_spectral_teal') {
          grad.addColorStop(0, 'rgba(120, 245, 255, 0.85)');
          grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
        } else if (baseType === 'chest_cursed_spiked') {
          grad.addColorStop(0, 'rgba(236, 72, 153, 0.85)');
          grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.35)');
        } else {
          grad.addColorStop(0, 'rgba(255, 235, 120, 0.8)');
          grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.3)');
        }
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        g.fillStyle = grad;
        g.beginPath();
        g.arc(0, -15, 52, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }

      g.drawImage(im, -w / 2, -h + 8, w, h);
    } else {
      box(-21, -5, 42, 21, '#7d4521');
    }
    g.restore();
  }

  function foe(m, now) {
    let b = Math.sin(m.phase * 4) * 2;
    const isHit = now - m.hit < 160;

    g.save();
    g.translate(m.x, m.y + b);

    if (isHit) {
      g.shadowColor = '#ffffff';
      g.shadowBlur = 14;
    }

    // Ground Shadow
    g.fillStyle = '#07100899';
    g.beginPath();
    const isAshenGolem = m.t === 'boss_ashen_golem';
    g.ellipse(0, 15, isAshenGolem ? 38 : 20, isAshenGolem ? 13 : 7, 0, 0, Math.PI * 2);
    g.fill();

    const im = monsterSprites[m.t];
    const isDyingAshenGolem = m.t === 'boss_ashen_golem' && !m.alive && Number.isFinite(m.deathStartedAt);
    const phase1Boss = m.boss && region.id === 1 && m.t === region.bossSprite;
    const phase3Boss = m.boss && region.id === 3 && m.t === region.bossSprite && !isAshenGolem;
    const phase1Idle = window.TerraSpriteAnimations?.phase1Idle;
    const phase1Run = window.TerraSpriteAnimations?.phase1Run;
    const bossAnimation = window.TerraSpriteAnimations?.phase3Idle;
    const golemIdle = window.TerraSpriteAnimations?.ashenGolemIdle;
    const golemAttack = window.TerraSpriteAnimations?.ashenGolemAttack;

    const stripMap = {
      monster_fire_skull: window.TerraSpriteAnimations?.monsterFireSkull,
      monster_hell_hound: window.TerraSpriteAnimations?.monsterHellHound,
      monster_ghost_spectre: window.TerraSpriteAnimations?.monsterGhostSpectre,
      monster_flying_demon: window.TerraSpriteAnimations?.monsterFlyingDemon,
      monster_reaper_death: window.TerraSpriteAnimations?.monsterReaperDeath,
      monster_giant_frog: window.TerraSpriteAnimations?.monsterGiantFrog,
      monster_treant: window.TerraSpriteAnimations?.monsterTreant,
      monster_swamp_witch: window.TerraSpriteAnimations?.monsterSwampWitch,
      monster_vampire_lord: window.TerraSpriteAnimations?.monsterVampireLord,
      monster_cave_ogre: window.TerraSpriteAnimations?.monsterCaveOgre
    };
    const stripAnim = stripMap[m.t];

    if (isDyingAshenGolem) {
      const death = window.TerraSpriteAnimations?.ashenGolemDeath;
      if (death?.ready) {
        const size = 156;
        const age = Math.max(0, now - m.deathStartedAt);
        const fadeStart = 2200;
        g.globalAlpha *= age > fadeStart ? Math.max(0, 1 - (age - fadeStart) / 650) : 1;
        death.draw(g, now, -size / 2, -size + 16, size, size, m.deathStartedAt);
      }
    } else if (stripAnim?.ready) {
      const bossMult = m.boss ? 1.6 : 1.0;
      const size = (m.t === 'monster_cave_ogre' || m.t === 'monster_treant') ? 74 * bossMult : 56 * bossMult;
      stripAnim.draw(g, now, -size / 2, -size + 14, size, size, (m.phase || 0) * 350);
    } else if (isAshenGolem && (golemIdle?.ready || im?.complete)) {
      const size = 156;
      const isAttacking = m.windup || (now - (m.lastAttackTime || 0) < 800);
      let drawn = false;
      if (isAttacking && golemAttack?.ready) {
        drawn = golemAttack.draw(g, now, -size / 2, -size + 16, size, size, m.windupAt || m.lastAttackTime || now);
      }
      if (!drawn && golemIdle?.ready) {
        drawn = golemIdle.draw(g, now, -size / 2, -size + 16, size, size);
      }
      if (!drawn && im?.complete && im.naturalWidth) {
        g.drawImage(im, -size / 2, -size + 16, size, size);
      }
    } else if (phase1Boss && phase1Idle?.ready && phase1Run?.ready) {
      const size = 112;
      const direction = m.facing || 'south';
      if (m.isMoving) phase1Run.draw(g, now, -size/2, -size+12, size, size, direction);
      else phase1Idle.draw(g, direction, -size/2, -size+12, size, size);
    } else if (phase3Boss && bossAnimation?.ready) {
      const size = 116;
      bossAnimation.draw(g, now, -size / 2, -size + 12, size, size);
    } else if (im?.complete && im.naturalWidth) {
      const scale = (m.t.startsWith('slime_') ? 0.26 : 0.23) * (m.boss ? 2.15 : 1);
      const w = im.naturalWidth * scale;
      const h = im.naturalHeight * scale;

      // Draw Sprite
      g.drawImage(im, -w / 2, -h + 12, w, h);
    } else {
      // Fallback box foe
      box(-15, -25, 30, 30, isHit ? '#ffffff' : '#536158');
    }
    g.restore();

    if (isDyingAshenGolem) return;

    if (enemy === m) {
      g.save();
      g.strokeStyle = '#ffd700';
      g.globalAlpha = 0.8;
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(m.x, m.y + 8, 25, 9, 0, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    }

    // Floating enemy health bar
    const barWidth = m.boss ? 112 : 48;
    const barHeight = m.boss ? 10 : 6;
    const curHp = Math.max(0, Number(m.hp) || 0);
    const maxHp = Math.max(1, Number(m.max) || 1);
    const hpRatio = Math.max(0, Math.min(1, curHp / maxHp));
    const barY = m.y - (m.boss ? 57 : 48);
    if (m.boss) {
      g.textAlign = 'center';
      g.font = '700 12px "Outfit", sans-serif';
      g.fillStyle = '#ffe3a0';
      g.fillText(`${m.bossName} · NV. ${m.level}`, m.x, m.y - 68);
      if (m.windup) {
        g.strokeStyle = `rgba(255, 78, 49, ${0.45 + Math.sin(now / 55) * 0.25})`;
        g.lineWidth = 5;
        g.beginPath();
        g.ellipse(m.x, m.y + 9, 48 + Math.sin(now / 65) * 7, 17, 0, 0, Math.PI * 2);
        g.stroke();
      }
    }
    g.fillStyle = '#0e1610cc';
    g.fillRect(m.x - barWidth / 2 - 1, barY, barWidth + 2, barHeight + 2);
    g.fillStyle = '#223024';
    g.fillRect(m.x - barWidth / 2, barY + 1, barWidth, barHeight);
    g.fillStyle = m.boss ? (hpRatio > 0.5 ? '#c83444' : '#ff3344') : hpRatio > 0.5 ? '#e84c3d' : '#ff3344';
    g.fillRect(m.x - barWidth / 2, barY + 1, barWidth * hpRatio, barHeight);
  }

  function drawLightning(arc) {
    const segments = 6;
    g.save();
    g.strokeStyle = '#7be8f6';
    g.shadowColor = '#5de0ff';
    g.shadowBlur = 12;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(arc.sx, arc.sy);

    let curX = arc.sx;
    let curY = arc.sy;
    for (let i = 1; i <= segments; i++) {
      const targetX = arc.sx + ((arc.tx - arc.sx) * i) / segments;
      const targetY = arc.sy + ((arc.ty - arc.sy) * i) / segments;
      if (i < segments) {
        curX = targetX + R(-16, 16);
        curY = targetY + R(-16, 16);
      } else {
        curX = arc.tx;
        curY = arc.ty;
      }
      g.lineTo(curX, curY);
    }
    g.stroke();
    g.restore();
  }

  function drawCombatEffects(now) {
    combatEffects.forEach((fx) => {
      const progress = C((now - fx.started) / fx.duration, 0, 1);
      const fade = Math.sin(Math.PI * progress);
      const reach = fx.radius * (0.28 + progress * 0.72);
      g.save();

      if (fx.kind === 'hit_spark') {
        const anim = window.TerraSpriteAnimations?.fxHitSpark;
        if (anim?.ready) {
          anim.draw(g, now, fx.x - 24, fx.y - 24, 48, 48, fx.started);
        } else {
          g.globalAlpha = fade * 0.9;
          g.fillStyle = fx.color || '#ffe49e';
          g.beginPath();
          g.arc(fx.x, fx.y, 16 * (1 - progress), 0, Math.PI * 2);
          g.fill();
        }
        g.restore();
        return;
      }
      if (fx.kind === 'enemy_death') {
        const anim = window.TerraSpriteAnimations?.fxEnemyDeath;
        if (anim?.ready) {
          anim.draw(g, now, fx.x - 32, fx.y - 42, 64, 64, fx.started);
        }
        g.restore();
        return;
      }
      if (fx.kind === 'ground_explosion') {
        const anim = window.TerraSpriteAnimations?.fxGroundExplosion;
        if (anim?.ready) {
          anim.draw(g, now, fx.x - 56, fx.y - 68, 112, 112, fx.started);
        }
        g.restore();
        return;
      }

      g.globalAlpha = fade * 0.9;
      g.strokeStyle = fx.color;
      g.fillStyle = fx.color + '24';
      g.shadowColor = fx.color;
      g.shadowBlur = 10;
      g.lineWidth = fx.kind === 'impact' ? 3.5 : 2.5;
      if (fx.kind === 'ring' || fx.kind === 'impact') {
        g.beginPath();
        g.ellipse(fx.x, fx.y + 8, reach, reach * 0.42, 0, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        if (fx.kind === 'impact') {
          for (let i = 0; i < 3; i++) {
            const angle = -0.8 + i * 0.8;
            g.beginPath();
            g.moveTo(fx.x, fx.y + 4);
            g.lineTo(fx.x + Math.cos(angle) * reach, fx.y + Math.sin(angle) * reach * 0.55);
            g.stroke();
          }
        }
      } else if (fx.kind === 'slash') {
        for (let i = 0; i < 2; i++) {
          g.beginPath();
          g.arc(fx.x, fx.y, reach * (0.45 + i * 0.12), -1.9 + progress + i * 0.55, 0.25 + progress + i * 0.55);
          g.stroke();
        }
      } else if (fx.kind === 'holy') {
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(fx.x, fx.y - reach * 1.3);
        g.lineTo(fx.x, fx.y + 3);
        g.stroke();
        g.lineWidth = 2;
        g.beginPath();
        g.arc(fx.x, fx.y - 5, reach * (0.5 + progress * 0.2), 0, Math.PI * 2);
        g.stroke();
        g.beginPath();
        g.moveTo(fx.x - reach * 0.55, fx.y - 8);
        g.lineTo(fx.x + reach * 0.55, fx.y - 8);
        g.stroke();
      } else if (fx.kind === 'arcane') {
        g.beginPath();
        g.arc(fx.x, fx.y, 5 + reach * 0.28, progress * Math.PI * 4, progress * Math.PI * 4 + Math.PI * 1.55);
        g.stroke();
        g.beginPath();
        g.arc(fx.x, fx.y, 4 + (1 - progress) * 10, 0, Math.PI * 2);
        g.fill();
      } else {
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI * 2 * i) / 8 + progress * 0.5;
          g.beginPath();
          g.moveTo(fx.x + Math.cos(a) * 5, fx.y + Math.sin(a) * 5);
          g.lineTo(fx.x + Math.cos(a) * reach, fx.y + Math.sin(a) * reach * 0.65);
          g.stroke();
        }
        g.beginPath();
        g.arc(fx.x, fx.y, 3 + progress * 10, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    });
  }

  function updateAndDrawPet(g, now, dt) {
    if (!pet) return;

    // Follow player offset
    let targetX = p.x + (p.dir === 'west' ? 32 : -32);
    let targetY = p.y - 36;

    // Check for nearby uncollected drops within 300px
    let foundDrop = drops.includes(pet.targetDrop) ? pet.targetDrop : null;
    let minDist = 300;
    for (let i = 0; i < drops.length && !foundDrop; i++) {
      const d = drops[i];
      if (d.collected) continue;
      const dist = Math.hypot(d.x - p.x, d.y - p.y);
      if (dist < minDist) {
        minDist = dist;
        foundDrop = d;
      }
    }
    pet.targetDrop = foundDrop;

    if (foundDrop) {
      targetX = foundDrop.x;
      targetY = foundDrop.y - 12;
      const petDistToDrop = Math.hypot(pet.x - foundDrop.x, pet.y - foundDrop.y);
      if (petDistToDrop < 26) {
        collectDrop(foundDrop, pet);
        emitCombatEffect('hit_spark', pet.x, pet.y, '#ffd700', { duration: 180, radius: 24 });
      }
    }

    const dx = targetX - pet.x;
    const dy = targetY - pet.y;
    const dist = Math.hypot(dx, dy);
    const speed = foundDrop ? 185 : 135;

    if (dist > 4) {
      pet.x += (dx / dist) * Math.min(dist, speed * dt);
      pet.y += (dy / dist) * Math.min(dist, speed * dt);
      pet.state = 'fly';
    } else {
      pet.state = 'idle';
    }

    // Shadow on ground
    groundShadow(pet.x, pet.y + 26, 11, 4, 0.24);

    // Render Crow Sprite
    g.save();
    g.translate(pet.x, pet.y);
    if (dx < -1) g.scale(-1, 1);

    const flyAnim = window.TerraSpriteAnimations?.petCrowFly;
    const idleAnim = window.TerraSpriteAnimations?.petCrowIdle;
    const size = 32;

    if (pet.state === 'fly' && flyAnim?.ready) {
      flyAnim.draw(g, now, -size / 2, -size / 2, size, size);
    } else if (idleAnim?.ready) {
      idleAnim.draw(g, now, -size / 2, -size / 2, size, size);
    } else {
      g.fillStyle = '#1c1917';
      g.beginPath();
      g.arc(0, 0, 7, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }

  function angleTo8Dir(angle) {
    let a = Math.atan2(Math.sin(angle), Math.cos(angle));
    const step = Math.PI / 4;
    const index = Math.round(a / step);
    switch (index) {
      case 0: return 'east';
      case 1: return 'south_east';
      case 2: return 'south';
      case 3: return 'south_west';
      case 4:
      case -4: return 'west';
      case -3: return 'north_west';
      case -2: return 'north';
      case -1: return 'north_east';
      default: return 'east';
    }
  }

  function drawArrowShot(shot) {
    const progress = 1 - shot.life / shot.maxLife;
    const curX = shot.x1 + (shot.x2 - shot.x1) * progress;
    const curY = shot.y1 + (shot.y2 - shot.y1) * progress;
    const angle = Math.atan2(shot.y2 - shot.y1, shot.x2 - shot.x1);
    const dirName = angleTo8Dir(angle);

    const isMagic = shot.type === 'magic';
    const spriteSet = isMagic ? projectileSprites.magic : projectileSprites.arrow;
    const spr = spriteSet[dirName];

    g.save();
    g.globalAlpha = Math.min(1, shot.life / 0.05);

    // Glowing aura
    g.shadowColor = isMagic ? '#c084fc' : '#a7f3d0';
    g.shadowBlur = isMagic ? 14 : 8;

    if (spr && spr.complete && spr.naturalWidth) {
      const drawSize = isMagic ? 44 : 40;
      g.drawImage(spr, curX - drawSize / 2, curY - drawSize / 2, drawSize, drawSize);
    } else {
      g.translate(curX, curY);
      g.rotate(angle);
      g.fillStyle = isMagic ? '#c084fc' : '#e9d89a';
      g.fillRect(-12, -2, 24, 4);
    }
    g.restore();
  }

  function drawHazardZone(hz, now) {
    const age = now - hz.createdAt;
    g.save();
    if (!hz.detonated) {
      const progress = Math.min(1, Math.max(0, age / hz.duration));
      g.strokeStyle = hz.color;
      g.lineWidth = 2.5;
      g.setLineDash([7, 5]);
      g.beginPath();
      g.arc(hz.x, hz.y, hz.rad, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = hz.color + '33';
      g.beginPath();
      g.arc(hz.x, hz.y, hz.rad * progress, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = hz.color;
      g.font = '700 11px "Outfit", sans-serif';
      g.textAlign = 'center';
      g.fillText(' ' + (hz.label || ''), hz.x, hz.y + 4);
    } else if (hz.lingeringUntil && now < hz.lingeringUntil) {
      g.fillStyle = hz.color + '44';
      g.strokeStyle = hz.color + 'aa';
      g.lineWidth = 1.5;
      g.beginPath();
      g.ellipse(hz.x, hz.y, hz.rad, hz.rad * 0.5, 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      if (hz.label === 'ÁCIDO' && window.TerraSpriteAnimations?.swampGasBubbles?.ready) {
        window.TerraSpriteAnimations.swampGasBubbles.draw(g, now, hz.x - 26, hz.y - 38, 52, 52);
      }
      if (Math.random() < 0.18) {
        g.fillStyle = hz.color;
        g.beginPath();
        g.arc(hz.x + R(-hz.rad * 0.6, hz.rad * 0.6), hz.y + R(-hz.rad * 0.3, hz.rad * 0.3), R(1.5, 3.5), 0, Math.PI * 2);
        g.fill();
      }
    }
    g.restore();
  }

  function drawTargetReticle(t, now) {
    if (!t) return;
    const isEnemy = (t === enemy) || ('hp' in t && t.alive);
    const isPlayer = (t === selectedPlayer) || Boolean(t.classId);
    const isPartyMember = isPlayer && Boolean(cinzasNet?.party?.members?.some(m => m.id === t.id || m.name === t.name));
    const isChest = t.open !== undefined;
    const isBoss = Boolean(t.boss);

    let primaryColor = '#ffd700';
    let glowColor = '#ffd700';
    let rad = 30;

    if (isEnemy) {
      if (isBoss) {
        primaryColor = '#ef4444';
        glowColor = '#dc2626';
        rad = 54;
      } else {
        primaryColor = '#f87171';
        glowColor = '#ef4444';
        rad = 34;
      }
    } else if (isPartyMember) {
      primaryColor = '#2dd4bf';
      glowColor = '#14b8a6';
      rad = 32;
    } else if (isPlayer) {
      primaryColor = '#38bdf8';
      glowColor = '#0284c7';
      rad = 32;
    } else if (isChest) {
      primaryColor = '#fbbf24';
      glowColor = '#d97706';
      rad = 28;
    } else {
      primaryColor = '#a3e635';
      glowColor = '#65a30d';
      rad = 28;
    }

    const rot = (now / 350) % (Math.PI * 2);
    const pulse = 1 + Math.sin(now / 180) * 0.06;

    g.save();
    g.translate(t.x, t.y + 1);
    g.scale(1, 0.52);

    // 1. Brilho suave sob o solo
    g.fillStyle = glowColor + '18';
    g.beginPath();
    g.arc(0, 0, (rad + 6) * pulse, 0, Math.PI * 2);
    g.fill();

    // 2. Anel rúnico rotativo com 4 arcos
    g.rotate(rot);
    g.strokeStyle = primaryColor;
    g.shadowColor = glowColor;
    g.shadowBlur = 9;
    g.lineWidth = 2.2;

    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      g.beginPath();
      g.arc(0, 0, rad * pulse, a - 0.28, a + 0.28);
      g.stroke();
    }

    // 3. Quatro ponteiros de mira angulares
    g.fillStyle = primaryColor;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);
      const tipDist = (rad + 6) * pulse;
      g.beginPath();
      g.moveTo(cosA * tipDist, sinA * tipDist);
      g.lineTo(Math.cos(a - 0.15) * (tipDist + 5), Math.sin(a - 0.15) * (tipDist + 5));
      g.lineTo(Math.cos(a + 0.15) * (tipDist + 5), Math.sin(a + 0.15) * (tipDist + 5));
      g.closePath();
      g.fill();
    }

    // 4. Anel interno contra-rotativo para chefes
    if (isBoss) {
      g.rotate(-rot * 2);
      g.strokeStyle = '#dc2626';
      g.lineWidth = 1.6;
      g.setLineDash([4, 6]);
      g.beginPath();
      g.arc(0, 0, (rad - 14) * pulse, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
    }

    g.restore();
  }

  function drawRadar() {
    if (!radarCtx || !radarCanvas) return;
    const rw = radarCanvas.width;
    const rh = radarCanvas.height;
    const cx = rw / 2;
    const cy = rh / 2;
    const radarRange = 700;

    radarCtx.clearRect(0, 0, rw, rh);

    radarCtx.strokeStyle = 'rgba(120, 160, 110, 0.2)';
    radarCtx.lineWidth = 1;
    radarCtx.beginPath();
    radarCtx.arc(cx, cy, 32, 0, Math.PI * 2);
    radarCtx.arc(cx, cy, 48, 0, Math.PI * 2);
    radarCtx.stroke();

    // Castle Hub Landmarks on Radar
    if (region.id === 0 && window.GameCastleHub?.CASTLE_NPCS) {
      window.GameCastleHub.CASTLE_NPCS.forEach((cn) => {
        const rx = cx + ((cn.x - p.x) / radarRange) * (rw / 2);
        const ry = cy + ((cn.y - p.y) / radarRange) * (rh / 2);
        if (Math.hypot(rx - cx, ry - cy) < rw / 2 - 4) {
          radarCtx.save();
          radarCtx.fillStyle = cn.color || '#f59e0b';
          radarCtx.shadowColor = cn.color || '#f59e0b';
          radarCtx.shadowBlur = 4;
          radarCtx.beginPath();
          radarCtx.moveTo(rx, ry - 3.5);
          radarCtx.lineTo(rx + 3.5, ry);
          radarCtx.lineTo(rx, ry + 3.5);
          radarCtx.lineTo(rx - 3.5, ry);
          radarCtx.closePath();
          radarCtx.fill();
          radarCtx.restore();
        }
      });
    }

    const guide = !dungeonMode ? regionalGuidePosition() : null;
    if (guide) {
      const rx = cx + ((guide.x - p.x) / radarRange) * (rw / 2);
      const ry = cy + ((guide.y - p.y) / radarRange) * (rh / 2);
      if (Math.hypot(rx - cx, ry - cy) < rw / 2 - 4) {
        radarCtx.fillStyle = guide.color;
        radarCtx.strokeStyle = '#fff4d2';
        radarCtx.lineWidth = 1;
        radarCtx.beginPath();
        radarCtx.arc(rx, ry, 4, 0, Math.PI * 2);
        radarCtx.fill();
        radarCtx.stroke();
      }
    }

    mobs.forEach((m) => {
      if (!m.alive) return;
      const rx = cx + ((m.x - p.x) / radarRange) * (rw / 2);
      const ry = cy + ((m.y - p.y) / radarRange) * (rh / 2);
      if (Math.hypot(rx - cx, ry - cy) < rw / 2 - 4) {
        radarCtx.fillStyle = '#ff4d4d';
        radarCtx.beginPath();
        radarCtx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        radarCtx.fill();
      }
    });

    nodes.forEach((n) => {
      if (!n.alive) return;
      const rx = cx + ((n.x - p.x) / radarRange) * (rw / 2);
      const ry = cy + ((n.y - p.y) / radarRange) * (rh / 2);
      if (Math.hypot(rx - cx, ry - cy) < rw / 2 - 4) {
        radarCtx.fillStyle = n.kind.includes('crystal') ? '#72e8f7' : n.kind.includes('gold') ? '#ffd700' : '#dedaa8';
        radarCtx.beginPath();
        radarCtx.arc(rx, ry, 2, 0, Math.PI * 2);
        radarCtx.fill();
      }
    });

    chests.forEach((ch) => {
      const rx = cx + ((ch.x - p.x) / radarRange) * (rw / 2);
      const ry = cy + ((ch.y - p.y) / radarRange) * (rh / 2);
      if (Math.hypot(rx - cx, ry - cy) < rw / 2 - 4) {
        if (!ch.open) {
          radarCtx.fillStyle = '#f59e0b';
          radarCtx.strokeStyle = '#fffbeb';
          radarCtx.lineWidth = 1;
          radarCtx.beginPath();
          radarCtx.rect(rx - 2.5, ry - 2.5, 5, 5);
          radarCtx.fill();
          radarCtx.stroke();
        } else {
          radarCtx.fillStyle = '#64748b66';
          radarCtx.beginPath();
          radarCtx.rect(rx - 1.5, ry - 1.5, 3, 3);
          radarCtx.fill();
        }
      }
    });

    radarCtx.fillStyle = '#52f582';
    radarCtx.shadowColor = '#52f582';
    radarCtx.shadowBlur = 6;
    radarCtx.beginPath();
    radarCtx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    radarCtx.fill();
    radarCtx.shadowBlur = 0;
  }

  function drawDrop(d) {
    d.phase += 0.05;
    const y = d.y + Math.sin(d.phase) * 3;
    g.fillStyle = d.kind === 'crystal' ? '#5df0ff55' : '#f6c44955';
    g.beginPath();
    g.ellipse(d.x, y - 7, 12, 5, 0, 0, 7);
    g.fill();
    const im = dropSprites[d.kind];
    if (im.complete && im.naturalWidth) g.drawImage(im, d.x - 12, y - 25, 24, 24);
  }

  function draw(t, dt = 0.016) {
    g.clearRect(0, 0, c.width, c.height);
    g.imageSmoothingEnabled = false;
    g.save();

    let shakeX = 0, shakeY = 0;
    if (screenShake > 0) {
      shakeX = (Math.random() - 0.5) * screenShake * 2.2;
      shakeY = (Math.random() - 0.5) * screenShake * 2.2;
      screenShake = Math.max(0, screenShake - 0.45);
    }
    g.translate(-cam.x + shakeX, -cam.y + shakeY);

    floor();

    if (!dungeonMode && region.id !== 0) region.areas.forEach((area) => {
      const x = region.col * ZONE_W + area.x;
      const y = region.row * ZONE_H + area.y;
      if (x < cam.x - 100 || x > cam.x + c.width + 100 || y < cam.y - 100 || y > cam.y + c.height + 100) return;
      const bossCleared = area.boss && bossDefeats[region.id];
      g.save();
      g.globalAlpha = area.boss ? 0.88 : 0.62;
      g.fillStyle = '#10170edb';
      g.strokeStyle = bossCleared ? '#8ebd72' : area.boss ? '#d9a34b' : region.accent;
      g.lineWidth = area.boss ? 2 : 1;
      g.beginPath();
      g.roundRect(x - 72, y - 78, 144, 27, 6);
      g.fill();
      g.stroke();
      g.fillStyle = area.boss ? '#ffe09a' : '#e8e0c7';
      g.font = area.boss ? '700 10px "Outfit", sans-serif' : '600 9px "Outfit", sans-serif';
      g.textAlign = 'center';
      g.fillText((area.boss ? ' ' : '') + area.name, x, y - 61, 132);
      g.fillStyle = '#d0bc83';
      g.font = '700 8px "Outfit", sans-serif';
      g.fillText('NV. ' + (area.min === area.max ? area.min : area.min + '–' + area.max), x, y - 48);
      g.restore();
    });

    // Multi-layered Dynamic Lighting
    drawDynamicLighting(t);

    // Ground Mist for atmospheric biomes
    drawGroundMist(t);

    // Regional Portal Gates
    REGIONS.filter(
      (r) =>
        r.id !== region.id &&
        p.lvl >= r.unlocks &&
        isRegionUnlocked(r.id) &&
        Math.abs(r.col - region.col) + Math.abs(r.row - region.row) === 1
    ).forEach((r) => {
      const gx =
        r.col === region.col
          ? region.col * ZONE_W + ZONE_W / 2
          : Math.max(region.col, r.col) * ZONE_W + (region.col > r.col ? 24 : -24);
      const gy =
        r.row === region.row
          ? region.row * ZONE_H + ZONE_H / 2
          : Math.max(region.row, r.row) * ZONE_H + (region.row > r.row ? 24 : -24);

      g.fillStyle = region.accent + 'bb';
      g.fillRect(gx - 18, gy - 36, 36, 72);
      g.strokeStyle = '#f4db91';
      g.lineWidth = 3;
      g.strokeRect(gx - 18, gy - 36, 36, 72);
      g.fillStyle = '#fff0b9';
      g.font = '700 12px "Outfit", sans-serif';
      g.fillText('REGIÃO ' + String(r.id).padStart(2, '0'), gx - 42, gy - 45);
    });

    // Draw active boss hazard zones on the ground
    hazardZones.forEach((hz) => drawHazardZone(hz, t));

    // Ambient Swamp Gas Bubble Vents for Região 2 (Pântano Espectral)
    if (region.id === 2 && !dungeonMode && window.TerraSpriteAnimations?.swampGasBubbles?.ready) {
      const ox = region.col * ZONE_W;
      const oy = region.row * ZONE_H;
      const swampVents = [
        { x: 330, y: 1115 }, { x: 370, y: 1140 },
        { x: 1530, y: 1130 }, { x: 1570, y: 1150 },
        { x: 930, y: 1240 }, { x: 990, y: 1275 },
        { x: 720, y: 635 }, { x: 1220, y: 815 },
        { x: 420, y: 305 }, { x: 1440, y: 315 },
        { x: 620, y: 920 }, { x: 1310, y: 580 }
      ];
      swampVents.forEach((vent, vIdx) => {
        const vx = ox + vent.x;
        const vy = oy + vent.y;
        if (vx < cam.x - 60 || vx > cam.x + c.width + 60 || vy < cam.y - 60 || vy > cam.y + c.height + 60) return;
        window.TerraSpriteAnimations.swampGasBubbles.draw(g, t + vIdx * 350, vx - 26, vy - 36, 52, 52);
      });
    }

    const depth = [
      ...decor.map((item) => ({ y: item.y, type: 'decor', item })),
      ...trees.map((item) => ({ y: item.y, type: 'tree', item })),
      ...nodes.filter((item) => item.alive).map((item) => ({ y: item.y, type: 'resource', item })),
      ...chests.map((item) => ({ y: item.y, type: 'chest', item })),
      ...drops.map((item) => ({ y: item.y, type: 'drop', item })),
      ...mobs.filter((item) => item.alive && !isNaN(item.hp) && item.hp > 0).map((item) => ({ y: item.y, type: 'foe', item })),
      ...mobs.filter((item) => item.t === 'boss_ashen_golem' && !item.alive && Number.isFinite(item.deathStartedAt) && t - item.deathStartedAt < 2850).map((item) => ({ y: item.y, type: 'foe', item })),
      ...mobs.filter((item) => item.impactAt && t - item.impactAt < 1000).map((item) => ({ y: item.impactY, type: 'boss-effect', item })),
      ...(!dungeonMode && region.id !== 0 ? [{ y: dungeonNpcPosition().y, type: 'npc', item: dungeonNpcPosition() }] : []),
      ...(!dungeonMode && region.id !== 0 && regionalGuidePosition() ? [{ y: regionalGuidePosition().y, type: 'regional_guide', item: regionalGuidePosition() }] : []),
      ...(region.id === 0 && window.GameCastleHub?.CASTLE_NPCS ? window.GameCastleHub.CASTLE_NPCS.map((n) => ({ y: n.y, type: 'castle_npc', item: n })) : []),
      ...(cinzasNet?.isConnected && cinzasNet.getRemotePlayers().length > 0 ? cinzasNet.getRemotePlayers().map((op) => ({ y: op.y, type: 'online_player', item: op })) : (region.id === 0 && window.GameCastleHub?.ONLINE_PLAYERS ? window.GameCastleHub.ONLINE_PLAYERS.map((op) => ({ y: op.y, type: 'online_player', item: op })) : [])),
      { y: p.y, type: 'hero', item: p }
    ];
    depth.sort((a, b) => a.y - b.y);
    depth.forEach(({ type, item }) => {
      // Frustum culling: discard rendering entities far outside the camera viewport (+ 140px margin)
      const ix = item.x ?? item.impactX ?? p.x;
      const iy = item.y ?? item.impactY ?? p.y;
      if (ix < cam.x - 140 || ix > cam.x + c.width + 140 || iy < cam.y - 140 || iy > cam.y + c.height + 140) return;

      if (type === 'foe') groundShadow(item.x, item.y + 1, 15, 5, 0.34);
      else if (type === 'resource' || type === 'chest') groundShadow(item.x, item.y + 1, 18, 7, 0.35);
      else if (type === 'drop') groundShadow(item.x, item.y + 1, 11, 4, 0.24);
      else if (type === 'decor') {
        const isWaterFlora = item.kind?.startsWith('water_lily') || item.kind?.startsWith('water_lotus') || item.kind?.startsWith('water_pads') || item.kind?.startsWith('duckweed');
        if (!isWaterFlora) {
          const isMountain = item.kind?.startsWith('mountain_') || item.kind?.startsWith('rock_plateau');
          const isRockCluster = item.kind?.startsWith('rock_moss_cluster') || item.kind?.startsWith('rock_pile_');
          const isLargeProp = item.kind === 'ruined_statue' || item.kind === 'stone_dragon_statue' || item.kind === 'stone_gargoyle';
          const shadowRx = (isMountain ? 54 : isRockCluster ? 32 : isLargeProp ? 26 : 16) * (item.s || 1);
          const shadowRy = (isMountain ? 18 : isRockCluster ? 11 : isLargeProp ? 9 : 5) * (item.s || 1);
          const shadowOpacity = isMountain ? 0.45 : isRockCluster ? 0.38 : 0.28;
          groundShadow(item.x, item.y + (isMountain ? 4 : 1), shadowRx, shadowRy, shadowOpacity);
        }
      }
      if (type === 'decor') drawDecor(item);
      else if (type === 'tree') tree(item);
      else if (type === 'resource') resource(item);
      else if (type === 'chest') chest(item);
      else if (type === 'drop') drawDrop(item);
      else if (type === 'foe') foe(item, t);
      else if (type === 'boss-effect') {
        const effect = window.TerraSpriteAnimations?.phase3Impact;
        effect?.draw(g, t, item.impactX - 42, item.impactY - 42, 84, 84, item.impactAt);
      }
      else if (type === 'npc') drawDungeonNpc();
      else if (type === 'regional_guide') drawRegionalGuide(item);
      else if (type === 'castle_npc') drawCastleNpc(item, t);
      else if (type === 'online_player') drawOnlinePlayer(item, t);
      else {
        if (cinzasNet?.party?.members?.length > 1) {
          g.save();
          const pulse = 1 + Math.sin(t / 220) * 0.08;
          const rot = (t / 750) % (Math.PI * 2);
          g.translate(p.x, p.y + 2);
          g.scale(1, 0.52);
          g.fillStyle = 'rgba(45, 212, 191, 0.08)';
          g.beginPath();
          g.arc(0, 0, 26 * pulse, 0, Math.PI * 2);
          g.fill();
          g.rotate(rot);
          g.strokeStyle = 'rgba(45, 212, 191, 0.7)';
          g.shadowColor = '#2dd4bf';
          g.shadowBlur = 7;
          g.lineWidth = 1.6;
          g.setLineDash([6, 5]);
          g.beginPath();
          g.arc(0, 0, 24 * pulse, 0, Math.PI * 2);
          g.stroke();
          g.restore();
        }
        if (p.auraColor) {
          g.save();
          const hPulse = 1 + Math.sin(t / 280) * 0.08;
          g.translate(p.x, p.y + 2);
          g.scale(1, 0.5);
          g.fillStyle = p.auraColor + '25';
          g.beginPath();
          g.arc(0, 0, 18 * hPulse, 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = p.auraColor + '88';
          g.lineWidth = 1.4;
          g.beginPath();
          g.arc(0, 0, 16 * hPulse, 0, Math.PI * 2);
          g.stroke();
          g.restore();
        }
        drawHero(g, p, last, heroSprites, box);
        if (cinzasNet?.isConnected && (cinzasNet.me?.name || p.name)) {
          g.save();
          const localName = cinzasNet.me?.name || p.name || 'Você';
          const isLeader = Boolean(cinzasNet?.party && (cinzasNet.party.leaderId === cinzasNet.myId || cinzasNet.party.leader === localName));
          const displayName = (isLeader ? '👑 ' : '') + localName;
          g.fillStyle = 'rgba(12, 26, 28, 0.88)';
          g.strokeStyle = 'rgba(74, 222, 128, 0.55)';
          g.lineWidth = 1;
          g.beginPath();
          g.roundRect(p.x - 54, p.y - 50, 108, 16, 4);
          g.fill();
          g.stroke();
          g.fillStyle = '#4ade80';
          g.beginPath();
          g.arc(p.x - 45, p.y - 42, 3, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#f0fdf4';
          g.font = '700 9px "Outfit", sans-serif';
          g.textAlign = 'center';
          g.fillText(displayName, p.x + 4, p.y - 39);
          g.restore();
        }
        const localBubble = window.CinzasChat?.getLocalBubble?.();
        if (localBubble) {
          g.save();
          g.fillStyle = 'rgba(20, 35, 25, 0.94)';
          g.strokeStyle = '#4ade80';
          g.lineWidth = 1;
          const bw = Math.min(200, Math.max(60, localBubble.length * 6.5 + 16));
          g.beginPath();
          g.roundRect(p.x - bw / 2, p.y - 78, bw, 20, 5);
          g.fill();
          g.stroke();
          g.fillStyle = '#dcfce7';
          g.font = '600 9px "Outfit", sans-serif';
          g.textAlign = 'center';
          g.fillText(localBubble, p.x, p.y - 65);
          g.restore();
        }
      }
    });

    updateAndDrawPet(g, t, dt);

    drawCombatEffects(t);

    if (region.id === 0) {
      drawDungeonPortal({ x: 2860, y: 4160 }, 'E · IR AO BOSQUE', true, '#4ade80');
    } else if (region.id === 1) {
      drawDungeonPortal({ x: 960, y: 100 }, 'E · CASTELO EM CINZAS', true, '#f59e0b');
    }

    if (dungeonMode && dungeonSession) {
      drawDungeonPortal(dungeonSession.exit, 'E · VOLTAR', true, '#72d9d1');
      drawDungeonPortal(dungeonSession.stairs, dungeonSession.cleared ? 'E · DESCER' : 'LIMPE O ANDAR', dungeonSession.cleared, '#e6b85d');
    }

    // Highlight the selected enemy and communicate arcane reach.
    if (enemy?.alive) {
      g.save();
      g.beginPath();
      g.arc(p.x, p.y, 220, 0, Math.PI * 2);
      g.strokeStyle = 'rgba(123, 232, 246, 0.12)';
      g.setLineDash([7, 10]);
      g.lineWidth = 2;
      g.stroke();
      g.restore();
      drawTargetReticle(enemy, t);
    }
    else if (object && (object.alive || !object.open)) drawTargetReticle(object, t);
    else if (selectedPlayer && (cinzasNet?.isConnected ? cinzasNet.getRemotePlayers().some(op => op.id === selectedPlayer.id) : true)) {
      drawTargetReticle(selectedPlayer, t);
    }

    // Lightning Arcs
    lightningArcs.forEach(drawLightning);
    arrowShots.forEach(drawArrowShot);

    // Particle Sparks
    parts.forEach((q) => {
      g.globalAlpha = Math.max(0, q.t / q.maxT);
      box(q.x - 2, q.y - 2, 4, 4, q.col);
    });
    g.globalAlpha = 1;

    // Floating Combat Texts
    floatingTexts.forEach((ft) => {
      g.save();
      g.globalAlpha = ft.alpha;
      g.font = 'bold ' + ft.size + 'px "Outfit", "JetBrains Mono", sans-serif';
      g.fillStyle = ft.color;
      g.shadowColor = '#000000';
      g.shadowBlur = 5;
      g.textAlign = 'center';
      g.fillText(ft.text, ft.x, ft.y);
      g.restore();
    });

    g.restore();

    // Ambient screen particles (Spore / Embers)
    g.save();
    const isEndgameAsh = region.id === 29;
    ambientParticles.forEach((ap) => {
      g.fillStyle = isEndgameAsh ? '#cbd5e1' : (region.ambientColor || '#95e86e');
      g.globalAlpha = ap.alpha * (0.5 + Math.sin(ap.phase) * 0.3);
      g.beginPath();
      g.arc(ap.x, ap.y, ap.size, 0, Math.PI * 2);
      g.fill();
    });
    g.restore();

    // Dark Vignette
    const vigCenter = isEndgameAsh ? '#00000000' : '#00100000';
    const vigEdge = isEndgameAsh ? '#050508e6' : '#020703b3';
    let v = g.createRadialGradient(c.width * 0.5, c.height * 0.5, 120, c.width * 0.5, c.height * 0.5, c.width * (isEndgameAsh ? 0.65 : 0.72));
    v.addColorStop(0, vigCenter);
    v.addColorStop(1, vigEdge);
    g.fillStyle = v;
    g.fillRect(0, 0, c.width, c.height);

    // Live Radar Minimap
    drawRadar();
  }

  let saveClock = 0;
  function frame(t) {
    let dt = Math.min(0.05, (t - last) / 1000 || 0);
    last = t;
    if (!menuOpen) {
      update(dt, t);
      if (cinzasNet?.isConnected) cinzasNet.update(dt);
      saveClock += dt;
      if (saveClock >= 3) {
        save();
        saveClock = 0;
      }
    }
    draw(t, dt);
    requestAnimationFrame(frame);
  }

  function size() {
    let r = world.getBoundingClientRect();
    c.width = r.width;
    c.height = r.height;
  }

  addEventListener('resize', size);
  addEventListener('beforeunload', () => {
    if (!resettingSave) save();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && !resettingSave) window.GameAuth?.flushSave?.();
  });
  size();
  const guideBtn = document.querySelector('#guideTop');
  if (guideBtn) guideBtn.onclick = () => window.GameTutorial?.toggle();

  window.GameMenu.initMenu({
    autoStart,
    onContinue() {
      menuOpen = false;
      document.querySelector('#app').classList.remove('menu-open');
      audio.startAmbientMusic(region.id);
      window.GameTutorial?.maybeShowFirstTime();
      if (pendingOffline) {
        const offlineXp = pendingOffline.kills * progression.enemyXp(p.lvl, false);
        const offlineGold = pendingOffline.kills * (8 + region.id * 3);
        p.gold += offlineGold;
        xp(offlineXp);
        pendingOffline.reward = { xp: offlineXp, gold: offlineGold };
        renderUI({ p, kills, ore, loot, quest: currentQuest() });
        const hours = Math.floor(pendingOffline.minutes / 60);
        const mins = pendingOffline.minutes % 60;
        msg(`Caçada ausente · ${hours ? hours + 'h ' : ''}${mins}min · ${pendingOffline.kills} encontros estimados · +${pendingOffline.reward.gold} ouro e +${pendingOffline.reward.xp} XP`);
        pendingOffline = null;
      }
      requestAnimationFrame(size);
    },
    onNewGame(classId) {
      resettingSave = true;
      try {
        sessionStorage.setItem(NEW_CLASS_KEY, classId || 'guerreiro');
        sessionStorage.setItem('terra-das-cinzas-auto-start', '1');
      } catch (e) {}
      try {
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem('tdc-talents');
      } catch (e) {}
      location.reload();
    }
  });

  channelManager.init();
  chatUI.init();
  playerListUI.init();
  partyManager.init();
  tradeManager.init();
  questUI.init();
  document.querySelector('#hudPortraitWrap')?.addEventListener('click', () => onboardingManager.ensureProfile(true));
  document.querySelector('#socialTop')?.addEventListener('click', () => playerListUI.toggle());
  document.querySelector('#questsTop')?.addEventListener('click', () => questUI.toggleLogModal());
  document.querySelector('#avatarTop')?.addEventListener('click', () => onboardingManager.ensureProfile(true));

  cinzasNet.onAction = (action) => {
    emitCombatEffect(action.kind || 'slash', action.x, action.y, action.color || '#f5d37b', {
      duration: 320,
      radius: 46,
      dir: action.dir || 'south'
    });
    sparks(action.x, action.y, action.color || '#f5d37b', 14);
  };

  // Sincronização cooperativa de dano e status de monstros
  cinzasNet.onMobSync = (syncData) => {
    if (syncData.fromId === cinzasNet.playerId) return;

    const targetMob = mobs.find((m) => m.id === syncData.mobId)
      || mobs.find((m) => m.alive && Math.hypot(m.x - syncData.x, m.y - syncData.y) < 70);

    if (targetMob) {
      targetMob.hp = Math.max(0, Math.min(targetMob.hp, syncData.hp));
      audio.playHit?.();
      sparks(targetMob.x, targetMob.y, syncData.boss ? '#ef4444' : '#2dd4bf', 14);

      const dmgColor = syncData.isCrit ? '#fde047' : '#38bdf8';
      addFloatingText(
        targetMob.x + (Math.random() * 20 - 10),
        targetMob.y - 28,
        `${syncData.fromName}: -${syncData.dmg}`,
        dmgColor,
        syncData.boss ? 16 : 13
      );

      if (targetMob.boss && targetMob.hp > 0 && targetMob.hp <= targetMob.max * 0.5 && !targetMob.phase2Triggered) {
        targetMob.phase2Triggered = true;
        targetMob.sp = Math.round(targetMob.sp * 1.25);
        addFloatingText(targetMob.x, targetMob.y - 82, ' FASE 2: FÚRIA! ', '#ff3344', 16);
        if (audio?.playLevelUp) audio.playLevelUp();
        sparks(targetMob.x, targetMob.y, '#ff4d4d', 35);
        msg((targetMob.bossName || 'O Guardião') + ' entrou na FASE 2 (FÚRIA) pelos golpes de ' + syncData.fromName + '!');
      }

      if (!syncData.alive && targetMob.alive) {
        killMob(targetMob, performance.now());
      }
    }
  };

  // Recompensas e anúncio de vitória em grupo
  cinzasNet.onMobDefeated = (defData) => {
    const isPartyVictory = cinzasNet.party && defData.partyId === cinzasNet.party.id;
    if (isPartyVictory) {
      window.CinzasChat?.addMessage({
        from: 'GRUPO',
        text: `⚔️ Vitória em Grupo: ${defData.killerName} derrotou ${defData.mobName || 'o guardião'}! (+20% Bônus de XP)`,
        type: 'party',
        time: new Date()
      });
      addFloatingText(p.x, p.y - 55, 'VITÓRIA COOPERATIVA! +20% XP', '#2dd4bf', 17);
      sparks(p.x, p.y, '#2dd4bf', 25);
      audio.playPartyJoin?.();
    }
  };

  if (autoStart) {
    const root = document.querySelector('#mainMenu');
    if (root) root.hidden = true;
    document.querySelector('#app').classList.remove('menu-open');
    audio.startAmbientMusic(region.id);
    window.GameTutorial?.maybeShowFirstTime();
    requestAnimationFrame(size);
    save();
  }

  requestAnimationFrame(frame);
})();
