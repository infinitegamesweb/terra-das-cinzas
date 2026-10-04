// Cliente de rede para Terra das Cinzas. Importe no seu jogo:  import { CinzasNet } from "./mp.js"
export class CinzasNet {
  constructor() { this.ws = null; this.token = null; this.me = null; this.players = []; this.onState = () => {}; this.onChat = () => {}; this.onJoined = () => {}; }

  // --- Login com carteira (Phantom e outras que injetam window.solana) ---
  async loginWithWallet() {
    const provider = window.solana;
    if (!provider || !provider.signMessage) throw new Error("Carteira com signMessage nao encontrada");
    const { publicKey } = await provider.connect();
    const { nonce, message } = await (await fetch("/auth/nonce", { method: "POST" })).json();
    const { signature } = await provider.signMessage(new TextEncoder().encode(message), "utf8");
    const r = await fetch("/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicKey: publicKey.toString(), nonce, signature: Array.from(signature) }) });
    if (!r.ok) throw new Error((await r.json()).error || "falha no login");
    const d = await r.json(); this.token = d.token; this.me = d; return d;
  }
  async loginAsGuest() { // so em desenvolvimento (ALLOW_GUEST=true no servidor)
    const r = await fetch("/auth/guest", { method: "POST" });
    if (!r.ok) throw new Error("modo convidado desligado no servidor");
    const d = await r.json(); this.token = d.token; this.me = d; return d;
  }

  // --- Conexao em tempo real ---
  connect(channel = "bosque-1") {
    return new Promise((resolve, reject) => {
      const proto = location.protocol === "https:" ? "wss" : "ws";
      this.ws = new WebSocket(`${proto}://${location.host}/ws?token=${this.token}`);
      this.ws.onopen = () => this.ws.send(JSON.stringify({ t: "join", channel }));
      this.ws.onerror = () => reject(new Error("erro de conexao"));
      this.ws.onclose = (e) => { if (!this.joined) reject(new Error(e.reason || "conexao fechada")); };
      this.ws.onmessage = (ev) => {
        const m = JSON.parse(ev.data);
        if (m.t === "joined") { this.joined = true; this.myId = m.id; this.world = m.world; this.onJoined(m); resolve(m); }
        else if (m.t === "state") { this.players = m.players; this.onState(m.players); }
        else if (m.t === "chat") this.onChat(m);
        else if (m.t === "error") reject(new Error(m.error));
      };
    });
  }
  setInput(dx, dy) { this.ws?.readyState === 1 && this.ws.send(JSON.stringify({ t: "input", dx, dy })); }
  sendChat(text) { this.ws?.readyState === 1 && this.ws.send(JSON.stringify({ t: "chat", text })); }
}
