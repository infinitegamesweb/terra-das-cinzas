import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodePNG } from './png-encoder.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const mapsDir = path.join(projectRoot, 'assets', 'maps');
const propsDir = path.join(projectRoot, 'assets', 'props');

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

// 1. Castle Ruins Seamless Flagstones (128x128)
function generateRuinsFloorTile() {
  const c = new CanvasPixel(128, 128);
  // Base dark stone slate
  c.rect(0, 0, 128, 128, 28, 25, 34);

  // Large stone blocks grid (4x4 staggered flagstones)
  const flagCols = [
    [48, 26, 68],
    [58, 32, 78],
    [42, 24, 62],
    [52, 28, 72]
  ];

  for (let row = 0; row < 4; row++) {
    const y0 = row * 32;
    const xOffset = (row % 2) * 16;
    for (let col = -1; col < 5; col++) {
      const x0 = col * 32 + xOffset;
      const palette = flagCols[(row * 3 + col + 8) % flagCols.length];
      const baseR = 42 + (row * 7 + col * 5) % 18;
      const baseG = 38 + (row * 6 + col * 4) % 16;
      const baseB = 52 + (row * 8 + col * 6) % 22;

      // Stone slab body
      for (let py = 2; py < 30; py++) {
        for (let px = 2; px < 30; px++) {
          const noise = ((px * 13 + py * 23 + row * 41) % 11) - 5;
          c.set(x0 + px, y0 + py, baseR + noise, baseG + noise, baseB + noise);
        }
      }

      // Stone bevel highlight (top-left)
      for (let px = 2; px < 30; px++) {
        c.set(x0 + px, y0 + 2, baseR + 25, baseG + 25, baseB + 30);
      }
      for (let py = 2; py < 30; py++) {
        c.set(x0 + 2, y0 + py, baseR + 20, baseG + 20, baseB + 25);
      }

      // Stone shadow groove (bottom-right)
      for (let px = 2; px < 31; px++) {
        c.set(x0 + px, y0 + 30, 16, 14, 20);
        c.set(x0 + px, y0 + 31, 12, 10, 16);
      }
      for (let py = 2; py < 31; py++) {
        c.set(x0 + 30, y0 + py, 16, 14, 20);
        c.set(x0 + 31, y0 + py, 12, 10, 16);
      }
    }
  }

  // Stone Cracks and fractures
  const cracks = [
    [18, 12, 28, 22],
    [28, 22, 34, 19],
    [75, 45, 88, 55],
    [88, 55, 92, 68],
    [40, 80, 52, 95],
    [105, 90, 118, 108]
  ];
  for (const [x1, y1, x2, y2] of cracks) {
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const jx = Math.round(x1 + (x2 - x1) * t + Math.sin(t * 8) * 1.5);
      const jy = Math.round(y1 + (y2 - y1) * t);
      c.set(jx, jy, 14, 12, 18, 240);
      c.set(jx + 1, jy, 68, 62, 80, 150); // crack rim
    }
  }

  // Moss and ancient green overgrowth in crevices
  for (let i = 0; i < 45; i++) {
    const mx = (i * 37) % 128;
    const my = (i * 47) % 128;
    c.circle(mx, my, 2 + (i % 3), 35, 78, 48, 140);
    c.circle(mx, my, 1, 62, 115, 68, 180);
  }

  // Ash particles & charcoal flecks
  for (let i = 0; i < 60; i++) {
    const ax = (i * 53) % 128;
    const ay = (i * 71) % 128;
    c.set(ax, ay, 200, 180, 160, 90);
    c.set(ax + 1, ay, 240, 150, 60, 50); // glowing speck
  }

  return c.toPNG();
}

// 2. Training Dummy (48x64)
function generateTrainingDummy() {
  const c = new CanvasPixel(48, 64);
  // Ground Shadow
  c.circle(24, 58, 14, 10, 10, 14, 140);
  c.circle(24, 58, 9, 8, 8, 10, 180);

  // Wooden Cross Base
  c.rect(14, 56, 20, 4, 85, 55, 30);
  c.rect(22, 54, 4, 6, 110, 75, 45);

  // Main Vertical Post
  c.rect(22, 18, 4, 38, 120, 80, 45);
  c.rect(21, 18, 1, 38, 70, 45, 25);

  // Horizontal Crossbar (Arms)
  c.rect(10, 24, 28, 5, 115, 75, 40);
  c.rect(9, 23, 30, 2, 145, 95, 55);

  // Straw Body / Torso Padding
  c.circle(24, 32, 10, 195, 165, 90);
  c.rect(16, 24, 16, 18, 195, 165, 90);
  c.rect(15, 25, 18, 15, 215, 185, 110);

  // Rope bindings
  c.rect(14, 27, 20, 2, 130, 85, 45);
  c.rect(14, 34, 20, 2, 130, 85, 45);
  c.rect(14, 40, 20, 2, 130, 85, 45);

  // Red Target bullseye on chest
  c.circle(24, 33, 5, 220, 45, 45);
  c.circle(24, 33, 3.5, 245, 230, 210);
  c.circle(24, 33, 2, 220, 45, 45);

  // Straw Head & Sack
  c.circle(24, 15, 7, 205, 175, 100);
  c.circle(24, 15, 6, 225, 195, 125);
  // Sack stitching
  c.rect(21, 14, 6, 2, 120, 80, 40);
  c.set(22, 12, 50, 30, 20); // Eye dot 1
  c.set(26, 12, 50, 30, 20); // Eye dot 2

  // Old iron helmet on head
  c.rect(18, 8, 12, 5, 120, 130, 145);
  c.circle(24, 8, 5.5, 140, 150, 165);
  c.rect(21, 5, 6, 3, 170, 180, 195);
  c.rect(23, 12, 2, 3, 90, 95, 105); // Nose guard

  // Slashes and cuts on straw
  c.set(17, 30, 60, 35, 20);
  c.set(18, 31, 60, 35, 20);
  c.set(29, 36, 60, 35, 20);
  c.set(30, 37, 60, 35, 20);

  return c.toPNG();
}

