import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hubPath = path.resolve(__dirname, '..', 'js', 'castle-hub.js');

let code = fs.readFileSync(hubPath, 'utf8');

// 1. Replace points array in CASTLE_REGION
const oldPoints = `    points: [
      ['Pátio Central da Forja', 960, 750],
      ['Portal das Masmorras', 960, 420],
      ['Bazar dos Mercadores', 640, 750],
      ['Salão das Missões', 1280, 750],
      ['Mercado de Jogadores', 780, 860]
    ]`;

const newPoints = `    points: [
      ['Pátio Central da Forja', 960, 690],
      ['Portal das Masmorras', 960, 440],
      ['Bazar dos Mercadores', 640, 750],
      ['Salão das Missões', 1280, 750],
      ['Mercado de Jogadores', 780, 860],
      ['Torre da Sentinela', 1380, 520],
      ['Biblioteca Ancestral', 540, 540],
      ['Lareira do Bardo', 1080, 780],
      ['Arena de Treinamento', 1140, 880]
    ]`;

code = code.replace(oldPoints, newPoints);

// 2. Replace CASTLE_NPCS array
const oldNpcs = `  const CASTLE_NPCS = [
    {
      id: 'forge_ignis',
      name: 'Ferreiro Ignis',
      title: 'Mestre da Forja das Cinzas',
      x: ZONE_OX + 960,
      y: ZONE_OY + 690,
      icon: '🔨',
      color: '#f97316',
      dialog: 'O fogo nunca morre enquanto houver vontade. Traga-me seu equipamento e minérios e farei dele uma lenda.',
      actionLabel: 'Acessar a Forja',
      open() { openForgeModal(); }
    },
    {
      id: 'shop_maeve',
      name: 'Alquimista Maeve',
      title: 'Mercadora de Poções e Provisões',
      x: ZONE_OX + 640,
      y: ZONE_OY + 750,
      icon: '⚗',
      color: '#10b981',
      dialog: 'Saudações, viajante. O mundo lá fora é implacável. Leve poções e pergaminhos para garantir seu retorno com vida.',
      actionLabel: 'Abrir Loja',
      open() { openShopModal(); }
    },
    {
      id: 'portal_kaelen',
      name: 'Oráculo Kaelen',
      title: 'Guardião dos Portais Antigos',
      x: ZONE_OX + 960,
      y: ZONE_OY + 440,
      icon: '🌀',
      color: '#38bdf8',
      dialog: 'As fendas do abismo conectam este refúgio às masmorras mais profundas e às veias de minério do mundo.',
      actionLabel: 'Abrir Portais de Masmorra',
      open() {
        if (window.WorldMap?.openTab) window.WorldMap.openTab('dungeons');
        else if (window.WorldMap?.toggle) window.WorldMap.toggle(window._tdcPlayer?.lvl || 1);
      }
    },
    {
      id: 'quest_vane',
      name: 'Comandante Vane',
      title: 'Arauto da Ordem das Cinzas',
      x: ZONE_OX + 1280,
      y: ZONE_OY + 750,
      icon: '📜',
      color: '#fbbf24',
      dialog: 'As criaturas das ruínas avançam dia após dia. Cumpra os contratos da Cidadela e receba as honras devidas.',
      actionLabel: 'Ver Contratos e Missões',
      open() { openQuestModal(); }
    },
    {
      id: 'market_silas',
      name: 'Corretor Silas',
      title: 'Mercado Livre entre Jogadores',
      x: ZONE_OX + 780,
      y: ZONE_OY + 860,
      icon: '⚖',
      color: '#c084fc',
      dialog: 'O comércio entre aventureiros move a economia de Miraluz. Compre o que precisa e venda suas relíquias.',
      actionLabel: 'Mercado de Jogadores',
      open() {
        if (window.GameMarketplace?.open) window.GameMarketplace.open();
      }
    }
  ];`;

