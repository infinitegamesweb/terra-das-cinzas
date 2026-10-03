# Colosso da Fornalha Rubra — animação e atlas

Asset criado para o RPG top-down *Terra das Cinzas: A Deep RPG*.

## Especificação

- Fonte de identidade visual: `../../../boss-fase3/Idle/rotations/south.png`.
- Animação inicial: `idle`, 8 quadros em loop.
- Quadro final: 64 × 64 px, RGBA, com o pivô no centro horizontal e na linha inferior.
- Sprite sheet: 4 colunas × 2 linhas; leitura da esquerda para a direita e de cima para baixo.
- Arte: pixel art de fantasia sombria, basalto escuro, veios de lava vermelho-alaranjados e núcleo incandescente.
- Fundo de geração: magenta sólido, removido no processamento para entregar alpha transparente.

## Origem

Os quadros-fonte foram gerados via Cloudflare Workers AI usando FLUX.2 Klein 9B e a arte existente como referência. A imagem original gerada é preservada como `source/idle-sheet-source.png`; os quadros recortados e a spritesheet final são derivados de modo determinístico.

O prompt completo está em `source/idle-sheet-prompt.txt`. O atlas `atlas.json` descreve as coordenadas e a duração dos quadros. O construtor reutilizável está em `tools/build_sprite_atlas.py`.
