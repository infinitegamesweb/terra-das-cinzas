# Regras e Instruções Permanentes do Workspace: Guerra das Cinzas

Você é o agente de implementação do RPG web 2D Guerra das Cinzas, localizado em `D:\Game\terra-das-cinzas`. Preserve o nome do jogo e sua identidade de fantasia sombria em pixel art.

## Antes de trabalhar:
- Leia `AGENTS.md`/`GEMINI.md`, `AUTONOMOUS_DEVELOPMENT_MODE.md`, `GUIA_DE_ASSETS.md`, `README.md` e a documentação diretamente relacionada à tarefa.
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

---

## MODO DE TRABALHO DO AGENTE (PROMPT 00)

Você está trabalhando no projeto "Terra das Cinzas", um RPG dark fantasy 2D em pixel art.

### REGRAS ABSOLUTAS:
1. NÃO reescreva o projeto inteiro.
2. NÃO substitua a arquitetura atual sem justificativa técnica.
3. NÃO migre para React, Vue, Next.js ou outro framework.
4. Preserve a arquitetura JavaScript/HTML/CSS existente.
5. Antes de alterar código, leia os arquivos envolvidos.
6. Nunca presuma que a documentação antiga representa o estado atual.
7. O código atual é a fonte de verdade.
8. Faça mudanças pequenas, isoladas e verificáveis.
9. Nunca altere vários sistemas não relacionados na mesma tarefa.
10. Depois de cada alteração:
    - execute o build;
    - execute os testes disponíveis;
    - verifique erros de console quando possível;
    - revise os arquivos modificados.
11. Nunca remova uma funcionalidade apenas porque ela parece antiga.
12. Se encontrar código legado, primeiro determine se está sendo utilizado.
13. Não apagar assets sem provar que não são utilizados.
14. Não substituir assets existentes sem verificar suas referências.
15. Não modificar dados de gameplay sem documentar o impacto.
16. Não alterar balanceamento apenas por preferência estética.
17. Nunca expor secrets, tokens ou chaves.
18. Nunca imprimir conteúdo de .env.
19. Nunca incluir .env em commits.
20. Não editar dist/ manualmente. dist/ deve ser produzido pelo build.
21. Não alterar configurações de produção sem confirmar o impacto.
22. Evite alterações irreversíveis.
23. Antes de executar uma alteração grande, crie um plano.
24. Sempre informe: arquivos alterados, motivo, riscos, testes executados e resultado do build.

### AGENT EXECUTION POLICY:
- Prioridade: CORREÇÃO > COMPATIBILIDADE > SIMPLICIDADE > PERFORMANCE > ELEGÂNCIA.
- Não transforme tarefas de manutenção em redesign arquitetural.
- Processo: ANALISAR → PLANEJAR → IMPLEMENTAR → TESTAR → REVISAR → REPORTAR.
- Se descobrir um problema fora do escopo: NÃO interrompa. Registre `OUT_OF_SCOPE_FINDING` (PATH, PROBLEM, SEVERITY, RECOMMENDATION) e continue a tarefa atual.
