// src/systems/ui/UIManager.js
// Gerenciamento de HUD, Barras de Vida/XP, Cooldowns e Notificações

import { getClassById } from '../../data/classes.data.js';
import { meleeDamage, arcaneDamage } from '../progression/ProgressionManager.js';

export function renderUI({ p, kills, ore, loot, quest = { kills, ore, loot, claimed: false } }) {
  if (!p) return;
  const $ = (q) => document.querySelector(q);
  const bar = (id, n) => {
    const el = $(id);
    if (el) el.style.width = Math.max(0, Math.min(100, n)) + '%';
  };

  // Currencies & Level
  if ($('#gold')) $('#gold').textContent = p.gold;
  if ($('#crystal')) $('#crystal').textContent = p.crystal;
  if ($('#level')) $('#level').textContent = 'Nv. ' + p.lvl;

  // Character sheet values
  if ($('#charLevel')) $('#charLevel').textContent = p.lvl;
  if ($('#charLevelText')) $('#charLevelText').textContent = p.lvl;
  if ($('#charHp')) $('#charHp').innerHTML = `${Math.ceil(p.hp)} <small>/ ${p.max}</small>`;
  const characterClass = getClassById(p.classId);
  const className = $('#heroClassName');
  if (className && characterClass) className.textContent = characterClass.icon + ' ' + characterClass.name + ' Errante';
  const talents = new Set(p.talents || []);
  if ($('#charMelee')) $('#charMelee').textContent = Math.round(meleeDamage(p.lvl, p.swordEquipped, p.weaponTier, p.classId) * (talents.has('brutal') ? 1.08 : 1) * (talents.has('avatar') ? 1.12 : 1));
  if ($('#charDefense')) $('#charDefense').textContent = (p.shieldEquipped ? 4 : 0) + (characterClass ? characterClass.armor : 0) + (talents.has('iron') ? 2 : 0);
  if ($('#charArcane')) $('#charArcane').textContent = Math.round(arcaneDamage(p.lvl, p.classId) * (talents.has('fire') ? 1.1 : 1) * (talents.has('warcry') ? 1.12 : 1) * (talents.has('avatar') ? 1.12 : 1));
  if ($('#charPotions')) $('#charPotions').textContent = `${p.potions} / 9`;
  if ($('#charXpBar')) $('#charXpBar').style.width = (p.need > 0 ? Math.max(0, Math.min(100, p.xp / p.need * 100)) : 100) + '%';
  if ($('#charXpText')) $('#charXpText').textContent = p.lvl >= 100 ? 'NÍVEL MÁXIMO' : `${p.xp} / ${p.need} XP`;
  
  document.querySelectorAll('.character-skill').forEach((button) => {
    const skill = Number(button.dataset.skill);
    const cooldown = p.cd?.[skill] || 0;
    const unavailable = skill === 1 && (p.potions <= 0 || p.hp >= p.max);
    button.disabled = cooldown > 0 || unavailable;
    const indicator = button.querySelector('.skill-use');
    if (indicator) indicator.textContent = cooldown > 0 ? `${Math.ceil(cooldown)}s` : '↗';
  });

  // Player Stats Bars
  bar('#hp', (p.hp / p.max) * 100);
  bar('#xp', p.need > 0 ? (p.xp / p.need) * 100 : 100);
  bar('#energy', p.en);

  if ($('#hpt')) $('#hpt').textContent = Math.ceil(p.hp) + ' / ' + p.max + ' HP';
  if ($('#xpt')) $('#xpt').textContent = p.lvl >= 100 ? 'NÍVEL MÁXIMO' : p.xp + ' / ' + p.need + ' XP';
  if ($('#energyt')) $('#energyt').textContent = Math.floor(p.en) + ' / 100 EN';

  // Quests
  const quests = [
    [() => quest.kills, '#qk', '#qkt', 'inimigos', 4],
    [() => quest.ore, '#qo', '#qot', 'minérios', 5],
    [() => quest.loot, '#ql', '#qlt', 'relíquias', 4]
  ];

  quests.forEach(([v, b, t, n, max]) => {
    bar(b, Math.min(100, (v() / max) * 100));
    const txt = $(t);
    if (txt) txt.textContent = Math.min(max, v()) + ' / ' + max + ' ' + n;
  });

  // Action Button Cooldowns
  document.querySelectorAll('.action').forEach((b) => {
    const k = Number(b.dataset.k);
    const cd = p.cd && p.cd[k] ? p.cd[k] : 0;
    const isCool = cd > 0;
    b.classList.toggle('cool', isCool);
    const unavailable = k === 1 && (p.potions <= 0 || p.hp >= p.max);
    b.classList.toggle('unavailable', unavailable);
    b.setAttribute('aria-disabled', String(unavailable || isCool));
    const cdText = b.querySelector('.cooldown-text');
    if (cdText) {
      cdText.textContent = isCool ? (cd < 1 ? cd.toFixed(1) + 's' : Math.ceil(cd) + 's') : '';
    }
  });

  // Sync Class-specific Skill 5 & 6 icons & tooltips
  if (characterClass) {
    const s2Btn = $('#skillBtn2');
    if (s2Btn && characterClass.skill2) {
      s2Btn.title = `${characterClass.skill2.name} · ${characterClass.skill2.desc} (Tecla 2)`;
      const s2Icon = $('#skillIcon2 img');
      if (s2Icon) s2Icon.alt = characterClass.skill2.name;
    }
    const s5Btn = $('#skillBtn5');
    const s5Icon = $('#skillIcon5');
    if (s5Btn && characterClass.skill5) {
      if (s5Icon) {
        const iconSrc = characterClass.skill5.iconImg || 'assets/icons/skills/Icon25.png';
        if (!s5Icon.querySelector('img') || s5Icon.querySelector('img').getAttribute('src') !== iconSrc) {
          s5Icon.innerHTML = `<img src="${iconSrc}" alt="${characterClass.skill5.name}" />`;
        }
      }
      s5Btn.title = `${characterClass.skill5.name} · ${characterClass.skill5.desc} (Tecla Q ou 5)`;
    }
    const s6Btn = $('#skillBtn6');
    const s6Icon = $('#skillIcon6');
    if (s6Btn && characterClass.skill6) {
      if (s6Icon) {
        const iconSrc = characterClass.skill6.iconImg || 'assets/icons/skills/Icon20.png';
        if (!s6Icon.querySelector('img') || s6Icon.querySelector('img').getAttribute('src') !== iconSrc) {
          s6Icon.innerHTML = `<img src="${iconSrc}" alt="${characterClass.skill6.name}" />`;
        }
      }
      s6Btn.title = `${characterClass.skill6.name} · ${characterClass.skill6.desc} (Tecla R ou 6)`;
    }
  }

  // Active Buff (Escudo de Cinzas)
  const hudStatus = $('#hudStatus');
  const buffTimer = $('#buffTimer');
  if (hudStatus && buffTimer) {
    if (p.shield && p.shield > 0) {
      hudStatus.hidden = false;
      buffTimer.textContent = p.shield.toFixed(1) + 's';
    } else {
      hudStatus.hidden = true;
    }
  }

  // Contract button glow if ready
  const claimBtn = $('#claim');
  if (claimBtn) {
    const ready = quest.kills >= 4 && quest.ore >= 5 && quest.loot >= 4 && !quest.claimed;
    if (ready && !claimBtn.dataset.claimed) {
      claimBtn.style.boxShadow = '0 0 16px rgba(255, 215, 0, 0.6)';
      claimBtn.style.borderColor = '#ffd700';
    } else {
      claimBtn.style.boxShadow = '';
      claimBtn.style.borderColor = '';
    }
  }
}

export function showMessage(text) {
  const hint = document.querySelector('#hint');
  if (!hint) return;
  hint.textContent = text;
  hint.classList.add('visible');
  clearTimeout(hint._timer);
  hint._timer = setTimeout(() => {
    hint.classList.remove('visible');
  }, 3200);
}

export const uiManager = {
  renderUI,
  msg: showMessage
};

if (typeof window !== 'undefined') {
  window.GameUI = uiManager;
  window.renderUI = renderUI;
}
