// src/systems/quests/QuestManager.js
// ─────────────────────────────────────────────────────────────
// GUERRA DAS CINZAS · Gerenciador de Missões, Objetivos e NPCs
// ─────────────────────────────────────────────────────────────

export const QUEST_DATABASE = [
  // ─── REGIÃO 01: BOSQUE DAS RUÍNAS ───
  {
    id: 'q_miraluz_ruins',
    title: 'O Despertar nas Cinzas',
    category: 'principal',
    regionId: 1,
    giver: 'Vigia Maerin',
    giverId: 'npc_maerin',
    minLevel: 1,
    summary: 'As ruínas de Miraluz foram tomadas por criaturas sombrias despertadas pela queda do eclipse. O Vigia Maerin precisa que você limpe os arredores para restabelecer o acampamento dos errantes.',
    dialogIntro: 'Errante... Você sobreviveu à travessia das cinzas. Nossas defesas foram rompidas por espíritos corrompidos do bosque. Empunhe sua arma e elimine os invasores para que possamos respirar.',
    dialogProgress: 'Ainda vejo sombras rondando as margens de Miraluz. Não hesite, errante.',
    dialogComplete: 'Excelente golpe! A fumaça negra começa a recuar. Pegue isto para sua jornada; você provou seu valor.',
    objectives: [
      { id: 'kill_foes', label: 'Derrote 4 invasores nas ruínas', type: 'kill', current: 0, required: 4 }
    ],
    rewards: {
      xp: 180,
      gold: 90,
      crystals: 5,
      emberShards: 1
    }
  },
  {
    id: 'q_herbs_mira',
    title: 'Extratos Curativos de Mira',
    category: 'secundaria',
    regionId: 1,
    giver: 'Mira, Erveira',
    giverId: 'herbalist_mira',
    minLevel: 2,
    summary: 'Mira precisa de minérios e essências do solo para preparar elixires e emplastros vitais para os aventureiros feridos na estrada.',
    dialogIntro: 'Saudações, viajante! Minhas poções estão quase no fim. Se você minerar os veios luminosos do bosque e recolher cristais, posso preparar o melhor tônico da região para você.',
    dialogProgress: 'Procure os afloramentos de pedra brilhante pelo caminho.',
    dialogComplete: 'Essas pedras contêm a seiva pura da terra! Aqui está sua recompensa e elixires recém-preparados.',
    objectives: [
      { id: 'mine_ores', label: 'Extraia 3 veios de minério luminoso', type: 'mine', current: 0, required: 3 },
      { id: 'open_chests', label: 'Abra 2 baús de suprimentos', type: 'chest', current: 0, required: 2 }
    ],
    rewards: {
      xp: 220,
      gold: 140,
      crystals: 8,
      potions: 3
    }
  },
  {
    id: 'q_dungeon_catacombs',
    title: 'O Coração das Catacumbas',
    category: 'principal',
    regionId: 1,
    giver: 'Vigia Maerin',
    giverId: 'npc_maerin',
    minLevel: 8,
    summary: 'Descidas profundas sob as ruínas revelam as Catacumbas de Miraluz. Conquiste o 5º andar e derrote o Colosso de Obsidiana para neutralizar a ameaça subterrânea.',
    dialogIntro: 'O verdadeiro horror não vaga na superfície, errante. Sob nossos pés, nas Catacumbas, jaz o Colosso de Obsidiana. Desça pelos portais e destrua-o!',
    dialogProgress: 'As escadas das catacumbas se abrem apenas quando todas as criaturas do andar são eliminadas.',
    dialogComplete: 'Ouvi o rugido da pedra se partindo lá de baixo! Você conquistou o 5º andar e silenciou o Colosso! Guerra das Cinzas jamais esquecerá sua bravura.',
    objectives: [
      { id: 'clear_floor5', label: 'Conquiste o Andar 5 das Catacumbas de Miraluz', type: 'dungeon_floor', floor: 5, current: 0, required: 1 }
    ],
    rewards: {
      xp: 650,
      gold: 350,
      crystals: 15,
      emberShards: 2,
      gearTier: 'epico'
    }
  },

  // ─── REGIÃO 02: PÂNTANO DAS BRUMAS ───
  {
    id: 'q_swamp_waters',
    title: 'Águas Tóxicas do Pântano',
    category: 'principal',
    regionId: 2,
    giver: 'Tomas, Barqueiro',
    giverId: 'fisher_tomas',
    minLevel: 15,
    summary: 'Gases pantanosos e espectros venenosos assombram os canais. Ajude Tomas a recuperar os barcos à deriva e expurgar os espíritos afogados.',
    dialogIntro: 'O pântano cobra seu pedágio com almas, forasteiro. As bruxas e sapos gigantes afundaram nossos botes de travessia. Purifique a área para reabrirmos o cais.',
    dialogProgress: 'Cuidado com os jatos de gás venenoso saindo da lama podre.',
    dialogComplete: 'O caminho do rio está seguro novamente. Pegue sua parte do que encontramos nas margens.',
    objectives: [
      { id: 'kill_swamp', label: 'Elimine 6 criaturas do pântano', type: 'kill', current: 0, required: 6 },
      { id: 'gather_roots', label: 'Colete 3 minérios abissais no lodo', type: 'mine', current: 0, required: 3 }
    ],
    rewards: {
      xp: 450,
      gold: 240,
      crystals: 12,
      emberShards: 1
    }
  },

  // ─── HUB CENTRAL: CASTELO EM CINZAS ───
  {
    id: 'q_castle_flame',
    title: 'A Centelha Ancestral',
    category: 'principal',
    regionId: 0,
    giver: 'Oráculo Kaelen',
    giverId: 'portal_kaelen',
    minLevel: 1,
    summary: 'O Altar da Chama no centro do Castelo em Cinzas é o elo que mantém os errantes vivos após a derrota. Recarregue seu espírito no altar.',
    dialogIntro: 'Bem-vindo ao refúgio sagrado, errante. A Chama Ancestral guia nossas almas através do eclipse. Aproxime-se do Altar Central e receba a bênção da restauração.',
    dialogProgress: 'O Altar queima eternamente no pátio central do refúgio.',
    dialogComplete: 'Sinta o calor em suas veias. Agora, as portas das masmorras e expedições estão abertas para você.',
    objectives: [
      { id: 'visit_altar', label: 'Visite o Altar da Chama no centro do Castelo', type: 'interact', current: 0, required: 1 }
    ],
    rewards: {
      xp: 100,
      gold: 50,
      crystals: 4
    }
  }
];

