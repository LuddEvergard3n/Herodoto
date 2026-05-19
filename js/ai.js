/**
 * AI.JS — HERÓDOTO v7.56
 * Integração WebLLM (Phi-3.5-mini-instruct)
 * - Download único ~2.2GB, offline após primeiro carregamento
 * - Opt-in total: não faz nada sem consentimento explícito
 * - Degrada silenciosamente se WebGPU indisponível
 */

// ── Constantes ─────────────────────────────────────
const MODEL_ID   = 'Phi-3.5-mini-instruct-q4f16_1-MLC';
const STORAGE_KEY = 'herodoto_ai_enabled';
const WEBLLM_CDN  = 'https://esm.run/@mlc-ai/web-llm';

// ── Estado interno ──────────────────────────────────
let engine       = null;   // instância WebLLM
let loadState    = 'idle'; // idle | loading | ready | error | unavailable
let loadProgress = 0;

// ── Verificação de WebGPU ────────────────────────────
function webGPUDisponivel() {
  return typeof navigator !== 'undefined' && !!navigator.gpu;
}

// ── Persistência de opt-in ───────────────────────────
export function aiOptIn()    { localStorage.setItem(STORAGE_KEY, '1'); }
export function aiOptOut()   { localStorage.removeItem(STORAGE_KEY); engine = null; loadState = 'idle'; }
export function aiAtivado()  { return localStorage.getItem(STORAGE_KEY) === '1'; }
export function aiPronto()   { return loadState === 'ready'; }
export function aiCarregando() { return loadState === 'loading'; }

// ── Inicialização (chamada uma vez após opt-in) ──────
export async function inicializarAI(onProgress) {
  if (!webGPUDisponivel()) {
    loadState = 'unavailable';
    return { ok: false, reason: 'webgpu' };
  }
  if (loadState === 'ready')   return { ok: true };
  if (loadState === 'loading') return { ok: false, reason: 'loading' };

  loadState = 'loading';
  try {
    const webllm = await import(WEBLLM_CDN);
    engine = new webllm.MLCEngine();
    engine.setInitProgressCallback(({ progress, text }) => {
      loadProgress = Math.round(progress * 100);
      if (typeof onProgress === 'function') onProgress(loadProgress, text);
    });
    await engine.reload(MODEL_ID);
    loadState = 'ready';
    return { ok: true };
  } catch (err) {
    loadState = 'error';
    engine = null;
    console.error('[AI] Falha ao carregar modelo:', err);
    return { ok: false, reason: 'error', msg: err.message };
  }
}

// ── Geração de texto ─────────────────────────────────
async function gerar(systemPrompt, userMsg, maxTokens = 300) {
  if (loadState !== 'ready' || !engine) return null;
  try {
    const res = await engine.chat.completions.create({
      messages: [
        { role: 'system',  content: systemPrompt },
        { role: 'user',    content: userMsg }
      ],
      max_tokens: maxTokens,
      temperature: 0.5,
    });
    return res.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('[AI] Erro na geração:', err);
    return null;
  }
}

// ── Análise de entidade para o painel de contexto ───
export async function analisarEntidade(entidade, entidadesRelacionadas, lang = 'pt') {
  const nome = lang === 'en' ? (entidade.nome_en || entidade.nome)
             : lang === 'es' ? (entidade.nome_es || entidade.nome)
             : entidade.nome;

  const desc = lang === 'en' ? (entidade.descricao_en || entidade.descricao)
             : lang === 'es' ? (entidade.descricao_es || entidade.descricao)
             : entidade.descricao;

  const relacionadosNomes = entidadesRelacionadas
    .slice(0, 6)
    .map(e => lang === 'en' ? (e.nome_en || e.nome) : lang === 'es' ? (e.nome_es || e.nome) : e.nome)
    .join(', ');

  const instrucoes = {
    pt: `Você é um professor de história especialista. Analise a entidade histórica abaixo em 3 parágrafos curtos:
1. Importância histórica e por que importa hoje
2. Conexão com os eventos relacionados listados
3. Uma pergunta provocadora para debater em sala de aula
Seja direto, claro e adequado para alunos do Ensino Médio. Escreva em português.`,
    en: `You are an expert history teacher. Analyze the historical entity below in 3 short paragraphs:
1. Historical importance and why it matters today
2. Connection with the related events listed
3. A thought-provoking question to debate in class
Be direct, clear and suitable for high school students. Write in English.`,
    es: `Eres un profesor de historia experto. Analiza la entidad histórica a continuación en 3 párrafos cortos:
1. Importancia histórica y por qué importa hoy
2. Conexión con los eventos relacionados listados
3. Una pregunta provocadora para debatir en clase
Sé directo, claro y adecuado para estudiantes de secundaria. Escribe en español.`,
  };

  const mensagem = lang === 'en'
    ? `Entity: ${nome}\nDescription: ${desc || 'No description available.'}\nRelated events: ${relacionadosNomes || 'none'}`
    : lang === 'es'
    ? `Entidad: ${nome}\nDescripción: ${desc || 'Sin descripción.'}\nEventos relacionados: ${relacionadosNomes || 'ninguno'}`
    : `Entidade: ${nome}\nDescrição: ${desc || 'Sem descrição.'}\nEventos relacionados: ${relacionadosNomes || 'nenhum'}`;

  return await gerar(instrucoes[lang] || instrucoes.pt, mensagem, 350);
}

// ── Banner de apresentação (HTML string) ─────────────
export function renderBannerAI(lang = 'pt') {
  const textos = {
    pt: {
      titulo:  'Análise com IA disponível',
      corpo:   'Ative a IA local (Phi-3.5-mini, ~2.2 GB) para análise pedagógica de cada evento. Download único — funciona offline depois.',
      ativar:  'Ativar IA',
      nao:     'Não, obrigado',
      aviso:   'Requer Chrome/Edge 113+ com WebGPU.',
    },
    en: {
      titulo:  'AI Analysis available',
      corpo:   'Activate local AI (Phi-3.5-mini, ~2.2 GB) for pedagogical analysis of each event. One-time download — works offline after.',
      ativar:  'Activate AI',
      nao:     'No thanks',
      aviso:   'Requires Chrome/Edge 113+ with WebGPU.',
    },
    es: {
      titulo:  'Análisis con IA disponible',
      corpo:   'Activa la IA local (Phi-3.5-mini, ~2.2 GB) para análisis pedagógico de cada evento. Descarga única — funciona sin conexión después.',
      ativar:  'Activar IA',
      nao:     'No, gracias',
      aviso:   'Requiere Chrome/Edge 113+ con WebGPU.',
    },
  };
  const t = textos[lang] || textos.pt;
  return `
<div class="ai-banner" id="ai-banner">
  <div class="ai-banner-icon">✦</div>
  <div class="ai-banner-body">
    <strong>${t.titulo}</strong>
    <p>${t.corpo}</p>
    <small>${t.aviso}</small>
  </div>
  <div class="ai-banner-btns">
    <button class="ai-btn-ativar" id="ai-btn-ativar">${t.ativar}</button>
    <button class="ai-btn-nao"   id="ai-btn-nao">${t.nao}</button>
  </div>
</div>`;
}

// ── Botão "Analisar com IA" (HTML string) ────────────
export function renderBotaoAI(lang = 'pt') {
  const label = { pt: '✦ Analisar com IA', en: '✦ AI Analysis', es: '✦ Analizar con IA' };
  return `<button class="ai-analisar-btn" id="ai-analisar-btn" data-state="idle">
    ${label[lang] || label.pt}
  </button>`;
}