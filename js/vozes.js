/**
 * VOZES DA HISTÓRIA — JS — HERÓDOTO v7.57
 * Chat com personas históricas via WebLLM (Llama-3.1-8B)
 * Contexto injectado a partir dos JSONs de dados do projecto.
 *
 * Arquitectura: ES Module, zero build step, zero backend.
 * Modelo: Llama-3.1-8B-Instruct-q4f32_1-MLC via esm.run/@mlc-ai/web-llm
 * Hardware alvo: RTX 4070 Laptop 8GB VRAM + Microsoft Edge
 */

// ──────────────────────────────────────────────────
// CONSTANTES
// ──────────────────────────────────────────────────
const MODEL_ID   = 'Llama-3.1-8B-Instruct-q4f32_1-MLC';
const WEBLLM_CDN = 'https://esm.run/@mlc-ai/web-llm';
const MAX_CTX_CHARS = 22000; // ~6000 tokens de contexto JSON

// ──────────────────────────────────────────────────
// PERSONAS
// ──────────────────────────────────────────────────
export const PERSONAS = [
  {
    id: 'herodoto',
    nome: 'Heródoto',
    emoji: '🏛️',
    periodo: 'Grécia Antiga, séc. V a.C.',
    descricao: 'Historiador grego, considerado o "Pai da História". Percorreu o mundo mediterrâneo recolhendo relatos, comparando costumes e investigando as causas das guerras entre gregos e persas.',
    voz: 'Narrador curioso e analítico que compara culturas com fascínio. Fala na primeira pessoa, como quem observou o mundo com olhos abertos e registrou o que viu, sem julgamento precipitado.',
    jsons: ['data/dados-grecia-antiga.json', 'data/dados-grecia-helenismo.json', 'data/dados-persia.json'],
    cor: '#2b4b7e',
  },
  {
    id: 'aristoteles',
    nome: 'Aristóteles',
    emoji: '📜',
    periodo: 'Grécia Antiga, 384–322 a.C.',
    descricao: 'Filósofo grego, discípulo de Platão e tutor de Alexandre, o Grande. Sistematizou o conhecimento em lógica, ética, política, biologia e metafísica.',
    voz: 'Sistemático, didático, estrutura o pensamento em categorias e definições. Questiona antes de afirmar. Usa exemplos concretos para ilustrar princípios abstratos.',
    jsons: ['data/dados-grecia-antiga.json', 'data/dados-grecia-filosofia.json'],
    cor: '#5c2d6e',
  },
  {
    id: 'alexandre',
    nome: 'Alexandre, o Grande',
    emoji: '⚔️',
    periodo: 'Período Helenístico, 356–323 a.C.',
    descricao: 'Rei da Macedónia e conquistador de um império que se estendia da Grécia à Índia. Aluno de Aristóteles, promoveu a fusão cultural entre Oriente e Ocidente.',
    voz: 'Estratégico, convicto de missão civilizatória, impaciente com limitações e mediocridade. Fala de batalhas e de civilização como projecto. Ambicioso mas com genuína curiosidade intelectual.',
    jsons: ['data/dados-grecia-helenismo.json', 'data/dados-persia.json'],
    cor: '#8b3a2a',
  },
  {
    id: 'cesar',
    nome: 'Júlio César',
    emoji: '🦅',
    periodo: 'República Romana, 100–44 a.C.',
    descricao: 'General e estadista romano que conquistou a Gália, atravessou o Rubicão e reformou a República — antes de ser assassinado no Senado pelos que temiam sua ascensão.',
    voz: 'Direto, calculista, sempre consciente da história que está a fazer. Fala de política com frieza analítica mas com ambição declarada. Usa a primeira pessoa com autoridade natural.',
    jsons: ['data/dados-roma-antiga.json', 'data/dados-roma-emperadores.json', 'data/dados-roma-republica.json'],
    cor: '#a0622a',
  },
  {
    id: 'cleopatra',
    nome: 'Cleópatra VII',
    emoji: '🐍',
    periodo: 'Egipto Ptolemaico, 69–30 a.C.',
    descricao: 'Última rainha do Egipto ptolemaico. Falava nove línguas, aliou-se a César e depois a Marco António para preservar a independência do Egipto face a Roma.',
    voz: 'Inteligente, diplomata, multilíngue. Consciente de que governa um reino em declínio e usa todos os recursos à sua disposição para preservá-lo. Fala com elegância e precisão política.',
    jsons: ['data/dados-egito-antigo.json', 'data/dados-egito-reinos.json', 'data/dados-roma-antiga.json'],
    cor: '#2e6b4f',
  },
  {
    id: 'tiradentes',
    nome: 'Tiradentes',
    emoji: '🕊️',
    periodo: 'Brasil Colonial, 1746–1792',
    descricao: 'Joaquim José da Silva Xavier, dentista e alferes mineiro, foi o rosto da Inconfidência Mineira — conspiração inspirada no Iluminismo que sonhava uma república no Brasil.',
    voz: 'Idealista, patriótico, ciente do martírio que o espera. Fala de liberdade com convicção quase religiosa. Indignado com a exploração colonial, esperançoso com os ideais americanos e franceses.',
    jsons: ['data/dados-brasil-inconfidencia.json', 'data/dados-brasil-colonial-tardio.json', 'data/dados-brasil-07-ciclo-ouro.json'],
    cor: '#7a6228',
  },
  {
    id: 'pedro2',
    nome: 'D. Pedro II',
    emoji: '👑',
    periodo: 'Brasil Império, 1825–1891',
    descricao: 'Imperador do Brasil por 49 anos. Aboliu a escravidão em 1888, modernizou o país e defendeu o Império como projecto civilizatório — até ser deposto em 1889 e morrer no exílio.',
    voz: 'Culto, melancólico, equilibrado. Prefere a ciência e a poesia à política. Defende o Império como projecto civilizatório mas reconhece as suas contradições. Fala com pesar sobre o exílio.',
    jsons: ['data/dados-brasil-11-segundo-reinado.json', 'data/dados-brasil-imperio.json', 'data/dados-brasil-colonial-escravidao.json'],
    cor: '#2b4b7e',
  },
  {
    id: 'luisgama',
    nome: 'Luís Gama',
    emoji: '⚖️',
    periodo: 'Brasil Imperial, 1830–1882',
    descricao: 'Poeta e advogado abolicionista. Filho de africana livre, foi vendido como escravo pelo próprio pai aos 10 anos. Autodidata, tornou-se jurista e libertou mais de 500 escravizados pela lei.',
    voz: 'Fala da escravidão de dentro, com raiva contida e precisão legal. Usa a ironia como arma. Crê no direito como instrumento de libertação. Tem consciência de que é excepção num sistema desenhado para esmagá-lo.',
    jsons: ['data/dados-brasil-colonial-escravidao.json', 'data/dados-brasil-quilombos.json', 'data/dados-trafico-transatlantico.json'],
    cor: '#3d3d3d',
  },
  {
    id: 'vargas',
    nome: 'Getúlio Vargas',
    emoji: '🎙️',
    periodo: 'Brasil, 1882–1954',
    descricao: 'Político gaúcho que governou o Brasil de 1930 a 1945 e de 1950 a 1954. Criou as leis trabalhistas e o Estado Novo, e suicidou-se deixando uma carta que definiu gerações.',
    voz: 'Populista calculista, paternalista, sempre ambíguo entre ditadura e democracia. Fala do povo como projecto político e dos trabalhadores como sua maior obra. Estratégico até no suicídio.',
    jsons: ['data/dados-brasil-13-era-vargas.json', 'data/dados-brasil-era-vargas.json', 'data/dados-brasil-14-populismo.json'],
    cor: '#b07a28',
  },
];

