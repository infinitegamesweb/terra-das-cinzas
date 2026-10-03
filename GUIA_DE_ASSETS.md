# Guia de assets e sprites

Este guia se aplica a `D:\Game\terra-das-cinzas`. Os arquivos servidos ficam em `public/`; os assets do jogo ficam fisicamente em `public/assets/`, embora o código os referencie pela URL `assets/...`.

## Como o asset chega ao jogo

O HTML e o JavaScript referenciam arquivos por caminhos relativos à raiz do site, por exemplo `assets/props/barrel.png`. O build em `tools/build-pages.mjs` copia `public/` para `dist/` e empacota `src/game.js` em `dist/game.bundle.js`. Portanto:

- Adicione assets usados pelo jogo em `public/assets/`.
- Edite a lógica em `src/`, o HTML em `public/index.html` ou o visual da interface em `public/styles.css`.
- Não faça alterações manuais em `dist/`: ele é regenerado por `npm run build`.
- Depois do build, a publicação no Cloudflare Pages precisa receber o commit correspondente na branch de produção.

## Pastas ativas de `public/assets/` (URLs relativas começam por `assets/`)

| Pasta | Conteúdo e uso |
|---|---|
| `assets/characters/` | Personagens jogáveis, NPCs, imagens idle e animações. |
| `assets/monsters/` | Monstros, slimes e pastas de bosses com atlas/frames. |
| `assets/props/` | Objetos do cenário, casas, baús e veios minerais. |
| `assets/world/` | Vegetação, rochas, árvores e elementos naturais. |
| `assets/maps/` | Tiles, texturas de terreno, pisos e mapas de dungeon. |
| `assets/projectiles/` | Projéteis de arco e magia por direção. |
| `assets/effects/` | Efeitos de combate e animações de impacto. |
| `assets/icons/` | Ícones de habilidades, serviços do castelo e interface. |
| `assets/items/` | Moedas, cristais, poções, armas e outros itens. |
| `assets/dungeon/` | Mapas e animações de tochas/armadilhas de dungeon. |
| `assets/ui/` | Logo pixelado e recursos visuais de interface. |

`assets/equipment/` e `assets/sprites/` estão vazias atualmente. Elas podem receber organização futura, mas o jogo só carregará um arquivo novo quando houver código apontando para ele.

## Pastas que não são publicadas como assets do jogo

- `dist/`: saída gerada pelo build.
- `novo assets/`: biblioteca grande de imagens de origem/referência; não entra no build atual.
- `novo/`, `spriterrific-runs/`, `boss-fase-1/` e `boss-fase3/`: materiais de trabalho e fontes para geração/recorte. Alguns scripts leem essas pastas e escrevem o resultado em `assets/`.
- Em `D:\Game`, fora do repositório, há outras pastas como `assests e sprites`, `examples`, `Proposta de mapas` e `TESTE GAME`. Elas não são copiadas para o site.

Se uma imagem ficar nessas pastas de origem, ela não aparecerá no jogo até ser copiada/processada para `assets/` e referenciada pelo código.

## Personagens jogáveis

As seis classes e seus dados ficam em `src/data/classes.data.js`. O carregamento e desenho do herói ficam em `src/entities/Player.js`.

| Classe/ID usado no código | Raiz de caminhada (`walkRoot`) |
|---|---|
| `guerreiro` | `assets/characters/guerreiro/` |
| `arqueiro` | `assets/characters/arqueiro/` |
| `assasino` | `assets/characters/assasino/` |
| `barbaro` | `assets/characters/barbaro/` |
| `clerigo` | `assets/characters/clerigo/` |
| `mago` | `assets/characters/mago(a)/` |

O Guerreiro também declara `idleRoot` próprio em `GAME_CLASSES`. As demais classes não declaram `idleRoot`; o retrato delas usa o primeiro quadro sul de `walkRoot/animations/walk/south/frame_000.png`. Consulte `src/data/classes.data.js` para os caminhos ativos.

O ID `assasino` e a pasta `mago(a)` têm essa grafia no projeto atual; mantenha-a ao criar caminhos novos ou altere todas as referências juntas.

### Formato que o carregador espera

- Idle: `rotations/<direção>.png`, com `south`, `south-west`, `west`, `north-west`, `north`, `north-east`, `east`, `south-east`.
- Caminhada: `animations/walk/<direção>/frame_000.png` até `frame_005.png`.
- A caminhada atual usa quadros de **48 × 48 px**, fundo transparente, pivô inferior central estável e seis quadros por direção. O jogador é desenhado a partir desse quadro de 48 × 48 e ampliado no Canvas.
- Os arquivos `walk-atlas.png` e `walk-atlas.json` são saídas do gerador. O carregador atual lê os quadros PNG individuais.

