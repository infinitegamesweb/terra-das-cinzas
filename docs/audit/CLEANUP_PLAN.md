# Plano de Limpeza Segura do Repositório — Guerra das Cinzas

**Documento:** `docs/audit/CLEANUP_PLAN.md`  
**Escopo:** Classificação Conservadora de Diretórios e Arquivos do Projeto  
**Alinhamento:** Master Plan (Fase 12 / Prompt 24)

---

## 1. Critérios de Classificação

Todos os caminhos do repositório foram avaliados segundo seu ciclo de vida:
- **ACTIVE:** Em uso ativo no build, no cliente ou na produção. Nunca remover.
- **LEGACY:** Código substituído por versões modulares recentes, mas mantido para histórico e comparação.
- **UNUSED:** Arquivo sem importação ou referência direta em código de execução.
- **REFERENCE:** Documentação de design, guias de arte e especificações.
- **GENERATED:** Saídas automáticas de compiladores/bundlers.
- **TEMPORARY:** Arquivos transitórios de scratch ou caches de CLI.
- **UNKNOWN:** Propósito não determinado com 100% de certeza. Proibido apagar.

---

## 2. Inventário de Classificação

### 2.1 Código-Fonte e Runtime

| PATH | CATEGORY | EVIDENCE | RISK | RECOMMENDATION |
|---|---|---|---|---|
| `src/` | **ACTIVE** | Ponto de entrada do jogo (`src/game.js`), sistemas modulares e dados. | **CRITICAL** | Manter integralmente. |
| `public/` | **ACTIVE** | Assets servidos estaticamente pelo Cloudflare Pages e `index.html`. | **CRITICAL** | Manter integralmente. |
| `tools/` | **ACTIVE** | Scripts de build (`build-pages.mjs`), processamento de sprites e geradores. | **HIGH** | Manter integralmente. |
| `multiplayer/` | **ACTIVE** | Backend de WebSocket em Cloudflare Workers com Durable Objects. | **HIGH** | Manter integralmente. |
| `migrations/` | **ACTIVE** | Esquemas SQL do banco de dados de produção (Supabase). | **CRITICAL** | **PROIBIDO APAGAR**. |
| `package.json` | **ACTIVE** | Dependências e scripts oficiais (`npm run build`). | **CRITICAL** | Manter integralmente. |

---

### 2.2 Pastas de Apoio e Arte Intermediária

| PATH | CATEGORY | EVIDENCE | RISK | RECOMMENDATION |
|---|---|---|---|---|
| `legacy-js/` | **LEGACY** | Versões monolíticas anteriores a modularização de `src/`. Não importado em `index.html`. | **MEDIUM** | Manter versionado para consulta histórica. Não apagar sem backup. |
| `art-staging/` | **REFERENCE** | Provas de conceito de pixel art, animações em validação e manifestos. | **LOW** | Manter como repositório de staging de novos assets. |
| `raw-assets/` | **REFERENCE** | Imagens originais em alta resolução antes da conversão para pixel art 16:9. | **LOW** | Manter como fonte original não destrutiva. |
| `spriterrific-runs/`| **REFERENCE** | Registros e frames gerados via pipelines locais de IA. | **LOW** | Manter arquivado. |
| `cinzas-multiplayer-starter/` | **UNUSED** | Template inicial local de teste pré-Durable Objects. | **LOW** | Manter isolado como referência de testes de protocolo. |

---

### 2.3 Pastas Geradas e Temporárias

| PATH | CATEGORY | EVIDENCE | RISK | RECOMMENDATION |
|---|---|---|---|---|
| `dist/` | **GENERATED** | Saída do `npm run build` gerada por `tools/build-pages.mjs`. | **NONE** | Pode ser recriada a qualquer momento via build. Não versionar manualmente. |
| `node_modules/` | **GENERATED** | Pacotes npm baixados. | **LOW** | Gerenciado via `package.json`. |
| `.wrangler/` | **TEMPORARY** | Caches locais do Cloudflare Wrangler CLI. | **NONE** | Ignorado no Git, seguro limpar se necessário. |
| `scratch/` | **TEMPORARY** | Scripts de diagnóstico efêmeros. | **LOW** | Limpar periodicamente após uso. |
| `.playwright-mcp/` | **TEMPORARY** | Artefatos de sessões de browser testing. | **NONE** | Manter para auditorias locais. |

---

## 3. Diretrizes de Execução da Limpeza (Prompt 25)

1. **Nenhum asset de jogo ativo em `public/assets/` será apagado.**
2. **Nenhuma migration SQL em `migrations/` será modificada ou removida.**
3. **Nenhum arquivo de documentação técnica em `docs/` será removido.**
4. Apenas artefatos efêmeros de build ou testes transitórios podem ser limpos após verificação com `git status` e `npm run build`.
