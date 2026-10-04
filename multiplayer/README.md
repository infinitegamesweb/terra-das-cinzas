# Canais multiplayer (fundação da etapa 1)

## Capacidade configurada

- 12 salas nomeadas de `world-01` a `world-12`.
- Limite de 100 sessões conectadas por sala; capacidade total teórica: 1.200 conexões.
- Um Durable Object SQLite por canal, com ticket de entrada de uso único e validade de 30 segundos.
- A identidade de cada conexão é validada pelo endpoint `/auth/v1/user` do Supabase. Configure `SUPABASE_ANON_KEY` como secret do Worker; não use a service-role key.
- O canal sincroniza entrada, saída e ocupação. **Esta etapa ainda não sincroniza posição, inimigos, combate, inventário, XP ou saques**; o navegador continua sendo a autoridade do jogo local.

## Desenvolvimento local

1. Configure a chave pública anon do projeto Supabase para o runtime local do Wrangler. O valor pode ser o mesmo anon key público já usado pelo cliente:

   ```powershell
   npx wrangler secret put SUPABASE_ANON_KEY --config multiplayer/wrangler.jsonc
   ```

   Para desenvolvimento local, crie `multiplayer/.dev.vars` com `SUPABASE_ANON_KEY=...`. Esse arquivo não deve ser commitado.

2. Em um terminal, inicie o Worker:

   ```powershell
   npx wrangler dev --config multiplayer/wrangler.jsonc --port 8787
   ```

3. Em outro terminal, gere/abra o jogo com `npm run build` e `npm run preview`. A prévia local aponta para `http://127.0.0.1:8787` automaticamente.

## API

- `GET /health`: estado do serviço e limites configurados.
- `GET /api/channels`: ocupação pública dos 12 canais.
- `POST /api/channels/:id/ticket`: exige `Authorization: Bearer <Supabase access token>` e emite ticket temporário.
- `GET /ws/:id?ticket=...`: consome o ticket e abre a conexão WebSocket.
- Mensagem WebSocket suportada nesta etapa: `{"type":"ping"}`. Mensagens de movimento são rejeitadas até existir simulação autoritativa no servidor.

## Produção

- Publique este Worker separadamente com `npx wrangler deploy --config multiplayer/wrangler.jsonc` depois de revisar a conta/domínio de destino.
- Configure `SUPABASE_ANON_KEY` em Workers Secrets.
- Adicione o endereço final do Worker como variável de build `GAME_MULTIPLAYER_URL` nas configurações do Cloudflare Pages. A origem publicada do jogo já está na allowlist inicial; atualize `ALLOWED_ORIGINS` se o domínio mudar.
- O Pages continua servindo o jogo estático. Publicar o Worker não transforma combate/save client-side em multiplayer autoritativo.

## Próximas etapas antes de anunciar multiplayer

1. Sincronizar posição com validação de velocidade e colisão no servidor.
2. Tornar servidor autoritativo para combate, inimigos, drops, XP e inventário.
3. Filtrar mensagens por proximidade/interesse e medir CPU, memória, latência e desconexões.
4. Rodar testes de carga graduais (20, 50 e 100 por canal; depois 12 canais simultâneos) e ajustar o limite com dados reais.
