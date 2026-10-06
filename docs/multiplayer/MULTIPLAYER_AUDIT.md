# Auditoria de Arquitetura Multiplayer — Guerra das Cinzas

**Documento:** `docs/multiplayer/MULTIPLAYER_AUDIT.md`  
**Escopo:** Topologia Client -> WebSocket -> Worker -> Durable Object -> Canais e Vulnerabilidades  
**Alinhamento:** Master Plan (Fase 10 / Prompt 20)

---

## 1. Topologia e Fluxo de Conexão

```
[Navegador / Cliente Web]
       |
       | 1. POST /api/channels/{id}/ticket (Bearer Token Supabase)
       v
[Cloudflare Worker: handleRequest]
       |
       | Valida autenticação no Supabase (/auth/v1/user)
       | Obtém referência da Durable Object (env.GAME_CHANNEL.getByName)
       v
[GameChannel Durable Object (SQLite / KV)]
       |
       | Cria join_ticket (SHA-256, TTL 30s) na tabela SQL join_tickets
       v
[Resposta HTTP 200: Ticket UUID]
       |
       | 2. GET /ws/{id}?ticket=... (Upgrade: websocket)
       v
[GameChannel.fetch(request)]
       |
       | Valida e consome o ticket (DELETE FROM join_tickets)
       | this.ctx.acceptWebSocket(server)
       | Adiciona attachment: { userId, displayName, joinedAt }
       | Envia 'welcome' e transmite 'player_joined' aos demais
```

---

## 2. Matriz de Sincronização: Real vs Local

| Funcionalidade | Estado Real na Rede | Estado Atual no Servidor | Autoridade |
|---|---|---|---|
| **Presença Global** | Sincronizado | Ativo via WebSocket (Entrada, Saída, Contagem de Jogadores) | **Servidor** |
| **Lista de Canais** | Sincronizado | 12 canais com capacidade de 100 jogadores cada | **Servidor** |
| **Posicionamento (X, Y)**| Local / Desconectado | O servidor fecha socket com 4400 se receber movimento | **Cliente Total** |
| **Combate & HP de Mobs** | Local simulado | O servidor não processa dano nem posições de monstros | **Cliente Total** |
| **Nível, XP e Atributos** | Salvo no LocalStorage/Supabase | O servidor WebSocket não audita valores | **Cliente Total** |
| **Inventário & Itens** | LocalStorage / Save | Não transitado via servidor autoritativo | **Cliente Total** |
| **Grupo (Party)** | Mock / Local | Tratado apenas em `PartyManager.js` na aba do jogador | **Cliente** |
| **Negociação (Trade)** | Mock / Local | Tratado em `TradeManager.js` sem escrow no servidor | **Cliente** |
| **Chat Global** | Inativo no servidor atual | Fecha conexão se enviado no Durable Object | **Cliente** |

---

## 3. Diagnóstico de Vulnerabilidades e Exploits Críticos

### 3.1 Fechamento Agressivo de Conexão (Desconexão por Pacote não Reconhecido)
- Em `multiplayer/src/index.js`, linha 239:
  ```javascript
  if (payload?.type === 'ping') {
    this.safeSend(socket, JSON.stringify({ type: 'pong', at: Date.now() }));
    return;
  }
  socket.close(4400, 'Tipo de mensagem ainda não suportado.');
  ```
- **Problema:** Qualquer envio de chat, ação ou sincronização enviado por `CinzasNet.js` causa desconexão forçada imediata do jogador do canal multiplayer.

### 3.2 Exploit de Duplicação de Itens em Trocas (Trade Exploit)
- Como os itens residem exclusivamente na memória do cliente (`window.GameItems`), se dois jogadores iniciarem uma troca e um deles fechar a aba do navegador antes de salvar, os itens transferidos permanecem intactos no save do remetente, resultando em duplicação 100% reproduzível.

### 3.3 Exploit de XP e Level Skip
- As chamadas `progression.enemyXp()` e `p.lvl++` são puramente locais no client-side. Um jogador com ferramentas de desenvolvedor (DevTools) pode alterar `p.lvl = 300` e forçar o salvamento local.

### 3.4 Falta de Rate Limiting e Sanitização no WebSocket
- O Durable Object apenas valida `message.length > 256`. Não há controle de frequência de mensagens (rate limit por segundo), permitindo flood de `ping` que pode esgotar a cota da Cloudflare.

---

## 4. Recomendações para a Fase Social (Prompt 21)

1. **Permitir Tipos Sociais Seguros no Servidor:** Atualizar o Durable Object para aceitar mensagens de `chat`, `party_invite`, `party_leave` e encaminhá-las aos sockets do mesmo canal sem fechar com erro 4400.
2. **Desacoplamento de Combate:** Manter combate e inventário como single-player / client-authoritative por enquanto, limitando a rede estritamente à presença e interação social.
3. **Reconexão com Backoff Exponencial:** Aprimorar o `CinzasNet.js` para tentar reconectar automaticamente com intervalos de 1s, 2s, 4s, 8s em caso de oscilação de rede.
