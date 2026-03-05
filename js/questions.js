/**
 * QUESTIONS.JS — HERODOTO v7.17
 * Painel de "Perguntas Geradoras": 20 questões históricas curadas
 * que selecionam datasets relevantes e renderizam o grafo automaticamente.
 *
 * Fluxo:
 *   1. Usuário clica em uma pergunta
 *   2. Todos os checkboxes são desmarcados
 *   3. Os datasets da pergunta são marcados
 *   4. window.aplicarFiltros() é chamado
 *   5. Painel fecha
 *   6. Se a pergunta tem um nó focal, abre cadeia de consequências
 */

// ── Dados das perguntas ───────────────────────────

const PERGUNTAS = [
  {
    grupo: { pt: 'Origens e Pré-História', en: 'Origins and Prehistory', es: 'Orígenes y Prehistoria' },
    itens: [
      {
        id: 'q-escrita',
        texto: { pt: 'Como a escrita surgiu?', en: 'How did writing emerge?', es: '¿Cómo surgió la escritura?' },
        desc:  { pt: 'Da contabilidade suméria aos hieróglifos — os primeiros sistemas de registro da humanidade.',
                 en: 'From Sumerian accounting to hieroglyphs — humanity\'s first recording systems.',
                 es: 'De la contabilidad sumeria a los jeroglíficos — los primeros sistemas de registro.' },
        datasets: ['data/dados-sumeria-cidades.json','data/dados-sumeria.json','data/dados-egito-antigo.json','data/dados-mesopotamia.json'],
      },
      {
        id: 'q-americas',
        texto: { pt: 'Como os humanos chegaram às Américas?', en: 'How did humans reach the Americas?', es: '¿Cómo llegaron los humanos a las Américas?' },
        desc:  { pt: 'Da travessia do Estreito de Bering às primeiras civilizações andinas e mesoamericanas.',
                 en: 'From the Bering Strait crossing to the first Andean and Mesoamerican civilizations.',
                 es: 'Del estrecho de Bering a las primeras civilizaciones andinas y mesoamericanas.' },
        datasets: ['data/dados-pre-historia.json','data/dados-pre-historia-paleolitico.json','data/dados-povos-nativos-norte.json','data/dados-olmecas.json','data/dados-caral-culturas-antigas.json'],
      },
      {
        id: 'q-neolitico',
        texto: { pt: 'O que foi a Revolução Neolítica?', en: 'What was the Neolithic Revolution?', es: '¿Qué fue la Revolución Neolítica?' },
        desc:  { pt: 'A transição da caça e coleta para a agricultura — a mudança que tornou a civilização possível.',
                 en: 'The transition from hunting and gathering to farming — the change that made civilization possible.',
                 es: 'La transición de la caza-recolección a la agricultura — el cambio que hizo posible la civilización.' },
        datasets: ['data/dados-pre-historia.json','data/dados-pre-historia-paleolitico.json','data/dados-pre-historia-europa.json','data/dados-sumeria-cidades.json'],
      },
    ],
  },
  {
    grupo: { pt: 'Grandes Impérios', en: 'Great Empires', es: 'Grandes Imperios' },
    itens: [
      {
        id: 'q-roma',
        texto: { pt: 'O que causou a queda de Roma?', en: 'What caused the fall of Rome?', es: '¿Qué causó la caída de Roma?' },
        desc:  { pt: 'Invasões bárbaras, instabilidade política, crise econômica — ou algo mais profundo?',
                 en: 'Barbarian invasions, political instability, economic crisis — or something deeper?',
                 es: 'Invasiones bárbaras, inestabilidad política, crisis económica — ¿o algo más profundo?' },
        datasets: ['data/dados-queda-roma.json','data/dados-roma-imperial.json','data/dados-roma-exercito.json','data/dados-medieval-feudalismo.json','data/dados-bizantino-medieval.json'],
      },
      {
        id: 'q-alexandre',
        texto: { pt: 'O que Alexandre o Grande realmente conquistou?', en: 'What did Alexander the Great really conquer?', es: '¿Qué conquistó realmente Alejandro Magno?' },
        desc:  { pt: 'Da Macedônia à Índia em 13 anos — e a fusão cultural greco-persa que mudou o mundo antigo.',
                 en: 'From Macedonia to India in 13 years — and the Greco-Persian cultural fusion that changed the ancient world.',
                 es: 'De Macedonia a India en 13 años — y la fusión cultural greco-persa que cambió el mundo antiguo.' },
        datasets: ['data/dados-grecia-alexandre.json','data/dados-persia.json','data/dados-india-antiga.json','data/dados-grecia-guerras.json'],
      },
      {
        id: 'q-mongois',
        texto: { pt: 'Por que os Mongóis foram tão devastadores?', en: 'Why were the Mongols so devastating?', es: '¿Por qué los mongoles fueron tan devastadores?' },
        desc:  { pt: 'O maior império contínuo da história — e como destruíram Bagdá, a maior cidade do mundo islâmico.',
                 en: 'The largest contiguous empire in history — and how they destroyed Baghdad, the largest city in the Islamic world.',
                 es: 'El mayor imperio continuo de la historia — y cómo destruyeron Bagdad, la mayor ciudad del mundo islámico.' },
        datasets: ['data/dados-mongois-gengis.json','data/dados-mongois-conquistas.json','data/dados-isla-fragmentacao.json','data/dados-china-song-yuan.json'],
      },
      {
        id: 'q-sec15',
        texto: { pt: 'Que impérios coexistiam no século XV?', en: 'Which empires coexisted in the 15th century?', es: '¿Qué imperios coexistían en el siglo XV?' },
        desc:  { pt: 'Ming na China, Otomanos em Istambul, Astecas no México, Incas nos Andes — um século de impérios simultâneos.',
                 en: 'Ming in China, Ottomans in Istanbul, Aztecs in Mexico, Incas in the Andes — a century of simultaneous empires.',
                 es: 'Ming en China, Otomanos en Estambul, Aztecas en México, Incas en los Andes — un siglo de imperios simultáneos.' },
        datasets: ['data/dados-china-ming.json','data/dados-india-mogol.json','data/dados-imperio-otomano.json','data/dados-astecas-expandido.json','data/dados-chimu-conquista-peru.json'],
      },
    ],
  },
  {
    grupo: { pt: 'Religiões e Filosofia', en: 'Religions and Philosophy', es: 'Religiones y Filosofía' },
    itens: [
      {
        id: 'q-monoteismo',
        texto: { pt: 'Como surgiu o monoteísmo?', en: 'How did monotheism emerge?', es: '¿Cómo surgió el monoteísmo?' },
        desc:  { pt: 'Dos deuses egípcios ao zoroastrismo persa — as raízes das três religiões abraâmicas.',
                 en: 'From Egyptian gods to Persian Zoroastrianism — the roots of the three Abrahamic religions.',
                 es: 'De los dioses egipcios al zoroastrismo persa — las raíces de las tres religiones abrahámicas.' },
        datasets: ['data/dados-mesopotamia-hebreus-fenicios.json','data/dados-egito-antigo.json','data/dados-persia-zoroastrismo-cultura.json','data/dados-isla-origens.json'],
      },
      {
        id: 'q-isla',
        texto: { pt: 'Como o Islã se expandiu pelo mundo?', en: 'How did Islam spread across the world?', es: '¿Cómo se expandió el Islam por el mundo?' },
        desc:  { pt: 'De Meca a Córdoba, Bagdá e Deli em menos de dois séculos — a expansão mais rápida da história das religiões.',
                 en: 'From Mecca to Córdoba, Baghdad and Delhi in less than two centuries — the fastest expansion in religious history.',
                 es: 'De La Meca a Córdoba, Bagdad y Delhi en menos de dos siglos — la expansión más rápida de la historia religiosa.' },
        datasets: ['data/dados-isla-origens.json','data/dados-isla-fragmentacao.json','data/dados-califados-islamicos.json','data/dados-india-medieval-moderna.json'],
      },
      {
        id: 'q-budismo',
        texto: { pt: 'Como o Budismo chegou à Ásia?', en: 'How did Buddhism reach Asia?', es: '¿Cómo llegó el Budismo a Asia?' },
        desc:  { pt: 'De Sidarta na Índia a Ashoka, que enviou missionários ao Sri Lanka, China e Sudeste Asiático.',
                 en: 'From Siddhartha in India to Ashoka, who sent missionaries to Sri Lanka, China and Southeast Asia.',
                 es: 'De Siddharta en India a Ashoka, que envió misioneros a Sri Lanka, China y el Sudeste Asiático.' },
        datasets: ['data/dados-india-antiga.json','data/dados-china-filosofia.json','data/dados-japao-antigo.json','data/dados-sudeste-asiatico-continental.json'],
      },
      {
        id: 'q-democracia',
        texto: { pt: 'Como nasceu a democracia?', en: 'How was democracy born?', es: '¿Cómo nació la democracia?' },
        desc:  { pt: 'De Sólon e Clístenes em Atenas à República Romana — as origens do governo representativo.',
                 en: 'From Solon and Cleisthenes in Athens to the Roman Republic — the origins of representative government.',
                 es: 'De Solón y Clístenes en Atenas a la República Romana — los orígenes del gobierno representativo.' },
        datasets: ['data/dados-grecia-atenas.json','data/dados-grecia-esparta.json','data/dados-roma-republica.json','data/dados-iluminismo.json'],
      },
    ],
  },
  {
    grupo: { pt: 'Guerras e Conflitos', en: 'Wars and Conflicts', es: 'Guerras y Conflictos' },
    itens: [
      {
        id: 'q-cruzadas',
        texto: { pt: 'O que foram as Cruzadas?', en: 'What were the Crusades?', es: '¿Qué fueron las Cruzadas?' },
        desc:  { pt: 'Guerras santas, política papal, comércio mediterrâneo — e o encontro violento entre duas civilizações.',
                 en: 'Holy wars, papal politics, Mediterranean trade — and the violent meeting of two civilizations.',
                 es: 'Guerras santas, política papal, comercio mediterráneo — y el violento encuentro de dos civilizaciones.' },
        datasets: ['data/dados-cruzadas-expandido.json','data/dados-isla-origens.json','data/dados-medieval-feudalismo.json','data/dados-bizantino-medieval.json'],
      },
      {
        id: 'q-ww2',
        texto: { pt: 'O que causou a Segunda Guerra Mundial?', en: 'What caused the Second World War?', es: '¿Qué causó la Segunda Guerra Mundial?' },
        desc:  { pt: 'Da humilhação de Versalhes ao Holocausto — as raízes do conflito mais mortífero da história.',
                 en: 'From the humiliation of Versailles to the Holocaust — the roots of history\'s deadliest conflict.',
                 es: 'De la humillación de Versalles al Holocausto — las raíces del conflicto más mortífero de la historia.' },
        datasets: ['data/dados-primeira-guerra.json','data/dados-segunda-guerra.json','data/dados-nacionalismo-europeu.json','data/dados-revolucao-russa.json'],
      },
      {
        id: 'q-guerrafria',
        texto: { pt: 'O que foi a Guerra Fria?', en: 'What was the Cold War?', es: '¿Qué fue la Guerra Fría?' },
        desc:  { pt: 'EUA contra URSS, corrida nuclear, guerras proxy — a rivalidade que estruturou o mundo de 1945 a 1991.',
                 en: 'USA versus USSR, nuclear race, proxy wars — the rivalry that structured the world from 1945 to 1991.',
                 es: 'EEUU contra URSS, carrera nuclear, guerras proxy — la rivalidad que estructuró el mundo de 1945 a 1991.' },
        datasets: ['data/dados-segunda-guerra.json','data/dados-pos-guerra-fria.json','data/dados-revolucao-russa.json','data/dados-china-prc.json'],
      },
    ],
  },
  {
    grupo: { pt: 'Transformações Modernas', en: 'Modern Transformations', es: 'Transformaciones Modernas' },
    itens: [
      {
        id: 'q-renascimento',
        texto: { pt: 'O que foi o Renascimento?', en: 'What was the Renaissance?', es: '¿Qué fue el Renacimiento?' },
        desc:  { pt: 'Por que a Europa saiu da Idade Média por Florença — e como a arte, a ciência e o humanismo se transformaram.',
                 en: 'Why Europe exited the Middle Ages through Florence — and how art, science and humanism were transformed.',
                 es: 'Por qué Europa salió de la Edad Media por Florencia — y cómo el arte, la ciencia y el humanismo se transformaron.' },
        datasets: ['data/dados-renascimento-italiano.json','data/dados-renascimento-cultural.json','data/dados-renascimento-norte.json','data/dados-revolucao-cientifica.json'],
      },
      {
        id: 'q-industrial',
        texto: { pt: 'Como a Revolução Industrial mudou o mundo?', en: 'How did the Industrial Revolution change the world?', es: '¿Cómo cambió el mundo la Revolución Industrial?' },
        desc:  { pt: 'Da máquina a vapor ao capitalismo global — e as transformações sociais que ainda moldam o presente.',
                 en: 'From the steam engine to global capitalism — and the social transformations that still shape the present.',
                 es: 'De la máquina de vapor al capitalismo global — y las transformaciones sociales que aún moldean el presente.' },
        datasets: ['data/dados-revolucao-industrial.json','data/dados-capitalismo.json','data/dados-movimentos-sociais.json','data/dados-navegacoes.json'],
      },
      {
        id: 'q-gandhi',
        texto: { pt: 'Como Gandhi derrubou o Império Britânico?', en: 'How did Gandhi bring down the British Empire?', es: '¿Cómo Gandhi derrocó al Imperio Británico?' },
        desc:  { pt: 'A não-violência como estratégia política — e a independência que redefiniu o pós-guerra.',
                 en: 'Non-violence as political strategy — and the independence that redefined the post-war world.',
                 es: 'La no violencia como estrategia política — y la independencia que redefinió la posguerra.' },
        datasets: ['data/dados-india-medieval-moderna.json','data/dados-india-britanica.json','data/dados-movimentos-sociais.json','data/dados-descolonizacao.json'],
      },
    ],
  },
  {
    grupo: { pt: 'China', en: 'China', es: 'China' },
    itens: [
      {
        id: 'q-china-filosofia',
        texto: { pt: 'O que são as Cem Escolas de Pensamento?', en: 'What were the Hundred Schools of Thought?', es: '¿Qué fueron las Cien Escuelas de Pensamiento?' },
        desc:  { pt: 'Confúcio, Laozi, Sunzi, Han Feizi — o maior florescimento filosófico da história chinesa, nascido no caos dos Reinos Combatentes.',
                 en: 'Confucius, Laozi, Sunzi, Han Feizi — the greatest philosophical flourishing in Chinese history, born from the chaos of the Warring States.',
                 es: 'Confucio, Laozi, Sun Tzu, Han Feizi — el mayor florecimiento filosófico de la historia china, nacido del caos de los Reinos Combatientes.' },
        datasets: ['data/dados-china-shang-zhou.json','data/dados-china-filosofia.json','data/dados-china-qin-han.json'],
      },
      {
        id: 'q-china-invenções',
        texto: { pt: 'Como a China inventou o mundo moderno?', en: 'How did China invent the modern world?', es: '¿Cómo inventó China el mundo moderno?' },
        desc:  { pt: 'Pólvora, papel, imprensa, bússola — e por que a Revolução Industrial não aconteceu na China que chegou perto primeiro.',
                 en: 'Gunpowder, paper, printing, compass — and why the Industrial Revolution did not happen in China, which came closest first.',
                 es: 'Pólvora, papel, imprenta, brújula — y por qué la Revolución Industrial no ocurrió en China, que estuvo más cerca primero.' },
        datasets: ['data/dados-china-song-ciencia.json','data/dados-china-tang.json','data/dados-china-qin-han.json','data/dados-china-song-yuan.json'],
      },
      {
        id: 'q-china-mao',
        texto: { pt: 'O que Mao Tsé-Tung fez à China?', en: 'What did Mao Zedong do to China?', es: '¿Qué le hizo Mao Zedong a China?' },
        desc:  { pt: 'Revolução, Grande Salto com 30–45 milhões de mortos, Revolução Cultural — e por que ainda é venerado na China hoje.',
                 en: 'Revolution, Great Leap Forward with 30–45 million dead, Cultural Revolution — and why he is still venerated in China today.',
                 es: 'Revolución, Gran Salto con 30-45 millones de muertos, Revolución Cultural — y por qué todavía es venerado en China hoy.' },
        datasets: ['data/dados-china-mao-revolucao.json','data/dados-china-prc.json','data/dados-china-republica.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Brasil', en: 'Brazil', es: 'Brasil' },
    itens: [
      {
        id: 'q-brasil-origem',
        texto: { pt: 'Como nasceu o Brasil?', en: 'How was Brazil born?', es: '¿Cómo nació Brasil?' },
        desc:  { pt: 'Das navegações portuguesas aos 300 anos de colônia — e os povos que já estavam aqui.',
                 en: 'From Portuguese explorations to 300 years of colony — and the peoples who were already here.',
                 es: 'De las navegaciones portuguesas a 300 años de colonia — y los pueblos que ya estaban aquí.' },
        datasets: ['data/dados-brasil-colonial-inicial.json','data/dados-brasil-colonial-tardio.json','data/dados-brasil-indigenas.json','data/dados-navegacoes.json'],
      },
      {
        id: 'q-brasil-imperio',
        texto: { pt: 'O que foi o Império Brasileiro?', en: 'What was the Brazilian Empire?', es: '¿Qué fue el Imperio Brasileño?' },
        desc:  { pt: 'A única monarquia constitucional das Américas — e por que durou 67 anos enquanto vizinhos viravam repúblicas.',
                 en: 'The only constitutional monarchy in the Americas — and why it lasted 67 years while neighbors became republics.',
                 es: 'La única monarquía constitucional de las Américas — y por qué duró 67 años mientras los vecinos se volvían repúblicas.' },
        datasets: ['data/dados-brasil-imperio.json','data/dados-brasil-imperio-figuras.json','data/dados-brasil-ciclos-economicos.json','data/dados-brasil-quilombos.json'],
      },
      {
        id: 'q-brasil-republica',
        texto: { pt: 'Como surgiu a República no Brasil?', en: 'How did the Republic emerge in Brazil?', es: '¿Cómo surgió la República en Brasil?' },
        desc:  { pt: 'Do 15 de novembro às oligarquias do café-com-leite — e as revoluções que tentaram mudar tudo.',
                 en: 'From November 15th to the café-com-leite oligarchies — and the revolutions that tried to change everything.',
                 es: 'Del 15 de noviembre a las oligarquías del café-com-leite — y las revoluciones que intentaron cambiarlo todo.' },
        datasets: ['data/dados-brasil-republica.json','data/dados-brasil-republica-velha.json','data/dados-brasil-ditadura.json','data/dados-brasil-ciclos-economicos.json'],
      },
      {
        id: 'q-brasil-escravidao',
        texto: { pt: 'Como a escravidão moldou o Brasil?', en: 'How did slavery shape Brazil?', es: '¿Cómo la esclavitud moldeó Brasil?' },
        desc:  { pt: 'O maior receptor de africanos escravizados nas Américas — quilombos, resistência e o legado que persiste.',
                 en: 'The largest recipient of enslaved Africans in the Americas — quilombos, resistance and a legacy that endures.',
                 es: 'El mayor receptor de africanos esclavizados en las Américas — quilombos, resistencia y un legado que perdura.' },
        datasets: ['data/dados-brasil-colonial-escravidao.json','data/dados-brasil-quilombos.json','data/dados-brasil-ciclos-economicos.json','data/dados-brasil-missoes-jesuiticas.json'],
      },
      {
        id: 'q-brasil-ditadura',
        texto: { pt: 'O que foi a Ditadura Militar?', en: 'What was the Military Dictatorship?', es: '¿Qué fue la Dictadura Militar?' },
        desc:  { pt: '1964–1985: golpe, AI-5, milagre econômico, tortura e a lenta abertura política.',
                 en: '1964–1985: coup, AI-5, economic miracle, torture and the slow political opening.',
                 es: '1964–1985: golpe, AI-5, milagro económico, tortura y la lenta apertura política.' },
        datasets: ['data/dados-brasil-ditadura.json','data/dados-brasil-republica.json','data/dados-brasil-redemocratizacao.json'],
      },
      {
        id: 'q-brasil-vargas',
        texto: { pt: 'Quem foi Getúlio Vargas?', en: 'Who was Getúlio Vargas?', es: '¿Quién fue Getúlio Vargas?' },
        desc:  { pt: 'O "pai dos pobres" que governou 15 anos, criou a CLT e morreu com uma carta dirigida ao povo.',
                 en: 'The "father of the poor" who ruled 15 years, created labor laws and died with a letter to the people.',
                 es: 'El "padre de los pobres" que gobernó 15 años, creó leyes laborales y murió con una carta al pueblo.' },
        datasets: ['data/dados-brasil-era-vargas.json','data/dados-brasil-republica.json','data/dados-brasil-ciclos-economicos.json'],
      },
      {
        id: 'q-brasil-indigenas',
        texto: { pt: 'Quem eram os povos originários do Brasil?', en: 'Who were Brazil\'s indigenous peoples?', es: '¿Quiénes eran los pueblos originarios de Brasil?' },
        desc:  { pt: 'Tupi, Guarani, Yanomami e centenas de nações — culturas milenares antes e depois do contato.',
                 en: 'Tupi, Guarani, Yanomami and hundreds of nations — millennia-old cultures before and after contact.',
                 es: 'Tupi, Guaraní, Yanomami y cientos de naciones — culturas milenarias antes y después del contacto.' },
        datasets: ['data/dados-brasil-indigenas.json','data/dados-brasil-precolonial.json','data/dados-tupis-guaranis-amazonia.json','data/dados-brasil-missoes-jesuiticas.json'],
      },
      {
        id: 'q-brasil-inconfidencia',
        texto: { pt: 'O que foi a Inconfidência Mineira?', en: 'What was the Inconfidência Mineira?', es: '¿Qué fue la Inconfidência Mineira?' },
        desc:  { pt: 'Tiradentes e a primeira conspiração pela independência do Brasil — inspirada por Jefferson e Montesquieu.',
                 en: 'Tiradentes and the first conspiracy for Brazilian independence — inspired by Jefferson and Montesquieu.',
                 es: 'Tiradentes y la primera conspiración por la independencia de Brasil — inspirada por Jefferson y Montesquieu.' },
        datasets: ['data/dados-brasil-inconfidencia.json','data/dados-brasil-colonial-tardio.json','data/dados-brasil-independencia.json'],
      },
    ],
  },

  // ── NOVO: Pré-História Expandida ─────────────────────────────────────────
  {
    grupo: { pt: 'Pré-História Expandida', en: 'Deep Prehistory', es: 'Prehistoria Ampliada' },
    itens: [
      {
        id: 'q-evolucao',
        texto: { pt: 'Como evoluiu o Homo sapiens?', en: 'How did Homo sapiens evolve?', es: '¿Cómo evolucionó el Homo sapiens?' },
        desc:  { pt: 'Da África a todos os continentes — e o encontro com os Neandertais e Denisovanos.',
                 en: 'From Africa to every continent — and the encounter with Neanderthals and Denisovans.',
                 es: 'De África a todos los continentes — y el encuentro con Neandertales y Denisovanos.' },
        datasets: ['data/dados-evolucao-humana.json','data/dados-pre-historia.json','data/dados-pre-historia-paleolitico.json'],
      },
      {
        id: 'q-neandertais',
        texto: { pt: 'Por que os Neandertais desapareceram?', en: 'Why did Neanderthals disappear?', es: '¿Por qué desaparecieron los Neandertales?' },
        desc:  { pt: 'Extinção, absorção ou competição? O que o DNA moderno revela sobre nossa relação com os neandertais.',
                 en: 'Extinction, absorption or competition? What modern DNA reveals about our relationship with Neanderthals.',
                 es: '¿Extinción, absorción o competencia? Lo que el ADN moderno revela sobre nuestra relación con los neandertales.' },
        datasets: ['data/dados-evolucao-humana.json','data/dados-pre-historia-paleolitico.json','data/dados-pre-historia-europa.json'],
      },
      {
        id: 'q-arte-rupestre',
        texto: { pt: 'O que são as pinturas rupestres?', en: 'What are cave paintings?', es: '¿Qué son las pinturas rupestres?' },
        desc:  { pt: 'Chauvet, Altamira, Lascaux — 40.000 anos de arte humana e o que ela revela sobre a mente pré-histórica.',
                 en: 'Chauvet, Altamira, Lascaux — 40,000 years of human art and what it reveals about the prehistoric mind.',
                 es: 'Chauvet, Altamira, Lascaux — 40.000 años de arte humano y lo que revela sobre la mente prehistórica.' },
        datasets: ['data/dados-pre-historia-paleolitico.json','data/dados-pre-historia-europa.json','data/dados-pre-historia.json'],
      },
      {
        id: 'q-megalitos',
        texto: { pt: 'Quem construiu Stonehenge e os megalitos?', en: 'Who built Stonehenge and the megaliths?', es: '¿Quién construyó Stonehenge y los megalitos?' },
        desc:  { pt: 'Monumentos de pedra da Europa neolítica — astronomia, rituais e sociedades sem escrita.',
                 en: 'Stone monuments of Neolithic Europe — astronomy, rituals and societies without writing.',
                 es: 'Monumentos de piedra de la Europa neolítica — astronomía, rituales y sociedades sin escritura.' },
        datasets: ['data/dados-pre-historia-europa.json','data/dados-pre-historia-neolitico.json','data/dados-pre-historia.json'],
      },
    ],
  },

  // ── NOVO: Mesopotâmia e Oriente Antigo ───────────────────────────────────
  {
    grupo: { pt: 'Mesopotâmia e Oriente Antigo', en: 'Mesopotamia and the Ancient Near East', es: 'Mesopotamia y el Oriente Antiguo' },
    itens: [
      {
        id: 'q-sumeria',
        texto: { pt: 'O que inventaram os sumérios?', en: 'What did the Sumerians invent?', es: '¿Qué inventaron los sumerios?' },
        desc:  { pt: 'A escrita, a roda, o código de leis, a matemática sexagesimal — a base de toda a civilização ocidental.',
                 en: 'Writing, the wheel, law codes, sexagesimal mathematics — the foundation of all Western civilization.',
                 es: 'La escritura, la rueda, los códigos de leyes, la matemática sexagesimal — la base de toda la civilización occidental.' },
        datasets: ['data/dados-sumeria.json','data/dados-sumeria-cidades.json','data/dados-sumeria-expandida.json','data/dados-sumeria-religiao-legado.json'],
      },
      {
        id: 'q-babilonia',
        texto: { pt: 'O que foi a Babilônia?', en: 'What was Babylon?', es: '¿Qué fue Babilonia?' },
        desc:  { pt: 'Hammurabi, os Jardins Suspensos, a Torre de Babel — e por que foi a maior cidade do mundo por séculos.',
                 en: 'Hammurabi, the Hanging Gardens, the Tower of Babel — and why it was the world\'s largest city for centuries.',
                 es: 'Hammurabi, los Jardines Colgantes, la Torre de Babel — y por qué fue la mayor ciudad del mundo durante siglos.' },
        datasets: ['data/dados-mesopotamia.json','data/dados-mesopotamia-classica.json','data/dados-mesopotamia-bronze.json'],
      },
      {
        id: 'q-persia',
        texto: { pt: 'Como os persas criaram o primeiro grande império?', en: 'How did the Persians create the first great empire?', es: '¿Cómo los persas crearon el primer gran imperio?' },
        desc:  { pt: 'Ciro o Grande, Dario e Xerxes — tolerância religiosa, estradas reais e as Guerras Greco-Persas.',
                 en: 'Cyrus the Great, Darius and Xerxes — religious tolerance, royal roads and the Greco-Persian Wars.',
                 es: 'Ciro el Grande, Darío y Jerjes — tolerancia religiosa, caminos reales y las Guerras Greco-Persas.' },
        datasets: ['data/dados-persia.json','data/dados-persia-expandida.json','data/dados-persia-zoroastrismo-cultura.json','data/dados-grecia-guerras.json'],
      },
      {
        id: 'q-fenicios',
        texto: { pt: 'Quem foram os fenícios?', en: 'Who were the Phoenicians?', es: '¿Quiénes fueron los fenicios?' },
        desc:  { pt: 'Os inventores do alfabeto e os maiores navegadores da Antiguidade — de Tiro a Cartago.',
                 en: 'The inventors of the alphabet and the greatest navigators of Antiquity — from Tyre to Carthage.',
                 es: 'Los inventores del alfabeto y los mayores navegantes de la Antigüedad — de Tiro a Cartago.' },
        datasets: ['data/dados-fenicios-cartago.json','data/dados-mesopotamia-hebreus-fenicios.json','data/dados-civilizacoes-mediterraneo.json'],
      },
      {
        id: 'q-hitititas',
        texto: { pt: 'Quem foram os hititas?', en: 'Who were the Hittites?', es: '¿Quiénes fueron los hititas?' },
        desc:  { pt: 'O império do ferro e o primeiro tratado de paz da história — com o Egito de Ramsés II.',
                 en: 'The iron empire and the first peace treaty in history — with Egypt\'s Ramesses II.',
                 es: 'El imperio del hierro y el primer tratado de paz de la historia — con el Egipto de Ramsés II.' },
        datasets: ['data/dados-hitititas-bronze.json','data/dados-bronze-egeu.json','data/dados-egito-novo-reino.json'],
      },
      {
        id: 'q-zoroastrismo',
        texto: { pt: 'O que é o zoroastrismo?', en: 'What is Zoroastrianism?', es: '¿Qué es el zoroastrismo?' },
        desc:  { pt: 'A religião de Zaratustra e sua influência no judaísmo, no cristianismo e no islamismo: bem vs. mal, ressurreição, Juízo Final.',
                 en: 'The religion of Zarathustra and its influence on Judaism, Christianity and Islam: good vs. evil, resurrection, Final Judgment.',
                 es: 'La religión de Zaratustra y su influencia en el judaísmo, el cristianismo y el islam: bien vs. mal, resurrección, Juicio Final.' },
        datasets: ['data/dados-persia-zoroastrismo-cultura.json','data/dados-persia.json','data/dados-religioes-mundo.json'],
      },
    ],
  },

  // ── NOVO: Egito ───────────────────────────────────────────────────────────
  {
    grupo: { pt: 'Egito Antigo', en: 'Ancient Egypt', es: 'Egipto Antiguo' },
    itens: [
      {
        id: 'q-egipto-piramides',
        texto: { pt: 'Como e por que foram construídas as pirâmides?', en: 'How and why were the pyramids built?', es: '¿Cómo y por qué se construyeron las pirámides?' },
        desc:  { pt: 'Não por escravos, mas por trabalhadores remunerados — e o que revelam sobre a teologia e o Estado egípcio.',
                 en: 'Not by slaves but by paid workers — and what they reveal about Egyptian theology and the state.',
                 es: 'No por esclavos sino por trabajadores remunerados — y lo que revelan sobre la teología y el Estado egipcio.' },
        datasets: ['data/dados-egito-antigo.json','data/dados-egito-reinos-antigo-medio.json','data/dados-sumeria-religiao-legado.json'],
      },
      {
        id: 'q-nefertiti-akhenaton',
        texto: { pt: 'Quem foi Akhenaton e por que é tão perturbador?', en: 'Who was Akhenaten and why is he so disturbing?', es: '¿Quién fue Akenatón y por qué es tan perturbador?' },
        desc:  { pt: 'O faraó herético que inventou o monoteísmo, apagou os deuses e foi apagado da história pelo seu próprio povo.',
                 en: 'The heretic pharaoh who invented monotheism, erased the gods and was erased from history by his own people.',
                 es: 'El faraón herético que inventó el monoteísmo, borró los dioses y fue borrado de la historia por su propio pueblo.' },
        datasets: ['data/dados-egito-novo-reino.json','data/dados-egito-antigo.json','data/dados-religioes-mundo.json'],
      },
      {
        id: 'q-egipto-fim',
        texto: { pt: 'Como terminou o Egito Antigo?', en: 'How did Ancient Egypt end?', es: '¿Cómo terminó el Antiguo Egipto?' },
        desc:  { pt: 'De Cleópatra aos romanos — 3.000 anos de civilização contínua e seu colapso final.',
                 en: 'From Cleopatra to the Romans — 3,000 years of continuous civilization and its final collapse.',
                 es: 'De Cleopatra a los romanos — 3.000 años de civilización continua y su colapso final.' },
        datasets: ['data/dados-egito-tardio.json','data/dados-egito-reinos.json','data/dados-roma-imperial.json','data/dados-helenismo-ciencia.json'],
      },
    ],
  },

  // ── NOVO: Grécia e Roma ───────────────────────────────────────────────────
  {
    grupo: { pt: 'Grécia e Roma', en: 'Greece and Rome', es: 'Grecia y Roma' },
    itens: [
      {
        id: 'q-esparta',
        texto: { pt: 'O que era realmente Esparta?', en: 'What was Sparta really like?', es: '¿Cómo era realmente Esparta?' },
        desc:  { pt: 'Além do mito dos 300 — a sociedade mais militarizada da Antiguidade, os hilotas e o paradoxo da liberdade lacedemônia.',
                 en: 'Beyond the myth of the 300 — the most militarized society of Antiquity, the helots and the Lacedaemonian freedom paradox.',
                 es: 'Más allá del mito de los 300 — la sociedad más militarizada de la Antigüedad, los ilotas y la paradoja de la libertad lacedemonia.' },
        datasets: ['data/dados-grecia-esparta.json','data/dados-grecia-guerras.json','data/dados-grecia-atenas.json'],
      },
      {
        id: 'q-atenas-democracia',
        texto: { pt: 'Como Atenas inventou a democracia?', en: 'How did Athens invent democracy?', es: '¿Cómo Atenas inventó la democracia?' },
        desc:  { pt: 'Sólon, Clístenes, Péricles — e os limites de uma democracia que excluía mulheres, escravos e estrangeiros.',
                 en: 'Solon, Cleisthenes, Pericles — and the limits of a democracy that excluded women, slaves and foreigners.',
                 es: 'Solón, Clístenes, Pericles — y los límites de una democracia que excluía mujeres, esclavos y extranjeros.' },
        datasets: ['data/dados-grecia-atenas.json','data/dados-grecia-filosofia.json','data/dados-grecia-cultura.json'],
      },
      {
        id: 'q-republica-romana',
        texto: { pt: 'Como a República Romana funcionava?', en: 'How did the Roman Republic work?', es: '¿Cómo funcionaba la República Romana?' },
        desc:  { pt: 'Senado, cônsules, tribunos — o sistema de checks and balances que inspirou as democracias modernas.',
                 en: 'Senate, consuls, tribunes — the system of checks and balances that inspired modern democracies.',
                 es: 'Senado, cónsules, tribunos — el sistema de checks and balances que inspiró las democracias modernas.' },
        datasets: ['data/dados-roma-republica.json','data/dados-roma-sociedade.json','data/dados-roma-exercito.json'],
      },
      {
        id: 'q-julio-cesar',
        texto: { pt: 'Por que Júlio César foi assassinado?', en: 'Why was Julius Caesar assassinated?', es: '¿Por qué fue asesinado Julio César?' },
        desc:  { pt: 'A transição da República ao Império — Bruto, Cassio e o paradoxo de matar um tirano para salvar a república.',
                 en: 'The transition from Republic to Empire — Brutus, Cassius and the paradox of killing a tyrant to save the republic.',
                 es: 'La transición de la República al Imperio — Bruto, Casio y la paradoja de matar a un tirano para salvar la república.' },
        datasets: ['data/dados-roma-republica.json','data/dados-roma-imperial.json','data/dados-roma-cultura.json'],
      },
      {
        id: 'q-roma-sociedad',
        texto: { pt: 'Como era a vida cotidiana em Roma?', en: 'What was daily life like in Rome?', es: '¿Cómo era la vida cotidiana en Roma?' },
        desc:  { pt: 'Escravos, gladiadores, insulae, termas, garum — a sociedade mais urbana da Antiguidade.',
                 en: 'Slaves, gladiators, insulae, baths, garum — the most urban society of Antiquity.',
                 es: 'Esclavos, gladiadores, insulae, termas, garum — la sociedad más urbana de la Antigüedad.' },
        datasets: ['data/dados-roma-sociedade.json','data/dados-roma-cultura.json','data/dados-roma-antiga.json'],
      },
      {
        id: 'q-helenismo',
        texto: { pt: 'O que foi o Helenismo?', en: 'What was Hellenism?', es: '¿Qué fue el Helenismo?' },
        desc:  { pt: 'A fusão entre culturas grega, persa, egípcia e oriental — Alexandria, a Biblioteca e a maior explosão científica da Antiguidade.',
                 en: 'The fusion of Greek, Persian, Egyptian and Eastern cultures — Alexandria, the Library and the greatest scientific explosion of Antiquity.',
                 es: 'La fusión de culturas griega, persa, egipcia y oriental — Alejandría, la Biblioteca y la mayor explosión científica de la Antigüedad.' },
        datasets: ['data/dados-helenismo-ciencia.json','data/dados-grecia-alexandre.json','data/dados-egito-tardio.json'],
      },
    ],
  },

  // ── NOVO: Idade Média Europeia ────────────────────────────────────────────
  {
    grupo: { pt: 'Idade Média', en: 'Middle Ages', es: 'Edad Media' },
    itens: [
      {
        id: 'q-feudalismo',
        texto: { pt: 'O que foi o feudalismo?', en: 'What was feudalism?', es: '¿Qué fue el feudalismo?' },
        desc:  { pt: 'Suseranos, vassalos, servos — a estrutura social que dominou a Europa por 500 anos após a queda de Roma.',
                 en: 'Suzerains, vassals, serfs — the social structure that dominated Europe for 500 years after the fall of Rome.',
                 es: 'Señores, vasallos, siervos — la estructura social que dominó Europa durante 500 años tras la caída de Roma.' },
        datasets: ['data/dados-medieval-feudalismo.json','data/dados-castelos-cavalaria.json','data/dados-queda-roma.json'],
      },
      {
        id: 'q-cruzadas-detail',
        texto: { pt: 'Como e por que começaram as Cruzadas?', en: 'How and why did the Crusades begin?', es: '¿Cómo y por qué comenzaron las Cruzadas?' },
        desc:  { pt: 'O pedido de socorro de Bizâncio, o avanço seljúcida e o apelo de Urbano II — guerra defensiva ou conquista?',
                 en: 'Byzantium\'s call for help, the Seljuk advance and Urban II\'s appeal — defensive war or conquest?',
                 es: 'El llamado de socorro de Bizancio, el avance selyúcida y el llamado de Urbano II — ¿guerra defensiva o conquista?' },
        datasets: ['data/dados-cruzadas.json','data/dados-cruzadas-expandido.json','data/dados-bizantino-medieval.json','data/dados-califados-islamicos.json'],
      },
      {
        id: 'q-peste-negra',
        texto: { pt: 'O que foi a Peste Negra?', en: 'What was the Black Death?', es: '¿Qué fue la Peste Negra?' },
        desc:  { pt: '1/3 da Europa morta em 5 anos — como a pandemia de 1347 transformou a sociedade medieval para sempre.',
                 en: '1/3 of Europe dead in 5 years — how the 1347 pandemic transformed medieval society forever.',
                 es: '1/3 de Europa muerta en 5 años — cómo la pandemia de 1347 transformó la sociedad medieval para siempre.' },
        datasets: ['data/dados-idade-media-europeia.json','data/dados-europa-medieval-aprofundada.json','data/dados-medieval-cidades-universidades.json'],
      },
      {
        id: 'q-carolingios',
        texto: { pt: 'O que foi o Império Carolíngio?', en: 'What was the Carolingian Empire?', es: '¿Qué fue el Imperio Carolingio?' },
        desc:  { pt: 'Carlos Magno unificou a Europa pela primeira vez desde Roma — e por que seu império durou menos de 30 anos após sua morte.',
                 en: 'Charlemagne unified Europe for the first time since Rome — and why his empire lasted less than 30 years after his death.',
                 es: 'Carlomagno unificó Europa por primera vez desde Roma — y por qué su imperio duró menos de 30 años tras su muerte.' },
        datasets: ['data/dados-carolingios.json','data/dados-medieval-feudalismo.json','data/dados-queda-roma.json'],
      },
      {
        id: 'q-imperio-otomano',
        texto: { pt: 'Como os Otomanos conquistaram Constantinopla?', en: 'How did the Ottomans conquer Constantinople?', es: '¿Cómo los otomanos conquistaron Constantinopla?' },
        desc:  { pt: '1453: o fim do Império Romano do Oriente e o início do domínio otomano de 600 anos.',
                 en: '1453: the end of the Eastern Roman Empire and the beginning of 600 years of Ottoman rule.',
                 es: '1453: el fin del Imperio Romano de Oriente y el inicio del dominio otomano de 600 años.' },
        datasets: ['data/dados-imperio-otomano.json','data/dados-bizantino-medieval.json','data/dados-cruzadas-expandido.json'],
      },
      {
        id: 'q-cisma',
        texto: { pt: 'Como e por que se dividiu o Cristianismo?', en: 'How and why did Christianity split?', es: '¿Cómo y por qué se dividió el Cristianismo?' },
        desc:  { pt: 'O Grande Cisma de 1054, o saque de Constantinopla em 1204 e a Reforma de 1517 — três rupturas que moldaram o mundo.',
                 en: 'The Great Schism of 1054, the sack of Constantinople in 1204 and the Reformation of 1517 — three breaks that shaped the world.',
                 es: 'El Gran Cisma de 1054, el saqueo de Constantinopla en 1204 y la Reforma de 1517 — tres rupturas que moldearon el mundo.' },
        datasets: ['data/dados-reforma-protestante.json','data/dados-cruzadas-expandido.json','data/dados-lutero-reforma.json','data/dados-igreja-fundacao.json'],
      },
    ],
  },

  // ── NOVO: Mundo Islâmico ──────────────────────────────────────────────────
  {
    grupo: { pt: 'O Mundo Islâmico', en: 'The Islamic World', es: 'El Mundo Islámico' },
    itens: [
      {
        id: 'q-maome',
        texto: { pt: 'Como surgiu o Islão?', en: 'How did Islam emerge?', es: '¿Cómo surgió el Islam?' },
        desc:  { pt: 'A Arábia pré-islâmica, Maomé, a Hégira e a velocidade extraordinária da expansão muçulmana.',
                 en: 'Pre-Islamic Arabia, Muhammad, the Hijra and the extraordinary speed of Muslim expansion.',
                 es: 'La Arabia preislámica, Mahoma, la Hégira y la extraordinaria velocidad de la expansión musulmana.' },
        datasets: ['data/dados-arabia-pre-islamica.json','data/dados-isla-origens.json','data/dados-islao-fundacao.json','data/dados-expansao-isla.json'],
      },
      {
        id: 'q-califados',
        texto: { pt: 'O que foram os Califados?', en: 'What were the Caliphates?', es: '¿Qué fueron los Califatos?' },
        desc:  { pt: 'Omíadas, Abássidas e a Idade de Ouro islâmica — quando Bagdá era a capital intelectual do mundo.',
                 en: 'Umayyads, Abbasids and the Islamic Golden Age — when Baghdad was the intellectual capital of the world.',
                 es: 'Omeyas, Abásidas y la Edad de Oro islámica — cuando Bagdad era la capital intelectual del mundo.' },
        datasets: ['data/dados-califados-islamicos.json','data/dados-isla-origens.json','data/dados-isla-fragmentacao.json'],
      },
      {
        id: 'q-al-andalus',
        texto: { pt: 'O que foi Al-Ándalus?', en: 'What was Al-Andalus?', es: '¿Qué fue Al-Ándalus?' },
        desc:  { pt: 'A Espanha islâmica (711–1492): ciência, filosofia, convivência e a transmissão do conhecimento grego à Europa.',
                 en: 'Islamic Spain (711–1492): science, philosophy, coexistence and the transmission of Greek knowledge to Europe.',
                 es: 'La España islámica (711–1492): ciencia, filosofía, convivencia y la transmisión del conocimiento griego a Europa.' },
        datasets: ['data/dados-al-andalus.json','data/dados-califados-islamicos.json','data/dados-religioes-mundo.json'],
      },
      {
        id: 'q-islamciencia',
        texto: { pt: 'Que ciência produziu a civilização islâmica?', en: 'What science did Islamic civilization produce?', es: '¿Qué ciencia produjo la civilización islámica?' },
        desc:  { pt: 'Álgebra, astronomia, medicina, óptica — e como o mundo islâmico preservou e expandiu o conhecimento grego.',
                 en: 'Algebra, astronomy, medicine, optics — and how the Islamic world preserved and expanded Greek knowledge.',
                 es: 'Álgebra, astronomía, medicina, óptica — y cómo el mundo islámico preservó y expandió el conocimiento griego.' },
        datasets: ['data/dados-oriente-medio-moderno.json','data/dados-califados-islamicos.json','data/dados-isla-origens.json'],
      },
      {
        id: 'q-otomano-moderno',
        texto: { pt: 'Como o Império Otomano se tornou a Turquia moderna?', en: 'How did the Ottoman Empire become modern Turkey?', es: '¿Cómo el Imperio Otomano se convirtió en la Turquía moderna?' },
        desc:  { pt: 'O colapso pós-WWI, Atatürk, a laicização forçada e a criação do Oriente Médio moderno.',
                 en: 'Post-WWI collapse, Atatürk, forced secularization and the creation of the modern Middle East.',
                 es: 'El colapso post-WWI, Atatürk, la laicización forzada y la creación del Oriente Medio moderno.' },
        datasets: ['data/dados-turquia-moderna.json','data/dados-imperio-otomano.json','data/dados-oriente-medio-moderno.json'],
      },
    ],
  },

  // ── NOVO: África ──────────────────────────────────────────────────────────
  {
    grupo: { pt: 'Civilizações Africanas', en: 'African Civilizations', es: 'Civilizaciones Africanas' },
    itens: [
      {
        id: 'q-africa-reinos',
        texto: { pt: 'Que grandes reinos existiram na África?', en: 'What great kingdoms existed in Africa?', es: '¿Qué grandes reinos existieron en África?' },
        desc:  { pt: 'Mali, Songai, Zimbábue, Axum — impérios africanos que controlavam o ouro mundial e o comércio intercontinental.',
                 en: 'Mali, Songhai, Zimbabwe, Aksum — African empires that controlled the world\'s gold and intercontinental trade.',
                 es: 'Mali, Songhai, Zimbabue, Axum — imperios africanos que controlaban el oro mundial y el comercio intercontinental.' },
        datasets: ['data/dados-reinos-africanos.json','data/dados-africa-ocidental.json','data/dados-africa-oriental.json','data/dados-africa-pre-colonial.json'],
      },
      {
        id: 'q-africa-trafico',
        texto: { pt: 'O que foi o tráfico transatlântico?', en: 'What was the transatlantic slave trade?', es: '¿Qué fue el tráfico transatlántico de esclavos?' },
        desc:  { pt: '12 milhões de africanos deportados em 400 anos — o maior movimento forçado de pessoas da história.',
                 en: '12 million Africans deported over 400 years — the largest forced movement of people in history.',
                 es: '12 millones de africanos deportados en 400 años — el mayor movimiento forzado de personas de la historia.' },
        datasets: ['data/dados-africa-ocidental.json','data/dados-americas-coloniais.json','data/dados-imperialismo-colonial.json','data/dados-caribe-colonial.json'],
      },
      {
        id: 'q-africa-colonial',
        texto: { pt: 'Como a África foi dividida pelo colonialismo?', en: 'How was Africa divided by colonialism?', es: '¿Cómo fue dividida África por el colonialismo?' },
        desc:  { pt: 'A Conferência de Berlim (1884–85): 14 potências europeias desenharam fronteiras sem consultar um único africano.',
                 en: 'The Berlin Conference (1884–85): 14 European powers drew borders without consulting a single African.',
                 es: 'La Conferencia de Berlín (1884–85): 14 potencias europeas dibujaron fronteras sin consultar a un solo africano.' },
        datasets: ['data/dados-imperialismo-colonial.json','data/dados-africa-pre-colonial.json','data/dados-africa-centro-sul.json','data/dados-africa-norte.json'],
      },
      {
        id: 'q-descolonizacao',
        texto: { pt: 'Como a África se descolonizou?', en: 'How did Africa decolonize?', es: '¿Cómo se descolonizó África?' },
        desc:  { pt: 'Da Costa do Ouro (1957) às guerras de libertação — e por que a independência política não significou independência econômica.',
                 en: 'From the Gold Coast (1957) to liberation wars — and why political independence didn\'t mean economic independence.',
                 es: 'De la Costa de Oro (1957) a las guerras de liberación — y por qué la independencia política no significó independencia económica.' },
        datasets: ['data/dados-descolonizacao.json','data/dados-descolonizacao-guerras.json','data/dados-africa-pre-colonial.json'],
      },
      {
        id: 'q-africa-axum',
        texto: { pt: 'O que foi o Império de Axum?', en: 'What was the Aksumite Empire?', es: '¿Qué fue el Imperio de Aksum?' },
        desc:  { pt: 'O primeiro império cristão da história, no atual Etiópia — e seu papel no comércio entre Roma, Índia e Arábia.',
                 en: 'The first Christian empire in history, in present-day Ethiopia — and its role in trade between Rome, India and Arabia.',
                 es: 'El primer imperio cristiano de la historia, en la actual Etiopía — y su papel en el comercio entre Roma, India y Arabia.' },
        datasets: ['data/dados-africa-oriental.json','data/dados-africa-pre-colonial.json','data/dados-reinos-africanos.json'],
      },
    ],
  },

  // ── NOVO: Ásia – Índia, Japão, Sudeste ────────────────────────────────────
  {
    grupo: { pt: 'Ásia: Índia, Japão e Sudeste', en: 'Asia: India, Japan and Southeast', es: 'Asia: India, Japón y Sudeste' },
    itens: [
      {
        id: 'q-india-civilizacao',
        texto: { pt: 'Como nasceu a civilização indiana?', en: 'How was Indian civilization born?', es: '¿Cómo nació la civilización india?' },
        desc:  { pt: 'Harappa e Mohenjo-Daro, os Vedas e o sistema de castas — 5.000 anos de continuidade cultural.',
                 en: 'Harappa and Mohenjo-Daro, the Vedas and the caste system — 5,000 years of cultural continuity.',
                 es: 'Harappa y Mohenjo-Daro, los Vedas y el sistema de castas — 5.000 años de continuidad cultural.' },
        datasets: ['data/dados-india-vedica-maurya.json','data/dados-india-antiga.json','data/dados-india-mogol.json'],
      },
      {
        id: 'q-india-mogol',
        texto: { pt: 'O que foi o Império Mogol?', en: 'What was the Mughal Empire?', es: '¿Qué fue el Imperio Mogol?' },
        desc:  { pt: 'Akbar, Taj Mahal, tolerância religiosa — o maior império da história indiana e sua relação com o colonialismo britânico.',
                 en: 'Akbar, the Taj Mahal, religious tolerance — the greatest empire in Indian history and its relationship with British colonialism.',
                 es: 'Akbar, el Taj Mahal, tolerancia religiosa — el mayor imperio de la historia india y su relación con el colonialismo británico.' },
        datasets: ['data/dados-india-mogol.json','data/dados-india-britanica.json','data/dados-india-medieval-moderna.json'],
      },
      {
        id: 'q-japao-samurai',
        texto: { pt: 'O que foi o Japão feudal?', en: 'What was feudal Japan?', es: '¿Qué fue el Japón feudal?' },
        desc:  { pt: 'Samurais, xoguns, o Bushido — e o período Sengoku de guerras civis que forjou o Japão moderno.',
                 en: 'Samurai, shoguns, Bushido — and the Sengoku period of civil wars that forged modern Japan.',
                 es: 'Samurais, shogunes, el Bushido — y el período Sengoku de guerras civiles que forjó el Japón moderno.' },
        datasets: ['data/dados-japao-feudal.json','data/dados-japao-sengoku.json','data/dados-japao-antigo.json'],
      },
      {
        id: 'q-japao-meiji',
        texto: { pt: 'Como o Japão se modernizou em 50 anos?', en: 'How did Japan modernize in 50 years?', es: '¿Cómo se modernizó Japón en 50 años?' },
        desc:  { pt: 'A Restauração Meiji (1868): de nação feudal isolada a potência industrial que derrotou a Rússia em 1905.',
                 en: 'The Meiji Restoration (1868): from isolated feudal nation to industrial power that defeated Russia in 1905.',
                 es: 'La Restauración Meiji (1868): de nación feudal aislada a potencia industrial que derrotó a Rusia en 1905.' },
        datasets: ['data/dados-japao-meiji.json','data/dados-japao-moderno.json','data/dados-japao-feudal.json'],
      },
      {
        id: 'q-sudeste-asiatico',
        texto: { pt: 'O que foram os grandes impérios do Sudeste Asiático?', en: 'What were the great empires of Southeast Asia?', es: '¿Cuáles fueron los grandes imperios del Sudeste Asiático?' },
        desc:  { pt: 'Angkor Wat, Majapahit, o reino de Pagan — civilizações que ligavam China, Índia e o mundo islâmico.',
                 en: 'Angkor Wat, Majapahit, the Pagan Kingdom — civilizations that linked China, India and the Islamic world.',
                 es: 'Angkor Wat, Majapahit, el reino de Pagan — civilizaciones que unían China, India y el mundo islámico.' },
        datasets: ['data/dados-sudeste-asiatico-continental.json','data/dados-sudeste-asiatico-maritimo.json','data/dados-sudeste-asiatico.json'],
      },
      {
        id: 'q-coreia',
        texto: { pt: 'Qual é a história da Coreia?', en: 'What is the history of Korea?', es: '¿Cuál es la historia de Corea?' },
        desc:  { pt: 'Da Joseon à divisão em 1945 — como uma nação milenar foi cortada ao meio pela Guerra Fria.',
                 en: 'From Joseon to the 1945 division — how an ancient nation was cut in half by the Cold War.',
                 es: 'De Joseon a la división de 1945 — cómo una nación milenaria fue cortada por la mitad por la Guerra Fría.' },
        datasets: ['data/dados-coreia-antiga.json','data/dados-coreia-joseon.json','data/dados-coreia-moderna.json'],
      },
    ],
  },

  // ── NOVO: Américas Indígenas ──────────────────────────────────────────────
  {
    grupo: { pt: 'Américas Antes da Europa', en: 'Americas Before Europe', es: 'Américas Antes de Europa' },
    itens: [
      {
        id: 'q-maias',
        texto: { pt: 'O que foi a civilização Maia?', en: 'What was the Maya civilization?', es: '¿Qué fue la civilización Maya?' },
        desc:  { pt: 'Astronomia, calendários, escrita, pirâmides — e o misterioso colapso do período Clássico (800–900 d.C.).',
                 en: 'Astronomy, calendars, writing, pyramids — and the mysterious collapse of the Classic period (800–900 AD).',
                 es: 'Astronomía, calendarios, escritura, pirámides — y el misterioso colapso del período Clásico (800–900 d.C.).' },
        datasets: ['data/dados-maya-classico.json','data/dados-maya-expandido.json','data/dados-maya-ciencia.json'],
      },
      {
        id: 'q-astecas',
        texto: { pt: 'O que foi o Império Asteca?', en: 'What was the Aztec Empire?', es: '¿Qué fue el Imperio Azteca?' },
        desc:  { pt: 'Tenochtitlán, os sacrifícios humanos, Montezuma — e como Cortés conquistou um império de 5 milhões com 600 homens.',
                 en: 'Tenochtitlan, human sacrifices, Moctezuma — and how Cortés conquered an empire of 5 million with 600 men.',
                 es: 'Tenochtitlan, los sacrificios humanos, Moctezuma — y cómo Cortés conquistó un imperio de 5 millones con 600 hombres.' },
        datasets: ['data/dados-aztecas.json','data/dados-astecas-expandido.json','data/dados-mesoamerica.json'],
      },
      {
        id: 'q-incas',
        texto: { pt: 'Como os Incas construíram o maior império das Américas?', en: 'How did the Incas build the largest empire in the Americas?', es: '¿Cómo los incas construyeron el mayor imperio de las Américas?' },
        desc:  { pt: 'Sem escrita, sem roda, sem cavalos — Machu Picchu, o Tawantinsuyu e 40.000 km de estradas nos Andes.',
                 en: 'Without writing, without wheels, without horses — Machu Picchu, the Tawantinsuyu and 40,000 km of roads in the Andes.',
                 es: 'Sin escritura, sin rueda, sin caballos — Machu Picchu, el Tawantinsuyu y 40.000 km de caminos en los Andes.' },
        datasets: ['data/dados-incas.json','data/dados-andes.json','data/dados-chimu-conquista-peru.json'],
      },
      {
        id: 'q-caral',
        texto: { pt: 'O que foi Caral — a civilização mais antiga das Américas?', en: 'What was Caral — the oldest civilization in the Americas?', es: '¿Qué fue Caral — la civilización más antigua de las Américas?' },
        desc:  { pt: 'Contemporânea ao Egito (3000 a.C.), no Peru — uma civilização urbana descoberta apenas em 1994.',
                 en: 'Contemporary with Egypt (3000 BC), in Peru — an urban civilization discovered only in 1994.',
                 es: 'Contemporánea al Egipto (3000 a.C.), en Perú — una civilización urbana descubierta solo en 1994.' },
        datasets: ['data/dados-caral-andino-antigo.json','data/dados-caral-culturas-antigas.json','data/dados-andes.json'],
      },
      {
        id: 'q-povos-norte',
        texto: { pt: 'Quem eram os povos nativos da América do Norte?', en: 'Who were the indigenous peoples of North America?', es: '¿Quiénes eran los pueblos indígenas de América del Norte?' },
        desc:  { pt: 'Sioux, Navajo, Iroqueses, Cherokees — diversidade cultural e o genocídio do século XIX.',
                 en: 'Sioux, Navajo, Iroquois, Cherokee — cultural diversity and the genocide of the 19th century.',
                 es: 'Sioux, Navajo, Iroqueses, Cherokees — diversidad cultural y el genocidio del siglo XIX.' },
        datasets: ['data/dados-povos-nativos-norte.json','data/dados-pre-historia-americas.json','data/dados-americas-coloniais.json'],
      },
    ],
  },

  // ── NOVO: Ciência e Pensamento ────────────────────────────────────────────
  {
    grupo: { pt: 'Ciência e Pensamento', en: 'Science and Thought', es: 'Ciencia y Pensamiento' },
    itens: [
      {
        id: 'q-revolucao-cientifica',
        texto: { pt: 'O que foi a Revolução Científica?', en: 'What was the Scientific Revolution?', es: '¿Qué fue la Revolución Científica?' },
        desc:  { pt: 'Copérnico, Galileu, Newton — como a Europa dos séculos XVI–XVII reinventou o método de conhecer o mundo.',
                 en: 'Copernicus, Galileo, Newton — how 16th–17th century Europe reinvented the method of understanding the world.',
                 es: 'Copérnico, Galileo, Newton — cómo la Europa de los siglos XVI–XVII reinventó el método de conocer el mundo.' },
        datasets: ['data/dados-revolucao-cientifica.json','data/dados-ciencia-tecnologia.json','data/dados-iluminismo.json'],
      },
      {
        id: 'q-iluminismo',
        texto: { pt: 'O que foi o Iluminismo?', en: 'What was the Enlightenment?', es: '¿Qué fue la Ilustración?' },
        desc:  { pt: 'Voltaire, Rousseau, Locke, Kant — o século XVIII que inventou os direitos humanos, a separação de poderes e a soberania popular.',
                 en: 'Voltaire, Rousseau, Locke, Kant — the 18th century that invented human rights, separation of powers and popular sovereignty.',
                 es: 'Voltaire, Rousseau, Locke, Kant — el siglo XVIII que inventó los derechos humanos, la separación de poderes y la soberanía popular.' },
        datasets: ['data/dados-iluminismo.json','data/dados-filosofia-racionalismo.json','data/dados-revolucoes-liberais.json'],
      },
      {
        id: 'q-filosofia-grega',
        texto: { pt: 'O que inventaram os filósofos gregos?', en: 'What did the Greek philosophers invent?', es: '¿Qué inventaron los filósofos griegos?' },
        desc:  { pt: 'Sócrates, Platão, Aristóteles — e por que a filosofia grega ainda estrutura toda a educação e o pensamento ocidental.',
                 en: 'Socrates, Plato, Aristotle — and why Greek philosophy still structures all Western education and thought.',
                 es: 'Sócrates, Platón, Aristóteles — y por qué la filosofía griega todavía estructura toda la educación y el pensamiento occidental.' },
        datasets: ['data/dados-grecia-filosofia.json','data/dados-filosofia-antiga.json','data/dados-filosofia-medieval.json'],
      },
      {
        id: 'q-existencialismo',
        texto: { pt: 'O que é o existencialismo?', en: 'What is existentialism?', es: '¿Qué es el existencialismo?' },
        desc:  { pt: 'Nietzsche, Sartre, Camus, Heidegger — a filosofia do século XX que disse: a existência precede a essência.',
                 en: 'Nietzsche, Sartre, Camus, Heidegger — the 20th century philosophy that said: existence precedes essence.',
                 es: 'Nietzsche, Sartre, Camus, Heidegger — la filosofía del siglo XX que dijo: la existencia precede a la esencia.' },
        datasets: ['data/dados-existencialismo.json','data/dados-filosofia-moderna.json','data/dados-filosofia-racionalismo.json'],
      },
      {
        id: 'q-imprensa',
        texto: { pt: 'Como a imprensa de Gutenberg mudou o mundo?', en: 'How did Gutenberg\'s press change the world?', es: '¿Cómo la imprenta de Gutenberg cambió el mundo?' },
        desc:  { pt: '1450: a maior revolução na história da comunicação antes da internet — e seu papel direto na Reforma Protestante.',
                 en: '1450: the greatest revolution in communication history before the internet — and its direct role in the Protestant Reformation.',
                 es: '1450: la mayor revolución en la historia de la comunicación antes de internet — y su papel directo en la Reforma Protestante.' },
        datasets: ['data/dados-renascimento-italiano.json','data/dados-reforma-protestante.json','data/dados-renascimento-cultural.json'],
      },
      {
        id: 'q-renascimento-italiano',
        texto: { pt: 'O que foi o Renascimento?', en: 'What was the Renaissance?', es: '¿Qué fue el Renacimiento?' },
        desc:  { pt: 'Leonardo, Michelangelo, Erasmo — como o reencontro com a Antiguidade clássica reinventou a arte, a ciência e o humano.',
                 en: 'Leonardo, Michelangelo, Erasmus — how the rediscovery of classical Antiquity reinvented art, science and humanity.',
                 es: 'Leonardo, Miguel Ángel, Erasmo — cómo el reencuentro con la Antigüedad clásica reinventó el arte, la ciencia y lo humano.' },
        datasets: ['data/dados-renascimento-italiano.json','data/dados-renascimento-cultural.json','data/dados-renascimento-norte.json'],
      },
    ],
  },

  // ── NOVO: Séculos XIX e XX ────────────────────────────────────────────────
  {
    grupo: { pt: 'Séculos XIX e XX', en: '19th and 20th Centuries', es: 'Siglos XIX y XX' },
    itens: [
      {
        id: 'q-napoleao',
        texto: { pt: 'Quem foi Napoleão e o que ele deixou ao mundo?', en: 'Who was Napoleon and what did he leave to the world?', es: '¿Quién fue Napoleón y qué dejó al mundo?' },
        desc:  { pt: 'Do cabo corso ao exílio em Santa Helena — o Código Napoleônico, o nacionalismo e a reconfiguração da Europa.',
                 en: 'From the Corsican corporal to exile on Saint Helena — the Napoleonic Code, nationalism and the reconfiguration of Europe.',
                 es: 'Del cabo corso al exilio en Santa Elena — el Código Napoleónico, el nacionalismo y la reconfiguración de Europa.' },
        datasets: ['data/dados-guerras-napoleonicas.json','data/dados-revolucao-francesa.json','data/dados-nacionalismo-europeu.json'],
      },
      {
        id: 'q-ww1',
        texto: { pt: 'Como começou a Primeira Guerra Mundial?', en: 'How did World War I begin?', es: '¿Cómo comenzó la Primera Guerra Mundial?' },
        desc:  { pt: 'Um tiro em Sarajevo, alianças em cascata e 17 milhões de mortos — a guerra que acabou com o mundo do século XIX.',
                 en: 'A shot in Sarajevo, cascading alliances and 17 million dead — the war that ended the 19th century world.',
                 es: 'Un disparo en Sarajevo, alianzas en cascada y 17 millones de muertos — la guerra que acabó con el mundo del siglo XIX.' },
        datasets: ['data/dados-primeira-guerra.json','data/dados-nacionalismo-europeu.json','data/dados-imperialismo-colonial.json'],
      },
      {
        id: 'q-holocausto',
        texto: { pt: 'Como o Holocausto foi possível?', en: 'How was the Holocaust possible?', es: '¿Cómo fue posible el Holocausto?' },
        desc:  { pt: '6 milhões de judeus assassinados industrialmente — as condições políticas, ideológicas e humanas que tornaram isso possível.',
                 en: '6 million Jews industrially murdered — the political, ideological and human conditions that made it possible.',
                 es: '6 millones de judíos asesinados industrialmente — las condiciones políticas, ideológicas y humanas que lo hicieron posible.' },
        datasets: ['data/dados-holocausto.json','data/dados-segunda-guerra.json','data/dados-entreguerras.json'],
      },
      {
        id: 'q-stalin',
        texto: { pt: 'O que foi o stalinismo?', en: 'What was Stalinism?', es: '¿Qué fue el estalinismo?' },
        desc:  { pt: 'Gulag, Holodomor, Grandes Purgas — como Stalin transformou a URSS num Estado de terror que matou mais soviéticos que Hitler.',
                 en: 'Gulag, Holodomor, Great Purges — how Stalin turned the USSR into a terror state that killed more Soviets than Hitler.',
                 es: 'Gulag, Holodomor, Grandes Purgas — cómo Stalin convirtió la URSS en un Estado de terror que mató más soviéticos que Hitler.' },
        datasets: ['data/dados-revolucao-russa.json','data/dados-guerra-fria.json','data/dados-entreguerras.json'],
      },
      {
        id: 'q-descolonizacao-asia',
        texto: { pt: 'Como a Ásia se descolonizou?', en: 'How did Asia decolonize?', es: '¿Cómo se descolonizó Asia?' },
        desc:  { pt: 'Da Índia de Gandhi ao Vietnã de Ho Chi Minh — diferentes estratégias de libertação do domínio europeu.',
                 en: 'From Gandhi\'s India to Ho Chi Minh\'s Vietnam — different strategies for liberation from European rule.',
                 es: 'De la India de Gandhi al Vietnam de Ho Chi Minh — diferentes estrategias de liberación del dominio europeo.' },
        datasets: ['data/dados-india-britanica.json','data/dados-descolonizacao.json','data/dados-descolonizacao-guerras.json','data/dados-japao-moderno.json'],
      },
      {
        id: 'q-america-latina-sec20',
        texto: { pt: 'Por que a América Latina foi tão instável no século XX?', en: 'Why was Latin America so unstable in the 20th century?', es: '¿Por qué América Latina fue tan inestable en el siglo XX?' },
        desc:  { pt: 'Ditaduras, guerrilhas, Operação Condor, intervenção americana — o século das revoluções e contra-revoluções.',
                 en: 'Dictatorships, guerrillas, Operation Condor, American intervention — the century of revolutions and counter-revolutions.',
                 es: 'Dictaduras, guerrillas, Operación Condor, intervención americana — el siglo de las revoluciones y contrarrevolucionarias.' },
        datasets: ['data/dados-america-latina-sec20.json','data/dados-independencias-america-latina.json','data/dados-eua-guerra-fria.json'],
      },
      {
        id: 'q-eua-potencia',
        texto: { pt: 'Como os EUA se tornaram a maior potência do mundo?', en: 'How did the US become the world\'s greatest power?', es: '¿Cómo EE.UU. se convirtió en la mayor potencia del mundo?' },
        desc:  { pt: 'Da independência à hegemonia — Guerra Civil, industrialização, as duas guerras mundiais e a Guerra Fria.',
                 en: 'From independence to hegemony — Civil War, industrialization, two world wars and the Cold War.',
                 es: 'De la independencia a la hegemonía — Guerra Civil, industrialización, dos guerras mundiales y la Guerra Fría.' },
        datasets: ['data/dados-eua-fundacao.json','data/dados-eua-guerra-civil.json','data/dados-eua-industrializacao.json','data/dados-eua-new-deal-guerra-fria.json'],
      },
      {
        id: 'q-capitalismo',
        texto: { pt: 'Como surgiu o capitalismo?', en: 'How did capitalism emerge?', es: '¿Cómo surgió el capitalismo?' },
        desc:  { pt: 'Da ética protestante ao vapor — Max Weber, Adam Smith e a Revolução Industrial que transformou o mundo.',
                 en: 'From the Protestant ethic to steam — Max Weber, Adam Smith and the Industrial Revolution that transformed the world.',
                 es: 'De la ética protestante al vapor — Max Weber, Adam Smith y la Revolución Industrial que transformó el mundo.' },
        datasets: ['data/dados-capitalismo.json','data/dados-revolucao-industrial.json','data/dados-socialismo-trabalho.json'],
      },
    ],
  },

  // ── NOVO: Movimentos Sociais ──────────────────────────────────────────────
  {
    grupo: { pt: 'Movimentos e Revoluções', en: 'Movements and Revolutions', es: 'Movimientos y Revoluciones' },
    itens: [
      {
        id: 'q-rev-francesa',
        texto: { pt: 'O que foi a Revolução Francesa?', en: 'What was the French Revolution?', es: '¿Qué fue la Revolución Francesa?' },
        desc:  { pt: 'Liberdade, igualdade, fraternidade — e o Terror. A revolução que inventou a política moderna e comeu seus próprios filhos.',
                 en: 'Liberty, equality, fraternity — and the Terror. The revolution that invented modern politics and devoured its own children.',
                 es: 'Libertad, igualdad, fraternidad — y el Terror. La revolución que inventó la política moderna y devoró a sus propios hijos.' },
        datasets: ['data/dados-revolucao-francesa.json','data/dados-iluminismo.json','data/dados-absolutismo.json'],
      },
      {
        id: 'q-socialismo',
        texto: { pt: 'Como surgiu o socialismo?', en: 'How did socialism emerge?', es: '¿Cómo surgió el socialismo?' },
        desc:  { pt: 'Marx, Engels, a Internacional — da crítica ao capitalismo industrial às revoluções do século XX.',
                 en: 'Marx, Engels, the International — from the critique of industrial capitalism to the revolutions of the 20th century.',
                 es: 'Marx, Engels, la Internacional — de la crítica al capitalismo industrial a las revoluciones del siglo XX.' },
        datasets: ['data/dados-socialismo-trabalho.json','data/dados-movimentos-sociais.json','data/dados-revolucao-russa.json'],
      },
      {
        id: 'q-abolicionismo',
        texto: { pt: 'Como a escravidão foi abolida?', en: 'How was slavery abolished?', es: '¿Cómo fue abolida la esclavitud?' },
        desc:  { pt: 'Das revoltas escravas ao abolicionismo britânico, da Guerra Civil americana à Lei Áurea — séculos de luta.',
                 en: 'From slave revolts to British abolitionism, from the American Civil War to Brazil\'s Golden Law — centuries of struggle.',
                 es: 'De las revueltas esclavas al abolicionismo británico, de la Guerra Civil americana a la Lei Áurea — siglos de lucha.' },
        datasets: ['data/dados-movimentos-sociais.json','data/dados-eua-guerra-civil.json','data/dados-brasil-colonial-escravidao.json','data/dados-descolonizacao.json'],
      },
      {
        id: 'q-feminismo',
        texto: { pt: 'Como surgiu o movimento pelos direitos das mulheres?', en: 'How did the women\'s rights movement emerge?', es: '¿Cómo surgió el movimiento por los derechos de la mujer?' },
        desc:  { pt: 'Das sufragistas ao feminismo de segunda onda — uma luta de dois séculos por igualdade política, jurídica e social.',
                 en: 'From the suffragists to second-wave feminism — a two-century struggle for political, legal and social equality.',
                 es: 'De las sufragistas al feminismo de segunda ola — una lucha de dos siglos por igualdad política, jurídica y social.' },
        datasets: ['data/dados-movimentos-sociais.json','data/dados-seculo-xix.json','data/dados-eua-seculo-xx.json'],
      },
      {
        id: 'q-nav-portugesas',
        texto: { pt: 'Por que Portugal explorou o mundo?', en: 'Why did Portugal explore the world?', es: '¿Por qué Portugal exploró el mundo?' },
        desc:  { pt: 'Henrique o Navegador, a rota para as Índias, Cabral — e como um país de 1 milhão de habitantes criou o primeiro império global.',
                 en: 'Henry the Navigator, the route to India, Cabral — and how a country of 1 million people created the first global empire.',
                 es: 'Enrique el Navegante, la ruta a la India, Cabral — y cómo un país de 1 millón de habitantes creó el primer imperio global.' },
        datasets: ['data/dados-navegacoes.json','data/dados-absolutismo.json','data/dados-americas-coloniais.json'],
      },
    ],
  },,

  {
    grupo: { pt: 'Mulheres na História', en: 'Women in History', es: 'Mujeres en la Historia' },
    itens: [
      {
        id: 'q-mulheres-poder',
        texto: { pt: 'Como as mulheres exerceram o poder ao longo da história?', en: 'How did women exercise power throughout history?', es: '¿Cómo ejercieron las mujeres el poder a lo largo de la historia?' },
        desc:  { pt: 'De Hatshepsut a Cleópatra, Wu Zetian a Indira Gandhi — como as mulheres chegaram ao poder em sociedades que sistematicamente as excluíam.',
                 en: 'From Hatshepsut to Cleopatra, Wu Zetian to Indira Gandhi — how women reached power in societies that systematically excluded them.',
                 es: 'De Hatshepsut a Cleopatra, Wu Zetian a Indira Gandhi — cómo las mujeres alcanzaron el poder en sociedades que las excluían.' },
        datasets: ['data/dados-personagens-mulheres.json','data/dados-egito-antigo.json','data/dados-china-tang.json','data/dados-india-moderna.json'],
      },
      {
        id: 'q-feminismo',
        texto: { pt: 'Como surgiu o movimento feminista?', en: 'How did the feminist movement emerge?', es: '¿Cómo surgió el movimiento feminista?' },
        desc:  { pt: 'De Mary Wollstonecraft e Sojourner Truth às sufragistas — a longa luta pelo reconhecimento de direitos iguais.',
                 en: 'From Mary Wollstonecraft and Sojourner Truth to the suffragettes — the long struggle for equal rights recognition.',
                 es: 'De Mary Wollstonecraft y Sojourner Truth a las sufragistas — la larga lucha por el reconocimiento de derechos iguales.' },
        datasets: ['data/dados-personagens-mulheres.json','data/dados-movimentos-sociais.json','data/dados-seculo-xix.json','data/dados-revolucoes-liberais.json'],
      },
      {
        id: 'q-mulheres-ciencia',
        texto: { pt: 'Por que as mulheres foram excluídas da ciência — e como resistiram?', en: 'Why were women excluded from science — and how did they resist?', es: '¿Por qué las mujeres fueron excluidas de la ciencia — y cómo resistieron?' },
        desc:  { pt: 'De Hypatia a Marie Curie a Ada Lovelace — mulheres que fizeram ciência apesar de todas as barreiras institucionais.',
                 en: 'From Hypatia to Marie Curie to Ada Lovelace — women who did science despite all institutional barriers.',
                 es: 'De Hipatia a Marie Curie a Ada Lovelace — mujeres que hicieron ciencia a pesar de todas las barreras.' },
        datasets: ['data/dados-personagens-mulheres.json','data/dados-ciencia-tecnologia.json','data/dados-revolucao-cientifica.json','data/dados-personagens-ciencia-pensamento.json'],
      },
    ],
  },
  {
    grupo: { pt: 'Filosofia Oriental e Sabedoria Asiática', en: 'Eastern Philosophy and Asian Wisdom', es: 'Filosofía Oriental y Sabiduría Asiática' },
    itens: [
      {
        id: 'q-confucianismo',
        texto: { pt: 'O que é o confucionismo e por que moldou a Ásia?', en: 'What is Confucianism and why did it shape Asia?', es: '¿Qué es el confucianismo y por qué moldeó Asia?' },
        desc:  { pt: 'As ideias de Confúcio sobre família, hierarquia e educação moldaram China, Japão, Coreia e Vietnã por 2.500 anos.',
                 en: "Confucius's ideas about family, hierarchy and education shaped China, Japan, Korea and Vietnam for 2,500 years.",
                 es: 'Las ideas de Confucio sobre familia, jerarquía y educación moldearon China, Japón, Corea y Vietnam por 2.500 años.' },
        datasets: ['data/dados-personagens-filosofia-oriental.json','data/dados-china-filosofia.json','data/dados-china-shang-zhou.json','data/dados-coreia-antiga.json'],
      },
      {
        id: 'q-budismo-expansao',
        texto: { pt: 'Como o budismo se espalhou por toda a Ásia?', en: 'How did Buddhism spread across Asia?', es: '¿Cómo se extendió el budismo por toda Asia?' },
        desc:  { pt: 'Da árvore bodhi na Índia às pagodas do Japão — a jornada de uma filosofia que atravessou montanhas e mares sem exércitos.',
                 en: 'From the bodhi tree in India to the pagodas of Japan — the journey of a philosophy that crossed mountains and seas without armies.',
                 es: 'Del árbol bodhi en India a las pagodas de Japón — el viaje de una filosofía que cruzó montañas y mares sin ejércitos.' },
        datasets: ['data/dados-personagens-filosofia-oriental.json','data/dados-india-vedica.json','data/dados-china-tang.json','data/dados-japao-arcaico.json','data/dados-sudeste-asiatico-continental.json'],
      },
      {
        id: 'q-taoismo',
        texto: { pt: 'O que é o Tao? Taoísmo, Zhuangzi e o caminho da natureza.', en: 'What is the Tao? Taoism, Zhuangzi and the way of nature.', es: '¿Qué es el Tao? Taoísmo, Zhuangzi y el camino de la naturaleza.' },
        desc:  { pt: 'O Tao Te Ching de Laozi e os paradoxos de Zhuangzi — uma filosofia que valoriza a não-ação, a natureza e o abandono do ego.',
                 en: "Laozi's Tao Te Ching and Zhuangzi's paradoxes — a philosophy that values non-action, nature and abandoning the ego.",
                 es: 'El Tao Te Ching de Laozi y las paradojas de Zhuangzi — una filosofía que valora la no-acción, la naturaleza y el abandono del ego.' },
        datasets: ['data/dados-personagens-filosofia-oriental.json','data/dados-china-filosofia.json'],
      },
    ],
  },
  {
    grupo: { pt: 'Século XX: Poder e Resistência', en: '20th Century: Power and Resistance', es: 'Siglo XX: Poder y Resistencia' },
    itens: [
      {
        id: 'q-anticolonialismo',
        texto: { pt: 'Como os povos colonizados resistiram e se libertaram?', en: 'How did colonized peoples resist and free themselves?', es: '¿Cómo resistieron y se liberaron los pueblos colonizados?' },
        desc:  { pt: 'De Gandhi a Ho Chi Minh, Lumumba a Nzinga — as estratégias da resistência anti-colonial em diferentes continentes.',
                 en: 'From Gandhi to Ho Chi Minh, Lumumba to Nzinga — the strategies of anti-colonial resistance across different continents.',
                 es: 'De Gandhi a Ho Chi Minh, Lumumba a Nzinga — las estrategias de resistencia anticolonial en diferentes continentes.' },
        datasets: ['data/dados-personagens-seculo-xx.json','data/dados-personagens-mulheres.json','data/dados-descolonizacao.json','data/dados-descolonizacao-guerras.json'],
      },
      {
        id: 'q-direitos-civis',
        texto: { pt: 'Como surgiu o Movimento pelos Direitos Civis nos EUA?', en: 'How did the Civil Rights Movement emerge in the USA?', es: '¿Cómo surgió el Movimiento por los Derechos Civiles en EE.UU.?' },
        desc:  { pt: 'De Rosa Parks a MLK, Frederick Douglass a Angela Davis — a longa luta por igualdade racial nos Estados Unidos.',
                 en: 'From Rosa Parks to MLK, Frederick Douglass to Angela Davis — the long fight for racial equality in the United States.',
                 es: 'De Rosa Parks a MLK, Frederick Douglass a Angela Davis — la larga lucha por la igualdad racial en Estados Unidos.' },
        datasets: ['data/dados-personagens-seculo-xx.json','data/dados-personagens-mulheres.json','data/dados-personagens-americas.json','data/dados-eua-seculo-xx.json','data/dados-movimentos-sociais.json'],
      },
      {
        id: 'q-fim-urss',
        texto: { pt: 'Como a União Soviética entrou em colapso?', en: 'How did the Soviet Union collapse?', es: '¿Cómo colapsó la Unión Soviética?' },
        desc:  { pt: 'De Gorbachev a Wałęsa — as forças internas e externas que desfizeram o segundo maior poder do século XX em menos de dois anos.',
                 en: 'From Gorbachev to Wałęsa — the internal and external forces that unraveled the second greatest power of the 20th century in less than two years.',
                 es: 'De Gorbachev a Wałęsa — las fuerzas internas y externas que deshicieron el segundo gran poder del siglo XX en menos de dos años.' },
        datasets: ['data/dados-personagens-seculo-xx.json','data/dados-guerra-fria.json','data/dados-pos-guerra-fria.json','data/dados-revolucao-russa.json'],
      },
      {
        id: 'q-africa-pos-colonial',
        texto: { pt: 'O que aconteceu com a África após a independência?', en: 'What happened to Africa after independence?', es: '¿Qué pasó con África después de la independencia?' },
        desc:  { pt: 'De Mandela a Lumumba, Wangari Maathai a Yaa Asantewaa — os sonhos e contradições da África pós-colonial.',
                 en: 'From Mandela to Lumumba, Wangari Maathai to Yaa Asantewaa — the dreams and contradictions of post-colonial Africa.',
                 es: 'De Mandela a Lumumba, Wangari Maathai a Yaa Asantewaa — los sueños y contradicciones de la África poscolonial.' },
        datasets: ['data/dados-personagens-seculo-xx.json','data/dados-personagens-mulheres.json','data/dados-personagens-africa-oriente.json','data/dados-descolonizacao.json','data/dados-africa-pre-colonial.json'],
      },
    ],
  },
  {
    grupo: { pt: 'América Latina: Conquista, Resistência e Revolução', en: 'Latin America: Conquest, Resistance and Revolution', es: 'América Latina: Conquista, Resistencia y Revolución' },
    itens: [
      {
        id: 'q-conquista-americas',
        texto: { pt: 'Como os europeus conquistaram as Américas?', en: 'How did Europeans conquer the Americas?', es: '¿Cómo conquistaron los europeos las Américas?' },
        desc:  { pt: 'De Hatuey a Moctezuma II — a perspectiva dos povos originários diante da conquista europeia.',
                 en: 'From Hatuey to Moctezuma II — the perspective of indigenous peoples in the face of European conquest.',
                 es: 'De Hatuey a Moctezuma II — la perspectiva de los pueblos originarios frente a la conquista europea.' },
        datasets: ['data/dados-personagens-americas.json','data/dados-astecas-expandido.json','data/dados-incas.json','data/dados-navegacoes.json','data/dados-era-moderna.json'],
      },
      {
        id: 'q-independencias-latam',
        texto: { pt: 'Como a América Latina se independentizou?', en: 'How did Latin America gain independence?', es: '¿Cómo se independizó América Latina?' },
        desc:  { pt: 'De Bolívar a San Martín — as guerras de independência que transformaram colônias espanholas e portuguesa em repúblicas.',
                 en: 'From Bolívar to San Martín — the independence wars that transformed Spanish and Portuguese colonies into republics.',
                 es: 'De Bolívar a San Martín — las guerras de independencia que transformaron colonias españolas y portuguesas en repúblicas.' },
        datasets: ['data/dados-personagens-americas.json','data/dados-independencias-america-latina.json','data/dados-brasil-09-independencia.json'],
      },
      {
        id: 'q-revolucoes-latam',
        texto: { pt: 'Por que a América Latina foi palco de tantas revoluções no século XX?', en: 'Why was Latin America home to so many revolutions in the 20th century?', es: '¿Por qué América Latina fue escenario de tantas revoluciones en el siglo XX?' },
        desc:  { pt: 'De Zapata a Allende, Che Guevara a Castro — as causas estruturais que fizeram da revolução uma tentação permanente.',
                 en: 'From Zapata to Allende, Che Guevara to Castro — the structural causes that made revolution a permanent temptation.',
                 es: 'De Zapata a Allende, Che Guevara a Castro — las causas estructurales que hicieron de la revolución una tentación permanente.' },
        datasets: ['data/dados-personagens-americas.json','data/dados-personagens-seculo-xx.json','data/dados-america-latina-contemporanea.json','data/dados-guerra-fria.json'],
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────

function getLang() {
  return window.getCurrentLang ? window.getCurrentLang() : 'pt';
}

function t(obj) {
  const l = getLang();
  return obj[l] || obj.pt || '';
}

// ── Panel rendering ───────────────────────────────

function buildPanel() {
  const overlay = document.createElement('div');
  overlay.id = 'questions-overlay';
  overlay.className = 'questions-overlay hidden';

  const panel = document.createElement('div');
  panel.className = 'questions-panel';

  // Header
  const header = document.createElement('div');
  header.className = 'questions-header';

  const title = document.createElement('h2');
  title.className = 'questions-title';
  title.setAttribute('data-i18n', 'questions_title');
  title.textContent = 'Perguntas Geradoras';
  header.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'questions-subtitle';
  subtitle.setAttribute('data-i18n', 'questions_subtitle');
  subtitle.textContent = 'Escolha uma pergunta para explorar os dados históricos relevantes.';
  header.appendChild(subtitle);

  const btnClose = document.createElement('button');
  btnClose.className = 'questions-close';
  btnClose.id = 'btnCloseQuestions';
  btnClose.textContent = 'x';
  btnClose.setAttribute('aria-label', 'Fechar');
  header.appendChild(btnClose);

  panel.appendChild(header);

  // Groups
  const body = document.createElement('div');
  body.className = 'questions-body';

  PERGUNTAS.forEach(grupo => {
    const section = document.createElement('section');
    section.className = 'questions-group';

    const groupTitle = document.createElement('h3');
    groupTitle.className = 'questions-group-title';
    groupTitle.textContent = t(grupo.grupo);
    section.appendChild(groupTitle);

    const grid = document.createElement('div');
    grid.className = 'questions-grid';

    grupo.itens.forEach(item => {
      const card = document.createElement('button');
      card.className = 'question-card';
      card.dataset.qid = item.id;

      const qtexto = document.createElement('strong');
      qtexto.className = 'question-card-title';
      qtexto.textContent = t(item.texto);
      card.appendChild(qtexto);

      const qdesc = document.createElement('p');
      qdesc.className = 'question-card-desc';
      qdesc.textContent = t(item.desc);
      card.appendChild(qdesc);

      const tags = document.createElement('div');
      tags.className = 'question-card-tags';
      item.datasets.slice(0, 3).forEach(ds => {
        const tag = document.createElement('span');
        tag.className = 'question-card-tag';
        tag.textContent = ds.replace('data/dados-', '').replace('.json', '').replace(/-/g, ' ');
        tags.appendChild(tag);
      });
      if (item.datasets.length > 3) {
        const more = document.createElement('span');
        more.className = 'question-card-tag question-card-tag-more';
        more.textContent = `+${item.datasets.length - 3}`;
        tags.appendChild(more);
      }
      card.appendChild(tags);

      card.addEventListener('click', () => activateQuestion(item));
      grid.appendChild(card);
    });

    section.appendChild(grid);
    body.appendChild(section);
  });

  panel.appendChild(body);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // Close on overlay click or button
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closePanel();
  });
  btnClose.addEventListener('click', closePanel);

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePanel();
  });
}

function openPanel() {
  const overlay = document.getElementById('questions-overlay');
  if (overlay) {
    // Refresh group titles in current language
    const l = getLang();
    const groups = overlay.querySelectorAll('.questions-group-title');
    PERGUNTAS.forEach((g, i) => {
      if (groups[i]) groups[i].textContent = t(g.grupo);
    });
    PERGUNTAS.forEach((g) => {
      g.itens.forEach(item => {
        const card = overlay.querySelector(`[data-qid="${item.id}"]`);
        if (!card) return;
        const titleEl = card.querySelector('.question-card-title');
        const descEl  = card.querySelector('.question-card-desc');
        if (titleEl) titleEl.textContent = t(item.texto);
        if (descEl)  descEl.textContent  = t(item.desc);
      });
    });
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closePanel() {
  const overlay = document.getElementById('questions-overlay');
  if (overlay) overlay.classList.add('hidden');
  document.body.style.overflow = '';
}

// ── Activate a question ───────────────────────────

function activateQuestion(item) {
  // 1. Uncheck all dataset checkboxes
  document.querySelectorAll('.dataset:checked').forEach(cb => { cb.checked = false; });

  // 2. Check the question's datasets (only those that exist in the DOM)
  item.datasets.forEach(ds => {
    const cb = document.querySelector(`.dataset[value="${ds}"]`);
    if (cb) cb.checked = true;
  });

  // 3. Close the panel
  closePanel();

  // 4. Trigger graph rendering
  if (window.aplicarFiltros) {
    window.aplicarFiltros();
  }

  // 5. Flash the visualize button briefly as feedback
  const btnViz = document.querySelector('#btn-visualizar') || document.querySelector('[id*="visualiz"]');
  if (btnViz) {
    btnViz.classList.add('btn-flash');
    setTimeout(() => btnViz.classList.remove('btn-flash'), 600);
  }
}

// ── Init ──────────────────────────────────────────

export function initQuestions() {
  buildPanel();

  const btn = document.getElementById('btn-questions');
  if (btn) btn.addEventListener('click', openPanel);

  // Expose for lang changes
  window.refreshQuestionsLang = () => {
    const overlay = document.getElementById('questions-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      openPanel(); // re-render titles
    }
  };
}
