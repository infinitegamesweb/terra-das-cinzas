# Plano de evolução de Terra das Cinzas

**Atualizado em:** 3 de outubro de 2026  
**Escopo:** protótipo web em `terra-das-cinzas`; melhorias incrementais de estabilidade, interface, arte, conteúdo e ferramentas.

## Objetivo

Evoluir o protótipo com uma identidade visual 2D consistente, fluxos jogáveis confiáveis e ferramentas reproduzíveis. Recursos devem ser descritos de acordo com o que o código e os serviços realmente oferecem. Multiplayer, economia entre jogadores e blockchain só avançam depois de uma fundação de servidor adequada.

## Estado verificado

- O build parte de `src/game.js`, copia `public/` para `dist/` e é configurado por `tools/build-pages.mjs`.
- A progressão no código chega ao nível 300 (`src/systems/progression/ProgressionManager.js` e `src/game.js`). A campanha de cinco regiões principais cobre níveis 1–100; `WorldMapManager.js` descreve um mapa separado de 30 áreas até 300. Documentos que afirmam que o limite do jogo é 100 precisam ser revistos.
- A conta inclui código Supabase e autenticação Web3/SIWE. A configuração de provedores e o funcionamento do serviço remoto não foram verificados nesta auditoria.
- O jogo se apresenta como mundo solo. O antigo “Mercado entre Jogadores” era uma simulação local no `localStorage`, com ofertas e vendedores demonstrativos; não havia negociação entre jogadores.
- `src/game.js` tem aproximadamente 4.660 linhas e concentra vários sistemas. Isso aumenta o risco de regressões e dificulta manutenção, mas não justifica uma reescrita ampla sem delimitar módulos e comportamento.
- `public/` contém cerca de 9 mil arquivos e 163 MB. O build copia toda essa pasta para `dist/`, inclusive previews e arquivos de referência. A auditoria seguinte deve identificar recursos realmente carregados antes de mover qualquer arquivo.
- O build foi concluído com sucesso depois das alterações atuais do bazar. A prévia da saída `dist` confirmou menu, nova jornada e bazar; o fluxo de compra/venda ainda precisa ser percorrido com dados de inventário e saldo adequados.

## Skills instaladas no projeto

As quatro skills do projeto estão em `.agents/skills/` e orientam o trabalho neste repositório:

- [Direção de arte 2D pixel art](.agents/skills/game-art-director-2d-pixel/SKILL.md)
- [Engenharia de game web e Web3](.agents/skills/web-game-engineer-web3/SKILL.md)
- [Engenharia de ferramentas para games](.agents/skills/game-tools-engineer/SKILL.md)
- [API Spriterrific](.agents/skills/spriterrific-api/SKILL.md)

## Trabalho em andamento

- **Bazar local:** rótulos agora deixam claro que ofertas são demonstrativas e salvas somente neste navegador. Os ícones usam sprites já existentes. Dados de listagens são limitados/escapados antes de entrarem no HTML. Compra e cancelamento preservam ouro e oferta quando a bolsa está cheia.
- **Animação do Colosso:** a ação `death` foi gerada e revisada: 10 quadros, 5×2, 8 FPS, transparência preservada. Está ligada ao ciclo de morte do `boss_ashen_golem`; os dados temporais não são persistidos no save, evitando animação presa após recarregar. Arte em `public/assets/monsters/boss_ashen_golem/death_spritesheet.png`; originais e manifesto em `spriterrific-runs/ashen-golem-boss-an8fkpxt/`.
- **Sprite Fusion:** chave guardada em `.env`, ignorado por `.gitignore`. O saldo era 15 créditos; uma operação `style-reference` gerou nove opções 64×64 de uma barqueira compatível com a linguagem visual dos NPCs. Arquivos e ficha ficam em `art-staging/sprite-fusion/marsh-ferryman/`; ainda não substituem conteúdo do jogo.
- **Assets grátis:** a análise está em [ANALISE_ASSETS_GRATUITOS.md](./ANALISE_ASSETS_GRATUITOS.md). Recomendação inicial: avaliar packs `foozle-lucifer-*`/`foozle-spire-*` CC0 para monstros e efeitos; consultar catálogos Kenney para peças pequenas. Nenhum arquivo externo foi copiado para o jogo nesta etapa.
- **Credencial Spriterrific:** removido um fallback de API key embutido em `tools/download_boss_artifacts.mjs`; o script agora exige `SPRITERRIFIC_API_KEY` no ambiente.
- A prévia local foi aberta no navegador integrado e o caminho menu → nova jornada → bazar apareceu corretamente. A tentativa de automação Python/Playwright não executou porque o Chromium dessa ferramenta não está instalado. A inspeção visual pelo navegador integrado funcionou.

## Backlog priorizado

### P0 — confiabilidade e alinhamento com o produto

