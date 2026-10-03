import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodePNG } from './png-encoder.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const DIRECTIONS = [
  { name: 'east', angle: 0 },
  { name: 'south_east', angle: Math.PI / 4 },
  { name: 'south', angle: Math.PI / 2 },
  { name: 'south_west', angle: (3 * Math.PI) / 4 },
  { name: 'west', angle: Math.PI },
  { name: 'north_west', angle: -(3 * Math.PI) / 4 },
  { name: 'north', angle: -Math.PI / 2 },
  { name: 'north_east', angle: -Math.PI / 4 }
];

class Bitmap {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.buf = Buffer.alloc(w * h * 4);
  }

  setPixel(x, y, r, g, b, a = 255) {
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

  fillCircle(cx, cy, r, red, green, blue, alpha = 255) {
    const minX = Math.max(0, Math.floor(cx - r - 1));
    const maxX = Math.min(this.w - 1, Math.ceil(cx + r + 1));
    const minY = Math.max(0, Math.floor(cy - r - 1));
    const maxY = Math.min(this.h - 1, Math.ceil(cy + r + 1));
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (d <= r) {
          const edgeA = d > r - 1 ? (r - d) : 1;
          this.setPixel(x, y, red, green, blue, Math.round(alpha * edgeA));
        }
      }
    }
  }

  toPNG() {
    return encodePNG(this.w, this.h, this.buf);
  }
}

// ─────────────────────────────────────────────────────────────────
// 1. ARROW SPRITE GENERATOR (48x48)
// ─────────────────────────────────────────────────────────────────
function generateArrow(dirAngle) {
  const size = 48;
  const bmp = new Bitmap(size, size);
  const cx = size / 2;
  const cy = size / 2;

  // We define the arrow pointing along the positive X-axis (east = 0),
  // then rotate each point by dirAngle around (cx, cy).
  const cos = Math.cos(dirAngle);
  const sin = Math.sin(dirAngle);
  function worldPos(localX, localY) {
    return {
      x: cx + localX * cos - localY * sin,
      y: cy + localX * sin + localY * cos
    };
  }

  // Speed streak / air trail behind the arrow (-20 to -6)
  for (let lx = -22; lx <= -6; lx += 0.8) {
    const intensity = (lx + 22) / 16;
    const { x, y } = worldPos(lx, 0);
    bmp.setPixel(x, y, 167, 243, 208, Math.round(140 * intensity));
    const top = worldPos(lx, -1);
    bmp.setPixel(top.x, top.y, 110, 231, 183, Math.round(80 * intensity));
    const bot = worldPos(lx, 1);
    bmp.setPixel(bot.x, bot.y, 110, 231, 183, Math.round(80 * intensity));
  }

  // Arrow shaft: from localX = -14 to +12
  for (let lx = -14; lx <= 12; lx += 0.5) {
    // Shaft core
    const pCenter = worldPos(lx, 0);
    bmp.setPixel(pCenter.x, pCenter.y, 212, 139, 72, 255); // golden wood highlight
    // Shaft upper/lower shading
    const pTop = worldPos(lx, -0.75);
    bmp.setPixel(pTop.x, pTop.y, 160, 90, 36, 230); // wood midtone
    const pBot = worldPos(lx, 0.75);
    bmp.setPixel(pBot.x, pBot.y, 90, 45, 18, 230); // wood dark shadow
  }

  // Fletchings (feathers at back: localX = -13 to -6)
  for (let lx = -13; lx <= -6; lx += 0.6) {
    const fletchDist = -lx - 6; // 0 to 7
    const vaneHeight = Math.min(3.5, 0.6 + fletchDist * 0.45);
    for (let ly = 1; ly <= vaneHeight; ly += 0.6) {
      // Top feather vane
      const f1 = worldPos(lx, -ly);
      const colG = ly > 2.5 ? 245 : 185; // golden edge
      bmp.setPixel(f1.x, f1.y, ly > 2.5 ? 245 : 16, colG, ly > 2.5 ? 11 : 129, 240);
      // Bottom feather vane
      const f2 = worldPos(lx, ly);
      bmp.setPixel(f2.x, f2.y, ly > 2.5 ? 245 : 5, colG > 200 ? 158 : 150, ly > 2.5 ? 11 : 105, 240);
    }
  }

  // Nock at the very back (localX = -15 to -13.5)
  for (let lx = -15; lx <= -13.5; lx += 0.5) {
    const pN = worldPos(lx, 0);
    bmp.setPixel(pN.x, pN.y, 254, 243, 199, 255);
  }

  // Arrowhead: localX from 10 to 19, triangular barbed head
  for (let lx = 10; lx <= 19; lx += 0.5) {
    const headProg = (lx - 10) / 9; // 0 at base, 1 at tip
    const barbWidth = (1 - headProg) * 4.2; // wider at base, 0 at tip
    for (let ly = -barbWidth; ly <= barbWidth; ly += 0.5) {
      const pHead = worldPos(lx, ly);
      const isTip = lx >= 17;
      const isCenter = Math.abs(ly) < 0.8;
      const isEdge = Math.abs(ly) >= barbWidth - 0.7;

      if (isTip || (isCenter && lx >= 14)) {
        // Razor white glint
        bmp.setPixel(pHead.x, pHead.y, 255, 255, 255, 255);
      } else if (isEdge) {
        // Darkened tempered steel edge
        bmp.setPixel(pHead.x, pHead.y, 45, 55, 72, 240);
      } else if (ly < 0) {
        // Bright steel upper face
        bmp.setPixel(pHead.x, pHead.y, 226, 232, 240, 255);
      } else {
        // Shaded steel lower face
        bmp.setPixel(pHead.x, pHead.y, 148, 163, 184, 255);
      }
    }
  }

  // Tip glint particle
  const tip = worldPos(19.5, 0);
  bmp.setPixel(tip.x, tip.y, 255, 255, 255, 255);
  bmp.fillCircle(tip.x, tip.y, 1.2, 255, 255, 255, 200);

  return bmp;
}

