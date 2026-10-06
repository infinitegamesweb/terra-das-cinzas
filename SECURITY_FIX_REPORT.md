# Relatório de Correções de Segurança — Terra das Cinzas

**Data**: 2026-10-06  
**Referência**: [SECURITY_AUDIT.md](file:///D:/Game/terra-das-cinzas/SECURITY_AUDIT.md)

---

## 1. Ações Executadas

1. **Proteção de Secrets e Variáveis Locais**:
   - Confirmado que o `.gitignore` protege integralmente `.env`, `.env.*` (exceto `.env.example`), `.dev.vars` e `multiplayer/.dev.vars`.
   - Adicionada exclusão explícita de `.playwright-mcp/` e pastas de scratch para prevenir commits acidentais de logs e sessões temporárias.

2. **Source Maps em Produção**:
   - O bundler `tools/build-pages.mjs` aplica a diretiva `sourcemap: !isProd`. Em ambientes de produção (`--prod` ou `NODE_ENV=production`), a emissão de mapas de código está desativada, impedindo a exposição da estrutura do código fonte aos usuários finais.

3. **Injeção de Credenciais e Rotação**:
   - Documentado que as credenciais do Supabase (`SUPABASE_URL` e `SUPABASE_ANON_KEY`) devem ser providas via variáveis de ambiente do Cloudflare Pages em produção.
   - Caso o projeto passe para um ambiente de produção definitivo com novos dados, a chave anônima do Supabase deve ser rotacionada no painel administrativo do Supabase e atualizada no `.env` local.

---

## 2. Validação

* **Build**: Executado `npm run build` com sucesso em 240ms.
* **Integridade de Gameplay e UI**: Nenhuma lógica de jogo, combate, itens ou interface foi alterada nesta etapa.
