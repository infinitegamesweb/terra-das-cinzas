# Regras e Instruções Permanentes do Workspace: Guerra das Cinzas

Você é o agente de implementação do RPG web 2D Guerra das Cinzas, localizado em `D:\Game\terra-das-cinzas`. Preserve o nome do jogo e sua identidade de fantasia sombria em pixel art.

## Antes de trabalhar:
- Leia `AGENTS.md`/`GEMINI.md` e instruções locais aplicáveis, `GUIA_DE_ASSETS.md`, `README.md` e a documentação diretamente relacionada à tarefa.
- Inspecione o estado do Git e localize no código como o sistema ou asset funciona hoje. Não presuma que documentos antigos correspondem ao código atual.
- Identifique e use as skills relevantes; consulte `/skills` se precisar verificar quais foram carregadas.
- Para tarefas amplas, use Planning Mode: pesquise, descreva o plano e então implemente a tarefa solicitada. Não encerre apenas com um plano quando o pedido for para realizar o trabalho.

## Implementação:
- Faça mudanças completas, mas mantenha o escopo ligado ao pedido. Evite refatorações e alterações de arquivos alheios à tarefa.
- Preserve saves, compatibilidade, caminhos de assets e comportamento existente, a menos que a tarefa exija mudanças explícitas.
- Código-fonte fica em `src/` e `public/`; assets finais em `public/assets/`. O build oficial é `npm run build`, com configuração em `tools/build-pages.mjs`. `dist/` é gerado; não edite à mão.
- Para pixel art, confira dimensões, alpha real, recorte, pivô, paleta, perspectiva, escala e leitura em tamanho de jogo. Redimensione com vizinho mais próximo.
- Para arte nova, use primeiro `art-staging/<tarefa>/`. Mantenha prompt, fonte e manifesto. Não substitua arte ativa sem solicitação explícita.

## Verificação e entrega:
- Execute o build e verificações pertinentes disponíveis no projeto; não invente que executou um teste ou fluxo que não executou.
- Quando a interface ou o jogo mudar, confira o fluxo afetado no navegador e observe console/rede se as ferramentas estiverem disponíveis.
- Revise o diff para detectar mudanças não relacionadas, arquivos gerados, dados pessoais e credenciais.
- Ao finalizar cada etapa, faça uma revisão estruturada do que mudou (principais arquivos, validações realizadas e resultados) e apresente opções recomendadas para o próximo passo a seguir.
- Pode fazer edições locais reversíveis necessárias à tarefa. Pare e peça minha decisão antes de excluir dados importantes, publicar/deployar, mudar configurações externas, executar migrações de produção ou expor/alterar credenciais.
- Nunca imprima nem copie conteúdo de `.env`, tokens, chaves privadas ou credenciais. Não coloque segredo no código, prompt, Git ou configuração MCP versionada.
