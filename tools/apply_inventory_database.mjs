// tools/apply_inventory_database.mjs
import fs from 'fs';

const invFile = 'src/systems/inventory/InventoryManager.js';
let content = fs.readFileSync(invFile, 'utf8');

const generatedBlock = fs.readFileSync('tools/generated_items_block.js', 'utf8');

// Replace starter consumables and materials with enhanced icons
const oldConsumablesTarget = `    // ─── CONSUMÍVEIS ───
    'pot_vida_pequena': { id: 'pot_vida_pequena', name: 'Poção de Vida Menor', type: 'consumable', rarity: 'comum', subType: 'heal', heal: 60, icon: '🧪', iconImg: 'assets/icons/skills/Icon42.png', value: 15, buyPrice: 20, stackable: true, desc: 'Restaura 60 pontos de vida instantaneamente.' },
    'pot_vida_media': { id: 'pot_vida_media', name: 'Poção de Vida Maior', type: 'consumable', rarity: 'incomum', subType: 'heal', heal: 180, icon: '🧪', value: 45, buyPrice: 65, stackable: true, desc: 'Restaura 180 pontos de vida instantaneamente.' },
    'pot_vida_suprema': { id: 'pot_vida_suprema', name: 'Elixir da Vitalidade Élfica', type: 'consumable', rarity: 'raro', subType: 'heal', heal: 450, icon: '🍷', value: 120, buyPrice: 180, stackable: true, desc: 'Restaura 450 pontos de vida e confere vigor supremo.' },
    'pot_energia': { id: 'pot_energia', name: 'Frasco de Energia Arcana', type: 'consumable', rarity: 'comum', subType: 'energy', energy: 60, icon: '⚡', value: 30, buyPrice: 45, stackable: true, desc: 'Restaura 60 de energia imediatamente.' },
    'scroll_retorno': { id: 'scroll_retorno', name: 'Pergaminho do Castelo', type: 'consumable', rarity: 'comum', subType: 'teleport_hub', icon: '📜', value: 20, buyPrice: 35, stackable: true, desc: 'Teleporta você de volta em segurança para o Castelo em Cinzas.' },
    'elixir_forca': { id: 'elixir_forca', name: 'Elixir da Fúria Titânica', type: 'consumable', rarity: 'raro', subType: 'buff_atk', icon: '⚗️', value: 150, buyPrice: 220, stackable: true, desc: 'Bebida alquímica que concede +25% de dano por 5 minutos.' },
    'elixir_pedra': { id: 'elixir_pedra', name: 'Tintura de Pele de Pedra', type: 'consumable', rarity: 'raro', subType: 'buff_def', icon: '🍶', value: 140, buyPrice: 200, stackable: true, desc: 'Endurece a pele reduzindo todo dano recebido em 12 por 5 minutos.' },

    // ─── MATERIAIS DE FORJA & EXPEDIÇÃO ───
    'mat_fragmento_brasa': { id: 'mat_fragmento_brasa', name: 'Fragmento de Brasa Sagrada', type: 'material', rarity: 'raro', icon: '🔥', value: 100, stackable: true, desc: 'Centelha incandescente das ruínas de Miraluz. Usado para aprimorar armas na Forja.' },
    'mat_lingote_ferro': { id: 'mat_lingote_ferro', name: 'Lingote de Ferro Rúnico', type: 'material', rarity: 'comum', icon: '🧱', value: 25, stackable: true, desc: 'Ferro fundido puro para reforço de lâminas e armaduras.' },
    'mat_cristal_mata': { id: 'mat_cristal_mata', name: 'Cristal da Mata Profunda', type: 'material', rarity: 'incomum', icon: '💎', value: 50, stackable: true, desc: 'Gema com reflexos esmeralda extraída de veios luminosos.' }`;

