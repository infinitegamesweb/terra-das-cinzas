# Auditoria Completa de Assets — Terra das Cinzas

**Data da Auditoria**: 2026-10-06  
**Localização Oficial**: `public/assets/`  
**Total de Arquivos de Assets**: ~7.200 arquivos  

---

## 1. Distribuição de Pastas e Finalidades

| Pasta | Total de Arquivos | Formatos | Finalidade no Jogo | Estado |
|---|---|---|---|---|
| `assets/characters/` | 1.378 | PNG, JSON | Personagens jogáveis (6 classes), rotações 8 direções e walk cycles | Ativo |
| `assets/items/` | 5.038 | PNG | Armas, armaduras, escudos, poções, minérios e moedas | Ativo |
| `assets/ui/` | 161 | PNG, SVG | Molduras de interface, ícones de atributos, botões e barras | Ativo |
| `assets/props/` | 148 | PNG | Casas, baús de ouro/madeira, veios de minério e barris | Ativo |
| `assets/maps/` | 137 | PNG | Tilesets de biomas, mapas de dungeons 1 a 5 e piso do castelo | Ativo |
| `assets/monsters/` | 132 | PNG | Monstros comuns, slimes e bosses com strips de animação | Ativo |
| `assets/icons/` | 89 | PNG, SVG | Ícones de habilidades gerais e heróicas das 6 classes | Ativo |
| `assets/effects/` | 32 | PNG | Animações de corte (slash VFX em 4 direções) e magias | Ativo |
| `assets/world/` | 29 | PNG | Elementos da natureza, árvores antigas, rochas e arbustos | Ativo |
| `assets/projectiles/` | 16 | PNG | Projéteis de arco e magias arcanas em 8 direções | Ativo |
| `assets/regions/` | 13 | PNG | Miniaturas 16:9 pixel art das regiões do mundo | Ativo |
| `assets/dungeon/` | 11 | PNG | Spritesheets de tochas e armadilhas de espinhos | Ativo |
| `assets/equipment/` | 0 | - | Pasta reservada para futuros avatares equipáveis | Vazio |
| `assets/sprites/` | 0 | - | Pasta reservada | Vazio |

---

## 2. Resolução, Escala e Padrões de Pixel Art

* **Personagens**:
  - Resolução nativa: **48 × 48 px**.
  - Formato: RGBA com canal alpha limpo.
  - Pivô: Centro inferior (`x: 24, y: 47`).
  - Escala de renderização no Canvas: 1.32× a 1.36× (aumentada para 1.65× em buffs de suprema).
* **Miniaturas de Regiões**:
  - Resolução nativa: Proporção 16:9 (160×90 até 512×288 px).
  - Paleta: Dark fantasy medieval sombria com acentos mágicos.
* **Projéteis e Ícones de Habilidades**:
  - Ícones: 32×32 px e 48×48 px.
  - Projéteis: 32×32 px em 8 direções nominais (`south`, `north`, `east`, `west`, etc.).

---

## 3. Próximas Necessidades de Assets (Fase 04 e 05)

1. **Expansão de Regiões**:
   - Atualmente 13 miniaturas estão mapeadas (`region_00.png` a `region_12.png`).
   - Para a jornada completa até o nível 300 (30 regiões), será necessário produzir e mapear de `region_13.png` a `region_29.png` seguindo os prompts detalhados em `PROMPTALPHA/LEAI OS PROMPTS.txt`.
