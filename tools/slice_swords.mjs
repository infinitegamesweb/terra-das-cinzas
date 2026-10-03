import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imgPath = 'C:/Users/jpdes/.gemini/antigravity-ide/brain/2a307a18-32ad-446f-bcb3-1b1e9b613309/.user_uploaded/media_1791034985038.png';
const outputDir = 'public/assets/items/weapons';
const pixelArtDir = 'd:/Game/Ferramentas para games/projetos_pixel_art/swords_pack';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(pixelArtDir)) fs.mkdirSync(pixelArtDir, { recursive: true });

const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;

// Make near-white (>240 in all RGB channels) transparent
const transparentBuf = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) {
  const r = data[i * 4];
  const g = data[i * 4 + 1];
  const b = data[i * 4 + 2];
  
  if (r > 240 && g > 240 && b > 240) {
    transparentBuf[i * 4] = 0;
    transparentBuf[i * 4 + 1] = 0;
    transparentBuf[i * 4 + 2] = 0;
    transparentBuf[i * 4 + 3] = 0;
  } else {
    transparentBuf[i * 4] = r;
    transparentBuf[i * 4 + 1] = g;
    transparentBuf[i * 4 + 2] = b;
    transparentBuf[i * 4 + 3] = 255;
  }
}

// Connected components detection
const visited = new Uint8Array(W * H);
const components = [];

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = y * W + x;
    if (transparentBuf[idx * 4 + 3] > 0 && !visited[idx]) {
      let minX = x, maxX = x, minY = y, maxY = y;
      let pixelCount = 0;
      const queue = [idx];
      const compPixels = [];
      visited[idx] = 1;

      while (queue.length > 0) {
        const curr = queue.pop();
        compPixels.push(curr);
        const cy = Math.floor(curr / W);
        const cx = curr % W;
        pixelCount++;

        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
              const nidx = ny * W + nx;
              if (transparentBuf[nidx * 4 + 3] > 0 && !visited[nidx]) {
                visited[nidx] = 1;
                queue.push(nidx);
              }
            }
          }
        }
      }

      if (pixelCount > 100) {
        components.push({
          minX, maxX, minY, maxY,
          width: maxX - minX + 1,
          height: maxY - minY + 1,
          centerX: (minX + maxX) / 2,
          centerY: (minY + maxY) / 2,
          pixelCount,
          compPixels
        });
      }
    }
  }
}

console.log(`Detected ${components.length} sword components.`);

// Group into 4 rows of 5
components.sort((a, b) => a.centerY - b.centerY);
const rows = [];
let currentRow = [];
for (const comp of components) {
  if (currentRow.length === 0) {
    currentRow.push(comp);
  } else {
    const avgY = currentRow.reduce((sum, c) => sum + c.centerY, 0) / currentRow.length;
    if (Math.abs(comp.centerY - avgY) < 120) {
      currentRow.push(comp);
    } else {
      rows.push(currentRow);
      currentRow = [comp];
    }
  }
}
if (currentRow.length > 0) rows.push(currentRow);

// Sort each row left-to-right
rows.forEach(r => r.sort((a, b) => a.centerX - b.centerX));

// Flatten in reading order 0..19
const swords = [];
rows.forEach(r => swords.push(...r));

console.log(`Ordered ${swords.length} swords.`);

