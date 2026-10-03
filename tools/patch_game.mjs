import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const gamePath = path.resolve(__dirname, '..', 'js', 'game.js');

let code = fs.readFileSync(gamePath, 'utf8');

// 1. Preload hub icons & new prop sprites
const iconPreloadCode = `
  // Castle Hub & Map Icons
  const hubIcons = {};
  [
    'forge_anvil', 'alchemy_potion', 'oracle_portal', 'quest_scroll',
    'market_scales', 'lore_book', 'sentinel_shield', 'bard_lute'
  ].forEach((name) => {
    const im = new Image();
    im.src = \`assets/icons/\${name}.png\`;
    hubIcons[name] = im;
  });
`;

code = code.replace(
  "  const dropSprites = { gold: new Image(), crystal: new Image() };",
  `${iconPreloadCode}\n  const dropSprites = { gold: new Image(), crystal: new Image() };`
);

// Add new props to propList
code = code.replace(
  "    'cave_hole_1', 'cave_hole_2', 'cave_hole_3'",
  "    'cave_hole_1', 'cave_hole_2', 'cave_hole_3',\n    'training_dummy', 'ruined_statue', 'arcane_brazier'"
);

// 2. Update drawDecor scaling for new pixel props
code = code.replace(
  "      const scale = isMountain ? 0.42 * d.s : isCaveProp ? 0.22 * d.s : 0.24 * d.s;",
  "      const isPixelProp = d.kind === 'ruined_statue' || d.kind === 'arcane_brazier' || d.kind === 'training_dummy';\n      const scale = isMountain ? 0.42 * d.s : isCaveProp ? 0.22 * d.s : isPixelProp ? 0.82 * d.s : 0.24 * d.s;"
);

// Add brazier glow to drawDecor
code = code.replace(
  "      // Bioluminescent mushroom glow",
  `      // Arcane crystal brazier glow
      if (d.kind === 'arcane_brazier') {
        g.save();
        const pulse = Math.sin(last / 220 + d.x) * 4;
        g.fillStyle = 'rgba(56, 189, 248, 0.28)';
        g.beginPath();
        g.arc(d.x, d.y - 36, 18 + pulse, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }

      // Bioluminescent mushroom glow`
);

// 3. Replace drawCastleNpc with upgraded version
const oldDrawCastleNpc = `  function drawCastleNpc(n, t) {
    const x = n.x;
    const y = n.y;
    g.save();
    groundShadow(x, y + 3, 22, 8, 0.45);
    const pulse = 0.5 + Math.sin(t / 280) * 0.15;
    g.strokeStyle = n.color || '#f59e0b';
    g.globalAlpha = pulse;
    g.lineWidth = 2.5;
    g.beginPath();
    g.ellipse(x, y + 4, 26, 11, 0, 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 1;

    // Glowing Pedestal / Avatar
    g.fillStyle = '#211d29';
    g.beginPath();
    g.arc(x, y - 22, 18, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = n.color || '#f59e0b';
    g.lineWidth = 2;
    g.stroke();

    // Icon Emoji
    g.font = '20px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(n.icon || '👤', x, y - 21);

    // Title / Name Banner
    g.fillStyle = 'rgba(15, 12, 20, 0.88)';
    g.strokeStyle = n.color || '#f59e0b';
    g.lineWidth = 1;
    g.beginPath();
    g.roundRect(x - 70, y - 62, 140, 26, 6);
    g.fill();
    g.stroke();

    g.fillStyle = '#ffffff';
    g.font = '700 11px "Outfit", sans-serif';
    g.fillText(n.name, x, y - 51);
    g.fillStyle = '#fde68a';
    g.font = '600 8px "Outfit", sans-serif';
    g.fillText(n.title || '', x, y - 41);

    // Proximity interaction hint
    if (D(p, n) < 110) {
      const hintPulse = 0.8 + Math.sin(t / 200) * 0.2;
      g.globalAlpha = hintPulse;
      g.fillStyle = '#f59e0b';
      g.font = 'bold 9px "Outfit", sans-serif';
      g.fillText('▶ [E] ou Clique · ' + (n.actionLabel || 'Interagir'), x, y - 70);
    }
    g.restore();
  }`;

