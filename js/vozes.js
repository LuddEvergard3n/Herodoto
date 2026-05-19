/**
 * VOZES DA HISTÓRIA — JS — HERÓDOTO v7.58
 * Chat com personas históricas via WebLLM (Llama-3.1-8B)
 * Contexto injectado a partir dos JSONs de dados do projecto.
 * CORRIGIDO: janela deslizante + contexto truncado para 4096 tokens
 */

const MODEL_ID   = 'Llama-3.1-8B-Instruct-q4f32_1-MLC';
const WEBLLM_CDN = 'https://esm.run/@mlc-ai/web-llm';

// Orçamento de tokens (janela 4096):
//   system prompt: ~150 | contexto JSON: ~700 | histórico: ~350 | resposta: ~350
const MAX_CTX_CHARS  = 2400; // caracteres de contexto JSON (~700 tokens)
const MAX_DESC_CHARS = 180;  // truncar descrição por entidade
const MAX_HISTORY    = 4;    // últimas N mensagens no histórico (2 trocas)

// ──────────────────────────────────────────────────
// PERSONAS
// ──────────────────────────────────────────────────
export const PERSONAS = [
  {
    id: 'herodoto', nome: 'Heródoto', emoji: '🏛️',
    periodo: 'Grécia Antiga, séc. V a.C.',
    voz: 'Narrador curioso e analítico. Compara culturas com fascínio. Fala como quem observou o mundo e registrou o que viu.',
    jsons: ['data/dados-grecia-antiga.json','data/dados-grecia-helenismo.json','data/dados-persia.json'],
    cor: '#2b4b7e',
  },
  {
    id: 'aristoteles', nome: 'Aristóteles', emoji: '📜',
    periodo: 'Grécia Antiga, 384–322 a.C.',
    voz: 'Sistemático e didático. Estrutura o pensamento em categorias. Questiona antes de afirmar.',
    jsons: ['data/dados-grecia-antiga.json','data/dados-grecia-filosofia.json'],
    cor: '#5c2d6e',
  },
  {
    id: 'alexandre', nome: 'Alexandre, o Grande', emoji: '⚔️',
    periodo: 'Período Helenístico, 356–323 a.C.',
    voz: 'Estratégico, convicto de missão civilizatória. Impaciente com limitações. Fala de batalhas como projeto de civilização.',
    jsons: ['data/dados-grecia-helenismo.json','data/dados-persia.json'],
    cor: '#8b3a2a',
  },
  {
    id: 'cesar', nome: 'Júlio César', emoji: '🦅',
    periodo: 'República Romana, 100–44 a.C.',
    voz: 'Direto, calculista, consciente da história que está fazendo. Fala de política com frieza mas com ambição declarada.',
    jsons: ['data/dados-roma-antiga.json','data/dados-roma-republica.json','data/dados-roma-emperadores.json'],
    cor: '#a0622a',
  },
  {
    id: 'cleopatra', nome: 'Cleópatra VII', emoji: '🐍',
    periodo: 'Egipto Ptolemaico, 69–30 a.C.',
    voz: 'Inteligente, diplomata, multilíngue. Consciente de que governa um reino em declínio e usa todos os recursos para preservá-lo.',
    jsons: ['data/dados-egito-antigo.json','data/dados-egito-reinos.json','data/dados-roma-antiga.json'],
    cor: '#2e6b4f',
  },
  {
    id: 'tiradentes', nome: 'Tiradentes', emoji: '🕊️',
    periodo: 'Brasil Colonial, 1746–1792',
    voz: 'Idealista, patriótico, ciente do martírio que o espera. Fala de liberdade com convicção quase religiosa.',
    jsons: ['data/dados-brasil-inconfidencia.json','data/dados-brasil-colonial-tardio.json','data/dados-brasil-07-ciclo-ouro.json'],
    cor: '#7a6228',
  },
  {
    id: 'pedro2', nome: 'D. Pedro II', emoji: '👑',
    periodo: 'Brasil Império, 1825–1891',
    voz: 'Culto, melancólico, equilibrado. Defende o Império como projeto civilizatório mas reconhece suas contradições.',
    jsons: ['data/dados-brasil-11-segundo-reinado.json','data/dados-brasil-imperio.json','data/dados-brasil-colonial-escravidao.json'],
    cor: '#2b4b7e',
  },
  {
    id: 'luisgama', nome: 'Luís Gama', emoji: '⚖️',
    periodo: 'Brasil Imperial, 1830–1882',
    voz: 'Fala da escravidão de dentro, com raiva contida e precisão legal. Usa a ironia como arma. Crê no direito como instrumento de libertação.',
    jsons: ['data/dados-brasil-colonial-escravidao.json','data/dados-brasil-quilombos.json','data/dados-trafico-transatlantico.json'],
    cor: '#3d3d3d',
  },
  {
    id: 'vargas', nome: 'Getúlio Vargas', emoji: '🎙️',
    periodo: 'Brasil, 1882–1954',
    voz: 'Populista calculista, paternalista, ambíguo entre ditadura e democracia. Fala do povo como projeto político.',
    jsons: ['data/dados-brasil-13-era-vargas.json','data/dados-brasil-era-vargas.json','data/dados-brasil-14-populismo.json'],
    cor: '#b07a28',
  },
];

