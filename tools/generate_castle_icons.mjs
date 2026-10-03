import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodePNG } from './png-encoder.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const iconsDir = path.join(projectRoot, 'assets', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

class CanvasPixel {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.buf = Buffer.alloc(w * h * 4);
  }

  set(x, y, r, g, b, a = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= this.w || y < 0 || y >= this.h || a <= 0) return;
    const idx = (y * this.w + x) * 4;
    const srcA = a / 255;
    const dstA = this.buf[idx + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA <= 0) return;
    this.buf[idx] = Math.round((r * srcA + this.buf[idx] * dstA * (1 - srcA)) / outA);
    this.buf[idx + 1] = Math.round((g * srcA + this.buf[idx + 1] * dstA * (1 - srcA)) / outA);
    this.buf[idx + 2] = Math.round((b * srcA + this.buf[idx + 2] * dstA * (1 - srcA)) / outA);
    this.buf[idx + 3] = Math.round(outA * 255);
  }

  rect(x, y, w, h, r, g, b, a = 255) {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        this.set(px, py, r, g, b, a);
      }
    }
  }

  circle(cx, cy, radius, r, g, b, a = 255) {
    const minX = Math.max(0, Math.floor(cx - radius - 1));
    const maxX = Math.min(this.w - 1, Math.ceil(cx + radius + 1));
    const minY = Math.max(0, Math.floor(cy - radius - 1));
    const maxY = Math.min(this.h - 1, Math.ceil(cy + radius + 1));
    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const d = Math.hypot(px - cx, py - cy);
        if (d <= radius) {
          const edge = d > radius - 1 ? (radius - d) : 1;
          this.set(px, py, r, g, b, Math.round(a * edge));
        }
      }
    }
  }

  toPNG() {
    return encodePNG(this.w, this.h, this.buf);
  }
}

// 1. Icon: Forge Anvil & Hammer (48x48)
function generateForgeIcon() {
  const c = new CanvasPixel(48, 48);
  // Outer subtle shield glow
  c.circle(24, 24, 22, 249, 115, 22, 40);
  c.circle(24, 24, 19, 20, 16, 26, 230);
  c.circle(24, 24, 18, 45, 36, 56, 240);

  // Anvil base
  c.rect(14, 33, 20, 5, 50, 55, 68);
  c.rect(18, 27, 12, 6, 75, 82, 98);
  c.rect(11, 23, 26, 5, 105, 115, 135);
  c.rect(9, 21, 14, 3, 140, 150, 172); // Horn
  c.rect(13, 22, 23, 2, 220, 230, 245); // Highlight surface

  // Glowing molten core on anvil
  c.rect(20, 20, 8, 3, 255, 120, 30);
  c.rect(22, 21, 4, 1, 255, 240, 120);

  // War Hammer tilted
  // Handle
  for (let i = 0; i < 18; i++) {
    c.set(22 + i * 0.7, 34 - i * 1.3, 145, 95, 55);
    c.set(23 + i * 0.7, 34 - i * 1.3, 95, 60, 35);
  }
  // Hammer head
  c.rect(32, 7, 10, 8, 160, 170, 185);
  c.rect(31, 6, 12, 3, 200, 210, 225);
  c.rect(33, 13, 8, 3, 110, 120, 135);
  // Gold pommel
  c.rect(21, 33, 3, 3, 245, 190, 40);

  // Sparks
  c.set(18, 16, 255, 200, 50);
  c.set(28, 15, 255, 160, 30);
  c.set(30, 22, 255, 220, 80);
  c.set(15, 20, 255, 140, 20);

  return c.toPNG();
}

// 2. Icon: Alchemy Potion (48x48)
function generateAlchemyIcon() {
  const c = new CanvasPixel(48, 48);
  // Outer aura
  c.circle(24, 24, 22, 16, 185, 129, 45);
  c.circle(24, 24, 19, 14, 24, 20, 235);
  c.circle(24, 24, 18, 25, 45, 38, 240);

  // Cork stopper
  c.rect(21, 8, 6, 4, 180, 120, 65);
  c.rect(20, 11, 8, 3, 215, 150, 85);

  // Flask Neck
  c.rect(21, 14, 6, 7, 130, 220, 195, 200);

  // Flask Round Body
  c.circle(24, 28, 13, 30, 110, 85, 180);
  c.circle(24, 28, 12, 16, 185, 129, 230); // Emerald Liquid

  // Liquid depth & glow
  c.circle(24, 30, 9, 34, 197, 94, 240);
  c.circle(24, 31, 6, 74, 222, 128, 255);

  // Bubbles
  c.circle(21, 26, 2, 187, 247, 208, 240);
  c.circle(27, 30, 1.5, 220, 252, 231, 250);
  c.circle(23, 33, 1.5, 240, 253, 244, 255);

  // Glass highlights
  c.rect(15, 24, 2, 6, 255, 255, 255, 160);
  c.rect(16, 22, 3, 2, 255, 255, 255, 140);
  c.rect(21, 15, 2, 4, 255, 255, 255, 180);

  return c.toPNG();
}

