// src/systems/auth/AuthManager.js
// Sistema de Autenticação Supabase, OAuth, Web3 (SIWE) e Save Cloud com controle de revisão

import { createClient } from '@supabase/supabase-js';

const SAVE_KEY_FALLBACK = 'terra-das-cinzas-save-v1';

// Prioriza variáveis injetadas pelo esbuild no build time ou fallback de window/env
const supabaseUrl = process.env.SUPABASE_URL || (typeof window !== 'undefined' && window.GAME_AUTH_CONFIG?.supabaseUrl) || 'https://ajaxhsitwkcsoibjvxnr.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || (typeof window !== 'undefined' && window.GAME_AUTH_CONFIG?.supabaseAnonKey) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqYXhoc2l0d2tjc29pYmp2eG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5MDMzNjMsImV4cCI6MjEwNjQ3OTM2M30.iNoLmFRycMhceTwIUQB09lRg7tOCOKnqbK4joQnxZGI';

export class AuthManager {
  constructor() {
    this.hasConfig = !!(supabaseUrl && supabaseAnonKey);
    this.supabase = this.hasConfig ? createClient(supabaseUrl, supabaseAnonKey) : null;
    this.status = {
      signedIn: false,
      email: '',
      walletAddress: '',
      message: '',
      revision: 0,
      conflict: false
    };
    this.saveKey = SAVE_KEY_FALLBACK;
    this.queuedPayload = null;
    this.saveTimer = 0;
    this.sending = false;
    this.authInitialization = null;
    this.modal = null;
  }