const newDrawCastleNpc = `  function drawCastleNpc(n, t) {
    const x = n.x;
    const y = n.y;
    g.save();

    // Ground Shadow & Runic Base Ring
    groundShadow(x, y + 3, 24, 9, 0.48);
    const pulse = 0.5 + Math.sin(t / 280) * 0.15;
    g.strokeStyle = n.color || '#f59e0b';
    g.globalAlpha = pulse;
    g.lineWidth = 2.5;
    g.beginPath();
    g.ellipse(x, y + 4, 28, 12, 0, 0, Math.PI * 2);
    g.stroke();

    // Rotating runic notches
    const angle = (t / 1400) % (Math.PI * 2);
    for (let i = 0; i < 4; i++) {
      const a = angle + (i * Math.PI) / 2;
      const rx = x + Math.cos(a) * 28;
      const ry = y + 4 + Math.sin(a) * 12;
      g.fillStyle = n.color || '#f59e0b';
      g.fillRect(rx - 2, ry - 2, 4, 4);
    }
    g.globalAlpha = 1;

    if (n.isDummy) {
      const dummyImg = propSprites['training_dummy'];
      if (dummyImg?.complete && dummyImg.naturalWidth) {
        const wobble = Math.sin(t / 300) * 1.5;
        g.drawImage(dummyImg, x - 20 + wobble, y - 56, 40, 54);
      } else {
        g.fillStyle = '#854d0e';
        g.fillRect(x - 3, y - 48, 6, 48);
        g.fillStyle = '#ef4444';
        g.beginPath();
        g.arc(x, y - 32, 14, 0, Math.PI * 2);
        g.fill();
      }
    } else {
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

      const badgeY = y - 62;
      g.fillStyle = 'rgba(20, 16, 28, 0.94)';
      g.strokeStyle = n.color || '#f59e0b';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(x, badgeY, 16, 0, Math.PI * 2);
      g.fill();
      g.stroke();

      if (customIcon?.complete && customIcon.naturalWidth) {
        g.drawImage(customIcon, x - 13, badgeY - 13, 26, 26);
      } else {
        g.font = '16px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(n.icon || '👤', x, badgeY);
      }
    }

    // Title / Name Banner
    const bannerY = n.isDummy ? y - 72 : y - 96;
    g.fillStyle = 'rgba(15, 12, 22, 0.92)';
    g.strokeStyle = n.color || '#f59e0b';
    g.lineWidth = 1.5;
    g.beginPath();
    g.roundRect(x - 72, bannerY, 144, 27, 6);
    g.fill();
    g.stroke();

    g.fillStyle = '#ffffff';
    g.font = '700 11px "Outfit", sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    g.fillText(n.name, x, bannerY + 13);
    g.fillStyle = '#fde68a';
    g.font = '600 8.5px "Outfit", sans-serif';
    g.fillText(n.title || '', x, bannerY + 23);

    // Proximity interaction hint
    if (D(p, n) < 110) {
      const hintPulse = 0.85 + Math.sin(t / 200) * 0.15;
      g.globalAlpha = hintPulse;
      g.fillStyle = '#f59e0b';
      g.font = 'bold 9.5px "Outfit", sans-serif';
      g.fillText('▶ [E] ou Clique · ' + (n.actionLabel || 'Interagir'), x, bannerY - 8);
    }
    g.restore();
  }`;

code = code.replace(oldDrawCastleNpc, newDrawCastleNpc);

// 4. Update populateRegion for region.id === 0 (Castle in Ruins props and lights)
const oldPopulateCastle = `    if (region.id === 0 || region.safeZone) {
      addRegionLights(ox, oy);
      decor.push(
        { x: ox + 960, y: oy + 650, s: 1.3, kind: 'pillar' },
        { x: ox + 960, y: oy + 670, s: 1.1, kind: 'campfire' },
        { x: ox + 640, y: oy + 720, s: 1.0, kind: 'pottery' },
        { x: ox + 620, y: oy + 760, s: 1.0, kind: 'crate_stack' },
        { x: ox + 1280, y: oy + 720, s: 1.2, kind: 'sign_post' },
        { x: ox + 780, y: oy + 840, s: 1.1, kind: 'barrel_stack' },
        { x: ox + 960, y: oy + 400, s: 1.4, kind: 'pillar' }
      );
      chests.push(
        { x: ox + 820, y: oy + 700, open: false, type: 'chest_stone_moss', name: 'Baú de Boas-Vindas do Castelo' }
      );
      captureCurrentRegion();
      return;
    }`;