const newNpcs = `  const CASTLE_NPCS = [
    {
      id: 'forge_ignis',
      name: 'Ferreiro Ignis',
      title: 'Mestre da Forja das Cinzas',
      x: ZONE_OX + 960,
      y: ZONE_OY + 690,
      icon: '🔨',
      iconImg: 'assets/icons/forge_anvil.png',
      color: '#f97316',
      dialog: 'O fogo nunca morre enquanto houver vontade. Traga-me seu equipamento e minérios e farei dele uma lenda.',
      actionLabel: 'Acessar a Forja',
      open() { openForgeModal(); }
    },
    {
      id: 'shop_maeve',
      name: 'Alquimista Maeve',
      title: 'Mercadora de Poções e Provisões',
      x: ZONE_OX + 640,
      y: ZONE_OY + 750,
      icon: '⚗',
      iconImg: 'assets/icons/alchemy_potion.png',
      color: '#10b981',
      dialog: 'Saudações, viajante. O mundo lá fora é implacável. Leve poções e pergaminhos para garantir seu retorno com vida.',
      actionLabel: 'Abrir Loja',
      open() { openShopModal(); }
    },
    {
      id: 'portal_kaelen',
      name: 'Oráculo Kaelen',
      title: 'Guardião dos Portais Antigos',
      x: ZONE_OX + 960,
      y: ZONE_OY + 440,
      icon: '🌀',
      iconImg: 'assets/icons/oracle_portal.png',
      color: '#38bdf8',
      dialog: 'As fendas do abismo conectam este refúgio às masmorras mais profundas e às veias de minério do mundo.',
      actionLabel: 'Abrir Portais de Masmorra',
      open() {
        if (window.WorldMap?.openTab) window.WorldMap.openTab('dungeons');
        else if (window.WorldMap?.toggle) window.WorldMap.toggle(window._tdcPlayer?.lvl || 1);
      }
    },
    {
      id: 'quest_vane',
      name: 'Comandante Vane',
      title: 'Arauto da Ordem das Cinzas',
      x: ZONE_OX + 1280,
      y: ZONE_OY + 750,
      icon: '📜',
      iconImg: 'assets/icons/quest_scroll.png',
      color: '#fbbf24',
      dialog: 'As criaturas das ruínas avançam dia após dia. Cumpra os contratos da Cidadela e receba as honras devidas.',
      actionLabel: 'Ver Contratos e Missões',
      open() { openQuestModal(); }
    },
    {
      id: 'market_silas',
      name: 'Corretor Silas',
      title: 'Mercado Livre entre Jogadores',
      x: ZONE_OX + 780,
      y: ZONE_OY + 860,
      icon: '⚖',
      iconImg: 'assets/icons/market_scales.png',
      color: '#c084fc',
      dialog: 'O comércio entre aventureiros move a economia de Miraluz. Compre o que precisa e venda suas relíquias.',
      actionLabel: 'Mercado de Jogadores',
      open() {
        if (window.GameMarketplace?.open) window.GameMarketplace.open();
      }
    },
    {
      id: 'sentinel_lyanna',
      name: 'Guardiã Lyanna',
      title: 'Sentinela das Ruínas & Muralhas',
      x: ZONE_OX + 1380,
      y: ZONE_OY + 520,
      icon: '🛡',
      iconImg: 'assets/icons/sentinel_shield.png',
      color: '#22c55e',
      dialog: 'Vigilo os limites do bosque. As feras selvagens e golens corrompidos rondam as muralhas.',
      actionLabel: 'Relatório & Bênção da Vigia',
      open() { openSentinelModal(); }
    },
    {
      id: 'lore_ether',
      name: 'Arquivista Éter',
      title: 'Guardião dos Tomos & Bestiário',
      x: ZONE_OX + 540,
      y: ZONE_OY + 540,
      icon: '📖',
      iconImg: 'assets/icons/lore_book.png',
      color: '#a855f7',
      dialog: 'Nas cinzas deste castelo repousam os segredos de Miraluz e as fraquezas dos 5 Grandes Guardiões.',
      actionLabel: 'Consultar Bestiário & Lore',
      open() { openLoreModal(); }
    },
    {
      id: 'bard_dorian',
      name: 'Bardo Dorian',
      title: 'Trovador das Cinzas',
      x: ZONE_OX + 1080,
      y: ZONE_OY + 780,
      icon: '🪕',
      iconImg: 'assets/icons/bard_lute.png',
      color: '#eab308',
      dialog: 'Nem mesmo a poeira das cinzas pode apagar uma boa melodia. Descanse os pés perto do fogo.',
      actionLabel: 'Ouvir Contos & Bênção',
      open() { openBardModal(); }
    },
    {
      id: 'training_dummy',
      name: 'Boneco de Treino',
      title: 'Alvo de Calibração de Dano',
      x: ZONE_OX + 1140,
      y: ZONE_OY + 880,
      icon: '🎯',
      iconImg: 'assets/props/training_dummy.png',
      color: '#ef4444',
      isDummy: true,
      dialog: 'Um boneco reforçado de palha e aço para calibrar suas armas e testar seus combos de dano.',
      actionLabel: 'Treinar Golpes',
      open() { openTrainingModal(); }
    }
  ];`;

