import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodePNG } from './png-encoder.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dungeonsDir = path.resolve(__dirname, '..', 'assets', 'maps', 'dungeons');

if (!fs.existsSync(dungeonsDir)) {
  fs.mkdirSync(dungeonsDir, { recursive: true });
}

class DungeonCanvas {
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

  ring(cx, cy, innerR, outerR, r, g, b, a = 255) {
    const minX = Math.max(0, Math.floor(cx - outerR - 1));
    const maxX = Math.min(this.w - 1, Math.ceil(cx + outerR + 1));
    const minY = Math.max(0, Math.floor(cy - outerR - 1));
    const maxY = Math.min(this.h - 1, Math.ceil(cy + outerR + 1));
    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const d = Math.hypot(px - cx, py - cy);
        if (d >= innerR && d <= outerR) {
          this.set(px, py, r, g, b, a);
        }
      }
    }
  }

  radialGlow(cx, cy, radius, r, g, b, maxAlpha = 180) {
    const minX = Math.max(0, Math.floor(cx - radius));
    const maxX = Math.min(this.w - 1, Math.ceil(cx + radius));
    const minY = Math.max(0, Math.floor(cy - radius));
    const maxY = Math.min(this.h - 1, Math.ceil(cy + radius));
    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const d = Math.hypot(px - cx, py - cy);
        if (d <= radius) {
          const falloff = 1 - (d / radius);
          const alpha = Math.round(maxAlpha * (falloff * falloff));
          this.set(px, py, r, g, b, alpha);
        }
      }
    }
  }

  toPNG() {
    return encodePNG(this.w, this.h, this.buf);
  }
}

function buildDungeonFogMap({
  floorBase,
  floorAlt,
  runeColor,
  runeSecondary,
  pillarColor,
  torchColor,
  abyssColor = [10, 14, 12]
}) {
  const W = 960;
  const H = 720;
  const c = new DungeonCanvas(W, H);

  // 1. Deep Cavern Abyss Base
  c.rect(0, 0, W, H, abyssColor[0], abyssColor[1], abyssColor[2]);

  // 2. Stone Floor Grid with TTRPG Tactical Tiled Slabs
  const tileSize = 24;
  for (let y = 32; y < H - 32; y += tileSize) {
    for (let x = 32; x < W - 32; x += tileSize) {
      const isBossRoom = Math.hypot(x - W / 2, y - H / 2) < 185;
      const isEastChamber = Math.hypot(x - 720, y - 360) < 125;
      const isWestChamber = Math.hypot(x - 240, y - 360) < 125;
      const isHallway = (y > 330 && y < 390) || (x > 445 && x < 515);
      const isNorthEntrance = (x > 430 && x < 530 && y < 210);
      const isSouthStairs = (x > 430 && x < 530 && y > 510);

      if (isBossRoom || isEastChamber || isWestChamber || isHallway || isNorthEntrance || isSouthStairs) {
        const slabSeed = (x * 73 + y * 97) % 5;
        let baseR = floorBase[0] + slabSeed * 3;
        let baseG = floorBase[1] + slabSeed * 3;
        let baseB = floorBase[2] + slabSeed * 3;

        if (isBossRoom) {
          baseR = floorAlt[0] + slabSeed * 3;
          baseG = floorAlt[1] + slabSeed * 3;
          baseB = floorAlt[2] + slabSeed * 3;
        }

        // Tiled slab
        c.rect(x + 1, y + 1, tileSize - 2, tileSize - 2, baseR, baseG, baseB);
        // Mortar lines
        c.rect(x, y, tileSize, 1, Math.max(0, baseR - 18), Math.max(0, baseG - 18), Math.max(0, baseB - 18), 190);
        c.rect(x, y, 1, tileSize, Math.max(0, baseR - 18), Math.max(0, baseG - 18), Math.max(0, baseB - 18), 190);
      }
    }
  }

  // 3. Thick Outer Masonry Walls
  c.rect(0, 0, W, 32, pillarColor[0] - 15, pillarColor[1] - 15, pillarColor[2] - 15);
  c.rect(0, H - 32, W, 32, pillarColor[0] - 15, pillarColor[1] - 15, pillarColor[2] - 15);
  c.rect(0, 0, 32, H, pillarColor[0] - 15, pillarColor[1] - 15, pillarColor[2] - 15);
  c.rect(W - 32, 0, 32, H, pillarColor[0] - 15, pillarColor[1] - 15, pillarColor[2] - 15);

  // 4. Central Boss Arena Runic Circles
  c.ring(W / 2, H / 2, 115, 122, runeColor[0], runeColor[1], runeColor[2], 230);
  c.ring(W / 2, H / 2, 75, 80, runeSecondary[0], runeSecondary[1], runeSecondary[2], 200);
  c.ring(W / 2, H / 2, 32, 36, runeColor[0], runeColor[1], runeColor[2], 170);

  // Cardinal Nodes
  const cardinalNodes = [
    [W / 2 - 118, H / 2], [W / 2 + 118, H / 2],
    [W / 2, H / 2 - 118], [W / 2, H / 2 + 118],
    [W / 2 - 84, H / 2 - 84], [W / 2 + 84, H / 2 - 84],
    [W / 2 - 84, H / 2 + 84], [W / 2 + 84, H / 2 + 84]
  ];
  cardinalNodes.forEach(([nx, ny]) => {
    c.circle(nx, ny, 8, runeColor[0], runeColor[1], runeColor[2], 240);
    c.circle(nx, ny, 4, 255, 255, 255, 255);
  });

  // 5. Heavy Columns (DungeonFog Stone Pillars)
  const pillars = [
    [W / 2 - 135, H / 2 - 135], [W / 2 + 135, H / 2 - 135],
    [W / 2 - 135, H / 2 + 135], [W / 2 + 135, H / 2 + 135],
    [240, 285], [240, 435], [720, 285], [720, 435],
    [410, 115], [550, 115], [410, 605], [550, 605]
  ];
  pillars.forEach(([px, py]) => {
    c.circle(px + 4, py + 8, 18, 5, 5, 5, 180); // Drop shadow
    c.circle(px, py, 16, pillarColor[0] - 10, pillarColor[1] - 10, pillarColor[2] - 10);
    c.circle(px, py - 3, 13, pillarColor[0] + 15, pillarColor[1] + 15, pillarColor[2] + 15);
    c.circle(px - 2, py - 6, 7, pillarColor[0] + 45, pillarColor[1] + 45, pillarColor[2] + 45);
  });

  // 6. Dynamic Torches and Lighting
  const lights = [
    [W / 2 - 135, H / 2 - 135, torchColor[0], torchColor[1], torchColor[2]],
    [W / 2 + 135, H / 2 - 135, torchColor[0], torchColor[1], torchColor[2]],
    [W / 2 - 135, H / 2 + 135, torchColor[0], torchColor[1], torchColor[2]],
    [W / 2 + 135, H / 2 + 135, torchColor[0], torchColor[1], torchColor[2]],
    [240, 360, runeColor[0], runeColor[1], runeColor[2]],
    [720, 360, runeSecondary[0], runeSecondary[1], runeSecondary[2]],
    [480, 80, 74, 222, 128], // Entrance Portal Green Glow
    [480, 640, 245, 158, 11]  // Stairs Exit Golden Glow
  ];
  lights.forEach(([lx, ly, r, g, b]) => {
    c.radialGlow(lx, ly, 120, r, g, b, 150);
  });

  return c.toPNG();
}

