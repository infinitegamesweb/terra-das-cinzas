// src/systems/talents/TalentManager.js
// ═══════════════════════════════════════════════════════════════
//  TERRA DAS CINZAS — Árvore de Talentos (Tecla T)
//  6 Classes · 3 Caminhos por classe · ~18 talentos cada
// ═══════════════════════════════════════════════════════════════

// ─── Talent Point Rules ─────────────────────────────────────────
// +1 ponto a cada nível. Custo por nível do talento: 1pt (tier1), 2pt (tier2), 3pt (tier3)
// Requer talento anterior da mesma linha no nível mínimo antes de desbloquear próximo

// ─── Talent Definitions by Class ───────────────────────────────
// node: { id, name, desc, path, tier, row, col, maxLvl, costPer, effect, requires }
// effect: function(lvl) => string description of stat bonus

const TALENT_TREES = {

  // ── GUERREIRO ──────────────────────────────────────────────────
  guerreiro: {
    paths: [
      { id: 'furia',  label: 'Fúria',    icon: '', color: '#ef4444' },
      { id: 'ferro',  label: 'Ferro',    icon: '', color: '#60a5fa' },
      { id: 'sangue', label: 'Sangue',   icon: '', color: '#f43f5e' }
    ],
    nodes: [
      // Fúria (coluna 0)
      { id: 'g_golpe',     name: 'Golpe Brutal',     path: 'furia', tier: 1, row: 0, col: 0, maxLvl: 10, costPer: 1, desc: 'Aumenta dano corpo a corpo',          effect: l => `+${l*4}% dano` },
      { id: 'g_frenetismo', name: 'Frenesim',        path: 'furia', tier: 1, row: 1, col: 0, maxLvl: 10, costPer: 1, desc: 'Velocidade de ataque',                effect: l => `+${l*2}% vel. ataque`, requires: ['g_golpe:5'] },
      { id: 'g_sede',      name: 'Sede de Sangue',   path: 'furia', tier: 2, row: 2, col: 0, maxLvl: 8,  costPer: 2, desc: 'Roubo de vida por golpe',             effect: l => `+${l*2}% lifesteal`, requires: ['g_frenetismo:5'] },
      { id: 'g_berserker', name: 'Berserker',        path: 'furia', tier: 2, row: 3, col: 0, maxLvl: 5,  costPer: 2, desc: 'Dano +% acima de 50% HP',            effect: l => `+${l*8}% dano pleno`, requires: ['g_sede:3'] },
      { id: 'g_colossus',  name: 'Colosso da Fúria', path: 'furia', tier: 3, row: 4, col: 0, maxLvl: 3,  costPer: 3, desc: 'Habilidade: Investida devastadora',  effect: l => `Dano ${60+l*30}%, empurra`, requires: ['g_berserker:3'] },
      // Ferro (coluna 1)
      { id: 'g_resistencia', name: 'Resistência',    path: 'ferro', tier: 1, row: 0, col: 1, maxLvl: 10, costPer: 1, desc: 'Aumenta defesa física',              effect: l => `+${l*5} armadura` },
      { id: 'g_fortifica',  name: 'Fortaleza',       path: 'ferro', tier: 1, row: 1, col: 1, maxLvl: 10, costPer: 1, desc: 'Aumenta pontos de vida',             effect: l => `+${l*6}% HP`, requires: ['g_resistencia:5'] },
      { id: 'g_escudo',     name: 'Muro de Escudo',  path: 'ferro', tier: 2, row: 2, col: 1, maxLvl: 8,  costPer: 2, desc: 'Reduz dano crítico recebido',        effect: l => `-${l*7}% crit. recebido`, requires: ['g_fortifica:5'] },
      { id: 'g_provocar',  name: 'Provocar',         path: 'ferro', tier: 2, row: 3, col: 1, maxLvl: 5,  costPer: 2, desc: 'Habilidade: Concentra ataques inimigos', effect: l => `Duração ${2+l}s`, requires: ['g_escudo:3'] },
      { id: 'g_baluarte',  name: 'Baluarte Eterno',  path: 'ferro', tier: 3, row: 4, col: 1, maxLvl: 3,  costPer: 3, desc: 'Imunidade temporária ao receber golpe fatal', effect: l => `${l*30}s CD`, requires: ['g_provocar:3'] },
      // Sangue (coluna 2)
      { id: 'g_vitalidade', name: 'Vitalidade',      path: 'sangue', tier: 1, row: 0, col: 2, maxLvl: 10, costPer: 1, desc: 'Regeneração passiva de HP',         effect: l => `+${l*0.5}/s HP` },
      { id: 'g_segundo',   name: 'Segunda Chance',   path: 'sangue', tier: 1, row: 1, col: 2, maxLvl: 5,  costPer: 1, desc: 'Sobrevive com 1 HP uma vez',        effect: l => `CD ${90-l*10}s`, requires: ['g_vitalidade:5'] },
      { id: 'g_vampiro',   name: 'Toque Vampírico',  path: 'sangue', tier: 2, row: 2, col: 2, maxLvl: 8,  costPer: 2, desc: 'Cura ao matar inimigo',             effect: l => `+${l*3}% HP max`, requires: ['g_segundo:3'] },
      { id: 'g_imortal',   name: 'Imortal das Cinzas',path:'sangue', tier: 3, row: 3, col: 2, maxLvl: 3,  costPer: 3, desc: 'Ressuscita uma vez com HP parcial', effect: l => `${20+l*15}% HP`, requires: ['g_vampiro:5'] }
    ]
  },

  // ── ARQUEIRO ───────────────────────────────────────────────────
  arqueiro: {
    paths: [
      { id: 'precisao', label: 'Precisão',   icon: '', color: '#4ade80' },
      { id: 'sombra',   label: 'Sombra',     icon: '', color: '#a78bfa' },
      { id: 'natureza', label: 'Natureza',   icon: '', color: '#34d399' }
    ],
    nodes: [
      // Precisão
      { id: 'a_olho',     name: 'Olho Afiado',     path: 'precisao', tier: 1, row: 0, col: 0, maxLvl: 10, costPer: 1, desc: 'Aumenta alcance e precisão',      effect: l => `+${l*10} alcance` },
      { id: 'a_crit',     name: 'Golpe Certeiro',  path: 'precisao', tier: 1, row: 1, col: 0, maxLvl: 10, costPer: 1, desc: 'Chance de golpe crítico',         effect: l => `+${l*2}% crit`, requires: ['a_olho:5'] },
      { id: 'a_perfuro',  name: 'Tiro Perfurante', path: 'precisao', tier: 2, row: 2, col: 0, maxLvl: 8,  costPer: 2, desc: 'Ignora parte da armadura inimiga',effect: l => `-${l*5}% armor inimigo`, requires: ['a_crit:5'] },
      { id: 'a_rajada',   name: 'Rajada Mortal',   path: 'precisao', tier: 2, row: 3, col: 0, maxLvl: 5,  costPer: 2, desc: 'Habilidade: 3 tiros rápidos',     effect: l => `${70+l*20}% dano/tiro`, requires: ['a_perfuro:3'] },
      { id: 'a_snipe',    name: 'Golpe Supremo',   path: 'precisao', tier: 3, row: 4, col: 0, maxLvl: 3,  costPer: 3, desc: 'Tiro que ignora toda armadura',   effect: l => `${150+l*50}% dano`, requires: ['a_rajada:3'] },
      // Sombra
      { id: 'a_camuflagem','name': 'Camuflagem',   path: 'sombra',   tier: 1, row: 0, col: 1, maxLvl: 10, costPer: 1, desc: 'Reduz detecção por inimigos',     effect: l => `-${l*5}% detecção` },
      { id: 'a_veneno',   name: 'Flecha Envenenada',path:'sombra',   tier: 1, row: 1, col: 1, maxLvl: 10, costPer: 1, desc: 'Inflige veneno ao acertar',       effect: l => `${l*3}/s por 5s`, requires: ['a_camuflagem:5'] },
      { id: 'a_volley',   name: 'Volley Sombrio',  path: 'sombra',   tier: 2, row: 2, col: 1, maxLvl: 8,  costPer: 2, desc: 'Chuva de flechas em área',        effect: l => `${l*4} flechas/s`, requires: ['a_veneno:5'] },
      { id: 'a_morte',    name: 'Marca da Morte',  path: 'sombra',   tier: 3, row: 3, col: 1, maxLvl: 3,  costPer: 3, desc: 'Inimigo marcado recebe +dano',    effect: l => `+${l*20}% dano`, requires: ['a_volley:5'] },
      // Natureza
      { id: 'a_agilidade','name': 'Agilidade',     path: 'natureza', tier: 1, row: 0, col: 2, maxLvl: 10, costPer: 1, desc: 'Velocidade de movimento',         effect: l => `+${l*4}% velocidade` },
      { id: 'a_reflexo',  name: 'Reflexo Instintivo',path:'natureza',tier: 1, row: 1, col: 2, maxLvl: 8,  costPer: 1, desc: 'Chance de esquivar ataque',       effect: l => `+${l*2}% esquiva`, requires: ['a_agilidade:5'] },
      { id: 'a_raiz',     name: 'Flecha de Raiz',  path: 'natureza', tier: 2, row: 2, col: 2, maxLvl: 5,  costPer: 2, desc: 'Prende inimigo no lugar',         effect: l => `${1+l*0.5}s raiz`, requires: ['a_reflexo:5'] },
      { id: 'a_tempestade','name': 'Tempestade Viva',path:'natureza', tier: 3, row: 3, col: 2, maxLvl: 3,  costPer: 3, desc: 'Relâmpagos naturais em área',     effect: l => `${l*40} dano/raio`, requires: ['a_raiz:3'] }
    ]
  },

  // ── ASSASSINO ──────────────────────────────────────────────────
  assasino: {
    paths: [
      { id: 'laceration', label: 'Laceração',  icon: '', color: '#f43f5e' },
      { id: 'sombrias',   label: 'Sombrias',   icon: '', color: '#7c3aed' },
      { id: 'veneno_as',  label: 'Veneno',     icon: '', color: '#84cc16' }
    ],
    nodes: [
      // Laceração
      { id: 'as_lamina',  name: 'Lâmina Afiada',   path: 'laceration', tier: 1, row: 0, col: 0, maxLvl: 10, costPer: 1, desc: 'Dano de adaga',               effect: l => `+${l*5}% dano adaga` },
      { id: 'as_crit',    name: 'Golpe Fatal',      path: 'laceration', tier: 1, row: 1, col: 0, maxLvl: 10, costPer: 1, desc: 'Multiplicador crítico',       effect: l => `+${l*10}% mult. crit`, requires: ['as_lamina:5'] },
      { id: 'as_duplo',   name: 'Corte Duplo',      path: 'laceration', tier: 2, row: 2, col: 0, maxLvl: 8,  costPer: 2, desc: 'Golpeia duas vezes',          effect: l => `${l*8}% chance 2º golpe`, requires: ['as_crit:5'] },
      { id: 'as_execute', name: 'Executar',         path: 'laceration', tier: 2, row: 3, col: 0, maxLvl: 5,  costPer: 2, desc: 'Dano extra em HP baixo',     effect: l => `+${l*15}% <30% HP`, requires: ['as_duplo:3'] },
      { id: 'as_letal',   name: 'Golpe Letal',      path: 'laceration', tier: 3, row: 4, col: 0, maxLvl: 3,  costPer: 3, desc: 'Crit garantido após esquiva',effect: l => `${100+l*50}% dano`, requires: ['as_execute:3'] },
      // Sombrias
      { id: 'as_invis',   name: 'Invisibilidade',   path: 'sombrias',   tier: 1, row: 0, col: 1, maxLvl: 5,  costPer: 1, desc: 'Duração da invisibilidade',  effect: l => `${2+l*1}s invis` },
      { id: 'as_emboscar','name': 'Emboscada',       path: 'sombrias',   tier: 2, row: 1, col: 1, maxLvl: 8,  costPer: 2, desc: 'Dano do primeiro golpe',     effect: l => `+${l*15}% primeiro golpe`, requires: ['as_invis:3'] },
      { id: 'as_sombra',  name: 'Passo Sombrio',    path: 'sombrias',   tier: 2, row: 2, col: 1, maxLvl: 5,  costPer: 2, desc: 'Teletransporte curto',       effect: l => `${80+l*40}px range`, requires: ['as_emboscar:5'] },
      { id: 'as_sombra2', name: 'Cópia Sombria',    path: 'sombrias',   tier: 3, row: 3, col: 1, maxLvl: 3,  costPer: 3, desc: 'Cria clone que ataca',       effect: l => `${l*30}% dano clone`, requires: ['as_sombra:3'] },
      // Veneno
      { id: 'as_ven1',    name: 'Peçonha',          path: 'veneno_as',  tier: 1, row: 0, col: 2, maxLvl: 10, costPer: 1, desc: 'DPS de veneno',              effect: l => `${l*4}/s veneno` },
      { id: 'as_ven2',    name: 'Veneno Corrosivo',  path: 'veneno_as', tier: 2, row: 1, col: 2, maxLvl: 8,  costPer: 2, desc: 'Veneno reduz armadura',      effect: l => `-${l*4} armadura`, requires: ['as_ven1:5'] },
      { id: 'as_ven3',    name: 'Toxina Mortal',     path: 'veneno_as', tier: 3, row: 2, col: 2, maxLvl: 3,  costPer: 3, desc: 'Veneno letal: mata <5% HP',  effect: l => `CD ${60-l*10}s`, requires: ['as_ven2:5'] }
    ]
  },

  // ── BÁRBARO ────────────────────────────────────────────────────
  barbaro: {
    paths: [
      { id: 'raiva',     label: 'Raiva',     icon: '', color: '#ef4444' },
      { id: 'titan',     label: 'Titã',      icon: '', color: '#78716c' },
      { id: 'guerra',    label: 'Guerra',    icon: '', color: '#f97316' }
    ],
    nodes: [
      // Raiva
      { id: 'b_raiva1',  name: 'Fúria Bruta',     path: 'raiva', tier: 1, row: 0, col: 0, maxLvl: 10, costPer: 1, desc: 'Dano de machado',             effect: l => `+${l*6}% dano` },
      { id: 'b_raiva2',  name: 'Grito de Guerra',  path: 'raiva', tier: 1, row: 1, col: 0, maxLvl: 8,  costPer: 1, desc: 'Aumenta dano temporariamente', effect: l => `+${l*10}% por 5s`, requires: ['b_raiva1:5'] },
      { id: 'b_raiva3',  name: 'Devastação',       path: 'raiva', tier: 2, row: 2, col: 0, maxLvl: 8,  costPer: 2, desc: 'Área de impacto do machado',   effect: l => `${l*12}px área`, requires: ['b_raiva2:5'] },
      { id: 'b_raiva4',  name: 'Fúria Incontida',  path: 'raiva', tier: 2, row: 3, col: 0, maxLvl: 5,  costPer: 2, desc: 'Ignora armadura inimiga',      effect: l => `${l*8}% ignored`, requires: ['b_raiva3:3'] },
      { id: 'b_raiva5',  name: 'Cólera Titânica',  path: 'raiva', tier: 3, row: 4, col: 0, maxLvl: 3,  costPer: 3, desc: 'Habilidade: Golpe da Extinção',effect: l => `${200+l*100}% dano`, requires: ['b_raiva4:3'] },
      // Titã
      { id: 'b_titan1',  name: 'Carcaça de Ferro', path: 'titan', tier: 1, row: 0, col: 1, maxLvl: 10, costPer: 1, desc: 'Máximo de HP',               effect: l => `+${l*8}% HP` },
      { id: 'b_titan2',  name: 'Pele Grossa',      path: 'titan', tier: 1, row: 1, col: 1, maxLvl: 10, costPer: 1, desc: 'Redução de dano',            effect: l => `-${l*3}% dano recebido`, requires: ['b_titan1:5'] },
      { id: 'b_titan3',  name: 'Inabalável',       path: 'titan', tier: 2, row: 2, col: 1, maxLvl: 5,  costPer: 2, desc: 'Imunidade a efeitos de stun', effect: l => `${l*20}% resistência`, requires: ['b_titan2:5'] },
      { id: 'b_titan4',  name: 'Montanha Viva',    path: 'titan', tier: 3, row: 3, col: 1, maxLvl: 3,  costPer: 3, desc: 'HP não pode cair abaixo de X%',effect: l => `Mínimo ${l*5}% HP`, requires: ['b_titan3:3'] },
      // Guerra
      { id: 'b_guerra1', name: 'Maestria do Machado', path:'guerra',tier: 1, row: 0, col: 2, maxLvl: 10, costPer: 1, desc: 'Velocidade de ataque',      effect: l => `+${l*3}% vel. ataque` },
      { id: 'b_guerra2', name: 'Arremesso',         path: 'guerra', tier: 1, row: 1, col: 2, maxLvl: 8,  costPer: 1, desc: 'Arremessa machado à distância',effect: l => `${80+l*20}% dano`, requires: ['b_guerra1:5'] },
      { id: 'b_guerra3', name: 'Tormenta de Aço',  path: 'guerra', tier: 2, row: 2, col: 2, maxLvl: 5,  costPer: 2, desc: 'Golpe giratório em 360°',    effect: l => `${60+l*20}% dano área`, requires: ['b_guerra2:5'] },
      { id: 'b_guerra4', name: 'Lenda da Guerra',  path: 'guerra', tier: 3, row: 3, col: 2, maxLvl: 3,  costPer: 3, desc: 'Modo: dano +100% por 10s',   effect: l => `CD ${120-l*20}s`, requires: ['b_guerra3:3'] }
    ]
  },

  // ── CLÉRIGO ────────────────────────────────────────────────────
  clerigo: {
    paths: [
      { id: 'luz',       label: 'Luz',       icon: '', color: '#fbbf24' },
      { id: 'sagrado',   label: 'Sagrado',   icon: '', color: '#4ade80' },
      { id: 'cinza_c',   label: 'Cinzas',    icon: '', color: '#94a3b8' }
    ],
    nodes: [
      // Luz
      { id: 'c_luz1',    name: 'Luz Divina',      path: 'luz',    tier: 1, row: 0, col: 0, maxLvl: 10, costPer: 1, desc: 'Dano arcano',              effect: l => `+${l*5}% dano arcano` },
      { id: 'c_luz2',    name: 'Raio Sagrado',    path: 'luz',    tier: 1, row: 1, col: 0, maxLvl: 8,  costPer: 1, desc: 'Raio de luz que stuna',    effect: l => `${0.5+l*0.3}s stun`, requires: ['c_luz1:5'] },
      { id: 'c_luz3',    name: 'Explosão Solar',  path: 'luz',    tier: 2, row: 2, col: 0, maxLvl: 8,  costPer: 2, desc: 'Área de luz que queima',   effect: l => `${l*20} dano/s área`, requires: ['c_luz2:5'] },
      { id: 'c_luz4',    name: 'Juízo Final',     path: 'luz',    tier: 3, row: 3, col: 0, maxLvl: 3,  costPer: 3, desc: 'Habilidade: Inunda a área com luz', effect: l => `${300+l*100}% dano`, requires: ['c_luz3:5'] },
      // Sagrado
      { id: 'c_cura1',   name: 'Cura Abençoada',  path: 'sagrado',tier: 1, row: 0, col: 1, maxLvl: 10, costPer: 1, desc: 'Eficácia de cura',         effect: l => `+${l*8}% cura` },
      { id: 'c_cura2',   name: 'Regeneração',     path: 'sagrado',tier: 1, row: 1, col: 1, maxLvl: 10, costPer: 1, desc: 'HP regen passiva',          effect: l => `+${l*1}/s`, requires: ['c_cura1:5'] },
      { id: 'c_cura3',   name: 'Cura em Área',    path: 'sagrado',tier: 2, row: 2, col: 1, maxLvl: 5,  costPer: 2, desc: 'Cura todos ao redor',      effect: l => `${l*20} HP/cast`, requires: ['c_cura2:5'] },
      { id: 'c_ressur',  name: 'Ressurreição',    path: 'sagrado',tier: 3, row: 3, col: 1, maxLvl: 3,  costPer: 3, desc: 'Revive com HP parcial',    effect: l => `${20+l*20}% HP`, requires: ['c_cura3:3'] },
      // Cinzas
      { id: 'c_cinza1',  name: 'Escudo de Cinza', path: 'cinza_c',tier: 1, row: 0, col: 2, maxLvl: 10, costPer: 1, desc: 'Absorve parte do dano',    effect: l => `${l*6} absorção` },
      { id: 'c_cinza2',  name: 'Barreira',        path: 'cinza_c',tier: 1, row: 1, col: 2, maxLvl: 8,  costPer: 1, desc: 'Barreira que reflete dano',effect: l => `${l*5}% reflete`, requires: ['c_cinza1:5'] },
      { id: 'c_cinza3',  name: 'Invulnerabilidade',path:'cinza_c', tier: 2, row: 2, col: 2, maxLvl: 3,  costPer: 2, desc: 'Imunidade por 2s',         effect: l => `CD ${90-l*10}s`, requires: ['c_cinza2:5'] },
      { id: 'c_cinza4',  name: 'Cinzas Sagradas', path: 'cinza_c',tier: 3, row: 3, col: 2, maxLvl: 3,  costPer: 3, desc: 'Revive aliados com escudo', effect: l => `${30+l*20}% HP+shield`, requires: ['c_cinza3:2'] }
    ]
  },

  // ── MAGO ───────────────────────────────────────────────────────
  mago: {
    paths: [
      { id: 'fogo',      label: 'Fogo',      icon: '', color: '#f97316' },
      { id: 'gelo',      label: 'Gelo',      icon: '', color: '#67e8f9' },
      { id: 'arcano',    label: 'Arcano',    icon: '', color: '#c084fc' }
    ],
    nodes: [
      // Fogo
      { id: 'm_fogo1',   name: 'Chama Viva',      path: 'fogo',   tier: 1, row: 0, col: 0, maxLvl: 10, costPer: 1, desc: 'Dano de fogo',             effect: l => `+${l*6}% dano fogo` },
      { id: 'm_fogo2',   name: 'Bola de Fogo',    path: 'fogo',   tier: 1, row: 1, col: 0, maxLvl: 10, costPer: 1, desc: 'Habilidade: projétil de fogo',effect: l => `${60+l*20}% dano`, requires: ['m_fogo1:5'] },
      { id: 'm_fogo3',   name: 'Queimadura',      path: 'fogo',   tier: 2, row: 2, col: 0, maxLvl: 8,  costPer: 2, desc: 'DPS de queimadura',         effect: l => `${l*8}/s`, requires: ['m_fogo2:5'] },
      { id: 'm_fogo4',   name: 'Meteoro',         path: 'fogo',   tier: 2, row: 3, col: 0, maxLvl: 5,  costPer: 2, desc: 'Habilidade: meteoro em área',effect: l => `${100+l*60}% dano`, requires: ['m_fogo3:3'] },
      { id: 'm_fogo5',   name: 'Extinção',        path: 'fogo',   tier: 3, row: 4, col: 0, maxLvl: 3,  costPer: 3, desc: 'Incendeia toda a tela',     effect: l => `${l*15}/s por 8s`, requires: ['m_fogo4:3'] },
      // Gelo
      { id: 'm_gelo1',   name: 'Toque Gélido',   path: 'gelo',   tier: 1, row: 0, col: 1, maxLvl: 10, costPer: 1, desc: 'Dano de gelo e lentidão',  effect: l => `${l*5}% lentidão` },
      { id: 'm_gelo2',   name: 'Lança de Gelo',  path: 'gelo',   tier: 1, row: 1, col: 1, maxLvl: 10, costPer: 1, desc: 'Habilidade: lança de gelo', effect: l => `${70+l*20}% dano`, requires: ['m_gelo1:5'] },
      { id: 'm_gelo3',   name: 'Congelar',        path: 'gelo',   tier: 2, row: 2, col: 1, maxLvl: 5,  costPer: 2, desc: 'Paralisa inimigo',          effect: l => `${1+l*0.5}s freeze`, requires: ['m_gelo2:5'] },
      { id: 'm_gelo4',   name: 'Tempestade de Neve',path:'gelo',  tier: 2, row: 3, col: 1, maxLvl: 5,  costPer: 2, desc: 'Nevasca em área',           effect: l => `${l*12}/s área`, requires: ['m_gelo3:3'] },
      { id: 'm_gelo5',   name: 'Glacial Eterno',  path: 'gelo',   tier: 3, row: 4, col: 1, maxLvl: 3,  costPer: 3, desc: 'Petrifica todos na tela',   effect: l => `${2+l}s petrificado`, requires: ['m_gelo4:3'] },
      // Arcano
      { id: 'm_arc1',    name: 'Canalização',     path: 'arcano', tier: 1, row: 0, col: 2, maxLvl: 10, costPer: 1, desc: 'Poder arcano geral',        effect: l => `+${l*5}% arcano` },
      { id: 'm_arc2',    name: 'Raio Arcano',     path: 'arcano', tier: 1, row: 1, col: 2, maxLvl: 10, costPer: 1, desc: 'Habilidade: raio elétrico', effect: l => `${80+l*20}% dano`, requires: ['m_arc1:5'] },
      { id: 'm_arc3',    name: 'Sobrecarga',      path: 'arcano', tier: 2, row: 2, col: 2, maxLvl: 5,  costPer: 2, desc: 'Dano extra após 3 feitiços',effect: l => `+${l*25}% buff`, requires: ['m_arc2:5'] },
      { id: 'm_arc4',    name: 'Singularidade',   path: 'arcano', tier: 3, row: 3, col: 2, maxLvl: 3,  costPer: 3, desc: 'Buraco negro atrai inimigos', effect: l => `${l*40} dano/s 4s`, requires: ['m_arc3:3'] }
    ]
  }
};

