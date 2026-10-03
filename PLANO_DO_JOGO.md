# Terra das Cinzas — estado e plano do jogo

Documento de acompanhamento do protótipo atual. Ele registra o que já existe no código e o que ainda precisa ser construído para chegar ao MMORPG planejado.

## Visão do projeto

**Terra das Cinzas: A Deep RPG** é um RPG de aventura web em pixel art. O código limita a progressão ao nível 300; as cinco regiões principais cobrem os níveis 1–100, e `WorldMapManager.js` descreve 30 áreas até o nível 300. A jornada continua sendo solo. Grupos, mercado entre jogadores e ativos em blockchain não estão implementados como recursos online.

## O que já foi feito

### Mundo e progressão

- Mapa aberto dividido em cinco regiões, cobrindo a faixa de níveis 1 a 100.
- O limite de progressão configurado é 300; o mapa-múndi separado contém 30 áreas até esse nível. O funcionamento e o conteúdo jogável das áreas 101–300 precisam de uma validação de ponta a ponta.
- Cada região tem quatro áreas de exploração e uma área de chefe, com nomes, inimigos e identidade visual próprios.
- Acesso às regiões avança conforme o nível e a derrota do chefe da região anterior.
- Terreno, caminhos, vegetação, objetos e variações de ambiente são desenhados no jogo; as regiões posteriores recebem paletas e efeitos próprios.
- Nome e tema do jogo foram consolidados em **Terra das Cinzas: A Deep RPG**; há logo e arte de menu no diretório do projeto.
- O Colosso da Fornalha Rubra ganhou animação idle de nove quadros e efeito de impacto de magma de nove quadros, com pivôs alinhados, spritesheets transparentes e atlas JSON.
- O Guardião da Raiz Cinzenta da região 1 usa idle em oito direções e corrida de oito quadros por direção, com fallback estático, atlas JSON e quadros RGBA normalizados. Chefes antigos de região 1 salvos no navegador migram para o sprite correto.
- O chefe da terceira região usa a animação no Canvas; o efeito toca quando o golpe dele acerta.
- Há scripts Python reutilizáveis para gerar uma imagem via Cloudflare Workers AI e montar spritesheets/atlas.

### Combate e equilíbrio atual

- Combate corpo a corpo, inimigos comuns, chefes, barras de vida e dano flutuante.
- Inimigos comuns escalam por nível e região. O combate considera a diferença de nível entre personagem e inimigo; contra um inimigo de mesmo nível, há bônus de 3 de dano para o jogador.
- Chefes têm 8 vezes a vida-base, 4 vezes o dano-base e 4 pontos adicionais de defesa, conforme as regras atuais do protótipo.
- A experiência necessária por nível usa a fórmula `120 + 18 × nível + 0,08 × nível²`.
- Inimigos dão `20 + arredondar(3,4 × nível)` XP; chefes dão cinco vezes a recompensa-base.
- Ao morrer, perde-se 5% do XP acumulado na barra do nível atual; a morte para chefe dobra a perda. A perda não reduz o nível. Também há perda de 10 ouros.
- Missões, mineração e outros objetivos concedem recompensas de XP e/ou ouro.

### NPCs e masmorras

- Há um NPC de expedição em cada região. O jogador precisa falar com ele para aceitar o contrato e acessar a masmorra.
- Há uma masmorra temática por região, com dez andares, inimigos, veios minerais raros, baús, portal de retorno e escadas para avançar.
- Há chefes nos andares 5 e 10, com nomes próprios por masmorra. Os andares seguintes são liberados ao limpar o atual.
- Os contratos de masmorra pedem três veios raros, dois baús e a derrota do chefe do andar 5; há recompensa de ouro, XP e um Selo do Explorador.
- Minérios exclusivos — Minério Abissal, Pedra de Sangue e Prata Astral — e saques especiais aparecem nas instâncias, não no mapa aberto.
- O protótipo aplica chance-base de 3% para saque raro e chance de 1 em 100.000 para saque mítico em cada recompensa elegível de criatura, veio ou baú.
- A regra de design prevê andares 1–5 para solo de nível recomendado até 40; dificuldades a partir de nível recomendado 41 ou andares 6–10 são planejadas para grupos de dois ou mais. Personagens de nível 90 ou mais podem tentar qualquer masmorra solo.
- Há uma aba própria de masmorras, lista de materiais e saques, regras de grupo/risco e missão do NPC.

### Interface, itens e salvamento

