import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const sourceImage = 'C:/Users/jpdes/.gemini/antigravity-ide/brain/2a307a18-32ad-446f-bcb3-1b1e9b613309/.user_uploaded/media_1791032508981.jpg';
const projectPublicDir = path.resolve('d:/Game/terra-das-cinzas/public/assets');

const dirs = {
  tiles: path.join(projectPublicDir, 'maps', 'tiles-biome', 'swamp'),
  props: path.join(projectPublicDir, 'props', 'swamp'),
  effects: path.join(projectPublicDir, 'effects', 'swamp'),
  pixiTiles: path.resolve('d:/Game/Ferramentas para games/projetos_pixel_art/biomas_tiles/swamp'),
  pixiProps: path.resolve('d:/Game/Ferramentas para games/projetos_pixel_art/cenario_props/swamp')
};

Object.values(dirs).forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Grid measurements detected earlier
const colStarts = [0, 103, 206, 308, 410, 513, 615, 718, 820, 922];
const colWidths = [102, 102, 100, 101, 102, 101, 101, 101, 101, 102];

const rowStarts = [0, 103, 206, 308, 410, 513, 615, 718, 820, 923];
const rowHeights = [102, 102, 101, 101, 102, 101, 102, 101, 101, 101];

async function extractCell(row, col) {
  const left = colStarts[col];
  const top = rowStarts[row];
  const width = colWidths[col];
  const height = rowHeights[row];

  return sharp(sourceImage)
    .extract({ left, top, width, height })
    .toBuffer();
}

async function removeGreyBackground(inputBuffer, threshold = 52) {
  const img = sharp(inputBuffer);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);

  for (let i = 0; i < info.width * info.height; i++) {
    const srcIdx = i * info.channels;
    const r = data[srcIdx];
    const g = data[srcIdx + 1];
    const b = data[srcIdx + 2];

    // Dark grey background keying
    const isGrey = Math.abs(r - g) < 9 && Math.abs(g - b) < 9 && Math.abs(r - b) < 9 && r < threshold && g < threshold && b < threshold;

    out[i * 4] = r;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = b;
    out[i * 4 + 3] = isGrey ? 0 : 255;
  }

  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function removeWaterBackground(inputBuffer) {
  const img = sharp(inputBuffer);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);

  for (let i = 0; i < info.width * info.height; i++) {
    const srcIdx = i * info.channels;
    const r = data[srcIdx];
    const g = data[srcIdx + 1];
    const b = data[srcIdx + 2];

    // Teal water background keying (~ r: 20-45, g: 75-105, b: 70-98)
    const isWater = r > 15 && r < 50 && g > 65 && g < 110 && b > 60 && b < 105 && g >= r * 1.8;

    out[i * 4] = r;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = b;
    out[i * 4 + 3] = isWater ? 0 : 255;
  }

  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function saveFile(buffer, destPath, copyToPixi = '') {
  await sharp(buffer).toFile(destPath);
  if (copyToPixi) {
    await sharp(buffer).toFile(copyToPixi);
  }
}

