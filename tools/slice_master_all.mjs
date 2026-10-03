import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Cleanly slices a grid of items from a sheet with white/uniform background
 */
async function sliceGridSheet({
  imagePath,
  outputDir,
  pixelArtDir,
  cols,
  rows,
  contentH,
  prefix,
  threshold = 240,
  minPixels = 100
}) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  if (pixelArtDir && !fs.existsSync(pixelArtDir)) fs.mkdirSync(pixelArtDir, { recursive: true });

  const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const totalH = contentH || H;
  const cw = W / cols;
  const ch = totalH / rows;

  let slicedCount = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = Math.floor(c * cw);
      const y0 = Math.floor(r * ch);
      const x1 = Math.floor((c + 1) * cw);
      const y1 = Math.floor((r + 1) * ch);

      // 1. Find bounding box of non-white pixels inside this cell
      let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
      let count = 0;

      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const idx = (y * W + x) * 4;
          const red = data[idx];
          const green = data[idx + 1];
          const blue = data[idx + 2];
          if (red < threshold || green < threshold || blue < threshold) {
            count++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (count < minPixels || maxX < minX || maxY < minY) continue;

      const itemW = maxX - minX + 1;
      const itemH = maxY - minY + 1;
      const pad = 4;
      const squareDim = Math.max(itemW, itemH) + pad * 2;
      const squareBuf = Buffer.alloc(squareDim * squareDim * 4); // all zeros = transparent

      const offsetX = Math.floor((squareDim - itemW) / 2);
      const offsetY = Math.floor((squareDim - itemH) / 2);

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const srcIdx = (y * W + x) * 4;
          const red = data[srcIdx];
          const green = data[srcIdx + 1];
          const blue = data[srcIdx + 2];

          // If not background, copy pixel
          if (red < threshold || green < threshold || blue < threshold) {
            const tx = offsetX + (x - minX);
            const ty = offsetY + (y - minY);
            const dstIdx = (ty * squareDim + tx) * 4;
            squareBuf[dstIdx] = red;
            squareBuf[dstIdx + 1] = green;
            squareBuf[dstIdx + 2] = blue;
            squareBuf[dstIdx + 3] = 255;
          }
        }
      }

      slicedCount++;
      const itemNum = String(slicedCount).padStart(2, '0');
      const filename32 = `${prefix}_${itemNum}.png`;
      const filename64 = `${prefix}_${itemNum}_64.png`;

      // Export 32x32
      const out32 = path.join(outputDir, filename32);
      await sharp(squareBuf, { raw: { width: squareDim, height: squareDim, channels: 4 } })
        .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(out32);

      // Export 64x64
      const out64 = path.join(outputDir, filename64);
      await sharp(squareBuf, { raw: { width: squareDim, height: squareDim, channels: 4 } })
        .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(out64);

      if (pixelArtDir) {
        fs.copyFileSync(out32, path.join(pixelArtDir, filename32));
      }
    }
  }

  console.log(`[${path.basename(imagePath)}] Sliced ${slicedCount} clean sprites into ${outputDir}`);
  return slicedCount;
}

// Slice Skills from Collection_of_32x32_pixel_art_20261003105406.jpg (6 rows x 3 skill columns)
async function sliceSkillsSheet() {
  const imagePath = 'D:/Game/maps-titles-assets/Collection_of_32x32_pixel_art_20261003105406.jpg';
  const outputDir = 'public/assets/icons/skills/heroic';
  const pixelArtDir = 'D:/Game/Ferramentas para games/projetos_pixel_art/skills_pack';
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  if (!fs.existsSync(pixelArtDir)) fs.mkdirSync(pixelArtDir, { recursive: true });

  const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const totalCols = 5;
  const skillCols = 3; // left 3 cols are skills, right 2 are damage effects
  const rows = 6;
  const cw = W / totalCols;
  const ch = H / rows;

  const skillNames = [
    'guerreiro_corte_arco', 'guerreiro_postura_escudo', 'guerreiro_grito_guerra',
    'mago_bola_fogo', 'mago_cristais_gelo', 'mago_raio_eletrico',
    'arqueiro_chuva_flechas', 'arqueiro_flecha_veneno', 'arqueiro_olho_aguia',
    'barbaro_furia_berserker', 'barbaro_martelo_sismico', 'barbaro_redemoinho',
    'assassino_passo_sombrio', 'assassino_adaga_furtiva', 'assassino_nuvem_veneno',
    'clerigo_luz_sagrada', 'clerigo_halo_solar', 'clerigo_cupula_escudo'
  ];

  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < skillCols; c++) {
      const x0 = Math.floor(c * cw);
      const y0 = Math.floor(r * ch);
      const x1 = Math.floor((c + 1) * cw);
      const y1 = Math.floor((r + 1) * ch);

      let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * W + x) * 4;
          if (data[i] < 240 || data[i+1] < 240 || data[i+2] < 240) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (maxX < minX || maxY < minY) continue;

      const itemW = maxX - minX + 1;
      const itemH = maxY - minY + 1;
      const pad = 4;
      const squareDim = Math.max(itemW, itemH) + pad * 2;
      if (squareDim <= 0) continue;
      const squareBuf = Buffer.alloc(squareDim * squareDim * 4);

      const offsetX = Math.floor((squareDim - itemW) / 2);
      const offsetY = Math.floor((squareDim - itemH) / 2);

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const srcIdx = (y * W + x) * 4;
          const red = data[srcIdx];
          const green = data[srcIdx + 1];
          const blue = data[srcIdx + 2];
          if (red < 240 || green < 240 || blue < 240) {
            const tx = offsetX + (x - minX);
            const ty = offsetY + (y - minY);
            const dstIdx = (ty * squareDim + tx) * 4;
            squareBuf[dstIdx] = red;
            squareBuf[dstIdx + 1] = green;
            squareBuf[dstIdx + 2] = blue;
            squareBuf[dstIdx + 3] = 255;
          }
        }
      }

      const name = skillNames[idx++];
      const out32 = path.join(outputDir, `${name}.png`);
      await sharp(squareBuf, { raw: { width: squareDim, height: squareDim, channels: 4 } })
        .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(out32);
      fs.copyFileSync(out32, path.join(pixelArtDir, `${name}.png`));
    }
  }
  console.log(`Sliced 18 class skill icons into ${outputDir}`);
}

