// src/systems/drops/DropManager.js
import { RARITY, DUNGEON_ITEMS } from '../../data/drops.data.js';

export class DropManager {
  constructor() {
    this.rarities = RARITY;
    this.items = DUNGEON_ITEMS;
    this.bossPityCounter = 0;
    this.mobPityCounter = 0;
  }

  rollRarity(dungeonLevel, isFromBoss) {
    if (isFromBoss) {
      this.bossPityCounter++;
      // Sistema de Piedade de Chefes: garante épico a cada 15 e lendário aos 50
      if (this.bossPityCounter >= 50) {
        this.bossPityCounter = 0;
        return 'lendario';
      }
      if (this.bossPityCounter % 15 === 0) {
        return 'epico';
      }
    } else {
      this.mobPityCounter++;
      if (this.mobPityCounter >= 100) {
        this.mobPityCounter = 0;
        return 'raro';
      }
    }

    const r = Math.random();
    const mult = isFromBoss ? 5 : 1;
    if (r < this.rarities.supremo.chance  * mult) {
      if (isFromBoss) this.bossPityCounter = 0;
      return 'supremo';
    }
    if (r < this.rarities.lendario.chance * mult) {
      if (isFromBoss) this.bossPityCounter = 0;
      return 'lendario';
    }
    if (r < this.rarities.epico.chance    * mult) return 'epico';
    if (r < this.rarities.raro.chance     * mult) return 'raro';
    if (r < this.rarities.incomum.chance  * mult) return 'incomum';
    return 'comum';
  }

  getItemPool(dungeonLevel) {
    if (dungeonLevel <= 20)  return this.items.d1;
    if (dungeonLevel <= 40)  return this.items.d2;
    if (dungeonLevel <= 60)  return this.items.d3;
    if (dungeonLevel <= 80)  return this.items.d4;
    if (dungeonLevel <= 100) return this.items.d5;
    if (dungeonLevel <= 140) return this.items.d6;
    if (dungeonLevel <= 180) return this.items.d7;
    if (dungeonLevel <= 200) return this.items.d8;
    if (dungeonLevel <= 260) return this.items.d9;
    return this.items.d10;
  }

  rollDrop(dungeonLevel, isFromBoss) {
    const rarity = this.rollRarity(dungeonLevel, isFromBoss);
    if (rarity === 'comum' || rarity === 'incomum') return null; // comum/incomum = ouro/cristal
    const pool = this.getItemPool(dungeonLevel).filter(it => it.rarity === rarity);
    if (!pool.length) return null;
    const item = pool[Math.floor(Math.random() * pool.length)];
    return { ...item, rarity, dungeonLevel, fromBoss: isFromBoss };
  }

  dungeonGroupRequirement(playerLevel) {
    if (playerLevel < 10)   return { allowed: false, solo: false, group: false, msg: 'Nível 10 mínimo para dungeons.' };
    if (playerLevel <= 40)  return { allowed: true,  solo: true,  group: false, msg: 'Solo' };
    if (playerLevel <= 280) return { allowed: true,  solo: false, group: true,  msg: 'Grupo 2+' };
    return                         { allowed: true,  solo: true,  group: true,  msg: 'Solo ou Grupo' };
  }
}

export const dropManager = new DropManager();

// Compatibilidade com scripts legados
if (typeof window !== 'undefined') {
  window.DungeonDrops = {
    RARITY,
    DUNGEON_ITEMS,
    rollDrop: (lvl, boss) => dropManager.rollDrop(lvl, boss),
    rollRarity: (lvl, boss) => dropManager.rollRarity(lvl, boss),
    getItemPool: (lvl) => dropManager.getItemPool(lvl),
    dungeonGroupRequirement: (lvl) => dropManager.dungeonGroupRequirement(lvl)
  };
}
