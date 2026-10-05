// src/systems/multiplayer/TradeManager.js
// ═══════════════════════════════════════════════════════════════
//  GUERRA DAS CINZAS — Sistema de Negociação e Trocas
//  Two-phase commit anti-scam trade window with pixel-art UI
// ═══════════════════════════════════════════════════════════════

import { cinzasNet } from './CinzasNet.js';

// ─── Constantes ───────────────────────────────────────────────
const MAX_TRADE_SLOTS = 6;

// ─── Estilos CSS ──────────────────────────────────────────────
const TRADE_STYLES = `
  /* ── Sobreposição da Janela de Troca ── */
  .trade-overlay {
    position: fixed; inset: 0; z-index: 250;
    background: rgba(4, 6, 12, 0.88);
    backdrop-filter: blur(8px);
    display: none; align-items: center; justify-content: center;
    font-family: 'Outfit', sans-serif;
  }
  .trade-overlay.active { display: flex; }

  /* ── Janela Principal ── */
  .trade-window {
    background: linear-gradient(175deg, #10141f 0%, #080b14 100%);
    border: 1px solid rgba(245, 158, 11, 0.5);
    box-shadow: 0 24px 64px rgba(0,0,0,0.95), 0 0 32px rgba(245,158,11,0.12);
    border-radius: 10px;
    width: 700px; max-width: 96vw;
    overflow: hidden;
    animation: tradeWindowPop 0.2s cubic-bezier(0.16,1,0.3,1);
    user-select: none;
  }
  @keyframes tradeWindowPop {
    from { opacity:0; transform: scale(0.93) translateY(14px); }
    to   { opacity:1; transform: scale(1) translateY(0); }
  }

  /* ── Cabeçalho ── */
  .trade-header {
    padding: 14px 20px;
    background: rgba(245,158,11,0.07);
    border-bottom: 1px solid rgba(245,158,11,0.22);
    display: flex; align-items: center; justify-content: space-between;
  }
  .trade-header h2 {
    margin: 0; font-size: 15px; font-weight: 700; color: #f8fafc;
    display: flex; align-items: center; gap: 8px;
  }
  .trade-partner-badge {
    background: rgba(245,158,11,0.15);
    border: 1px solid rgba(245,158,11,0.3);
    border-radius: 4px; padding: 2px 10px;
    font-size: 12px; font-weight: 700; color: #fde68a;
    letter-spacing: 0.05em;
  }
  .trade-close-btn {
    background: transparent; border: none; color: #64748b;
    font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px;
    transition: color 0.1s, background 0.1s;
  }
  .trade-close-btn:hover { color: #ef4444; background: rgba(239,68,68,0.12); }

  /* ── Corpo de duas colunas ── */
  .trade-body {
    display: grid; grid-template-columns: 1fr 1fr; gap: 0;
  }
  .trade-panel {
    padding: 16px 18px;
    border-right: 1px solid rgba(255,255,255,0.05);
  }
  .trade-panel:last-child { border-right: none; }
  .trade-panel-label {
    font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em;
    color: #94a3b8; text-transform: uppercase; margin-bottom: 10px;
    display: flex; align-items: center; gap: 6px;
  }
  .trade-panel-label .player-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #f59e0b;
    box-shadow: 0 0 5px #f59e0b;
  }
  .trade-panel-label .player-dot.self { background: #4ade80; box-shadow: 0 0 5px #4ade80; }

  /* ── Grade de Slots de Troca ── */
  .trade-slots {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
    margin-bottom: 12px;
  }
  .trade-slot {
    aspect-ratio: 1; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 5px; background: rgba(255,255,255,0.03);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: border-color 0.15s, background 0.15s;
    position: relative; overflow: hidden;
  }
  .trade-slot.self-slot:hover {
    border-color: rgba(74,222,128,0.5); background: rgba(74,222,128,0.07);
  }
  .trade-slot.filled { border-color: rgba(245,158,11,0.4); }
  .trade-slot.filled .slot-icon {
    width: 36px; height: 36px; object-fit: contain; image-rendering: pixelated;
  }
  .trade-slot.filled .slot-count {
    position: absolute; bottom: 3px; right: 4px;
    font-size: 9px; font-weight: 700; color: #fef08a;
    text-shadow: 0 1px 2px #000;
  }
  .trade-slot.filled .slot-enh {
    position: absolute; top: 2px; left: 3px;
    font-size: 8px; font-weight: 700; color: #86efac;
  }
  .trade-slot .slot-empty-icon { font-size: 16px; opacity: 0.18; }
  .trade-slot .slot-remove-btn {
    position: absolute; top: 2px; right: 2px;
    background: rgba(239,68,68,0.85); border: none; border-radius: 3px;
    color: #fff; font-size: 8px; cursor: pointer; padding: 1px 4px; line-height: 1;
    display: none;
  }
  .trade-slot.filled:hover .slot-remove-btn { display: block; }
  .trade-slot.self-slot { cursor: pointer; }
  .trade-slot:not(.self-slot) { cursor: default; }

  /* ── Campo de Ouro ── */
  .trade-gold-row {
    display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
  }
  .trade-gold-label { font-size: 11px; color: #94a3b8; white-space: nowrap; }
  .trade-gold-input {
    flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 4px; color: #fef08a; font-size: 12px; font-weight: 700;
    padding: 5px 8px; outline: none; font-family: inherit;
    transition: border-color 0.15s;
  }
  .trade-gold-input:focus { border-color: rgba(245,158,11,0.5); }
  .trade-gold-input:read-only { color: #94a3b8; cursor: default; }
  .trade-gold-icon { font-size: 14px; }

  /* ── Status de Lock / Confirm ── */
  .trade-status-row {
    display: flex; align-items: center; gap: 6px; margin-bottom: 10px;
  }
  .trade-status-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 9.5px; font-weight: 700; letter-spacing: 0.08em;
    padding: 3px 8px; border-radius: 3px;
    border: 1px solid rgba(255,255,255,0.1);
    color: #64748b; background: rgba(255,255,255,0.04);
    transition: all 0.2s;
  }
  .trade-status-badge.locked {
    background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.4);
    color: #fde68a;
  }
  .trade-status-badge.confirmed {
    background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.4);
    color: #86efac;
  }

  /* ── Botões de Ação ── */
  .trade-actions {
    padding: 14px 18px;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex; gap: 10px; justify-content: flex-end;
    background: rgba(0,0,0,0.2);
  }
  .trade-btn {
    border: none; border-radius: 5px; cursor: pointer;
    font-family: inherit; font-size: 12px; font-weight: 700;
    padding: 8px 18px; transition: filter 0.15s, transform 0.08s;
  }
  .trade-btn:active { transform: scale(0.96); }
  .trade-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .trade-btn.lock {
    background: linear-gradient(180deg,#d97706,#b45309);
    border: 1px solid #f59e0b; color: #fff;
  }
  .trade-btn.confirm {
    background: linear-gradient(180deg,#16a34a,#15803d);
    border: 1px solid #22c55e; color: #fff;
  }
  .trade-btn.cancel {
    background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.35);
    color: #fca5a5;
  }
  .trade-btn:not(:disabled):hover { filter: brightness(1.18); }

  /* ── Divisor central ── */
  .trade-divider {
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; color: rgba(245,158,11,0.4);
    padding: 0 2px;
  }

  /* ── Toast de convite ── */
  .trade-request-toast {
    position: fixed; bottom: 100px; right: 22px; z-index: 300;
    background: linear-gradient(175deg,#10141f,#080b14);
    border: 1px solid rgba(245,158,11,0.55);
    box-shadow: 0 12px 28px rgba(0,0,0,0.85), 0 0 16px rgba(245,158,11,0.15);
    border-radius: 8px; padding: 14px 16px; min-width: 280px;
    animation: tradeToastIn 0.2s cubic-bezier(0.16,1,0.3,1);
    font-family: 'Outfit', sans-serif;
  }
  @keyframes tradeToastIn {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .trade-request-title {
    font-size: 12.5px; font-weight: 700; color: #fde68a;
    margin-bottom: 4px; display: flex; align-items: center; gap: 6px;
  }
  .trade-request-sub { font-size: 11px; color: #94a3b8; margin-bottom: 12px; }
  .trade-request-btns { display: flex; gap: 8px; }
  .trade-request-btns button {
    flex: 1; border: none; border-radius: 4px; font-family: inherit;
    font-size: 11.5px; font-weight: 700; padding: 7px 0; cursor: pointer;
    transition: filter 0.12s;
  }
  .trade-request-btns button:hover { filter: brightness(1.15); }
  .trade-toast-accept {
    background: linear-gradient(180deg,#16a34a,#15803d);
    border: 1px solid #22c55e !important; color:#fff;
  }
  .trade-toast-decline {
    background: rgba(239,68,68,0.15);
    border: 1px solid rgba(239,68,68,0.35) !important; color: #fca5a5;
  }

  /* ── Picker de inventário ── */
  .trade-inv-picker-overlay {
    position: fixed; inset: 0; z-index: 280;
    background: rgba(4,6,12,0.8);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
  }
  .trade-inv-picker {
    background: linear-gradient(175deg,#10141f,#080b14);
    border: 1px solid rgba(74,222,128,0.4);
    box-shadow: 0 16px 40px rgba(0,0,0,0.9);
    border-radius: 8px; padding: 18px; min-width: 340px;
    max-height: 80vh; overflow-y: auto;
  }
  .trade-inv-picker h3 {
    margin: 0 0 12px; font-size: 13px; font-weight: 700; color: #86efac;
  }
  .trade-inv-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
  }
  .trade-inv-item {
    aspect-ratio:1; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 5px; background: rgba(255,255,255,0.04);
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 2px; cursor: pointer;
    transition: border-color 0.12s, background 0.12s;
    padding: 4px; position: relative;
  }
  .trade-inv-item:hover { border-color: rgba(74,222,128,0.5); background: rgba(74,222,128,0.07); }
  .trade-inv-item img { width: 32px; height: 32px; object-fit: contain; image-rendering: pixelated; }
  .trade-inv-item-name { font-size: 7.5px; color: #94a3b8; text-align:center; line-height:1.2; }
  .trade-inv-cancel { margin-top: 12px; width:100%; }
`;

