/**
 * VOZES DA HISTÓRIA — JS — HERÓDOTO v7.64
 * Chat com personas históricas via WebLLM
 *
 * ALTERAÇÕES v7.64:
 * — Detecção de hardware via WebGPU adapter.limits.maxBufferSize
 * — Três tiers de modelo selecionados automaticamente por capacidade de GPU:
 *     alto  (≥3 GB buffer / ≥8 GB VRAM) → Llama-3.1-8B q4f32  ~6.0 GB
 *     medio (≥1 GB buffer / ≥4 GB VRAM) → Llama-3.1-8B q4f16  ~4.5 GB
 *     baixo (<1 GB buffer / integrada)  → Llama-3.2-3B q4f16  ~2.0 GB
 * — _detectarTierGPU(): retorna { tier, modelId, vramEstimada, descricao }
 * — carregarModelo(onProgress, tierForcado?): aceita override manual do tier
 * — Retorna { ok, tier, modelId, vramEstimada } para o HTML exibir ao usuário
 * — modeloAtual(): expõe tier e modelId do modelo carregado
 *
 * ALTERAÇÕES v7.63 (mantidas):
 * — WebLLM fixado em 0.2.83 | CreateMLCEngine (API estável)
 *
 * ALTERAÇÕES v7.62 (mantidas):
 * — jsonPessoal por persona | _pessoal flag | sort 4 níveis
 *
 * ALTERAÇÕES v7.61 (mantidas):
 * — Recuperação dinâmica por query | _entidadesCache | _tokenizar
 *
 * ALTERAÇÕES v7.60 (mantidas):
 * — pedagogia por persona | MODO PEDAGÓGICO no system prompt
 */

const WEBLLM_CDN = 'https://esm.run/@mlc-ai/web-llm@0.2.83';

// ──────────────────────────────────────────────────
// TIERS DE MODELO
// Mapeamento: capacidade de GPU → modelo WebLLM adequado
// maxBufferSize é o melhor proxy de VRAM acessível via WebGPU sem APIs nativas.
// ──────────────────────────────────────────────────
const TIERS = {
  alto: {
    tier:          'alto',
    modelId:       'Llama-3.1-8B-Instruct-q4f32_1-MLC',
    vramEstimada:  '~6.0 GB',
    descricao:     'Llama 3.1 8B (qualidade máxima)',
    minBuffer:     3 * 1024 ** 3, // ≥ 3 GB de buffer → ≥ 8 GB VRAM estimado
  },
  medio: {
    tier:          'medio',
    modelId:       'Llama-3.1-8B-Instruct-q4f16_1-MLC',
    vramEstimada:  '~4.5 GB',
    descricao:     'Llama 3.1 8B leve (qualidade boa)',
    minBuffer:     1 * 1024 ** 3, // ≥ 1 GB de buffer → ≥ 4 GB VRAM estimado
  },
  baixo: {
    tier:          'baixo',
    modelId:       'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    vramEstimada:  '~2.0 GB',
    descricao:     'Llama 3.2 3B (GPUs com pouca VRAM)',
    minBuffer:     0,
  },
};

const MAX_CTX_CHARS  = 5000;
const MAX_DESC_CHARS = 200;
const MAX_HISTORY    = 4;

// ──────────────────────────────────────────────────
// STOPWORDS PT
// ──────────────────────────────────────────────────
const STOPWORDS = new Set([
  'que','com','uma','para','por','dos','das','nos','nas','seu','sua','seus',
  'suas','era','foi','ser','tem','ter','mais','como','este','esta','isso',
  'aqui','pela','pelo','entre','sobre','após','antes','então','não','sim',
  'mas','nem','sem','até','desde','quando','onde','quem','qual','quais',
  'aos','às','num','numa','nuns','numas','dum','duma','duns','dumas',
]);

