# Publicação e serviços online

## Cloudflare Pages

- Branch de produção: `main`.
- Comando de build: `npm run build`.
- Diretório de saída: `dist`.
- Diretório raiz: `/`.
- Prévia local: `npm run dev:pages`.

O site é estático. O diretório `functions/` não precisa ser copiado para `dist`: Pages Functions deve permanecer na raiz do projeto, ao lado de `package.json`, e é detectado pelo pipeline do Pages. Atualmente, a autenticação e a persistência usam Supabase diretamente, portanto não há Pages Function nem binding D1 para configurar.

## Autenticação e saves

O jogo usa **Supabase Auth** para e-mail/senha, Google OAuth e carteira Ethereum por Sign-In with Ethereum (SIWE). O save fica na tabela `player_saves` do Supabase, com Row Level Security e função SQL `save_player_save` para validar o formato e aplicar controle otimista de revisão. A tabela permite leitura da própria linha; escritas diretas são revogadas e só a RPC validada pode gravar.

`js/cloud-config.js` contém a URL e a chave `anon` pública do Supabase. A chave `anon` foi feita para o cliente; nunca coloque `service_role`, senha de banco ou segredo OAuth no navegador ou no Git. Mantenha as credenciais de provedores no painel Supabase.

### Preparar Supabase

1. Confirme que `js/cloud-config.js` aponta para o projeto correto e contém apenas a chave `anon`.
2. No Supabase, habilite Passwords e Google no provedor de autenticação. Cadastre os domínios publicados e locais nas URLs permitidas e configure as credenciais OAuth do Google.
3. Habilite Ethereum/Web3 no Supabase Auth para SIWE.
4. Execute `migrations/supabase_player_saves.sql` no SQL Editor do Supabase. A migração atualiza as políticas sem apagar saves existentes, remove o acesso público antigo de carteiras e cria a RPC com controle de revisão.
5. Confira no Table Editor que RLS está ativo em `player_saves` e que somente `authenticated` pode ler ou gravar o próprio `user_id`.

O jogo continua funcionando com save local se Supabase não estiver configurado ou indisponível. Salves da nuvem só são usados após login autenticado.

### Desenvolvimento local

`npm run build` prepara a pasta `dist`. `npm run dev:pages` abre a prévia em `http://localhost:4173`. Use as URLs permitidas e redirect URLs locais configuradas no Supabase para testar OAuth.

## Limites do protótipo

O navegador ainda calcula combate, inventário, XP e moedas. RLS impede ler/alterar o save de outra conta, mas não prova que os valores enviados pelo próprio jogador são legítimos. Não use a economia atual para comércio entre jogadores ou ativos de valor real sem mover essas regras para um servidor autoritativo.

O login com carteira usa o fluxo SIWE do Supabase Auth, que verifica a assinatura e emite uma sessão Supabase. Uma assinatura arbitrária ou um endereço salvo em `localStorage` não é autenticação.

## Verificações no painel Pages

Confirme que o projeto `aetheria` está conectado a `infinitegamesweb/infinitewebgames`, publica `main`, e usa `npm run build` com saída `dist`. O painel do Cloudflare é a fonte de verdade para a conexão Git e configurações que não estão versionadas.