console.log('Gerando os 5 Mapas de Masmorras Estilizados no padrão DungeonFog...');

// Região 1: Catacumbas do Bosque (Musgo e Esmeralda)
const r1 = buildDungeonFogMap({
  floorBase: [38, 48, 42],
  floorAlt: [48, 62, 52],
  runeColor: [74, 222, 128],
  runeSecondary: [110, 231, 183],
  pillarColor: [70, 85, 76],
  torchColor: [52, 211, 153],
  abyssColor: [10, 16, 12]
});
fs.writeFileSync(path.join(dungeonsDir, 'dungeon_region_1.png'), r1);
console.log('✓ dungeon_region_1.png gerado!');

// Região 2: Cripta Submersa do Pântano (Ardósia e Ciano)
const r2 = buildDungeonFogMap({
  floorBase: [28, 42, 54],
  floorAlt: [36, 56, 72],
  runeColor: [56, 189, 248],
  runeSecondary: [125, 211, 252],
  pillarColor: [55, 78, 98],
  torchColor: [14, 165, 233],
  abyssColor: [8, 14, 20]
});
fs.writeFileSync(path.join(dungeonsDir, 'dungeon_region_2.png'), r2);
console.log('✓ dungeon_region_2.png gerado!');

// Região 3: Fornalha de Magma da Montanha (Basalto e Fogo)
const r3 = buildDungeonFogMap({
  floorBase: [58, 32, 26],
  floorAlt: [78, 42, 34],
  runeColor: [249, 115, 22],
  runeSecondary: [251, 191, 36],
  pillarColor: [90, 56, 48],
  torchColor: [239, 68, 68],
  abyssColor: [22, 10, 8]
});
fs.writeFileSync(path.join(dungeonsDir, 'dungeon_region_3.png'), r3);
console.log('✓ dungeon_region_3.png gerado!');

// Região 4: Arquivos Sepultados da Cidade Antiga (Mármore e Ametista)
const r4 = buildDungeonFogMap({
  floorBase: [44, 30, 58],
  floorAlt: [60, 40, 78],
  runeColor: [192, 132, 252],
  runeSecondary: [232, 121, 249],
  pillarColor: [80, 60, 98],
  torchColor: [168, 85, 247],
  abyssColor: [16, 10, 22]
});
fs.writeFileSync(path.join(dungeonsDir, 'dungeon_region_4.png'), r4);
console.log('✓ dungeon_region_4.png gerado!');

// Região 5: Cidadela Abissal do Trono das Cinzas (Obsidiana e Carmesim)
const r5 = buildDungeonFogMap({
  floorBase: [36, 20, 32],
  floorAlt: [52, 26, 44],
  runeColor: [244, 63, 94],
  runeSecondary: [251, 113, 133],
  pillarColor: [75, 42, 65],
  torchColor: [225, 29, 72],
  abyssColor: [14, 6, 12]
});
fs.writeFileSync(path.join(dungeonsDir, 'dungeon_region_5.png'), r5);
console.log('✓ dungeon_region_5.png gerado!');

console.log('Todos os 5 mapas DungeonFog gerados com sucesso!');
