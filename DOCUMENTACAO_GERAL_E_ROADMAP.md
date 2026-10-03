# 📖 Documentação Geral do Projeto & Roadmap Estratégico
**Terra das Cinzas — RPG de Aventura 2D em Pixel Art**

---

## 🌟 1. Visão Geral do Projeto

**Terra das Cinzas** é um RPG de ação e exploração em tempo real no estilo 2D Top-Down, construído com estética gótica *Dark Fantasy* em pixel art de alta fidelidade. O jogo une exploração de mundo aberto, masmorras táticas geradas e desenhadas à mão, combate dinâmico por combos e chefes titânicos com animações fluidas geradas via Inteligência Artificial na nuvem.

### 🛠️ Pilha Tecnológica
* **Motor Gráfico:** HTML5 Canvas 2D nativo de alto desempenho com aceleração por hardware.
* **Lógica do Jogo:** JavaScript Moderno (ES6+ modular, Vanilla JS sem frameworks pesados para garantir 60 FPS estáveis).
* **Interface & HUD:** Vanilla CSS moderno com paleta de cores temática, transparências em vidro (glassmorphism), animações de partículas e tipografia nítida para telas Retina/Full HD.
* **Ferramental & Pipelines:** Node.js (scripts de corte de sprites com `sharp`, parsers TMX de Tiled Map Editor e integração via API HTTP REST).
* **Inteligência Artificial:** **Spriterrific Cloud API** integrada nativamente com geração remota de spritesheets, matrizes de animação em grid e metadados de ancoragem.

---

## ⚔️ 2. O Que Já Temos no Projeto (Inventário Completo)

### 🏰 2.1 Mundo & Ambientação
1. **Castle Hub (Castelo Central de Miraluz):**
   - Piso detalhado de ruínas de castelo em pedra esculpida (`castle_ruins_floor.png`).
   - Tocheiros arcanos com chamas animadas, gárgulas de pedra e estátuas de dragão guardião.
   - Boneco de treino interativo para teste de DPS e combos de ataque.
   - Estantes de biblioteca antiga e escadarias medievais de conexão.
2. **Vilarejo Medieval no Exterior (Bosque das Ruínas):**
   - 6 edifícios medievais autênticos cortados em alta definição da biblioteca `Houses_Pack`:
     - *Ferraria de Miraluz* (`medieval_blacksmith`)
     - *Boticário Alquímico* (`medieval_apothecary`)
     - *Taverna das Brasas* (`medieval_tavern`)
     - *Residência Nórdica* (`medieval_house_blue`)
     - *Casa de Madeira* (`medieval_house_wood`)
     - *Mansão de Alvenaria* (`medieval_house_red`)
   - Caixas de colisão sólida em tempo real para impedir que o jogador atravesse as paredes.
   - Indicadores visuais de fachada com nomes e ícones correspondentes.
3. **5 Regiões Conectadas:**
   - **Região 1 — Bosque das Ruínas (Nv. 1–20):** Floresta antiga com vestígios da civilização caída e clareiras sombrias.
   - **Região 2 — Pântano Espectral (Nv. 21–40):** Águas sussurrantes, névoas densas e vapores venenosos.
   - **Região 3 — Montanhas Rubras (Nv. 41–60):** Fendas incandescentes, crateras vulcânicas e rocha de cinza.
   - **Região 4 — Cidadela das Cinzas (Nv. 61–80):** O antigo bastião imperial agora sepultado sob as cinzas.
   - **Região 5 — Trono do Eclipse (Nv. 81–100):** O limiar do vazio eterno e confronto final contra o Eclipse.
4. **Sistemas de Exploração:**
   - Minimapa dinâmico no canto superior com indicador de coordenadas, radar de inimigos e pontos de interesse.
   - Sistema de iluminação ambiente, névoa pulsante e partículas atmosféricas flutuantes.
   - Mapa-Múndi tático (`worldmap.js`) com rotas, cartões de região, detalhes de monstros e status de liberação.

---

### 🗝️ 2.2 Sistema de Masmorras (Catacumbas & Battlemaps CraftPix)
1. **Battlemap Tático em Alta Resolução:**
   - Mapa de 1920x1440 gerado através do `Dungeon1.tmx` da CraftPix, com paredes góticas, lajes de pedra, corredores estreitos e salões de batalha.