// Sword definitions metadata
const swordDefs = [
  // Row 0
  { index: 1, id: 'w_adaga_errante', filename: 'sword_hero_01.png', name: 'Adaga de Caça do Errante' },
  { index: 2, id: 'w_espada_treino', filename: 'sword_hero_02.png', name: 'Espada de Treino de Carvalho' },
  { index: 3, id: 'w_gladio_guarnicao', filename: 'sword_hero_03.png', name: 'Gládio da Guarnição' },
  { index: 4, id: 'w_espada_larga_ferro', filename: 'sword_hero_04.png', name: 'Espada Larga do Batedor' },
  { index: 5, id: 'w_bastarda_forjada', filename: 'sword_hero_05.png', name: 'Espada Bastarda Forjada' },

  // Row 1
  { index: 6, id: 'w_longa_aco', filename: 'sword_hero_06.png', name: 'Espada Longa de Aço' },
  { index: 7, id: 'w_florete_duelo', filename: 'sword_hero_07.png', name: 'Florete de Duelo Ágil' },
  { index: 8, id: 'w_lamina_esmeralda_pantano', filename: 'sword_hero_08.png', name: 'Lâmina Esmeralda do Pântano' },
  { index: 9, id: 'w_flamberge_cruzado', filename: 'sword_hero_09.png', name: 'Flamberge do Cruzado' },
  { index: 10, id: 'w_lamina_bronze_antigo', filename: 'sword_hero_10.png', name: 'Lâmina de Bronze das Ruínas' },

  // Row 2
  { index: 11, id: 'w_montante_pedra', filename: 'sword_hero_11.png', name: 'Montante do Carrasco' },
  { index: 12, id: 'w_espada_safira_azul', filename: 'sword_hero_12.png', name: 'Espada com Safira do Cruzado' },
  { index: 13, id: 'w_lamina_prata_vigilia', filename: 'sword_hero_13.png', name: 'Lâmina de Prata da Vigília' },
  { index: 14, id: 'w_cimitarra_deserto', filename: 'sword_hero_14.png', name: 'Cimitarra do Vento do Deserto' },
  { index: 15, id: 'w_espada_meia_noite', filename: 'sword_hero_15.png', name: 'Espada da Meia-Noite' },

  // Row 3
  { index: 16, id: 'w_lamina_sol_radiante', filename: 'sword_hero_16.png', name: 'Lâmina do Sol Radiante' },
  { index: 17, id: 'w_espada_obsidiana_abismo', filename: 'sword_hero_17.png', name: 'Lâmina de Obsidiana do Abismo' },
  { index: 18, id: 'w_espada_ametista_espectral', filename: 'sword_hero_18.png', name: 'Espada Espectral de Ametista' },
  { index: 19, id: 'w_sagrada_aurora_eterna', filename: 'sword_hero_19.png', name: 'Lâmina Sagrada da Aurora' },
  { index: 20, id: 'w_reliquia_cinco_selos', filename: 'sword_hero_20.png', name: 'Relíquia dos Cinco Selos' },
];

for (let i = 0; i < swords.length; i++) {
  const comp = swords[i];
  const def = swordDefs[i];
  
  // Extract strictly the pixels belonging to this component onto a clean transparent buffer
  const pad = 4;
  const cropW = comp.width + pad * 2;
  const cropH = comp.height + pad * 2;
  const cropX = Math.max(0, comp.minX - pad);
  const cropY = Math.max(0, comp.minY - pad);
  
  const squareDim = Math.max(cropW, cropH) + 6;
  const squareBuf = Buffer.alloc(squareDim * squareDim * 4); // all zeros = transparent

  const offsetX = Math.floor((squareDim - comp.width) / 2);
  const offsetY = Math.floor((squareDim - comp.height) / 2);

  for (const pixelIdx of comp.compPixels) {
    const py = Math.floor(pixelIdx / W);
    const px = pixelIdx % W;
    
    const targetX = offsetX + (px - comp.minX);
    const targetY = offsetY + (py - comp.minY);

    if (targetX >= 0 && targetX < squareDim && targetY >= 0 && targetY < squareDim) {
      const targetIdx = (targetY * squareDim + targetX) * 4;
      squareBuf[targetIdx] = transparentBuf[pixelIdx * 4];
      squareBuf[targetIdx + 1] = transparentBuf[pixelIdx * 4 + 1];
      squareBuf[targetIdx + 2] = transparentBuf[pixelIdx * 4 + 2];
      squareBuf[targetIdx + 3] = transparentBuf[pixelIdx * 4 + 3];
    }
  }

  // 1. Save high-res master in pixel art dir
  const rawMaster = sharp(squareBuf, { raw: { width: squareDim, height: squareDim, channels: 4 } });
  const masterPath = path.join(pixelArtDir, `sword_${String(def.index).padStart(2, '0')}_${def.id}_master.png`);
  await rawMaster.png().toFile(masterPath);

  // 2. Downscale to 32x32 standard icon with crisp lanczos3 + subtle sharpening for pixel-art clarity
  const outPath32 = path.join(outputDir, def.filename);
  await sharp(squareBuf, { raw: { width: squareDim, height: squareDim, channels: 4 } })
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath32);

  // 3. Also save 32x32 in pixelArtDir
  const pixelArt32 = path.join(pixelArtDir, `sword_${String(def.index).padStart(2, '0')}_${def.id}_32x32.png`);
  fs.copyFileSync(outPath32, pixelArt32);

  // 4. Save 64x64 high-res version for crisp tooltips / inspector modal
  const outPath64 = path.join(outputDir, def.filename.replace('.png', '_64.png'));
  await sharp(squareBuf, { raw: { width: squareDim, height: squareDim, channels: 4 } })
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath64);

  console.log(`[${i + 1}/20] Sliced & exported ${def.filename} (${def.name}) -> 32x32 & 64x64`);
}

console.log('All 20 swords sliced and exported successfully!');