// ──────────────────────────────────────────────────
// ESTADO GLOBAL DO MÓDULO
// ──────────────────────────────────────────────────
let engine       = null;
let loadState    = 'idle'; // idle | loading | ready | error
let personaAtual = null;
let historico    = []; // array de { role, content }

// ──────────────────────────────────────────────────
// CARREGAMENTO DO MODELO
// ──────────────────────────────────────────────────
export async function carregarModelo(onProgress) {
  if (loadState === 'ready')   return { ok: true };
  if (loadState === 'loading') return { ok: false, reason: 'loading' };
  if (!navigator.gpu) return { ok: false, reason: 'webgpu' };

  loadState = 'loading';
  try {
    const webllm = await import(WEBLLM_CDN);
    engine = new webllm.MLCEngine();
    engine.setInitProgressCallback(({ progress, text }) => {
      if (typeof onProgress === 'function')
        onProgress(Math.round(progress * 100), text);
    });
    await engine.reload(MODEL_ID);
    loadState = 'ready';
    return { ok: true };
  } catch (err) {
    loadState = 'error';
    engine = null;
    console.error('[Vozes] Falha ao carregar modelo:', err);
    return { ok: false, reason: 'error', msg: err.message };
  }
}

export const modeloPronto    = () => loadState === 'ready';
export const modeloCarregando = () => loadState === 'loading';

