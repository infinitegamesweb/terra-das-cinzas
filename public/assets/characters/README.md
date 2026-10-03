# Classes jogáveis

As seis classes podem ser escolhidas ao iniciar uma nova jornada. Os retratos e sprites idle direcionais vêm das respectivas pastas originais:

| Classe | Pasta de sprites | Perfil no protótipo |
|---|---|---|
| Guerreiro | `guerreiro/Create_an_original_chibi-Idle/Idle/` | Equilibrado |
| Arqueiro | `arqueiro/Idle/` | Ataque físico à distância |
| Assassino | `assasino/Idle/` | Dano físico e golpes críticos |
| Bárbaro | `barbaro/Idle/` | Vida alta e dano físico |
| Clérigo | `clerigo/Idle/` | Resistência, magia e poções melhores |
| Mago | `mago(a)/Idle/` | Dano arcano alto e pouca defesa |

Cada classe usa sprites idle em oito direções. O Guerreiro já tinha caminhada própria. Como as outras cinco pastas só continham poses estáticas, `tools/build_class_walks.py` criou ciclos de seis quadros com pequenas passadas pixeladas, pivô inferior fixo e atlas JSON para cada direção. Esses ciclos são aproximações derivadas das poses existentes, não novas ilustrações desenhadas à mão. As classes sem animação de ataque usam o efeito de golpe compartilhado do jogo.

Para reconstruir os atlas de caminhada, a partir da raiz do projeto:

```powershell
python tools/build_class_walks.py
```

Os modificadores de combate ficam em `js/classes.js`; o carregamento e a seleção ficam em `js/player.js` e `js/menu.js`.
