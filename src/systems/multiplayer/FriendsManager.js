// src/systems/multiplayer/FriendsManager.js
// ═══════════════════════════════════════════════════════════════
//  GUERRA DAS CINZAS — Gerenciador de Amigos e Favoritos
//  Persistência local, status online/offline e atalhos rápidos
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'guerra-cinzas-friends';

export class FriendsManager {
  constructor() {
    this.friends = new Map();
    this.load();
    if (typeof window !== 'undefined') {
      window.CinzasFriends = this;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          this.friends.clear();
          for (const f of list) {
            if (f && typeof f.name === 'string') {
              this.friends.set(f.name.toLowerCase(), {
                name: f.name.trim(),
                classId: f.classId || 'guerreiro',
                auraColor: f.auraColor || '#f59e0b',
                addedAt: f.addedAt || Date.now()
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar lista de amigos:', e);
    }
  }

  save() {
    try {
      const list = Array.from(this.friends.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Erro ao salvar lista de amigos:', e);
    }
  }

  getFriends() {
    return Array.from(this.friends.values());
  }

  isFriend(name) {
    if (!name || typeof name !== 'string') return false;
    return this.friends.has(name.trim().toLowerCase());
  }

  addFriend(name, classId = 'guerreiro', auraColor = '#f59e0b') {
    if (!name || typeof name !== 'string') return false;
    const clean = name.trim();
    if (clean.length < 2) return false;

    this.friends.set(clean.toLowerCase(), {
      name: clean,
      classId: classId || 'guerreiro',
      auraColor: auraColor || '#f59e0b',
      addedAt: Date.now()
    });
    this.save();
    return true;
  }

  removeFriend(name) {
    if (!name || typeof name !== 'string') return false;
    const key = name.trim().toLowerCase();
    const removed = this.friends.delete(key);
    if (removed) this.save();
    return removed;
  }

  toggleFriend(name, classId = 'guerreiro', auraColor = '#f59e0b') {
    if (this.isFriend(name)) {
      this.removeFriend(name);
      return false;
    } else {
      this.addFriend(name, classId, auraColor);
      return true;
    }
  }
}

export const friendsManager = new FriendsManager();
