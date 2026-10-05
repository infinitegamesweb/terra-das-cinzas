// src/systems/world/TileMap.js
/**
 * Motor de Mapa em Grade 32x32px e Área 3200x3200px (100x100 tiles).
 * Suporta autotiling de 30 tiles (6x5) com renderização por Viewport (Culling).
 */

export const TILE_SIZE = 32;
export const MAP_COLS = 100;
export const MAP_ROWS = 100;
export const MAP_WIDTH = MAP_COLS * TILE_SIZE;   // 3200px
export const MAP_HEIGHT = MAP_ROWS * TILE_SIZE; // 3200px

// Mapeamento dos 30 tiles na folha 6x5
export const TILE_COORDS = {
  center_full:      { col: 0, row: 0 },
  cut_sw:           { col: 1, row: 0 },
  edge_s:           { col: 2, row: 0 },
  cut_se:           { col: 3, row: 0 },
  t_south:          { col: 4, row: 0 },
  edge_e:           { col: 5, row: 0 },

  edge_s_long:      { col: 0, row: 1 },
  corner_inner_se:  { col: 1, row: 1 },
  cut_ne:           { col: 2, row: 1 },
  corner_inner_sw:  { col: 3, row: 1 },
  corridor_h:       { col: 4, row: 1 },
  corner_outer_se:  { col: 5, row: 1 },

  edge_w:           { col: 0, row: 2 },
  corner_outer_nw:  { col: 1, row: 2 },
  center_empty:     { col: 2, row: 2 },
  hole_island:      { col: 3, row: 2 },
  corner_outer_ne:  { col: 4, row: 2 },
  corner_outer_sw:  { col: 5, row: 2 },

  cross_4way:       { col: 0, row: 3 },
  cross_3way_v:     { col: 1, row: 3 },
  corner_inner_nw:  { col: 2, row: 3 },
  edge_n:           { col: 3, row: 3 },
  corner_inner_ne:  { col: 4, row: 3 },
  turn_sw:          { col: 5, row: 3 },

  corridor_v:       { col: 0, row: 4 },
  turn_nw:          { col: 1, row: 4 },
  turn_se:          { col: 2, row: 4 },
  turn_ne:          { col: 3, row: 4 },
  dead_end_s:       { col: 4, row: 4 },
  single_island:    { col: 5, row: 4 }
};

export class TileMap {
  constructor(options = {}) {
    this.cols = options.cols || MAP_COLS;
    this.rows = options.rows || MAP_ROWS;
    this.tileSize = options.tileSize || TILE_SIZE;
    this.width = this.cols * this.tileSize;   // 3200
    this.height = this.rows * this.tileSize; // 3200

    this.biome = options.biome || 'forest'; // 'forest' ou 'dungeon'
    this.grid = new Uint8Array(this.cols * this.rows);       // 1 = piso/aberto, 0 = borda/densa/vazio
    this.tileIndices = new Uint8Array(this.cols * this.rows); // Índice do autotile (0..29)
    this.collisionGrid = new Uint8Array(this.cols * this.rows); // 1 = bloqueado, 0 = livre

    this.tilesetImage = null;
    this.tilesetLoaded = false;
    this.tilesetPath = options.tilesetPath || (
      this.biome === 'dungeon'
        ? 'assets/maps/tilesets/autotile_stone_dungeon_32.png'
        : 'assets/maps/tilesets/autotile_grass_forest_32.png'
    );

    this.loadTileset(this.tilesetPath);
  }

  loadTileset(path) {
    this.tilesetPath = path;
    const img = new Image();
    img.onload = () => {
      this.tilesetImage = img;
      this.tilesetLoaded = true;
    };
    img.onerror = () => {
      console.warn(`[TileMap] Não foi possível carregar tileset: ${path}`);
    };
    img.src = path;
  }

  setTile(c, r, value) {
    if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return;
    this.grid[r * this.cols + c] = value ? 1 : 0;
  }

  getTile(c, r) {
    if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return 0;
    return this.grid[r * this.cols + c];
  }

  isBlocked(x, y) {
    const c = Math.floor(x / this.tileSize);
    const r = Math.floor(y / this.tileSize);
    if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return true;
    return this.collisionGrid[r * this.cols + c] === 1;
  }

