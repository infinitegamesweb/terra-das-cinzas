// src/systems/multiplayer/ChatUI.js
// ═══════════════════════════════════════════════════════════════
//  GUERRA DAS CINZAS — Interface de Chat Flutuante & Tecla [Enter]
//  Histórico de mensagens, atalho [Enter], balões locais e sincronização
// ═══════════════════════════════════════════════════════════════

import { cinzasNet } from './CinzasNet.js';

export class ChatUI {
  constructor() {
    this.container = null;
    this.messagesList = null;
    this.form = null;
    this.input = null;
    this.isOpen = false;
    this.localBubble = null; // { text, expiresAt }
    this.lastWhisperSender = null;
  }

  init() {
    if (this.container) return;
    this.injectStyles();
    this.createDOM();
    this.bindEvents();

    // Conecta recebimento de chat do CinzasNet
    cinzasNet.onChat = (msg) => {
      this.addMessage({
        from: msg.from || 'Errante',
        text: msg.text || '',
        type: 'remote',
        time: new Date()
      });
    };

    // Conecta sussurros privados
    cinzasNet.onWhisper = (msg) => {
      if (msg.incoming) {
        this.lastWhisperSender = msg.from;
        this.addMessage({
          from: `[Sussurro de ${msg.from}]`,
          text: msg.text,
          type: 'whisper-in',
          time: new Date()
        });
      } else {
        this.addMessage({
          from: `[Sussurro para ${msg.to}]`,
          text: msg.text,
          type: 'whisper-out',
          time: new Date()
        });
      }
    };

    // Mensagens de sistema
    cinzasNet.onJoined = (data) => {
      this.addMessage({
        from: 'SISTEMA',
        text: `Você entrou no canal ${data.channel}. Digite /help para ver os comandos.`,
        type: 'system',
        time: new Date()
      });
    };
  }

  injectStyles() {
    if (document.getElementById('cinzas-chat-styles')) return;
    const style = document.createElement('style');
    style.id = 'cinzas-chat-styles';
    style.textContent = `
      .cinzas-chat {
        position: absolute;
        bottom: 74px;
        left: 20px;
        width: 320px;
        max-width: calc(100vw - 40px);
        z-index: 45;
        font-family: 'Outfit', sans-serif;
        pointer-events: none;
        user-select: none;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .cinzas-chat.active,
      .cinzas-chat:hover {
        pointer-events: auto;
      }
      .cinzas-chat-messages {
        max-height: 140px;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 6px 8px;
        border-radius: 6px;
        background: linear-gradient(180deg, rgba(8, 10, 16, 0.45) 0%, rgba(13, 17, 24, 0.75) 100%);
        backdrop-filter: blur(4px);
        border: 1px solid rgba(245, 158, 11, 0.15);
        scrollbar-width: thin;
        scrollbar-color: rgba(245, 158, 11, 0.4) transparent;
        transition: opacity 0.3s ease, background 0.3s ease;
      }
      .cinzas-chat:not(.active):not(:hover) .cinzas-chat-messages {
        background: rgba(8, 10, 16, 0.28);
        border-color: rgba(245, 158, 11, 0.08);
      }
      .cinzas-chat-msg {
        font-size: 11px;
        line-height: 1.35;
        color: #e2e8f0;
        word-break: break-word;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
      }
      .cinzas-chat-msg.system {
        color: #facc15;
        font-style: italic;
        font-size: 10.5px;
      }
      .cinzas-chat-msg .chat-author {
        font-weight: 700;
        color: #38bdf8;
        margin-right: 4px;
      }
      .cinzas-chat-msg.local .chat-author {
        color: #4ade80;
      }
      .cinzas-chat-msg.system .chat-author {
        color: #eab308;
      }
      .cinzas-chat-msg.whisper-in {
        color: #f472b6;
        font-style: italic;
      }
      .cinzas-chat-msg.whisper-in .chat-author {
        color: #ec4899;
        font-weight: 700;
      }
      .cinzas-chat-msg.whisper-out {
        color: #d8b4fe;
        font-style: italic;
      }
      .cinzas-chat-msg.whisper-out .chat-author {
        color: #c084fc;
        font-weight: 700;
      }
      .cinzas-chat-form {
        display: flex;
        align-items: center;
        gap: 4px;
        opacity: 0.65;
        transition: opacity 0.2s ease;
      }
      .cinzas-chat.active .cinzas-chat-form,
      .cinzas-chat-form:focus-within {
        opacity: 1;
        pointer-events: auto;
      }
      .cinzas-chat-input {
        flex: 1;
        background: rgba(13, 17, 24, 0.92);
        border: 1px solid rgba(245, 158, 11, 0.35);
        border-radius: 4px;
        color: #f8fafc;
        font-family: inherit;
        font-size: 11.5px;
        padding: 5px 8px;
        outline: none;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        transition: border-color 0.2s, background 0.2s;
        pointer-events: auto;
      }
      .cinzas-chat-input:focus {
        border-color: #f59e0b;
        background: rgba(18, 23, 34, 0.96);
        box-shadow: 0 0 8px rgba(245, 158, 11, 0.25);
      }
      .cinzas-chat-input::placeholder {
        color: rgba(148, 163, 184, 0.65);
        font-size: 10.5px;
      }
      .cinzas-chat-send {
        background: linear-gradient(180deg, #d97706 0%, #b45309 100%);
        border: 1px solid #f59e0b;
        border-radius: 4px;
        color: #fff;
        font-weight: 700;
        font-size: 11px;
        padding: 4px 9px;
        cursor: pointer;
        outline: none;
        pointer-events: auto;
      }
      .cinzas-chat-send:hover {
        filter: brightness(1.15);
      }
    `;
    document.head.appendChild(style);
  }

