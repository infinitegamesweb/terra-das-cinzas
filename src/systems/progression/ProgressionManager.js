// src/systems/progression/ProgressionManager.js
// Sistema de Progressão e Curva de XP (Nível 1 a 300)

import { getClassById } from '../../data/classes.data.js';

export const MAX_LEVEL = 300;
export const RARITY_MULT = Object.freeze({ comum: 1.0, elite: 2.5, boss: 7.0 });

export function xpNeeded(level) {
  if (level <= 0)  return 0;
  if (level > MAX_LEVEL) return 0;
  return Math.floor(150 * Math.pow(level, 2.1) + 100 * level);
}

export function baseMonsterXp(monsterLevel) {
  const nm = Math.max(1, monsterLevel);
  return Math.floor(3 * Math.pow(nm, 2.1) + 2 * nm);
}

export function enemyXp(monsterLevel, playerLevel, rarity) {
  if (rarity === undefined) {
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

export function deathXp(level, isBoss) {
  if (level >= MAX_LEVEL) return 0;
  const loss = Math.max(1, Math.ceil(xpNeeded(level) * 0.05));
  return loss * (isBoss ? 2 : 1);
}

export function meleeDamage(level, weaponEquipped, weaponTier, classId) {
  weaponTier = weaponTier || 0;
  classId = classId || 'guerreiro';
  const base = 8 + level * 1.25 + (weaponEquipped ? 10 + weaponTier * 8 : 0);
  const cls = getClassById(classId);
  return Math.round(base * (cls ? cls.melee : 1));
}

export function arcaneDamage(level, classId) {
  classId = classId || 'guerreiro';
  const cls = getClassById(classId);
  return Math.round((18 + level * 1.7) * (cls ? cls.arcane : 1));
}

export const gameProgression = {
  xpNeeded,
  enemyXp,
  deathXp,
  meleeDamage,
  arcaneDamage,
  RARITY_MULT,
  baseMonsterXp,
  MAX_LEVEL
};

if (typeof window !== 'undefined') {
  window.GameProgression = gameProgression;
}
