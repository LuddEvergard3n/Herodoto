/**
 * Grounded Voices engine. Historical datasets are evidence; a local model may
 * only rewrite selected evidence and never becomes a historical source.
 */
import {
  prepareVoiceRuntime, getVoiceRuntimeStatus, cancelVoiceRuntimePreparation,
  clearVoiceModelCache, generateWithVoiceRuntime,
} from './voices-runtime.js';

const STOPWORDS = new Set(['a','o','as','os','de','da','do','das','dos','e','em','um','uma','que','como','por','para','com','sem','sobre','foi','era','ser','ter','seu','sua','the','and','of','to','in','was','were','el','la','los','las','del','con','una']);
const OPENINGS = Object.freeze({
  herodoto: 'Assim recolhi em minhas investigações:', aristoteles: 'É necessário distinguir o que sabemos do que apenas supomos:',
  alexandre: 'Uma decisão só pode ser julgada diante do terreno e das forças disponíveis:', cesar: 'Examinemos os fatos como quem examina uma campanha:',
  cleopatra: 'Antes de julgar, é preciso reconhecer os interesses de cada poder:', pedro2: 'Convém que eu seja exato, inclusive sobre as contradições do Império:',
  luisgama: 'Comecemos pela evidência, pois a lei sem realidade é apenas papel:', vargas: 'A política precisa ser medida por seus efeitos concretos sobre o povo:',
});
const CLOSINGS = Object.freeze({
  herodoto: 'Entre versões e testemunhos, qual explicação te parece mais bem sustentada?', aristoteles: 'Que distinção precisas fazer antes de formular uma conclusão?',
  alexandre: 'Diante dessas condições, que decisão tomarias?', cesar: 'Qual causa consideras decisiva, e que evidência sustenta teu julgamento?',
  cleopatra: 'Que acordo seria possível sem ignorar a desigualdade entre os envolvidos?', pedro2: 'Como julgar um regime que produziu realizações e preservou injustiças?',
  luisgama: 'Agora inverte a perspectiva: como esse fato seria vivido por quem não tinha poder?', vargas: 'Quem ganhou proteção, quem pagou o custo e quem permaneceu sem voz?',
});

let catalogsPromise = null;
let activePersona = null;
let evidenceCache = [];
let sourceCatalog = new Map();

const normalize = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const tokens = value => normalize(value).split(/[^a-z0-9]+/).filter(token => token.length > 1 && !STOPWORDS.has(token));

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
  return response.json();
}

async function loadCatalogs() {
  if (!catalogsPromise) {
    catalogsPromise = Promise.all([fetchJson('data/voices-personas.json'), fetchJson('data/voices-sources.json'), fetchJson('data/voices-retrieval-index.json')])
      .then(([personas, sources, index]) => ({ personas: personas.personas, sources: sources.sources, chunks: index.chunks }));
  }
  return catalogsPromise;
}

export async function getPersonas() { return (await loadCatalogs()).personas; }

function lexicalScore(chunk, queryTokens) {
  const title = normalize(chunk.text.split('.')[0]);
  const body = normalize(`${chunk.text} ${(chunk.keywords || []).join(' ')}`);
  return queryTokens.reduce((score, token) => score + (title.includes(token) ? 5 : 0) + (body.includes(token) ? 1 : 0), 0);
}

function detectIntent(question) {
  const text = normalize(question);
  if (/compar|diferenc|semelh/.test(text)) return 'comparison';
  if (/critic|contradi|controv/.test(text)) return 'controversy';
  if (/por que|porque|causa|motivo/.test(text)) return 'cause';
  if (/consequ|resultado|efeito/.test(text)) return 'consequence';
  if (/opina|acha|pensa|visao/.test(text)) return 'interpretation';
  return 'explanation';
}

function detectAnachronism(persona, question) {
  const text = normalize(question);
  const years = [...text.matchAll(/\b(\d{3,4})\b/g)].map(match => Number(match[1]));
  const laterYear = persona.horizonYear > 0 ? years.find(year => year > persona.horizonYear) : null;
  const term = persona.anachronismTerms.find(item => text.includes(normalize(item)));
  return laterYear || term ? { laterYear, term } : null;
}

