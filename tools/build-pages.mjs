import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');
const isProd = process.argv.includes('--prod') || process.env.NODE_ENV === 'production';

const DIST_DIR = path.join(projectRoot, 'dist');
const PUBLIC_DIR = path.join(projectRoot, 'public');

/**
 * Lê o arquivo .env se existir para carregar chaves locais em ambiente dev
 */
function loadEnv() {
  const envPath = path.join(projectRoot, '.env');
  const envVars = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        envVars[k] = v;
      }
    }
  }
  return envVars;
}

const localEnv = loadEnv();

// Credenciais públicas padrão do Supabase para o front-end (apenas chave anon pública)
const SUPABASE_URL = process.env.SUPABASE_URL || localEnv.SUPABASE_URL || 'https://ajaxhsitwkcsoibjvxnr.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || localEnv.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqYXhoc2l0d2tjc29pYmp2eG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5MDMzNjMsImV4cCI6MjEwNjQ3OTM2M30.iNoLmFRycMhceTwIUQB09lRg7tOCOKnqbK4joQnxZGI';

function syncPublicToDist() {
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }
  if (fs.existsSync(PUBLIC_DIR)) {
    fs.cpSync(PUBLIC_DIR, DIST_DIR, { recursive: true, force: true });
  }
}

/** @type {esbuild.BuildOptions} */
const buildOptions = {
  entryPoints: [path.join(projectRoot, 'src/game.js')],
  outfile: path.join(DIST_DIR, 'game.bundle.js'),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2022', 'chrome110', 'firefox115', 'safari16'],
  sourcemap: !isProd,
  minify: isProd,
  treeShaking: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
    'process.env.SUPABASE_URL': JSON.stringify(SUPABASE_URL),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_ANON_KEY)
  },
  loader: {
    '.png': 'file',
    '.json': 'json',
    '.svg': 'file'
  },
  logLevel: 'info'
};

async function main() {
  console.log(`🔨 [Build] Preparando build (${isProd ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'})...`);
  syncPublicToDist();

  if (isWatch) {
    console.log('⚡ [esbuild] Modo Watch ativado para desenvolvimento...');
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();

    // Servidor de preview integrado
    const port = 4173;
    const { hosts } = await ctx.serve({
      servedir: DIST_DIR,
      port
    });

    console.log(`🎮 [Terra das Cinzas] Rodando em http://localhost:${port}`);
  } else {
    const start = Date.now();
    await esbuild.build(buildOptions);
    console.log(`✅ [Build] Concluído em ${Date.now() - start}ms. Pronto para deploy no Cloudflare Pages!`);
  }
}

main().catch((err) => {
  console.error('❌ [Build Error]:', err);
  process.exit(1);
});