const newConsumables = `    // ─── CONSUMÍVEIS (PIXEL ART DE ALTA DEFINIÇÃO) ───
    'pot_vida_pequena': { id: 'pot_vida_pequena', name: 'Poção de Vida Menor', type: 'consumable', rarity: 'comum', subType: 'heal', heal: 60, icon: '🧪', iconImg: 'assets/items/consumables/potion_health_heart.png', value: 15, buyPrice: 20, stackable: true, desc: 'Restaura 60 pontos de vida com a essência de um coração escarlate.' },
    'pot_vida_media': { id: 'pot_vida_media', name: 'Poção de Vida Maior', type: 'consumable', rarity: 'incomum', subType: 'heal', heal: 180, icon: '🧪', iconImg: 'assets/items/consumables/potion_health_heart.png', value: 45, buyPrice: 65, stackable: true, desc: 'Restaura 180 pontos de vida instantaneamente.' },
    'pot_vida_suprema': { id: 'pot_vida_suprema', name: 'Elixir da Vitalidade Élfica', type: 'consumable', rarity: 'raro', subType: 'heal', heal: 450, icon: '🍷', iconImg: 'assets/items/consumables/potion_health_heart.png', value: 120, buyPrice: 180, stackable: true, desc: 'Restaura 450 pontos de vida e confere vigor supremo.' },
    'pot_energia': { id: 'pot_energia', name: 'Frasco de Energia Arcana', type: 'consumable', rarity: 'comum', subType: 'energy', energy: 60, icon: '⚡', iconImg: 'assets/items/consumables/potion_mana_moon.png', value: 30, buyPrice: 45, stackable: true, desc: 'Restaura 60 de energia imediatamente com o poder da lua crescente.' },
    'scroll_retorno': { id: 'scroll_retorno', name: 'Pergaminho do Castelo', type: 'consumable', rarity: 'comum', subType: 'teleport_hub', icon: '📜', value: 20, buyPrice: 35, stackable: true, desc: 'Teleporta você de volta em segurança para o Castelo em Cinzas.' },
    'elixir_forca': { id: 'elixir_forca', name: 'Elixir da Fúria Titânica', type: 'consumable', rarity: 'raro', subType: 'buff_atk', icon: '⚗️', value: 150, buyPrice: 220, stackable: true, desc: 'Bebida alquímica que concede +25% de dano por 5 minutos.' },
    'elixir_pedra': { id: 'elixir_pedra', name: 'Tintura de Pele de Pedra', type: 'consumable', rarity: 'raro', subType: 'buff_def', icon: '🍶', value: 140, buyPrice: 200, stackable: true, desc: 'Endurece a pele reduzindo todo dano recebido em 12 por 5 minutos.' },

    // ─── MATERIAIS DE FORJA & EXPEDIÇÃO (PIXEL ART) ───
    'mat_fragmento_brasa': { id: 'mat_fragmento_brasa', name: 'Fragmento de Brasa Sagrada', type: 'material', rarity: 'raro', icon: '🔥', iconImg: 'assets/items/consumables/ore_raw_iron.png', value: 100, stackable: true, desc: 'Centelha incandescente das ruínas de Miraluz. Usado para aprimorar armas na Forja.' },
    'mat_lingote_ferro': { id: 'mat_lingote_ferro', name: 'Minério de Ferro Puro', type: 'material', rarity: 'comum', icon: '🧱', iconImg: 'assets/items/consumables/ore_raw_iron.png', value: 25, stackable: true, desc: 'Minério bruto purificado para forja e reforço de lâminas e armaduras.' },
    'mat_lingote_ouro': { id: 'mat_lingote_ouro', name: 'Barra de Ouro Imperial', type: 'material', rarity: 'raro', icon: '🪙', iconImg: 'assets/items/consumables/ingot_gold.png', value: 150, stackable: true, desc: 'Ouro puro de alta densidade das arcas reais de Miraluz.' },
    'mat_diamante_ancestral': { id: 'mat_diamante_ancestral', name: 'Diamante Estelar Lapidado', type: 'material', rarity: 'lendario', icon: '💎', iconImg: 'assets/items/consumables/gem_diamond.png', value: 400, stackable: true, desc: 'Gema brilhante indestrutível canalizadora de energias místicas.' },
    'mat_cristal_mata': { id: 'mat_cristal_mata', name: 'Cristal da Mata Profunda', type: 'material', rarity: 'incomum', icon: '💎', iconImg: 'assets/items/consumables/gem_diamond.png', value: 50, stackable: true, desc: 'Gema com reflexos esmeralda extraída de veios luminosos.' }`;

