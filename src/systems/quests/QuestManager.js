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
  {
    id: 'q_swamp_serpent',
    title: 'A Serpente do Lodo',
    category: 'principal',
    regionId: 2,
    giver: 'Barqueira Ysold',
    giverId: 'npc_ysold',
    minLevel: 18,
    summary: 'A lendária Serpente do Lodo emergiu do fundo dos canais venenosos. Derrote o terror aquático para restabelecer a segurança dos canais.',
    dialogIntro: 'O pântano ferve com o veneno da Serpente. Nenhuma balsa atravessará enquanto aquele monstro rastejar pelas águas. Vá até as profundezas e crave seu aço em seu crânio!',
    dialogProgress: 'Siga os rastros de lodo borbulhante até o ninho da fera.',
    dialogComplete: 'A carcaça da Serpente afunda no lodo! As águas finalmente encontram um momento de paz.',
    objectives: [
      { id: 'kill_swamp_boss', label: 'Derrote a Serpente das Águas Mortas', type: 'kill', current: 0, required: 1 },
      { id: 'open_sunken_chests', label: 'Abra 2 baús naufragados', type: 'chest', current: 0, required: 2 }
    ],
    rewards: {
      xp: 720,
      gold: 420,
      crystals: 18,
      emberShards: 2,
      gearTier: 'epico'
    }
  },

  // ─── REGIÃO 03: CUME DA FORNALHA ───
  {
    id: 'q_forge_embers',
    title: 'Chamas da Forja Ancestral',
    category: 'principal',
    regionId: 3,
    giver: 'Vedra, Mineradora',
    giverId: 'miner_vedra',
    minLevel: 25,
    summary: 'As forjas vulcânicas foram infestadas por golens de magma e elementais de escória. Ajude Vedra a coletar minério incandescente e conter os monstros de fogo.',
    dialogIntro: 'O calor aqui derrete até armaduras comuns, errante! Os elementais de magma tomaram as caldeiras e precisamos de minérios incandescentes para alimentar a forja.',
    dialogProgress: 'Cuidado com os rios de lava e os estilhaços de rocha quente.',
    dialogComplete: 'Com esse minério podemos forjar armas capazes de cortar até obsidiana pura! Tome sua recompensa bem merecida.',
    objectives: [
      { id: 'kill_magma_foes', label: 'Elimine 8 golens ou elementais de magma', type: 'kill', current: 0, required: 8 },
      { id: 'mine_magma_ore', label: 'Extraia 4 veios de minério incandescente', type: 'mine', current: 0, required: 4 }
    ],
    rewards: {
      xp: 950,
      gold: 550,
      crystals: 22,
      emberShards: 2,
      potions: 4
    }
  },
  {
    id: 'q_forge_colossus',
    title: 'O Colosso da Fornalha',
    category: 'principal',
    regionId: 3,
    giver: 'Mineradora Brann',
    giverId: 'npc_brann',
    minLevel: 30,
    summary: 'No coração das masmorras da fornalha habita o Titã de Escória. Derrube-o para recuperar o controle das fundições.',
    dialogIntro: 'O Colosso desperta a cada século para incinerar tudo ao redor. Desça às profundezas da masmorra e esfrie seu núcleo com sua lâmina!',
    dialogProgress: 'Desvie do terremoto do Colosso antes do impacto!',
    dialogComplete: 'O Colosso ruiu como cinza fria! As forjas cantarão seu nome pelos séculos que virão.',
    objectives: [
      { id: 'clear_forge_dungeon', label: 'Conquiste a Masmorra da Fornalha e derrote o Chefe', type: 'dungeon_boss', current: 0, required: 1 }
    ],
    rewards: {
      xp: 1400,
      gold: 800,
      crystals: 30,
      emberShards: 3,
      gearTier: 'lendario'
    }
  },

  // ─── REGIÃO 04: ARQUIVOS ESQUECIDOS ───
  {
    id: 'q_archives_scrolls',
    title: 'Os Tomos Esquecidos de Lyra',
    category: 'secundaria',
    regionId: 4,
    giver: 'Lyra, Copista',
    giverId: 'scribe_lyra',
    minLevel: 38,
    summary: 'Os antigos salões de estudos foram corrompidos por aparições espectrais. Resgate os pergaminhos perdidos nos baús do santuário.',
    dialogIntro: 'Milênios de conhecimento arcano correm risco de queimar nas chamas do esquecimento. Expulse as aparições e recupere os pergaminhos preservados nos baús!',
    dialogProgress: 'Os espectros alimentam-se da sabedoria contida nas páginas antigas.',
    dialogComplete: 'Incrível! Esses pergaminhos revelam a origem do Grande Eclipse das Cinzas. Você fez um serviço inestimável à história.',
    objectives: [
      { id: 'kill_specters', label: 'Derrote 8 aparições dos arquivos', type: 'kill', current: 0, required: 8 },
      { id: 'open_archive_chests', label: 'Recupere 3 baús contendo tomos antigos', type: 'chest', current: 0, required: 3 }
    ],
    rewards: {
      xp: 1650,
      gold: 920,
      crystals: 35,
      emberShards: 3
    }
  },

  // ─── REGIÃO 05: CUME DO ECLIPSE ───
  {
    id: 'q_eclipse_vharok',
    title: 'A Queda do Eclipse',
    category: 'principal',
    regionId: 5,
    giver: 'Última Oráculo Naeva',
    giverId: 'npc_naeva',
    minLevel: 45,
    summary: 'Vharok, o Arauto do Vazio, comanda as forças que mergulharam o mundo nas sombras. Suba ao Cume e enfrente o senhor do eclipse.',
    dialogIntro: 'O céu sangra em negro e roxo. Vharok prepara o ritual final para consumir os últimos vestígios de luz. Se você falhar, a Terra das Cinzas perecerá para sempre.',
    dialogProgress: 'Desvie da chuva astral do eclipse e avance contra o Arauto!',
    dialogComplete: 'O eclipse vacila! Uma réstia de sol toca a terra pela primeira vez em eras! Você é o verdadeiro Campeão das Cinzas.',
    objectives: [
      { id: 'kill_eclipse_harbinger', label: 'Derrote Vharok, o Arauto do Eclipse', type: 'boss', current: 0, required: 1 },
      { id: 'survive_eclipse_minions', label: 'Elimine 10 servos do vazio', type: 'kill', current: 0, required: 10 }
    ],
    rewards: {
      xp: 2600,
      gold: 1500,
      crystals: 50,
      emberShards: 5,
      gearTier: 'lendario'
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
