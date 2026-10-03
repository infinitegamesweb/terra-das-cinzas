import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const worldPath = path.resolve(__dirname, '..', 'js', 'world.js');

let code = fs.readFileSync(worldPath, 'utf8');

const drawCastleRuinsCode = `  const ruinsFloorImg = new Image();
  ruinsFloorImg.onload = () => {
    terrainCanvas = null;
  };
  ruinsFloorImg.src = 'assets/maps/castle_ruins_floor.png';

  function drawCastleRuins(ctx, region, width, height) {
    ctx.imageSmoothingEnabled = false;

    // 1. Dark stone foundation base
    ctx.fillStyle = '#120f18';
    ctx.fillRect(0, 0, width, height);

    // 2. Ruined flagstone pattern
    if (ready(ruinsFloorImg)) {
      const pat = ctx.createPattern(ruinsFloorImg, 'repeat');
      if (pat) {
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      ctx.fillStyle = '#1c1926';
      ctx.fillRect(0, 0, width, height);
      for (let r = 0; r < 40; r++) {
        for (let c = 0; c < 50; c++) {
          const x = c * 40 + (r % 2 ? 20 : 0);
          const y = r * 38;
          ctx.fillStyle = (r + c) % 3 === 0 ? '#262232' : (r + c) % 2 === 0 ? '#221e2d' : '#1e1a28';
          ctx.fillRect(x + 1, y + 1, 38, 36);
          ctx.fillStyle = '#0f0d14';
          ctx.fillRect(x, y + 36, 40, 2);
        }
      }
    }

    // Atmospheric ruined castle tint & vignetting
    const castleAmbient = ctx.createRadialGradient(960, 750, 150, 960, 750, 1200);
    castleAmbient.addColorStop(0, 'rgba(251, 146, 60, 0.08)');
    castleAmbient.addColorStop(0.5, 'rgba(30, 24, 42, 0.35)');
    castleAmbient.addColorStop(1, 'rgba(6, 4, 10, 0.88)');
    ctx.fillStyle = castleAmbient;
    ctx.fillRect(0, 0, width, height);

    // 3. Castle Outer Curtain Wall & Battlements (Ruins)
    const wallCol = '#25212e';
    const wallBorder = '#453c52';
    const wallHighlight = '#5c506d';

    ctx.save();
    ctx.fillStyle = wallCol;
    ctx.strokeStyle = wallBorder;
    ctx.lineWidth = 4;
    // North Wall with broken gate opening
    ctx.fillRect(180, 140, 600, 56);
    ctx.strokeRect(180, 140, 600, 56);
    ctx.fillRect(1140, 140, 600, 56);
    ctx.strokeRect(1140, 140, 600, 56);

    // West Wall
    ctx.fillRect(180, 140, 54, 1200);
    ctx.strokeRect(180, 140, 54, 1200);

    // East Wall
    ctx.fillRect(1686, 140, 54, 1200);
    ctx.strokeRect(1686, 140, 54, 1200);

    // South Wall with archway portal opening
    ctx.fillRect(180, 1284, 680, 56);
    ctx.strokeRect(180, 1284, 680, 56);
    ctx.fillRect(1060, 1284, 680, 56);
    ctx.strokeRect(1060, 1284, 680, 56);

    // Crenelations on walls
    ctx.fillStyle = wallHighlight;
    for (let wx = 180; wx < 780; wx += 40) ctx.fillRect(wx, 130, 22, 14);
    for (let wx = 1140; wx < 1740; wx += 40) ctx.fillRect(wx, 130, 22, 14);
    for (let wy = 140; wy < 1280; wy += 44) {
      ctx.fillRect(170, wy, 14, 22);
      ctx.fillRect(1736, wy, 14, 22);
    }
    for (let wx = 180; wx < 860; wx += 40) ctx.fillRect(wx, 1336, 22, 14);
    for (let wx = 1060; wx < 1740; wx += 40) ctx.fillRect(wx, 1336, 22, 14);

    // Corner Bastion Tower Foundations
    [[220, 180], [1700, 180], [220, 1300], [1700, 1300]].forEach(([bx, by]) => {
      ctx.fillStyle = '#1c1824';
      ctx.beginPath();
      ctx.arc(bx, by, 64, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5a4e6b';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.fillStyle = '#2d273a';
      ctx.beginPath();
      ctx.arc(bx, by, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx - 12, by); ctx.lineTo(bx + 12, by);
      ctx.moveTo(bx, by - 12); ctx.lineTo(bx, by + 12);
      ctx.stroke();
    });
    ctx.restore();

    // 4. Paved Processional Roads connecting wings to center
    ctx.save();
    const pavePath = new Path2D();
    pavePath.moveTo(960, 220);
    pavePath.lineTo(960, 1340);
    pavePath.moveTo(340, 750);
    pavePath.lineTo(1580, 750);
    pavePath.moveTo(640, 750);
    pavePath.lineTo(960, 750);
    pavePath.moveTo(780, 860);
    pavePath.lineTo(960, 750);
    pavePath.moveTo(1140, 880);
    pavePath.lineTo(960, 750);
    pavePath.moveTo(540, 540);
    pavePath.lineTo(960, 750);
    pavePath.moveTo(1380, 520);
    pavePath.lineTo(960, 750);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(10, 8, 14, 0.65)';
    ctx.lineWidth = 110;
    ctx.stroke(pavePath);
    ctx.strokeStyle = '#383244';
    ctx.lineWidth = 92;
    ctx.stroke(pavePath);
    ctx.strokeStyle = '#4a425a';
    ctx.lineWidth = 76;
    ctx.stroke(pavePath);
    ctx.strokeStyle = 'rgba(235, 220, 185, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke(pavePath);
    ctx.restore();

    // 5. Central Grand Courtyard (Pátio Ancestral dos Errantes)
    const cx = 960;
    const cy = 750;
    ctx.save();
    ctx.fillStyle = '#2a2436';
    ctx.beginPath();
    ctx.arc(cx, cy, 260, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a4e6e';
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.fillStyle = '#322a40';
    ctx.beginPath();
    ctx.arc(cx, cy, 210, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6e5e85';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 150, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * 195, cy + Math.sin(ang) * 195);
      ctx.stroke();
    }

    // Sacred Central Hearth Floor Ring
    ctx.fillStyle = '#14101c';
    ctx.beginPath();
    ctx.arc(cx, cy, 68, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.stroke();

    const fireGlow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 65);
    fireGlow.addColorStop(0, 'rgba(249, 115, 22, 0.45)');
    fireGlow.addColorStop(0.6, 'rgba(180, 83, 9, 0.2)');
    fireGlow.addColorStop(1, 'rgba(20, 16, 28, 0)');
    ctx.fillStyle = fireGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 65, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. Specialized District Platforms
    // A) Santuário dos Portais (Oráculo Kaelen - x:960, y:440)
    ctx.save();
    const px = 960;
    const py = 440;
    ctx.fillStyle = '#161d2d';
    ctx.beginPath();
    ctx.arc(px, py, 135, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, 95, 0, Math.PI * 2);
    ctx.arc(px, py, 55, 0, Math.PI * 2);
    ctx.stroke();

    const portalGlow = ctx.createRadialGradient(px, py, 10, px, py, 120);
    portalGlow.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    portalGlow.addColorStop(0.7, 'rgba(14, 165, 233, 0.12)');
    portalGlow.addColorStop(1, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = portalGlow;
    ctx.beginPath();
    ctx.arc(px, py, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // B) Oficina da Forja das Cinzas (Ferreiro Ignis - x:960, y:690)
    ctx.save();
    ctx.fillStyle = '#261c1a';
    ctx.beginPath();
    ctx.roundRect(960 - 90, 690 - 75, 180, 130, 12);
    ctx.fill();
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 3;
    ctx.stroke();
    const forgeScorch = ctx.createRadialGradient(960, 690, 10, 960, 690, 80);
    forgeScorch.addColorStop(0, 'rgba(234, 88, 12, 0.35)');
    forgeScorch.addColorStop(1, 'rgba(15, 10, 8, 0)');
    ctx.fillStyle = forgeScorch;
    ctx.fillRect(960 - 85, 690 - 70, 170, 120);
    ctx.restore();

    // C) Empório da Alquimista Maeve (x:640, y:750)
    ctx.save();
    ctx.fillStyle = '#162820';
    ctx.beginPath();
    ctx.roundRect(640 - 85, 750 - 75, 170, 150, 12);
    ctx.fill();
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    ctx.stroke();
    const alchGlow = ctx.createRadialGradient(640, 750, 10, 640, 750, 80);
    alchGlow.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
    alchGlow.addColorStop(1, 'rgba(10, 25, 18, 0)');
    ctx.fillStyle = alchGlow;
    ctx.beginPath();
    ctx.arc(640, 750, 75, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // D) Cidadela das Missões / Comandante Vane (x:1280, y:750)
    ctx.save();
    ctx.fillStyle = '#2b211a';
    ctx.beginPath();
    ctx.roundRect(1280 - 85, 750 - 75, 170, 150, 12);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = 'rgba(180, 83, 9, 0.22)';
    ctx.fillRect(1280 - 65, 750 - 60, 130, 120);
    ctx.restore();

    // E) Mercado Livre / Corretor Silas (x:780, y:860)
    ctx.save();
    ctx.fillStyle = '#241a2e';
    ctx.beginPath();
    ctx.arc(780, 860, 75, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // F) Torre de Vigia da Guardiã Lyanna (x:1380, y:520)
    ctx.save();
    ctx.fillStyle = '#1c2420';
    ctx.beginPath();
    ctx.arc(1380, 520, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 3;
    ctx.stroke();
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.fillStyle = '#3a4a3f';
      ctx.fillRect(1380 + Math.cos(a) * 62 - 7, 520 + Math.sin(a) * 62 - 7, 14, 14);
    }
    ctx.restore();

    // G) Biblioteca Ancestral / Arquivista Éter (x:540, y:540)
    ctx.save();
    ctx.fillStyle = '#22192e';
    ctx.beginPath();
    ctx.roundRect(540 - 75, 540 - 70, 150, 140, 10);
    ctx.fill();
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // H) Arena de Treinamento / Boneco de Treino (x:1140, y:880)
    ctx.save();
    ctx.fillStyle = '#2d2720';
    ctx.beginPath();
    ctx.arc(1140, 880, 68, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(1140, 880, 48, 0, Math.PI * 2);
    ctx.arc(1140, 880, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 7. Ancient Rubble, Cracks, and Ash Motes
    for (let i = 0; i < 90; i++) {
      const rx = hash(i, 0, 71) * (width - 450) + 225;
      const ry = hash(i, 0, 83) * (height - 350) + 180;
      ctx.strokeStyle = 'rgba(12, 10, 18, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + 12 + (i % 7), ry + 8 - (i % 5));
      ctx.stroke();
    }

    for (let i = 0; i < 75; i++) {
      const mx = hash(i, 0, 107) * (width - 400) + 200;
      const my = hash(i, 0, 113) * (height - 300) + 150;
      ctx.fillStyle = i % 2 ? 'rgba(34, 197, 94, 0.12)' : 'rgba(22, 101, 52, 0.16)';
      ctx.beginPath();
      ctx.ellipse(mx, my, 8 + (i % 6), 4 + (i % 4), hash(i, 0, 127) * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 120; i++) {
      const ax = hash(i, 0, 137) * width;
      const ay = hash(i, 0, 149) * height;
      ctx.fillStyle = i % 4 === 0 ? 'rgba(251, 146, 60, 0.45)' : 'rgba(200, 190, 210, 0.15)';
      ctx.fillRect(ax, ay, 2, 2);
    }

    return true;
  }
`;

