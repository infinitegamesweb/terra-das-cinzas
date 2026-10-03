(() => {
  // ═══════════════════════════════════════════════════════════════
  //  TERRA DAS CINZAS — Sistema de Drops e Raridades
  //  Raridades: Comum · Incomum · Raro · Épico · Lendário · Supremo
  // ═══════════════════════════════════════════════════════════════

  // ─── Tabela de Raridades ────────────────────────────────────────
  const RARITY = {
    comum:    { id: 'comum',    label: 'Comum',    color: '#9ca3af', glow: 'rgba(156,163,175,0.3)', chance: 0.6500  },
    incomum:  { id: 'incomum',  label: 'Incomum',  color: '#4ade80', glow: 'rgba(74,222,128,0.35)', chance: 0.2700  },
    raro:     { id: 'raro',     label: 'Raro',     color: '#60a5fa', glow: 'rgba(96,165,250,0.4)',  chance: 0.0700  },
    epico:    { id: 'epico',    label: 'Épico',    color: '#c084fc', glow: 'rgba(192,132,252,0.45)',chance: 0.0098  },
    lendario: { id: 'lendario', label: 'Lendário', color: '#fbbf24', glow: 'rgba(251,191,36,0.5)', chance: 0.00002 }, // 0.002%
    supremo:  { id: 'supremo',  label: 'Supremo',  color: '#f43f5e', glow: 'rgba(244,63,94,0.55)', chance: 0.00001 }  // 0.001%
  };

  // ─── Catálogo de Itens por Dungeon ──────────────────────────────
  const DUNGEON_ITEMS = {
    // Dungeon 1: Caverna do Iniciado (Nv. 10-20) — SOLO
    d1: [
      { name: 'Espada de Ferro Forjado',      slot: 'arma',    rarity: 'raro',     icon: '⚔' },
      { name: 'Escudo da Raiz Cinzenta',      slot: 'escudo',  rarity: 'raro',     icon: '🛡' },
      { name: 'Anel do Neófito',              slot: 'anel',    rarity: 'incomum',  icon: '💍' },
      { name: 'Manto das Primeiras Cinzas',   slot: 'armadura',rarity: 'epico',    icon: '🧣' },
      { name: 'Cristal da Raiz Ancestral',    slot: 'gema',    rarity: 'lendario', icon: '💎' },
      { name: 'Essência do Bosque Eterno',    slot: 'essencia',rarity: 'supremo',  icon: '✨' }
    ],
    // Dungeon 2: Cripta das Sombras (Nv. 21-40) — SOLO
    d2: [
      { name: 'Adaga Espectral',              slot: 'arma',    rarity: 'raro',     icon: '🗡' },
      { name: 'Armadura de Pântano',          slot: 'armadura',rarity: 'raro',     icon: '🧥' },
      { name: 'Amuleto das Sombras',          slot: 'amuleto', rarity: 'epico',    icon: '📿' },
      { name: 'Orbe da Serpente Náufraga',    slot: 'gema',    rarity: 'epico',    icon: '🔮' },
      { name: 'Lâmina da Água Morta',         slot: 'arma',    rarity: 'lendario', icon: '⚡' },
      { name: 'Coração do Pântano Eterno',    slot: 'essencia',rarity: 'supremo',  icon: '💠' }
    ],
    // Dungeon 3: Fortaleza das Brumas (Nv. 41-60) — GRUPO 2+
    d3: [
      { name: 'Martelo de Basalto',           slot: 'arma',    rarity: 'raro',     icon: '🔨' },
      { name: 'Peitoral de Pedra Vulcânica',  slot: 'armadura',rarity: 'epico',    icon: '🧱' },
      { name: 'Botas da Montanha Rubra',      slot: 'bota',    rarity: 'raro',     icon: '👢' },
      { name: 'Bracelete do Colosso',         slot: 'acessorio',rarity: 'epico',   icon: '🔗' },
      { name: 'Núcleo do Golem Primordial',   slot: 'gema',    rarity: 'lendario', icon: '🔴' },
      { name: 'Fragmento do Primeiro Golem',  slot: 'essencia',rarity: 'supremo',  icon: '✨' }
    ],
    // Dungeon 4: Torre dos Condenados (Nv. 61-80) — GRUPO 2+
    d4: [
      { name: 'Gládio do Arquivista',         slot: 'arma',    rarity: 'epico',    icon: '⚔' },
      { name: 'Grimório das Cinzas',          slot: 'livro',   rarity: 'raro',     icon: '📖' },
      { name: 'Coroa das Ruínas',             slot: 'capacete',rarity: 'epico',    icon: '👑' },
      { name: 'Manto da Cidadela Partida',    slot: 'armadura',rarity: 'raro',     icon: '🧣' },
      { name: 'Olho do Bibliophage',          slot: 'gema',    rarity: 'lendario', icon: '👁' },
      { name: 'Palavra que Devora',           slot: 'essencia',rarity: 'supremo',  icon: '📜' }
    ],
    // Dungeon 5: Abismo Espectral (Nv. 81-100) — GRUPO 2+
    d5: [
      { name: 'Lança do Eclipse',             slot: 'arma',    rarity: 'epico',    icon: '🌑' },
      { name: 'Armadura do Último Trono',     slot: 'armadura',rarity: 'epico',    icon: '🧥' },
      { name: 'Anel de Vharok',               slot: 'anel',    rarity: 'lendario', icon: '💍' },
      { name: 'Colar do Eclipse Final',       slot: 'amuleto', rarity: 'lendario', icon: '🌑' },
      { name: 'Coração de Vharok',            slot: 'gema',    rarity: 'lendario', icon: '💀' },
      { name: 'Essência do Eclipse Eterno',   slot: 'essencia',rarity: 'supremo',  icon: '✨' }
    ],
    // Dungeon 6-8: Group advanced (Nv. 101-200)
    d6: [
      { name: 'Machado do Abismo',            slot: 'arma',    rarity: 'epico',    icon: '🪓' },
      { name: 'Escudo do Vazio',              slot: 'escudo',  rarity: 'epico',    icon: '🛡' },
      { name: 'Núcleo do Sem-Nome',           slot: 'gema',    rarity: 'lendario', icon: '🕳' },
      { name: 'Sombra Cristalizada',          slot: 'essencia',rarity: 'supremo',  icon: '💎' }
    ],
    d7: [
      { name: 'Foice da Cripta',              slot: 'arma',    rarity: 'epico',    icon: '⚔' },
      { name: 'Manto do Lich Maior',          slot: 'armadura',rarity: 'epico',    icon: '🧣' },
      { name: 'Ficha do Senhor das Criptas',  slot: 'gema',    rarity: 'lendario', icon: '💀' },
      { name: 'Alma Petrificada',             slot: 'essencia',rarity: 'supremo',  icon: '👻' }
    ],
    d8: [
      { name: 'Cajado do Caos',               slot: 'arma',    rarity: 'epico',    icon: '🔮' },
      { name: 'Armadura do Altar',            slot: 'armadura',rarity: 'epico',    icon: '🧥' },
      { name: 'Selo do Arauto do Fim',        slot: 'gema',    rarity: 'lendario', icon: '🌀' },
      { name: 'Fragmento do Caos Primordial', slot: 'essencia',rarity: 'supremo',  icon: '💥' }
    ],
    // Dungeon 9-10: Brasa & Cinzas group (Nv. 201-280)
    d9: [
      { name: 'Espada do Primeiro Fogo',      slot: 'arma',    rarity: 'epico',    icon: '🔥' },
      { name: 'Peitoral Incandescente',       slot: 'armadura',rarity: 'epico',    icon: '🧱' },
      { name: 'Anel da Grande Salamandra',    slot: 'anel',    rarity: 'lendario', icon: '💍' },
      { name: 'Essência do Primeiro Fogo',    slot: 'essencia',rarity: 'supremo',  icon: '✨' }
    ],
    d10: [
      { name: 'Lâmina das Cinzas Eternas',    slot: 'arma',    rarity: 'lendario', icon: '⚔' },
      { name: 'Armadura do Domínio de Vharok',slot: 'armadura',rarity: 'lendario', icon: '🧥' },
      { name: 'Coroa das Cinzas Eternas',     slot: 'capacete',rarity: 'lendario', icon: '👑' },
      { name: 'Vharok Supremo — Núcleo',      slot: 'gema',    rarity: 'supremo',  icon: '💠' },
      { name: 'Essência da Última Cinza',     slot: 'essencia',rarity: 'supremo',  icon: '✨' }
    ]
  };

  // ─── Roll de Drop ───────────────────────────────────────────────
  function rollRarity(dungeonLevel, isFromBoss) {
    const r = Math.random();
    // Boss tem multiplicador 5× nas chances de raridades altas
    const mult = isFromBoss ? 5 : 1;
    if (r < RARITY.supremo.chance  * mult) return 'supremo';
    if (r < RARITY.lendario.chance * mult) return 'lendario';
    if (r < RARITY.epico.chance    * mult) return 'epico';
    if (r < RARITY.raro.chance     * mult) return 'raro';
    if (r < RARITY.incomum.chance  * mult) return 'incomum';
    return 'comum';
  }

  // Obtém pool de itens da dungeon pelo nível
  function getItemPool(dungeonLevel) {
    if (dungeonLevel <= 20)  return DUNGEON_ITEMS.d1;
    if (dungeonLevel <= 40)  return DUNGEON_ITEMS.d2;
    if (dungeonLevel <= 60)  return DUNGEON_ITEMS.d3;
    if (dungeonLevel <= 80)  return DUNGEON_ITEMS.d4;
    if (dungeonLevel <= 100) return DUNGEON_ITEMS.d5;
    if (dungeonLevel <= 140) return DUNGEON_ITEMS.d6;
    if (dungeonLevel <= 180) return DUNGEON_ITEMS.d7;
    if (dungeonLevel <= 200) return DUNGEON_ITEMS.d8;
    if (dungeonLevel <= 260) return DUNGEON_ITEMS.d9;
    return DUNGEON_ITEMS.d10;
  }

  // Drop principal: roll em todas as raridades
  function rollDrop(dungeonLevel, isFromBoss) {
    const rarity = rollRarity(dungeonLevel, isFromBoss);
    if (rarity === 'comum' || rarity === 'incomum') return null; // comum/incomum = ouro/cristal, não item
    const pool = getItemPool(dungeonLevel).filter(it => it.rarity === rarity);
    if (!pool.length) return null;
    const item = pool[Math.floor(Math.random() * pool.length)];
    return { ...item, rarity, dungeonLevel, fromBoss: isFromBoss };
  }

  // ─── Regras de Grupo para Dungeons ──────────────────────────────
  // Nv. 10–40  : Solo OK
  // Nv. 41–280 : Grupo 2+ (protótipo: acesso limitado com aviso)
  // Nv. 281+   : Solo ou Grupo
  function dungeonGroupRequirement(playerLevel) {
    if (playerLevel < 10)  return { allowed: false,  solo: false, group: false,  msg: 'Nível 10 mínimo para dungeons.' };
    if (playerLevel <= 40) return { allowed: true,   solo: true,  group: false,  msg: 'Solo' };
    if (playerLevel <= 280) return { allowed: true,  solo: false, group: true,   msg: 'Grupo 2+' };
    return                         { allowed: true,   solo: true,  group: true,   msg: 'Solo ou Grupo' };
  }

  window.DungeonDrops = { RARITY, DUNGEON_ITEMS, rollDrop, rollRarity, getItemPool, dungeonGroupRequirement };
})();