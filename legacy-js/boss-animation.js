// Directional atlases for the phase-one Guardian and phase-three Colossus.
(() => {
  const DIRECTIONS = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'];

  function animation(src, frameCount, fps, loop) {
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

  function directionalPose(src) {
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

  function directionalAnimation(src, frameCount, fps) {
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
        const frame = Math.floor(Math.max(0, time-startedAt) / frameDuration) % frameCount;
        ctx.drawImage(image, frame*64, row*64, 64, 64, x, y, width, height);
        return true;
      }
    };
  }

  function spriterrificGridAnimation(src, cols, rows, totalFrames, fps, loop = true) {
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

  window.TerraSpriteAnimations = {
    phase1Idle: directionalPose('assets/monsters/guardian-ashroot/idle-directions.png'),
    phase1Run: directionalAnimation('assets/monsters/guardian-ashroot/running.png', 8, 10),
    phase3Idle: animation('assets/monsters/colossus-red-furnace/idle.png', 9, 8, true),
    phase3Impact: animation('assets/effects/colossus-magma-impact/impact.png', 9, 14, false),
    ashenGolemIdle: spriterrificGridAnimation('assets/monsters/boss_ashen_golem/idle_spritesheet.png', 5, 2, 10, 6, true),
    ashenGolemAttack: spriterrificGridAnimation('assets/monsters/boss_ashen_golem/attack_spritesheet.png', 5, 2, 8, 10, false)
  };
})();

