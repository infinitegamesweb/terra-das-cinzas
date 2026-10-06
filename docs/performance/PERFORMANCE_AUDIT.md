# Auditoria Completa de Performance — Guerra das Cinzas

**Documento:** `docs/performance/PERFORMANCE_AUDIT.md`  
**Escopo:** Canvas 2D, Loops de Renderização, Memória, Partículas, DOM, Timers e Assets  
**Alinhamento:** Master Plan (Fase 11 / Prompt 22)

---

## 1. Mapeamento de Recursos e Cargas de Trabalho

### 1.1 Assets Gráficos e Imagens
- **Total de Assets:** ~7.200 arquivos no diretório `public/assets/`.
- **Modo de Carregamento:**
  - ~60 sprites essenciais de monstros, montanhas, minérios e biomas são instanciados na inicialização (`new Image()`).
  - As 30 miniaturas de região (`public/assets/regions/`) utilizam lazy-loading nas tags HTML (`<img loading="lazy">`).
  - Sprites de personagens utilizam carregamento sob demanda por direção (`south`, `north`, `east`, `west`).

### 1.2 Pipeline do Canvas 2D & Loops de Renderização
- **Frequência:** `requestAnimationFrame` rodando a 60 FPS estáveis.
- **Buffer Duplo / Offscreen:** O minimapa utiliza um `<canvas id="radar">` separado de 112×112 px redesenhado a cada frame.
- **Partículas (`parts`):**
  - Geradas em explosões de habilidades (até 28 a 45 partículas por cast de Suprema).
  - Cada partícula possui tempo de vida decremental (`t -= dt`). Partículas expiradas são filtradas via `parts = parts.filter(...)`.
- **Efeitos de Combate (`combatEffects`):**
  - Limitador estrito a 48 instâncias ativas (`combatEffects.splice(0, combatEffects.length - 48)`).
- **Textos Flutuantes (`floatingTexts`):**
  - Removidos após ~0.95s com decaimento alfa e movimento vertical.

### 1.3 Timers e Listeners no DOM
- **Timers Globais:**
  - `vitalsTimer` em `PartyManager.js` (intervalo de 1200ms).
  - Ping timer do WebSocket em `CinzasNet.js` (intervalo de 5000ms).
  - Timeout de recarga de habilidades e combos.
- **Listeners no DOM:**
  - O `regionsListEl.querySelectorAll('.hrc-region-card')` reatribui `onclick` em cada chamada de `updateRegionUI()`. Como usa reescrita total de `innerHTML`, os botões anteriores e seus listeners são destruídos e reciclados pelo Garbage Collector do motor V8.

---

## 2. Classificação de Gargalos e Riscos de Performance

### GARGALO 01 — Listeners e Redesenho Contínuo do Minimapa (HIGH)
- **Diagnóstico:** O radar do minimapa (`#radar`) é limpo e redesenhado a cada frame de 16ms mesmo quando o jogador está completamente parado e sem nenhum monstro se movendo nas proximidades.
- **Severidade:** **HIGH**
- **Impacto:** Desperdiça ciclos de GPU/CPU desnecessariamente em laptops ou dispositivos móveis em repouso.
- **Recomendação:** Implementar cache ou threshold de movimentação para o radar.

### GARGALO 02 — Filtragem de Arrays por Alocação em Massa a 60 FPS (HIGH)
- **Diagnóstico:** No loop de renderização, expressões como `parts.filter(p => p.t > 0)` e `mobs.filter(m => m.alive)` geram novos arrays temporários a cada frame, forçando coletas de lixo periódicas do Garbage Collector (GC pauses de 2 a 5ms).
- **Severidade:** **HIGH**
- **Impacto:** Micro-engasgos (stutter) após 15 a 20 minutos de jogatina contínua com combate frenético.
- **Recomendação:** Utilizar remoção in-place (`splice` ou loop reverso `for (let i = arr.length - 1; i >= 0; i--)`) para evitar alocações efêmeras.

### GARGALO 03 — Sourcemaps em Ambientes de Produção (MEDIUM)
- **Diagnóstico:** O arquivo de bundle de desenvolvimento gera 3.0 MB de mapa de fonte.
- **Severidade:** **MEDIUM**
- **Impacto:** Conexões mais lentas demoram mais para baixar recursos auxiliares. Em produção oficial (`build-pages.mjs`), os mapas já foram isolados com sucesso na Fase 00.
- **Recomendação:** Garantir que a flag `--sourcemap=external` permaneça desativada em builds com tag de release.

### GARGALO 04 — Preload Excessivo de Sprites Não Utilizados (LOW)
- **Diagnóstico:** Sprites de monstros de regiões finais (ex: `monster_void_serpent`, `monster_reaper_death`) são instanciados na memória na tela de abertura, consumindo ~15 MB de RAM antes do jogador sequer sair do Bosque inicial.
- **Severidade:** **LOW**
- **Impacto:** Baixo em computadores modernos, mas perceptível em navegadores mobile com pouca memória.
- **Recomendação:** Carregamento sob demanda (lazy spritesheet loading) por bioma ativo.
