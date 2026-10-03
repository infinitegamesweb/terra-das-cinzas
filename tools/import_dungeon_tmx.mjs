import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ASSETS_DIR = 'd:/Game/Jogo WEB/assets/dungeon/';
const TMX_PATH = path.join(ASSETS_DIR, 'Dungeon1.tmx');
const SRC_ASSETS_DIR = 'D:/Game/assests e sprites/craftpix-net-169442-free-2d-top-down-pixel-dungeon-asset-pack/Tiled_files/';

async function main() {
  console.log('Loading Dungeon1.tmx...');
  const xml = fs.readFileSync(TMX_PATH, 'utf8');

  // Parse tilesets
  const tilesetRegex = /<tileset firstgid="(\d+)" name="([^"]+)" tilewidth="(\d+)" tileheight="(\d+)"[^>]*>\s*<image source="([^"]+)" width="(\d+)" height="(\d+)"/g;
  let m;
  const tilesets = [];
  while ((m = tilesetRegex.exec(xml)) !== null) {
    const file = m[5];
    const fullPath = path.join(SRC_ASSETS_DIR, file);
    if (fs.existsSync(fullPath)) {
      const { data, info } = await sharp(fullPath).raw().toBuffer({ resolveWithObject: true });
      tilesets.push({
        firstgid: parseInt(m[1]),
        name: m[2],
        file,
        tileW: parseInt(m[3]),
        tileH: parseInt(m[4]),
        imgW: info.width,
        imgH: info.height,
        cols: Math.floor(info.width / parseInt(m[3])),
        data
      });
    }
  }

  // Sort descending by firstgid for easy lookup
  tilesets.sort((a, b) => b.firstgid - a.firstgid);
  console.log('Loaded', tilesets.length, 'tileset images.');

  // Parse Layers and Chunks
  const layerChunkRegex = /<layer\s+id="(\d+)"\s+name="([^"]+)"[^>]*>([\s\S]*?)<\/layer>/g;
  let lMatch;
  const layers = [];
  let minChunkX = Infinity, maxChunkX = -Infinity;
  let minChunkY = Infinity, maxChunkY = -Infinity;

  while ((lMatch = layerChunkRegex.exec(xml)) !== null) {
    const layerId = lMatch[1];
    const layerName = lMatch[2];
    const body = lMatch[3];

    const chunkRegex = /<chunk\s+x="(-?\d+)"\s+y="(-?\d+)"\s+width="(\d+)"\s+height="(\d+)">([\s\S]*?)<\/chunk>/g;
    let cMatch;
    const chunks = [];
    while ((cMatch = chunkRegex.exec(body)) !== null) {
      const cx = parseInt(cMatch[1]);
      const cy = parseInt(cMatch[2]);
      const cw = parseInt(cMatch[3]);
      const ch = parseInt(cMatch[4]);
      const csv = cMatch[5].trim().split(',').map(s => parseInt(s.trim()));

      minChunkX = Math.min(minChunkX, cx);
      maxChunkX = Math.max(maxChunkX, cx + cw);
      minChunkY = Math.min(minChunkY, cy);
      maxChunkY = Math.max(maxChunkY, cy + ch);

      chunks.push({ cx, cy, cw, ch, csv });
    }

    layers.push({ id: layerId, name: layerName, chunks });
  }

  console.log(`Map bounds: X[${minChunkX} to ${maxChunkX}] (width ${maxChunkX - minChunkX} tiles), Y[${minChunkY} to ${maxChunkY}] (height ${maxChunkY - minChunkY} tiles)`);

  const mapTileW = maxChunkX - minChunkX;
  const mapTileH = maxChunkY - minChunkY;
  const pixelW = mapTileW * 16;
  const pixelH = mapTileH * 16;

  console.log(`Raw map pixel size: ${pixelW}x${pixelH}`);

  // Create RGBA pixel buffer for the composite background
  const compositeBuffer = new Uint8ClampedArray(pixelW * pixelH * 4);

  // Function to blit a tile (16x16) onto compositeBuffer
  function drawTile(tileGid, destX, destY) {
    if (tileGid === 0) return;
    const ts = tilesets.find(t => tileGid >= t.firstgid);
    if (!ts) return;

    const localId = tileGid - ts.firstgid;
    const srcTileX = (localId % ts.cols) * 16;
    const srcTileY = Math.floor(localId / ts.cols) * 16;

    if (srcTileX + 16 > ts.imgW || srcTileY + 16 > ts.imgH) return;

    for (let py = 0; py < 16; py++) {
      const sy = srcTileY + py;
      const dy = destY + py;
      if (dy < 0 || dy >= pixelH) continue;

      for (let px = 0; px < 16; px++) {
        const sx = srcTileX + px;
        const dx = destX + px;
        if (dx < 0 || dx >= pixelW) continue;

        const srcIdx = (sy * ts.imgW + sx) * 4;
        const sa = ts.data[srcIdx + 3];
        if (sa === 0) continue;

        const dstIdx = (dy * pixelW + dx) * 4;
        const sr = ts.data[srcIdx];
        const sg = ts.data[srcIdx + 1];
        const sb = ts.data[srcIdx + 2];

        if (sa === 255) {
          compositeBuffer[dstIdx] = sr;
          compositeBuffer[dstIdx + 1] = sg;
          compositeBuffer[dstIdx + 2] = sb;
          compositeBuffer[dstIdx + 3] = 255;
        } else {
          const alpha = sa / 255;
          const invAlpha = 1 - alpha;
          compositeBuffer[dstIdx] = Math.round(sr * alpha + compositeBuffer[dstIdx] * invAlpha);
          compositeBuffer[dstIdx + 1] = Math.round(sg * alpha + compositeBuffer[dstIdx + 1] * invAlpha);
          compositeBuffer[dstIdx + 2] = Math.round(sb * alpha + compositeBuffer[dstIdx + 2] * invAlpha);
          compositeBuffer[dstIdx + 3] = Math.max(compositeBuffer[dstIdx + 3], sa);
        }
      }
    }
  }

  // Draw background layers: Floor, Floor_darker_surface, Floor2_pool, walls_under_water, water_floor3, Walls, Windows
  const bgLayers = [
    'water_floor3', 'walls_under_water', 'water_detailization2', 'water_detailization',
    'Floor2_pool', 'Floor', 'Floor_darker_surface', 'Floor2_darker_surface',
    'Objects_under_wall', 'Walls', 'Windows'
  ];

  const extractedTorches = [];
  const extractedTraps = [];
  const extractedChests = [];

  for (const layerName of bgLayers) {
    const l = layers.find(layer => layer.name === layerName);
    if (!l) continue;
    console.log('Rendering layer:', layerName);
    for (const chunk of l.chunks) {
      for (let ty = 0; ty < chunk.ch; ty++) {
        for (let tx = 0; tx < chunk.cw; tx++) {
          const gid = chunk.csv[ty * chunk.cw + tx];
          if (gid > 0) {
            const worldTileX = (chunk.cx + tx) - minChunkX;
            const worldTileY = (chunk.cy + ty) - minChunkY;
            drawTile(gid, worldTileX * 16, worldTileY * 16);
          }
        }
      }
    }
  }

  // Extract Interactive Layers: Lights, traps, Objects
  const lightsLayer = layers.find(l => l.name === 'Lights');
  if (lightsLayer) {
    for (const chunk of lightsLayer.chunks) {
      for (let ty = 0; ty < chunk.ch; ty++) {
        for (let tx = 0; tx < chunk.cw; tx++) {
          const gid = chunk.csv[ty * chunk.cw + tx];
          if (gid > 0) {
            const worldTileX = (chunk.cx + tx) - minChunkX;
            const worldTileY = (chunk.cy + ty) - minChunkY;
            extractedTorches.push({
              x: worldTileX * 16 + 8,
              y: worldTileY * 16 + 8,
              gid
            });
          }
        }
      }
    }
  }

  const trapsLayer = layers.find(l => l.name === 'traps');
  if (trapsLayer) {
    for (const chunk of trapsLayer.chunks) {
      for (let ty = 0; ty < chunk.ch; ty++) {
        for (let tx = 0; tx < chunk.cw; tx++) {
          const gid = chunk.csv[ty * chunk.cw + tx];
          if (gid > 0) {
            const worldTileX = (chunk.cx + tx) - minChunkX;
            const worldTileY = (chunk.cy + ty) - minChunkY;
            extractedTraps.push({
              x: worldTileX * 16 + 8,
              y: worldTileY * 16 + 8,
              gid
            });
          }
        }
      }
    }
  }

  const objectsLayer = layers.find(l => l.name === 'Objects');
  if (objectsLayer) {
    for (const chunk of objectsLayer.chunks) {
      for (let ty = 0; ty < chunk.ch; ty++) {
        for (let tx = 0; tx < chunk.cw; tx++) {
          const gid = chunk.csv[ty * chunk.cw + tx];
          if (gid > 0) {
            const worldTileX = (chunk.cx + tx) - minChunkX;
            const worldTileY = (chunk.cy + ty) - minChunkY;
            extractedChests.push({
              x: worldTileX * 16 + 8,
              y: worldTileY * 16 + 8,
              gid
            });
          }
        }
      }
    }
  }

  console.log(`Extracted: ${extractedTorches.length} torches, ${extractedTraps.length} spike traps, ${extractedChests.length} objects.`);

  // Save the composited map image at 1920x1440 (or 2048x1536)
  const outPngPath = path.join(ASSETS_DIR, 'dungeon_craftpix_level1.png');
  await sharp(Buffer.from(compositeBuffer), {
    raw: { width: pixelW, height: pixelH, channels: 4 }
  })
  .resize(1920, 1440, { kernel: sharp.kernel.nearest, fit: 'fill' })
  .png({ compressionLevel: 9 })
  .toFile(outPngPath);

  console.log(`Saved battlemap background: ${outPngPath} (1920x1440)`);

  // Scale entities coordinates to 1920x1440
  const scaleX = 1920 / pixelW;
  const scaleY = 1440 / pixelH;

  const dungeonData = {
    torches: extractedTorches.map(t => ({ x: Math.round(t.x * scaleX), y: Math.round(t.y * scaleY) })),
    traps: extractedTraps.map(t => ({ x: Math.round(t.x * scaleX), y: Math.round(t.y * scaleY) })),
    objects: extractedChests.map(o => ({ x: Math.round(o.x * scaleX), y: Math.round(o.y * scaleY) }))
  };

  const jsContent = `// Generated from CraftPix Dungeon1.tmx
window.DungeonCraftPixData = ${JSON.stringify(dungeonData, null, 2)};
`;

  fs.writeFileSync('d:/Game/Jogo WEB/js/dungeon-craftpix-data.js', jsContent, 'utf8');
  console.log('Saved js/dungeon-craftpix-data.js with interactive traps and torches!');
}

main().catch(console.error);
