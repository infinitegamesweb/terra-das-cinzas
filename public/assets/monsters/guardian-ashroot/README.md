# Guardião da Raiz Cinzenta

Atlas de animação direcional integrado à região 1 de *Terra das Cinzas: A Deep RPG*.

- Fonte original: `boss-fase-1/Idle/` (rotações idle e animação Running em oito direções).
- `idle-directions.png`: oito poses de 64 × 64, uma por direção.
- `running.png`: oito quadros por direção, oito linhas, 64 × 64 por quadro, 10 FPS.
- `south.png`: pose para fallback estático durante o carregamento dos atlas.
- `atlas.json`: coordenadas, duração, pivô inferior central e referências aos quadros.
- `frames/`: quadros normalizados individualmente em PNG RGBA transparente.

Os quadros foram redimensionados com vizinho mais próximo e alinhados por um pivô inferior central fixo para manter a base do boss estável durante a animação.

Para reconstruir os arquivos, a partir da raiz do jogo:

```powershell
python tools/pack_directional_animation.py 'boss-fase-1/Idle' 'assets/monsters/guardian-ashroot' --fps 10
```