1. Finalizar correção do bazar: build, revisão da oferta/venda/cancelamento e situação de bolsa cheia; validar que os dados salvos não criam HTML executável.
2. Percorrer os fluxos essenciais: menu, nova jornada, continuar, combate, morte, saque, progressão, mudança de região, NPC, contrato e conclusão dos andares da masmorra.
3. Atualizar documentação contraditória: limite 300, campanha principal 1–100, mapa 1–300, estado real do login/save e natureza local do bazar.
4. Conferir mensagens que possam sugerir multiplayer, mercado remoto, conexão ao vivo ou itens on-chain sem que esses serviços existam.
5. Auditar carregamento e tamanho do pacote. Catalogar previews, testes, PDFs e fontes sob `public/`; mover apenas recursos provadamente não referenciados, preservando originais.

**Critério de saída:** build bem-sucedido; jornadas principais sem erros de console ou perda de progresso/itens; textos e telas descrevem corretamente o que funciona.

### P1 — experiência e qualidade visual

1. Estabelecer uma folha de estilo visual: resolução base, escala de personagem, perspectiva top-down, contorno, luz, paletas por bioma, densidade de pixels e regras de animação.
2. Comparar sprites de jogador, NPCs, monstros, chefes, armas e cenário no tamanho real de jogo. Corrigir primeiro problemas de silhueta, legibilidade, pivô e consistência.
3. Completar ciclos dos chefes com sinais visuais ligados às mecânicas: antecipação, ataque, impacto, reação e derrota.
4. Revisar HUD e menus em telas pequenas, foco/teclado, instruções do tutorial, estados vazios, legibilidade e feedback de ações.
5. Validar nomes de itens, caminhos de ícones, dimensões de quadros, transparência e alinhamento antes de publicar novos assets.

**Critério de saída:** arte integrada e inspecionada no canvas em escala normal e ampliada; HUD utilizável em viewport desktop e estreito; sem quadros tremendo ou sprites borrados.

### P2 — ferramentas e performance

1. Medir quais arquivos de `public/assets/` são carregados no fluxo normal e quais são somente fonte, preview ou documentação.
2. Criar validação reutilizável para caminhos, dimensões, transparência, grade de spritesheet, pivôs e metadados.
3. Otimizar imagens e carregamento sob demanda sem modificar a aparência da pixel art; estabelecer limite e orçamento de tamanho para o build.
4. Separar módulos de `src/game.js` gradualmente, sempre com fronteiras claras e verificação do fluxo alterado.

**Critério de saída:** pipeline repetível, falhas de asset apontadas com caminho/causa, pacote publicado menor sem perda de conteúdo do jogo.

### P3 — serviços online e Web3

1. Validar Supabase Auth, SIWE, redirects, RLS, migração e recuperação de conflito de saves em ambiente de desenvolvimento.
2. Definir e construir backend autoritativo para combate, inventário, progressão, sorteio e economia antes de prometer mercado compartilhado ou multiplayer.
3. Avaliar blockchain somente para uma necessidade de propriedade verificável; documentar taxas, custódia, recuperação, privacidade, segurança e operação sem carteira.

**Critério de saída:** nenhuma regra econômica depende apenas do cliente; Web3 opcional e documentado; multiplayer só é anunciado quando existir sincronização e teste real entre jogadores.

## Política para APIs de arte

- **Spriterrific:** disponível no ambiente; a consulta à API confirmou 210 créditos antes do trabalho de animação. A geração de uma ação custa 100 créditos. Conferir saldo e custo antes de cada job; guardar resultados localmente, inspecionar frames e registrar origem/prompt.
- **Sprite Fusion:** a credencial está no `.env` e o arquivo é ignorado pelo Git. A consulta confirmou 15 créditos e uma geração de estilo consumiu o saldo, entregando nove variações. Não iniciar geração adicional até haver saldo; todo resultado fica primeiro em `art-staging/` e requer revisão antes de integrar.
- **Geração de imagem:** usar quando a ferramenta estiver disponível para esta tarefa e o formato final for raster/conceito. Para animação de personagem, priorizar continuidade da identidade e o pipeline que produz spritesheets utilizáveis.
- **Cloudflare AI/Supabase:** usar apenas para tarefas ligadas aos serviços que o jogo realmente implementa. A presença de scripts ou SDK não prova que credenciais, permissões e ambiente de produção estejam configurados.
- Nenhum asset externo entra automaticamente em `public/assets/`: primeiro fica em staging, passa por revisão visual/técnica, depois é integrado ao loader e conferido no jogo.

## Próxima sequência

1. [Concluído] Revisar as nove propostas da barqueira e integrar a melhor candidata (opção 1 alinhada com pivô no chão Y=45) como sprite único do NPC Tomas (`fisher_tomas` no Pântano Espectral).
2. [Concluído] Fazer uma amostra técnica dos packs Foozle CC0 (Lucifer e Spire) em `art-staging/foozle-sample/`: comprovados alpha binário 100% limpo, grid 64×64 nativo (Spire) e 48×48 (Lucifer), paletas escuras correspondentes e manifest com licença CC0 1.0.
3. [Concluído] Finalizar a revisão de compra, venda, cancelamento e bolsa cheia no bazar (validado interativamente no navegador com zero erros).
4. [Concluído] Fazer inventário de carregamento e higienização de assets para reduzir o pacote servido (redução de 132 MB em `dist/`).
5. Continuar a revisão jogável dos sistemas principais e priorizar UI/sprites com maior impacto visual.

