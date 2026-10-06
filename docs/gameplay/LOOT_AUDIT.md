# Auditoria do Sistema de Saques (Loot & Drops) — Guerra das Cinzas

**Documento:** `docs/gameplay/LOOT_AUDIT.md`  
**Escopo:** Mapeamento de Probabilidades, Tabelas de Masmorras, Mineração, Bosses e Equipamentos  
**Alinhamento:** Master Plan (Fase 09 / Prompt 18)

---

## 1. Mapeamento das Tabelas de Probabilidade (Rarity Distribution)

O sistema de raridades é governado pela estrutura `RARITY` em `src/data/drops.data.js`:

| Raridade | Probabilidade Base (Mobs) | Multiplicador de Chefe (Boss ×5) | Chance Efetiva em Chefe | Cor / Identificador |
|---|---|---|---|---|
| **Comum** | 55.00% | Rebaixada | ~20.00% | `#9ca3af` (Cinza Claro) |
| **Incomum** | 28.00% | Rebaixada | ~35.00% | `#4ade80` (Verde Esmeralda) |
| **Raro** | 12.00% | 5× base | ~28.00% (cap) | `#60a5fa` (Azul Safira) |
| **Épico** | 4.00% | 5× base | ~20.00% | `#c084fc` (Roxo Ametista) |
| **Lendário** | 0.80% | 5× base | 4.00% | `#fbbf24` (Ouro Flamejante) |
| **Supremo** | 0.20% | 5× base | 1.00% | `#f43f5e` (Carmesim Primordial) |

---

## 2. Catálogo de Pools de Itens por Faixa de Masmorra

O catálogo `DUNGEON_ITEMS` organiza o saque em 10 níveis (`d1` a `d10`), alinhados com a jornada até o nível 300:

| Tabela | Faixa de Nível | Masmorras Associadas | Itens Notáveis |
|---|---|---|---|
| **d1** | Nv. 1 – 20 | Miraluz & Ecos | Espada de Ferro, Escudo da Raiz, Manto das Cinzas |
| **d2** | Nv. 21 – 40 | Margem Afogada & Pântano Espectral | Lâmina Esmeralda, Visor do Pântano, Adaga Espectral |
| **d3** | Nv. 41 – 60 | Degelo & Montanhas Rubras | Martelo de Basalto, Peitoral Vulcânico, Núcleo do Golem |
| **d4** | Nv. 61 – 80 | Portão Partido & Torre das Brasas | Gládio do Arquivista, Grimório das Cinzas, Lâmina Solar |
| **d5** | Nv. 81 – 100 | Crepúsculo & Cavernas do Vazio | Lança do Eclipse, Armadura do Trono, Lâmina de Obsidiana |
| **d6** | Nv. 101 – 140 | Labirinto de Ferro & Forjas Malditas | Machado do Abismo, Baluarte da Meia-Noite |
| **d7** | Nv. 141 – 180 | Abismo & Cripta Eterna | Foice da Cripta, Manto do Lich Maior, Égide Dourada |
| **d8** | Nv. 181 – 200 | Floresta Amaldiçoada & Altar do Caos | Cajado do Caos, Coroa de Ametista, Fragmento Primordial |
| **d9** | Nv. 201 – 260 | Planalto Incandescente & Magma | Espada do Primeiro Fogo, Égide Sagrada da Redenção |
| **d10**| Nv. 261 – 300 | Dimensão das Sombras & Cinzas Eternas| Conjunto Cósmico dos Cinco Selos (Arma, Elmo, Escudo) |

---

## 3. Mineração e Coleta de Recursos

Em `src/data/mining.data.js`, jazidas de minério (`ore_nodes`) fornecem matérias-primas essenciais para a forja:
- **Minérios Comuns:** Ferro, Prata, Quartzo Branco (Zonas 1 a 6).
- **Minérios Nobres:** Ouro Puro, Ametista, Fissura Ciano (Zonas 7 a 19).
- **Minérios Primordiais:** Magma Vulcânico, Pedra de Sangue, Obsidiana Abissal, Minério Astral (Zonas 20 a 29 e Masmorras 5+).

---

## 4. Diagnóstico de Gargalos e Riscos Encontrados

1. **Risco de Azar Extremo em Itens Supremos (0.2% a 1.0%):**
   - Um jogador pode derrotar chefes 150 vezes sem jamais ver um item *Supremo*, gerando frustração extrema na reta final da progressão (Níveis 260–300).
2. **Volatilidade dos Contadores de Piedade:**
   - Em `DropManager.js`, `bossPityCounter` e `mobPityCounter` são variáveis da instância em memória RAM. Ao recarregar a página (F5) ou fechar o navegador, o contador de piedade zera, punindo sessões curtas de jogo.
3. **Drops Comuns e Incomuns Descartados:**
   - Em `rollDrop()`, quando o sorteio resulta em `comum` ou `incomum`, o método retorna `null`, convertendo o drop em apenas moedas de ouro ou cristais, o que deixa o jogador com a sensação de "baú vazio".
4. **Falta de Moeda de Troca Garantida (Bad Luck Protection / Pity Token):**
   - Não havia conversão de itens repetidos em fragmentos que permitam comprar uma peça faltante na Forja Ancestral.