Para trocar uma pose existente, substitua o PNG no mesmo caminho e mantenha o enquadramento. Para reconstruir as caminhadas a partir dos sprites idle, rode na raiz do projeto:

```powershell
python tools/build_class_walks.py
```

O script recria as pastas `animations/walk`, o atlas e o JSON. As caminhadas geradas para classes sem ciclo original são aproximações pixeladas da pose idle; não são novas poses desenhadas à mão.

Para uma classe nova, além dos sprites, cadastre o ID em `src/data/classes.data.js`, defina atributos e raízes de sprites e verifique a seleção em `src/systems/ui/MenuManager.js`. O carregador espera as oito direções e seis quadros de caminhada; só criar a pasta não registra a classe.

## Monstros e bosses

O pré-carregamento está principalmente em `src/game.js`:

- Monstros PNG simples: `assets/monsters/<id>.png`, registrados em `monsterList`.
- Slimes: `assets/monsters/slimes/<id>.png`, registrados em `slimeList`.
- Boss Ashroot: `assets/monsters/guardian-ashroot/`; fonte em `boss-fase-1/` e empacotador em `tools/pack_directional_animation.py`.
- Boss Ashen Golem: `assets/monsters/boss_ashen_golem/`; suas animações têm carregamento dedicado em `src/systems/animation/BossAnimation.js`.

Um PNG novo só o torna carregável. Para fazê-lo aparecer como inimigo, também inclua o ID nos pools de monstros usados em `src/game.js` (por exemplo `themeMonsters` das dungeons) ou na lógica de geração da região. Para transformá-lo em chefe, atualize a configuração `bossSprite` da região e confirme se o desenho/animação especial depende de um ID específico.

Monstros comuns são dimensionados proporcionalmente à largura/altura nativas da imagem. Um sprite muito maior que os existentes pode ficar enorme; compare primeiro com um PNG vizinho e ajuste a escala de desenho em `src/game.js` quando necessário. Os bosses animados usam os empacotadores e pivôs das respectivas pastas `README.md`.

## Props, baús, minério e casas

O jogo pré-carrega listas explícitas em `src/game.js`:

- Props básicos: `assets/props/<id>.png`, lista `propList`.
- Baús: `assets/props/chests/<id>.png`, lista `chestList`.
- Veios minerais: `assets/props/ores/<id>.png`, lista `oreList`.
- Casas: `assets/props/houses/<id>.png`, lista de nomes `houseSprites`.

Exemplo para registrar um novo prop `altar_blue.png`:

1. Coloque o arquivo em `assets/props/altar_blue.png`, preferencialmente PNG RGBA transparente.
2. Acrescente `'altar_blue'` a `propList` em `src/game.js`. Isso pré-carrega a imagem.
3. Acrescente o objeto à lógica que cria `decor`/objetos da região e escolha como posicioná-lo e dimensioná-lo. A lista de pré-carregamento, sozinha, não o coloca no mapa.
4. Se ele precisar de colisão ou interação, implemente também essa lógica; o sprite não cria colisão automaticamente.

Para substituir um prop já usado, manter o mesmo nome/caminho é o jeito mais simples. Para alternar fechado/aberto de um baú, atualize os dois arquivos e as referências que definem `spriteKey`/estado aberto.

## Terreno, mapas e tiles

- Texturas de floresta usadas por `src/systems/world/WorldManager.js`: `assets/maps/tiles-clean/`. Os nomes ativos estão em `TILE_SOURCES` no início do arquivo. Um PNG de tile não entra no terreno automaticamente sem ser listado e desenhado.
- Atlas de peças: `assets/maps/tiles/` contém imagens de referência/peças individuais; adicionar ali, sem lógica de mapa correspondente, não altera a região.
- Piso do castelo: `assets/maps/castle_ruins_floor.png`, carregado em `src/systems/world/WorldManager.js`.
- Mapas de dungeon: `assets/maps/dungeons/dungeon_region_1.png` até `_5.png`, pré-carregados em `src/game.js`.
- Mapa CraftPix/VFX: `assets/dungeon/`; os arquivos ativos estão nos caminhos `torch_flame_strip.png`, `spike_trap_strip.png` e `dungeon_craftpix_level1.png` referenciados em `src/game.js`.

Trocar um mapa mantendo nome e dimensões normalmente não exige alteração do código. Para adicionar uma nova região/dungeon, também é preciso ampliar os loops/configuração de regiões e atualizar referências a ID, dados, colisões, entradas e saídas. O PNG isolado não cria essa lógica.

## Projéteis e efeitos