// ─── State ──────────────────────────────────────────────────────
let ttOverlay    = null;
let ttVisible    = false;
let ttClassId    = 'guerreiro';
let ttActivePath = null;
let ttSelected   = null; // selected node id
let invested     = {}; // { nodeId: currentLevel }
let totalPoints  = 0;
let usedPoints   = 0;

function getPoints(playerLevel) { return Math.floor(playerLevel); }
function getInvested(nodeId)    { return invested[nodeId] || 0; }
function getUsed()              { return Object.values(invested).reduce((s,v) => s + v, 0); }

// ─── Check prerequisites ─────────────────────────────────────────
function prereqsMet(node) {
  if (!node.requires) return true;
  return node.requires.every(req => {
    const [id, minLvl] = req.split(':');
    return getInvested(id) >= parseInt(minLvl);
  });
}

// ─── Invest ──────────────────────────────────────────────────────
function invest(nodeId, playerLevel) {
  const tree = TALENT_TREES[ttClassId];
  if (!tree) return null;
  const node = tree.nodes.find(n => n.id === nodeId);
  if (!node) return { error: 'Talento não encontrado.' };
  if (!prereqsMet(node)) return { error: 'Pré-requisitos não cumpridos.' };
  const cur = getInvested(nodeId);
  if (cur >= node.maxLvl) return { error: 'Talento no nível máximo.' };
  const avail = getPoints(playerLevel) - getUsed();
  if (avail < node.costPer) return { error: `Necessita ${node.costPer} ponto(s). Disponíveis: ${avail}.` };
  invested[nodeId] = cur + 1;
  return { ok: true, newLevel: cur + 1 };
}

