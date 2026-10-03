// src/data/crafting.data.js
// Catálogo de Receitas de Forja (Ignis) e Alquimia (Maeve)

export const CRAFTING_RECIPES = Object.freeze([
  // ─── FORJA DE IGNIS (METALURGIA & EQUIPAMENTOS) ───
  {
    id: 'craft_lingote_cobre',
    name: 'Lingote de Cobre Puro',
    category: 'forja',
    npc: 'ignis',
    desc: 'Fundição inicial usada em melhorias de armas e escudos básicos.',
    icon: '',
    goldCost: 15,
    requiredLevel: 5,
    ingredients: [
      { itemId: 'cobre', name: 'Minério de Cobre', count: 5, icon: '' }
    ],
    result: { itemId: 'lingote_cobre', name: 'Lingote de Cobre', count: 1, rarity: 'incomum', icon: '' }
  },
  {
    id: 'craft_lingote_ferro',
    name: 'Lingote de Ferro Forjado',
    category: 'forja',
    npc: 'ignis',
    desc: 'Metal resistente e padrão militar para lâminas equilibradas.',
    icon: '⬜',
    goldCost: 30,
    requiredLevel: 10,
    ingredients: [
      { itemId: 'ferro', name: 'Minério de Ferro', count: 5, icon: '⬜' }
    ],
    result: { itemId: 'lingote_ferro', name: 'Lingote de Ferro', count: 1, rarity: 'incomum', icon: '⬜' }
  },
  {
    id: 'craft_lingote_basalto',
    name: 'Lingote de Basalto Vulcânico',
    category: 'forja',
    npc: 'ignis',
    desc: 'Rocha ígnea temperada nas cinzas para armaduras pesadas.',
    icon: '',
    goldCost: 60,
    requiredLevel: 25,
    ingredients: [
      { itemId: 'basalto', name: 'Basalto das Cinzas', count: 4, icon: '' },
      { itemId: 'cristal', name: 'Cristal Florestal', count: 1, icon: '' }
    ],
    result: { itemId: 'lingote_basalto', name: 'Lingote de Basalto', count: 1, rarity: 'raro', icon: '' }
  },
  {
    id: 'craft_espada_ferro_forjado',
    name: 'Espada de Ferro Forjado',
    category: 'forja',
    npc: 'ignis',
    desc: 'Lâmina afiada na bigorna ancestral de Miraluz (+12 Dano Físico).',
    icon: '',
    goldCost: 120,
    requiredLevel: 15,
    ingredients: [
      { itemId: 'lingote_ferro', name: 'Lingote de Ferro', count: 3, icon: '⬜' },
      { itemId: 'cristal', name: 'Cristal Florestal', count: 2, icon: '' }
    ],
    result: { itemId: 'espada_ferro_forjado', name: 'Espada de Ferro Forjado', count: 1, rarity: 'raro', slot: 'arma', icon: '' }
  },
  {
    id: 'craft_escudo_raiz',
    name: 'Escudo da Raiz Cinzenta',
    category: 'forja',
    npc: 'ignis',
    desc: 'Proteção pesada de ferro e madeira petrificada (+6 Armadura).',
    icon: '',
    goldCost: 140,
    requiredLevel: 15,
    ingredients: [
      { itemId: 'lingote_ferro', name: 'Lingote de Ferro', count: 2, icon: '⬜' },
      { itemId: 'basalto', name: 'Basalto das Cinzas', count: 2, icon: '' }
    ],
    result: { itemId: 'escudo_raiz_cinzenta', name: 'Escudo da Raiz Cinzenta', count: 1, rarity: 'raro', slot: 'escudo', icon: '' }
  },

  // ─── BOTICÁRIO DE MAEVE (ALQUIMIA & CONSUMÍVEIS) ───
  {
    id: 'craft_pocao_cura_trio',
    name: 'Pacote de Poções de Cura (3x)',
    category: 'alquimia',
    npc: 'maeve',
    desc: 'Destilação pura de ervas e cristais que restaura a vida imediatamente.',
    icon: '',
    goldCost: 45,
    requiredLevel: 1,
    ingredients: [
      { itemId: 'cristal', name: 'Cristal Florestal', count: 2, icon: '' }
    ],
    result: { itemId: 'potions', name: 'Poções de Cura', count: 3, rarity: 'comum', icon: '' }
  },
  {
    id: 'craft_elixir_berserk',
    name: 'Elixir da Chama Ancestral',
    category: 'alquimia',
    npc: 'maeve',
    desc: 'Bebida incandescente que concede +20% de Dano de Ataque por 40 segundos.',
    icon: '',
    goldCost: 100,
    requiredLevel: 20,
    ingredients: [
      { itemId: 'cristal', name: 'Cristal Florestal', count: 3, icon: '' },
      { itemId: 'cobre', name: 'Minério de Cobre', count: 3, icon: '' }
    ],
    result: { itemId: 'elixir_berserk', name: 'Elixir da Chama Ancestral', count: 1, rarity: 'raro', icon: '' }
  }
]);
