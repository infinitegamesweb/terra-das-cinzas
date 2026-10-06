# Sistema de Proteção Contra Azar Extremo (Pity System) — Guerra das Cinzas

**Documento:** `docs/gameplay/PITY_SYSTEM.md`  
**Base:** Diagnóstico de `docs/gameplay/LOOT_AUDIT.md`  
**Objetivo:** Garantir que o jogador nunca estagne indefinidamente sem progressão relevante, preservando a raridade e o valor de itens lendários e supremos.  
**Status:** Especificação de Design e Engenharia (Master Plan — Fase 09 / Prompt 19). *Não implementado no código nesta etapa.*

---

## 1. Princípio Norteador

> *"A conquista de um item Supremo deve evocar euforia, nunca alívio por fim de tortura."*

O sistema de proteção contra azar (Pity System) de *Guerra das Cinzas* não deve aumentar artificialmente as taxas de drop normais a ponto de vulgarizar os itens raros. Em vez disso, estabelece **redes de segurança invisíveis** e **recursos de consolação tangíveis** (fragmentos e moedas de troca).

---

## 2. Pilares do Sistema de Pity Proposto

### 2.1 Contadores de Piedade Persistentes (Persistent Pity Counters)
Diferente do modelo em memória volátil, os contadores devem ser salvos no objeto de progresso do jogador (`p.pity = { bossKills: 0, dungeonRuns: 0, supremePity: 0 }`):

| Categoria | Gatilho Suave (Soft Pity) | Garantia Absoluta (Hard Pity) | Reinicialização do Contador |
|---|---|---|---|
| **Itens Épicos (Chefes)** | A cada 8 derrotas (chance dobrada) | No 15º Chefe sem épico | Zera ao dropar Épico ou superior |
| **Itens Lendários (Chefes/Dungeon)** | No 30º Chefe (chance sobe de 4% para 12%) | No 50º Chefe sem lendário | Zera ao dropar Lendário ou Supremo |
| **Itens Supremos (Dungeons 8–10)**| No 70º Andar sem drop supremo | No 100º Chefe de Masmorra sem drop | Zera ao dropar Supremo |

---

### 2.2 Sistema de Fragmentos de Cinza e Brasas (Currency Conversion)
Todo abate de chefe regional ou conclusão de masmorra concede garantidamente uma moeda de pity não inflacionária:
- **Fragmento de Cinza:** 1 a 3 unidades por monstro de elite ou baú de masmorra.
- **Fragmento de Brasa (Ember Shard):** 1 unidade por chefe de mundo ou chefe de andar de masmorra derrotado.
- **Essência Primordial Despedaçada:** Dropada ao desmontar itens Épicos ou Lendários duplicados na Forja Ancestral.

---

### 2.3 Mesa de Transmutação da Forja (Pity Crafting)
Para contornar o problema do jogador dropar 5 elmos lendários e nenhuma arma, a Forja das Cinzas oferecerá receitas de transmutação com custo justo:
- `3 Itens Lendários Duplicados + 20 Fragmentos de Brasa` = **1 Caixa Seletora de Equipamento Lendário do Mesmo Nível**.
- `100 Essências Primordiais + 50 Fragmentos de Brasa` = **Forja Garantida de uma Arma Suprema dos Cinco Selos (Nível 300)**.

---

### 2.4 Marcos Garantidos de Jornada (Guaranteed Milestones)
Conquistas associadas ao Livro de Crônicas (Codex):
- **10 Chefes Distintos Derrotados:** Concede 1 Amuleto Lendário de Proteção.
- **20 Chefes Distintos Derrotados:** Concede 1 Gema Ancestral de Dano.
- **Derrota do Soberano da Terra das Cinzas (Região 29):** Concede garantidamente o título de *Conquistador Supremo* e a primeira arma da categoria *Suprema* à escolha do jogador.

---

## 3. Prevenção de Inflação e Exploits

1. **Sem Multiplicador em Monstros Comuns de Baixo Nível:** Derrotar slimes de nível 1 em Miraluz não incrementa o contador de pity de itens de nível alto. Cada contador é atrelado à faixa da masmorra (`d1` a `d10`).
2. **Consumo no Sucesso Antecipado:** Se a sorte normal premiar o jogador com o item no 12º abate, o contador correspondente reinicia imediatamente a contagem a partir de zero.
3. **Persistência no Savegame:** Os contadores são serializados no JSON local e no Supabase (salvamento em nuvem), evitando perda de progresso em caso de desconexão.
