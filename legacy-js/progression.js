(() => {
  // ─────────────────────────────────────────────────────
  //  TERRA DAS CINZAS · Sistema de Progressão
  //  Nível Máximo : 300
  //  Progressão   : Polinomial Amortecida (end-game longo)
  // ─────────────────────────────────────────────────────

  /** XP necessário para atingir o nível L.
   *  Fórmula: 150 × L^2.1  +  100 × L
   *  L=1 → ~250 XP | L=50 → ~410 k | L=100 → ~1.65 M | L=300 → ~16.6 M
   */
  function xpNeeded(level) {
    if (level <= 0)  return 0;
    if (level > 300) return 0;   // nível máximo — sem XP após 300
    return Math.floor(150 * Math.pow(level, 2.1) + 100 * level);
  }

  // Multiplicadores de raridade
  const RARITY_MULT = { comum: 1.0, elite: 2.5, boss: 7.0 };

  /** XP base: 3 × Nm^2.1 + 2 × Nm */
  function baseMonsterXp(monsterLevel) {
    const nm = Math.max(1, monsterLevel);
    return Math.floor(3 * Math.pow(nm, 2.1) + 2 * nm);
  }

  /** XP final com penalidade anti-farming.
   *  @param {number} monsterLevel
   *  @param {number} playerLevel
   *  @param {'comum'|'elite'|'boss'} rarity
   */
  function enemyXp(monsterLevel, playerLevel, rarity) {
    if (rarity === undefined) {
      // chamada legada: enemyXp(level, isBoss)
      const isBoss = playerLevel === true || playerLevel === false ? playerLevel : false;
      rarity = isBoss ? 'boss' : 'comum';
      playerLevel = 1;
    }
    const base = baseMonsterXp(monsterLevel);
    const mult = RARITY_MULT[rarity] != null ? RARITY_MULT[rarity] : 1.0;
    const raw  = Math.floor(base * mult);

    const diff = (playerLevel || 1) - Math.max(1, monsterLevel);
    if (diff >= 10) return 0;
    if (diff >= 6) {
      const penalty = (diff - 5) * 0.20;
      return Math.max(1, Math.floor(raw * (1 - penalty)));
    }
    return raw;
  }

  /** Penalidade de Morte: 5% do XP da barra (10% contra chefe). */
  function deathXp(level, isBoss) {
    if (level >= 300) return 0;
    const loss = Math.max(1, Math.ceil(xpNeeded(level) * 0.05));
    return loss * (isBoss ? 2 : 1);
  }

  function meleeDamage(level, weaponEquipped, weaponTier, classId) {
    weaponTier = weaponTier || 0;
    classId = classId || 'guerreiro';
    const base = 8 + level * 1.25 + (weaponEquipped ? 10 + weaponTier * 8 : 0);
    return Math.round(base * window.GameClasses.get(classId).melee);
  }

  function arcaneDamage(level, classId) {
    classId = classId || 'guerreiro';
    return Math.round((18 + level * 1.7) * window.GameClasses.get(classId).arcane);
  }

  window.GameProgression = {
    xpNeeded, enemyXp, deathXp,
    meleeDamage, arcaneDamage,
    RARITY_MULT, baseMonsterXp,
    MAX_LEVEL: 300
  };
})();