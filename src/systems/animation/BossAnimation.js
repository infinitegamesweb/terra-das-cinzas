// src/systems/animation/BossAnimation.js
// Directional atlases for the phase-one Guardian and phase-three Colossus.

export const DIRECTIONS = Object.freeze([
  'east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'
]);

export function createAnimation(src, frameCount, fps, loop) {
  const image = new Image();
  image.src = src;
  const frameDuration = 1000 / fps;

  return {
    get ready() {
      return image.complete && image.naturalWidth >= frameCount * 64;
    },
    draw(ctx, time, x, y, width, height, startedAt = 0) {
      if (!this.ready) return false;
      const elapsed = Math.max(0, time - startedAt);
      let frame = Math.floor(elapsed / frameDuration);
      if (loop) frame %= frameCount;
      else if (frame >= frameCount) return false;

      ctx.drawImage(image, frame * 64, 0, 64, 64, x, y, width, height);
      return true;
    }
  };
}

export function createDirectionalPose(src) {
  const image = new Image();
  image.src = src;
  return {
    get ready() {
      return image.complete && image.naturalWidth >= DIRECTIONS.length * 64;
    },
    draw(ctx, direction, x, y, width, height) {
      if (!this.ready) return false;
      const index = Math.max(0, DIRECTIONS.indexOf(direction));
      ctx.drawImage(image, index * 64, 0, 64, 64, x, y, width, height);
      return true;
    }
  };
}

export function createDirectionalAnimation(src, frameCount, fps) {
  const image = new Image();
  image.src = src;
  const frameDuration = 1000 / fps;
  return {
    get ready() {
      return image.complete && image.naturalWidth >= frameCount * 64 && image.naturalHeight >= DIRECTIONS.length * 64;
    },
    draw(ctx, time, x, y, width, height, direction, startedAt = 0) {
      if (!this.ready) return false;
      const row = Math.max(0, DIRECTIONS.indexOf(direction));
      const frame = Math.floor(Math.max(0, time - startedAt) / frameDuration) % frameCount;
      ctx.drawImage(image, frame * 64, row * 64, 64, 64, x, y, width, height);
      return true;
    }
  };
}

export function createSpriterrificGridAnimation(src, cols, rows, totalFrames, fps, loop = true) {
  const image = new Image();
  image.src = src;
  const frameDuration = 1000 / fps;

  return {
    get ready() {
      return image.complete && image.naturalWidth > 0;
    },
    draw(ctx, time, x, y, width, height, startedAt = 0) {
      if (!this.ready) return false;
      const cellW = image.naturalWidth / cols;
      const cellH = image.naturalHeight / rows;
      const elapsed = Math.max(0, time - startedAt);
      let frame = Math.floor(elapsed / frameDuration);
      if (loop) frame %= totalFrames;
      else if (frame >= totalFrames) frame = totalFrames - 1;

      const col = frame % cols;
      const row = Math.floor(frame / cols);
      ctx.drawImage(image, col * cellW, row * cellH, cellW, cellH, x, y, width, height);
      return true;
    }
  };
}

export function createStripAnimation(src, frameCount, fps, loop = true) {
  const image = new Image();
  image.src = src;
  const frameDuration = 1000 / fps;

  return {
    image,
    frameCount,
    frameDuration,
    get ready() {
      return image.complete && image.naturalWidth > 0;
    },
    draw(ctx, time, x, y, width, height, startedAt = 0) {
      if (!this.ready) return false;
      const cellW = image.naturalWidth / frameCount;
      const cellH = image.naturalHeight;
      const elapsed = Math.max(0, time - startedAt);
      let frame = Math.floor(elapsed / frameDuration);
      if (loop) {
        frame %= frameCount;
      } else {
        if (frame >= frameCount) return false;
      }

      ctx.drawImage(image, frame * cellW, 0, cellW, cellH, x, y, width, height);
      return true;
    }
  };
}

export const terraSpriteAnimations = {
  phase1Idle: createDirectionalPose('assets/monsters/guardian-ashroot/idle-directions.png'),
  phase1Run: createDirectionalAnimation('assets/monsters/guardian-ashroot/running.png', 8, 10),
  phase3Idle: createAnimation('assets/monsters/colossus-red-furnace/idle.png', 9, 8, true),
  phase3Impact: createAnimation('assets/effects/colossus-magma-impact/impact.png', 9, 14, false),
  ashenGolemIdle: createSpriterrificGridAnimation('assets/monsters/boss_ashen_golem/idle_spritesheet.png', 5, 2, 10, 6, true),
  ashenGolemAttack: createSpriterrificGridAnimation('assets/monsters/boss_ashen_golem/attack_spritesheet.png', 5, 2, 8, 10, false),
  ashenGolemDeath: createSpriterrificGridAnimation('assets/monsters/boss_ashen_golem/death_spritesheet.png', 5, 2, 10, 8, false),

  // Combat VFX Strips (Explosions & Magic)
  fxHitSpark: createStripAnimation('assets/effects/fx_hit_spark_strip.png', 3, 16, false),
  fxEnemyDeath: createStripAnimation('assets/effects/fx_enemy_death_strip.png', 8, 14, false),
  fxGroundExplosion: createStripAnimation('assets/effects/fx_ground_explosion_strip.png', 9, 14, false),

  // Animated Monsters Strips
  monsterFireSkull: createStripAnimation('assets/monsters/monster_fire_skull_strip.png', 8, 8, true),
  monsterHellHound: createStripAnimation('assets/monsters/monster_hell_hound_strip.png', 11, 8, true),
  monsterGhostSpectre: createStripAnimation('assets/monsters/monster_ghost_spectre_strip.png', 7, 6, true),
  monsterFlyingDemon: createStripAnimation('assets/monsters/monster_flying_demon_strip.png', 8, 10, true),
  monsterReaperDeath: createStripAnimation('assets/monsters/monster_reaper_death_strip.png', 4, 6, true),
  monsterGiantFrog: createStripAnimation('assets/monsters/monster_giant_frog_strip.png', 6, 7, true),
  monsterTreant: createStripAnimation('assets/monsters/monster_treant_strip.png', 4, 5, true),
  monsterSwampWitch: createStripAnimation('assets/monsters/monster_swamp_witch_strip.png', 5, 6, true),
  monsterVampireLord: createStripAnimation('assets/monsters/monster_vampire_lord_strip.png', 4, 5, true),
  monsterCaveOgre: createStripAnimation('assets/monsters/monster_cave_ogre_strip.png', 5, 6, true),

  // Companion Pet: Corvo das Cinzas (Gothicvania)
  petCrowFly: createStripAnimation('assets/characters/pets/crow_fly_strip.png', 2, 6, true),
  petCrowIdle: createStripAnimation('assets/characters/pets/crow_idle_strip.png', 3, 4, true),

  // Biome Environmental Animations: Pântano Espectral Toxic Gas Bubbles
  swampGasBubbles: createStripAnimation('assets/effects/swamp/swamp_gas_bubbles_strip.png', 4, 4, true)
};

if (typeof window !== 'undefined') {
  window.TerraSpriteAnimations = terraSpriteAnimations;
}
