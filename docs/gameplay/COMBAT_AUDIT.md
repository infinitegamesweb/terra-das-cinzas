# Auditoria do Sistema de Combate — Guerra das Cinzas

**Documento:** `docs/gameplay/COMBAT_AUDIT.md`  
**Escopo:** Mapeamento Integral de Fórmulas, Entidades, IA, Bosses, Escalamento e Desequilíbrios  
**Status:** Análise Estática & Dinâmica (Master Plan — Fase 07 / Prompt 14)

---

## 1. Mapeamento da Entidade do Jogador (Player)

### 1.1 Atributos e Fórmulas Base
- **HP Máximo:**
  - Fórmula: `hp_base + (level - 1) * hpPerLevel + bonuses.hp`
  - Valores por Classe (Nível 1):
    - Guerreiro: `120 HP` (+14/nível) -> Nível 300: `4.306 HP`
    - Bárbaro: `145 HP` (+18/nível) -> Nível 300: `5.527 HP`
    - Clérigo: `130 HP` (+15/nível) -> Nível 300: `4.615 HP`
    - Arqueiro: `108 HP` (+12/nível) -> Nível 300: `3.696 HP`
    - Assassino: `104 HP` (+11/nível) -> Nível 300: `3.393 HP`
    - Mago: `100 HP` (+10/nível) -> Nível 300: `3.090 HP`
- **Armadura e Redução de Dano:**
  - Guerreiro/Bárbaro: 2 (+ bônus de equipamentos).
  - Clérigo/Arqueiro: 1.
  - Assassino/Mago: 0.
  - Mitigação: Aplicada como subtração direta ou porcentagem fracionária, com vulnerabilidade aguda de classes frágeis em níveis altos.
- **Dano Físico e Arcano:**
  - Físico: `(8 + level * 1.25 + (weaponEquipped ? 10 + weaponTier * 8 : 0)) * cls.melee`
  - Arcano: `(18 + level * 1.7) * cls.arcane`
- **Crítico:**
  - Chance varia de 5% (Clérigo) a 18% (Assassino).
  - Multiplicador crítico: de 1.5x a 1.7x.

### 1.2 Habilidades e Cooldowns (Slots 1 a 6)
- **Slot 1 (Ação Rápida / Poção):** Recarga de 1.5s a 3.0s. Consumo de poção restaura percentual de vida.
- **Slot 2 (Habilidade de Controle):** Cooldown 4s a 6s. Interrupção, atordoamento ou retardo.
- **Slot 3 & 4 (Especiais de Classe):** Disparos múltiplos, estocadas ou escudos temporários.
- **Slot 5 (Habilidade de Área / AoE):** Cooldown 7s a 9s.
  - Guerreiro (Vórtice de Aço / 8s): Sangramento e corte 360°.
  - Arqueiro (Chuva de Flechas / 8s): Saraivada de longo alcance.
  - Assassino (Dança das Sombras / 7s): Zigue-zague com dano crítico garantido.
  - Bárbaro (Fenda Sísmica / 9s): Cone com repulsão.
  - Clérigo (Julgamento Sagrado / 9s): Luz celeste e autocura.
  - Mago (Tempestade de Meteoros / 9s): Chuva em área com fogo persistente.
- **Slot 6 (Habilidade Suprema / Ultimate):** Cooldown 20s a 26s.
  - Mago (Supernova do Vazio / 24s): Atração gravitacional e colapso cósmico (3.4x dano arcano).
  - Arqueiro (Flecha do Dragão / 22s): Projétil perfurante retilíneo (3.6x dano crítico).
  - Assassino (Execução Fantasma / 20s): 5 cortes consecutivos individuais.
  - Bárbaro (Ira Implacável / 25s): Berserker com velocidade e roubo de vida.
  - Guerreiro (Fúria do Titã / 24s): Onda de choque e imunidade temporária.
  - Clérigo (Avatar da Luz / 26s): Cura instantânea total e barreira sagrada.

---

## 2. Mapeamento de Inimigos Comuns (Enemy Mobs)

