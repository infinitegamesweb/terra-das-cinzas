// src/entities/Player.js
// Sprites direcionais (8 direções), Animações de Combate (Mana Seed) e Renderização do Herói

import { getClassById } from '../data/classes.data.js';

export function createHeroSprites(classId = 'guerreiro') {
  const characterClass = getClassById(classId);
  const directions = ['south', 'south-west', 'west', 'north-west', 'north', 'north-east', 'east', 'south-east'];
  const sprites = { idle: {}, walk: {}, attack: {}, hurt: {}, death: {}, pickup: {} };

  directions.forEach((d) => {
    const idle = new Image();
    idle.src = `${characterClass.walkRoot}/Idle/rotations/${d}.png`;
    sprites.idle[d] = idle;

    sprites.walk[d] = Array.from({ length: 6 }, (_, i) => {
      const frame = new Image();
      frame.src = `${characterClass.walkRoot}/animations/walk/${d}/frame_${String(i).padStart(3, '0')}.png`;
      return frame;
    });

    sprites.attack[d] = Array.from({ length: 6 }, (_, i) => {
      const frame = new Image();
      frame.src = `${characterClass.walkRoot}/animations/attack/${d}/frame_${String(i).padStart(3, '0')}.png`;
      return frame;
    });

    sprites.hurt[d] = Array.from({ length: 3 }, (_, i) => {
      const frame = new Image();
      frame.src = `${characterClass.walkRoot}/animations/hurt/${d}/frame_${String(i).padStart(3, '0')}.png`;
      return frame;
    });

    sprites.death[d] = Array.from({ length: 6 }, (_, i) => {
      const frame = new Image();
      frame.src = `${characterClass.walkRoot}/animations/death/${d}/frame_${String(i).padStart(3, '0')}.png`;
      return frame;
    });

    sprites.pickup[d] = sprites.walk[d].slice(0, 4);
  });

  return sprites;
}

export function faceDirection(p, dx, dy) {
  const ax = Math.abs(dx), ay = Math.abs(dy);
  if (ax > ay * 2) {
    p.dir = dx > 0 ? 'east' : 'west';
  } else if (ay > ax * 2) {
    p.dir = dy > 0 ? 'south' : 'north';
  } else {
    p.dir = dy > 0 ? (dx > 0 ? 'south-east' : 'south-west') : (dx > 0 ? 'north-east' : 'north-west');
  }
  if (dx) p.face = Math.sign(dx);
}

// Preloaded 4-directional luminous crescent moon slash VFX (Mana Seed)
export const slashVFXSprites = {
  south: [new Image(), new Image(), new Image()],
  north: [new Image(), new Image(), new Image()],
  east: [new Image(), new Image(), new Image()],
  west: [new Image(), new Image(), new Image()]
};

['south', 'north', 'east', 'west'].forEach((d) => {
  for (let i = 0; i < 3; i++) {
    slashVFXSprites[d][i].src = `assets/effects/slash/slash_${d}_${i}.png`;
  }
});

