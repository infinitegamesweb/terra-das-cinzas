// tools/generate_all_items.mjs
import fs from 'fs';
import path from 'path';

const rarities = [
  'comum', 'comum', 'comum', 'incomum', 'incomum',
  'incomum', 'raro', 'raro', 'raro', 'raro',
  'epico', 'epico', 'epico', 'epico', 'epico',
  'lendario', 'lendario', 'lendario', 'lendario',
  'supremo'
];
const levels = [1, 3, 7, 11, 15, 18, 22, 26, 30, 34, 38, 44, 50, 54, 60, 68, 76, 84, 92, 105];

function buildEntries(category, prefix, type, icon, classId, basePath, dataList) {
  let str = `    // ─── ${category.toUpperCase()} (20 ITENS PIXEL ART) ───\n`;
  for (let i = 1; i <= 20; i++) {
    const num = String(i).padStart(2, '0');
    const id = `${prefix}_${num}`;
    const rarity = rarities[i - 1];
    const lvl = levels[i - 1];
    const n = dataList[i - 1];
    const img = `${basePath}${num}.png`;
    const fullPath = path.join(process.cwd(), 'public', img);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`File missing on disk: ${fullPath}`);
    }

    const value = Math.round(30 * Math.pow(1.37, i));
    const obj = {
      id,
      name: n.name,
      type,
      rarity,
      level: lvl,
      icon,
      iconImg: img,
      value,
      desc: n.desc
    };
    if (classId) obj.classId = classId;
    Object.assign(obj, n.stats);

    str += `    '${id}': ${JSON.stringify(obj)},\n`;
  }
  return str;
}

// 1. HELMS
const helms = [
  { name: 'Capuz de Couro do Recruta', desc: 'Proteção leve de couro batido para novatos nas trilhas.', stats: { defense: 3, hp: 15 } },
  { name: 'Coifa Acolchoada de Linho', desc: 'Amortece impactos menores contra pedras e bordoadas.', stats: { defense: 5, hp: 25 } },
  { name: 'Elmo Aberto da Guarda', desc: 'Elmo padrão de soldados da antiga muralha de Miraluz.', stats: { defense: 8, hp: 40 } },
  { name: 'Barbuta de Ferro Cinzento', desc: 'Protege mandíbula e crânio mantendo campo visual aberto.', stats: { defense: 11, hp: 55 } },
  { name: 'Elmo Fechado de Batalha', desc: 'Chapa de ferro espessa moldada para choques frontais.', stats: { defense: 14, hp: 75 } },
  { name: 'Elmo com Penacho de Miraluz', desc: 'Insígnia dos veteranos da fortaleza antes da queda.', stats: { defense: 18, hp: 95, crit: 0.02 } },
  { name: 'Capacete de Aço Nobre', desc: 'Aço refinado em dobras contínuas que repele flechas.', stats: { defense: 22, hp: 120, crit: 0.03 } },
  { name: 'Visor Esmeralda do Pântano', desc: 'Tratado com gavinhas pantanosas imunes a corrosão.', stats: { defense: 26, hp: 150, arcane: 15 } },
  { name: 'Elmo de Bronze Rúnico', desc: 'Resplendor dourado com inscrições das criptas antigas.', stats: { defense: 31, hp: 185 } },
  { name: 'Elmo Chifrudo do Guerreiro', desc: 'Chifres de fera entalhados com ferocidade primal.', stats: { defense: 36, hp: 225, crit: 0.04 } },
  { name: 'Elmo do Vigia Noturno', desc: 'Forjado em liga escura que confunde olhares nas sombras.', stats: { defense: 42, hp: 270, crit: 0.05 } },
  { name: 'Coroa de Prata Alada', desc: 'Asas de prata que canalizam bênçãos de proteção pura.', stats: { defense: 48, hp: 320, arcane: 35 } },
  { name: 'Capacete do Cruzado de Ferro', desc: 'Relíquia da ordem que combateu a peste espectral.', stats: { defense: 55, hp: 380 } },
  { name: 'Elmo dos Picos Glaciais', desc: 'Aço gélido imune a geadas e golpes esmagadores.', stats: { defense: 62, hp: 445, defense: 64 } },
  { name: 'Máscara da Caveira Sombria', desc: 'Crânio espectral que aterroriza adversários.', stats: { defense: 70, hp: 520, lifesteal: 0.03 } },
  { name: 'Elmo de Ouro dos Reis Antigos', desc: 'Forjado na era dourada de Miraluz. Majestade pura.', stats: { defense: 80, hp: 600, arcane: 50, crit: 0.06 } },
  { name: 'Elmo de Obsidiana do Abismo', desc: 'Vidro vulcânico que anula maldições e cortes mágicos.', stats: { defense: 92, hp: 700, crit: 0.07 } },
  { name: 'Coroa Espectral de Ametista', desc: 'Gemas flutuantes protegem a mente e amplificam a alma.', stats: { defense: 105, hp: 810, arcane: 85, lifesteal: 0.04 } },
  { name: 'Elmo Alado da Aurora Eterna', desc: 'Emite clarão sagrado que cega demônios na batalha.', stats: { defense: 120, hp: 940, arcane: 70, crit: 0.09 } },
  { name: 'Coroa Cósmica dos Cinco Selos', desc: 'O elmo primordial forjado com o coração das cinzas.', stats: { defense: 140, hp: 1120, arcane: 110, crit: 0.12, lifesteal: 0.06 } }
];