function resetTree() {
  const prev = { ...invested };
  invested = {};
  return prev;
}

// ─── Render ──────────────────────────────────────────────────────
function renderTT(playerLevel, classId) {
  ttClassId    = classId || ttClassId;
  const tree   = TALENT_TREES[ttClassId];
  if (!tree) return;
  totalPoints  = getPoints(playerLevel);
  usedPoints   = getUsed();
  const avail  = totalPoints - usedPoints;
  const cls    = window.GameClasses ? window.GameClasses.get(ttClassId) : { name: ttClassId, icon: '' };

  // Class tabs
  const clsTabs = (window.GameClasses ? window.GameClasses.all : []).map(c => `
    <button class="tt-class-tab ${c.id === ttClassId ? 'active' : ''}" data-tt-class="${c.id}">${c.icon} ${c.name}</button>
  `).join('');

  // Path filter tabs
  const pathTabs = tree.paths.map(pt => `
    <button class="tt-path-tab ${(!ttActivePath || ttActivePath === pt.id) ? 'active' : ''}" data-tt-path="${pt.id}" style="--pt-c:${pt.color}">
      ${pt.icon} ${pt.label}
    </button>
  `).join('');

  // Node grid
  const filteredNodes = tree.nodes.filter(n => !ttActivePath || n.path === ttActivePath);
  const paths         = tree.paths.filter(pt => !ttActivePath || pt.id === ttActivePath);

  const nodeColumns = paths.map(pt => {
    const pathNodes = filteredNodes.filter(n => n.path === pt.id).sort((a,b) => a.row - b.row);
    const pathMeta  = tree.paths.find(p => p.id === pt.id);
    const cards = pathNodes.map(node => {
      const lvl       = getInvested(node.id);
      const canInvest = prereqsMet(node) && lvl < node.maxLvl && avail >= node.costPer;
      const isMaxed   = lvl >= node.maxLvl;
      const isSelected= ttSelected === node.id;
      const isLocked  = !prereqsMet(node);
      return `<div class="tt-node ${canInvest?'tt-can':''}  ${isMaxed?'tt-maxed':''}  ${isSelected?'tt-selected':''}  ${isLocked?'tt-locked':''}"
              data-tt-node="${node.id}"
              style="--nc:${pathMeta.color}">
        <div class="tt-node-header">
          <span class="tt-node-name">${node.name}</span>
          <span class="tt-node-lvl">${lvl}/${node.maxLvl}</span>
        </div>
        <div class="tt-node-tier">T${node.tier} ${isLocked ? '' : isMaxed ? ' MAX' : canInvest ? '▶ Investir' : ''}</div>
        <div class="tt-node-bars">${Array.from({length: node.maxLvl}).map((_,i)=>
          `<span class="tt-bar ${i < lvl ? 'filled' : ''}" style="background:${i < lvl ? pathMeta.color : '#2a2a2a'}"></span>`
        ).join('')}</div>
        ${lvl > 0 ? `<div class="tt-node-effect">${node.effect(lvl)}</div>` : ''}
      </div>`;
    }).join('');
    return `<div class="tt-column" style="--pc:${pathMeta.color}">
      <div class="tt-col-header">${pathMeta.icon} ${pathMeta.label}</div>
      <div class="tt-col-nodes">${cards}</div>
    </div>`;
  }).join('');

  // Detail panel
  let detailHTML = '<div class="tt-detail-empty">← Selecione um talento para ver detalhes</div>';
  if (ttSelected) {
    const node = tree.nodes.find(n => n.id === ttSelected);
    if (node) {
      const lvl       = getInvested(node.id);
      const pathMeta  = tree.paths.find(p => p.id === node.path);
      const canInvest = prereqsMet(node) && lvl < node.maxLvl && avail >= node.costPer;
      const isLocked  = !prereqsMet(node);
      const nextEffect= lvl < node.maxLvl ? node.effect(lvl + 1) : null;
      detailHTML = `
        <div class="tt-detail-name" style="color:${pathMeta.color}">${node.name}</div>
        <div class="tt-detail-path">${pathMeta.icon} ${pathMeta.label} · Tier ${node.tier}</div>
        <div class="tt-detail-desc">${node.desc}</div>
        <div class="tt-detail-lvl">Nível <b>${lvl}</b> / <b>${node.maxLvl}</b></div>
        ${lvl > 0 ? `<div class="tt-detail-effect">Efeito atual: <b>${node.effect(lvl)}</b></div>` : ''}
        ${nextEffect  ? `<div class="tt-detail-next">Próximo nível: <b>${nextEffect}</b> · Custo: ${node.costPer}pt</div>` : ''}
        ${isLocked ? `<div class="tt-detail-lock"> Requer: ${node.requires.join(', ')}</div>` : ''}
        ${canInvest ? `<button class="tt-invest-btn" data-tt-invest="${node.id}">▶ INVESTIR (${node.costPer}pt)</button>` : ''}
        ${isMaxed   ? `<div class="tt-maxed-badge"> TALENTO MÁXIMO</div>` : ''}
      `;
    }
  }

  ttOverlay.querySelector('.tt-class-tabs').innerHTML    = clsTabs;
  ttOverlay.querySelector('.tt-path-tabs').innerHTML     = pathTabs;
  ttOverlay.querySelector('.tt-columns').innerHTML       = nodeColumns;
  ttOverlay.querySelector('.tt-detail-panel').innerHTML  = detailHTML;
  ttOverlay.querySelector('.tt-pts-avail').textContent   = avail;
  ttOverlay.querySelector('.tt-pts-total').textContent   = totalPoints;
  ttOverlay.querySelector('.tt-pts-used').textContent    = usedPoints;
  ttOverlay.querySelector('.tt-class-name').textContent  = `${cls.icon} ${cls.name}`;

  bindTT(playerLevel);
}

