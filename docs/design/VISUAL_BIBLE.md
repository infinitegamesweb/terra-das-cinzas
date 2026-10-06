# Bíblia Visual & Design System — Guerra das Cinzas

**Documento:** `docs/design/VISUAL_BIBLE.md`  
**Gênero:** RPG de Aventura Dark Fantasy Medieval 2D  
**Estilo Artístico:** Pixel Art Autêntico (resolução de jogo, sem sub-pixels ou blur anti-aliasing)  
**Versão:** 1.0.0 (Fase 04 — Master Plan)

---

## 1. Princípios Fundamentais & Atmosfera

*Guerra das Cinzas* se passa em um mundo pós-cataclismo, devastado pela Chama Primordial e afogado em cinzas eternas. A estética visual rejeita fantasia limpa ou caricata em favor de um tom austero, opressivo, misterioso e épico.

1. **Pixel Art Autêntico:** Resolução deliberada, sem anti-aliasing em bordas transparentes, sem interpolação bilinear ou filtros vetoriais. Escalamento 100% Nearest Neighbor (`image-rendering: pixelated`).
2. **Materialidade Tangível:** Elementos visuais refletem ferro fundido, pedra esculpida gasta, pergaminhos amarelados com bordas queimadas, madeira escura apodrecida e brasas ardentes.
3. **Mundo Dominante:** A interface do usuário (HUD) deve sempre enquadrar o mundo jogável, nunca soterrá-lo sob caixas opacas ou decorações desnecessárias.

---

## 2. Paleta de Cores Oficial

A paleta se organiza em cinco famílias tonais harmoniosas:

| Família | Nome Token | Hex / RGBA | Uso Primário |
|---|---|---|---|
| **Sombra & Carvão** | `--color-void-black` | `#08090c` | Fundos absolutos, sombras profundas |
| | `--color-ash-dark` | `#12161f` | Painéis principais, slots de inventário |
| | `--color-slate-gray` | `#1c2433` | Superfícies secundárias e bordas neutras |
| **Cinzas & Rochas** | `--color-ash-mid` | `#4a5568` | Textos secundários, bordas desativadas |
| | `--color-ash-light` | `#94a3b8` | Textos de leitura comum, ícones neutros |
| | `--color-pure-bone` | `#e2e8f0` | Títulos brancos, valores críticos |
| **Brasas & Fogo** | `--color-ember-glow` | `#f59e0b` | Destaques, ouro primário, moedas, itens raros |
| | `--color-flame-bright`| `#fbbf24` | Foco interativo, estados ativos |
| | `--color-blood-crimson`| `#dc2626` | Barra de Vida (HP), perigo, hostis, bosses |
| **Magia Arcana** | `--color-arcane-blue`| `#38bdf8` | Barra de Mana, magia, arcanistas |
| | `--color-void-purple` | `#a855f7` | Vazio, itens épicos, anomalias cósmicas |
| **Vida & Sucesso** | `--color-emerald-deep`| `#059669` | Regen, buffs ativos, quests concluídas |
| | `--color-emerald-light`| `#34d399` | Textos de confirmação, bônus de equipamento |

---

## 3. Tipografia

- **Títulos & Cabeçalhos:** Fonte serifada ou gótica medieval display (`Cinzel`, `MedievalSharp` ou pixel display com kerning firme).
  - Escala: `18px` a `24px` para títulos de painel; `13px` a `16px` para subtítulos.
  - Sombra: `text-shadow: 0 2px 4px rgba(0, 0, 0, 0.85);`
- **Textos de UI & Diálogos:** Sans-serif legível e condensada em resoluções modernas (`Inter`, `Segoe UI` ou font bitmap crisp em caixas de diálogo).
  - Escala: `12px` padrão, `11px` para rótulos secundários, `10px` para notas de rodapé.
- **Valores Numéricos & Status:** Fonte monoespaçada ou tabular com alta legibilidade (`Consolas`, `JetBrains Mono` ou bitmap numbers).
  - Escala: `10px` a `12px`, peso bold (700/800).

