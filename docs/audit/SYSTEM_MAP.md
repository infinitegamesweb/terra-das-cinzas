# Mapa Técnico dos Sistemas — Terra das Cinzas

Este documento detalha o mapa de arquitetura e contratos de cada um dos subsistemas do jogo.

---

### 1. Loop Principal de Jogo & Orquestração
* **Arquivo Principal**: `src/game.js`
* **Arquivos Relacionados**: `src/entities/Player.js`, `src/systems/ui/UIManager.js`
* **Dependências**: Todos os sistemas em `src/systems/` e tabelas em `src/data/`
* **Quem Chama**: Evento `DOMContentLoaded` e auto-execução assíncrona ao carregar `game.bundle.js`
* **Dados Utilizados**: Objeto de estado do jogador `p`, `region`, `bossDefeats`, `monsters`, `drops`
* **Sistemas que Dependem Dele**: Todo o pipeline de renderização no Canvas
* **Estado Atual**: Funcional, executando a 60 FPS com ciclo de tempo delta.
* **Riscos & Problemas**: Arquivo com mais de 6.000 linhas; difícil manutenção sem refatoração cirúrgica.

---

### 2. Entidade e Renderização do Jogador
* **Arquivo Principal**: `src/entities/Player.js`
* **Arquivos Relacionados**: `src/data/classes.data.js`, `tools/build_class_walks.py`
* **Dependências**: `getClassById`
* **Quem Chama**: `src/game.js` (funções `drawHero`, `faceDirection`, `createHeroSprites`)
* **Dados Utilizados**: Coordenadas `p.x`, `p.y`, direção `p.dir`, estado de ataque, hurt e death
* **Sistemas que Dependem Dele**: Loop de combate e física de colisão
* **Estado Atual**: Suporte a 8 direções e ciclos de 6 quadros para todas as classes; atlas empacotado.

---

### 3. Sistema de Classes e Balanceamento
* **Arquivo Principal**: `src/data/classes.data.js`
* **Arquivos Relacionados**: `src/systems/progression/ProgressionManager.js`, `src/systems/ui/UIManager.js`
* **Dependências**: Nenhuma (dados imutáveis puros)
* **Quem Chama**: `Player.js`, `UIManager.js`, `game.js`, `CastleHubManager.js`
* **Dados Utilizados**: Atributos-base (HP, armadura, dano físico, dano arcano, habilidades 2, 5 e 6)
* **Sistemas que Dependem Dele**: Criação de herói, escalamento por nível, renderização de HUD
* **Estado Atual**: 6 classes balanceadas (`guerreiro`, `arqueiro`, `assasino`, `barbaro`, `clerigo`, `mago`).

---

### 4. Sistema de Regiões e Miniaturas
* **Arquivo Principal**: `src/data/regionThumbnails.js`
* **Arquivos Relacionados**: `src/data/worldMapLayouts.json`, `src/systems/world/WorldMapManager.js`, `src/game.js`
* **Dependências**: Nenhuma
* **Quem Chama**: `src/game.js` (`updateRegionUI`), `src/systems/ui/UIManager.js`
* **Dados Utilizados**: `regionId` (0 a 12), caminhos de assets em `public/assets/regions/`
* **Sistemas que Dependem Dele**: Painel lateral de regiões e mapa-múndi
* **Estado Atual**: Miniaturas 16:9 pixel art ativas com destaque dourado para a região atual.

---

### 5. Geração e Terreno do Mundo
* **Arquivo Principal**: `src/systems/world/WorldManager.js`
* **Arquivos Relacionados**: `src/systems/world/TileMapManager.js`, `src/systems/world/TileMap.js`
* **Dependências**: Web Audio, Canvas API
* **Quem Chama**: `src/game.js` durante troca de região e renderização de tiles
* **Dados Utilizados**: `TILE_SOURCES`, biomas, vetores de colisão e densidade de obstáculos
* **Sistemas que Dependem Dele**: Câmera, colisão do jogador e pathfinding
* **Estado Atual**: Estável com renderização de biomas e piso do castelo.

---

### 6. Sistema de Missões (Quests)
* **Arquivo Principal**: `src/systems/quests/QuestManager.js`
* **Arquivos Relacionados**: `src/systems/quests/QuestUI.js`
* **Dependências**: `localStorage` (persistência sob chave `guerra-cinzas-quests-v1`)
* **Quem Chama**: `src/game.js` (abates de monstros, coletas), NPCs de entrega
* **Dados Utilizados**: `QUEST_DATABASE`, contadores de objetivos, status ativo/completo
* **Sistemas que Dependem Dele**: HUD MMORPG (`#hudQuestCard`), Diário de Missões (`J`)
* **Estado Atual**: 100% funcional com eventos customizados `quests-updated`.

---

### 7. Inventário, Equipamentos e Drops
* **Arquivo Principal**: `src/systems/inventory/InventoryManager.js`
* **Arquivos Relacionados**: `src/systems/ui/InventoryUI.js`, `src/data/drops.data.js`, `src/systems/drops/DropManager.js`
* **Dependências**: `localStorage`
* **Quem Chama**: `src/game.js`, `CastleHubManager.js`, `TradeManager.js`
* **Dados Utilizados**: `ITEM_DATABASE`, slots equipados (`weapon`, `shield`, `armor`, `ring`, etc.)
* **Sistemas que Dependem Dele**: Cálculo de atributos de combate e interface de mochila
* **Estado Atual**: Totalmente implementado com 6 patamares de raridade e bônus de combate.

---

### 8. Autenticação, Web3 e Cloud Save
* **Arquivo Principal**: `src/systems/auth/AuthManager.js`
* **Arquivos Relacionados**: `src/game.js`
* **Dependências**: `@supabase/supabase-js`, `process.env`
* **Quem Chama**: Top bar (`#accountTop`), menu de autenticação
* **Dados Utilizados**: Sessão JWT, endereço de carteira Web3, payloads de save codificados
* **Sistemas que Dependem Dele**: Persistência cross-device e multiplayer
* **Estado Atual**: Suporte a login híbrido (e-mail, Google, carteira Web3) e salvamento na nuvem.

---

### 9. Rede e Multiplayer Social
* **Arquivo Principal**: `src/systems/multiplayer/CinzasNet.js`
* **Arquivos Relacionados**: `ChatUI.js`, `PartyManager.js`, `PlayerListUI.js`, `TradeManager.js`, `ChannelManager.js`
* **Dependências**: WebSocket cliente conectado a Cloudflare Worker com Durable Objects
* **Quem Chama**: `src/game.js` no bootstrap
* **Dados Utilizados**: Mensagens de chat, posição de errantes no mapa, convites de grupo e trocas
* **Sistemas que Dependem Dele**: Top bar, chat box inferior e listas de canais
* **Estado Atual**: Conexão WebSocket com reconexão automática e canais 1 a 12.