async function run() {
  console.log('=== STARTING MASTER PIXEL-ART SLICE PIPELINE ===\n');

  // 1. Arcos do Arqueiro (20 arcos)
  await sliceGridSheet({
    imagePath: 'D:/Game/maps-titles-assets/novo/Create_bows_for_archer_20261003110919.jpg',
    outputDir: 'public/assets/items/weapons/bows',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/bows_pack',
    cols: 5,
    rows: 4,
    contentH: 576,
    prefix: 'bow_hero'
  });

  // 2. Machados do Bárbaro (20 machados)
  await sliceGridSheet({
    imagePath: 'D:/Game/maps-titles-assets/novo/quero_assets_em_32x32_pixel_20261003111203.jpg',
    outputDir: 'public/assets/items/weapons/axes',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/axes_pack',
    cols: 5,
    rows: 4,
    contentH: 576,
    prefix: 'axe_hero'
  });

  // 3. Maças e Cetros do Clérigo (20 armas)
  await sliceGridSheet({
    imagePath: 'D:/Game/maps-titles-assets/novo/Requesting_cleric_class_20261003111518.jpg',
    outputDir: 'public/assets/items/weapons/maces',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/maces_pack',
    cols: 5,
    rows: 4,
    contentH: 576,
    prefix: 'mace_hero'
  });

  // 4. Adagas e Ferramentas do Assassino (20 itens)
  await sliceGridSheet({
    imagePath: 'D:/Game/maps-titles-assets/novo/agora_quero_assets_em_32x32_20261003111348.jpg',
    outputDir: 'public/assets/items/weapons/daggers',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/daggers_pack',
    cols: 5,
    rows: 4,
    contentH: 576,
    prefix: 'dagger_hero'
  });

  // 5. Cajados e Grimórios do Mago (32 itens)
  await sliceGridSheet({
    imagePath: 'D:/Game/maps-titles-assets/novo/crie_assets_em_32x32_pixel_20261003111720_4.jpg',
    outputDir: 'public/assets/items/weapons/staves',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/staves_pack',
    cols: 8,
    rows: 4,
    contentH: 576,
    prefix: 'mage_asset'
  });

  // 6. Elmos de Cavaleiro & Paladino (20 elmos)
  await sliceGridSheet({
    imagePath: 'D:/Game/maps-titles-assets/A_collection_of_20_unique_20261003104750.jpg',
    outputDir: 'public/assets/items/armor/helms',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/helms_pack',
    cols: 5,
    rows: 4,
    contentH: 710,
    prefix: 'helm_hero'
  });

  // 7. Escudos de Batalha (20 escudos)
  await sliceGridSheet({
    imagePath: 'D:/Game/maps-titles-assets/A_collection_of_20_unique_20261003104758.jpg',
    outputDir: 'public/assets/items/armor/shields',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/shields_pack',
    cols: 5,
    rows: 4,
    contentH: 710,
    prefix: 'shield_hero'
  });

  // 8. Anéis Místicos (20 anéis)
  await sliceGridSheet({
    imagePath: 'D:/Game/maps-titles-assets/A_collection_of_20_unique_20261003104901.jpg',
    outputDir: 'public/assets/items/accessories/rings',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/rings_pack',
    cols: 5,
    rows: 4,
    contentH: 710,
    prefix: 'ring_hero'
  });

  // 9. Amuletos e Colares (20 amuletos)
  await sliceGridSheet({
    imagePath: 'D:/Game/maps-titles-assets/A_collection_of_20_unique_20261003105414.jpg',
    outputDir: 'public/assets/items/accessories/amulets',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/amulets_pack',
    cols: 5,
    rows: 4,
    contentH: 745,
    prefix: 'amulet_hero'
  });

  // 10. Skills de Todas as 6 Classes (18 habilidades)
  await sliceSkillsSheet();

  console.log('\n=== MASTER PIXEL-ART PIPELINE COMPLETED SUCCESSFULLY ===');
}

run().catch(console.error);
