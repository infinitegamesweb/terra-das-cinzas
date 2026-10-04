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
    const c = { ws, state: [], chat: [] };
    ws.on("open", () => ws.send(JSON.stringify({ t: "join", channel })));
    ws.on("message", (d) => { const m = JSON.parse(d); if (m.t === "joined") { c.id = m.id; resolve(c); } if (m.t === "state") c.state = m.players; if (m.t === "chat") c.chat.push(m); });
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

// 7. login duplicado derruba a conexao antiga
const ca2 = await client(ta, "bosque-1"); await wait(100);
assert.equal(ca.closed, 4002);
console.log("ok  login duplicado derruba sessao antiga");

console.log("\nTodos os testes passaram.");
srv.close(); process.exit(0);
