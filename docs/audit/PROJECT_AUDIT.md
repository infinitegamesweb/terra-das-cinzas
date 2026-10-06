# Auditoria Técnica Completa do Projeto — Terra das Cinzas

**Data da Auditoria**: 2026-10-06  
**Status da Base de Código**: Em produção e desenvolvimento contínuo (Cloudflare Pages + Workers)  
**Total de Módulos JavaScript em `src/`**: 40 arquivos  
**Linhas Totais de Código JS em `src/`**: ~21.500 linhas  

---

## 1. Estrutura de Diretórios e Entrypoints

* `src/game.js`: Entrypoint principal do cliente. Orquestra loop de renderização (Canvas 2D), inicialização de entidades, combate, controle de câmera, gerenciamento de estado e binding de eventos.
* `public/index.html`: Entrypoint HTML da aplicação com layout semântico de HUD MMORPG Dark Fantasy, canvas central `#game`, modais e containers de overlay.
* `tools/build-pages.mjs`: Script oficial de build com `esbuild`. Gera `dist/game.bundle.js` e copia `public/` para `dist/`.
* `multiplayer/`: Serviço de rede baseado em Cloudflare Workers e Durable Objects (`GameChannel`).

```
terra-das-cinzas/
├── src/
│   ├── data/             # Tabelas imutáveis de classes, itens, drops, mineração e regiões
│   ├── entities/         # Lógica de renderização e estado do jogador
│   ├── systems/          # Subsistemas modulares (combate, mundo, inventário, etc.)
│   └── game.js           # Orquestrador central e loop de jogo
├── public/
│   ├── assets/           # Sprites, áudios, tiles, mapas e ícones
│   ├── styles/           # CSS modular (mmorpg-hud.css)
│   ├── index.html        # Estrutura DOM
│   └── styles.css        # Folha de estilos legada principal
├── multiplayer/          # Worker e Durable Objects de salas multiplayer
└── tools/                # Scripts de build, empacotamento e exportação de sprites
```

---

## 2. Inventário dos 30 Subsistemas

