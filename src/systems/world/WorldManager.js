// src/systems/world/WorldManager.js
  const TILE_SOURCES = {
    grass: ['grass-forest', 'grass-leaves', 'grass-flowers']
  };
  const tiles = {};
  const seamlessTiles = {};
  const biomeTiles = {};
  const mirroredBiomeTiles = {};
  const BIOME_TILE_FILES = {
    grass: 'grass-base-32',
    snow: 'snow-base-32',
    sand: 'sand-base-32',
    lava: 'lava-rock-base-32'
  };
  const BIOME_FALLBACKS = {
    forest: 'grass',
    swamp: 'grass',
    mountain: 'snow',
    fortress: 'snow',
    eclipse: 'lava',
    cavern: 'lava',
    iron: 'lava',
    abyss: 'lava',
    crypt: 'lava',
    tower: 'lava',
    ash: 'lava',
    chaos: 'lava',
    ghosttown: 'lava'
  };
  let terrainCanvas = null;
  let terrainRegionId = 0;
  let terrainSize = '';
  const navigationCache = new Map();

  const files = [...TILE_SOURCES.grass];
  files.forEach((name) => {
    const image = new Image();
    image.onload = () => {
      seamlessTiles[name] = makeSeamlessTile(image);
      terrainCanvas = null;
    };
    image.src = `assets/maps/tiles-clean/${name}.png`;
    tiles[name] = image;
  });

  Object.entries(BIOME_TILE_FILES).forEach(([biome, name]) => {
    const image = new Image();
    image.onload = () => {
      mirroredBiomeTiles[biome] = makeMirroredTile(image);
      terrainCanvas = null;
    };
    image.src = `assets/maps/tiles-biome/${name}.png`;
    biomeTiles[biome] = image;
  });

  const swampTiles = {};
  const SWAMP_TILE_FILES = [
    'water_calm', 'water_ripples', 'water_deep', 'water_currents', 'water_concentric',
    'mud_wet', 'mud_dry', 'mud_puddle_deep', 'mud_puddle_reflection',
    'mud_path_vertical', 'mud_path_bend', 'mud_trail_bend',
    'swamp_moss_grass', 'swamp_tall_grass', 'swamp_island_pond', 'swamp_toxic_puddle',
    'shore_north', 'shore_south', 'shore_east', 'shore_west',
    'shore_corner_nw', 'shore_corner_ne', 'shore_corner_sw', 'shore_corner_se'
  ];
  SWAMP_TILE_FILES.forEach((name) => {
    const image = new Image();
    image.onload = () => {
      terrainCanvas = null;
    };
    image.src = `assets/maps/tiles-biome/swamp/${name}.png`;
    swampTiles[name] = image;
  });

  const realmArt = {};
  const requestedRealmArt = new Set();
  function requestRealmArt(id) {
    if (id < 2 || id > 29 || requestedRealmArt.has(id)) return realmArt[id] || null;
    requestedRealmArt.add(id);
    const image = new Image();
    image.onload = () => {
      if (terrainRegionId === id) terrainCanvas = null;
    };
    image.onerror = () => { realmArt[id] = null; };
    realmArt[id] = image;
    image.src = `assets/maps/realms/realm-${String(id).padStart(2, '0')}.png`;
    return image;
  }

  function hash(x, y, seed = 0) {
    let n = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  }

  function ready(image) {
    return image && image.complete && image.naturalWidth > 0;
  }

  function makeSeamlessTile(image) {
    const inset = 4;
    const size = Math.min(image.naturalWidth, image.naturalHeight) - inset * 2;
    if (size <= 0) return image;
    const source = document.createElement('canvas');
    source.width = size;
    source.height = size;
    const sourceCtx = source.getContext('2d');
    sourceCtx.imageSmoothingEnabled = false;
    sourceCtx.drawImage(image, inset, inset, size, size, 0, 0, size, size);

    const tile = document.createElement('canvas');
    tile.width = size * 2;
    tile.height = size * 2;
    const tileCtx = tile.getContext('2d');
    tileCtx.imageSmoothingEnabled = false;
    tileCtx.drawImage(source, 0, 0);
    tileCtx.save();
    tileCtx.translate(size * 2, 0);
    tileCtx.scale(-1, 1);
    tileCtx.drawImage(source, 0, 0);
    tileCtx.restore();
    tileCtx.save();
    tileCtx.translate(0, size * 2);
    tileCtx.scale(1, -1);
    tileCtx.drawImage(source, 0, 0);
    tileCtx.restore();
    tileCtx.save();
    tileCtx.translate(size * 2, size * 2);
    tileCtx.scale(-1, -1);
    tileCtx.drawImage(source, 0, 0);
    tileCtx.restore();
    return tile;
  }

  function makeMirroredTile(image) {
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const tile = document.createElement('canvas');
    tile.width = width * 2;
    tile.height = height * 2;
    const tileCtx = tile.getContext('2d');
    tileCtx.imageSmoothingEnabled = false;
    tileCtx.drawImage(image, 0, 0);
    tileCtx.save();
    tileCtx.translate(width * 2, 0);
    tileCtx.scale(-1, 1);
    tileCtx.drawImage(image, 0, 0);
    tileCtx.restore();
    tileCtx.save();
    tileCtx.translate(0, height * 2);
    tileCtx.scale(1, -1);
    tileCtx.drawImage(image, 0, 0);
    tileCtx.restore();
    tileCtx.save();
    tileCtx.translate(width * 2, height * 2);
    tileCtx.scale(-1, -1);
    tileCtx.drawImage(image, 0, 0);
    tileCtx.restore();
    return tile;
  }

  function drawBiomeTexture(ctx, biome, width, height, alpha = 0.12) {
    const image = biomeTiles[biome];
    if (!ready(image)) return;
    const pattern = ctx.createPattern(mirroredBiomeTiles[biome] || image, 'repeat');
    if (!pattern) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  function drawBiomePatch(ctx, biome, points, width, height, alpha = 0.6) {
    const image = biomeTiles[biome];
    if (!ready(image) || !points.length) return;
    const pattern = ctx.createPattern(mirroredBiomeTiles[biome] || image, 'repeat');
    if (!pattern) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.clip();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  function drawForest(ctx, region, width, height) {
    ctx.imageSmoothingEnabled = false;
    const base = tiles[TILE_SOURCES.grass[0]];
    if (!ready(base)) return false;
    const pattern = ctx.createPattern(seamlessTiles[TILE_SOURCES.grass[0]] || base, 'repeat');
    if (!pattern) return false;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
    drawBiomeTexture(ctx, 'grass', width, height, 0.1);
    ctx.fillStyle = 'rgba(22, 53, 31, 0.2)';
    ctx.fillRect(0, 0, width, height);

    // Leaf and flower textures are blended as irregular clearings, never as square tile cells.
    for (let i = 0; i < 86; i++) {
      const image = tiles[TILE_SOURCES.grass[1 + (i % 2)]];
      if (!ready(image)) return false;
      const x = hash(i, region.id, 307) * width;
      const y = hash(i, region.id, 311) * height;
      const radiusX = 32 + hash(i, region.id, 313) * 72;
      const radiusY = 20 + hash(i, region.id, 317) * 46;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x, y, radiusX, radiusY, hash(i, region.id, 331) * Math.PI, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = i % 4 === 0 ? 0.52 : 0.28;
      ctx.drawImage(image, x - radiusX, y - radiusY, radiusX * 2, radiusY * 2);
      ctx.restore();
    }

    const road = new Path2D();
    road.moveTo(930, -50);
    road.bezierCurveTo(1010, 170, 870, 325, 944, 520);
    road.bezierCurveTo(1018, 700, 885, 878, 968, 1070);
    road.bezierCurveTo(1018, 1214, 900, 1355, 956, height + 50);
    road.moveTo(-50, 735);
    road.bezierCurveTo(310, 686, 620, 780, 910, 738);
    road.bezierCurveTo(1100, 710, 1430, 766, width + 50, 728);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(10, 15, 10, 0.5)';
    ctx.lineWidth = 94;
    ctx.stroke(road);
    ctx.strokeStyle = '#65583e';
    ctx.lineWidth = 82;
    ctx.stroke(road);
    ctx.strokeStyle = region.path;
    ctx.lineWidth = 72;
    ctx.stroke(road);
    ctx.strokeStyle = 'rgba(226, 206, 151, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke(road);
    ctx.restore();

    for (let i = 0; i < 850; i++) {
      const x = hash(i, region.id, 337) * width;
      const y = hash(i, region.id, 347) * height;
      const size = 1 + hash(i, region.id, 349) * 2;
      ctx.globalAlpha = 0.1 + hash(i, region.id, 353) * 0.15;
      ctx.fillStyle = i % 5 === 0 ? '#c5b78a' : '#081b10';
      ctx.beginPath();
      ctx.ellipse(x, y, size * 1.5, size * 0.55, hash(i, region.id, 359) * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return true;
  }

  function drawSwampBiome(ctx, region, width, height) {
    ctx.imageSmoothingEnabled = false;

    // 1. Deep Murky Swamp Water Foundation
    const waterBase = swampTiles.water_deep;
    if (ready(waterBase)) {
      const waterPattern = ctx.createPattern(waterBase, 'repeat');
      if (waterPattern) {
        ctx.fillStyle = waterPattern;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = '#0a1d1b';
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      ctx.fillStyle = '#0a1d1b';
      ctx.fillRect(0, 0, width, height);
    }

    // Blend calm water currents across lagoons
    if (ready(swampTiles.water_calm)) {
      const calmPattern = ctx.createPattern(swampTiles.water_calm, 'repeat');
      if (calmPattern) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = calmPattern;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    }

    // Water current swirls and ripples across open channels
    for (let i = 0; i < 48; i++) {
      const rx = hash(i, region.id, 51) * width;
      const ry = hash(i, region.id, 67) * height;
      const rTile = i % 2 === 0 ? swampTiles.water_ripples : swampTiles.water_currents;
      if (ready(rTile)) {
        ctx.save();
        ctx.globalAlpha = 0.28 + hash(i, region.id, 79) * 0.22;
        ctx.drawImage(rTile, rx - 50, ry - 50, 101, 101);
        ctx.restore();
      }
    }

    // 2. Large Organic Wet Peat & Mud Islands (The wetland landmasses)
    const landmasses = [
      // NW: Margem Afogada & western marsh
      { cx: 380, cy: 370, rx: 340, ry: 280, seed: 101 },
      // NE: Juncal Nebuloso & eastern marsh
      { cx: 1510, cy: 380, rx: 330, ry: 270, seed: 202 },
      // SW: Vila Submersa ruins bank
      { cx: 390, cy: 1060, rx: 340, ry: 290, seed: 303 },
      // SE: Altar das Vozes mound
      { cx: 1480, cy: 1070, rx: 340, ry: 280, seed: 404 },
      // Center: Trail crossing isthmus & sunken wetlands
      { cx: 960, cy: 710, rx: 290, ry: 240, seed: 505 },
      // North bridgehead
      { cx: 960, cy: 210, rx: 220, ry: 190, seed: 606 },
      // West-Central bog mound
      { cx: 620, cy: 690, rx: 210, ry: 170, seed: 707 },
      // East-Central bog mound
      { cx: 1300, cy: 720, rx: 210, ry: 180, seed: 808 }
    ];

    // Prepare Mud and Moss Patterns
    const mudPat = ready(swampTiles.mud_wet) ? ctx.createPattern(swampTiles.mud_wet, 'repeat') : null;
    const mossPat = ready(swampTiles.swamp_moss_grass) ? ctx.createPattern(swampTiles.swamp_moss_grass, 'repeat') : null;

    landmasses.forEach((lm) => {
      ctx.save();
      ctx.beginPath();
      const points = 16;
      for (let p = 0; p < points; p++) {
        const a = (p / points) * Math.PI * 2;
        const distMod = 0.82 + hash(p, lm.seed, 11) * 0.36;
        const px = lm.cx + Math.cos(a) * (lm.rx * distMod);
        const py = lm.cy + Math.sin(a) * (lm.ry * distMod);
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Outer Shore Soft Transition into Murky Water
      ctx.shadowColor = 'rgba(8, 24, 20, 0.85)';
      ctx.shadowBlur = 18;

      // Base Wet Mud Earth
      ctx.fillStyle = mudPat || '#182b24';
      ctx.fill();

      // Inner Higher Ground: Lush Swamp Moss & Grass
      ctx.clip();
      if (mossPat) {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(lm.cx, lm.cy, lm.rx * 0.72, lm.ry * 0.68, 0, 0, Math.PI * 2);
        ctx.globalAlpha = 0.78;
        ctx.fillStyle = mossPat;
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    });

    // 3. Shoreline detail tiles framing the water/mud boundaries
    landmasses.forEach((lm, lIdx) => {
      const perimeterPoints = [
        { dx: 0, dy: -lm.ry * 0.9, tile: swampTiles.shore_north },
        { dx: 0, dy: lm.ry * 0.88, tile: swampTiles.shore_south },
        { dx: lm.rx * 0.9, dy: 0, tile: swampTiles.shore_east },
        { dx: -lm.rx * 0.9, dy: 0, tile: swampTiles.shore_west },
        { dx: -lm.rx * 0.7, dy: -lm.ry * 0.7, tile: swampTiles.shore_corner_nw },
        { dx: lm.rx * 0.7, dy: -lm.ry * 0.7, tile: swampTiles.shore_corner_ne },
        { dx: -lm.rx * 0.7, dy: lm.ry * 0.7, tile: swampTiles.shore_corner_sw },
        { dx: lm.rx * 0.7, dy: lm.ry * 0.7, tile: swampTiles.shore_corner_se }
      ];
      perimeterPoints.forEach((pt, pIdx) => {
        if (ready(pt.tile)) {
          ctx.save();
          ctx.globalAlpha = 0.58;
          ctx.drawImage(pt.tile, lm.cx + pt.dx - 50, lm.cy + pt.dy - 50, 101, 101);
          ctx.restore();
        }
      });
    });

    // 4. Toxic Caustic Pools & Deep Mud Puddles
    const pools = [
      { x: 340, y: 1120, tile: swampTiles.swamp_toxic_puddle, glow: '#34d399', rad: 52 },
      { x: 1540, y: 1140, tile: swampTiles.swamp_toxic_puddle, glow: '#2dd4bf', rad: 54 },
      { x: 420, y: 310, tile: swampTiles.mud_puddle_reflection, glow: '#38bdf8', rad: 46 },
      { x: 1440, y: 320, tile: swampTiles.mud_puddle_deep, glow: null, rad: 48 },
      { x: 720, y: 640, tile: swampTiles.swamp_island_pond, glow: '#10b981', rad: 56 },
      { x: 1220, y: 820, tile: swampTiles.mud_puddle_deep, glow: null, rad: 44 }
    ];
    pools.forEach((pool) => {
      if (ready(pool.tile)) {
        ctx.save();
        ctx.globalAlpha = 0.88;
        ctx.drawImage(pool.tile, pool.x - 50, pool.y - 50, 101, 101);
        ctx.restore();
      }
      if (pool.glow) {
        const pGlow = ctx.createRadialGradient(pool.x, pool.y, 8, pool.x, pool.y, pool.rad);
        pGlow.addColorStop(0, pool.glow + '44');
        pGlow.addColorStop(0.6, pool.glow + '14');
        pGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = pGlow;
        ctx.beginPath();
        ctx.arc(pool.x, pool.y, pool.rad, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 5. Sunken Mud Trails & Bog Wooden Boardwalks
    const road = new Path2D();
    road.moveTo(960, -50);
    road.bezierCurveTo(990, 200, 930, 360, 960, 520);
    road.bezierCurveTo(985, 680, 935, 840, 960, 1040);
    road.bezierCurveTo(975, 1160, 945, 1280, 960, height + 50);
    road.moveTo(-50, 720);
    road.bezierCurveTo(340, 690, 620, 750, 960, 715);
    road.bezierCurveTo(1240, 685, 1550, 745, width + 50, 720);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Dark waterlogged mud border
    ctx.strokeStyle = 'rgba(7, 18, 15, 0.72)';
    ctx.lineWidth = 92;
    ctx.stroke(road);

    // Mud path body
    ctx.strokeStyle = '#273831';
    ctx.lineWidth = 76;
    ctx.stroke(road);

    // Wet mud ruts
    ctx.strokeStyle = '#18241f';
    ctx.lineWidth = 48;
    ctx.stroke(road);

    // Peat grass fringes
    ctx.strokeStyle = 'rgba(121, 211, 189, 0.16)';
    ctx.lineWidth = 2;
    ctx.stroke(road);
    ctx.restore();

    // Wooden plank boardwalks over deep water crossings (e.g. crossing y: 440 to 600 and y: 840 to 980)
    const drawBogPlanks = (startX, startY, endX, endY, count) => {
      ctx.save();
      for (let i = 0; i < count; i++) {
        const ratio = i / (count - 1);
        const bx = startX + (endX - startX) * ratio;
        const by = startY + (endY - startY) * ratio;
        const w = 48 + (i % 3) * 4;
        const h = 7;
        // Shadow under plank in murky water
        ctx.fillStyle = 'rgba(4, 10, 8, 0.65)';
        ctx.fillRect(bx - w / 2, by - h / 2 + 3, w, h);
        // Wooden plank
        ctx.fillStyle = i % 2 === 0 ? '#433425' : '#382a1d';
        ctx.fillRect(bx - w / 2, by - h / 2, w, h);
        // Wet moss stain on wood
        ctx.fillStyle = 'rgba(46, 125, 85, 0.35)';
        ctx.fillRect(bx - w / 2 + 4, by - h / 2 + 1, 12, 3);
        // Iron nails
        ctx.fillStyle = '#1e1a16';
        ctx.fillRect(bx - w / 2 + 3, by - 1, 2, 2);
        ctx.fillRect(bx + w / 2 - 5, by - 1, 2, 2);
      }
      ctx.restore();
    };
    drawBogPlanks(955, 430, 960, 580, 11);
    drawBogPlanks(955, 860, 960, 1010, 11);
    drawBogPlanks(730, 715, 850, 715, 8);
    drawBogPlanks(1070, 715, 1190, 715, 8);

    // 6. Olho do Pântano (Southern Sunken Abyssal Vortex - Boss Arena)
    const eyeX = 960;
    const eyeY = 1260;
    const eyeRadius = 150;
    ctx.save();

    // Deep abyss swirling gradient
    const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 12, eyeX, eyeY, eyeRadius);
    eyeGrad.addColorStop(0, '#030a09');
    eyeGrad.addColorStop(0.55, '#071d1a');
    eyeGrad.addColorStop(0.85, '#0d2d28');
    eyeGrad.addColorStop(1, 'rgba(10, 34, 30, 0)');
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Concentric swirling ripples
    if (ready(swampTiles.water_concentric)) {
      ctx.globalAlpha = 0.65;
      ctx.drawImage(swampTiles.water_concentric, eyeX - 75, eyeY - 75, 150, 150);
    } else {
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.28)';
      ctx.lineWidth = 1.8;
      for (let r = 30; r <= 130; r += 26) {
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Spectral Cyan Abyss Halo
    const eyeHalo = ctx.createRadialGradient(eyeX, eyeY, 4, eyeX, eyeY, 78);
    eyeHalo.addColorStop(0, 'rgba(45, 212, 191, 0.35)');
    eyeHalo.addColorStop(0.6, 'rgba(13, 148, 136, 0.12)');
    eyeHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = eyeHalo;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 78, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 7. Ambient Swamp Spores, Algae Flecks & Phosphor Dust
    for (let i = 0; i < 750; i++) {
      const fx = hash(i, region.id, 411) * width;
      const fy = hash(i, region.id, 419) * height;
      const size = 1 + hash(i, region.id, 421) * 2;
      ctx.globalAlpha = 0.12 + hash(i, region.id, 431) * 0.25;
      ctx.fillStyle = i % 8 === 0 ? '#34d399' : i % 5 === 0 ? '#2dd4bf' : i % 2 === 0 ? '#1b4138' : '#081715';
      ctx.beginPath();
      ctx.ellipse(fx, fy, size * 1.4, size * 0.6, hash(i, region.id, 433) * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 8. Atmospheric Swamp Miasma Vignette
    const swampMiasma = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.25, width / 2, height / 2, Math.max(width, height) * 0.76);
    swampMiasma.addColorStop(0, 'rgba(0, 0, 0, 0)');
    swampMiasma.addColorStop(0.6, 'rgba(7, 24, 22, 0.22)');
    swampMiasma.addColorStop(1, 'rgba(4, 14, 13, 0.58)');
    ctx.fillStyle = swampMiasma;
    ctx.fillRect(0, 0, width, height);

    return true;
  }

  function drawOtherBiome(ctx, region, width, height) {
    // Organic color fields replace the old 48px checkerboard fallback.
    ctx.fillStyle = region.bg;
    ctx.fillRect(0, 0, width, height);
    const wash = ctx.createLinearGradient(0, 0, width, height);
    wash.addColorStop(0, region.tree + '55');
    wash.addColorStop(0.52, region.bg + '00');
    wash.addColorStop(1, region.accent + '18');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);

    if (region.generatedMap) {
      if (region.biome === 'swamp') {
        drawSwampBiome(ctx, region, width, height);
      } else {
        const fallbackBiome = BIOME_TILE_FILES[region.biome]
          ? region.biome
          : BIOME_FALLBACKS[region.biome];
        if (fallbackBiome) drawBiomeTexture(ctx, fallbackBiome, width, height, 0.16);
      }
    } else {
      if (region.id === 2) drawBiomeTexture(ctx, 'grass', width, height, 0.08);
      if (region.id === 3) {
        drawBiomeTexture(ctx, 'lava', width, height, 0.2);
        drawBiomePatch(ctx, 'snow', [
          [80, 150], [210, 108], [360, 125], [470, 185], [540, 282],
          [472, 355], [330, 372], [205, 331], [123, 254]
        ], width, height, 0.58);
        drawBiomePatch(ctx, 'sand', [
          [1190, 1000], [1322, 944], [1510, 966], [1685, 1034],
          [1790, 1148], [1722, 1290], [1535, 1372], [1332, 1324], [1210, 1190]
        ], width, height, 0.34);
      }
      if (region.id === 4) drawBiomeTexture(ctx, 'lava', width, height, 0.07);
      if (region.id === 5) drawBiomeTexture(ctx, 'lava', width, height, 0.16);
    }

    for (let i = 0; i < 460; i++) {
      const x = hash(i, region.id, 19) * width;
      const y = hash(i, region.id, 47) * height;
      const radius = 10 + hash(i, region.id, 83) * 48;
      ctx.globalAlpha = 0.035 + hash(i, region.id, 131) * 0.075;
      ctx.fillStyle = i % 5 === 0 ? region.accent : i % 2 ? region.tree : region.bg;
      ctx.beginPath();
      ctx.ellipse(x, y, radius * (0.7 + hash(i, region.id, 101) * 0.8), radius * 0.35, hash(i, region.id, 151) * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const offset = (region.id - 3) * 18;
    const road = new Path2D();
    road.moveTo(936 + offset, -50);
    road.bezierCurveTo(1000 + offset, 190, 875 + offset, 330, 952 + offset, 520);
    road.bezierCurveTo(1030 + offset, 720, 874 + offset, 875, 954 + offset, 1085);
    road.bezierCurveTo(1004 + offset, 1230, 884 + offset, 1350, 955 + offset, height + 50);
    road.moveTo(-50, 730 + offset * 0.4);
    road.bezierCurveTo(350, 690 + offset * 0.4, 595, 775 + offset * 0.4, 940, 730 + offset * 0.4);
    road.bezierCurveTo(1220, 690 + offset * 0.4, 1540, 770 + offset * 0.4, width + 50, 725 + offset * 0.4);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(12, 13, 11, 0.3)';
    ctx.lineWidth = 100;
    ctx.stroke(road);
    ctx.strokeStyle = region.path;
    ctx.lineWidth = 82;
    ctx.stroke(road);
    ctx.strokeStyle = region.accent;
    ctx.globalAlpha = 0.13;
    ctx.lineWidth = 2;
    ctx.stroke(road);
    ctx.restore();

    // Fine ground flecks and short grass strokes, seeded so the map never shimmers.
    for (let i = 0; i < 1150; i++) {
      const x = hash(i, region.id, 211) * width;
      const y = hash(i, region.id, 223) * height;
      const size = 1 + hash(i, region.id, 227) * 2.2;
      ctx.globalAlpha = 0.12 + hash(i, region.id, 229) * 0.22;
      ctx.fillStyle = i % 7 === 0 ? region.accent : i % 2 ? region.tree : '#d8d0a0';
      ctx.beginPath();
      ctx.ellipse(x, y, size * 1.5, size * 0.55, hash(i, region.id, 233) * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const edge = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.28, width / 2, height / 2, Math.max(width, height) * 0.75);
    edge.addColorStop(0, 'rgba(0, 0, 0, 0)');
    edge.addColorStop(1, 'rgba(4, 8, 5, 0.22)');
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, width, height);
  }

    const ruinsFloorImg = new Image();
  ruinsFloorImg.onload = () => {
    terrainCanvas = null;
  };
  ruinsFloorImg.src = 'assets/maps/castle_ruins_floor.png';

  function drawCastleRuins(ctx, region, width, height) {
    ctx.imageSmoothingEnabled = false;

    // 1. Dark stone foundation base
    ctx.fillStyle = '#120f18';
    ctx.fillRect(0, 0, width, height);

    // 2. Ruined flagstone pattern
    if (ready(ruinsFloorImg)) {
      const pat = ctx.createPattern(ruinsFloorImg, 'repeat');
      if (pat) {
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      ctx.fillStyle = '#1c1926';
      ctx.fillRect(0, 0, width, height);
      for (let r = 0; r < 40; r++) {
        for (let c = 0; c < 50; c++) {
          const x = c * 40 + (r % 2 ? 20 : 0);
          const y = r * 38;
          ctx.fillStyle = (r + c) % 3 === 0 ? '#262232' : (r + c) % 2 === 0 ? '#221e2d' : '#1e1a28';
          ctx.fillRect(x + 1, y + 1, 38, 36);
          ctx.fillStyle = '#0f0d14';
          ctx.fillRect(x, y + 36, 40, 2);
        }
      }
    }

    // Atmospheric ruined castle tint & vignetting
    const castleAmbient = ctx.createRadialGradient(960, 750, 150, 960, 750, 1200);
    castleAmbient.addColorStop(0, 'rgba(251, 146, 60, 0.08)');
    castleAmbient.addColorStop(0.5, 'rgba(30, 24, 42, 0.35)');
    castleAmbient.addColorStop(1, 'rgba(6, 4, 10, 0.88)');
    ctx.fillStyle = castleAmbient;
    ctx.fillRect(0, 0, width, height);

    // 3. Castle Outer Curtain Wall & Battlements (Ruins)
    const wallCol = '#25212e';
    const wallBorder = '#453c52';
    const wallHighlight = '#5c506d';

    ctx.save();
    ctx.fillStyle = wallCol;
    ctx.strokeStyle = wallBorder;
    ctx.lineWidth = 4;
    // North Wall with broken gate opening
    ctx.fillRect(180, 140, 600, 56);
    ctx.strokeRect(180, 140, 600, 56);
    ctx.fillRect(1140, 140, 600, 56);
    ctx.strokeRect(1140, 140, 600, 56);

    // West Wall
    ctx.fillRect(180, 140, 54, 1200);
    ctx.strokeRect(180, 140, 54, 1200);

    // East Wall
    ctx.fillRect(1686, 140, 54, 1200);
    ctx.strokeRect(1686, 140, 54, 1200);

    // South Wall with archway portal opening
    ctx.fillRect(180, 1284, 680, 56);
    ctx.strokeRect(180, 1284, 680, 56);
    ctx.fillRect(1060, 1284, 680, 56);
    ctx.strokeRect(1060, 1284, 680, 56);

    // Crenelations on walls
    ctx.fillStyle = wallHighlight;
    for (let wx = 180; wx < 780; wx += 40) ctx.fillRect(wx, 130, 22, 14);
    for (let wx = 1140; wx < 1740; wx += 40) ctx.fillRect(wx, 130, 22, 14);
    for (let wy = 140; wy < 1280; wy += 44) {
      ctx.fillRect(170, wy, 14, 22);
      ctx.fillRect(1736, wy, 14, 22);
    }
    for (let wx = 180; wx < 860; wx += 40) ctx.fillRect(wx, 1336, 22, 14);
    for (let wx = 1060; wx < 1740; wx += 40) ctx.fillRect(wx, 1336, 22, 14);

    // Corner Bastion Tower Foundations (Clean Weathered Granite Platforms)
    [[220, 180], [1700, 180], [220, 1300], [1700, 1300]].forEach(([bx, by]) => {
      ctx.fillStyle = '#1c1824';
      ctx.beginPath();
      ctx.arc(bx, by, 62, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#473d57';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#262031';
      ctx.beginPath();
      ctx.arc(bx, by, 50, 0, Math.PI * 2);
      ctx.fill();
    });

    // ─── BIBLIOTECA DE LIVROS NAS PAREDES (Wall-Embedded Library Grimoire Alcoves) ───
    // Recessed gothic stone library bookshelves built into the West Wall (y: 580 to 880)
    for (let by = 580; by <= 880; by += 75) {
      // Bookshelf stone arch niche
      ctx.fillStyle = '#14101c';
      ctx.beginPath();
      ctx.roundRect(192, by - 26, 42, 54, 4);
      ctx.fill();
      ctx.strokeStyle = '#383046';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Wooden shelves
      ctx.fillStyle = '#3a2318';
      ctx.fillRect(194, by - 12, 38, 3);
      ctx.fillRect(194, by + 4, 38, 3);
      ctx.fillRect(194, by + 20, 38, 3);

      // Colorful grimoire spines on shelves
      const bookColors = ['#991b1b', '#1e40af', '#166534', '#854d0e', '#6b21a8', '#0e7490', '#c2410c', '#374151'];
      for (let shelf = 0; shelf < 3; shelf++) {
        const sy = by - 22 + shelf * 16;
        for (let b = 0; b < 6; b++) {
          const col = bookColors[(by + shelf * 3 + b) % bookColors.length];
          const bw = 5 + (b % 2);
          const bh = 10 + (b % 3);
          ctx.fillStyle = col;
          ctx.fillRect(196 + b * 6, sy + (12 - bh), bw, bh);
          if (b % 2 === 0) {
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(196 + b * 6 + 1, sy + 4, bw - 2, 1.5);
          }
        }
      }

      // Small candle sconce above each alcove
      ctx.fillStyle = '#221b28';
      ctx.fillRect(235, by - 6, 6, 12);
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(240, by - 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // North-West wall library bookcases (x: 270 to 510, y: 142)
    for (let bx = 270; bx <= 510; bx += 80) {
      ctx.fillStyle = '#14101c';
      ctx.beginPath();
      ctx.roundRect(bx - 32, 146, 64, 44, 4);
      ctx.fill();
      ctx.strokeStyle = '#383046';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Shelves
      ctx.fillStyle = '#3a2318';
      ctx.fillRect(bx - 30, 160, 60, 3);
      ctx.fillRect(bx - 30, 176, 60, 3);

      // Books
      const bookCols = ['#854d0e', '#991b1b', '#1e3a8a', '#065f46', '#581c87', '#9a3412'];
      for (let row = 0; row < 2; row++) {
        const ry = 149 + row * 16;
        for (let k = 0; k < 9; k++) {
          ctx.fillStyle = bookCols[(bx + row * 4 + k) % bookCols.length];
          ctx.fillRect(bx - 28 + k * 6, ry + 2, 5, 9);
        }
      }
    }

    // ─── ESTÁTUAS DE MONSTROS EM PEDRA NAS PAREDES (Gargoyles & Stone Dragons) ───
    const drawStoneMonsterRelief = (sx, sy, isDragon = false) => {
      ctx.save();
      // Stone pedestal niche
      ctx.fillStyle = '#17141f';
      ctx.beginPath();
      ctx.arc(sx, sy, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#473d56';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Chiseled granite pedestal base
      ctx.fillStyle = '#272132';
      ctx.fillRect(sx - 16, sy - 4, 32, 12);
      ctx.fillStyle = '#352d43';
      ctx.fillRect(sx - 14, sy - 12, 28, 8);

      // Monster Body (Granite / Dark Stone)
      ctx.fillStyle = '#3f374e';
      ctx.beginPath();
      ctx.arc(sx, sy - 18, 11, 0, Math.PI * 2);
      ctx.fill();

      // Monster Horns & Wings
      ctx.strokeStyle = '#5b506e';
      ctx.lineWidth = 2.5;
      if (isDragon) {
        // Dragon Horns
        ctx.beginPath();
        ctx.moveTo(sx - 6, sy - 26); ctx.lineTo(sx - 12, sy - 34);
        ctx.moveTo(sx + 6, sy - 26); ctx.lineTo(sx + 12, sy - 34);
        ctx.stroke();
        // Dragon Spikes
        ctx.beginPath();
        ctx.moveTo(sx, sy - 28); ctx.lineTo(sx, sy - 35);
        ctx.stroke();
        // Stone Wings
        ctx.fillStyle = '#2f283c';
        ctx.beginPath();
        ctx.moveTo(sx - 8, sy - 18); ctx.lineTo(sx - 24, sy - 30); ctx.lineTo(sx - 18, sy - 14);
        ctx.moveTo(sx + 8, sy - 18); ctx.lineTo(sx + 24, sy - 30); ctx.lineTo(sx + 18, sy - 14);
        ctx.fill();
      } else {
        // Gargoyle Bat Wings
        ctx.fillStyle = '#2d2639';
        ctx.beginPath();
        ctx.moveTo(sx - 6, sy - 18); ctx.lineTo(sx - 22, sy - 28); ctx.lineTo(sx - 16, sy - 12);
        ctx.moveTo(sx + 6, sy - 18); ctx.lineTo(sx + 22, sy - 28); ctx.lineTo(sx + 16, sy - 12);
        ctx.fill();
        // Gargoyle Ears/Horns
        ctx.beginPath();
        ctx.moveTo(sx - 5, sy - 24); ctx.lineTo(sx - 10, sy - 31);
        ctx.moveTo(sx + 5, sy - 24); ctx.lineTo(sx + 10, sy - 31);
        ctx.stroke();
      }

      // Glowing Ember Eyes
      ctx.fillStyle = isDragon ? '#f59e0b' : '#ef4444';
      ctx.fillRect(sx - 4, sy - 20, 2, 2);
      ctx.fillRect(sx + 2, sy - 20, 2, 2);

      // Weathered moss streaks
      ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
      ctx.fillRect(sx - 10, sy + 2, 8, 3);
      ctx.fillRect(sx + 4, sy - 8, 6, 2);
      ctx.restore();
    };

    // North Wall Monster Statues (Flanking northern breach)
    drawStoneMonsterRelief(760, 168, false);
    drawStoneMonsterRelief(1160, 168, true);

    // South Wall Monster Statues (Flanking grand exit gate)
    drawStoneMonsterRelief(840, 1312, true);
    drawStoneMonsterRelief(1080, 1312, true);

    // East Wall Gargoyle perches
    drawStoneMonsterRelief(1712, 540, false);
    drawStoneMonsterRelief(1712, 900, false);

    ctx.restore();

    // 4. Tapete Medieval Gótico (Cruciforme: Cinza Escuro com Detalhes Geométricos Brancos)
    ctx.save();

    const cx = 960;
    const cy = 720;
    const rwHalf = 52; // Metade da largura dos braços do tapete (largura total 104px)

    // ── A. Sombra Orgânica do Tapete sobre o Piso de Pedra ──
    ctx.fillStyle = 'rgba(8, 6, 12, 0.52)';
    ctx.fillRect(cx - rwHalf - 5, 196, (rwHalf * 2) + 10, 1260 - 196 + 5);
    ctx.fillRect(236, cy - rwHalf - 5, 1684 - 236 + 5, (rwHalf * 2) + 10);
    // Sombra do medalhão central
    ctx.beginPath();
    ctx.arc(cx, cy, 116, 0, Math.PI * 2);
    ctx.fill();

    // ── B. Tecido Base do Tapete em Cinza Escuro ──
    const carpetBaseCol = '#22242c';

    ctx.fillStyle = carpetBaseCol;
    // Braço Vertical (Norte a Sul)
    ctx.fillRect(cx - rwHalf, 196, rwHalf * 2, 1260 - 196);
    // Braço Horizontal (Oeste a Leste)
    ctx.fillRect(236, cy - rwHalf, 1684 - 236, rwHalf * 2);

    // Medalhão Central Octogonal
    const drawOctagon = (x, y, r, fill, stroke, strokeW) => {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + Math.PI / 8;
        const px = x + Math.cos(a) * r;
        const py = y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = strokeW; ctx.stroke(); }
    };

    drawOctagon(cx, cy, 114, '#242730', '#363a47', 2);

    // ── C. Bordas Brancas e Acabamentos Geométricos do Tapete ──
    const whiteBorder = '#f8fafc';
    const whiteMuted = 'rgba(241, 245, 249, 0.65)';
    const whiteDetail = 'rgba(255, 255, 255, 0.88)';
    const whiteFaint = 'rgba(255, 255, 255, 0.35)';

    // Bordas duplas externas dos braços
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = whiteBorder;

    // Linhas externas do braço vertical
    ctx.beginPath(); ctx.moveTo(cx - rwHalf, 196); ctx.lineTo(cx - rwHalf, cy - 90); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - rwHalf, cy + 90); ctx.lineTo(cx - rwHalf, 1260); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + rwHalf, 196); ctx.lineTo(cx + rwHalf, cy - 90); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + rwHalf, cy + 90); ctx.lineTo(cx + rwHalf, 1260); ctx.stroke();

    // Linhas externas do braço horizontal
    ctx.beginPath(); ctx.moveTo(236, cy - rwHalf); ctx.lineTo(cx - 90, cy - rwHalf); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 90, cy - rwHalf); ctx.lineTo(1684, cy - rwHalf); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(236, cy + rwHalf); ctx.lineTo(cx - 90, cy + rwHalf); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 90, cy + rwHalf); ctx.lineTo(1684, cy + rwHalf); ctx.stroke();

    // Fitas internas de moldura branca
    ctx.lineWidth = 1;
    ctx.strokeStyle = whiteMuted;
    const inOff = 6;
    ctx.beginPath(); ctx.moveTo(cx - rwHalf + inOff, 202); ctx.lineTo(cx - rwHalf + inOff, cy - 84); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - rwHalf + inOff, cy + 84); ctx.lineTo(cx - rwHalf + inOff, 1254); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + rwHalf - inOff, 202); ctx.lineTo(cx + rwHalf - inOff, cy - 84); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + rwHalf - inOff, cy + 84); ctx.lineTo(cx + rwHalf - inOff, 1254); ctx.stroke();

    ctx.beginPath(); ctx.moveTo(242, cy - rwHalf + inOff); ctx.lineTo(cx - 84, cy - rwHalf + inOff); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 84, cy - rwHalf + inOff); ctx.lineTo(1678, cy - rwHalf + inOff); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(242, cy + rwHalf - inOff); ctx.lineTo(cx - 84, cy + rwHalf - inOff); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 84, cy + rwHalf - inOff); ctx.lineTo(1678, cy + rwHalf - inOff); ctx.stroke();

    // ── D. Detalhes Geométricos Brancos: Dentes / Triângulos de Borda (Sawtooth Border) ──
    const drawSawtoothV = (startX, startY, endY, facing) => {
      ctx.fillStyle = whiteMuted;
      for (let y = startY; y < endY - 12; y += 14) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + facing * 5, y + 7);
        ctx.lineTo(startX, y + 14);
        ctx.fill();
      }
    };
    const drawSawtoothH = (startY, startX, endX, facing) => {
      ctx.fillStyle = whiteMuted;
      for (let x = startX; x < endX - 12; x += 14) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x + 7, startY + facing * 5);
        ctx.lineTo(x + 14, startY);
        ctx.fill();
      }
    };

    drawSawtoothV(cx - rwHalf + 7, 204, cy - 88, 1);
    drawSawtoothV(cx + rwHalf - 7, 204, cy - 88, -1);
    drawSawtoothV(cx - rwHalf + 7, cy + 88, 1250, 1);
    drawSawtoothV(cx + rwHalf - 7, cy + 88, 1250, -1);

    drawSawtoothH(cy - rwHalf + 7, 244, cx - 88, 1);
    drawSawtoothH(cy + rwHalf - 7, 244, cx - 88, -1);
    drawSawtoothH(cy - rwHalf + 7, cx + 88, 1674, 1);
    drawSawtoothH(cy + rwHalf - 7, cx + 88, 1674, -1);

    // ── E. Formas Geométricas Centrais dos Braços: Losangos & Estrelas Brancas ──
    const drawDiamondMotif = (x, y) => {
      ctx.save();
      // Losango externo branco elegante (linha fina, não preenchido)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x, y - 18);
      ctx.lineTo(x + 18, y);
      ctx.lineTo(x, y + 18);
      ctx.lineTo(x - 18, y);
      ctx.closePath();
      ctx.stroke();

      // Losango interno fino
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x + 10, y);
      ctx.lineTo(x, y + 10);
      ctx.lineTo(x - 10, y);
      ctx.closePath();
      ctx.stroke();

      // Ponto central branco
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 4 Pontos discretos nos vértices
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      const pts = [[x, y - 18], [x + 18, y], [x, y + 18], [x - 18, y]];
      for (const [px, py] of pts) {
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const drawInterDiamondKnot = (x, y) => {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5);
      ctx.moveTo(x + 5, y - 5); ctx.lineTo(x - 5, y + 5);
      ctx.stroke();
      ctx.restore();
    };

    // Linha de centro branca conectando os losangos
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = whiteFaint;
    ctx.beginPath(); ctx.moveTo(cx, 210); ctx.lineTo(cx, cy - 90); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + 90); ctx.lineTo(cx, 1246); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(250, cy); ctx.lineTo(cx - 90, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 90, cy); ctx.lineTo(1670, cy); ctx.stroke();

    // Braço Norte: Losangos espaçados
    for (let y = 240; y <= cy - 100; y += 50) {
      drawDiamondMotif(cx, y);
      if (y + 25 <= cy - 100) drawInterDiamondKnot(cx, y + 25);
    }
    // Braço Sul: Losangos espaçados
    for (let y = cy + 120; y <= 1220; y += 50) {
      drawDiamondMotif(cx, y);
      if (y + 25 <= 1220) drawInterDiamondKnot(cx, y + 25);
    }
    // Braço Oeste: Losangos espaçados
    for (let x = 280; x <= cx - 110; x += 50) {
      drawDiamondMotif(x, cy);
      if (x + 25 <= cx - 110) drawInterDiamondKnot(x + 25, cy);
    }
    // Braço Leste: Losangos espaçados
    for (let x = cx + 120; x <= 1640; x += 50) {
      drawDiamondMotif(x, cy);
      if (x + 25 <= 1640) drawInterDiamondKnot(x + 25, cy);
    }

    // ── F. Franjas e Terminais Decorativos nas Pontas do Tapete ──
    const drawFringesV = (baseX, baseY, isNorth = true) => {
      ctx.save();
      // Faixa transversal ornamentada
      ctx.fillStyle = '#1c1d24';
      ctx.fillRect(baseX - rwHalf, baseY + (isNorth ? 0 : -8), rwHalf * 2, 8);
      ctx.strokeStyle = whiteBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(baseX - rwHalf, baseY + (isNorth ? 0 : -8), rwHalf * 2, 8);

      // Franjas brancas tecidas
      ctx.strokeStyle = whiteBorder;
      ctx.lineWidth = 1.5;
      for (let x = baseX - rwHalf + 4; x <= baseX + rwHalf - 4; x += 5) {
        ctx.beginPath();
        ctx.moveTo(x, baseY + (isNorth ? 0 : 0));
        ctx.lineTo(x + (x % 2 === 0 ? 1 : -1), baseY + (isNorth ? -7 : 7));
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawFringesH = (baseX, baseY, isWest = true) => {
      ctx.save();
      // Faixa transversal ornamentada
      ctx.fillStyle = '#1c1d24';
      ctx.fillRect(baseX + (isWest ? 0 : -8), baseY - rwHalf, 8, rwHalf * 2);
      ctx.strokeStyle = whiteBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(baseX + (isWest ? 0 : -8), baseY - rwHalf, 8, rwHalf * 2);

      // Franjas brancas tecidas
      ctx.strokeStyle = whiteBorder;
      ctx.lineWidth = 1.5;
      for (let y = baseY - rwHalf + 4; y <= baseY + rwHalf - 4; y += 5) {
        ctx.beginPath();
        ctx.moveTo(baseX + (isWest ? 0 : 0), y);
        ctx.lineTo(baseX + (isWest ? -7 : 7), y + (y % 2 === 0 ? 1 : -1));
        ctx.stroke();
      }
      ctx.restore();
    };

    drawFringesV(cx, 196, true);
    drawFringesV(cx, 1260, false);
    drawFringesH(236, cy, true);
    drawFringesH(1684, cy, false);

    // ── G. Medalhão Central: Rosácea e Geometria Sagrada Octogonal ──
    drawOctagon(cx, cy, 108, '#232630', whiteBorder, 2.5);
    drawOctagon(cx, cy, 102, null, whiteMuted, 1.2);

    // Estrela de 8 pontas (Dois quadrados entrelaçados em 45 graus)
    ctx.strokeStyle = whiteDetail;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(cx - 52, cy - 52, 104, 104);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-52, -52, 104, 104);
    ctx.restore();

    // Círculo interno decorativo
    ctx.beginPath();
    ctx.arc(cx, cy, 58, 0, Math.PI * 2);
    ctx.strokeStyle = whiteMuted;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 8 Pontos cardeais e colaterais da estrela
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const sx = cx + Math.cos(a) * 78;
      const sy = cy + Math.sin(a) * 78;
      ctx.fillStyle = whiteBorder;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();

      // Linhas radiantes da estrela
      ctx.strokeStyle = whiteFaint;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 58, cy + Math.sin(a) * 58);
      ctx.lineTo(sx, sy);
      ctx.stroke();
    }

    // ── H. Base de Pedra Nobre do Braseiro no Coração do Tapete ──
    ctx.fillStyle = '#17181f';
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a4632';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Suave brilho dourado e acolhedor emanando da Chama
    const fireGlow = ctx.createRadialGradient(cx, cy, 6, cx, cy, 56);
    fireGlow.addColorStop(0, 'rgba(251, 146, 60, 0.45)');
    fireGlow.addColorStop(0.6, 'rgba(217, 119, 6, 0.16)');
    fireGlow.addColorStop(1, 'rgba(20, 16, 28, 0)');
    ctx.fillStyle = fireGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 56, 0, Math.PI * 2);
    ctx.fill();

    // Arco de Brilho Suave do Portal da Floresta na Ala Sul
    const forestPortalGlow = ctx.createRadialGradient(960, 1260, 6, 960, 1260, 64);
    forestPortalGlow.addColorStop(0, 'rgba(34, 197, 94, 0.40)');
    forestPortalGlow.addColorStop(0.7, 'rgba(22, 163, 74, 0.12)');
    forestPortalGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = forestPortalGlow;
    ctx.beginPath();
    ctx.arc(960, 1260, 64, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 7. Ancient Rubble, Cracks, and Ash Motes
    for (let i = 0; i < 90; i++) {
      const rx = hash(i, 0, 71) * (width - 450) + 225;
      const ry = hash(i, 0, 83) * (height - 350) + 180;
      ctx.strokeStyle = 'rgba(12, 10, 18, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + 12 + (i % 7), ry + 8 - (i % 5));
      ctx.stroke();
    }

    for (let i = 0; i < 75; i++) {
      const mx = hash(i, 0, 107) * (width - 400) + 200;
      const my = hash(i, 0, 113) * (height - 300) + 150;
      ctx.fillStyle = i % 2 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(22, 101, 52, 0.16)';
      ctx.beginPath();
      ctx.ellipse(mx, my, 8 + (i % 6), 4 + (i % 4), hash(i, 0, 127) * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 120; i++) {
      const ax = hash(i, 0, 137) * width;
      const ay = hash(i, 0, 149) * height;
      ctx.fillStyle = i % 4 === 0 ? 'rgba(251, 146, 60, 0.45)' : 'rgba(200, 190, 210, 0.15)';
      ctx.fillRect(ax, ay, 2, 2);
    }

    return true;
  }

  function getTerrain(region, width, height) {
    const size = `${width}x${height}`;
    if (terrainCanvas && terrainRegionId === region.id && terrainSize === size) return terrainCanvas;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const generatedArt = requestRealmArt(region.id);
    const drawn = generatedArt && ready(generatedArt)
      ? (ctx.imageSmoothingEnabled = false, ctx.drawImage(generatedArt, 0, 0, width, height), true)
      : region.id === 0
      ? drawCastleRuins(ctx, region, width, height)
      : (region.id === 1
        ? drawForest(ctx, region, width, height)
        : (drawOtherBiome(ctx, region, width, height), true));
    if (!drawn) return null;
    terrainCanvas = canvas;
    terrainRegionId = region.id;
    terrainSize = size;
    return terrainCanvas;
  }

  function drawFloor(ctx, region, width, height) {
    const terrain = getTerrain(region, width, height);
    if (!terrain) return false;
    const x = region.col * width;
    const y = region.row * height;
    ctx.drawImage(terrain, x, y);
    if (region.id === 1) {
      ctx.fillStyle = 'rgba(111, 125, 65, 0.09)';
      ctx.fillRect(x, y, width, height);
    } else if (region.id === 0) {
      ctx.fillStyle = 'rgba(251, 146, 60, 0.03)';
      ctx.fillRect(x, y, width, height);
    } else if (region.id > 1) {
      ctx.fillStyle = 'rgba(10, 8, 15, 0.12)';
      ctx.fillRect(x, y, width, height);
      const atmosphere = ctx.createLinearGradient(x, y, x + width, y + height);
      atmosphere.addColorStop(0, `${region.accent}12`);
      atmosphere.addColorStop(1, 'rgba(4, 6, 12, 0.10)');
      ctx.fillStyle = atmosphere;
      ctx.fillRect(x, y, width, height);
    } else if (region.id === 2) {
      ctx.fillStyle = 'rgba(20, 60, 52, 0.06)';
      ctx.fillRect(x, y, width, height);
    }
    return true;
  }

  function blockedAt(x, y, radius, trees, decor) {
    // Tree canopies are visual scenery. Keep their trunks permeable so they
    // cannot trap manual movement or the auto-pilot; solid props still block.
    for (const item of decor) {
      const key = item.kind || '';
      if (key.startsWith('medieval_') || item.isBuilding) {
        const hw = (item.w ? item.w : 140) * (item.s || 1) * 0.42;
        const hh = (item.h ? item.h : 180) * (item.s || 1) * 0.32;
        if (Math.abs(x - item.x) < hw + radius && Math.abs(y - (item.y - 8)) < hh + radius) return true;
        continue;
      }
      // Floating water flora is permeable to player
      if (/water_lily|water_lotus|water_pads|duckweed|cattail/.test(key)) continue;

      let obstacleRadius = 0;
      if (/mountain_|rock_plateau|rock_moss_cluster/.test(key)) obstacleRadius = 27;
      else if (/rock_|pillar|stump|log|fence|barrel|crate|statue|bookshelf|gargoyle|swamp_mossy_log|swamp_mud_mound|swamp_mossy_rock|mangrove_water_roots/.test(key)) obstacleRadius = 18;
      if (obstacleRadius && Math.hypot(x - item.x, y - (item.y - 4)) < radius + obstacleRadius * (item.s || 1)) return true;
    }
    return false;
  }

  function findPath(start, target, region, width, height, trees, decor) {
    const step = 32;
    const columns = Math.ceil(width / step);
    const rows = Math.ceil(height / step);
    const total = columns * rows;
    const originX = region.col * width;
    const originY = region.row * height;
    const id = (x, y) => y * columns + x;
    const point = (x, y) => ({
      x: originX + Math.min(x * step + step / 2, width - 16),
      y: originY + Math.min(y * step + step / 2, height - 16)
    });
    const inside = (x, y) => x >= 0 && y >= 0 && x < columns && y < rows;
    const cacheKey = `${region.id}:${width}x${height}`;
    let blocked = navigationCache.get(cacheKey);
    if (!blocked) {
      blocked = new Uint8Array(total);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const p = point(x, y);
          blocked[id(x, y)] = blockedAt(p.x, p.y, 14, trees, decor) ? 1 : 0;
        }
      }
      navigationCache.set(cacheKey, blocked);
    }

    const cellFor = (p) => ({
      x: Math.max(0, Math.min(columns - 1, Math.floor((p.x - originX) / step))),
      y: Math.max(0, Math.min(rows - 1, Math.floor((p.y - originY) / step)))
    });
    const from = cellFor(start);
    const to = cellFor(target);
    const startId = id(from.x, from.y);
    blocked[startId] = 0;

    if (blocked[id(to.x, to.y)]) {
      let nearest = null;
      for (let radius = 1; radius <= 5 && !nearest; radius++) {
        for (let y = to.y - radius; y <= to.y + radius && !nearest; y++) {
          for (let x = to.x - radius; x <= to.x + radius; x++) {
            if (!inside(x, y) || Math.max(Math.abs(x - to.x), Math.abs(y - to.y)) !== radius) continue;
            if (!blocked[id(x, y)]) {
              nearest = { x, y };
              break;
            }
          }
        }
      }
      if (!nearest) return [];
      to.x = nearest.x;
      to.y = nearest.y;
    }

    const targetId = id(to.x, to.y);
    const previous = new Int32Array(total);
    previous.fill(-2);
    previous[startId] = -1;
    const queue = new Int32Array(total);
    let read = 0;
    let write = 0;
    queue[write++] = startId;
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

    while (read < write && previous[targetId] === -2) {
      const current = queue[read++];
      const x = current % columns;
      const y = Math.floor(current / columns);
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (!inside(nx, ny)) continue;
        const nextId = id(nx, ny);
        if (blocked[nextId] || previous[nextId] !== -2) continue;
        if (dx && dy && (blocked[id(x + dx, y)] || blocked[id(x, y + dy)])) continue;
        previous[nextId] = current;
        queue[write++] = nextId;
      }
    }
    if (previous[targetId] === -2) return [];

    const reversed = [];
    for (let cursor = targetId; cursor !== startId; cursor = previous[cursor]) {
      reversed.push(point(cursor % columns, Math.floor(cursor / columns)));
    }
    reversed.reverse();

    const clearLine = (a, b) => {
      const distance = Math.hypot(b.x - a.x, b.y - a.y);
      const count = Math.ceil(distance / 20);
      for (let i = 1; i < count; i++) {
        const ratio = i / count;
        if (blockedAt(a.x + (b.x - a.x) * ratio, a.y + (b.y - a.y) * ratio, 14, trees, decor)) return false;
      }
      return true;
    };
    const smooth = [];
    let anchor = start;
    for (let i = 0; i < reversed.length;) {
      let furthest = i;
      for (let candidate = reversed.length - 1; candidate > i; candidate--) {
        if (clearLine(anchor, reversed[candidate])) {
          furthest = candidate;
          break;
        }
      }
      smooth.push(reversed[furthest]);
      anchor = reversed[furthest];
      i = furthest + 1;
    }
    return smooth;
  }

  window.GameWorld = { drawFloor, blockedAt, findPath };

export const gameWorld = window.GameWorld;
export { drawFloor, blockedAt, findPath };