---

## 4. Bordas e Molduras

- **Borda Padrão (Painéis Neutros):** `1px solid rgba(255, 255, 255, 0.08)` sobre fundo escurecido com leve chanfro (`border-radius: 4px` a `6px`).
- **Moldura Ornamental (Dourada / Ferro Forjado):**
  - Borda dupla ou linha com acabamento em canto chanfrado.
  - Gradiente linear metálico: `border-color: #78350f` variando para `#d97706` no ponto de luz.
- **Borda de Alerta / Combate:** `1px solid rgba(220, 38, 38, 0.6)` com box-shadow pulsante em vermelho escuro.

---

## 5. Painéis e Superfícies

- **Fundo Base:** `rgba(18, 22, 31, 0.92)` com `backdrop-filter: blur(6px)`.
- **Cabeçalho de Painel:** Gradiente descendente sutil `linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, transparent 100%)`.
- **Divisores Internos:** Linha de 1px com degradê transparente nas extremidades `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)`.

---

## 6. Botões e Controles Interativos

| Tipo | Fundo Base | Borda | Cor do Texto | Efeito Hover |
|---|---|---|---|---|
| **Primário (Ação / Ouro)** | `linear-gradient(180deg, #b45309, #78350f)` | `#f59e0b` | `#fff` | Brilho dourado + elevação de 1px |
| **Secundário (Neutro)** | `rgba(255, 255, 255, 0.05)` | `rgba(255, 255, 255, 0.15)` | `#94a3b8` | Clareamento para `rgba(255, 255, 255, 0.1)` |
| **Perigo / Desistir** | `linear-gradient(180deg, #991b1b, #450a0a)` | `#ef4444` | `#fca5a5` | Pulso avermelhado |
| **Desativado / Bloqueado** | `rgba(0, 0, 0, 0.35)` | `rgba(255, 255, 255, 0.04)` | `#475569` | Sem reação, cursor `not-allowed` |

---

## 7. Ícones

- **Estilo:** Pixel art nítido 16×16 px ou 24×24 px com contorno escuro (1px outline) para contraste sobre qualquer bioma de fundo.
- **Categorias:**
  - Armas / Armaduras: silhuetas de aço polido, madeira envernizada e gemas incrustadas.
  - Consumíveis: frascos de poção com brilho vítreo, pergaminhos amarrados com fita vermelha, carnes secas.
  - Status / Elementos: Chamas (vermelho/laranja), Gelo (ciano frio), Veneno (verde ácido), Sangramento (carmesim), Vazio (púrpura).

---

## 8. Cards (Regiões, Dungeons e Conquistas)

- Proporção visual: `16:9` para miniaturas ambientais.
- Estrutura semântica obrigatória:
  1. Thumbnail do ambiente (`68x38px` compacto ou `160x90px` expandido) com `object-fit: cover`.
  2. Número identificador (`00` a `29`) posicionado no canto superior com fundo preto translúcido.
  3. Nome medieval da região/dungeon em fonte serifada de destaque.
  4. Faixa de nível recomendada (`Nv. X–Y`) em tom âmbar suave.
  5. Selo de status (`Hub Seguro`, `Guardião Derrotado`, `Chefe Nv. X`).
  6. Indicadores de estado (`Região Atual` em verde esmeralda; `🔒 Cadeado` em cinza/vermelho).

---

## 9. HUD (Heads-Up Display)