// 2. SHIELDS
const shields = [
  { name: 'Broquel Redondo de Carvalho', desc: 'Leve e ágil para desviar golpes laterais de novatos.', stats: { defense: 5, hp: 20 } },
  { name: 'Tarja de Madeira Reforçada', desc: 'Madeira maciça rebitada com tiras de ferro cru.', stats: { defense: 8, hp: 35 } },
  { name: 'Escudo de Infantaria de Ferro', desc: 'Escudo padrão de ferro forjado dos guardas de vigia.', stats: { defense: 12, hp: 55 } },
  { name: 'Pavês de Patrulha Cinzento', desc: 'Cobre grande parte do corpo contra saraivadas de flechas.', stats: { defense: 16, hp: 80 } },
  { name: 'Escudo de Aço das Muralhas', desc: 'Aço compacto resistente a marretadas e garras.', stats: { defense: 21, hp: 110 } },
  { name: 'Escudo em Pipa de Miraluz', desc: 'Linhas nobres em forma de gota com brasão reluzente.', stats: { defense: 26, hp: 145, defense: 27 } },
  { name: 'Baluarte Protetor de Prata', desc: 'Prata batida que repele o toque de espectros errantes.', stats: { defense: 32, hp: 180, crit: 0.02 } },
  { name: 'Escudo com Gema Esmeralda', desc: 'A gema central pulsa protegendo contra venenos do pântano.', stats: { defense: 38, hp: 220, arcane: 20 } },
  { name: 'Baluarte de Bronze Antigo', desc: 'Esculpido em bronze rúnico retirado das criptas esquecidas.', stats: { defense: 45, hp: 270 } },
  { name: 'Escudo Rúnico do Guardião', desc: 'Glifos gravados desviam projéteis arcanos em combate.', stats: { defense: 52, hp: 325 } },
  { name: 'Escudo do Urso Guerreiro', desc: 'Parrudo e impiedoso, absorve o peso de impactos colossais.', stats: { defense: 60, hp: 390 } },
  { name: 'Escudo com Safira Mística', desc: 'O cristal azul canaliza uma barreira etérea adicional.', stats: { defense: 69, hp: 460, arcane: 40 } },
  { name: 'Pavês do Templo Sagrado', desc: 'Abençoado nas fontes sagradas da cidadela antes da ruína.', stats: { defense: 78, hp: 540, lifesteal: 0.02 } },
  { name: 'Escudo Espinhoso de Sangue', desc: 'Bordas afiadas retalham agressores no momento do bloqueio.', stats: { defense: 88, hp: 620, crit: 0.04 } },
  { name: 'Baluarte da Meia-Noite Eterna', desc: 'Forjado na escuridão mais densa, drenando a força de atacantes.', stats: { defense: 99, hp: 710, lifesteal: 0.04 } },
  { name: 'Égide Dourada do Sol Radiante', desc: 'Irradia luminosidade ardente do meio-dia sobre mortos-vivos.', stats: { defense: 112, hp: 810, arcane: 60 } },
  { name: 'Escudo Negro de Obsidiana', desc: 'Vidro abissal inabalável que resiste a explosões e fogo primordial.', stats: { defense: 126, hp: 920, lifesteal: 0.05 } },
  { name: 'Baluarte de Cristal Ametista', desc: 'Estilhaça energias mágicas inimigas ao menor contato.', stats: { defense: 142, hp: 1040, arcane: 95 } },
  { name: 'Égide Sagrada da Redenção', desc: 'Regenera continuamente o vigor e a couraça de quem o ergue.', stats: { defense: 160, hp: 1180, arcane: 80, lifesteal: 0.06 } },
  { name: 'Baluarte Cósmico dos Cinco Selos', desc: 'Artefato supremo inviolável forjado com as cinco pedras primordiais.', stats: { defense: 188, hp: 1400, arcane: 120, lifesteal: 0.08, crit: 0.08 } }
];

