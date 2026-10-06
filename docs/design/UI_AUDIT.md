# Auditoria Visual e Estrutural da Interface (UI) — Guerra das Cinzas

**Documento:** `docs/design/UI_AUDIT.md`  
**Escopo:** Diagnóstico Completo da Interface Atual e Proposta de Redesign  
**Alinhamento:** `docs/design/VISUAL_BIBLE.md` & Master Plan (Fase 06 — Prompts 10 a 13)

---

## 1. Inventário de Componentes de Interface

A interface de *Guerra das Cinzas* é composta por uma camada híbrida de elementos HTML/CSS sobrepostos (`overlay HUD`) a um elemento `<canvas id="game">` com viewport 2D responsivo.

| Componente | Localização | Elementos Chave | Responsabilidade |
|---|---|---|---|
| **Barra Superior (`header.top`)** | Topo da viewport | Logo, abas de navegação, utilitários, ouro/cristais, perfil | Navegação primária e status global da conta |
| **Quadro do Herói (`.hud-char-card`)** | Canto superior esquerdo | Avatar, nome da classe, nível, barras HP/XP/EN | Sobrevivência e status imediato do herói |
| **Missão Ativa (`.hud-quest-card`)** | Esquerda, abaixo do herói | Selo de missão, título, contadores, botão de ação | Rastreamento e entrega rápida de objetivos |
| **Minimapa (`.hud-minimap-card`)** | Canto superior direito | Tag da zona, rosa dos ventos, canvas radar 112×112 | Orientação espacial e proximidade de alvos |
| **Painel de Regiões (`.hud-regions-card`)** | Direita, abaixo do minimapa | Lista vertical de cards com thumbnails de bioma | Seleção de zona e teletransporte |
| **Chat & Log (`.hud-chat-card`)** | Canto inferior esquerdo | Abas (Geral, Grupo, Sistema), mensagens, input | Comunicação social e notificações do sistema |
| **Hotbar de Ação (`.hud-hotbar-card`)** | Centro inferior | Toggle AUTO, slots numéricos 1–6 com cooldowns | Execução de habilidades e consumíveis |
| **Painéis Modais / Telas Cheias** | Centralizado | Inventário (`#invPanel`), Árvore de Talentos, Loja | Gerenciamento aprofundado do RPG |

---

## 2. Diagnóstico dos 10 Problemas Críticos

### 1. Excesso de Elementos na Tela
- No viewport padrão (1366×768 ou 1920×1080), o canvas do jogo compete com 6 caixas de interface simultâneas: Topbar (56px), Herói (110px), Quests (140px), Minimapa (160px), Painel de Regiões (320px) e Chat (170px).
- Em telas menores ou laptops, os painéis da esquerda e da direita cobrem quase 45% da largura jogável, sufocando o combate e a exploração.

### 2. Hierarquia Visual Ruim
- O botão `AUTO` na hotbar possui o mesmo destaque e saturação que poções vitais.
- O selo da missão ativa possui contraste similar ao da barra de vida do personagem, disputando a atenção periférica durante momentos de perigo crítico.

### 3. Informações Duplicadas
- O nível do jogador aparece no Topbar (perfil), no Quadro do Herói (`#level`), dentro do painel do Personagem (Tecla P) e no cabeçalho do inventário.
- A região atual é indicada na tag superior do minimapa (`#zoneTagText`), dentro do card de regiões (`.hrc-region-card.current`) e no diário de missões.

### 4. Inconsistência de Espaçamento
- O header utiliza espaçamentos de 6px e 12px; os cards de HUD usam margens de 16px; o painel lateral de regiões utiliza gap de 8px e padding de 5px.
- Falta um grid modular uniforme (múltiplos de 4px / 8px).

### 5. Inconsistência de Cores
- Presença de múltiplos tons de dourado/amarelo sem padronização: `#f59e0b`, `#eab308`, `#fbbf24`, `#d97706` e `rgba(245, 158, 11, ...)`.
- As bordas alternam entre branco translúcido (`rgba(255,255,255,0.08)`), dourado escuro (`#78350f`) e ciano fosco.