  initUI() {
    if (typeof document === 'undefined' || this.modal) return;
    
    this.modal = document.createElement('section');
    this.modal.className = 'account-overlay';
    this.modal.hidden = true;
    this.modal.innerHTML = `
    <div class="account-card" role="dialog" aria-modal="true" aria-labelledby="accountTitle">
      <button class="account-close" type="button" aria-label="Fechar">×</button>
      <p class="menu-kicker">SUA JORNADA</p>
      <h2 id="accountTitle">Conta do jogador</h2>
      <p class="account-copy" id="accountStatus"></p>
      <div class="account-form" id="accountForm">
        <label>E-mail
          <input id="accountEmail" type="email" autocomplete="email" placeholder="seu@email.com" required>
        </label>
        <label>Senha
          <input id="accountPassword" type="password" autocomplete="current-password" minlength="6" placeholder="Mínimo 6 caracteres" required>
        </label>
        <div class="account-actions">
          <button class="menu-button menu-primary" id="accountSubmit" type="button">ENTRAR</button>
          <button class="menu-button" id="accountMode" type="button">CRIAR CONTA</button>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin:8px 0;opacity:0.4">
          <hr style="flex:1;border:0;border-top:1px solid currentColor">
          <span style="font-size:11px">OU</span>
          <hr style="flex:1;border:0;border-top:1px solid currentColor">
        </div>
        <button class="menu-button" id="accountGoogle" type="button">
          <span style="margin-right:6px"></span> CONTINUAR COM GOOGLE
        </button>
        <button class="menu-button" id="accountWallet" type="button">
          <span style="margin-right:6px"></span> CONECTAR CARTEIRA WEB3 (SIWE)
        </button>
      </div>
      <div class="account-actions" id="accountSigned" hidden>
        <button class="menu-button menu-primary" id="accountSync" type="button">SINCRONIZAR AGORA</button>
        <button class="menu-button" id="accountLoadCloud" type="button">CARREGAR SAVE DA NUVEM</button>
        <button class="menu-button" id="accountUploadLocal" type="button">ENVIAR SAVE LOCAL</button>
        <button class="menu-button" id="accountSignOut" type="button">SAIR DA CONTA</button>
      </div>
      <button class="menu-button account-back" id="accountBack" type="button">VOLTAR AO JOGO</button>
    </div>`;
    document.body.append(this.modal);

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    if (!this.modal) return;
    document.querySelector('#menuAccount')?.addEventListener('click', () => this.open());
    document.querySelector('#accountTop')?.addEventListener('click', () => this.open());
    this.modal.querySelector('.account-close')?.addEventListener('click', () => this.close());
    this.modal.querySelector('#accountBack')?.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.close(); });

    this.modal.querySelector('#accountSubmit')?.addEventListener('click', () => this.submitEmail());
    this.modal.querySelector('#accountMode')?.addEventListener('click', () => {
      const submit = this.modal.querySelector('#accountSubmit');
      const create = submit.dataset.mode !== 'create';
      submit.dataset.mode = create ? 'create' : 'login';
      submit.textContent = create ? 'CRIAR CONTA' : 'ENTRAR';
      this.modal.querySelector('#accountMode').textContent = create ? 'JÁ TENHO CONTA' : 'CRIAR CONTA';
    });

    this.modal.querySelector('#accountGoogle')?.addEventListener('click', () => this.googleLogin());
    this.modal.querySelector('#accountWallet')?.addEventListener('click', () => this.walletLogin());
    this.modal.querySelector('#accountSync')?.addEventListener('click', () => this.syncNow({ reloadOnCloudLoad: true }));
    
    this.modal.querySelector('#accountLoadCloud')?.addEventListener('click', async () => {
      try {
        const cloud = await this.fetchCloudSave();
        if (!cloud) throw new Error('Não há save na nuvem para carregar.');
        localStorage.setItem(this.saveKey, JSON.stringify(cloud.payload));
        this.status.conflict = false;
        this.status.message = 'Save da nuvem carregado. Reabrindo o jogo...';
        this.render();
        window.location.reload();
      } catch (err) { this.message(err); }
    });

    this.modal.querySelector('#accountUploadLocal')?.addEventListener('click', async () => {
      try {
        const raw = localStorage.getItem(this.saveKey);
        if (!raw) throw new Error('Não há save local para enviar.');
        await this.fetchCloudSave();
        await this.writeCloud(raw);
        this.render();
      } catch (err) { this.message(err); }
    });

    this.modal.querySelector('#accountSignOut')?.addEventListener('click', async () => {
      if (this.supabase) {
        try { await this.supabase.auth.signOut({ scope: 'local' }); } catch (_) {}
      }
      this.status.signedIn = false;
      this.status.email = '';
      this.status.walletAddress = '';
      this.status.message = 'Você saiu da conta. Seu progresso local permanece neste navegador.';
      this.render();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modal.hidden) this.close();
    });
  }

  label() {
    const button = document.querySelector('#menuAccount');
    const accountIdentifier = this.status.email || (this.status.walletAddress ? `${this.status.walletAddress.slice(0, 6)}...${this.status.walletAddress.slice(-4)}` : '');
    if (button) button.textContent = this.status.signedIn ? `CONTA · ${accountIdentifier}` : 'CONECTAR CONTA';
    const top = document.querySelector('#accountTop');
    if (top) {
      top.classList.toggle('connected', this.status.signedIn);
      top.querySelector('span').textContent = this.status.signedIn ? 'SALVO' : 'CONTA';
      top.title = this.status.signedIn ? `Conectado como ${accountIdentifier} · progresso na nuvem` : 'Conectar conta e salvar na nuvem';
    }
  }

  render() {
    if (!this.modal) return;
    const copy = this.modal.querySelector('#accountStatus');
    const accountIdentifier = this.status.email || (this.status.walletAddress ? `Carteira ${this.status.walletAddress.slice(0, 6)}...${this.status.walletAddress.slice(-4)}` : '');

    if (this.status.signedIn) {
      copy.textContent = this.status.message || `Conectado como ${accountIdentifier}. Seu progresso é salvo na nuvem e neste navegador.`;
    } else if (!this.hasConfig) {
      copy.innerHTML = this.status.message || `Supabase não configurado. Verifique as credenciais de autenticação.`;
    } else {
      copy.textContent = this.status.message || 'Entre com e-mail, Google ou carteira Web3 para salvar seu progresso na nuvem.';
    }

    this.modal.querySelector('#accountForm').hidden = this.status.signedIn;
    this.modal.querySelector('#accountSigned').hidden = !this.status.signedIn;
    this.modal.querySelector('#accountLoadCloud').hidden = !this.status.conflict;
    this.modal.querySelector('#accountUploadLocal').hidden = !this.status.conflict;

    this.modal.querySelector('#accountSubmit').disabled = !this.hasConfig;
    this.modal.querySelector('#accountMode').disabled = !this.hasConfig;
    this.modal.querySelector('#accountGoogle').disabled = !this.hasConfig;
    this.modal.querySelector('#accountWallet').disabled = !this.hasConfig;

    this.label();
  }

  message(error) {
    const text = error?.message || error?.error_description || String(error);
    this.status.message = text;
    this.render();
  }

  open() {
    this.initUI();
    if (this.modal) this.modal.hidden = false;
    this.render();
  }

  close() {
    if (this.modal) this.modal.hidden = true;
  }

  async fetchCloudSave() {
    if (!this.supabase) return null;
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) return null;
    const { data, error } = await this.supabase.from('player_saves')
      .select('payload, revision, updated_at').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    this.status.revision = data?.revision ?? 0;
    return data;
  }

  async writeCloud(payload) {
    if (!this.supabase) return;
    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const { data, error } = await this.supabase.rpc('save_player_save', {
      p_payload: parsed,
      p_expected_revision: this.status.revision || 0
    });
    if (error) throw error;
    if (!Array.isArray(data) || data.length !== 1) {
      this.status.conflict = true;
      throw new Error('O save foi alterado em outro dispositivo. Escolha qual versão deseja manter.');
    }
    this.status.revision = data[0].revision;
    this.status.conflict = false;
    this.status.message = 'Progresso sincronizado com sucesso na nuvem!';
  }

  async syncNow({ reloadOnCloudLoad = false } = {}) {
    this.status.message = 'Sincronizando com a nuvem...';
    this.render();
    try {
      let isAutoStart = false;
      try {
        isAutoStart = !!sessionStorage.getItem('terra-das-cinzas-auto-start');
      } catch (_) {}
      if (isAutoStart) {
        this.status.message = 'Iniciando nova jornada...';
        this.render();
        return;
      }

      const cloud = await this.fetchCloudSave();
      const localStr = localStorage.getItem(this.saveKey);
      const local = localStr ? JSON.parse(localStr) : null;

      if (!cloud && local) {
        await this.writeCloud(local);
        this.status.message = 'Save local enviado para a nuvem.';
      } else if (cloud && !local) {
        localStorage.setItem(this.saveKey, JSON.stringify(cloud.payload));
        this.status.message = 'Save recuperado da nuvem.';
      } else if (cloud && local) {
        const cloudTime = new Date(cloud.updated_at || 0).getTime();
        const localTime = Number(local.savedAt || 0);

        if (cloudTime > localTime) {
          localStorage.setItem(this.saveKey, JSON.stringify(cloud.payload));
          this.status.message = 'Save mais recente baixado da nuvem.';
          if (reloadOnCloudLoad) window.location.reload();
        } else {
          await this.writeCloud(local);
          this.status.message = 'Save local sincronizado na nuvem.';
        }
      }
    } catch (err) {
      this.message(err);
    }
    this.render();
  }

  queueSave(payload) {
    this.queuedPayload = payload;
    if (!this.status.signedIn || !this.supabase) return;
    if (!this.saveTimer) this.saveTimer = window.setTimeout(() => this.flushSave(), 4000);
  }

  async flushSave() {
    if (this.saveTimer) { clearTimeout(this.saveTimer); this.saveTimer = 0; }
    if (!this.queuedPayload || this.sending || !this.status.signedIn || !this.supabase) return;
    this.sending = true;
    const payload = this.queuedPayload;
    this.queuedPayload = null;
    try {
      await this.writeCloud(payload);
    } catch (err) {
      console.warn('Falha no salvamento automático na nuvem:', err);
      this.status.message = err?.message || 'Falha ao salvar na nuvem. O save local foi mantido.';
      if (!this.status.conflict && !this.queuedPayload) this.queuedPayload = payload;
      this.render();
    } finally {
      this.sending = false;
      if (this.queuedPayload && !this.saveTimer) this.saveTimer = window.setTimeout(() => this.flushSave(), 4000);
    }
  }

  async submitEmail() {
    if (!this.supabase) return;
    const email = this.modal.querySelector('#accountEmail').value.trim();
    const password = this.modal.querySelector('#accountPassword').value;
    if (!email || password.length < 6) {
      return this.message(new Error('Digite um e-mail válido e senha de no mínimo 6 caracteres.'));
    }

    const isCreate = this.modal.querySelector('#accountSubmit').dataset.mode === 'create';
    this.status.message = isCreate ? 'Criando conta...' : 'Entrando...';
    this.render();

    try {
      if (isCreate) {
        const { data, error } = await this.supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && !data.session) {
          this.status.message = 'Conta criada! Verifique seu e-mail para confirmar seu cadastro.';
        } else {
          this.status.signedIn = true;
          this.status.email = data.user?.email || email;
          this.status.message = 'Conta criada e conectada!';
          await this.syncNow({ reloadOnCloudLoad: true });
        }
      } else {
        const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        this.status.signedIn = true;
        this.status.email = data.user?.email || email;
        this.status.message = 'Login realizado com sucesso!';
        await this.syncNow({ reloadOnCloudLoad: true });
      }
    } catch (err) {
      this.message(err);
    }
    this.render();
  }

  async googleLogin() {
    if (!this.supabase) return;
    try {
      this.status.message = 'Redirecionando para o login do Google...';
      this.render();
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname
        }
      });
      if (error) throw error;
    } catch (err) {
      this.message(err);
    }
  }

  async walletLogin() {
    if (!this.supabase) return this.message(new Error('Login por carteira indisponível até configurar Supabase.'));
    try {
      this.status.message = 'Solicitando autenticação segura à carteira...';
      this.render();
      const { data, error } = await this.supabase.auth.signInWithWeb3({
        chain: 'ethereum',
        statement: 'Entrar em Terra das Cinzas. Esta assinatura não autoriza transações.'
      });
      if (error) throw error;
      this.status.signedIn = true;
      this.status.walletAddress = data.user?.user_metadata?.wallet_address || '';
      this.status.email = data.user?.email || '';
      this.status.message = 'Carteira autenticada com segurança.';
      await this.syncNow({ reloadOnCloudLoad: true });
    } catch (err) {
      this.message(err);
    }
    this.render();
  }

  applySession(session) {
    this.status.signedIn = !!session?.user;
    this.status.email = session?.user?.email || '';
    this.status.walletAddress = session?.user?.user_metadata?.wallet_address
      || session?.user?.identities?.find((identity) => identity.provider === 'web3')?.identity_data?.address
      || '';
    if (!this.status.signedIn) this.status.revision = 0;
  }

  init() {
    if (this.authInitialization) return this.authInitialization;
    this.authInitialization = (async () => {
      if (this.supabase) {
        try {
          const { data: { session }, error } = await this.supabase.auth.getSession();
          if (error) throw error;
          this.applySession(session);
          this.supabase.auth.onAuthStateChange((_event, nextSession) => {
            this.applySession(nextSession);
            this.render();
          });
        } catch (err) {
          console.warn('Erro ao inicializar Supabase:', err);
        }
      }
      this.render();
    })();
    return this.authInitialization;
  }

  async bootstrap(key) {
    this.saveKey = key || SAVE_KEY_FALLBACK;
    this.initUI();
    await this.init();
    if (this.status.signedIn) await this.syncNow();
  }
}

export const authManager = new AuthManager();

// Compatibilidade com window.GameAuth
if (typeof window !== 'undefined') {
  window.GameAuth = {
    bootstrap: (k) => authManager.bootstrap(k),
    queueSave: (p) => authManager.queueSave(p),
    flushSave: () => authManager.flushSave(),
    getAccessToken: async () => {
      if (!authManager.supabase) return null;
      const { data, error } = await authManager.supabase.auth.getSession();
      if (error) return null;
      return data.session?.access_token || null;
    },
    open: () => authManager.open()
  };
}