async function run() {
  console.log('=== PROCESSANDO E EXTRAINDO TILESET DO PÂNTANO ESPECTRAL ===\n');

  // 1. EXTRAÇÃO DE TILES DE TERRENO E ÁGUA
  console.log('1. Extraindo Tiles de Terreno, Lama e Águas do Pântano...');
  const terrainTiles = [
    { name: 'water_calm.png', r: 0, c: 0 },
    { name: 'water_ripples.png', r: 0, c: 1 },
    { name: 'water_deep.png', r: 0, c: 4 },
    { name: 'water_concentric.png', r: 1, c: 1 },
    { name: 'water_currents.png', r: 1, c: 2 },
    { name: 'shore_north.png', r: 0, c: 5 },
    { name: 'shore_south.png', r: 2, c: 7 },
    { name: 'shore_west.png', r: 1, c: 4 },
    { name: 'shore_east.png', r: 2, c: 4 },
    { name: 'shore_corner_nw.png', r: 0, c: 6 },
    { name: 'shore_corner_ne.png', r: 0, c: 7 },
    { name: 'shore_corner_sw.png', r: 2, c: 5 },
    { name: 'shore_corner_se.png', r: 2, c: 6 },
    { name: 'shore_rocky_north.png', r: 0, c: 8 },
    { name: 'shore_rocky_east.png', r: 1, c: 9 },
    { name: 'mud_dry.png', r: 3, c: 0 },
    { name: 'mud_wet.png', r: 3, c: 1 },
    { name: 'mud_path_cross.png', r: 3, c: 3 },
    { name: 'mud_path_vertical.png', r: 3, c: 4 },
    { name: 'mud_path_bend.png', r: 3, c: 5 },
    { name: 'swamp_moss_grass.png', r: 3, c: 6 },
    { name: 'swamp_tall_grass.png', r: 3, c: 7 },
    { name: 'swamp_dense_bush.png', r: 3, c: 8 },
    { name: 'swamp_toxic_puddle.png', r: 3, c: 9 },
    { name: 'mud_puddle_reflection.png', r: 4, c: 0 },
    { name: 'mud_puddle_deep.png', r: 4, c: 1 },
    { name: 'mud_trail_bend.png', r: 4, c: 3 },
    { name: 'swamp_bush_large.png', r: 4, c: 6 },
    { name: 'swamp_bush_round.png', r: 4, c: 7 },
    { name: 'swamp_island_pond.png', r: 4, c: 9 }
  ];

  for (const t of terrainTiles) {
    const buf = await extractCell(t.r, t.c);
    const dest = path.join(dirs.tiles, t.name);
    const pixiDest = path.join(dirs.pixiTiles, t.name);
    await saveFile(buf, dest, pixiDest);
  }
  console.log(`  ✓ ${terrainTiles.length} tiles de terreno e águas extraídos com sucesso!`);

  // 2. EXTRAÇÃO DE PROPS: ÁRVORES DE MANGUE COMPLETAS
  console.log('\n2. Montando Árvores de Mangue com Raízes Entrelaçadas (2 tiles de altura)...');
  const trees = [
    { name: 'mangrove_tree_dense.png', topR: 5, topC: 5, btmR: 6, btmC: 5 },
    { name: 'mangrove_tree_tall.png', topR: 5, topC: 6, btmR: 6, btmC: 6 },
    { name: 'mangrove_tree_broad.png', topR: 5, topC: 7, btmR: 6, btmC: 7 },
    { name: 'swamp_dead_tree_1.png', topR: 5, topC: 8, btmR: 6, btmC: 8 },
    { name: 'swamp_dead_tree_2.png', topR: 5, topC: 9, btmR: 6, btmC: 9 }
  ];

  for (const tr of trees) {
    const topBuf = await extractCell(tr.topR, tr.topC);
    const btmBuf = await extractCell(tr.btmR, tr.btmC);

    const topMeta = await sharp(topBuf).metadata();
    const btmMeta = await sharp(btmBuf).metadata();

    const stitched = await sharp({
      create: {
        width: topMeta.width,
        height: topMeta.height + btmMeta.height,
        channels: 3,
        background: { r: 41, g: 41, b: 41 }
      }
    }).composite([
      { input: topBuf, top: 0, left: 0 },
      { input: btmBuf, top: topMeta.height, left: 0 }
    ]).png().toBuffer();

    const transBuf = await removeGreyBackground(stitched, 52);
    const dest = path.join(dirs.props, tr.name);
    const pixiDest = path.join(dirs.pixiProps, tr.name);
    await saveFile(transBuf, dest, pixiDest);
    console.log(`  ✓ ${tr.name} (${topMeta.width}x${topMeta.height + btmMeta.height})`);
  }

  // Raízes de mangue individuais na água (Linha 6)
  for (let i = 0; i <= 4; i++) {
    const buf = await extractCell(6, i);
    const name = `mangrove_water_roots_${i + 1}.png`;
    await saveFile(buf, path.join(dirs.props, name), path.join(dirs.pixiProps, name));
  }
  console.log('  ✓ 5 raízes submersas em água extraídas');

  // 3. FLORA AQUÁTICA: VITÓRIAS-RÉGIAS E FLORES DE LÓTUS (Linha 7)
  console.log('\n3. Extraindo Flora Aquática (Vitórias-Régias e Flores de Lótus)...');
  const flora = [
    { name: 'water_lily_single.png', r: 7, c: 0 },
    { name: 'water_lily_lotus_flower_1.png', r: 7, c: 1 },
    { name: 'water_lily_lotus_flower_2.png', r: 7, c: 2 },
    { name: 'water_lily_cluster_3.png', r: 7, c: 3 },
    { name: 'water_lily_bud_cluster.png', r: 7, c: 4 },
    { name: 'water_lotus_bloom_single.png', r: 7, c: 5 },
    { name: 'water_lotus_bloom_double.png', r: 7, c: 6 },
    { name: 'water_pads_small.png', r: 7, c: 7 },
    { name: 'duckweed_algae_dense.png', r: 7, c: 8 },
    { name: 'duckweed_algae_scattered.png', r: 7, c: 9 }
  ];

  for (const f of flora) {
    const rawBuf = await extractCell(f.r, f.c);
    const transBuf = await removeWaterBackground(rawBuf);
    await saveFile(transBuf, path.join(dirs.props, f.name), path.join(dirs.pixiProps, f.name));
  }
  console.log(`  ✓ ${flora.length} plantas aquáticas e lótus com transparência alfa`);

  // 4. TABOAS, JUNCOS, TRONCO CAÍDO E ELEMENTOS DE CHÃO (Linhas 8 e 9)
  console.log('\n4. Extraindo Taboas (Cattails), Tronco Caído e Rochas de Pântano...');
  const groundProps = [
    { name: 'cattail_water_1.png', r: 8, c: 4, type: 'water' },
    { name: 'cattail_water_2.png', r: 8, c: 5, type: 'water' },
    { name: 'cattail_water_cluster.png', r: 8, c: 6, type: 'water' },
    { name: 'swamp_reeds_dense.png', r: 8, c: 7, type: 'grey' },
    { name: 'swamp_reeds_water.png', r: 8, c: 8, type: 'water' },
    { name: 'swamp_mossy_log.png', r: 8, c: 9, type: 'grey' },
    { name: 'swamp_fallen_branches.png', r: 9, c: 0, type: 'grey' },
    { name: 'swamp_mud_mound.png', r: 9, c: 1, type: 'grey' },
    { name: 'swamp_mud_water_hole.png', r: 9, c: 2, type: 'grey' },
    { name: 'swamp_mossy_rock.png', r: 9, c: 3, type: 'grey' },
    { name: 'swamp_bush_small_1.png', r: 9, c: 4, type: 'grey' },
    { name: 'swamp_bush_small_2.png', r: 9, c: 5, type: 'grey' },
    { name: 'swamp_bush_flat.png', r: 9, c: 6, type: 'grey' },
    { name: 'swamp_bush_dense.png', r: 9, c: 7, type: 'grey' },
    { name: 'swamp_cattail_tall.png', r: 9, c: 8, type: 'grey' },
    { name: 'swamp_twigs_debris.png', r: 9, c: 9, type: 'grey' }
  ];

  for (const gp of groundProps) {
    const rawBuf = await extractCell(gp.r, gp.c);
    const transBuf = gp.type === 'water'
      ? await removeWaterBackground(rawBuf)
      : await removeGreyBackground(rawBuf, 52);
    await saveFile(transBuf, path.join(dirs.props, gp.name), path.join(dirs.pixiProps, gp.name));
  }
  console.log(`  ✓ ${groundProps.length} adereços de solo e margem processados!`);

  // 5. ANIMAÇÃO DE BOLHAS DE GÁS VENENOSO (Linha 8, cols 0 a 3)
  console.log('\n5. Criando Spritesheet Animado de Bolhas de Gás Tóxico (4 frames)...');
  const bubbleFrames = [];
  for (let c = 0; c < 4; c++) {
    const frameBuf = await extractCell(8, c);
    const transFrame = await removeWaterBackground(frameBuf);
    bubbleFrames.push(transFrame);
  }

  const f0Meta = await sharp(bubbleFrames[0]).metadata();
  const stripWidth = f0Meta.width * 4;
  const stripHeight = f0Meta.height;

  const bubbleStrip = await sharp({
    create: {
      width: stripWidth,
      height: stripHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  }).composite([
    { input: bubbleFrames[0], top: 0, left: 0 },
    { input: bubbleFrames[1], top: 0, left: f0Meta.width },
    { input: bubbleFrames[2], top: 0, left: f0Meta.width * 2 },
    { input: bubbleFrames[3], top: 0, left: f0Meta.width * 3 }
  ]).png().toBuffer();

  const bubbleDest = path.join(dirs.effects, 'swamp_gas_bubbles_strip.png');
  await sharp(bubbleStrip).toFile(bubbleDest);
  console.log(`  ✓ swamp_gas_bubbles_strip.png gerado (${stripWidth}x${stripHeight}, 4 frames de borbulhamento)!`);

  console.log('\n✅ Extração completa do Pântano Espectral concluída com sucesso!');
}

run();
