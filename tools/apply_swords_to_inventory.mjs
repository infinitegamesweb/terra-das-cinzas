import fs from 'fs';
import path from 'path';

const gameDir = 'D:/Game/Jogo WEB';
const invPath = path.join(gameDir, 'js/items-inventory.js');
let content = fs.readFileSync(invPath, 'utf8');

// 1. Atualizar armas existentes com iconImg
content = content
  .replace("'w_espada_ferro': { id: 'w_espada_ferro', name: 'Espada de Ferro Nobre', type: 'weapon', classId: 'guerreiro', rarity: 'comum', level: 1, damage: 14, defense: 2, icon: '⚔', value: 35,",
           "'w_espada_ferro': { id: 'w_espada_ferro', name: 'Espada de Ferro Nobre', type: 'weapon', classId: 'guerreiro', rarity: 'comum', level: 1, damage: 14, defense: 2, icon: '⚔', iconImg: 'assets/items/weapons/sword_2024_23.png', value: 35,")
  .replace("'w_lamina_cinzas': { id: 'w_lamina_cinzas', name: 'Lâmina das Cinzas', type: 'weapon', classId: 'guerreiro', rarity: 'raro', level: 15, damage: 36, defense: 6, crit: 0.06, icon: '🗡', value: 240,",
           "'w_lamina_cinzas': { id: 'w_lamina_cinzas', name: 'Lâmina das Cinzas', type: 'weapon', classId: 'guerreiro', rarity: 'raro', level: 15, damage: 36, defense: 6, crit: 0.06, icon: '🗡', iconImg: 'assets/items/weapons/sword_2024_02.png', value: 240,")
  .replace("'w_espadao_guardiao': { id: 'w_espadao_guardiao', name: 'Espadão do Guardião Rúnico', type: 'weapon', classId: 'guerreiro', rarity: 'epico', level: 45, damage: 85, defense: 15, hp: 80, icon: '⚔', value: 950,",
           "'w_espadao_guardiao': { id: 'w_espadao_guardiao', name: 'Espadão do Guardião Rúnico', type: 'weapon', classId: 'guerreiro', rarity: 'epico', level: 45, damage: 85, defense: 15, hp: 80, icon: '⚔', iconImg: 'assets/items/weapons/sword_2026_05.png', value: 950,")
  .replace("'w_gloria_rubra': { id: 'w_gloria_rubra', name: 'Glória Rubra da Fornalha', type: 'weapon', classId: 'guerreiro', rarity: 'lendario', level: 75, damage: 165, defense: 28, lifesteal: 0.05, icon: '🔥', value: 3800,",
           "'w_gloria_rubra': { id: 'w_gloria_rubra', name: 'Glória Rubra da Fornalha', type: 'weapon', classId: 'guerreiro', rarity: 'lendario', level: 75, damage: 165, defense: 28, lifesteal: 0.05, icon: '🔥', iconImg: 'assets/items/weapons/sword_2024_04.png', value: 3800,")
  .replace("'w_corte_eclipse': { id: 'w_corte_eclipse', name: 'Corte do Primeiro Fogo', type: 'weapon', classId: 'guerreiro', rarity: 'supremo', level: 120, damage: 320, defense: 55, crit: 0.12, lifesteal: 0.08, icon: '👑', value: 18000,",
           "'w_corte_eclipse': { id: 'w_corte_eclipse', name: 'Corte do Primeiro Fogo', type: 'weapon', classId: 'guerreiro', rarity: 'supremo', level: 120, damage: 320, defense: 55, crit: 0.12, lifesteal: 0.08, icon: '👑', iconImg: 'assets/items/weapons/sword_2025_04.png', value: 18000,")
  .replace("'sh_madeira_reforcada': { id: 'sh_madeira_reforcada', name: 'Broquel de Madeira Nobre', type: 'shield', rarity: 'comum', level: 1, defense: 4, hp: 20, icon: '🛡', value: 30,",
           "'sh_madeira_reforcada': { id: 'sh_madeira_reforcada', name: 'Broquel de Madeira Nobre', type: 'shield', rarity: 'comum', level: 1, defense: 4, hp: 20, icon: '🛡', iconImg: 'assets/icons/skills/Icon43.png', value: 30,")
  .replace("'pot_vida_pequena': { id: 'pot_vida_pequena', name: 'Poção de Vida Menor', type: 'consumable', rarity: 'comum', subType: 'heal', heal: 60, icon: '🧪', value: 15,",
           "'pot_vida_pequena': { id: 'pot_vida_pequena', name: 'Poção de Vida Menor', type: 'consumable', rarity: 'comum', subType: 'heal', heal: 60, icon: '🧪', iconImg: 'assets/icons/skills/Icon42.png', value: 15,");

