import fs from 'fs';
import path from 'path';

const gameDir = 'D:/Game/Jogo WEB';

console.log('--- ETAPA 1: ATUALIZAR STYLES.CSS ---');
const stylesPath = path.join(gameDir, 'styles.css');
let stylesContent = fs.readFileSync(stylesPath, 'utf8');

const targetActionIcon = '.action-icon {\r\n  font-size: 22px;\r\n  line-height: 1;\r\n}';
const targetActionIconUnix = '.action-icon {\n  font-size: 22px;\n  line-height: 1;\n}';

const newActionIcon = `.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  font-size: 22px;
  line-height: 1;
}

.action-icon img {
  width: 30px;
  height: 30px;
  image-rendering: pixelated;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.7));
  pointer-events: none;
  transition: transform 0.15s ease;
}

.action:hover .action-icon img {
  transform: scale(1.12);
}

.inv-item-img {
  width: 28px;
  height: 28px;
  image-rendering: pixelated;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.7));
  pointer-events: none;
}

.inv-doll-img {
  width: 24px;
  height: 24px;
  image-rendering: pixelated;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.7));
  pointer-events: none;
}

.inv-inspect-img {
  width: 44px;
  height: 44px;
  image-rendering: pixelated;
  object-fit: contain;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.85));
  pointer-events: none;
}`;

if (stylesContent.includes(targetActionIcon)) {
  stylesContent = stylesContent.replace(targetActionIcon, newActionIcon.replace(/\n/g, '\r\n'));
  console.log('styles.css atualizado com sucesso (CRLF)');
} else if (stylesContent.includes(targetActionIconUnix)) {
  stylesContent = stylesContent.replace(targetActionIconUnix, newActionIcon);
  console.log('styles.css atualizado com sucesso (LF)');
} else {
  stylesContent += '\r\n\r\n' + newActionIcon.replace(/\n/g, '\r\n');
  console.log('styles.css: regras adicionadas');
}
fs.writeFileSync(stylesPath, stylesContent, 'utf8');