| Nº | Subsistema | Arquivo Principal | Dependências Chave | Responsabilidade |
|---|---|---|---|---|
| 1 | **Game Loop & Orquestrador** | `src/game.js` | Todos os sistemas | Loop rAF, combate, física, colisão e spawn |
| 2 | **Renderização do Jogador** | `src/entities/Player.js` | `classes.data.js` | Desenho do sprite em 8 direções, dash trail e vfx |
| 3 | **Classes & Atributos** | `src/data/classes.data.js` | Nenhuma | Definições das 6 classes, multiplicadores e skills |
| 4 | **Catálogo de Regiões** | `src/data/regionThumbnails.js` | Nenhuma | Mapeamento das 13 miniaturas 16:9 pixel art |
| 5 | **Layouts do Mundo** | `src/data/worldMapLayouts.json` | Nenhuma | Spawns, dimensões e dados de zonas |
| 6 | **Gerenciador de Mundo** | `src/systems/world/WorldManager.js` | Canvas, áudio | Geração procedural de biomas, árvores, rios e colisões |
| 7 | **Mapa-Múndi Geral** | `src/systems/world/WorldMapManager.js` | `worldMapLayouts.json` | Overlay do mapa global, status de regiões e teleporte |
| 8 | **Tilemaps Estáticos** | `src/systems/world/TileMapManager.js` | `TileMap.js` | Carregamento de camadas de terrenos e colisões |
| 9 | **Rastreador de Dungeons** | `src/systems/world/DungeonTrackerUI.js` | Canvas | HUD de navegação e objetivos de masmorras |
| 10 | **Sistema de Quests** | `src/systems/quests/QuestManager.js` | `localStorage` | Base de missões, progresso de objetivos e recompensas |
| 11 | **Interface de Quests** | `src/systems/quests/QuestUI.js` | `QuestManager.js` | Rastreador dinâmico, modal do diário (J) e banners |
| 12 | **Inventário & Equipamentos** | `src/systems/inventory/InventoryManager.js` | `localStorage` | Banco de itens, equipamentos, slots e buffs |
| 13 | **UI do Inventário** | `src/systems/ui/InventoryUI.js` | `InventoryManager.js` | Modal de mochila, slots de armaduras e tooltips |
| 14 | **Tabelas de Drops** | `src/data/drops.data.js` | Nenhuma | Raridades (comum a supremo) e saques de monstros |
| 15 | **Drop Manager** | `src/systems/drops/DropManager.js` | `drops.data.js` | Criação de drops físicos no chão e coleta |
| 16 | **Mineração** | `src/systems/mining/MiningManager.js` | `mining.data.js` | Veios minerais, tempo de extração e recompensas |
| 17 | **Forja & Crafting** | `src/systems/crafting/CraftingManager.js` | `crafting.data.js` | Criação de armas, armaduras e refino de minérios |
| 18 | **Hub do Castelo** | `src/systems/castle/CastleHubManager.js` | `InventoryManager.js` | NPCs do castelo, diálogos, forja e serviços |
| 19 | **Mercado do Jogo** | `src/systems/marketplace/MarketManager.js` | `InventoryManager.js` | Compra e venda de itens por ouro e cristais |
| 20 | **Árvore de Talentos** | `src/systems/talents/TalentManager.js` | `game.js` | Alocação de pontos a cada 5 níveis e bônus passivos |
| 21 | **Progressão & Fórmulas** | `src/systems/progression/ProgressionManager.js`| Nenhuma | Curva de XP até nv. 300, dano físico e arcano |
| 22 | **Autenticação & Cloud Save**| `src/systems/auth/AuthManager.js` | `@supabase/supabase-js` | Login Supabase, Web3 SIWE, save local e nuvem |
| 23 | **CinzasNet (Networking)** | `src/systems/multiplayer/CinzasNet.js` | WebSocket | Cliente de sincronização de rede em tempo real |
| 24 | **Canais Multiplayer** | `src/systems/multiplayer/ChannelManager.js` | `CinzasNet.js` | Seleção de servidores/canais (World 01 a 12) |
| 25 | **Chat com Abas** | `src/systems/multiplayer/ChatUI.js` | `CinzasNet.js` | Abas Geral, Grupo, Sistema e envio de mensagens |
| 26 | **Grupos (Party)** | `src/systems/multiplayer/PartyManager.js` | `CinzasNet.js` | Criação e convites para grupos de caça |
| 27 | **Trocas (Trade)** | `src/systems/multiplayer/TradeManager.js` | `InventoryManager.js` | Troca segura entre jogadores com duplo aceite |
| 28 | **Lista de Jogadores** | `src/systems/multiplayer/PlayerListUI.js` | `CinzasNet.js` | Painel de errantes online no canal |
| 29 | **Sistema de Áudio** | `src/systems/audio/SoundSystem.js` | Web Audio API / HTML5 | Músicas ambientais por região, efeitos e mudo |
| 30 | **HUD & Interface MMORPG** | `src/systems/ui/UIManager.js` | DOM | Sincronização de vida, XP, hotbar e notificações |

---

## 3. Problemas e Débitos Técnicos Identificados

1. **Monólito Central (`src/game.js` - 6.103 linhas)**:
   - Contém lógica mista de spawn de monstros, ciclo de física do jogador, desenho de projéteis, tratamento de teclas, handlers de UI e inicialização.
2. **Pasta `legacy-js/` Duplicada**:
   - Contém arquivos anteriores de migração que não são utilizados no build do esbuild, consumindo espaço e causando ambiguidade em buscas textuais.
3. **Escalamento de Regiões**:
   - Existem 30 regiões planejadas na jornada até o nível 300, mas a HUD anterior estava limitada às primeiras 13.
