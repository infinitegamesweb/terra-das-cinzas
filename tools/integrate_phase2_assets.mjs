import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const assetsDir = path.resolve('d:/Game/terra-das-cinzas/public/assets');
const legacyAssetsDir = path.join(assetsDir, 'Legacy Collection', 'Legacy Collection', 'Assets');
const monstersOut = path.join(assetsDir, 'monsters');
const petsOut = path.join(assetsDir, 'characters', 'pets');
const pixiMonstersOut = path.resolve('d:/Game/Ferramentas para games/projetos_pixel_art/monstros');

if (!fs.existsSync(monstersOut)) fs.mkdirSync(monstersOut, { recursive: true });
if (!fs.existsSync(petsOut)) fs.mkdirSync(petsOut, { recursive: true });
if (!fs.existsSync(pixiMonstersOut)) fs.mkdirSync(pixiMonstersOut, { recursive: true });

async function extractMonster(name, srcRel, frameWidth, frameHeight, frameCount) {
  const fullSrc = path.join(legacyAssetsDir, srcRel);
  if (!fs.existsSync(fullSrc)) {
    console.warn(`  ⚠️ Arquivo fonte não encontrado: ${srcRel}`);
    return;
  }

  // 1. Extrair Frame 0 normalizado para ícone e fallback
  const frame0Dest = path.join(monstersOut, `${name}.png`);
  await sharp(fullSrc)
    .extract({ left: 0, top: 0, width: frameWidth, height: frameHeight })
    .resize(220, 220, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(frame0Dest);

  // 2. Copiar strip de animação completo
  const stripDest = path.join(monstersOut, `${name}_strip.png`);
  fs.copyFileSync(fullSrc, stripDest);

  // 3. Copiar para a pasta do PixiEditor
  fs.copyFileSync(stripDest, path.join(pixiMonstersOut, `${name}_strip.png`));
  fs.copyFileSync(frame0Dest, path.join(pixiMonstersOut, `${name}.png`));

  console.log(`  ✓ ${name} (${frameCount} frames, ${frameWidth}x${frameHeight}) integrado com sucesso!`);
}

async function run() {
  console.log('=== INTEGRAÇÃO DOS MONSTROS E COMPANIONS DARK FANTASY ===\n');

  // 1. Sapo Gigante Tóxico do Pântano (Região 2)
  await extractMonster(
    'monster_giant_frog',
    'TinyRPG/Characters/Battle Sprites/Living Pack 1/Frog/Frog-sheet.png',
    63, 68, 6
  );

  // 2. Ent Ancestral Corrompido (Região 1)
  await extractMonster(
    'monster_treant',
    'TinyRPG/Characters/Battle Sprites/Monster Pack Files/spritesheets/Treant.png',
    80, 84, 4
  );

  // 3. Bruxa das Cinzas e Venenos (Região 2)
  await extractMonster(
    'monster_swamp_witch',
    'TinyRPG/Characters/Battle Sprites/Monster Pack Files/spritesheets/witch.png',
    55, 93, 5
  );

  // 4. Lorde Vampiro de Miraluz (Região 4)
  await extractMonster(
    'monster_vampire_lord',
    'TinyRPG/Characters/Battle Sprites/Monster Pack Files/spritesheets/vampire.png',
    121, 110, 4
  );

  // 5. Ogro Colossal das Fendas (Região 3)
  await extractMonster(
    'monster_cave_ogre',
    'TinyRPG/Characters/Battle Sprites/Living Pack 1/Ogre/Ogre-sheet.png',
    128, 128, 5
  );

  // 6. Companion Pet: Corvo das Cinzas (Gothicvania)
  console.log('\nExtraindo Companion Pet: Corvo das Cinzas...');
  const crowSrc = path.join(legacyAssetsDir, 'Gothicvania/Characters/crow/Spritesheets');
  if (fs.existsSync(crowSrc)) {
    const flySrc = path.join(crowSrc, 'crow-fly.png');
    const idleSrc = path.join(crowSrc, 'crow-idle.png');
    
    if (fs.existsSync(flySrc)) {
      fs.copyFileSync(flySrc, path.join(petsOut, 'crow_fly_strip.png'));
      console.log('  ✓ crow_fly_strip.png copiado para assets/characters/pets/');
    }
    if (fs.existsSync(idleSrc)) {
      fs.copyFileSync(idleSrc, path.join(petsOut, 'crow_idle_strip.png'));
      console.log('  ✓ crow_idle_strip.png copiado para assets/characters/pets/');
    }
  }

  console.log('\n✅ Novos assets extraídos e prontos para o motor do jogo!');
}

run();