console.log('--- ETAPA 2: ATUALIZAR INDEX.HTML ---');
const indexPath = path.join(gameDir, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const oldActionsPattern = /<button class="action" data-k="1"[\s\S]*?<\/button>\s*<button class="action" data-k="2"[\s\S]*?<\/button>\s*<button class="action" data-k="3"[\s\S]*?<\/button>\s*<button class="action" data-k="4"[\s\S]*?<\/button>\s*<button class="action" data-k="5"[\s\S]*?<\/button>\s*<button class="action action-ultimate" data-k="6"[\s\S]*?<\/button>/;

const newActionsHtml = `<button class="action" data-k="1" id="skillBtn1" title="Poção de cura (Tecla 1)">
            <small class="action-key">1</small>
            <span class="action-icon" id="skillIcon1"><img src="assets/icons/skills/Icon42.png" alt="Cura" /></span>
            <div class="cooldown-overlay"><span class="cooldown-text"></span></div>
          </button>
          
          <button class="action" data-k="2" id="skillBtn2" title="Ataque de classe (Tecla 2)">
            <small class="action-key">2</small>
            <span class="action-icon" id="skillIcon2"><img src="assets/icons/skills/Icon19.png" alt="Ataque" /></span>
            <div class="cooldown-overlay"><span class="cooldown-text"></span></div>
          </button>
          
          <button class="action" data-k="3" id="skillBtn3" title="Escudo de cinzas (Tecla 3)">
            <small class="action-key">3</small>
            <span class="action-icon" id="skillIcon3"><img src="assets/icons/skills/Icon43.png" alt="Escudo" /></span>
            <div class="cooldown-overlay"><span class="cooldown-text"></span></div>
          </button>
          
          <button class="action" data-k="4" id="skillBtn4" title="Investida rápida (Tecla 4)">
            <small class="action-key">4</small>
            <span class="action-icon" id="skillIcon4"><img src="assets/icons/skills/Icon24.png" alt="Investida" /></span>
            <div class="cooldown-overlay"><span class="cooldown-text"></span></div>
          </button>
          
          <button class="action" data-k="5" id="skillBtn5" title="Habilidade de Área (Tecla Q ou 5)">
            <small class="action-key">Q</small>
            <span class="action-icon" id="skillIcon5"><img src="assets/icons/skills/Icon25.png" alt="Área" /></span>
            <div class="cooldown-overlay"><span class="cooldown-text"></span></div>
          </button>
          
          <button class="action action-ultimate" data-k="6" id="skillBtn6" title="Habilidade Suprema (Tecla R ou 6)">
            <small class="action-key">R</small>
            <span class="action-icon" id="skillIcon6"><img src="assets/icons/skills/Icon20.png" alt="Suprema" /></span>
            <div class="cooldown-overlay"><span class="cooldown-text"></span></div>
          </button>`;

if (oldActionsPattern.test(indexContent)) {
  indexContent = indexContent.replace(oldActionsPattern, newActionsHtml);
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('index.html: botões de ação atualizados com ícones pixel art');
} else {
  console.warn('Aviso: Padrão dos botões de ação não coincidiu exatamente no index.html');
}

console.log('--- ETAPA 3: ATUALIZAR JS/CLASSES.JS ---');
const classesPath = path.join(gameDir, 'js/classes.js');
let classesContent = fs.readFileSync(classesPath, 'utf8');

// Adiciona iconImg em skill5 e skill6 em cada classe se ainda não tiver
classesContent = classesContent
  .replace("icon: '🌪️', cd: 8", "icon: '🌪️', iconImg: 'assets/icons/skills/Icon25.png', cd: 8")
  .replace("icon: '👑', cd: 24", "icon: '👑', iconImg: 'assets/icons/skills/Icon20.png', cd: 24")
  .replace("icon: '🏹', cd: 8", "icon: '🏹', iconImg: 'assets/icons/skills/Icon16.png', cd: 8")
  .replace("icon: '🐲', cd: 22", "icon: '🐲', iconImg: 'assets/icons/skills/Icon46.png', cd: 22")
  .replace("icon: '🗡️', cd: 7", "icon: '🗡️', iconImg: 'assets/icons/skills/Icon5.png', cd: 7")
  .replace("icon: '☠️', cd: 20", "icon: '☠️', iconImg: 'assets/icons/skills/Icon6.png', cd: 20")
  .replace("icon: '💥', cd: 9", "icon: '💥', iconImg: 'assets/icons/skills/Icon27.png', cd: 9")
  .replace("icon: '🔥', cd: 25", "icon: '🔥', iconImg: 'assets/icons/skills/Icon10.png', cd: 25")
  .replace("icon: '✝️', cd: 9", "icon: '✝️', iconImg: 'assets/icons/skills/Icon31.png', cd: 9")
  .replace("icon: '✨', cd: 26", "icon: '✨', iconImg: 'assets/icons/skills/Icon49.png', cd: 26")
  .replace("icon: '☄️', cd: 9", "icon: '☄️', iconImg: 'assets/icons/skills/Icon45.png', cd: 9")
  .replace("icon: '🌌', cd: 24", "icon: '🌌', iconImg: 'assets/icons/skills/Icon38.png', cd: 24");

fs.writeFileSync(classesPath, classesContent, 'utf8');
console.log('js/classes.js: skills atualizadas com iconImg');

console.log('--- ETAPA 4: ATUALIZAR JS/GAME.JS ---');
const gameJsPath = path.join(gameDir, 'js/game.js');
let gameJsContent = fs.readFileSync(gameJsPath, 'utf8');

// Adiciona updateClassSkillIcons() se não existir
if (!gameJsContent.includes('function updateClassSkillIcons')) {
  const insertTarget = '  document.querySelectorAll(\'.action\').forEach((b) => {';
  const helperCode = `  function updateClassSkillIcons() {
    const cls = window.GameClasses?.get ? window.GameClasses.get(p.classId) : null;
    if (!cls) return;

    const s1 = $('#skillIcon1');
    if (s1) s1.innerHTML = '<img src="assets/icons/skills/Icon42.png" alt="Cura" />';

    const s2 = $('#skillIcon2');
    const s2Img = cls.id === 'mago' ? 'Icon14.png' : cls.id === 'arqueiro' ? 'Icon12.png' : cls.id === 'assasino' ? 'Icon4.png' : cls.id === 'barbaro' ? 'Icon2.png' : cls.id === 'clerigo' ? 'Icon35.png' : 'Icon19.png';
    if (s2) s2.innerHTML = '<img src="assets/icons/skills/' + s2Img + '" alt="' + cls.name + '" />';

    const s3 = $('#skillIcon3');
    const s3Img = ['arqueiro', 'assasino'].includes(cls.id) ? 'Icon29.png' : 'Icon43.png';
    if (s3) s3.innerHTML = '<img src="assets/icons/skills/' + s3Img + '" alt="Defesa" />';

    const s4 = $('#skillIcon4');
    if (s4) s4.innerHTML = '<img src="assets/icons/skills/Icon24.png" alt="Investida" />';

    const s5 = $('#skillIcon5');
    const sk5Img = cls.skill5?.iconImg || 'assets/icons/skills/Icon25.png';
    if (s5) s5.innerHTML = '<img src="' + sk5Img + '" alt="' + (cls.skill5?.name || 'Área') + '" />';

    const s6 = $('#skillIcon6');
    const sk6Img = cls.skill6?.iconImg || 'assets/icons/skills/Icon20.png';
    if (s6) s6.innerHTML = '<img src="' + sk6Img + '" alt="' + (cls.skill6?.name || 'Suprema') + '" />';

    if (cls.skill5) $('#skillBtn5')?.setAttribute('title', cls.skill5.name + ' · ' + cls.skill5.desc + ' (Tecla Q)');
    if (cls.skill6) $('#skillBtn6')?.setAttribute('title', 'SUPREMA: ' + cls.skill6.name + ' · ' + cls.skill6.desc + ' (Tecla R)');
  }
  updateClassSkillIcons();
\n`;
  if (gameJsContent.includes(insertTarget)) {
    gameJsContent = gameJsContent.replace(insertTarget, helperCode + insertTarget);
    fs.writeFileSync(gameJsPath, gameJsContent, 'utf8');
    console.log('js/game.js: updateClassSkillIcons() inserido e executado');
  }
}

console.log('--- Concluído patch de HUD e Classes! ---');