- Setas: `assets/projectiles/arrow/arrow_<direção>.png`.
- Magia: `assets/projectiles/magic/magic_<direção>.png`.
- Oito nomes usados: `east`, `south_east`, `south`, `south_west`, `west`, `north_west`, `north`, `north_east` (com `_` nesses arquivos).
- O pré-carregamento fica em `src/game.js`, no array `PROJECTILE_DIRS`.
- O golpe luminoso do herói usa `assets/effects/slash/slash_<direção>_<0|1|2>.png`; seu preload está em `src/entities/Player.js`.
- Outros efeitos especiais podem ter `frames/`, `atlas.json` e `README.md` próprios. Confira se há código carregando o atlas antes de criar um formato novo.

Para usar um efeito novo é necessário carregar a imagem e chamar `drawImage` na animação correta, cuidando do tempo, escala, direção e ponto de origem. Colocar PNG em `assets/effects/` não o reproduz automaticamente.

## Ícones, itens, interface e CSS

- Ícones de habilidades: em geral `assets/icons/skills/`; referências ficam em `public/index.html`, `src/data/classes.data.js`, `src/systems/ui/UIManager.js` e `src/game.js`.
- Ícones do castelo: `assets/icons/<nome>.png`, carregados por `src/game.js` ou pelos módulos do castelo.
- Moeda/cristal/poções: `assets/items/`; referências ficam em `public/index.html`, `src/game.js` e `src/systems/inventory/InventoryManager.js`.
- Armas: `assets/items/weapons/`. Para incluir uma arma no inventário, cadastre também atributos/`iconImg` em `src/systems/inventory/InventoryManager.js`.
- Logo e kit visual: `assets/ui/`; a logo aparece no HTML e imagens de interface podem ser ligadas por `public/styles.css`.
- Interface estática: altere `public/index.html` e `public/styles.css`; painéis e HUD são controlados por `src/game.js` e `src/systems/ui/`.

Exemplo de trocar o ícone de uma habilidade existente: coloque `icone_furia.png` em `assets/icons/skills/` e altere o caminho `iconImg` da habilidade correspondente em `src/data/classes.data.js`. Use uma imagem quadrada, com transparência, e confira o tamanho no HUD e no inventário.

## Regras práticas para a arte

1. Prefira PNG com transparência para personagens, monstros, objetos e efeitos. SVG é usado para alguns ícones/elementos simples.
2. Mantenha o estilo visual, a direção da luz, paleta, contorno e escala coerentes com assets vizinhos.
3. Em animações, mantenha tamanho de quadro e âncora iguais em todos os frames para evitar tremor.
4. Use exatamente os nomes de pasta/arquivo e direções esperados pelo código. `north-east` e `north_east`, por exemplo, não são intercambiáveis.
5. Se redimensionar pixel art, use vizinho mais próximo/`imageSmoothingEnabled = false`; interpolação suave deixa os pixels borrados.
6. Assets de origem podem ser grandes. Só copie para `assets/` a versão final que o jogo precisa carregar.
7. Após editar, execute `npm run build` e abra a prévia do Pages para conferir caminho, escala, transparência e enquadramento.

## Onde editar cada tipo de comportamento

| Quero alterar | Comece por |
|---|---|
| Caminho/atributos de uma classe | `src/data/classes.data.js` |
| Carregamento/desenho/animação do herói | `src/entities/Player.js` |
| Spawn, escala/desenho de monstros, objetos, baús, mapas | `src/game.js` |
| Textura/terreno e piso do castelo | `src/systems/world/WorldManager.js` |
| Ícones dinâmicos de habilidades | `src/data/classes.data.js`, `src/systems/ui/UIManager.js`, `src/game.js` |
| Atributos e ícone de arma/equipamento | `src/systems/inventory/InventoryManager.js` |
| Mapa-múndi, cartões e ícones de região | `src/systems/world/WorldMapManager.js` |
| Diálogo/serviços do castelo | `src/systems/castle/CastleHubManager.js` |
| HUD e elementos HTML estáticos | `public/index.html`, `src/systems/ui/UIManager.js`, `public/styles.css` |
| Gerar/recortar sprites e mapas | scripts de `tools/` e README da pasta de asset correspondente |

## Fluxo recomendado para qualquer adição

1. Decida se é uma substituição (mesmo arquivo) ou um asset novo.
2. Salve o arquivo final sob `assets/`, com nome curto e consistente.
3. Procure o loader existente com `rg -n "nome_do_arquivo|nome_do_id" src public/index.html public/styles.css`.
4. Para asset novo, inclua-o no preload/lista e também na lógica que o instancia/desenha.
5. Rode `npm run build`.
6. Confira o arquivo em `dist/assets/...` e abra o jogo para confirmar visualmente.
7. Registre o asset e os arquivos de código/documentação correspondentes no controle de versão configurado para o projeto; `dist/` é uma saída gerada.