// ─────────────────────────────────────────────────────────────────
// 2. MAGIC PROJECTILE GENERATOR (48x48)
// ─────────────────────────────────────────────────────────────────
function generateMagic(dirAngle) {
  const size = 48;
  const bmp = new Bitmap(size, size);
  const cx = size / 2;
  const cy = size / 2;

  const cos = Math.cos(dirAngle);
  const sin = Math.sin(dirAngle);
  function worldPos(localX, localY) {
    return {
      x: cx + localX * cos - localY * sin,
      y: cy + localX * sin + localY * cos
    };
  }

  // 1. Arcane Comet Tail: Flowing multi-layer plasma stretching back from lx = 4 down to -18
  for (let lx = -18; lx <= 6; lx += 0.6) {
    const tailProg = (lx + 18) / 24; // 0 at far tail, 1 near head
    const width = 1 + tailProg * 4.5;
    const wave = Math.sin(lx * 0.7) * (1 - tailProg) * 1.5;

    for (let ly = -width; ly <= width; ly += 0.5) {
      const pT = worldPos(lx, ly + wave);
      const normY = Math.abs(ly) / (width || 1);
      const alpha = Math.round(230 * tailProg * (1 - normY * 0.7));

      if (normY < 0.35) {
        // Core plasma stream (electric cyan / neon white)
        bmp.setPixel(pT.x, pT.y, 192, 132, 252, alpha);
        if (normY < 0.15 && tailProg > 0.4) {
          bmp.setPixel(pT.x, pT.y, 245, 243, 255, Math.round(alpha * 1.1));
        }
      } else if (normY < 0.7) {
        // Mid purple violet flame
        bmp.setPixel(pT.x, pT.y, 147, 51, 234, Math.round(alpha * 0.85));
      } else {
        // Outer dissipation halo (deep cosmic indigo / ember)
        bmp.setPixel(pT.x, pT.y, 99, 102, 241, Math.round(alpha * 0.5));
      }
    }
  }

  // 2. Trailing Spark Motes behind the comet
  const sparks = [
    { lx: -15, ly: -3, r: 1.1, c: [224, 231, 255] },
    { lx: -19, ly: 1.5, r: 1.0, c: [192, 132, 252] },
    { lx: -13, ly: 3.5, r: 0.9, c: [147, 51, 234] },
    { lx: -10, ly: -4, r: 1.2, c: [244, 114, 182] },
    { lx: -7, ly: 3.2, r: 1.1, c: [56, 189, 248] },
    { lx: -4, ly: -4.5, r: 1.3, c: [245, 243, 255] }
  ];
  for (const s of sparks) {
    const pt = worldPos(s.lx, s.ly);
    bmp.fillCircle(pt.x, pt.y, s.r, s.c[0], s.c[1], s.c[2], 220);
  }

  // 3. Orbital Arcane Energy Horns/Rings circling the core
  for (let deg = 0; deg < 360; deg += 10) {
    const rad = (deg * Math.PI) / 180;
    const ringLX = 5 + Math.cos(rad) * 3;
    const ringLY = Math.sin(rad) * 6.5;
    const pt = worldPos(ringLX, ringLY);
    bmp.setPixel(pt.x, pt.y, 236, 72, 153, 190);
    const ptInner = worldPos(ringLX + 0.5, ringLY * 0.8);
    bmp.setPixel(ptInner.x, ptInner.y, 192, 132, 252, 220);
  }

  // 4. Dense Arcane Head Core at lx = 5
  const headPos = worldPos(5.5, 0);
  // Outer purple aura
  bmp.fillCircle(headPos.x, headPos.y, 6.5, 126, 34, 206, 160);
  bmp.fillCircle(headPos.x, headPos.y, 5.0, 168, 85, 247, 210);
  // Mid electric violet
  bmp.fillCircle(headPos.x, headPos.y, 3.8, 216, 180, 254, 245);
  // White-hot arcane center
  bmp.fillCircle(headPos.x, headPos.y, 2.2, 255, 255, 255, 255);

  // 5. Piercing Leading Sparks at the very tip (lx = 10 to 12)
  const tip1 = worldPos(10.5, 0);
  bmp.fillCircle(tip1.x, tip1.y, 1.3, 255, 255, 255, 255);
  const tip2 = worldPos(12.5, 0);
  bmp.setPixel(tip2.x, tip2.y, 224, 231, 255, 220);

  return bmp;
}

// ─────────────────────────────────────────────────────────────────
// EXECUTION: GENERATE AND WRITE ALL FILES
// ─────────────────────────────────────────────────────────────────
const arrowDir = path.join(projectRoot, 'assets/projectiles/arrow');
const magicDir = path.join(projectRoot, 'assets/projectiles/magic');

fs.mkdirSync(arrowDir, { recursive: true });
fs.mkdirSync(magicDir, { recursive: true });

console.log('Criando sprites da flecha do arqueiro (8 ângulos)...');
for (const dir of DIRECTIONS) {
  const bmp = generateArrow(dir.angle);
  const outPath = path.join(arrowDir, `arrow_${dir.name}.png`);
  fs.writeFileSync(outPath, bmp.toPNG());
  console.log(`  ✓ ${outPath}`);
}

console.log('Criando sprites da magia do mago (8 ângulos)...');
for (const dir of DIRECTIONS) {
  const bmp = generateMagic(dir.angle);
  const outPath = path.join(magicDir, `magic_${dir.name}.png`);
  fs.writeFileSync(outPath, bmp.toPNG());
  console.log(`  ✓ ${outPath}`);
}

console.log('Todos os 16 sprites de projéteis criados com sucesso!');
