import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = 'D:/Game/maps-titles-assets/novo';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

console.log(`Analyzing ${files.length} files in ${dir}:\n`);

const previewDir = 'tools/previews_novo';
if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true });

for (const f of files) {
  const fullPath = path.join(dir, f);
  const stat = fs.statSync(fullPath);
  try {
    const meta = await sharp(fullPath).metadata();
    console.log(`[FILE] ${f}`);
    console.log(`  Size: ${(stat.size / 1024).toFixed(1)} KB | Resolution: ${meta.width}x${meta.height} | Channels: ${meta.channels} | Format: ${meta.format}`);
    
    // Save preview
    const outPath = path.join(previewDir, f.replace('.jpg', '.png'));
    await sharp(fullPath).resize(256, 256, { fit: 'inside' }).png().toFile(outPath);
  } catch (err) {
    console.log(`[FILE] ${f} - Error: ${err.message}`);
  }
}