function bindTT(playerLevel) {
  ttOverlay.querySelectorAll('[data-tt-class]').forEach(b => {
    b.onclick = () => { ttClassId = b.dataset.ttClass; ttActivePath = null; ttSelected = null; renderTT(playerLevel); };
  });
  ttOverlay.querySelectorAll('[data-tt-path]').forEach(b => {
    b.onclick = () => { ttActivePath = ttActivePath === b.dataset.ttPath ? null : b.dataset.ttPath; renderTT(playerLevel); };
  });
  ttOverlay.querySelectorAll('[data-tt-node]').forEach(b => {
    b.onclick = () => { ttSelected = b.dataset.ttNode; renderTT(playerLevel); };
    b.ondblclick = () => {
      const r = invest(b.dataset.ttNode, playerLevel);
      if (r && r.error && window._ttMsg) window._ttMsg(r.error);
      renderTT(playerLevel);
    };
  });
  const investBtn = ttOverlay.querySelector('[data-tt-invest]');
  if (investBtn) {
    investBtn.onclick = () => {
      const r = invest(investBtn.dataset.ttInvest, playerLevel);
      if (r && r.error && window._ttMsg) window._ttMsg(r.error);
      renderTT(playerLevel);
    };
  }
  const closeBtn = ttOverlay.querySelector('#ttClose');
  if (closeBtn) closeBtn.onclick = hideTT;
  const resetBtn = ttOverlay.querySelector('#ttReset');
  if (resetBtn) resetBtn.onclick = () => { resetTree(); renderTT(playerLevel); };
  ttOverlay.querySelector('.tt-backdrop').onclick = hideTT;
}

