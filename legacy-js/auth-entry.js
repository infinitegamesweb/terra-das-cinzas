import { createClient } from '@supabase/supabase-js';

const SAVE_KEY_FALLBACK = 'terra-das-cinzas-save-v1';
const config = window.GAME_AUTH_CONFIG || {};

const hasConfig = !!(config.supabaseUrl && config.supabaseAnonKey);
const supabase = hasConfig ? createClient(config.supabaseUrl, config.supabaseAnonKey) : null;

const status = {
  signedIn: false,
  email: '',
  walletAddress: '',
  message: '',
  revision: 0,
  conflict: false
};

let saveKey = SAVE_KEY_FALLBACK;
let queuedPayload = null;
let saveTimer = 0;
let sending = false;
let authInitialization;

// ─── Modal DOM ──────────────────────────────────────────────────
const modal = document.createElement('section');
modal.className = 'account-overlay';
modal.hidden = true;
modal.innerHTML = `
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
      <span style="margin-right:6px">🌐</span> CONTINUAR COM GOOGLE
    </button>
    <button class="menu-button" id="accountWallet" type="button">
      <span style="margin-right:6px">🦊</span> CONECTAR CARTEIRA WEB3 (SIWE)
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
document.body.append(modal);

function label() {
  const button = document.querySelector('#menuAccount');
  const accountIdentifier = status.email || (status.walletAddress ? `${status.walletAddress.slice(0, 6)}...${status.walletAddress.slice(-4)}` : '');
  if (button) button.textContent = status.signedIn ? `CONTA · ${accountIdentifier}` : 'CONECTAR CONTA';
  const top = document.querySelector('#accountTop');
  if (top) {
    top.classList.toggle('connected', status.signedIn);
    top.querySelector('span').textContent = status.signedIn ? 'SALVO' : 'CONTA';
    top.title = status.signedIn ? `Conectado como ${accountIdentifier} · progresso na nuvem` : 'Conectar conta e salvar na nuvem';
  }
}

function render() {
  const copy = document.querySelector('#accountStatus');
  const accountIdentifier = status.email || (status.walletAddress ? `Carteira ${status.walletAddress.slice(0, 6)}...${status.walletAddress.slice(-4)}` : '');

  if (status.signedIn) {
    copy.textContent = status.message || `Conectado como ${accountIdentifier}. Seu progresso é salvo na nuvem e neste navegador.`;
  } else if (!hasConfig) {
    copy.innerHTML = status.message || `Para ativar o login por e-mail, Google e carteira, configure o projeto Supabase em <code>js/cloud-config.js</code>.`;
  } else {
    copy.textContent = status.message || 'Entre com e-mail, Google ou carteira Web3 para salvar seu progresso na nuvem.';
  }

  document.querySelector('#accountForm').hidden = status.signedIn;
  document.querySelector('#accountSigned').hidden = !status.signedIn;
  document.querySelector('#accountLoadCloud').hidden = !status.conflict;
  document.querySelector('#accountUploadLocal').hidden = !status.conflict;

  // Todas as formas de login precisam de uma sessão Supabase verificada.
  document.getElementById('accountSubmit').disabled = !hasConfig;
  document.getElementById('accountMode').disabled = !hasConfig;
  document.getElementById('accountGoogle').disabled = !hasConfig;
  document.getElementById('accountWallet').disabled = !hasConfig;

  label();
}

function message(error) {
  const text = error?.message || error?.error_description || String(error);
  status.message = text;
  render();
}

// ─── Save Cloud Operations ──────────────────────────────────────
async function fetchCloudSave() {
  if (!supabase) return null;
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) return null;
  const { data, error } = await supabase.from('player_saves')
    .select('payload, revision, updated_at').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  status.revision = data?.revision ?? 0;
  return data;
}

async function writeCloud(payload) {
  if (!supabase) return;
  const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
  const { data, error } = await supabase.rpc('save_player_save', {
    p_payload: parsed,
    p_expected_revision: status.revision || 0
  });
  if (error) throw error;
  if (!Array.isArray(data) || data.length !== 1) {
    status.conflict = true;
    throw new Error('O save foi alterado em outro dispositivo. Escolha qual versão deseja manter.');
  }
  status.revision = data[0].revision;
  status.conflict = false;
  status.message = 'Progresso sincronizado com sucesso na nuvem!';
}

async function syncNow({ reloadOnCloudLoad = false } = {}) {
  status.message = 'Sincronizando com a nuvem...';
  render();
  try {
    let isAutoStart = false;
    try {
      isAutoStart = !!sessionStorage.getItem('terra-das-cinzas-auto-start');
    } catch (_) {}
    if (isAutoStart) {
      status.message = 'Iniciando nova jornada...';
      render();
      return;
    }

    const cloud = await fetchCloudSave();
    const localStr = localStorage.getItem(saveKey);
    const local = localStr ? JSON.parse(localStr) : null;

    if (!cloud && local) {
      await writeCloud(local);
      status.message = 'Save local enviado para a nuvem.';
    } else if (cloud && !local) {
      localStorage.setItem(saveKey, JSON.stringify(cloud.payload));
      status.message = 'Save recuperado da nuvem.';
    } else if (cloud && local) {
      const cloudTime = new Date(cloud.updated_at || 0).getTime();
      const localTime = Number(local.savedAt || 0);

      if (cloudTime > localTime) {
        localStorage.setItem(saveKey, JSON.stringify(cloud.payload));
        status.message = 'Save mais recente baixado da nuvem.';
        if (reloadOnCloudLoad) window.location.reload();
      } else {
        await writeCloud(local);
        status.message = 'Save local sincronizado na nuvem.';
      }
    }
  } catch (err) {
    message(err);
  }
  render();
}

function queueSave(payload) {
  queuedPayload = payload;
  if (!status.signedIn || !supabase) return;
  if (!saveTimer) saveTimer = window.setTimeout(flushSave, 4000);
}

async function flushSave() {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = 0; }
  if (!queuedPayload || sending || !status.signedIn || !supabase) return;
  sending = true;
  const payload = queuedPayload;
  queuedPayload = null;
  try {
    await writeCloud(payload);
  } catch (err) {
    console.warn('Falha no salvamento automático na nuvem:', err);
    status.message = err?.message || 'Falha ao salvar na nuvem. O save local foi mantido.';
    if (!status.conflict && !queuedPayload) queuedPayload = payload;
    render();
  } finally {
    sending = false;
    if (queuedPayload && !saveTimer) saveTimer = window.setTimeout(flushSave, 4000);
  }
}

// ─── Auth Handlers ──────────────────────────────────────────────
async function submitEmail() {
  if (!supabase) return;
  const email = document.querySelector('#accountEmail').value.trim();
  const password = document.querySelector('#accountPassword').value;
  if (!email || password.length < 6) {
    return message(new Error('Digite um e-mail válido e senha de no mínimo 6 caracteres.'));
  }

  const isCreate = document.querySelector('#accountSubmit').dataset.mode === 'create';
  status.message = isCreate ? 'Criando conta...' : 'Entrando...';
  render();

  try {
    if (isCreate) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user && !data.session) {
        status.message = 'Conta criada! Verifique seu e-mail para confirmar seu cadastro.';
      } else {
        status.signedIn = true;
        status.email = data.user?.email || email;
        status.message = 'Conta criada e conectada!';
        await syncNow({ reloadOnCloudLoad: true });
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      status.signedIn = true;
      status.email = data.user?.email || email;
      status.message = 'Login realizado com sucesso!';
      await syncNow({ reloadOnCloudLoad: true });
    }
  } catch (err) {
    message(err);
  }
  render();
}

async function googleLogin() {
  if (!supabase) return;
  try {
    status.message = 'Redirecionando para o login do Google...';
    render();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    });
    if (error) throw error;
  } catch (err) {
    message(err);
  }
}

async function walletLogin() {
  if (!supabase) return message(new Error('Login por carteira indisponível até configurar Supabase.'));

  try {
    status.message = 'Solicitando autenticação segura à carteira...';
    render();
    const { data, error } = await supabase.auth.signInWithWeb3({
      chain: 'ethereum',
      statement: 'Entrar em Terra das Cinzas. Esta assinatura não autoriza transações.'
    });
    if (error) throw error;
    status.signedIn = true;
    status.walletAddress = data.user?.user_metadata?.wallet_address || '';
    status.email = data.user?.email || '';
    status.message = 'Carteira autenticada com segurança.';
    await syncNow({ reloadOnCloudLoad: true });
  } catch (err) {
    message(err);
  }
  render();
}

// ─── Modal Open/Close & Bindings ────────────────────────────────
function open() { modal.hidden = false; render(); }
function close() { modal.hidden = true; }

document.querySelector('#menuAccount')?.addEventListener('click', open);
document.querySelector('#accountTop')?.addEventListener('click', open);
modal.querySelector('.account-close').addEventListener('click', close);
modal.querySelector('#accountBack').addEventListener('click', close);
modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

modal.querySelector('#accountSubmit').addEventListener('click', submitEmail);
modal.querySelector('#accountMode').addEventListener('click', () => {
  const submit = document.querySelector('#accountSubmit');
  const create = submit.dataset.mode !== 'create';
  submit.dataset.mode = create ? 'create' : 'login';
  submit.textContent = create ? 'CRIAR CONTA' : 'ENTRAR';
  document.querySelector('#accountMode').textContent = create ? 'JÁ TENHO CONTA' : 'CRIAR CONTA';
});

modal.querySelector('#accountGoogle').addEventListener('click', googleLogin);
modal.querySelector('#accountWallet').addEventListener('click', walletLogin);
modal.querySelector('#accountSync').addEventListener('click', () => syncNow({ reloadOnCloudLoad: true }));
modal.querySelector('#accountLoadCloud').addEventListener('click', async () => {
  try {
    const cloud = await fetchCloudSave();
    if (!cloud) throw new Error('Não há save na nuvem para carregar.');
    localStorage.setItem(saveKey, JSON.stringify(cloud.payload));
    status.conflict = false;
    status.message = 'Save da nuvem carregado. Reabrindo o jogo...';
    render();
    window.location.reload();
  } catch (err) { message(err); }
});
modal.querySelector('#accountUploadLocal').addEventListener('click', async () => {
  try {
    const raw = localStorage.getItem(saveKey);
    if (!raw) throw new Error('Não há save local para enviar.');
    await fetchCloudSave();
    await writeCloud(raw);
    render();
  } catch (err) { message(err); }
});

modal.querySelector('#accountSignOut').addEventListener('click', async () => {
  if (supabase) {
    try { await supabase.auth.signOut({ scope: 'local' }); } catch (_) {}
  }
  status.signedIn = false;
  status.email = '';
  status.walletAddress = '';
  status.message = 'Você saiu da conta. Seu progresso local permanece neste navegador.';
  render();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) close();
});

// ─── Initialization ──────────────────────────────────────────────
function applySession(session) {
  status.signedIn = !!session?.user;
  status.email = session?.user?.email || '';
  status.walletAddress = session?.user?.user_metadata?.wallet_address
    || session?.user?.identities?.find((identity) => identity.provider === 'web3')?.identity_data?.address
    || '';
  if (!status.signedIn) status.revision = 0;
}

function initAuth() {
  if (authInitialization) return authInitialization;
  authInitialization = (async () => {
    if (supabase) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        applySession(session);
        supabase.auth.onAuthStateChange((_event, nextSession) => {
          applySession(nextSession);
          render();
        });
      } catch (err) {
        console.warn('Erro ao inicializar Supabase:', err);
      }
    }
    render();
  })();
  return authInitialization;
}

window.GameAuth = {
  async bootstrap(key) {
    saveKey = key || SAVE_KEY_FALLBACK;
    await initAuth();
    if (status.signedIn) await syncNow();
  },
  queueSave,
  flushSave,
  open
};

initAuth();