- Interface em português com tema escuro, detalhes dourados, HUD de vida/XP/energia, minimapa, missões, personagem, bolsa, guilda e masmorras.
- A aba Personagem ganhou ficha com retrato pixel art, HP/XP e estatísticas calculadas do protótipo, slots de equipamento; espada e escudo podem ser alternados ali, e os quatro atalhos atuais podem ser usados na ficha. Os demais espaços e oito talentos aparecem como planejados, sem bônus inventados.
- As seis classes das pastas de personagem podem ser escolhidas ao iniciar nova jornada. Cada uma tem modificadores próprios de vida, dano físico/arcano, armadura ou cura; Arqueiro ataca à distância e Assassino pode causar críticos. Todas têm sprites em oito direções e atlas de caminhada. Para as cinco classes sem caminhada original, os ciclos foram sintetizados das poses idle e são mais simples que uma animação desenhada quadro a quadro.
- Movimento, combate, modo automático, coleta de recursos, baús e interação com NPCs.
- Bolsa com ouro, cristais, poções, minério, relíquias e saques de masmorra; inclui uso/compra de poções e forja de espada.
- Equipamentos básicos de espada e escudo, contratos regionais e painel de guilda local.
- O estado do jogo é salvo localmente no navegador, incluindo personagem, região, progresso, contratos e itens de masmorra.
- A organização do código foi separada em módulos JavaScript, por exemplo `game.js`, `world.js`, `progression.js` e `ui.js`, além de `styles.css` e `index.html`.

## Limites atuais importantes

- É um jogo solo; a guilda é uma interface/progressão local e não há jogadores conectados.
- A exigência de grupo nas masmorras é uma regra de acesso e uma mensagem de design. Não existe sistema real de grupo, busca de jogadores ou combate cooperativo.
- Os mapas e masmorras são gerados/desenhados pelo código do protótipo; ainda não há campanha narrativa completa, cenas, diálogos ramificados ou conteúdo artesanal suficiente para 100 níveis.
- Há integração de código com Supabase Auth, SIWE e save remoto em `src/systems/auth/AuthManager.js`; provedores, banco remoto e recuperação de saves não foram verificados operacionalmente.
- O bazar é local e salva no navegador. Não há listagens ou negociação entre jogadores.
- Itens, ouro e cristais não têm mercado online. Não há carteira, token, NFT ou transação blockchain integrada.
- A chance de 1 em 100.000 é uma regra de sorteio do cliente neste protótipo e não é verificável nem segura para uma economia online.
- A existência do projeto em Cloudflare Pages ou outro host não foi confirmada neste registro. Hospedar os arquivos estáticos não cria, por si só, servidores de jogo ou multiplayer.
- As alterações recentes de campanha e masmorras ainda precisam de uma rodada de execução e verificação visual/funcional no navegador.

## O que falta fazer — plano priorizado

### Prioridade 0 — consolidar o protótipo

- Executar o jogo no navegador e percorrer o fluxo completo: menu, novo/continuar jogo, combate, morte, coleta, chefe, troca de região, NPC, contrato e dez andares de masmorra.
- Corrigir erros de execução, colisão, navegação, controles, salvamento/carregamento e apresentação em telas menores encontrados nessa rodada.
- Conferir os valores reais de combate e XP em vários níveis; ajustar curvas para evitar progressão lenta demais, saltos de dificuldade ou chefes impossíveis.
- Confirmar o fluxo de conclusão do andar 10, retorno ao mapa e entrega dos contratos.
- Rever as mensagens de grupo: não induzir o jogador a acreditar que pode formar grupo enquanto o multiplayer não existe; deixar claro que é conteúdo solo de protótipo e sinalizar a regra futura.
- Revisar a frequência e o texto das chances de saque. Uma chance de 1 em 100.000 deve ser comunicada como extremamente rara e, antes de qualquer economia real, calculada e sorteada no servidor.

### Prioridade 1 — conteúdo e experiência de jogo

