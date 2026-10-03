import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { encodePNG } from './png-encoder.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const novoDir = path.join(projectRoot, 'novo');
const npcsOutDir = path.join(projectRoot, 'assets', 'characters', 'npcs');
const pixiNpcDir = path.resolve('d:/Game/Ferramentas para games/projetos_pixel_art/npcs');

if (!fs.existsSync(npcsOutDir)) fs.mkdirSync(npcsOutDir, { recursive: true });
if (!fs.existsSync(pixiNpcDir)) fs.mkdirSync(pixiNpcDir, { recursive: true });

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePNG(filePath) {
  const buf = fs.readFileSync(filePath);
  let offset = 8;
  let width = 0, height = 0;
  const idatChunks = [];
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    if (type === 'IHDR') {
      width = buf.readUInt32BE(offset + 8);
      height = buf.readUInt32BE(offset + 12);
    } else if (type === 'IDAT') {
      idatChunks.push(buf.subarray(offset + 8, offset + 8 + len));
    }
    offset += 12 + len;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const bpp = 4;
  const stride = width * bpp;
  const rgba = Buffer.alloc(width * height * bpp);
  let srcOffset = 0;
  let prevRow = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filter = decompressed[srcOffset++];
    const currentRow = Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const val = decompressed[srcOffset++];
      const left = x >= bpp ? currentRow[x - bpp] : 0;
      const up = prevRow[x];
      const upLeft = x >= bpp ? prevRow[x - bpp] : 0;

      let unfiltered = 0;
      if (filter === 0) unfiltered = val;
      else if (filter === 1) unfiltered = (val + left) & 0xff;
      else if (filter === 2) unfiltered = (val + up) & 0xff;
      else if (filter === 3) unfiltered = (val + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) unfiltered = (val + paethPredictor(left, up, upLeft)) & 0xff;

      currentRow[x] = unfiltered;
      rgba[y * stride + x] = unfiltered;
    }
    prevRow = currentRow;
  }

  return { width, height, rgba };
}

function compositeBuffers(base, overlay) {
  const out = Buffer.from(base);
  for (let i = 0; i < out.length; i += 4) {
    const srcA = overlay[i + 3] / 255;
    if (srcA <= 0) continue;
    const dstA = out[i + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA <= 0) continue;

    out[i] = Math.round((overlay[i] * srcA + out[i] * dstA * (1 - srcA)) / outA);
    out[i + 1] = Math.round((overlay[i + 1] * srcA + out[i + 1] * dstA * (1 - srcA)) / outA);
    out[i + 2] = Math.round((overlay[i + 2] * srcA + out[i + 2] * dstA * (1 - srcA)) / outA);
    out[i + 3] = Math.round(outA * 255);
  }
  return out;
}

function cropRGBA(srcRgba, srcW, srcH, sx, sy, w, h) {
  const dest = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const srcRow = (sy + y) * srcW * 4 + sx * 4;
    const dstRow = y * w * 4;
    srcRgba.copy(dest, dstRow, srcRow, srcRow + w * 4);
  }
  return dest;
}

const NPC_DEFINITIONS = [
  {
    id: 'forge_ignis',
    name: 'Ferreiro Ignis',
    body: 'char_a_p1/char_a_p1_0bas_humn_v03.png',
    outfit: 'char_a_p1/1out/char_a_p1_1out_pfpn_v01.png',
    hair: 'char_a_p1/4har/char_a_p1_4har_bob1_v08.png',
    hat: null
  },
  {
    id: 'shop_maeve',
    name: 'Alquimista Maeve',
    body: 'char_a_p1/char_a_p1_0bas_humn_v01.png',
    outfit: 'char_a_p1/1out/char_a_p1_1out_fstr_v02.png',
    hair: 'char_a_p1/4har/char_a_p1_4har_dap1_v02.png',
    hat: 'char_a_p1/5hat/char_a_p1_5hat_pfht_v02.png'
  },
  {
    id: 'portal_kaelen',
    name: 'Oráculo Kaelen',
    body: 'char_a_p1/char_a_p1_0bas_humn_v00.png',
    outfit: 'char_a_p1/1out/char_a_p1_1out_pfpn_v03.png',
    hair: 'char_a_p1/4har/char_a_p1_4har_dap1_v00.png',
    hat: 'char_a_p1/5hat/char_a_p1_5hat_pnty_v03.png'
  },
  {
    id: 'quest_vane',
    name: 'Comandante Vane',
    body: 'char_a_p1/char_a_p1_0bas_humn_v04.png',
    outfit: 'char_a_p1/1out/char_a_p1_1out_fstr_v01.png',
    hair: 'char_a_p1/4har/char_a_p1_4har_bob1_v04.png',
    hat: 'char_a_p1/5hat/char_a_p1_5hat_pfht_v01.png'
  },
  {
    id: 'market_silas',
    name: 'Corretor Silas',
    body: 'char_a_p1/char_a_p1_0bas_humn_v02.png',
    outfit: 'char_a_p1/1out/char_a_p1_1out_pfpn_v05.png',
    hair: 'char_a_p1/4har/char_a_p1_4har_dap1_v05.png',
    hat: 'char_a_p1/5hat/char_a_p1_5hat_pfht_v05.png'
  },
  {
    id: 'sentinel_lyanna',
    name: 'Guardiã Lyanna',
    body: 'char_a_p1/char_a_p1_0bas_humn_v01.png',
    outfit: 'char_a_p1/1out/char_a_p1_1out_fstr_v05.png',
    hair: 'char_a_p1/4har/char_a_p1_4har_bob1_v02.png',
    hat: null
  },
  {
    id: 'lore_ether',
    name: 'Arquivista Éter',
    body: 'char_a_p1/char_a_p1_0bas_humn_v05.png',
    outfit: 'char_a_p1/1out/char_a_p1_1out_pfpn_v04.png',
    hair: 'char_a_p1/4har/char_a_p1_4har_dap1_v11.png',
    hat: null
  },
  {
    id: 'bard_dorian',
    name: 'Bardo Dorian',
    body: 'char_a_p1/char_a_p1_0bas_humn_v01.png',
    outfit: 'char_a_p1/1out/char_a_p1_1out_pfpn_v02.png',
    hair: 'char_a_p1/4har/char_a_p1_4har_dap1_v07.png',
    hat: 'char_a_p1/5hat/char_a_p1_5hat_pnty_v02.png'
  }
];