- **Distribuição Espacial:**
  - **Topo (Barra de Status Global):** Nível do jogador, Ouro, Fragmentos de Cinza, Botões de Acesso Rápido (Inventário, Talentos, Quests, Mapa, Configurações).
  - **Canto Superior Esquerdo (Quadro do Herói):** Retrato do personagem com moldura circular de ferro forjado, barra de HP (vermelha com reflexo chanfrado), barra de Mana/Energia (azul brilhante) e ícones de buffs/debuffs ativos.
  - **Centro:** Visão desobstruída do mundo 2D com popups de dano flutuante e avisos narrativos atmosféricos.
  - **Canto Superior Direito:** Minimapa circular ou retangular com radar de NPCs, saídas e monstros; quadro de objetivos da Quest ativa.
  - **Canto Inferior Esquerdo:** Painel de Chat/Log de Combate translúcido com abas (Geral, Combate, Grupo).
  - **Canto Inferior Centro/Direita:** Hotbar de 1 a 6 para habilidades e consumíveis, com timers numéricos de recarga (cooldown).

---

## 10. Mapas e Biomas

Cada um dos 30 biomas obedece a uma paleta cromática dominante e atmosfera específica:
- **Zonas Iniciais (00–04):** Cinzas, florestas em ruínas, névoa pantanosa e lodo (tons carvão, verde musgo e cinza).
- **Zonas Frias (05–08):** Gelo, tundra congelada e cavernas glaciais (tons ciano, branco giz e azul cobalto).
- **Zonas Desérticas e Rochosas (09–12):** Poeira, arenito seco e cânions esculpidos (tons ocre, terracota e âmbar).
- **Zonas Abissais e Vulcânicas (13–18):** Rios de magma, enxofre e forjas profundas (tons carmesim, laranja incandescente e obsidiana).
- **Zonas Arcanas e Mortas (19–24):** Cidadelas flutuantes, criptas ancestrais e bibliotecas arruinadas (tons roxo ametista, azul etéreo e mármore negro).
- **Zonas do Vazio e Cinzas Finais (25–29):** Fragmentos cósmicos, tempestades de cinzas e trono esquecido (tons violeta escuro, preto puro e vermelho brasa).

---

## 11. Personagens (Heróis)

- Resolução do sprite: Base de colisão `32×48 px` proporcional ao grid do mundo.
- Classes com silhuetas distintas:
  - **Guerreiro:** Armadura pesada de placas, escudo largo, postura firme e estável.
  - **Mago:** Túnica longa esvoaçante, cajado com cristal aceso, postura ereta.
  - **Arqueiro:** Couro batido, aljava nas costas, arco recurvo longo, postura ágil.
  - **Assassino:** Capuz fechado, adagas duplas invertidas, silhueta compacta e furtiva.
  - **Bárbaro:** Tronco descoberto com peles, machado de duas mãos colossal, porte massivo.
  - **Clérigo:** Malha de ferro, maça sagrada, tabardo com insígnia da chama dourada.

---

## 12. NPCs (Não-Jogadores)

- Cores de destaque para diferenciação de propósito:
  - Mercadores / Ferreiros: Aventais de couro, lanternas penduradas, postura acolhedora.
  - Guias de Missão: Ponto de exclamação dourado pulsante sobre a cabeça.
  - Guardas do Castelo: Uniforme cerimonial com lanças verticais imóveis.

---

## 13. Monstros Comuns

- Hierarquia de perigo expressa na paleta e tamanho:
  - Bestas comuns (Nv. 1–50): Cores naturais escuras, porte menor que o jogador.
  - Criaturas Corrompidas (Nv. 51–150): Olhos brilhantes em vermelho/roxo, espinhos de obsidiana.
  - Elites (Nv. 151–250): Contorno com aura sutil, tamanho 1.3x superior ao comum.

---

## 14. Chefes (Bosses)

- Porte imponente: Sprites de `64×64 px` a `128×128 px` ou superiores.
- Barra de Vida Dedicada: Fixada no centro superior da tela, com nome gravado em runas e marcadores visuais para as fases de batalha (ex: divisores de 75%, 50%, 25%).
- Telegraphs de Ataque: Áreas vermelhas translúcidas no piso antes de habilidades em área (AoE) para leitura justa e reativa do jogador.

---

## 15. Efeitos Visuais (VFX)

