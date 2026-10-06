# Auditoria de Segurança — Terra das Cinzas

**Data da Auditoria**: 2026-10-06  
**Escopo**: `.env`, `.gitignore`, Histórico Git, `package.json`, scripts de build, Cloudflare Pages & Workers (Durable Objects), Supabase Auth, APIs, source maps e dependências.

---

## # Resumo

A auditoria de segurança analisou toda a base de código, dependências, rotinas de empacotamento e histórico do Git do projeto **Terra das Cinzas**.

* **Segredos e chaves privadas**: Nenhuma chave privada (RSA/EC), `service_role key` ou credencial de banco de produção administrativa está versionada no repositório.
* **Histórico Git**: O arquivo `.env`, arquivos `.dev.vars` e credenciais locais sensíveis nunca foram comitados no histórico do Git.
* **Build e Produção**: O script `tools/build-pages.mjs` desativa source maps e ativa minificação estrita em modo de produção (`--prod` / `NODE_ENV=production`).
* **Supabase**: A chave anon utilizada no front-end é uma chave pública do Supabase com permissões limitadas pelo Row Level Security (RLS). No entanto, sua presença como fallback fixo em código-fonte requer atenção para arquitetura de build.

---

## # Critical

**Nenhum problema crítico detectado.**
* Nenhuma chave mestra administrativa (`service_role`), token de acesso com privilégios de escrita irrestrita ou credencial de banco de dados direta foi encontrada exposta ou commitada.

---

## # High

### 1. Injeção de Variáveis em Build Time vs. Fallback Hardcoded
* **Localização**: `src/systems/auth/AuthManager.js` (linha 10) e `tools/build-pages.mjs` (linha 44).
* **Vulnerabilidade**: A variável `SUPABASE_ANON_KEY` possui um valor de fallback embutido no código-fonte para viabilizar execução sem `.env` local.
* **Classificação**: **High** (em termos de boas práticas de empacotamento público), embora se trate de chave `anon` pública do Supabase com RLS.
* **Impacto**: Qualquer pessoa com acesso ao repositório público sabe qual projeto Supabase está vinculado. Se alguma tabela do banco não possuir RLS ativo, dados poderão ser lidos publicamente.

---

## # Medium

### 1. Dependência de RLS (Row Level Security) no Supabase
* **Localização**: Configuração do Supabase (projeto `ajaxhsitwkcsoibjvxnr.supabase.co`).
* **Risco**: Como o cliente usa a chave anônima diretamente no browser, a segurança de dados de jogadores, saves e autenticação depende 100% de políticas RLS bem configuradas nas tabelas `saves`, `profiles` e `users`.
* **Recomendação**: Auditar no painel do Supabase se todas as tabelas possuem `ENABLE ROW LEVEL SECURITY` e políticas de isolamento por `auth.uid() = user_id`.

### 2. Origens Permitidas no Worker Multiplayer
* **Localização**: `multiplayer/wrangler.jsonc` (linhas 19-20).
* **Risco**: `ALLOWED_ORIGINS` contém URLs de desenvolvimento (`http://localhost:4173`, `http://127.0.0.1:4173`) e domínio do Pages (`https://aetheria-bxi.pages.dev`).
* **Recomendação**: Assegurar que novos domínios de produção sejam explicitamente autorizados sem usar wildcard (`*`).

---

## # Low

### 1. Pastas Temporárias e Legadas Não Rastreadas
* **Localização**: `multiplayer/.wrangler/` e `legacy-js/`.
* **Risco**: Arquivos em `multiplayer/.wrangler/tmp` contêm builds transitórios gerados durante desenvolvimento local.
* **Mitigação**: Já estão cobertos pelo `.gitignore`.

### 2. Pacotes de Desenvolvimento
* **Localização**: `package.json`.
* **Risco**: Mínimo. O projeto possui dependências enxutas (`@supabase/supabase-js`, `esbuild`, `wrangler`), minimizando a superfície de ataque por cadeia de suprimentos (supply chain).

---

## # Histórico Git

* **Verificação de `.env`**: Executado `git log --all --full-history -- ".env"` — **Nenhum registro encontrado**.
* **Verificação de `.dev.vars`**: Executado `git log --all --full-history -- ".dev.vars" "multiplayer/.dev.vars"` — **Nenhum registro encontrado**.
* **Estado atual**: O arquivo `.gitignore` protege ativamente `.env`, `.env.*`, `.dev.vars`, `dist/`, `.wrangler/`, `.playwright-mcp/` e `scratch/`.

---

## # Produção

* **Script de Build**: `tools/build-pages.mjs` utiliza `esbuild`.
  * Em desenvolvimento: `sourcemap: true`, `minify: false`.
  * Em produção (`--prod` ou `NODE_ENV=production`): `sourcemap: false`, `minify: true`, `treeShaking: true`.
* **Proteção contra vazamento de código fonte**: Em builds de produção, mapas de código (.map) não são gerados para o público.

---

## # Recomendações

1. **Rotação e Isolamento de Chaves**:
   - Garantir que a chave `SUPABASE_ANON_KEY` seja fornecida exclusivamente via variáveis de ambiente da plataforma de hospedagem (Cloudflare Pages Environment Variables) em builds de produção.
2. **Revisão de Políticas RLS no Supabase**:
   - Confirmar no banco Supabase que nenhuma tabela pública possui permissão `anon` de SELECT/UPDATE/DELETE em dados de outros usuários.
3. **Comando de Build para Produção**:
   - Configurar o pipeline de CI/CD (Cloudflare Pages Build command) para rodar `node tools/build-pages.mjs --prod` a fim de garantir a desativação de source maps.
