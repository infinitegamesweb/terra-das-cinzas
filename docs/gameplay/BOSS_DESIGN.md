# Design e Mecânicas de Chefes (Bosses) — Guerra das Cinzas

**Documento:** `docs/gameplay/BOSS_DESIGN.md`  
**Escopo:** Identidade, Fases de Combate, Telegraphs, Enrage e Recompensas das 30 Regiões  
**Alinhamento:** `docs/gameplay/COMBAT_AUDIT.md` & Master Plan (Fase 08 / Prompts 16 e 17)

---

## 1. Princípios de Design de Encontros Memoráveis

1. **Combate Reativo, Não Esponja de HP:** Chefes não devem apenas ter 8x mais vida; eles devem ditar o ritmo da batalha com ataques telegrafados, mudanças de padrão por fase de vida e penalidades para erros de posicionamento.
2. **Estrutura de Fases Padronizada:**
   - **Fase 1 (100% – 60% HP):** Apresentação do tema do chefe. Ataques básicos, investidas simples e tempo generoso entre windups.
   - **Fase 2 (59% – 25% HP):** Escalada de agressividade. Invocação de lacaios do bioma, habilidades de área (AoE) e redução de tempo de recarga.
   - **Fase 3 / Enrage (< 25% HP):** O chefe canaliza o poder primordial das cinzas. Velocidade aumentada em 25%, aura de dano contínuo e necessidade de finalização rápida.
3. **Telegraphs Claros:** Indicadores no solo com cores consistentes antes da liberação do impacto:
   - Vermelho (`#dc2626`): Dano físico pesado ou explosão de fogo.
   - Roxo (`#a855f7`): Vórtice gravitacional ou corrupção do vazio.
   - Ciano (`#38bdf8`): Congelamento ou estilhaços perfurantes.

---

## 2. Catálogo Estruturado de Chefes por Modo de Jogo

### 2.1 MODO NORMAL (Regiões 00 a 06 — Níveis 1 a 60)

#### 00. Guardião das Cinzas (Hub do Castelo — Nv. 1 a 300 / Sparring)
- **Função:** Treinador e teste de dano (Dummy avançado).
- **Ataques:** Golpe de escudo frontal, salto com onda de choque sutil.
- **Telegraph:** Círculo âmbar no chão (1.2s de aviso).
- **Fases:** Sem enrage letal. Concede feedback de DPS ao errante.

#### 01. Guardião da Raiz Cinzenta (Bosque das Ruínas — Nv. 10)
- **Identidade & Lore:** Um espírito ancestral da floresta tomado pela fuligem do cataclismo.
- **Ataques:**
  - *Chicote de Raiz:* Linha reta de vinhas espinhosas (alcance 160px).
  - *Esmagamento de Tronco:* Salto com impacto em cone de 90°.
- **Fase 2 (50% HP):** Invoca 2 *Slimes Verdes* e faz brotar raízes perigosas nos cantos da clareira.
- **Enrage (15% HP):** Ganha espinhos de madeira negra (+30% dano ao toque).
- **Recompensa:** Núcleo da Raiz Cinzenta, Poções de Cura, Equipamento Incomum do Bosque.

#### 02. Eco Antigo de Miraluz (Clareira dos Ecos — Nv. 20)
- **Identidade & Lore:** Ressonância fantasmagórica dos antigos sacerdotes do templo destruído.
- **Mecânicas:**
  - *Projéteis Espectrais:* 3 esferas de mana que teleguiam suavemente em direção ao jogador.
  - *Vórtice Silencioso:* Área circular central que suga o herói se ele se afastar demais.
- **Recompensa:** Essência Ectoplásmica, Anel de Prata Rúnica.

#### 03. Serpente Afogada (Margem Afogada — Nv. 30)
- **Identidade & Lore:** Criatura abissal anfíbia que rasteja sob as águas escuras do pântano.
- **Mecânicas:**
  - *Mergulho & Emboscada:* Desaparece na lama por 2s e ressurge sob os pés do herói.
  - *Jato Tóxico:* Cone frontal de veneno verde que aplica debuff de dano contínuo.
- **Recompensa:** Escamas Venenosas, Botas de Couro Tratado.

#### 04. Aparição dos Pântanos (Pântano Espectral — Nv. 40)
- **Mecânicas:** Teletransporte com névoa roxa e clones ilusórios com 1 HP que absorvem mira automática.
- **Recompensa:** Véu dos Pântanos, Amuleto Arcano de Jade.

#### 05. Fera do Vento Gélido (Trilha do Degelo — Nv. 50)
- **Mecânicas:** Uivo glacial que reduz velocidade de movimento em 40% e investida rápida em linha reta.
- **Recompensa:** Presa Glacial, Capa Térmica de Lobo.

#### 06. Colosso de Fogo Primordial (Montanhas Rubras — Nv. 60)
- **Mecânicas:** Poças de lava permanentes que bloqueiam 20% da arena; chuva de meteoritos menores.
- **Recompensa:** Coração de Magma, Machado Incandescente.

---

### 2.2 MODO DIFÍCIL (Regiões 07 a 13 — Níveis 70 a 130)

#### 07. Guardião de Pedra Quebrada (Portão Partido — Nv. 70)
- **Mecânicas:** Armadura de pedra que reduz todo o dano físico sofrido em 50% até ser atordoado por skills de controle (Slot 2).

#### 08. Senhor das Chamas Eternas (Torre das Brasas — Nv. 80)
- **Mecânicas:** Ondas circulares de fogo em 360° em intervalos fixos de 6 segundos.

