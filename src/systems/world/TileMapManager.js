// src/systems/world/TileMapManager.js
import { TileMap, MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } from './TileMap.js';
import { getRegionTheme } from '../../data/regionHighlightThemes.js';

class TileMapManager {
  constructor() {
    this.maps = new Map();
    this.activeMap = null;
    this.activeRegionId = -1;
  }

  getMapForRegion(region) {
    if (!region) return null;
    const id = region.id ?? 1;

    if (this.maps.has(id)) {
      return this.maps.get(id);
    }

    const theme = region.theme || '';
    let biome = 'forest';
    let tilesetPath = 'assets/maps/tilesets/autotile_grass_forest_32.png';

    if (theme === 'lava' || theme === 'chaos') {
      biome = 'lava';
      tilesetPath = 'assets/maps/tilesets/autotile_lava_volcano_32.png';
    } else if (theme === 'swamp') {
      biome = 'swamp';
      tilesetPath = 'assets/maps/tilesets/autotile_water_swamp_32.png';
    } else if (region.mode === 'dungeon' || id === 0 || theme === 'fortress' || theme === 'iron' || theme === 'crypt') {
      biome = 'dungeon';
      tilesetPath = 'assets/maps/tilesets/autotile_stone_dungeon_32.png';
    } else {
      biome = 'forest';
      tilesetPath = 'assets/maps/tilesets/autotile_grass_forest_32.png';
    }
    
    const tileMap = new TileMap({
      biome,
      tilesetPath
    });

    // Gera layout do mapa de 3200x3200px
    tileMap.generateOverworldLayout(1000 + id * 37);

    this.maps.set(id, tileMap);
    return tileMap;
  }

  setActiveRegion(region) {
    if (!region) return;
    this.activeRegion = region;
    this.activeRegionId = region.id;
    this.activeMap = this.getMapForRegion(region);
  }

  render(ctx, cameraX, cameraY, viewportW, viewportH) {
    if (this.activeMap) {
      const theme = getRegionTheme(this.activeRegionId);
      this.activeMap.render(ctx, cameraX, cameraY, viewportW, viewportH, theme);
      return true;
    }
    return false;
  }

  isBlocked(x, y, regionWidth = 3200, regionHeight = 3200) {
    if (this.activeMap) {
      const ox = (this.activeRegion?.col ?? 0) * regionWidth;
      const oy = (this.activeRegion?.row ?? 0) * regionHeight;
      const localX = x - ox;
      const localY = y - oy;
      return this.activeMap.isBlocked(localX, localY);
    }
    return false;
  }
}

export const tileMapManager = new TileMapManager();
export { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE };
