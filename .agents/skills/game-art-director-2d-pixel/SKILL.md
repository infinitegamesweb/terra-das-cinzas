---
name: game-art-director-2d-pixel
description: Define and guide visual direction for 2D pixel-art games, including cohesive characters, enemies, bosses, NPCs, environments, animation, and UI art. Use when reviewing or creating game visuals and assets.
---

# Direção de arte 2D em pixel art

Aplique esta skill ao dirigir ou revisar a linguagem visual de **Terra das Cinzas** e seus assets 2D.

## Contexto do projeto

- O jogo é um RPG de ação top-down para navegador, com fantasia sombria e regiões temáticas.
- Os assets servidos pelo jogo ficam em `public/assets/`; fontes e referências incluem `raw-assets/`, `D:\Game\assests e sprites` e materiais documentados em `GUIA_DE_ASSETS.md`.
- O canvas e os carregadores vivem principalmente em `src/game.js`, `src/entities/Player.js` e `src/systems/`; a interface HTML/CSS está em `public/index.html` e `public/styles.css`.
- Confirme caminhos e formatos no código atual. Guias antigos podem citar `js/`, `assets/` na raiz ou outro diretório de projeto.

## Método

1. Identifique a função do asset no jogo, tamanho exibido, escala nativa, perspectiva, fundo, paleta e animação exigida. Inspecione referências existentes e o contexto em que o sprite é desenhado.
2. Defina um pequeno padrão visual antes de produzir uma família: silhueta legível em tamanho de jogo, perspectiva top-down consistente, luz e contorno coerentes, clusters de pixels deliberados e paleta controlada por bioma/facção.
3. Dê aos personagens, NPCs, inimigos e chefes silhuetas e sinais de leitura distintos. Para chefes, alinhe antecipação, ataque, área de perigo, impacto e recuperação com a mecânica real.
4. Preserve a identidade de um personagem entre direções, equipamentos e animações. Mantenha dimensões de quadro, ponto de apoio no chão e pivô estáveis para evitar tremor.
5. Use a ferramenta de geração mais adequada disponível para o tipo de resultado: geração/edição de imagem para conceitos e arte raster; Spriterrific para spritesheets e ações de personagens, seguindo `.agents/skills/spriterrific-api/SKILL.md`. Geração automática é ponto de partida, não aprovação de arte.
6. Inspecione o resultado ampliado e em escala nativa, incluindo alpha, recortes, bordas, pivôs, consistência entre quadros e contraste sobre o cenário. Descarte variantes com anatomia, perspectiva ou leitura incoerentes.
7. Integre a versão escolhida em `public/assets/`, atualize apenas os carregadores e registros necessários, e confira renderização no jogo. Não deixe arquivo referenciado apenas em pastas de preview ou geração.

## Critérios de qualidade

- Leitura imediata da silhueta, pose, direção e estado da animação no tamanho real.
- Personagem separável do terreno por valor/contorno sem depender de brilho excessivo.
- Paleta, escala, iluminação, perspectiva e nível de detalhe compatíveis com assets vizinhos.
- Quadros com volume, acessórios e ponto de apoio coerentes; animações comunicam a ação e não apenas variam pixels.
- Interface pixel art permanece nítida em diferentes densidades de tela; texto e ícones continuam legíveis.
- Assets próprios ou gerados têm origem e licença registradas quando isso for necessário para distribuição.

## Limites

Não invente animações, itens ou sistemas de jogo que o código não suporta. Não substitua assets em lote sem identificar referências e comparar no jogo. Não presuma que uma ferramenta externa, modelo, chave, cota ou integração está disponível; verifique a capacidade e os custos antes do uso. Preserve prompts, arte-fonte e saídas aprovadas quando necessários para reproduzir o pipeline.
