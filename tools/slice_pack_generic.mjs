import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Universal Slicer for Pixel Art Sheets with white/near-white background
 */
export async function sliceWhiteBackgroundSheet({
  imagePath,
  outputDir,
  pixelArtDir,
  expectedCols,
  expectedRows,
  prefix,
  threshold = 240,
  minPixels = 80
}) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  if (pixelArtDir && !fs.existsSync(pixelArtDir)) fs.mkdirSync(pixelArtDir, { recursive: true });

  const { data, info } = await sharp(imagePath).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;

  // Mark near-white pixels as transparent
  const transparentBuf = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    
    if (r > threshold && g > threshold && b > threshold) {
      transparentBuf[i * 4] = 0;
      transparentBuf[i * 4 + 1] = 0;
      transparentBuf[i * 4 + 2] = 0;
      transparentBuf[i * 4 + 3] = 0;
    } else {
      transparentBuf[i * 4] = r;
      transparentBuf[i * 4 + 1] = g;
      transparentBuf[i * 4 + 2] = b;
      transparentBuf[i * 4 + 3] = 255;
    }
  }

  // Connected component labeling
  const visited = new Uint8Array(W * H);
  const components = [];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = y * W + x;
      if (transparentBuf[idx * 4 + 3] > 0 && !visited[idx]) {
        let minX = x, maxX = x, minY = y, maxY = y;
        let pixelCount = 0;
        const queue = [idx];
        const compPixels = [];
        visited[idx] = 1;

        while (queue.length > 0) {
          const curr = queue.pop();
          compPixels.push(curr);
          const cy = Math.floor(curr / W);
          const cx = curr % W;
          pixelCount++;

          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = cx + dx;
              const ny = cy + dy;
              if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
                const nidx = ny * W + nx;
                if (transparentBuf[nidx * 4 + 3] > 0 && !visited[nidx]) {
                  visited[nidx] = 1;
                  queue.push(nidx);
                }
              }
            }
          }
        }

        // Filter out small artifacts / text at bottom
        if (pixelCount > minPixels) {
          // Exclude bottom title text if any (e.g. text labels at bottom 50px)
          if (maxY > H - 40 && pixelCount < 600) {
            continue;
          }
          components.push({
            minX, maxX, minY, maxY,
            width: maxX - minX + 1,
            height: maxY - minY + 1,
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2,
            pixelCount,
            compPixels
          });
        }
      }
    }
  }

  // Sort components into rows
  components.sort((a, b) => a.centerY - b.centerY);
  const rows = [];
  let currentRow = [];
  const rowThreshold = H / (expectedRows * 1.8);

  for (const comp of components) {
    if (currentRow.length === 0) {
      currentRow.push(comp);
    } else {
      const avgY = currentRow.reduce((sum, c) => sum + c.centerY, 0) / currentRow.length;
      if (Math.abs(comp.centerY - avgY) < rowThreshold) {
        currentRow.push(comp);
      } else {
        rows.push(currentRow);
        currentRow = [comp];
      }
    }
  }
  if (currentRow.length > 0) rows.push(currentRow);

  rows.forEach(r => r.sort((a, b) => a.centerX - b.centerX));

  const items = [];
  rows.forEach(r => items.push(...r));

  console.log(`[${path.basename(imagePath)}] Found ${items.length} items (expected ~${expectedCols * expectedRows}).`);

  const results = [];
  for (let i = 0; i < items.length; i++) {
    const comp = items[i];
    const itemNum = String(i + 1).padStart(2, '0');
    const filename = `${prefix}_${itemNum}.png`;

    const pad = 4;
    const cropW = comp.width + pad * 2;
    const cropH = comp.height + pad * 2;
    const squareDim = Math.max(cropW, cropH) + 6;
    const squareBuf = Buffer.alloc(squareDim * squareDim * 4);

    const offsetX = Math.floor((squareDim - comp.width) / 2);
    const offsetY = Math.floor((squareDim - comp.height) / 2);

    for (const pixelIdx of comp.compPixels) {
      const py = Math.floor(pixelIdx / W);
      const px = pixelIdx % W;
      const targetX = offsetX + (px - comp.minX);
      const targetY = offsetY + (py - comp.minY);

      if (targetX >= 0 && targetX < squareDim && targetY >= 0 && targetY < squareDim) {
        const targetIdx = (targetY * squareDim + targetX) * 4;
        squareBuf[targetIdx] = transparentBuf[pixelIdx * 4];
        squareBuf[targetIdx + 1] = transparentBuf[pixelIdx * 4 + 1];
        squareBuf[targetIdx + 2] = transparentBuf[pixelIdx * 4 + 2];
        squareBuf[targetIdx + 3] = transparentBuf[pixelIdx * 4 + 3];
      }
    }

    // Export 32x32
    const out32 = path.join(outputDir, filename);
    await sharp(squareBuf, { raw: { width: squareDim, height: squareDim, channels: 4 } })
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(out32);

    // Export 64x64
    const out64 = path.join(outputDir, `${prefix}_${itemNum}_64.png`);
    await sharp(squareBuf, { raw: { width: squareDim, height: squareDim, channels: 4 } })
      .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(out64);

    if (pixelArtDir) {
      fs.copyFileSync(out32, path.join(pixelArtDir, filename));
    }

    results.push({ index: i + 1, filename, path: out32 });
  }

  return results;
}
