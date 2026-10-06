# Plano de Balanceamento do Combate — Guerra das Cinzas

**Documento:** `docs/gameplay/COMBAT_BALANCE_PLAN.md`  
**Base:** Diagnóstico de `docs/gameplay/COMBAT_AUDIT.md`  
**Objetivo:** Preservar a assimetria e a forte identidade de cada uma das 6 classes ao longo de 9 marcos da progressão (Nível 1 ao 300).  
**Status:** Proposta de Engenharia e Design (Master Plan — Fase 07 / Prompt 15). *Não implementado no código nesta etapa.*

---

## 1. Filosofia de Design e Papel de Cada Classe

O equilíbrio de *Guerra das Cinzas* não busca homogeneização numérica, mas relevância situacional e sensação de poder distinta:

1. **Guerreiro (O Baluarte de Ferro):** Alta armadura nativa, vida consistente e mitigação de golpes pesados. Dano contínuo e confiável.
2. **Arqueiro (O Olho de Falcão):** Maior alcance do jogo, alto multiplicador de acerto crítico e capacidade de eliminar alvos prioritários antes do engajamento.
3. **Assassino (A Foice das Sombras):** Maior taxa de crítico e dano explosivo (burst). Extremamente letal contra alvos individuais, mas punido severamente por erros de posicionamento.
4. **Bárbaro (A Fúria Titânica):** Maior reserva de HP e roubo de vida. Dano devastador que aumenta à medida que sua própria vida diminui.
5. **Clérigo (O Farol Sagrado):** Grande sustentação própria e de grupo, dano misto e barreiras que neutralizam mecânicas de morte súbita de chefes.
6. **Mago (O Tecelão do Vazio):** Campeão indiscutível de dano em área (AoE) e controle elemental de multidões. Defesa física nula compensada por aniquilação à distância.

---

## 2. Tabelas Canônicas de Progressão por Marco de Nível

### Marco 1 — Nível 1 (O Despertar nas Ruínas)

| Classe | HP | Dano Base | Armadura | Poder Arcano | Chance Crítica | Dano Habilidade (Q/5) | Recarga Suprema (R/6) |
|---|---|---|---|---|---|---|---|
| **Guerreiro** | 120 | 19 | 4 | 20 | 6% | 37 (Vórtice) | 24s |
| **Arqueiro**  | 108 | 21 | 2 | 21 | 12% | 42 (Chuva) | 22s |
| **Assassino** | 104 | 23 | 1 | 18 | 18% | 45 (Dança) | 20s |
| **Bárbaro**   | 145 | 21 | 3 | 16 | 8% | 46 (Fenda) | 25s |
| **Clérigo**   | 130 | 17 | 3 | 22 | 5% | 38 (Julgamento) | 26s |
| **Mago**      | 100 | 15 | 0 | 29 | 8% | 55 (Meteoros) | 24s |

---

### Marco 2 — Nível 10 (Consolidação do Bosque)

| Classe | HP | Dano Base | Armadura | Poder Arcano | Chance Crítica | Dano Habilidade (Q/5) | Recarga Suprema (R/6) |
|---|---|---|---|---|---|---|---|
| **Guerreiro** | 246 | 31 | 8 | 35 | 7% | 60 | 24s |
| **Arqueiro**  | 216 | 33 | 4 | 38 | 13% | 68 | 22s |
| **Assassino** | 203 | 37 | 2 | 32 | 19% | 74 | 20s |
| **Bárbaro**   | 307 | 34 | 6 | 28 | 9% | 73 | 25s |
| **Clérigo**   | 265 | 28 | 5 | 40 | 6% | 62 | 26s |
| **Mago**      | 190 | 24 | 1 | 51 | 9% | 88 | 24s |

---

### Marco 3 — Nível 30 (Transição para o Portão Partido)

| Classe | HP | Dano Base | Armadura | Poder Arcano | Chance Crítica | Dano Habilidade (Q/5) | Recarga Suprema (R/6) |
|---|---|---|---|---|---|---|---|
| **Guerreiro** | 526 | 56 | 16 | 69 | 8% | 110 | 24s |
| **Arqueiro**  | 456 | 60 | 8 | 75 | 15% | 125 | 22s |
| **Assassino** | 423 | 67 | 4 | 63 | 22% | 135 | 20s |
| **Bárbaro**   | 667 | 62 | 12 | 56 | 10% | 134 | 25s |
| **Clérigo**   | 565 | 50 | 10 | 78 | 7% | 112 | 26s |
| **Mago**      | 390 | 44 | 2 | 101 | 10% | 162 | 24s |

---

### Marco 4 — Nível 60 (Domínio do Labirinto de Ferro)

| Classe | HP | Dano Base | Armadura | Poder Arcano | Chance Crítica | Dano Habilidade (Q/5) | Recarga Suprema (R/6) |
|---|---|---|---|---|---|---|---|
| **Guerreiro** | 946 | 93 | 28 | 120 | 9% | 185 | 23s |
| **Arqueiro**  | 816 | 101 | 14 | 130 | 18% | 210 | 21s |
| **Assassino** | 753 | 112 | 8 | 108 | 26% | 225 | 19s |
| **Bárbaro**   | 1.207 | 105 | 21 | 96 | 12% | 226 | 24s |
| **Clérigo**   | 1.015 | 84 | 18 | 134 | 8% | 188 | 25s |
| **Mago**      | 690 | 73 | 4 | 175 | 12% | 272 | 23s |

---

### Marco 5 — Nível 100 (Incursão ao Altar do Caos)

