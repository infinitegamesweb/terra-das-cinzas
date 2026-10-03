# Pesquisa de assets gratuitos para Terra das Cinzas

**Pesquisa feita em:** 3 de outubro de 2026  
**Perfil do projeto:** RPG web 2D, pixel art, câmera top-down, fantasia sombria.

## Resumo da busca

Os tópicos do GitHub são grandes misturas de ferramentas, jogos de exemplo, bibliotecas e arte. Na consulta, `spritesheet` listava 486 repositórios, `spritesheets` 35, `game-assets` 341 e `pixel-art` 3.347. Esses números são resultados dos tópicos, não uma contagem de packs prontos nem uma validação de licença de cada resultado. A análise abaixo filtrou por arte reaproveitável, perspectiva top-down, estilo próximo e licença declarada pelo autor.

Um arquivo `LICENSE` do código não concede automaticamente direitos sobre as imagens. Para importar arte, verificar a licença do pack/página original e manter a origem ao lado do asset. Em OpenGameArt, cada página tem licença própria; não assumir que o site inteiro é CC0.

## Candidatos prioritários

| Fonte | O que oferece | Licença verificada | Adequação ao jogo | Recomendação |
|---|---|---|---|---|
| [series-ai/jam-ready-assets](https://github.com/series-ai/jam-ready-assets) | Biblioteca organizada por pack e tema, incluindo `foozle-lucifer-*` (personagens, masmorras, lava, exterior, itens e UI) e `foozle-spire-*` (inimigos e cenário de fantasia sombria). | Cada pack tem seu próprio `License.txt`; o índice identifica packs CC0 e registra as fontes. Os packs individuais Foozle são “name your own price” e o autor declara CC0, inclusive uso comercial. | **Melhor candidato de tema**. A coleção Lucifer é top-down 32×32. Personagens anunciados têm quatro direções e dez animações; precisam de integração própria e não substituem diretamente classes com oito direções. | Inspecionar primeiro pickups/efeitos pequenos de Lucifer e inimigos de Spire. Se usar personagem Lucifer, adaptar o renderer para quatro direções ou gerar as demais; não espelhar automaticamente sprites assimétricos. Manter `License.txt`. |
| [pixel-boy/NinjaAdventure](https://github.com/pixel-boy/NinjaAdventure) e [página oficial do pack](https://pixel-boy.itch.io/ninja-adventure-asset-pack) | Mais de 50 personagens animados, 30 monstros, 9 chefes, itens, tilesets, interface, efeitos e áudio; top-down 16×16. | CC0 declarado pelos autores na página oficial; uso comercial e modificações permitidos. | Excelente cobertura funcional e perspectiva correta; estilo mais colorido/leve pode divergir do tom e do nível de detalhe de Terra das Cinzas. | Melhor fonte para prototipar variações de NPCs/monstros ou preencher lacunas pequenas. Selecionar assets isolados; evitar trocar o elenco todo por outro estilo. |
| [Tiddybub/2d-assets](https://github.com/Tiddybub/2d-assets) | Catálogo pronto de 1.101 packs, incluindo personagens, fantasia, efeitos, natureza, tilesets e UI; cada pasta traz `SOURCE.md`. | O repositório declara CC0 para o conteúdo. A origem e licença de cada pacote estão documentadas no respectivo `SOURCE.md`. | Ótimo índice para descobrir peças específicas sem baixar uma coleção gigantesca. O catálogo mistura perspectivas e estilos. | Usar como mecanismo de busca. Filtrar por RPG/top-down/pixel art e conferir `SOURCE.md` e a imagem antes da integração. |
| [eturner58/game-assets](https://github.com/eturner58/game-assets) | Catálogo visual/programático de packs Kenney; repo informa 78 mil arquivos CC0 de arte, UI, ícones e áudio, com filtro por perspectiva/estilo/tamanho. | CC0 para Kenney. O mesmo repo contém apenas metadados de LimeZu, cujos pixels são pagos e não redistribuíveis. | Útil para localizar props, ícones, UI simples e alternativas de baixa resolução. Parte da arte Kenney é mais plana e menos detalhada que a arte atual. | Consultar o catálogo e buscar apenas assets necessários. Não baixar os 523 MB de uma vez; não usar os metadados de LimeZu como autorização. |
| [Kenney Roguelike/RPG pack](https://kenney.nl/assets/roguelike-rpg-pack) | Mais de 1.700 arquivos 16×16: tiles, objetos, móveis e peças de RPG. | CC0 indicado na página do autor. | Bom para objetos de mapa, itens e protótipos; pequeno para os personagens e chefes principais do jogo. | Usar em props/UI pontuais ou como referência de grid. Evitar introduzir o pack inteiro sem revisão visual. |
| [Kenney Monster Builder Pack](https://kenney.nl/assets/monster-builder-pack) | Mais de 170 peças de monstros combináveis. | CC0 indicado na página do autor. | Ajuda a explorar silhuetas e variações rapidamente; não é a melhor substituição para os monstros detalhados já existentes. | Usar como rascunho de design/protótipo, não como troca automática do bestiário. |
| [SpriteCook/spritecook-free-game-assets](https://github.com/SpriteCook/spritecook-free-game-assets) | Pequena coleção com personagens pixel art, ícones de magia/inventário, texturas e logos, com prompts e configurações. | CC0 1.0 declarado no repositório. | Pode preencher ícones ou servir de referência; a qualidade e consistência variam por item e parte do conteúdo é gerada com IA. | Avaliar asset por asset; não assumir que as imagens formam um único conjunto de estilo. |

### Candidatos de fora do GitHub

- [Dark Fantasy Pixel Pack](https://willyee.itch.io/dark-fantasy-pixel-pack-54-characters-25-monsters-455-weapons): licença CC0 e grande conjunto de personagens, inimigos, chefes e armas. É feito para jogo side-scroller, então os sprites de corpo/perfil não substituem bem os atores top-down atuais. Pode ser útil para ícones, retratos ou telas de seleção, após inspeção.
- [Foozle All Assets Collection](https://foozlecc.itch.io/foozle-all-assets-collection): os assets são CC0, mas essa coleção consolidada custa US$ 9,99. Para manter o escopo “gratuito”, priorizar packs grátis disponíveis no repositório curado em vez de comprar essa coleção.

### Páginas do autor verificadas para o candidato Foozle

- [Lucifer - Necromancer](https://foozlecc.itch.io/lucifer-necromancer) e [Lucifer - Warrior](https://foozlecc.itch.io/lucifer-warrior): sprites top-down em quatro direções, com dez animações por direção, CC0 e download “name your price”. Precisam de adaptação para a classe de loader que espera oito direções.
- [Lucifer - Exterior Tileset](https://foozlecc.itch.io/lucifer-exterior-tileset): tiles top-down 32×32, CC0, download “name your price”. Grid compatível com mapas 32×32, mas paleta e encaixe no tileset atual ainda precisam de inspeção.
- [Lucifer - Effects](https://foozlecc.itch.io/lucifer-effects) e [Lucifer - Pickups](https://foozlecc.itch.io/lucifer-pickups): packs CC0 pequenos, úteis para uma amostra técnica de VFX/loot antes de avaliar personagem ou UI inteira.
- [Lucifer - RPG UI](https://foozlecc.itch.io/lucifer-rpg-ui): CC0, porém download de 29 MB e inclui HUD, login, fonte, mais de 100 ícones e painéis. O jogo já tem UI própria; selecionar componentes isolados, sem substituir todo o HUD.

## O que os tópicos não significam

- `aseprite/aseprite`, `Orama-Interactive/Pixelorama` e `piskelapp/piskel` são ferramentas de edição/fluxo de sprites, não pacotes de arte que o jogo possa simplesmente carregar. Pixelorama/Piskel podem ajudar na edição; a licença do aplicativo não licencia arquivos criados por terceiros.
- Muitos repositórios chamados “game” ou marcados `spritesheet` guardam código, exemplos ou arte cujo uso é não comercial, condicionado a atribuição, share-alike ou simplesmente sem licença clara. Eles não entram na lista de assets aprovados por terem imagens no repositório.
- A licença do pack deve acompanhar os arquivos. Para CC-BY, registrar autor, link, licença e alterações; CC-BY-SA e GPL precisam de revisão antes de entrar em um jogo distribuído.

## Compatibilidade com os assets atuais

O projeto já contém milhares de arquivos e uma coleção legada extensa. Há sprites de personagens pequenos (por exemplo, NPCs em canvases 64×64), atores e chefes em escalas maiores, além de atlas próprios com pivô e transparência controlados. Adicionar packs completos aumentaria o build — hoje ele copia todo `public/` — e poderia misturar perspectivas e densidade de pixels.

Antes de importar um asset escolhido:

1. Conferir tamanho nativo, perspectiva, proporção em tela, pivô e transparência.
2. Comparar com assets existentes do mesmo papel (NPC, inimigo, chefe, tile, efeito ou ícone).
3. Inspecionar a grade real de animação e registrar quadros/FPS em metadados.
4. Guardar apenas os arquivos usados e sua licença/fonte; não copiar repositórios inteiros para `public/`.
5. Abrir no jogo com `image-rendering: pixelated` e validar em escala normal antes de substituir conteúdo.

## Decisão nesta etapa

Nenhum arquivo baixado do GitHub foi adicionado ao jogo nesta pesquisa. A lista é um catálogo de fontes aprovadas para a próxima etapa. A prioridade de teste é `foozle-lucifer-*`/`foozle-spire-*` para inimigos, seguido de peças pequenas do Kenney para cenário/UI e Ninja Adventure para lacunas específicas de NPCs/monstros. O estilo e a licença devem ser verificados no asset escolhido, não inferidos do tópico.

## Registro de imagens Sprite Fusion já geradas

A conta conectada tinha 15 créditos; o job de estilo consumiu 15 e retornou nove imagens 64×64. Elas estão em `art-staging/sprite-fusion/marsh-ferryman/`, com prompt e metadados em `manifest.json`; `contact-sheet.png` permite revisar todas de uma vez. São variações de uma barqueira pixel art guiadas pelo NPC ferramenteiro existente. Continuam em revisão e não substituem ainda o sprite de Tomas.

A arte de derrota do Colosso, gerada anteriormente pelo Spriterrific, foi salva em `public/assets/monsters/boss_ashen_golem/death_spritesheet.png` e ligada à entidade do boss. O manifesto registra 10 quadros, 5×2, 8 FPS e pivô inferior central. A amostra fica também em `spriterrific-runs/ashen-golem-boss-an8fkpxt/`.
