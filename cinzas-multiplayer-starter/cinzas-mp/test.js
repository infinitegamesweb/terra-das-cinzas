// Teste automatico: autenticacao por assinatura + multiplayer + protecoes
import assert from "assert";
import nacl from "tweetnacl";
import bs58 from "bs58";
import WebSocket from "ws";
import { start } from "./server.js";

const srv = await start(0);
const base = `http://localhost:${srv.port}`;
const post = (p, b) => fetch(base + p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b || {}) });

async function login(kp) {
  const { nonce, message } = await (await post("/auth/nonce")).json();
  const sig = nacl.sign.detached(new TextEncoder().encode(message), kp.secretKey);
  return { nonce, sig, res: await post("/auth/verify", { publicKey: bs58.encode(kp.publicKey), nonce, signature: Array.from(sig) }) };
}
function client(token, channel) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${srv.port}/ws?token=${token}`);
    const c = { ws, state: [], chat: [], actions: [], pongs: [], whispers: [], partyInvites: [], partyUpdates: [], partyChats: [], mobSyncs: [], mobDefeats: [] };
    ws.on("open", () => ws.send(JSON.stringify({ t: "join", channel })));
    ws.on("message", (d) => {
      const m = JSON.parse(d);
      if (m.t === "joined") { c.id = m.id; c.name = m.name; resolve(c); }
      if (m.t === "state") c.state = m.players;
      if (m.t === "chat") c.chat.push(m);
      if (m.t === "whisper") c.whispers.push(m);
      if (m.t === "action") c.actions.push(m);
      if (m.t === "pong") c.pongs.push(m);
      if (m.t === "party_invite") c.partyInvites.push(m);
      if (m.t === "party_update") c.partyUpdates.push(m.party);
      if (m.t === "party_chat") c.partyChats.push(m);
      if (m.t === "mob_sync") c.mobSyncs.push(m);
      if (m.t === "mob_defeated") c.mobDefeats.push(m);
    });
    ws.on("close", (code) => { c.closed = code; });
    ws.on("error", reject);
  });
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// 1. login valido
const a = nacl.sign.keyPair(), b = nacl.sign.keyPair();
const la = await login(a); assert.equal(la.res.status, 200); const ta = (await la.res.json()).token;
const lb = await login(b); const tb = (await lb.res.json()).token;
console.log("ok  login por assinatura valida");

// 2. assinatura invalida e nonce reutilizado
const { nonce } = await (await post("/auth/nonce")).json();
const bad = await post("/auth/verify", { publicKey: bs58.encode(a.publicKey), nonce, signature: Array(64).fill(1) });
assert.equal(bad.status, 401);
const replay = await post("/auth/verify", { publicKey: bs58.encode(a.publicKey), nonce: la.nonce, signature: Array.from(la.sig) });
assert.equal(replay.status, 401);
console.log("ok  assinatura falsa e replay de nonce rejeitados");

// 3. sem token nao conecta; convidado desligado por padrao
const anon = new WebSocket(`ws://localhost:${srv.port}/ws?token=xxx`);
await new Promise((r) => anon.on("close", (c) => { assert.equal(c, 4001); r(); }));
assert.equal((await post("/auth/guest")).status, 403);
console.log("ok  conexao sem token recusada; convidado desligado");

// 4. dois jogadores no mesmo canal se veem, movimento autoritativo
const ca = await client(ta, "bosque-1"), cb = await client(tb, "bosque-1");
await wait(150);
assert.equal(ca.state.length, 2); assert.equal(cb.state.length, 2);
const x0 = ca.state.find((p) => p.id === ca.id).x;
ca.ws.send(JSON.stringify({ t: "input", dx: 1, dy: 0 })); await wait(1000);
const x1 = cb.state.find((p) => p.id === ca.id).x;
assert.ok(x1 - x0 > 80 && x1 - x0 < 140, "movimento ~120px/s, foi " + (x1 - x0));
console.log("ok  jogadores se veem e o movimento e validado pelo servidor (" + (x1 - x0) + "px em 1s)");

// 5. cliente nao consegue acelerar (valores absurdos viram -1/0/1)
ca.ws.send(JSON.stringify({ t: "input", dx: 9999, dy: 9999 })); const xa = ca.state.find((p) => p.id === ca.id).x; await wait(1000);
const xb = ca.state.find((p) => p.id === ca.id).x;
assert.ok(xb - xa < 140, "speedhack bloqueado");
console.log("ok  tentativa de speedhack limitada");