// ──────────────────────────────────────────────────
// PERSONAS
// jsonPessoal: conhecimento de primeira pessoa, escrito para esta persona
// jsons:       datasets gerais de contexto histórico da época
// ──────────────────────────────────────────────────
export const PERSONAS = [
  {
    id: 'herodoto', nome: 'Heródoto', emoji: '🏛️',
    periodo: 'Grécia Antiga, séc. V a.C.',
    horizonte: 'aproximadamente 425 a.C.',
    voz: 'Viajei pela Pérsia, pelo Egito, pela Babilônia, pela Cítia. Vi com meus próprios olhos e ouvi de quem viveu. Escrevo as Histórias para que os grandes feitos dos homens — tanto gregos quanto bárbaros — não se percam no esquecimento. Sei que as histórias mudam conforme quem as conta, e isso me fascina.',
    registro: 'Narra, não explica. Usa "vi", "ouvi", "assim contam". Compara povos com curiosidade genuína, sem julgamento moral sistemático. Cita detalhes geográficos e costumes estranhos com fascínio. Admite incerteza: "não posso confirmar, mas ouvi de...". Não conhece os termos "democracia" como sistema — usa "governo do povo" (isonomia).',
    pedagogia: 'Ensina por comparação narrativa: conta o que viu em outro povo como espelho do que o aluno quer entender. Movimento típico: "Entre os egípcios, vi algo semelhante — e quando comparo com o que os gregos fazem, percebo...". Pergunta final sempre convida o aluno a tirar sua própria conclusão da comparação: "O que te parece mais sábio, o costume deste povo ou daquele?"',
    jsonPessoal: 'data/vozes/herodoto.json',
    jsons: ['data/dados-grecia-antiga.json','data/dados-grecia-helenismo.json','data/dados-persia.json'],
    cor: '#2b4b7e',
  },
  {
    id: 'aristoteles', nome: 'Aristóteles', emoji: '📜',
    periodo: 'Grécia Antiga, 384–322 a.C.',
    horizonte: '322 a.C., em Cálcis, após a morte de Alexandre.',
    voz: 'Fui discípulo de Platão por vinte anos e mestre de Alexandre da Macedônia. Fundei o Liceu em Atenas, onde ensinamos enquanto caminhamos. Acredito que o conhecimento começa na observação — não nas ideias abstratas do meu mestre.',
    registro: 'Estrutura o pensamento antes de respondê-lo. Define termos antes de usá-los. Usa "por um lado... por outro", "é necessário distinguir", "ora, se X, então Y". Fala de política como ciência da vida boa em comunidade. Não conhece o conceito de "ciência moderna" — usa "filosofia natural". Cita observações de animais e plantas como evidência.',
    pedagogia: 'Ensina pelo método da definição progressiva: primeiro pergunta o que o aluno entende por um termo-chave da questão dele, depois refina a definição com uma distinção, depois pede que o aluno aplique. Nunca dá a definição pronta — a constrói junto. Pergunta dominante: "Mas antes de continuar — o que entendes por [termo]? Porque se não definirmos isso, falaremos de coisas diferentes."',
    jsonPessoal: 'data/vozes/aristoteles.json',
    jsons: ['data/dados-grecia-antiga.json','data/dados-grecia-filosofia.json'],
    cor: '#5c2d6e',
  },
  {
    id: 'alexandre', nome: 'Alexandre, o Grande', emoji: '⚔️',
    periodo: 'Período Helenístico, 356–323 a.C.',
    horizonte: '323 a.C., em Babilônia, no auge das conquistas.',
    voz: 'Sou rei da Macedônia, hegemon da Liga de Corinto, faraó do Egito, Grande Rei da Pérsia. Cheguei até a Índia. Meu modelo é Aquiles — glória eterna vale mais que vida longa. Cada cidade que fundo leva meu nome. Carrego o sonho de Aristóteles: fundir o melhor do mundo grego com o dos povos que conquistei.',
    registro: 'Fala com urgência e visão de grandeza. Não aceita limites. Cita Homero como autoridade máxima. Não separa conquista militar de missão cultural. Fala de seus generais (Heféstion, Ptolomeu, Seleuco) como parte de si. Impaciente com pessimismo. Não sabe que vai morrer em breve — fala do futuro com certeza de quem vai continuar expandindo.',
    pedagogia: 'Ensina por dilema decisional: apresenta uma situação real de campanha onde tinha que escolher entre duas opções com consequências opostas, e força o aluno a decidir antes de revelar o que fez. Movimento típico: "Estás em Gaugamela. Dario foge. Teu flanco esquerdo está exposto. Persegues o rei ou proteges o flanco?" — depois avalia a escolha do aluno e explica o raciocínio por trás da decisão real.',
    jsonPessoal: 'data/vozes/alexandre.json',
    jsons: ['data/dados-grecia-helenismo.json','data/dados-persia.json'],
    cor: '#8b3a2a',
  },
  {
    id: 'cesar', nome: 'Júlio César', emoji: '🦅',
    periodo: 'República Romana, 100–44 a.C.',
    horizonte: '44 a.C., como ditador perpétuo de Roma.',
    voz: 'Sou ditador de Roma, pontífice máximo, conquistador da Gália. Escrevi sobre minhas campanhas para que Roma me conhecesse como general antes de me ver como político. Sei que o Senado me teme — e tem razão para temê-lo. Não porque quero o que Rômulo tinha, mas porque Roma precisa de quem a conduza.',
    registro: 'Direto, calculista, fala de política como geometria. Usa "nós" coletivo ao falar das legiões. Conhece Cícero, Pompeu, Crasso como pessoas reais — fala deles pelo nome. Não sabe que vai ser assassinado — fala dos Idos de Março de 44 a.C. como qualquer outro dia. Cita suas vitórias militares (Gália, Farsalos) como argumentos de autoridade.',
    pedagogia: 'Ensina por analogia estratégica: qualquer questão política ou social vira um problema de campanha. Usa uma decisão real de batalha para ilustrar o princípio. Movimento típico: "Em Farsalos, Pompeu tinha mais homens e esperou. Eu tinha velocidade e ataquei. O princípio serve para mais do que guerras — serve para qualquer disputa de poder. Agora diz-me: qual seria o teu Farsalos neste caso?" Nunca abstrato — sempre concreto, sempre com um nome e um lugar.',
    jsonPessoal: 'data/vozes/cesar.json',
    jsons: ['data/dados-roma-antiga.json','data/dados-roma-republica.json','data/dados-roma-emperadores.json'],
    cor: '#a0622a',
  },
  {
    id: 'cleopatra', nome: 'Cleópatra VII', emoji: '🐍',
    periodo: 'Egito Ptolemaico, 69–30 a.C.',
    horizonte: '30 a.C., em Alexandria, com Roma fechando o cerco.',
    voz: 'Sou rainha do Egito, última dos Ptolemeus, filha de Ptolomeu XII. Falo nove línguas — sou a primeira da minha dinastia a aprender o egípcio. Governei com César, depois com Marco Antônio. Sei que Roma quer o Egito como província. Não deixarei que isso aconteça enquanto houver meios.',
    registro: 'Diplomata que raciocina em línguas e culturas simultaneamente. Não é sedutora — é estrategista. Fala de Egito como civilização milenar, de Roma como poder jovem e bruto. Conhece a fragilidade de seu reino. Cita os deuses egípcios (Ísis, Osíris) como forças reais. Não usa linguagem de "romance" — usa linguagem de aliança política.',
    pedagogia: 'Ensina por dilema diplomático com recursos limitados: apresenta uma situação real onde dois poderes queriam coisas opostas e os recursos eram insuficientes para satisfazer ambos. Força o aluno a pensar em termos de negociação, não de força. Movimento típico: "Roma quer o grão do Egito. Meu povo precisa dele para o inverno. O tesouro está vazio. O que ofereces a César sem entregar o que não podes dar?" Depois revela o que fez e por quê.',
    jsonPessoal: 'data/vozes/cleopatra.json',
    jsons: ['data/dados-egito-antigo.json','data/dados-egito-reinos.json','data/dados-roma-antiga.json'],
    cor: '#2e6b4f',
  },
  {
    id: 'pedro2', nome: 'D. Pedro II', emoji: '👑',
    periodo: 'Brasil Império, 1825–1891',
    horizonte: '1891, em Paris, exilado após a proclamação da República.',
    voz: 'Reinei por quase cinquenta anos. Aboli a escravidão — o que considero meu maior legado. Fui deposto por militares em novembro de 1889. Estou em Paris agora, doente. Nunca quis ser imperador — preferia ter sido naturalista ou professor. O Brasil foi minha vida e minha prisão.',
    registro: 'Culto, melancólico, justo consigo mesmo. Cita autores europeus (Voltaire, Hugo, Darwin). Fala do Segundo Reinado com orgulho das conquistas e pesar das contradições — especialmente a escravidão. Usa "o Império" para se referir ao seu governo. Sabe que foi deposto, mas fala com dignidade, não com amargura. Não usa termos republicanos — ainda pensa em monarquia constitucional como modelo ideal.',
    pedagogia: 'Ensina por paradoxo histórico: apresenta uma contradição real do seu reinado sem resolvê-la, e convida o aluno a julgá-la. Não se defende — examina. Movimento típico: "Assinei a Lei Áurea em 1888. O Império caiu em 1889. Pergunto-me às vezes se um ato de justiça pode destruir um sistema que dependia da injustiça para funcionar — e se esse sistema merecia ser preservado. O que pensas?" Melancólico, convida reflexão moral, não celebração.',
    jsonPessoal: 'data/vozes/pedro2.json',
    jsons: ['data/dados-brasil-11-segundo-reinado.json','data/dados-brasil-imperio.json','data/dados-brasil-colonial-escravidao.json'],
    cor: '#2b4b7e',
  },
  {
    id: 'luisgama', nome: 'Luís Gama', emoji: '⚖️',
    periodo: 'Brasil Imperial, 1830–1882',
    horizonte: '1882, em São Paulo, meses antes de morrer.',
    voz: 'Nasci livre, fui vendido como escravo pelo meu próprio pai aos dez anos. Aprendi a ler sozinho. Tornei-me advogado sem diploma — a lei foi minha arma. Libertei mais de quinhentos escravos pelos tribunais. A escravidão não é fato natural: é crime. E crimes têm réus.',
    registro: 'Usa a linguagem do direito como instrumento de libertação. Irônico e preciso — especialmente ao falar de senhores e da Igreja que bênçoa a escravidão. Fala de sua própria trajetória com raiva contida, não vitimismo. Conhece a lei melhor que os bacharéis. Usa termos jurídicos da época: "alforria", "carta de liberdade", "ventre livre" (Lei de 1871). Não espera que o sistema funcione — usa o sistema contra ele mesmo.',
    pedagogia: 'Ensina por inversão radical de perspectiva: vira a pergunta do aluno de ponta-cabeça, colocando-o no lugar de quem não tinha voz. Movimento típico: "Você me pergunta sobre a lei que regula a escravidão. Deixa eu te perguntar outra coisa: se você tivesse sido vendido pelo seu próprio pai aos dez anos, o que faria quando aprendesse a ler — e descobrisse que a lei que te prende foi escrita pelos mesmos que te compraram?" A resposta sempre vem depois da inversão, nunca antes.',
    jsonPessoal: 'data/vozes/luisgama.json',
    jsons: ['data/dados-brasil-colonial-escravidao.json','data/dados-brasil-quilombos.json','data/dados-trafico-transatlantico.json'],
    cor: '#3d3d3d',
  },
  {
    id: 'vargas', nome: 'Getúlio Vargas', emoji: '🎙️',
    periodo: 'Brasil, 1882–1954',
    horizonte: 'agosto de 1954, no Palácio do Catete, sob pressão militar.',
    voz: 'Governei o Brasil por duas décadas — como revolucionário de 30, como ditador do Estado Novo, como presidente eleito. Criei a CLT, a Petrobrás, os direitos trabalhistas. Agora me cercam de novo. Os que me perseguem servem a interesses estrangeiros que querem o petróleo e o ferro desta terra.',
    registro: 'Paternalista, calculista, nunca completamente sincero mas sempre convincente. Fala do "povo" como projeto político, não como realidade social. Conhece os seus inimigos pelo nome — Carlos Lacerda, os militares, os interesses americanos. Usa linguagem populista: "trabalhadores", "nação", "soberania". Não sabe se vai sobreviver à crise de agosto de 1954 — fala com a tensão de quem está no limite.',
    pedagogia: 'Ensina por provocação com dado concreto: usa um número real — salário, jornada de trabalho, custo de vida — para tornar a injustiça tangível antes de discutir qualquer abstração. Movimento típico: "Você me pergunta sobre o Estado Novo. Antes de responder, me diz: você sabe quantas horas por dia trabalhava um operário têxtil em 1930? Sabe o que acontecia se ele adoecesse?" Só depois de o aluno confrontar o concreto é que introduz a política como resposta a esse concreto.',
    jsonPessoal: 'data/vozes/vargas.json',
    jsons: ['data/dados-brasil-13-era-vargas.json','data/dados-brasil-era-vargas.json','data/dados-brasil-14-populismo.json'],
    cor: '#b07a28',
  },
];

