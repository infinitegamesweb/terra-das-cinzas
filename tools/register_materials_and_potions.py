# tools/register_materials_and_potions.py
import json
import re

potions_data = [
    ("pot_asset_01", "Poção de Lágrima Celeste", "consumable", "raro", "heal", 280, "assets/items/potions/potion_asset_01.png", 65, 95, "Frasco de essência cristalina que restaura a vida com bênçãos antigas."),
    ("pot_asset_02", "Elixir das Sombras Silenciosas", "consumable", "incomum", "buff_atk", 0, "assets/items/potions/potion_asset_02.png", 40, 60, "Destilado sombrio que afia o instinto e concede dano furtivo elevado."),
    ("pot_asset_03", "Tintura de Sangue Vampírico", "consumable", "raro", "lifesteal", 0, "assets/items/potions/potion_asset_03.png", 70, 110, "Infusão rubra que converte ferimentos causados em vigor renovado."),
    ("pot_asset_04", "Bálsamo de Casca de Carvalho", "consumable", "comum", "buff_def", 0, "assets/items/potions/potion_asset_04.png", 25, 40, "Ungüento vegetal que enrijece a pele contra pancadas e cortes."),
    ("pot_asset_05", "Tônico do Peregrino das Cinzas", "consumable", "comum", "energy", 80, "assets/items/potions/potion_asset_05.png", 20, 35, "Bebida aromática revigorante que recupera a resistência corporal."),
    ("pot_asset_06", "Extrato da Noite Carmesim", "consumable", "incomum", "heal", 150, "assets/items/potions/potion_asset_06.png", 35, 55, "Frasco medicinal que cicatriza cortes e estanca hemorragias."),
    ("pot_asset_07", "Néctar do Luar Arcano", "consumable", "epico", "arcane_buff", 0, "assets/items/potions/potion_asset_07.png", 110, 170, "Bebida mágica que amplifica todas as invocações e encantamentos arcanos."),
    ("pot_asset_08", "Óleo de Fogo Primordial", "consumable", "raro", "buff_atk", 0, "assets/items/potions/potion_asset_08.png", 75, 120, "Substância inflamável que incendeia a ponta de flechas e lâminas."),
    ("pot_asset_09", "Filtro de Fúria Titânica", "consumable", "epico", "buff_atk", 0, "assets/items/potions/potion_asset_09.png", 130, 200, "Concentrado denso que desperta a força descomunal dos antigos bárbaros."),
    ("pot_asset_10", "Soro Antipeçonha do Pântano", "consumable", "comum", "cure", 0, "assets/items/potions/potion_asset_10.png", 30, 50, "Mistura de ervas pantaneiras que neutraliza toxinas e ácidos corrosivos."),
    ("pot_asset_11", "Essência de Nevasca Eterna", "consumable", "raro", "buff_def", 0, "assets/items/potions/potion_asset_11.png", 85, 130, "Líquido gélido que envolve o usuário em uma aura congelante protetora."),
    ("pot_asset_12", "Orbe de Vitalidade Sagrada", "consumable", "lendario", "heal", 600, "assets/items/potions/potion_asset_12.png", 250, 400, "Frasco sagrado com a luz do Primeiro Templo. Cura feridas mortais."),
    ("pot_asset_13", "Poção de Velocidade do Vento", "consumable", "incomum", "speed", 0, "assets/items/potions/potion_asset_13.png", 45, 70, "Mistura efervescente que torna os passos leves e velozes."),
    ("pot_asset_14", "Elixir de Precisão Mortal", "consumable", "raro", "crit_buff", 0, "assets/items/potions/potion_asset_14.png", 90, 140, "Aguça os sentidos para detectar pontos vitais em inimigos."),
    ("pot_asset_15", "Licor da Fortaleza de Cinzas", "consumable", "incomum", "buff_def", 0, "assets/items/potions/potion_asset_15.png", 50, 75, "Bebida robusta que confere bônus de resistência contra ataques físicos."),
    ("pot_asset_16", "Frasco de Mana Estelar", "consumable", "epico", "energy", 160, "assets/items/potions/potion_asset_16.png", 140, 210, "Reserva arcana das estrelas que restaura totalmente o fôlego mágico."),
    ("pot_asset_17", "Tintura de Regeneração Rápida", "consumable", "raro", "regen", 0, "assets/items/potions/potion_asset_17.png", 95, 150, "Regenera a vida gradualmente mesmo durante o fervor do combate."),
    ("pot_asset_18", "Bálsamo de Cinza Imortal", "consumable", "lendario", "buff_def", 0, "assets/items/potions/potion_asset_18.png", 280, 450, "Proteção impenetrável das cinzas da fogueira original."),
    ("pot_asset_19", "Elixir de Sangue do Dragão", "consumable", "lendario", "buff_atk", 0, "assets/items/potions/potion_asset_19.png", 320, 500, "O sangue fervente de wyrms ancestrais infundido em vigor marcial."),
    ("pot_asset_20", "Ambrósia Cósmica dos Cinco Selos", "consumable", "supremo", "heal", 1000, "assets/items/potions/potion_asset_20.png", 600, 1000, "O ápice da alquimia divina. Restaura toda a vitalidade e vigor primordial.")
]