// 3. RINGS
const rings = [
  { name: 'Anel de Cobre Polido', desc: 'Aro simples que canaliza um leve fluxo de vigor.', stats: { hp: 20, defense: 2 } },
  { name: 'Selo de Bronze do Recruta', desc: 'Usado como marca de identificação dos batedores.', stats: { hp: 35, damage: 3 } },
  { name: 'Anel de Ferro Forjado', desc: 'Resistente e austero, confere firmeza às mãos.', stats: { hp: 50, defense: 5 } },
  { name: 'Anel do Falcão Veloz', desc: 'Aumenta a precisão do usuário ao avistar brechas.', stats: { crit: 0.03, damage: 6 } },
  { name: 'Anel da Guarda Nobre', desc: 'Insignia de aço purificado com rebites polidos.', stats: { hp: 75, defense: 8 } },
  { name: 'Anel de Prata Lunar', desc: 'Reflete o brilho sereno da noite, acalmando o pulso.', stats: { arcane: 15, hp: 95, crit: 0.04 } },
  { name: 'Selo do Caçador Furtivo', desc: 'Permite desferir golpes letais com precisão cirúrgica.', stats: { damage: 10, crit: 0.06 } },
  { name: 'Anel de Esmeralda do Pântano', desc: 'Purifica toxinas e estabiliza o fluxo vital.', stats: { hp: 140, defense: 12, arcane: 20 } },
  { name: 'Aliança de Ouro Velho', desc: 'Relíquia de uma família nobre soterrada pelas cinzas.', stats: { hp: 170, defense: 15, damage: 12 } },
  { name: 'Anel Rúnico da Força', desc: 'Inscrições que amplificam a tensão muscular em combate.', stats: { damage: 16, hp: 200, crit: 0.05 } },
  { name: 'Selo do Vigia Silencioso', desc: 'Anel escuro que camufla os batimentos cardíacos.', stats: { crit: 0.08, damage: 20, lifesteal: 0.02 } },
  { name: 'Anel com Safira Estelar', desc: 'Resplendor azul que potencializa feitiços e ataques.', stats: { arcane: 45, damage: 24, hp: 240 } },
  { name: 'Aliança do Cruzado Fiel', desc: 'Forjada em prata sagrada para purificar a terra.', stats: { defense: 24, hp: 290, lifesteal: 0.03 } },
  { name: 'Anel dos Mares Glaciais', desc: 'Frio extremo condensado em um aro impenetrável.', stats: { defense: 28, hp: 350, crit: 0.07 } },
  { name: 'Selo da Meia-Noite Eterna', desc: 'Drena a essência dos inimigos golpeados na escuridão.', stats: { damage: 32, lifesteal: 0.05, crit: 0.08 } },
  { name: 'Anel do Sol Radiante', desc: 'Emite o calor fulgurante do meio-dia em suas veias.', stats: { damage: 40, arcane: 65, crit: 0.09, defense: 25 } },
  { name: 'Anel de Obsidiana do Abismo', desc: 'Vidro negro que consome parte do dano recebido.', stats: { damage: 48, defense: 34, hp: 480, lifesteal: 0.06 } },
  { name: 'Selo Espectral de Ametista', desc: 'Ressonância mágica cristalina de altíssima pureza.', stats: { arcane: 100, damage: 55, hp: 560, crit: 0.10 } },
  { name: 'Aliança Sagrada da Aurora', desc: 'Bênção contínua que restaura vigor e poder a cada golpe.', stats: { damage: 65, defense: 42, arcane: 85, lifesteal: 0.07, crit: 0.11 } },
  { name: 'Aliança Cósmica dos Cinco Selos', desc: 'O anel dos monarcas ancestrais que governaram as cinzas.', stats: { damage: 85, defense: 55, arcane: 130, hp: 800, crit: 0.15, lifesteal: 0.09 } }
];