- Efeitos desenhados estritamente na grade de pixel art:
  - Golpes físicos: Linhas de corte brancas e amarelas com duração de 3 a 5 frames.
  - Magias de fogo: Partículas de fagulha ascendentes com desaparecimento em cinzas.
  - Magias de gelo: Estilhaços geométricos pontiagudos com névoa estática.
  - Dano crítico: Números flutuantes aumentados em 130% na cor amarela vívida com contorno preto e leve tremor.

---

## 16. Thumbnails de Região

- **Formato Oficial:** Imagem estática `16:9` (`512×288 px` original, renderizada em `68×38 px` nos menus compactos).
- **Critérios Obrigatórios:**
  1. Sem texto embutido na imagem.
  2. Sem molduras ou bordas embutidas.
  3. Sem personagens em primeiro plano.
  4. Iluminação direcional dramática comunicando o bioma imediatamente.

---

## 17. Sistema de Inventário

- **Grade (Grid):** Slots quadrados de `40×40 px` ou `48×48 px` com borda interna de 1px e fundo escuro.
- **Moldura de Equipamento do Herói:** 5 a 6 slots específicos (Arma Principal, Mão Secundária/Escudo, Elmo, Peitoral, Acessório) dispostos ao redor da silhueta do herói.
- **Códigos de Cor por Raridade:**
  - Comum: Cinza (`#94a3b8`)
  - Incomum: Verde Esmeralda (`#22c55e`)
  - Raro: Azul Safira (`#3b82f6`)
  - Épico: Roxo Real (`#a855f7`)
  - Lendário: Ouro Solar (`#f59e0b`)
  - Supremo: Carmesim Primordial (`#ef4444`)

---

## 18. Tooltips

- Painel flutuante posicionado dinamicamente com margem de segurança da borda da tela.
- Estrutura:
  1. Nome do item colorido pela raridade.
  2. Tipo de item e nível requerido.
  3. Atributos primários em verde (`+15 Ataque`, `+8 Defesa`).
  4. Efeitos secundários / encantamentos em azul claro.
  5. Descrição de lore em itálico fosco cinza.
  6. Preço de venda em moedas de ouro.

---

## 19. Interface de Missões (Quest Log)

- Separação entre Missões Principais (insígnia de chama dourada) e Missões Secundárias/Caçadas (pergaminho de prata).
- Barra de progresso com preenchimento em gradiente verde escuro para amarelo ouro.

---

## 20. Tabela Canônica de Estados

| Estado | Borda | Fundo | Opacidade / Filtro | Feedback Sonoro / Visual |
|---|---|---|---|---|
| **Normal** | `rgba(255, 255, 255, 0.08)` | `rgba(255, 255, 255, 0.02)` | 100% | Neutro |
| **Hover** | `#f59e0b` (35%) | `rgba(245, 158, 11, 0.10)` | 100% | Leve clareamento e elevação |
| **Active / Pressionado**| `#f59e0b` (80%) | `rgba(245, 158, 11, 0.25)` | 100% | Deslocamento de 1px para baixo |
| **Current (Atual)** | `#eab308` sólida | Gradiente âmbar/carvão | Box-shadow dourado | Destaque persistente |
| **Disabled** | `rgba(255, 255, 255, 0.04)` | `rgba(0, 0, 0, 0.40)` | 40% | Cursor `not-allowed` |
| **Locked** | `rgba(220, 38, 38, 0.20)` | `rgba(0, 0, 0, 0.65)` | Grayscale 80%, Brilho 60% | Ícone de cadeado central |
| **Completed** | `rgba(16, 185, 129, 0.40)` | `rgba(16, 185, 129, 0.08)` | 100% | Tag esmeralda `Concluído` |
| **Danger** | `rgba(220, 38, 38, 0.80)` | `rgba(220, 38, 38, 0.15)` | Pulso sutil | Borda vermelha de alerta |
| **Rare** | `#3b82f6` sólida | Azul etéreo translúcido | Box-shadow safira | Partículas azuis |
| **Legendary** | `#f59e0b` sólida | Ouro flamejante translúcido| Box-shadow dourado amplo | Brilho pulsante |
