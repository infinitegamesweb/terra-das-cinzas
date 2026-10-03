// src/systems/marketplace/MarketManager.js
  // ─────────────────────────────────────────────────────────────
  // TERRA DAS CINZAS · Bazar local (protótipo solo)
  // ─────────────────────────────────────────────────────────────

  let marketListings = [
    { id: 'm1', seller: 'Bazar de Miraluz', itemId: 'w_espada_ferro', enhanceLevel: 2, price: 95, date: 'Oferta de demonstração' },
    { id: 'm2', seller: 'Bazar de Miraluz', itemId: 'w_arco_ecos', enhanceLevel: 3, price: 340, date: 'Oferta de demonstração' },
    { id: 'm3', seller: 'Bazar de Miraluz', itemId: 'w_cetro_chama_antiga', enhanceLevel: 1, price: 290, date: 'Oferta de demonstração' },
    { id: 'm4', seller: 'Bazar de Miraluz', itemId: 'acc_anel_falcao', enhanceLevel: 0, price: 280, date: 'Oferta de demonstração' },
    { id: 'm5', seller: 'Bazar de Miraluz', itemId: 'acc_amuleto_berserker', enhanceLevel: 2, price: 490, date: 'Oferta de demonstração' },
    { id: 'm6', seller: 'Bazar de Miraluz', itemId: 'pot_vida_suprema', count: 3, enhanceLevel: 0, price: 310, date: 'Oferta de demonstração' }
  ];

  let myListings = [];

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function safeInteger(value, fallback = 0, min = 0, max = 100000000) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.floor(number))) : fallback;
  }

  function itemIcon(base) {
    const path = typeof base.iconImg === 'string' ? base.iconImg : '';
    if (path.startsWith('assets/') && !path.includes('..')) {
      return `<img src="${escapeHTML(path)}" alt="" loading="lazy">`;
    }
    return escapeHTML(base.icon || '◇');
  }

  function normalizeListing(listing, index) {
    if (!listing || typeof listing !== 'object' || typeof listing.itemId !== 'string') return null;
    return {
      id: String(listing.id || `listing-${index}`).slice(0, 80),
      seller: String(listing.seller || 'Bazar de Miraluz').slice(0, 60),
      itemId: listing.itemId.slice(0, 100),
      enhanceLevel: safeInteger(listing.enhanceLevel, 0, 0, 99),
      count: safeInteger(listing.count, 1, 1, 999),
      price: safeInteger(listing.price, 0, 0, 100000000),
      date: String(listing.date || 'Oferta local').slice(0, 60)
    };
  }

  function loadMarket() {
    try {
      const s = JSON.parse(localStorage.getItem('tdc-market-v1') || 'null');
      if (s) {
        if (Array.isArray(s.marketListings)) marketListings = s.marketListings.map(normalizeListing).filter(Boolean);
        if (Array.isArray(s.myListings)) myListings = s.myListings.map(normalizeListing).filter(Boolean);
      }
    } catch (_) {}
  }

  function saveMarket() {
    try {
      localStorage.setItem('tdc-market-v1', JSON.stringify({ marketListings, myListings }));
    } catch (_) {}
  }

  function open() {
    close();
    loadMarket();
    const p = window._tdcPlayer || { gold: 0 };

    const overlay = document.createElement('div');
    overlay.id = 'marketModalOverlay';
    overlay.className = 'hub-modal-overlay';
    overlay.innerHTML = `
      <div class="hub-modal market-modal" role="dialog" aria-modal="true" aria-labelledby="marketModalTitle">
        <div class="hub-modal-header">
          <h3 id="marketModalTitle">BAZAR LOCAL DE MIRALUZ</h3>
          <button class="hub-modal-close" id="marketClose" type="button" aria-label="Fechar bazar">×</button>
        </div>
        <div class="market-nav-tabs">
          <button class="market-tab-btn active" data-tab="browse"> Comprar Itens</button>
          <button class="market-tab-btn" data-tab="sell"> Vender da Mochila</button>
          <button class="market-tab-btn" data-tab="my"> Minhas Listagens (${myListings.length})</button>
        </div>
        <div class="hub-modal-content" id="marketContent">
          <!-- Rendered dynamically -->
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#marketClose').onclick = close;
    overlay.querySelectorAll('.market-tab-btn').forEach((btn) => {
      btn.onclick = () => {
        overlay.querySelectorAll('.market-tab-btn').forEach((b) => b.classList.toggle('active', b === btn));
        renderTab(btn.dataset.tab);
      };
    });

    renderTab('browse');
  }

  function renderTab(tab) {
    const container = document.querySelector('#marketContent');
    if (!container) return;
    const p = window._tdcPlayer || { gold: 0 };

    if (tab === 'browse') {
      const itemsDb = window.GameItems?.ITEM_DATABASE || {};
      const rarityColors = window.GameItems?.RARITY_COLORS || {};

      container.innerHTML = `
        <div class="market-toolbar">
          <span>Seu saldo: <b style="color:#ffd700;">${escapeHTML(p.gold)} Ouro</b></span>
          <small>Ofertas demonstrativas locais. Compras e vendas ficam salvas neste navegador; não há negociação online entre jogadores.</small>
        </div>
        <div class="market-items-grid">
          ${marketListings.length === 0 ? '<p style="color:#a1a1aa; padding:20px;">Nenhuma oferta local disponível no momento.</p>' : ''}
          ${marketListings.map((listing, index) => {
            const base = itemsDb[listing.itemId] || { name: listing.itemId, rarity: 'comum', icon: '', desc: '' };
            const rar = rarityColors[base.rarity] || { border: '#666', text: '#ccc' };
            const canAfford = p.gold >= listing.price;
            return `
              <div class="market-card" style="border-color:${rar.border};">
                <div class="market-card-top">
                  <span class="market-card-icon">${itemIcon(base)}</span>
                  <div>
                    <h4 style="color:${rar.text};">${listing.enhanceLevel ? `+${listing.enhanceLevel} ` : ''}${escapeHTML(base.name)}</h4>
                    <small>Origem: <b>${escapeHTML(listing.seller)}</b> · ${escapeHTML(listing.date)}</small>
                  </div>
                </div>
                <p class="market-card-desc">${escapeHTML(base.desc || '')}</p>
                <div class="market-card-footer">
                  <span class="market-price"> ${listing.price} Ouro</span>
                  <button class="menu-button market-buy-btn" data-index="${index}" ${canAfford ? '' : 'disabled'}>
                    ${canAfford ? 'COMPRAR' : 'SEM OURO'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      container.querySelectorAll('.market-buy-btn').forEach((btn) => {
        btn.onclick = () => {
          const idx = Number(btn.dataset.index);
          const listing = marketListings[idx];
          if (!listing || p.gold < listing.price || !window.GameItems?.ITEM_DATABASE?.[listing.itemId]) return;

          const added = window.GameItems.addItem(listing.itemId, listing.count || 1, listing.enhanceLevel || 0);
          if (!added) {
            if (window.GameUI?.msg) window.GameUI.msg('Bolsa cheia! Libere um espaço antes de comprar.');
            return;
          }

          p.gold -= listing.price;
          marketListings.splice(idx, 1);
          saveMarket();
          window.GameAudio?.playCoin?.();
          if (window.GameUI?.msg) window.GameUI.msg(`Item comprado no Bazar de Miraluz.`);
          renderTab('browse');
        };
      });
    } else if (tab === 'sell') {
      const inv = window.GameItems?.inventory || [];
      const itemsDb = window.GameItems?.ITEM_DATABASE || {};

      container.innerHTML = `
        <div class="market-toolbar">
          <span>Selecione um item da sua mochila para listar no mercado:</span>
        </div>
        <div class="market-sell-grid">
          ${inv.length === 0 ? '<p style="color:#a1a1aa; padding:20px;">Sua mochila está vazia.</p>' : ''}
          ${inv.map((it, idx) => {
            const base = itemsDb[it.id] || { name: it.id, icon: '', value: 10 };
            const enhanceLevel = safeInteger(it.enhanceLevel, 0, 0, 99);
            return `
              <div class="market-sell-card">
              <span class="market-sell-icon">${itemIcon(base)}</span>
                <div class="market-sell-info">
                  <b>${enhanceLevel ? `+${enhanceLevel} ` : ''}${escapeHTML(base.name)}</b>
                  <small>Valor base:  ${base.value || 10} ouro</small>
                </div>
                <button class="menu-button market-choose-sell" data-index="${idx}">LISTAR ITEM</button>
              </div>
            `;
          }).join('')}
        </div>
      `;

      container.querySelectorAll('.market-choose-sell').forEach((btn) => {
        btn.onclick = () => {
          const idx = Number(btn.dataset.index);
          const it = inv[idx];
          if (!it) return;
          const base = itemsDb[it.id] || { name: it.id, value: 50 };
          const enhanceLevel = safeInteger(it.enhanceLevel, 0, 0, 99);
          const defaultPrice = (base.value || 50) * (enhanceLevel ? enhanceLevel * 2 : 1);
          const priceStr = prompt(`Defina o preço em ouro para vender ${base.name}:`, String(defaultPrice));
          const price = safeInteger(priceStr, 0, 1, 100000000);
          if (!price || !itemsDb[it.id]) return;

          const listingId = 'm_' + Date.now();

          marketListings.unshift({
            id: listingId,
            seller: 'Você (Aventureiro)',
            itemId: it.id,
            enhanceLevel,
            count: 1,
            price,
            date: 'Listada neste navegador'
          });

          myListings.push({
            id: listingId,
            itemId: it.id,
            enhanceLevel,
            price,
            status: 'listed'
          });

          window.GameItems?.removeItem(idx, 1);
          saveMarket();
          if (window.GameUI?.msg) window.GameUI.msg(`Item listado no mercado por ${price} ouro!`);
          renderTab('my');
        };
      });
    } else if (tab === 'my') {
      const itemsDb = window.GameItems?.ITEM_DATABASE || {};
      container.innerHTML = `
        <div class="market-toolbar">
          <span>Suas listagens locais neste navegador:</span>
        </div>
        <div class="market-items-grid">
          ${myListings.length === 0 ? '<p style="color:#a1a1aa; padding:20px;">Você não tem itens à venda no momento.</p>' : ''}
          ${myListings.map((listing, idx) => {
            const base = itemsDb[listing.itemId] || { name: listing.itemId, icon: '' };
            return `
              <div class="market-card">
                <div class="market-card-top">
                  <span class="market-card-icon">${itemIcon(base)}</span>
                  <div>
                    <h4>${listing.enhanceLevel ? `+${listing.enhanceLevel} ` : ''}${escapeHTML(base.name)}</h4>
                    <small>Preço:  ${listing.price} Ouro</small>
                  </div>
                </div>
                <div class="market-card-footer" style="margin-top:12px;">
                  <span style="color:#4ade80;">● Listagem local</span>
                  <button class="menu-button market-cancel-btn" data-index="${idx}">CANCELAR VENDA</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      container.querySelectorAll('.market-cancel-btn').forEach((btn) => {
        btn.onclick = () => {
          const idx = Number(btn.dataset.index);
          const listing = myListings[idx];
          if (!listing) return;

          // Return item to inventory
          if (!window.GameItems?.ITEM_DATABASE?.[listing.itemId]) return;
          const restored = window.GameItems.addItem(listing.itemId, listing.count || 1, listing.enhanceLevel || 0);
          if (!restored) {
            if (window.GameUI?.msg) window.GameUI.msg('Bolsa cheia! Libere um espaço para devolver o item.');
            return;
          }
          myListings.splice(idx, 1);
          const mIdx = marketListings.findIndex((x) => x.id === listing.id);
          if (mIdx !== -1) marketListings.splice(mIdx, 1);
          saveMarket();
          if (window.GameUI?.msg) window.GameUI.msg('Venda cancelada! Item devolvido à mochila.');
          renderTab('my');
        };
      });
    }
  }

  function close() {
    const el = document.querySelector('#marketModalOverlay');
    if (el) el.remove();
  }

  window.GameMarketplace = {
    open,
    close,
    marketListings,
    myListings
  };

export const gameMarketplace = window.GameMarketplace;