2. **Iluminação & Tochas Animadas:**
   - 95 tochas posicionadas estrategicamente nos suportes de parede das masmorras.
   - Spritesheet animado de 6 frames com efeito de flickering (pulsação natural da chama e luz ambiente alaranjada).
3. **Armadilhas de Espinhos Letais:**
   - 37 armadilhas de espinhos (`spike_trap_strip.png`) com animação cíclica de 5 frames (inativas -> armando -> espinhos projetados).
   - Detecção de colisão física e dano contínuo ao jogador caso pise nos espinhos ativados.
4. **Progressão em Andares:**
   - Escadarias de descida (`useDungeonStairs`), missões por andar, baús amaldiçoados/espectrais e bosses especiais a cada 5 andares.

---

### 🛡️ 2.3 Classes, Habilidades & Progressão
1. **6 Classes Distintas com Identidade Única:**
   - **Guerreiro:** Tanque corpo a corpo com *Investida com Escudo*, *Turbilhão de Aço* e *Fúria Titânica*.
   - **Mago:** Conjurador de dano em área com *Orbe de Fogo*, *Nevasca Arcana* e *Meteoro do Apocalipse*.
   - **Ladino:** Assassino de agilidade com *Passo das Sombras*, *Golpe Dilacerante* e *Dança das Lâminas*.
   - **Arqueiro:** Atirador de precisão com *Tiro Perfurante*, *Chuva de Flechas* e *Flecha da Fenda*.
   - **Clérigo:** Suporte de sobrevivência com *Luz Sagrada*, *Círculo de Cura* e *Julgamento Divino*.
   - **Cavaleiro:** Guardião blindado com *Esmagar*, *Barreira Inabalável* e *Baluarte dos Reis*.
2. **Combate Avançado & Sistema de Combos:**
   - **Combo de 3 Golpes (3-Hit Combo Chain):**
     - *Hit 1 (Ataque Básico):* Corte frontal rápido.
     - *Hit 2 (Varrer Lateral):* Arco ampliado com +18% de dano e rastro de vento.
     - *Hit 3 (Finalizador Devastador):* Impacto crítico com +60% de dano extra, efeito de onda de choque dourada e **Screen Shake (Abalo de Câmera)**.
3. **Árvore de Talentos & Progressão:**
   - Ganho de XP balanceado por raridade de monstro (`comum`, `elite`, `boss`).
   - Árvore de talentos passivos (vigor, foco, aço temperado, maestria elemental).
   - Sistema de perda de XP balanceada ao morrer (com janela de renascimento seguro e graça temporária).
4. **Modo Automático Inteligente (Tecla Z):**
   - Sistema de automação que detecta inimigos próximos, persegue alvos, executa combos e coleta itens caídos automaticamente.

---

### 👹 2.4 Monstros & Chefes Épicos
1. **Bestiário Variado:**
   - Mais de 15 tipos de monstros e slimes temáticos com IA de aproximação, alcance de aggro e recuo (`monster_snail_beast`, `monster_skeleton_warrior`, `monster_void_serpent`, slimes elementais, etc.).
2. **Guardião da Raiz Cinzenta (Boss da Região 1):**
   - Fase 1 com pose direcional em 8 direções e corrida animada.
   - Fase 2 Enfurecida (abaixo de 50% de HP): Rugido, salto sísmico, convocação de sombras e raízes espinhosas que brotam do solo.
3. **Lorde das Cinzas / Colosso de Magma e Obsidiana (Gerado via Spriterrific):**
   - Personagem gigante de 156px com textura de obsidiana e veias de lava incandescente.
   - Animação de `idle` contínua (10 frames, respiração pesada de lava).
   - Animação de `attack` sísmico (8 frames, erguer de punhos duplos e esmagamento com tremor de tela).
   - Atribuído como Boss titular da Região 3 (*Colosso da Fornalha Rubra*) e Boss do Andar 5 das Catacumbas (*Lorde de Magma Ignis*).

---

### 🎒 2.5 Inventário, Armas & Economia
1. **Inventário & Equipamentos:**
   - 36 slots de inventário organizados com tooltip dinâmico de atributos e raridade.
   - Armas da coleção *Swordtember* integradas com ícones em pixel art para cada tipo de lâmina.
   - Consumíveis (poções de vida, frascos de mana, elixires de força).
