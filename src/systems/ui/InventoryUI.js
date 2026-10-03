// src/systems/ui/InventoryUI.js
// ─────────────────────────────────────────────────────────────
// TERRA DAS CINZAS · Interface de Inventário Fiel ao Mockup & Modelo 140ppi
// 1:1 Backdrop em Pixel Art, Paperdoll em Arco com 9 Slots, Grade 5x5 (25 Slots), Inspetor Gótico
// ZERO EMOJIS · 100% Assets Gráficos em Pixel Art
// ─────────────────────────────────────────────────────────────

import { soundSystem } from '../audio/SoundSystem.js';

export class InventoryUI {
  constructor() {
    this.activeFilter = 'all';
    this.selectedSlot = null;
    this.maxSlots = 25; // Grade 5x5 (25 slots) fiel ao mockup e modelo 140ppi
    this.initKeyBindings();
  }

  get itemsSystem() {
    return window.GameItems || null;
  }

  isInventoryModalOpen() {
    return !!document.getElementById('inventoryModalOverlay');
  }

  closeInventoryModal() {
    const el = document.getElementById('inventoryModalOverlay');
    if (el) {
      el.remove();
      this.selectedSlot = null;
      try { soundSystem.playChest?.(); } catch (e) {}
    }
  }

  toggleInventoryModal() {
    if (this.isInventoryModalOpen()) {
      this.closeInventoryModal();
    } else {
      this.openInventoryModal();
    }
  }

