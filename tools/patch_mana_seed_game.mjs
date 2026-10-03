import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gamePath = path.resolve(__dirname, '..', 'js', 'game.js');
const hubPath = path.resolve(__dirname, '..', 'js', 'castle-hub.js');

// 1. Patch js/game.js to preload npcSprites and render Mana Seed characters
let gameCode = fs.readFileSync(gamePath, 'utf8');

const npcPreload = `  // Mana Seed Animated NPC Sprites
  const npcSprites = {};
  [
    'forge_ignis', 'shop_maeve', 'portal_kaelen', 'quest_vane',
    'market_silas', 'sentinel_lyanna', 'lore_ether', 'bard_dorian'
  ].forEach((id) => {
    const im = new Image();
    im.src = \`assets/characters/npcs/\${id}_idle.png\`;
    npcSprites[id] = im;
  });
`;

gameCode = gameCode.replace(
  '  // Castle Hub & Map Icons',
  `${npcPreload}\n  // Castle Hub & Map Icons`
);

// Replace the avatar rendering block in drawCastleNpc
const oldAvatarBlock = `    } else {
      // NPC Stylized Pixel-Art Character Silhouette
      g.fillStyle = n.color || '#f59e0b';
      g.beginPath();
      g.moveTo(x - 12, y - 28);
      g.lineTo(x + 12, y - 28);
      g.lineTo(x + 15, y);
      g.lineTo(x - 15, y);
      g.closePath();
      g.fill();

      // Undergarment / Tunic
      g.fillStyle = '#1e1a24';
      g.fillRect(x - 8, y - 26, 16, 26);

      // Belt
      g.fillStyle = '#78350f';
      g.fillRect(x - 9, y - 14, 18, 3);
      g.fillStyle = '#fde047';
      g.fillRect(x - 2, y - 15, 4, 5);

      // Head & Hood
      g.fillStyle = '#fcd34d';
      g.beginPath();
      g.arc(x, y - 36, 8, 0, Math.PI * 2);
      g.fill();

      g.fillStyle = n.color || '#f59e0b';
      g.beginPath();
      g.arc(x, y - 38, 9, Math.PI, 0);
      g.fill();
      g.fillStyle = '#1e1a24';
      g.beginPath();
      g.arc(x, y - 35, 6, 0, Math.PI * 2);
      g.fill();

      // Glowing Eyes
      g.fillStyle = n.id === 'portal_kaelen' ? '#38bdf8' : n.id === 'lore_ether' ? '#c084fc' : '#ffffff';
      g.fillRect(x - 3, y - 36, 2, 2);
      g.fillRect(x + 1, y - 36, 2, 2);

      // High-resolution Pixel Art Badge Icon above head
      const iconKey = n.iconImg ? n.iconImg.split('/').pop().replace('.png', '') : null;
      const customIcon = iconKey ? (hubIcons[iconKey] || propSprites[iconKey]) : null;

      const badgeY = y - 62;`;

const newAvatarBlock = `    } else {
      // Mana Seed Animated Character Sprite
      const npcSprite = npcSprites[n.id];
      if (npcSprite?.complete && npcSprite.naturalWidth) {
        const breath = Math.sin(t / 420 + (n.x % 10)) * 1.4;
        const sw = 50;
        const sh = 50;
        g.drawImage(npcSprite, x - sw / 2, y - sh + 9 + breath, sw, sh);
      } else {
        g.fillStyle = n.color || '#f59e0b';
        g.beginPath();
        g.moveTo(x - 12, y - 28);
        g.lineTo(x + 12, y - 28);
        g.lineTo(x + 15, y);
        g.lineTo(x - 15, y);
        g.closePath();
        g.fill();

        g.fillStyle = '#fcd34d';
        g.beginPath();
        g.arc(x, y - 36, 8, 0, Math.PI * 2);
        g.fill();
      }

      // High-resolution Pixel Art Badge Icon above head
      const iconKey = n.iconImg ? n.iconImg.split('/').pop().replace('.png', '') : null;
      const customIcon = iconKey ? (hubIcons[iconKey] || propSprites[iconKey]) : null;

      const badgeY = y - 58;`;

gameCode = gameCode.replace(oldAvatarBlock, newAvatarBlock);
fs.writeFileSync(gamePath, gameCode, 'utf8');
console.log('✓ js/game.js atualizado com sprites do Mana Seed!');

// 2. Patch js/castle-hub.js to include portraits in headers
let hubCode = fs.readFileSync(hubPath, 'utf8');