2. **Coleta de Recursos & Baús:**
   - Veios de minério no mapa (cobre, ferro, ametista, bloodstone, astral) com animação de picareta e respawn.
   - Baús de madeira, baús espectrais e baús com espinhos que concedem equipamentos e ouro.
3. **Mercado & Mercador:**
   - Interface de compra e venda de itens, gemas e matérias-primas por ouro.

---

### 🔊 2.6 Sistema de Áudio Sem Dependências Externas
- Módulo `audio.js` desenvolvido inteiramente em **Web Audio API** nativa.
- Síntese acústica em tempo real para:
  - Golpes de espada e cortes de vento.
  - Impactos críticos e explosões de choque.
  - Passos sobre pedra, grama e lama.
  - Disparos arcanos e habilidades de cura.
  - Rugido enfurecido de chefes com modulação de baixa frequência.

---

## 🛠️ 3. Ferramentas & Utilitários Disponíveis no Repositório

| Ferramenta / Script | Localização | Função Principal |
|---|---|---|
| **Spriterrific Cloud API** | `.agents/skills/spriterrific-api/SKILL.md` | Skill do agente para gerar personagens e animações de pixel art via nuvem (210 créditos disponíveis). |
| **Gerador de Boss Spriterrific** | `tools/generate_spriterrific_boss.mjs` | Script Node.js que envia o prompt do personagem, monitora a fila e salva os artefatos. |
| **Downloader de Artefatos** | `tools/download_boss_artifacts.mjs` | Faz o download de spritesheets, GIFs de preview e manifests JSON a partir da CDN R2. |
| **Importador de Mapas TMX** | `tools/import_dungeon_tmx.mjs` | Lê mapas XML `.tmx` do Tiled, costura os tilesets com `sharp` e extrai posições de tochas e armadilhas. |
| **Compositor de NPCs** | `tools/composite_mana_seed_npcs.mjs` | Compõe spritesheets de personagens e NPCs a partir das camadas de paperdoll da Mana Seed. |
| **Processador de Adereços** | `tools/process_castle_props.mjs` | Recorta tocheiros, estantes e estátuas a partir de folhas de spritesheets brutas. |
| **Injetor de Ícones e Espadas** | `tools/apply_skill_icons_and_inventory_swords.mjs` | Corta e alinha ícones de habilidades e armas do Swordtember no inventário. |
| **Servidor Local de Testes** | `tools/server.mjs` | Servidor web HTTP local com suporte completo a ESM e cabeçalhos CORS. |
| **Build para Produção** | `tools/build-pages.mjs` | Empacota os arquivos estáticos e otimiza para publicação em Cloudflare Pages / Vercel. |
| **Pasta de Exemplos Tiled** | `d:/Game/examples/` | Contém mapas de exemplo TMX (deserto, esgotos, isométricos) e bibliotecas Python de automapping. |

---

## 🎨 4. Banco de Recursos Brutos Prontos para Uso (`assests e sprites/`)

* **`Houses_Pack`:** Dezenas de casas medievais, armazéns, moinhos, interiores mobiliados, mesas, camas, lareiras e balcões de taverna.
* **`craftpix-net-169442-...-pixel-dungeon`:** Tilesets de masmorras góticas, grades de ferro, celas de prisão, líquidos cáusticos e esqueletos decorativos.
* **`FREE Mana Seed Character Base Demo 2.0`:** Bases completas de animação de personagens em 8 direções (parado, andando, correndo, atacando com espada, arco e cajado).
* **`Free-Undead-Skill-Pixel-Art-Icons`:** Mais de 50 ícones de habilidades necromânticas e sombrias (crânios em chamas, foices, pactos de sangue).
* **`Hedgys_Swordtember_2026_File.png` & Arquivos Anteriores:** Mais de 60 espadas fantásticas com temas celestiais, abissais, vulcânicos e elementais.
* **`mana seed seasonal forest sample (summer)`:** Vegetação exuberante, árvores gigantes de carvalho, lagos, flores e desníveis de terreno.

---

## 🗺️ 5. Próximas Etapas: O Que Falta & O Que Pretendemos Fazer

Este é o plano mestre ordenado por prioridade de impacto para transformar **Terra das Cinzas** em uma experiência completa e inesquecível.