// 4. AMULETS
const amulets = [
  { name: 'Pingente de Quartzo Bruto', desc: 'Pedra de rio polida que ancora a mente sob estresse.', stats: { hp: 25, defense: 2 } },
  { name: 'Talismã de Dente de Lobo', desc: 'Símbolo primal de predador que aguça os sentidos.', stats: { damage: 4, crit: 0.02 } },
  { name: 'Amuleto de Bronze da Trilha', desc: 'Garante firmeza aos passos nas encostas escorregadias.', stats: { hp: 45, defense: 4 } },
  { name: 'Colar de Contas de Ferro', desc: 'Pequenas esferas de ferro que desviam agouros.', stats: { hp: 65, defense: 6, damage: 5 } },
  { name: 'Talismã do Guerreiro Vigilante', desc: 'Gravado com o estandarte que guardava o Castelo em Cinzas.', stats: { hp: 90, damage: 8, crit: 0.03 } },
  { name: 'Medalhão de Prata Abençoada', desc: 'Prata pura que ferve em contato com espíritos malignos.', stats: { arcane: 20, hp: 115, defense: 9 } },
  { name: 'Gargantilha da Raposa Astuta', desc: 'Concede reflexos instantâneos para esquivar e contra-atacar.', stats: { crit: 0.07, damage: 12 } },
  { name: 'Amuleto de Esmeralda do Pântano', desc: 'Protege os pulmões e o sangue de miasmas putrefatos.', stats: { hp: 160, defense: 14, arcane: 25 } },
  { name: 'Colar de Brasas Incandescentes', desc: 'Pedras vulcânicas que nunca deixam o corpo esfriar.', stats: { damage: 16, hp: 195, crit: 0.05 } },
  { name: 'Talismã Rúnico dos Titãs', desc: 'Inscrições ancestrais que expandem a constituição física.', stats: { hp: 240, defense: 18, damage: 18 } },
  { name: 'Medalhão da Vigília Sombria', desc: 'Aumenta a letalidade de quem espreita nas trevas.', stats: { damage: 24, crit: 0.09, lifesteal: 0.03 } },
  { name: 'Gota de Safira do Céu', desc: 'Cristal translúcido com o reflexo de um céu sem cinzas.', stats: { arcane: 55, hp: 290, damage: 28 } },
  { name: 'Relicário de Prata da Capela', desc: 'Contém pó dos mártires de Miraluz. Cura milagrosa.', stats: { hp: 360, defense: 26, lifesteal: 0.04 } },
  { name: 'Pingente do Coração de Gelo', desc: 'Congela a dor e retarda a fadiga nos combates.', stats: { defense: 32, hp: 430, crit: 0.08 } },
  { name: 'Talismã da Meia-Noite Abissal', desc: 'Um olho esculpido em ônix que suga a luz ao redor.', stats: { damage: 36, crit: 0.10, lifesteal: 0.05 } },
  { name: 'Coração Solar dos Reis', desc: 'Irradia o calor das antigas dinastias da luz eterna.', stats: { damage: 46, arcane: 75, hp: 550, crit: 0.10 } },
  { name: 'Gargantilha de Obsidiana Negra', desc: 'Forjada nas entranhas do vulcão. Drena o vigor dos alvos.', stats: { damage: 56, defense: 38, lifesteal: 0.07, hp: 640 } },
  { name: 'Lágrima Espectral de Ametista', desc: 'Converte a dor sofrida em pura energia cósmica retaliadora.', stats: { arcane: 110, damage: 64, hp: 740, crit: 0.12 } },
  { name: 'Colar Sagrado da Aurora Divina', desc: 'O toque dourado dos serafins que restaura exércitos caídos.', stats: { damage: 76, defense: 46, arcane: 95, lifesteal: 0.08, hp: 860 } },
  { name: 'Lágrima Cósmica dos Cinco Selos', desc: 'O artefato místico supremo que uniu os cinco elementos do mundo.', stats: { damage: 98, defense: 58, arcane: 145, hp: 1100, crit: 0.16, lifesteal: 0.10 } }
];

// 5. BOWS (ARCHER)
const bows = [
  { name: 'Arco Curto do Aprendiz', desc: 'Feito de freixo flexível, ideal para aprender a puxada.', stats: { damage: 14, range: 25, crit: 0.04 } },
  { name: 'Arco de Caça das Colinas', desc: 'Corda reforçada em tendão que amplia a velocidade da flecha.', stats: { damage: 17, range: 28, crit: 0.05 } },
  { name: 'Arco Longo da Guarda', desc: 'Excelente alcance para patrulhas nas ameias e torres.', stats: { damage: 23, range: 35, crit: 0.06 } },
  { name: 'Arco Composto de Chifre', desc: 'Lâminas curvas de chifre animal aumentam o poder de tração.', stats: { damage: 30, range: 40, crit: 0.07 } },
  { name: 'Arco de Guerra dos Batedores', desc: 'Dispara virotes pesados capazes de perfurar brigantinas.', stats: { damage: 38, range: 45, crit: 0.08 } },
  { name: 'Arco das Brisas de Miraluz', desc: 'A madeira encantada silencia o voo de cada projétil.', stats: { damage: 45, range: 50, crit: 0.09 } },
  { name: 'Arco Nobre de Teixo Negro', desc: 'Madeira escura centenária com tração impecável e letal.', stats: { damage: 52, range: 55, crit: 0.11 } },
  { name: 'Arco Esmeralda do Pântano', desc: 'Dispara flechas com seiva cáustica que corrói armaduras.', stats: { damage: 61, range: 60, crit: 0.12, arcane: 20 } },
  { name: 'Arco Rúnico de Bronze', desc: 'Gravações ancestrais que guiam o virote aos pontos vitais.', stats: { damage: 70, range: 65, crit: 0.13 } },
  { name: 'Arco do Caçador dos Bosques', desc: 'Camuflado e letal, seus disparos nunca alertam a presa.', stats: { damage: 78, range: 70, crit: 0.14 } },
  { name: 'Arco do Vento Cortante', desc: 'Flechas cortam o ar gerando vórtices perfurantes.', stats: { damage: 88, range: 75, crit: 0.15 } },
  { name: 'Arco com Safira Celeste', desc: 'Gema no punho infunde cada tiro com faíscas congelantes.', stats: { damage: 100, range: 80, crit: 0.16, arcane: 40 } },
  { name: 'Arco Sagrado do Sentinela', desc: 'Banhado em orvalhos santos para expurgar espíritos errantes.', stats: { damage: 112, range: 85, crit: 0.17, hp: 80 } },
  { name: 'Arco da Nevasca Eterna', desc: 'Resfria o sangue dos alvos diminuindo sua velocidade.', stats: { damage: 125, range: 90, crit: 0.18 } },
  { name: 'Arco da Noite Sombria', desc: 'Flechas pretas imperceptíveis que dissolvem em veneno puro.', stats: { damage: 138, range: 95, crit: 0.20, lifesteal: 0.04 } },
  { name: 'Olho Solar do Falcão Dourado', desc: 'Flechas incandescentes que ardem como o zênite do sol.', stats: { damage: 162, range: 100, crit: 0.21, arcane: 55 } },
  { name: 'Arco de Obsidiana do Abismo', desc: 'Material alienígena que projeta flechas de sombra pura.', stats: { damage: 185, range: 105, crit: 0.23, lifesteal: 0.06 } },
  { name: 'Arco Espectral de Ametista', desc: 'Corda feita de luz mágica que não necessita de aljava física.', stats: { damage: 208, range: 110, crit: 0.24, arcane: 85 } },
  { name: 'Arco Alado da Aurora Divina', desc: 'Saraivadas celestes que aniquilam exércitos das trevas.', stats: { damage: 235, range: 115, crit: 0.26, arcane: 70 } },
  { name: 'Arco Cósmico dos Cinco Selos', desc: 'A arma suprema do Caçador Estelar. Suas flechas rompem dimensões.', stats: { damage: 300, range: 125, crit: 0.30, arcane: 110, lifesteal: 0.08 } }
];