  createDOM() {
    const chat = document.createElement('div');
    chat.className = 'cinzas-chat';
    chat.id = 'cinzasChat';
    chat.innerHTML = `
      <div class="cinzas-chat-messages" id="cinzasChatMessages">
        <div class="cinzas-chat-msg system">
          <span class="chat-author">[Guerra das Cinzas]</span> Pressione [Enter] para conversar no canal.
        </div>
      </div>
      <form class="cinzas-chat-form" id="cinzasChatForm" autocomplete="off">
        <input type="text" class="cinzas-chat-input" id="cinzasChatInput" placeholder="[Enter] para conversar no canal..." maxlength="120" />
        <button type="submit" class="cinzas-chat-send" title="Enviar mensagem">↵</button>
      </form>
    `;
    const app = document.querySelector('#app') || document.body;
    app.appendChild(chat);

    this.container = chat;
    this.messagesList = chat.querySelector('#cinzasChatMessages');
    this.form = chat.querySelector('#cinzasChatForm');
    this.input = chat.querySelector('#cinzasChatInput');
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendCurrentInput();
    });

    this.input.addEventListener('focus', () => {
      this.isOpen = true;
      this.container.classList.add('active');
    });

    this.input.addEventListener('blur', () => {
      this.isOpen = false;
      this.container.classList.remove('active');
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.input.value = '';
        this.input.blur();
        e.stopPropagation();
      } else if (e.key === 'Enter') {
        if (!this.input.value.trim()) {
          this.input.blur();
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });

    // Tecla Enter global para abrir/focar chat
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const active = document.activeElement;
        if (active === this.input) {
          // Já focado, o submit listener cuida do envio
          return;
        }
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
        this.focusChat();
        e.preventDefault();
      }
    });
  }

  focusChat() {
    if (!this.input) return;
    this.input.focus();
    this.input.select();
  }

  sendCurrentInput() {
    const text = (this.input?.value || '').trim();
    if (!text) {
      this.input?.blur();
      return;
    }

    if (this.input) {
      this.input.value = '';
      this.input.blur();
    }

    // 1. Comando de Ajuda (/help ou /ajuda)
    if (text === '/help' || text === '/ajuda' || text === '/?') {
      this.addMessage({
        from: 'COMANDOS',
        text: '/w [nome] [msg] (sussurro) · /r [msg] (responder) · /roll (rolar 1–100) · [Tab] lista de jogadores',
        type: 'system',
        time: new Date()
      });
      return;
    }

    // 2. Comando de Rolagem de Dados (/roll ou /dado)
    if (text === '/roll' || text === '/dado' || text.startsWith('/roll ') || text.startsWith('/dado ')) {
      const roll = Math.floor(Math.random() * 100) + 1;
      const rollMsg = `🎲 rolou ${roll} (1–100)`;
      if (cinzasNet?.isConnected) {
        cinzasNet.sendChat(rollMsg);
      }
      this.addMessage({
        from: 'Você',
        text: rollMsg,
        type: 'local',
        time: new Date()
      });
      this.localBubble = { text: rollMsg, expiresAt: performance.now() + 5000 };
      return;
    }

    // 3. Comando de Sussurro (/w [nome] [mensagem])
    if (text.startsWith('/w ') || text.startsWith('/whisper ')) {
      const parts = text.split(' ');
      const targetName = parts[1];
      const whisperText = parts.slice(2).join(' ').trim();
      if (!targetName || !whisperText) {
        this.addMessage({
          from: 'SISTEMA',
          text: 'Uso incorreto. Exemplo: /w NomeDoJogador Olá companheiro!',
          type: 'system',
          time: new Date()
        });
        return;
      }
      if (cinzasNet?.isConnected) {
        cinzasNet.sendWhisper(targetName, whisperText);
      } else {
        this.addMessage({ from: 'SISTEMA', text: 'Você precisa estar conectado a um canal para sussurrar.', type: 'system' });
      }
      return;
    }

    // 4. Comando de Resposta Rápida (/r [mensagem])
    if (text.startsWith('/r ') || text.startsWith('/reply ')) {
      if (!this.lastWhisperSender) {
        this.addMessage({
          from: 'SISTEMA',
          text: 'Nenhum jogador sussurrou para você recentemente.',
          type: 'system',
          time: new Date()
        });
        return;
      }
      const whisperText = text.replace(/^\/(r|reply)\s+/, '').trim();
      if (!whisperText) {
        this.addMessage({
          from: 'SISTEMA',
          text: `Uso: /r [mensagem] (responder a ${this.lastWhisperSender})`,
          type: 'system',
          time: new Date()
        });
        return;
      }
      if (cinzasNet?.isConnected) {
        cinzasNet.sendWhisper(this.lastWhisperSender, whisperText);
      }
      return;
    }

    // 5. Mensagem Normal de Chat
    if (cinzasNet?.isConnected) {
      cinzasNet.sendChat(text);
    }

    this.addMessage({
      from: 'Você',
      text: text,
      type: 'local',
      time: new Date()
    });

    this.localBubble = {
      text,
      expiresAt: performance.now() + 5000
    };
  }

  addMessage({ from, text, type = 'remote', time = new Date() }) {
    if (!this.messagesList) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `cinzas-chat-msg ${type}`;

    const authorSpan = document.createElement('span');
    authorSpan.className = 'chat-author';
    authorSpan.textContent = from + ':';

    const textNode = document.createTextNode(' ' + text);
    msgDiv.appendChild(authorSpan);
    msgDiv.appendChild(textNode);

    this.messagesList.appendChild(msgDiv);

    // Limita o histórico a 50 mensagens
    while (this.messagesList.children.length > 50) {
      this.messagesList.firstElementChild.remove();
    }

    this.messagesList.scrollTop = this.messagesList.scrollHeight;
  }

  getLocalBubble() {
    if (this.localBubble && performance.now() < this.localBubble.expiresAt) {
      return this.localBubble.text;
    }
    return null;
  }
}

export const chatUI = new ChatUI();
if (typeof window !== 'undefined') {
  window.CinzasChat = chatUI;
}