- **Geração e Escalamento:**
  - Nível do mob definido por `R(area.min, area.max + 1)` delimitado pela região.
  - Vida: `region.hp * Math.pow(1.035, level - region.min) * (golem ? 1.15 : 1)`.
  - Velocidade de Movimento: `sp` baseada na região (reduzida em 30% a 38% para monstros pesados e bosses).
- **Inteligência Artificial (IA):**
  - Estados: `Patrulha` (movimento em torno da posição de origem `ox, oy`), `Aggro` (perseguição direta quando a distância do herói é menor que 220px) e `Windup` (preparação de ataque com aviso visual e atraso de 400ms a 700ms).
  - Ataque do Mob: Colisão de alcance curto com teste de tempo de recarga (`now - mob.hit > cooldown`).

---

## 3. Mapeamento dos Chefes (Bosses)

- **Características:**
  - Multiplicador de vida: 8x em relação a monstros comuns da mesma região.
  - Velocidade: 62% da velocidade regional para permitir kite e posicionamento tático.
- **Mecânicas Observadas:**
  - Pisotão / Onda de Choque: Disparo radial de projéteis ou círculos de dano (`BossAnimation.js` e `parts`).
  - Falta de transição formal em fases com gatilhos de HP (ex: aos 75%, 50%, 25%). Atualmente, o chefe apenas ataca em loop contínuo até ser derrotado.

---

## 4. Diagnóstico de Fórmulas e Desequilíbrios Críticos

### 4.1 Descompasso de Dano vs Vida no End-Game (Níveis 200 a 300)
- O escalamento de dano físico base é linear: `8 + level * 1.25`. No nível 300, sem armas supremas, o ataque base do jogador atinge apenas ~383 de dano.
- O dano arcano progride a `18 + level * 1.7`, resultando em ~528 de dano no nível 300.
- A disparidade faz com que magos causem quase 40% mais dano que combatentes corpo a corpo em níveis elevados se não houver armas lendárias compensatórias equipadas.

### 4.2 Defesa sem Escalonamento Porcentual (Problema do Tanque)
- A armadura concede mitigação estática. Conforme o dano dos monstros escala em regiões de pesadelo (14–19) e brasa (20–25), heróis de armadura leve (Mago e Assassino) sofrem golpes que podem esvaziar mais de 60% do seu HP total em dois acertos seguidos se não esquivarem.

### 4.3 Skills com Cooldown Sub-utilizado
- No modo automático (`autoPlay = true`), o loop do jogo prioriza ataques básicos e só dispara habilidades se o alvo estiver vivo e dentro da área. O tempo de recarga de habilidades de 24s (Supremas) quase nunca é otimizado pela IA do modo automático, que costuma usá-las em monstros comuns fracos instantes antes do chefe.

### 4.4 Vulnerabilidade a Exploits
- **Kite Infinito de Longo Alcance:** Arqueiros com alcance de 140px a 200px conseguem alvejar monstros cuja velocidade (`sp`) seja menor que a do jogador, eliminando oponentes sem sofrer um único golpe antes que eles entrem no estado de agressão.
- **Trava de Paredes/Colisão:** Ao atrair monstros para a quina do mapa ou obstáculos de terreno decorativo, o cálculo simples de vetor (`dx, dy`) faz o mob ficar preso tentando caminhar em linha reta contra a pedra.

---

## 5. Diretrizes para o Plano de Balanceamento (Fase 07 / Prompt 15)

1. Ajustar os multiplicadores de dano das 6 classes para manter identidades contrastantes:
   - **Guerreiro:** O sustentador implacável (defesa alta, dano consistente).
   - **Arqueiro:** O sniper de precisão (crítico alto, alcance seguro, frágil em corpo a corpo).
   - **Assassino:** Dano de explosão (burst puro, crítico massivo, glass cannon).
   - **Bárbaro:** Vida massiva, auto-cura e dano pesado em área.
   - **Clérigo:** Sobrevivência em grupo, controle sagrado e suporte sustentável.
   - **Mago:** Dano em área absoluto e controle elemental, vulnerável a investidas.
2. Definir tabelas de marcos para os níveis 1, 10, 30, 60, 100, 140, 200, 260 e 300 em `docs/gameplay/COMBAT_BALANCE_PLAN.md`.
