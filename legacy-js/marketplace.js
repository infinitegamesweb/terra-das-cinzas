(() => {
  // ─────────────────────────────────────────────────────────────
  // TERRA DAS CINZAS · Mercado Livre entre Jogadores (Player Market)
  // ─────────────────────────────────────────────────────────────

  let marketListings = [
    { id: 'm1', seller: 'Thorin_Stone', itemId: 'w_espada_ferro', enhanceLevel: 2, price: 95, date: 'Há 12 min' },
    { id: 'm2', seller: 'Sylvan_Wind', itemId: 'w_arco_ecos', enhanceLevel: 3, price: 340, date: 'Há 25 min' },
    { id: 'm3', seller: 'Archmage_Vex', itemId: 'w_cetro_chama_antiga', enhanceLevel: 1, price: 290, date: 'Há 40 min' },
    { id: 'm4', seller: 'Shadow_Rogue', itemId: 'acc_anel_falcao', enhanceLevel: 0, price: 280, date: 'Há 1 h' },
    { id: 'm5', seller: 'Valeria_Dawn', itemId: 'acc_amuleto_berserker', enhanceLevel: 2, price: 490, date: 'Há 2 h' },
    { id: 'm6', seller: 'Miner_Grum', itemId: 'pot_vida_suprema', count: 3, enhanceLevel: 0, price: 310, date: 'Há 3 h' }
  ];

  let myListings = [];

  function loadMarket() {
    try {
      const s = JSON.parse(localStorage.getItem('tdc-market-v1') || 'null');
      if (s) {
        if (Array.isArray(s.marketListings)) marketListings = s.marketListings;
        if (Array.isArray(s.myListings)) myListings = s.myListings;
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
      <div class="hub-modal market-modal">
        <div class="hub-modal-header">
          <h3>⚖ MERCADO LIVRE ENTRE JOGADORES</h3>
          <button class="hub-modal-close" id="marketClose">✕</button>
        </div>
        <div class="market-nav-tabs">
          <button class="market-tab-btn active" data-tab="browse">🔍 Comprar Itens</button>
          <button class="market-tab-btn" data-tab="sell">📦 Vender da Mochila</button>
          <button class="market-tab-btn" data-tab="my">📋 Minhas Listagens (${myListings.length})</button>
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
          <span>Seu saldo: <b style="color:#ffd700;">💰 ${p.gold} Ouro</b></span>
          <small>Ofertas listadas em tempo real por aventureiros do mundo.</small>
        </div>
        <div class="market-items-grid">
          ${marketListings.map((listing, index) => {
            const base = itemsDb[listing.itemId] || { name: listing.itemId, rarity: 'comum', icon: '📦', desc: '' };
            const rar = rarityColors[base.rarity] || { border: '#666', text: '#ccc' };
            const canAfford = p.gold >= listing.price;
            return `
              <div class="market-card" style="border-color:${rar.border};">
                <div class="market-card-top">
                  <span class="market-card-icon">${base.icon}</span>
                  <div>
                    <h4 style="color:${rar.text};">${listing.enhanceLevel ? `+${listing.enhanceLevel} ` : ''}${base.name}</h4>
                    <small>Vendedor: <b>${listing.seller}</b> · ${listing.date}</small>
                  </div>
                </div>
                <p class="market-card-desc">${base.desc || ''}</p>
                <div class="market-card-footer">
                  <span class="market-price">💰 ${listing.price} Ouro</span>
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
          if (!listing || p.gold < listing.price) return;

          p.gold -= listing.price;
          window.GameItems?.addItem(listing.itemId, listing.count || 1, listing.enhanceLevel || 0);
          marketListings.splice(idx, 1);
          saveMarket();
          window.GameAudio?.playCoin?.();
          if (window.GameUI?.msg) window.GameUI.msg(`Comprou de ${listing.seller}!`);
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
            const base = itemsDb[it.id] || { name: it.id, icon: '📦', value: 10 };
            return `
              <div class="market-sell-card">
                <span class="market-sell-icon">${base.icon}</span>
                <div class="market-sell-info">
                  <b>${it.enhanceLevel ? `+${it.enhanceLevel} ` : ''}${base.name}</b>
                  <small>Valor base: 💰 ${base.value || 10} ouro</small>
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
          const defaultPrice = (base.value || 50) * (it.enhanceLevel ? it.enhanceLevel * 2 : 1);
          const priceStr = prompt(`Defina o preço em ouro para vender ${base.name}:`, String(defaultPrice));
          const price = Number(priceStr);
          if (!price || price <= 0) return;

          marketListings.unshift({
            id: 'm_' + Date.now(),
            seller: 'Você (Aventureiro)',
            itemId: it.id,
            enhanceLevel: it.enhanceLevel || 0,
            count: 1,
            price,
            date: 'Agora mesmo'
          });

          myListings.push({
            id: 'm_' + Date.now(),
            itemId: it.id,
            enhanceLevel: it.enhanceLevel || 0,
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
          <span>Suas listagens ativas no mercado:</span>
        </div>
        <div class="market-items-grid">
          ${myListings.length === 0 ? '<p style="color:#a1a1aa; padding:20px;">Você não tem itens à venda no momento.</p>' : ''}
          ${myListings.map((listing, idx) => {
            const base = itemsDb[listing.itemId] || { name: listing.itemId, icon: '📦' };
            return `
              <div class="market-card">
                <div class="market-card-top">
                  <span class="market-card-icon">${base.icon}</span>
                  <div>
                    <h4>${listing.enhanceLevel ? `+${listing.enhanceLevel} ` : ''}${base.name}</h4>
                    <small>Preço: 💰 ${listing.price} Ouro</small>
                  </div>
                </div>
                <div class="market-card-footer" style="margin-top:12px;">
                  <span style="color:#4ade80;">● Ativo no mercado</span>
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
          window.GameItems?.addItem(listing.itemId, 1, listing.enhanceLevel || 0);
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
})();