# 98 craft materials themes
materials_specs = [
    # Ores (1-15)
    ("Minério de Ferro Cru", "comum", 20, "Minério bruto recolhido de encostas e jazidas montanhosas."),
    ("Minério de Cobre Vulcânico", "comum", 25, "Pedra com veios avermelhados rica em cobre termo-resistente."),
    ("Minério de Estanho das Minas", "comum", 25, "Utilizado por fundidores para balancear ligas de bronze resistente."),
    ("Minério de Prata Pura", "incomum", 40, "Veio argênteo puro muito cobiçado por templos e forjadores."),
    ("Minério de Ouro Fino", "raro", 75, "Nódulos reluzentes de ouro incrustados em quartzo antigo."),
    ("Minério de Platina Sagrada", "raro", 90, "Metal nobre e pesado que canaliza bênçãos com facilidade."),
    ("Minério de Mithril Negro", "epico", 150, "Metal leve como pena e mais resistente que aço temperado."),
    ("Minério de Adamantite Primordial", "epico", 180, "Matéria-prima de dureza incomparável das fossas profundas."),
    ("Minério de Obsidiana do Vácuo", "lendario", 280, "Pedra vulcânica infundida com a escuridão do abismo."),
    ("Minério de Cobalto Arcano", "raro", 85, "Ressoa suavemente na presença de fluxos concentrados de mana."),
    ("Minério de Titânio Celeste", "lendario", 320, "Metal estelar caído dos confins do firmamento cósmico."),
    ("Minério de Oricalco Ancestral", "lendario", 360, "A liga mítica usada pelos primeiros reis das cinzas."),
    ("Minério de Brasa Eterna", "raro", 110, "Pedra incandescente que nunca perde calor mesmo na neve."),
    ("Minério de Gelo Profundo", "incomum", 45, "Rocha congelada que resiste até mesmo ao calor de forjas comuns."),
    ("Minério de Éter Cristalizado", "supremo", 500, "A substância primordial na formação dos cinco selos arcanos."),

    # Ingots & Bars (16-30)
    ("Barra de Ferro Forjado", "comum", 35, "Lingote básico para confecção de lâminas, escudos e cota de malha."),
    ("Barra de Bronze Reforçado", "comum", 40, "Liga pesada excelente para martelos de impacto e protetores."),
    ("Barra de Aço Temperado", "incomum", 60, "Metal duro com tratamento térmico para suportar choques violentos."),
    ("Barra de Prata Consagrada", "incomum", 75, "Lingote prateado abençoado para forjar armas contra mortos-vivos."),
    ("Barra de Ouro Imperial", "raro", 130, "Usada em ornamentos de armas nobres e relicários sagrados."),
    ("Barra de Mithril Pura", "epico", 220, "Brilha com um reflexo azulado de leveza e dureza divinas."),
    ("Barra de Adamantite Negra", "epico", 260, "Forjada sob pressões colossais, virtualmente inquebrável."),
    ("Barra de Obsidiana Lapidada", "lendario", 400, "Absorve feitiços e corta proteções mágicas como navalha."),
    ("Barra de Cobalto Encantado", "raro", 140, "Excelente condutividade arcana para armas de magos e clérigos."),
    ("Barra de Titânio Radiante", "lendario", 450, "Metal celeste forjado nas chamas sagradas de Miraluz."),
    ("Barra de Oricalco Divino", "lendario", 520, "Reconhecida como o ápice da metalurgia dos antigos impérios."),
    ("Barra de Ferro Espectral", "raro", 125, "Infundida com ectoplasma, pesando menos que o ferro comum."),
    ("Barra de Aço Vulcânico", "incomum", 70, "Guarda o calor do magma, deixando o fio da arma incandescente."),
    ("Barra de Prata Furtiva", "raro", 135, "Trabalhada por assassinos para não produzir reflexos nem ruído."),
    ("Lingote Cósmico Supremo", "supremo", 750, "A amálgama definitiva de todos os metais primordiais."),

    # Gems & Crystals (31-50)
    ("Fragmento de Quartzo Claro", "comum", 15, "Cristal básico com ressonância mágica incipiente."),
    ("Ametista da Noite", "incomum", 35, "Pedra roxa com reflexos profundos que canalizam mistério."),
    ("Safira das Profundezas", "incomum", 45, "Gema azul límpida que harmoniza feitiços gélidos e defensivos."),
    ("Rubi Incandescente", "raro", 90, "Pedra ardente que amplifica magias de fogo e fúria guerreira."),
    ("Esmeralda Venenosa", "raro", 85, "Gema verde viva associada a toxinas letais e peçonhas do pântano."),
    ("Topázio Dourado", "incomum", 50, "Reflete o brilho do meio-dia, fortalecendo ataques físicos."),
    ("Diamante Lapidado", "epico", 180, "Prisma de luz pura que refrata energias espirituais e sagradas."),
    ("Ônix do Abismo", "raro", 95, "Pedra escura que drena a luz e potencializa golpes sombrios."),
    ("Opala Espiritual", "raro", 100, "Muda de cor conforme o humor e o estado de espírito do portador."),
    ("Turquesa dos Mares Antigos", "incomum", 40, "Gema suave que concede calma e foco durante emboscadas."),
    ("Granada de Fogo Fátuo", "incomum", 48, "Alimenta faíscas mágicas nos momentos críticos de combate."),
    ("Zircão Espectral", "epico", 170, "Cristal raro que vibra em uníssono com o plano das sombras."),
    ("Pérola Negra Abissal", "epico", 200, "Formada nas entranhas de carapaças das profundezas oceânicas."),
    ("Cristal de Mana Pura", "raro", 120, "Fragmento de alta densidade mágica que acelera conjurações."),
    ("Rubi da Estrela Escarlate", "lendario", 320, "O centro desta pedra possui uma estrela de fogo viva."),
    ("Safira Celestial dos Céus", "lendario", 340, "Gema lendária dos arcanistas reais da torre de Miraluz."),
    ("Esmeralda Primordial", "lendario", 310, "Guarda a essência vegetal das primeiras florestas do mundo."),
    ("Diamante da Luz Suprema", "lendario", 420, "A mais nobre das gemas conhecidas nos anais da humanidade."),
    ("Olho de Dragão Incrustado", "lendario", 460, "Fóssil ocular de ser alado que reluz ao detectar perigo."),
    ("Coração de Ametista Cósmica", "supremo", 680, "A gema definitiva para encantamentos lendários e sagrados."),

    # Monster Trophies & Flora (51-75)
    ("Garra de Lobo Cinzento", "comum", 12, "Extremidade afiada usada para retalhar presas na escuridão."),
    ("Presa de Carniçal do Ermo", "comum", 16, "Dente pontiagudo com resquícios de veneno cadavérico."),
    ("Pele de Rastejador Pantanoso", "comum", 18, "Couro grosso e impermeável ideal para forros de botas."),
    ("Escama de Serpente das Sombras", "incomum", 32, "Superfície acetinada que desliza sem ruído entre a folhagem."),
    ("Olho de Morcego das Cavernas", "comum", 14, "Utilizado por alquimistas para preparar poções de visão noturna."),
    ("Asa de Gárgula de Pedra", "incomum", 38, "Fragmento endurecido que retém peso e rigidez mineral."),
    ("Chifre de Besta Búfala", "incomum", 34, "Ponta reforçada com alta capacidade de absorção de choque."),
    ("Ferrão de Escorpião Rubro", "incomum", 42, "Bolsa venenosa intacta com peçonha paralisante perigosa."),
    ("Carapaça de Besouro Titã", "incomum", 45, "Placa quitinosa muito procurada para reforço de peitorais."),
    ("Tendão de Urso das Cavernas", "incomum", 36, "Corda elástica indispensável para montagem de arcos compostos."),
    ("Crânio de Esqueleto Guerreiro", "comum", 15, "Osso antigo purificado das maldições que o erguiam."),
    ("Ectoplasma Fantasmagórico", "raro", 80, "Resíduo viscoso deixado após banimento de almas penadas."),
    ("Coração de Golem de Pedra", "raro", 95, "Núcleo gravitacional que mantinha as rochas conectadas."),
    ("Glândula de Veneno Cáustico", "raro", 85, "Líquido verde efervescente que corrói madeira e metais comuns."),
    ("Pó de Asa de Fada Noturna", "raro", 75, "Espalha um brilho fosforescente suave nas sombras da floresta."),
    ("Presa de Basilisco do Brejo", "epico", 160, "Dente com petrificação residual em suas ranhuras."),
    ("Pêlo de Licantropo Enfurecido", "epico", 175, "Pelagem densa que concede calor sobrenatural ao tecido."),
    ("Escama de Dragão das Cinzas", "lendario", 320, "Praticamente imune a fogo e cortes de lâminas convencionais."),
    ("Chifre de Quimera Voraz", "epico", 210, "Estrutura óssea espiralada com poder destrutivo nato."),
    ("Cinzas do Guardião Sepultado", "raro", 110, "Poeira mística que restaura fogueiras e forjas arcanas."),
    ("Madeira de Teixo Ancestral", "incomum", 30, "Galho envelhecido que não se parte sob as maiores puxadas."),
    ("Raiz de Mandrágora da Meia-Noite", "incomum", 35, "Planta que emite sibilos ao ser arrancada da terra fértil."),
    ("Lótus de Sangue Escarlate", "raro", 70, "Flor rara que floresce apenas em campos de batalha esquecidos."),
    ("Cogumelo Alucinógeno das Grutas", "comum", 18, "Esporo brilhante que confere sensibilidade espiritual."),
    ("Seiva de Árvore Primordial", "raro", 85, "Adesivo e impermeabilizante divino das florestas sagradas."),

    # Runes, Dusts, Catalysts (76-98)
    ("Pó de Brasa Purificadora", "comum", 22, "Centelhas miúdas recolhidas da pira funerária de Miraluz."),
    ("Essência Arcana Fluida", "incomum", 45, "Líquido cintilante base para todos os encantamentos menores."),
    ("Sal Sagrado dos Templários", "comum", 20, "Mineral consagrado usado para abençoar lâminas e altares."),
    ("Enxofre das Fendas Vulcânicas", "incomum", 35, "Pó amarelo forte que alimenta fogos devastadores."),
    ("Mercúrio Vivo Alquímico", "raro", 90, "Metal líquido que nunca repousa, ligando substâncias opostas."),
    ("Carvão de Carvalho Negro", "comum", 15, "Combustível de queima demorada e limpa para forjamentos finos."),
    ("Runa de Proteção Rústica", "incomum", 55, "Glifo talhado em pedra que dissipa feitiços hostis leves."),
    ("Runa de Afiação Cortante", "incomum", 60, "Aumenta a precisão das pontas e o corte das lâminas."),
    ("Runa de Impacto Titânico", "raro", 115, "Transmite choque concussivo pesado em golpes desferidos."),
    ("Runa de Fogo Solar", "raro", 125, "Incita labaredas ardentes nos projéteis e nos golpes corpo a corpo."),
    ("Runa de Gelo Eterno", "raro", 120, "Retarda os passos de inimigos atingidos por armas encantadas."),
    ("Runa de Veneno Insidioso", "raro", 110, "Contamina ferimentos com toxinas difíceis de estancar."),
    ("Runa de Cura Radiante", "epico", 190, "Canaliza preces celestes diretamente para a armadura do campeão."),
    ("Runa de Agilidade Felina", "incomum", 65, "Acelera as esquivas e o tempo de reação em duelos."),
    ("Runa de Roubo de Sangue", "epico", 210, "Drena a essência vital dos adversários para curar o herói."),
    ("Runa de Penetração Mágica", "epico", 220, "Anula a couraça arcana de magos e guardiões espectrais."),
    ("Runa de Fúria Indomável", "epico", 240, "Multiplica o dano em momentos de vida extremamente baixa."),
    ("Pó Estelar da Aurora", "lendario", 350, "Poeira de cometas canalizada para criar encantamentos imortais."),
    ("Éter Alquímico Concentrado", "lendario", 380, "A base quintessencial dos grandes mestres alquimistas."),
    ("Coração da Chama Primária", "lendario", 480, "Fragmento da labareda que acendeu as primeiras estrelas."),
    ("Selo Cósmico dos Anciões", "lendario", 520, "Símbolo milenar que dobra a potência de qualquer item forjado."),
    ("Orbe do Vácuo Primordial", "supremo", 800, "A substância do espaço infinito antes da criação do mundo."),
    ("Cinza do Primeiro Fogo", "supremo", 1200, "O resíduo sagrado original de Terra das Cinzas. Poder ilimitado.")
]