code = code.replace(oldNpcs, newNpcs);

// 3. Add modal functions: openSentinelModal, openLoreModal, openBardModal, openTrainingModal
const newModalFunctions = `
  function openSentinelModal() {
    closeAllModals();
    const overlay = document.createElement('div');
    overlay.id = 'sentinelModalOverlay';
    overlay.className = 'hub-modal-overlay';
    overlay.innerHTML = \`
      <div class="hub-modal">
        <div class="hub-modal-header" style="border-bottom-color:#22c55e;">
          <h3 style="color:#4ade80;">🛡 GUARDIÃ LYANNA · RELATÓRIO DAS MURALHAS</h3>
          <button class="hub-modal-close" id="sentinelClose">✕</button>
        </div>
        <div class="hub-modal-content">
          <p class="hub-intro">As frentes de batalha além dos portões do castelo estão em constante mutação. A Sentinela vigia os movimentos dos invasores.</p>
          
          <div style="background:#17231c; border:1px solid #23432e; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
            <h4 style="margin:0; color:#86efac; font-size:13px;">👁 Sondagem Atual das Regiões:</h4>
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
    \`;
    document.body.appendChild(overlay);
    overlay.querySelector('#sentinelClose').onclick = () => overlay.remove();
    overlay.querySelector('#blessSentinelBtn').onclick = () => {
      window.GameAudio?.playLevelUp?.();
      if (window._tdcPlayer) {
        window._tdcPlayer.sentinelBuffUntil = Date.now() + 15 * 60 * 1000;
      }
      if (window.GameUI?.msg) window.GameUI.msg('★ Bênção da Sentinela Ativada! +10% Crítico por 15 minutos! ★');
      overlay.remove();
    };
  }

  function openLoreModal() {
    closeAllModals();
    const overlay = document.createElement('div');
    overlay.id = 'loreModalOverlay';
    overlay.className = 'hub-modal-overlay';
    overlay.innerHTML = \`
      <div class="hub-modal market-modal">
        <div class="hub-modal-header" style="border-bottom-color:#a855f7;">
          <h3 style="color:#c084fc;">📖 ARQUIVISTA ÉTER · BESTIÁRIO & ANAIS DAS CINZAS</h3>
          <button class="hub-modal-close" id="loreClose">✕</button>
        </div>
        <div class="hub-modal-content">
          <p class="hub-intro">O conhecimento é a maior arma de um guerreiro errante. Conheça as fraquezas dos monstros lendários.</p>
          
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:10px;">
            <div style="background:#1f192b; border:1px solid #493b66; border-radius:8px; padding:12px;">
              <h4 style="margin:0 0 4px; color:#fde047; font-size:13px;">♛ Guardião da Raiz Cinzenta</h4>
              <small style="color:#38bdf8;">Chefe da Região 01 · Bosque das Ruínas</small>
              <p style="margin:6px 0 0; font-size:11px; color:#cbd5e1; line-height:1.4;">
                Uma antiga árvore sagrada corrompida pela fuligem arcana. Invoca raízes do solo.<br>
                <b style="color:#f87171;">Fraqueza:</b> Dano ígneo e esquiva dos círculos vermelhos de impacto.
              </p>
            </div>

            <div style="background:#1f192b; border:1px solid #493b66; border-radius:8px; padding:12px;">
              <h4 style="margin:0 0 4px; color:#fde047; font-size:13px;">♛ Sombra Voraz do Abismo</h4>
              <small style="color:#38bdf8;">Chefe da Região 02 · Pântano Espectral</small>
              <p style="margin:6px 0 0; font-size:11px; color:#cbd5e1; line-height:1.4;">
                Entidade incorpórea nascida do miasma das almas perdidas. Se teleporta ao receber ataques fortes.<br>
                <b style="color:#f87171;">Fraqueza:</b> Projéteis celestiais e golpes críticos contínuos.
              </p>
            </div>

            <div style="background:#1f192b; border:1px solid #493b66; border-radius:8px; padding:12px;">
              <h4 style="margin:0 0 4px; color:#fde047; font-size:13px;">♛ Golias Vulcânico de Ferro</h4>
              <small style="color:#38bdf8;">Chefe da Região 03 · Montanhas Rubras</small>
              <p style="margin:6px 0 0; font-size:11px; color:#cbd5e1; line-height:1.4;">
                Forjado no magma do núcleo da montanha. Seu escudo absorve 50% de dano físico.<br>
                <b style="color:#f87171;">Fraqueza:</b> Ataques de gelo e golpes nas costas durante o windup.
              </p>
            </div>

            <div style="background:#1f192b; border:1px solid #493b66; border-radius:8px; padding:12px;">
              <h4 style="margin:0 0 4px; color:#fde047; font-size:13px;">♛ Lorde Vharok, o Rei Cinzento</h4>
              <small style="color:#f43f5e;">Chefe Supremo · Trono das Cinzas</small>
              <p style="margin:6px 0 0; font-size:11px; color:#cbd5e1; line-height:1.4;">
                O governante caído que selou o mundo em poeira perpétua. Alterna 3 fases de combate devastadoras.<br>
                <b style="color:#f87171;">Fraqueza:</b> Quebra de postura com habilidades 3 e 4.
              </p>
            </div>
          </div>
        </div>
      </div>
    \`;
    document.body.appendChild(overlay);
    overlay.querySelector('#loreClose').onclick = () => overlay.remove();
  }

  function openBardModal() {
    closeAllModals();
    const overlay = document.createElement('div');
    overlay.id = 'bardModalOverlay';
    overlay.className = 'hub-modal-overlay';
    overlay.innerHTML = \`
      <div class="hub-modal">
        <div class="hub-modal-header" style="border-bottom-color:#eab308;">
          <h3 style="color:#fde047;">🪕 BARDO DORIAN · CONTOS DA FOGUEIRA</h3>
          <button class="hub-modal-close" id="bardClose">✕</button>
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
    \`;
    document.body.appendChild(overlay);
    overlay.querySelector('#bardClose').onclick = () => overlay.remove();
    overlay.querySelector('#blessBardBtn').onclick = () => {
      window.GameAudio?.playCoin?.();
      if (window._tdcPlayer) {
        window._tdcPlayer.speedBuffUntil = Date.now() + 15 * 60 * 1000;
      }
      if (window.GameUI?.msg) window.GameUI.msg('★ Canção do Vento Ativada! +10% Velocidade de Movimento! ★');
      overlay.remove();
    };
  }

  function openTrainingModal() {
    closeAllModals();
    const p = window._tdcPlayer || { lvl: 1 };
    const overlay = document.createElement('div');
    overlay.id = 'trainingModalOverlay';
    overlay.className = 'hub-modal-overlay';
    overlay.innerHTML = \`
      <div class="hub-modal">
        <div class="hub-modal-header" style="border-bottom-color:#ef4444;">
          <h3 style="color:#f87171;">🎯 BONECO DE TREINO DOS CAVALEIROS</h3>
          <button class="hub-modal-close" id="dummyClose">✕</button>
        </div>
        <div class="hub-modal-content">
          <p class="hub-intro">Use o boneco de treino na arena sul para testar combinações de ataque e calibrar o poder dos seus itens aprimorados.</p>
          
          <div style="background:#1f181a; border:1px solid #4d2d34; border-radius:8px; padding:14px; display:flex; flex-direction:column; gap:8px;">
            <b style="color:#fca5a5; font-size:13px;">⚔ Como Praticar:</b>
            <div style="font-size:12px; color:#e2e8f0; line-height:1.5;">
              • Aproxime-se do boneco e <b>clique com o botão esquerdo</b> para desferir golpes básicos.<br>
              • Use as teclas <b>[1] [2] [3] [4]</b> para disparar suas habilidades de classe.<br>
              • Os números flutuantes indicam o dano real aplicado após cálculo de atributos e acertos críticos!
            </div>
          </div>
        </div>
      </div>
    \`;
    document.body.appendChild(overlay);
    overlay.querySelector('#dummyClose').onclick = () => overlay.remove();
  }
`;

code = code.replace(
  '  function closeAllModals() {',
  `${newModalFunctions}\n  function closeAllModals() {`
);

// 4. Update window.GameCastleHub exports
const oldExport = `  window.GameCastleHub = {
    CASTLE_REGION,
    CASTLE_NPCS,
    ONLINE_PLAYERS,
    openForgeModal,
    openShopModal,
    openQuestModal,
    teleportToCastle
  };`;

const newExport = `  window.GameCastleHub = {
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
  };`;

code = code.replace(oldExport, newExport);

fs.writeFileSync(hubPath, code, 'utf8');
console.log('✓ js/castle-hub.js atualizado com novos NPCs e modais!');