function retrieve(question, limit = 8) {
  const ranked = evidenceCache.map(chunk => ({ ...chunk, lexical: lexicalScore(chunk, tokens(question)) }))
    .sort((a, b) => b.lexical - a.lexical || a.id.localeCompare(b.id));
  if (!ranked.some(item => item.lexical > 0)) return [];
  const selected = [], sourceUse = new Map(), typeUse = new Map();
  for (const item of ranked) {
    const sourceId = item.sourceIds[0];
    const repetition = (sourceUse.get(sourceId) || 0) + (typeUse.get(item.knowledgeType) || 0);
    if (selected.length < 4 || repetition < 2) {
      selected.push(item);
      sourceUse.set(sourceId, (sourceUse.get(sourceId) || 0) + 1);
      typeUse.set(item.knowledgeType, (typeUse.get(item.knowledgeType) || 0) + 1);
    }
    if (selected.length === limit) break;
  }
  return selected;
}

function publicEvidence(item) {
  return {
    id: item.id, title: item.text.split('.')[0], description: item.text,
    datasetId: 'data/voices-retrieval-index.json', sourceIds: item.sourceIds,
    sources: item.sourceIds.map(id => sourceCatalog.get(id)).filter(Boolean), locator: item.locator,
    knowledgeType: item.knowledgeType, claimStatus: item.claimStatus,
  };
}

function compose(persona, evidence, intent) {
  const paragraphs = [OPENINGS[persona.id] || 'Examinemos o que os registros permitem afirmar:', evidence[0].text];
  if (evidence[1]?.id !== evidence[0].id) paragraphs.push(`Outro registro relacionado acrescenta: ${evidence[1].text}`);
  if (intent === 'controversy') paragraphs.push('As fontes não devem ser tratadas como neutras: autoria, data e finalidade alteram o modo de interpretá-las.');
  paragraphs.push(CLOSINGS[persona.id] || 'Que conclusão tiras dessas evidências?');
  return paragraphs.join('\n\n');
}

function promptMessages(persona, question, evidence, history, strict = false) {
  const records = evidence.map((item, index) => `[E${index + 1}] ${item.text} Fonte: ${item.sourceIds.join(', ')}; localizador: ${item.locator}.`).join('\n');
  const recent = history.slice(-4).map(item => `${item.role}: ${String(item.content).slice(0, 400)}`).join('\n');
  return [
    { role: 'system', content: `Você redige uma dramatização pedagógica de ${persona.name}. Use somente as evidências fornecidas. Não invente nomes, datas, números, documentos nem citações. Não use aspas. Assinale incerteza e controvérsia. Não alegue conhecer fatos posteriores a ${persona.horizonYear}. Máximo de 180 palavras. Estilo: ${persona.style} Estratégia: ${persona.pedagogicalStrategy}.${strict ? ' Copie apenas fatos explícitos e omita qualquer detalhe duvidoso.' : ''}` },
    { role: 'user', content: `Pergunta: ${question}\nHistórico curto:\n${recent || 'sem histórico'}\nEvidências:\n${records}` },
  ];
}

function unsupportedDetails(text, persona, question, evidence) {
  const allowed = normalize(`${persona.name} ${question} ${evidence.map(item => item.text).join(' ')}`);
  const numbers = [...String(text).matchAll(/\b\d+(?:[.,]\d+)?\b/g)].map(match => match[0]);
  const properNames = [...String(text).matchAll(/\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\p{L}-]+(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\p{L}-]+)+/gu)].map(match => match[0]);
  const quotations = [...String(text).matchAll(/[“"]([^”"]{3,})[”"]/g)].map(match => match[1]);
  return [...numbers, ...properNames, ...quotations].filter(value => !allowed.includes(normalize(value)));
}

async function generatedAnswer(persona, question, evidence, history) {
  const runtime = getVoiceRuntimeStatus();
  if (runtime.state !== 'ready' || runtime.tier === 'deterministic') return null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const result = await generateWithVoiceRuntime(promptMessages(persona, question, evidence, history, attempt === 1), { temperature: attempt ? 0.2 : 0.55 });
      const text = result.text.trim();
      if (text && text.split(/\s+/).length <= 180 && unsupportedDetails(text, persona, question, evidence).length === 0) {
        return { text, tier: result.tier, status: attempt ? 'regenerated' : 'generated' };
      }
    } catch (error) {
      console.warn('[Vozes] Geração local indisponível; usando compositor determinístico.', error);
      return null;
    }
  }
  return null;
}