#### 09. Espectro do Crepúsculo (Campos Crepusculares — Nv. 90)
- **Mecânicas:** Zona de penumbra que ofusca a visão do jogador, exigindo proximidade para causar dano.

#### 10. Verme Abissal do Vazio (Cavernas do Vazio — Nv. 100)
- **Mecânicas:** Escava o solo e gera 4 fissuras subterrâneas com colapso de estalactites.

#### 11. Titã Mecânico de Ferro (Labirinto de Ferro — Nv. 110)
- **Mecânicas:** Brocas rotativas frontais e escudo refletor que rebate projéteis se atacado pela frente.

#### 12. Ferreiro das Forjas Sombrias (Forjas Malditas — Nv. 120)
- **Mecânicas:** Martela uma bigorna central gerando calor escaldante em toda a sala; invoca golens de escória.

#### 13. Devorador das Sombras (Abismo Sombrio — Nv. 130)
- **Mecânicas:** Vórtice negro central que reduz a iluminação e devora buffs de velocidade do herói.

---

### 2.3 MODO PESADELO (Regiões 14 a 19 — Níveis 140 a 190)

#### 14. Guardião das Almas Esquecidas (Cripta Eterna — Nv. 140)
- **Mecânicas:** Invoca espíritos condenados que caminham em direção ao chefe para curá-lo se não forem destruídos a tempo.

#### 15. Ent Corrompido da Escuridão (Floresta Amaldiçoada — Nv. 150)
- **Mecânicas:** Raízes parasitas que drenam mana/energia do jogador e impedem conjuração de habilidades supremas.

#### 16. Vigilante dos Céus Esquecidos (Torres do Esquecimento — Nv. 160)
- **Mecânicas:** Disparo de feixes de luz celestial com 0.8s de aviso; rajadas de vento descendente.

#### 17. Leviatã de Poeira e Fogo (Mar de Cinzas — Nv. 170)
- **Mecânicas:** Tempestade de areia abrasiva que causa dano constante por segundo fora das zonas seguras de pedra.

#### 18. Avatar do Fogo Primordial (Núcleo do Vulcão — Nv. 180)
- **Mecânicas:** Erupções vulcânicas cruzadas no chão; erupção em X e em cruz simultânea na fase final.

#### 19. Arauto da Ruína Final (Altar do Caos — Nv. 190)
- **Mecânicas:** Altera a gravidade da arena e inverte os controles direcionais por 2.5s após canalização rúnica.

---

### 2.4 MODO BRASA (Regiões 20 a 25 — Níveis 200 a 250)

#### 20. Monarca Incandescente (Planalto Incandescente — Nv. 200)
- **Mecânicas:** Trono flamejante; invoca lanceiros de brasas e projeta lâminas de fogo em espiral.

#### 21. Wyrm de Magma Furioso (Rio de Magma — Nv. 210)
- **Mecânicas:** Divide a sala com um rastro incandescente intransponível sem sofrer dano severo de queimadura.

#### 22. Espectro do Rei Caído (Cidade Fantasma — Nv. 220)
- **Mecânicas:** Invoca uma corte de fantasmas reais e desafia o herói com maldições de declínio de atributos.

#### 23. Terror das Areias Escuras (Pico dos Condenados — Nv. 230)
- **Mecânicas:** Redemoinhos móveis de areia negra que engolem projéteis e empurram o herói contra abismos.

#### 24. General Vharok, o Flagelo (Domínio de Vharok — Nv. 240)
- **Mecânicas:** Golpe de espada colossal que parte o chão com fissuras flamejantes; salto devastador com dano global na arena.

#### 25. Guardião da Primeira Chama (Câmara do Primeiro Fogo — Nv. 250)
- **Mecânicas:** Protegido por 3 chamas orbitais que devem ser extintas com dano elemental para quebrar sua invulnerabilidade.

---

### 2.5 MODO CINZAS (Regiões 26 a 29 — Níveis 260 a 300 — Ápice)

#### 26. Eclipse Supremo (Véu do Eclipse Final — Nv. 260)
- **Mecânicas:** Fase de escuridão total com apenas um círculo iluminado ao redor do herói; monstros das sombras atacam das bordas escuras.

#### 27. Tecelão das Sombras Cósmicas (Dimensão das Sombras — Nv. 270)
- **Mecânicas:** Fios cósmicos que amarram o jogador se ele se mover de forma descuidada; teletransporte instantâneo.

#### 28. Avatar do Vazio Supremo (Coração do Vazio — Nv. 280)
- **Mecânicas:** Singularidade negra no centro da arena que puxa gradualmente tudo ao seu redor; ondas de colapso cósmico periódicas.

#### 29. Soberano da Terra das Cinzas (Terra das Cinzas Eternas — Nv. 300 — Chefe Final)
- **Identidade & Lore:** A encarnação primordial do fogo original e das cinzas eternas, guardião do trono supremo do mundo.
- **Fase 1 (100%–75%):** Ataques físicos de espada de duas mãos forjada na chama primária, corte duplo e estocada com rastro de brasa.
- **Fase 2 (74%–40%):** Abertura de fissuras no mapa inteiro; chuva contínua de meteoros de obsidiana; invoca avatares menores das cinzas.
- **Fase 3 (39%–10%):** O Soberano funde fogo e vazio cósmico. Seus golpes geram ondas concêntricas duplas de choque.
- **Fase 4 / Enrage (<10%):** Tempestade cataclísmica de cinzas com pulso a cada 3s. Batalha de pura corrida contra o tempo (DPS check).
- **Recompensas Finais:** Título de *Conquistador das Cinzas*, Coroa do Soberano Supremo, Equipamentos Míticos e Desbloqueio do Modo Legado.
