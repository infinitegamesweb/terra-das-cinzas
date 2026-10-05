// Terra das Cinzas - servidor multiplayer (starter)
// Servidor AUTORITATIVO: o cliente envia so a intencao (direcao); o servidor move.
import express from "express";
import http from "http";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import nacl from "tweetnacl";
import bs58 from "bs58";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const CONFIG = {
  PORT: Number(process.env.PORT || 3000),
  DOMAIN: process.env.DOMAIN || "localhost",       // dominio que aparece na mensagem assinada
  ALLOW_GUEST: process.env.ALLOW_GUEST === "true", // so para desenvolvimento
  WORLD: { w: 5000, h: 5000 },
  SPEED: 120,            // pixels por segundo
  TICK_HZ: 20,
  INTEREST_RADIUS: 1600, // so envia jogadores proximos
  MAX_PER_CHANNEL: 50,
  MAX_PARTY_SIZE: 4,
  NONCE_TTL_MS: 5 * 60 * 1000,
  MSG_PER_SEC: 60,
};
export const CHANNELS = ["bosque-1", "bosque-2", "bosque-3"];

const nonces = new Map();   // nonce -> expiraEm
const sessions = new Map(); // token -> { pubkey, guest }
const parties = new Map();  // partyId -> { id, leaderId, members: Set(playerId) }
const channelMobs = new Map(); // channel -> Map(mobId -> { id, hp, maxHp, alive, boss, name, killerId })
let nextPartyId = 1;

function getPartyData(partyId) {
  const party = parties.get(partyId);
  if (!party) return null;
  const memberList = [];
  for (const pid of party.members) {
    for (const room of rooms.values()) {
      const p = room.get(pid);
      if (p) {
        memberList.push({
          id: p.id,
          name: p.name,
          classId: p.classId,
          lvl: p.lvl || 1,
          hp: p.hp || 100,
          maxHp: p.maxHp || 100,
          isLeader: p.id === party.leaderId
        });
        break;
      }
    }
  }
  return { id: party.id, leaderId: party.leaderId, members: memberList };
}

function broadcastParty(partyId) {
  const party = parties.get(partyId);
  if (!party) return;
  const data = getPartyData(partyId);
  const msg = JSON.stringify({ t: "party_update", party: data });
  for (const pid of party.members) {
    for (const room of rooms.values()) {
      const p = room.get(pid);
      if (p && p.ws.readyState === 1) p.ws.send(msg);
    }
  }
}

export function buildMessage(nonce) {
  return `${CONFIG.DOMAIN} quer que voce entre em Guerra das Cinzas com sua carteira Solana.\nNonce: ${nonce}`;
}
const shortName = (k) => k.slice(0, 4) + ".." + k.slice(-4);