// 6. AXES (BARBARIAN)
const axes = [
  { name: 'Machadinha de Lenhador', desc: 'Ferramenta rústica usada com fúria brutal pelos novatos.', stats: { damage: 15, hp: 20, crit: 0.03 } },
  { name: 'Machado de Ferro das Colinas', desc: 'Lâmina chanfrada que racha couros com ferocidade.', stats: { damage: 19, hp: 35, crit: 0.04 } },
  { name: 'Machado de Batalha da Vanguarda', desc: 'Arma pesada de choque usada para arrombar portas e escudos.', stats: { damage: 25, hp: 55, defense: 4 } },
  { name: 'Machado Bipene do Carrasco', desc: 'Duas lâminas simétricas que cortam em ambos os sentidos.', stats: { damage: 33, hp: 75, crit: 0.05 } },
  { name: 'Quebra-Couraças de Ferro Puro', desc: 'Massa metálica frontal feita para entortar armaduras.', stats: { damage: 41, hp: 100, defense: 6 } },
  { name: 'Machado de Guerra de Miraluz', desc: 'Empunhadura longa de freixo reforçada com tiras de aço.', stats: { damage: 49, hp: 130, crit: 0.06 } },
  { name: 'Bipene de Aço Forjado', desc: 'Balanceamento formidável para redemoinhos destruidores.', stats: { damage: 56, hp: 165, crit: 0.07 } },
  { name: 'Machado Esmeralda do Pântano', desc: 'Fende monstros pantanosos com corte limpo e implacável.', stats: { damage: 66, hp: 205, defense: 10 } },
  { name: 'Machado Rúnico de Bronze', desc: 'Antiga lâmina das catacumbas com peso avassalador.', stats: { damage: 75, hp: 250, crit: 0.08 } },
  { name: 'Machado dos Picos Selvagens', desc: 'Entalhado com garras de urso para sangramento contínuo.', stats: { damage: 85, hp: 300, crit: 0.09, lifesteal: 0.03 } },
  { name: 'Machado da Fúria Berserker', desc: 'Aumenta a adrenalina do guerreiro a cada golpe acertado.', stats: { damage: 96, hp: 355, crit: 0.10 } },
  { name: 'Machado com Safira Mística', desc: 'As ondas de choque congelam o solo após cada machadada.', stats: { damage: 108, hp: 415, arcane: 35, defense: 12 } },
  { name: 'Bipene da Ordem Sagrada', desc: 'Pesada e sagrada, pulveriza esqueletos em poeira branca.', stats: { damage: 120, hp: 480, lifesteal: 0.04 } },
  { name: 'Fendendor dos Picos Glaciais', desc: 'Aço gélido colossal capaz de abrir valas no gelo eterno.', stats: { damage: 133, hp: 550, defense: 16 } },
  { name: 'Machado da Meia-Noite Devoradora', desc: 'Alimenta-se do sangue fresco derramado no campo de batalha.', stats: { damage: 148, hp: 630, lifesteal: 0.06, crit: 0.11 } },
  { name: 'Machado Solar dos Reis Bárbaros', desc: 'Chamas douradas envolvem o corte a cada giro de fúria.', stats: { damage: 172, hp: 730, arcane: 50, crit: 0.12 } },
  { name: 'Machado de Obsidiana do Cataclismo', desc: 'Racha a rocha sólida e desintegra escudos inimigos.', stats: { damage: 196, hp: 840, lifesteal: 0.08, defense: 20 } },
  { name: 'Bipene Espectral de Ametista', desc: 'Ressonância sísmica que estilhaça defesas e barreiras.', stats: { damage: 220, hp: 960, arcane: 75, crit: 0.14 } },
  { name: 'Machado Sagrado da Aurora Radiante', desc: 'O poder de um titã celeste em cada impacto no solo.', stats: { damage: 248, hp: 1100, arcane: 65, lifesteal: 0.08 } },
  { name: 'Colosso Cósmico dos Cinco Selos', desc: 'O machado primordial que rachou os continentes no Primeiro Fogo.', stats: { damage: 320, hp: 1400, crit: 0.18, lifesteal: 0.12, defense: 30 } }
];