// Update starter gear icons
content = content.replace(
  `'sh_madeira_reforcada': { id: 'sh_madeira_reforcada', name: 'Broquel de Madeira Nobre', type: 'shield', rarity: 'comum', level: 1, defense: 4, hp: 20, icon: '🛡', iconImg: 'assets/icons/skills/Icon43.png', value: 30, desc: 'Madeira espessa com rebites de latão para defesa básica.' },`,
  `'sh_madeira_reforcada': { id: 'sh_madeira_reforcada', name: 'Broquel de Madeira Nobre', type: 'shield', rarity: 'comum', level: 1, defense: 4, hp: 20, icon: '🛡', iconImg: 'assets/items/armor/shields/shield_hero_01.png', value: 30, desc: 'Madeira espessa com rebites de latão para defesa básica.' },`
);

content = content.replace(
  `'hl_couro_batedor': { id: 'hl_couro_batedor', name: 'Capuz de Couro das Ruínas', type: 'helm', rarity: 'comum', level: 1, defense: 3, hp: 15, icon: '🪖', value: 30, desc: 'Protege contra ventos frios e pequenas lascas de pedra.' },`,
  `'hl_couro_batedor': { id: 'hl_couro_batedor', name: 'Capuz de Couro das Ruínas', type: 'helm', rarity: 'comum', level: 1, defense: 3, hp: 15, icon: '🪖', iconImg: 'assets/items/armor/helms/helm_hero_01.png', value: 30, desc: 'Protege contra ventos frios e pequenas lascas de pedra.' },`
);

content = content.replace(
  `'acc_anel_cobre': { id: 'acc_anel_cobre', name: 'Anel de Cobre Polido', type: 'ring', rarity: 'comum', level: 1, hp: 15, defense: 1, icon: '💍', value: 25, desc: 'Um aro simples que confere leve proteção.' },`,
  `'acc_anel_cobre': { id: 'acc_anel_cobre', name: 'Anel de Cobre Polido', type: 'ring', rarity: 'comum', level: 1, hp: 15, defense: 1, icon: '💍', iconImg: 'assets/items/accessories/rings/ring_hero_01.png', value: 25, desc: 'Um aro simples que confere leve proteção.' },`
);

content = content.replace(
  `'acc_amuleto_pedra': { id: 'acc_amuleto_pedra', name: 'Pingente de Quartzo Bruto', type: 'amulet', rarity: 'comum', level: 1, hp: 20, icon: '📿', value: 30, desc: 'Protege contra pequenos feitiços e dá vigor.' },`,
  `'acc_amuleto_pedra': { id: 'acc_amuleto_pedra', name: 'Pingente de Quartzo Bruto', type: 'amulet', rarity: 'comum', level: 1, hp: 20, icon: '📿', iconImg: 'assets/items/accessories/amulets/amulet_hero_01.png', value: 30, desc: 'Protege contra pequenos feitiços e dá vigor.' },`
);

// Inject generated block right before the Consumables section
if (!content.includes('// ─── ELMOS (HELMS) (20 ITENS PIXEL ART) ───')) {
  content = content.replace(oldConsumablesTarget, generatedBlock + '\n\n' + newConsumables);
} else {
  console.log('Block already present, updating consumables only.');
  content = content.replace(oldConsumablesTarget, newConsumables);
}

fs.writeFileSync(invFile, content, 'utf8');
console.log('Successfully updated InventoryManager.js');
