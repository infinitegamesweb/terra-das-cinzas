// src/systems/mining/MiningManager.js
import { ORE_TYPES, GOLD_CHESTS, MINING_DUNGEONS } from '../../data/mining.data.js';

export class MiningManager {
  constructor() {
    this.ores = ORE_TYPES;
    this.chests = GOLD_CHESTS;
    this.dungeons = MINING_DUNGEONS;
  }

  rollOre(dungeonId, playerLevel) {
    const dg = this.dungeons.find(d => d.id === dungeonId);
    if (!dg) return null;
    const pool = this.ores.filter(o => dg.ores.includes(o.id));
    const r = Math.random();
    let cum = 0;
    for (const ore of pool) {
      cum += ore.chance;
      if (r < cum) return { ...ore };
    }
    return { ...pool[0] };
  }

  rollChest(dungeonId) {
    const dg = this.dungeons.find(d => d.id === dungeonId);
    if (!dg) return null;
    const pool = this.chests.filter(c => dg.chests.includes(c.id));
    const r = Math.random();
    let cum = 0;
    for (const chest of pool) {
      cum += chest.chance;
      if (r < cum) {
        return {
          ...chest,
          gold: Math.floor(Math.random() * (chest.goldMax - chest.goldMin) + chest.goldMin)
        };
      }
    }
    return { ...pool[0], gold: pool[0].goldMin };
  }
}

export const miningManager = new MiningManager();

if (typeof window !== 'undefined') {
  window.MiningDungeons = {
    ORE_TYPES,
    GOLD_CHESTS,
    MINING_DUNGEONS,
    rollOre: (id, lvl) => miningManager.rollOre(id, lvl),
    rollChest: (id) => miningManager.rollChest(id)
  };
}