// 3. Icon: Oracle Arcane Portal (48x48)
function generateOracleIcon() {
  const c = new CanvasPixel(48, 48);
  // Outer celestial glow
  c.circle(24, 24, 22, 56, 189, 248, 50);
  c.circle(24, 24, 19, 15, 20, 36, 235);
  c.circle(24, 24, 18, 24, 36, 62, 240);

  // Cosmic vortex rings
  for (let r = 14; r >= 4; r -= 2) {
    const alpha = 120 + (14 - r) * 18;
    const col = r % 4 === 0 ? [56, 189, 248] : [168, 85, 247];
    c.circle(24, 24, r, col[0], col[1], col[2], alpha);
  }

  // Swirling spiral arms
  for (let a = 0; a < Math.PI * 4; a += 0.2) {
    const dist = 3 + a * 2.5;
    const px = 24 + Math.cos(a) * dist;
    const py = 24 + Math.sin(a) * dist;
    c.circle(px, py, 1.5, 186, 230, 253, 230);
  }

  // Center celestial eye / singularity
  c.circle(24, 24, 4, 240, 249, 255, 255);
  c.circle(24, 24, 2, 255, 255, 255, 255);

  // Orbiting stars / runes
  c.rect(12, 16, 2, 2, 224, 242, 254);
  c.rect(34, 18, 2, 2, 224, 242, 254);
  c.rect(28, 34, 2, 2, 192, 132, 252);
  c.rect(16, 32, 2, 2, 147, 197, 253);

  return c.toPNG();
}

// 4. Icon: Quest Commander Scroll & Daggers (48x48)
function generateQuestIcon() {
  const c = new CanvasPixel(48, 48);
  c.circle(24, 24, 22, 251, 191, 36, 45);
  c.circle(24, 24, 19, 28, 20, 14, 235);
  c.circle(24, 24, 18, 52, 38, 25, 240);

  // Parchment Body tilted
  c.rect(13, 11, 22, 26, 235, 215, 165);
  c.rect(14, 10, 20, 28, 245, 228, 185);
  c.rect(12, 9, 24, 3, 200, 170, 120); // Top roll
  c.rect(12, 36, 24, 3, 200, 170, 120); // Bottom roll

  // Written text lines
  c.rect(16, 15, 14, 2, 120, 95, 65);
  c.rect(16, 19, 16, 2, 120, 95, 65);
  c.rect(16, 23, 12, 2, 120, 95, 65);
  c.rect(16, 27, 8, 2, 120, 95, 65);

  // Red wax seal & ribbon
  c.circle(28, 30, 5, 185, 28, 28);
  c.circle(28, 30, 4, 220, 38, 38);
  c.circle(28, 30, 2, 248, 113, 113);
  c.rect(27, 34, 2, 5, 185, 28, 28);

  // Crossed sword hilt
  c.rect(8, 8, 6, 2, 245, 190, 40);
  c.rect(10, 6, 2, 6, 245, 190, 40);

  return c.toPNG();
}

// 5. Icon: Marketplace Scales (48x48)
function generateMarketIcon() {
  const c = new CanvasPixel(48, 48);
  c.circle(24, 24, 22, 192, 132, 252, 45);
  c.circle(24, 24, 19, 24, 16, 32, 235);
  c.circle(24, 24, 18, 46, 30, 62, 240);

  // Central pole & finial
  c.rect(23, 10, 2, 26, 215, 170, 50);
  c.circle(24, 10, 3, 245, 210, 80);
  c.rect(18, 34, 12, 4, 190, 145, 40);
  c.rect(16, 36, 16, 3, 145, 105, 30);

  // Balance Crossbeam
  c.rect(12, 15, 24, 3, 240, 195, 60);

  // Left Pan
  c.rect(13, 18, 1, 7, 180, 150, 70);
  c.rect(17, 18, 1, 7, 180, 150, 70);
  c.rect(11, 25, 9, 3, 245, 205, 75);
  // Gold coins on left pan
  c.circle(15, 23, 2, 250, 225, 90);

  // Right Pan (slightly lower)
  c.rect(29, 18, 1, 9, 180, 150, 70);
  c.rect(33, 18, 1, 9, 180, 150, 70);
  c.rect(27, 27, 9, 3, 245, 205, 75);
  // Gem on right pan
  c.circle(31, 25, 2.5, 236, 72, 153);

  return c.toPNG();
}

