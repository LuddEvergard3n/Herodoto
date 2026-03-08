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
        id: 'q-china-invencoes',
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
        datasets: ['data/dados-personagens-mulheres.json','data/dados-egito-antigo.json','data/dados-china-tang.json','data/dados-india-britanica.json'],
      },
      {
        id: 'q-feminismo-b',
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
        datasets: ['data/dados-personagens-filosofia-oriental.json','data/dados-india-vedica-maurya.json','data/dados-china-tang.json','data/dados-japao-arcaico.json','data/dados-sudeste-asiatico-continental.json'],
      },
      {
        id: 'q-taoismo',
        texto: { pt: 'O que é o Tao? Taoísmo, Zhuangzi e o caminho da natureza.', en: 'What is the Tao? Taoism, Zhuangzi and the way of nature.', es: '¿Qué es el Tao? Taoísmo, Zhuangzi y el camino de la naturaleza.' },
        desc:  { pt: 'O Tao Te Ching de Laozi e os paradoxos de Zhuangzi — uma filosofia que valoriza a não-ação, a natureza e o abandono do ego.',
                 en: "Laozi's Tao Te Ching and Zhuangzi\'s paradoxes — a philosophy that values non-action, nature and abandoning the ego.",
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
        datasets: ['data/dados-personagens-americas.json','data/dados-personagens-seculo-xx.json','data/dados-america-latina-sec20.json','data/dados-guerra-fria.json'],
      },
    ],
  },,

  // ══════════════════════════════════════════════════════════════════════
  // NOVOS GRUPOS v7.27
  // ══════════════════════════════════════════════════════════════════════

  {
    grupo: { pt: 'Brasil: Período a Período', en: 'Brazil: Period by Period', es: 'Brasil: Período a Período' },
    itens: [
      {
        id: 'q-br-povos-originarios',
        texto: { pt: 'Quem eram os povos originários do Brasil antes de 1500?', en: 'Who were Brazil\'s indigenous peoples before 1500?', es: '¿Quiénes eran los pueblos originarios de Brasil antes de 1500?' },
        desc:  { pt: 'Tupi, Guarani, Macro-Jê e centenas de outros povos — a diversidade humana que existia nas terras que se tornariam o Brasil.', en: 'Tupi, Guarani, Macro-Jê and hundreds of other peoples — the human diversity that existed in the lands that would become Brazil.', es: 'Tupi, Guaraní, Macro-Jê y cientos de otros pueblos — la diversidad humana que existía en las tierras que se convertirían en Brasil.' },
        datasets: ['data/dados-brasil-01-povos-originarios.json','data/dados-brasil-indigenas.json','data/dados-brasil-precolonial.json'],
      },
      {
        id: 'q-br-pre-colonial',
        texto: { pt: 'Como foi o primeiro contato entre portugueses e nativos?', en: 'What was the first contact between Portuguese and natives like?', es: '¿Cómo fue el primer contacto entre portugueses y nativos?' },
        desc:  { pt: 'De Cabral e Caminha ao início da exploração — os primeiros 50 anos de estranhamento, comércio e violência.', en: 'From Cabral and Caminha to the start of exploitation — the first 50 years of strangeness, trade and violence.', es: 'De Cabral y Caminha al inicio de la explotación — los primeros 50 años de extrañeza, comercio y violencia.' },
        datasets: ['data/dados-brasil-02-pre-colonial.json','data/dados-brasil-01-povos-originarios.json','data/dados-navegacoes.json'],
      },
      {
        id: 'q-br-capitanias',
        texto: { pt: 'Por que Portugal criou as Capitanias Hereditárias?', en: 'Why did Portugal create the Hereditary Captaincies?', es: '¿Por qué Portugal creó las Capitanías Hereditarias?' },
        desc:  { pt: 'A solução portuguesa para colonizar um território imenso com recursos limitados — e por que quase não funcionou.', en: 'The Portuguese solution to colonize a vast territory with limited resources — and why it almost failed.', es: 'La solución portuguesa para colonizar un territorio inmenso con recursos limitados — y por qué casi no funcionó.' },
        datasets: ['data/dados-brasil-03-capitanias.json','data/dados-brasil-04-governo-geral.json','data/dados-brasil-02-pre-colonial.json'],
      },
      {
        id: 'q-br-governo-geral',
        texto: { pt: 'O que foi o Governo-Geral e como ele reorganizou o Brasil colonial?', en: 'What was the General Government and how did it reorganize colonial Brazil?', es: '¿Qué fue el Gobierno General y cómo reorganizó el Brasil colonial?' },
        desc:  { pt: 'Tomé de Sousa, jesuítas e a fundação de Salvador — a segunda tentativa de colonizar o Brasil, desta vez com sucesso.', en: 'Tomé de Sousa, Jesuits and the founding of Salvador — the second attempt to colonize Brazil, this time successfully.', es: 'Tomé de Sousa, jesuitas y la fundación de Salvador — el segundo intento de colonizar Brasil, esta vez con éxito.' },
        datasets: ['data/dados-brasil-04-governo-geral.json','data/dados-brasil-missoes-jesuiticas.json','data/dados-brasil-03-capitanias.json'],
      },
      {
        id: 'q-br-uniao-iberica',
        texto: { pt: 'O que aconteceu ao Brasil durante a União Ibérica (1580–1640)?', en: 'What happened to Brazil during the Iberian Union (1580–1640)?', es: '¿Qué pasó con Brasil durante la Unión Ibérica (1580-1640)?' },
        desc:  { pt: 'Quando Portugal e Espanha se fundiram sob Felipe II — e os holandeses aproveitaram para invadir o Nordeste brasileiro.', en: 'When Portugal and Spain merged under Philip II — and the Dutch seized the opportunity to invade northeastern Brazil.', es: 'Cuando Portugal y España se fusionaron bajo Felipe II — y los holandeses aprovecharon para invadir el noreste de Brasil.' },
        datasets: ['data/dados-brasil-05-uniao-iberica.json','data/dados-brasil-04-governo-geral.json'],
      },
      {
        id: 'q-br-bandeirismo',
        texto: { pt: 'Quem foram os bandeirantes e o que eles realmente fizeram?', en: 'Who were the bandeirantes and what did they actually do?', es: '¿Quiénes fueron los bandeirantes y qué hicieron realmente?' },
        desc:  { pt: 'Heróis ou criminosos? Os bandeirantes expandiram o território brasileiro — e escravizaram e massacraram indígenas. A história completa.', en: 'Heroes or criminals? The bandeirantes expanded Brazilian territory — and enslaved and massacred indigenous people. The complete story.', es: '¿Héroes o criminales? Los bandeirantes expandieron el territorio brasileño — y esclavizaron y masacraron indígenas. La historia completa.' },
        datasets: ['data/dados-brasil-06-bandeirismo.json','data/dados-brasil-indigenas.json','data/dados-brasil-missoes-jesuiticas.json'],
      },
      {
        id: 'q-br-ciclo-ouro',
        texto: { pt: 'O que foi o Ciclo do Ouro e o que ele deixou para o Brasil?', en: 'What was the Gold Cycle and what did it leave for Brazil?', es: '¿Qué fue el Ciclo del Oro y qué dejó para Brasil?' },
        desc:  { pt: 'Minas Gerais, Vila Rica e a Inconfidência — como o ouro criou a primeira sociedade urbana brasileira e depois a destruiu.', en: 'Minas Gerais, Vila Rica and the Inconfidência — how gold created Brazil\'s first urban society and then destroyed it.', es: 'Minas Gerais, Vila Rica y la Inconfidencia — cómo el oro creó la primera sociedad urbana brasileña y luego la destruyó.' },
        datasets: ['data/dados-brasil-07-ciclo-ouro.json','data/dados-brasil-inconfidencia.json','data/dados-brasil-missoes-jesuiticas.json'],
      },
      {
        id: 'q-br-periodo-joanino',
        texto: { pt: 'Por que a família real portuguesa fugiu para o Brasil em 1808?', en: 'Why did the Portuguese royal family flee to Brazil in 1808?', es: '¿Por qué la familia real portuguesa huyó a Brasil en 1808?' },
        desc:  { pt: 'Napoleão, a Corte no Rio e a abertura dos portos — como a invasão francesa acidentalmente acelerou a independência do Brasil.', en: 'Napoleon, the Court in Rio and the opening of ports — how the French invasion accidentally accelerated Brazilian independence.', es: 'Napoleón, la Corte en Río y la apertura de los puertos — cómo la invasión francesa acidentalmente aceleró la independencia de Brasil.' },
        datasets: ['data/dados-brasil-08-joanino.json','data/dados-brasil-inconfidencia.json','data/dados-guerras-napoleonicas.json'],
      },
      {
        id: 'q-br-periodo-regencial',
        texto: { pt: 'O que foi o Período Regencial e por que o Brasil quase se fragmentou?', en: 'What was the Regency Period and why did Brazil almost fragment?', es: '¿Qué fue el Período Regencial y por qué Brasil casi se fragmentó?' },
        desc:  { pt: 'Cabanagem, Balaiada, Farroupilha, Sabinada — a década mais turbulenta da história brasileira (1831–1840).', en: 'Cabanagem, Balaiada, Farroupilha, Sabinada — the most turbulent decade in Brazilian history (1831–1840).', es: 'Cabanagem, Balaiada, Farroupilha, Sabinada — la década más turbulenta de la historia brasileña (1831-1840).' },
        datasets: ['data/dados-brasil-10-regencial.json','data/dados-brasil-indigenas.json','data/dados-brasil-quilombos.json'],
      },
      {
        id: 'q-br-segundo-reinado',
        texto: { pt: 'Como foi o Brasil do Segundo Reinado sob Dom Pedro II?', en: 'What was Brazil like under Dom Pedro II\'s Second Reign?', es: '¿Cómo fue Brasil durante el Segundo Reinado de Dom Pedro II?' },
        desc:  { pt: 'O Brasil mais estável de sua história — e também o maior escravista do século XIX. A Guerra do Paraguai, o café e a abolição.', en: 'Brazil\'s most stable period — and also its largest slaveholder in the 19th century. The Paraguayan War, coffee and abolition.', es: 'El período más estable de Brasil — y también el mayor esclavista del siglo XIX. La Guerra del Paraguay, el café y la abolición.' },
        datasets: ['data/dados-brasil-11-segundo-reinado.json','data/dados-brasil-guerra-paraguai.json','data/dados-brasil-imperio-infraestrutura.json','data/dados-brasil-imperio-ciencia.json'],
      },
      {
        id: 'q-br-republica-velha',
        texto: { pt: 'O que foi a República Velha e por que ela entrou em colapso?', en: 'What was the Old Republic and why did it collapse?', es: '¿Qué fue la República Vieja y por qué colapsó?' },
        desc:  { pt: 'Café com leite, coronelismo e Canudos — a Primeira República brasileira e sua crise nos anos 1920.', en: 'Coffee with milk, coronelismo and Canudos — Brazil\'s First Republic and its crisis in the 1920s.', es: 'Café con leche, coronelismo y Canudos — la Primera República brasileña y su crisis en los años 1920.' },
        datasets: ['data/dados-brasil-12-republica-velha.json','data/dados-brasil-revoltas-republica.json','data/dados-brasil-cultura-arte.json'],
      },
      {
        id: 'q-br-era-vargas',
        texto: { pt: 'Quem foi Getúlio Vargas e o que ele mudou no Brasil?', en: 'Who was Getúlio Vargas and what did he change in Brazil?', es: '¿Quién fue Getúlio Vargas y qué cambió en Brasil?' },
        desc:  { pt: 'O "pai dos pobres" que também foi ditador — a Era Vargas (1930–1954) e suas contradições entre modernização e autoritarismo.', en: 'The "father of the poor" who was also a dictator — the Vargas Era (1930–1954) and its contradictions between modernization and authoritarianism.', es: 'El "padre de los pobres" que también fue dictador — la Era Vargas (1930-1954) y sus contradicciones entre modernización y autoritarismo.' },
        datasets: ['data/dados-brasil-13-era-vargas.json','data/dados-brasil-revoltas-republica.json','data/dados-brasil-economia-social.json'],
      },
      {
        id: 'q-br-populismo',
        texto: { pt: 'O que foi a República Populista brasileira (1945–1964)?', en: 'What was Brazil\'s Populist Republic (1945–1964)?', es: '¿Qué fue la República Populista brasileña (1945-1964)?' },
        desc:  { pt: 'JK e Brasília, Jango e as reformas de base — a democracia populista que antecedeu o golpe militar de 1964.', en: 'JK and Brasília, Jango and the base reforms — the populist democracy that preceded the 1964 military coup.', es: 'JK y Brasilia, Jango y las reformas de base — la democracia populista que precedió al golpe militar de 1964.' },
        datasets: ['data/dados-brasil-14-populismo.json','data/dados-brasil-economia-social.json','data/dados-brasil-cultura-arte.json'],
      },
      {
        id: 'q-br-ditadura',
        texto: { pt: 'Como funcionou a ditadura militar brasileira (1964–1985)?', en: 'How did the Brazilian military dictatorship work (1964–1985)?', es: '¿Cómo funcionó la dictadura militar brasileña (1964-1985)?' },
        desc:  { pt: 'AI-5, milagre econômico, tortura e guerrilha — os 21 anos de ditadura e as marcas que deixaram na democracia brasileira.', en: 'AI-5, economic miracle, torture and guerrilla — the 21 years of dictatorship and the marks left on Brazilian democracy.', es: 'AI-5, milagro económico, tortura y guerrilla — los 21 años de dictadura y las marcas que dejaron en la democracia brasileña.' },
        datasets: ['data/dados-brasil-15-ditadura.json','data/dados-brasil-revoltas-republica.json','data/dados-brasil-economia-social.json'],
      },
      {
        id: 'q-br-nova-republica',
        texto: { pt: 'Como o Brasil se redemocratizou e quais são os desafios da Nova República?', en: 'How did Brazil democratize and what are the challenges of the New Republic?', es: '¿Cómo se democratizó Brasil y cuáles son los desafíos de la Nueva República?' },
        desc:  { pt: 'Da Constituição de 1988 ao Plano Real — a redemocratização brasileira e os 35 anos de democracia com desigualdade persistente.', en: 'From the 1988 Constitution to the Real Plan — Brazil\'s re-democratization and 35 years of democracy with persistent inequality.', es: 'De la Constitución de 1988 al Plan Real — la redemocratización brasileña y 35 años de democracia con desigualdad persistente.' },
        datasets: ['data/dados-brasil-16-nova-republica.json','data/dados-brasil-contemporaneo.json','data/dados-brasil-economia-social.json'],
      },
      {
        id: 'q-br-guerra-paraguai',
        texto: { pt: 'Por que o Brasil travou a maior guerra da América do Sul?', en: 'Why did Brazil fight South America\'s largest war?', es: '¿Por qué Brasil libró la mayor guerra de América del Sur?' },
        desc:  { pt: 'A Guerra do Paraguai (1864–1870) destruiu 60–70% da população paraguaia. Causas, consequências e debates historiográficos.', en: 'The Paraguayan War (1864–1870) destroyed 60–70% of Paraguay\'s population. Causes, consequences and historiographical debates.', es: 'La Guerra del Paraguay (1864-1870) destruyó el 60-70% de la población paraguaya. Causas, consecuencias y debates historiográficos.' },
        datasets: ['data/dados-brasil-guerra-paraguai.json','data/dados-brasil-11-segundo-reinado.json','data/dados-independencias-america-latina.json'],
      },
    ],
  },

  {
    grupo: { pt: 'China: Da Antiguidade ao Presente', en: 'China: From Antiquity to the Present', es: 'China: De la Antigüedad al Presente' },
    itens: [
      {
        id: 'q-china-neolitico',
        texto: { pt: 'Como nasceu a civilização chinesa?', en: 'How was Chinese civilization born?', es: '¿Cómo nació la civilización china?' },
        desc:  { pt: 'Do Neolítico de Yangshao às primeiras dinastias — as origens de uma civilização que duraria 4.000 anos sem interrupção.', en: 'From the Yangshao Neolithic to the first dynasties — the origins of a civilization that would last 4,000 years without interruption.', es: 'Del Neolítico de Yangshao a las primeras dinastías — los orígenes de una civilización que duraría 4.000 años sin interrupción.' },
        datasets: ['data/dados-china-neolitico.json','data/dados-china-shang-zhou.json','data/dados-china-antiga.json'],
      },
      {
        id: 'q-china-tres-reinos',
        texto: { pt: 'O que foi o período dos Três Reinos — a era mais romanticizada da China?', en: 'What was the Three Kingdoms period — China\'s most romanticized era?', es: '¿Qué fue el período de los Tres Reinos — la era más romantizada de China?' },
        desc:  { pt: 'Cao Cao, Liu Bei e Sun Quan — a fragmentação após Han que inspirou um dos maiores romances históricos do mundo.', en: 'Cao Cao, Liu Bei and Sun Quan — the fragmentation after Han that inspired one of the world\'s greatest historical novels.', es: 'Cao Cao, Liu Bei y Sun Quan — la fragmentación después de Han que inspiró una de las mayores novelas históricas del mundo.' },
        datasets: ['data/dados-china-tres-reinos.json','data/dados-china-qin-han.json'],
      },
      {
        id: 'q-china-ming-exploracoes',
        texto: { pt: 'Por que a China abandonou a exploração marítima no século XV?', en: 'Why did China abandon maritime exploration in the 15th century?', es: '¿Por qué China abandonó la exploración marítima en el siglo XV?' },
        desc:  { pt: 'Zheng He navegou até a África 70 anos antes de Vasco da Gama. Depois a China proibiu os barcos. Por quê? E o que mudaria se não tivesse?', en: 'Zheng He sailed to Africa 70 years before Vasco da Gama. Then China banned the boats. Why? And what would have changed if it hadn\'t?', es: 'Zheng He navegó hasta África 70 años antes que Vasco da Gama. Luego China prohibió los barcos. ¿Por qué? ¿Y qué habría cambiado si no lo hubiera hecho?' },
        datasets: ['data/dados-china-ming-exploracoes.json','data/dados-china-ming.json','data/dados-navegacoes.json'],
      },
      {
        id: 'q-china-qing',
        texto: { pt: 'Como a China passou de maior potência do mundo a "homem doente da Ásia"?', en: 'How did China go from the world\'s greatest power to the "sick man of Asia"?', es: '¿Cómo pasó China de ser la mayor potencia del mundo al "hombre enfermo de Asia"?' },
        desc:  { pt: 'A Dinastia Qing, as Guerras do Ópio, os tratados desiguais e a humilhação que moldou o nacionalismo chinês moderno.', en: 'The Qing Dynasty, the Opium Wars, unequal treaties and the humiliation that shaped modern Chinese nationalism.', es: 'La Dinastía Qing, las Guerras del Opio, los tratados desiguales y la humillación que moldeó el nacionalismo chino moderno.' },
        datasets: ['data/dados-china-qing.json','data/dados-china-qing-sociedade.json','data/dados-china-imperial.json','data/dados-imperialismo-colonial.json'],
      },
      {
        id: 'q-china-imperial-sistema',
        texto: { pt: 'Como o sistema imperial chinês durou mais de 2.000 anos?', en: 'How did the Chinese imperial system last more than 2,000 years?', es: '¿Cómo duró más de 2.000 años el sistema imperial chino?' },
        desc:  { pt: 'O mandarinato, o serviço civil por mérito, o "mandato do céu" — as instituições que mantiveram a China unida por milênios.', en: 'The mandarin system, merit-based civil service, the "mandate of heaven" — the institutions that kept China united for millennia.', es: 'El sistema mandarín, el servicio civil por méritos, el "mandato del cielo" — las instituciones que mantuvieron a China unida por milenios.' },
        datasets: ['data/dados-china-imperial.json','data/dados-china-song-yuan.json','data/dados-china-tang.json','data/dados-china-qin-han.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Estados Unidos: Da Colônia à Superpotência', en: 'United States: From Colony to Superpower', es: 'Estados Unidos: De Colonia a Superpotencia' },
    itens: [
      {
        id: 'q-eua-colonias-independencia',
        texto: { pt: 'Por que as 13 colônias se rebelaram contra a Grã-Bretanha?', en: 'Why did the 13 colonies rebel against Great Britain?', es: '¿Por qué las 13 colonias se rebelaron contra Gran Bretaña?' },
        desc:  { pt: '"Nenhuma tributação sem representação" — as causas econômicas, filosóficas e políticas da Revolução Americana.', en: '"No taxation without representation" — the economic, philosophical and political causes of the American Revolution.', es: '"Ningún impuesto sin representación" — las causas económicas, filosóficas y políticas de la Revolución Americana.' },
        datasets: ['data/dados-eua-colonias.json','data/dados-eua-fundacao.json','data/dados-revolucoes-liberais.json'],
      },
      {
        id: 'q-eua-expansao-guerra-civil',
        texto: { pt: 'Como a escravidão destruiu a república americana — e como foi reconstruída?', en: 'How did slavery destroy the American republic — and how was it rebuilt?', es: '¿Cómo la esclavitud destruyó la república americana — y cómo fue reconstruida?' },
        desc:  { pt: 'Da expansão para o Oeste à Guerra Civil (1861–65) — a contradição fundamental entre os ideais fundadores e a escravidão.', en: 'From westward expansion to the Civil War (1861–65) — the fundamental contradiction between founding ideals and slavery.', es: 'De la expansión hacia el Oeste a la Guerra Civil (1861-65) — la contradicción fundamental entre los ideales fundadores y la esclavitud.' },
        datasets: ['data/dados-eua-expansao-civil.json','data/dados-personagens-americas.json','data/dados-movimentos-sociais.json'],
      },
      {
        id: 'q-eua-industrializacao-gilded',
        texto: { pt: 'Como os EUA se tornaram a maior economia do mundo entre 1870 e 1920?', en: 'How did the US become the world\'s largest economy between 1870 and 1920?', es: '¿Cómo se convirtieron los EE.UU. en la mayor economía del mundo entre 1870 y 1920?' },
        desc:  { pt: 'A Gilded Age, os robber barons, os imigrantes e o movimento trabalhista — o preço do crescimento mais rápido da história.', en: 'The Gilded Age, robber barons, immigrants and the labor movement — the price of the fastest growth in history.', es: 'La Gilded Age, los barones ladrones, los inmigrantes y el movimiento obrero — el precio del crecimiento más rápido de la historia.' },
        datasets: ['data/dados-eua-gilded-age.json','data/dados-eua-industrializacao.json','data/dados-capitalismo.json','data/dados-socialismo-trabalho.json'],
      },
      {
        id: 'q-eua-guerras-mundiais-hegemonia',
        texto: { pt: 'Como as duas guerras mundiais tornaram os EUA a potência dominante?', en: 'How did the two world wars make the US the dominant power?', es: '¿Cómo las dos guerras mundiales convirtieron a los EE.UU. en la potencia dominante?' },
        desc:  { pt: 'Os EUA entraram em ambas as guerras tarde e saíram como vencedores. Como transformaram destruição europeia em hegemonia americana.', en: 'The US entered both wars late and emerged as victors. How they transformed European destruction into American hegemony.', es: 'Los EE.UU. entraron tarde en ambas guerras y salieron como vencedores. Cómo transformaron la destrucción europea en hegemonía americana.' },
        datasets: ['data/dados-eua-guerras-mundiais.json','data/dados-eua-seculo-xx.json','data/dados-primeira-guerra.json','data/dados-segunda-guerra.json'],
      },
      {
        id: 'q-eua-contemporaneo',
        texto: { pt: 'O que molda a política americana desde o fim da Guerra Fria?', en: 'What shapes American politics since the end of the Cold War?', es: '¿Qué moldea la política americana desde el fin de la Guerra Fría?' },
        desc:  { pt: 'Do 11 de setembro à polarização política — como os EUA lideram o mundo enquanto se fragmentam por dentro.', en: 'From 9/11 to political polarization — how the US leads the world while fragmenting from within.', es: 'Del 11 de septiembre a la polarización política — cómo los EE.UU. lideran el mundo mientras se fragmentan por dentro.' },
        datasets: ['data/dados-eua-contemporaneo.json','data/dados-pos-guerra-fria.json','data/dados-eua-seculo-xx.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Pérsia e Irã: 2.500 Anos de Civilização', en: 'Persia and Iran: 2,500 Years of Civilization', es: 'Persia e Irán: 2.500 Años de Civilización' },
    itens: [
      {
        id: 'q-persia-aquemenida',
        texto: { pt: 'Como Ciro, o Grande, criou o maior império do mundo antigo?', en: 'How did Cyrus the Great create the largest empire in the ancient world?', es: '¿Cómo creó Ciro el Grande el mayor imperio del mundo antiguo?' },
        desc:  { pt: 'O Império Aquemênida e o Cilindro de Ciro — o primeiro projeto de direitos humanos da história e a arte persa de governar a diversidade.', en: 'The Achaemenid Empire and the Cyrus Cylinder — history\'s first human rights project and the Persian art of governing diversity.', es: 'El Imperio Aqueménida y el Cilindro de Ciro — el primer proyecto de derechos humanos de la historia y el arte persa de gobernar la diversidad.' },
        datasets: ['data/dados-persia-antiga.json','data/dados-persia.json','data/dados-persia-expandida.json'],
      },
      {
        id: 'q-iran-moderno',
        texto: { pt: 'O que foi a Revolução Iraniana de 1979 e por que ainda importa?', en: 'What was the 1979 Iranian Revolution and why does it still matter?', es: '¿Qué fue la Revolución Iraní de 1979 y por qué sigue importando?' },
        desc:  { pt: 'A única revolução islâmica bem-sucedida do século XX — e como ela reconfigurou o Oriente Médio e as relações com o Ocidente.', en: 'The only successful Islamic revolution of the 20th century — and how it reconfigured the Middle East and relations with the West.', es: 'La única revolución islámica exitosa del siglo XX — y cómo reconfiguró el Oriente Medio y las relaciones con Occidente.' },
        datasets: ['data/dados-iran-moderno.json','data/dados-mesopotamia.json','data/dados-pos-guerra-fria.json'],
      },
      {
        id: 'q-zoroastrismo-b',
        texto: { pt: 'O que é o zoroastrismo e por que influenciou as três grandes religiões monoteístas?', en: 'What is Zoroastrianism and why did it influence the three great monotheistic religions?', es: '¿Qué es el zoroastrismo y por qué influyó en las tres grandes religiones monoteístas?' },
        desc:  { pt: 'Zaratustra, Ahura Mazda e a batalha entre bem e mal — como a religião persa deu ao judaísmo, ao cristianismo e ao islã seus conceitos fundamentais.', en: 'Zarathustra, Ahura Mazda and the battle between good and evil — how Persian religion gave Judaism, Christianity and Islam their fundamental concepts.', es: 'Zaratustra, Ahura Mazda y la batalla entre el bien y el mal — cómo la religión persa dio al judaísmo, al cristianismo y al islam sus conceptos fundamentales.' },
        datasets: ['data/dados-persia-zoroastrismo-cultura.json','data/dados-persia-expandida.json','data/dados-personagens-oriente-antigo.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Igreja Católica e Cristianismo', en: 'Catholic Church and Christianity', es: 'Iglesia Católica y Cristianismo' },
    itens: [
      {
        id: 'q-igreja-ciencia-conflito',
        texto: { pt: 'A Igreja realmente perseguiu a ciência? O caso Galileu e outros.', en: 'Did the Church really persecute science? The Galileo case and others.', es: '¿La Iglesia realmente persiguió la ciencia? El caso Galileo y otros.' },
        desc:  { pt: 'A relação entre ciência e religião é mais complexa do que o mito do "conflito eterno" — mas houve perseguições reais. Galileu, Bruno e a Inquisição.', en: 'The relationship between science and religion is more complex than the "eternal conflict" myth — but there were real persecutions. Galileo, Bruno and the Inquisition.', es: 'La relación entre ciencia y religión es más compleja que el mito del "conflicto eterno" — pero hubo persecuciones reales. Galileo, Bruno y la Inquisición.' },
        datasets: ['data/dados-igreja-ciencia.json','data/dados-inquisicao.json','data/dados-revolucao-cientifica.json','data/dados-concilios-ecumenicos.json'],
      },
      {
        id: 'q-inquisicao',
        texto: { pt: 'O que foi realmente a Inquisição — e o que ela não foi?', en: 'What was the Inquisition really — and what was it not?', es: '¿Qué fue realmente la Inquisición — y qué no fue?' },
        desc:  { pt: 'Separando mito de realidade: a Inquisição foi brutal, mas diferente do que os protestantes narraram. Números, vítimas e contexto histórico.', en: 'Separating myth from reality: the Inquisition was brutal, but different from what Protestants narrated. Numbers, victims and historical context.', es: 'Separando mito de realidad: la Inquisición fue brutal, pero diferente de lo que los protestantes narraron. Números, víctimas y contexto histórico.' },
        datasets: ['data/dados-inquisicao.json','data/dados-igreja-fundacao.json','data/dados-reformas-religiosas.json'],
      },
      {
        id: 'q-igreja-escravidao',
        texto: { pt: 'Qual foi o papel da Igreja Católica na escravidão?', en: 'What was the Catholic Church\'s role in slavery?', es: '¿Cuál fue el papel de la Iglesia Católica en la esclavitud?' },
        desc:  { pt: 'Da Bula Dum Diversas de 1452 à abolição — como a Igreja justificou, lucrou e eventualmente condenou a escravidão.', en: 'From the 1452 Bull Dum Diversas to abolition — how the Church justified, profited from and eventually condemned slavery.', es: 'De la Bula Dum Diversas de 1452 a la abolición — cómo la Iglesia justificó, se benefició y finalmente condenó la esclavitud.' },
        datasets: ['data/dados-igreja-escravidao.json','data/dados-era-moderna.json','data/dados-africa-pre-colonial.json'],
      },
      {
        id: 'q-concilios',
        texto: { pt: 'Como os Concílios Ecumênicos moldaram o dogma cristão?', en: 'How did the Ecumenical Councils shape Christian dogma?', es: '¿Cómo moldearon los Concilios Ecuménicos el dogma cristiano?' },
        desc:  { pt: 'Niceia, Éfeso, Trento e Vaticano II — quando bispos se reuniam para decidir o que os cristãos deviam acreditar, e o que acontecia com quem discordava.', en: 'Nicaea, Ephesus, Trent and Vatican II — when bishops met to decide what Christians should believe, and what happened to those who disagreed.', es: 'Nicea, Éfeso, Trento y Vaticano II — cuando los obispos se reunían para decidir lo que los cristianos debían creer, y qué pasaba con quienes discrepaban.' },
        datasets: ['data/dados-concilios-ecumenicos.json','data/dados-igreja-fundacao.json','data/dados-reformas-religiosas.json'],
      },
      {
        id: 'q-reformas-religiosas',
        texto: { pt: 'Além de Lutero: as outras reformas religiosas do século XVI.', en: 'Beyond Luther: the other religious reforms of the 16th century.', es: 'Más allá de Lutero: las otras reformas religiosas del siglo XVI.' },
        desc:  { pt: 'Calvino, Zuínglio, Henrique VIII — a Reforma não foi um evento único mas um conjunto de revoltas contra Roma com motivações muito diferentes.', en: 'Calvin, Zwingli, Henry VIII — the Reformation was not a single event but a set of revolts against Rome with very different motivations.', es: 'Calvino, Zuinglio, Enrique VIII — la Reforma no fue un evento único sino un conjunto de revueltas contra Roma con motivaciones muy diferentes.' },
        datasets: ['data/dados-reformas-religiosas.json','data/dados-lutero-reforma.json','data/dados-reforma-protestante.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Oriente Médio Contemporâneo', en: 'Contemporary Middle East', es: 'Oriente Medio Contemporáneo' },
    itens: [
      {
        id: 'q-israel-palestina',
        texto: { pt: 'Como surgiu o conflito israelense-palestino?', en: 'How did the Israeli-Palestinian conflict arise?', es: '¿Cómo surgió el conflicto israelí-palestino?' },
        desc:  { pt: 'Do Sionismo à Nakba, dos Acordos de Oslo à situação atual — as raízes históricas do conflito mais debatido do mundo.', en: 'From Zionism to the Nakba, from the Oslo Accords to the current situation — the historical roots of the world\'s most debated conflict.', es: 'Del Sionismo a la Nakba, de los Acuerdos de Oslo a la situación actual — las raíces históricas del conflicto más debatido del mundo.' },
        datasets: ['data/dados-israel-palestina.json','data/dados-mesopotamia.json','data/dados-descolonizacao.json'],
      },
      {
        id: 'q-arabia-saudita',
        texto: { pt: 'Como a Arábia Saudita foi criada — e que papel o petróleo joga na política global?', en: 'How was Saudi Arabia created — and what role does oil play in global politics?', es: '¿Cómo fue creada Arabia Saudita — y qué papel juega el petróleo en la política global?' },
        desc:  { pt: 'Ibn Saud, o Wahhabismo e o pacto com o petróleo americano — a aliança que moldou o Oriente Médio moderno.', en: 'Ibn Saud, Wahhabism and the pact with American oil — the alliance that shaped the modern Middle East.', es: 'Ibn Saud, el wahhabismo y el pacto con el petróleo americano — la alianza que moldeó el Oriente Medio moderno.' },
        datasets: ['data/dados-arabia-saudita.json','data/dados-mesopotamia.json','data/dados-expansao-isla.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Mongóis e Ásia Central', en: 'Mongols and Central Asia', es: 'Mongoles y Asia Central' },
    itens: [
      {
        id: 'q-mongois-conquista',
        texto: { pt: 'Como Gengis Khan conquistou metade do mundo?', en: 'How did Genghis Khan conquer half the world?', es: '¿Cómo conquistó Gengis Kan la mitad del mundo?' },
        desc:  { pt: 'A maior conquista territorial da história — as táticas militares, a organização política e o impacto devastador dos mongóis na Eurásia.', en: 'The greatest territorial conquest in history — the military tactics, political organization and devastating impact of the Mongols on Eurasia.', es: 'La mayor conquista territorial de la historia — las tácticas militares, la organización política y el devastador impacto de los mongoles en Eurasia.' },
        datasets: ['data/dados-mongois-asia-central.json','data/dados-mongois-asia-central.json','data/dados-asia-central.json'],
      },
      {
        id: 'q-rota-seda',
        texto: { pt: 'O que era a Rota da Seda e como conectou o mundo pré-moderno?', en: 'What was the Silk Road and how did it connect the pre-modern world?', es: '¿Qué era la Ruta de la Seda y cómo conectó el mundo premoderno?' },
        desc:  { pt: 'A rota da seda não era uma rota nem era só seda — era uma rede de trocas de bens, ideias, doenças e culturas que ligava China, Índia, Pérsia e Roma.', en: 'The Silk Road was not one route nor only silk — it was a network exchanging goods, ideas, diseases and cultures linking China, India, Persia and Rome.', es: 'La Ruta de la Seda no era una ruta ni solo seda — era una red de intercambio de bienes, ideas, enfermedades y culturas que unía China, India, Persia y Roma.' },
        datasets: ['data/dados-mongois-asia-central.json','data/dados-asia-central.json','data/dados-china-tang.json','data/dados-persia-expandida.json'],
      },
      {
        id: 'q-asia-central-historia',
        texto: { pt: 'Por que a Ásia Central foi o centro do mundo por 1.000 anos?', en: 'Why was Central Asia the center of the world for 1,000 years?', es: '¿Por qué Asia Central fue el centro del mundo durante 1.000 años?' },
        desc:  { pt: 'Samarcanda, Bukhara, Tamerlão — a região entre a China e a Europa que foi o coração do comércio, da ciência e da conquista medieval.', en: 'Samarkand, Bukhara, Tamerlane — the region between China and Europe that was the heart of medieval trade, science and conquest.', es: 'Samarcanda, Bujará, Tamerlán — la región entre China y Europa que fue el corazón del comercio, la ciencia y la conquista medievales.' },
        datasets: ['data/dados-asia-central.json','data/dados-mongois-asia-central.json','data/dados-califados-islamicos.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Arte, Cultura e Ideias', en: 'Art, Culture and Ideas', es: 'Arte, Cultura e Ideas' },
    itens: [
      {
        id: 'q-movimentos-arte',
        texto: { pt: 'Como os movimentos artísticos refletem as transformações históricas?', en: 'How do artistic movements reflect historical transformations?', es: '¿Cómo los movimientos artísticos reflejan las transformaciones históricas?' },
        desc:  { pt: 'Do Barroco ao Impressionismo ao Modernismo — por que a arte muda quando a sociedade muda, e o que cada estilo revela sobre sua época.', en: 'From Baroque to Impressionism to Modernism — why art changes when society changes, and what each style reveals about its time.', es: 'Del Barroco al Impresionismo al Modernismo — por qué el arte cambia cuando la sociedad cambia, y lo que cada estilo revela sobre su época.' },
        datasets: ['data/dados-movimentos-arte.json','data/dados-renascimento-cultural.json','data/dados-seculo-xix.json','data/dados-entreguerras.json'],
      },
      {
        id: 'q-revolucoes-sec18',
        texto: { pt: 'Por que o século XVIII foi a era das revoluções?', en: 'Why was the 18th century the age of revolutions?', es: '¿Por qué el siglo XVIII fue la era de las revoluciones?' },
        desc:  { pt: 'Revolução Americana, Francesa e Haitiana — três revoluções que aconteceram no mesmo século por razões conectadas.', en: 'American, French and Haitian Revolutions — three revolutions that happened in the same century for connected reasons.', es: 'Revoluciones Americana, Francesa y Haitiana — tres revoluciones que ocurrieron en el mismo siglo por razones conectadas.' },
        datasets: ['data/dados-revolucoes-sec18.json','data/dados-revolucao-francesa.json','data/dados-revolucoes-liberais.json','data/dados-iluminismo.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Rússia e URSS', en: 'Russia and USSR', es: 'Rusia y URSS' },
    itens: [
      {
        id: 'q-russia-pedro-catarina',
        texto: { pt: 'Como Pedro e Catarina modernizaram a Rússia — e a que custo?', en: 'How did Peter and Catherine modernize Russia — and at what cost?', es: '¿Cómo modernizaron Pedro y Catalina Rusia — y a qué costo?' },
        desc:  { pt: 'A "ocidentalização" forçada da Rússia — Pedro, o Grande, Catarina, a Grande, e a tensão permanente entre europeização e identidade russa.', en: 'The forced "westernization" of Russia — Peter the Great, Catherine the Great, and the permanent tension between Europeanization and Russian identity.', es: 'La "occidentalización" forzada de Rusia — Pedro el Grande, Catalina la Grande, y la tensión permanente entre europeización e identidad rusa.' },
        datasets: ['data/dados-russia-pedro-catarina.json','data/dados-russia-czarismo.json'],
      },
      {
        id: 'q-russia-czarismo-colapso',
        texto: { pt: 'Por que o czarismo russo entrou em colapso em 1917?', en: 'Why did Russian czarism collapse in 1917?', es: '¿Por qué el zarismo ruso colapsó en 1917?' },
        desc:  { pt: 'Do Domingo Sangrento à Revolução de Fevereiro — as pressões acumuladas que fizeram o maior império territorial do mundo implodir em meses.', en: 'From Bloody Sunday to the February Revolution — the accumulated pressures that made the world\'s largest territorial empire implode in months.', es: 'Del Domingo Sangriento a la Revolución de Febrero — las presiones acumuladas que hicieron que el mayor imperio territorial del mundo implosionara en meses.' },
        datasets: ['data/dados-russia-czarismo.json','data/dados-revolucao-russa.json','data/dados-primeira-guerra.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Coreia: Da Antiguidade ao Presente', en: 'Korea: From Antiquity to the Present', es: 'Corea: De la Antigüedad al Presente' },
    itens: [
      {
        id: 'q-coreia-historia',
        texto: { pt: 'Como a Coreia construiu sua identidade entre China e Japão?', en: 'How did Korea build its identity between China and Japan?', es: '¿Cómo construyó Corea su identidad entre China y Japón?' },
        desc:  { pt: 'Silla, Goryeo, Joseon — a extraordinária durabilidade de uma civilização que sobreviveu entre dois gigantes por 2.000 anos.', en: 'Silla, Goryeo, Joseon — the extraordinary durability of a civilization that survived between two giants for 2,000 years.', es: 'Silla, Goryeo, Joseon — la extraordinaria durabilidad de una civilización que sobrevivió entre dos gigantes durante 2.000 años.' },
        datasets: ['data/dados-coreia.json','data/dados-coreia-antiga.json','data/dados-japao-feudal.json','data/dados-china-imperial.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Mesoamérica: Além dos Astecas', en: 'Mesoamerica: Beyond the Aztecs', es: 'Mesoamérica: Más Allá de los Aztecas' },
    itens: [
      {
        id: 'q-teotihuacan',
        texto: { pt: 'Quem construiu Teotihuacán — a cidade que ninguém sabe de quem era?', en: 'Who built Teotihuacán — the city no one knows who owned?', es: '¿Quién construyó Teotihuacán — la ciudad de la que nadie sabe a quién pertenecía?' },
        desc:  { pt: 'A maior cidade pré-colombiana das Américas foi construída por um povo cujo nome desconhecemos, cuja língua não sabemos e que desapareceu misteriosamente.', en: 'The largest pre-Columbian city in the Americas was built by a people whose name we don\'t know, whose language we don\'t know and who disappeared mysteriously.', es: 'La mayor ciudad precolombina de las Américas fue construida por un pueblo cuyo nombre desconocemos, cuya lengua no sabemos y que desapareció misteriosamente.' },
        datasets: ['data/dados-teotihuacan.json','data/dados-mesoamerica.json','data/dados-astecas-expandido.json'],
      },
      {
        id: 'q-toltecas-zapotecas',
        texto: { pt: 'Quem foram os Toltecas, Zapotecas e Mixtecas?', en: 'Who were the Toltecs, Zapotecs and Mixtecs?', es: '¿Quiénes fueron los toltecas, zapotecas y mixtecas?' },
        desc:  { pt: 'As civilizações mesoamericanas que precederam e conviveram com os Astecas — Monte Albán, Tula e a sofisticação esquecida do México antigo.', en: 'The Mesoamerican civilizations that preceded and coexisted with the Aztecs — Monte Albán, Tula and the forgotten sophistication of ancient Mexico.', es: 'Las civilizaciones mesoamericanas que precedieron y convivieron con los aztecas — Monte Albán, Tula y la sofisticación olvidada del México antiguo.' },
        datasets: ['data/dados-toltecas.json','data/dados-zapotecas-mixtecas.json','data/dados-mesoamerica.json','data/dados-olmecas.json'],
      },
      {
        id: 'q-chimu-wari',
        texto: { pt: 'Quem eram os Chimú e os Wari — os impérios que antecederam os Incas?', en: 'Who were the Chimú and Wari — the empires that preceded the Incas?', es: '¿Quiénes eran los Chimú y los Wari — los imperios que precedieron a los Incas?' },
        desc:  { pt: 'Chan Chan era a maior cidade de adobe do mundo. O Wari inventou o sistema de estradas que os Incas expandiram. A história pré-Inca dos Andes.', en: 'Chan Chan was the world\'s largest adobe city. The Wari invented the road system that the Incas expanded. The pre-Inca history of the Andes.', es: 'Chan Chan era la mayor ciudad de adobe del mundo. Los Wari inventaron el sistema de carreteras que los Incas expandieron. La historia preinca de los Andes.' },
        datasets: ['data/dados-chimu-wari.json','data/dados-incas.json','data/dados-andes.json'],
      },
      {
        id: 'q-mapuches',
        texto: { pt: 'Por que os Mapuches foram o único povo que resistiu aos Incas — e depois aos espanhóis?', en: 'Why were the Mapuche the only people who resisted both the Incas — and then the Spanish?', es: '¿Por qué los mapuches fueron el único pueblo que resistió a los Incas — y luego a los españoles?' },
        desc:  { pt: 'Ao sul do rio Bío-Bío, os Mapuches mantiveram sua independência por 300 anos após a chegada europeia. Como?', en: 'South of the Bío-Bío River, the Mapuche maintained their independence for 300 years after the European arrival. How?', es: 'Al sur del río Biobío, los mapuches mantuvieron su independencia durante 300 años tras la llegada europea. ¿Cómo?' },
        datasets: ['data/dados-mapuches-povos-sul.json','data/dados-incas.json','data/dados-andes.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Antártida e Exploração Polar', en: 'Antarctica and Polar Exploration', es: 'Antártida y Exploración Polar' },
    itens: [
      {
        id: 'q-antartica-descoberta',
        texto: { pt: 'Como foi a corrida para descobrir e explorar a Antártida?', en: 'What was the race to discover and explore Antarctica?', es: '¿Cómo fue la carrera para descubrir y explorar la Antártida?' },
        desc:  { pt: 'De Amundsen e Scott à Era Heroica da exploração polar — a última grande aventura geográfica da humanidade.', en: 'From Amundsen and Scott to the Heroic Age of polar exploration — humanity\'s last great geographical adventure.', es: 'De Amundsen y Scott a la Era Heroica de la exploración polar — la última gran aventura geográfica de la humanidad.' },
        datasets: ['data/dados-antartica-descoberta.json','data/dados-navegacoes.json'],
      },
      {
        id: 'q-antartica-moderna',
        texto: { pt: 'Qual é o papel da Antártida na política e ciência contemporâneas?', en: 'What is Antarctica\'s role in contemporary politics and science?', es: '¿Cuál es el papel de la Antártida en la política y la ciencia contemporáneas?' },
        desc:  { pt: 'O Tratado Antártico, as reivindicações territoriais e a Antártida como termômetro da crise climática global.', en: 'The Antarctic Treaty, territorial claims and Antarctica as a thermometer for the global climate crisis.', es: 'El Tratado Antártico, las reivindicaciones territoriales y la Antártida como termómetro de la crisis climática global.' },
        datasets: ['data/dados-antartica-moderna.json','data/dados-antartica-descoberta.json','data/dados-pos-guerra-fria.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Temas Transversais', en: 'Crosscutting Themes', es: 'Temas Transversales' },
    itens: [
      {
        id: 'q-epidemias-historia',
        texto: { pt: 'Como as epidemias mudaram o curso da história?', en: 'How did epidemics change the course of history?', es: '¿Cómo las epidemias cambiaron el curso de la historia?' },
        desc:  { pt: 'Peste Negra, varíola nas Américas, gripe espanhola — quando vírus e bactérias foram mais decisivos do que exércitos.', en: 'Black Death, smallpox in the Americas, Spanish flu — when viruses and bacteria were more decisive than armies.', es: 'Peste Negra, viruela en las Américas, gripe española — cuando los virus y las bacterias fueron más decisivos que los ejércitos.' },
        datasets: ['data/dados-medieval-feudalismo.json','data/dados-era-moderna.json','data/dados-astecas-expandido.json','data/dados-primeira-guerra.json'],
      },
      {
        id: 'q-escravidao-global',
        texto: { pt: 'A escravidão foi universal? Uma história global de uma prática antiga.', en: 'Was slavery universal? A global history of an ancient practice.', es: '¿Fue universal la esclavitud? Una historia global de una práctica antigua.' },
        desc:  { pt: 'Da escravidão grega ao tráfico atlântico à escravidão moderna — como cada sociedade justificou a desumanização do outro.', en: 'From Greek slavery to the Atlantic trade to modern slavery — how each society justified the dehumanization of the other.', es: 'De la esclavitud griega al tráfico atlántico a la esclavitud moderna — cómo cada sociedad justificó la deshumanización del otro.' },
        datasets: ['data/dados-africa-pre-colonial.json','data/dados-era-moderna.json','data/dados-brasil-colonial-escravidao.json','data/dados-movimentos-sociais.json','data/dados-personagens-americas.json'],
      },
      {
        id: 'q-revolucoes-tecnologicas',
        texto: { pt: 'O que todas as revoluções tecnológicas têm em comum?', en: 'What do all technological revolutions have in common?', es: '¿Qué tienen en común todas las revoluciones tecnológicas?' },
        desc:  { pt: 'Da imprensa à máquina a vapor ao digital — o padrão de disrupção, resistência e transformação que se repete em cada grande salto tecnológico.', en: 'From the printing press to the steam engine to digital — the pattern of disruption, resistance and transformation that repeats with each great technological leap.', es: 'De la imprenta a la máquina de vapor a lo digital — el patrón de disrupción, resistencia y transformación que se repite en cada gran salto tecnológico.' },
        datasets: ['data/dados-revolucao-cientifica.json','data/dados-revolucao-industrial.json','data/dados-ciencia-tecnologia.json','data/dados-capitalismo.json'],
      },
      {
        id: 'q-imperios-colapso',
        texto: { pt: 'Por que os impérios colapsam? Padrões ao longo da história.', en: 'Why do empires collapse? Patterns throughout history.', es: '¿Por qué colapsan los imperios? Patrones a lo largo de la historia.' },
        desc:  { pt: 'Roma, Han, Mongol, Otomano, Britânico — o que esses colapsos têm em comum e o que nos dizem sobre a fragilidade do poder.', en: 'Rome, Han, Mongol, Ottoman, British — what these collapses have in common and what they tell us about the fragility of power.', es: 'Roma, Han, Mongol, Otomano, Británico — lo que estos colapsos tienen en común y lo que nos dicen sobre la fragilidad del poder.' },
        datasets: ['data/dados-queda-roma.json','data/dados-china-imperial.json','data/dados-mongois-asia-central.json','data/dados-imperio-otomano.json','data/dados-imperialismo-colonial.json'],
      },
      {
        id: 'q-migracoes-historia',
        texto: { pt: 'Como as grandes migrações moldaram a humanidade?', en: 'How did great migrations shape humanity?', es: '¿Cómo moldearon a la humanidad las grandes migraciones?' },
        desc:  { pt: 'Da saída da África à diáspora africana, das migrações bárbaras às migrações modernas — o movimento de povos como força motriz da história.', en: 'From the Out of Africa migration to the African diaspora, from barbarian migrations to modern migration — the movement of peoples as the driving force of history.', es: 'De la salida de África a la diáspora africana, de las migraciones bárbaras a las migraciones modernas — el movimiento de pueblos como fuerza motriz de la historia.' },
        datasets: ['data/dados-evolucao-humana.json','data/dados-pre-historia-paleolitico.json','data/dados-queda-roma.json','data/dados-africa-pre-colonial.json','data/dados-movimentos-sociais.json'],
      },
      {
        id: 'q-alimentacao-historia',
        texto: { pt: 'Como a alimentação moldou civilizações, guerras e impérios?', en: 'How did food shape civilizations, wars and empires?', es: '¿Cómo la alimentación moldeó civilizaciones, guerras e imperios?' },
        desc:  { pt: 'Trigo, arroz, milho, açúcar, especiarias — como o que as pessoas comiam determinava onde viviam, com quem guerreavam e como se organizavam.', en: 'Wheat, rice, corn, sugar, spices — how what people ate determined where they lived, who they fought and how they organized.', es: 'Trigo, arroz, maíz, azúcar, especias — cómo lo que la gente comía determinaba dónde vivía, con quién guerreaba y cómo se organizaba.' },
        datasets: ['data/dados-pre-historia-neolitico.json','data/dados-navegacoes.json','data/dados-era-moderna.json','data/dados-revolucao-industrial.json'],
      },
    ],
  },
,

  // ══════════════════════════════════════════════════════════════════════
  // NOVOS GRUPOS v7.27 — segunda leva
  // ══════════════════════════════════════════════════════════════════════

  {
    grupo: { pt: 'Grécia Antiga: Além da Filosofia', en: 'Ancient Greece: Beyond Philosophy', es: 'Grecia Antigua: Más Allá de la Filosofía' },
    itens: [
      {
        id: 'q-grecia-sociedade',
        texto: { pt: 'Como era a sociedade grega de verdade — para além dos filósofos?', en: 'What was Greek society really like — beyond the philosophers?', es: '¿Cómo era realmente la sociedad griega — más allá de los filósofos?' },
        desc:  { pt: 'Escravos, mulheres, estrangeiros — quem não tinha voz na democracia ateniense. Esparta vs. Atenas: dois modelos radicalmente opostos de organizar a cidade.', en: 'Slaves, women, foreigners — who had no voice in Athenian democracy. Sparta vs. Athens: two radically opposed models of organizing the city.', es: 'Esclavos, mujeres, extranjeros — quiénes no tenían voz en la democracia ateniense. Esparta vs. Atenas: dos modelos radicalmente opuestos de organizar la ciudad.' },
        datasets: ['data/dados-grecia-antiga.json','data/dados-grecia-atenas.json','data/dados-personagens-grecia-roma.json'],
      },
      {
        id: 'q-grecia-religiao-mito',
        texto: { pt: 'O que os mitos gregos realmente significavam para os gregos?', en: 'What did Greek myths really mean to the Greeks?', es: '¿Qué significaban realmente los mitos griegos para los griegos?' },
        desc:  { pt: 'Os deuses olímpicos não eram metáforas — eram explicações do mundo. Como a religião grega funcionava na prática: oráculos, sacrifícios e os Jogos Olímpicos.', en: 'The Olympian gods were not metaphors — they were explanations of the world. How Greek religion worked in practice: oracles, sacrifices and the Olympic Games.', es: 'Los dioses olímpicos no eran metáforas — eran explicaciones del mundo. Cómo funcionaba la religión griega en la práctica: oráculos, sacrificios y los Juegos Olímpicos.' },
        datasets: ['data/dados-grecia-antiga.json','data/dados-grecia-atenas.json','data/dados-grecia-cultura.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Índia: Da Antiguidade ao Mogol', en: 'India: From Antiquity to the Mughal', es: 'India: De la Antigüedad al Mogol' },
    itens: [
      {
        id: 'q-india-medieval-sultanato',
        texto: { pt: 'Como o islamismo chegou à Índia — e o que o encontro produziu?', en: 'How did Islam arrive in India — and what did the encounter produce?', es: '¿Cómo llegó el islam a India — y qué produjo ese encuentro?' },
        desc:  { pt: 'Do Sultanato de Délhi ao Império Mogol de Akbar — a síntese mais rica entre hindus e muçulmanos, e por que eventualmente entrou em colapso.', en: 'From the Delhi Sultanate to Akbar\'s Mughal Empire — the richest synthesis between Hindus and Muslims, and why it eventually collapsed.', es: 'Del Sultanato de Delhi al Imperio Mogol de Akbar — la síntesis más rica entre hindúes y musulmanes, y por qué eventualmente colapsó.' },
        datasets: ['data/dados-india-medieval.json','data/dados-india-mogol.json','data/dados-personagens-asia.json'],
      },
      {
        id: 'q-india-vedica-casta',
        texto: { pt: 'Como nasceu o sistema de castas e por que é tão difícil de eliminar?', en: 'How did the caste system originate and why is it so hard to eliminate?', es: '¿Cómo nació el sistema de castas y por qué es tan difícil de eliminar?' },
        desc:  { pt: 'Do Rigveda ao Manusmriti à Constituição de Ambedkar — 3.000 anos de hierarquia social codificada e as resistências que nunca cessaram.', en: 'From the Rigveda to the Manusmriti to Ambedkar Constitution — 3,000 years of codified social hierarchy and the resistance that never stopped.', es: 'Del Rigveda al Manusmriti a la Constitución de Ambedkar — 3.000 años de jerarquía social codificada y la resistencia que nunca cesó.' },
        datasets: ['data/dados-india-vedica-maurya.json','data/dados-india-medieval.json','data/dados-personagens-asia.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Japão: Samurais, Shoguns e Modernidade', en: 'Japan: Samurai, Shoguns and Modernity', es: 'Japón: Samuráis, Shogunes y Modernidad' },
    itens: [
      {
        id: 'q-japao-feudal-cultura',
        texto: { pt: 'O que foi o Japão feudal — e como a cultura samurai moldou o Japão moderno?', en: 'What was feudal Japan — and how did samurai culture shape modern Japan?', es: '¿Qué fue el Japón feudal — y cómo la cultura samurái moldeó el Japón moderno?' },
        desc:  { pt: 'Do Período Heian ao Bushido — a estética da morte honrosa, o código do guerreiro e sua sobrevivência surpreendente na corporação japonesa do século XXI.', en: 'From the Heian Period to Bushido — the aesthetic of honorable death, the warrior code and its surprising survival in the 21st century Japanese corporation.', es: 'Del Período Heian al Bushido — la estética de la muerte honorable, el código del guerrero y su sorprendente supervivencia en la corporación japonesa del siglo XXI.' },
        datasets: ['data/dados-japao.json','data/dados-japao-feudal.json','data/dados-personagens-asia.json'],
      },
      {
        id: 'q-japao-meiji-modernizacao',
        texto: { pt: 'Como o Japão se modernizou em 40 anos — e que preço pagou?', en: 'How did Japan modernize in 40 years — and what price did it pay?', es: '¿Cómo se modernizó Japón en 40 años — y qué precio pagó?' },
        desc:  { pt: 'A Restauração Meiji (1868) foi a modernização mais rápida da história — e produziu o imperialismo que destruiu Hiroshima e Nagasaki.', en: 'The Meiji Restoration (1868) was the fastest modernization in history — and produced the imperialism that destroyed Hiroshima and Nagasaki.', es: 'La Restauración Meiji (1868) fue la modernización más rápida de la historia — y produjo el imperialismo que destruyó Hiroshima y Nagasaki.' },
        datasets: ['data/dados-japao.json','data/dados-japao-meiji.json','data/dados-imperialismo-colonial.json','data/dados-personagens-asia.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Sudeste Asiático: O Cruzamento do Mundo', en: 'Southeast Asia: The World\'s Crossroads', es: 'Sudeste Asiático: El Cruce del Mundo' },
    itens: [
      {
        id: 'q-sudeste-asiatico-reinos',
        texto: { pt: 'Quais foram os grandes reinos do Sudeste Asiático antes da colonização?', en: 'What were the great kingdoms of Southeast Asia before colonization?', es: '¿Cuáles fueron los grandes reinos del Sudeste Asiático antes de la colonización?' },
        desc:  { pt: 'Angkor, Majapahit, Pagan — os impérios esquecidos que construíram Angkor Wat e dominaram o comércio marítimo entre Índia e China.', en: 'Angkor, Majapahit, Pagan — the forgotten empires that built Angkor Wat and dominated maritime trade between India and China.', es: 'Angkor, Majapahit, Pagan — los imperios olvidados que construyeron Angkor Wat y dominaron el comercio marítimo entre India y China.' },
        datasets: ['data/dados-sudeste-continental.json','data/dados-sudeste-asiatico.json','data/dados-sudeste-asiatico-maritimo.json'],
      },
      {
        id: 'q-sudeste-asiatico-colonial-independencia',
        texto: { pt: 'Como o Sudeste Asiático se libertou do colonialismo europeu?', en: 'How did Southeast Asia free itself from European colonialism?', es: '¿Cómo se liberó el Sudeste Asiático del colonialismo europeo?' },
        desc:  { pt: 'Da Indochina Francesa à Indonésia Holandesa — as guerras de independência que transformaram o Sudeste Asiático no pós-Segunda Guerra.', en: 'From French Indochina to Dutch Indonesia — the independence wars that transformed Southeast Asia after World War II.', es: 'De la Indochina Francesa a la Indonesia Holandesa — las guerras de independencia que transformaron el Sudeste Asiático en la posguerra.' },
        datasets: ['data/dados-sudeste-asiatico-colonial.json','data/dados-descolonizacao.json','data/dados-guerra-fria.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Impérios Astecas e Mesoamerica Clássica', en: 'Aztec Empire and Classical Mesoamerica', es: 'Imperio Azteca y Mesoamérica Clásica' },
    itens: [
      {
        id: 'q-astecas-imperio-tenochtitlan',
        texto: { pt: 'Como funcionava o Império Asteca por dentro?', en: 'How did the Aztec Empire work from the inside?', es: '¿Cómo funcionaba el Imperio Azteca por dentro?' },
        desc:  { pt: 'Tenochtitlan tinha 200.000 habitantes — maior que qualquer cidade europeia de 1500. Como funcionava sua economia, religião e estrutura política.', en: 'Tenochtitlan had 200,000 inhabitants — larger than any European city in 1500. How its economy, religion and political structure worked.', es: 'Tenochtitlan tenía 200.000 habitantes — mayor que cualquier ciudad europea de 1500. Cómo funcionaban su economía, religión y estructura política.' },
        datasets: ['data/dados-astecas-imperio.json','data/dados-astecas-expandido.json','data/dados-personagens-americas.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Igreja Medieval: Poder, Arte e Saber', en: 'Medieval Church: Power, Art and Knowledge', es: 'Iglesia Medieval: Poder, Arte y Saber' },
    itens: [
      {
        id: 'q-mosteiros-universidades',
        texto: { pt: 'Como a Igreja medieval preservou — e moldou — o conhecimento ocidental?', en: 'How did the medieval Church preserve — and shape — Western knowledge?', es: '¿Cómo preservó — y moldeó — la Iglesia medieval el conocimiento occidental?' },
        desc:  { pt: 'Dos scriptoria de Cassiodoro às universidades de Bolonha e Paris — a Igreja como única instituição educacional da Europa por 800 anos.', en: 'From Cassiodorus\'s scriptoria to the universities of Bologna and Paris — the Church as Europe\'s only educational institution for 800 years.', es: 'De los scriptoria de Casiodoro a las universidades de Bolonia y París — la Iglesia como única institución educativa de Europa durante 800 años.' },
        datasets: ['data/dados-igreja-medieval-cultura.json','data/dados-medieval-feudalismo.json','data/dados-personagens-medieval.json'],
      },
      {
        id: 'q-arte-gotica-romanica',
        texto: { pt: 'Por que as catedrais góticas foram o maior projeto coletivo da Idade Média?', en: 'Why were Gothic cathedrals the greatest collective project of the Middle Ages?', es: '¿Por qué las catedrales góticas fueron el mayor proyecto colectivo de la Edad Media?' },
        desc:  { pt: 'Notre-Dame, Chartres, Colônia — construídas ao longo de gerações, as catedrais eram a tecnologia, arte e teologia unificadas em pedra.', en: 'Notre-Dame, Chartres, Cologne — built over generations, cathedrals were technology, art and theology unified in stone.', es: 'Notre-Dame, Chartres, Colonia — construidas a lo largo de generaciones, las catedrales eran tecnología, arte y teología unificadas en piedra.' },
        datasets: ['data/dados-igreja-medieval-cultura.json','data/dados-medieval-feudalismo.json','data/dados-renascimento-cultural.json'],
      },
    ],
  },

  {
    grupo: { pt: 'EUA: História Interna', en: 'USA: Internal History', es: 'EE.UU.: Historia Interna' },
    itens: [
      {
        id: 'q-eua-historia-geral',
        texto: { pt: 'O arco completo da história americana: de colônia a império global.', en: 'The complete arc of American history: from colony to global empire.', es: 'El arco completo de la historia americana: de colonia a imperio global.' },
        desc:  { pt: 'Uma visão panorâmica dos EUA: como uma colônia de 3 milhões de pessoas se tornou a maior potência da história em menos de 250 anos.', en: 'A panoramic view of the US: how a colony of 3 million people became the greatest power in history in less than 250 years.', es: 'Una visión panorámica de los EE.UU.: cómo una colonia de 3 millones de personas se convirtió en la mayor potencia de la historia en menos de 250 años.' },
        datasets: ['data/dados-eua-historia.json','data/dados-eua-fundacao.json','data/dados-eua-expansao-civil.json','data/dados-eua-seculo-xx.json'],
      },
      {
        id: 'q-eua-seculo20-detalhado',
        texto: { pt: 'Como os EUA do século XX se tornaram — e questionaram — a liderança do mundo livre?', en: 'How did 20th-century America become — and question — the leadership of the free world?', es: '¿Cómo se convirtió — y cuestionó — la América del siglo XX en el liderazgo del mundo libre?' },
        desc:  { pt: 'New Deal, New Frontier, Great Society, Vietnam — quatro momentos em que os EUA redefiniam o que significava ser uma democracia poderosa.', en: 'New Deal, New Frontier, Great Society, Vietnam — four moments when the US redefined what it meant to be a powerful democracy.', es: 'New Deal, New Frontier, Great Society, Vietnam — cuatro momentos en que los EE.UU. redefinían lo que significaba ser una democracia poderosa.' },
        datasets: ['data/dados-eua-seculo20.json','data/dados-eua-guerras-mundiais.json','data/dados-guerra-fria.json','data/dados-personagens-seculo-xx.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Personagens: Rostos da História', en: 'Characters: Faces of History', es: 'Personajes: Rostros de la Historia' },
    itens: [
      {
        id: 'q-pers-grecia-roma',
        texto: { pt: 'Os grandes personagens de Grécia e Roma: além dos nomes famosos.', en: 'The great characters of Greece and Rome: beyond the famous names.', es: 'Los grandes personajes de Grecia y Roma: más allá de los nombres famosos.' },
        desc:  { pt: 'Sócrates, Júlio César, Cleópatra — mas também Espartaco, Arquimedes e Políbio. Os indivíduos que deram forma ao mundo clássico.', en: 'Socrates, Julius Caesar, Cleopatra — but also Spartacus, Archimedes and Polybius. The individuals who shaped the classical world.', es: 'Sócrates, Julio César, Cleopatra — pero también Espartaco, Arquímedes y Polibio. Los individuos que dieron forma al mundo clásico.' },
        datasets: ['data/dados-personagens-grecia-roma.json','data/dados-grecia-atenas.json','data/dados-roma-republica.json'],
      },
      {
        id: 'q-pers-medieval',
        texto: { pt: 'Os personagens que fizeram a Idade Média: reis, papas, hereges e sábios.', en: 'The characters who made the Middle Ages: kings, popes, heretics and sages.', es: 'Los personajes que hicieron la Edad Media: reyes, papas, herejes y sabios.' },
        desc:  { pt: 'Carlomagno, Tomás de Aquino, Ibn Khaldun, Joana D\'Arc — as figuras que definiram mil anos de história entre o colapso de Roma e o Renascimento.', en: 'Charlemagne, Thomas Aquinas, Ibn Khaldun, Joan of Arc — the figures who defined a thousand years of history between Rome\'s collapse and the Renaissance.', es: 'Carlomagno, Tomás de Aquino, Ibn Jaldún, Juana de Arco — las figuras que definieron mil años de historia entre el colapso de Roma y el Renacimiento.' },
        datasets: ['data/dados-personagens-medieval.json','data/dados-medieval-feudalismo.json','data/dados-cruzadas.json'],
      },
      {
        id: 'q-pers-renascimento',
        texto: { pt: 'Os personagens do Renascimento e da Reforma: o mundo reescrito por indivíduos.', en: 'Renaissance and Reformation characters: the world rewritten by individuals.', es: 'Los personajes del Renacimiento y la Reforma: el mundo reescrito por individuos.' },
        desc:  { pt: 'Leonardo, Michelangelo, Lutero, Erasmo, Copérnico — o século XVI como o momento em que a ideia de "gênio individual" transformou a Europa.', en: 'Leonardo, Michelangelo, Luther, Erasmus, Copernicus — the 16th century as the moment when the idea of "individual genius" transformed Europe.', es: 'Leonardo, Miguel Ángel, Lutero, Erasmo, Copérnico — el siglo XVI como el momento en que la idea del "genio individual" transformó Europa.' },
        datasets: ['data/dados-personagens-renascimento-reforma.json','data/dados-renascimento-cultural.json','data/dados-lutero-reforma.json'],
      },
      {
        id: 'q-pers-iluminismo-revolucoes',
        texto: { pt: 'Os personagens do Iluminismo e das Revoluções: quem inventou o mundo moderno.', en: 'Enlightenment and Revolution characters: who invented the modern world.', es: 'Los personajes de la Ilustración y las Revoluciones: quiénes inventaron el mundo moderno.' },
        desc:  { pt: 'Voltaire, Rousseau, Robespierre, Napoleão, Washington — como um punhado de indivíduos reformulou os conceitos de liberdade, igualdade e soberania.', en: 'Voltaire, Rousseau, Robespierre, Napoleon, Washington — how a handful of individuals reformulated the concepts of freedom, equality and sovereignty.', es: 'Voltaire, Rousseau, Robespierre, Napoleón, Washington — cómo un puñado de individuos reformuló los conceptos de libertad, igualdad y soberanía.' },
        datasets: ['data/dados-personagens-iluminismo-revolucoes.json','data/dados-iluminismo.json','data/dados-revolucao-francesa.json'],
      },
      {
        id: 'q-pers-seculo-xix',
        texto: { pt: 'Os personagens do século XIX: a era dos reformadores, inventores e imperadores.', en: '19th century characters: the age of reformers, inventors and emperors.', es: 'Los personajes del siglo XIX: la era de los reformadores, inventores e imperios.' },
        desc:  { pt: 'Marx, Darwin, Bismarck, Lincoln, Nightingale — o século em que a industrialização e o nacionalismo produziram tanto progresso quanto opressão.', en: 'Marx, Darwin, Bismarck, Lincoln, Nightingale — the century in which industrialization and nationalism produced as much progress as oppression.', es: 'Marx, Darwin, Bismarck, Lincoln, Nightingale — el siglo en que la industrialización y el nacionalismo produjeron tanto progreso como opresión.' },
        datasets: ['data/dados-personagens-seculo-xix.json','data/dados-seculo-xix.json','data/dados-revolucao-industrial.json'],
      },
      {
        id: 'q-pers-guerras-mundiais',
        texto: { pt: 'Os personagens das Guerras Mundiais: quem decidiu o destino do século XX.', en: 'World War characters: who decided the fate of the 20th century.', es: 'Los personajes de las Guerras Mundiales: quiénes decidieron el destino del siglo XX.' },
        desc:  { pt: 'Churchill, Hitler, Stalin, Roosevelt, Einstein — como as escolhas de indivíduos em momentos de crise determinaram o resultado das duas guerras.', en: 'Churchill, Hitler, Stalin, Roosevelt, Einstein — how individual choices at moments of crisis determined the outcome of both wars.', es: 'Churchill, Hitler, Stalin, Roosevelt, Einstein — cómo las elecciones de individuos en momentos de crisis determinaron el resultado de ambas guerras.' },
        datasets: ['data/dados-personagens-seculo-xx-guerras.json','data/dados-segunda-guerra.json','data/dados-primeira-guerra.json'],
      },
      {
        id: 'q-pers-biblicos',
        texto: { pt: 'Os personagens bíblicos como figuras históricas: o que sabemos de fato?', en: 'Biblical characters as historical figures: what do we actually know?', es: 'Los personajes bíblicos como figuras históricas: ¿qué sabemos realmente?' },
        desc:  { pt: 'Abraão, Moisés, Davi, Jesus, Paulo — o que a arqueologia e a historiografia nos dizem sobre as figuras que fundaram três religiões mundiais.', en: 'Abraham, Moses, David, Jesus, Paul — what archaeology and historiography tell us about the figures who founded three world religions.', es: 'Abraham, Moisés, David, Jesús, Pablo — lo que la arqueología y la historiografía nos dicen sobre las figuras que fundaron tres religiones mundiales.' },
        datasets: ['data/dados-personagens-biblicas.json','data/dados-mesopotamia-hebreus-fenicios.json','data/dados-reformas-religiosas.json'],
      },
      {
        id: 'q-pers-brasil',
        texto: { pt: 'Os personagens que fizeram o Brasil: de Tiradentes a Lula.', en: 'The characters who made Brazil: from Tiradentes to Lula.', es: 'Los personajes que hicieron Brasil: de Tiradentes a Lula.' },
        desc:  { pt: 'D. Pedro I, Zumbi, Abolicionistas, Vargas, JK, Chico Mendes — as figuras individuais cuja ação definiu momentos decisivos da história brasileira.', en: 'D. Pedro I, Zumbi, Abolitionists, Vargas, JK, Chico Mendes — the individual figures whose action defined decisive moments in Brazilian history.', es: 'D. Pedro I, Zumbi, Abolicionistas, Vargas, JK, Chico Mendes — las figuras individuales cuya acción definió momentos decisivos de la historia brasileña.' },
        datasets: ['data/dados-personagens-brasil.json','data/dados-brasil-09-independencia.json','data/dados-brasil-quilombos.json'],
      },
      {
        id: 'q-pers-europa-moderna',
        texto: { pt: 'Os personagens da Europa Moderna: quem construiu os estados nacionais.', en: 'Modern Europe characters: who built the nation-states.', es: 'Los personajes de la Europa Moderna: quiénes construyeron los estados nacionales.' },
        desc:  { pt: 'Richelieu, Cromwell, Luís XIV, Federico da Prússia — os estadistas que forjaram os estados europeus modernos com diplomacia, guerra e absolutismo.', en: 'Richelieu, Cromwell, Louis XIV, Frederick of Prussia — the statesmen who forged modern European states with diplomacy, war and absolutism.', es: 'Richelieu, Cromwell, Luis XIV, Federico de Prusia — los estadistas que forjaron los estados europeos modernos con diplomacia, guerra y absolutismo.' },
        datasets: ['data/dados-personagens-europa-moderna.json','data/dados-era-moderna.json','data/dados-absolutismo.json'],
      },
      {
        id: 'q-pers-asia',
        texto: { pt: 'Os grandes personagens da Ásia: imperadores, guerreiros e reformadores.', en: 'The great characters of Asia: emperors, warriors and reformers.', es: 'Los grandes personajes de Asia: emperadores, guerreros y reformadores.' },
        desc:  { pt: 'Ashoka, Gengis Khan, Kublai Khan, Akbar, Qin Shi Huang — os indivíduos que governaram o continente mais populoso e moldaram bilhões de vidas.', en: 'Ashoka, Genghis Khan, Kublai Khan, Akbar, Qin Shi Huang — the individuals who ruled the most populous continent and shaped billions of lives.', es: 'Ashoka, Gengis Kan, Kublai Kan, Akbar, Qin Shi Huang — los individuos que gobernaron el continente más poblado y moldearon miles de millones de vidas.' },
        datasets: ['data/dados-personagens-asia.json','data/dados-india-vedica-maurya.json','data/dados-mongois-asia-central.json','data/dados-china-imperial.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Perguntas Difíceis da História', en: 'History\'s Hard Questions', es: 'Las Preguntas Difíciles de la Historia' },
    itens: [
      {
        id: 'q-por-que-ocidente',
        texto: { pt: 'Por que o Ocidente dominou o mundo — e por quanto tempo ainda vai durar?', en: 'Why did the West dominate the world — and how much longer will it last?', es: '¿Por qué el Occidente dominó el mundo — y cuánto tiempo más durará?' },
        desc:  { pt: 'Guns, Germs and Steel, a Grande Divergência, o legado colonial — os debates historiográficos sobre por que a Europa e não a China ou a Índia liderou a modernidade.', en: 'Guns, Germs and Steel, the Great Divergence, the colonial legacy — historiographical debates on why Europe and not China or India led modernity.', es: 'Armas, Gérmenes y Acero, la Gran Divergencia, el legado colonial — los debates historiográficos sobre por qué Europa y no China o India lideró la modernidad.' },
        datasets: ['data/dados-imperialismo-colonial.json','data/dados-revolucao-industrial.json','data/dados-china-qing.json','data/dados-india-mogol.json'],
      },
      {
        id: 'q-genocidios-historia',
        texto: { pt: 'O que os genocídios da história têm em comum?', en: 'What do genocides throughout history have in common?', es: '¿Qué tienen en común los genocidios a lo largo de la historia?' },
        desc:  { pt: 'Armênia, Holocausto, Ruanda, cambojanos — os padrões que se repetem: deshumanização, crise, burocracia e silêncio do mundo.', en: 'Armenia, Holocaust, Rwanda, Cambodia — the repeating patterns: dehumanization, crisis, bureaucracy and the world\'s silence.', es: 'Armenia, Holocausto, Ruanda, Camboya — los patrones que se repiten: deshumanización, crisis, burocracia y el silencio del mundo.' },
        datasets: ['data/dados-segunda-guerra.json','data/dados-holocaust.json','data/dados-descolonizacao.json','data/dados-personagens-seculo-xx.json'],
      },
      {
        id: 'q-papel-individuo-historia',
        texto: { pt: 'O indivíduo muda a história — ou a história cria os indivíduos?', en: 'Do individuals change history — or does history create individuals?', es: '¿Los individuos cambian la historia — o la historia crea a los individuos?' },
        desc:  { pt: 'Se Napoleão não existisse, a França teria um ditador diferente? Se Hitler não tivesse nascido, o Holocausto aconteceria assim mesmo? O grande debate entre história das estruturas e história dos indivíduos.', en: 'If Napoleon hadn\'t existed, would France have had a different dictator? If Hitler hadn\'t been born, would the Holocaust have happened anyway? The great debate between structural and individual history.', es: '¿Si Napoleón no hubiera existido, habría tenido Francia un dictador diferente? ¿Si Hitler no hubiera nacido, el Holocausto habría ocurrido de todas formas? El gran debate entre historia estructural e historia individual.' },
        datasets: ['data/dados-personagens-iluminismo-revolucoes.json','data/dados-personagens-seculo-xx-guerras.json','data/dados-personagens-seculo-xx.json','data/dados-personagens-grecia-roma.json'],
      },
      {
        id: 'q-progresso-ilusao',
        texto: { pt: 'O progresso é real — ou apenas a perspectiva muda?', en: 'Is progress real — or does only the perspective change?', es: '¿El progreso es real — o solo cambia la perspectiva?' },
        desc:  { pt: 'A humanidade vive melhor do que há 200 anos por quase todos os indicadores mensuráveis. Mas o que foi perdido? E quem pagou o custo do progresso dos outros?', en: 'Humanity lives better than 200 years ago by almost every measurable indicator. But what was lost? And who paid the cost of others\' progress?', es: 'La humanidad vive mejor que hace 200 años por casi todos los indicadores medibles. Pero ¿qué se perdió? ¿Y quién pagó el costo del progreso de los demás?' },
        datasets: ['data/dados-revolucao-industrial.json','data/dados-imperialismo-colonial.json','data/dados-movimentos-sociais.json','data/dados-descolonizacao.json'],
      },
      {
        id: 'q-o-que-poderia-ter-sido',
        texto: { pt: 'E se...? Os grandes momentos contrafactuais da história.', en: 'What if...? History\'s great counterfactual moments.', es: '¿Y si...? Los grandes momentos contrafácticos de la historia.' },
        desc:  { pt: 'Se Alexandre não tivesse morrido aos 32, se a Armada Espanhola tivesse vencido, se o sul tivesse ganho a Guerra Civil — o que os contrafactuais revelam sobre causas e acasos históricos.', en: 'If Alexander hadn\'t died at 32, if the Spanish Armada had won, if the South had won the Civil War — what counterfactuals reveal about historical causes and coincidences.', es: 'Si Alejandro no hubiera muerto a los 32, si la Armada Española hubiera ganado, si el Sur hubiera ganado la Guerra Civil — lo que los contrafácticos revelan sobre causas y azares históricos.' },
        datasets: ['data/dados-grecia-helenismo.json','data/dados-era-moderna.json','data/dados-eua-expansao-civil.json','data/dados-mongois-asia-central.json'],
      },
      {
        id: 'q-revolucoes-traem',
        texto: { pt: 'Por que as revoluções frequentemente traem seus ideais?', en: 'Why do revolutions frequently betray their ideals?', es: '¿Por qué las revoluciones frecuentemente traicionan sus ideales?' },
        desc:  { pt: 'Francesa, Russa, Cubana, Iraniana — o padrão do terror pós-revolução e do líder que se torna o que combatia. Por que o poder corrompe os libertadores?', en: 'French, Russian, Cuban, Iranian — the pattern of post-revolutionary terror and the leader who becomes what they fought against. Why does power corrupt liberators?', es: 'Francesa, Rusa, Cubana, Iraní — el patrón del terror posrevolucionario y el líder que se convierte en lo que combatía. ¿Por qué el poder corrompe a los libertadores?' },
        datasets: ['data/dados-revolucao-francesa.json','data/dados-revolucao-russa.json','data/dados-iran-moderno.json','data/dados-personagens-seculo-xx.json'],
      },
      {
        id: 'q-religiao-e-violencia',
        texto: { pt: 'Religião causa guerras — ou serve de pretexto para conflitos já existentes?', en: 'Does religion cause wars — or serve as pretext for existing conflicts?', es: '¿La religión causa guerras — o sirve de pretexto para conflictos ya existentes?' },
        desc:  { pt: 'Cruzadas, Guerras de Religião, Jihad, Conflito israelo-árabe — quando a religião é causa e quando é bandeira de interesses políticos ou econômicos.', en: 'Crusades, Wars of Religion, Jihad, Arab-Israeli Conflict — when religion is cause and when it\'s a flag for political or economic interests.', es: 'Cruzadas, Guerras de Religión, Yihad, Conflicto árabe-israelí — cuándo la religión es causa y cuándo es bandera de intereses políticos o económicos.' },
        datasets: ['data/dados-cruzadas.json','data/dados-guerras-religiao.json','data/dados-expansao-isla.json','data/dados-israel-palestina.json'],
      },
      {
        id: 'q-democracia-fragil',
        texto: { pt: 'Por que a democracia é tão frágil — e por que persiste mesmo assim?', en: 'Why is democracy so fragile — and why does it persist anyway?', es: '¿Por qué la democracia es tan frágil — y por qué persiste de todas formas?' },
        desc:  { pt: 'De Atenas a Weimar — as democracias que colapsaram. E de Portugal (1974) a Coreia do Sul (1987) — as que surpreenderam. O que faz uma democracia sobreviver.', en: 'From Athens to Weimar — the democracies that collapsed. And from Portugal (1974) to South Korea (1987) — those that surprised. What makes a democracy survive.', es: 'De Atenas a Weimar — las democracias que colapsaron. Y de Portugal (1974) a Corea del Sur (1987) — las que sorprendieron. Qué hace sobrevivir a una democracia.' },
        datasets: ['data/dados-grecia-atenas.json','data/dados-entreguerras.json','data/dados-pos-guerra-fria.json','data/dados-personagens-seculo-xx.json'],
      },
    ],
  },

  {
    grupo: { pt: 'Conexões Inesperadas', en: 'Unexpected Connections', es: 'Conexiones Inesperadas' },
    itens: [
      {
        id: 'q-doencas-historia',
        texto: { pt: 'Como doenças invisíveis decidiram impérios e batalhas?', en: 'How did invisible diseases decide empires and battles?', es: '¿Cómo las enfermedades invisibles decidieron imperios y batallas?' },
        desc:  { pt: 'A varíola matou 90% dos nativos americanos antes que Cortés chegasse. A malária derrotou mais exércitos que qualquer general. A biologia como força histórica oculta.', en: 'Smallpox killed 90% of native Americans before Cortés arrived. Malaria defeated more armies than any general. Biology as a hidden historical force.', es: 'La viruela mató al 90% de los nativos americanos antes de que llegara Cortés. La malaria derrotó a más ejércitos que cualquier general. La biología como fuerza histórica oculta.' },
        datasets: ['data/dados-astecas-expandido.json','data/dados-medieval-feudalismo.json','data/dados-era-moderna.json','data/dados-imperialismo-colonial.json'],
      },
      {
        id: 'q-especiarias-mundo',
        texto: { pt: 'Como as especiarias mudaram o mundo — a história mais cheirosa da geopolítica.', en: 'How spices changed the world — the most fragrant story in geopolitics.', es: '¿Cómo las especias cambiaron el mundo — la historia más aromática de la geopolítica.' },
        desc:  { pt: 'Pimenta, cravo, noz-moscada — especiarias valiam mais que ouro e motivaram as navegações europeias. A procura por temperos criou o mundo moderno.', en: 'Pepper, cloves, nutmeg — spices were worth more than gold and motivated European explorations. The search for seasoning created the modern world.', es: 'Pimienta, clavo, nuez moscada — las especias valían más que el oro y motivaron las navegaciones europeas. La búsqueda de condimentos creó el mundo moderno.' },
        datasets: ['data/dados-navegacoes.json','data/dados-sudeste-asiatico-maritimo.json','data/dados-imperialismo-colonial.json','data/dados-india-vedica-maurya.json'],
      },
      {
        id: 'q-papel-acaso',
        texto: { pt: 'O papel do acaso na história: quando pequenos eventos mudam tudo.', en: 'The role of chance in history: when small events change everything.', es: 'El papel del azar en la historia: cuando pequeños eventos lo cambian todo.' },
        desc:  { pt: 'A tempestade que salvou o Japão dos Mongóis, o tiro que matou Franz Ferdinand, a mutação que causou a Peste Negra — quando o acaso é o principal personagem.', en: 'The storm that saved Japan from the Mongols, the shot that killed Franz Ferdinand, the mutation that caused the Black Death — when chance is the main character.', es: 'La tormenta que salvó a Japón de los mongoles, el disparo que mató a Franz Fernando, la mutación que causó la Peste Negra — cuando el azar es el personaje principal.' },
        datasets: ['data/dados-mongois-asia-central.json','data/dados-primeira-guerra.json','data/dados-medieval-feudalismo.json','data/dados-evolucao-humana.json'],
      },
      {
        id: 'q-mapas-poder',
        texto: { pt: 'Como os mapas moldaram — e distorceram — nossa visão do mundo.', en: 'How maps shaped — and distorted — our view of the world.', es: 'Cómo los mapas moldearon — y distorsionaron — nuestra visión del mundo.' },
        desc:  { pt: 'O mapa de Mercator, a divisão colonial da África, as fronteiras do Oriente Médio pós-WWI — quando quem desenha o mapa decide quem governa o território.', en: 'The Mercator map, the colonial division of Africa, post-WWI Middle East borders — when the one who draws the map decides who governs the territory.', es: 'El mapa de Mercator, la división colonial de África, las fronteras del Oriente Medio post-WWI — cuando quien dibuja el mapa decide quién gobierna el territorio.' },
        datasets: ['data/dados-navegacoes.json','data/dados-africa-pre-colonial.json','data/dados-imperialismo-colonial.json','data/dados-mesopotamia.json'],
      },
    ],
  },
,
// ═══════════════════════════════════════════════════════
  // GRUPO: HISTÓRIA POR BAIXO — Os que a história ignora
  // ═══════════════════════════════════════════════════════
  {
    grupo: { pt: 'História por Baixo: Os Invisíveis', en: 'History from Below: The Invisible', es: 'Historia desde Abajo: Los Invisibles' },
    itens: [
      {
        id: 'q-escravos-resistencia',
        texto: { pt: 'Como os escravizados resistiram — além de Espartaco e Zumbi?', en: 'How did enslaved people resist — beyond Spartacus and Zumbi?', es: '¿Cómo resistieron los esclavizados — más allá de Espartaco y Zumbi?' },
        desc: { pt: 'Sabotagem, fuga, quilombos, candomblé — as mil formas de resistência cotidiana que a história oficial raramente conta.', en: 'Sabotage, escape, maroon communities, candomblé — the thousand forms of daily resistance that official history rarely tells.', es: 'Sabotaje, huida, quilombos, candomblé — las mil formas de resistencia cotidiana que la historia oficial rara vez cuenta.' },
        datasets: ['data/dados-brasil-quilombos.json','data/dados-brasil-colonial-escravidao.json','data/dados-africa-pre-colonial.json','data/dados-personagens-americas.json'],
      },
      {
        id: 'q-camponeses-historia',
        texto: { pt: 'Qual era a vida dos camponeses — os 90% que a história esquece?', en: 'What was life like for peasants — the 90% that history forgets?', es: '¿Cómo era la vida de los campesinos — el 90% que la historia olvida?' },
        desc: { pt: 'Da servidão feudal à coletivização soviética — as condições materiais de vida dos trabalhadores rurais que sustentaram todas as civilizações.', en: 'From feudal serfdom to Soviet collectivization — the material living conditions of rural workers who sustained all civilizations.', es: 'De la servidumbre feudal a la colectivización soviética — las condiciones materiales de los trabajadores rurales que sostuvieron todas las civilizaciones.' },
        datasets: ['data/dados-medieval-feudalismo.json','data/dados-revolucao-russa.json','data/dados-china-qing-sociedade.json','data/dados-india-vedica-maurya.json'],
      },
      {
        id: 'q-mulheres-cotidiano',
        texto: { pt: 'Como era o cotidiano das mulheres comuns ao longo da história?', en: 'What was daily life like for ordinary women throughout history?', es: '¿Cómo era la vida cotidiana de las mujeres comunes a lo largo de la historia?' },
        desc: { pt: 'Além das rainhas e heroínas: casamento, maternidade, trabalho, corpo — a experiência histórica das mulheres que não deixaram nome.', en: 'Beyond queens and heroines: marriage, motherhood, work, body — the historical experience of women who left no name.', es: 'Más allá de reinas y heroínas: matrimonio, maternidad, trabajo, cuerpo — la experiencia histórica de las mujeres que no dejaron nombre.' },
        datasets: ['data/dados-personagens-mulheres.json','data/dados-medieval-feudalismo.json','data/dados-grecia-atenas.json','data/dados-movimentos-sociais.json'],
      },
      {
        id: 'q-criancas-historia',
        texto: { pt: 'A infância tem história? Como cada época tratou as crianças.', en: 'Does childhood have a history? How each era treated children.', es: '¿La infancia tiene historia? Cómo cada época trató a los niños.' },
        desc: { pt: 'Na Grécia antiga, crianças eram "adultos em miniatura". Na Revolução Industrial, trabalhavam 14 horas. A ideia de infância como fase protegida é muito recente.', en: 'In ancient Greece, children were "miniature adults". In the Industrial Revolution, they worked 14 hours. The idea of childhood as a protected phase is very recent.', es: 'En la Grecia antigua, los niños eran "adultos en miniatura". En la Revolución Industrial, trabajaban 14 horas. La idea de infancia como fase protegida es muy reciente.' },
        datasets: ['data/dados-grecia-atenas.json','data/dados-revolucao-industrial.json','data/dados-movimentos-sociais.json','data/dados-seculo-xix.json'],
      },
      {
        id: 'q-trabalhadores-industria',
        texto: { pt: 'Como os trabalhadores industriais lutaram por direitos — e ganharam?', en: 'How did industrial workers fight for rights — and win?', es: '¿Cómo lucharon los trabajadores industriales por sus derechos — y ganaron?' },
        desc: { pt: 'Cartismo, Primeira Internacional, greves gerais — o movimento operário que inventou o fim de semana, as férias, o horário de trabalho de 8 horas e o salário mínimo.', en: 'Chartism, First International, general strikes — the labor movement that invented the weekend, vacations, the 8-hour workday and the minimum wage.', es: 'Cartismo, Primera Internacional, huelgas generales — el movimiento obrero que inventó el fin de semana, las vacaciones, la jornada de 8 horas y el salario mínimo.' },
        datasets: ['data/dados-socialismo-trabalho.json','data/dados-revolucao-industrial.json','data/dados-capitalismo.json','data/dados-movimentos-sociais.json'],
      },
      {
        id: 'q-indigenas-resistencia',
        texto: { pt: 'Como os povos indígenas resistiram — e continuam resistindo.', en: 'How indigenous peoples resisted — and continue to resist.', es: 'Cómo los pueblos indígenas resistieron — y continúan resistiendo.' },
        desc: { pt: 'Além das guerras: jurídico, cultural, linguístico — as estratégias de sobrevivência e resistência dos povos originários das Américas e do mundo.', en: 'Beyond wars: legal, cultural, linguistic — the survival and resistance strategies of indigenous peoples of the Americas and the world.', es: 'Más allá de las guerras: jurídico, cultural, lingüístico — las estrategias de supervivencia y resistencia de los pueblos originarios de las Américas y del mundo.' },
        datasets: ['data/dados-brasil-01-povos-originarios.json','data/dados-brasil-indigenas.json','data/dados-povos-nativos-norte.json','data/dados-mapuches-povos-sul.json'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // GRUPO: ECONOMIA E DINHEIRO
  // ═══════════════════════════════════════════════════════
  {
    grupo: { pt: 'Economia e Dinheiro ao Longo da História', en: 'Economy and Money Throughout History', es: 'Economía y Dinero a lo Largo de la Historia' },
    itens: [
      {
        id: 'q-invencao-moeda',
        texto: { pt: 'Quem inventou o dinheiro — e por que mudou tudo?', en: 'Who invented money — and why did it change everything?', es: '¿Quién inventó el dinero — y por qué lo cambió todo?' },
        desc: { pt: 'Do escambo às moedas de Lidia, do crédito babilônico ao papel-moeda chinês — a história do dinheiro é a história da confiança entre estranhos.', en: 'From barter to Lydian coins, from Babylonian credit to Chinese paper money — the history of money is the history of trust between strangers.', es: 'Del trueque a las monedas de Lidia, del crédito babilónico al papel moneda chino — la historia del dinero es la historia de la confianza entre extraños.' },
        datasets: ['data/dados-sumeria.json','data/dados-mesopotamia.json','data/dados-grecia-atenas.json','data/dados-china-tang.json'],
      },
      {
        id: 'q-capitalismo-origem',
        texto: { pt: 'Quando e como nasceu o capitalismo?', en: 'When and how was capitalism born?', es: '¿Cuándo y cómo nació el capitalismo?' },
        desc: { pt: 'Banqueiros florentinos, Companhia das Índias Orientais, Revolução Industrial — o capitalismo não foi inventado por um decreto: emergiu de práticas acumuladas ao longo de séculos.', en: 'Florentine bankers, East India Company, Industrial Revolution — capitalism was not invented by decree: it emerged from practices accumulated over centuries.', es: 'Banqueros florentinos, Compañía de las Indias Orientales, Revolución Industrial — el capitalismo no fue inventado por decreto: emergió de prácticas acumuladas durante siglos.' },
        datasets: ['data/dados-renascimento-cultural.json','data/dados-navegacoes.json','data/dados-revolucao-industrial.json','data/dados-capitalismo.json'],
      },
      {
        id: 'q-crises-economicas',
        texto: { pt: 'O que as grandes crises econômicas têm em comum?', en: 'What do the great economic crises have in common?', es: '¿Qué tienen en común las grandes crisis económicas?' },
        desc: { pt: 'A Crise de Tulipas de 1637, o Crash de 1929, a crise de 2008 — o padrão de especulação, euforia, pânico e colapso que se repete há 400 anos.', en: 'The Tulip Crisis of 1637, the Crash of 1929, the 2008 crisis — the pattern of speculation, euphoria, panic and collapse that has repeated for 400 years.', es: 'La Crisis de los Tulipanes de 1637, el Crack de 1929, la crisis de 2008 — el patrón de especulación, euforia, pánico y colapso que se repite desde hace 400 años.' },
        datasets: ['data/dados-capitalismo.json','data/dados-entreguerras.json','data/dados-eua-gilded-age.json','data/dados-pos-guerra-fria.json'],
      },
      {
        id: 'q-socialismo-experimentos',
        texto: { pt: 'O socialismo funcionou em algum lugar? Balanço dos experimentos do século XX.', en: 'Did socialism work anywhere? A balance of 20th century experiments.', es: '¿Funcionó el socialismo en algún lugar? Balance de los experimentos del siglo XX.' },
        desc: { pt: 'URSS, China, Cuba, Venezuela, os países nórdicos — o que deu certo, o que falhou e o que os experimentos socialistas do século XX nos ensinam.', en: 'USSR, China, Cuba, Venezuela, the Nordic countries — what worked, what failed and what the socialist experiments of the 20th century teach us.', es: 'URSS, China, Cuba, Venezuela, los países nórdicos — qué funcionó, qué falló y qué nos enseñan los experimentos socialistas del siglo XX.' },
        datasets: ['data/dados-socialismo-trabalho.json','data/dados-revolucao-russa.json','data/dados-china-mao-revolucao.json','data/dados-guerra-fria.json'],
      },
      {
        id: 'q-comercio-poder',
        texto: { pt: 'Quem controla o comércio, controla o mundo — a história das rotas mercantis.', en: 'Who controls trade, controls the world — the history of merchant routes.', es: 'Quien controla el comercio, controla el mundo — la historia de las rutas mercantiles.' },
        desc: { pt: 'Fenícios no Mediterrâneo, árabes no Oceano Índico, holandeses no Atlântico — como o controle das rotas comerciais determinou quem mandava no mundo pré-moderno.', en: 'Phoenicians in the Mediterranean, Arabs in the Indian Ocean, Dutch in the Atlantic — how control of trade routes determined who ruled the pre-modern world.', es: 'Fenicios en el Mediterráneo, árabes en el Océano Índico, holandeses en el Atlántico — cómo el control de las rutas comerciales determinó quién mandaba en el mundo premoderno.' },
        datasets: ['data/dados-fenicios-cartago.json','data/dados-navegacoes.json','data/dados-mongois-asia-central.json','data/dados-era-moderna.json'],
      },
      {
        id: 'q-ouro-prata-historia',
        texto: { pt: 'Como o ouro e a prata das Américas transformaram a economia mundial?', en: 'How did gold and silver from the Americas transform the world economy?', es: '¿Cómo el oro y la plata de las Américas transformaron la economía mundial?' },
        desc: { pt: 'Potosí, o real de a oito e a primeira globalização monetária — como os metais americanos criaram inflação na Espanha, financiaram a China Ming e desequilibraram o mundo.', en: 'Potosí, the piece of eight and the first monetary globalization — how American metals created inflation in Spain, financed Ming China and unbalanced the world.', es: 'Potosí, el real de a ocho y la primera globalización monetaria — cómo los metales americanos crearon inflación en España, financiaron la China Ming y desequilibraron el mundo.' },
        datasets: ['data/dados-incas.json','data/dados-era-moderna.json','data/dados-navegacoes.json','data/dados-china-ming.json'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // GRUPO: GUERRA E TECNOLOGIA MILITAR
  // ═══════════════════════════════════════════════════════
  {
    grupo: { pt: 'Guerra: Tecnologia, Estratégia e Consequências', en: 'War: Technology, Strategy and Consequences', es: 'Guerra: Tecnología, Estrategia y Consecuencias' },
    itens: [
      {
        id: 'q-armas-mudaram-guerras',
        texto: { pt: 'Como as inovações militares mudaram o equilíbrio de poder?', en: 'How did military innovations change the balance of power?', es: '¿Cómo las innovaciones militares cambiaron el equilibrio de poder?' },
        desc: { pt: 'Estribo, pólvora, metralhadora, bomba atômica — cada inovação militar tornou obsoleto o que veio antes e redistribuiu o poder entre nações.', en: 'Stirrup, gunpowder, machine gun, atomic bomb — each military innovation made what came before obsolete and redistributed power among nations.', es: 'Estribo, pólvora, ametralladora, bomba atómica — cada innovación militar volvió obsoleto lo anterior y redistribuyó el poder entre naciones.' },
        datasets: ['data/dados-mongois-asia-central.json','data/dados-navegacoes.json','data/dados-primeira-guerra.json','data/dados-segunda-guerra.json'],
      },
      {
        id: 'q-guerras-nao-declaradas',
        texto: { pt: 'As guerras que não constam nos livros: conflitos esquecidos do século XX.', en: 'Wars not in the books: forgotten conflicts of the 20th century.', es: 'Las guerras que no están en los libros: conflictos olvidados del siglo XX.' },
        desc: { pt: 'Guerra da Coreia, Bieafra, Iêmen, Eritreia, Camboja — os conflitos que mataram milhões e quase não aparecem no currículo escolar ocidental.', en: 'Korean War, Biafra, Yemen, Eritrea, Cambodia — the conflicts that killed millions and barely appear in the Western school curriculum.', es: 'Guerra de Corea, Biafra, Yemen, Eritrea, Camboya — los conflictos que mataron millones y casi no aparecen en el currículo escolar occidental.' },
        datasets: ['data/dados-descolonizacao.json','data/dados-guerra-fria.json','data/dados-descolonizacao-guerras.json','data/dados-personagens-seculo-xx.json'],
      },
      {
        id: 'q-guerrilha-resistencia',
        texto: { pt: 'Por que os exércitos convencionais perdem para as guerrilhas?', en: 'Why do conventional armies lose to guerrillas?', es: '¿Por qué los ejércitos convencionales pierden ante las guerrillas?' },
        desc: { pt: 'Vietnã, Afeganistão, Argélia — o padrão que se repete: superpotência militar derrotada por combatentes sem uniforme. A lógica da guerra irregular.', en: 'Vietnam, Afghanistan, Algeria — the repeating pattern: military superpower defeated by fighters without uniforms. The logic of irregular warfare.', es: 'Vietnam, Afganistán, Argelia — el patrón que se repite: superpotencia militar derrotada por combatientes sin uniforme. La lógica de la guerra irregular.' },
        datasets: ['data/dados-descolonizacao-guerras.json','data/dados-guerra-fria.json','data/dados-personagens-seculo-xx.json'],
      },
      {
        id: 'q-paz-porque-funciona',
        texto: { pt: 'Como se faz a paz? Os tratados que funcionaram — e os que não funcionaram.', en: 'How is peace made? Treaties that worked — and those that did not.', es: '¿Cómo se hace la paz? Los tratados que funcionaron — y los que no.' },
        desc: { pt: 'Westfália (1648), Viena (1815), Versalhes (1919) — por que alguns tratados de paz criaram ordem duradoura e outros plantaram a semente da próxima guerra.', en: 'Westphalia (1648), Vienna (1815), Versailles (1919) — why some peace treaties created lasting order and others planted the seed of the next war.', es: 'Westfalia (1648), Viena (1815), Versalles (1919) — por qué algunos tratados de paz crearon un orden duradero y otros plantaron la semilla de la próxima guerra.' },
        datasets: ['data/dados-guerras-religiao.json','data/dados-guerras-napoleonicas.json','data/dados-primeira-guerra.json','data/dados-segunda-guerra.json'],
      },
      {
        id: 'q-armas-nucleares-historia',
        texto: { pt: 'Como o mundo aprendeu a viver — e a tremer — com as armas nucleares?', en: 'How did the world learn to live — and tremble — with nuclear weapons?', es: '¿Cómo aprendió el mundo a vivir — y a temblar — con las armas nucleares?' },
        desc: { pt: 'Manhattan, Hiroshima, Crise dos Mísseis, MAD — a lógica aterrorizante da destruição mútua assegurada que manteve uma paz precária entre superpotências.', en: 'Manhattan, Hiroshima, Missile Crisis, MAD — the terrifying logic of mutually assured destruction that maintained a precarious peace between superpowers.', es: 'Manhattan, Hiroshima, Crisis de los Misiles, MAD — la aterrizadora lógica de la destrucción mutua asegurada que mantuvo una precaria paz entre superpotencias.' },
        datasets: ['data/dados-segunda-guerra.json','data/dados-guerra-fria.json','data/dados-personagens-seculo-xx.json'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // GRUPO: CIÊNCIA — DESCOBERTAS QUE MUDARAM O MUNDO
  // ═══════════════════════════════════════════════════════
  {
    grupo: { pt: 'Ciência: Descobertas que Mudaram o Mundo', en: 'Science: Discoveries that Changed the World', es: 'Ciencia: Descubrimientos que Cambiaron el Mundo' },
    itens: [
      {
        id: 'q-darwin-evolucao-impacto',
        texto: { pt: 'O que Darwin realmente disse — e por que ainda é mal compreendido?', en: 'What did Darwin really say — and why is he still misunderstood?', es: '¿Qué dijo realmente Darwin — y por qué sigue siendo malentendido?' },
        desc: { pt: 'A seleção natural não tem direção, não tem progresso e não tem propósito. Essa ideia radicalmente anti-intuitiva continua sendo negada por metade da humanidade.', en: 'Natural selection has no direction, no progress and no purpose. This radically counterintuitive idea continues to be denied by half of humanity.', es: 'La selección natural no tiene dirección, progreso ni propósito. Esta idea radicalmente contraintuitiva sigue siendo negada por la mitad de la humanidad.' },
        datasets: ['data/dados-evolucao-humana.json','data/dados-revolucao-cientifica.json','data/dados-personagens-ciencia-pensamento.json','data/dados-seculo-xix.json'],
      },
      {
        id: 'q-fisica-moderna',
        texto: { pt: 'Einstein, Bohr, Heisenberg: como a física do século XX reescreveu a realidade.', en: 'Einstein, Bohr, Heisenberg: how 20th century physics rewrote reality.', es: 'Einstein, Bohr, Heisenberg: cómo la física del siglo XX reescribió la realidad.' },
        desc: { pt: 'Relatividade e mecânica quântica disseram que o tempo é relativo, que partículas existem em vários estados simultaneamente, e que observar muda o que se observa. Isso não é filosofia — é o fundamento dos chips que movem o mundo.', en: 'Relativity and quantum mechanics said that time is relative, that particles exist in several states simultaneously, and that observing changes what is observed. This is not philosophy — it is the foundation of the chips that move the world.', es: 'La relatividad y la mecánica cuántica dijeron que el tiempo es relativo, que las partículas existen en varios estados simultáneamente, y que observar cambia lo que se observa. Esto no es filosofía — es el fundamento de los chips que mueven el mundo.' },
        datasets: ['data/dados-revolucao-cientifica.json','data/dados-personagens-ciencia-pensamento.json','data/dados-segunda-guerra.json'],
      },
      {
        id: 'q-medicina-historia',
        texto: { pt: 'Como a medicina passou de magia a ciência — e ainda não chegou lá de todo.', en: 'How medicine went from magic to science — and still has not fully arrived.', es: '¿Cómo pasó la medicina de la magia a la ciencia — y todavía no ha llegado del todo?' },
        desc: { pt: 'Hipócrates, Galeno, Harvey, Pasteur, Fleming — cada avanço médico foi rejeitado pelos médicos estabelecidos antes de ser aceito. O progresso na medicina é sempre uma batalha de gerações.', en: 'Hippocrates, Galen, Harvey, Pasteur, Fleming — each medical advance was rejected by established doctors before being accepted. Progress in medicine is always a battle of generations.', es: 'Hipócrates, Galeno, Harvey, Pasteur, Fleming — cada avance médico fue rechazado por los médicos establecidos antes de ser aceptado. El progreso en medicina es siempre una batalla de generaciones.' },
        datasets: ['data/dados-grecia-atenas.json','data/dados-revolucao-cientifica.json','data/dados-personagens-ciencia-pensamento.json','data/dados-seculo-xix.json'],
      },
      {
        id: 'q-computadores-internet',
        texto: { pt: 'Como o computador e a internet foram inventados — e o que podem destruir.', en: 'How the computer and the internet were invented — and what they may destroy.', es: '¿Cómo se inventaron la computadora e internet — y qué pueden destruir?' },
        desc: { pt: 'Turing, Von Neumann, ARPANET, Berners-Lee — a história da tecnologia que reconfigura a política, a economia e a mente humana em tempo real.', en: 'Turing, Von Neumann, ARPANET, Berners-Lee — the history of the technology that reconfigures politics, the economy and the human mind in real time.', es: 'Turing, Von Neumann, ARPANET, Berners-Lee — la historia de la tecnología que reconfigura la política, la economía y la mente humana en tiempo real.' },
        datasets: ['data/dados-ciencia-tecnologia.json','data/dados-personagens-mulheres.json','data/dados-pos-guerra-fria.json'],
      },
      {
        id: 'q-espaco-corrida',
        texto: { pt: 'O que a corrida espacial revelou sobre a humanidade — além de foguetes?', en: 'What did the space race reveal about humanity — beyond rockets?', es: '¿Qué reveló la carrera espacial sobre la humanidad — más allá de los cohetes?' },
        desc: { pt: 'Sputnik, Gagarin, Apolo 11, Mir, ISS — a corrida espacial foi tanto uma batalha ideológica quanto científica. O que aconteceu quando a competição virou cooperação?', en: 'Sputnik, Gagarin, Apollo 11, Mir, ISS — the space race was as much an ideological as a scientific battle. What happened when competition became cooperation?', es: 'Sputnik, Gagarin, Apolo 11, Mir, ISS — la carrera espacial fue tanto una batalla ideológica como científica. ¿Qué pasó cuando la competencia se convirtió en cooperación?' },
        datasets: ['data/dados-guerra-fria.json','data/dados-personagens-mulheres.json','data/dados-ciencia-tecnologia.json'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // GRUPO: LINGUAGEM, ESCRITA E COMUNICAÇÃO
  // ═══════════════════════════════════════════════════════
  {
    grupo: { pt: 'Linguagem, Escrita e Comunicação', en: 'Language, Writing and Communication', es: 'Lenguaje, Escritura y Comunicación' },
    itens: [
      {
        id: 'q-sistemas-escrita',
        texto: { pt: 'Quantos sistemas de escrita existiram — e quantos ainda são mistério?', en: 'How many writing systems existed — and how many are still a mystery?', es: '¿Cuántos sistemas de escritura existieron — y cuántos siguen siendo un misterio?' },
        desc: { pt: 'Cuneiforme, hieróglifos, alfabeto fenício, Linear B, caracteres chineses — cada sistema de escrita revela como uma cultura organiza o conhecimento. Alguns ainda não foram decifrados.', en: 'Cuneiform, hieroglyphs, Phoenician alphabet, Linear B, Chinese characters — each writing system reveals how a culture organizes knowledge. Some have not yet been deciphered.', es: 'Cuneiforme, jeroglíficos, alfabeto fenicio, Lineal B, caracteres chinos — cada sistema de escritura revela cómo una cultura organiza el conocimiento. Algunos aún no han sido descifrados.' },
        datasets: ['data/dados-sumeria.json','data/dados-egito-antigo.json','data/dados-fenicios-cartago.json','data/dados-china-neolitico.json'],
      },
      {
        id: 'q-imprensa-informacao',
        texto: { pt: 'A imprensa de Gutenberg foi o primeiro algoritmo viral da história?', en: 'Was Gutenberg\'s printing press the first viral algorithm in history?', es: '¿Fue la imprenta de Gutenberg el primer algoritmo viral de la historia?' },
        desc: { pt: 'Em 50 anos, a imprensa multiplicou o número de livros por 1.000 — e gerou Reforma Protestante, guerras de religião e revolução científica. Como a tecnologia da informação sempre escapa do controle de quem a cria.', en: 'In 50 years, the printing press multiplied the number of books by 1,000 — and generated the Protestant Reformation, religious wars and scientific revolution. How information technology always escapes the control of those who create it.', es: 'En 50 años, la imprenta multiplicó el número de libros por 1.000 — y generó la Reforma Protestante, guerras de religión y revolución científica. Cómo la tecnología de la información siempre escapa al control de quien la crea.' },
        datasets: ['data/dados-lutero-reforma.json','data/dados-renascimento-cultural.json','data/dados-revolucao-cientifica.json'],
      },
      {
        id: 'q-linguas-extintas',
        texto: { pt: 'O que se perde quando uma língua morre?', en: 'What is lost when a language dies?', es: '¿Qué se pierde cuando muere una lengua?' },
        desc: { pt: 'Metade das 7.000 línguas do mundo vai desaparecer neste século. Cada língua é uma forma única de organizar a realidade — sua morte apaga perspectivas que nunca poderão ser recriadas.', en: 'Half of the world\'s 7,000 languages will disappear this century. Each language is a unique way of organizing reality — its death erases perspectives that can never be recreated.', es: 'La mitad de los 7.000 idiomas del mundo desaparecerá este siglo. Cada lengua es una forma única de organizar la realidad — su muerte borra perspectivas que nunca podrán recrearse.' },
        datasets: ['data/dados-brasil-01-povos-originarios.json','data/dados-povos-nativos-norte.json','data/dados-mapuches-povos-sul.json','data/dados-descolonizacao.json'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // GRUPO: CIDADES E URBANIZAÇÃO
  // ═══════════════════════════════════════════════════════
  {
    grupo: { pt: 'Cidades: Do Nascimento à Megalópole', en: 'Cities: From Birth to Megalopolis', es: 'Ciudades: Del Nacimiento a la Megalópolis' },
    itens: [
      {
        id: 'q-primeiras-cidades',
        texto: { pt: 'Como nasceram as primeiras cidades — e por que?', en: 'How were the first cities born — and why?', es: '¿Cómo nacieron las primeras ciudades — y por qué?' },
        desc: { pt: 'Uruk, Çatalhöyük, Mohenjo-Daro — o que fez grupos de humanos decidirem viver juntos em densidade sem precedente. A cidade como invenção tecnológica mais importante da história.', en: 'Uruk, Çatalhöyük, Mohenjo-Daro — what made groups of humans decide to live together at unprecedented density. The city as the most important technological invention in history.', es: 'Uruk, Çatalhöyük, Mohenjo-Daro — qué hizo que grupos de humanos decidieran vivir juntos con una densidad sin precedentes. La ciudad como la invención tecnológica más importante de la historia.' },
        datasets: ['data/dados-sumeria-cidades.json','data/dados-sumeria.json','data/dados-india-vedica-maurya.json','data/dados-pre-historia-neolitico.json'],
      },
      {
        id: 'q-cidades-antigas-grandeza',
        texto: { pt: 'As grandes cidades da Antiguidade: Roma, Bagdá, Chang\'an, Tenochtitlan.', en: 'The great cities of Antiquity: Rome, Baghdad, Chang\'an, Tenochtitlan.', es: 'Las grandes ciudades de la Antigüedad: Roma, Bagdad, Chang\'an, Tenochtitlan.' },
        desc: { pt: 'Em 100 d.C., Roma tinha 1 milhão de habitantes. Em 900, Bagdá era a maior cidade do mundo. Em 1500, Tenochtitlan superava qualquer cidade europeia. O que faz uma cidade se tornar o centro do mundo?', en: 'In 100 CE, Rome had 1 million inhabitants. In 900, Baghdad was the largest city in the world. In 1500, Tenochtitlan surpassed any European city. What makes a city become the center of the world?', es: 'En el año 100, Roma tenía 1 millón de habitantes. En el 900, Bagdad era la ciudad más grande del mundo. En 1500, Tenochtitlan superaba cualquier ciudad europea. ¿Qué hace que una ciudad se convierta en el centro del mundo?' },
        datasets: ['data/dados-roma-republica.json','data/dados-califados-islamicos.json','data/dados-china-tang.json','data/dados-astecas-imperio.json'],
      },
      {
        id: 'q-urbanizacao-industrial',
        texto: { pt: 'Como a industrialização criou a cidade moderna — e seus problemas.', en: 'How industrialization created the modern city — and its problems.', es: '¿Cómo la industrialización creó la ciudad moderna — y sus problemas?' },
        desc: { pt: 'Manchester, Londres, Nova York do século XIX — cortiços, poluição, criminalidade, mas também parques, saneamento, metrô. A cidade industrial como laboratório do mundo moderno.', en: 'Manchester, London, 19th century New York — tenements, pollution, crime, but also parks, sanitation, subway. The industrial city as a laboratory of the modern world.', es: 'Manchester, Londres, Nueva York del siglo XIX — tugurios, contaminación, criminalidad, pero también parques, saneamiento, metro. La ciudad industrial como laboratorio del mundo moderno.' },
        datasets: ['data/dados-revolucao-industrial.json','data/dados-capitalismo.json','data/dados-seculo-xix.json','data/dados-movimentos-sociais.json'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // GRUPO: FILOSOFIA POLÍTICA
  // ═══════════════════════════════════════════════════════
  {
    grupo: { pt: 'Filosofia Política: As Ideias que Governam o Mundo', en: 'Political Philosophy: Ideas That Govern the World', es: 'Filosofía Política: Las Ideas que Gobiernan el Mundo' },
    itens: [
      {
        id: 'q-contrato-social',
        texto: { pt: 'O que é o contrato social — e quem ele exclui?', en: 'What is the social contract — and who does it exclude?', es: '¿Qué es el contrato social — y a quién excluye?' },
        desc: { pt: 'Hobbes, Locke, Rousseau, Rawls — a ideia de que o governo deriva do consentimento dos governados. Mas quem estava na sala quando o contrato foi "assinado"?', en: 'Hobbes, Locke, Rousseau, Rawls — the idea that government derives from the consent of the governed. But who was in the room when the contract was "signed"?', es: 'Hobbes, Locke, Rousseau, Rawls — la idea de que el gobierno deriva del consentimiento de los gobernados. Pero ¿quién estaba en la sala cuando se "firmó" el contrato?' },
        datasets: ['data/dados-iluminismo.json','data/dados-revolucoes-liberais.json','data/dados-personagens-iluminismo-revolucoes.json'],
      },
      {
        id: 'q-nacionalismo-origem',
        texto: { pt: 'O nacionalismo foi inventado — por quem e quando?', en: 'Nationalism was invented — by whom and when?', es: '¿El nacionalismo fue inventado — por quién y cuándo?' },
        desc: { pt: 'A "nação" não é um dado natural: foi construída por jornais, escolas, hinos e mapas no século XIX. Benedict Anderson chamou de "comunidades imaginadas" — mas o que é imaginado pode matar muito.', en: 'The "nation" is not a natural given: it was built by newspapers, schools, anthems and maps in the 19th century. Benedict Anderson called them "imagined communities" — but what is imagined can kill a great deal.', es: 'La "nación" no es un dato natural: fue construida por periódicos, escuelas, himnos y mapas en el siglo XIX. Benedict Anderson las llamó "comunidades imaginadas" — pero lo que se imagina puede matar mucho.' },
        datasets: ['data/dados-seculo-xix.json','data/dados-entreguerras.json','data/dados-revolucoes-liberais.json'],
      },
      {
        id: 'q-fascismo-origem',
        texto: { pt: 'O que é o fascismo — e por que sempre volta?', en: 'What is fascism — and why does it always return?', es: '¿Qué es el fascismo — y por qué siempre vuelve?' },
        desc: { pt: 'Mussolini, Hitler, Franco, Salazar — o fascismo não é apenas uma política: é uma forma de sentir. E seus ingredientes — humilhação nacional, líder carismático, bode expiatório — ressurgem regularmente.', en: 'Mussolini, Hitler, Franco, Salazar — fascism is not just a policy: it is a way of feeling. And its ingredients — national humiliation, charismatic leader, scapegoat — resurface regularly.', es: 'Mussolini, Hitler, Franco, Salazar — el fascismo no es solo una política: es una forma de sentir. Y sus ingredientes — humillación nacional, líder carismático, chivo expiatorio — resurgen regularmente.' },
        datasets: ['data/dados-entreguerras.json','data/dados-segunda-guerra.json','data/dados-personagens-seculo-xx-guerras.json'],
      },
      {
        id: 'q-anarquismo-historia',
        texto: { pt: 'O anarquismo existiu na prática — além das bombas do imaginário popular.', en: 'Did anarchism exist in practice — beyond the bombs of popular imagination.', es: '¿El anarquismo existió en la práctica — más allá de las bombas del imaginario popular?' },
        desc: { pt: 'Proudhon, Bakunin, Kropotkin, a CNT na Guerra Civil Espanhola — o anarquismo governou territórios, organizou sindicatos e propôs alternativas reais ao Estado. O que aprendemos com esses experimentos?', en: 'Proudhon, Bakunin, Kropotkin, the CNT in the Spanish Civil War — anarchism governed territories, organized unions and proposed real alternatives to the State. What do we learn from these experiments?', es: 'Proudhon, Bakunin, Kropotkin, la CNT en la Guerra Civil Española — el anarquismo gobernó territorios, organizó sindicatos y propuso alternativas reales al Estado. ¿Qué aprendemos de estos experimentos?' },
        datasets: ['data/dados-socialismo-trabalho.json','data/dados-entreguerras.json','data/dados-seculo-xix.json'],
      },
      {
        id: 'q-direitos-humanos-historia',
        texto: { pt: 'Os direitos humanos são universais — ou são uma invenção ocidental?', en: 'Are human rights universal — or a Western invention?', es: '¿Los derechos humanos son universales — o una invención occidental?' },
        desc: { pt: 'Da Carta Magna ao Cilindro de Ciro, da Declaração dos Direitos do Homem à Declaração Universal de 1948 — o debate entre universalismo e relativismo cultural ainda não foi resolvido.', en: 'From Magna Carta to the Cyrus Cylinder, from the Declaration of Rights of Man to the 1948 Universal Declaration — the debate between universalism and cultural relativism has not yet been resolved.', es: 'De la Magna Carta al Cilindro de Ciro, de la Declaración de Derechos del Hombre a la Declaración Universal de 1948 — el debate entre universalismo y relativismo cultural aún no ha sido resuelto.' },
        datasets: ['data/dados-persia-expandida.json','data/dados-iluminismo.json','data/dados-personagens-mulheres.json','data/dados-personagens-seculo-xx.json'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // GRUPO: OCEANOS E NAVEGAÇÃO
  // ═══════════════════════════════════════════════════════
  {
    grupo: { pt: 'Oceanos: As Estradas do Mundo', en: 'Oceans: The Roads of the World', es: 'Océanos: Las Carreteras del Mundo' },
    itens: [
      {
        id: 'q-navegadores-polinesia',
        texto: { pt: 'Como os polinésios navegaram o Pacífico sem instrumentos?', en: 'How did Polynesians navigate the Pacific without instruments?', es: '¿Cómo navegaron los polinesios el Pacífico sin instrumentos?' },
        desc: { pt: 'Os polinésios colonizaram metade do globo — da Nova Zelândia ao Havaí à Ilha de Páscoa — usando estrelas, ondas e pássaros. O maior feito náutico antes de Colombo.', en: 'The Polynesians colonized half the globe — from New Zealand to Hawaii to Easter Island — using stars, waves and birds. The greatest nautical feat before Columbus.', es: 'Los polinesios colonizaron la mitad del globo — de Nueva Zelanda a Hawái a la Isla de Pascua — usando estrellas, olas y pájaros. La mayor hazaña náutica antes de Colón.' },
        datasets: ['data/dados-navegacoes.json','data/dados-pre-historia-paleolitico.json','data/dados-sudeste-asiatico-maritimo.json'],
      },
      {
        id: 'q-mar-mediterraneo',
        texto: { pt: 'O Mediterrâneo: por que este mar produziu tantas civilizações?', en: 'The Mediterranean: why did this sea produce so many civilizations?', es: 'El Mediterráneo: ¿por qué este mar produjo tantas civilizaciones?' },
        desc: { pt: 'Fenícios, gregos, romanos, árabes, venezianos — o Mediterrâneo foi a autoestrada que conectou três continentes por 3.000 anos. Sua história é quase a história do mundo ocidental.', en: 'Phoenicians, Greeks, Romans, Arabs, Venetians — the Mediterranean was the highway that connected three continents for 3,000 years. Its history is almost the history of the Western world.', es: 'Fenicios, griegos, romanos, árabes, venecianos — el Mediterráneo fue la autopista que conectó tres continentes durante 3.000 años. Su historia es casi la historia del mundo occidental.' },
        datasets: ['data/dados-fenicios-cartago.json','data/dados-grecia-atenas.json','data/dados-roma-republica.json','data/dados-expansao-isla.json'],
      },
      {
        id: 'q-pirataria-historia',
        texto: { pt: 'Os piratas eram bandidos — ou o proletariado do mar?', en: 'Were pirates criminals — or the proletariat of the sea?', es: '¿Los piratas eran delincuentes — o el proletariado del mar?' },
        desc: { pt: 'Nos séculos XVII e XVIII, muitos navios piratas tinham constituições escritas, voto para decisões coletivas e divisão igualitária do saque — décadas antes da Revolução Francesa.', en: 'In the 17th and 18th centuries, many pirate ships had written constitutions, votes for collective decisions and equal division of loot — decades before the French Revolution.', es: 'En los siglos XVII y XVIII, muchos barcos piratas tenían constituciones escritas, votación para decisiones colectivas y división igualitaria del botín — décadas antes de la Revolución Francesa.' },
        datasets: ['data/dados-navegacoes.json','data/dados-era-moderna.json','data/dados-imperialismo-colonial.json'],
      },
      {
        id: 'q-oceanico-indico',
        texto: { pt: 'O Oceano Índico: a rota comercial mais importante do mundo pré-moderno.', en: 'The Indian Ocean: the most important trade route in the pre-modern world.', es: 'El Océano Índico: la ruta comercial más importante del mundo premoderno.' },
        desc: { pt: 'Árabes, indianos, malaios, chineses e suaílis comercializaram pelo Índico por mil anos antes de Vasco da Gama "descobri-lo" — e o comércio árabe-indiano moldou a África Oriental e o Sudeste Asiático.', en: 'Arabs, Indians, Malays, Chinese and Swahilis traded through the Indian Ocean for a thousand years before Vasco da Gama "discovered" it — and Arab-Indian trade shaped East Africa and Southeast Asia.', es: 'Árabes, indios, malayos, chinos y suajilis comerciaron por el Índico durante mil años antes de que Vasco da Gama lo "descubriera" — y el comercio árabe-indio moldeó el África Oriental y el Sudeste Asiático.' },
        datasets: ['data/dados-expansao-isla.json','data/dados-india-vedica-maurya.json','data/dados-africa-ocidental.json','data/dados-sudeste-asiatico-maritimo.json'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // GRUPO: IDENTIDADE E ALTERIDADE
  // ═══════════════════════════════════════════════════════
  {
    grupo: { pt: 'Identidade, Raça e Alteridade na História', en: 'Identity, Race and Otherness in History', es: 'Identidad, Raza y Alteridad en la Historia' },
    itens: [
      {
        id: 'q-raca-invencao',
        texto: { pt: 'A raça foi inventada — quando, por quem e para quê?', en: 'Race was invented — when, by whom and for what?', es: '¿La raza fue inventada — cuándo, por quién y para qué?' },
        desc: { pt: 'A ideia de raças humanas biologicamente distintas foi fabricada nos séculos XVII-XIX para justificar a escravidão e o colonialismo. A ciência moderna refutou o conceito biológico — mas suas consequências sociais persistem.', en: 'The idea of biologically distinct human races was fabricated in the 17th-19th centuries to justify slavery and colonialism. Modern science has refuted the biological concept — but its social consequences persist.', es: 'La idea de razas humanas biológicamente distintas fue fabricada en los siglos XVII-XIX para justificar la esclavitud y el colonialismo. La ciencia moderna refutó el concepto biológico — pero sus consecuencias sociales persisten.' },
        datasets: ['data/dados-imperialismo-colonial.json','data/dados-africa-pre-colonial.json','data/dados-movimentos-sociais.json','data/dados-personagens-americas.json'],
      },
      {
        id: 'q-antisemitismo-historia',
        texto: { pt: 'Como o antissemitismo chegou ao Holocausto — a história de um ódio de 2.000 anos.', en: 'How antisemitism led to the Holocaust — the history of a 2,000-year hatred.', es: 'Cómo el antisemitismo llevó al Holocausto — la historia de un odio de 2.000 años.' },
        desc: { pt: 'Do antijudaísmo cristão medieval aos pogroms russos ao nazismo — como o ódio aos judeus foi transformado de preconceito religioso em ideologia racial e então em genocídio industrial.', en: 'From medieval Christian anti-Judaism to Russian pogroms to Nazism — how hatred of Jews was transformed from religious prejudice to racial ideology and then to industrial genocide.', es: 'Del antijudaísmo cristiano medieval a los pogromos rusos al nazismo — cómo el odio a los judíos se transformó de prejuicio religioso en ideología racial y luego en genocidio industrial.' },
        datasets: ['data/dados-mesopotamia-hebreus-fenicios.json','data/dados-medieval-feudalismo.json','data/dados-entreguerras.json','data/dados-holocaust.json'],
      },
      {
        id: 'q-diaspora-historia',
        texto: { pt: 'O que as diásporas ensinam sobre identidade, adaptação e resistência?', en: 'What do diasporas teach about identity, adaptation and resistance?', es: '¿Qué enseñan las diásporas sobre identidad, adaptación y resistencia?' },
        desc: { pt: 'Diáspora judaica, africana, armênia, chinesa, indiana — quando um povo é forçado a viver entre outros, o que mantém sua identidade? E quando ela se dissolve — e quando não?', en: 'Jewish, African, Armenian, Chinese, Indian diaspora — when a people is forced to live among others, what maintains their identity? And when does it dissolve — and when does it not?', es: 'Diáspora judía, africana, armenia, china, india — cuando un pueblo se ve obligado a vivir entre otros, ¿qué mantiene su identidad? ¿Y cuándo se disuelve — y cuándo no?' },
        datasets: ['data/dados-mesopotamia-hebreus-fenicios.json','data/dados-africa-pre-colonial.json','data/dados-personagens-seculo-xx.json','data/dados-movimentos-sociais.json'],
      },
      {
        id: 'q-colonialismo-legado',
        texto: { pt: 'O colonialismo terminou — ou apenas mudou de forma?', en: 'Did colonialism end — or did it just change form?', es: '¿El colonialismo terminó — o simplemente cambió de forma?' },
        desc: { pt: 'Neocolonialismo, dívida externa, multinacionais, bases militares — os mecanismos pelos quais antigas potências coloniais continuam extraindo recursos e definindo políticas em países formalmente independentes.', en: 'Neocolonialism, external debt, multinationals, military bases — the mechanisms by which former colonial powers continue extracting resources and defining policies in formally independent countries.', es: 'Neocolonialismo, deuda externa, multinacionales, bases militares — los mecanismos por los que las antiguas potencias coloniales continúan extrayendo recursos y definiendo políticas en países formalmente independientes.' },
        datasets: ['data/dados-descolonizacao.json','data/dados-africa-pre-colonial.json','data/dados-pos-guerra-fria.json','data/dados-personagens-seculo-xx.json'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // GRUPO: MEIO AMBIENTE E CIVILIZAÇÃO
  // ═══════════════════════════════════════════════════════
  {
    grupo: { pt: 'Meio Ambiente e Colapso de Civilizações', en: 'Environment and Civilizational Collapse', es: 'Medio Ambiente y Colapso de Civilizaciones' },
    itens: [
      {
        id: 'q-colapso-ambiental',
        texto: { pt: 'Civilizações que destruíram seu ambiente — e colapsaram por isso.', en: 'Civilizations that destroyed their environment — and collapsed because of it.', es: 'Civilizaciones que destruyeron su medio ambiente — y colapsaron por eso.' },
        desc: { pt: 'Sumérios salinizaram seus campos. A Ilha de Páscoa derrubou todas as suas árvores. Os Maias superpopularam suas cidades. O colapso ambiental não é invenção moderna — é padrão histórico.', en: 'Sumerians salinized their fields. Easter Island cut down all its trees. The Maya overpopulated their cities. Environmental collapse is not a modern invention — it is a historical pattern.', es: 'Los sumerios salinizaron sus campos. La Isla de Pascua taló todos sus árboles. Los mayas superpoblaron sus ciudades. El colapso ambiental no es una invención moderna — es un patrón histórico.' },
        datasets: ['data/dados-sumeria.json','data/dados-maya-classico.json','data/dados-pre-historia-neolitico.json'],
      },
      {
        id: 'q-clima-historia',
        texto: { pt: 'Como mudanças climáticas derrubaram civilizações antes das fábricas.', en: 'How climate change toppled civilizations before factories.', es: 'Cómo los cambios climáticos derribaron civilizaciones antes de las fábricas.' },
        desc: { pt: 'A Pequena Idade do Gelo, o colapso do Bronze Tardio, as secas que derrubaram os Maias — o clima sempre foi o pano de fundo invisível da história humana.', en: 'The Little Ice Age, the Late Bronze Age Collapse, the droughts that toppled the Maya — the climate has always been the invisible backdrop of human history.', es: 'La Pequeña Edad de Hielo, el Colapso de la Edad de Bronce Tardío, las sequías que derribaron a los mayas — el clima siempre ha sido el telón de fondo invisible de la historia humana.' },
        datasets: ['data/dados-pre-historia-neolitico.json','data/dados-medieval-feudalismo.json','data/dados-maya-classico.json','data/dados-bronze-egeu.json'],
      },
      {
        id: 'q-crise-climatica-hoje',
        texto: { pt: 'A crise climática atual é única — ou parte de um padrão histórico?', en: 'Is the current climate crisis unique — or part of a historical pattern?', es: '¿La crisis climática actual es única — o parte de un patrón histórico?' },
        desc: { pt: 'O que a história das civilizações que colapsaram por razões ambientais nos ensina sobre o que pode estar por vir — e o que as que sobreviveram fizeram diferente.', en: 'What the history of civilizations that collapsed for environmental reasons teaches us about what may be coming — and what those that survived did differently.', es: 'Lo que la historia de las civilizaciones que colapsaron por razones ambientales nos enseña sobre lo que puede estar por venir — y lo que las que sobrevivieron hicieron diferente.' },
        datasets: ['data/dados-antartica-moderna.json','data/dados-pre-historia-neolitico.json','data/dados-sumeria.json','data/dados-pos-guerra-fria.json'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // GRUPO: MITOS, SÍMBOLOS E MEMÓRIA
  // ═══════════════════════════════════════════════════════
  {
    grupo: { pt: 'Mitos, Símbolos e Memória Histórica', en: 'Myths, Symbols and Historical Memory', es: 'Mitos, Símbolos y Memoria Histórica' },
    itens: [
      {
        id: 'q-mitos-fundadores',
        texto: { pt: 'Todo país tem um mito fundador — e todos são parcialmente falsos.', en: 'Every country has a founding myth — and all are partially false.', es: 'Todo país tiene un mito fundador — y todos son parcialmente falsos.' },
        desc: { pt: 'Rômulo e Remo, os Peregrinos do Mayflower, os "descobridores" do Brasil — os mitos que fundam nações simplificam, excluem e inventam. O que escolhemos lembrar diz mais sobre nós do que sobre o passado.', en: 'Romulus and Remus, the Mayflower Pilgrims, the "discoverers" of Brazil — the myths that found nations simplify, exclude and invent. What we choose to remember says more about us than about the past.', es: 'Rómulo y Remo, los Peregrinos del Mayflower, los "descubridores" de Brasil — los mitos que fundan naciones simplifican, excluyen e inventan. Lo que elegimos recordar dice más sobre nosotros que sobre el pasado.' },
        datasets: ['data/dados-roma-republica.json','data/dados-eua-fundacao.json','data/dados-brasil-02-pre-colonial.json'],
      },
      {
        id: 'q-historia-vs-memoria',
        texto: { pt: 'História e memória são a mesma coisa — ou estão em conflito permanente?', en: 'Are history and memory the same thing — or in permanent conflict?', es: '¿La historia y la memoria son lo mismo — o están en conflicto permanente?' },
        desc: { pt: 'O que a Alemanha fez com a memória do Holocausto. O que o Brasil ainda não fez com a memória da escravidão. O que a Turquia nega sobre os armênios. Memória histórica como campo de batalha político.', en: 'What Germany did with the memory of the Holocaust. What Brazil has still not done with the memory of slavery. What Turkey denies about the Armenians. Historical memory as a political battlefield.', es: 'Lo que Alemania hizo con la memoria del Holocausto. Lo que Brasil aún no ha hecho con la memoria de la esclavitud. Lo que Turquía niega sobre los armenios. La memoria histórica como campo de batalla político.' },
        datasets: ['data/dados-holocaust.json','data/dados-brasil-colonial-escravidao.json','data/dados-descolonizacao.json','data/dados-personagens-seculo-xx.json'],
      },
      {
        id: 'q-monumentos-controversia',
        texto: { pt: 'Quais monumentos deveriam ficar em pé — e quais deveriam cair?', en: 'Which monuments should remain standing — and which should fall?', es: '¿Qué monumentos deberían permanecer en pie — y cuáles deberían caer?' },
        desc: { pt: 'Estátuas de Colombo, confederados, colonizadores — o debate global sobre o que exibimos em espaços públicos é um debate sobre quem contamos nossa história para incluir.', en: 'Statues of Columbus, Confederates, colonizers — the global debate about what we display in public spaces is a debate about who we tell our story to include.', es: 'Estatuas de Colón, confederados, colonizadores — el debate global sobre qué exhibimos en espacios públicos es un debate sobre a quién incluimos al contar nuestra historia.' },
        datasets: ['data/dados-brasil-quilombos.json','data/dados-imperialismo-colonial.json','data/dados-movimentos-sociais.json','data/dados-personagens-seculo-xx.json'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // GRUPO: BRASIL TEMÁTICO — além da cronologia
  // ═══════════════════════════════════════════════════════
  {
    grupo: { pt: 'Brasil Temático: Questões Fundamentais', en: 'Thematic Brazil: Fundamental Questions', es: 'Brasil Temático: Cuestiones Fundamentales' },
    itens: [
      {
        id: 'q-brasil-identidade',
        texto: { pt: 'O que é ser brasileiro? A construção de uma identidade nacional.', en: 'What does it mean to be Brazilian? The construction of a national identity.', es: '¿Qué significa ser brasileño? La construcción de una identidad nacional.' },
        desc: { pt: 'De "país do futuro" a "saudade" — como o Brasil construiu sua autoimagem misturando traumas coloniais, orgulho cultural e ambiguidade racial. Gilberto Freyre, Sérgio Buarque, Florestan Fernandes.', en: 'From "country of the future" to "saudade" — how Brazil built its self-image mixing colonial traumas, cultural pride and racial ambiguity. Gilberto Freyre, Sérgio Buarque, Florestan Fernandes.', es: 'De "país del futuro" a "saudade" — cómo Brasil construyó su autoimagen mezclando traumas coloniales, orgullo cultural y ambigüedad racial. Gilberto Freyre, Sérgio Buarque, Florestan Fernandes.' },
        datasets: ['data/dados-brasil-cultura-arte.json','data/dados-brasil-contemporaneo.json','data/dados-brasil-economia-social.json'],
      },
      {
        id: 'q-brasil-desigualdade',
        texto: { pt: 'Por que o Brasil é um dos países mais desiguais do mundo?', en: 'Why is Brazil one of the most unequal countries in the world?', es: '¿Por qué Brasil es uno de los países más desiguales del mundo?' },
        desc: { pt: 'Da escravidão à abolição sem reforma agrária, do coronelismo ao neoliberalismo — as raízes históricas da desigualdade que nenhum governo brasileiro conseguiu resolver completamente.', en: 'From slavery to abolition without land reform, from coronelismo to neoliberalism — the historical roots of inequality that no Brazilian government has managed to fully resolve.', es: 'De la esclavitud a la abolición sin reforma agraria, del coronelismo al neoliberalismo — las raíces históricas de la desigualdad que ningún gobierno brasileño ha logrado resolver completamente.' },
        datasets: ['data/dados-brasil-colonial-escravidao.json','data/dados-brasil-economia-social.json','data/dados-brasil-16-nova-republica.json','data/dados-brasil-12-republica-velha.json'],
      },
      {
        id: 'q-brasil-cultura-arte',
        texto: { pt: 'Como o Brasil criou uma das culturas mais originais do mundo?', en: 'How did Brazil create one of the most original cultures in the world?', es: '¿Cómo Brasil creó una de las culturas más originales del mundo?' },
        desc: { pt: 'Samba, bossa nova, Tropicália, capoeira, carnaval, literatura — como um país formado de trauma e mestiçagem produziu formas culturais de alcance global.', en: 'Samba, bossa nova, Tropicália, capoeira, carnival, literature — how a country formed from trauma and mestizaje produced cultural forms with global reach.', es: 'Samba, bossa nova, Tropicália, capoeira, carnaval, literatura — cómo un país formado de trauma y mestizaje produjo formas culturales de alcance global.' },
        datasets: ['data/dados-brasil-cultura-arte.json','data/dados-brasil-14-populismo.json','data/dados-brasil-quilombos.json'],
      },
      {
        id: 'q-brasil-amazonia',
        texto: { pt: 'A Amazônia sempre foi "vazia"? A história das civilizações amazônicas.', en: 'Was the Amazon always "empty"? The history of Amazonian civilizations.', es: '¿La Amazonia siempre estuvo "vacía"? La historia de las civilizaciones amazónicas.' },
        desc: { pt: 'A terra preta dos índios, Marajó, as geoglifos do Acre — a Amazônia pré-colonial tinha milhões de habitantes que moldaram a floresta. O mito da "natureza intocada" apaga uma história humana densa.', en: 'Dark earth, Marajó, the geoglyphs of Acre — pre-colonial Amazonia had millions of inhabitants who shaped the forest. The myth of "untouched nature" erases a dense human history.', es: 'La tierra negra de los indios, Marajó, los geoglifos de Acre — la Amazonia precolonial tenía millones de habitantes que moldearon el bosque. El mito de la "naturaleza intocada" borra una densa historia humana.' },
        datasets: ['data/dados-brasil-01-povos-originarios.json','data/dados-brasil-indigenas.json','data/dados-brasil-contemporaneo.json'],
      },
    ],
  },

];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getLang() {
  return window.getCurrentLang ? window.getCurrentLang() : 'pt';
}

function t(obj) {
  const l = getLang();
  return obj[l] || obj.pt || '';
}

// ── Panel rendering ───────────────────────────────────────────────────────────

function buildPanel() {
  const overlay = document.createElement('div');
  overlay.id = 'questions-overlay';
  overlay.className = 'questions-overlay hidden';

  const panel = document.createElement('div');
  panel.className = 'questions-panel';

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

  overlay.addEventListener('click', e => { if (e.target === overlay) closePanel(); });
  btnClose.addEventListener('click', closePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
}

function openPanel() {
  const overlay = document.getElementById('questions-overlay');
  if (overlay) {
    const groups = overlay.querySelectorAll('.questions-group-title');
    PERGUNTAS.forEach((g, i) => { if (groups[i]) groups[i].textContent = t(g.grupo); });
    PERGUNTAS.forEach(g => {
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

// ── Activate a question ───────────────────────────────────────────────────────

function activateQuestion(item) {
  document.querySelectorAll('.dataset:checked').forEach(cb => { cb.checked = false; });
  item.datasets.forEach(ds => {
    const cb = document.querySelector(`.dataset[value="${ds}"]`);
    if (cb) cb.checked = true;
  });
  closePanel();
  if (window.aplicarFiltros) window.aplicarFiltros();
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initQuestions() {
  buildPanel();
  const btn = document.getElementById('btn-questions');
  if (btn) btn.addEventListener('click', openPanel);
  window.refreshQuestionsLang = () => {
    const overlay = document.getElementById('questions-overlay');
    if (overlay && !overlay.classList.contains('hidden')) openPanel();
  };
}