  /**
   * Gera um layout completo de 3200x3200px com clareiras, caminhos e zonas de combate
   */
  generateOverworldLayout(seed = 42) {
    this.grid.fill(0); // Inicia como mata densa / relevo externo

    const centerCol = Math.floor(this.cols / 2);
    const centerRow = Math.floor(this.rows / 2);

    // 1. Ampla Clareira Central (Hub e Zona de Combate Central)
    this.fillCircle(centerCol, centerRow, 24, 1);

    // 2. Clareira Sul (Entrada e Ponto Inicial)
    this.fillCircle(centerCol, this.rows - 18, 16, 1);

    // 3. Clareira Norte (Arena do Chefe da Região)
    this.fillCircle(centerCol, 18, 18, 1);

    // 4. Clareiras Leste e Oeste (Mineração e Santuários)
    this.fillCircle(20, centerRow, 16, 1);
    this.fillCircle(this.cols - 20, centerRow, 16, 1);

    // 5. Corredores Principais conectando as áreas (com largura generosa)
    this.drawPath(centerCol, this.rows - 18, centerCol, centerRow, 8); // Sul -> Centro
    this.drawPath(centerCol, centerRow, centerCol, 18, 8);             // Centro -> Norte
    this.drawPath(centerCol, centerRow, 20, centerRow, 7);             // Centro -> Oeste
    this.drawPath(centerCol, centerRow, this.cols - 20, centerRow, 7); // Centro -> Leste

    // 6. Trilhas secundárias orgânicas ligando as alas
    this.drawPath(20, centerRow, centerCol, 18, 6);
    this.drawPath(this.cols - 20, centerRow, centerCol, 18, 6);
    this.drawPath(20, centerRow, centerCol, this.rows - 18, 6);
    this.drawPath(this.cols - 20, centerRow, centerCol, this.rows - 18, 6);

    // Atualiza a tabela de colisão e os índices do autotile
    this.updateCollisions();
    this.computeAutotileIndices();
  }

  fillCircle(centerCol, centerRow, radius, val) {
    const r2 = radius * radius;
    for (let r = Math.max(2, centerRow - radius); r <= Math.min(this.rows - 3, centerRow + radius); r++) {
      for (let c = Math.max(2, centerCol - radius); c <= Math.min(this.cols - 3, centerCol + radius); c++) {
        const dc = c - centerCol;
        const dr = r - centerRow;
        if (dc * dc + dr * dr <= r2) {
          this.setTile(c, r, val);
        }
      }
    }
  }

  drawPath(c1, r1, c2, r2, width = 3) {
    const steps = Math.max(Math.abs(c2 - c1), Math.abs(r2 - r1)) * 2;
    for (let s = 0; s <= steps; s++) {
      const t = s / Math.max(1, steps);
      const curC = Math.round(c1 + (c2 - c1) * t);
      const curR = Math.round(r1 + (r2 - r1) * t);
      const half = Math.floor(width / 2);
      for (let dr = -half; dr <= half; dr++) {
        for (let dc = -half; dc <= half; dc++) {
          this.setTile(curC + dc, curR + dr, 1);
        }
      }
    }
  }