export function createApp() {
  const app = express();
  app.use((_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    if (_req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use(express.json({ limit: "10kb" }));
  app.use(express.static(path.join(__dirname, "public")));

  app.post("/auth/nonce", (_req, res) => {
    const nonce = crypto.randomBytes(16).toString("hex");
    nonces.set(nonce, Date.now() + CONFIG.NONCE_TTL_MS);
    res.json({ nonce, message: buildMessage(nonce) });
  });

  app.post("/auth/verify", (req, res) => {
    const { publicKey, nonce, signature } = req.body || {};
    if (typeof publicKey !== "string" || typeof nonce !== "string" || !Array.isArray(signature))
      return res.status(400).json({ error: "dados invalidos" });
    const exp = nonces.get(nonce);
    nonces.delete(nonce); // uso unico, mesmo se falhar
    if (!exp || exp < Date.now()) return res.status(401).json({ error: "nonce invalido ou expirado" });
    let ok = false;
    try {
      const pk = bs58.decode(publicKey);
      ok = pk.length === 32 && nacl.sign.detached.verify(
        new TextEncoder().encode(buildMessage(nonce)), Uint8Array.from(signature), pk);
    } catch { ok = false; }
    if (!ok) return res.status(401).json({ error: "assinatura invalida" });
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, { pubkey: publicKey, guest: false });
    res.json({ token, publicKey, name: shortName(publicKey) });
  });

  app.post("/auth/guest", (_req, res) => {
    if (!CONFIG.ALLOW_GUEST) return res.status(403).json({ error: "modo convidado desligado" });
    const id = "guest" + crypto.randomBytes(3).toString("hex");
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, { pubkey: id, guest: true });
    res.json({ token, publicKey: id, name: id });
  });

  app.get("/channels", (_req, res) =>
    res.json(CHANNELS.map((c) => ({ id: c, players: (rooms.get(c) || new Map()).size, max: CONFIG.MAX_PER_CHANNEL }))));
  return app;
}

const rooms = new Map(CHANNELS.map((c) => [c, new Map()])); // canal -> Map(id -> player)
let nextId = 1;

export function start(port = CONFIG.PORT) {
  const server = http.createServer(createApp());
  const wss = new WebSocketServer({ server, path: "/ws", maxPayload: 2048 });

  wss.on("connection", (ws, req) => {
    const token = new URL(req.url, "http://x").searchParams.get("token");
    const sess = sessions.get(token);
    if (!sess) { ws.close(4001, "nao autenticado"); return; }
    // um login por conta: derruba a conexao antiga
    for (const room of rooms.values())
      for (const p of room.values())
        if (p.pubkey === sess.pubkey) { p.ws.close(4002, "login em outro lugar"); room.delete(p.id); }

    const me = { id: nextId++, pubkey: sess.pubkey, name: shortName(sess.pubkey), ws,
      channel: null, classId: "guerreiro", lvl: 1, x: 1000, y: 1000, dx: 0, dy: 0, msgs: 0, lastChat: 0,
      partyId: null, hp: 100, maxHp: 100 };
    const send = (o) => ws.readyState === 1 && ws.send(JSON.stringify(o));
    const leave = () => {
      if (me.partyId) {
        const party = parties.get(me.partyId);
        if (party) {
          party.members.delete(me.id);
          if (party.members.size === 0) {
            parties.delete(party.id);
          } else {
            if (party.leaderId === me.id) {
              party.leaderId = Array.from(party.members)[0];
            }
            broadcastParty(party.id);
            for (const pid of party.members) {
              for (const room of rooms.values()) {
                const p = room.get(pid);
                if (p && p.ws.readyState === 1) {
                  p.ws.send(JSON.stringify({ t: "party_chat", from: "GRUPO", text: `${me.name} saiu do grupo.` }));
                }
              }
            }
          }
        }
        me.partyId = null;
      }
      if (me.channel) rooms.get(me.channel)?.delete(me.id);
      me.channel = null;
    };
    const rl = setInterval(() => (me.msgs = 0), 1000);

    ws.on("message", (raw) => {
      if (++me.msgs > CONFIG.MSG_PER_SEC) return; // rate limit
      let m; try { m = JSON.parse(raw); } catch { return; }
      if (m.t === "join") {
        const room = rooms.get(m.channel);
        if (!room) return send({ t: "error", error: "canal invalido" });
        if (room.size >= CONFIG.MAX_PER_CHANNEL) return send({ t: "error", error: "canal cheio" });
        if (typeof m.classId === "string" && m.classId.trim()) me.classId = m.classId.trim().slice(0, 20);
        if (Number.isFinite(m.lvl)) me.lvl = Math.max(1, Math.min(300, Math.round(Number(m.lvl))));
        if (Number.isFinite(m.x)) me.x = Math.max(0, Math.min(CONFIG.WORLD.w, Number(m.x)));
        if (Number.isFinite(m.y)) me.y = Math.max(0, Math.min(CONFIG.WORLD.h, Number(m.y)));
        if (Number.isFinite(m.hp)) me.hp = Math.max(0, Math.round(Number(m.hp)));
        if (Number.isFinite(m.maxHp)) me.maxHp = Math.max(1, Math.round(Number(m.maxHp)));
        leave(); me.channel = m.channel; room.set(me.id, me);
        send({ t: "joined", id: me.id, channel: m.channel, name: me.name, classId: me.classId, lvl: me.lvl, world: CONFIG.WORLD });
      } else if (m.t === "input" && me.channel) {
        // so intencao: -1, 0 ou 1. O servidor decide o resto.
        me.dx = Math.max(-1, Math.min(1, Math.sign(Number(m.dx) || 0)));
        me.dy = Math.max(-1, Math.min(1, Math.sign(Number(m.dy) || 0)));
      } else if (m.t === "chat" && me.channel) {
        const now = Date.now();
        if (now - me.lastChat < 1000) return;
        const text = String(m.text || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 140);
        if (!text) return;
        me.lastChat = now;

        // Comando de grupo no chat: /p [mensagem] ou /party [mensagem]
        if (text.startsWith("/p ") || text.startsWith("/party ")) {
          if (!me.partyId) {
            send({ t: "chat", from: "SISTEMA", text: "Você precisa estar em um grupo para falar no chat do grupo (/p)." });
            return;
          }
          const pText = text.replace(/^\/(p|party)\s+/, "").trim();
          if (!pText) return;
          const party = parties.get(me.partyId);
          if (!party) return;
          const chatMsg = JSON.stringify({ t: "party_chat", from: me.name, fromId: me.id, text: pText });
          for (const pid of party.members) {
            for (const r of rooms.values()) {
              const p = r.get(pid);
              if (p && p.ws.readyState === 1) p.ws.send(chatMsg);
            }
          }
          return;
        }

        // Comando de sussurro no chat: /w [alvo] [mensagem]
        if (text.startsWith("/w ") || text.startsWith("/whisper ")) {
          const parts = text.split(" ");
          const targetName = parts[1];
          const whisperText = parts.slice(2).join(" ").trim();
          if (!targetName || !whisperText) {
            send({ t: "chat", from: "SISTEMA", text: "Uso: /w [jogador] [mensagem]" });
            return;
          }
          const room = rooms.get(me.channel);
          const target = Array.from(room ? room.values() : []).find(
            (p) => p.id !== me.id && (p.name.toLowerCase() === targetName.toLowerCase() || p.name.toLowerCase().startsWith(targetName.toLowerCase()))
          );
          if (!target) {
            send({ t: "chat", from: "SISTEMA", text: `Jogador '${targetName}' não encontrado no canal.` });
            return;
          }
          target.ws.readyState === 1 && target.ws.send(JSON.stringify({ t: "whisper", from: me.name, to: target.name, text: whisperText, incoming: true }));
          send({ t: "whisper", from: me.name, to: target.name, text: whisperText, incoming: false });
          return;
        }

        for (const p of rooms.get(me.channel).values()) p.ws.readyState === 1 &&
          p.ws.send(JSON.stringify({ t: "chat", from: me.name, text }));
      } else if (m.t === "whisper" && me.channel) {
        const targetName = String(m.to || "").trim();
        const whisperText = String(m.text || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 140);
        if (!targetName || !whisperText) return;
        const room = rooms.get(me.channel);
        const target = Array.from(room ? room.values() : []).find(
          (p) => p.id !== me.id && (p.name.toLowerCase() === targetName.toLowerCase() || p.name.toLowerCase().startsWith(targetName.toLowerCase()))
        );
        if (!target) {
          send({ t: "chat", from: "SISTEMA", text: `Jogador '${targetName}' não encontrado no canal.` });
          return;
        }
        target.ws.readyState === 1 && target.ws.send(JSON.stringify({ t: "whisper", from: me.name, to: target.name, text: whisperText, incoming: true }));
        send({ t: "whisper", from: me.name, to: target.name, text: whisperText, incoming: false });
      } else if (m.t === "party_invite" && me.channel) {
        const room = rooms.get(me.channel);
        if (!room) return;
        const targetName = String(m.to || "").trim();
        const targetId = Number(m.toId);
        const target = Array.from(room.values()).find(
          (p) => p.id !== me.id && (p.id === targetId || p.name.toLowerCase() === targetName.toLowerCase() || p.name.toLowerCase().startsWith(targetName.toLowerCase()))
        );
        if (!target) {
          send({ t: "chat", from: "SISTEMA", text: `Jogador não encontrado no canal.` });
          return;
        }
        if (target.partyId) {
          send({ t: "chat", from: "SISTEMA", text: `${target.name} já faz parte de um grupo.` });
          return;
        }
        if (me.partyId) {
          const party = parties.get(me.partyId);
          if (party && party.members.size >= CONFIG.MAX_PARTY_SIZE) {
            send({ t: "chat", from: "SISTEMA", text: `Seu grupo já atingiu o limite de ${CONFIG.MAX_PARTY_SIZE} aventureiros.` });
            return;
          }
        }
        target.ws.readyState === 1 && target.ws.send(JSON.stringify({
          t: "party_invite",
          fromId: me.id,
          fromName: me.name,
          classId: me.classId,
          lvl: me.lvl
        }));
        send({ t: "chat", from: "SISTEMA", text: `Convite de grupo enviado para ${target.name}.` });
      } else if (m.t === "party_accept" && me.channel) {
        if (me.partyId) return send({ t: "chat", from: "SISTEMA", text: "Você já está em um grupo." });
        const fromId = Number(m.fromId);
        const room = rooms.get(me.channel);
        const inviter = room ? room.get(fromId) : null;
        if (!inviter) {
          send({ t: "chat", from: "SISTEMA", text: "O convite expirou ou o jogador se desconectou." });
          return;
        }
        let partyId = inviter.partyId;
        if (partyId) {
          const party = parties.get(partyId);
          if (!party || party.members.size >= CONFIG.MAX_PARTY_SIZE) {
            send({ t: "chat", from: "SISTEMA", text: "O grupo está cheio ou não existe mais." });
            return;
          }
          party.members.add(me.id);
          me.partyId = partyId;
        } else {
          partyId = nextPartyId++;
          const party = { id: partyId, leaderId: inviter.id, members: new Set([inviter.id, me.id]) };
          parties.set(partyId, party);
          inviter.partyId = partyId;
          me.partyId = partyId;
        }
        broadcastParty(partyId);
        const partyMsg = JSON.stringify({ t: "party_chat", from: "GRUPO", text: `${me.name} entrou no grupo!` });
        const pParty = parties.get(partyId);
        if (pParty) {
          for (const pid of pParty.members) {
            for (const r of rooms.values()) {
              const p = r.get(pid);
              if (p && p.ws.readyState === 1) p.ws.send(partyMsg);
            }
          }
        }
      } else if (m.t === "party_decline" && me.channel) {
        const fromId = Number(m.fromId);
        const room = rooms.get(me.channel);
        const inviter = room ? room.get(fromId) : null;
        if (inviter && inviter.ws.readyState === 1) {
          inviter.ws.send(JSON.stringify({ t: "chat", from: "SISTEMA", text: `${me.name} recusou o convite de grupo.` }));
        }
      } else if (m.t === "party_leave") {
        if (!me.partyId) return;
        const party = parties.get(me.partyId);
        if (party) {
          party.members.delete(me.id);
          send({ t: "party_update", party: null });
          send({ t: "chat", from: "SISTEMA", text: "Você saiu do grupo." });
          if (party.members.size === 0) {
            parties.delete(party.id);
          } else {
            if (party.leaderId === me.id) {
              party.leaderId = Array.from(party.members)[0];
            }
            broadcastParty(party.id);
            for (const pid of party.members) {
              for (const r of rooms.values()) {
                const p = r.get(pid);
                if (p && p.ws.readyState === 1) {
                  p.ws.send(JSON.stringify({ t: "party_chat", from: "GRUPO", text: `${me.name} saiu do grupo.` }));
                }
              }
            }
          }
        }
        me.partyId = null;
      } else if (m.t === "party_chat") {
        if (!me.partyId) return send({ t: "chat", from: "SISTEMA", text: "Você não está em um grupo." });
        const text = String(m.text || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 140);
        if (!text) return;
        const party = parties.get(me.partyId);
        if (!party) return;
        const chatMsg = JSON.stringify({ t: "party_chat", from: me.name, fromId: me.id, text });
        for (const pid of party.members) {
          for (const r of rooms.values()) {
            const p = r.get(pid);
            if (p && p.ws.readyState === 1) p.ws.send(chatMsg);
          }
        }
      } else if (m.t === "party_vitals") {
        if (Number.isFinite(m.hp)) me.hp = Math.max(0, Math.round(Number(m.hp)));
        if (Number.isFinite(m.maxHp)) me.maxHp = Math.max(1, Math.round(Number(m.maxHp)));
        if (Number.isFinite(m.lvl)) me.lvl = Math.max(1, Math.round(Number(m.lvl)));
        if (me.partyId) {
          broadcastParty(me.partyId);
        }
      } else if (m.t === "ping") {
        send({ t: "pong", ctime: m.ctime, stime: Date.now() });
      } else if (m.t === "action" && me.channel) {
        const room = rooms.get(me.channel);
        if (!room) return;
        const actionMsg = JSON.stringify({
          t: "action",
          fromId: me.id,
          fromName: me.name,
          kind: String(m.kind || "slash").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 30),
          x: Math.round(Number(m.x) || me.x),
          y: Math.round(Number(m.y) || me.y),
          color: String(m.color || "#f5d37b").slice(0, 16),
          dir: String(m.dir || "south").slice(0, 12),
          to: m.to ? String(m.to).slice(0, 40) : undefined,
          toId: m.toId ? Number(m.toId) : undefined
        });
        for (const o of room.values()) {
          if (o.id !== me.id && o.ws.readyState === 1 && Math.hypot(o.x - me.x, o.y - me.y) <= CONFIG.INTEREST_RADIUS) {
            o.ws.send(actionMsg);
          }
        }
      } else if (m.t === "mob_hit" && me.channel) {
        const room = rooms.get(me.channel);
        if (!room) return;
        const mobId = String(m.mobId || "").slice(0, 60);
        if (!mobId) return;

        let channelMobMap = channelMobs.get(me.channel);
        if (!channelMobMap) {
          channelMobMap = new Map();
          channelMobs.set(me.channel, channelMobMap);
        }

        const dmg = Math.min(10000, Math.max(1, Math.round(Number(m.dmg) || 1)));
        const maxHp = Math.max(1, Math.round(Number(m.maxHp) || 200));
        let mobState = channelMobMap.get(mobId);

        if (!mobState || (!mobState.alive && Number(m.hp) > 0)) {
          mobState = {
            id: mobId,
            hp: Math.max(0, Math.min(maxHp, Math.round(Number(m.hp != null ? m.hp : maxHp)))),
            maxHp,
            alive: true,
            boss: Boolean(m.boss),
            name: String(m.mobName || "Criatura").slice(0, 40),
            lastHitBy: me.id
          };
          channelMobMap.set(mobId, mobState);
        } else {
          mobState.hp = Math.max(0, mobState.hp - dmg);
          mobState.alive = mobState.hp > 0;
          mobState.lastHitBy = me.id;
        }

        const syncMsg = JSON.stringify({
          t: "mob_sync",
          mobId,
          dmg,
          hp: mobState.hp,
          maxHp: mobState.maxHp,
          alive: mobState.alive,
          fromId: me.id,
          fromName: me.name,
          isCrit: Boolean(m.isCrit),
          boss: mobState.boss,
          x: Math.round(Number(m.x) || me.x),
          y: Math.round(Number(m.y) || me.y)
        });

        for (const o of room.values()) {
          if (o.ws.readyState === 1 && Math.hypot(o.x - me.x, o.y - me.y) <= CONFIG.INTEREST_RADIUS) {
            o.ws.send(syncMsg);
          }
        }

        if (!mobState.alive && me.partyId) {
          const party = parties.get(me.partyId);
          if (party) {
            const defMsg = JSON.stringify({
              t: "mob_defeated",
              mobId,
              boss: mobState.boss,
              mobName: mobState.name,
              killerId: me.id,
              killerName: me.name,
              partyId: me.partyId
            });
            for (const pid of party.members) {
              const p = room.get(pid);
              if (p && p.ws.readyState === 1) p.ws.send(defMsg);
            }
          }
        }
      }
    });
    ws.on("close", () => { clearInterval(rl); leave(); });
    ws.on("error", () => {});
  });

  // loop do servidor
  const dt = 1 / CONFIG.TICK_HZ;
  const loop = setInterval(() => {
    for (const room of rooms.values()) {
      if (!room.size) continue;
      for (const p of room.values()) {
        const len = Math.hypot(p.dx, p.dy) || 1;
        p.x = Math.max(0, Math.min(CONFIG.WORLD.w, p.x + (p.dx / len) * CONFIG.SPEED * dt));
        p.y = Math.max(0, Math.min(CONFIG.WORLD.h, p.y + (p.dy / len) * CONFIG.SPEED * dt));
      }
      for (const me of room.values()) {
        const near = [];
        for (const o of room.values())
          if (Math.hypot(o.x - me.x, o.y - me.y) <= CONFIG.INTEREST_RADIUS)
            near.push({ id: o.id, name: o.name, classId: o.classId, lvl: o.lvl || 1, x: Math.round(o.x), y: Math.round(o.y), dx: o.dx, dy: o.dy });
        me.ws.readyState === 1 && me.ws.send(JSON.stringify({ t: "state", players: near }));
      }
    }
  }, 1000 / CONFIG.TICK_HZ);

  return new Promise((resolve) => server.listen(port, () => resolve({
    server, port: server.address().port,
    close: () => { clearInterval(loop); wss.clients.forEach((c) => c.terminate()); server.close(); },
  })));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start().then(({ port }) => console.log(`Servidor em http://localhost:${port}  (convidado: ${CONFIG.ALLOW_GUEST})`));
}