export function drawHero(g, p, last, heroSprites, box) {
  const isUltimate = p.ultimateBuffUntil && last < p.ultimateBuffUntil;
  const isBerserk = p.berserkUntil && last < p.berserkUntil;
  const classFx = {
    arqueiro: { color: '#8ee5a5', glow: 'rgba(90, 220, 145, 0.28)' },
    assasino: { color: '#c084fc', glow: 'rgba(168, 85, 247, 0.28)' },
    barbaro: { color: '#fb704d', glow: 'rgba(239, 68, 68, 0.26)' },
    clerigo: { color: '#ffe17a', glow: 'rgba(250, 204, 21, 0.25)' },
    mago: { color: '#75d9ff', glow: 'rgba(56, 189, 248, 0.28)' }
  }[p.classId];
  const drawScale = (isUltimate ? 1.65 : p.classId === 'guerreiro' ? 1.32 : 1.36);
  g.save();
  const dir = p.dir || 'south';

  // 1. Estado de Morte (HP <= 0)
  const isDying = (p.hp <= 0 || p.isDying) && p.deathStartedAt;
  const deathAge = isDying ? last - p.deathStartedAt : -1;
  const deathFrames = heroSprites.death?.[dir];
  const deathFrame = isDying && deathFrames ? deathFrames[Math.min(deathFrames.length - 1, Math.floor(deathAge / 150))] : null;

  // 2. Estado de Sofrer Dano (Hurt)
  const hurtAge = last - (p.hurtAt || -Infinity);
  const isHurting = !isDying && hurtAge >= 0 && hurtAge < 240;
  const hurtFrames = heroSprites.hurt?.[dir];
  const hurtFrame = isHurting && hurtFrames ? hurtFrames[Math.min(hurtFrames.length - 1, Math.floor(hurtAge / 80))] : null;

  // 3. Estado de Ataque (Attack)
  const attackAge = last - (p.attackAt || -Infinity);
  const isAttacking = !isDying && attackAge >= 0 && attackAge < 480;
  const attackFrames = heroSprites.attack?.[dir];
  const attackFrame = isAttacking && attackFrames ? attackFrames[Math.min(attackFrames.length - 1, Math.floor(attackAge / 80))] : null;

  const pickupAge = last - (p.pickupAt || -Infinity);
  const isPickingUp = !isDying && !isAttacking && pickupAge >= 0 && pickupAge < 400;
  const pickupFrames = heroSprites.pickup?.[dir];
  const pickupFrame = isPickingUp && pickupFrames ? pickupFrames[Math.min(pickupFrames.length - 1, Math.floor(pickupAge / 100))] : null;

  const walkFrames = heroSprites.walk?.[dir];
  const walkFrame = !isDying && !isHurting && !isAttacking && p.moving && walkFrames?.length ? walkFrames[Math.floor((p.walk % (Math.PI * 2)) / (Math.PI * 2) * walkFrames.length)] : null;

  const rawSprite = deathFrame || hurtFrame || attackFrame || pickupFrame || walkFrame || heroSprites.idle?.[dir];
  const im = (rawSprite && rawSprite.complete && rawSprite.naturalWidth) ? rawSprite : heroSprites.idle?.[dir];

  const sprW = 48;
  const sprH = 48;
  const attackProgress = isAttacking ? Math.max(0, 1 - attackAge / 260) : 0;
  const facing = {
    east: [1, 0], west: [-1, 0], north: [0, -1], south: [0, 1],
    'north-east': [0.7, -0.7], 'north-west': [-0.7, -0.7],
    'south-east': [0.7, 0.7], 'south-west': [-0.7, 0.7]
  }[dir] || [0, 1];
  const attackLunge = classFx ? attackProgress * (p.classId === 'assasino' ? 12 : 7) : 0;

  // Ultimate Runic Aura under feet
  if (isUltimate) {
    const ultRot = (last / 300) % (Math.PI * 2);
    g.save();
    g.translate(p.x, p.y + 10);
    g.rotate(ultRot);
    g.strokeStyle = '#f59e0b';
    g.shadowColor = '#fbbf24';
    g.shadowBlur = 18;
    g.lineWidth = 2.5;
    g.beginPath();
    g.arc(0, 0, 48 + Math.sin(last / 140) * 4, 0, Math.PI * 2);
    g.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      g.beginPath();
      g.moveTo(Math.cos(a) * 36, Math.sin(a) * 36);
      g.lineTo(Math.cos(a + Math.PI / 8) * 48, Math.sin(a + Math.PI / 8) * 48);
      g.stroke();
    }
    g.restore();
  }

  // Dash ghost trail
  if (p.dashTrail && p.dashTrail.length) {
    p.dashTrail.forEach((ghost) => {
      g.save();
      g.globalAlpha = ghost.alpha * 0.45;
      g.translate(ghost.x, ghost.y + 12);
      g.scale(drawScale, drawScale);
      if (im && im.complete && im.naturalWidth) {
        g.drawImage(im, -sprW / 2, -sprH, sprW, sprH);
      }
      g.restore();
    });
  }

  // Shadow
  g.fillStyle = '#050c07aa';
  g.beginPath();
  g.ellipse(p.x, p.y + 11, isUltimate ? 28 : 22, isUltimate ? 10 : 8, 0, 0, Math.PI * 2);
  g.fill();

  if (classFx && (isAttacking || p.shield > 0 || isUltimate || isBerserk)) {
    const pulse = 0.45 + Math.sin(last / 55) * 0.12;
    g.save();
    g.globalAlpha = isAttacking ? 0.25 + attackProgress * 0.42 : isBerserk ? 0.42 + Math.sin(last / 65) * 0.2 : pulse;
    g.fillStyle = classFx.glow;
    g.beginPath();
    g.ellipse(p.x, p.y - 13, 23 + attackProgress * 7, 30 + attackProgress * 5, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  if (isBerserk) {
    g.save();
    g.translate(p.x, p.y - 18);
    g.strokeStyle = '#ff855c';
    g.shadowColor = '#f43f2f';
    g.shadowBlur = 12;
    g.globalAlpha = 0.55 + Math.sin(last / 70) * 0.18;
    g.lineWidth = 2.5;
    g.beginPath();
    g.arc(0, 0, 32 + Math.sin(last / 90) * 3, 0.1, Math.PI * 1.85);
    g.stroke();
    g.restore();
  }

  if (im && im.complete && im.naturalWidth) {
    const bob = walkFrame || isAttacking || isPickingUp ? 0 : p.moving ? Math.abs(Math.sin(p.walk)) * 2.5 : Math.sin(last / 360) * 0.9;
    g.save();
    g.translate(p.x + facing[0] * attackLunge, p.y + 12 + bob + facing[1] * attackLunge);
    g.scale(drawScale, drawScale);
    const classAttackTilt = classFx && isAttacking ? facing[0] * Math.sin(attackAge / 260 * Math.PI) * 0.11 : 0;
    g.rotate(classAttackTilt || (!isAttacking && !isPickingUp && !walkFrame && p.moving ? Math.sin(p.walk) * 0.035 : 0));
    if (classFx && isAttacking) {
      g.filter = `drop-shadow(0 0 ${3 + attackProgress * 8}px ${classFx.color})`;
    }
    g.drawImage(im, -sprW / 2, -sprH, sprW, sprH);
    g.restore();
  } else {
    g.save();
    g.translate(p.x, p.y);
    g.scale(drawScale, drawScale);
    g.fillStyle = '#7b2530';
    g.beginPath();
    g.moveTo(-14, 14);
    g.lineTo(-12, -15);
    g.lineTo(12, -15);
    g.lineTo(16, 14);
    g.fill();
    box(-9, -13, 18, 22, '#d74b48');
    box(-11, -33, 22, 20, '#354039');
    box(-7, -29, 14, 11, '#e6d9bd');
    box(-7, -27, 5, 3, '#242a26');
    box(3, -27, 5, 3, '#242a26');
    box(-14, -11, 28, 4, '#d6ad54');
    box(p.face * 12, -12, 5, 24, '#b6c0b9');
    box(p.face * 12 - 3, -17, 11, 7, '#f3e5b5');
    g.restore();
  }

  // Attack slash wave arc effect (estritamente para corpo a corpo: NÃO Mago e NÃO Arqueiro)
  const isMelee = p.classId !== 'arqueiro' && p.classId !== 'mago';
  if (isAttacking && attackAge < 320 && isMelee) {
    const slashProg = attackAge / 320;
    const frameIdx = Math.min(2, Math.floor(slashProg * 3));
    let baseDir = 'south';
    if (dir.includes('north')) baseDir = 'north';
    else if (dir.includes('east')) baseDir = 'east';
    else if (dir.includes('west')) baseDir = 'west';
    else if (dir.includes('south')) baseDir = 'south';

    const slashImg = slashVFXSprites[baseDir] && slashVFXSprites[baseDir][frameIdx];
    if (slashImg && slashImg.complete && slashImg.naturalWidth > 0) {
      g.save();
      g.translate(p.x, p.y - 10);
      const ox = baseDir === 'east' ? 22 : baseDir === 'west' ? -22 : 0;
      const oy = baseDir === 'south' ? 20 : baseDir === 'north' ? -22 : 0;
      g.globalAlpha = Math.max(0, 1 - slashProg * 0.35);
      const isFinisher = p.combo === 2;
      const isHitTwo = p.combo === 1;

      let scale = (isUltimate || isFinisher) ? 2.1 : isHitTwo ? 1.75 : 1.5;
      if (isUltimate || isFinisher) {
        g.filter = 'drop-shadow(0 0 16px #f59e0b) brightness(1.4) saturate(1.8)';
      } else if (isHitTwo) {
        g.filter = 'drop-shadow(0 0 10px #38bdf8) brightness(1.25) hue-rotate(180deg)';
      } else {
        g.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.9))';
      }
      const slashW = slashImg.naturalWidth * scale;
      const slashH = slashImg.naturalHeight * scale;
      g.drawImage(slashImg, ox - slashW / 2, oy - slashH / 2, slashW, slashH);
      g.restore();
    }
  }

  // Shield aura VFX
  if (p.shield > 0) {
    const shieldAngle = (last / 400) % (Math.PI * 2);
    g.save();
    g.translate(p.x, p.y - 14);
    g.shadowColor = '#64e5f7';
    g.shadowBlur = 16;
    g.strokeStyle = 'rgba(100, 230, 250, 0.85)';
    g.lineWidth = 2.5;
    g.beginPath();
    g.arc(0, 0, 42 + Math.sin(last / 120) * 2, 0, Math.PI * 2);
    g.stroke();

    for (let i = 0; i < 4; i++) {
      const a = shieldAngle + (i * Math.PI * 2) / 4;
      const rx = Math.cos(a) * 42;
      const ry = Math.sin(a) * 42 * 0.7;
      g.fillStyle = '#bdf9ff';
      g.beginPath();
      g.arc(rx, ry, 3.5, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }

  // Character Nameplate & Status Over Hero Head
  const charClass = getClassById(p.classId) || { name: 'Guerreiro', icon: '' };
  const nameplateY = p.y - (isUltimate ? 68 : 56);
  g.save();
  g.font = '700 10px "Outfit", sans-serif';
  g.textAlign = 'center';
  g.fillStyle = isUltimate ? '#fde047' : '#e2e8f0';
  g.shadowColor = '#000000';
  g.shadowBlur = 6;
  g.fillText(`${charClass.name} · Nv. ${p.lvl}`, p.x, nameplateY);

  if (p.hp < p.max) {
    const barW = 38;
    const barH = 4;
    const hpRatio = Math.max(0, Math.min(1, p.hp / p.max));
    g.fillStyle = '#0f172acc';
    g.fillRect(p.x - barW / 2 - 1, nameplateY + 4, barW + 2, barH + 2);
    g.fillStyle = '#1e293b';
    g.fillRect(p.x - barW / 2, nameplateY + 5, barW, barH);
    g.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
    g.fillRect(p.x - barW / 2, nameplateY + 5, barW * hpRatio, barH);
  }
  g.restore();

  g.restore();
}

export const gamePlayer = {
  createHeroSprites,
  faceDirection,
  drawHero,
  slashVFXSprites
};

if (typeof window !== 'undefined') {
  window.GamePlayer = gamePlayer;
}
