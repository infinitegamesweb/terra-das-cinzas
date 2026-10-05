// src/data/regionHighlightThemes.js
/**
 * Tons de Cor de Destaque para cada Mapa do Jogo (1 a 29 e Castelo Hub 0)
 * Guerra das Cinzas
 * 
 * Regra:
 * - Mapa 1: Tom de grama amarelo enferrujado
 * - Mapa 2: Tom de destaque de cor marrom
 * - ...
 * - Mapa 29 (Último Mapa): Cor Cinza (Cinzas Eternas Monocromáticas)
 */

export const REGION_HIGHLIGHT_THEMES = {
  0: {
    id: 0,
    name: 'Castelo em Cinzas',
    themeName: 'Âmbar Nobre & Ferro Ancestral',
    accentColor: '#f59e0b',
    ambientColor: '#fbbf24',
    tintRgba: 'rgba(245, 158, 11, 0.12)',
    desaturate: false
  },

  // ─── NORMAL (1–6) ──────────────────────────────────────────
  1: {
    id: 1,
    name: 'Bosque das Ruínas',
    themeName: 'Grama Amarelo Enferrujado',
    accentColor: '#d4a234', // Amarelo enferrujado / ocre oxidado
    ambientColor: '#facc15',
    tintRgba: 'rgba(212, 162, 52, 0.22)',
    filterOverlay: 'rgba(180, 140, 40, 0.18)',
    desaturate: false
  },
  2: {
    id: 2,
    name: 'Clareira dos Ecos',
    themeName: 'Marrom Terroso das Raízes',
    accentColor: '#8b4513', // Marrom destaque
    ambientColor: '#a0522d',
    tintRgba: 'rgba(139, 69, 19, 0.25)',
    filterOverlay: 'rgba(110, 60, 20, 0.20)',
    desaturate: false
  },
  3: {
    id: 3,
    name: 'Margem Afogada',
    themeName: 'Verde-Oliva Pântano & Lodo',
    accentColor: '#14b8a6', // Verde azulado / ciano lodo
    ambientColor: '#2dd4bf',
    tintRgba: 'rgba(20, 184, 166, 0.18)',
    filterOverlay: 'rgba(13, 148, 136, 0.15)',
    desaturate: false
  },
  4: {
    id: 4,
    name: 'Pântano Espectral',
    themeName: 'Verde Musgo Profundo & Brumas',
    accentColor: '#10b981', // Verde esmeralda pálido
    ambientColor: '#34d399',
    tintRgba: 'rgba(16, 185, 129, 0.18)',
    filterOverlay: 'rgba(5, 150, 105, 0.15)',
    desaturate: false
  },
  5: {
    id: 5,
    name: 'Trilha do Degelo',
    themeName: 'Azul Glacial & Rocha Fria',
    accentColor: '#38bdf8', // Azul gelo brilhante
    ambientColor: '#7dd3fc',
    tintRgba: 'rgba(56, 189, 248, 0.16)',
    filterOverlay: 'rgba(2, 132, 199, 0.14)',
    desaturate: false
  },
  6: {
    id: 6,
    name: 'Montanhas Rubras',
    themeName: 'Cobre Ferrugíneo & Terracota',
    accentColor: '#ea580c', // Laranja cobre vibrante
    ambientColor: '#f97316',
    tintRgba: 'rgba(234, 88, 12, 0.20)',
    filterOverlay: 'rgba(194, 65, 12, 0.16)',
    desaturate: false
  },

  // ─── DIFÍCIL (7–13) ────────────────────────────────────────
  7: {
    id: 7,
    name: 'Portão Partido',
    themeName: 'Púrpura Ardósia & Ferro Batido',
    accentColor: '#818cf8', // Púrpura índigo
    ambientColor: '#a5b4fc',
    tintRgba: 'rgba(129, 140, 248, 0.18)',
    filterOverlay: 'rgba(99, 102, 241, 0.15)',
    desaturate: false
  },
  8: {
    id: 8,
    name: 'Torre das Brasas',
    themeName: 'Âmbar Flamejante & Bronze',
    accentColor: '#f59e0b', // Âmbar forte
    ambientColor: '#fbbf24',
    tintRgba: 'rgba(245, 158, 11, 0.22)',
    filterOverlay: 'rgba(217, 119, 6, 0.16)',
    desaturate: false
  },
  9: {
    id: 9,
    name: 'Campos Crepusculares',
    themeName: 'Violeta Crepúsculo Cósmico',
    accentColor: '#c084fc', // Violeta intenso
    ambientColor: '#e9d5ff',
    tintRgba: 'rgba(192, 132, 252, 0.18)',
    filterOverlay: 'rgba(168, 85, 247, 0.14)',
    desaturate: false
  },
  10: {
    id: 10,
    name: 'Cavernas do Vazio',
    themeName: 'Ciano Luminescente & Cristais',
    accentColor: '#06b6d4', // Ciano neon
    ambientColor: '#22d3ee',
    tintRgba: 'rgba(6, 182, 212, 0.18)',
    filterOverlay: 'rgba(8, 145, 178, 0.15)',
    desaturate: false
  },
  11: {
    id: 11,
    name: 'Labirinto de Ferro',
    themeName: 'Bronze Oxidado & Latão',
    accentColor: '#ca8a04', // Latão / bronze
    ambientColor: '#eab308',
    tintRgba: 'rgba(202, 138, 4, 0.20)',
    filterOverlay: 'rgba(180, 83, 9, 0.16)',
    desaturate: false
  },
  12: {
    id: 12,
    name: 'Forjas Malditas',
    themeName: 'Laranja Magma & Brasas',
    accentColor: '#f97316', // Laranja incandescente
    ambientColor: '#fed7aa',
    tintRgba: 'rgba(249, 115, 22, 0.22)',
    filterOverlay: 'rgba(234, 88, 12, 0.18)',
    desaturate: false
  },
  13: {
    id: 13,
    name: 'Abismo Sombrio',
    themeName: 'Índigo Profundo & Noite Eterna',
    accentColor: '#4f46e5', // Índigo escuro
    ambientColor: '#818cf8',
    tintRgba: 'rgba(79, 70, 229, 0.20)',
    filterOverlay: 'rgba(67, 56, 202, 0.15)',
    desaturate: false
  },

  // ─── PESADELO (14–19) ──────────────────────────────────────
  14: {
    id: 14,
    name: 'Cripta Eterna',
    themeName: 'Ametista Fúnebre & Lilás',
    accentColor: '#9333ea', // Roxo fúnebre
    ambientColor: '#c084fc',
    tintRgba: 'rgba(147, 51, 234, 0.20)',
    filterOverlay: 'rgba(126, 34, 206, 0.16)',
    desaturate: false
  },
  15: {
    id: 15,
    name: 'Floresta Amaldiçoada',
    themeName: 'Verde Veneno Noturno',
    accentColor: '#22c55e', // Verde esmeralda tóxico
    ambientColor: '#86efac',
    tintRgba: 'rgba(34, 197, 94, 0.18)',
    filterOverlay: 'rgba(22, 163, 74, 0.14)',
    desaturate: false
  },
  16: {
    id: 16,
    name: 'Torres do Esquecimento',
    themeName: 'Azul Cobalto Místico',
    accentColor: '#2563eb', // Cobalto
    ambientColor: '#60a5fa',
    tintRgba: 'rgba(37, 99, 235, 0.18)',
    filterOverlay: 'rgba(29, 78, 216, 0.15)',
    desaturate: false
  },
  17: {
    id: 17,
    name: 'Mar de Cinzas',
    themeName: 'Cinza Mineral & Areias Mortas',
    accentColor: '#a8a29e', // Cinza mineral
    ambientColor: '#e7e5e4',
    tintRgba: 'rgba(168, 162, 158, 0.22)',
    filterOverlay: 'rgba(120, 113, 108, 0.18)',
    desaturate: false
  },
  18: {
    id: 18,
    name: 'Núcleo do Vulcão',
    themeName: 'Vermelho Carmesim de Basalto',
    accentColor: '#dc2626', // Carmesim forte
    ambientColor: '#f87171',
    tintRgba: 'rgba(220, 38, 38, 0.24)',
    filterOverlay: 'rgba(185, 28, 28, 0.18)',
    desaturate: false
  },
  19: {
    id: 19,
    name: 'Altar do Caos',
    themeName: 'Magenta Cósmico & Runa',
    accentColor: '#e11d48', // Magenta rúnico
    ambientColor: '#fb7185',
    tintRgba: 'rgba(225, 29, 72, 0.22)',
    filterOverlay: 'rgba(190, 18, 60, 0.16)',
    desaturate: false
  },

  // ─── BRASA (20–25) ─────────────────────────────────────────
  20: {
    id: 20,
    name: 'Planalto Incandescente',
    themeName: 'Dourado Brasa & Chamas',
    accentColor: '#fbbf24', // Dourado brasa
    ambientColor: '#fef08a',
    tintRgba: 'rgba(251, 191, 36, 0.22)',
    filterOverlay: 'rgba(245, 158, 11, 0.18)',
    desaturate: false
  },
  21: {
    id: 21,
    name: 'Rio de Magma',
    themeName: 'Vermelho Fogo Escarlate',
    accentColor: '#ef4444', // Escarlate intenso
    ambientColor: '#fca5a5',
    tintRgba: 'rgba(239, 68, 68, 0.24)',
    filterOverlay: 'rgba(185, 28, 28, 0.18)',
    desaturate: false
  },
  22: {
    id: 22,
    name: 'Cidade Fantasma',
    themeName: 'Azul Espectral & Ruína',
    accentColor: '#38bdf8', // Azul espectro
    ambientColor: '#bae6fd',
    tintRgba: 'rgba(56, 189, 248, 0.18)',
    filterOverlay: 'rgba(14, 165, 233, 0.15)',
    desaturate: false
  },
  23: {
    id: 23,
    name: 'Pico dos Condenados',
    themeName: 'Púrpura Tempestuoso',
    accentColor: '#7c3aed', // Púrpura épico
    ambientColor: '#a78bfa',
    tintRgba: 'rgba(124, 58, 237, 0.20)',
    filterOverlay: 'rgba(109, 40, 217, 0.16)',
    desaturate: false
  },
  24: {
    id: 24,
    name: 'Domínio de Vharok',
    themeName: 'Sangue Seco & Eclipse Rubro',
    accentColor: '#9f1239', // Vinho profundo
    ambientColor: '#fda4af',
    tintRgba: 'rgba(159, 18, 57, 0.22)',
    filterOverlay: 'rgba(136, 19, 55, 0.18)',
    desaturate: false
  },
  25: {
    id: 25,
    name: 'Câmara do Primeiro Fogo',
    themeName: 'Ouro Primordial & Chamas Divinas',
    accentColor: '#f59e0b', // Ouro puro
    ambientColor: '#fef3c7',
    tintRgba: 'rgba(245, 158, 11, 0.22)',
    filterOverlay: 'rgba(217, 119, 6, 0.16)',
    desaturate: false
  },

  // ─── CINZAS (26–29) ────────────────────────────────────────
  26: {
    id: 26,
    name: 'Véu do Eclipse Final',
    themeName: 'Azul Grafite & Crepúsculo Gélido',
    accentColor: '#475569', // Grafite frio
    ambientColor: '#94a3b8',
    tintRgba: 'rgba(71, 85, 105, 0.25)',
    filterOverlay: 'rgba(51, 65, 85, 0.20)',
    desaturate: false
  },
  27: {
    id: 27,
    name: 'Dimensão das Sombras',
    themeName: 'Cinza Ônix Profundo',
    accentColor: '#52525b', // Cinza escuro profundo
    ambientColor: '#a1a1aa',
    tintRgba: 'rgba(82, 82, 91, 0.30)',
    filterOverlay: 'rgba(63, 63, 70, 0.22)',
    desaturate: false
  },
  28: {
    id: 28,
    name: 'Coração do Vazio',
    themeName: 'Cinza Ardósia Solene',
    accentColor: '#64748b', // Ardósia cinzenta
    ambientColor: '#cbd5e1',
    tintRgba: 'rgba(100, 116, 139, 0.32)',
    filterOverlay: 'rgba(71, 85, 105, 0.24)',
    desaturate: false
  },
  29: {
    id: 29,
    name: 'Terra das Cinzas Eternas',
    themeName: 'Cinza Absoluto das Cinzas Eternas',
    accentColor: '#94a3b8', // Cinza Puro (O Último Mapa)
    ambientColor: '#cbd5e1', // Cinza névoa
    tintRgba: 'rgba(148, 163, 184, 0.38)',
    filterOverlay: 'rgba(100, 116, 139, 0.32)',
    desaturate: true // Monocromático cinza
  }
};

export function getRegionTheme(regionId) {
  return REGION_HIGHLIGHT_THEMES[regionId] || REGION_HIGHLIGHT_THEMES[1];
}
