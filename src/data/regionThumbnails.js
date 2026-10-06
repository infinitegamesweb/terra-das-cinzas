// src/data/regionThumbnails.js
/**
 * Catálogo Central e Escalável de Miniaturas de Regiões
 * Terra das Cinzas · RPG Dark Fantasy em Pixel Art
 * Suporta todas as 30 Regiões do Mundo (IDs 00 a 29)
 */

export const REGION_THUMBNAILS = {
  // ─── HUB & MODO NORMAL (0–6) ────────────────────────────────────
  0:  'assets/regions/region_00.png', // Castelo em Cinzas (Hub Seguro)
  1:  'assets/regions/region_01.png', // Bosque das Ruínas
  2:  'assets/regions/region_02.png', // Clareira dos Ecos
  3:  'assets/regions/region_03.png', // Margem Afogada
  4:  'assets/regions/region_04.png', // Pântano Espectral
  5:  'assets/regions/region_05.png', // Trilha do Degelo
  6:  'assets/regions/region_06.png', // Montanhas Rubras

  // ─── MODO DIFÍCIL (7–13) ────────────────────────────────────────
  7:  'assets/regions/region_07.png', // Portão Partido
  8:  'assets/regions/region_08.png', // Torre das Brasas
  9:  'assets/regions/region_09.png', // Campos Crepusculares
  10: 'assets/regions/region_10.png', // Cavernas do Vazio
  11: 'assets/regions/region_11.png', // Labirinto de Ferro
  12: 'assets/regions/region_12.png', // Forjas Malditas
  13: 'assets/regions/region_13.png', // Abismo Sombrio

  // ─── MODO PESADELO (14–19) ──────────────────────────────────────
  14: 'assets/regions/region_14.png', // Cripta Eterna
  15: 'assets/regions/region_15.png', // Floresta Amaldiçoada
  16: 'assets/regions/region_16.png', // Torres do Esquecimento
  17: 'assets/regions/region_17.png', // Mar de Cinzas
  18: 'assets/regions/region_18.png', // Núcleo do Vulcão
  19: 'assets/regions/region_19.png', // Altar do Caos

  // ─── MODO BRASA (20–25) ─────────────────────────────────────────
  20: 'assets/regions/region_20.png', // Planalto Incandescente
  21: 'assets/regions/region_21.png', // Rio de Magma
  22: 'assets/regions/region_22.png', // Cidade Fantasma
  23: 'assets/regions/region_23.png', // Pico dos Condenados
  24: 'assets/regions/region_24.png', // Domínio de Vharok
  25: 'assets/regions/region_25.png', // Câmara do Primeiro Fogo

  // ─── MODO CINZAS (26–29) ────────────────────────────────────────
  26: 'assets/regions/region_26.png', // Véu do Eclipse Final
  27: 'assets/regions/region_27.png', // Dimensão das Sombras
  28: 'assets/regions/region_28.png', // Coração do Vazio
  29: 'assets/regions/region_29.png'  // Terra das Cinzas Eternas
};

const DEFAULT_FALLBACK_THUMBNAIL = 'assets/regions/region_00.png';

/**
 * Retorna o caminho da miniatura da região por ID sem limitação artificial.
 * Possui fallback visual seguro caso a miniatura específica não esteja presente.
 */
export function getRegionThumbnail(regionId) {
  const numericId = Number(regionId);
  if (Number.isNaN(numericId) || numericId < 0) {
    console.warn(`[RegionThumbnails] ID inválido fornecido: ${regionId}. Usando fallback.`);
    return DEFAULT_FALLBACK_THUMBNAIL;
  }

  const registeredPath = REGION_THUMBNAILS[numericId];
  if (registeredPath) {
    return registeredPath;
  }

  console.warn(`[RegionThumbnails] Nenhuma thumbnail cadastrada para a região ${numericId}.`);
  return DEFAULT_FALLBACK_THUMBNAIL;
}

/**
 * Valida a integridade do catálogo de miniaturas contra uma lista de regiões.
 * @param {Array<{id: number, name: string}>} [regionsList]
 * @returns {{ valid: boolean, missing: number[], totalChecked: number }}
 */
export function validateRegionThumbnails(regionsList = []) {
  const missing = [];
  const listToCheck = regionsList.length > 0 ? regionsList : Object.keys(REGION_THUMBNAILS).map(id => ({ id: Number(id) }));

  listToCheck.forEach(reg => {
    if (!REGION_THUMBNAILS[reg.id]) {
      missing.push(reg.id);
    }
  });

  const valid = missing.length === 0;
  if (!valid) {
    console.error(`[RegionThumbnails] Validação falhou. Regiões sem thumbnail registrada: ${missing.join(', ')}`);
  }

  return {
    valid,
    missing,
    totalChecked: listToCheck.length
  };
}

if (typeof window !== 'undefined') {
  window.RegionThumbnails = {
    get: getRegionThumbnail,
    validate: validateRegionThumbnails,
    CATALOG: REGION_THUMBNAILS
  };
}