- Criar tutorial inicial, onboarding e explicação clara de controles, atributos, XP, morte e progressão.
- Dar identidade jogável às cinco regiões: objetivos de história, NPCs com diálogos, missões variadas, eventos, segredos e recompensas temáticas.
- Diferenciar chefes com padrões de ataque, fases, sinais visuais e recompensas próprias; a diferença atual de atributos, sozinha, não substitui mecânicas de chefe.
- Criar animações de ataque, dano e morte para o Guardião da Raiz Cinzenta; completar movimento, ataque, dano e morte para os chefes das regiões 2, 4 e 5. O Colosso da Fornalha Rubra ainda tem idle e impacto de golpe, mas não um ciclo completo de combate.
- Expandir efeitos visuais além do impacto de magma: ataques de outros chefes, dano do jogador, cura, mineração e coleta ainda podem ganhar efeitos próprios.
- Criar animações de ataque e coleta específicas para Arqueiro, Assassino, Bárbaro, Clérigo e Mago; a caminhada sintética atual atende ao protótipo, mas não substitui ciclos de movimento desenhados para cada classe.
- Expandir a variedade de monstros, equipamentos, consumíveis, receitas, minerais, baús e sprites, mantendo escala visual consistente.
- Revisar acessibilidade e responsividade: leitura do HUD, atalhos de teclado, feedback de ações e suporte para celular/controles por toque.
- Definir uma política de equilíbrio para XP, perdas, raridade e economia e registrar as alterações por versão.

### Prioridade 2 — validar conta e save remoto; depois fundação online

- Escolher a arquitetura de servidor autoritativo para movimentação, combate, inventário, XP, saques e salvamento; o cliente não deve decidir valores econômicos.
- Validar autenticação, contas, perfis e salvamento persistente já integrados ao Supabase; corrigir configuração, RLS, migração e conflitos se necessário.
- Criar salas/zonas online e sincronização de estado em tempo real; avaliar WebSocket e a infraestrutura adequada para sessões multiplayer.
- Implementar grupos: convite, entrada/saída, líder, limite de jogadores, comunicação, escala de inimigos, contribuição, recompensas e recuperação se alguém desconectar.
- Fazer as masmorras multiplayer funcionarem de verdade: criação de instância por grupo, entrada coordenada, dificuldade ajustada, compartilhamento de objetivos e regras claras de saque.
- Adicionar proteção contra trapaça, duplicação de itens, automação abusiva, replay de requisições e manipulação de RNG; criar logs, monitoramento e ferramentas administrativas.
- Projetar recuperação de conta, backups, migração de dados e política de suporte antes de abrir o acesso público.

### Prioridade 3 — mercado e Web3 (etapa futura)

- Primeiro estabilizar a economia dentro do servidor: catálogo, oferta/procura, taxas, limites, histórico e mecanismos contra bots e lavagem de ativos.
- Definir se blockchain é realmente necessária e quais itens, se houver, podem ser negociáveis sem prejudicar a progressão ou tornar o jogo pay-to-win.
- Escolher rede, modelo de carteira e fluxo de custódia; explicar taxas, riscos, recuperação de acesso e experiência para quem não usa cripto.
- Só então implementar integração de carteira e mercado, com validação no servidor e revisão de segurança independente dos contratos inteligentes.
- Não colocar XP, combate, raridade ou propriedade legítima sob autoridade do navegador. A aleatoriedade e a emissão de ativos devem ser auditáveis e resistentes a manipulação.
- Planejar conformidade legal, privacidade, suporte a menores, prevenção a fraude e termos do mercado antes de aceitar dinheiro ou ativos de valor.

## Critério para considerar o protótipo pronto para demonstração

- O jogador consegue iniciar e continuar a jornada sem travar no menu.
- As cinco regiões podem ser alcançadas na ordem correta e os chefes desbloqueiam o caminho seguinte.
- XP, morte, nível máximo, ouro e equipamentos permanecem coerentes após recarregar a página.
- O contrato de masmorra pode ser aceito, concluído e resgatado; os dez andares e os dois chefes aparecem como esperado.
- O jogador entende claramente o que já funciona localmente e quais recursos online ainda são apenas planos.

## Arquivos de referência

- `index.html` — estrutura da página e painéis.
- `styles.css` — identidade visual e layout.
- `src/game.js` — mundo, combate, missões, masmorras, itens e salvamento local.
- `src/systems/world/WorldManager.js` — desenho e navegação do terreno.
- `src/systems/progression/ProgressionManager.js` — fórmulas de nível e experiência.
- `src/systems/ui/UIManager.js` — atualização de elementos da interface.

> Este documento é um plano de acompanhamento. Para a auditoria e a sequência atualizadas em 3 de outubro de 2026, consulte [PLANO_DE_EVOLUCAO.md](PLANO_DE_EVOLUCAO.md). Recursos online, blockchain e multiplayer não devem ser anunciados como funcionais sem validação operacional.
