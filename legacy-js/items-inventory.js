(() => {
  // ─────────────────────────────────────────────────────────────
  // TERRA DAS CINZAS · Sistema de Itens, Equipamentos e Inventário
  // ─────────────────────────────────────────────────────────────

  const RARITY_COLORS = {
    comum:    { border: '#71717a', text: '#d4d4d8', bg: 'rgba(113, 113, 122, 0.15)', glow: 'rgba(113, 113, 122, 0.3)' },
    incomum:  { border: '#16a34a', text: '#86efac', bg: 'rgba(22, 163, 74, 0.15)', glow: 'rgba(22, 163, 74, 0.35)' },
    raro:     { border: '#2563eb', text: '#93c5fd', bg: 'rgba(37, 99, 235, 0.18)', glow: 'rgba(37, 99, 235, 0.4)' },
    epico:    { border: '#9333ea', text: '#d8b4fe', bg: 'rgba(147, 51, 234, 0.20)', glow: 'rgba(147, 51, 234, 0.45)' },
    lendario: { border: '#d97706', text: '#fde047', bg: 'rgba(217, 119, 6, 0.24)', glow: 'rgba(217, 119, 6, 0.55)' },
    supremo:  { border: '#e11d48', text: '#fda4af', bg: 'rgba(225, 29, 72, 0.28)', glow: 'rgba(225, 29, 72, 0.65)' }
  };

  const ITEM_DATABASE = {
    // ─── ARMAS: GUERREIRO ───
    'w_espada_ferro': { id: 'w_espada_ferro', name: 'Espada de Ferro Nobre', type: 'weapon', classId: 'guerreiro', rarity: 'comum', level: 1, damage: 14, defense: 2, icon: '⚔', iconImg: 'assets/items/weapons/sword_2024_23.png', value: 35, desc: 'Uma lâmina de ferro confiável forjada para recrutas da guarda.' },
    'w_lamina_cinzas': { id: 'w_lamina_cinzas', name: 'Lâmina das Cinzas', type: 'weapon', classId: 'guerreiro', rarity: 'raro', level: 15, damage: 36, defense: 6, crit: 0.06, icon: '🗡', iconImg: 'assets/items/weapons/sword_2024_02.png', value: 240, desc: 'Temperada nas cinzas eternas de Miraluz. Causa chamas sutis ao atingir.' },
    'w_espadao_guardiao': { id: 'w_espadao_guardiao', name: 'Espadão do Guardião Rúnico', type: 'weapon', classId: 'guerreiro', rarity: 'epico', level: 45, damage: 85, defense: 15, hp: 80, icon: '⚔', iconImg: 'assets/items/weapons/sword_2026_05.png', value: 950, desc: 'Arma cerimonial pesada de um dos campeões da Cidadela das Cinzas.' },
    'w_gloria_rubra': { id: 'w_gloria_rubra', name: 'Glória Rubra da Fornalha', type: 'weapon', classId: 'guerreiro', rarity: 'lendario', level: 75, damage: 165, defense: 28, lifesteal: 0.05, icon: '🔥', iconImg: 'assets/items/weapons/sword_2024_04.png', value: 3800, desc: 'Banhada em magma ancestral. Concede roubo de vida a cada corte.' },
    'w_corte_eclipse': { id: 'w_corte_eclipse', name: 'Corte do Primeiro Fogo', type: 'weapon', classId: 'guerreiro', rarity: 'supremo', level: 120, damage: 320, defense: 55, crit: 0.12, lifesteal: 0.08, icon: '👑', iconImg: 'assets/items/weapons/sword_2025_04.png', value: 18000, desc: 'A lâmina suprema que desafiou o eclipse. Sua presença distorce o ar.' },


    // ─── COLEÇÃO LENDÁRIA DE ESPADAS PIXEL ART (SWORDTEMBER) ───
    'w_florete_cristal': { id: 'w_florete_cristal', name: 'Florete de Cristal Lunar', type: 'weapon', rarity: 'raro', level: 20, damage: 48, crit: 0.10, icon: '💎', iconImg: 'assets/items/weapons/sword_2024_07.png', value: 380, desc: 'Lâmina translúcida lapidada em quartzo estelar. Seus estocadas perfuram a armadura inimiga.' },
    'w_sabre_tormenta': { id: 'w_sabre_tormenta', name: 'Sabre da Tormenta Elétrica', type: 'weapon', rarity: 'raro', level: 25, damage: 56, crit: 0.08, icon: '⚡', iconImg: 'assets/items/weapons/sword_2024_08.png', value: 460, desc: 'Forjada durante uma tempestade de raios nas montanhas. Solta faíscas a cada corte.' },
    'w_foice_vento': { id: 'w_foice_vento', name: 'Ceifadora do Vento Cortante', type: 'weapon', rarity: 'raro', level: 30, damage: 65, crit: 0.12, icon: '🌪️', iconImg: 'assets/items/weapons/sword_2024_09.png', value: 580, desc: 'Corta o ar com velocidade inaudível, criando micro-vórtices cortantes.' },
    'w_devoradora_almas': { id: 'w_devoradora_almas', name: 'Devoradora de Almas Sepultada', type: 'weapon', rarity: 'epico', level: 50, damage: 105, lifesteal: 0.06, hp: 90, icon: '☠️', iconImg: 'assets/items/weapons/sword_2024_21.png', value: 1250, desc: 'Runas necromânticas gravadas na lâmina drenam a vitalidade dos alvos atingidos.' },
    'w_lamina_sombras': { id: 'w_lamina_sombras', name: 'Corte do Abismo Noturno', type: 'weapon', rarity: 'epico', level: 58, damage: 120, crit: 0.16, icon: '🌑', iconImg: 'assets/items/weapons/sword_2024_12.png', value: 1450, desc: 'Envolta em névoa negra perene. Os inimigos mal enxergam a direção de onde veio o golpe.' },
    'w_cutelo_magma': { id: 'w_cutelo_magma', name: 'Cutelo do Vulcão Ancestral', type: 'weapon', rarity: 'epico', level: 65, damage: 140, defense: 14, icon: '🔥', iconImg: 'assets/items/weapons/sword_2026_20.png', value: 1750, desc: 'Forjado em rocha vulcânica densa. Causa chamas intensas e destrói escudos.' },
    'w_tridente_arcano': { id: 'w_tridente_arcano', name: 'Lança-Espada da Maré Cósmica', type: 'weapon', rarity: 'epico', level: 70, damage: 155, arcane: 60, icon: '🔱', iconImg: 'assets/items/weapons/sword_2026_25.png', value: 1980, desc: 'Conduz a força das marés primordiais para golpes arcanos avassaladores.' },
    'w_lamina_do_sol': { id: 'w_lamina_do_sol', name: 'Aurora do Sol Radiante', type: 'weapon', rarity: 'lendario', level: 85, damage: 195, arcane: 75, crit: 0.12, icon: '☀️', iconImg: 'assets/items/weapons/sword_2026_19.png', value: 5200, desc: 'Emite o brilho fulgurante do zênite solar. Mortos-vivos entram em combustão ao toque.' },
    'w_asa_sagrada': { id: 'w_asa_sagrada', name: 'Lâmina das Asas Celestiais', type: 'weapon', rarity: 'lendario', level: 90, damage: 215, hp: 180, lifesteal: 0.05, icon: '🪽', iconImg: 'assets/items/weapons/sword_2025_22.png', value: 6000, desc: 'Pena de arcanjo transmuta em aço sagrado inviolável que protege e cura seu portador.' },
    'w_espada_esmeralda': { id: 'w_espada_esmeralda', name: 'Glaive da Floresta Antiga', type: 'weapon', rarity: 'lendario', level: 98, damage: 235, crit: 0.20, icon: '🌿', iconImg: 'assets/items/weapons/sword_2026_15.png', value: 6800, desc: 'Cresce e se regenera com gavinhas vegetais e cristais de esmeralda milenares.' },
    'w_chama_celeste': { id: 'w_chama_celeste', name: 'Chama Celeste da Criação', type: 'weapon', rarity: 'supremo', level: 125, damage: 360, arcane: 130, crit: 0.15, lifesteal: 0.08, icon: '🌌', iconImg: 'assets/items/weapons/sword_2025_01.png', value: 21000, desc: 'Artefato cósmico que riscou o firmamento antes das ruínas existirem.' },
    'w_centelha_draconica': { id: 'w_centelha_draconica', name: 'Presa do Dragão Primordial', type: 'weapon', rarity: 'supremo', level: 140, damage: 410, defense: 45, crit: 0.22, lifesteal: 0.12, icon: '🐲', iconImg: 'assets/items/weapons/sword_2026_29.png', value: 26000, desc: 'Esculpida a partir do chifre de um wyrm ancião. Ruge como uma tempestade a cada investida.' },

    // ─── ARMAS: ARQUEIRO ───
    'w_arco_cacador': { id: 'w_arco_cacador', name: 'Arco do Caçador Errante', type: 'weapon', classId: 'arqueiro', rarity: 'comum', level: 1, damage: 15, range: 25, icon: '🏹', value: 35, desc: 'Madeira tratada com óleo vegetal, precisa e veloz.' },
    'w_arco_ecos': { id: 'w_arco_ecos', name: 'Arco dos Ecos Silenciosos', type: 'weapon', classId: 'arqueiro', rarity: 'raro', level: 15, damage: 38, crit: 0.08, range: 45, icon: '🏹', value: 250, desc: 'Suas flechas não emitem som antes do impacto mortal.' },
    'w_arco_tempestade': { id: 'w_arco_tempestade', name: 'Arco da Tempestade Esmeralda', type: 'weapon', classId: 'arqueiro', rarity: 'epico', level: 45, damage: 88, crit: 0.12, range: 60, icon: '🏹', value: 980, desc: 'Carregado com ventos cortantes das montanhas mais altas.' },
    'w_olho_fenix': { id: 'w_olho_fenix', name: 'Olho da Fênix de Cinzas', type: 'weapon', classId: 'arqueiro', rarity: 'lendario', level: 75, damage: 175, crit: 0.18, range: 80, icon: '🦅', value: 4200, desc: 'Flechas incendiárias que perfuram múltiplos alvos.' },
    'w_estrela_cadente': { id: 'w_estrela_cadente', name: 'Arco Cometa do Infinito', type: 'weapon', classId: 'arqueiro', rarity: 'supremo', level: 120, damage: 340, crit: 0.25, range: 110, icon: '🌟', value: 19500, desc: 'Flechas feitas de luz estelar sólida que nunca erram o alvo.' },

    // ─── ARMAS: MAGO ───
    'w_cajado_salgueiro': { id: 'w_cajado_salgueiro', name: 'Cajado de Salgueiro Arcano', type: 'weapon', classId: 'mago', rarity: 'comum', level: 1, damage: 16, arcane: 18, icon: '✦', value: 35, desc: 'Foco canalizador de faíscas elementais para aprendizes.' },
    'w_cetro_chama_antiga': { id: 'w_cetro_chama_antiga', name: 'Cetro da Chama Antiga', type: 'weapon', classId: 'mago', rarity: 'raro', level: 15, damage: 40, arcane: 45, icon: '🔥', value: 260, desc: 'Gema rubra no topo emite pulsos contínuos de calor místico.' },
    'w_baculo_arquivo': { id: 'w_baculo_arquivo', name: 'Báculo do Arquivo Sepultado', type: 'weapon', classId: 'mago', rarity: 'epico', level: 45, damage: 95, arcane: 110, icon: '📜', value: 1050, desc: 'Encantado com páginas perdidas do Grimório de Naeva.' },
    'w_astrolabio_vazio': { id: 'w_astrolabio_vazio', name: 'Singularidade Astral', type: 'weapon', classId: 'mago', rarity: 'lendario', level: 75, damage: 190, arcane: 220, icon: '🌌', value: 4500, desc: 'Distorce a gravidade e amplifica danos arcanos brutalmente.' },
    'w_aurora_suprema': { id: 'w_aurora_suprema', name: 'Cajado do Eclipse Eterno', type: 'weapon', classId: 'mago', rarity: 'supremo', level: 120, damage: 370, arcane: 440, icon: '🔮', value: 21000, desc: 'Permite invocar as energias primordiais da criação do mundo.' },

    // ─── ARMAS: ASSASSINO, BÁRBARO & CLÉRIGO ───
    'w_adagas_sombra': { id: 'w_adagas_sombra', name: 'Adagas da Noite Eterna', type: 'weapon', classId: 'assasino', rarity: 'raro', level: 15, damage: 35, crit: 0.15, icon: '🗡', value: 260, desc: 'Par de lâminas com veneno sombrio de ação rápida.' },
    'w_machado_voraz': { id: 'w_machado_voraz', name: 'Machado do Quebra-Montanhas', type: 'weapon', classId: 'barbaro', rarity: 'raro', level: 15, damage: 42, hp: 50, icon: '🪓', value: 270, desc: 'Corta rochas e crânios com a mesma facilidade impiedosa.' },
    'w_maca_aurora': { id: 'w_maca_aurora', name: 'Maça da Aurora Dourada', type: 'weapon', classId: 'clerigo', rarity: 'raro', level: 15, damage: 32, arcane: 30, hp: 40, icon: '✚', value: 260, desc: 'Banhada em água benta das fontes do Castelo em Cinzas.' },

    // ─── EQUIPAMENTOS: ESCUDOS & SECUNDÁRIAS ───
    'sh_madeira_reforcada': { id: 'sh_madeira_reforcada', name: 'Broquel de Madeira Nobre', type: 'shield', rarity: 'comum', level: 1, defense: 4, hp: 20, icon: '🛡', iconImg: 'assets/icons/skills/Icon43.png', value: 30, desc: 'Madeira espessa com rebites de latão para defesa básica.' },
    'sh_ferro_runico': { id: 'sh_ferro_runico', name: 'Escudo Rúnico da Vigia', type: 'shield', rarity: 'raro', level: 18, defense: 12, hp: 60, icon: '🛡', value: 280, desc: 'Gravações ancestrais absorvem parte do impacto cinético.' },
    'sh_baluarte_obsidiana': { id: 'sh_baluarte_obsidiana', name: 'Baluarte de Obsidiana e Ouro', type: 'shield', rarity: 'epico', level: 48, defense: 28, hp: 160, lifesteal: 0.02, icon: '🛡', value: 1100, desc: 'Forjado no coração da fornalha. Praticamente inquebrável.' },
    'sh_egide_sol': { id: 'sh_egide_sol', name: 'Égide do Sol Nascente', type: 'shield', rarity: 'lendario', level: 80, defense: 54, hp: 350, arcane: 40, icon: '✨', value: 4500, desc: 'Reflete projéteis inimigos com brilho ofuscante.' },

    // ─── EQUIPAMENTOS: ELMOS (HELM) ───
    'hl_couro_batedor': { id: 'hl_couro_batedor', name: 'Capuz de Couro das Ruínas', type: 'helm', rarity: 'comum', level: 1, defense: 3, hp: 15, icon: '🪖', value: 30, desc: 'Protege contra ventos frios e pequenas lascas de pedra.' },
    'hl_elmo_ferro': { id: 'hl_elmo_ferro', name: 'Elmo de Batalha do Paladino', type: 'helm', rarity: 'raro', level: 16, defense: 9, hp: 50, crit: 0.03, icon: '🪖', value: 260, desc: 'Visor angular para máxima visão de campo e proteção craniana.' },
    'hl_coroa_runica': { id: 'hl_coroa_runica', name: 'Coroa Rúnica das Cinzas', type: 'helm', rarity: 'epico', level: 46, defense: 20, hp: 130, arcane: 35, icon: '👑', value: 1050, desc: 'Artefato régio com cristais que pulsam em sintonia com a magia.' },
    'hl_elmo_dragao': { id: 'hl_elmo_dragao', name: 'Elmo de Escamas do Dragão', type: 'helm', rarity: 'lendario', level: 78, defense: 42, hp: 300, crit: 0.08, icon: '🐲', value: 4400, desc: 'Confeccionado com presas e escamas fossilizadas de wyverns.' },

    // ─── EQUIPAMENTOS: ARMADURAS / PEITORAIS (ARMOR) ───
    'ar_tunica_linho': { id: 'ar_tunica_linho', name: 'Túnica de Linho Acolchoada', type: 'armor', rarity: 'comum', level: 1, defense: 5, hp: 30, icon: '🥋', value: 40, desc: 'Vestimenta de viagem flexível com reforço de couro leve.' },
    'ar_cota_malha': { id: 'ar_cota_malha', name: 'Cota de Malha da Cidadela', type: 'armor', rarity: 'raro', level: 18, defense: 16, hp: 90, icon: '🥋', value: 310, desc: 'Elos de aço entrelaçados oferecem proteção substancial contra cortes.' },
    'ar_placas_guardiao': { id: 'ar_placas_guardiao', name: 'Armadura de Placas do Guardião', type: 'armor', rarity: 'epico', level: 50, defense: 38, hp: 220, lifesteal: 0.03, icon: '🥋', value: 1300, desc: 'Armadura completa forjada para enfrentar monstros abissais.' },
    'ar_peitoral_primeiro_fogo': { id: 'ar_peitoral_primeiro_fogo', name: 'Manto do Primeiro Fogo', type: 'armor', rarity: 'lendario', level: 82, defense: 75, hp: 480, arcane: 60, icon: '🔥', value: 5100, desc: 'Aura radiante que consome ataques mágicos e físicos com bravura.' },

    // ─── EQUIPAMENTOS: BOTAS (BOOTS) ───
    'bt_botas_viagem': { id: 'bt_botas_viagem', name: 'Botas de Couro Resistente', type: 'boots', rarity: 'comum', level: 1, defense: 2, hp: 15, icon: '🥾', value: 25, desc: 'Confortáveis para longas marchas pelas estradas de pedra.' },
    'bt_passos_espectrais': { id: 'bt_passos_espectrais', name: 'Grevas dos Passos Espectrais', type: 'boots', rarity: 'raro', level: 17, defense: 8, hp: 45, crit: 0.04, icon: '🥾', value: 270, desc: 'Passadas silenciosas como o nevoeiro da madrugada.' },
    'bt_botas_tempestade': { id: 'bt_botas_tempestade', name: 'Botas Aladas do Batedor', type: 'boots', rarity: 'epico', level: 47, defense: 18, hp: 110, crit: 0.07, icon: '🥾', value: 1020, desc: 'Encantadas com a leveza das brisas das montanhas.' },
    'bt_passos_chamas': { id: 'bt_passos_chamas', name: 'Passos da Fênix Rubra', type: 'boots', rarity: 'lendario', level: 79, defense: 36, hp: 250, lifesteal: 0.03, icon: '🔥', value: 4300, desc: 'Deixa brasas vivas no solo, conferindo agilidade lendária.' },

    // ─── ACESSÓRIOS: ANÉIS (RINGS) ───
    'acc_anel_cobre': { id: 'acc_anel_cobre', name: 'Anel de Cobre Polido', type: 'ring', rarity: 'comum', level: 1, hp: 15, defense: 1, icon: '💍', value: 25, desc: 'Um aro simples que confere leve proteção.' },
    'acc_anel_falcao': { id: 'acc_anel_falcao', name: 'Anel do Olho de Falcão', type: 'ring', rarity: 'raro', level: 20, crit: 0.06, damage: 10, icon: '💍', value: 320, desc: 'Aguça os reflexos e a precisão dos golpes.' },
    'acc_anel_arcano': { id: 'acc_anel_arcano', name: 'Selo das Cinzas Místicas', type: 'ring', rarity: 'epico', level: 50, arcane: 35, hp: 90, icon: '💍', value: 1100, desc: 'Aumenta consideravelmente as reservas de vida e energia mágica.' },
    'acc_anel_colosso': { id: 'acc_anel_colosso', name: 'Anel do Coração Colossal', type: 'ring', rarity: 'lendario', level: 80, hp: 260, defense: 22, lifesteal: 0.03, icon: '💎', value: 4800, desc: 'Forjado no núcleo da terra. O portador adquire vitalidade gigantesca.' },
    'acc_anel_supremo': { id: 'acc_anel_supremo', name: 'Aliança do Eclipse Cósmico', type: 'ring', rarity: 'supremo', level: 130, hp: 600, damage: 70, defense: 40, crit: 0.10, icon: '👑', value: 22000, desc: 'O anel dos reis ancestrais de Miraluz. Poder incomparável.' },

    // ─── ACESSÓRIOS: AMULETOS / COLARES (AMULET) ───
    'acc_amuleto_pedra': { id: 'acc_amuleto_pedra', name: 'Pingente de Quartzo Bruto', type: 'amulet', rarity: 'comum', level: 1, hp: 20, icon: '📿', value: 30, desc: 'Protege contra pequenos feitiços e dá vigor.' },
    'acc_amuleto_berserker': { id: 'acc_amuleto_berserker', name: 'Talismã da Fúria Vermelha', type: 'amulet', rarity: 'raro', level: 25, damage: 18, crit: 0.08, icon: '📿', value: 380, desc: 'Faz o sangue ferver quando sob perigo iminente.' },
    'acc_amuleto_runico': { id: 'acc_amuleto_runico', name: 'Colar de Brasas Eternas', type: 'amulet', rarity: 'epico', level: 55, hp: 120, defense: 18, lifesteal: 0.04, icon: '📿', value: 1250, desc: 'Emite pulsações curativas durante a batalha.' },
    'acc_amuleto_supremo': { id: 'acc_amuleto_supremo', name: 'Lágrima das Estrelas Caídas', type: 'amulet', rarity: 'supremo', level: 140, hp: 750, damage: 95, arcane: 95, defense: 45, icon: '✨', value: 25000, desc: 'Artefato místico com poder suficiente para regenerar exércitos.' },

    // ─── CONSUMÍVEIS ───
    'pot_vida_pequena': { id: 'pot_vida_pequena', name: 'Poção de Vida Menor', type: 'consumable', rarity: 'comum', subType: 'heal', heal: 60, icon: '🧪', iconImg: 'assets/icons/skills/Icon42.png', value: 15, buyPrice: 20, stackable: true, desc: 'Restaura 60 pontos de vida instantaneamente.' },
    'pot_vida_media': { id: 'pot_vida_media', name: 'Poção de Vida Maior', type: 'consumable', rarity: 'incomum', subType: 'heal', heal: 180, icon: '🧪', value: 45, buyPrice: 65, stackable: true, desc: 'Restaura 180 pontos de vida instantaneamente.' },
    'pot_vida_suprema': { id: 'pot_vida_suprema', name: 'Elixir da Vitalidade Élfica', type: 'consumable', rarity: 'raro', subType: 'heal', heal: 450, icon: '🍷', value: 120, buyPrice: 180, stackable: true, desc: 'Restaura 450 pontos de vida e confere vigor supremo.' },
    'pot_energia': { id: 'pot_energia', name: 'Frasco de Energia Arcana', type: 'consumable', rarity: 'comum', subType: 'energy', energy: 60, icon: '⚡', value: 30, buyPrice: 45, stackable: true, desc: 'Restaura 60 de energia imediatamente.' },
    'scroll_retorno': { id: 'scroll_retorno', name: 'Pergaminho do Castelo', type: 'consumable', rarity: 'comum', subType: 'teleport_hub', icon: '📜', value: 20, buyPrice: 35, stackable: true, desc: 'Teleporta você de volta em segurança para o Castelo em Cinzas.' },
    'elixir_forca': { id: 'elixir_forca', name: 'Elixir da Fúria Titânica', type: 'consumable', rarity: 'raro', subType: 'buff_atk', icon: '⚗️', value: 150, buyPrice: 220, stackable: true, desc: 'Bebida alquímica que concede +25% de dano por 5 minutos.' },
    'elixir_pedra': { id: 'elixir_pedra', name: 'Tintura de Pele de Pedra', type: 'consumable', rarity: 'raro', subType: 'buff_def', icon: '🍶', value: 140, buyPrice: 200, stackable: true, desc: 'Endurece a pele reduzindo todo dano recebido em 12 por 5 minutos.' },

    // ─── MATERIAIS DE FORJA & EXPEDIÇÃO ───
    'mat_fragmento_brasa': { id: 'mat_fragmento_brasa', name: 'Fragmento de Brasa Sagrada', type: 'material', rarity: 'raro', icon: '🔥', value: 100, stackable: true, desc: 'Centelha incandescente das ruínas de Miraluz. Usado para aprimorar armas na Forja.' },
    'mat_lingote_ferro': { id: 'mat_lingote_ferro', name: 'Lingote de Ferro Rúnico', type: 'material', rarity: 'comum', icon: '🧱', value: 25, stackable: true, desc: 'Ferro fundido puro para reforço de lâminas e armaduras.' },
    'mat_cristal_mata': { id: 'mat_cristal_mata', name: 'Cristal da Mata Profunda', type: 'material', rarity: 'incomum', icon: '💎', value: 50, stackable: true, desc: 'Gema com reflexos esmeralda extraída de veios luminosos.' }
  };

  // State
  let equipped = {
    weapon: null,
    shield: null,
    helm: null,
    armor: null,
    boots: null,
    amulet: null,
    ring1: null,
    ring2: null
  };

  let inventory = []; // Array of { id, instanceId, enhanceLevel, count, customStats }
  const MAX_INVENTORY_SLOTS = 32;
  let activeFilter = 'all'; // 'all', 'equipment', 'consumable', 'material'
  let selectedSlot = null; // { type: 'inv' | 'equip', index: number | string }

  function loadInventory() {
    try {
      const s = JSON.parse(localStorage.getItem('tdc-equipment-v1') || 'null');
      if (s) {
        equipped = Object.assign({
          weapon: null,
          shield: null,
          helm: null,
          armor: null,
          boots: null,
          amulet: null,
          ring1: null,
          ring2: null
        }, s.equipped || {});
        inventory = s.inventory || [];
      } else {
        // Starter equipment kit
        inventory = [
          { id: 'w_espada_ferro', count: 1, enhanceLevel: 0 },
          { id: 'sh_madeira_reforcada', count: 1, enhanceLevel: 0 },
          { id: 'hl_couro_batedor', count: 1, enhanceLevel: 0 },
          { id: 'ar_tunica_linho', count: 1, enhanceLevel: 0 },
          { id: 'bt_botas_viagem', count: 1, enhanceLevel: 0 },
          { id: 'acc_anel_cobre', count: 1, enhanceLevel: 0 },
          { id: 'pot_vida_pequena', count: 5 },
          { id: 'scroll_retorno', count: 3 },
          { id: 'mat_fragmento_brasa', count: 2 }
        ];
        // Auto-equip basic gear on fresh start
        equipped.weapon = { id: 'w_espada_ferro', count: 1, enhanceLevel: 0 };
        equipped.armor = { id: 'ar_tunica_linho', count: 1, enhanceLevel: 0 };
        equipped.boots = { id: 'bt_botas_viagem', count: 1, enhanceLevel: 0 };
        equipped.ring1 = { id: 'acc_anel_cobre', count: 1, enhanceLevel: 0 };
        inventory = inventory.filter(i => !['w_espada_ferro', 'ar_tunica_linho', 'bt_botas_viagem', 'acc_anel_cobre'].includes(i.id));
      }
    } catch (_) {}
  }

  function saveInventory() {
    try {
      localStorage.setItem('tdc-equipment-v1', JSON.stringify({ equipped, inventory }));
    } catch (_) {}
  }

  function addItem(itemId, count = 1, enhanceLevel = 0) {
    const base = ITEM_DATABASE[itemId];
    if (!base) return false;

    if (base.stackable) {
      const existing = inventory.find((i) => i.id === itemId);
      if (existing) {
        existing.count = (existing.count || 1) + count;
        saveInventory();
        refreshAllInventoryViews();
        return true;
      }
    }

    if (inventory.length >= MAX_INVENTORY_SLOTS) {
      if (window.GameUI?.msg) window.GameUI.msg('Bolsa cheia! Não foi possível receber o item.');
      return false;
    }

    inventory.push({
      id: itemId,
      instanceId: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      count: base.stackable ? count : 1,
      enhanceLevel: enhanceLevel || 0
    });
    saveInventory();
    refreshAllInventoryViews();
    return true;
  }

  function removeItem(index, count = 1) {
    if (index < 0 || index >= inventory.length) return;
    const it = inventory[index];
    if (it.count > count) {
      it.count -= count;
    } else {
      inventory.splice(index, 1);
    }
    saveInventory();
    refreshAllInventoryViews();
  }

  function equipItem(index) {
    const it = inventory[index];
    if (!it) return;
    const base = ITEM_DATABASE[it.id];
    if (!base) return;

    let slot = null;
    if (base.type === 'weapon') slot = 'weapon';
    else if (base.type === 'shield') slot = 'shield';
    else if (base.type === 'helm') slot = 'helm';
    else if (base.type === 'armor') slot = 'armor';
    else if (base.type === 'boots') slot = 'boots';
    else if (base.type === 'ring') slot = !equipped.ring1 ? 'ring1' : (!equipped.ring2 ? 'ring2' : 'ring1');
    else if (base.type === 'amulet') slot = 'amulet';

    if (!slot) return;

    // Check class requirement for weapons
    const p = window._tdcPlayer;
    if (base.classId && p && base.classId !== p.classId) {
      if (window.GameUI?.msg) window.GameUI.msg(`Essa arma exige a classe ${base.classId.toUpperCase()}!`);
      return;
    }

    // Unequip currently equipped
    const current = equipped[slot];
    equipped[slot] = { ...it, count: 1 };
    inventory.splice(index, 1);

    if (current) {
      inventory.push(current);
    }

    if (window.GameAudio?.playShield) window.GameAudio.playShield();
    if (window.GameUI?.msg) window.GameUI.msg(`Equipou ${getItemName(equipped[slot])}!`);

    saveInventory();
    selectedSlot = { type: 'equip', slot };
    refreshAllInventoryViews();
  }

  function unequipItem(slot) {
    const current = equipped[slot];
    if (!current) return;
    if (inventory.length >= MAX_INVENTORY_SLOTS) {
      if (window.GameUI?.msg) window.GameUI.msg('Inventário cheio para desequipar!');
      return;
    }
    equipped[slot] = null;
    inventory.push(current);
    if (window.GameAudio?.playSlash) window.GameAudio.playSlash();
    if (window.GameUI?.msg) window.GameUI.msg(`Desequipou ${getItemName(current)}!`);
    saveInventory();
    selectedSlot = null;
    refreshAllInventoryViews();
  }

  function getEquipmentBonuses() {
    let bonus = { damage: 0, defense: 0, hp: 0, arcane: 0, crit: 0, lifesteal: 0, range: 0 };
    Object.values(equipped).forEach((eq) => {
      if (!eq) return;
      const base = ITEM_DATABASE[eq.id];
      if (!base) return;
      const mult = 1 + (eq.enhanceLevel || 0) * 0.12; // +12% per upgrade
      if (base.damage) bonus.damage += Math.round(base.damage * mult);
      if (base.defense) bonus.defense += Math.round(base.defense * mult);
      if (base.hp) bonus.hp += Math.round(base.hp * mult);
      if (base.arcane) bonus.arcane += Math.round(base.arcane * mult);
      if (base.crit) bonus.crit += base.crit * mult;
      if (base.lifesteal) bonus.lifesteal += base.lifesteal;
      if (base.range) bonus.range += base.range;
    });
    return bonus;
  }

  function useConsumable(index) {
    const it = inventory[index];
    if (!it) return;
    const base = ITEM_DATABASE[it.id];
    if (!base) return;

    const p = window._tdcPlayer;
    if (base.subType === 'heal' && p) {
      if (p.hp >= p.max) return window.GameUI?.msg?.('Vida já está cheia!');
      p.hp = Math.min(p.max, p.hp + base.heal);
      if (window.GameAudio?.playHeal) window.GameAudio.playHeal();
      window.GameUI?.msg?.(`Usou ${base.name}! +${base.heal} HP`);
      removeItem(index, 1);
    } else if (base.subType === 'energy' && p) {
      p.en = Math.min(100, p.en + base.energy);
      if (window.GameAudio?.playArcane) window.GameAudio.playArcane();
      window.GameUI?.msg?.(`Usou ${base.name}! +${base.energy} Energia`);
      removeItem(index, 1);
    } else if (base.subType === 'buff_atk' && p) {
      p.atkBuffUntil = Date.now() + 5 * 60 * 1000;
      if (window.GameAudio?.playLevelUp) window.GameAudio.playLevelUp();
      window.GameUI?.msg?.(`★ Elixir Ativo: +25% de Dano por 5 minutos! ★`);
      removeItem(index, 1);
    } else if (base.subType === 'buff_def' && p) {
      p.defBuffUntil = Date.now() + 5 * 60 * 1000;
      if (window.GameAudio?.playShield) window.GameAudio.playShield();
      window.GameUI?.msg?.(`★ Pele de Pedra Ativa: Dano recebido reduzido em 12 por 5 minutos! ★`);
      removeItem(index, 1);
    } else if (base.subType === 'teleport_hub' && window.GameCastleHub) {
      window.GameCastleHub.teleportToCastle();
      removeItem(index, 1);
      closeInventoryModal();
    }
    refreshAllInventoryViews();
  }

  function getItemName(it) {
    if (!it) return '';
    const base = ITEM_DATABASE[it.id];
    if (!base) return it.id;
    return (it.enhanceLevel ? `+${it.enhanceLevel} ` : '') + base.name;
  }

  function getItemIcon(it) {
    if (!it) return '📦';
    const base = ITEM_DATABASE[it.id];
    return base ? base.icon : '⚔';
  }

  function getItemTooltip(it) {
    if (!it) return '';
    const base = ITEM_DATABASE[it.id];
    if (!base) return '';
    let stats = [];
    const mult = 1 + (it.enhanceLevel || 0) * 0.12;
    if (base.damage) stats.push(`⚔ Dano: +${Math.round(base.damage * mult)}`);
    if (base.defense) stats.push(`🛡 Defesa: +${Math.round(base.defense * mult)}`);
    if (base.hp) stats.push(`❤️ Vida: +${Math.round(base.hp * mult)}`);
    if (base.arcane) stats.push(`✦ Arcano: +${Math.round(base.arcane * mult)}`);
    if (base.crit) stats.push(`🎯 Crítico: +${Math.round(base.crit * 100)}%`);
    if (base.lifesteal) stats.push(`🩸 Roubo de Vida: +${Math.round(base.lifesteal * 100)}%`);
    return `${base.name} [${(base.rarity || 'comum').toUpperCase()}]\n${base.desc || ''}\n${stats.join('\n')}\nClique para inspecionar/equipar`;
  }

  // ─────────────────────────────────────────────────────────────
  // MODAL DE INVENTÁRIO COMPLETO (TECLAS I / B OU BOTÃO TOPO)
  // ─────────────────────────────────────────────────────────────

  function isInventoryModalOpen() {
    return !!document.getElementById('inventoryModalOverlay');
  }

  function closeInventoryModal() {
    const el = document.getElementById('inventoryModalOverlay');
    if (el) el.remove();
  }

  function toggleInventoryModal() {
    if (isInventoryModalOpen()) {
      closeInventoryModal();
    } else {
      openInventoryModal();
    }
  }

  function openInventoryModal() {
    closeInventoryModal();
    const p = window._tdcPlayer || { lvl: 1, gold: 0, crystal: 0, classId: 'guerreiro', hp: 120, max: 120 };
    const charClass = window.GameClasses?.get ? window.GameClasses.get(p.classId) : { name: 'Guerreiro', icon: '⚔' };
    const bonuses = getEquipmentBonuses();

    const overlay = document.createElement('div');
    overlay.id = 'inventoryModalOverlay';
    overlay.className = 'hub-modal-overlay inv-fullscreen-overlay';

    overlay.innerHTML = `
      <div class="hub-modal inv-modal-window">
        <!-- Header -->
        <div class="hub-modal-header inv-modal-header">
          <div class="inv-header-title-box">
            <span class="inv-header-icon">🎒</span>
            <div>
              <h3>MOCHILA & EQUIPAMENTOS DO AVENTUREIRO</h3>
              <small>${charClass.icon} ${charClass.name} · Nível ${p.lvl} · Ruínas de Miraluz</small>
            </div>
          </div>
          <div class="inv-header-wallet">
            <span class="currency-badge"><img src="assets/items/gold-coin.svg" alt="Ouro"> <b>${p.gold || 0}</b></span>
            <span class="currency-badge"><img src="assets/items/forest-crystal.svg" alt="Cristal"> <b>${p.crystal || 0}</b></span>
            <button class="hub-modal-close" id="invModalClose" title="Fechar (ESC ou I)">✕</button>
          </div>
        </div>

        <!-- Body 3 Colunas -->
        <div class="inv-modal-content-grid">
          <!-- Coluna 1: Paperdoll & Status de Combate -->
          <div class="inv-column inv-paperdoll-column">
            <h4 class="inv-col-title">♜ EQUIPAMENTO ATIVO</h4>
            
            <div class="inv-paperdoll-grid">
              <!-- Topo: Elmo, Amuleto -->
              <div class="inv-paperdoll-row">
                ${renderPaperdollSlot('helm', '👑', 'ELMO')}
                ${renderPaperdollSlot('amulet', '📿', 'AMULETO')}
              </div>
              
              <!-- Centro: Arma, Armadura, Escudo -->
              <div class="inv-paperdoll-row">
                ${renderPaperdollSlot('weapon', '⚔', 'ARMA')}
                ${renderPaperdollSlot('armor', '🥋', 'ARMADURA')}
                ${renderPaperdollSlot('shield', '🛡', 'ESCUDO')}
              </div>

              <!-- Base: Anel 1, Botas, Anel 2 -->
              <div class="inv-paperdoll-row">
                ${renderPaperdollSlot('ring1', '💍', 'ANEL 1')}
                ${renderPaperdollSlot('boots', '👢', 'BOTAS')}
                ${renderPaperdollSlot('ring2', '💍', 'ANEL 2')}
              </div>
            </div>

            <!-- Resumo de Atributos do Herói -->
            <div class="inv-stats-card">
              <h5 class="inv-stats-title">✦ ATRIBUTOS DE COMBATE</h5>
              <div class="inv-stats-list">
                <div class="inv-stat-row"><span>⚔ Dano Total:</span> <b>${Math.round((14 + p.lvl * 2.5 + bonuses.damage) * (p.atkBuffUntil && Date.now() < p.atkBuffUntil ? 1.25 : 1))}</b></div>
                <div class="inv-stat-row"><span>🛡 Defesa Total:</span> <b>${(charClass.armor || 0) + bonuses.defense + (p.defBuffUntil && Date.now() < p.defBuffUntil ? 12 : 0)}</b></div>
                <div class="inv-stat-row"><span>❤️ Vida Máxima:</span> <b>${p.max + bonuses.hp}</b></div>
                <div class="inv-stat-row"><span>✦ Poder Arcano:</span> <b>${Math.round((12 + p.lvl * 3 + bonuses.arcane))}</b></div>
                <div class="inv-stat-row"><span>🎯 Chance Crítica:</span> <b>${Math.round(((charClass.critChance || 0.05) + bonuses.crit + (p.sentinelBuffUntil && Date.now() < p.sentinelBuffUntil ? 0.10 : 0)) * 100)}%</b></div>
                <div class="inv-stat-row"><span>🩸 Roubo de Vida:</span> <b>${Math.round(bonuses.lifesteal * 100)}%</b></div>
              </div>
            </div>
          </div>

          <!-- Coluna 2: Mochila & Filtros (32 Slots) -->
          <div class="inv-column inv-backpack-column">
            <div class="inv-backpack-header">
              <h4 class="inv-col-title">🎒 MOCHILA (${inventory.length}/${MAX_INVENTORY_SLOTS})</h4>
              <div class="inv-filter-tabs">
                <button class="inv-filter-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">Todos</button>
                <button class="inv-filter-btn ${activeFilter === 'equipment' ? 'active' : ''}" data-filter="equipment">Equipamentos</button>
                <button class="inv-filter-btn ${activeFilter === 'consumable' ? 'active' : ''}" data-filter="consumable">Consumíveis</button>
                <button class="inv-filter-btn ${activeFilter === 'material' ? 'active' : ''}" data-filter="material">Materiais</button>
              </div>
            </div>

            <!-- Grade 32 Slots -->
            <div class="inv-grid-container-full" id="invFullGrid">
              ${renderBackpackSlotsHtml()}
            </div>

            <div class="inv-backpack-hint">
              <span>💡 Dica: Clique para inspecionar · Clique duplo para equipar ou usar · Tecla I para fechar.</span>
            </div>
          </div>

          <!-- Coluna 3: Painel de Inspeção do Item -->
          <div class="inv-column inv-inspector-column" id="invInspectorPanel">
            ${renderInspectorHtml()}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    bindInventoryModalEvents(overlay);
  }

  function renderPaperdollSlot(slotKey, defaultIcon, label) {
    const it = equipped[slotKey];
    if (it) {
      const base = ITEM_DATABASE[it.id] || { name: it.id, rarity: 'comum', icon: defaultIcon };
      const rar = RARITY_COLORS[base.rarity] || RARITY_COLORS.comum;
      const isSelected = selectedSlot?.type === 'equip' && selectedSlot?.slot === slotKey;
      return `
        <div class="inv-doll-slot filled ${isSelected ? 'selected' : ''}" data-doll-slot="${slotKey}" style="border-color:${rar.border}; background:${rar.bg}; box-shadow:0 0 10px ${rar.glow};" title="${getItemTooltip(it)}">
          <span class="inv-doll-tag">${label}</span>
          <span class="inv-doll-icon">${base.iconImg ? `<img src="${base.iconImg}" class="inv-doll-img" alt="${base.name}" />` : base.icon}</span>
          <span class="inv-doll-name">${getItemName(it)}</span>
          ${it.enhanceLevel ? `<span class="inv-enhance">+${it.enhanceLevel}</span>` : ''}
        </div>
      `;
    } else {
      const isSelected = selectedSlot?.type === 'equip' && selectedSlot?.slot === slotKey;
      return `
        <div class="inv-doll-slot empty ${isSelected ? 'selected' : ''}" data-doll-slot="${slotKey}">
          <span class="inv-doll-tag">${label}</span>
          <span class="inv-doll-icon-empty">${defaultIcon}</span>
          <span class="inv-doll-name empty-text">Vazio</span>
        </div>
      `;
    }
  }

  function renderBackpackSlotsHtml() {
    let html = '';
    const filteredItems = inventory.map((it, idx) => ({ ...it, originalIndex: idx })).filter(it => {
      if (activeFilter === 'all') return true;
      const base = ITEM_DATABASE[it.id];
      if (!base) return true;
      if (activeFilter === 'equipment') return ['weapon', 'shield', 'helm', 'armor', 'boots', 'ring', 'amulet'].includes(base.type);
      if (activeFilter === 'consumable') return base.type === 'consumable';
      if (activeFilter === 'material') return base.type === 'material';
      return true;
    });

    for (let i = 0; i < MAX_INVENTORY_SLOTS; i++) {
      const it = filteredItems[i];
      if (it) {
        const base = ITEM_DATABASE[it.id] || { name: it.id, rarity: 'comum', icon: '📦' };
        const rar = RARITY_COLORS[base.rarity] || RARITY_COLORS.comum;
        const isSelected = selectedSlot?.type === 'inv' && selectedSlot?.index === it.originalIndex;
        html += `
          <div class="inv-slot filled ${isSelected ? 'selected' : ''}" data-inv-idx="${it.originalIndex}" style="border-color:${rar.border}; background:${rar.bg}; box-shadow:0 0 8px ${rar.glow};" title="${getItemTooltip(it)}">
            <span class="inv-icon">${base.iconImg ? `<img src="${base.iconImg}" class="inv-item-img" alt="${base.name}" />` : base.icon}</span>
            ${it.enhanceLevel ? `<span class="inv-enhance">+${it.enhanceLevel}</span>` : ''}
            ${it.count > 1 ? `<span class="inv-count">${it.count}</span>` : ''}
          </div>
        `;
      } else {
        html += `<div class="inv-slot empty"><span class="inv-slot-rune">◇</span></div>`;
      }
    }
    return html;
  }

  function renderInspectorHtml() {
    let item = null;
    let isEquipped = false;

    if (selectedSlot?.type === 'equip') {
      item = equipped[selectedSlot.slot];
      isEquipped = true;
    } else if (selectedSlot?.type === 'inv' && selectedSlot?.index != null) {
      item = inventory[selectedSlot.index];
      isEquipped = false;
    }

    if (!item) {
      return `
        <div class="inv-inspector-empty">
          <div class="inv-inspect-empty-icon">🔍</div>
          <h4>NENHUM ITEM SELECIONADO</h4>
          <p>Clique em um item da mochila ou em uma peça equipada para ver estatísticas detalhadas, bônus e ações.</p>
        </div>
      `;
    }

    const base = ITEM_DATABASE[item.id] || { name: item.id, rarity: 'comum', icon: '📦', desc: 'Item misterioso das cinzas.' };
    const rar = RARITY_COLORS[base.rarity] || RARITY_COLORS.comum;
    const mult = 1 + (item.enhanceLevel || 0) * 0.12;

    const stats = [];
    if (base.damage) stats.push({ icon: '⚔', label: 'Dano Físico', val: `+${Math.round(base.damage * mult)}` });
    if (base.defense) stats.push({ icon: '🛡', label: 'Defesa', val: `+${Math.round(base.defense * mult)}` });
    if (base.hp) stats.push({ icon: '❤️', label: 'Vida Máxima', val: `+${Math.round(base.hp * mult)}` });
    if (base.arcane) stats.push({ icon: '✦', label: 'Poder Arcano', val: `+${Math.round(base.arcane * mult)}` });
    if (base.crit) stats.push({ icon: '🎯', label: 'Chance Crítica', val: `+${Math.round(base.crit * mult * 100)}%` });
    if (base.lifesteal) stats.push({ icon: '🩸', label: 'Roubo de Vida', val: `+${Math.round(base.lifesteal * 100)}%` });
    if (base.range) stats.push({ icon: '🏹', label: 'Alcance Extra', val: `+${base.range}` });
    if (base.heal) stats.push({ icon: '🧪', label: 'Restauração', val: `${base.heal} HP` });
    if (base.energy) stats.push({ icon: '⚡', label: 'Energia', val: `${base.energy} EN` });

    const isEquippable = ['weapon', 'shield', 'helm', 'armor', 'boots', 'ring', 'amulet'].includes(base.type);
    const isConsumable = base.type === 'consumable';

    return `
      <div class="inv-inspector-card" style="border-top-color:${rar.border};">
        <div class="inv-inspect-header">
          <div class="inv-inspect-icon-frame" style="border-color:${rar.border}; background:${rar.bg}; box-shadow:0 0 16px ${rar.glow};">
            <span class="inv-inspect-big-icon">${base.iconImg ? `<img src="${base.iconImg}" class="inv-inspect-img" alt="${base.name}" />` : base.icon}</span>
            ${item.enhanceLevel ? `<span class="inv-inspect-badge">+${item.enhanceLevel}</span>` : ''}
          </div>
          <div class="inv-inspect-titles">
            <h4 style="color:${rar.text};">${getItemName(item)}</h4>
            <div class="inv-inspect-pills">
              <span class="rarity-pill" style="border-color:${rar.border}; color:${rar.text};">${(base.rarity || 'comum').toUpperCase()}</span>
              <span class="type-pill">${(base.type || 'item').toUpperCase()}</span>
              ${base.level ? `<span class="level-pill">NV. ${base.level}</span>` : ''}
            </div>
          </div>
        </div>

        <div class="inv-inspect-lore">
          <em>"${base.desc || 'Um artefato das ruínas com história esquecida pelo tempo.'}"</em>
        </div>

        ${stats.length ? `
          <div class="inv-inspect-stats-box">
            <span class="inv-box-subtitle">BÔNUS DO ITEM:</span>
            <div class="inv-inspect-stat-grid">
              ${stats.map(s => `
                <div class="inv-inspect-stat-entry">
                  <span>${s.icon} ${s.label}:</span>
                  <b>${s.val}</b>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="inv-inspect-footer-row">
          <span class="inv-inspect-value">Valor: 💰 ${base.value || 10} Ouro</span>
          ${item.count > 1 ? `<span class="inv-inspect-stack">Quantidade: ${item.count}</span>` : ''}
        </div>

        <div class="inv-inspect-actions">
          ${isEquipped ? `
            <button class="menu-button menu-primary" id="btnInspectUnequip" style="background:#7f1d1d; border-color:#ef4444;">DESEQUIPAR</button>
          ` : isEquippable ? `
            <button class="menu-button menu-primary" id="btnInspectEquip" style="background:#15803d; border-color:#22c55e;">EQUIPAR</button>
          ` : isConsumable ? `
            <button class="menu-button menu-primary" id="btnInspectUse" style="background:#2563eb; border-color:#3b82f6;">USAR CONSUMÍVEL</button>
          ` : ''}
          
          ${isEquippable ? `
            <button class="menu-button" id="btnInspectForge" title="Aprimorar este item na Forja das Cinzas">🔨 FORJA (+N)</button>
          ` : ''}
          
          ${!isEquipped ? `
            <button class="menu-button" id="btnInspectDiscard" style="color:#ef4444;" title="Descartar item">DESCARTAR</button>
          ` : ''}
        </div>
      </div>
    `;
  }

  function bindInventoryModalEvents(overlay) {
    // Close button
    const closeBtn = overlay.querySelector('#invModalClose');
    if (closeBtn) closeBtn.onclick = closeInventoryModal;

    // Filter Buttons
    overlay.querySelectorAll('.inv-filter-btn').forEach(btn => {
      btn.onclick = () => {
        activeFilter = btn.dataset.filter;
        overlay.querySelectorAll('.inv-filter-btn').forEach(b => b.classList.toggle('active', b === btn));
        const grid = overlay.querySelector('#invFullGrid');
        if (grid) grid.innerHTML = renderBackpackSlotsHtml();
        rebindSlotEvents(overlay);
      };
    });

    rebindSlotEvents(overlay);
    rebindInspectorActionEvents(overlay);
  }

  function rebindSlotEvents(overlay) {
    // Backpack slot clicks
    overlay.querySelectorAll('.inv-slot.filled').forEach(slot => {
      slot.onclick = () => {
        const idx = Number(slot.dataset.invIdx);
        selectedSlot = { type: 'inv', index: idx };
        updateInspectorAndSelection(overlay);
      };
      slot.ondblclick = () => {
        const idx = Number(slot.dataset.invIdx);
        const it = inventory[idx];
        if (!it) return;
        const base = ITEM_DATABASE[it.id];
        if (base && ['weapon', 'shield', 'helm', 'armor', 'boots', 'ring', 'amulet'].includes(base.type)) {
          equipItem(idx);
        } else if (base && base.type === 'consumable') {
          useConsumable(idx);
        }
      };
    });

    // Paperdoll slot clicks
    overlay.querySelectorAll('.inv-doll-slot').forEach(slot => {
      slot.onclick = () => {
        const slotKey = slot.dataset.dollSlot;
        selectedSlot = { type: 'equip', slot: slotKey };
        updateInspectorAndSelection(overlay);
      };
      slot.ondblclick = () => {
        const slotKey = slot.dataset.dollSlot;
        if (equipped[slotKey]) unequipItem(slotKey);
      };
    });
  }

  function updateInspectorAndSelection(overlay) {
    // Refresh inspector column
    const panel = overlay.querySelector('#invInspectorPanel');
    if (panel) panel.innerHTML = renderInspectorHtml();

    // Refresh selection highlights
    overlay.querySelectorAll('.inv-slot').forEach(s => {
      const idx = Number(s.dataset.invIdx);
      const isSel = selectedSlot?.type === 'inv' && selectedSlot?.index === idx;
      s.classList.toggle('selected', isSel);
    });

    overlay.querySelectorAll('.inv-doll-slot').forEach(s => {
      const slotKey = s.dataset.dollSlot;
      const isSel = selectedSlot?.type === 'equip' && selectedSlot?.slot === slotKey;
      s.classList.toggle('selected', isSel);
    });

    rebindInspectorActionEvents(overlay);
  }

  function rebindInspectorActionEvents(overlay) {
    const equipBtn = overlay.querySelector('#btnInspectEquip');
    if (equipBtn && selectedSlot?.type === 'inv') {
      equipBtn.onclick = () => {
        equipItem(selectedSlot.index);
      };
    }

    const unequipBtn = overlay.querySelector('#btnInspectUnequip');
    if (unequipBtn && selectedSlot?.type === 'equip') {
      unequipBtn.onclick = () => {
        unequipItem(selectedSlot.slot);
      };
    }

    const useBtn = overlay.querySelector('#btnInspectUse');
    if (useBtn && selectedSlot?.type === 'inv') {
      useBtn.onclick = () => {
        useConsumable(selectedSlot.index);
      };
    }

    const forgeBtn = overlay.querySelector('#btnInspectForge');
    if (forgeBtn) {
      forgeBtn.onclick = () => {
        closeInventoryModal();
        if (window.GameCastleHub?.openForgeModal) window.GameCastleHub.openForgeModal();
      };
    }

    const discardBtn = overlay.querySelector('#btnInspectDiscard');
    if (discardBtn && selectedSlot?.type === 'inv') {
      discardBtn.onclick = () => {
        if (confirm('Deseja realmente descartar este item?')) {
          removeItem(selectedSlot.index, 1);
          selectedSlot = null;
        }
      };
    }
  }

  function refreshAllInventoryViews() {
    if (isInventoryModalOpen()) {
      openInventoryModal();
    }
    renderInventoryUI();
  }

  // ─────────────────────────────────────────────────────────────
  // RENDERIZAÇÃO DA ABA LATERAL (TAB 2 · BOLSA)
  // ─────────────────────────────────────────────────────────────

  function renderInventoryUI() {
    const container = document.querySelector('#bagContent') || document.querySelector('.bag-grid');
    if (!container) return;

    let equipSlotsHtml = `
      <div class="equip-doll">
        <div class="equip-slot-item ${equipped.helm ? 'filled' : 'empty'}" data-slot="helm" title="${equipped.helm ? getItemTooltip(equipped.helm) : 'Espaço para Elmo'}">
          <span class="slot-tag">ELMO</span>
          <span class="slot-icon">${equipped.helm ? getItemIcon(equipped.helm) : '🪖'}</span>
          <small>${equipped.helm ? getItemName(equipped.helm) : 'Vazio'}</small>
        </div>
        <div class="equip-slot-item ${equipped.armor ? 'filled' : 'empty'}" data-slot="armor" title="${equipped.armor ? getItemTooltip(equipped.armor) : 'Espaço para Armadura'}">
          <span class="slot-tag">ARMADURA</span>
          <span class="slot-icon">${equipped.armor ? getItemIcon(equipped.armor) : '🥋'}</span>
          <small>${equipped.armor ? getItemName(equipped.armor) : 'Vazio'}</small>
        </div>
        <div class="equip-slot-item ${equipped.weapon ? 'filled' : 'empty'}" data-slot="weapon" title="${equipped.weapon ? getItemTooltip(equipped.weapon) : 'Espaço para Arma'}">
          <span class="slot-tag">ARMA</span>
          <span class="slot-icon">${equipped.weapon ? getItemIcon(equipped.weapon) : '⚔'}</span>
          <small>${equipped.weapon ? getItemName(equipped.weapon) : 'Vazio'}</small>
        </div>
        <div class="equip-slot-item ${equipped.shield ? 'filled' : 'empty'}" data-slot="shield" title="${equipped.shield ? getItemTooltip(equipped.shield) : 'Espaço para Escudo/Secundária'}">
          <span class="slot-tag">ESCUDO</span>
          <span class="slot-icon">${equipped.shield ? getItemIcon(equipped.shield) : '🛡'}</span>
          <small>${equipped.shield ? getItemName(equipped.shield) : 'Vazio'}</small>
        </div>
        <div class="equip-slot-item ${equipped.boots ? 'filled' : 'empty'}" data-slot="boots" title="${equipped.boots ? getItemTooltip(equipped.boots) : 'Espaço para Botas'}">
          <span class="slot-tag">BOTAS</span>
          <span class="slot-icon">${equipped.boots ? getItemIcon(equipped.boots) : '🥾'}</span>
          <small>${equipped.boots ? getItemName(equipped.boots) : 'Vazio'}</small>
        </div>
        <div class="equip-slot-item ${equipped.amulet ? 'filled' : 'empty'}" data-slot="amulet" title="${equipped.amulet ? getItemTooltip(equipped.amulet) : 'Espaço para Amuleto'}">
          <span class="slot-tag">AMULETO</span>
          <span class="slot-icon">${equipped.amulet ? getItemIcon(equipped.amulet) : '📿'}</span>
          <small>${equipped.amulet ? getItemName(equipped.amulet) : 'Vazio'}</small>
        </div>
        <div class="equip-slot-item ${equipped.ring1 ? 'filled' : 'empty'}" data-slot="ring1" title="${equipped.ring1 ? getItemTooltip(equipped.ring1) : 'Espaço para Anel 1'}">
          <span class="slot-tag">ANEL 1</span>
          <span class="slot-icon">${equipped.ring1 ? getItemIcon(equipped.ring1) : '💍'}</span>
          <small>${equipped.ring1 ? getItemName(equipped.ring1) : 'Vazio'}</small>
        </div>
        <div class="equip-slot-item ${equipped.ring2 ? 'filled' : 'empty'}" data-slot="ring2" title="${equipped.ring2 ? getItemTooltip(equipped.ring2) : 'Espaço para Anel 2'}">
          <span class="slot-tag">ANEL 2</span>
          <span class="slot-icon">${equipped.ring2 ? getItemIcon(equipped.ring2) : '💍'}</span>
          <small>${equipped.ring2 ? getItemName(equipped.ring2) : 'Vazio'}</small>
        </div>
      </div>
    `;

    // Render Grid Inventory
    let itemsHtml = '';
    for (let i = 0; i < MAX_INVENTORY_SLOTS; i++) {
      const it = inventory[i];
      if (it) {
        const base = ITEM_DATABASE[it.id] || { name: it.id, rarity: 'comum', icon: '📦' };
        const rar = RARITY_COLORS[base.rarity] || RARITY_COLORS.comum;
        itemsHtml += `
          <div class="inv-slot filled" data-index="${i}" style="border-color:${rar.border}; background:${rar.bg};" title="${getItemTooltip(it)}">
            <span class="inv-icon">${base.icon}</span>
            ${it.enhanceLevel ? `<span class="inv-enhance">+${it.enhanceLevel}</span>` : ''}
            ${it.count > 1 ? `<span class="inv-count">${it.count}</span>` : ''}
          </div>
        `;
      } else {
        htmlSlots = `<div class="inv-slot empty"></div>`;
        itemsHtml += `<div class="inv-slot empty"></div>`;
      }
    }

    container.innerHTML = `
      <div class="inventory-modal-body">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h4 class="inventory-section-title" style="margin:0;">EQUIPAMENTOS ATUAIS</h4>
          <button id="btnOpenFullInv" class="menu-button" style="padding:4px 10px; font-size:11px; background:#4338ca; border-color:#6366f1;">EXPANDIR 🎒</button>
        </div>
        ${equipSlotsHtml}
        <h4 class="inventory-section-title" style="margin-top:14px;">MOCHILA (${inventory.length}/${MAX_INVENTORY_SLOTS})</h4>
        <div class="inv-grid-container">${itemsHtml}</div>
      </div>
    `;

    // Events
    const btnExpand = container.querySelector('#btnOpenFullInv');
    if (btnExpand) btnExpand.onclick = openInventoryModal;

    container.querySelectorAll('.inv-slot.filled').forEach((slot) => {
      slot.onclick = () => {
        const idx = Number(slot.dataset.index);
        const it = inventory[idx];
        if (!it) return;
        const base = ITEM_DATABASE[it.id];
        if (base && ['weapon', 'shield', 'helm', 'armor', 'boots', 'ring', 'amulet'].includes(base.type)) {
          equipItem(idx);
        } else if (base && base.type === 'consumable') {
          useConsumable(idx);
        }
      };
    });

    container.querySelectorAll('.equip-slot-item.filled').forEach((slot) => {
      slot.onclick = () => {
        unequipItem(slot.dataset.slot);
      };
    });
  }

  // Keyboard shortcut listener: I and B toggle inventory modal
  addEventListener('keydown', (e) => {
    if (document.body.classList.contains('menu-open') || document.getElementById('mainMenu')?.style.display !== 'none' && document.getElementById('mainMenu')?.classList.contains('active')) return;
    const k = e.key.toLowerCase();
    if (k === 'i' || k === 'b') {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
      toggleInventoryModal();
      e.preventDefault();
    }
  });

  // Wire header button `#invTop`
  document.addEventListener('DOMContentLoaded', () => {
    const invTopBtn = document.getElementById('invTop');
    if (invTopBtn) invTopBtn.onclick = toggleInventoryModal;
  });

  loadInventory();

  window.GameItems = {
    ITEM_DATABASE,
    RARITY_COLORS,
    equipped,
    inventory,
    addItem,
    removeItem,
    equipItem,
    unequipItem,
    getEquipmentBonuses,
    renderInventoryUI,
    getItemTooltip,
    getItemName,
    saveInventory,
    loadInventory,
    openInventoryModal,
    closeInventoryModal,
    toggleInventoryModal,
    isInventoryModalOpen
  };
})();