### 6. Botões Redundantes
- O cabeçalho possui `navCraft` (aba de produção) e `forgeTop` (atalho para a forja) lado a lado com funções idênticas.
- O botão `soundToggle` (áudio) está imediatamente ao lado de `menuOptionsBtn` (opções gerais).
- O botão `accountTop` e o avatar do herói (`#avatarTop`) executam gatilhos de perfil sobrepostos.

### 7. Painéis Pequenos Demais
- O chat possui uma altura útil de apenas 90px no container de mensagens (`.chat-messages-container`), exibindo no máximo 3 linhas curtas antes de exigir rolagem.
- Os slots de itens na hotbar (`action-slot`) medem 36×36 px, o que dificulta o clique rápido com o mouse durante o combate tenso.

### 8. Painéis Grandes Demais
- O painel de regiões na lateral direita (`.hud-regions-card`) possui largura fixa de 240px e altura expansiva, obstruindo inimigos que se aproximam pelo quadrante leste do mapa.

### 9. Problemas de Legibilidade
- Rótulos com fontes condensadas em 9px (`.hrc-num`, `.hrc-card-status`) apresentam baixo contraste sobre miniaturas com tons médios de cinza e cinzas ardentes.
- Falta de sombreamento de texto consistente (`text-shadow`) em valores numéricos flutuantes sobre biomas claros como Neve ou Deserto.

### 10. Problemas de Responsividade
- Em larguras inferiores a 1024px, a barra superior sofre quebra de linha de botões secundários, desalinhando o layout.
- Falta um mecanismo nativo de recolhimento (collapse / toggle) com um clique ou atalho de teclado para os painéis de Missão e Região.

---

## 3. Proposta de Redesign da Arquitetura Visual

### Diretriz Central: O Mundo é o Protagonista
Reduzir as bordas pesadas e as caixas opacas, substituindo-as por superfícies translúcidas com efeito de vidro fosco escuro (`rgba(10, 12, 16, 0.78)` com `backdrop-filter: blur(6px)`), mantendo o foco do jogador imerso no cenário e nos monstros.

```
+-----------------------------------------------------------------------------------------------+
| [LOGO] [Personagem] [Inventario] [Mundo] [Producao] [Missoes]  |  [Ouro] [Cristais] [Audio] [O] | <- HEADER LIMPO
+-----------------------------------------------------------------------------------------------+
| [HERÓI & HP/MP]                                                                [MINIMAPA COMPACTO] |
| Retrato 40x40                                                                  112x112 circular  |
| HP / Mana / Buffs                                                              Nome da Região     |
|                                                                                                  |
| [MISSÃO COMPACTA (recolhível)]                                                 [PAINEL REGIÕES]   |
| 1 objetivo ativo com progresso                                                 Cards 16:9 c/      |
|                                                                                scroll suave       |
|                                                                                                  |
|                                         ÁREA CENTRAL                                             |
|                                      MUNDO 2D EM FOCO                                            |
|                                                                                                  |
|                                                                                                  |
| [CHAT TRANSLÚCIDO]                         [HOTBAR MEDIEVAL]                     [ALERTA DE COMBATE] |
| 3 abas, input discreto                     AUTO | 1 | 2 | 3 | 4 | 5 | 6          Feedback de XP     |
+-----------------------------------------------------------------------------------------------+
```

### Melhorias Específicas Planejadas
1. **Header:** Remover botões redundantes; manter navegação principal clara e agrupar utilitários em menu suspenso ou atalhos limpos.
2. **Painel de Regiões:** Adicionar botão de minimizar/expandir (`Toggle`), visual padronizado para as 30 regiões e filtros de modo (Normal, Difícil, Pesadelo, Brasa, Cinzas).
3. **Inventário:** Manter a integridade de `InventoryManager`, estruturando o modal em duas colunas:
   - Esquerda: Boneco de Papel (Paperdoll) com os 5 slots de equipamento e resumo de atributos.
   - Direita: Grade de itens com abas de categoria (Todos, Armas, Armaduras, Consumíveis, Materiais) e painel lateral de detalhes e comparação de stats.