  openInventoryModal() {
    this.closeInventoryModal();
    const items = this.itemsSystem;
    if (!items) return;

    try { soundSystem.playLoot?.(); } catch (e) {}

    const p = window._tdcPlayer || { lvl: 24, gold: 2450, crystal: 310, classId: 'guerreiro', hp: 1840, max: 1840, xp: 450, nextLvlXp: 1000 };
    const charClass = window.GameClasses?.get ? window.GameClasses.get(p.classId) : { name: 'Guerreiro', armor: 35, critChance: 0.05 };
    const bonuses = items.getEquipmentBonuses ? items.getEquipmentBonuses() : { damage: 0, defense: 0, hp: 0, arcane: 0, crit: 0, lifesteal: 0 };

    const overlay = document.createElement('div');
    overlay.id = 'inventoryModalOverlay';
    overlay.className = 'hub-modal-overlay inv-fullscreen-overlay';

    const dmgVal = Math.round((280 + (p.lvl || 24) * 12 + bonuses.damage) * (p.atkBuffUntil && Date.now() < p.atkBuffUntil ? 1.25 : 1));
    const defVal = (charClass.armor || 35) + bonuses.defense + 340 + (p.defBuffUntil && Date.now() < p.defBuffUntil ? 25 : 0);
    const hpVal = (p.hp || 1840);
    const maxHpVal = (p.max || 1840) + bonuses.hp;
    const arcVal = Math.round((120 + (p.lvl || 24) * 15 + bonuses.arcane));
    const xpPercent = Math.min(100, Math.max(5, Math.round(((p.xp || 450) / (p.nextLvlXp || 1000)) * 100)));

    overlay.innerHTML = `
      <div class="inv-mockup-dialog" role="dialog" aria-modal="true" aria-label="Inventário de Terra das Cinzas">
        <!-- Header: Avatar, Nível, Barra de XP e Fechar -->
        <img src="assets/ui/inventory/avatar_hooded.png" class="inv-hdr-avatar" alt="Retrato do Herói" />
        <div class="inv-hdr-lvl" id="invPlayerLvl">NÍVEL ${p.lvl || 24}</div>
        <div class="inv-hdr-xp-track">
          <div class="inv-hdr-xp-fill" style="width: ${xpPercent}%"></div>
        </div>

        <button class="inv-mockup-close" id="invModalClose" title="Fechar (ESC ou I)">&times;</button>

        <!-- Coluna 1: Paperdoll 9 Slots nas Catedrais Góticas -->
        <div class="inv-paperdoll-slot slot-helm" data-doll-slot="helm">
          ${this.renderPaperdollSlot('helm', 'assets/items/dark_fantasy/helm_hood_leather.png', 'ELMO')}
        </div>
        <div class="inv-paperdoll-slot slot-armor" data-doll-slot="armor">
          ${this.renderPaperdollSlot('armor', 'assets/items/dark_fantasy/armor_plate_spiked.png', 'ARMADURA')}
        </div>
        <div class="inv-paperdoll-slot slot-boots" data-doll-slot="boots">
          ${this.renderPaperdollSlot('boots', 'assets/items/dark_fantasy/boots_greaves.png', 'BOTAS')}
        </div>
        <div class="inv-paperdoll-slot slot-weapon" data-doll-slot="weapon">
          ${this.renderPaperdollSlot('weapon', 'assets/items/weapons/infernal_blade_64.png', 'ARMA')}
        </div>
        <div class="inv-paperdoll-slot slot-gloves" data-doll-slot="gloves">
          ${this.renderPaperdollSlot('gloves', 'assets/items/armor/shields/shield_hero_01.png', 'LUVAS')}
        </div>
        <div class="inv-paperdoll-slot slot-ring1" data-doll-slot="ring1">
          ${this.renderPaperdollSlot('ring1', 'assets/items/accessories/rings/ring_hero_01.png', 'ANEL 1')}
        </div>
        <div class="inv-paperdoll-slot slot-shield" data-doll-slot="shield">
          ${this.renderPaperdollSlot('shield', 'assets/items/dark_fantasy/amulet_ruby_medallion.png', 'ESCUDO')}
        </div>
        <div class="inv-paperdoll-slot slot-amulet" data-doll-slot="amulet">
          ${this.renderPaperdollSlot('amulet', 'assets/items/accessories/amulets/amulet_hero_01.png', 'AMULETO')}
        </div>
        <div class="inv-paperdoll-slot slot-ring2" data-doll-slot="ring2">
          ${this.renderPaperdollSlot('ring2', 'assets/items/accessories/rings/ring_hero_01.png', 'ANEL 2')}
        </div>

        <!-- Coluna 1 Inferior: Placa de Combat Stats Gótica -->
        <div class="inv-combat-stats-plaque">
          <div class="inv-stats-avatar-box">
            <img src="assets/ui/inventory/avatar_hooded.png" class="inv-stats-hero-img" alt="Herói" />
            <div class="inv-stats-hero-name">${charClass.name || 'Guerreiro'}</div>
          </div>
          <div class="inv-stats-grid-cols">
            <div class="inv-stat-entry stat-damage">
              <span class="inv-stat-label">DANO</span>
              <span class="inv-stat-val-text num-damage">${dmgVal}</span>
            </div>
            <div class="inv-stat-entry stat-defense">
              <span class="inv-stat-label">DEFESA</span>
              <span class="inv-stat-val-text num-defense">${defVal}</span>
            </div>
            <div class="inv-stat-entry stat-health">
              <span class="inv-stat-label">VIDA</span>
              <span class="inv-stat-val-text num-health">${hpVal}/${maxHpVal}</span>
            </div>
            <div class="inv-stat-entry stat-arcane">
              <span class="inv-stat-label">ARCANO</span>
              <span class="inv-stat-val-text num-arcane">${arcVal}</span>
            </div>
          </div>
        </div>

        <!-- Coluna 2: Abas de Categoria do Mockup -->
        <div class="inv-backpack-tabs">
          <button class="inv-tab-btn ${this.activeFilter === 'all' ? 'active' : ''}" data-filter="all">TODOS</button>
          <button class="inv-tab-btn ${this.activeFilter === 'equipment' ? 'active' : ''}" data-filter="equipment">EQUIPAMENTOS</button>
          <button class="inv-tab-btn ${this.activeFilter === 'consumable' ? 'active' : ''}" data-filter="consumable">POÇÕES</button>
          <button class="inv-tab-btn ${this.activeFilter === 'material' ? 'active' : ''}" data-filter="material">MATERIAIS</button>
        </div>

        <!-- Coluna 2: Grade 5x5 (25 Slots) Idêntica ao Mockup e Wireframe -->
        <div class="inv-slots-grid-5x5" id="invFullGrid">
          ${this.renderBackpackSlotsHtml()}
        </div>

        <!-- Coluna 3: Painel de Inspeção Gótico -->
        <div class="inv-inspector-gothic-panel" id="invInspectorPanel">
          ${this.renderInspectorHtml()}
        </div>

        <!-- Barra Inferior de Moedas & Cristais -->
        <div class="inv-currency-plaque">
          <div class="inv-curr-item">
            <img src="assets/items/dark_fantasy/gold_coins_stack.png" class="inv-curr-icon" alt="Ouro" />
            <span class="inv-curr-label">OURO:</span>
            <span class="inv-curr-val" id="invGold">${p.gold != null ? Number(p.gold).toLocaleString('pt-BR') : '2.450'}</span>
          </div>
          <div class="inv-curr-item">
            <img src="assets/items/dark_fantasy/crystal_shadow_gem.png" class="inv-curr-icon" alt="Cristais" />
            <span class="inv-curr-label">CRISTAIS:</span>
            <span class="inv-curr-val" id="invCrystal">${p.crystal != null ? Number(p.crystal).toLocaleString('pt-BR') : '310'}</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.bindInventoryModalEvents(overlay);
  }

  renderPaperdollSlot(slotKey, defaultIconImg, slotLabel) {
    const items = this.itemsSystem;
    const equipped = items?.equipped || {};
    const it = equipped[slotKey];
    const silhouette = `assets/ui/inventory/sil_${slotKey}.png`;

    if (it) {
      const base = items.ITEM_DATABASE[it.id] || { name: it.id, rarity: 'comum', iconImg: defaultIconImg };
      const rarityName = base.rarity || 'comum';
      const isSelected = this.selectedSlot?.type === 'equip' && this.selectedSlot?.slot === slotKey;
      const iconSrc = base.iconImg || defaultIconImg;
      return `
        <div class="inv-doll-slot-item filled ${isSelected ? 'selected' : ''}" data-doll-slot="${slotKey}" style="background-image: url('assets/ui/inventory/slot-${rarityName}.png');" title="${items.getItemTooltip ? items.getItemTooltip(it) : base.name}">
          <img src="${iconSrc}" class="inv-slot-img" alt="${base.name}" />
          ${it.enhanceLevel ? `<span class="inv-enhance-badge">+${it.enhanceLevel}</span>` : ''}
        </div>
      `;
    } else {
      const isSelected = this.selectedSlot?.type === 'equip' && this.selectedSlot?.slot === slotKey;
      return `
        <div class="inv-doll-slot-item empty ${isSelected ? 'selected' : ''}" data-doll-slot="${slotKey}" style="background-image: url('assets/ui/inventory/slot-comum.png');" title="${slotLabel} (Vazio)">
          <img src="${silhouette}" class="inv-slot-silhouette" alt="${slotLabel}" />
        </div>
      `;
    }
  }

  renderBackpackSlotsHtml() {
    const items = this.itemsSystem;
    const inventory = items?.inventory || [];
    let html = '';

    const filteredItems = inventory.map((it, idx) => ({ ...it, originalIndex: idx })).filter(it => {
      if (this.activeFilter === 'all') return true;
      const base = items?.ITEM_DATABASE?.[it.id];
      if (!base) return true;
      if (this.activeFilter === 'equipment') return ['weapon', 'shield', 'helm', 'armor', 'gloves', 'boots', 'ring', 'amulet'].includes(base.type);
      if (this.activeFilter === 'consumable') return base.type === 'consumable';
      if (this.activeFilter === 'material') return base.type === 'material';
      return true;
    });

    for (let i = 0; i < this.maxSlots; i++) {
      const it = filteredItems[i];
      if (it) {
        const base = items?.ITEM_DATABASE?.[it.id] || { name: it.id, rarity: 'common', iconImg: 'assets/items/weapons/sword_hero_01.png' };
        const rarityName = base.rarity || 'common';
        const isSelected = this.selectedSlot?.type === 'inv' && this.selectedSlot?.index === it.originalIndex;
        const iconSrc = base.iconImg || 'assets/items/weapons/sword_hero_01.png';
        html += `
          <div class="inv-slot-mockup filled ${isSelected ? 'selected' : ''}" data-inv-idx="${it.originalIndex}" style="background-image: url('assets/ui/inventory/slot-${rarityName}.png');" title="${items.getItemTooltip ? items.getItemTooltip(it) : base.name}">
            <img src="${iconSrc}" class="inv-slot-img" alt="${base.name}" />
            ${it.enhanceLevel ? `<span class="inv-enhance-badge">+${it.enhanceLevel}</span>` : ''}
            ${it.count > 1 ? `<span class="inv-stack-count">${it.count}</span>` : ''}
          </div>
        `;
      } else {
        html += `
          <div class="inv-slot-mockup empty" style="background-image: url('assets/ui/inventory/slot-common.png');"></div>
        `;
      }
    }
    return html;
  }

  renderInspectorHtml() {
    const items = this.itemsSystem;
    if (!items) return '';

    let item = null;
    let isEquipped = false;

    if (this.selectedSlot?.type === 'equip') {
      item = items.equipped?.[this.selectedSlot.slot];
      isEquipped = true;
    } else if (this.selectedSlot?.type === 'inv' && this.selectedSlot?.index != null) {
      item = items.inventory?.[this.selectedSlot.index];
      isEquipped = false;
    }

    if (!item) {
      if (items.equipped?.weapon) {
        item = items.equipped.weapon;
        isEquipped = true;
      } else if (items.inventory?.length > 0) {
        item = items.inventory[0];
        isEquipped = false;
      }
    }

    if (!item) {
      return `
        <div class="inv-inspector-empty-mockup">
          <div class="inv-empty-gem"></div>
          <h4>NENHUM ITEM SELECIONADO</h4>
          <p>Selecione um item da mochila ou equipamento.</p>
        </div>
      `;
    }

    const base = items.ITEM_DATABASE?.[item.id] || { name: item.id, rarity: 'common', desc: 'Artefato antigo das cinzas.', iconImg: 'assets/items/weapons/sword_hero_01.png' };
    const rar = items.RARITY_COLORS?.[base.rarity] || items.RARITY_COLORS?.comum || { bg: '#332042', border: '#a855f7', text: '#e9d5ff' };
    const mult = 1 + (item.enhanceLevel || 0) * 0.12;

    const stats = [];
    if (base.damage) stats.push(`+${Math.round(base.damage * mult)} DANO DE FOGO`);
    if (base.crit) stats.push(`+${Math.round(base.crit * mult * 100)}% CHANCE CRÍTICA`);
    if (base.defense) stats.push(`+${Math.round(base.defense * mult)} DEFESA`);
    if (base.hp) stats.push(`+${Math.round(base.hp * mult)} VITALIDADE`);
    if (base.arcane) stats.push(`+${Math.round(base.arcane * mult)} PODER ARCANO`);
    if (base.lifesteal) stats.push(`+${Math.round(base.lifesteal * 100)}% ROUBO DE VIDA`);
    if (base.heal) stats.push(`+${base.heal} VIDA RESTAURADA`);
    if (base.energy) stats.push(`+${base.energy} ENERGIA`);

    const isEquippable = ['weapon', 'shield', 'helm', 'armor', 'gloves', 'boots', 'ring', 'amulet'].includes(base.type);
    const isConsumable = base.type === 'consumable';
    const iconSrc = base.iconImg || 'assets/items/weapons/sword_hero_01.png';
    const rarityLabel = base.rarity === 'epico' ? 'ARMA ÉPICA' : (base.rarity || 'comum').toUpperCase();

    return `
      <div class="inv-inspector-card-mockup">
        <!-- Preview do Item com Aura Mística Flutuante -->
        <div class="inv-inspector-preview-box" style="background-image: url('assets/ui/inventory/slot-${base.rarity || 'comum'}.png'); background-size: 80px 80px; background-repeat: no-repeat; background-position: center;">
          <img src="${iconSrc}" class="inv-inspector-big-item-img" alt="${base.name}" />
          ${item.enhanceLevel ? `<span class="inv-enhance-badge">+${item.enhanceLevel}</span>` : ''}
        </div>

        <!-- Nome do Item em Tipografia Dourada Épica -->
        <h3 class="inv-inspector-title">${items.getItemName ? items.getItemName(item) : base.name}</h3>

        <!-- Faixa de Raridade com Brilho Gótico -->
        <div class="inv-rarity-banner" style="background:${rar.bg}; border: 1px solid ${rar.border}; color:${rar.text};">
          ${rarityLabel}
        </div>

        <!-- Lista de Bônus de Atributos -->
        <div class="inv-inspector-stat-highlights">
          ${stats.map(s => `<div class="stat-highlight-entry">${s}</div>`).join('')}
        </div>

        <!-- Descrição e Lore em Itálico -->
        <div class="inv-inspector-lore">
          <em>"${base.desc || 'Forjada nas profundezas vulcânicas da Montanha das Cinzas, esta lâmina flamejante arde com o poder dos demônios antigos. Seu toque queima a própria alma do inimigo.'}"</em>
        </div>

        <!-- Botões de Ação com Estética Fiel ao Mockup -->
        <div class="inv-inspector-actions-row">
          ${isEquipped ? `
            <button class="inv-btn-gothic btn-unequip" id="btnInspectUnequip">DESEQUIPAR</button>
          ` : isEquippable ? `
            <button class="inv-btn-gothic btn-equip" id="btnInspectEquip">EQUIPAR</button>
          ` : isConsumable ? `
            <button class="inv-btn-gothic btn-equip" id="btnInspectUse">USAR</button>
          ` : ''}

          ${isEquippable ? `
            <button class="inv-btn-gothic btn-forge" id="btnInspectForge">FORJAR</button>
          ` : ''}

          ${!isEquipped ? `
            <button class="inv-btn-gothic btn-discard" id="btnInspectDiscard">DESCARTAR</button>
          ` : ''}
        </div>
      </div>
    `;
  }

  bindInventoryModalEvents(overlay) {
    const closeBtn = overlay.querySelector('#invModalClose');
    if (closeBtn) closeBtn.onclick = () => this.closeInventoryModal();

    overlay.onclick = (e) => {
      if (e.target === overlay) {
        this.closeInventoryModal();
      }
    };

    overlay.querySelectorAll('.inv-tab-btn').forEach(btn => {
      btn.onclick = () => {
        this.activeFilter = btn.dataset.filter;
        overlay.querySelectorAll('.inv-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        const grid = overlay.querySelector('#invFullGrid');
        if (grid) grid.innerHTML = this.renderBackpackSlotsHtml();
        this.rebindSlotEvents(overlay);
        try { soundSystem.playChest?.(); } catch (e) {}
      };
    });

    this.rebindSlotEvents(overlay);
    this.rebindInspectorActionEvents(overlay);
  }

  rebindSlotEvents(overlay) {
    const items = this.itemsSystem;
    if (!items) return;

    // Slots da Mochila
    overlay.querySelectorAll('.inv-slot-mockup.filled').forEach(slot => {
      slot.onclick = () => {
        const idx = Number(slot.dataset.invIdx);
        this.selectedSlot = { type: 'inv', index: idx };
        this.updateInspectorAndSelection(overlay);
        try { soundSystem.playClick?.(); } catch (e) {}
      };
      slot.ondblclick = () => {
        const idx = Number(slot.dataset.invIdx);
        const it = items.inventory?.[idx];
        if (!it) return;
        const base = items.ITEM_DATABASE?.[it.id];
        if (base && ['weapon', 'shield', 'helm', 'armor', 'gloves', 'boots', 'ring', 'amulet'].includes(base.type)) {
          items.equipItem?.(idx);
          try { soundSystem.playLoot?.(); } catch (e) {}
        } else if (base && base.type === 'consumable') {
          items.useConsumable?.(idx);
          try { soundSystem.playPotion?.(); } catch (e) {}
        }
        this.refreshAllInventoryViews(overlay);
      };
    });

    // Slots do Paperdoll Equipado
    overlay.querySelectorAll('.inv-paperdoll-slot').forEach(slotWrap => {
      slotWrap.onclick = () => {
        const slotKey = slotWrap.dataset.dollSlot;
        if (items.equipped?.[slotKey]) {
          this.selectedSlot = { type: 'equip', slot: slotKey };
          this.updateInspectorAndSelection(overlay);
          try { soundSystem.playClick?.(); } catch (e) {}
        }
      };
      slotWrap.ondblclick = () => {
        const slotKey = slotWrap.dataset.dollSlot;
        if (items.equipped?.[slotKey]) {
          items.unequipItem?.(slotKey);
          this.selectedSlot = null;
          this.refreshAllInventoryViews(overlay);
          try { soundSystem.playChest?.(); } catch (e) {}
        }
      };
    });
  }

  updateInspectorAndSelection(overlay) {
    const inspector = overlay.querySelector('#invInspectorPanel');
    if (inspector) {
      inspector.innerHTML = this.renderInspectorHtml();
      this.rebindInspectorActionEvents(overlay);
    }

    // Atualiza classe 'selected' nos slots
    overlay.querySelectorAll('.inv-slot-mockup').forEach(s => {
      const idx = s.dataset.invIdx != null ? Number(s.dataset.invIdx) : null;
      const isSel = this.selectedSlot?.type === 'inv' && this.selectedSlot?.index === idx;
      s.classList.toggle('selected', isSel);
    });

    overlay.querySelectorAll('.inv-doll-slot-item').forEach(s => {
      const slotKey = s.dataset.dollSlot;
      const isSel = this.selectedSlot?.type === 'equip' && this.selectedSlot?.slot === slotKey;
      s.classList.toggle('selected', isSel);
    });
  }

  rebindInspectorActionEvents(overlay) {
    const items = this.itemsSystem;
    if (!items) return;

    const btnEquip = overlay.querySelector('#btnInspectEquip');
    if (btnEquip) {
      btnEquip.onclick = () => {
        if (this.selectedSlot?.type === 'inv') {
          items.equipItem?.(this.selectedSlot.index);
          this.refreshAllInventoryViews(overlay);
          try { soundSystem.playLoot?.(); } catch (e) {}
        }
      };
    }

    const btnUnequip = overlay.querySelector('#btnInspectUnequip');
    if (btnUnequip) {
      btnUnequip.onclick = () => {
        if (this.selectedSlot?.type === 'equip') {
          items.unequipItem?.(this.selectedSlot.slot);
          this.selectedSlot = null;
          this.refreshAllInventoryViews(overlay);
          try { soundSystem.playChest?.(); } catch (e) {}
        }
      };
    }

    const btnUse = overlay.querySelector('#btnInspectUse');
    if (btnUse) {
      btnUse.onclick = () => {
        if (this.selectedSlot?.type === 'inv') {
          items.useConsumable?.(this.selectedSlot.index);
          this.refreshAllInventoryViews(overlay);
          try { soundSystem.playPotion?.(); } catch (e) {}
        }
      };
    }

    const btnForge = overlay.querySelector('#btnInspectForge');
    if (btnForge) {
      btnForge.onclick = () => {
        let it = null;
        if (this.selectedSlot?.type === 'equip') it = items.equipped?.[this.selectedSlot.slot];
        else if (this.selectedSlot?.type === 'inv') it = items.inventory?.[this.selectedSlot.index];
        if (it) {
          this.closeInventoryModal();
          if (window.GameCastleHub?.openCastleModal) {
            window.GameCastleHub.openCastleModal('blacksmith');
          }
        }
      };
    }

    const btnDiscard = overlay.querySelector('#btnInspectDiscard');
    if (btnDiscard) {
      btnDiscard.onclick = () => {
        if (this.selectedSlot?.type === 'inv') {
          const idx = this.selectedSlot.index;
          const it = items.inventory?.[idx];
          if (!it) return;
          const base = items.ITEM_DATABASE?.[it.id] || { name: it.id };
          if (confirm(`Deseja descartar ${base.name}?`)) {
            items.inventory.splice(idx, 1);
            items.saveInventory?.();
            this.selectedSlot = null;
            this.refreshAllInventoryViews(overlay);
            try { soundSystem.playClick?.(); } catch (e) {}
          }
        }
      };
    }
  }

  refreshAllInventoryViews(overlay) {
    const items = this.itemsSystem;
    if (!items || !overlay) return;

    // Atualiza badges
    const p = window._tdcPlayer || {};
    const lvlEl = overlay.querySelector('#invPlayerLvl');
    if (lvlEl) lvlEl.textContent = `NÍVEL ${p.lvl || 24}`;
    const goldEl = overlay.querySelector('#invGold');
    if (goldEl) goldEl.textContent = p.gold != null ? Number(p.gold).toLocaleString('pt-BR') : '2.450';
    const crystalEl = overlay.querySelector('#invCrystal');
    if (crystalEl) crystalEl.textContent = p.crystal != null ? Number(p.crystal).toLocaleString('pt-BR') : '310';

    // Atualiza slots do paperdoll
    const slots = [
      { key: 'helm', badge: 'Y' },
      { key: 'armor', badge: 'C' },
      { key: 'gloves', badge: 'D' },
      { key: 'weapon', badge: 'F' },
      { key: 'shield', badge: 'G' },
      { key: 'ring1', badge: 'H' },
      { key: 'ring2', badge: 'I' },
      { key: 'boots', badge: 'E' },
      { key: 'amulet', badge: 'J' }
    ];
    slots.forEach(({ key, badge }) => {
      const wrap = overlay.querySelector(`.slot-${key}`);
      if (wrap) {
        wrap.innerHTML = this.renderPaperdollSlot(key, 'assets/items/weapons/infernal_blade_64.png', badge);
      }
    });

    // Atualiza números de atributos
    const charClass = window.GameClasses?.get ? window.GameClasses.get(p.classId) : { name: 'Guerreiro', armor: 35, critChance: 0.05 };
    const bonuses = items.getEquipmentBonuses ? items.getEquipmentBonuses() : { damage: 0, defense: 0, hp: 0, arcane: 0, crit: 0, lifesteal: 0 };
    const numDmg = overlay.querySelector('.num-damage');
    if (numDmg) numDmg.textContent = Math.round((280 + (p.lvl || 24) * 12 + bonuses.damage) * (p.atkBuffUntil && Date.now() < p.atkBuffUntil ? 1.25 : 1));
    const numDef = overlay.querySelector('.num-defense');
    if (numDef) numDef.textContent = (charClass.armor || 35) + bonuses.defense + 340 + (p.defBuffUntil && Date.now() < p.defBuffUntil ? 25 : 0);
    const numHp = overlay.querySelector('.num-health');
    if (numHp) numHp.textContent = `${p.hp || 1840}/${(p.max || 1840) + bonuses.hp}`;
    const numArc = overlay.querySelector('.num-arcane');
    if (numArc) numArc.textContent = Math.round((120 + (p.lvl || 24) * 15 + bonuses.arcane));

    // Atualiza grade da mochila
    const grid = overlay.querySelector('#invFullGrid');
    if (grid) grid.innerHTML = this.renderBackpackSlotsHtml();

    // Atualiza inspetor
    const insp = overlay.querySelector('#invInspectorPanel');
    if (insp) insp.innerHTML = this.renderInspectorHtml();

    this.rebindSlotEvents(overlay);
    this.rebindInspectorActionEvents(overlay);
  }

  initKeyBindings() {
    window.addEventListener('keydown', (e) => {
      if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const overlay = document.getElementById('inventoryModalOverlay');

      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        this.toggleInventoryModal();
        return;
      }

      if (e.key === 'Escape') {
        if (this.isInventoryModalOpen()) {
          e.preventDefault();
          this.closeInventoryModal();
          return;
        }
      }

      // Atalhos quando a janela de inventário está aberta
      if (overlay) {
        const keyMap = {
          'y': 'helm', 'Y': 'helm',
          'c': 'armor', 'C': 'armor',
          'd': 'gloves', 'D': 'gloves',
          'f': 'weapon', 'F': 'weapon',
          'g': 'shield', 'G': 'shield',
          'h': 'ring1', 'H': 'ring1',
          'e': 'boots', 'E': 'boots',
          'j': 'amulet', 'J': 'amulet'
        };

        if (keyMap[e.key]) {
          const slotKey = keyMap[e.key];
          if (this.itemsSystem?.equipped?.[slotKey]) {
            this.selectedSlot = { type: 'equip', slot: slotKey };
            this.updateInspectorAndSelection(overlay);
            try { soundSystem.playClick?.(); } catch (err) {}
          }
        }

        // Tabs 1, 2, 3, 4
        const tabFilters = ['all', 'equipment', 'consumable', 'material'];
        if (['1', '2', '3', '4'].includes(e.key)) {
          const f = tabFilters[Number(e.key) - 1];
          if (f) {
            this.activeFilter = f;
            overlay.querySelectorAll('.inv-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === f));
            const grid = overlay.querySelector('#invFullGrid');
            if (grid) grid.innerHTML = this.renderBackpackSlotsHtml();
            this.rebindSlotEvents(overlay);
            try { soundSystem.playChest?.(); } catch (err) {}
          }
        }
      }
    });
  }
}

export const inventoryUI = new InventoryUI();
if (typeof window !== 'undefined') {
  window.GameInventoryUI = inventoryUI;
}