console.log('Compondo camadas modulares dos NPCs do Mana Seed com suporte total a filtros PNG...');

for (const npc of NPC_DEFINITIONS) {
  console.log(`Montando NPC: ${npc.name} (${npc.id})...`);
  const bodyPath = path.join(novoDir, npc.body);
  const { width, height, rgba: bodyRgba } = decodePNG(bodyPath);
  let composited = Buffer.from(bodyRgba);

  if (npc.outfit) {
    const { rgba: outRgba } = decodePNG(path.join(novoDir, npc.outfit));
    composited = compositeBuffers(composited, outRgba);
  }
  if (npc.hair) {
    const { rgba: hairRgba } = decodePNG(path.join(novoDir, npc.hair));
    composited = compositeBuffers(composited, hairRgba);
  }
  if (npc.hat) {
    const { rgba: hatRgba } = decodePNG(path.join(novoDir, npc.hat));
    composited = compositeBuffers(composited, hatRgba);
  }

  // 1. Full 512x512 SpriteSheet
  const fullPng = encodePNG(width, height, composited);
  fs.writeFileSync(path.join(npcsOutDir, `${npc.id}_sheet.png`), fullPng);
  fs.writeFileSync(path.join(pixiNpcDir, `${npc.id}_sheet.png`), fullPng);

  // 2. 4-Direction Walk/Idle Strip (4 directions x 6 frames: 384x256)
  const stripW = 6 * 64;
  const stripH = 4 * 64;
  const stripRgba = Buffer.alloc(stripW * stripH * 4);
  for (let r = 0; r < 4; r++) {
    const srcRowY = (4 + r) * 64;
    const dstRowY = r * 64;
    const rowCrop = cropRGBA(composited, width, height, 0, srcRowY, stripW, 64);
    rowCrop.copy(stripRgba, dstRowY * stripW * 4);
  }
  const stripPng = encodePNG(stripW, stripH, stripRgba);
  fs.writeFileSync(path.join(npcsOutDir, `${npc.id}_anim.png`), stripPng);
  fs.writeFileSync(path.join(pixiNpcDir, `${npc.id}_anim.png`), stripPng);

  // 3. High-res Single Front Idle Avatar (64x64)
  const frontIdleRgba = cropRGBA(composited, width, height, 0, 4 * 64, 64, 64);
  const frontIdlePng = encodePNG(64, 64, frontIdleRgba);
  fs.writeFileSync(path.join(npcsOutDir, `${npc.id}_idle.png`), frontIdlePng);
  fs.writeFileSync(path.join(pixiNpcDir, `${npc.id}_idle.png`), frontIdlePng);

  // 4. Bust Portrait Crop (32x32)
  const portraitRgba = cropRGBA(composited, width, height, 16, 4 * 64 + 12, 32, 32);
  const portraitPng = encodePNG(32, 32, portraitRgba);
  fs.writeFileSync(path.join(npcsOutDir, `${npc.id}_portrait.png`), portraitPng);
  fs.writeFileSync(path.join(pixiNpcDir, `${npc.id}_portrait.png`), portraitPng);

  console.log(`✓ ${npc.id}: montado com sucesso!`);
}

console.log('Todos os NPCs compostos com sucesso!');
