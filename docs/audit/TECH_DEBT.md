# Relatório de Débitos Técnicos — Terra das Cinzas

**Data**: 2026-10-06  
**Objetivo**: Mapear arquivos gigantes, código legado, duplicações e gargalos arquiteturais para subsidiar as próximas fases sem interrupção de estabilidade.

---

## 1. Arquivos Gigantes (> 700 Linhas)

| Arquivo | Linhas | Complexidade / Motivo | Risco |
|---|---|---|---|
| `src/game.js` | **6.103** | Monólito central que acumula loop de desenho, combate, colisão, spawn e HUD | Alto |
| `src/systems/world/WorldManager.js` | **1.426** | Geração e manipulação procedural de biomas, rios e mapa | Médio |
| `src/data/craftpix.data.js` | **1.047** | Base estática de coordenadas e slices de dungeons | Baixo |
| `src/systems/multiplayer/OnboardingManager.js` | **877** | Fluxo de boas-vindas, criação de apelido e escolha de classe | Baixo |
| `src/systems/multiplayer/TradeManager.js` | **805** | Máquina de estados de troca entre jogadores | Médio |
| `src/systems/inventory/InventoryManager.js` | **775** | Tabela exaustiva de dezenas de armas e equipamentos | Baixo |
| `src/systems/quests/QuestUI.js` | **734** | Modais, rastreador e estilização dinâmica de quests | Baixo |
| `src/systems/multiplayer/PlayerListUI.js` | **700** | Listagem, filtros e ações de jogadores no canal | Baixo |

---

## 2. Código Legado e Duplicações

### A. Pasta `legacy-js/`
* **Situação**: Contém 21 arquivos legados (incluindo `legacy-js/game.js` e `legacy-js/world.js`).
* **Diagnóstico**: Nenhum módulo em `src/` importa de `legacy-js/`, e o script `tools/build-pages.mjs` não a processa.
* **Recomendação**: Manter congelada ou mover para backup quando for aprovada a limpeza na Fase 12.

### B. Estilos CSS (`public/styles.css` vs `public/styles/mmorpg-hud.css`)
* **Situação**: `public/styles.css` tem mais de 3.700 linhas, acumulando estilos legados de versões antigas da HUD.
* **Ação Tomada**: O novo layout foi isolado em `public/styles/mmorpg-hud.css` com tokens de design escuro, evitando regressões na folha mestre.

---

## 3. Inconsistências de Nomenclatura e Dados

* **ID da Classe Assassino**:
  - Declarado como `assasino` (com um único 's' central) em `classes.data.js` e no sistema de sprites `assets/characters/assasino/`.
  - Nos prompts e em alguns textos de UI aparece como "Ladino" ou "Assassino".
  - **Diretriz**: Preservar o ID `assasino` no código para garantir compatibilidade com saves existentes do `localStorage`.

---

## 4. Plano de Mitigação Gradual

1. **Fase 03 e 04**: Padronizar as miniaturas e dados de todas as 30 regiões em arquivo único imutável.
2. **Fase 06 e 07**: Continuar modularizando a UI sem quebrar o loop do `game.js`.
3. **Fase 11**: Otimização de loops repetitivos e limpeza de timers órfãos.