// 2. Inserir novas espadas lendárias, épicas e raras no ITEM_DATABASE
const newSwordsCode = `
    // ─── COLEÇÃO LENDÁRIA DE ESPADAS PIXEL ART (SWORDTEMBER) ───
    'w_florete_cristal': { id: 'w_florete_cristal', name: 'Florete de Cristal Lunar', type: 'weapon', rarity: 'raro', level: 20, damage: 48, crit: 0.10, icon: '💎', iconImg: 'assets/items/weapons/sword_2024_07.png', value: 380, desc: 'Lâmina translúcida lapidada em quartzo estelar. Seus estocadas perfuram a armadura inimiga.' },
    'w_sabre_tormenta': { id: 'w_sabre_tormenta', name: 'Sabre da Tormenta Elétrica', type: 'weapon', rarity: 'raro', level: 25, damage: 56, crit: 0.08, icon: '⚡', iconImg: 'assets/items/weapons/sword_2024_08.png', value: 460, desc: 'Forjada durante uma tempestade de raios nas montanhas. Solta faíscas a cada corte.' },
    'w_foice_vento': { id: 'w_foice_vento', name: 'Ceifadora do Vento Cortante', type: 'weapon', rarity: 'raro', level: 30, damage: 65, crit: 0.12, icon: '🌪️', iconImg: 'assets/items/weapons/sword_2024_09.png', value: 580, desc: 'Corta o ar com velocidade inaudível, criando micro-vórtices cortantes.' },
    'w_devoradora_almas': { id: 'w_devoradora_almas', name: 'Devoradora de Almas Sepultada', type: 'weapon', rarity: 'epico', level: 50, damage: 105, lifesteal: 0.06, hp: 90, icon: '☠️', iconImg: 'assets/items/weapons/sword_2024_21.png', value: 1250, desc: 'Runas necromânticas gravadas na lâmina drenam a vitalidade dos alvos atingidos.' },
    'w_lamina_sombras': { id: 'w_lamina_sombras', name: 'Corte do Abismo Noturno', type: 'weapon', rarity: 'epico', level: 58, damage: 120, crit: 0.16, icon: '🌑', iconImg: 'assets/items/weapons/sword_2024_12.png', value: 1450, desc: 'Envolta em névoa negra perene. Os inimigos mal enxergam a direção de onde veio o golpe.' },
    'w_cutelo_magma': { id: 'w_cutelo_magma', name: 'Cutelo do Vulcão Ancestral', type: 'weapon', rarity: 'epico', level: 65, damage: 140, defense: 14, icon: '🔥', iconImg: 'assets/items/weapons/sword_2026_20.png', value: 1750, desc: 'Forjado em rocha vulcânica densa. Causa chamas intensas e destrói escudos.' },
    'w_tridente_arcano': { id: 'w_tridente_arcano', name: 'Lança-Espada da Maré Cósmica', type: 'weapon', rarity: 'epico', level: 70, damage: 155, arcane: 60, icon: '🔱', iconImg: 'assets/items/weapons/sword_2026_25.png', value: 1980, desc: 'Conduz a força das marés primordiais para golpes arcanos avassaladores.' },
    'w_lamina_do_sol': { id: 'w_lamina_do_sol', name: 'Aurora do Sol Radiante', type: 'weapon', rarity: 'lendario', level: 85, damage: 195, arcane: 75, crit: 0.12, icon: '☀️', iconImg: 'assets/items/weapons/sword_2026_19.png', value: 5200, desc: 'Emite o brilho fulgurante do zênite solar. Mortos-vivos entram em combustão ao toque.' },
    'w_asa_sagrada': { id: 'w_asa_sagrada', name: 'Lâmina das Asas Celestiais', type: 'weapon', rarity: 'lendario', level: 90, damage: 215, hp: 180, lifesteal: 0.05, icon: '🪽', iconImg: 'assets/items/weapons/sword_2025_22.png', value: 6000, desc: 'Pena de arcanjo transmuta em aço sagrado inviolável que protege e cura seu portador.' },
    'w_espada_esmeralda': { id: 'w_espada_esmeralda', name: 'Glaive da Floresta Antiga', type: 'weapon', rarity: 'lendario', level: 98, damage: 235, crit: 0.20, icon: '🌿', iconImg: 'assets/items/weapons/sword_2026_15.png', value: 6800, desc: 'Cresce e se regenera com gavinhas vegetais e cristais de esmeralda milenares.' },
    'w_chama_celeste': { id: 'w_chama_celeste', name: 'Chama Celeste da Criação', type: 'weapon', rarity: 'supremo', level: 125, damage: 360, arcane: 130, crit: 0.15, lifesteal: 0.08, icon: '🌌', iconImg: 'assets/items/weapons/sword_2025_01.png', value: 21000, desc: 'Artefato cósmico que riscou o firmamento antes das ruínas existirem.' },
    'w_centelha_draconica': { id: 'w_centelha_draconica', name: 'Presa do Dragão Primordial', type: 'weapon', rarity: 'supremo', level: 140, damage: 410, defense: 45, crit: 0.22, lifesteal: 0.12, icon: '🐲', iconImg: 'assets/items/weapons/sword_2026_29.png', value: 26000, desc: 'Esculpida a partir do chifre de um wyrm ancião. Ruge como uma tempestade a cada investida.' },
`;

if (!content.includes('w_sabre_tormenta')) {
  content = content.replace("    // ─── ARMAS: ARQUEIRO ───", newSwordsCode + "\n    // ─── ARMAS: ARQUEIRO ───");
  console.log('Novas espadas pixel art adicionadas ao ITEM_DATABASE!');
}

// 3. Atualizar renderização da mochila (backpack slots)
content = content.replace(
  '<span class="inv-icon">${base.icon}</span>',
  '<span class="inv-icon">${base.iconImg ? `<img src="${base.iconImg}" class="inv-item-img" alt="${base.name}" />` : base.icon}</span>'
);

// 4. Atualizar renderização do paperdoll
content = content.replace(
  '<span class="inv-doll-icon">${base.icon}</span>',
  '<span class="inv-doll-icon">${base.iconImg ? `<img src="${base.iconImg}" class="inv-doll-img" alt="${base.name}" />` : base.icon}</span>'
);

// 5. Atualizar renderização do inspector
content = content.replace(
  '<span class="inv-inspect-big-icon">${base.icon}</span>',
  '<span class="inv-inspect-big-icon">${base.iconImg ? `<img src="${base.iconImg}" class="inv-inspect-img" alt="${base.name}" />` : base.icon}</span>'
);

fs.writeFileSync(invPath, content, 'utf8');
console.log('js/items-inventory.js: renderização e banco de espadas atualizados com sucesso!');
