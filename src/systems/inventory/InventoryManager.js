// src/systems/inventory/InventoryManager.js
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
    'w_espada_ferro': { id: 'w_espada_ferro', name: 'Espada de Ferro Nobre', type: 'weapon', classId: 'guerreiro', rarity: 'comum', level: 1, damage: 14, defense: 2, icon: '', iconImg: 'assets/items/weapons/sword_2024_23.png', value: 35, desc: 'Uma lâmina de ferro confiável forjada para recrutas da guarda.' },
    'w_lamina_cinzas': { id: 'w_lamina_cinzas', name: 'Lâmina das Cinzas', type: 'weapon', classId: 'guerreiro', rarity: 'raro', level: 15, damage: 36, defense: 6, crit: 0.06, icon: '', iconImg: 'assets/items/weapons/sword_2024_02.png', value: 240, desc: 'Temperada nas cinzas eternas de Miraluz. Causa chamas sutis ao atingir.' },
    'w_espadao_guardiao': { id: 'w_espadao_guardiao', name: 'Espadão do Guardião Rúnico', type: 'weapon', classId: 'guerreiro', rarity: 'epico', level: 45, damage: 85, defense: 15, hp: 80, icon: '', iconImg: 'assets/items/weapons/sword_2026_05.png', value: 950, desc: 'Arma cerimonial pesada de um dos campeões da Cidadela das Cinzas.' },
    'w_gloria_rubra': { id: 'w_gloria_rubra', name: 'Glória Rubra da Fornalha', type: 'weapon', classId: 'guerreiro', rarity: 'lendario', level: 75, damage: 165, defense: 28, lifesteal: 0.05, icon: '', iconImg: 'assets/items/weapons/sword_2024_04.png', value: 3800, desc: 'Banhada em magma ancestral. Concede roubo de vida a cada corte.' },
    'w_corte_eclipse': { id: 'w_corte_eclipse', name: 'Corte do Primeiro Fogo', type: 'weapon', classId: 'guerreiro', rarity: 'supremo', level: 120, damage: 320, defense: 55, crit: 0.12, lifesteal: 0.08, icon: '', iconImg: 'assets/items/weapons/sword_2025_04.png', value: 18000, desc: 'A lâmina suprema que desafiou o eclipse. Sua presença distorce o ar.' },
    'w_lamina_infernal': { id: 'w_lamina_infernal', name: 'Lâmina Infernal', type: 'weapon', classId: 'guerreiro', rarity: 'epico', level: 50, damage: 85, crit: 0.12, defense: 10, arcane: 15, icon: '', iconImg: 'assets/items/weapons/infernal_blade_64.png', value: 2850, desc: 'Forjada nas profundezas vulcânicas da Montanha das Cinzas, esta lâmina flamejante arde com o poder dos demônios antigos. Seu toque queima a própria alma do inimigo.' },

    // ─── EQUIPAMENTOS: LUVAS & MANOPLAS (GLOVES) ───
    'gl_luvas_couro': { id: 'gl_luvas_couro', name: 'Luvas de Couro Batido', type: 'gloves', rarity: 'comum', level: 1, defense: 3, hp: 15, icon: '', iconImg: 'assets/items/armor/shields/shield_hero_01.png', value: 30, desc: 'Proteção flexível para manuseio firme de lâminas.' },
    'gl_manoplas_aco': { id: 'gl_manoplas_aco', name: 'Manoplas de Aço Forjado', type: 'gloves', rarity: 'raro', level: 20, defense: 10, damage: 8, crit: 0.04, icon: '', iconImg: 'assets/items/armor/shields/shield_hero_01.png', value: 320, desc: 'Placas articuladas de aço que aumentam a força e a precisão dos punhos.' },
    'gl_manoplas_guardiao': { id: 'gl_manoplas_guardiao', name: 'Manoplas Rúnicas do Guardião', type: 'gloves', rarity: 'epico', level: 48, defense: 22, damage: 18, hp: 90, crit: 0.06, icon: '', iconImg: 'assets/items/armor/shields/shield_hero_01.png', value: 1200, desc: 'Gravadas com runas arcanas que amplificam o impacto de cada investida.' },


    // ─── COLEÇÃO LENDÁRIA DE ESPADAS PIXEL ART (SWORDTEMBER) ───
    'w_florete_cristal': { id: 'w_florete_cristal', name: 'Florete de Cristal Lunar', type: 'weapon', rarity: 'raro', level: 20, damage: 48, crit: 0.10, icon: '', iconImg: 'assets/items/weapons/sword_2024_07.png', value: 380, desc: 'Lâmina translúcida lapidada em quartzo estelar. Seus estocadas perfuram a armadura inimiga.' },
    'w_sabre_tormenta': { id: 'w_sabre_tormenta', name: 'Sabre da Tormenta Elétrica', type: 'weapon', rarity: 'raro', level: 25, damage: 56, crit: 0.08, icon: '', iconImg: 'assets/items/weapons/sword_2024_08.png', value: 460, desc: 'Forjada durante uma tempestade de raios nas montanhas. Solta faíscas a cada corte.' },
    'w_foice_vento': { id: 'w_foice_vento', name: 'Ceifadora do Vento Cortante', type: 'weapon', rarity: 'raro', level: 30, damage: 65, crit: 0.12, icon: '', iconImg: 'assets/items/weapons/sword_2024_09.png', value: 580, desc: 'Corta o ar com velocidade inaudível, criando micro-vórtices cortantes.' },
    'w_devoradora_almas': { id: 'w_devoradora_almas', name: 'Devoradora de Almas Sepultada', type: 'weapon', rarity: 'epico', level: 50, damage: 105, lifesteal: 0.06, hp: 90, icon: '', iconImg: 'assets/items/weapons/sword_2024_21.png', value: 1250, desc: 'Runas necromânticas gravadas na lâmina drenam a vitalidade dos alvos atingidos.' },
    'w_lamina_sombras': { id: 'w_lamina_sombras', name: 'Corte do Abismo Noturno', type: 'weapon', rarity: 'epico', level: 58, damage: 120, crit: 0.16, icon: '', iconImg: 'assets/items/weapons/sword_2024_12.png', value: 1450, desc: 'Envolta em névoa negra perene. Os inimigos mal enxergam a direção de onde veio o golpe.' },
    'w_cutelo_magma': { id: 'w_cutelo_magma', name: 'Cutelo do Vulcão Ancestral', type: 'weapon', rarity: 'epico', level: 65, damage: 140, defense: 14, icon: '', iconImg: 'assets/items/weapons/sword_2026_20.png', value: 1750, desc: 'Forjado em rocha vulcânica densa. Causa chamas intensas e destrói escudos.' },
    'w_tridente_arcano': { id: 'w_tridente_arcano', name: 'Lança-Espada da Maré Cósmica', type: 'weapon', rarity: 'epico', level: 70, damage: 155, arcane: 60, icon: '', iconImg: 'assets/items/weapons/sword_2026_25.png', value: 1980, desc: 'Conduz a força das marés primordiais para golpes arcanos avassaladores.' },
    'w_lamina_do_sol': { id: 'w_lamina_do_sol', name: 'Aurora do Sol Radiante', type: 'weapon', rarity: 'lendario', level: 85, damage: 195, arcane: 75, crit: 0.12, icon: '', iconImg: 'assets/items/weapons/sword_2026_19.png', value: 5200, desc: 'Emite o brilho fulgurante do zênite solar. Mortos-vivos entram em combustão ao toque.' },
    'w_asa_sagrada': { id: 'w_asa_sagrada', name: 'Lâmina das Asas Celestiais', type: 'weapon', rarity: 'lendario', level: 90, damage: 215, hp: 180, lifesteal: 0.05, icon: '', iconImg: 'assets/items/weapons/sword_2025_22.png', value: 6000, desc: 'Pena de arcanjo transmuta em aço sagrado inviolável que protege e cura seu portador.' },
    'w_espada_esmeralda': { id: 'w_espada_esmeralda', name: 'Glaive da Floresta Antiga', type: 'weapon', rarity: 'lendario', level: 98, damage: 235, crit: 0.20, icon: '', iconImg: 'assets/items/weapons/sword_2026_15.png', value: 6800, desc: 'Cresce e se regenera com gavinhas vegetais e cristais de esmeralda milenares.' },
    'w_chama_celeste': { id: 'w_chama_celeste', name: 'Chama Celeste da Criação', type: 'weapon', rarity: 'supremo', level: 125, damage: 360, arcane: 130, crit: 0.15, lifesteal: 0.08, icon: '', iconImg: 'assets/items/weapons/sword_2025_01.png', value: 21000, desc: 'Artefato cósmico que riscou o firmamento antes das ruínas existirem.' },
    'w_centelha_draconica': { id: 'w_centelha_draconica', name: 'Presa do Dragão Primordial', type: 'weapon', rarity: 'supremo', level: 140, damage: 410, defense: 45, crit: 0.22, lifesteal: 0.12, icon: '', iconImg: 'assets/items/weapons/sword_2026_29.png', value: 26000, desc: 'Esculpida a partir do chifre de um wyrm ancião. Ruge como uma tempestade a cada investida.' },

    // ─── ARSENAL HEROICO DE LÂMINAS (20 ESPADAS PIXEL ART) ───
    // Patamar 1: Recruta e Batedor (Nv. 1–15)
    'w_adaga_errante': { id: 'w_adaga_errante', name: 'Adaga de Caça do Errante', type: 'weapon', rarity: 'comum', level: 1, damage: 13, crit: 0.04, icon: '', iconImg: 'assets/items/weapons/sword_hero_01.png', value: 30, desc: 'Uma lâmina curta e veloz usada por batedores nas trilhas da Vila das Cinzas.' },
    'w_espada_treino': { id: 'w_espada_treino', name: 'Espada de Treino de Carvalho', type: 'weapon', rarity: 'comum', level: 3, damage: 16, defense: 2, icon: '', iconImg: 'assets/items/weapons/sword_hero_02.png', value: 40, desc: 'Entalhada em carvalho denso. Excelente para aprender a cadência e o equilíbrio dos golpes.' },
    'w_gladio_guarnicao': { id: 'w_gladio_guarnicao', name: 'Gládio da Guarnição', type: 'weapon', rarity: 'comum', level: 7, damage: 22, defense: 3, icon: '', iconImg: 'assets/items/weapons/sword_hero_03.png', value: 75, desc: 'Arma padrão de ferro forjado dos soldados que patrulhavam as muralhas de Miraluz.' },
    'w_espada_larga_ferro': { id: 'w_espada_larga_ferro', name: 'Espada Larga do Batedor', type: 'weapon', rarity: 'incomum', level: 11, damage: 29, defense: 4, crit: 0.04, icon: '', iconImg: 'assets/items/weapons/sword_hero_04.png', value: 130, desc: 'Lâmina pesada de ferro cinzento, forjada para fender couros e carapaças resistentes.' },
    'w_bastarda_forjada': { id: 'w_bastarda_forjada', name: 'Espada Bastarda Forjada', type: 'weapon', rarity: 'incomum', level: 15, damage: 37, defense: 5, crit: 0.05, icon: '', iconImg: 'assets/items/weapons/sword_hero_05.png', value: 200, desc: 'Pode ser empunhada com uma ou duas mãos, combinando alcance equilibrado e impacto brutal.' },

    // Patamar 2: Aventureiro e Pântano (Nv. 18–35)
    'w_longa_aco': { id: 'w_longa_aco', name: 'Espada Longa de Aço Nobre', type: 'weapon', rarity: 'incomum', level: 18, damage: 44, defense: 6, crit: 0.06, icon: '', iconImg: 'assets/items/weapons/sword_hero_06.png', value: 280, desc: 'Forjada com sucessivas dobras de aço purificado, conservando o corte afiado em combates longos.' },
    'w_florete_duelo': { id: 'w_florete_duelo', name: 'Florete de Duelo Ágil', type: 'weapon', rarity: 'raro', level: 22, damage: 50, crit: 0.14, icon: '', iconImg: 'assets/items/weapons/sword_hero_07.png', value: 410, desc: 'Extremamente leve e veloz com guarda em taça, desenhado para perfurar pontos vitais desprotegidos.' },
    'w_lamina_esmeralda_pantano': { id: 'w_lamina_esmeralda_pantano', name: 'Lâmina Esmeralda do Pântano', type: 'weapon', rarity: 'raro', level: 26, damage: 59, defense: 8, hp: 55, crit: 0.07, icon: '', iconImg: 'assets/items/weapons/sword_hero_08.png', value: 520, desc: 'Cravejada com uma esmeralda purificadora do Pântano Espectral, imune à corrosão de lamas e ácidos.' },
    'w_flamberge_cruzado': { id: 'w_flamberge_cruzado', name: 'Flamberge do Cruzado Esquecido', type: 'weapon', rarity: 'raro', level: 30, damage: 68, defense: 10, crit: 0.08, icon: '', iconImg: 'assets/items/weapons/sword_hero_09.png', value: 650, desc: 'Guarda cruzada com ganchos de contenção, desenhada para quebrar armas inimigas em duelo.' },
    'w_lamina_bronze_antigo': { id: 'w_lamina_bronze_antigo', name: 'Lâmina de Bronze das Ruínas', type: 'weapon', rarity: 'raro', level: 34, damage: 76, defense: 9, hp: 70, icon: '', iconImg: 'assets/items/weapons/sword_hero_10.png', value: 800, desc: 'Desenterrada de criptas sob a Floresta. A liga metálica rúnica ressoa com vibrações telúricas.' },

    // Patamar 3: Campeão e Ruínas (Nv. 38–60)
    'w_montante_pedra': { id: 'w_montante_pedra', name: 'Montante do Carrasco de Pedra', type: 'weapon', rarity: 'epico', level: 38, damage: 86, defense: 13, crit: 0.09, icon: '', iconImg: 'assets/items/weapons/sword_hero_11.png', value: 950, desc: 'Espadão colossal de duas mãos capaz de rachar couraças pesadas e esmagar monstros gigantescos.' },
    'w_espada_safira_azul': { id: 'w_espada_safira_azul', name: 'Espada com Safira do Cruzado', type: 'weapon', rarity: 'epico', level: 44, damage: 98, arcane: 45, crit: 0.10, defense: 12, icon: '', iconImg: 'assets/items/weapons/sword_hero_12.png', value: 1200, desc: 'A gema no pomo pulsa em sintonia com os ventos frios, convertendo impacto físico em ressonância arcana.' },
    'w_lamina_prata_vigilia': { id: 'w_lamina_prata_vigilia', name: 'Lâmina de Prata da Vigília', type: 'weapon', rarity: 'epico', level: 50, damage: 110, defense: 15, hp: 90, crit: 0.11, icon: '', iconImg: 'assets/items/weapons/sword_hero_13.png', value: 1420, desc: 'Banhada em prata abençoada pela capela de Miraluz, queimando carnes corrompidas de espectros.' },
    'w_cimitarra_deserto': { id: 'w_cimitarra_deserto', name: 'Cimitarra do Vento do Deserto', type: 'weapon', rarity: 'epico', level: 54, damage: 122, crit: 0.17, lifesteal: 0.04, icon: '', iconImg: 'assets/items/weapons/sword_hero_14.png', value: 1600, desc: 'Curvatura aerodinâmica que corta em arco fluido, provocando sangramento agudo a cada acerto.' },
    'w_espada_meia_noite': { id: 'w_espada_meia_noite', name: 'Espada da Meia-Noite Eterna', type: 'weapon', rarity: 'epico', level: 60, damage: 134, defense: 17, crit: 0.12, lifesteal: 0.05, icon: '', iconImg: 'assets/items/weapons/sword_hero_15.png', value: 1850, desc: 'Guarda em lua crescente forjada na escuridão mais densa, alimentando-se do vigor de seus alvos.' },

    // Patamar 4: Lendário e Supremo (Nv. 68–110)
    'w_lamina_sol_radiante': { id: 'w_lamina_sol_radiante', name: 'Lâmina Solar dos Reis Dourados', type: 'weapon', rarity: 'lendario', level: 68, damage: 158, defense: 23, arcane: 55, crit: 0.13, icon: '', iconImg: 'assets/items/weapons/sword_hero_16.png', value: 3700, desc: 'O rubi incrustado no ouro régio irradia calor do meio-dia, incinerando mortos-vivos instantaneamente.' },
    'w_espada_obsidiana_abismo': { id: 'w_espada_obsidiana_abismo', name: 'Lâmina de Obsidiana do Abismo', type: 'weapon', rarity: 'lendario', level: 76, damage: 180, crit: 0.18, lifesteal: 0.07, defense: 18, icon: '', iconImg: 'assets/items/weapons/sword_hero_17.png', value: 4600, desc: 'Esculpida em vidro vulcânico do Eclipse. Sua lâmina negra devora a luz e ignora armaduras.' },
    'w_espada_ametista_espectral': { id: 'w_espada_ametista_espectral', name: 'Espada Espectral de Ametista', type: 'weapon', rarity: 'lendario', level: 84, damage: 202, arcane: 90, crit: 0.14, hp: 130, icon: '', iconImg: 'assets/items/weapons/sword_hero_18.png', value: 5800, desc: 'O cristal de ametista translúcido canaliza pura mana etérea, estilhaçando barreiras mágicas.' },
    'w_sagrada_aurora_eterna': { id: 'w_sagrada_aurora_eterna', name: 'Lâmina Sagrada da Aurora Eterna', type: 'weapon', rarity: 'lendario', level: 92, damage: 228, defense: 29, arcane: 75, crit: 0.15, lifesteal: 0.06, icon: '', iconImg: 'assets/items/weapons/sword_hero_19.png', value: 7400, desc: 'Inscrita com filigranas douradas invioláveis que regeneram continuamente a força vital de quem a empunha.' },
    'w_reliquia_cinco_selos': { id: 'w_reliquia_cinco_selos', name: 'Relíquia Cósmica dos Cinco Selos', type: 'weapon', rarity: 'supremo', level: 105, damage: 295, defense: 42, arcane: 115, crit: 0.20, lifesteal: 0.10, hp: 210, icon: '', iconImg: 'assets/items/weapons/sword_hero_20.png', value: 16000, desc: 'Arma primordial com as cinco gemas da criação de Miraluz. Seus golpes liberam cataclismos elementais.' },

    // ─── ARMAS: ARQUEIRO ───
    'w_arco_cacador': { id: 'w_arco_cacador', name: 'Arco do Caçador Errante', type: 'weapon', classId: 'arqueiro', rarity: 'comum', level: 1, damage: 15, range: 25, icon: '', value: 35, desc: 'Madeira tratada com óleo vegetal, precisa e veloz.' , iconImg: 'assets/items/weapons/sword_hero_07.png' },
    'w_arco_ecos': { id: 'w_arco_ecos', name: 'Arco dos Ecos Silenciosos', type: 'weapon', classId: 'arqueiro', rarity: 'raro', level: 15, damage: 38, crit: 0.08, range: 45, icon: '', value: 250, desc: 'Suas flechas não emitem som antes do impacto mortal.' , iconImg: 'assets/items/weapons/sword_hero_08.png' },
    'w_arco_tempestade': { id: 'w_arco_tempestade', name: 'Arco da Tempestade Esmeralda', type: 'weapon', classId: 'arqueiro', rarity: 'epico', level: 45, damage: 88, crit: 0.12, range: 60, icon: '', value: 980, desc: 'Carregado com ventos cortantes das montanhas mais altas.' , iconImg: 'assets/items/weapons/sword_hero_09.png' },
    'w_olho_fenix': { id: 'w_olho_fenix', name: 'Olho da Fênix de Cinzas', type: 'weapon', classId: 'arqueiro', rarity: 'lendario', level: 75, damage: 175, crit: 0.18, range: 80, icon: '', value: 4200, desc: 'Flechas incendiárias que perfuram múltiplos alvos.' , iconImg: 'assets/items/weapons/sword_hero_10.png' },
    'w_estrela_cadente': { id: 'w_estrela_cadente', name: 'Arco Cometa do Infinito', type: 'weapon', classId: 'arqueiro', rarity: 'supremo', level: 120, damage: 340, crit: 0.25, range: 110, icon: '', value: 19500, desc: 'Flechas feitas de luz estelar sólida que nunca erram o alvo.' , iconImg: 'assets/items/weapons/sword_hero_15.png' },

    // ─── ARMAS: MAGO ───
    'w_cajado_salgueiro': { id: 'w_cajado_salgueiro', name: 'Cajado de Salgueiro Arcano', type: 'weapon', classId: 'mago', rarity: 'comum', level: 1, damage: 16, arcane: 18, icon: '', value: 35, desc: 'Foco canalizador de faíscas elementais para aprendizes.' , iconImg: 'assets/items/weapons/staves/mage_asset_01.png' },
    'w_cetro_chama_antiga': { id: 'w_cetro_chama_antiga', name: 'Cetro da Chama Antiga', type: 'weapon', classId: 'mago', rarity: 'raro', level: 15, damage: 40, arcane: 45, icon: '', value: 260, desc: 'Gema rubra no topo emite pulsos contínuos de calor místico.' , iconImg: 'assets/items/weapons/staves/mage_asset_05.png' },
    'w_baculo_arquivo': { id: 'w_baculo_arquivo', name: 'Báculo do Arquivo Sepultado', type: 'weapon', classId: 'mago', rarity: 'epico', level: 45, damage: 95, arcane: 110, icon: '', value: 1050, desc: 'Encantado com páginas perdidas do Grimório de Naeva.' , iconImg: 'assets/items/weapons/staves/mage_asset_10.png' },
    'w_astrolabio_vazio': { id: 'w_astrolabio_vazio', name: 'Singularidade Astral', type: 'weapon', classId: 'mago', rarity: 'lendario', level: 75, damage: 190, arcane: 220, icon: '', value: 4500, desc: 'Distorce a gravidade e amplifica danos arcanos brutalmente.' , iconImg: 'assets/items/weapons/staves/mage_asset_18.png' },
    'w_aurora_suprema': { id: 'w_aurora_suprema', name: 'Cajado do Eclipse Eterno', type: 'weapon', classId: 'mago', rarity: 'supremo', level: 120, damage: 370, arcane: 440, icon: '', value: 21000, desc: 'Permite invocar as energias primordiais da criação do mundo.' , iconImg: 'assets/items/weapons/staves/mage_asset_25.png' },

    // ─── ARMAS: ASSASSINO, BÁRBARO & CLÉRIGO ───
    'w_adagas_sombra': { id: 'w_adagas_sombra', name: 'Adagas da Noite Eterna', type: 'weapon', classId: 'assasino', rarity: 'raro', level: 15, damage: 35, crit: 0.15, icon: '', value: 260, desc: 'Par de lâminas com veneno sombrio de ação rápida.' , iconImg: 'assets/items/weapons/sword_hero_01.png'},
    'w_machado_voraz': { id: 'w_machado_voraz', name: 'Machado do Quebra-Montanhas', type: 'weapon', classId: 'barbaro', rarity: 'raro', level: 15, damage: 42, hp: 50, icon: '', value: 270, desc: 'Corta rochas e crânios com a mesma facilidade impiedosa.' , iconImg: 'assets/items/weapons/sword_hero_01.png'},
    'w_maca_aurora': { id: 'w_maca_aurora', name: 'Maça da Aurora Dourada', type: 'weapon', classId: 'clerigo', rarity: 'raro', level: 15, damage: 32, arcane: 30, hp: 40, icon: '', value: 260, desc: 'Banhada em água benta das fontes do Castelo em Cinzas.' , iconImg: 'assets/items/weapons/sword_hero_01.png'},

    // ─── EQUIPAMENTOS: ESCUDOS & SECUNDÁRIAS ───
    'sh_madeira_reforcada': { id: 'sh_madeira_reforcada', name: 'Broquel de Madeira Nobre', type: 'shield', rarity: 'comum', level: 1, defense: 4, hp: 20, icon: '', iconImg: 'assets/items/armor/shields/shield_hero_01.png', value: 30, desc: 'Madeira espessa com rebites de latão para defesa básica.' },
    'sh_ferro_runico': { id: 'sh_ferro_runico', name: 'Escudo Rúnico da Vigia', type: 'shield', rarity: 'raro', level: 18, defense: 12, hp: 60, icon: '', value: 280, desc: 'Gravações ancestrais absorvem parte do impacto cinético.' , iconImg: 'assets/items/armor/shields/shield_hero_01.png'},
    'sh_baluarte_obsidiana': { id: 'sh_baluarte_obsidiana', name: 'Baluarte de Obsidiana e Ouro', type: 'shield', rarity: 'epico', level: 48, defense: 28, hp: 160, lifesteal: 0.02, icon: '', value: 1100, desc: 'Forjado no coração da fornalha. Praticamente inquebrável.' , iconImg: 'assets/items/armor/shields/shield_hero_01.png'},
    'sh_egide_sol': { id: 'sh_egide_sol', name: 'Égide do Sol Nascente', type: 'shield', rarity: 'lendario', level: 80, defense: 54, hp: 350, arcane: 40, icon: '', value: 4500, desc: 'Reflete projéteis inimigos com brilho ofuscante.' , iconImg: 'assets/items/armor/shields/shield_hero_01.png'},

    // ─── EQUIPAMENTOS: ELMOS (HELM) ───
    'hl_couro_batedor': { id: 'hl_couro_batedor', name: 'Capuz de Couro das Ruínas', type: 'helm', rarity: 'comum', level: 1, defense: 3, hp: 15, icon: '', iconImg: 'assets/items/dark_fantasy/helm_hood_leather.png', value: 30, desc: 'Protege contra ventos frios e pequenas lascas de pedra.' },
    'hl_elmo_ferro': { id: 'hl_elmo_ferro', name: 'Elmo de Batalha do Paladino', type: 'helm', rarity: 'raro', level: 16, defense: 9, hp: 50, crit: 0.03, icon: '', value: 260, desc: 'Visor angular para máxima visão de campo e proteção craniana.' , iconImg: 'assets/items/dark_fantasy/helm_knight_visor.png'},
    'hl_coroa_runica': { id: 'hl_coroa_runica', name: 'Coroa Rúnica das Cinzas', type: 'helm', rarity: 'epico', level: 46, defense: 20, hp: 130, arcane: 35, icon: '', value: 1050, desc: 'Artefato régio com cristais que pulsam em sintonia com a magia.' , iconImg: 'assets/items/dark_fantasy/crown_golden_flame.png'},
    'hl_elmo_dragao': { id: 'hl_elmo_dragao', name: 'Elmo de Escamas do Dragão', type: 'helm', rarity: 'lendario', level: 78, defense: 42, hp: 300, crit: 0.08, icon: '', value: 4400, desc: 'Confeccionado com presas e escamas fossilizadas de wyverns.' , iconImg: 'assets/items/dark_fantasy/skull_iron_visor.png'},

    // ─── EQUIPAMENTOS: ARMADURAS / PEITORAIS (ARMOR) ───
    'ar_tunica_linho': { id: 'ar_tunica_linho', name: 'Túnica de Linho Acolchoada', type: 'armor', rarity: 'comum', level: 1, defense: 5, hp: 30, icon: '', value: 40, desc: 'Vestimenta de viagem flexível com reforço de couro leve.' , iconImg: 'assets/items/dark_fantasy/armor_tunic_leather.png'},
    'ar_cota_malha': { id: 'ar_cota_malha', name: 'Cota de Malha da Cidadela', type: 'armor', rarity: 'raro', level: 18, defense: 16, hp: 90, icon: '', value: 310, desc: 'Elos de aço entrelaçados oferecem proteção substancial contra cortes.' , iconImg: 'assets/items/dark_fantasy/armor_plate_spiked.png'},
    'ar_placas_guardiao': { id: 'ar_placas_guardiao', name: 'Armadura de Placas do Guardião', type: 'armor', rarity: 'epico', level: 50, defense: 38, hp: 220, lifesteal: 0.03, icon: '', value: 1300, desc: 'Armadura completa forjada para enfrentar monstros abissais.' , iconImg: 'assets/items/dark_fantasy/armor_plate_spiked.png'},
    'ar_peitoral_primeiro_fogo': { id: 'ar_peitoral_primeiro_fogo', name: 'Manto do Primeiro Fogo', type: 'armor', rarity: 'lendario', level: 82, defense: 75, hp: 480, arcane: 60, icon: '', value: 5100, desc: 'Aura radiante que consome ataques mágicos e físicos com bravura.' , iconImg: 'assets/items/dark_fantasy/armor_shadow_mantle.png'},

    // ─── EQUIPAMENTOS: BOTAS (BOOTS) ───
    'bt_botas_viagem': { id: 'bt_botas_viagem', name: 'Botas de Couro Resistente', type: 'boots', rarity: 'comum', level: 1, defense: 2, hp: 15, icon: '', value: 25, desc: 'Confortáveis para longas marchas pelas estradas de pedra.' , iconImg: 'assets/items/dark_fantasy/boots_greaves.png'},
    'bt_passos_espectrais': { id: 'bt_passos_espectrais', name: 'Grevas dos Passos Espectrais', type: 'boots', rarity: 'raro', level: 17, defense: 8, hp: 45, crit: 0.04, icon: '', value: 270, desc: 'Passadas silenciosas como o nevoeiro da madrugada.' , iconImg: 'assets/items/dark_fantasy/boots_greaves.png'},
    'bt_botas_tempestade': { id: 'bt_botas_tempestade', name: 'Botas Aladas do Batedor', type: 'boots', rarity: 'epico', level: 47, defense: 18, hp: 110, crit: 0.07, icon: '', value: 1020, desc: 'Encantadas com a leveza das brisas das montanhas.' , iconImg: 'assets/items/dark_fantasy/boots_greaves.png'},
    'bt_passos_chamas': { id: 'bt_passos_chamas', name: 'Passos da Fênix Rubra', type: 'boots', rarity: 'lendario', level: 79, defense: 36, hp: 250, lifesteal: 0.03, icon: '', value: 4300, desc: 'Deixa brasas vivas no solo, conferindo agilidade lendária.' , iconImg: 'assets/items/dark_fantasy/boots_greaves.png'},

    // ─── ACESSÓRIOS: ANÉIS (RINGS) ───
    'acc_anel_cobre': { id: 'acc_anel_cobre', name: 'Anel de Cobre Polido', type: 'ring', rarity: 'comum', level: 1, hp: 15, defense: 1, icon: '', iconImg: 'assets/items/accessories/rings/ring_hero_01.png', value: 25, desc: 'Um aro simples que confere leve proteção.' },
    'acc_anel_falcao': { id: 'acc_anel_falcao', name: 'Anel do Olho de Falcão', type: 'ring', rarity: 'raro', level: 20, crit: 0.06, damage: 10, icon: '', value: 320, desc: 'Aguça os reflexos e a precisão dos golpes.' , iconImg: 'assets/items/dark_fantasy/amulet_golden_teardrop.png'},
    'acc_anel_arcano': { id: 'acc_anel_arcano', name: 'Selo das Cinzas Místicas', type: 'ring', rarity: 'epico', level: 50, arcane: 35, hp: 90, icon: '', value: 1100, desc: 'Aumenta consideravelmente as reservas de vida e energia mágica.' , iconImg: 'assets/items/accessories/rings/ring_hero_01.png'},
    'acc_anel_colosso': { id: 'acc_anel_colosso', name: 'Anel do Coração Colossal', type: 'ring', rarity: 'lendario', level: 80, hp: 260, defense: 22, lifesteal: 0.03, icon: '', value: 4800, desc: 'Forjado no núcleo da terra. O portador adquire vitalidade gigantesca.' , iconImg: 'assets/items/accessories/rings/ring_hero_01.png'},
    'acc_anel_supremo': { id: 'acc_anel_supremo', name: 'Aliança do Eclipse Cósmico', type: 'ring', rarity: 'supremo', level: 130, hp: 600, damage: 70, defense: 40, crit: 0.10, icon: '', value: 22000, desc: 'O anel dos reis ancestrais de Miraluz. Poder incomparável.' , iconImg: 'assets/items/accessories/rings/ring_hero_01.png'},

    // ─── ACESSÓRIOS: AMULETOS / COLARES (AMULET) ───
    'acc_amuleto_pedra': { id: 'acc_amuleto_pedra', name: 'Pingente de Quartzo Bruto', type: 'amulet', rarity: 'comum', level: 1, hp: 20, icon: '', iconImg: 'assets/items/dark_fantasy/amulet_ruby_medallion.png', value: 30, desc: 'Protege contra pequenos feitiços e dá vigor.' },
    'acc_amuleto_berserker': { id: 'acc_amuleto_berserker', name: 'Talismã da Fúria Vermelha', type: 'amulet', rarity: 'raro', level: 25, damage: 18, crit: 0.08, icon: '', value: 380, desc: 'Faz o sangue ferver quando sob perigo iminente.' , iconImg: 'assets/items/dark_fantasy/talisman_bone_runic.png'},
    'acc_amuleto_runico': { id: 'acc_amuleto_runico', name: 'Colar de Brasas Eternas', type: 'amulet', rarity: 'epico', level: 55, hp: 120, defense: 18, lifesteal: 0.04, icon: '', value: 1250, desc: 'Emite pulsações curativas durante a batalha.' , iconImg: 'assets/items/dark_fantasy/amulet_ruby_medallion.png'},
    'acc_amuleto_supremo': { id: 'acc_amuleto_supremo', name: 'Lágrima das Estrelas Caídas', type: 'amulet', rarity: 'supremo', level: 140, hp: 750, damage: 95, arcane: 95, defense: 45, icon: '', value: 25000, desc: 'Artefato místico com poder suficiente para regenerar exércitos.' , iconImg: 'assets/items/dark_fantasy/amulet_silver_winged.png'},

    // ─── ELMOS (HELMS) (20 ITENS PIXEL ART) ───
    'hl_hero_01': {"id":"hl_hero_01","name":"Capuz de Couro do Recruta","type":"helm","rarity":"comum","level":1,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_01.png","value":41,"desc":"Proteção leve de couro batido para novatos nas trilhas.","defense":3,"hp":15},
    'hl_hero_02': {"id":"hl_hero_02","name":"Coifa Acolchoada de Linho","type":"helm","rarity":"comum","level":3,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_02.png","value":56,"desc":"Amortece impactos menores contra pedras e bordoadas.","defense":5,"hp":25},
    'hl_hero_03': {"id":"hl_hero_03","name":"Elmo Aberto da Guarda","type":"helm","rarity":"comum","level":7,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_03.png","value":77,"desc":"Elmo padrão de soldados da antiga muralha de Miraluz.","defense":8,"hp":40},
    'hl_hero_04': {"id":"hl_hero_04","name":"Barbuta de Ferro Cinzento","type":"helm","rarity":"incomum","level":11,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_04.png","value":106,"desc":"Protege mandíbula e crânio mantendo campo visual aberto.","defense":11,"hp":55},
    'hl_hero_05': {"id":"hl_hero_05","name":"Elmo Fechado de Batalha","type":"helm","rarity":"incomum","level":15,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_05.png","value":145,"desc":"Chapa de ferro espessa moldada para choques frontais.","defense":14,"hp":75},
    'hl_hero_06': {"id":"hl_hero_06","name":"Elmo com Penacho de Miraluz","type":"helm","rarity":"incomum","level":18,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_06.png","value":198,"desc":"Insígnia dos veteranos da fortaleza antes da queda.","defense":18,"hp":95,"crit":0.02},
    'hl_hero_07': {"id":"hl_hero_07","name":"Capacete de Aço Nobre","type":"helm","rarity":"raro","level":22,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_07.png","value":272,"desc":"Aço refinado em dobras contínuas que repele flechas.","defense":22,"hp":120,"crit":0.03},
    'hl_hero_08': {"id":"hl_hero_08","name":"Visor Esmeralda do Pântano","type":"helm","rarity":"raro","level":26,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_08.png","value":372,"desc":"Tratado com gavinhas pantanosas imunes a corrosão.","defense":26,"hp":150,"arcane":15},
    'hl_hero_09': {"id":"hl_hero_09","name":"Elmo de Bronze Rúnico","type":"helm","rarity":"raro","level":30,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_09.png","value":510,"desc":"Resplendor dourado com inscrições das criptas antigas.","defense":31,"hp":185},
    'hl_hero_10': {"id":"hl_hero_10","name":"Elmo Chifrudo do Guerreiro","type":"helm","rarity":"raro","level":34,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_10.png","value":699,"desc":"Chifres de fera entalhados com ferocidade primal.","defense":36,"hp":225,"crit":0.04},
    'hl_hero_11': {"id":"hl_hero_11","name":"Elmo do Vigia Noturno","type":"helm","rarity":"epico","level":38,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_11.png","value":957,"desc":"Forjado em liga escura que confunde olhares nas sombras.","defense":42,"hp":270,"crit":0.05},
    'hl_hero_12': {"id":"hl_hero_12","name":"Coroa de Prata Alada","type":"helm","rarity":"epico","level":44,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_12.png","value":1311,"desc":"Asas de prata que canalizam bênçãos de proteção pura.","defense":48,"hp":320,"arcane":35},
    'hl_hero_13': {"id":"hl_hero_13","name":"Capacete do Cruzado de Ferro","type":"helm","rarity":"epico","level":50,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_13.png","value":1797,"desc":"Relíquia da ordem que combateu a peste espectral.","defense":55,"hp":380},
    'hl_hero_14': {"id":"hl_hero_14","name":"Elmo dos Picos Glaciais","type":"helm","rarity":"epico","level":54,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_14.png","value":2462,"desc":"Aço gélido imune a geadas e golpes esmagadores.","defense":64,"hp":445},
    'hl_hero_15': {"id":"hl_hero_15","name":"Máscara da Caveira Sombria","type":"helm","rarity":"epico","level":60,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_15.png","value":3372,"desc":"Crânio espectral que aterroriza adversários.","defense":70,"hp":520,"lifesteal":0.03},
    'hl_hero_16': {"id":"hl_hero_16","name":"Elmo de Ouro dos Reis Antigos","type":"helm","rarity":"lendario","level":68,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_16.png","value":4620,"desc":"Forjado na era dourada de Miraluz. Majestade pura.","defense":80,"hp":600,"arcane":50,"crit":0.06},
    'hl_hero_17': {"id":"hl_hero_17","name":"Elmo de Obsidiana do Abismo","type":"helm","rarity":"lendario","level":76,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_17.png","value":6330,"desc":"Vidro vulcânico que anula maldições e cortes mágicos.","defense":92,"hp":700,"crit":0.07},
    'hl_hero_18': {"id":"hl_hero_18","name":"Coroa Espectral de Ametista","type":"helm","rarity":"lendario","level":84,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_18.png","value":8671,"desc":"Gemas flutuantes protegem a mente e amplificam a alma.","defense":105,"hp":810,"arcane":85,"lifesteal":0.04},
    'hl_hero_19': {"id":"hl_hero_19","name":"Elmo Alado da Aurora Eterna","type":"helm","rarity":"lendario","level":92,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_19.png","value":11880,"desc":"Emite clarão sagrado que cega demônios na batalha.","defense":120,"hp":940,"arcane":70,"crit":0.09},
    'hl_hero_20': {"id":"hl_hero_20","name":"Coroa Cósmica dos Cinco Selos","type":"helm","rarity":"supremo","level":105,"icon":"","iconImg":"assets/items/armor/helms/helm_hero_20.png","value":16275,"desc":"O elmo primordial forjado com o coração das cinzas.","defense":140,"hp":1120,"arcane":110,"crit":0.12,"lifesteal":0.06},

    // ─── ESCUDOS (SHIELDS) (20 ITENS PIXEL ART) ───
    'sh_hero_01': {"id":"sh_hero_01","name":"Broquel Redondo de Carvalho","type":"shield","rarity":"comum","level":1,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_01.png","value":41,"desc":"Leve e ágil para desviar golpes laterais de novatos.","defense":5,"hp":20},
    'sh_hero_02': {"id":"sh_hero_02","name":"Tarja de Madeira Reforçada","type":"shield","rarity":"comum","level":3,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_02.png","value":56,"desc":"Madeira maciça rebitada com tiras de ferro cru.","defense":8,"hp":35},
    'sh_hero_03': {"id":"sh_hero_03","name":"Escudo de Infantaria de Ferro","type":"shield","rarity":"comum","level":7,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_03.png","value":77,"desc":"Escudo padrão de ferro forjado dos guardas de vigia.","defense":12,"hp":55},
    'sh_hero_04': {"id":"sh_hero_04","name":"Pavês de Patrulha Cinzento","type":"shield","rarity":"incomum","level":11,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_04.png","value":106,"desc":"Cobre grande parte do corpo contra saraivadas de flechas.","defense":16,"hp":80},
    'sh_hero_05': {"id":"sh_hero_05","name":"Escudo de Aço das Muralhas","type":"shield","rarity":"incomum","level":15,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_05.png","value":145,"desc":"Aço compacto resistente a marretadas e garras.","defense":21,"hp":110},
    'sh_hero_06': {"id":"sh_hero_06","name":"Escudo em Pipa de Miraluz","type":"shield","rarity":"incomum","level":18,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_06.png","value":198,"desc":"Linhas nobres em forma de gota com brasão reluzente.","defense":27,"hp":145},
    'sh_hero_07': {"id":"sh_hero_07","name":"Baluarte Protetor de Prata","type":"shield","rarity":"raro","level":22,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_07.png","value":272,"desc":"Prata batida que repele o toque de espectros errantes.","defense":32,"hp":180,"crit":0.02},
    'sh_hero_08': {"id":"sh_hero_08","name":"Escudo com Gema Esmeralda","type":"shield","rarity":"raro","level":26,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_08.png","value":372,"desc":"A gema central pulsa protegendo contra venenos do pântano.","defense":38,"hp":220,"arcane":20},
    'sh_hero_09': {"id":"sh_hero_09","name":"Baluarte de Bronze Antigo","type":"shield","rarity":"raro","level":30,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_09.png","value":510,"desc":"Esculpido em bronze rúnico retirado das criptas esquecidas.","defense":45,"hp":270},
    'sh_hero_10': {"id":"sh_hero_10","name":"Escudo Rúnico do Guardião","type":"shield","rarity":"raro","level":34,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_10.png","value":699,"desc":"Glifos gravados desviam projéteis arcanos em combate.","defense":52,"hp":325},
    'sh_hero_11': {"id":"sh_hero_11","name":"Escudo do Urso Guerreiro","type":"shield","rarity":"epico","level":38,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_11.png","value":957,"desc":"Parrudo e impiedoso, absorve o peso de impactos colossais.","defense":60,"hp":390},
    'sh_hero_12': {"id":"sh_hero_12","name":"Escudo com Safira Mística","type":"shield","rarity":"epico","level":44,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_12.png","value":1311,"desc":"O cristal azul canaliza uma barreira etérea adicional.","defense":69,"hp":460,"arcane":40},
    'sh_hero_13': {"id":"sh_hero_13","name":"Pavês do Templo Sagrado","type":"shield","rarity":"epico","level":50,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_13.png","value":1797,"desc":"Abençoado nas fontes sagradas da cidadela antes da ruína.","defense":78,"hp":540,"lifesteal":0.02},
    'sh_hero_14': {"id":"sh_hero_14","name":"Escudo Espinhoso de Sangue","type":"shield","rarity":"epico","level":54,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_14.png","value":2462,"desc":"Bordas afiadas retalham agressores no momento do bloqueio.","defense":88,"hp":620,"crit":0.04},
    'sh_hero_15': {"id":"sh_hero_15","name":"Baluarte da Meia-Noite Eterna","type":"shield","rarity":"epico","level":60,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_15.png","value":3372,"desc":"Forjado na escuridão mais densa, drenando a força de atacantes.","defense":99,"hp":710,"lifesteal":0.04},
    'sh_hero_16': {"id":"sh_hero_16","name":"Égide Dourada do Sol Radiante","type":"shield","rarity":"lendario","level":68,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_16.png","value":4620,"desc":"Irradia luminosidade ardente do meio-dia sobre mortos-vivos.","defense":112,"hp":810,"arcane":60},
    'sh_hero_17': {"id":"sh_hero_17","name":"Escudo Negro de Obsidiana","type":"shield","rarity":"lendario","level":76,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_17.png","value":6330,"desc":"Vidro abissal inabalável que resiste a explosões e fogo primordial.","defense":126,"hp":920,"lifesteal":0.05},
    'sh_hero_18': {"id":"sh_hero_18","name":"Baluarte de Cristal Ametista","type":"shield","rarity":"lendario","level":84,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_18.png","value":8671,"desc":"Estilhaça energias mágicas inimigas ao menor contato.","defense":142,"hp":1040,"arcane":95},
    'sh_hero_19': {"id":"sh_hero_19","name":"Égide Sagrada da Redenção","type":"shield","rarity":"lendario","level":92,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_19.png","value":11880,"desc":"Regenera continuamente o vigor e a couraça de quem o ergue.","defense":160,"hp":1180,"arcane":80,"lifesteal":0.06},
    'sh_hero_20': {"id":"sh_hero_20","name":"Baluarte Cósmico dos Cinco Selos","type":"shield","rarity":"supremo","level":105,"icon":"","iconImg":"assets/items/armor/shields/shield_hero_20.png","value":16275,"desc":"Artefato supremo inviolável forjado com as cinco pedras primordiais.","defense":188,"hp":1400,"arcane":120,"lifesteal":0.08,"crit":0.08},

    // ─── ANÉIS (RINGS) (20 ITENS PIXEL ART) ───
    'acc_ring_hero_01': {"id":"acc_ring_hero_01","name":"Anel de Cobre Polido","type":"ring","rarity":"comum","level":1,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_01.png","value":41,"desc":"Aro simples que canaliza um leve fluxo de vigor.","hp":20,"defense":2},
    'acc_ring_hero_02': {"id":"acc_ring_hero_02","name":"Selo de Bronze do Recruta","type":"ring","rarity":"comum","level":3,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_02.png","value":56,"desc":"Usado como marca de identificação dos batedores.","hp":35,"damage":3},
    'acc_ring_hero_03': {"id":"acc_ring_hero_03","name":"Anel de Ferro Forjado","type":"ring","rarity":"comum","level":7,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_03.png","value":77,"desc":"Resistente e austero, confere firmeza às mãos.","hp":50,"defense":5},
    'acc_ring_hero_04': {"id":"acc_ring_hero_04","name":"Anel do Falcão Veloz","type":"ring","rarity":"incomum","level":11,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_04.png","value":106,"desc":"Aumenta a precisão do usuário ao avistar brechas.","crit":0.03,"damage":6},
    'acc_ring_hero_05': {"id":"acc_ring_hero_05","name":"Anel da Guarda Nobre","type":"ring","rarity":"incomum","level":15,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_05.png","value":145,"desc":"Insignia de aço purificado com rebites polidos.","hp":75,"defense":8},
    'acc_ring_hero_06': {"id":"acc_ring_hero_06","name":"Anel de Prata Lunar","type":"ring","rarity":"incomum","level":18,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_06.png","value":198,"desc":"Reflete o brilho sereno da noite, acalmando o pulso.","arcane":15,"hp":95,"crit":0.04},
    'acc_ring_hero_07': {"id":"acc_ring_hero_07","name":"Selo do Caçador Furtivo","type":"ring","rarity":"raro","level":22,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_07.png","value":272,"desc":"Permite desferir golpes letais com precisão cirúrgica.","damage":10,"crit":0.06},
    'acc_ring_hero_08': {"id":"acc_ring_hero_08","name":"Anel de Esmeralda do Pântano","type":"ring","rarity":"raro","level":26,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_08.png","value":372,"desc":"Purifica toxinas e estabiliza o fluxo vital.","hp":140,"defense":12,"arcane":20},
    'acc_ring_hero_09': {"id":"acc_ring_hero_09","name":"Aliança de Ouro Velho","type":"ring","rarity":"raro","level":30,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_09.png","value":510,"desc":"Relíquia de uma família nobre soterrada pelas cinzas.","hp":170,"defense":15,"damage":12},
    'acc_ring_hero_10': {"id":"acc_ring_hero_10","name":"Anel Rúnico da Força","type":"ring","rarity":"raro","level":34,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_10.png","value":699,"desc":"Inscrições que amplificam a tensão muscular em combate.","damage":16,"hp":200,"crit":0.05},
    'acc_ring_hero_11': {"id":"acc_ring_hero_11","name":"Selo do Vigia Silencioso","type":"ring","rarity":"epico","level":38,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_11.png","value":957,"desc":"Anel escuro que camufla os batimentos cardíacos.","crit":0.08,"damage":20,"lifesteal":0.02},
    'acc_ring_hero_12': {"id":"acc_ring_hero_12","name":"Anel com Safira Estelar","type":"ring","rarity":"epico","level":44,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_12.png","value":1311,"desc":"Resplendor azul que potencializa feitiços e ataques.","arcane":45,"damage":24,"hp":240},
    'acc_ring_hero_13': {"id":"acc_ring_hero_13","name":"Aliança do Cruzado Fiel","type":"ring","rarity":"epico","level":50,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_13.png","value":1797,"desc":"Forjada em prata sagrada para purificar a terra.","defense":24,"hp":290,"lifesteal":0.03},
    'acc_ring_hero_14': {"id":"acc_ring_hero_14","name":"Anel dos Mares Glaciais","type":"ring","rarity":"epico","level":54,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_14.png","value":2462,"desc":"Frio extremo condensado em um aro impenetrável.","defense":28,"hp":350,"crit":0.07},
    'acc_ring_hero_15': {"id":"acc_ring_hero_15","name":"Selo da Meia-Noite Eterna","type":"ring","rarity":"epico","level":60,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_15.png","value":3372,"desc":"Drena a essência dos inimigos golpeados na escuridão.","damage":32,"lifesteal":0.05,"crit":0.08},
    'acc_ring_hero_16': {"id":"acc_ring_hero_16","name":"Anel do Sol Radiante","type":"ring","rarity":"lendario","level":68,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_16.png","value":4620,"desc":"Emite o calor fulgurante do meio-dia em suas veias.","damage":40,"arcane":65,"crit":0.09,"defense":25},
    'acc_ring_hero_17': {"id":"acc_ring_hero_17","name":"Anel de Obsidiana do Abismo","type":"ring","rarity":"lendario","level":76,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_17.png","value":6330,"desc":"Vidro negro que consome parte do dano recebido.","damage":48,"defense":34,"hp":480,"lifesteal":0.06},
    'acc_ring_hero_18': {"id":"acc_ring_hero_18","name":"Selo Espectral de Ametista","type":"ring","rarity":"lendario","level":84,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_18.png","value":8671,"desc":"Ressonância mágica cristalina de altíssima pureza.","arcane":100,"damage":55,"hp":560,"crit":0.1},
    'acc_ring_hero_19': {"id":"acc_ring_hero_19","name":"Aliança Sagrada da Aurora","type":"ring","rarity":"lendario","level":92,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_19.png","value":11880,"desc":"Bênção contínua que restaura vigor e poder a cada golpe.","damage":65,"defense":42,"arcane":85,"lifesteal":0.07,"crit":0.11},
    'acc_ring_hero_20': {"id":"acc_ring_hero_20","name":"Aliança Cósmica dos Cinco Selos","type":"ring","rarity":"supremo","level":105,"icon":"","iconImg":"assets/items/accessories/rings/ring_hero_20.png","value":16275,"desc":"O anel dos monarcas ancestrais que governaram as cinzas.","damage":85,"defense":55,"arcane":130,"hp":800,"crit":0.15,"lifesteal":0.09},

    // ─── AMULETOS (AMULETS) (20 ITENS PIXEL ART) ───
    'acc_amulet_hero_01': {"id":"acc_amulet_hero_01","name":"Pingente de Quartzo Bruto","type":"amulet","rarity":"comum","level":1,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_01.png","value":41,"desc":"Pedra de rio polida que ancora a mente sob estresse.","hp":25,"defense":2},
    'acc_amulet_hero_02': {"id":"acc_amulet_hero_02","name":"Talismã de Dente de Lobo","type":"amulet","rarity":"comum","level":3,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_02.png","value":56,"desc":"Símbolo primal de predador que aguça os sentidos.","damage":4,"crit":0.02},
    'acc_amulet_hero_03': {"id":"acc_amulet_hero_03","name":"Amuleto de Bronze da Trilha","type":"amulet","rarity":"comum","level":7,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_03.png","value":77,"desc":"Garante firmeza aos passos nas encostas escorregadias.","hp":45,"defense":4},
    'acc_amulet_hero_04': {"id":"acc_amulet_hero_04","name":"Colar de Contas de Ferro","type":"amulet","rarity":"incomum","level":11,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_04.png","value":106,"desc":"Pequenas esferas de ferro que desviam agouros.","hp":65,"defense":6,"damage":5},
    'acc_amulet_hero_05': {"id":"acc_amulet_hero_05","name":"Talismã do Guerreiro Vigilante","type":"amulet","rarity":"incomum","level":15,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_05.png","value":145,"desc":"Gravado com o estandarte que guardava o Castelo em Cinzas.","hp":90,"damage":8,"crit":0.03},
    'acc_amulet_hero_06': {"id":"acc_amulet_hero_06","name":"Medalhão de Prata Abençoada","type":"amulet","rarity":"incomum","level":18,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_06.png","value":198,"desc":"Prata pura que ferve em contato com espíritos malignos.","arcane":20,"hp":115,"defense":9},
    'acc_amulet_hero_07': {"id":"acc_amulet_hero_07","name":"Gargantilha da Raposa Astuta","type":"amulet","rarity":"raro","level":22,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_07.png","value":272,"desc":"Concede reflexos instantâneos para esquivar e contra-atacar.","crit":0.07,"damage":12},
    'acc_amulet_hero_08': {"id":"acc_amulet_hero_08","name":"Amuleto de Esmeralda do Pântano","type":"amulet","rarity":"raro","level":26,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_08.png","value":372,"desc":"Protege os pulmões e o sangue de miasmas putrefatos.","hp":160,"defense":14,"arcane":25},
    'acc_amulet_hero_09': {"id":"acc_amulet_hero_09","name":"Colar de Brasas Incandescentes","type":"amulet","rarity":"raro","level":30,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_09.png","value":510,"desc":"Pedras vulcânicas que nunca deixam o corpo esfriar.","damage":16,"hp":195,"crit":0.05},
    'acc_amulet_hero_10': {"id":"acc_amulet_hero_10","name":"Talismã Rúnico dos Titãs","type":"amulet","rarity":"raro","level":34,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_10.png","value":699,"desc":"Inscrições ancestrais que expandem a constituição física.","hp":240,"defense":18,"damage":18},
    'acc_amulet_hero_11': {"id":"acc_amulet_hero_11","name":"Medalhão da Vigília Sombria","type":"amulet","rarity":"epico","level":38,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_11.png","value":957,"desc":"Aumenta a letalidade de quem espreita nas trevas.","damage":24,"crit":0.09,"lifesteal":0.03},
    'acc_amulet_hero_12': {"id":"acc_amulet_hero_12","name":"Gota de Safira do Céu","type":"amulet","rarity":"epico","level":44,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_12.png","value":1311,"desc":"Cristal translúcido com o reflexo de um céu sem cinzas.","arcane":55,"hp":290,"damage":28},
    'acc_amulet_hero_13': {"id":"acc_amulet_hero_13","name":"Relicário de Prata da Capela","type":"amulet","rarity":"epico","level":50,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_13.png","value":1797,"desc":"Contém pó dos mártires de Miraluz. Cura milagrosa.","hp":360,"defense":26,"lifesteal":0.04},
    'acc_amulet_hero_14': {"id":"acc_amulet_hero_14","name":"Pingente do Coração de Gelo","type":"amulet","rarity":"epico","level":54,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_14.png","value":2462,"desc":"Congela a dor e retarda a fadiga nos combates.","defense":32,"hp":430,"crit":0.08},
    'acc_amulet_hero_15': {"id":"acc_amulet_hero_15","name":"Talismã da Meia-Noite Abissal","type":"amulet","rarity":"epico","level":60,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_15.png","value":3372,"desc":"Um olho esculpido em ônix que suga a luz ao redor.","damage":36,"crit":0.1,"lifesteal":0.05},
    'acc_amulet_hero_16': {"id":"acc_amulet_hero_16","name":"Coração Solar dos Reis","type":"amulet","rarity":"lendario","level":68,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_16.png","value":4620,"desc":"Irradia o calor das antigas dinastias da luz eterna.","damage":46,"arcane":75,"hp":550,"crit":0.1},
    'acc_amulet_hero_17': {"id":"acc_amulet_hero_17","name":"Gargantilha de Obsidiana Negra","type":"amulet","rarity":"lendario","level":76,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_17.png","value":6330,"desc":"Forjada nas entranhas do vulcão. Drena o vigor dos alvos.","damage":56,"defense":38,"lifesteal":0.07,"hp":640},
    'acc_amulet_hero_18': {"id":"acc_amulet_hero_18","name":"Lágrima Espectral de Ametista","type":"amulet","rarity":"lendario","level":84,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_18.png","value":8671,"desc":"Converte a dor sofrida em pura energia cósmica retaliadora.","arcane":110,"damage":64,"hp":740,"crit":0.12},
    'acc_amulet_hero_19': {"id":"acc_amulet_hero_19","name":"Colar Sagrado da Aurora Divina","type":"amulet","rarity":"lendario","level":92,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_19.png","value":11880,"desc":"O toque dourado dos serafins que restaura exércitos caídos.","damage":76,"defense":46,"arcane":95,"lifesteal":0.08,"hp":860},
    'acc_amulet_hero_20': {"id":"acc_amulet_hero_20","name":"Lágrima Cósmica dos Cinco Selos","type":"amulet","rarity":"supremo","level":105,"icon":"","iconImg":"assets/items/accessories/amulets/amulet_hero_20.png","value":16275,"desc":"O artefato místico supremo que uniu os cinco elementos do mundo.","damage":98,"defense":58,"arcane":145,"hp":1100,"crit":0.16,"lifesteal":0.1},

    // ─── ARCOS (ARCHER) (20 ITENS PIXEL ART) ───
    'w_bow_hero_01': {"id":"w_bow_hero_01","name":"Arco Curto do Aprendiz","type":"weapon","rarity":"comum","level":1,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_01.png","value":41,"desc":"Feito de freixo flexível, ideal para aprender a puxada.","classId":"arqueiro","damage":14,"range":25,"crit":0.04},
    'w_bow_hero_02': {"id":"w_bow_hero_02","name":"Arco de Caça das Colinas","type":"weapon","rarity":"comum","level":3,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_02.png","value":56,"desc":"Corda reforçada em tendão que amplia a velocidade da flecha.","classId":"arqueiro","damage":17,"range":28,"crit":0.05},
    'w_bow_hero_03': {"id":"w_bow_hero_03","name":"Arco Longo da Guarda","type":"weapon","rarity":"comum","level":7,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_03.png","value":77,"desc":"Excelente alcance para patrulhas nas ameias e torres.","classId":"arqueiro","damage":23,"range":35,"crit":0.06},
    'w_bow_hero_04': {"id":"w_bow_hero_04","name":"Arco Composto de Chifre","type":"weapon","rarity":"incomum","level":11,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_04.png","value":106,"desc":"Lâminas curvas de chifre animal aumentam o poder de tração.","classId":"arqueiro","damage":30,"range":40,"crit":0.07},
    'w_bow_hero_05': {"id":"w_bow_hero_05","name":"Arco de Guerra dos Batedores","type":"weapon","rarity":"incomum","level":15,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_05.png","value":145,"desc":"Dispara virotes pesados capazes de perfurar brigantinas.","classId":"arqueiro","damage":38,"range":45,"crit":0.08},
    'w_bow_hero_06': {"id":"w_bow_hero_06","name":"Arco das Brisas de Miraluz","type":"weapon","rarity":"incomum","level":18,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_06.png","value":198,"desc":"A madeira encantada silencia o voo de cada projétil.","classId":"arqueiro","damage":45,"range":50,"crit":0.09},
    'w_bow_hero_07': {"id":"w_bow_hero_07","name":"Arco Nobre de Teixo Negro","type":"weapon","rarity":"raro","level":22,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_07.png","value":272,"desc":"Madeira escura centenária com tração impecável e letal.","classId":"arqueiro","damage":52,"range":55,"crit":0.11},
    'w_bow_hero_08': {"id":"w_bow_hero_08","name":"Arco Esmeralda do Pântano","type":"weapon","rarity":"raro","level":26,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_08.png","value":372,"desc":"Dispara flechas com seiva cáustica que corrói armaduras.","classId":"arqueiro","damage":61,"range":60,"crit":0.12,"arcane":20},
    'w_bow_hero_09': {"id":"w_bow_hero_09","name":"Arco Rúnico de Bronze","type":"weapon","rarity":"raro","level":30,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_09.png","value":510,"desc":"Gravações ancestrais que guiam o virote aos pontos vitais.","classId":"arqueiro","damage":70,"range":65,"crit":0.13},
    'w_bow_hero_10': {"id":"w_bow_hero_10","name":"Arco do Caçador dos Bosques","type":"weapon","rarity":"raro","level":34,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_10.png","value":699,"desc":"Camuflado e letal, seus disparos nunca alertam a presa.","classId":"arqueiro","damage":78,"range":70,"crit":0.14},
    'w_bow_hero_11': {"id":"w_bow_hero_11","name":"Arco do Vento Cortante","type":"weapon","rarity":"epico","level":38,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_11.png","value":957,"desc":"Flechas cortam o ar gerando vórtices perfurantes.","classId":"arqueiro","damage":88,"range":75,"crit":0.15},
    'w_bow_hero_12': {"id":"w_bow_hero_12","name":"Arco com Safira Celeste","type":"weapon","rarity":"epico","level":44,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_12.png","value":1311,"desc":"Gema no punho infunde cada tiro com faíscas congelantes.","classId":"arqueiro","damage":100,"range":80,"crit":0.16,"arcane":40},
    'w_bow_hero_13': {"id":"w_bow_hero_13","name":"Arco Sagrado do Sentinela","type":"weapon","rarity":"epico","level":50,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_13.png","value":1797,"desc":"Banhado em orvalhos santos para expurgar espíritos errantes.","classId":"arqueiro","damage":112,"range":85,"crit":0.17,"hp":80},
    'w_bow_hero_14': {"id":"w_bow_hero_14","name":"Arco da Nevasca Eterna","type":"weapon","rarity":"epico","level":54,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_14.png","value":2462,"desc":"Resfria o sangue dos alvos diminuindo sua velocidade.","classId":"arqueiro","damage":125,"range":90,"crit":0.18},
    'w_bow_hero_15': {"id":"w_bow_hero_15","name":"Arco da Noite Sombria","type":"weapon","rarity":"epico","level":60,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_15.png","value":3372,"desc":"Flechas pretas imperceptíveis que dissolvem em veneno puro.","classId":"arqueiro","damage":138,"range":95,"crit":0.2,"lifesteal":0.04},
    'w_bow_hero_16': {"id":"w_bow_hero_16","name":"Olho Solar do Falcão Dourado","type":"weapon","rarity":"lendario","level":68,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_16.png","value":4620,"desc":"Flechas incandescentes que ardem como o zênite do sol.","classId":"arqueiro","damage":162,"range":100,"crit":0.21,"arcane":55},
    'w_bow_hero_17': {"id":"w_bow_hero_17","name":"Arco de Obsidiana do Abismo","type":"weapon","rarity":"lendario","level":76,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_17.png","value":6330,"desc":"Material alienígena que projeta flechas de sombra pura.","classId":"arqueiro","damage":185,"range":105,"crit":0.23,"lifesteal":0.06},
    'w_bow_hero_18': {"id":"w_bow_hero_18","name":"Arco Espectral de Ametista","type":"weapon","rarity":"lendario","level":84,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_18.png","value":8671,"desc":"Corda feita de luz mágica que não necessita de aljava física.","classId":"arqueiro","damage":208,"range":110,"crit":0.24,"arcane":85},
    'w_bow_hero_19': {"id":"w_bow_hero_19","name":"Arco Alado da Aurora Divina","type":"weapon","rarity":"lendario","level":92,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_19.png","value":11880,"desc":"Saraivadas celestes que aniquilam exércitos das trevas.","classId":"arqueiro","damage":235,"range":115,"crit":0.26,"arcane":70},
    'w_bow_hero_20': {"id":"w_bow_hero_20","name":"Arco Cósmico dos Cinco Selos","type":"weapon","rarity":"supremo","level":105,"icon":"","iconImg":"assets/items/weapons/bows/bow_hero_20.png","value":16275,"desc":"A arma suprema do Caçador Estelar. Suas flechas rompem dimensões.","classId":"arqueiro","damage":300,"range":125,"crit":0.3,"arcane":110,"lifesteal":0.08},

    // ─── MACHADOS (BARBARIAN) (20 ITENS PIXEL ART) ───
    'w_axe_hero_01': {"id":"w_axe_hero_01","name":"Machadinha de Lenhador","type":"weapon","rarity":"comum","level":1,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_01.png","value":41,"desc":"Ferramenta rústica usada com fúria brutal pelos novatos.","classId":"barbaro","damage":15,"hp":20,"crit":0.03},
    'w_axe_hero_02': {"id":"w_axe_hero_02","name":"Machado de Ferro das Colinas","type":"weapon","rarity":"comum","level":3,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_02.png","value":56,"desc":"Lâmina chanfrada que racha couros com ferocidade.","classId":"barbaro","damage":19,"hp":35,"crit":0.04},
    'w_axe_hero_03': {"id":"w_axe_hero_03","name":"Machado de Batalha da Vanguarda","type":"weapon","rarity":"comum","level":7,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_03.png","value":77,"desc":"Arma pesada de choque usada para arrombar portas e escudos.","classId":"barbaro","damage":25,"hp":55,"defense":4},
    'w_axe_hero_04': {"id":"w_axe_hero_04","name":"Machado Bipene do Carrasco","type":"weapon","rarity":"incomum","level":11,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_04.png","value":106,"desc":"Duas lâminas simétricas que cortam em ambos os sentidos.","classId":"barbaro","damage":33,"hp":75,"crit":0.05},
    'w_axe_hero_05': {"id":"w_axe_hero_05","name":"Quebra-Couraças de Ferro Puro","type":"weapon","rarity":"incomum","level":15,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_05.png","value":145,"desc":"Massa metálica frontal feita para entortar armaduras.","classId":"barbaro","damage":41,"hp":100,"defense":6},
    'w_axe_hero_06': {"id":"w_axe_hero_06","name":"Machado de Guerra de Miraluz","type":"weapon","rarity":"incomum","level":18,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_06.png","value":198,"desc":"Empunhadura longa de freixo reforçada com tiras de aço.","classId":"barbaro","damage":49,"hp":130,"crit":0.06},
    'w_axe_hero_07': {"id":"w_axe_hero_07","name":"Bipene de Aço Forjado","type":"weapon","rarity":"raro","level":22,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_07.png","value":272,"desc":"Balanceamento formidável para redemoinhos destruidores.","classId":"barbaro","damage":56,"hp":165,"crit":0.07},
    'w_axe_hero_08': {"id":"w_axe_hero_08","name":"Machado Esmeralda do Pântano","type":"weapon","rarity":"raro","level":26,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_08.png","value":372,"desc":"Fende monstros pantanosos com corte limpo e implacável.","classId":"barbaro","damage":66,"hp":205,"defense":10},
    'w_axe_hero_09': {"id":"w_axe_hero_09","name":"Machado Rúnico de Bronze","type":"weapon","rarity":"raro","level":30,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_09.png","value":510,"desc":"Antiga lâmina das catacumbas com peso avassalador.","classId":"barbaro","damage":75,"hp":250,"crit":0.08},
    'w_axe_hero_10': {"id":"w_axe_hero_10","name":"Machado dos Picos Selvagens","type":"weapon","rarity":"raro","level":34,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_10.png","value":699,"desc":"Entalhado com garras de urso para sangramento contínuo.","classId":"barbaro","damage":85,"hp":300,"crit":0.09,"lifesteal":0.03},
    'w_axe_hero_11': {"id":"w_axe_hero_11","name":"Machado da Fúria Berserker","type":"weapon","rarity":"epico","level":38,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_11.png","value":957,"desc":"Aumenta a adrenalina do guerreiro a cada golpe acertado.","classId":"barbaro","damage":96,"hp":355,"crit":0.1},
    'w_axe_hero_12': {"id":"w_axe_hero_12","name":"Machado com Safira Mística","type":"weapon","rarity":"epico","level":44,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_12.png","value":1311,"desc":"As ondas de choque congelam o solo após cada machadada.","classId":"barbaro","damage":108,"hp":415,"arcane":35,"defense":12},
    'w_axe_hero_13': {"id":"w_axe_hero_13","name":"Bipene da Ordem Sagrada","type":"weapon","rarity":"epico","level":50,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_13.png","value":1797,"desc":"Pesada e sagrada, pulveriza esqueletos em poeira branca.","classId":"barbaro","damage":120,"hp":480,"lifesteal":0.04},
    'w_axe_hero_14': {"id":"w_axe_hero_14","name":"Fendendor dos Picos Glaciais","type":"weapon","rarity":"epico","level":54,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_14.png","value":2462,"desc":"Aço gélido colossal capaz de abrir valas no gelo eterno.","classId":"barbaro","damage":133,"hp":550,"defense":16},
    'w_axe_hero_15': {"id":"w_axe_hero_15","name":"Machado da Meia-Noite Devoradora","type":"weapon","rarity":"epico","level":60,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_15.png","value":3372,"desc":"Alimenta-se do sangue fresco derramado no campo de batalha.","classId":"barbaro","damage":148,"hp":630,"lifesteal":0.06,"crit":0.11},
    'w_axe_hero_16': {"id":"w_axe_hero_16","name":"Machado Solar dos Reis Bárbaros","type":"weapon","rarity":"lendario","level":68,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_16.png","value":4620,"desc":"Chamas douradas envolvem o corte a cada giro de fúria.","classId":"barbaro","damage":172,"hp":730,"arcane":50,"crit":0.12},
    'w_axe_hero_17': {"id":"w_axe_hero_17","name":"Machado de Obsidiana do Cataclismo","type":"weapon","rarity":"lendario","level":76,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_17.png","value":6330,"desc":"Racha a rocha sólida e desintegra escudos inimigos.","classId":"barbaro","damage":196,"hp":840,"lifesteal":0.08,"defense":20},
    'w_axe_hero_18': {"id":"w_axe_hero_18","name":"Bipene Espectral de Ametista","type":"weapon","rarity":"lendario","level":84,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_18.png","value":8671,"desc":"Ressonância sísmica que estilhaça defesas e barreiras.","classId":"barbaro","damage":220,"hp":960,"arcane":75,"crit":0.14},
    'w_axe_hero_19': {"id":"w_axe_hero_19","name":"Machado Sagrado da Aurora Radiante","type":"weapon","rarity":"lendario","level":92,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_19.png","value":11880,"desc":"O poder de um titã celeste em cada impacto no solo.","classId":"barbaro","damage":248,"hp":1100,"arcane":65,"lifesteal":0.08},
    'w_axe_hero_20': {"id":"w_axe_hero_20","name":"Colosso Cósmico dos Cinco Selos","type":"weapon","rarity":"supremo","level":105,"icon":"","iconImg":"assets/items/weapons/axes/axe_hero_20.png","value":16275,"desc":"O machado primordial que rachou os continentes no Primeiro Fogo.","classId":"barbaro","damage":320,"hp":1400,"crit":0.18,"lifesteal":0.12,"defense":30},

    // ─── MAÇAS E CETROS (CLERIC) (20 ITENS PIXEL ART) ───
    'w_mace_hero_01': {"id":"w_mace_hero_01","name":"Porrete de Madeira das Trilhas","type":"weapon","rarity":"comum","level":1,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_01.png","value":41,"desc":"Clava rústica reforçada com pregos de ferro.","classId":"clerigo","damage":13,"arcane":15,"hp":15},
    'w_mace_hero_02': {"id":"w_mace_hero_02","name":"Maça de Ferro do Noviço","type":"weapon","rarity":"comum","level":3,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_02.png","value":56,"desc":"Cabeça esférica com nervuras para dissipar mortos-vivos.","classId":"clerigo","damage":16,"arcane":20,"hp":25},
    'w_mace_hero_03': {"id":"w_mace_hero_03","name":"Cetro de Vigia da Capela","type":"weapon","rarity":"comum","level":7,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_03.png","value":77,"desc":"Simples e austero, canaliza preces de cura e punição.","classId":"clerigo","damage":22,"arcane":30,"hp":40},
    'w_mace_hero_04': {"id":"w_mace_hero_04","name":"Maça Flangeada de Aço","type":"weapon","rarity":"incomum","level":11,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_04.png","value":106,"desc":"Lâminas radiais que amassam couraças com facilidade.","classId":"clerigo","damage":28,"arcane":40,"defense":5},
    'w_mace_hero_05': {"id":"w_mace_hero_05","name":"Cetro dos Penitentes","type":"weapon","rarity":"incomum","level":15,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_05.png","value":145,"desc":"Usado pelos sacerdotes guerreiros para purificar ruínas.","classId":"clerigo","damage":35,"arcane":52,"hp":70},
    'w_mace_hero_06': {"id":"w_mace_hero_06","name":"Maça Estrela de Miraluz","type":"weapon","rarity":"incomum","level":18,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_06.png","value":198,"desc":"Pontas de ferro piramidais abençoadas com sal sagrado.","classId":"clerigo","damage":42,"arcane":65,"defense":8},
    'w_mace_hero_07': {"id":"w_mace_hero_07","name":"Cetro de Prata da Salvação","type":"weapon","rarity":"raro","level":22,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_07.png","value":272,"desc":"Prata trabalhada que regenera o vigor de quem o segura.","classId":"clerigo","damage":49,"arcane":80,"hp":105,"lifesteal":0.03},
    'w_mace_hero_08': {"id":"w_mace_hero_08","name":"Maça Esmeralda do Pântano","type":"weapon","rarity":"raro","level":26,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_08.png","value":372,"desc":"Cravejada com gema verde que anula venenos e podridão.","classId":"clerigo","damage":57,"arcane":95,"defense":11},
    'w_mace_hero_09': {"id":"w_mace_hero_09","name":"Cetro Rúnico das Criptas","type":"weapon","rarity":"raro","level":30,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_09.png","value":510,"desc":"Recuperado de sarcófagos reais. Afasta sombras errantes.","classId":"clerigo","damage":65,"arcane":110,"hp":145},
    'w_mace_hero_10': {"id":"w_mace_hero_10","name":"Maça da Fé Inabalável","type":"weapon","rarity":"raro","level":34,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_10.png","value":699,"desc":"Impactos ressoam como sinos divinos expulsando demônios.","classId":"clerigo","damage":74,"arcane":130,"defense":14},
    'w_mace_hero_11': {"id":"w_mace_hero_11","name":"Martelo Sagrado do Templo","type":"weapon","rarity":"epico","level":38,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_11.png","value":957,"desc":"O martelo ritual dos antigos bispos guerreiros da fortaleza.","classId":"clerigo","damage":84,"arcane":150,"hp":190,"defense":16},
    'w_mace_hero_12': {"id":"w_mace_hero_12","name":"Cetro com Safira da Fé","type":"weapon","rarity":"epico","level":44,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_12.png","value":1311,"desc":"Pura luz azul que renova continuamente as forças divinas.","classId":"clerigo","damage":95,"arcane":175,"hp":240},
    'w_mace_hero_13': {"id":"w_mace_hero_13","name":"Maça Alada dos Serafins","type":"weapon","rarity":"epico","level":50,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_13.png","value":1797,"desc":"Asas de prata na guarda que acolhem preces em combate.","classId":"clerigo","damage":106,"arcane":200,"lifesteal":0.04,"defense":19},
    'w_mace_hero_14': {"id":"w_mace_hero_14","name":"Cetro das Fontes Glaciais","type":"weapon","rarity":"epico","level":54,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_14.png","value":2462,"desc":"Congela a ferocidade de carniceiros e monstros selvagens.","classId":"clerigo","damage":118,"arcane":230,"hp":300},
    'w_mace_hero_15': {"id":"w_mace_hero_15","name":"Maça da Meia-Noite Purificadora","type":"weapon","rarity":"epico","level":60,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_15.png","value":3372,"desc":"Penetra a escuridão trazendo o resplendor da graça.","classId":"clerigo","damage":131,"arcane":260,"defense":22,"lifesteal":0.05},
    'w_mace_hero_16': {"id":"w_mace_hero_16","name":"Cetro Solar da Alvorada Divina","type":"weapon","rarity":"lendario","level":68,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_16.png","value":4620,"desc":"Irradia o poder dos santos reis sobre hordas profanas.","classId":"clerigo","damage":152,"arcane":310,"hp":420,"defense":26},
    'w_mace_hero_17': {"id":"w_mace_hero_17","name":"Maça de Obsidiana Consagrada","type":"weapon","rarity":"lendario","level":76,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_17.png","value":6330,"desc":"A rocha negra purificada pelo fogo sagrado nunca racha.","classId":"clerigo","damage":174,"arcane":360,"defense":30,"lifesteal":0.06},
    'w_mace_hero_18': {"id":"w_mace_hero_18","name":"Cetro Espectral de Ametista","type":"weapon","rarity":"lendario","level":84,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_18.png","value":8671,"desc":"Canaliza correntes infinitas de mana divina curativa.","classId":"clerigo","damage":195,"arcane":420,"hp":550,"crit":0.08},
    'w_mace_hero_19': {"id":"w_mace_hero_19","name":"Maça Alada da Redenção Suprema","type":"weapon","rarity":"lendario","level":92,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_19.png","value":11880,"desc":"Concede imunidade espiritual e vitalidade radiante.","classId":"clerigo","damage":220,"arcane":490,"hp":680,"lifesteal":0.08,"defense":35},
    'w_mace_hero_20': {"id":"w_mace_hero_20","name":"Cetro Cósmico dos Cinco Selos","type":"weapon","rarity":"supremo","level":105,"icon":"","iconImg":"assets/items/weapons/maces/mace_hero_20.png","value":16275,"desc":"O cetro celestial do Primeiro Sumo-Sacerdote de Miraluz.","classId":"clerigo","damage":285,"arcane":620,"hp":900,"defense":45,"lifesteal":0.1},

    // ─── ADAGAS E LÂMINAS (ASSASSIN) (20 ITENS PIXEL ART) ───
    'w_dagger_hero_01': {"id":"w_dagger_hero_01","name":"Adaga de Caça do Aprendiz","type":"weapon","rarity":"comum","level":1,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_01.png","value":41,"desc":"Lâmina fina de ferro cru para cortes rápidos.","classId":"assasino","damage":12,"crit":0.08},
    'w_dagger_hero_02': {"id":"w_dagger_hero_02","name":"Estilete das Sombras","type":"weapon","rarity":"comum","level":3,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_02.png","value":56,"desc":"Ponta triangular que penetra frestas com extrema facilidade.","classId":"assasino","damage":15,"crit":0.1},
    'w_dagger_hero_03': {"id":"w_dagger_hero_03","name":"Adaga Curva de Batedor","type":"weapon","rarity":"comum","level":7,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_03.png","value":77,"desc":"Corte curvo que provoca sangramento em golpes surpresa.","classId":"assasino","damage":20,"crit":0.11},
    'w_dagger_hero_04': {"id":"w_dagger_hero_04","name":"Par de Facas da Vigília","type":"weapon","rarity":"incomum","level":11,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_04.png","value":106,"desc":"Balanceadas tanto para combate cerrado quanto para arremesso.","classId":"assasino","damage":26,"crit":0.12},
    'w_dagger_hero_05': {"id":"w_dagger_hero_05","name":"Kukri do Emboscador","type":"weapon","rarity":"incomum","level":15,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_05.png","value":145,"desc":"Lâmina pesada na ponta com impacto brutal no pescoço.","classId":"assasino","damage":33,"crit":0.13,"lifesteal":0.02},
    'w_dagger_hero_06': {"id":"w_dagger_hero_06","name":"Adaga Furtiva de Miraluz","type":"weapon","rarity":"incomum","level":18,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_06.png","value":198,"desc":"Não reflete luz alguma, sumindo completamente nas sombras.","classId":"assasino","damage":40,"crit":0.14},
    'w_dagger_hero_07': {"id":"w_dagger_hero_07","name":"Estilete de Aço Refinado","type":"weapon","rarity":"raro","level":22,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_07.png","value":272,"desc":"Perfurador formidável capaz de ignorar armaduras leves.","classId":"assasino","damage":47,"crit":0.15},
    'w_dagger_hero_08': {"id":"w_dagger_hero_08","name":"Presa Esmeralda do Pântano","type":"weapon","rarity":"raro","level":26,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_08.png","value":372,"desc":"Banhada em peçonha de víboras ancestrais do lodo.","classId":"assasino","damage":55,"crit":0.16,"arcane":15},
    'w_dagger_hero_09': {"id":"w_dagger_hero_09","name":"Adaga Rúnica de Bronze","type":"weapon","rarity":"raro","level":30,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_09.png","value":510,"desc":"Resplende em tons antigos com veneno adormecido na lâmina.","classId":"assasino","damage":63,"crit":0.17},
    'w_dagger_hero_10': {"id":"w_dagger_hero_10","name":"Garra das Sombras Mortais","type":"weapon","rarity":"raro","level":34,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_10.png","value":699,"desc":"Desfere sequências fulminantes nos pontos vitais do alvo.","classId":"assasino","damage":71,"crit":0.18,"lifesteal":0.03},
    'w_dagger_hero_11': {"id":"w_dagger_hero_11","name":"Adaga da Dança Noturna","type":"weapon","rarity":"epico","level":38,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_11.png","value":957,"desc":"Gira entre os dedos como uma ilusão antes do golpe fatal.","classId":"assasino","damage":80,"crit":0.2},
    'w_dagger_hero_12': {"id":"w_dagger_hero_12","name":"Estilete com Safira Oculta","type":"weapon","rarity":"epico","level":44,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_12.png","value":1311,"desc":"O frio da gema anestesia a vítima enquanto o sangue escorre.","classId":"assasino","damage":91,"crit":0.21,"arcane":30},
    'w_dagger_hero_13': {"id":"w_dagger_hero_13","name":"Lâmina de Prata do Carrasco","type":"weapon","rarity":"epico","level":50,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_13.png","value":1797,"desc":"Prata temperada para silenciar criaturas corrompidas.","classId":"assasino","damage":102,"crit":0.22,"lifesteal":0.04},
    'w_dagger_hero_14': {"id":"w_dagger_hero_14","name":"Presa Glacial do Vento Frio","type":"weapon","rarity":"epico","level":54,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_14.png","value":2462,"desc":"Solidifica os vasos sanguíneos no instante da estocada.","classId":"assasino","damage":114,"crit":0.23},
    'w_dagger_hero_15': {"id":"w_dagger_hero_15","name":"Adaga da Meia-Noite Eterna","type":"weapon","rarity":"epico","level":60,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_15.png","value":3372,"desc":"Fusão perfeita com a escuridão. O golpe nunca é visto.","classId":"assasino","damage":127,"crit":0.25,"lifesteal":0.06},
    'w_dagger_hero_16': {"id":"w_dagger_hero_16","name":"Presa Solar do Escorpião Dourado","type":"weapon","rarity":"lendario","level":68,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_16.png","value":4620,"desc":"Queima as entranhas do inimigo com veneno incandescente.","classId":"assasino","damage":148,"crit":0.26,"arcane":45},
    'w_dagger_hero_17': {"id":"w_dagger_hero_17","name":"Adaga de Obsidiana do Vácuo","type":"weapon","rarity":"lendario","level":76,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_17.png","value":6330,"desc":"Corta o próprio tecido do espaço para atingir o coração.","classId":"assasino","damage":170,"crit":0.28,"lifesteal":0.08},
    'w_dagger_hero_18': {"id":"w_dagger_hero_18","name":"Estilete Espectral de Ametista","type":"weapon","rarity":"lendario","level":84,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_18.png","value":8671,"desc":"Ignora barreiras arcanas e devora a mana de feiticeiros.","classId":"assasino","damage":192,"crit":0.29,"arcane":65},
    'w_dagger_hero_19': {"id":"w_dagger_hero_19","name":"Lâmina Alada da Névoa Sagrada","type":"weapon","rarity":"lendario","level":92,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_19.png","value":11880,"desc":"Execuções cirúrgicas de velocidade transcendente.","classId":"assasino","damage":216,"crit":0.31,"lifesteal":0.08},
    'w_dagger_hero_20': {"id":"w_dagger_hero_20","name":"Adagas Cósmicas dos Cinco Selos","type":"weapon","rarity":"supremo","level":105,"icon":"","iconImg":"assets/items/weapons/daggers/dagger_hero_20.png","value":16275,"desc":"O par supremo das sombras primordiais. Cada corte extingue uma vida.","classId":"assasino","damage":280,"crit":0.35,"lifesteal":0.12,"arcane":80},

    // ─── CAJADOS E BÁCULOS (MAGE) (20 ITENS PIXEL ART) ───
    'w_staff_hero_01': {"id":"w_staff_hero_01","name":"Cajado de Madeira Rústica","type":"weapon","rarity":"comum","level":1,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_01.png","value":41,"desc":"Galho entalhado para focar as primeiras faíscas mágicas.","classId":"mago","damage":14,"arcane":22},
    'w_staff_hero_02': {"id":"w_staff_hero_02","name":"Vara de Aprendiz Arcano","type":"weapon","rarity":"comum","level":3,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_02.png","value":56,"desc":"Cobre polido na ponta para conduzir feitiços básicos.","classId":"mago","damage":17,"arcane":28},
    'w_staff_hero_03': {"id":"w_staff_hero_03","name":"Cajado com Orbe de Vidro","type":"weapon","rarity":"comum","level":7,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_03.png","value":77,"desc":"A esfera canaliza feixes luminosos com boa precisão.","classId":"mago","damage":23,"arcane":40},
    'w_staff_hero_04': {"id":"w_staff_hero_04","name":"Báculo de Bétula Encantada","type":"weapon","rarity":"incomum","level":11,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_04.png","value":106,"desc":"Madeira que absorveu partículas de mana das florestas.","classId":"mago","damage":30,"arcane":55},
    'w_staff_hero_05': {"id":"w_staff_hero_05","name":"Cajado Rúnico de Cinzas","type":"weapon","rarity":"incomum","level":15,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_05.png","value":145,"desc":"Gravado com as fórmulas antigas da biblioteca de Miraluz.","classId":"mago","damage":38,"arcane":72},
    'w_staff_hero_06': {"id":"w_staff_hero_06","name":"Grimório e Foco de Miraluz","type":"weapon","rarity":"incomum","level":18,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_06.png","value":198,"desc":"Páginas perdidas da torre arcana que expandem feitiços.","classId":"mago","damage":45,"arcane":90,"crit":0.04},
    'w_staff_hero_07': {"id":"w_staff_hero_07","name":"Cajado de Aço e Cristal","type":"weapon","rarity":"raro","level":22,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_07.png","value":272,"desc":"Estrutura metálica com prisma que refrata raios mágicos.","classId":"mago","damage":52,"arcane":110,"crit":0.05},
    'w_staff_hero_08': {"id":"w_staff_hero_08","name":"Báculo Esmeralda do Pântano","type":"weapon","rarity":"raro","level":26,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_08.png","value":372,"desc":"Canaliza correntes cáusticas e miasmas venenosos arcanos.","classId":"mago","damage":62,"arcane":135,"hp":60},
    'w_staff_hero_09': {"id":"w_staff_hero_09","name":"Cajado de Bronze das Criptas","type":"weapon","rarity":"raro","level":30,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_09.png","value":510,"desc":"Extraído dos túmulos dos arquimagos da antiga dinastia.","classId":"mago","damage":72,"arcane":160},
    'w_staff_hero_10': {"id":"w_staff_hero_10","name":"Cetro dos Elementos Primordiais","type":"weapon","rarity":"raro","level":34,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_10.png","value":699,"desc":"Combina calor, gelo e relâmpago em um vórtice instável.","classId":"mago","damage":82,"arcane":190,"crit":0.06},
    'w_staff_hero_11': {"id":"w_staff_hero_11","name":"Báculo do Arquivista Sepultado","type":"weapon","rarity":"epico","level":38,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_11.png","value":957,"desc":"Guarda o conhecimento proibido de feitiços de destruição.","classId":"mago","damage":93,"arcane":225,"crit":0.07},
    'w_staff_hero_12': {"id":"w_staff_hero_12","name":"Cajado com Safira Abissal","type":"weapon","rarity":"epico","level":44,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_12.png","value":1311,"desc":"Pulsos de gelo cósmico que congelam o ar ao redor.","classId":"mago","damage":106,"arcane":265},
    'w_staff_hero_13': {"id":"w_staff_hero_13","name":"Cetro da Luz Celestial","type":"weapon","rarity":"epico","level":50,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_13.png","value":1797,"desc":"Raios purificadores que incineram demônios e espectros.","classId":"mago","damage":120,"arcane":310,"hp":100},
    'w_staff_hero_14': {"id":"w_staff_hero_14","name":"Báculo das Nevascas Eternas","type":"weapon","rarity":"epico","level":54,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_14.png","value":2462,"desc":"Invoca tempestades de granizo afiado em larga escala.","classId":"mago","damage":135,"arcane":360,"crit":0.08},
    'w_staff_hero_15': {"id":"w_staff_hero_15","name":"Cajado da Meia-Noite Espectral","type":"weapon","rarity":"epico","level":60,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_15.png","value":3372,"desc":"Canaliza necromancia pura e drena a mana inimiga.","classId":"mago","damage":150,"arcane":420,"lifesteal":0.04},
    'w_staff_hero_16': {"id":"w_staff_hero_16","name":"Singularidade Solar dos Reis","type":"weapon","rarity":"lendario","level":68,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_16.png","value":4620,"desc":"Miniatura de uma estrela ardente flutua sobre o topo.","classId":"mago","damage":175,"arcane":500,"crit":0.1},
    'w_staff_hero_17': {"id":"w_staff_hero_17","name":"Cetro de Obsidiana do Apocalipse","type":"weapon","rarity":"lendario","level":76,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_17.png","value":6330,"desc":"Funde o solo em magma e conjura meteoros devastadores.","classId":"mago","damage":202,"arcane":590,"lifesteal":0.05},
    'w_staff_hero_18': {"id":"w_staff_hero_18","name":"Báculo Cósmico de Ametista","type":"weapon","rarity":"lendario","level":84,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_18.png","value":8671,"desc":"Abre portais infinitesimais para o vácuo infinito.","classId":"mago","damage":230,"arcane":690,"crit":0.12},
    'w_staff_hero_19': {"id":"w_staff_hero_19","name":"Cajado Alado da Aurora Suprema","type":"weapon","rarity":"lendario","level":92,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_19.png","value":11880,"desc":"A emanação de luz divina absoluta que restaura o mundo.","classId":"mago","damage":260,"arcane":800,"hp":200,"crit":0.14},
    'w_staff_hero_20': {"id":"w_staff_hero_20","name":"Cajado Cósmico dos Cinco Selos","type":"weapon","rarity":"supremo","level":105,"icon":"","iconImg":"assets/items/weapons/staves/mage_asset_20.png","value":16275,"desc":"O artefato arcano supremo que governa o Primeiro Fogo.","classId":"mago","damage":340,"arcane":1050,"crit":0.18,"lifesteal":0.08,"hp":300},


    // ─── CONSUMÍVEIS (PIXEL ART DE ALTA DEFINIÇÃO) ───
    'pot_vida_pequena': { id: 'pot_vida_pequena', name: 'Poção de Vida Menor', type: 'consumable', rarity: 'comum', subType: 'heal', heal: 60, icon: '', iconImg: 'assets/items/consumables/potion_health_heart.png', value: 15, buyPrice: 20, stackable: true, desc: 'Restaura 60 pontos de vida com a essência de um coração escarlate.' },
    'pot_vida_media': { id: 'pot_vida_media', name: 'Poção de Vida Maior', type: 'consumable', rarity: 'incomum', subType: 'heal', heal: 180, icon: '', iconImg: 'assets/items/consumables/potion_health_heart.png', value: 45, buyPrice: 65, stackable: true, desc: 'Restaura 180 pontos de vida instantaneamente.' },
    'pot_vida_suprema': { id: 'pot_vida_suprema', name: 'Elixir da Vitalidade Élfica', type: 'consumable', rarity: 'raro', subType: 'heal', heal: 450, icon: '', iconImg: 'assets/items/consumables/potion_health_heart.png', value: 120, buyPrice: 180, stackable: true, desc: 'Restaura 450 pontos de vida e confere vigor supremo.' },
    'pot_energia': { id: 'pot_energia', name: 'Frasco de Energia Arcana', type: 'consumable', rarity: 'comum', subType: 'energy', energy: 60, icon: '', iconImg: 'assets/items/consumables/potion_mana_moon.png', value: 30, buyPrice: 45, stackable: true, desc: 'Restaura 60 de energia imediatamente com o poder da lua crescente.' },
    'scroll_retorno': { id: 'scroll_retorno', name: 'Pergaminho do Castelo', type: 'consumable', rarity: 'comum', subType: 'teleport_hub', icon: '', value: 20, buyPrice: 35, stackable: true, desc: 'Teleporta você de volta em segurança para o Castelo em Cinzas.' , iconImg: 'assets/items/health-potion.svg'},
    'elixir_forca': { id: 'elixir_forca', name: 'Elixir da Fúria Titânica', type: 'consumable', rarity: 'raro', subType: 'buff_atk', icon: '', value: 150, buyPrice: 220, stackable: true, desc: 'Bebida alquímica que concede +25% de dano por 5 minutos.' , iconImg: 'assets/items/health-potion.svg'},
    'elixir_pedra': { id: 'elixir_pedra', name: 'Tintura de Pele de Pedra', type: 'consumable', rarity: 'raro', subType: 'buff_def', icon: '', value: 140, buyPrice: 200, stackable: true, desc: 'Endurece a pele reduzindo todo dano recebido em 12 por 5 minutos.' , iconImg: 'assets/items/health-potion.svg'},

    // ─── MATERIAIS DE FORJA & EXPEDIÇÃO (PIXEL ART) ───
    'mat_fragmento_brasa': { id: 'mat_fragmento_brasa', name: 'Fragmento de Brasa Sagrada', type: 'material', rarity: 'raro', icon: '', iconImg: 'assets/items/consumables/ore_raw_iron.png', value: 100, stackable: true, desc: 'Centelha incandescente das ruínas de Miraluz. Usado para aprimorar armas na Forja.' },
    'mat_lingote_ferro': { id: 'mat_lingote_ferro', name: 'Minério de Ferro Puro', type: 'material', rarity: 'comum', icon: '', iconImg: 'assets/items/consumables/ore_raw_iron.png', value: 25, stackable: true, desc: 'Minério bruto purificado para forja e reforço de lâminas e armaduras.' },
    'mat_lingote_ouro': { id: 'mat_lingote_ouro', name: 'Barra de Ouro Imperial', type: 'material', rarity: 'raro', icon: '', iconImg: 'assets/items/consumables/ingot_gold.png', value: 150, stackable: true, desc: 'Ouro puro de alta densidade das arcas reais de Miraluz.' },
    'mat_diamante_ancestral': { id: 'mat_diamante_ancestral', name: 'Diamante Estelar Lapidado', type: 'material', rarity: 'lendario', icon: '', iconImg: 'assets/items/consumables/gem_diamond.png', value: 400, stackable: true, desc: 'Gema brilhante indestrutível canalizadora de energias místicas.' },
    'mat_cristal_mata': { id: 'mat_cristal_mata', name: 'Cristal da Mata Profunda', type: 'material', rarity: 'incomum', icon: '', iconImg: 'assets/items/consumables/gem_diamond.png', value: 50, stackable: true, desc: 'Gema com reflexos esmeralda extraída de veios luminosos.' },

    // ─── POÇÕES E ELIXIRES ALQUÍMICOS (PIXEL ART) ───
    'pot_asset_01': {"id":"pot_asset_01","name":"Poção de Lágrima Celeste","type":"consumable","rarity":"raro","subType":"heal", "heal": 280,"icon":"","iconImg":"assets/items/potions/potion_asset_01.png","value":95,"buyPrice":65,"stackable":true,"desc":"Frasco de essência cristalina que restaura a vida com bênçãos antigas."},
    'pot_asset_02': {"id":"pot_asset_02","name":"Elixir das Sombras Silenciosas","type":"consumable","rarity":"incomum","subType":"buff_atk","icon":"","iconImg":"assets/items/potions/potion_asset_02.png","value":60,"buyPrice":40,"stackable":true,"desc":"Destilado sombrio que afia o instinto e concede dano furtivo elevado."},
    'pot_asset_03': {"id":"pot_asset_03","name":"Tintura de Sangue Vampírico","type":"consumable","rarity":"raro","subType":"lifesteal","icon":"","iconImg":"assets/items/potions/potion_asset_03.png","value":110,"buyPrice":70,"stackable":true,"desc":"Infusão rubra que converte ferimentos causados em vigor renovado."},
    'pot_asset_04': {"id":"pot_asset_04","name":"Bálsamo de Casca de Carvalho","type":"consumable","rarity":"comum","subType":"buff_def","icon":"","iconImg":"assets/items/potions/potion_asset_04.png","value":40,"buyPrice":25,"stackable":true,"desc":"Ungüento vegetal que enrijece a pele contra pancadas e cortes."},
    'pot_asset_05': {"id":"pot_asset_05","name":"Tônico do Peregrino das Cinzas","type":"consumable","rarity":"comum","subType":"energy", "energy": 80,"icon":"","iconImg":"assets/items/potions/potion_asset_05.png","value":35,"buyPrice":20,"stackable":true,"desc":"Bebida aromática revigorante que recupera a resistência corporal."},
    'pot_asset_06': {"id":"pot_asset_06","name":"Extrato da Noite Carmesim","type":"consumable","rarity":"incomum","subType":"heal", "heal": 150,"icon":"","iconImg":"assets/items/potions/potion_asset_06.png","value":55,"buyPrice":35,"stackable":true,"desc":"Frasco medicinal que cicatriza cortes e estanca hemorragias."},
    'pot_asset_07': {"id":"pot_asset_07","name":"Néctar do Luar Arcano","type":"consumable","rarity":"epico","subType":"arcane_buff","icon":"","iconImg":"assets/items/potions/potion_asset_07.png","value":170,"buyPrice":110,"stackable":true,"desc":"Bebida mágica que amplifica todas as invocações e encantamentos arcanos."},
    'pot_asset_08': {"id":"pot_asset_08","name":"Óleo de Fogo Primordial","type":"consumable","rarity":"raro","subType":"buff_atk","icon":"","iconImg":"assets/items/potions/potion_asset_08.png","value":120,"buyPrice":75,"stackable":true,"desc":"Substância inflamável que incendeia a ponta de flechas e lâminas."},
    'pot_asset_09': {"id":"pot_asset_09","name":"Filtro de Fúria Titânica","type":"consumable","rarity":"epico","subType":"buff_atk","icon":"","iconImg":"assets/items/potions/potion_asset_09.png","value":200,"buyPrice":130,"stackable":true,"desc":"Concentrado denso que desperta a força descomunal dos antigos bárbaros."},
    'pot_asset_10': {"id":"pot_asset_10","name":"Soro Antipeçonha do Pântano","type":"consumable","rarity":"comum","subType":"cure","icon":"","iconImg":"assets/items/potions/potion_asset_10.png","value":50,"buyPrice":30,"stackable":true,"desc":"Mistura de ervas pantaneiras que neutraliza toxinas e ácidos corrosivos."},
    'pot_asset_11': {"id":"pot_asset_11","name":"Essência de Nevasca Eterna","type":"consumable","rarity":"raro","subType":"buff_def","icon":"","iconImg":"assets/items/potions/potion_asset_11.png","value":130,"buyPrice":85,"stackable":true,"desc":"Líquido gélido que envolve o usuário em uma aura congelante protetora."},
    'pot_asset_12': {"id":"pot_asset_12","name":"Orbe de Vitalidade Sagrada","type":"consumable","rarity":"lendario","subType":"heal", "heal": 600,"icon":"","iconImg":"assets/items/potions/potion_asset_12.png","value":400,"buyPrice":250,"stackable":true,"desc":"Frasco sagrado com a luz do Primeiro Templo. Cura feridas mortais."},
    'pot_asset_13': {"id":"pot_asset_13","name":"Poção de Velocidade do Vento","type":"consumable","rarity":"incomum","subType":"speed","icon":"","iconImg":"assets/items/potions/potion_asset_13.png","value":70,"buyPrice":45,"stackable":true,"desc":"Mistura efervescente que torna os passos leves e velozes."},
    'pot_asset_14': {"id":"pot_asset_14","name":"Elixir de Precisão Mortal","type":"consumable","rarity":"raro","subType":"crit_buff","icon":"","iconImg":"assets/items/potions/potion_asset_14.png","value":140,"buyPrice":90,"stackable":true,"desc":"Aguça os sentidos para detectar pontos vitais em inimigos."},
    'pot_asset_15': {"id":"pot_asset_15","name":"Licor da Fortaleza de Cinzas","type":"consumable","rarity":"incomum","subType":"buff_def","icon":"","iconImg":"assets/items/potions/potion_asset_15.png","value":75,"buyPrice":50,"stackable":true,"desc":"Bebida robusta que confere bônus de resistência contra ataques físicos."},
    'pot_asset_16': {"id":"pot_asset_16","name":"Frasco de Mana Estelar","type":"consumable","rarity":"epico","subType":"energy", "energy": 160,"icon":"","iconImg":"assets/items/potions/potion_asset_16.png","value":210,"buyPrice":140,"stackable":true,"desc":"Reserva arcana das estrelas que restaura totalmente o fôlego mágico."},
    'pot_asset_17': {"id":"pot_asset_17","name":"Tintura de Regeneração Rápida","type":"consumable","rarity":"raro","subType":"regen","icon":"","iconImg":"assets/items/potions/potion_asset_17.png","value":150,"buyPrice":95,"stackable":true,"desc":"Regenera a vida gradualmente mesmo durante o fervor do combate."},
    'pot_asset_18': {"id":"pot_asset_18","name":"Bálsamo de Cinza Imortal","type":"consumable","rarity":"lendario","subType":"buff_def","icon":"","iconImg":"assets/items/potions/potion_asset_18.png","value":450,"buyPrice":280,"stackable":true,"desc":"Proteção impenetrável das cinzas da fogueira original."},
    'pot_asset_19': {"id":"pot_asset_19","name":"Elixir de Sangue do Dragão","type":"consumable","rarity":"lendario","subType":"buff_atk","icon":"","iconImg":"assets/items/potions/potion_asset_19.png","value":500,"buyPrice":320,"stackable":true,"desc":"O sangue fervente de wyrms ancestrais infundido em vigor marcial."},
    'pot_asset_20': {"id":"pot_asset_20","name":"Ambrósia Cósmica dos Cinco Selos","type":"consumable","rarity":"supremo","subType":"heal", "heal": 1000,"icon":"","iconImg":"assets/items/potions/potion_asset_20.png","value":1000,"buyPrice":600,"stackable":true,"desc":"O ápice da alquimia divina. Restaura toda a vitalidade e vigor primordial."},

    // ─── MATERIAIS DE FORJA, ALQUIMIA & ARTESANATO (PIXEL ART 2K) ───
    'mat_craft_01': {"id":"mat_craft_01","name":"Minério de Ferro Cru","type":"material","rarity":"comum","icon":"","iconImg":"assets/items/crafting/craft_mat_01.png","value":20,"buyPrice":30,"stackable":true,"desc":"Minério bruto recolhido de encostas e jazidas montanhosas."},
    'mat_craft_02': {"id":"mat_craft_02","name":"Minério de Cobre Vulcânico","type":"material","rarity":"comum","icon":"","iconImg":"assets/items/crafting/craft_mat_02.png","value":25,"buyPrice":37,"stackable":true,"desc":"Pedra com veios avermelhados rica em cobre termo-resistente."},
    'mat_craft_03': {"id":"mat_craft_03","name":"Minério de Estanho das Minas","type":"material","rarity":"comum","icon":"","iconImg":"assets/items/crafting/craft_mat_03.png","value":25,"buyPrice":37,"stackable":true,"desc":"Utilizado por fundidores para balancear ligas de bronze resistente."},
    'mat_craft_04': {"id":"mat_craft_04","name":"Minério de Prata Pura","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_04.png","value":40,"buyPrice":60,"stackable":true,"desc":"Veio argênteo puro muito cobiçado por templos e forjadores."},
    'mat_craft_05': {"id":"mat_craft_05","name":"Minério de Ouro Fino","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_05.png","value":75,"buyPrice":112,"stackable":true,"desc":"Nódulos reluzentes de ouro incrustados em quartzo antigo."},
    'mat_craft_06': {"id":"mat_craft_06","name":"Minério de Platina Sagrada","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_06.png","value":90,"buyPrice":135,"stackable":true,"desc":"Metal nobre e pesado que canaliza bênçãos com facilidade."},
    'mat_craft_07': {"id":"mat_craft_07","name":"Minério de Mithril Negro","type":"material","rarity":"epico","icon":"","iconImg":"assets/items/crafting/craft_mat_07.png","value":150,"buyPrice":225,"stackable":true,"desc":"Metal leve como pena e mais resistente que aço temperado."},
    'mat_craft_08': {"id":"mat_craft_08","name":"Minério de Adamantite Primordial","type":"material","rarity":"epico","icon":"","iconImg":"assets/items/crafting/craft_mat_08.png","value":180,"buyPrice":270,"stackable":true,"desc":"Matéria-prima de dureza incomparável das fossas profundas."},
    'mat_craft_09': {"id":"mat_craft_09","name":"Minério de Obsidiana do Vácuo","type":"material","rarity":"lendario","icon":"","iconImg":"assets/items/crafting/craft_mat_09.png","value":280,"buyPrice":420,"stackable":true,"desc":"Pedra vulcânica infundida com a escuridão do abismo."},
    'mat_craft_10': {"id":"mat_craft_10","name":"Minério de Cobalto Arcano","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_10.png","value":85,"buyPrice":127,"stackable":true,"desc":"Ressoa suavemente na presença de fluxos concentrados de mana."},
    'mat_craft_11': {"id":"mat_craft_11","name":"Minério de Titânio Celeste","type":"material","rarity":"lendario","icon":"","iconImg":"assets/items/crafting/craft_mat_11.png","value":320,"buyPrice":480,"stackable":true,"desc":"Metal estelar caído dos confins do firmamento cósmico."},
    'mat_craft_12': {"id":"mat_craft_12","name":"Minério de Oricalco Ancestral","type":"material","rarity":"lendario","icon":"","iconImg":"assets/items/crafting/craft_mat_12.png","value":360,"buyPrice":540,"stackable":true,"desc":"A liga mítica usada pelos primeiros reis das cinzas."},
    'mat_craft_13': {"id":"mat_craft_13","name":"Minério de Brasa Eterna","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_13.png","value":110,"buyPrice":165,"stackable":true,"desc":"Pedra incandescente que nunca perde calor mesmo na neve."},
    'mat_craft_14': {"id":"mat_craft_14","name":"Minério de Gelo Profundo","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_14.png","value":45,"buyPrice":67,"stackable":true,"desc":"Rocha congelada que resiste até mesmo ao calor de forjas comuns."},
    'mat_craft_15': {"id":"mat_craft_15","name":"Minério de Éter Cristalizado","type":"material","rarity":"supremo","icon":"","iconImg":"assets/items/crafting/craft_mat_15.png","value":500,"buyPrice":750,"stackable":true,"desc":"A substância primordial na formação dos cinco selos arcanos."},
    'mat_craft_16': {"id":"mat_craft_16","name":"Barra de Ferro Forjado","type":"material","rarity":"comum","icon":"","iconImg":"assets/items/crafting/craft_mat_16.png","value":35,"buyPrice":52,"stackable":true,"desc":"Lingote básico para confecção de lâminas, escudos e cota de malha."},
    'mat_craft_17': {"id":"mat_craft_17","name":"Barra de Bronze Reforçado","type":"material","rarity":"comum","icon":"","iconImg":"assets/items/crafting/craft_mat_17.png","value":40,"buyPrice":60,"stackable":true,"desc":"Liga pesada excelente para martelos de impacto e protetores."},
    'mat_craft_18': {"id":"mat_craft_18","name":"Barra de Aço Temperado","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_18.png","value":60,"buyPrice":90,"stackable":true,"desc":"Metal duro com tratamento térmico para suportar choques violentos."},
    'mat_craft_19': {"id":"mat_craft_19","name":"Barra de Prata Consagrada","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_19.png","value":75,"buyPrice":112,"stackable":true,"desc":"Lingote prateado abençoado para forjar armas contra mortos-vivos."},
    'mat_craft_20': {"id":"mat_craft_20","name":"Barra de Ouro Imperial","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_20.png","value":130,"buyPrice":195,"stackable":true,"desc":"Usada em ornamentos de armas nobres e relicários sagrados."},
    'mat_craft_21': {"id":"mat_craft_21","name":"Barra de Mithril Pura","type":"material","rarity":"epico","icon":"","iconImg":"assets/items/crafting/craft_mat_21.png","value":220,"buyPrice":330,"stackable":true,"desc":"Brilha com um reflexo azulado de leveza e dureza divinas."},
    'mat_craft_22': {"id":"mat_craft_22","name":"Barra de Adamantite Negra","type":"material","rarity":"epico","icon":"","iconImg":"assets/items/crafting/craft_mat_22.png","value":260,"buyPrice":390,"stackable":true,"desc":"Forjada sob pressões colossais, virtualmente inquebrável."},
    'mat_craft_23': {"id":"mat_craft_23","name":"Barra de Obsidiana Lapidada","type":"material","rarity":"lendario","icon":"","iconImg":"assets/items/crafting/craft_mat_23.png","value":400,"buyPrice":600,"stackable":true,"desc":"Absorve feitiços e corta proteções mágicas como navalha."},
    'mat_craft_24': {"id":"mat_craft_24","name":"Barra de Cobalto Encantado","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_24.png","value":140,"buyPrice":210,"stackable":true,"desc":"Excelente condutividade arcana para armas de magos e clérigos."},
    'mat_craft_25': {"id":"mat_craft_25","name":"Barra de Titânio Radiante","type":"material","rarity":"lendario","icon":"","iconImg":"assets/items/crafting/craft_mat_25.png","value":450,"buyPrice":675,"stackable":true,"desc":"Metal celeste forjado nas chamas sagradas de Miraluz."},
    'mat_craft_26': {"id":"mat_craft_26","name":"Barra de Oricalco Divino","type":"material","rarity":"lendario","icon":"","iconImg":"assets/items/crafting/craft_mat_26.png","value":520,"buyPrice":780,"stackable":true,"desc":"Reconhecida como o ápice da metalurgia dos antigos impérios."},
    'mat_craft_27': {"id":"mat_craft_27","name":"Barra de Ferro Espectral","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_27.png","value":125,"buyPrice":187,"stackable":true,"desc":"Infundida com ectoplasma, pesando menos que o ferro comum."},
    'mat_craft_28': {"id":"mat_craft_28","name":"Barra de Aço Vulcânico","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_28.png","value":70,"buyPrice":105,"stackable":true,"desc":"Guarda o calor do magma, deixando o fio da arma incandescente."},
    'mat_craft_29': {"id":"mat_craft_29","name":"Barra de Prata Furtiva","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_29.png","value":135,"buyPrice":202,"stackable":true,"desc":"Trabalhada por assassinos para não produzir reflexos nem ruído."},
    'mat_craft_30': {"id":"mat_craft_30","name":"Lingote Cósmico Supremo","type":"material","rarity":"supremo","icon":"","iconImg":"assets/items/crafting/craft_mat_30.png","value":750,"buyPrice":1125,"stackable":true,"desc":"A amálgama definitiva de todos os metais primordiais."},
    'mat_craft_31': {"id":"mat_craft_31","name":"Fragmento de Quartzo Claro","type":"material","rarity":"comum","icon":"","iconImg":"assets/items/crafting/craft_mat_31.png","value":15,"buyPrice":22,"stackable":true,"desc":"Cristal básico com ressonância mágica incipiente."},
    'mat_craft_32': {"id":"mat_craft_32","name":"Ametista da Noite","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_32.png","value":35,"buyPrice":52,"stackable":true,"desc":"Pedra roxa com reflexos profundos que canalizam mistério."},
    'mat_craft_33': {"id":"mat_craft_33","name":"Safira das Profundezas","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_33.png","value":45,"buyPrice":67,"stackable":true,"desc":"Gema azul límpida que harmoniza feitiços gélidos e defensivos."},
    'mat_craft_34': {"id":"mat_craft_34","name":"Rubi Incandescente","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_34.png","value":90,"buyPrice":135,"stackable":true,"desc":"Pedra ardente que amplifica magias de fogo e fúria guerreira."},
    'mat_craft_35': {"id":"mat_craft_35","name":"Esmeralda Venenosa","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_35.png","value":85,"buyPrice":127,"stackable":true,"desc":"Gema verde viva associada a toxinas letais e peçonhas do pântano."},
    'mat_craft_36': {"id":"mat_craft_36","name":"Topázio Dourado","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_36.png","value":50,"buyPrice":75,"stackable":true,"desc":"Reflete o brilho do meio-dia, fortalecendo ataques físicos."},
    'mat_craft_37': {"id":"mat_craft_37","name":"Diamante Lapidado","type":"material","rarity":"epico","icon":"","iconImg":"assets/items/crafting/craft_mat_37.png","value":180,"buyPrice":270,"stackable":true,"desc":"Prisma de luz pura que refrata energias espirituais e sagradas."},
    'mat_craft_38': {"id":"mat_craft_38","name":"Ônix do Abismo","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_38.png","value":95,"buyPrice":142,"stackable":true,"desc":"Pedra escura que drena a luz e potencializa golpes sombrios."},
    'mat_craft_39': {"id":"mat_craft_39","name":"Opala Espiritual","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_39.png","value":100,"buyPrice":150,"stackable":true,"desc":"Muda de cor conforme o humor e o estado de espírito do portador."},
    'mat_craft_40': {"id":"mat_craft_40","name":"Turquesa dos Mares Antigos","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_40.png","value":40,"buyPrice":60,"stackable":true,"desc":"Gema suave que concede calma e foco durante emboscadas."},
    'mat_craft_41': {"id":"mat_craft_41","name":"Granada de Fogo Fátuo","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_41.png","value":48,"buyPrice":72,"stackable":true,"desc":"Alimenta faíscas mágicas nos momentos críticos de combate."},
    'mat_craft_42': {"id":"mat_craft_42","name":"Zircão Espectral","type":"material","rarity":"epico","icon":"","iconImg":"assets/items/crafting/craft_mat_42.png","value":170,"buyPrice":255,"stackable":true,"desc":"Cristal raro que vibra em uníssono com o plano das sombras."},
    'mat_craft_43': {"id":"mat_craft_43","name":"Pérola Negra Abissal","type":"material","rarity":"epico","icon":"","iconImg":"assets/items/crafting/craft_mat_43.png","value":200,"buyPrice":300,"stackable":true,"desc":"Formada nas entranhas de carapaças das profundezas oceânicas."},
    'mat_craft_44': {"id":"mat_craft_44","name":"Cristal de Mana Pura","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_44.png","value":120,"buyPrice":180,"stackable":true,"desc":"Fragmento de alta densidade mágica que acelera conjurações."},
    'mat_craft_45': {"id":"mat_craft_45","name":"Rubi da Estrela Escarlate","type":"material","rarity":"lendario","icon":"","iconImg":"assets/items/crafting/craft_mat_45.png","value":320,"buyPrice":480,"stackable":true,"desc":"O centro desta pedra possui uma estrela de fogo viva."},
    'mat_craft_46': {"id":"mat_craft_46","name":"Safira Celestial dos Céus","type":"material","rarity":"lendario","icon":"","iconImg":"assets/items/crafting/craft_mat_46.png","value":340,"buyPrice":510,"stackable":true,"desc":"Gema lendária dos arcanistas reais da torre de Miraluz."},
    'mat_craft_47': {"id":"mat_craft_47","name":"Esmeralda Primordial","type":"material","rarity":"lendario","icon":"","iconImg":"assets/items/crafting/craft_mat_47.png","value":310,"buyPrice":465,"stackable":true,"desc":"Guarda a essência vegetal das primeiras florestas do mundo."},
    'mat_craft_48': {"id":"mat_craft_48","name":"Diamante da Luz Suprema","type":"material","rarity":"lendario","icon":"","iconImg":"assets/items/crafting/craft_mat_48.png","value":420,"buyPrice":630,"stackable":true,"desc":"A mais nobre das gemas conhecidas nos anais da humanidade."},
    'mat_craft_49': {"id":"mat_craft_49","name":"Olho de Dragão Incrustado","type":"material","rarity":"lendario","icon":"","iconImg":"assets/items/crafting/craft_mat_49.png","value":460,"buyPrice":690,"stackable":true,"desc":"Fóssil ocular de ser alado que reluz ao detectar perigo."},
    'mat_craft_50': {"id":"mat_craft_50","name":"Coração de Ametista Cósmica","type":"material","rarity":"supremo","icon":"","iconImg":"assets/items/crafting/craft_mat_50.png","value":680,"buyPrice":1020,"stackable":true,"desc":"A gema definitiva para encantamentos lendários e sagrados."},
    'mat_craft_51': {"id":"mat_craft_51","name":"Garra de Lobo Cinzento","type":"material","rarity":"comum","icon":"","iconImg":"assets/items/crafting/craft_mat_51.png","value":12,"buyPrice":18,"stackable":true,"desc":"Extremidade afiada usada para retalhar presas na escuridão."},
    'mat_craft_52': {"id":"mat_craft_52","name":"Presa de Carniçal do Ermo","type":"material","rarity":"comum","icon":"","iconImg":"assets/items/crafting/craft_mat_52.png","value":16,"buyPrice":24,"stackable":true,"desc":"Dente pontiagudo com resquícios de veneno cadavérico."},
    'mat_craft_53': {"id":"mat_craft_53","name":"Pele de Rastejador Pantanoso","type":"material","rarity":"comum","icon":"","iconImg":"assets/items/crafting/craft_mat_53.png","value":18,"buyPrice":27,"stackable":true,"desc":"Couro grosso e impermeável ideal para forros de botas."},
    'mat_craft_54': {"id":"mat_craft_54","name":"Escama de Serpente das Sombras","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_54.png","value":32,"buyPrice":48,"stackable":true,"desc":"Superfície acetinada que desliza sem ruído entre a folhagem."},
    'mat_craft_55': {"id":"mat_craft_55","name":"Olho de Morcego das Cavernas","type":"material","rarity":"comum","icon":"","iconImg":"assets/items/crafting/craft_mat_55.png","value":14,"buyPrice":21,"stackable":true,"desc":"Utilizado por alquimistas para preparar poções de visão noturna."},
    'mat_craft_56': {"id":"mat_craft_56","name":"Asa de Gárgula de Pedra","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_56.png","value":38,"buyPrice":57,"stackable":true,"desc":"Fragmento endurecido que retém peso e rigidez mineral."},
    'mat_craft_57': {"id":"mat_craft_57","name":"Chifre de Besta Búfala","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_57.png","value":34,"buyPrice":51,"stackable":true,"desc":"Ponta reforçada com alta capacidade de absorção de choque."},
    'mat_craft_58': {"id":"mat_craft_58","name":"Ferrão de Escorpião Rubro","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_58.png","value":42,"buyPrice":63,"stackable":true,"desc":"Bolsa venenosa intacta com peçonha paralisante perigosa."},
    'mat_craft_59': {"id":"mat_craft_59","name":"Carapaça de Besouro Titã","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_59.png","value":45,"buyPrice":67,"stackable":true,"desc":"Placa quitinosa muito procurada para reforço de peitorais."},
    'mat_craft_60': {"id":"mat_craft_60","name":"Tendão de Urso das Cavernas","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_60.png","value":36,"buyPrice":54,"stackable":true,"desc":"Corda elástica indispensável para montagem de arcos compostos."},
    'mat_craft_61': {"id":"mat_craft_61","name":"Crânio de Esqueleto Guerreiro","type":"material","rarity":"comum","icon":"","iconImg":"assets/items/crafting/craft_mat_61.png","value":15,"buyPrice":22,"stackable":true,"desc":"Osso antigo purificado das maldições que o erguiam."},
    'mat_craft_62': {"id":"mat_craft_62","name":"Ectoplasma Fantasmagórico","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_62.png","value":80,"buyPrice":120,"stackable":true,"desc":"Resíduo viscoso deixado após banimento de almas penadas."},
    'mat_craft_63': {"id":"mat_craft_63","name":"Coração de Golem de Pedra","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_63.png","value":95,"buyPrice":142,"stackable":true,"desc":"Núcleo gravitacional que mantinha as rochas conectadas."},
    'mat_craft_64': {"id":"mat_craft_64","name":"Glândula de Veneno Cáustico","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_64.png","value":85,"buyPrice":127,"stackable":true,"desc":"Líquido verde efervescente que corrói madeira e metais comuns."},
    'mat_craft_65': {"id":"mat_craft_65","name":"Pó de Asa de Fada Noturna","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_65.png","value":75,"buyPrice":112,"stackable":true,"desc":"Espalha um brilho fosforescente suave nas sombras da floresta."},
    'mat_craft_66': {"id":"mat_craft_66","name":"Presa de Basilisco do Brejo","type":"material","rarity":"epico","icon":"","iconImg":"assets/items/crafting/craft_mat_66.png","value":160,"buyPrice":240,"stackable":true,"desc":"Dente com petrificação residual em suas ranhuras."},
    'mat_craft_67': {"id":"mat_craft_67","name":"Pêlo de Licantropo Enfurecido","type":"material","rarity":"epico","icon":"","iconImg":"assets/items/crafting/craft_mat_67.png","value":175,"buyPrice":262,"stackable":true,"desc":"Pelagem densa que concede calor sobrenatural ao tecido."},
    'mat_craft_68': {"id":"mat_craft_68","name":"Escama de Dragão das Cinzas","type":"material","rarity":"lendario","icon":"","iconImg":"assets/items/crafting/craft_mat_68.png","value":320,"buyPrice":480,"stackable":true,"desc":"Praticamente imune a fogo e cortes de lâminas convencionais."},
    'mat_craft_69': {"id":"mat_craft_69","name":"Chifre de Quimera Voraz","type":"material","rarity":"epico","icon":"","iconImg":"assets/items/crafting/craft_mat_69.png","value":210,"buyPrice":315,"stackable":true,"desc":"Estrutura óssea espiralada com poder destrutivo nato."},
    'mat_craft_70': {"id":"mat_craft_70","name":"Cinzas do Guardião Sepultado","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_70.png","value":110,"buyPrice":165,"stackable":true,"desc":"Poeira mística que restaura fogueiras e forjas arcanas."},
    'mat_craft_71': {"id":"mat_craft_71","name":"Madeira de Teixo Ancestral","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_71.png","value":30,"buyPrice":45,"stackable":true,"desc":"Galho envelhecido que não se parte sob as maiores puxadas."},
    'mat_craft_72': {"id":"mat_craft_72","name":"Raiz de Mandrágora da Meia-Noite","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_72.png","value":35,"buyPrice":52,"stackable":true,"desc":"Planta que emite sibilos ao ser arrancada da terra fértil."},
    'mat_craft_73': {"id":"mat_craft_73","name":"Lótus de Sangue Escarlate","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_73.png","value":70,"buyPrice":105,"stackable":true,"desc":"Flor rara que floresce apenas em campos de batalha esquecidos."},
    'mat_craft_74': {"id":"mat_craft_74","name":"Cogumelo Alucinógeno das Grutas","type":"material","rarity":"comum","icon":"","iconImg":"assets/items/crafting/craft_mat_74.png","value":18,"buyPrice":27,"stackable":true,"desc":"Esporo brilhante que confere sensibilidade espiritual."},
    'mat_craft_75': {"id":"mat_craft_75","name":"Seiva de Árvore Primordial","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_75.png","value":85,"buyPrice":127,"stackable":true,"desc":"Adesivo e impermeabilizante divino das florestas sagradas."},
    'mat_craft_76': {"id":"mat_craft_76","name":"Pó de Brasa Purificadora","type":"material","rarity":"comum","icon":"","iconImg":"assets/items/crafting/craft_mat_76.png","value":22,"buyPrice":33,"stackable":true,"desc":"Centelhas miúdas recolhidas da pira funerária de Miraluz."},
    'mat_craft_77': {"id":"mat_craft_77","name":"Essência Arcana Fluida","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_77.png","value":45,"buyPrice":67,"stackable":true,"desc":"Líquido cintilante base para todos os encantamentos menores."},
    'mat_craft_78': {"id":"mat_craft_78","name":"Sal Sagrado dos Templários","type":"material","rarity":"comum","icon":"","iconImg":"assets/items/crafting/craft_mat_78.png","value":20,"buyPrice":30,"stackable":true,"desc":"Mineral consagrado usado para abençoar lâminas e altares."},
    'mat_craft_79': {"id":"mat_craft_79","name":"Enxofre das Fendas Vulcânicas","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_79.png","value":35,"buyPrice":52,"stackable":true,"desc":"Pó amarelo forte que alimenta fogos devastadores."},
    'mat_craft_80': {"id":"mat_craft_80","name":"Mercúrio Vivo Alquímico","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_80.png","value":90,"buyPrice":135,"stackable":true,"desc":"Metal líquido que nunca repousa, ligando substâncias opostas."},
    'mat_craft_81': {"id":"mat_craft_81","name":"Carvão de Carvalho Negro","type":"material","rarity":"comum","icon":"","iconImg":"assets/items/crafting/craft_mat_81.png","value":15,"buyPrice":22,"stackable":true,"desc":"Combustível de queima demorada e limpa para forjamentos finos."},
    'mat_craft_82': {"id":"mat_craft_82","name":"Runa de Proteção Rústica","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_82.png","value":55,"buyPrice":82,"stackable":true,"desc":"Glifo talhado em pedra que dissipa feitiços hostis leves."},
    'mat_craft_83': {"id":"mat_craft_83","name":"Runa de Afiação Cortante","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_83.png","value":60,"buyPrice":90,"stackable":true,"desc":"Aumenta a precisão das pontas e o corte das lâminas."},
    'mat_craft_84': {"id":"mat_craft_84","name":"Runa de Impacto Titânico","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_84.png","value":115,"buyPrice":172,"stackable":true,"desc":"Transmite choque concussivo pesado em golpes desferidos."},
    'mat_craft_85': {"id":"mat_craft_85","name":"Runa de Fogo Solar","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_85.png","value":125,"buyPrice":187,"stackable":true,"desc":"Incita labaredas ardentes nos projéteis e nos golpes corpo a corpo."},
    'mat_craft_86': {"id":"mat_craft_86","name":"Runa de Gelo Eterno","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_86.png","value":120,"buyPrice":180,"stackable":true,"desc":"Retarda os passos de inimigos atingidos por armas encantadas."},
    'mat_craft_87': {"id":"mat_craft_87","name":"Runa de Veneno Insidioso","type":"material","rarity":"raro","icon":"","iconImg":"assets/items/crafting/craft_mat_87.png","value":110,"buyPrice":165,"stackable":true,"desc":"Contamina ferimentos com toxinas difíceis de estancar."},
    'mat_craft_88': {"id":"mat_craft_88","name":"Runa de Cura Radiante","type":"material","rarity":"epico","icon":"","iconImg":"assets/items/crafting/craft_mat_88.png","value":190,"buyPrice":285,"stackable":true,"desc":"Canaliza preces celestes diretamente para a armadura do campeão."},
    'mat_craft_89': {"id":"mat_craft_89","name":"Runa de Agilidade Felina","type":"material","rarity":"incomum","icon":"","iconImg":"assets/items/crafting/craft_mat_89.png","value":65,"buyPrice":97,"stackable":true,"desc":"Acelera as esquivas e o tempo de reação em duelos."},
    'mat_craft_90': {"id":"mat_craft_90","name":"Runa de Roubo de Sangue","type":"material","rarity":"epico","icon":"","iconImg":"assets/items/crafting/craft_mat_90.png","value":210,"buyPrice":315,"stackable":true,"desc":"Drena a essência vital dos adversários para curar o herói."},
    'mat_craft_91': {"id":"mat_craft_91","name":"Runa de Penetração Mágica","type":"material","rarity":"epico","icon":"","iconImg":"assets/items/crafting/craft_mat_91.png","value":220,"buyPrice":330,"stackable":true,"desc":"Anula a couraça arcana de magos e guardiões espectrais."},
    'mat_craft_92': {"id":"mat_craft_92","name":"Runa de Fúria Indomável","type":"material","rarity":"epico","icon":"","iconImg":"assets/items/crafting/craft_mat_92.png","value":240,"buyPrice":360,"stackable":true,"desc":"Multiplica o dano em momentos de vida extremamente baixa."},
    'mat_craft_93': {"id":"mat_craft_93","name":"Pó Estelar da Aurora","type":"material","rarity":"lendario","icon":"","iconImg":"assets/items/crafting/craft_mat_93.png","value":350,"buyPrice":525,"stackable":true,"desc":"Poeira de cometas canalizada para criar encantamentos imortais."},
    'mat_craft_94': {"id":"mat_craft_94","name":"Éter Alquímico Concentrado","type":"material","rarity":"lendario","icon":"","iconImg":"assets/items/crafting/craft_mat_94.png","value":380,"buyPrice":570,"stackable":true,"desc":"A base quintessencial dos grandes mestres alquimistas."},
    'mat_craft_95': {"id":"mat_craft_95","name":"Coração da Chama Primária","type":"material","rarity":"lendario","icon":"","iconImg":"assets/items/crafting/craft_mat_95.png","value":480,"buyPrice":720,"stackable":true,"desc":"Fragmento da labareda que acendeu as primeiras estrelas."},
    'mat_craft_96': {"id":"mat_craft_96","name":"Selo Cósmico dos Anciões","type":"material","rarity":"lendario","icon":"","iconImg":"assets/items/crafting/craft_mat_96.png","value":520,"buyPrice":780,"stackable":true,"desc":"Símbolo milenar que dobra a potência de qualquer item forjado."},
    'mat_craft_97': {"id":"mat_craft_97","name":"Orbe do Vácuo Primordial","type":"material","rarity":"supremo","icon":"","iconImg":"assets/items/crafting/craft_mat_97.png","value":800,"buyPrice":1200,"stackable":true,"desc":"A substância do espaço infinito antes da criação do mundo."},
    'mat_craft_98': {"id":"mat_craft_98","name":"Cinza do Primeiro Fogo","type":"material","rarity":"supremo","icon":"","iconImg":"assets/items/crafting/craft_mat_98.png","value":1200,"buyPrice":1800,"stackable":true,"desc":"O resíduo sagrado original de Terra das Cinzas. Poder ilimitado."},
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
          gloves: null,
          boots: null,
          amulet: null,
          ring1: null,
          ring2: null
        }, s.equipped || {});
        inventory = s.inventory || [];
      } else {
        // Starter equipment kit (com Lâmina Infernal e Manoplas de Aço)
        inventory = [
          { id: 'w_lamina_infernal', count: 1, enhanceLevel: 0 },
          { id: 'w_espada_ferro', count: 1, enhanceLevel: 0 },
          { id: 'sh_madeira_reforcada', count: 1, enhanceLevel: 0 },
          { id: 'hl_couro_batedor', count: 1, enhanceLevel: 0 },
          { id: 'ar_tunica_linho', count: 1, enhanceLevel: 0 },
          { id: 'gl_manoplas_aco', count: 1, enhanceLevel: 0 },
          { id: 'bt_botas_viagem', count: 1, enhanceLevel: 0 },
          { id: 'acc_anel_cobre', count: 1, enhanceLevel: 0 },
          { id: 'acc_amuleto_pedra', count: 1, enhanceLevel: 0 },
          { id: 'pot_vida_pequena', count: 5 },
          { id: 'scroll_retorno', count: 3 },
          { id: 'mat_fragmento_brasa', count: 2 }
        ];
        // Auto-equip basic gear on fresh start
        equipped.weapon = { id: 'w_lamina_infernal', count: 1, enhanceLevel: 0 };
        equipped.armor = { id: 'ar_tunica_linho', count: 1, enhanceLevel: 0 };
        equipped.gloves = { id: 'gl_manoplas_aco', count: 1, enhanceLevel: 0 };
        equipped.boots = { id: 'bt_botas_viagem', count: 1, enhanceLevel: 0 };
        equipped.ring1 = { id: 'acc_anel_cobre', count: 1, enhanceLevel: 0 };
        equipped.helm = { id: 'hl_couro_batedor', count: 1, enhanceLevel: 0 };
        equipped.shield = { id: 'sh_madeira_reforcada', count: 1, enhanceLevel: 0 };
        equipped.amulet = { id: 'acc_amuleto_pedra', count: 1, enhanceLevel: 0 };
        inventory = inventory.filter(i => !['w_lamina_infernal', 'ar_tunica_linho', 'gl_manoplas_aco', 'bt_botas_viagem', 'acc_anel_cobre', 'hl_couro_batedor', 'sh_madeira_reforcada', 'acc_amuleto_pedra'].includes(i.id));
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
    else if (base.type === 'gloves') slot = 'gloves';
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
      window.GameUI?.msg?.(`Elixir Ativo: +25% de Dano por 5 minutos!`);
      removeItem(index, 1);
    } else if (base.subType === 'buff_def' && p) {
      p.defBuffUntil = Date.now() + 5 * 60 * 1000;
      if (window.GameAudio?.playShield) window.GameAudio.playShield();
      window.GameUI?.msg?.(`Pele de Pedra Ativa: Dano recebido reduzido em 12 por 5 minutos!`);
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
    if (!it) return '';
    const base = ITEM_DATABASE[it.id];
    return base ? base.icon : '';
  }

  function getItemTooltip(it) {
    if (!it) return '';
    const base = ITEM_DATABASE[it.id];
    if (!base) return '';
    let stats = [];
    const mult = 1 + (it.enhanceLevel || 0) * 0.12;
    if (base.damage) stats.push(`Dano: +${Math.round(base.damage * mult)}`);
    if (base.defense) stats.push(`Defesa: +${Math.round(base.defense * mult)}`);
    if (base.hp) stats.push(`Vida: +${Math.round(base.hp * mult)}`);
    if (base.arcane) stats.push(`Arcano: +${Math.round(base.arcane * mult)}`);
    if (base.crit) stats.push(`Crítico: +${Math.round(base.crit * 100)}%`);
    if (base.lifesteal) stats.push(`Roubo de Vida: +${Math.round(base.lifesteal * 100)}%`);
    return `${base.name} [${(base.rarity || 'comum').toUpperCase()}]\n${base.desc || ''}\n${stats.join('\n')}\nClique para inspecionar/equipar`;
  }

  // ─────────────────────────────────────────────────────────────
  // SINCRONIZAÇÃO COM A CAMADA DE UI (src/systems/ui/InventoryUI.js)
  // ─────────────────────────────────────────────────────────────

  function refreshAllInventoryViews() {
    if (window.GameInventoryUI?.refreshAllInventoryViews) {
      window.GameInventoryUI.refreshAllInventoryViews();
    } else if (window.GameInventoryUI?.renderInventoryUI) {
      window.GameInventoryUI.renderInventoryUI();
    }
  }

  function isInventoryModalOpen() {
    return !!window.GameInventoryUI?.isInventoryModalOpen?.();
  }

  function closeInventoryModal() {
    window.GameInventoryUI?.closeInventoryModal?.();
  }

  function toggleInventoryModal() {
    window.GameInventoryUI?.toggleInventoryModal?.();
  }

  function openInventoryModal() {
    window.GameInventoryUI?.openInventoryModal?.();
  }

  function renderInventoryUI(container) {
    window.GameInventoryUI?.renderInventoryUI?.(container);
  }

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
    useConsumable,
    getEquipmentBonuses,
    renderInventoryUI,
    getItemTooltip,
    getItemName,
    getItemIcon,
    saveInventory,
    loadInventory,
    openInventoryModal,
    closeInventoryModal,
    toggleInventoryModal,
    isInventoryModalOpen
  };

  export const gameItems = window.GameItems;