// ─── Build / Show / Hide ────────────────────────────────────────
function buildTT() {
  ttOverlay = document.createElement('div');
  ttOverlay.id = 'talentTreeOverlay';
  ttOverlay.className = 'tt-overlay';
  ttOverlay.setAttribute('hidden', '');
  ttOverlay.setAttribute('role', 'dialog');
  ttOverlay.setAttribute('aria-modal', 'true');
  ttOverlay.innerHTML = `
    <div class="tt-panel">
      <header class="tt-header">
        <div class="tt-header-left">
          <span class="tt-title"> ÁRVORE DE TALENTOS</span>
          <kbd class="tt-key">T</kbd>
          <span class="tt-class-name"></span>
        </div>
        <div class="tt-pts-bar">
          <span>Pontos: <b class="tt-pts-avail">0</b> disponíveis / <b class="tt-pts-used">0</b> usados / <b class="tt-pts-total">0</b> total</span>
        </div>
        <div class="tt-header-right">
          <button class="tt-reset-btn" id="ttReset">↺ Redefinir</button>
          <button class="tt-close-btn" id="ttClose"></button>
        </div>
      </header>
      <nav class="tt-class-tabs"></nav>
      <div class="tt-body">
        <div class="tt-left">
          <nav class="tt-path-tabs"></nav>
          <div class="tt-columns"></div>
        </div>
        <aside class="tt-detail-panel"><div class="tt-detail-empty">← Selecione um talento</div></aside>
      </div>
    </div>
    <div class="tt-backdrop"></div>
  `;
  document.getElementById('app').appendChild(ttOverlay);
}