const newPopulateCastle = `    if (region.id === 0 || region.safeZone) {
      addRegionLights(ox, oy);
      decor.push(
        // Central Hearth & Anvil Station
        { x: ox + 960, y: oy + 750, s: 1.25, kind: 'campfire' },
        { x: ox + 960, y: oy + 670, s: 1.2, kind: 'pillar' },
        { x: ox + 930, y: oy + 680, s: 1.0, kind: 'crate_stack' },
        { x: ox + 990, y: oy + 680, s: 1.0, kind: 'barrel_stack' },

        // Oracle Arcane Portal Platform (North)
        { x: ox + 910, y: oy + 440, s: 1.1, kind: 'arcane_brazier' },
        { x: ox + 1010, y: oy + 440, s: 1.1, kind: 'arcane_brazier' },
        { x: ox + 880, y: oy + 420, s: 1.3, kind: 'pillar' },
        { x: ox + 1040, y: oy + 420, s: 1.3, kind: 'pillar' },

        // Alchemist Maeve Sanctuary (West)
        { x: ox + 640, y: oy + 720, s: 1.1, kind: 'pottery' },
        { x: ox + 600, y: oy + 740, s: 1.0, kind: 'crate_stack' },
        { x: ox + 610, y: oy + 770, s: 1.0, kind: 'barrel_stack' },

        // Commander Vane War Court (East)
        { x: ox + 1280, y: oy + 720, s: 1.2, kind: 'sign_post' },
        { x: ox + 1320, y: oy + 730, s: 1.1, kind: 'crate_stack' },
        { x: ox + 1240, y: oy + 730, s: 1.2, kind: 'pillar' },

        // Free Market Silas (South-West)
        { x: ox + 780, y: oy + 840, s: 1.1, kind: 'barrel_stack' },
        { x: ox + 750, y: oy + 850, s: 1.0, kind: 'pottery' },

        // Sentinel Lyanna Tower (North-East)
        { x: ox + 1380, y: oy + 490, s: 1.1, kind: 'lamp_post' },
        { x: ox + 1420, y: oy + 530, s: 1.2, kind: 'pillar' },

        // Lore Archivist Ether (North-West Ruins)
        { x: ox + 540, y: oy + 510, s: 1.1, kind: 'lamp_post' },
        { x: ox + 500, y: oy + 540, s: 1.1, kind: 'rock_pile_1' },
        { x: ox + 570, y: oy + 550, s: 1.0, kind: 'pottery' },

        // Training Arena (South-East)
        { x: ox + 1140, y: oy + 880, s: 1.0, kind: 'training_dummy' },
        { x: ox + 1180, y: oy + 870, s: 1.0, kind: 'fence' },
        { x: ox + 1100, y: oy + 870, s: 1.0, kind: 'fence' },

        // Ruined Castle Statues & Colonnade
        { x: ox + 820, y: oy + 580, s: 1.1, kind: 'ruined_statue' },
        { x: ox + 1100, y: oy + 580, s: 1.1, kind: 'ruined_statue' },
        { x: ox + 820, y: oy + 940, s: 1.1, kind: 'ruined_statue' },
        { x: ox + 1100, y: oy + 940, s: 1.1, kind: 'ruined_statue' },

        // Grand Stone Pillars lining avenues
        { x: ox + 860, y: oy + 650, s: 1.3, kind: 'pillar' },
        { x: ox + 1060, y: oy + 650, s: 1.3, kind: 'pillar' },
        { x: ox + 860, y: oy + 850, s: 1.3, kind: 'pillar' },
        { x: ox + 1060, y: oy + 850, s: 1.3, kind: 'pillar' },

        // Rubble piles & ancient stones
        { x: ox + 420, y: oy + 380, s: 1.2, kind: 'rock_pile_2' },
        { x: ox + 1520, y: oy + 380, s: 1.2, kind: 'rock_pile_1' },
        { x: ox + 420, y: oy + 1100, s: 1.2, kind: 'rock_pile_1' },
        { x: ox + 1520, y: oy + 1100, s: 1.2, kind: 'rock_pile_2' }
      );

      chests.push(
        { x: ox + 820, y: oy + 700, open: false, type: 'chest_stone_moss', name: 'Baú de Boas-Vindas do Castelo' },
        { x: ox + 500, y: oy + 510, open: false, type: 'chest_royal', name: 'Relicário dos Arquivistas' },
        { x: ox + 1440, y: oy + 490, open: false, type: 'chest_stone_moss', name: 'Suprimentos da Sentinela' }
      );

      lightSources.push(
        { x: ox + 960, y: oy + 750, rad: 190, color: '#f59e0b', pulse: 0.18 },
        { x: ox + 960, y: oy + 690, rad: 130, color: '#f97316', pulse: 0.15 },
        { x: ox + 960, y: oy + 440, rad: 170, color: '#38bdf8', pulse: 0.22 },
        { x: ox + 910, y: oy + 440, rad: 90, color: '#38bdf8', pulse: 0.25 },
        { x: ox + 1010, y: oy + 440, rad: 90, color: '#38bdf8', pulse: 0.25 },
        { x: ox + 640, y: oy + 750, rad: 120, color: '#10b981', pulse: 0.12 },
        { x: ox + 1280, y: oy + 750, rad: 120, color: '#fbbf24', pulse: 0.14 },
        { x: ox + 780, y: oy + 860, rad: 110, color: '#c084fc', pulse: 0.12 },
        { x: ox + 1380, y: oy + 520, rad: 110, color: '#22c55e', pulse: 0.15 },
        { x: ox + 540, y: oy + 540, rad: 110, color: '#a855f7', pulse: 0.15 }
      );

      captureCurrentRegion();
      return;
    }`;