// Insert drawCastleRuins before getTerrain
code = code.replace(
  'function getTerrain(region, width, height) {',
  `${drawCastleRuinsCode}\n  function getTerrain(region, width, height) {`
);

// Update getTerrain to call drawCastleRuins on region.id === 0
code = code.replace(
  'const drawn = region.id === 1 ? drawForest(ctx, region, width, height) : (drawOtherBiome(ctx, region, width, height), true);',
  'const drawn = region.id === 0 ? drawCastleRuins(ctx, region, width, height) : (region.id === 1 ? drawForest(ctx, region, width, height) : (drawOtherBiome(ctx, region, width, height), true));'
);

// Update drawFloor for region.id === 0 ambient light
code = code.replace(
  "    if (region.id === 1) {\n      ctx.fillStyle = 'rgba(111, 125, 65, 0.09)';\n      ctx.fillRect(x, y, width, height);\n    }",
  `    if (region.id === 1) {
      ctx.fillStyle = 'rgba(111, 125, 65, 0.09)';
      ctx.fillRect(x, y, width, height);
    } else if (region.id === 0) {
      ctx.fillStyle = 'rgba(251, 146, 60, 0.03)';
      ctx.fillRect(x, y, width, height);
    }`
);

fs.writeFileSync(worldPath, code, 'utf8');
console.log('✓ js/world.js atualizado com sucesso!');
