import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const artifactsDir = 'C:\\Users\\jpdes\\.gemini\\antigravity-ide\\brain\\bbcfac11-5c47-4b49-9ff8-5a747c0ddb69';
const targetDir = 'd:\\Game\\Jogo WEB\\assets\\props';

async function floodFillTransparent(inputPath, outputPath, isCheckerboard = false) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;

  const { data } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const visited = new Uint8Array(width * height);
  const queue = [];

  function isBg(idx) {
    const r = data[idx * 4];
    const g = data[idx * 4 + 1];
    const b = data[idx * 4 + 2];
    if (isCheckerboard) {
      // Checkerboard is either pure white/near-white or light gray (~204)
      const isWhite = r > 230 && g > 230 && b > 230;
      const isGray = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && r > 180 && r < 235;
      return isWhite || isGray;
    } else {
      // Solid white background
      return r > 232 && g > 232 && b > 232;
    }
  }

  // Seed with all borders
  for (let x = 0; x < width; x++) {
    queue.push(x, 0);
    queue.push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    queue.push(0, y);
    queue.push(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    const idx = cy * width + cx;
    if (visited[idx]) continue;
    visited[idx] = 1;

    if (isBg(idx)) {
      data[idx * 4 + 3] = 0; // Set Alpha to 0

      // Neighbors
      if (cx > 0 && !visited[idx - 1]) queue.push(cx - 1, cy);
      if (cx < width - 1 && !visited[idx + 1]) queue.push(cx + 1, cy);
      if (cy > 0 && !visited[idx - width]) queue.push(cx, cy - 1);
      if (cy < height - 1 && !visited[idx + width]) queue.push(cx, cy + 1);
    }
  }

  await sharp(data, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
    .trim({ threshold: 5 })
    .png()
    .toFile(outputPath);

  console.log(`Saved transparent prop: ${outputPath}`);
}

async function main() {
  const bookshelfJpg = path.join(artifactsDir, 'ancient_library_bookshelf_1790956992192.jpg');
  const gargoyleJpg = path.join(artifactsDir, 'stone_monster_statue_1790957042216.jpg');
  const dragonJpg = path.join(artifactsDir, 'stone_dragon_statue_1790957091056.jpg');

  await floodFillTransparent(bookshelfJpg, path.join(targetDir, 'library_bookshelf.png'), true);
  await floodFillTransparent(gargoyleJpg, path.join(targetDir, 'stone_gargoyle.png'), false);
  await floodFillTransparent(dragonJpg, path.join(targetDir, 'stone_dragon_statue.png'), false);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
