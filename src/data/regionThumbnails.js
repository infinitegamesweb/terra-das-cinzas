// src/data/regionThumbnails.js
/**
 * Catálogo Central de Miniaturas de Regiões para o Painel Lateral
 * Guerra das Cinzas · RPG Medieval Sombrio
 */

export const REGION_THUMBNAILS = {
  0: 'assets/regions/region_00.png', // Castelo em Cinzas (Hub)
  1: 'assets/regions/region_01.png', // Bosque das Ruínas
  2: 'assets/regions/region_02.png', // Clareira dos Ecos
  3: 'assets/regions/region_03.png', // Margem Afogada
  4: 'assets/regions/region_04.png', // Pântano Espectral
  5: 'assets/regions/region_05.png', // Trilha do Dragão
  6: 'assets/regions/region_06.png', // Cume da Fornalha
  7: 'assets/regions/region_07.png', // Portão de Pedra
  8: 'assets/regions/region_08.png', // Torre das Brumas
  9: 'assets/regions/region_09.png', // Abismo Sombrio
  10: 'assets/regions/region_10.png', // Caverna Cristalina
  11: 'assets/regions/region_11.png', // Fortaleza de Gelo
  12: 'assets/regions/region_12.png'  // Terra das Cinzas Eternas
};

export function getRegionThumbnail(regionId) {
  const cleanId = Math.min(12, Math.max(0, Number(regionId) || 0));
  return REGION_THUMBNAILS[cleanId] || REGION_THUMBNAILS[1];
}