code = code.replace(oldPopulateCastle, newPopulateCastle);

// 5. Update Radar to show Castle NPCs with distinct colors
const oldRadarMobs = `    mobs.forEach((m) => {
      if (!m.alive) return;
      const rx = cx + ((m.x - p.x) / radarRange) * (rw / 2);
      const ry = cy + ((m.y - p.y) / radarRange) * (rh / 2);
      if (Math.hypot(rx - cx, ry - cy) < rw / 2 - 4) {
        radarCtx.fillStyle = '#ff4d4d';
        radarCtx.beginPath();
        radarCtx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        radarCtx.fill();
      }
    });`;

const newRadarMobs = `    // Castle Hub Landmarks on Radar
    if (region.id === 0 && window.GameCastleHub?.CASTLE_NPCS) {
      window.GameCastleHub.CASTLE_NPCS.forEach((cn) => {
        const rx = cx + ((cn.x - p.x) / radarRange) * (rw / 2);
        const ry = cy + ((cn.y - p.y) / radarRange) * (rh / 2);
        if (Math.hypot(rx - cx, ry - cy) < rw / 2 - 4) {
          radarCtx.save();
          radarCtx.fillStyle = cn.color || '#f59e0b';
          radarCtx.shadowColor = cn.color || '#f59e0b';
          radarCtx.shadowBlur = 4;
          radarCtx.beginPath();
          radarCtx.moveTo(rx, ry - 3.5);
          radarCtx.lineTo(rx + 3.5, ry);
          radarCtx.lineTo(rx, ry + 3.5);
          radarCtx.lineTo(rx - 3.5, ry);
          radarCtx.closePath();
          radarCtx.fill();
          radarCtx.restore();
        }
      });
    }

    mobs.forEach((m) => {
      if (!m.alive) return;
      const rx = cx + ((m.x - p.x) / radarRange) * (rw / 2);
      const ry = cy + ((m.y - p.y) / radarRange) * (rh / 2);
      if (Math.hypot(rx - cx, ry - cy) < rw / 2 - 4) {
        radarCtx.fillStyle = '#ff4d4d';
        radarCtx.beginPath();
        radarCtx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        radarCtx.fill();
      }
    });`;

code = code.replace(oldRadarMobs, newRadarMobs);

// 6. Update c.onpointerdown for dummy attacks
const oldClickNpc = `      if (region.id === 0 && window.GameCastleHub?.CASTLE_NPCS) {
        const castleNpc = window.GameCastleHub.CASTLE_NPCS.find(n => D(q, n) < 65);
        if (castleNpc) {
          if (D(p, castleNpc) < 110) {
            castleNpc.open();
          } else {
            enemy = object = null;
            setDestination(castleNpc);
          }
          return;
        }`;

const newClickNpc = `      if (region.id === 0 && window.GameCastleHub?.CASTLE_NPCS) {
        const castleNpc = window.GameCastleHub.CASTLE_NPCS.find(n => D(q, n) < 65);
        if (castleNpc) {
          if (castleNpc.isDummy) {
            if (D(p, castleNpc) < 140) {
              audio.playHit();
              sparks(castleNpc.x, castleNpc.y - 30, '#ef4444', 12);
              const weapon = window.GameItems?.equipped?.weapon;
              const baseDmg = 12 + (p.lvl * 2) + ((weapon?.enhanceLevel || 0) * 4);
              const hasBuff = p.sentinelBuffUntil && Date.now() < p.sentinelBuffUntil;
              const isCrit = Math.random() < (0.15 + (hasBuff ? 0.10 : 0));
              const dmg = Math.round((baseDmg * (isCrit ? 1.85 : 1.0)) * (0.9 + Math.random() * 0.2));
              addFloatingText(castleNpc.x + (Math.random() * 20 - 10), castleNpc.y - 50, (isCrit ? '💥 ' : '') + dmg + (isCrit ? ' CRÍTICO!' : ''), isCrit ? '#fde047' : '#ffffff', isCrit ? 18 : 14);
              p.atk = Date.now();
            } else {
              setDestination(castleNpc);
            }
            return;
          }
          if (D(p, castleNpc) < 110) {
            castleNpc.open();
          } else {
            enemy = object = null;
            setDestination(castleNpc);
          }
          return;
        }`;

code = code.replace(oldClickNpc, newClickNpc);

fs.writeFileSync(gamePath, code, 'utf8');
console.log('✓ js/game.js atualizado com ícones, NPCs e suporte a treino!');