export async function preparePersona(personaId) {
  const catalogs = await loadCatalogs();
  const persona = catalogs.personas.find(item => item.id === personaId);
  if (!persona) return { ok: false, reason: 'persona_not_found' };
  sourceCatalog = new Map(catalogs.sources.map(source => [source.id, source]));
  evidenceCache = catalogs.chunks.filter(chunk => chunk.personaIds.includes(personaId));
  activePersona = persona;
  return { ok: evidenceCache.length > 0, persona, evidenceCount: evidenceCache.length, unavailableDatasets: 0 };
}

export async function answerQuestion({ personaId, question, language = 'pt', conversationHistory = [] }) {
  const runtime = getVoiceRuntimeStatus();
  const base = { runtimeTier: runtime.tier, generationStatus: 'not_attempted', groundingStatus: 'not_applicable' };
  if (!question?.trim()) return { ...base, text: '', evidence: [], sourceIds: [], confidence: 0, answerMode: 'out_of_scope', limitations: ['empty_question'], suggestedQuestions: [] };
  if (!activePersona || activePersona.id !== personaId) await preparePersona(personaId);
  if (!activePersona) return { ...base, text: '', evidence: [], sourceIds: [], confidence: 0, answerMode: 'out_of_scope', limitations: ['persona_not_found'], suggestedQuestions: [] };
  const anachronism = detectAnachronism(activePersona, question);
  if (anachronism) return { ...base, text: `Esse acontecimento está além do horizonte histórico desta persona: ${activePersona.knowledgeCutoff} Posso compará-lo apenas com experiências e instituições conhecidas em seu tempo.`, evidence: [], sourceIds: [], confidence: 1, answerMode: 'anachronism', groundingStatus: 'horizon_enforced', limitations: ['historical_horizon'], suggestedQuestions: ['Que acontecimentos do seu tempo ajudam a fazer essa comparação?'] };
  const evidence = retrieve(question);
  if (!evidence.length) return { ...base, text: 'Não encontro, entre os registros que me foram confiados, fundamento suficiente para responder com segurança.', evidence: [], sourceIds: [], confidence: 0, answerMode: 'uncertainty', groundingStatus: 'insufficient_evidence', limitations: ['insufficient_evidence'], suggestedQuestions: evidenceCache.slice(0, 3).map(item => item.text.split('.')[0]) };
  const intent = detectIntent(question);
  const generated = await generatedAnswer(activePersona, question, evidence, conversationHistory);
  return {
    text: generated?.text || compose(activePersona, evidence, intent), evidence: evidence.map(publicEvidence),
    sourceIds: [...new Set(evidence.flatMap(item => item.sourceIds))], confidence: Math.min(1, 0.55 + evidence[0].lexical * 0.04),
    answerMode: intent === 'controversy' ? 'controversy' : intent === 'comparison' ? 'comparison' : 'grounded',
    limitations: ['pedagogical_dramatization', ...(generated ? [] : ['deterministic_composer'])],
    suggestedQuestions: evidence.slice(0, 3).map(item => `O que ${item.text.split('.')[0]} revela sobre esse período?`),
    conversationLength: conversationHistory.length, runtimeTier: generated?.tier || 'deterministic',
    generationStatus: generated?.status || (runtime.state === 'ready' ? 'grounding_fallback' : 'deterministic_fallback'),
    groundingStatus: generated ? 'validated' : 'evidence_bound', language,
  };
}

export async function generateGroundedAnswer(persona, question, evidence, history = []) {
  const generated = await generatedAnswer(persona, question, evidence, history);
  return generated?.text || compose(persona, evidence, detectIntent(question));
}

export { prepareVoiceRuntime, getVoiceRuntimeStatus, cancelVoiceRuntimePreparation, clearVoiceModelCache };