// Enhance Forge modal header with Ignis portrait
hubCode = hubCode.replace(
  '<h3>🔨 A FORJA DAS CINZAS</h3>',
  `<div style="display:flex;align-items:center;gap:10px;">
    <img src="assets/characters/npcs/forge_ignis_portrait.png" style="width:36px;height:36px;image-rendering:pixelated;border-radius:6px;border:1px solid #f97316;">
    <div>
      <h3 style="margin:0;font-size:14px;color:#fcd34d;">A FORJA DAS CINZAS</h3>
      <small style="color:#f97316;font-size:10px;">Ferreiro Ignis · Mestre Armeiro</small>
    </div>
  </div>`
);

// Enhance Shop modal header with Maeve portrait
hubCode = hubCode.replace(
  '<h3>⚗ PROVISÕES DA ALQUIMISTA MAEVE</h3>',
  `<div style="display:flex;align-items:center;gap:10px;">
    <img src="assets/characters/npcs/shop_maeve_portrait.png" style="width:36px;height:36px;image-rendering:pixelated;border-radius:6px;border:1px solid #10b981;">
    <div>
      <h3 style="margin:0;font-size:14px;color:#34d399;">PROVISÕES DA ALQUIMISTA</h3>
      <small style="color:#10b981;font-size:10px;">Alquimista Maeve · Mercadora de Poções</small>
    </div>
  </div>`
);

// Enhance Quests modal header with Vane portrait
hubCode = hubCode.replace(
  '<h3>📜 CONTRATOS DO COMANDANTE VANE</h3>',
  `<div style="display:flex;align-items:center;gap:10px;">
    <img src="assets/characters/npcs/quest_vane_portrait.png" style="width:36px;height:36px;image-rendering:pixelated;border-radius:6px;border:1px solid #fbbf24;">
    <div>
      <h3 style="margin:0;font-size:14px;color:#fde047;">CONTRATOS DA CIDADELA</h3>
      <small style="color:#fbbf24;font-size:10px;">Comandante Vane · Arauto da Ordem</small>
    </div>
  </div>`
);

// Enhance Sentinel modal header with Lyanna portrait
hubCode = hubCode.replace(
  '<h3 style="color:#4ade80;">🛡 GUARDIÃ LYANNA · RELATÓRIO DAS MURALHAS</h3>',
  `<div style="display:flex;align-items:center;gap:10px;">
    <img src="assets/characters/npcs/sentinel_lyanna_portrait.png" style="width:36px;height:36px;image-rendering:pixelated;border-radius:6px;border:1px solid #22c55e;">
    <div>
      <h3 style="margin:0;font-size:14px;color:#4ade80;">RELATÓRIO DAS MURALHAS</h3>
      <small style="color:#22c55e;font-size:10px;">Guardiã Lyanna · Sentinela da Vigia</small>
    </div>
  </div>`
);

// Enhance Lore modal header with Ether portrait
hubCode = hubCode.replace(
  '<h3 style="color:#c084fc;">📖 ARQUIVISTA ÉTER · BESTIÁRIO & ANAIS DAS CINZAS</h3>',
  `<div style="display:flex;align-items:center;gap:10px;">
    <img src="assets/characters/npcs/lore_ether_portrait.png" style="width:36px;height:36px;image-rendering:pixelated;border-radius:6px;border:1px solid #a855f7;">
    <div>
      <h3 style="margin:0;font-size:14px;color:#c084fc;">BESTIÁRIO & ANAIS DAS CINZAS</h3>
      <small style="color:#a855f7;font-size:10px;">Arquivista Éter · Guardião dos Tomos</small>
    </div>
  </div>`
);

// Enhance Bard modal header with Dorian portrait
hubCode = hubCode.replace(
  '<h3 style="color:#fde047;">🪕 BARDO DORIAN · CONTOS DA FOGUEIRA</h3>',
  `<div style="display:flex;align-items:center;gap:10px;">
    <img src="assets/characters/npcs/bard_dorian_portrait.png" style="width:36px;height:36px;image-rendering:pixelated;border-radius:6px;border:1px solid #eab308;">
    <div>
      <h3 style="margin:0;font-size:14px;color:#fde047;">CONTOS DA FOGUEIRA</h3>
      <small style="color:#eab308;font-size:10px;">Bardo Dorian · Trovador Errante</small>
    </div>
  </div>`
);

fs.writeFileSync(hubPath, hubCode, 'utf8');
console.log('✓ js/castle-hub.js atualizado com retratos do Mana Seed!');
