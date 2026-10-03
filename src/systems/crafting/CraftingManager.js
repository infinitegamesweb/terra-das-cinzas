// src/systems/crafting/CraftingManager.js
// Sistema de Criação de Itens, Forja e Alquimia

import { CRAFTING_RECIPES } from '../../data/crafting.data.js';

export class CraftingManager {
  constructor() {
    this.recipes = CRAFTING_RECIPES;
  }

  getRecipesByNpc(npcId) {
    return this.recipes.filter(r => r.npc === npcId);
  }

  canCraft(recipeId, player) {
    const recipe = this.recipes.find(r => r.id === recipeId);
    if (!recipe || !player) return { can: false, reason: 'Receita não encontrada.' };

    if (player.lvl < recipe.requiredLevel) {
      return { can: false, reason: `Requer Nível ${recipe.requiredLevel}.` };
    }
    if ((player.gold || 0) < recipe.goldCost) {
      return { can: false, reason: `Ouro insuficiente (necessário: ${recipe.goldCost}G).` };
    }

    const inventory = window.GameItems?.inventory || [];
    for (const ing of recipe.ingredients) {
      if (ing.itemId === 'cristal') {
        if ((player.crystal || 0) < ing.count) {
          return { can: false, reason: `Cristais insuficientes (${player.crystal || 0}/${ing.count}).` };
        }
      } else {
        const found = inventory.filter(item => item && (item.id === ing.itemId || item.itemId === ing.itemId));
        const total = found.reduce((sum, item) => sum + (item.count || 1), 0);
        if (total < ing.count) {
          return { can: false, reason: `${ing.name} insuficiente (${total}/${ing.count}).` };
        }
      }
    }

    return { can: true, recipe };
  }

  craft(recipeId, player) {
    const check = this.canCraft(recipeId, player);
    if (!check.can) {
      if (window.GameUI?.msg) window.GameUI.msg(` ${check.reason}`);
      return false;
    }

    const recipe = check.recipe;

    // Deduz o ouro
    player.gold -= recipe.goldCost;

    // Deduz os ingredientes
    const inventory = window.GameItems?.inventory || [];
    for (const ing of recipe.ingredients) {
      if (ing.itemId === 'cristal') {
        player.crystal -= ing.count;
      } else {
        let needed = ing.count;
        for (let i = 0; i < inventory.length && needed > 0; i++) {
          const item = inventory[i];
          if (item && (item.id === ing.itemId || item.itemId === ing.itemId)) {
            const take = Math.min(item.count || 1, needed);
            if (item.count && item.count > take) {
              item.count -= take;
            } else {
              inventory.splice(i, 1);
              i--;
            }
            needed -= take;
          }
        }
      }
    }

    // Entrega a recompensa
    if (recipe.result.itemId === 'potions') {
      player.potions = Math.min(9, (player.potions || 0) + recipe.result.count);
    } else {
      window.GameItems?.addItem?.(recipe.result.itemId, recipe.result.count, 0);
    }

    // Efeito sonoro e mensagem de sucesso
    if (recipe.category === 'forja') {
      window.GameAudio?.playHit?.();
    } else {
      window.GameAudio?.playHeal?.();
    }

    if (window.GameUI?.msg) {
      window.GameUI.msg(` ${recipe.result.name} criado com sucesso!`);
    }

    // Salva inventário e atualiza HUD
    window.GameItems?.saveInventory?.();
    window.renderUI?.({ p: player });

    return true;
  }

  renderRecipeList(npcId, player) {
    const list = this.getRecipesByNpc(npcId);
    return list.map(recipe => {
      const check = this.canCraft(recipe.id, player);
      const ings = recipe.ingredients.map(i => `${i.count}x ${i.name}`).join(' + ');
      return `
        <div style="background:#181520; border:1px solid #3d3647; border-radius:6px; padding:10px; margin-bottom:8px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:22px;">${recipe.icon}</span>
            <div>
              <b style="color:#fde047; font-size:13px;">${recipe.name}</b>
              <div style="color:#94a3b8; font-size:11px;">${recipe.desc}</div>
              <small style="color:#cbd5e1; font-size:10px;">Materiais: ${ings} ·  ${recipe.goldCost} Ouro (Nv. ${recipe.requiredLevel}+)</small>
            </div>
          </div>
          <button class="menu-button menu-primary craft-action-btn" data-recipe="${recipe.id}" style="padding:6px 12px; font-size:11px;" ${check.can ? '' : 'disabled'}>
            ${check.can ? 'CRIAR' : 'FALTA ITEM'}
          </button>
        </div>
      `;
    }).join('');
  }
}

export const craftingManager = new CraftingManager();

if (typeof window !== 'undefined') {
  window.GameCrafting = craftingManager;
}