function showTT(playerLevel, classId) {
  if (!ttOverlay) buildTT();
  ttVisible = true;
  if (classId) ttClassId = classId;
  renderTT(playerLevel);
  ttOverlay.removeAttribute('hidden');
  ttOverlay.classList.add('tt-entering');
  setTimeout(() => ttOverlay.classList.remove('tt-entering'), 300);
}
function hideTT() {
  if (!ttOverlay) return;
  ttVisible = false;
  ttOverlay.classList.add('tt-leaving');
  setTimeout(() => { ttOverlay.setAttribute('hidden', ''); ttOverlay.classList.remove('tt-leaving'); }, 200);
}
function toggleTT(playerLevel, classId) { if (ttVisible) hideTT(); else showTT(playerLevel, classId); }

// ─── Save / Load ─────────────────────────────────────────────────
function saveTT()   { try { localStorage.setItem('tdc-talents', JSON.stringify({ invested, ttClassId })); } catch(_){} }
function loadTT()   { try { const s = JSON.parse(localStorage.getItem('tdc-talents')||'null'); if(s){ invested=s.invested||{}; ttClassId=s.ttClassId||'guerreiro'; } } catch(_){} }

loadTT();
window.TalentTree = { showTT, hideTT, toggleTT, invest, resetTree, saveTT, loadTT, TALENT_TREES, getInvested, getPoints };
window._ttMsg = null; // to be set by game.js to the msg() function

export const talentTree = window.TalentTree;