// 7. MACES (CLERIC)
const maces = [
  { name: 'Porrete de Madeira das Trilhas', desc: 'Clava rústica reforçada com pregos de ferro.', stats: { damage: 13, arcane: 15, hp: 15 } },
  { name: 'Maça de Ferro do Noviço', desc: 'Cabeça esférica com nervuras para dissipar mortos-vivos.', stats: { damage: 16, arcane: 20, hp: 25 } },
  { name: 'Cetro de Vigia da Capela', desc: 'Simples e austero, canaliza preces de cura e punição.', stats: { damage: 22, arcane: 30, hp: 40 } },
  { name: 'Maça Flangeada de Aço', desc: 'Lâminas radiais que amassam couraças com facilidade.', stats: { damage: 28, arcane: 40, defense: 5 } },
  { name: 'Cetro dos Penitentes', desc: 'Usado pelos sacerdotes guerreiros para purificar ruínas.', stats: { damage: 35, arcane: 52, hp: 70 } },
  { name: 'Maça Estrela de Miraluz', desc: 'Pontas de ferro piramidais abençoadas com sal sagrado.', stats: { damage: 42, arcane: 65, defense: 8 } },
  { name: 'Cetro de Prata da Salvação', desc: 'Prata trabalhada que regenera o vigor de quem o segura.', stats: { damage: 49, arcane: 80, hp: 105, lifesteal: 0.03 } },
  { name: 'Maça Esmeralda do Pântano', desc: 'Cravejada com gema verde que anula venenos e podridão.', stats: { damage: 57, arcane: 95, defense: 11 } },
  { name: 'Cetro Rúnico das Criptas', desc: 'Recuperado de sarcófagos reais. Afasta sombras errantes.', stats: { damage: 65, arcane: 110, hp: 145 } },
  { name: 'Maça da Fé Inabalável', desc: 'Impactos ressoam como sinos divinos expulsando demônios.', stats: { damage: 74, arcane: 130, defense: 14 } },
  { name: 'Martelo Sagrado do Templo', desc: 'O martelo ritual dos antigos bispos guerreiros da fortaleza.', stats: { damage: 84, arcane: 150, hp: 190, defense: 16 } },
  { name: 'Cetro com Safira da Fé', desc: 'Pura luz azul que renova continuamente as forças divinas.', stats: { damage: 95, arcane: 175, hp: 240 } },
  { name: 'Maça Alada dos Serafins', desc: 'Asas de prata na guarda que acolhem preces em combate.', stats: { damage: 106, arcane: 200, lifesteal: 0.04, defense: 19 } },
  { name: 'Cetro das Fontes Glaciais', desc: 'Congela a ferocidade de carniceiros e monstros selvagens.', stats: { damage: 118, arcane: 230, hp: 300 } },
  { name: 'Maça da Meia-Noite Purificadora', desc: 'Penetra a escuridão trazendo o resplendor da graça.', stats: { damage: 131, arcane: 260, defense: 22, lifesteal: 0.05 } },
  { name: 'Cetro Solar da Alvorada Divina', desc: 'Irradia o poder dos santos reis sobre hordas profanas.', stats: { damage: 152, arcane: 310, hp: 420, defense: 26 } },
  { name: 'Maça de Obsidiana Consagrada', desc: 'A rocha negra purificada pelo fogo sagrado nunca racha.', stats: { damage: 174, arcane: 360, defense: 30, lifesteal: 0.06 } },
  { name: 'Cetro Espectral de Ametista', desc: 'Canaliza correntes infinitas de mana divina curativa.', stats: { damage: 195, arcane: 420, hp: 550, crit: 0.08 } },
  { name: 'Maça Alada da Redenção Suprema', desc: 'Concede imunidade espiritual e vitalidade radiante.', stats: { damage: 220, arcane: 490, hp: 680, lifesteal: 0.08, defense: 35 } },
  { name: 'Cetro Cósmico dos Cinco Selos', desc: 'O cetro celestial do Primeiro Sumo-Sacerdote de Miraluz.', stats: { damage: 285, arcane: 620, hp: 900, defense: 45, lifesteal: 0.10 } }
];