export class TradeManager {
  constructor() {
    this.overlay = null;
    this.toastNode = null;
    this.pickerOverlay = null;
    this._slotTarget = -1; // qual slot estamos preenchendo

    // Estado local da troca
    this.sessionId = null;
    this.partner = null; // { id, name }
    this.myId = null;

    // Ofertas locais (6 slots)
    this.myItems = []; // array de { id, count, enhanceLevel, name, iconImg } ou null
    this.myGold = 0;
    this.myLocked = false;
    this.myConfirmed = false;

    // Estado remoto (do servidor)
    this.partnerItems = [];
    this.partnerGold = 0;
    this.partnerLocked = false;
    this.partnerConfirmed = false;

    this._styleInjected = false;
  }

  init() {
    this._injectStyles();
    this._buildOverlay();
    this._wireNetEvents();
  }

  // ─── Injeção de estilos ───────────────────────────────────────
  _injectStyles() {
    if (this._styleInjected || document.getElementById('trade-manager-styles')) return;
    const style = document.createElement('style');
    style.id = 'trade-manager-styles';
    style.textContent = TRADE_STYLES;
    document.head.appendChild(style);
    this._styleInjected = true;
  }

  // ─── Constrói o DOM da janela de troca ───────────────────────
  _buildOverlay() {
    if (this.overlay) return;
    const el = document.createElement('div');
    el.className = 'trade-overlay';
    el.id = 'cinzasTradeOverlay';
    el.innerHTML = `
      <div class="trade-window" role="dialog" aria-modal="true" aria-label="Janela de Negociação">
        <div class="trade-header">
          <h2>⚖️ Negociação <span class="trade-partner-badge" id="tradePartnerName">—</span></h2>
          <button type="button" class="trade-close-btn" id="tradeCloseBtn" aria-label="Cancelar Negociação">×</button>
        </div>

        <div class="trade-body">
          <!-- COLUNA MINHA -->
          <div class="trade-panel" id="tradeMyPanel">
            <div class="trade-panel-label">
              <span class="player-dot self"></span>
              <span id="tradeMyName">Você</span>
            </div>
            <div class="trade-slots" id="tradeMySlots">
              ${Array.from({length: MAX_TRADE_SLOTS}, (_, i) => `
                <div class="trade-slot self-slot" data-slot="${i}" id="tradeMySlot${i}">
                  <span class="slot-empty-icon">+</span>
                </div>
              `).join('')}
            </div>
            <div class="trade-gold-row">
              <span class="trade-gold-icon">🪙</span>
              <span class="trade-gold-label">Ouro:</span>
              <input type="number" class="trade-gold-input" id="tradeMyGold" min="0" max="9999999"
                placeholder="0" autocomplete="off" />
            </div>
            <div class="trade-status-row">
              <span class="trade-status-badge" id="tradeMyLockBadge">🔓 Não Bloqueado</span>
              <span class="trade-status-badge" id="tradeMyConfirmBadge">⏳ Aguardando</span>
            </div>
          </div>

          <!-- COLUNA DO PARCEIRO -->
          <div class="trade-panel" id="tradePartnerPanel">
            <div class="trade-panel-label">
              <span class="player-dot"></span>
              <span id="tradePartnerNamePanel">Parceiro</span>
            </div>
            <div class="trade-slots" id="tradePartnerSlots">
              ${Array.from({length: MAX_TRADE_SLOTS}, (_, i) => `
                <div class="trade-slot" data-slot="${i}" id="tradePartnerSlot${i}">
                  <span class="slot-empty-icon">?</span>
                </div>
              `).join('')}
            </div>
            <div class="trade-gold-row">
              <span class="trade-gold-icon">🪙</span>
              <span class="trade-gold-label">Ouro:</span>
              <input type="number" class="trade-gold-input" id="tradePartnerGold" min="0"
                value="0" readonly />
            </div>
            <div class="trade-status-row">
              <span class="trade-status-badge" id="tradePartnerLockBadge">🔓 Não Bloqueado</span>
              <span class="trade-status-badge" id="tradePartnerConfirmBadge">⏳ Aguardando</span>
            </div>
          </div>
        </div>

        <div class="trade-actions">
          <button type="button" class="trade-btn cancel" id="tradeCancelBtn">❌ Cancelar</button>
          <button type="button" class="trade-btn lock" id="tradeLockBtn">🔒 Bloquear Oferta</button>
          <button type="button" class="trade-btn confirm" id="tradeConfirmBtn" disabled>✅ Confirmar Troca</button>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    this.overlay = el;
    this._bindOverlayEvents();
  }

  // ─── Eventos internos da janela ──────────────────────────────
  _bindOverlayEvents() {
    // Botão fechar / cancelar
    this.overlay.querySelector('#tradeCloseBtn').addEventListener('click', () => this._cancelTrade());
    this.overlay.querySelector('#tradeCancelBtn').addEventListener('click', () => this._cancelTrade());

    // Slots MEUS: abrir picker
    for (let i = 0; i < MAX_TRADE_SLOTS; i++) {
      const slot = this.overlay.querySelector(`#tradeMySlot${i}`);
      slot.addEventListener('click', (e) => {
        if (e.target.classList.contains('slot-remove-btn')) {
          e.stopPropagation();
          this._removeMyItem(i);
          return;
        }
        if (this.myLocked) return; // oferta bloqueada, não pode alterar
        const existingItem = this.myItems[i];
        if (existingItem) {
          this._removeMyItem(i);
        } else {
          this._openItemPicker(i);
        }
      });
    }