// ──────────────────────────────────────────────────
// INJECÇÃO DE CONTEXTO JSON
// ──────────────────────────────────────────────────
async function carregarContextoJSON(jsonPaths) {
  const chunks = [];
  let totalChars = 0;

  for (const path of jsonPaths) {
    if (totalChars >= MAX_CTX_CHARS) break;
    try {
      const res  = await fetch(path);
      if (!res.ok) continue;
      const data = await res.json();
      const entidades = data.entidades || [];

      for (const e of entidades) {
        if (totalChars >= MAX_CTX_CHARS) break;
        const bloco = [
          `[${e.nome}]`,
          e.descricao   ? `Descrição: ${e.descricao}`   : '',
          e.importancia ? `Importância: ${e.importancia}` : '',
          e.contexto    ? `Contexto: ${e.contexto}`      : '',
        ].filter(Boolean).join('\n');
        chunks.push(bloco);
        totalChars += bloco.length;
      }
    } catch (err) {
      console.warn('[Vozes] Não foi possível carregar', path, err);
    }
  }
  return chunks.join('\n\n');
}

// ──────────────────────────────────────────────────
// SYSTEM PROMPT
// ──────────────────────────────────────────────────
function construirSystemPrompt(persona, contextoJSON) {
  return `Você é ${persona.nome}. ${persona.voz}

Está conversando com estudantes do Ensino Médio brasileiro sobre história.

REGRAS ABSOLUTAS:
- Responda SEMPRE em primeira pessoa como ${persona.nome}
- Use APENAS as informações do contexto histórico abaixo como base de conhecimento
- Se a pergunta ultrapassar o contexto fornecido, diga: "Sobre isso meus registros não chegam — consultem o vosso professor"
- NUNCA invente fatos, datas ou personagens além do contexto
- Linguagem compreensível para jovens de 15 a 17 anos, mantendo o tom e vocabulário da época
- Entre 3 e 5 parágrafos por resposta
- Termine sempre com uma pergunta de volta ao estudante

CONTEXTO HISTÓRICO (use apenas estas informações):
${contextoJSON || 'Nenhum contexto específico carregado. Use seu conhecimento geral sobre o período.'}`;
}

// ──────────────────────────────────────────────────
// INICIAR CONVERSA COM UMA PERSONA
// ──────────────────────────────────────────────────
export async function iniciarConversa(personaId) {
  const persona = PERSONAS.find(p => p.id === personaId);
  if (!persona) return { ok: false, reason: 'persona_not_found' };

  personaAtual = persona;
  historico = [];

  const ctx = await carregarContextoJSON(persona.jsons);
  const systemPrompt = construirSystemPrompt(persona, ctx);

  // Mensagem inicial da persona
  const abertura = await _gerar(systemPrompt, [
    { role: 'user', content: 'Apresente-se brevemente aos estudantes.' }
  ]);

  if (abertura) {
    historico.push({ role: 'assistant', content: abertura });
  }

  return { ok: true, persona, abertura };
}

// ──────────────────────────────────────────────────
// ENVIAR MENSAGEM
// ──────────────────────────────────────────────────
export async function enviarMensagem(textoUsuario) {
  if (!personaAtual || loadState !== 'ready') return null;

  const ctx = await carregarContextoJSON(personaAtual.jsons);
  const systemPrompt = construirSystemPrompt(personaAtual, ctx);

  historico.push({ role: 'user', content: textoUsuario });

  const resposta = await _gerar(systemPrompt, historico);
  if (resposta) {
    historico.push({ role: 'assistant', content: resposta });
  }
  return resposta;
}

// ──────────────────────────────────────────────────
// NOVA CONVERSA (mantém modelo, reinicia histórico)
// ──────────────────────────────────────────────────
export function novaConversa() {
  historico = [];
  personaAtual = null;
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
      max_tokens: 512,
      temperature: 0.65,
      top_p: 0.9,
    });
    return res.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('[Vozes] Erro na geração:', err);
    return null;
  }
}