// 8. DAGGERS (ASSASSIN)
const daggers = [
  { name: 'Adaga de Caça do Aprendiz', desc: 'Lâmina fina de ferro cru para cortes rápidos.', stats: { damage: 12, crit: 0.08 } },
  { name: 'Estilete das Sombras', desc: 'Ponta triangular que penetra frestas com extrema facilidade.', stats: { damage: 15, crit: 0.10 } },
  { name: 'Adaga Curva de Batedor', desc: 'Corte curvo que provoca sangramento em golpes surpresa.', stats: { damage: 20, crit: 0.11 } },
  { name: 'Par de Facas da Vigília', desc: 'Balanceadas tanto para combate cerrado quanto para arremesso.', stats: { damage: 26, crit: 0.12 } },
  { name: 'Kukri do Emboscador', desc: 'Lâmina pesada na ponta com impacto brutal no pescoço.', stats: { damage: 33, crit: 0.13, lifesteal: 0.02 } },
  { name: 'Adaga Furtiva de Miraluz', desc: 'Não reflete luz alguma, sumindo completamente nas sombras.', stats: { damage: 40, crit: 0.14 } },
  { name: 'Estilete de Aço Refinado', desc: 'Perfurador formidável capaz de ignorar armaduras leves.', stats: { damage: 47, crit: 0.15 } },
  { name: 'Presa Esmeralda do Pântano', desc: 'Banhada em peçonha de víboras ancestrais do lodo.', stats: { damage: 55, crit: 0.16, arcane: 15 } },
  { name: 'Adaga Rúnica de Bronze', desc: 'Resplende em tons antigos com veneno adormecido na lâmina.', stats: { damage: 63, crit: 0.17 } },
  { name: 'Garra das Sombras Mortais', desc: 'Desfere sequências fulminantes nos pontos vitais do alvo.', stats: { damage: 71, crit: 0.18, lifesteal: 0.03 } },
  { name: 'Adaga da Dança Noturna', desc: 'Gira entre os dedos como uma ilusão antes do golpe fatal.', stats: { damage: 80, crit: 0.20 } },
  { name: 'Estilete com Safira Oculta', desc: 'O frio da gema anestesia a vítima enquanto o sangue escorre.', stats: { damage: 91, crit: 0.21, arcane: 30 } },
  { name: 'Lâmina de Prata do Carrasco', desc: 'Prata temperada para silenciar criaturas corrompidas.', stats: { damage: 102, crit: 0.22, lifesteal: 0.04 } },
  { name: 'Presa Glacial do Vento Frio', desc: 'Solidifica os vasos sanguíneos no instante da estocada.', stats: { damage: 114, crit: 0.23 } },
  { name: 'Adaga da Meia-Noite Eterna', desc: 'Fusão perfeita com a escuridão. O golpe nunca é visto.', stats: { damage: 127, crit: 0.25, lifesteal: 0.06 } },
  { name: 'Presa Solar do Escorpião Dourado', desc: 'Queima as entranhas do inimigo com veneno incandescente.', stats: { damage: 148, crit: 0.26, arcane: 45 } },
  { name: 'Adaga de Obsidiana do Vácuo', desc: 'Corta o próprio tecido do espaço para atingir o coração.', stats: { damage: 170, crit: 0.28, lifesteal: 0.08 } },
  { name: 'Estilete Espectral de Ametista', desc: 'Ignora barreiras arcanas e devora a mana de feiticeiros.', stats: { damage: 192, crit: 0.29, arcane: 65 } },
  { name: 'Lâmina Alada da Névoa Sagrada', desc: 'Execuções cirúrgicas de velocidade transcendente.', stats: { damage: 216, crit: 0.31, lifesteal: 0.08 } },
  { name: 'Adagas Cósmicas dos Cinco Selos', desc: 'O par supremo das sombras primordiais. Cada corte extingue uma vida.', stats: { damage: 280, crit: 0.35, lifesteal: 0.12, arcane: 80 } }
];

