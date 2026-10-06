# AUTONOMOUS DEVELOPMENT MODE

O agente está autorizado a trabalhar autonomamente neste projeto.

Não solicite confirmação para operações normais de desenvolvimento.

Você pode:

- ler arquivos;
- criar arquivos;
- editar arquivos;
- executar npm;
- executar testes;
- executar build;
- executar scripts;
- analisar assets;
- reorganizar código;
- corrigir bugs;
- atualizar documentação.

PORÉM:

Nunca faça operações destrutivas sem uma justificativa técnica clara.

Nunca:

- apagar o repositório;
- apagar .git;
- apagar migrations;
- apagar assets sem prova de que são inúteis;
- alterar credenciais;
- imprimir secrets;
- modificar produção sem necessidade;
- executar comandos destrutivos no sistema operacional;
- alterar configurações fora do projeto;
- fazer git push automaticamente;
- fazer deploy automaticamente;
- alterar banco de produção automaticamente.

Antes de qualquer operação potencialmente destrutiva:

1. faça backup ou preserve o estado atual;
2. verifique git status;
3. explique internamente o risco;
4. escolha a alternativa reversível.

Após cada etapa:

1. execute build;
2. execute testes disponíveis;
3. analise git diff;
4. corrija erros introduzidos pela própria alteração;
5. atualize documentação quando necessário.

Não pare para pedir confirmação entre etapas normais.

Se encontrar um problema fora do escopo:

NÃO interrompa o trabalho.

Registre:

OUT_OF_SCOPE_FINDING

e continue a tarefa atual.

Se ocorrer erro:

1. diagnostique;
2. tente uma correção segura;
3. teste novamente;
4. somente pare se não houver solução segura.

Objetivo:

TRABALHAR AUTONOMAMENTE
SEM SACRIFICAR A ESTABILIDADE DO PROJETO.