### 📍 Fase 1: Interiores Funcionais de Edifícios (Vilarejo Vivo)
- [ ] **Transição de Entrada em Casas:** Adicionar detecção nas portas dos 6 edifícios do vilarejo para transicionar o jogador para o mapa interno do edifício.
- [ ] **Interior da Taverna das Brasas:**
  - Balcão com o NPC Taverneiro (venda de comidas e bebidas que concedem buffs temporários de ataque e regeneração).
  - Quartos no andar superior para descansar e recuperar 100% de vida e mana.
  - Minigame de dados ou cartas com apostas em ouro contra outros frequentadores.
- [ ] **Interior da Ferraria:**
  - Forja e bigorna interativas: sistema de aprimoramento (+1, +2, +3) de armas e armaduras usando minérios minerados no mundo.
- [ ] **Interior do Boticário:**
  - Caldeirão de alquimia para transformar ervas colhidas no pântano e essências de monstros em poções especiais.

---

### 📍 Fase 2: Sistema Visual Paperdoll Completo (Mana Seed)
- [ ] **Animações em 8 Direções para o Herói:**
  - Usar os assets da pasta `FREE Mana Seed Character Base Demo 2.0` para substituir os sprites simples por animações completas de 8 direções (andar, correr, rolar/dash, atacar e conjurar).
- [ ] **Equipamento Visual Dinâmico:**
  - Quando o jogador equipar uma espada do *Swordtember* ou uma armadura diferente, o sprite do herói no mundo atualizará visualmente para refletir o equipamento.

---

### 📍 Fase 3: Novos Chefes & Animações com os Créditos Spriterrific Restantes
- [ ] **Saldo Disponível:** 210 créditos na API Spriterrific.
- [ ] **Criação do Chefe do Pântano (Região 2):**
  - Gerar o **Leviatã das Brumas / Serpente do Vazio** ou **Négrim, o Lich das Sombras** com animação de conjuração mágica.
- [ ] **Ações Adicionais para o Colosso de Magma:**
  - Adicionar a animação de reação a dano (`hurt`) ou animação de derrota colossal (`death`).

---

### 📍 Fase 4: Masmorras Infinitas & Modo Sobrevivência (Rogue-lite)
- [ ] **Gerador Procedural de Salas:**
  - Além da sala fixa da CraftPix, implementar um gerador procedural que combina blocos de salas, corredores e salas de tesouro infinitamente.
- [ ] **Modo Pesadelo:**
  - Andares acima do 10 com modificadores de masmorra (chão de lava, monstros com aura elétrica, escuridão com tocha portátil necessária).

---

### 📍 Fase 5: Sistema de Companheiros (Pets & Montarias)
- [x] **Corvo das Cinzas (Companion Pet Ativo):**
  - Implementado no motor principal com animações de vôo e repouso (`crow_fly_strip.png` e `crow_idle_strip.png`).
  - O mascote segue o herói no ar, projeta sombra no solo e voa autonomamente até moedas de ouro e cristais caídos em até 300px para recolhê-los instantaneamente para o inventário com partículas douradas e som acústico.
- [ ] **Outros Pets Colecionáveis:**
  - Slime Amigável e Lobo Espectral (habilidades de ataque de suporte contra monstros próximos).
- [ ] **Montarias:**
  - Cavalo de Guerra ou Fera Vulcânica para aumentar a velocidade de locomoção no mapa aberto em 60%.

---

### 📍 Fase 6: Trilha Sonora Polifônica & Atmosfera
- [ ] **Trilha Musical Chiptune/Sintetizada:**
  - Desenvolver temas musicais contínuos em Web Audio API ou loops em áudio para cada uma das 5 regiões e momentos de tensão de chefe.
- [ ] **Efeitos Climáticos Dinâmicos:**
  - Chuva fina no Bosque, névoa densa no Pântano, tempestade de cinzas nas Montanhas Rubras e chuva de meteoros no Trono do Eclipse.

---

### 📍 Fase 7: Publicação & Salvamento em Nuvem
- [ ] **Deploy Automático:** Publicação contínua via GitHub Actions para Cloudflare Pages ou GitHub Pages.
- [ ] **Sincronização de Save:** Opção de exportar/importar código de save ou sincronização opcional com Supabase/Firebase.

---

*Documento gerado e mantido pela equipe de desenvolvimento de Terra das Cinzas.*  
*Última atualização: Outubro de 2026.*