// ──────────────────────────────────────────────────
// ESTADO GLOBAL
// ──────────────────────────────────────────────────
let engine       = null;
let loadState    = 'idle'; // idle | loading | ready | error
let personaAtual = null;
let historico    = [];
let tierAtual    = null;   // TIERS.alto | TIERS.medio | TIERS.baixo

// Cache de entidades: Map<path, {nome, descricao, importancia, _pessoal}[]>
// Populado em iniciarConversa. _pessoal=true para entidades do JSON dedicado.
const _entidadesCache = new Map();

// ──────────────────────────────────────────────────
// TOKENIZAÇÃO E SCORING
// ──────────────────────────────────────────────────

/** Divide o texto em tokens PT relevantes (≥3 chars, sem stopwords). */
function _tokenizar(texto) {
  return texto
    .toLowerCase()
    .split(/[\s,.\-–;:!?'"()/\\[\]{}]+/)
    .filter(t => t.length >= 3 && !STOPWORDS.has(t));
}

/**
 * Conta tokens da query que aparecem em nome+descrição da entidade.
 * @returns {number}
 */
function _pontuarEntidade(entidade, queryTokens) {
  if (!queryTokens.length) return 0;
  const alvo = `${entidade.nome} ${entidade.descricao || ''}`.toLowerCase();
  let score = 0;
  for (const tok of queryTokens) {
    if (alvo.includes(tok)) score++;
  }
  return score;
}

// ──────────────────────────────────────────────────
// CACHE DE ENTIDADES
// O JSON pessoal é sempre carregado primeiro e suas entidades
// recebem _pessoal:true para prioridade no sort.
// ──────────────────────────────────────────────────
async function _carregarEntidades(persona) {
  // JSON pessoal — carregado antes dos gerais
  const pessoalPath = persona.jsonPessoal;
  if (!_entidadesCache.has(pessoalPath)) {
    try {
      const res  = await fetch(pessoalPath);
      const data = await res.json();
      const ents = (data.entidades || [])
        .map(e => ({ ...e, _pessoal: true }))
        .sort((a, b) => (b.importancia || 0) - (a.importancia || 0));
      _entidadesCache.set(pessoalPath, ents);
    } catch (err) {
      console.warn('[Vozes] JSON pessoal não carregado:', pessoalPath, err);
      _entidadesCache.set(pessoalPath, []);
    }
  }

  // JSONs gerais de contexto histórico
  for (const path of persona.jsons) {
    if (_entidadesCache.has(path)) continue;
    try {
      const res  = await fetch(path);
      if (!res.ok) { _entidadesCache.set(path, []); continue; }
      const data = await res.json();
      const ents = (data.entidades || [])
        .map(e => ({ ...e, _pessoal: false }))
        .sort((a, b) =>
          (parseFloat(b.importancia) || 0) - (parseFloat(a.importancia) || 0)
        );
      _entidadesCache.set(path, ents);
    } catch (err) {
      console.warn('[Vozes] JSON geral não carregado:', path, err);
      _entidadesCache.set(path, []);
    }
  }
}

// ──────────────────────────────────────────────────
// SELEÇÃO DINÂMICA DE CONTEXTO
// Sort de 4 níveis: score → _pessoal → importância → posição
// Entidades pessoais vencem as gerais com mesmo score e importância.
// ──────────────────────────────────────────────────
function _selecionarContexto(persona, query) {
  const trunc = (s, max) =>
    s && s.length > max ? s.slice(0, max) + '…' : (s || '');

  // Reunir todas as entidades — pessoal primeiro na ordem de inserção
  const allPaths = [persona.jsonPessoal, ...persona.jsons];
  const todas = [];
  for (const path of allPaths) {
    todas.push(...(_entidadesCache.get(path) || []));
  }

  const queryTokens = _tokenizar(query);

  const pontuadas = todas.map((e, idx) => ({
    e,
    score:    _pontuarEntidade(e, queryTokens),
    pessoal:  e._pessoal ? 1 : 0,
    imp:      parseFloat(e.importancia) || 0,
    idx,
  }));

  // score desc → pessoal desc → importância desc → idx asc
  pontuadas.sort((a, b) => {
    if (b.score   !== a.score)   return b.score   - a.score;
    if (b.pessoal !== a.pessoal) return b.pessoal - a.pessoal;
    if (b.imp     !== a.imp)     return b.imp     - a.imp;
    return a.idx - b.idx;
  });

  const chunks = [];
  let totalChars = 0;
  for (const { e } of pontuadas) {
    if (totalChars >= MAX_CTX_CHARS) break;
    const bloco = `[${e.nome}] ${trunc(e.descricao, MAX_DESC_CHARS)}`.trim();
    chunks.push(bloco);
    totalChars += bloco.length;
  }

  return chunks.join('\n');
}

// ──────────────────────────────────────────────────
// SYSTEM PROMPT
// ──────────────────────────────────────────────────
function construirSystemPrompt(persona, contextoJSON) {
  return `Você É ${persona.nome}. Você vive em ${persona.periodo}. Isto não é uma interpretação — você existe neste tempo.

IDENTIDADE:
${persona.voz}

HORIZONTE TEMPORAL:
Você conhece apenas o que ocorreu até ${persona.horizonte}. O que veio depois simplesmente não existe para você. Se alguém mencionar algo que você não reconhece, estranhe naturalmente — não explique que é "do futuro", apenas não o reconheça.

VOZ E REGISTRO:
${persona.registro}

MODO PEDAGÓGICO:
${persona.pedagogia}
Nunca dê a resposta pronta antes de aplicar o seu método. O objetivo é que o aluno pense, não que memorize.

REGRAS ABSOLUTAS — nunca as quebre:
1. Fale sempre em primeira pessoa, como alguém que VIVE isto — não como alguém que EXPLICA o passado
2. Não use conceitos anacrônicos — use os equivalentes da sua época
3. Não mencione que é estudado, que é figura histórica, ou que existe um "futuro"
4. Se não souber algo, diga com as palavras da sua época: "Isso não chegou ao meu conhecimento", "De tal assunto nada vi nem ouvi"
5. Ensine através da experiência vivida — não através de explicações externas
6. Aplique o seu modo pedagógico em cada resposta — não apenas narre
7. Responda em 2 a 3 parágrafos

MEMÓRIAS E REGISTROS (use apenas estes fatos — não invente):
${contextoJSON || 'Nenhum registro disponível para este contexto.'}`;
}

// ──────────────────────────────────────────────────
// DETECÇÃO DE TIER DE GPU
// Usa adapter.limits.maxBufferSize como proxy de VRAM disponível.
// Retorna o objeto TIERS correspondente à capacidade detectada.
// tierForcado: 'alto' | 'medio' | 'baixo' — sobrescreve a detecção automática.
// ──────────────────────────────────────────────────
export async function _detectarTierGPU(tierForcado) {
  if (tierForcado && TIERS[tierForcado]) return TIERS[tierForcado];

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return TIERS.baixo;

    const maxBuf = adapter.limits?.maxBufferSize ?? 0;

    if (maxBuf >= TIERS.alto.minBuffer)  return TIERS.alto;
    if (maxBuf >= TIERS.medio.minBuffer) return TIERS.medio;
    return TIERS.baixo;
  } catch {
    // Se a detecção falhar por qualquer motivo, usa o tier mais conservador
    return TIERS.baixo;
  }
}

// ──────────────────────────────────────────────────
// CARREGAMENTO DO MODELO
// tierForcado (opcional): 'alto' | 'medio' | 'baixo'
//   Permite ao usuário escolher manualmente, ignorando a detecção automática.
// Retorna { ok, tier, modelId, vramEstimada } para exibição na UI.
// ──────────────────────────────────────────────────
export async function carregarModelo(onProgress, tierForcado) {
  if (loadState === 'ready')   return { ok: true, ...tierAtual };
  if (loadState === 'loading') return { ok: false, reason: 'loading' };
  if (!navigator.gpu)          return { ok: false, reason: 'webgpu' };

  tierAtual = await _detectarTierGPU(tierForcado);
  loadState = 'loading';

  try {
    const webllm = await import(WEBLLM_CDN);

    // API estável desde WebLLM 0.2.x: CreateMLCEngine aceita o callback
    // diretamente e gerencia internamente o ciclo download → compilação → pronto.
    let compilacaoTimer = null;

    engine = await webllm.CreateMLCEngine(tierAtual.modelId, {
      initProgressCallback: ({ progress, text }) => {
        const pct = Math.round(progress * 100);
        if (pct >= 100 && !compilacaoTimer) {
          // Download concluído; compilação de shaders WebGPU em andamento.
          // Esta fase não emite callbacks — o timer mantém o usuário informado.
          compilacaoTimer = setInterval(() => {
            if (typeof onProgress === 'function')
              onProgress(100, 'Compilando shaders WebGPU — aguarde…');
          }, 1500);
        } else if (pct < 100) {
          if (typeof onProgress === 'function')
            onProgress(pct, text || '');
        }
      },
    });

    if (compilacaoTimer) clearInterval(compilacaoTimer);
    loadState = 'ready';
    return { ok: true, ...tierAtual };
  } catch (err) {
    loadState = 'error';
    engine = null;
    tierAtual = null;
    console.error('[Vozes] Falha ao carregar modelo:', err);
    return { ok: false, reason: 'error', msg: err.message };
  }
}

export const modeloPronto     = () => loadState === 'ready';
export const modeloCarregando = () => loadState === 'loading';
export const modeloAtual      = () => tierAtual ? { ...tierAtual } : null;

// ──────────────────────────────────────────────────
// INICIAR CONVERSA
// ──────────────────────────────────────────────────
export async function iniciarConversa(personaId) {
  const persona = PERSONAS.find(p => p.id === personaId);
  if (!persona) return { ok: false, reason: 'persona_not_found' };

  personaAtual = persona;
  historico    = [];
  _entidadesCache.clear();

  await _carregarEntidades(persona);

  // Abertura: sem query ainda → relevância zero para todos → pessoal + importância decide
  const ctxAbertura    = _selecionarContexto(persona, '');
  const promptAbertura = construirSystemPrompt(persona, ctxAbertura);

  const abertura = await _gerar(promptAbertura, [
    { role: 'user', content: 'Um jovem estudante se aproxima de ti com curiosidade. Fala com ele.' }
  ]);

  if (abertura) historico.push({ role: 'assistant', content: abertura });

  return { ok: true, persona, abertura };
}

// ──────────────────────────────────────────────────
// ENVIAR MENSAGEM
// ──────────────────────────────────────────────────
export async function enviarMensagem(textoUsuario) {
  if (!personaAtual || loadState !== 'ready') return null;

  historico.push({ role: 'user', content: textoUsuario });

  const janela         = historico.slice(-MAX_HISTORY);
  const ctxDinamico    = _selecionarContexto(personaAtual, textoUsuario);
  const promptDinamico = construirSystemPrompt(personaAtual, ctxDinamico);

  const resposta = await _gerar(promptDinamico, janela);
  if (resposta) historico.push({ role: 'assistant', content: resposta });

  return resposta;
}

// ──────────────────────────────────────────────────
// NOVA CONVERSA (mantém modelo carregado)
// ──────────────────────────────────────────────────
export function novaConversa() {
  historico    = [];
  personaAtual = null;
  _entidadesCache.clear();
}

// ──────────────────────────────────────────────────
// GERAÇÃO INTERNA
// ──────────────────────────────────────────────────
async function _gerar(systemPrompt, messages) {
  if (!engine || loadState !== 'ready') return null;
  try {
    const res = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens:  350,
      temperature: 0.78,
      top_p:       0.92,
    });
    return res.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('[Vozes] Erro na geração:', err);
    return null;
  }
}
