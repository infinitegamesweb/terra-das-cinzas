// src/systems/castle/CastleHubManager.js
  // ─────────────────────────────────────────────────────────────
  // TERRA DAS CINZAS · Hub Central: Castelo em Cinzas (Safe Zone)
  // ─────────────────────────────────────────────────────────────

  const ZONE_OX = 1900;
  const ZONE_OY = 2900;

  const CASTLE_REGION = {
    id: 0,
    name: 'Castelo em Cinzas',
    subtitle: 'Refúgio Ancestral dos Errantes (Zona Segura)',
    col: 1,
    row: 2,
    min: 1,
    max: 300,
    unlocks: 1,
    safeZone: true,
    bg: '#141118',
    path: '#3d3647',
    tree: '#231d2b',
    accent: '#f59e0b',
    enemy: null,
    hp: 0,
    sp: 0,
    ambientColor: '#fcd34d',
    bossName: null,
    bossSprite: null,
    dungeonName: 'Masmorras do Castelo',
    npcName: 'Oráculo Kaelen',
    points: [
      ['Pátio Central · Chama Ancestral', 960, 720],
      ['Ala Norte · Salão de Treino & Magia', 960, 260],
      ['Ala Este · Mercado & Forja', 1540, 720],
      ['Ala Oeste · Missões & Lore', 380, 720],
      ['Ala Sul · Portão de Expedições', 960, 1220]
    ]
  };

  // Castle NPCs (Radial 4 Wings Distribution)
  const CASTLE_NPCS = [
    // ─── PÁTIO CENTRAL (Ponto de Respawn & Restauração) ───
    {
      id: 'altar_flame',
      name: 'Altar da Chama Ancestral',
      title: 'Ponto de Respawn e Restauração',
      x: ZONE_OX + 960,
      y: ZONE_OY + 720,
      icon: '',
      color: '#f59e0b',
      isAltar: true,
      dialog: 'Uma centelha sagrada aquece as cinzas frias. O calor desta chama cura feridas e regenera o espírito.',
      actionLabel: 'Descansar & Restaurar',
      open() {
        const p = window._tdcPlayer;
        if (p) {
          p.hp = p.max;
          p.energy = 100;
          if (window.QuestManager?.onProgress) window.QuestManager.onProgress('interact', 1);
          if (window.GameAudio?.playLevelUp) window.GameAudio.playLevelUp();
          if (window.GameUI?.msg) window.GameUI.msg(' Chama Ancestral: Vida e Energia Plenamente Restauradas! Ponto de Retorno Salvo. ');
          if (window.renderUI) window.renderUI({ p });
        }
      }
    },

    // ─── ALA NORTE: SALÃO DE TREINO & MAGIA (x: ~960, y: ~240-300) ───
    {
      id: 'portal_kaelen',
      name: 'Oráculo Kaelen',
      title: 'Instrutor Arcano & Guardião dos Portais',
      x: ZONE_OX + 960,
      y: ZONE_OY + 230,
      icon: '',
      iconImg: 'assets/icons/oracle_portal.png',
      color: '#38bdf8',
      dialog: 'A magia das cinzas consome tanto quanto cria. As fendas do abismo conectam este refúgio às masmorras mais profundas.',
      actionLabel: 'Masmorras & Portais',
      open() {
        if (window.WorldMap?.openTab) window.WorldMap.openTab('dungeons');
        else if (window.WorldMap?.toggle) window.WorldMap.toggle(window._tdcPlayer?.lvl || 1);
      }
    },
    {
      id: 'sentinel_lyanna',
      name: 'Mestre Lyanna',
      title: 'Mestre de Armas & Sentinela das Muralhas',
      x: ZONE_OX + 830,
      y: ZONE_OY + 270,
      icon: '',
      iconImg: 'assets/icons/sentinel_shield.png',
      color: '#22c55e',
      dialog: 'Uma lâmina sem técnica é apenas ferro pesado. Vigio os limites do refúgio e treino os novos guerreiros.',
      actionLabel: 'Bênção de Crítico & Vigia',
      open() { openSentinelModal(); }
    },
    {
      id: 'training_dummy',
      name: 'Boneco de Treino',
      title: 'Alvo de Calibração de Dano (DPS)',
      x: ZONE_OX + 1090,
      y: ZONE_OY + 270,
      icon: '',
      iconImg: 'assets/props/training_dummy.png',
      color: '#ef4444',
      isDummy: true,
      dialog: 'Um boneco reforçado de palha e aço para calibrar suas armas e testar seus combos de dano.',
      actionLabel: 'Treinar Golpes',
      open() { openTrainingModal(); }
    },

    // ─── ALA ESTE: MERCADO & FORJA (x: ~1460-1620, y: ~650-790) ───
    {
      id: 'forge_ignis',
      name: 'Ferreiro Ignis',
      title: 'Mestre da Forja (Armas e Armaduras)',
      x: ZONE_OX + 1620,
      y: ZONE_OY + 650,
      icon: '',
      iconImg: 'assets/icons/forge_anvil.png',
      color: '#f97316',
      dialog: 'Precisa de aço temperado ou de reparar o estrago? O fogo nunca morre enquanto houver vontade.',
      actionLabel: 'Acessar a Forja',
      open() { openForgeModal(); }
    },
    {
      id: 'shop_maeve',
      name: 'Alquimista Maeve',
      title: 'Mercadora de Poções e Provisões',
      x: ZONE_OX + 1620,
      y: ZONE_OY + 790,
      icon: '',
      iconImg: 'assets/icons/alchemy_potion.png',
      color: '#10b981',
      dialog: 'Ervas colhidas nas margens de cinza têm efeitos raros. Leve poções e elixires para garantir sua sobrevivência.',
      actionLabel: 'Abrir Loja',
      open() { openShopModal(); }
    },
    {
      id: 'market_silas',
      name: 'Corretor Silas',
      title: 'Mercado Livre entre Jogadores',
      x: ZONE_OX + 1460,
      y: ZONE_OY + 720,
      icon: '',
      iconImg: 'assets/icons/market_scales.png',
      color: '#c084fc',
      dialog: 'O comércio entre aventureiros move a economia de Miraluz. Compre o que precisa e venda suas relíquias.',
      actionLabel: 'Mercado de Jogadores',
      open() {
        if (window.GameMarketplace?.open) window.GameMarketplace.open();
      }
    },

    // ─── ALA OESTE: MISSÕES & LORE (x: ~300-460, y: ~650-790) ───
    {
      id: 'quest_vane',
      name: 'Comandante Vane',
      title: 'Quadro de Avisos & Contratos da Ordem',
      x: ZONE_OX + 300,
      y: ZONE_OY + 650,
      icon: '',
      iconImg: 'assets/icons/quest_scroll.png',
      color: '#fbbf24',
      dialog: 'As criaturas das ruínas avançam dia após dia. Cumpra os contratos da Cidadela e receba as honras devidas.',
      actionLabel: 'Ver Contratos & Missões',
      open() { openQuestModal(); }
    },
    {
      id: 'lore_ether',
      name: 'Cronista Éter',
      title: 'Guardião dos Tomos & Bestiário',
      x: ZONE_OX + 300,
      y: ZONE_OY + 790,
      icon: '',
      iconImg: 'assets/icons/lore_book.png',
      color: '#a855f7',
      dialog: 'A história deste reino ardeu em cinzas, mas nós somos a memória viva. Conheça as fraquezas dos 5 Grandes Guardiões.',
      actionLabel: 'Consultar Bestiário & Lore',
      open() { openLoreModal(); }
    },
    {
      id: 'bard_dorian',
      name: 'Bardo Dorian',
      title: 'Trovador das Cinzas (Lareira de Contos)',
      x: ZONE_OX + 460,
      y: ZONE_OY + 720,
      icon: '',
      iconImg: 'assets/icons/bard_lute.png',
      color: '#eab308',
      dialog: 'Nem mesmo a poeira das cinzas pode apagar uma boa melodia. Descanse os pés perto do fogo.',
      actionLabel: 'Ouvir Contos & Bênção',
      open() { openBardModal(); }
    },

    // ─── ALA SUL: SAÍDA PARA EXPEDIÇÕES & FLORESTA (x: 960, y: 1160-1260) ───
    {
      id: 'gate_sentinel',
      sprite: 'sentinel_lyanna',
      name: 'Vigia do Portão',
      title: 'Guarda da Saída para as Florestas',
      x: ZONE_OX + 960,
      y: ZONE_OY + 1160,
      icon: '',
      iconImg: 'assets/icons/sentinel_shield.png',
      color: '#22c55e',
      dialog: 'Para além deste portão, os monstros das ruínas e as brumas não têm piedade. Prepare suas poções antes de marchar.',
      actionLabel: 'Viajar ao Bosque das Ruínas',
      open() {
        if (window._tdcSetRegion) window._tdcSetRegion(1);
      }
    }
  ];

  // Ambient Adventurers (Disabled to maintain clean visual space)
  const ONLINE_PLAYERS = [];

  function openForgeModal() {
    closeAllModals();
    const p = window._tdcPlayer || { gold: 0, ore: 0 };
    const equipped = window.GameItems?.equipped || {};
    const weapon = equipped.weapon;
    const currentLevel = weapon?.enhanceLevel || 0;
    const costGold = (currentLevel + 1) * 80;
    const costOre = (currentLevel + 1) * 3;
    const canUpgrade = weapon && p.gold >= costGold && (p.ore || 0) >= costOre && currentLevel < 10;

    const overlay = document.createElement('div');
    overlay.id = 'forgeModalOverlay';
    overlay.className = 'hub-modal-overlay';
    overlay.innerHTML = `
      <div class="hub-modal">
        <div class="hub-modal-header">
          <div style="display:flex;align-items:center;gap:10px;">
    <img src="assets/characters/npcs/forge_ignis_portrait.png" style="width:48px;height:48px;image-rendering:pixelated;border-radius:6px;border:1px solid #f97316;">
    <div>
      <h3 style="margin:0;font-size:14px;color:#fcd34d;">A FORJA DAS CINZAS</h3>
      <small style="color:#f97316;font-size:10px;">Ferreiro Ignis · Mestre Armeiro</small>
    </div>
  </div>
          <button class="hub-modal-close" id="forgeClose"></button>
        </div>
        <div class="hub-modal-content">
          <p class="hub-intro">O Ferreiro Ignis aprimora armas e armaduras. Cada aprimoramento (+1 a +10) aumenta o poder do item em <b>+10%</b>.</p>
          
          <div class="forge-item-display">
            <span class="forge-icon">${weapon ? window.GameItems.getItemIcon(weapon) : ''}</span>
            <div class="forge-details">
              <h4>${weapon ? window.GameItems.getItemName(weapon) : 'Nenhuma arma equipada'}</h4>
              <p>${weapon ? `Nível de Refinamento atual: <b>+${currentLevel}</b>` : 'Equipe uma arma para refinar.'}</p>
            </div>
          </div>

          ${weapon ? `
            <div class="forge-upgrade-box">
              <div class="forge-cost-row">
                <span>Custo de Ouro:</span>
                <b style="color:#ffd700;"> ${costGold} Ouro (Você tem: ${p.gold})</b>
              </div>
              <div class="forge-cost-row">
                <span>Custo de Minério:</span>
                <b style="color:#38bdf8;"> ${costOre} Minérios (Você tem: ${p.ore || 0})</b>
              </div>
              <div class="forge-cost-row">
                <span>Poder Adicional:</span>
                <b style="color:#4ade80;">+10% Dano e Atributos</b>
              </div>
              <button class="menu-button menu-primary" id="forgeBtn" ${canUpgrade ? '' : 'disabled'}>
                ${currentLevel >= 10 ? 'NÍVEL MÁXIMO (+10)' : 'APRIMORAR EQUIPAMENTO'}
              </button>
            </div>
          ` : '<p style="color:#ef4444; margin-top:16px;">Abra a bolsa e equipe uma arma primeiro.</p>'}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#forgeClose').onclick = () => overlay.remove();
    const btn = overlay.querySelector('#forgeBtn');
    if (btn && canUpgrade) {
      btn.onclick = () => {
        p.gold -= costGold;
        p.ore = (p.ore || 0) - costOre;
        weapon.enhanceLevel = (weapon.enhanceLevel || 0) + 1;
        window.GameItems?.saveInventory();
        window.GameAudio?.playLevelUp?.();
        if (window.GameUI?.msg) window.GameUI.msg(` Aprimoramento Sucesso! ${window.GameItems.getItemName(weapon)} agora é +${weapon.enhanceLevel}! `);
        overlay.remove();
        openForgeModal();
      };
    }
  }

  function openShopModal() {
    closeAllModals();
    const p = window._tdcPlayer || { gold: 0 };
    const items = [
      { id: 'pot_vida_pequena', name: 'Poção de Vida Menor (+50 HP)', price: 20, icon: '' },
      { id: 'pot_vida_media', name: 'Poção de Vida Maior (+150 HP)', price: 65, icon: '' },
      { id: 'pot_vida_suprema', name: 'Elixir da Vitalidade Élfica (+400 HP)', price: 180, icon: '' },
      { id: 'pot_energia', name: 'Frasco de Energia Arcana (+60 EN)', price: 45, icon: '' },
      { id: 'scroll_retorno', name: 'Pergaminho do Castelo (Retorno Seguro)', price: 35, icon: '' },
      { id: 'acc_anel_cobre', name: 'Anel de Cobre Polido (+15 HP, +1 Def)', price: 50, icon: '' }
    ];

    const overlay = document.createElement('div');
    overlay.id = 'shopModalOverlay';
    overlay.className = 'hub-modal-overlay';
    overlay.innerHTML = `
      <div class="hub-modal">
        <div class="hub-modal-header">
          <div style="display:flex;align-items:center;gap:10px;">
    <img src="assets/characters/npcs/shop_maeve_portrait.png" style="width:48px;height:48px;image-rendering:pixelated;border-radius:6px;border:1px solid #10b981;">
    <div>
      <h3 style="margin:0;font-size:14px;color:#34d399;">PROVISÕES DA ALQUIMISTA</h3>
      <small style="color:#10b981;font-size:10px;">Alquimista Maeve · Mercadora de Poções</small>
    </div>
  </div>
          <button class="hub-modal-close" id="shopClose"></button>
        </div>
        <div class="hub-modal-content">
          <div class="shop-balance">Ouro disponível: <b style="color:#ffd700;"> ${p.gold}</b></div>
          <div class="shop-items-list">
            ${items.map((it) => `
              <div class="shop-item-card">
                <span class="shop-item-icon">${it.icon}</span>
                <div class="shop-item-info">
                  <b>${it.name}</b>
                  <small>Preço:  ${it.price} Ouro</small>
                </div>
                <button class="menu-button shop-buy-btn" data-id="${it.id}" data-price="${it.price}" ${p.gold >= it.price ? '' : 'disabled'}>
                  COMPRAR
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#shopClose').onclick = () => overlay.remove();
    overlay.querySelectorAll('.shop-buy-btn').forEach((button) => {
      button.onclick = () => {
        const id = button.dataset.id;
        const price = Number(button.dataset.price);
        if (p.gold >= price) {
          p.gold -= price;
          window.GameItems?.addItem(id, 1);
          window.GameAudio?.playCoin?.();
          if (window.GameUI?.msg) window.GameUI.msg(`Comprou ${items.find((x) => x.id === id)?.name}!`);
          overlay.remove();
          openShopModal();
        }
      };
    });
  }

  function openQuestModal() {
    closeAllModals();
    const overlay = document.createElement('div');
    overlay.id = 'questModalOverlay';
    overlay.className = 'hub-modal-overlay';
    overlay.innerHTML = `
      <div class="hub-modal">
        <div class="hub-modal-header">
          <div style="display:flex;align-items:center;gap:10px;">
    <img src="assets/characters/npcs/quest_vane_portrait.png" style="width:48px;height:48px;image-rendering:pixelated;border-radius:6px;border:1px solid #fbbf24;">
    <div>
      <h3 style="margin:0;font-size:14px;color:#fde047;">CONTRATOS DA CIDADELA</h3>
      <small style="color:#fbbf24;font-size:10px;">Comandante Vane · Arauto da Ordem</small>
    </div>
  </div>
          <button class="hub-modal-close" id="questClose"></button>
        </div>
        <div class="hub-modal-content">
          <p class="hub-intro">Cumpra missões nas regiões e masmorras para fortalecer o Castelo em Cinzas.</p>
          <div class="contracts-list">
            <div class="contract-card">
              <h4> Purgação das Ruínas</h4>
              <p>Derrote 20 criaturas no Bosque das Ruínas ou Catacumbas.</p>
              <div class="contract-reward">Recompensa:  250 Ouro ·  400 XP ·  1 Fragmento de Brasa</div>
            </div>
            <div class="contract-card">
              <h4> Suprimento da Forja</h4>
              <p>Colete 15 minérios nas masmorras de mineração.</p>
              <div class="contract-reward">Recompensa:  300 Ouro ·  350 XP ·  Poções de Vida</div>
            </div>
            <div class="contract-card">
              <h4> Queda do Primeiro Guardião</h4>
              <p>Vença o Guardião da Raiz Cinzenta no Bosque.</p>
              <div class="contract-reward">Recompensa:  500 Ouro ·  800 XP ·  Arma Rara</div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#questClose').onclick = () => overlay.remove();
  }


  function openSentinelModal() {
    closeAllModals();
    const overlay = document.createElement('div');
    overlay.id = 'sentinelModalOverlay';
    overlay.className = 'hub-modal-overlay';
    overlay.innerHTML = `
      <div class="hub-modal">
        <div class="hub-modal-header" style="border-bottom-color:#22c55e;">
          <div style="display:flex;align-items:center;gap:10px;">
    <img src="assets/characters/npcs/sentinel_lyanna_portrait.png" style="width:48px;height:48px;image-rendering:pixelated;border-radius:6px;border:1px solid #22c55e;">
    <div>
      <h3 style="margin:0;font-size:14px;color:#4ade80;">RELATÓRIO DAS MURALHAS</h3>
      <small style="color:#22c55e;font-size:10px;">Guardiã Lyanna · Sentinela da Vigia</small>
    </div>
  </div>
          <button class="hub-modal-close" id="sentinelClose"></button>
        </div>
        <div class="hub-modal-content">
          <p class="hub-intro">As frentes de batalha além dos portões do castelo estão em constante mutação. A Sentinela vigia os movimentos dos invasores.</p>
          
          <div style="background:#17231c; border:1px solid #23432e; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
            <h4 style="margin:0; color:#86efac; font-size:13px;"> Sondagem Atual das Regiões:</h4>
            <div style="font-size:12px; color:#cbd5e1; line-height:1.5;">
              • <b>Região 01 (Bosque das Ruínas)</b>: Infestação de Slimes e Fungos Tóxicos. O Guardião da Raiz é vulnerável a fogo rápido.<br>
              • <b>Região 02 (Pântano Espectral)</b>: Olhos gigantes e espíritos das sombras drenam energia. Mantenha poções de cura!<br>
              • <b>Região 03 (Montanhas Rubras)</b>: Golens de magma e espinhosos possuem armadura alta. Use golpes de penetração.
            </div>
          </div>

          <div style="background:#1e1a2b; border:1px solid #4a3e66; border-radius:8px; padding:14px; display:flex; align-items:center; justify-content:space-between; gap:12px;">
            <div>
              <b style="color:#fde047; font-size:13px;">Bênção da Sentinela da Vigia</b>
              <p style="margin:2px 0 0; font-size:11px; color:#a1a1aa;">Aumenta a precisão e garante <b>+10% de Chance de Acerto Crítico</b> por 15 minutos.</p>
            </div>
            <button class="menu-button menu-primary" id="blessSentinelBtn" style="white-space:nowrap; background:#15803d; border-color:#22c55e;">
              RECEBER BÊNÇÃO
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#sentinelClose').onclick = () => overlay.remove();
    overlay.querySelector('#blessSentinelBtn').onclick = () => {
      window.GameAudio?.playLevelUp?.();
      if (window._tdcPlayer) {
        window._tdcPlayer.sentinelBuffUntil = Date.now() + 15 * 60 * 1000;
      }
      if (window.GameUI?.msg) window.GameUI.msg(' Bênção da Sentinela Ativada! +10% Crítico por 15 minutos! ');
      overlay.remove();
    };
  }

  function openLoreModal() {
    closeAllModals();
    const overlay = document.createElement('div');
    overlay.id = 'loreModalOverlay';
    overlay.className = 'hub-modal-overlay';
    overlay.innerHTML = `
      <div class="hub-modal market-modal">
        <div class="hub-modal-header" style="border-bottom-color:#a855f7;">
          <div style="display:flex;align-items:center;gap:10px;">
    <img src="assets/characters/npcs/lore_ether_portrait.png" style="width:48px;height:48px;image-rendering:pixelated;border-radius:6px;border:1px solid #a855f7;">
    <div>
      <h3 style="margin:0;font-size:14px;color:#c084fc;">BESTIÁRIO & ANAIS DAS CINZAS</h3>
      <small style="color:#a855f7;font-size:10px;">Arquivista Éter · Guardião dos Tomos</small>
    </div>
  </div>
          <button class="hub-modal-close" id="loreClose"></button>
        </div>
        <div class="hub-modal-content">
          <p class="hub-intro">O conhecimento é a maior arma de um guerreiro errante. Conheça as fraquezas dos monstros lendários.</p>
          
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:10px;">
            <div style="background:#1f192b; border:1px solid #493b66; border-radius:8px; padding:12px;">
              <h4 style="margin:0 0 4px; color:#fde047; font-size:13px;"> Guardião da Raiz Cinzenta</h4>
              <small style="color:#38bdf8;">Chefe da Região 01 · Bosque das Ruínas</small>
              <p style="margin:6px 0 0; font-size:11px; color:#cbd5e1; line-height:1.4;">
                Uma antiga árvore sagrada corrompida pela fuligem arcana. Invoca raízes do solo.<br>
                <b style="color:#f87171;">Fraqueza:</b> Dano ígneo e esquiva dos círculos vermelhos de impacto.
              </p>
            </div>

            <div style="background:#1f192b; border:1px solid #493b66; border-radius:8px; padding:12px;">
              <h4 style="margin:0 0 4px; color:#fde047; font-size:13px;"> Sombra Voraz do Abismo</h4>
              <small style="color:#38bdf8;">Chefe da Região 02 · Pântano Espectral</small>
              <p style="margin:6px 0 0; font-size:11px; color:#cbd5e1; line-height:1.4;">
                Entidade incorpórea nascida do miasma das almas perdidas. Se teleporta ao receber ataques fortes.<br>
                <b style="color:#f87171;">Fraqueza:</b> Projéteis celestiais e golpes críticos contínuos.
              </p>
            </div>

            <div style="background:#1f192b; border:1px solid #493b66; border-radius:8px; padding:12px;">
              <h4 style="margin:0 0 4px; color:#fde047; font-size:13px;"> Golias Vulcânico de Ferro</h4>
              <small style="color:#38bdf8;">Chefe da Região 03 · Montanhas Rubras</small>
              <p style="margin:6px 0 0; font-size:11px; color:#cbd5e1; line-height:1.4;">
                Forjado no magma do núcleo da montanha. Seu escudo absorve 50% de dano físico.<br>
                <b style="color:#f87171;">Fraqueza:</b> Ataques de gelo e golpes nas costas durante o windup.
              </p>
            </div>

            <div style="background:#1f192b; border:1px solid #493b66; border-radius:8px; padding:12px;">
              <h4 style="margin:0 0 4px; color:#fde047; font-size:13px;"> Lorde Vharok, o Rei Cinzento</h4>
              <small style="color:#f43f5e;">Chefe Supremo · Trono das Cinzas</small>
              <p style="margin:6px 0 0; font-size:11px; color:#cbd5e1; line-height:1.4;">
                O governante caído que selou o mundo em poeira perpétua. Alterna 3 fases de combate devastadoras.<br>
                <b style="color:#f87171;">Fraqueza:</b> Quebra de postura com habilidades 3 e 4.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#loreClose').onclick = () => overlay.remove();
  }

  function openBardModal() {
    closeAllModals();
    const overlay = document.createElement('div');
    overlay.id = 'bardModalOverlay';
    overlay.className = 'hub-modal-overlay';
    overlay.innerHTML = `
      <div class="hub-modal">
        <div class="hub-modal-header" style="border-bottom-color:#eab308;">
          <div style="display:flex;align-items:center;gap:10px;">
    <img src="assets/characters/npcs/bard_dorian_portrait.png" style="width:48px;height:48px;image-rendering:pixelated;border-radius:6px;border:1px solid #eab308;">
    <div>
      <h3 style="margin:0;font-size:14px;color:#fde047;">CONTOS DA FOGUEIRA</h3>
      <small style="color:#eab308;font-size:10px;">Bardo Dorian · Trovador Errante</small>
    </div>
  </div>
          <button class="hub-modal-close" id="bardClose"></button>
        </div>
        <div class="hub-modal-content">
          <p class="hub-intro">"As cinzas caem suavemente sobre as ruínas, mas o coração dos errantes nunca desiste."</p>
          
          <div style="background:#221b16; border:1px solid #4a3826; border-radius:8px; padding:12px; font-size:12px; color:#fef3c7; line-height:1.5;">
            <i>"Dizem que sob a fogueira central deste castelo repousa a Última Chama de Miraluz. Enquanto houver cinzas quentes, os portais do Oráculo manterão abertas as conexões com as profundezas."</i>
          </div>

          <div style="background:#1f192b; border:1px solid #4a3e66; border-radius:8px; padding:14px; display:flex; align-items:center; justify-content:space-between; gap:12px;">
            <div>
              <b style="color:#fde047; font-size:13px;">Canção do Vento Errante</b>
              <p style="margin:2px 0 0; font-size:11px; color:#a1a1aa;">Abençoa seus passos com <b>+10% de Velocidade de Movimento</b>.</p>
            </div>
            <button class="menu-button menu-primary" id="blessBardBtn" style="white-space:nowrap; background:#d97706; border-color:#f59e0b;">
              OUVIR CANÇÃO
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#bardClose').onclick = () => overlay.remove();
    overlay.querySelector('#blessBardBtn').onclick = () => {
      window.GameAudio?.playCoin?.();
      if (window._tdcPlayer) {
        window._tdcPlayer.speedBuffUntil = Date.now() + 15 * 60 * 1000;
      }
      if (window.GameUI?.msg) window.GameUI.msg(' Canção do Vento Ativada! +10% Velocidade de Movimento! ');
      overlay.remove();
    };
  }

  function openTrainingModal() {
    closeAllModals();
    const p = window._tdcPlayer || { lvl: 1 };
    const overlay = document.createElement('div');
    overlay.id = 'trainingModalOverlay';
    overlay.className = 'hub-modal-overlay';
    overlay.innerHTML = `
      <div class="hub-modal">
        <div class="hub-modal-header" style="border-bottom-color:#ef4444;">
          <h3 style="color:#f87171;"> BONECO DE TREINO DOS CAVALEIROS</h3>
          <button class="hub-modal-close" id="dummyClose"></button>
        </div>
        <div class="hub-modal-content">
          <p class="hub-intro">Use o boneco de treino na arena sul para testar combinações de ataque e calibrar o poder dos seus itens aprimorados.</p>
          
          <div style="background:#1f181a; border:1px solid #4d2d34; border-radius:8px; padding:14px; display:flex; flex-direction:column; gap:8px;">
            <b style="color:#fca5a5; font-size:13px;"> Como Praticar:</b>
            <div style="font-size:12px; color:#e2e8f0; line-height:1.5;">
              • Aproxime-se do boneco e <b>clique com o botão esquerdo</b> para desferir golpes básicos.<br>
              • Use as teclas <b>[1] [2] [3] [4]</b> para disparar suas habilidades de classe.<br>
              • Os números flutuantes indicam o dano real aplicado após cálculo de atributos e acertos críticos!
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#dummyClose').onclick = () => overlay.remove();
  }

  function closeAllModals() {
    document.querySelectorAll('.hub-modal-overlay').forEach((el) => el.remove());
  }

  function teleportToCastle() {
    if (!window._tdcPlayer) return;
    const p = window._tdcPlayer;
    window._tdcSetRegion?.(0);
    // Pontos de spawn descentralizados em raio de 5x5 blocos ao redor da Chama Ancestral
    const spawnAngle = Math.random() * Math.PI * 2;
    const spawnDist = 20 + Math.random() * 60;
    p.x = ZONE_OX + 960 + Math.cos(spawnAngle) * spawnDist;
    p.y = ZONE_OY + 720 + Math.sin(spawnAngle) * spawnDist;
    if (window.GameAudio?.playLevelUp) window.GameAudio.playLevelUp();
    if (window.GameUI?.msg) window.GameUI.msg(' Chegou ao Pátio Central do Castelo em Cinzas! Zona Segura. ');
  }

  window.GameCastleHub = {
    CASTLE_REGION,
    CASTLE_NPCS,
    ONLINE_PLAYERS,
    openForgeModal,
    openShopModal,
    openQuestModal,
    openSentinelModal,
    openLoreModal,
    openBardModal,
    openTrainingModal,
    teleportToCastle
  };

export const castleHub = window.GameCastleHub;
