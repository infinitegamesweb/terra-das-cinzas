import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = 'D:/Game/maps-titles-assets';
const files = fs.readdirSync(dir);

console.log(`Analyzing ${files.length} files in ${dir}:\n`);

for (const f of files) {
  const fullPath = path.join(dir, f);
  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) continue;
  try {
    const meta = await sharp(fullPath).metadata();
    console.log(`[FILE] ${f}`);
    console.log(`  Size: ${(stat.size / 1024).toFixed(1)} KB | Resolution: ${meta.width}x${meta.height} | Channels: ${meta.channels} | Format: ${meta.format}`);
  } catch (err) {
    console.log(`[FILE] ${f} - Error reading metadata: ${err.message}`);
  }
}