export class QuestManager {
  constructor() {
    this.saveKey = 'guerra-cinzas-quests-v1';
    this.activeQuests = new Map();
    this.completedQuestIds = new Set();
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.saveKey);
      if (raw) {
        const data = JSON.parse(raw);
        this.completedQuestIds = new Set(data.completed || []);
        if (Array.isArray(data.active)) {
          for (const q of data.active) {
            this.activeQuests.set(q.id, q);
          }
        }
      } else {
        // Inicializa com a primeira missão de Miraluz disponível
        this.acceptQuest('q_miraluz_ruins');
      }
    } catch (e) {
      console.warn('Erro ao carregar dados de missões:', e);
      this.acceptQuest('q_miraluz_ruins');
    }
  }

  save() {
    try {
      const data = {
        completed: Array.from(this.completedQuestIds),
        active: Array.from(this.activeQuests.values())
      };
      localStorage.setItem(this.saveKey, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('quests-updated'));
    } catch (e) {
      console.warn('Erro ao salvar missões:', e);
    }
  }

  getQuest(questId) {
    return QUEST_DATABASE.find(q => q.id === questId) || null;
  }

  getActiveQuest(questId) {
    return this.activeQuests.get(questId) || null;
  }

  isQuestCompleted(questId) {
    return this.completedQuestIds.has(questId);
  }

  isQuestActive(questId) {
    return this.activeQuests.has(questId);
  }

  acceptQuest(questId) {
    if (this.isQuestCompleted(questId) || this.isQuestActive(questId)) return false;
    const base = this.getQuest(questId);
    if (!base) return false;

    const instance = {
      id: base.id,
      acceptedAt: Date.now(),
      objectives: base.objectives.map(o => ({ ...o, current: 0 })),
      readyToTurnIn: false
    };
    this.activeQuests.set(base.id, instance);
    this.save();
    return true;
  }

  onProgress(type, count = 1, extra = {}) {
    let changed = false;
    for (const [id, quest] of this.activeQuests.entries()) {
      for (const obj of quest.objectives) {
        if (obj.type === type) {
          if (type === 'dungeon_floor' && extra.floor && extra.floor < obj.floor) {
            continue;
          }
          if (obj.current < obj.required) {
            obj.current = Math.min(obj.required, obj.current + count);
            changed = true;
          }
        }
      }
      const allDone = quest.objectives.every(o => o.current >= o.required);
      if (allDone && !quest.readyToTurnIn) {
        quest.readyToTurnIn = true;
        changed = true;
        const base = this.getQuest(id);
        if (window.GameUI?.msg) {
          window.GameUI.msg(`📜 MISSÃO PRONTA: ${base?.title || ''}! Fale com ${base?.giver || 'o NPC'}.`);
        }
      }
    }
    if (changed) this.save();
  }

  turnInQuest(questId) {
    const quest = this.activeQuests.get(questId);
    if (!quest || !quest.readyToTurnIn) return null;
    const base = this.getQuest(questId);
    if (!base) return null;

    this.activeQuests.delete(questId);
    this.completedQuestIds.add(questId);
    this.save();
    return base.rewards;
  }

  getAvailableQuestsForRegion(regionId, playerLevel = 1) {
    return QUEST_DATABASE.filter(q =>
      q.regionId === regionId &&
      playerLevel >= q.minLevel &&
      !this.isQuestActive(q.id) &&
      !this.isQuestCompleted(q.id)
    );
  }

  getActiveQuestsList() {
    return Array.from(this.activeQuests.values()).map(q => {
      const base = this.getQuest(q.id);
      return {
        ...base,
        ...q,
        isReady: q.readyToTurnIn
      };
    });
  }
}

export const questManager = new QuestManager();
if (typeof window !== 'undefined') {
  window.QuestManager = questManager;
}
