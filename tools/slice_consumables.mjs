import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imagePath = 'D:/Game/maps-titles-assets/novo/crie_assets_de_intens_com_20261003111944_3.jpg';
const outputDir = 'public/assets/items/consumables';
const pixelArtDir = 'D:/Game/Ferramentas para games/projetos_pixel_art/consumables_pack';

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(pixelArtDir)) fs.mkdirSync(pixelArtDir, { recursive: true });

const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const cols = 5;
const cw = W / cols;

const items = [
  { name: 'ore_raw_iron.png', label: 'Minério de Ferro Bruto' },
  { name: 'ingot_gold.png', label: 'Barra de Ouro Refinada' },
  { name: 'gem_diamond.png', label: 'Diamante Arcano Estelar' },
  { name: 'potion_health_heart.png', label: 'Poção de Vida Radiante' },
  { name: 'potion_mana_moon.png', label: 'Poção de Mana da Lua' }
];

for (let c = 0; c < cols; c++) {
  const x0 = Math.floor(c * cw);
  const x1 = Math.floor((c + 1) * cw);

  let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
  for (let y = 0; y < H; y++) {
    for (let x = x0; x < x1; x++) {
      const idx = (y * W + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      // Dark grey background threshold (the background has grey tiles around 50-70)
      if (Math.abs(r - g) > 12 || Math.abs(r - b) > 12 || r > 85 || g > 85 || b > 85) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const itemW = maxX - minX + 1;
  const itemH = maxY - minY + 1;
  const pad = 4;
  const squareDim = Math.max(itemW, itemH) + pad * 2;
  const squareBuf = Buffer.alloc(squareDim * squareDim * 4);

  const offsetX = Math.floor((squareDim - itemW) / 2);
  const offsetY = Math.floor((squareDim - itemH) / 2);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const srcIdx = (y * W + x) * 4;
      const r = data[srcIdx], g = data[srcIdx+1], b = data[srcIdx+2];
      if (Math.abs(r - g) > 12 || Math.abs(r - b) > 12 || r > 85 || g > 85 || b > 85) {
        const tx = offsetX + (x - minX);
        const ty = offsetY + (y - minY);
        const dstIdx = (ty * squareDim + tx) * 4;
        squareBuf[dstIdx] = r;
        squareBuf[dstIdx + 1] = g;
        squareBuf[dstIdx + 2] = b;
        squareBuf[dstIdx + 3] = 255;
      }
    }
  }

  const it = items[c];
  const out32 = path.join(outputDir, it.name);
  await sharp(squareBuf, { raw: { width: squareDim, height: squareDim, channels: 4 } })
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out32);

  const out64 = path.join(outputDir, it.name.replace('.png', '_64.png'));
  await sharp(squareBuf, { raw: { width: squareDim, height: squareDim, channels: 4 } })
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out64);

  fs.copyFileSync(out32, path.join(pixelArtDir, it.name));
  console.log(`Sliced ${it.label} -> ${it.name}`);
}
console.log('Consumables sliced successfully!');
