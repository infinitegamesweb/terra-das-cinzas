# Estado da conta e do save na nuvem

O código integra Supabase Auth e a tabela `player_saves`. A autenticação implementada cobre e-mail/senha, Google e Ethereum via SIWE. O save local permanece ativo e o código associa cada save remoto à identidade autenticada. A configuração dos provedores, a migração e a operação do serviço precisam ser verificadas no projeto Supabase antes de afirmar que o fluxo online está ativo.

## Implementação

- `src/systems/auth/AuthManager.js`: interface da conta, provedores de login e sincronização.
- `tools/build-pages.mjs`: injeta a URL do projeto e a chave pública `anon` no bundle; há fallbacks no `AuthManager.js` e o build empacota a autenticação.
- `migrations/supabase_player_saves.sql`: tabela, RLS restrita ao próprio usuário e RPC de gravação com revisão otimista.
- `src/game.js`: carrega o save local e agenda gravações locais e remotas.

O cliente autentica e seleciona apenas a linha com seu próprio `user_id`. Toda escrita remota passa por `save_player_save`, que valida o formato do save, limita o tamanho a 512 KiB e atualiza somente se a revisão esperada ainda for a atual. A tabela não concede escrita direta ao cliente; somente a RPC validada pode gravar. Quando duas sessões competem, a segunda gravação recebe conflito para o jogador escolher qual cópia manter.

O login Ethereum usa `supabase.auth.signInWithWeb3` e o fluxo Sign-In with Ethereum (SIWE). O Supabase verifica a prova da carteira antes de emitir a sessão; não se usa endereço em `localStorage` como identidade.

## Configuração necessária

1. Configurar Passwords, Google OAuth e Ethereum/Web3 no Supabase.
2. Adicionar os domínios de produção e desenvolvimento às URLs e redirects permitidos.
3. Conferir `tools/build-pages.mjs` e `src/systems/auth/AuthManager.js` para garantir que apontam ao projeto correto e que o bundle contém apenas a chave pública `anon`.
4. Executar `migrations/supabase_player_saves.sql` no SQL Editor do projeto. A migração é compatível com a tabela anterior e revoga as políticas públicas antigas.
5. No Cloudflare Pages, manter branch `main`, comando `npm run build` e saída `dist`.

## Limites e validação operacional

Sem a configuração do provedor, o jogo continua com save local. A autenticação, o SQL e o build precisam ser verificados no projeto Supabase e no deployment real; a execução do build não valida credenciais OAuth nem configuração de serviços externos.

O cliente ainda determina combate, XP, inventário e moeda. O save autenticado protege dados entre contas, mas não torna a progressão inviolável contra o próprio jogador. Uma economia compartilhada exigirá regras autoritativas no servidor.
