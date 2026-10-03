import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const rootGameDir = 'd:/Game';
const sourcePacksDir = path.join(rootGameDir, 'assests e sprites');
const sourceMapsDir = path.join(rootGameDir, 'Assetsmaps');
const projectPublicDir = path.resolve('d:/Game/terra-das-cinzas/public/assets');

// Diretórios de destino
const dirs = {
  nature: path.join(projectPublicDir, 'props', 'nature'),
  ruins: path.join(projectPublicDir, 'props', 'ruins'),
  decor: path.join(projectPublicDir, 'props', 'decor'),
  dungeon: path.join(projectPublicDir, 'props', 'dungeon'),
  effects: path.join(projectPublicDir, 'effects'),
  tilesBiome: path.join(projectPublicDir, 'maps', 'tiles-biome'),
  forestTiles: path.join(projectPublicDir, 'maps', 'tiles-biome', 'forest'),
  snowTiles: path.join(projectPublicDir, 'maps', 'tiles-biome', 'snow'),
  sandTiles: path.join(projectPublicDir, 'maps', 'tiles-biome', 'sand'),
  lavaTiles: path.join(projectPublicDir, 'maps', 'tiles-biome', 'lava'),
  skills: path.join(projectPublicDir, 'icons', 'skills'),
  weapons: path.join(projectPublicDir, 'items', 'weapons')
};

Object.values(dirs).forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

async function extractCrop(srcPath, bbox, destPath) {
  try {
    await sharp(srcPath)
      .extract({ left: bbox.x, top: bbox.y, width: bbox.w, height: bbox.h })
      .toFile(destPath);
    console.log(`  ✓ Gerado: ${path.basename(destPath)} (${bbox.w}x${bbox.h})`);
  } catch (err) {
    console.error(`  ❌ Erro ao extrair ${path.basename(destPath)}:`, err.message);
  }
}