    // Campo de ouro
    const goldInput = this.overlay.querySelector('#tradeMyGold');
    goldInput.addEventListener('input', () => {
      if (this.myLocked) { goldInput.value = this.myGold; return; }
      this.myGold = Math.max(0, parseInt(goldInput.value, 10) || 0);
      this._sendOffer();
    });

    // Botão Bloquear
    this.overlay.querySelector('#tradeLockBtn').addEventListener('click', () => {
      this.myLocked = !this.myLocked;
      this._updateLockButton();
      this._sendOffer();
    });

    // Botão Confirmar
    this.overlay.querySelector('#tradeConfirmBtn').addEventListener('click', () => {
      cinzasNet.sendTradeConfirm();
    });
  }

  // ─── Picker de Inventário ────────────────────────────────────
  _openItemPicker(slotIndex) {
    this._slotTarget = slotIndex;
    if (this.pickerOverlay) this.pickerOverlay.remove();

    const inv = window.GameItems?.inventory || [];
    const db = window.GameItems?.ITEM_DATABASE || {};

    // Filtra itens que ainda não estão ofertados
    const offered = this.myItems.filter(Boolean).map(i => i._invIndex);
    const available = inv.map((it, idx) => ({ ...it, _invIndex: idx }))
      .filter(it => !offered.includes(it._invIndex) && db[it.id]);

    const el = document.createElement('div');
    el.className = 'trade-inv-picker-overlay';
    el.innerHTML = `
      <div class="trade-inv-picker">
        <h3>🎒 Selecionar Item para Oferta</h3>
        <div class="trade-inv-grid" id="tradeInvGrid">
          ${available.length === 0
            ? '<p style="color:#64748b;font-size:11px;grid-column:1/-1">Nenhum item disponível no inventário.</p>'
            : available.map(it => {
                const base = db[it.id];
                return `
                  <div class="trade-inv-item" data-inv-index="${it._invIndex}">
                    <img src="${base.iconImg || ''}" alt="${base.name}" onerror="this.style.display='none'" />
                    <div class="trade-inv-item-name">${base.name}</div>
                  </div>`;
              }).join('')
          }
        </div>
        <button type="button" class="trade-btn cancel trade-inv-cancel" id="tradePickerCancel">Cancelar</button>
      </div>
    `;
    document.body.appendChild(el);
    this.pickerOverlay = el;

    el.querySelector('#tradePickerCancel').addEventListener('click', () => el.remove());
    el.addEventListener('click', (e) => {
      if (e.target === el) el.remove();
      const item = e.target.closest('[data-inv-index]');
      if (!item) return;
      const idx = parseInt(item.dataset.invIndex, 10);
      this._pickItem(idx);
      el.remove();
    });
  }

  _pickItem(invIndex) {
    const inv = window.GameItems?.inventory || [];
    const db = window.GameItems?.ITEM_DATABASE || {};
    const it = inv[invIndex];
    if (!it) return;
    const base = db[it.id];
    if (!base) return;

    this.myItems[this._slotTarget] = {
      id: it.id,
      count: it.count || 1,
      enhanceLevel: it.enhanceLevel || 0,
      name: base.name,
      iconImg: base.iconImg || '',
      _invIndex: invIndex
    };
    this._renderMySlots();
    this._sendOffer();
  }

  _removeMyItem(slotIndex) {
    if (this.myLocked) return;
    this.myItems[slotIndex] = null;
    this._renderMySlots();
    this._sendOffer();
  }

  // ─── Renderização dos slots ───────────────────────────────────
  _renderMySlots() {
    for (let i = 0; i < MAX_TRADE_SLOTS; i++) {
      const slot = this.overlay?.querySelector(`#tradeMySlot${i}`);
      if (!slot) continue;
      const it = this.myItems[i] || null;
      this._renderSlot(slot, it, true, this.myLocked);
    }
  }

  _renderPartnerSlots() {
    for (let i = 0; i < MAX_TRADE_SLOTS; i++) {
      const slot = this.overlay?.querySelector(`#tradePartnerSlot${i}`);
      if (!slot) continue;
      const it = this.partnerItems[i] || null;
      this._renderSlot(slot, it, false, false);
    }
  }

  _renderSlot(slotEl, item, isSelf, isLocked) {
    if (item) {
      slotEl.classList.add('filled');
      const base = window.GameItems?.ITEM_DATABASE?.[item.id];
      const icon = item.iconImg || base?.iconImg || '';
      const enh = item.enhanceLevel ? `+${item.enhanceLevel}` : '';
      slotEl.innerHTML = `
        ${icon ? `<img class="slot-icon" src="${icon}" alt="${item.name}" onerror="this.style.display='none'" />` : `<span style="font-size:20px">📦</span>`}
        ${item.count > 1 ? `<span class="slot-count">×${item.count}</span>` : ''}
        ${enh ? `<span class="slot-enh">${enh}</span>` : ''}
        ${isSelf && !isLocked ? `<button class="slot-remove-btn" aria-label="Remover">✕</button>` : ''}
      `;
      slotEl.title = item.name;
    } else {
      slotEl.classList.remove('filled');
      slotEl.innerHTML = `<span class="slot-empty-icon">${isSelf ? '+' : '?'}</span>`;
      slotEl.title = '';
    }
  }

  // ─── Envia oferta ao servidor ─────────────────────────────────
  _sendOffer() {
    const items = this.myItems.filter(Boolean).map(it => ({
      id: it.id, count: it.count, enhanceLevel: it.enhanceLevel, name: it.name
    }));
    cinzasNet.sendTradeOffer(this.myGold, items, this.myLocked);
  }

  // ─── Atualiza botão de lock ───────────────────────────────────
  _updateLockButton() {
    const btn = this.overlay?.querySelector('#tradeLockBtn');
    const goldInput = this.overlay?.querySelector('#tradeMyGold');
    if (!btn) return;
    if (this.myLocked) {
      btn.textContent = '🔓 Desbloquear Oferta';
      if (goldInput) goldInput.readOnly = true;
    } else {
      btn.textContent = '🔒 Bloquear Oferta';
      if (goldInput) goldInput.readOnly = false;
    }
  }

  // ─── Atualiza badges de status ────────────────────────────────
  _refreshStatusBadges() {
    this._setBadge('tradeMyLockBadge',
      this.myLocked ? '🔒 Bloqueado' : '🔓 Desbloqueado',
      this.myLocked ? 'locked' : '');

    this._setBadge('tradeMyConfirmBadge',
      this.myConfirmed ? '✅ Confirmado' : '⏳ Aguardando',
      this.myConfirmed ? 'confirmed' : '');

    this._setBadge('tradePartnerLockBadge',
      this.partnerLocked ? '🔒 Bloqueado' : '🔓 Desbloqueado',
      this.partnerLocked ? 'locked' : '');

    this._setBadge('tradePartnerConfirmBadge',
      this.partnerConfirmed ? '✅ Confirmado' : '⏳ Aguardando',
      this.partnerConfirmed ? 'confirmed' : '');

    // Ativa botão Confirmar apenas quando ambos estão bloqueados
    const confirmBtn = this.overlay?.querySelector('#tradeConfirmBtn');
    if (confirmBtn) {
      confirmBtn.disabled = !(this.myLocked && this.partnerLocked);
    }
  }

  _setBadge(id, text, cls) {
    const el = this.overlay?.querySelector(`#${id}`);
    if (!el) return;
    el.textContent = text;
    el.className = 'trade-status-badge ' + (cls || '');
  }

  // ─── Cancela a troca ──────────────────────────────────────────
  _cancelTrade() {
    cinzasNet.sendTradeCancel();
    this._closeWindow();
  }

  _closeWindow() {
    this.overlay?.classList.remove('active');
    this.pickerOverlay?.remove();
    this._resetState();
  }

  _resetState() {
    this.sessionId = null;
    this.partner = null;
    this.myItems = Array(MAX_TRADE_SLOTS).fill(null);
    this.myGold = 0;
    this.myLocked = false;
    this.myConfirmed = false;
    this.partnerItems = Array(MAX_TRADE_SLOTS).fill(null);
    this.partnerGold = 0;
    this.partnerLocked = false;
    this.partnerConfirmed = false;
    if (this.overlay) {
      const gi = this.overlay.querySelector('#tradeMyGold');
      if (gi) { gi.value = ''; gi.readOnly = false; }
      const btn = this.overlay.querySelector('#tradeLockBtn');
      if (btn) btn.textContent = '🔒 Bloquear Oferta';
    }
  }

  // ─── Toast de convite de troca ───────────────────────────────
  _showRequestToast(fromName, fromId) {
    this._removeToast();

    const el = document.createElement('div');
    el.className = 'trade-request-toast';
    el.id = 'cinzasTradeToast';
    el.innerHTML = `
      <div class="trade-request-title">⚖️ Solicitação de Negociação</div>
      <div class="trade-request-sub"><b>${fromName}</b> quer negociar com você.</div>
      <div class="trade-request-btns">
        <button type="button" class="trade-toast-accept" id="tradeToastAccept">Aceitar</button>
        <button type="button" class="trade-toast-decline" id="tradeToastDecline">Recusar</button>
      </div>
    `;
    document.body.appendChild(el);
    this.toastNode = el;

    el.querySelector('#tradeToastAccept').addEventListener('click', () => {
      cinzasNet.sendTradeAccept(fromId);
      this._removeToast();
    });
    el.querySelector('#tradeToastDecline').addEventListener('click', () => {
      cinzasNet.sendTradeDecline(fromId);
      this._removeToast();
    });

    // Auto-remove após 25s
    this._toastTimer = setTimeout(() => {
      cinzasNet.sendTradeDecline(fromId);
      this._removeToast();
    }, 25000);
  }

  _removeToast() {
    clearTimeout(this._toastTimer);
    this.toastNode?.remove();
    this.toastNode = null;
  }

  // ─── Abre a janela de troca após aceite ──────────────────────
  _openWindow(partner) {
    this._buildOverlay();
    this.partner = partner;
    this.myId = cinzasNet.myId;

    const myName = cinzasNet.me?.name || 'Você';
    this.overlay.querySelector('#tradeMyName').textContent = myName;
    this.overlay.querySelector('#tradePartnerName').textContent = partner.name;
    this.overlay.querySelector('#tradePartnerNamePanel').textContent = partner.name;

    // Reseta slots visuais
    this._renderMySlots();
    this._renderPartnerSlots();
    this._refreshStatusBadges();

    this.overlay.classList.add('active');
    window.GameAudio?.playUIOpen?.();
  }

  // ─── Aplica trade_update do servidor ─────────────────────────
  _applyUpdate(m) {
    if (!this.overlay || !this.sessionId) return;
    const myId = cinzasNet.myId;
    const myData = m.p1?.id === myId ? m.p1 : m.p2;
    const partnerData = m.p1?.id === myId ? m.p2 : m.p1;

    // Mantém ouro local sincronizado (servidor é autoritativo)
    this.partnerGold = partnerData?.offer?.gold || 0;
    this.partnerItems = Array(MAX_TRADE_SLOTS).fill(null);
    (partnerData?.offer?.items || []).forEach((it, i) => { this.partnerItems[i] = it; });

    this.partnerLocked = !!partnerData?.locked;
    this.partnerConfirmed = !!partnerData?.confirmed;
    this.myLocked = !!myData?.locked;
    this.myConfirmed = !!myData?.confirmed;

    // Atualiza campo de ouro do parceiro
    const pgInp = this.overlay.querySelector('#tradePartnerGold');
    if (pgInp) pgInp.value = this.partnerGold;

    this._renderPartnerSlots();
    this._updateLockButton();
    this._refreshStatusBadges();
  }

  // ─── Executa a troca completa (apply no inventário) ──────────
  _applyComplete(m) {
    const received = m.received || { gold: 0, items: [] };
    const given = m.given || { gold: 0, items: [] };

    // Remove itens doados: busca pelos ids na ordem
    // Precisamos remover da lista de itens que foram ofertados
    for (const gItem of (given.items || [])) {
      const inv = window.GameItems?.inventory || [];
      const idx = inv.findIndex(i => i.id === gItem.id);
      if (idx >= 0) window.GameItems.removeItem(idx, gItem.count || 1);
    }
    // Desconta ouro
    if (given.gold > 0 && window._tdcPlayer) {
      window._tdcPlayer.gold = Math.max(0, (window._tdcPlayer.gold || 0) - given.gold);
    }

    // Adiciona itens recebidos
    for (const rItem of (received.items || [])) {
      window.GameItems?.addItem(rItem.id, rItem.count || 1, rItem.enhanceLevel || 0);
    }
    // Adiciona ouro recebido
    if (received.gold > 0 && window._tdcPlayer) {
      window._tdcPlayer.gold = (window._tdcPlayer.gold || 0) + received.gold;
    }

    window.GameItems?.saveInventory?.();

    // Mensagem de sucesso
    window.CinzasChat?.addMessage({
      from: 'SISTEMA',
      text: `⚖️ Troca com ${m.partnerName} concluída com sucesso! Recebidos: ${
        (received.items || []).map(i => i.name || i.id).join(', ') || 'nenhum item'
      }${received.gold > 0 ? ` + ${received.gold} ouro` : ''}.`,
      type: 'system',
      time: new Date()
    });

    this._closeWindow();
  }

  // ─── Wires nos callbacks do CinzasNet ────────────────────────
  _wireNetEvents() {
    cinzasNet.onTradeRequest = (m) => {
      this._showRequestToast(m.fromName, m.fromId);
    };

    cinzasNet.onTradeDeclined = (m) => {
      window.CinzasChat?.addMessage({
        from: 'SISTEMA',
        text: `${m.byName} recusou a negociação.`,
        type: 'system',
        time: new Date()
      });
    };

    cinzasNet.onTradeStart = (m) => {
      this._removeToast();
      this.sessionId = m.sessionId;
      this.myItems = Array(MAX_TRADE_SLOTS).fill(null);
      this.partnerItems = Array(MAX_TRADE_SLOTS).fill(null);
      this._openWindow(m.partner);
    };

    cinzasNet.onTradeUpdate = (m) => {
      this.sessionId = m.sessionId;
      this._applyUpdate(m);
    };

    cinzasNet.onTradeComplete = (m) => {
      this._applyComplete(m);
    };

    cinzasNet.onTradeCancelled = (m) => {
      window.CinzasChat?.addMessage({
        from: 'SISTEMA',
        text: `Negociação cancelada. ${m.reason || ''}`,
        type: 'system',
        time: new Date()
      });
      this._closeWindow();
      this._removeToast();
    };
  }
}

// Singleton global
export const tradeManager = new TradeManager();
if (typeof window !== 'undefined') {
  window.CinzasTradeManager = tradeManager;
}