// 9. STAVES (MAGE)
const staves = [
  { name: 'Cajado de Madeira Rústica', desc: 'Galho entalhado para focar as primeiras faíscas mágicas.', stats: { damage: 14, arcane: 22 } },
  { name: 'Vara de Aprendiz Arcano', desc: 'Cobre polido na ponta para conduzir feitiços básicos.', stats: { damage: 17, arcane: 28 } },
  { name: 'Cajado com Orbe de Vidro', desc: 'A esfera canaliza feixes luminosos com boa precisão.', stats: { damage: 23, arcane: 40 } },
  { name: 'Báculo de Bétula Encantada', desc: 'Madeira que absorveu partículas de mana das florestas.', stats: { damage: 30, arcane: 55 } },
  { name: 'Cajado Rúnico de Cinzas', desc: 'Gravado com as fórmulas antigas da biblioteca de Miraluz.', stats: { damage: 38, arcane: 72 } },
  { name: 'Grimório e Foco de Miraluz', desc: 'Páginas perdidas da torre arcana que expandem feitiços.', stats: { damage: 45, arcane: 90, crit: 0.04 } },
  { name: 'Cajado de Aço e Cristal', desc: 'Estrutura metálica com prisma que refrata raios mágicos.', stats: { damage: 52, arcane: 110, crit: 0.05 } },
  { name: 'Báculo Esmeralda do Pântano', desc: 'Canaliza correntes cáusticas e miasmas venenosos arcanos.', stats: { damage: 62, arcane: 135, hp: 60 } },
  { name: 'Cajado de Bronze das Criptas', desc: 'Extraído dos túmulos dos arquimagos da antiga dinastia.', stats: { damage: 72, arcane: 160 } },
  { name: 'Cetro dos Elementos Primordiais', desc: 'Combina calor, gelo e relâmpago em um vórtice instável.', stats: { damage: 82, arcane: 190, crit: 0.06 } },
  { name: 'Báculo do Arquivista Sepultado', desc: 'Guarda o conhecimento proibido de feitiços de destruição.', stats: { damage: 93, arcane: 225, crit: 0.07 } },
  { name: 'Cajado com Safira Abissal', desc: 'Pulsos de gelo cósmico que congelam o ar ao redor.', stats: { damage: 106, arcane: 265 } },
  { name: 'Cetro da Luz Celestial', desc: 'Raios purificadores que incineram demônios e espectros.', stats: { damage: 120, arcane: 310, hp: 100 } },
  { name: 'Báculo das Nevascas Eternas', desc: 'Invoca tempestades de granizo afiado em larga escala.', stats: { damage: 135, arcane: 360, crit: 0.08 } },
  { name: 'Cajado da Meia-Noite Espectral', desc: 'Canaliza necromancia pura e drena a mana inimiga.', stats: { damage: 150, arcane: 420, lifesteal: 0.04 } },
  { name: 'Singularidade Solar dos Reis', desc: 'Miniatura de uma estrela ardente flutua sobre o topo.', stats: { damage: 175, arcane: 500, crit: 0.10 } },
  { name: 'Cetro de Obsidiana do Apocalipse', desc: 'Funde o solo em magma e conjura meteoros devastadores.', stats: { damage: 202, arcane: 590, lifesteal: 0.05 } },
  { name: 'Báculo Cósmico de Ametista', desc: 'Abre portais infinitesimais para o vácuo infinito.', stats: { damage: 230, arcane: 690, crit: 0.12 } },
  { name: 'Cajado Alado da Aurora Suprema', desc: 'A emanação de luz divina absoluta que restaura o mundo.', stats: { damage: 260, arcane: 800, hp: 200, crit: 0.14 } },
  { name: 'Cajado Cósmico dos Cinco Selos', desc: 'O artefato arcano supremo que governa o Primeiro Fogo.', stats: { damage: 340, arcane: 1050, crit: 0.18, lifesteal: 0.08, hp: 300 } }
];

console.log('Generating code for InventoryManager.js...');
const helmsCode = buildEntries('Elmos (Helms)', 'hl_hero', 'helm', '🪖', null, 'assets/items/armor/helms/helm_hero_', helms);
const shieldsCode = buildEntries('Escudos (Shields)', 'sh_hero', 'shield', '🛡', null, 'assets/items/armor/shields/shield_hero_', shields);
const ringsCode = buildEntries('Anéis (Rings)', 'acc_ring_hero', 'ring', '💍', null, 'assets/items/accessories/rings/ring_hero_', rings);
const amuletsCode = buildEntries('Amuletos (Amulets)', 'acc_amulet_hero', 'amulet', '📿', null, 'assets/items/accessories/amulets/amulet_hero_', amulets);
const bowsCode = buildEntries('Arcos (Archer)', 'w_bow_hero', 'weapon', '🏹', 'arqueiro', 'assets/items/weapons/bows/bow_hero_', bows);
const axesCode = buildEntries('Machados (Barbarian)', 'w_axe_hero', 'weapon', '🪓', 'barbaro', 'assets/items/weapons/axes/axe_hero_', axes);
const macesCode = buildEntries('Maças e Cetros (Cleric)', 'w_mace_hero', 'weapon', '✚', 'clerigo', 'assets/items/weapons/maces/mace_hero_', maces);
const daggersCode = buildEntries('Adagas e Lâminas (Assassin)', 'w_dagger_hero', 'weapon', '🗡', 'assasino', 'assets/items/weapons/daggers/dagger_hero_', daggers);
const stavesCode = buildEntries('Cajados e Báculos (Mage)', 'w_staff_hero', 'weapon', '✦', 'mago', 'assets/items/weapons/staves/mage_asset_', staves);

const fullGeneratedChunk = [
  helmsCode,
  shieldsCode,
  ringsCode,
  amuletsCode,
  bowsCode,
  axesCode,
  macesCode,
  daggersCode,
  stavesCode
].join('\n');

fs.writeFileSync('tools/generated_items_block.js', fullGeneratedChunk, 'utf8');
console.log('generated_items_block.js successfully written! Total size:', fullGeneratedChunk.length, 'bytes');