// ──────────────────────────────────────────────────
// ESTADO GLOBAL
// ──────────────────────────────────────────────────
let engine            = null;
let loadState         = 'idle'; // idle | loading | ready | error
let personaAtual      = null;
let historico         = [];
let systemPromptCache = '';

// ──────────────────────────────────────────────────
// CARREGAMENTO DO MODELO
// ──────────────────────────────────────────────────
export async function carregarModelo(onProgress) {
  if (loadState === 'ready')   return { ok: true };
  if (loadState === 'loading') return { ok: false, reason: 'loading' };
  if (!navigator.gpu)          return { ok: false, reason: 'webgpu' };

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

export const modeloPronto     = () => loadState === 'ready';
export const modeloCarregando = () => loadState === 'loading';

// ──────────────────────────────────────────────────
// INJECÇÃO DE CONTEXTO JSON — truncado para caber na janela
// ──────────────────────────────────────────────────
async function carregarContextoJSON(jsonPaths) {
  const chunks = [];
  let totalChars = 0;

  const trunc = (s, max) => s && s.length > max ? s.slice(0, max) + '…' : (s || '');

  for (const path of jsonPaths) {
    if (totalChars >= MAX_CTX_CHARS) break;
    try {
      const res  = await fetch(path);
      if (!res.ok) continue;
      const data = await res.json();
      const entidades = (data.entidades || [])
        .sort((a, b) => (b.importancia || 0) - (a.importancia || 0));

      for (const e of entidades) {
        if (totalChars >= MAX_CTX_CHARS) break;
        const bloco = `[${e.nome}] ${trunc(e.descricao, MAX_DESC_CHARS)}`.trim();
        chunks.push(bloco);
        totalChars += bloco.length;
      }
    } catch (err) {
      console.warn('[Vozes] Não foi possível carregar', path, err);
    }
  }
  return chunks.join('\n');
}

// ──────────────────────────────────────────────────
// SYSTEM PROMPT — conciso para preservar tokens
// ──────────────────────────────────────────────────
function construirSystemPrompt(persona, contextoJSON) {
  return `Você é ${persona.nome}. ${persona.voz}
Fale em primeira pessoa. Use apenas os fatos do CONTEXTO. Se não souber, diga: "Sobre isso meus registros não chegam." Responda em 2-3 parágrafos. Termine com uma pergunta ao estudante.

CONTEXTO:
${contextoJSON || 'Sem contexto disponível.'}`;
}

// ──────────────────────────────────────────────────
// INICIAR CONVERSA
// ──────────────────────────────────────────────────
export async function iniciarConversa(personaId) {
  const persona = PERSONAS.find(p => p.id === personaId);
  if (!persona) return { ok: false, reason: 'persona_not_found' };

  personaAtual      = persona;
  historico         = [];
  systemPromptCache = '';

  const ctx = await carregarContextoJSON(persona.jsons);
  systemPromptCache = construirSystemPrompt(persona, ctx);

  const abertura = await _gerar(systemPromptCache, [
    { role: 'user', content: 'Apresente-se brevemente.' }
  ]);

  if (abertura) historico.push({ role: 'assistant', content: abertura });

  return { ok: true, persona, abertura };
}

// ──────────────────────────────────────────────────
// ENVIAR MENSAGEM — janela deslizante no histórico
// ──────────────────────────────────────────────────
export async function enviarMensagem(textoUsuario) {
  if (!personaAtual || loadState !== 'ready') return null;

  historico.push({ role: 'user', content: textoUsuario });

  // Janela deslizante: últimas MAX_HISTORY mensagens
  const janela = historico.slice(-MAX_HISTORY);

  const resposta = await _gerar(systemPromptCache, janela);
  if (resposta) historico.push({ role: 'assistant', content: resposta });

  return resposta;
}

// ──────────────────────────────────────────────────
// NOVA CONVERSA (mantém modelo carregado)
// ──────────────────────────────────────────────────
export function novaConversa() {
  historico         = [];
  personaAtual      = null;
  systemPromptCache = '';
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
      max_tokens: 350,
      temperature: 0.65,
      top_p: 0.9,
    });
    return res.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('[Vozes] Erro na geração:', err);
    return null;
  }
}
