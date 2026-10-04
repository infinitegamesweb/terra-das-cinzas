# Terra das Cinzas - starter multiplayer + login com wallet

Fase 1 e 2 do plano técnico: servidor autoritativo em tempo real, canais, chat e login por assinatura de carteira Solana.

## Rodar
```
npm install
npm test          # testes automáticos
npm run dev       # http://localhost:3000 (modo convidado ligado, só para desenvolvimento)
```
Abra a página em duas abas, clique em "Entrar como convidado" e mova com WASD. Para testar com carteira (Phantom ou similar), use `npm start` e o botão "Conectar wallet". Em produção deixe o modo convidado desligado.

## Variáveis de ambiente
- `PORT` (padrão 3000)
- `DOMAIN` domínio que aparece na mensagem assinada (use o domínio real do jogo)
- `ALLOW_GUEST=true` só para desenvolvimento

## Como integrar no jogo atual
Copie `public/mp.js` para o projeto e use:
```js
import { CinzasNet } from "./mp.js";
const net = new CinzasNet();
await net.loginWithWallet();      // ou loginAsGuest() em dev
await net.connect("bosque-1");
net.onState = (players) => { /* desenhar os outros jogadores */ };
net.setInput(dx, dy);             // -1, 0 ou 1 (intenção de movimento)
net.sendChat("olá");
```

## O que já está protegido
- Servidor decide a posição; cliente envia só direção (sem speedhack).
- Login por assinatura, nonce de uso único com validade de 5 minutos, mensagem montada no servidor.
- Limite de mensagens por segundo, chat limitado e sanitizado, um login por conta.
- Só envia jogadores próximos (interest management).

## Limitações desta versão (para as próximas fases)
- Sessões e nonces ficam na memória e as sessões não expiram: use Redis/banco e expiração.
- Sem banco de dados: posição e progresso não persistem.
- Um único processo: para escalar, uma sala por processo/serviço.
- Falta HTTPS/WSS (use proxy reverso ou hospedagem com TLS) e CORS definido.
- Sem colisão com o mapa, combate, mobs ou inventário.
- Carteiras sem `signMessage` não funcionam. Para suporte amplo use o Solana Wallet Adapter / Sign In With Solana.