// 6. Icon: Lore & Bestiary Tome (48x48)
function generateLoreIcon() {
  const c = new CanvasPixel(48, 48);
  c.circle(24, 24, 22, 147, 51, 234, 45);
  c.circle(24, 24, 19, 20, 14, 34, 235);
  c.circle(24, 24, 18, 40, 26, 68, 240);

  // Tome leather cover
  c.rect(13, 11, 22, 28, 88, 28, 135);
  c.rect(14, 10, 20, 28, 126, 34, 206);
  // Pages edge
  c.rect(32, 12, 3, 24, 235, 225, 190);
  c.rect(12, 10, 4, 30, 76, 29, 149); // Spine

  // Gilded corners
  c.rect(14, 10, 4, 3, 245, 200, 60);
  c.rect(29, 10, 4, 3, 245, 200, 60);
  c.rect(14, 35, 4, 3, 245, 200, 60);
  c.rect(29, 35, 4, 3, 245, 200, 60);

  // Arcane Eye emblem on cover
  c.circle(23, 24, 6, 245, 200, 60);
  c.circle(23, 24, 4, 56, 189, 248);
  c.circle(23, 24, 2, 255, 255, 255);

  return c.toPNG();
}

// 7. Icon: Sentinel Tower Shield & Crest (48x48)
function generateSentinelIcon() {
  const c = new CanvasPixel(48, 48);
  c.circle(24, 24, 22, 34, 197, 94, 45);
  c.circle(24, 24, 19, 16, 28, 20, 235);
  c.circle(24, 24, 18, 30, 52, 38, 240);

  // Shield Body
  c.rect(16, 10, 16, 18, 70, 85, 105);
  for (let dy = 0; dy < 12; dy++) {
    const inset = Math.floor(dy * 0.7);
    c.rect(16 + inset, 28 + dy, 16 - inset * 2, 1, 70, 85, 105);
  }

  // Steel border
  c.rect(15, 9, 18, 2, 160, 175, 195);
  c.rect(15, 9, 2, 19, 160, 175, 195);
  c.rect(31, 9, 2, 19, 160, 175, 195);

  // Emerald Eagle / Cross crest
  c.rect(23, 14, 2, 16, 34, 197, 94);
  c.rect(18, 18, 12, 3, 34, 197, 94);
  c.circle(24, 19, 3.5, 74, 222, 128);

  // Crossed Bow behind
  for (let i = 0; i < 18; i++) {
    c.set(10 + i, 38 - i * 1.6, 160, 100, 50);
  }

  return c.toPNG();
}

// 8. Icon: Bardic Lute & Harmonics (48x48)
function generateBardIcon() {
  const c = new CanvasPixel(48, 48);
  c.circle(24, 24, 22, 234, 179, 8, 45);
  c.circle(24, 24, 19, 28, 22, 14, 235);
  c.circle(24, 24, 18, 58, 42, 22, 240);

  // Lute bowl (pear-shaped wood)
  c.circle(20, 29, 9, 180, 105, 45);
  c.circle(20, 29, 8, 215, 135, 60);

  // Sound hole & rosette
  c.circle(20, 29, 3.5, 50, 25, 15);
  c.circle(20, 29, 1.5, 245, 190, 60);

  // Neck & Peghead tilted
  for (let i = 0; i < 16; i++) {
    c.rect(22 + i * 0.7, 26 - i * 1.1, 4, 2, 140, 80, 35);
  }
  // Peghead bend
  c.rect(33, 8, 5, 5, 190, 115, 50);
  c.set(32, 9, 245, 210, 80);
  c.set(36, 11, 245, 210, 80);

  // Strings
  for (let i = 0; i < 16; i++) {
    c.set(20 + i * 0.75, 29 - i * 1.2, 255, 245, 180);
  }

  // Musical note sparks
  c.circle(34, 25, 2, 250, 204, 21);
  c.rect(35, 21, 1, 4, 250, 204, 21);
  c.rect(36, 21, 3, 1, 250, 204, 21);

  return c.toPNG();
}

const icons = [
  { name: 'forge_anvil.png', fn: generateForgeIcon },
  { name: 'alchemy_potion.png', fn: generateAlchemyIcon },
  { name: 'oracle_portal.png', fn: generateOracleIcon },
  { name: 'quest_scroll.png', fn: generateQuestIcon },
  { name: 'market_scales.png', fn: generateMarketIcon },
  { name: 'lore_book.png', fn: generateLoreIcon },
  { name: 'sentinel_shield.png', fn: generateSentinelIcon },
  { name: 'bard_lute.png', fn: generateBardIcon }
];

console.log('Gerando ícones de alta resolução em pixel art...');
for (const icon of icons) {
  const filePath = path.join(iconsDir, icon.name);
  fs.writeFileSync(filePath, icon.fn());
  console.log(`✓ Ícone criado: ${icon.name}`);
}
console.log('Todos os ícones foram gerados com sucesso em assets/icons!');