  updateCollisions() {
    // Bordas extremas do mapa (3200x3200) bloqueiam a passagem
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const idx = r * this.cols + c;
        if (c <= 1 || c >= this.cols - 2 || r <= 1 || r >= this.rows - 2) {
          this.collisionGrid[idx] = 1;
        } else {
          this.collisionGrid[idx] = 0;
        }
      }
    }
  }

  /**
   * Calcula o índice 0..29 para cada uma das 10.000 células baseado nos 8 vizinhos
   */
  computeAutotileIndices() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const idx = r * this.cols + c;
        const current = this.getTile(c, r);

        if (current === 0) {
          // Espaço secundário (mata fechada / terra)
          this.tileIndices[idx] = 14; // center_empty
          continue;
        }

        // Vizinhos cardeais (1 = piso presente, 0 = ausente)
        const n  = this.getTile(c, r - 1);
        const s  = this.getTile(c, r + 1);
        const w  = this.getTile(c - 1, r);
        const e  = this.getTile(c + 1, r);

        // Diagonais
        const nw = this.getTile(c - 1, r - 1);
        const ne = this.getTile(c + 1, r - 1);
        const sw = this.getTile(c - 1, r + 1);
        const se = this.getTile(c + 1, r + 1);

        let tileKey = 'center_full';

        // 1. Totalmente cercado por piso
        if (n && s && w && e) {
          if (!nw) tileKey = 'cut_sw';
          else if (!ne) tileKey = 'cut_se';
          else if (!sw) tileKey = 'cut_nw';
          else if (!se) tileKey = 'cut_ne';
          else tileKey = 'center_full';
        }
        // 2. Bordas retas
        else if (n && s && w && !e) tileKey = 'edge_e';
        else if (n && s && !w && e) tileKey = 'edge_w';
        else if (n && !s && w && e) tileKey = 'edge_s';
        else if (!n && s && w && e) tileKey = 'edge_n';
        // 3. Cantos externos
        else if (!n && s && !w && e) tileKey = 'corner_outer_nw';
        else if (!n && s && w && !e) tileKey = 'corner_outer_ne';
        else if (n && !s && !w && e) tileKey = 'corner_outer_sw';
        else if (n && !s && w && !e) tileKey = 'corner_outer_se';
        // 4. Corredores
        else if (!n && !s && w && e) tileKey = 'corridor_h';
        else if (n && s && !w && !e) tileKey = 'corridor_v';
        // 5. Ilha isolada
        else if (!n && !s && !w && !e) tileKey = 'single_island';
        // 6. Curvas e pontas
        else if (n && !s && !w && !e) tileKey = 'dead_end_s';
        else if (!n && s && !w && !e) tileKey = 'turn_nw';

        const coord = TILE_COORDS[tileKey] || TILE_COORDS.center_full;
        this.tileIndices[idx] = coord.row * 6 + coord.col;
      }
    }
  }

  /**
   * Renderiza apenas os tiles visíveis no Viewport com tom de destaque por mapa
   */
  render(ctx, cameraX, cameraY, viewportW, viewportH, theme = null) {
    if (!this.tilesetLoaded || !this.tilesetImage) return;

    // Converte a área da tela para o retângulo de coordenadas da grade (32px)
    const minCol = Math.max(0, Math.floor((cameraX - this.tileSize) / this.tileSize));
    const maxCol = Math.min(this.cols - 1, Math.ceil((cameraX + viewportW + this.tileSize) / this.tileSize));
    const minRow = Math.max(0, Math.floor((cameraY - this.tileSize) / this.tileSize));
    const maxRow = Math.min(this.rows - 1, Math.ceil((cameraY + viewportH + this.tileSize) / this.tileSize));

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Se o mapa tiver desaturação (ex: Mapa 29 - Cinzas Eternas monocromático)
    if (theme?.desaturate) {
      ctx.filter = 'grayscale(100%) brightness(0.90) contrast(1.10)';
    }

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const tileIdx = this.tileIndices[r * this.cols + c];
        const srcCol = tileIdx % 6;
        const srcRow = Math.floor(tileIdx / 6);

        const srcX = srcCol * this.tileSize;
        const srcY = srcRow * this.tileSize;
        const destX = c * this.tileSize;
        const destY = r * this.tileSize;

        ctx.drawImage(
          this.tilesetImage,
          srcX, srcY, this.tileSize, this.tileSize,
          destX, destY, this.tileSize, this.tileSize
        );
      }
    }

    ctx.restore();

    // Aplica o tom de destaque de cor sobre a área visível do mapa
    if (theme?.accentColor) {
      ctx.save();
      const vx = Math.max(0, cameraX);
      const vy = Math.max(0, cameraY);
      const vw = Math.min(this.width - vx, viewportW + (cameraX < 0 ? cameraX : 0));
      const vh = Math.min(this.height - vy, viewportH + (cameraY < 0 ? cameraY : 0));

      if (vw > 0 && vh > 0) {
        // Camada 1: Coloração cromática do bioma
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = theme.accentColor;
        ctx.globalAlpha = theme.id === 1 ? 0.38 : (theme.id === 2 ? 0.42 : (theme.desaturate ? 0.55 : 0.28));
        ctx.fillRect(vx, vy, vw, vh);

        // Camada 2: Atmosfera tonal suave
        if (theme.tintRgba) {
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = theme.tintRgba;
          ctx.fillRect(vx, vy, vw, vh);
        }
      }
      ctx.restore();
    }
  }
}
