import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const assetsDir = path.resolve('d:/Game/terra-das-cinzas/public/assets');
const legacyAssetsDir = path.join(assetsDir, 'Legacy Collection', 'Legacy Collection', 'Assets');
const kenneyPngDir = path.join(assetsDir, 'PNG');
const retroFantasyDir = path.join(assetsDir, 'maps', 'retro_fantasy');

async function run() {
  console.log('=== INTEGRAÇÃO DOS NOVOS ASSETS EM TERRA DAS CINZAS ===\n');

  // 1. Organizar Texturas Retrô do Kenney (Pasta PNG -> maps/retro_fantasy)
  if (fs.existsSync(kenneyPngDir)) {
    console.log('1. Organizando texturas medievais de Kenney em public/assets/maps/retro_fantasy/...');
    if (!fs.existsSync(retroFantasyDir)) fs.mkdirSync(retroFantasyDir, { recursive: true });
    
    const files = fs.readdirSync(kenneyPngDir);
    let count = 0;
    files.forEach(f => {
      const src = path.join(kenneyPngDir, f);
      const dest = path.join(retroFantasyDir, f);
      fs.copyFileSync(src, dest);
      count++;
    });
    console.log(`  ✓ ${count} texturas organizadas com sucesso em maps/retro_fantasy/`);

    // Remover pasta PNG duplicada da raiz para manter assets/ limpa
    try {
      fs.rmSync(kenneyPngDir, { recursive: true, force: true });
      console.log('  ✓ Pasta temporária "public/assets/PNG" limpa.');
    } catch (e) {
      console.log('  Nota: limpeza de pasta temporária PNG pendente:', e.message);
    }
  }

  // 2. Extrair Monstros Temáticos de Dark Fantasy (Legacy Collection / Gothicvania)
  console.log('\n2. Extraindo e dimensionando monstros de Dark Fantasy...');
  const monstersOut = path.join(assetsDir, 'monsters');

  // A) Fire Skull (Crânio Ígneo)
  const skullSrc = path.join(legacyAssetsDir, 'Gothicvania/Characters/Fire-Skull-Files/Spritesheets/fire-skull.png');
  if (fs.existsSync(skullSrc)) {
    // Frame 0: 96x112
    await sharp(skullSrc)
      .extract({ left: 0, top: 0, width: 96, height: 112 })
      .resize(220, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(monstersOut, 'monster_fire_skull.png'));
    fs.copyFileSync(skullSrc, path.join(monstersOut, 'monster_fire_skull_strip.png'));
    console.log('  ✓ monster_fire_skull.png (Crânio de Fogo Flamejante)');
  }

  // B) Hell Hound (Cão das Cinzas)
  const houndSrc = path.join(legacyAssetsDir, 'Gothicvania/Characters/Hell-Hound-Files/Spritesheets/hell-hound-idle.png');
  if (fs.existsSync(houndSrc)) {
    // Frame 0: 64x48
    await sharp(houndSrc)
      .extract({ left: 0, top: 0, width: 64, height: 48 })
      .resize(220, 165, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(monstersOut, 'monster_hell_hound.png'));
    fs.copyFileSync(houndSrc, path.join(monstersOut, 'monster_hell_hound_strip.png'));
    console.log('  ✓ monster_hell_hound.png (Cão das Cinzas)');
  }

  // C) Ghost Spectre (Espectro das Brumas)
  const ghostSrc = path.join(legacyAssetsDir, 'Gothicvania/Characters/Ghost-Files/Spritesheets/ghost-Idle.png');
  if (fs.existsSync(ghostSrc)) {
    // Frame 0: 64x80
    await sharp(ghostSrc)
      .extract({ left: 0, top: 0, width: 64, height: 80 })
      .resize(200, 250, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(monstersOut, 'monster_ghost_spectre.png'));
    fs.copyFileSync(ghostSrc, path.join(monstersOut, 'monster_ghost_spectre_strip.png'));
    console.log('  ✓ monster_ghost_spectre.png (Espectro das Brumas)');
  }

  // D) Flying Eye Demon (Olho Voador Demoníaco)
  const eyeSrc = path.join(legacyAssetsDir, 'Gothicvania/Characters/flying-eye-demon/Spritesheet.png');
  if (fs.existsSync(eyeSrc)) {
    // Frame 0: 48x48
    await sharp(eyeSrc)
      .extract({ left: 0, top: 0, width: 48, height: 48 })
      .resize(220, 220, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(monstersOut, 'monster_flying_demon.png'));
    fs.copyFileSync(eyeSrc, path.join(monstersOut, 'monster_flying_demon_strip.png'));
    console.log('  ✓ monster_flying_demon.png (Demônio Alado do Olho)');
  }

  // E) Reaper Death (Ceifador de Almas)
  const deathSrc = path.join(legacyAssetsDir, 'Gothicvania/Characters/death/Spritesheets/death-lamp-walk.png');
  if (fs.existsSync(deathSrc)) {
    // Frame 0: 48x48
    await sharp(deathSrc)
      .extract({ left: 0, top: 0, width: 48, height: 48 })
      .resize(220, 220, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(monstersOut, 'monster_reaper_death.png'));
    fs.copyFileSync(deathSrc, path.join(monstersOut, 'monster_reaper_death_strip.png'));
    console.log('  ✓ monster_reaper_death.png (Ceifador de Almas)');
  }

  // F) Normalizar Stone Golem para escala de mob
  const golemSvg = path.join(assetsDir, 'monsters/stone_golem_idle.svg');
  if (fs.existsSync(golemSvg)) {
    await sharp(golemSvg)
      .resize(230, 230)
      .png()
      .toFile(path.join(monstersOut, 'stone_golem_idle.png'));
    console.log('  ✓ stone_golem_idle.png (Golem de Pedra dimensionado)');
  }

  // 3. Extrair Efeitos Visuais de Combate e Magia (Explosions and Magic)
  console.log('\n3. Extraindo Efeitos Visuais de Combate e Partículas...');
  const fxOut = path.join(assetsDir, 'effects');
  if (!fs.existsSync(fxOut)) fs.mkdirSync(fxOut, { recursive: true });

  const deathFxSrc = path.join(legacyAssetsDir, 'Explosions and Magic/EnemyDeath/spritesheet.png');
  if (fs.existsSync(deathFxSrc)) {
    fs.copyFileSync(deathFxSrc, path.join(fxOut, 'fx_enemy_death_strip.png'));
    console.log('  ✓ fx_enemy_death_strip.png (Morte de Inimigo Animada)');
  }

  const hitFxSrc = path.join(legacyAssetsDir, 'Explosions and Magic/Hit/hit.png');
  if (fs.existsSync(hitFxSrc)) {
    fs.copyFileSync(hitFxSrc, path.join(fxOut, 'fx_hit_spark_strip.png'));
    console.log('  ✓ fx_hit_spark_strip.png (Impacto de Golpe e Faíscas)');
  }

  const explFxSrc = path.join(legacyAssetsDir, 'Explosions and Magic/Ground Explosion/spritesheet/explosion-animation.png');
  if (fs.existsSync(explFxSrc)) {
    fs.copyFileSync(explFxSrc, path.join(fxOut, 'fx_ground_explosion_strip.png'));
    console.log('  ✓ fx_ground_explosion_strip.png (Explosão e Tremor de Solo)');
  }

  // 4. Extrair Ambientes e Props Top-Down (TinyRPG)
  console.log('\n4. Integrando Tilesets e Objetos Top-Down (TinyRPG)...');
  const dungeonPropsOut = path.join(assetsDir, 'props', 'dungeon');
  const tilesOut = path.join(assetsDir, 'maps', 'tiles');
  if (!fs.existsSync(dungeonPropsOut)) fs.mkdirSync(dungeonPropsOut, { recursive: true });
  if (!fs.existsSync(tilesOut)) fs.mkdirSync(tilesOut, { recursive: true });

  const crawlerObjSrc = path.join(legacyAssetsDir, 'TinyRPG/Environments/single-dungeon-crawler-objects/PNG/dungeon-crawler-objects-transparent.png');
  if (fs.existsSync(crawlerObjSrc)) {
    fs.copyFileSync(crawlerObjSrc, path.join(dungeonPropsOut, 'crawler_objects.png'));
    console.log('  ✓ crawler_objects.png (Itens e Props de Dungeon Crawler)');
  }

  const forestTileSrc = path.join(legacyAssetsDir, 'TinyRPG/Environments/Top-Down-Forest/PNG/top-down-forest-tileset.png');
  if (fs.existsSync(forestTileSrc)) {
    fs.copyFileSync(forestTileSrc, path.join(tilesOut, 'top_down_forest_tileset.png'));
    console.log('  ✓ top_down_forest_tileset.png (Tileset de Floresta Top-Down)');
  }

  const townTileSrc = path.join(legacyAssetsDir, 'TinyRPG/Environments/Top-Down-Town/PNG/top-down-town-tileset.png');
  if (fs.existsSync(townTileSrc)) {
    fs.copyFileSync(townTileSrc, path.join(tilesOut, 'top_down_town_tileset.png'));
    console.log('  ✓ top_down_town_tileset.png (Tileset de Vila e Construções Top-Down)');
  }

  console.log('\n✅ Todos os assets cabíveis foram integrados com sucesso!');
}

run();
