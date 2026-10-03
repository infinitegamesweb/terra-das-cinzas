import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const files = [
  'D:/Game/maps-titles-assets/novo/Create_bows_for_archer_20261003110919.jpg',
  'D:/Game/maps-titles-assets/novo/Create_pixel_art_archer_bows_20261003110848.jpg',
  'D:/Game/maps-titles-assets/novo/quero_assets_em_32x32_pixel_20261003111203.jpg',
  'D:/Game/maps-titles-assets/novo/Requesting_cleric_class_20261003111518.jpg',
  'D:/Game/maps-titles-assets/novo/agora_quero_assets_em_32x32_20261003111348.jpg',
  'D:/Game/maps-titles-assets/A_collection_of_20_unique_20261003104750.jpg',
  'D:/Game/maps-titles-assets/A_collection_of_20_unique_20261003104758.jpg',
  'D:/Game/maps-titles-assets/A_collection_of_20_unique_20261003104901.jpg',
  'D:/Game/maps-titles-assets/A_collection_of_20_unique_20261003105414.jpg'
];

for (const f of files) {
  const { data, info } = await sharp(f).raw().toBuffer({ resolveWithObject: true });
  const yHisto = new Array(info.height).fill(0);
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 4;
      if (data[idx] < 240 || data[idx+1] < 240 || data[idx+2] < 240) yHisto[y]++;
    }
  }

  // Find continuous bands along Y separated by empty lines (where yHisto < 20)
  const bands = [];
  let inBand = false, startY = 0;
  for (let y = 0; y < info.height; y++) {
    if (yHisto[y] > 50) {
      if (!inBand) { inBand = true; startY = y; }
    } else {
      if (inBand) { inBand = false; if (y - startY > 15) bands.push({ startY, endY: y - 1 }); }
    }
  }
  if (inBand) bands.push({ startY, endY: info.height - 1 });

  console.log(`[${path.basename(f)}] ${info.width}x${info.height} -> Found ${bands.length} vertical bands (rows):`);
  bands.forEach((b, i) => console.log(`   Row ${i}: y=${b.startY}..${b.endY} (height ${b.endY - b.startY + 1})`));
}
