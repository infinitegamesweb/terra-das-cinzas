import { sliceWhiteBackgroundSheet } from './slice_pack_generic.mjs';
import path from 'path';

const jobs = [
  {
    name: 'Arcos do Arqueiro (20 Arcos)',
    imagePath: 'D:/Game/maps-titles-assets/novo/Create_bows_for_archer_20261003110919.jpg',
    outputDir: 'public/assets/items/weapons/bows',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/bows_pack',
    expectedCols: 5,
    expectedRows: 4,
    prefix: 'bow_hero'
  },
  {
    name: 'Machados do Bárbaro (20 Machados)',
    imagePath: 'D:/Game/maps-titles-assets/novo/quero_assets_em_32x32_pixel_20261003111203.jpg',
    outputDir: 'public/assets/items/weapons/axes',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/axes_pack',
    expectedCols: 5,
    expectedRows: 4,
    prefix: 'axe_hero'
  },
  {
    name: 'Maças e Cetros do Clérigo (20 Armas)',
    imagePath: 'D:/Game/maps-titles-assets/novo/Requesting_cleric_class_20261003111518.jpg',
    outputDir: 'public/assets/items/weapons/maces',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/maces_pack',
    expectedCols: 5,
    expectedRows: 4,
    prefix: 'mace_hero'
  },
  {
    name: 'Adagas e Ferramentas do Assassino (20 Itens)',
    imagePath: 'D:/Game/maps-titles-assets/novo/agora_quero_assets_em_32x32_20261003111348.jpg',
    outputDir: 'public/assets/items/weapons/daggers',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/daggers_pack',
    expectedCols: 5,
    expectedRows: 4,
    prefix: 'dagger_hero'
  },
  {
    name: 'Elmos de Batalha (20 Elmos)',
    imagePath: 'D:/Game/maps-titles-assets/A_collection_of_20_unique_20261003104750.jpg',
    outputDir: 'public/assets/items/armor/helms',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/helms_pack',
    expectedCols: 5,
    expectedRows: 4,
    prefix: 'helm_hero'
  },
  {
    name: 'Escudos e Broquéis (20 Escudos)',
    imagePath: 'D:/Game/maps-titles-assets/A_collection_of_20_unique_20261003104758.jpg',
    outputDir: 'public/assets/items/armor/shields',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/shields_pack',
    expectedCols: 5,
    expectedRows: 4,
    prefix: 'shield_hero'
  },
  {
    name: 'Anéis Místicos (20 Anéis)',
    imagePath: 'D:/Game/maps-titles-assets/A_collection_of_20_unique_20261003104901.jpg',
    outputDir: 'public/assets/items/accessories/rings',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/rings_pack',
    expectedCols: 5,
    expectedRows: 4,
    prefix: 'ring_hero'
  },
  {
    name: 'Amuletos e Colares (20 Amuletos)',
    imagePath: 'D:/Game/maps-titles-assets/A_collection_of_20_unique_20261003105414.jpg',
    outputDir: 'public/assets/items/accessories/amulets',
    pixelArtDir: 'D:/Game/Ferramentas para games/projetos_pixel_art/amulets_pack',
    expectedCols: 5,
    expectedRows: 4,
    prefix: 'amulet_hero'
  }
];

console.log(`Starting master slicing for ${jobs.length} asset packs...\n`);

for (const job of jobs) {
  console.log(`▶ Slicing ${job.name}...`);
  const results = await sliceWhiteBackgroundSheet(job);
  console.log(`✔ Finished ${job.name}: ${results.length} sprites generated.\n`);
}

console.log('All master packs sliced successfully!');