# Generate items code
items_lines = []

items_lines.append("\n    // ─── POÇÕES E ELIXIRES ALQUÍMICOS (PIXEL ART) ───")
for it in potions_data:
    i_id, name, itype, rarity, subtype, val, img, buy, sell, desc = it
    heal_attr = f', "heal": {val}' if subtype == 'heal' and val > 0 else ''
    energy_attr = f', "energy": {val}' if subtype == 'energy' and val > 0 else ''
    entry = f'    \'{i_id}\': {{"id":"{i_id}","name":"{name}","type":"{itype}","rarity":"{rarity}","subType":"{subtype}"{heal_attr}{energy_attr},"icon":"","iconImg":"{img}","value":{sell},"buyPrice":{buy},"stackable":true,"desc":"{desc}"}},'
    items_lines.append(entry)

items_lines.append("\n    // ─── MATERIAIS DE FORJA, ALQUIMIA & ARTESANATO (PIXEL ART 2K) ───")
for idx, (name, rarity, val, desc) in enumerate(materials_specs):
    mat_id = f"mat_craft_{idx+1:02d}"
    img = f"assets/items/crafting/craft_mat_{idx+1:02d}.png"
    buy = int(val * 1.5)
    entry = f'    \'{mat_id}\': {{"id":"{mat_id}","name":"{name}","type":"material","rarity":"{rarity}","icon":"","iconImg":"{img}","value":{val},"buyPrice":{buy},"stackable":true,"desc":"{desc}"}},'
    items_lines.append(entry)

new_entries_block = "\n".join(items_lines)

# Read InventoryManager.js
with open('terra-das-cinzas/src/systems/inventory/InventoryManager.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate insertion point right before '  };' at the end of ITEM_DATABASE
# Look for 'mat_cristal_mata' entry
target_anchor = "'mat_cristal_mata': { id: 'mat_cristal_mata', name: 'Cristal da Mata Profunda', type: 'material', rarity: 'incomum', icon: '', iconImg: 'assets/items/consumables/gem_diamond.png', value: 50, stackable: true, desc: 'Gema com reflexos esmeralda extraída de veios luminosos.' }"

if target_anchor in content:
    replacement = target_anchor + ",\n" + new_entries_block
    content = content.replace(target_anchor, replacement, 1)
    with open('terra-das-cinzas/src/systems/inventory/InventoryManager.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully updated InventoryManager.js with 20 potions and 98 crafting materials!")
else:
    print("Could not find target anchor in InventoryManager.js!")