// 6. chat com sanitizacao e canal isolado
const cc = await client((await (await login(nacl.sign.keyPair())).res.json()).token, "bosque-2");
ca.ws.send(JSON.stringify({ t: "chat", text: "<b>oi</b> mundo" })); await wait(200);
assert.equal(cb.chat.length, 1); assert.equal(cb.chat[0].text, "boi/b mundo");
assert.equal(cc.chat.length, 0);
console.log("ok  chat entregue so ao canal e sanitizado");

// 7. acoes de combate e VFX replicadas entre jogadores no mesmo canal
ca.ws.send(JSON.stringify({ t: "action", kind: "slash", x: 1050, y: 1050, color: "#f5d37b" }));
await wait(200);
assert.equal(cb.actions.length, 1);
assert.equal(cb.actions[0].kind, "slash");
assert.equal(cb.actions[0].fromId, ca.id);
console.log("ok  acoes de combate e VFX replicadas em tempo real");

// 8. ping e medicao de latencia pong
ca.ws.send(JSON.stringify({ t: "ping", ctime: 123456 }));
await wait(50);
assert.equal(ca.pongs.length, 1);
assert.equal(ca.pongs[0].ctime, 123456);
assert.ok(ca.pongs[0].stime > 0);
console.log("ok  ping e resposta pong com timestamp de latencia");

// 9. sussurro privado entre jogadores (/w e t: whisper)
ca.ws.send(JSON.stringify({ t: "whisper", to: cb.name, text: "segredo das cinzas" }));
await wait(100);
assert.equal(cb.whispers.length, 1);
assert.equal(cb.whispers[0].text, "segredo das cinzas");
assert.equal(cb.whispers[0].from, ca.name);
assert.equal(cb.whispers[0].incoming, true);
assert.equal(ca.whispers.length, 1);
assert.equal(ca.whispers[0].incoming, false);
console.log("ok  sussurro privado entregue com sucesso e isolado");

// 10. sistema de grupos / party (convite, aceite, chat e saída)
ca.ws.send(JSON.stringify({ t: "party_invite", to: cb.name }));
await wait(80);
assert.equal(cb.partyInvites.length, 1);
assert.equal(cb.partyInvites[0].fromId, ca.id);

cb.ws.send(JSON.stringify({ t: "party_accept", fromId: ca.id }));
await wait(80);
assert.ok(ca.partyUpdates.length >= 1);
assert.ok(cb.partyUpdates.length >= 1);
const latestUpdate = ca.partyUpdates[ca.partyUpdates.length - 1];
assert.equal(latestUpdate.members.length, 2);

ca.ws.send(JSON.stringify({ t: "party_chat", text: "vamos caçar o golem!" }));
await wait(80);
assert.equal(cb.partyChats.length, 2);
assert.equal(cb.partyChats[cb.partyChats.length - 1].text, "vamos caçar o golem!");

cb.ws.send(JSON.stringify({ t: "party_leave" }));
await wait(80);
assert.equal(cb.partyUpdates[cb.partyUpdates.length - 1], null);
console.log("ok  sistema de grupo: convite, aceite, chat e saída sincronizados");

// 11. sincronizacao de combate cooperativo: mob_hit e mob_sync
ca.ws.send(JSON.stringify({ t: "mob_hit", mobId: "boss_r1", dmg: 40, maxHp: 200, hp: 160, boss: true }));
await wait(80);
assert.ok(cb.mobSyncs.length >= 1);
const sync = cb.mobSyncs[cb.mobSyncs.length - 1];
assert.equal(sync.mobId, "boss_r1");
assert.equal(sync.dmg, 40);
assert.equal(sync.hp, 160);
assert.equal(sync.alive, true);

// Dano letal no chefe
ca.ws.send(JSON.stringify({ t: "mob_hit", mobId: "boss_r1", dmg: 200, maxHp: 200, hp: 0, boss: true }));
await wait(80);
const syncDead = cb.mobSyncs[cb.mobSyncs.length - 1];
assert.equal(syncDead.alive, false);
assert.equal(syncDead.hp, 0);
console.log("ok  sincronizacao de combate cooperativo: dano e vida de monstros compartilhados");

// 12. login duplicado derruba a conexao antiga
const ca2 = await client(ta, "bosque-1"); await wait(100);
assert.equal(ca.closed, 4002);
console.log("ok  login duplicado derruba sessao antiga");

console.log("\nTodos os testes passaram.");
srv.close(); process.exit(0);