// 3. Ruined Ancient Statue (54x72)
function generateRuinedStatue() {
  const c = new CanvasPixel(54, 72);
  // Base Pedestal
  c.circle(27, 66, 18, 12, 12, 16, 150);
  c.rect(14, 60, 26, 8, 55, 52, 62);
  c.rect(16, 56, 22, 6, 75, 72, 85);
  c.rect(15, 55, 24, 2, 110, 105, 125); // rim

  // Broken Legs & Tunic
  c.rect(21, 42, 12, 14, 85, 82, 95);
  c.rect(19, 44, 4, 12, 65, 62, 75);

  // Armored Torso with carved chest plate
  c.rect(18, 25, 18, 18, 95, 92, 105);
  c.rect(17, 24, 20, 4, 125, 120, 135);
  // Carved imperial sun crest
  c.circle(27, 33, 4, 180, 165, 110);
  c.circle(27, 33, 2, 220, 205, 140);

  // Broken Right Shoulder & Arm stump
  c.rect(13, 26, 6, 8, 85, 80, 95);
  c.rect(12, 33, 7, 3, 50, 45, 58); // jagged fracture

  // Left Arm holding broken stone shield
  c.rect(34, 26, 6, 14, 85, 80, 95);
  c.rect(37, 32, 6, 18, 95, 92, 108); // Broken shield edge
  c.rect(38, 30, 4, 22, 120, 115, 130);

  // Weathered & Parted Head
  c.circle(27, 16, 7, 85, 82, 95);
  c.circle(27, 15, 6, 110, 105, 120);
  // Broken helmet crest
  c.rect(25, 8, 4, 6, 130, 125, 140);

  // Moss and vines wrapping statue
  for (let i = 0; i < 25; i++) {
    const vx = 18 + ((i * 7) % 20);
    const vy = 20 + ((i * 11) % 45);
    c.circle(vx, vy, 1.8, 38, 95, 52, 190);
    c.circle(vx, vy, 1, 65, 135, 78, 230);
  }

  return c.toPNG();
}

// 4. Arcane Crystal Brazier (48x64)
function generateArcaneBrazier() {
  const c = new CanvasPixel(48, 64);
  // Ground aura
  c.circle(24, 58, 16, 56, 189, 248, 60);
  c.circle(24, 58, 12, 14, 18, 28, 160);

  // Stone base pedestal
  c.rect(15, 52, 18, 8, 48, 45, 58);
  c.rect(17, 46, 14, 8, 68, 64, 80);
  c.rect(19, 36, 10, 12, 85, 80, 98);

  // Ornate bowl
  c.rect(13, 28, 22, 9, 65, 60, 78);
  c.rect(11, 26, 26, 4, 105, 98, 122);
  c.rect(10, 24, 28, 3, 140, 132, 160);

  // Glowing charcoal bed
  c.rect(14, 25, 20, 3, 240, 120, 40);

  // Floating Arcane Crystal
  c.circle(24, 18, 8, 56, 189, 248, 140);
  c.rect(22, 11, 4, 14, 147, 225, 255);
  c.rect(20, 14, 8, 8, 56, 189, 248);
  c.circle(24, 18, 4, 224, 242, 254, 255);
  c.circle(24, 18, 2, 255, 255, 255, 255);

  // Mystic flame sparks & motes
  c.circle(18, 12, 1.5, 186, 230, 253, 220);
  c.circle(30, 13, 1.5, 186, 230, 253, 220);
  c.circle(21, 6, 2, 56, 189, 248, 240);
  c.circle(27, 8, 1.5, 56, 189, 248, 240);

  return c.toPNG();
}

console.log('Gerando texturas e assets do Castelo em Ruínas...');
fs.writeFileSync(path.join(mapsDir, 'castle_ruins_floor.png'), generateRuinsFloorTile());
console.log('✓ assets/maps/castle_ruins_floor.png');

fs.writeFileSync(path.join(propsDir, 'training_dummy.png'), generateTrainingDummy());
console.log('✓ assets/props/training_dummy.png');

fs.writeFileSync(path.join(propsDir, 'ruined_statue.png'), generateRuinedStatue());
console.log('✓ assets/props/ruined_statue.png');

fs.writeFileSync(path.join(propsDir, 'arcane_brazier.png'), generateArcaneBrazier());
console.log('✓ assets/props/arcane_brazier.png');

console.log('Assets de ruínas gerados com sucesso!');
