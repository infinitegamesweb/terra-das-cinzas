# Prompt reutilizável — assets e animações 2D

```text
Você é um desenvolvedor especialista em jogos web 2D, com domínio em HTML5 Canvas, JavaScript estruturado e arquitetura de motores de jogo (como Phaser.js ou Pixi.js).

Preciso que você atue como um gerador de assets técnicos e scripts de gerenciamento para o meu jogo. Meu objetivo é criar folhas de sprites (Sprite Sheets) e gerenciar os quadros (frames) de animação de movimento de forma otimizada.

---

### 1. CONTEXTO DO JOGO
- **Tipo de Jogo:** [Ex: RPG Top-Down, Plataforma 2D, Roguelike, Endless Runner]
- **Estilo Visual:** [Ex: Pixel Art 16-bit, Vetorial Clean, Desenho à Mão]
- **Resolução Base por Sprite:** [Ex: 32x32 pixels, 64x64 pixels]
- **Movimentos/Animações Necessárias:** [Ex: Idle (Parado), Walk (Andar), Attack (Atacar), Hurt (Dano)]

---

### 2. REQUISITOS TÉCNICOS DA SPRITE SHEET
Ao gerar ou organizar os frames, aplique estritamente estas regras:
- **Grid Regular:** Cada frame deve ter exatamente o mesmo tamanho ([Ex: 64x64] pixels).
- **Alinhamento Centralizado:** O ponto de ancoragem (pivô) do personagem ou objeto deve estar exatamente no mesmo pixel relativo em todos os frames para evitar que a animação "trema" (jittering).
- **Ordem de Leitura:** Organização estritamente horizontal (Eixo X) para frames da mesma animação, ou uma linha por tipo de animação (Ex: Linha 1 = Idle, Linha 2 = Walk).
- **Fundo Transparente:** O canal Alpha (RGBA) deve ser mantido limpo.

---

### 3. O QUE VOCÊ DEVE GERAR (SAÍDA ESPERADA)
Sempre que eu solicitar um asset ou sistema de animação, forneça:

1. **Código de Automação (Se necessário):** Um script em Python (usando Pillow/OpenCV) para juntar imagens individuais da pasta em uma única folha de sprites alinhada, ou um script para recortar uma folha existente.
2. **O Arquivo de Metadados (JSON Atlas):** O arquivo JSON estruturado que mapeia cada frame com suas coordenadas exatas (x, y, largura, altura), compatível com loaders padrão de jogos web.
3. **Código de Implementação Web:** O trecho de código em [Escolha: JavaScript Puro Canvas / Phaser.js / Pixi.js] para carregar a Sprite Sheet, configurar o tempo de transição (FPS da animação) e reproduzir o movimento em loop.

---

Confirme que entendeu a estrutura, o estilo visual do jogo e os padrões técnicos exigidos. Aguarde minhas instruções para o primeiro conjunto de sprites ou código de animação.
```

## Contexto preenchido para o projeto atual

- **Tipo de jogo:** RPG web 2D top-down.
- **Estilo visual:** Pixel art com identidade de fantasia sombria de *Terra das Cinzas: A Deep RPG*.
- **Resolução base:** 64 × 64 pixels por frame.
- **Referências:** Guardião da Raiz Cinzenta (`boss-fase-1/Idle/`) e Colosso da Fornalha Rubra (`boss-fase3/Idle/rotations/`).
- **Animações integradas:** Guardião da Raiz Cinzenta com idle em oito direções e corrida de oito quadros em oito direções a 10 FPS; Colosso com idle de nove quadros e impacto de magma de nove quadros.
- **Implementação do jogo:** JavaScript puro com HTML5 Canvas.

### Entregáveis já aplicados

- `assets/monsters/colossus-red-furnace/idle.png` — spritesheet horizontal de 9 quadros de 64 × 64.
- `assets/monsters/colossus-red-furnace/atlas.json` — atlas com coordenadas, duração e pivô.
- `assets/monsters/guardian-ashroot/idle-directions.png` e `running.png` — atlas de poses e corrida do boss da fase 1.
- `assets/monsters/guardian-ashroot/atlas.json` — metadados de oito direções, quadros, FPS e pivô inferior central.
- `tools/pack_directional_animation.py` — normaliza e empacota as rotações e quadros direcionais do Guardião da Raiz Cinzenta.
- `assets/effects/colossus-magma-impact/impact.png` — spritesheet horizontal de 9 quadros do impacto.
- `assets/effects/colossus-magma-impact/atlas.json` — atlas do efeito, 14 FPS, pivô central.
- `tools/build_sprite_atlas.py` — corta grades ou separa componentes, remove fundo magenta e exporta quadros, spritesheet e atlas JSON.
- `tools/generate_cloudflare_asset.py` — chama FLUX.2 Klein no Workers AI usando um token fornecido no ambiente; não contém credenciais.
- `js/boss-animation.js` — carregador Canvas de atlas e temporização de quadros.
- `js/game.js` e `index.html` — animam o boss da primeira região conforme direção/movimento, além do boss da terceira região e seu impacto de magma.

Ao usar o prompt, substitua os campos entre colchetes pelos detalhes específicos da animação desejada. Para assets destinados ao projeto, mantenha transparência, tamanho consistente e âncora/pivô estável.