| Classe | HP | Dano Base | Armadura | Poder Arcano | Chance Crítica | Dano Habilidade (Q/5) | Recarga Suprema (R/6) |
|---|---|---|---|---|---|---|---|
| **Guerreiro** | 1.506 | 143 | 44 | 188 | 10% | 285 | 22s |
| **Arqueiro**  | 1.296 | 154 | 22 | 203 | 22% | 322 | 20s |
| **Assassino** | 1.193 | 171 | 12 | 170 | 32% | 345 | 18s |
| **Bárbaro**   | 1.927 | 160 | 33 | 150 | 14% | 346 | 23s |
| **Clérigo**   | 1.615 | 129 | 28 | 210 | 9% | 289 | 24s |
| **Mago**      | 1.090 | 112 | 6 | 274 | 14% | 420 | 22s |

---

### Marco 6 — Nível 140 (Câmara do Primeiro Fogo)

| Classe | HP | Dano Base | Armadura | Poder Arcano | Chance Crítica | Dano Habilidade (Q/5) | Recarga Suprema (R/6) |
|---|---|---|---|---|---|---|---|
| **Guerreiro** | 2.066 | 193 | 60 | 256 | 12% | 385 | 22s |
| **Arqueiro**  | 1.776 | 208 | 30 | 276 | 26% | 435 | 20s |
| **Assassino** | 1.633 | 231 | 16 | 232 | 38% | 465 | 18s |
| **Bárbaro**   | 2.647 | 216 | 45 | 204 | 16% | 466 | 23s |
| **Clérigo**   | 2.215 | 174 | 38 | 286 | 10% | 390 | 24s |
| **Mago**      | 1.490 | 151 | 8 | 373 | 16% | 570 | 22s |

---

### Marco 7 — Nível 200 (Véu do Eclipse Final)

| Classe | HP | Dano Base | Armadura | Poder Arcano | Chance Crítica | Dano Habilidade (Q/5) | Recarga Suprema (R/6) |
|---|---|---|---|---|---|---|---|
| **Guerreiro** | 2.906 | 268 | 84 | 358 | 14% | 535 | 21s |
| **Arqueiro**  | 2.496 | 289 | 42 | 386 | 32% | 605 | 19s |
| **Assassino** | 2.293 | 321 | 22 | 324 | 46% | 645 | 17s |
| **Bárbaro**   | 3.727 | 300 | 63 | 285 | 18% | 647 | 22s |
| **Clérigo**   | 3.115 | 242 | 53 | 400 | 12% | 542 | 23s |
| **Mago**      | 2.090 | 210 | 11 | 522 | 18% | 794 | 21s |

---

### Marco 8 — Nível 260 (Dimensão das Sombras)

| Classe | HP | Dano Base | Armadura | Poder Arcano | Chance Crítica | Dano Habilidade (Q/5) | Recarga Suprema (R/6) |
|---|---|---|---|---|---|---|---|
| **Guerreiro** | 3.746 | 343 | 108 | 460 | 16% | 685 | 20s |
| **Arqueiro**  | 3.216 | 370 | 54 | 496 | 38% | 775 | 18s |
| **Assassino** | 2.953 | 411 | 28 | 416 | 54% | 825 | 16s |
| **Bárbaro**   | 4.807 | 384 | 81 | 366 | 20% | 828 | 21s |
| **Clérigo**   | 4.015 | 310 | 68 | 514 | 14% | 694 | 22s |
| **Mago**      | 2.690 | 269 | 14 | 671 | 20% | 1.018 | 20s |

---

### Marco 9 — Nível 300 (Terra das Cinzas Eternas — Ápice)

| Classe | HP | Dano Base | Armadura | Poder Arcano | Chance Crítica | Dano Habilidade (Q/5) | Recarga Suprema (R/6) |
|---|---|---|---|---|---|---|---|
| **Guerreiro** | 4.306 | 393 | 124 | 528 | 18% | 785 | 20s |
| **Arqueiro**  | 3.696 | 424 | 62 | 569 | 42% | 890 | 18s |
| **Assassino** | 3.393 | 471 | 32 | 477 | 60% | 945 | 16s |
| **Bárbaro**   | 5.527 | 440 | 93 | 420 | 22% | 949 | 21s |
| **Clérigo**   | 4.615 | 355 | 78 | 590 | 15% | 795 | 22s |
| **Mago**      | 3.090 | 308 | 16 | 770 | 22% | 1.168 | 20s |

---

## 3. Matriz Comparativa entre as Classes no Nível 300

```
Sobrevivência:   Bárbaro (5.5k HP) > Clérigo (4.6k) > Guerreiro (4.3k) > Arqueiro (3.7k) > Assassino (3.4k) > Mago (3.1k)
Defesa/Mitigação: Guerreiro (124) > Bárbaro (93) > Clérigo (78) > Arqueiro (62) > Assassino (32) > Mago (16)
Dano em Área:    Mago (1168) >>>>> Bárbaro (949) > Arqueiro (890) > Clérigo (795) > Guerreiro (785) > Assassino (945 foco)
Dano Explosão:   Assassino (471 base + 60% crit x 1.7) > Arqueiro (424 base + 42% crit) > Mago > Bárbaro > Guerreiro > Clérigo
Alcance Seguro:  Arqueiro (140-200px) > Mago (120-160px) > Clérigo (80px) > Guerreiro / Bárbaro / Assassino (corpo a corpo)
```

---

## 4. Recomendações de Transição Segura

- **Sem Mudanças Quebradas:** Não alterar as fórmulas existentes de supetão no código até a execução das fases de QA e teste empírico em ambiente local.
- **Progressão Linear Mantida:** Todas as classes mantêm seus arquétipos reconhecíveis, com valores coerentes entre o combate contra monstros de mundo aberto e os encontros de chefes de masmorra.