async function run() {
  console.log('=== PROCESSANDO FERRAMENTAS E ASSET PACKS DA PASTA GAME ===\n');

  // 1. Extração de Natureza (TX Plant.png)
  console.log('1. Extraindo Vegetação e Árvores do Bosque (TX Plant.png)...');
  const plantSrc = path.join(sourcePacksDir, 'Pixel Art Top Down - Basic v1.2.3/Texture/TX Plant.png');
  if (fs.existsSync(plantSrc)) {
    const plants = [
      { name: 'tree_oak_giant.png', x: 24, y: 14, w: 113, h: 139 },
      { name: 'tree_pine_tall.png', x: 161, y: 17, w: 95, h: 136 },
      { name: 'tree_elm_medium.png', x: 295, y: 31, w: 79, h: 120 },
      { name: 'bush_leafy_large.png', x: 216, y: 185, w: 47, h: 42 },
      { name: 'bush_round_medium.png', x: 282, y: 186, w: 39, h: 45 },
      { name: 'bush_small.png', x: 156, y: 190, w: 38, h: 32 },
      { name: 'bush_mossy.png', x: 346, y: 190, w: 40, h: 35 },
      { name: 'mushrooms_cluster.png', x: 98, y: 195, w: 27, h: 25 },
      { name: 'wild_flowers.png', x: 38, y: 198, w: 22, h: 19 }
    ];
    for (const p of plants) {
      await extractCrop(plantSrc, p, path.join(dirs.nature, p.name));
    }
  }

  // 2. Extração de Estruturas de Ruínas (TX Struct.png)
  console.log('\n2. Extraindo Pilares e Arcos de Miraluz (TX Struct.png)...');
  const structSrc = path.join(sourcePacksDir, 'Pixel Art Top Down - Basic v1.2.3/Texture/TX Struct.png');
  if (fs.existsSync(structSrc)) {
    const structs = [
      { name: 'ruin_column_pillar_1.png', x: 32, y: 32, w: 64, h: 96 },
      { name: 'ruin_column_pillar_2.png', x: 128, y: 32, w: 65, h: 96 },
      { name: 'ruin_column_broken.png', x: 224, y: 32, w: 65, h: 96 },
      { name: 'stone_altar_pedestal.png', x: 416, y: 128, w: 64, h: 64 },
      { name: 'stone_archway_ruin_1.png', x: 48, y: 288, w: 90, h: 96 },
      { name: 'stone_archway_ruin_2.png', x: 176, y: 288, w: 90, h: 96 },
      { name: 'stone_monument_gate.png', x: 56, y: 384, w: 88, h: 96 }
    ];
    for (const s of structs) {
      await extractCrop(structSrc, s, path.join(dirs.ruins, s.name));
    }
  }

  // 3. Extração de Props de Cenário (TX Props.png)
  console.log('\n3. Extraindo Props e Mobiliário (TX Props.png)...');
  const propSrc = path.join(sourcePacksDir, 'Pixel Art Top Down - Basic v1.2.3/Texture/TX Props.png');
  if (fs.existsSync(propSrc)) {
    const propsList = [
      { name: 'camp_lantern_pole.png', x: 387, y: 2, w: 27, h: 61 },
      { name: 'wooden_signpost.png', x: 227, y: 9, w: 26, h: 52 },
      { name: 'tombstone_cross.png', x: 32, y: 18, w: 32, h: 46 },
      { name: 'tombstone_slate.png', x: 160, y: 18, w: 32, h: 46 },
      { name: 'stone_well.png', x: 292, y: 19, w: 56, h: 41 },
      { name: 'guard_watchpost_pole.png', x: 445, y: 21, w: 37, h: 72 },
      { name: 'barrel_stack_oak.png', x: 96, y: 30, w: 32, h: 31 },
      { name: 'crate_stack_pine.png', x: 96, y: 76, w: 32, h: 49 },
      { name: 'wooden_bench.png', x: 163, y: 86, w: 26, h: 39 },
      { name: 'fence_gate_closed.png', x: 288, y: 87, w: 64, h: 36 }
    ];
    for (const pr of propsList) {
      await extractCrop(propSrc, pr, path.join(dirs.decor, pr.name));
    }
  }

  // 4. Extração de Objetos de Dungeon (CraftPix Objects.png)
  console.log('\n4. Extraindo Objetos de Masmorra (CraftPix Objects.png)...');
  const objSrc = path.join(sourcePacksDir, 'craftpix-net-169442-free-2d-top-down-pixel-dungeon-asset-pack/PNG/Objects.png');
  if (fs.existsSync(objSrc)) {
    const dungeonObjs = [
      { name: 'dungeon_wall_torch_unlit.png', x: 14, y: 0, w: 32, h: 52 },
      { name: 'dungeon_wall_torch_gold.png', x: 59, y: 0, w: 35, h: 52 },
      { name: 'dungeon_urn_clay.png', x: 135, y: 4, w: 19, h: 18 },
      { name: 'dungeon_barrel_iron.png', x: 258, y: 10, w: 25, h: 30 },
      { name: 'dungeon_chest_iron_closed.png', x: 290, y: 5, w: 28, h: 36 },
      { name: 'dungeon_chest_iron_open.png', x: 320, y: 32, w: 29, h: 32 },
      { name: 'dungeon_lever_active.png', x: 167, y: 8, w: 19, h: 14 },
      { name: 'dungeon_lever_inactive.png', x: 163, y: 36, w: 29, h: 22 },
      { name: 'dungeon_skull_bones.png', x: 197, y: 38, w: 22, h: 17 }
    ];
    for (const d of dungeonObjs) {
      await extractCrop(objSrc, d, path.join(dirs.dungeon, d.name));
    }
  }

  // 5. Copiar Animações de Efeitos (Fogo, Tocha, Armadilhas)
  console.log('\n5. Copiando Spritesheets de Animação de Efeitos e Armadilhas...');
  const craftPngDir = path.join(sourcePacksDir, 'craftpix-net-169442-free-2d-top-down-pixel-dungeon-asset-pack/PNG');
  const animCopies = [
    { src: 'fire_animation.png', dest: path.join(dirs.effects, 'torch_fire_animated_strip.png') },
    { src: 'trap_animation.png', dest: path.join(dirs.dungeon, 'spike_trap_animated_strip.png') },
    { src: 'doors_lever_chest_animation.png', dest: path.join(dirs.dungeon, 'doors_chest_animated_strip.png') }
  ];
  for (const ac of animCopies) {
    const s = path.join(craftPngDir, ac.src);
    if (fs.existsSync(s)) {
      fs.copyFileSync(s, ac.dest);
      console.log(`  ✓ Copiado: ${path.basename(ac.dest)}`);
    }
  }

  // 6. Copiar e Integrar Tilesets dos 4 Biomas (Assetsmaps/72ppi/Corrigidos_32x32)
  console.log('\n6. Integrando Spritesheets e Tiles dos 4 Biomas (Assetsmaps)...');
  const corrigidosDir = path.join(sourceMapsDir, '72ppi/Corrigidos_32x32');
  if (fs.existsSync(corrigidosDir)) {
    // Spritesheets principais dos 4 biomas
    const sheets = [
      { src: 'spritesheet_01_grama_floresta_caminhos.png', dest: 'spritesheet_forest_paths_32.png' },
      { src: 'spritesheet_02_neve.png', dest: 'spritesheet_snow_32.png' },
      { src: 'spritesheet_03_areia.png', dest: 'spritesheet_sand_desert_32.png' },
      { src: 'spritesheet_04_rocha_lava.png', dest: 'spritesheet_lava_rock_32.png' }
    ];
    for (const sh of sheets) {
      const sp = path.join(corrigidosDir, sh.src);
      if (fs.existsSync(sp)) {
        fs.copyFileSync(sp, path.join(dirs.tilesBiome, sh.dest));
        console.log(`  ✓ Bioma Spritesheet: ${sh.dest}`);
      }
    }

    // Tiles individuais categorizados por bioma
    const copyTileFolder = (srcSub, destDir, prefix) => {
      const fullSrc = path.join(corrigidosDir, srcSub);
      if (fs.existsSync(fullSrc)) {
        const files = fs.readdirSync(fullSrc).filter(f => f.endsWith('.png'));
        files.forEach(f => {
          fs.copyFileSync(path.join(fullSrc, f), path.join(destDir, `${prefix}_${f}`));
        });
        console.log(`  ✓ ${files.length} tiles copiados para ${path.basename(destDir)}/`);
      }
    };

    copyTileFolder('01_grama_floresta_caminhos', dirs.forestTiles, 'tile_forest');
    copyTileFolder('02_neve', dirs.snowTiles, 'tile_snow');
    copyTileFolder('03_areia', dirs.sandTiles, 'tile_sand');
    copyTileFolder('04_rocha_lava', dirs.lavaTiles, 'tile_lava');
  }

  // 7. Sincronizar Todos os 50 Ícones de Habilidades Undead
  console.log('\n7. Sincronizando Coleção de 50 Ícones de Habilidade Undead...');
  const skillSrcDir = path.join(sourcePacksDir, 'Free-Undead-Skill-Pixel-Art-Icons/PNG');
  if (fs.existsSync(skillSrcDir)) {
    const sFiles = fs.readdirSync(skillSrcDir).filter(f => f.endsWith('.png'));
    sFiles.forEach(f => {
      fs.copyFileSync(path.join(skillSrcDir, f), path.join(dirs.skills, f));
    });
    console.log(`  ✓ ${sFiles.length} ícones de habilidade sincronizados em public/assets/icons/skills/`);
  }
  const bonusSkillDir = path.join(sourcePacksDir, 'Free-Undead-Skill-Pixel-Art-Icons/Bonus/PNG');
  if (fs.existsSync(bonusSkillDir)) {
    const bFiles = fs.readdirSync(bonusSkillDir).filter(f => f.endsWith('.png'));
    bFiles.forEach(f => {
      fs.copyFileSync(path.join(bonusSkillDir, f), path.join(dirs.skills, f));
    });
    console.log(`  ✓ ${bFiles.length} ícones bônus sincronizados em public/assets/icons/skills/`);
  }

  console.log('\n✅ Extração e organização de assets concluídas com sucesso!');
}

run();
