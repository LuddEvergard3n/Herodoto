/**
 * Grounded Voices engine. It never needs a generative model and returns the
 * evidence used to compose every answer.
 */
import { PERSONAS as LEGACY_PERSONAS } from './vozes.js';

const CUTOFF_YEARS = Object.freeze({
  herodoto: -425,
  aristoteles: -322,
  alexandre: -323,
  cesar: -44,
  cleopatra: -30,
  pedro2: 1891,
  luisgama: 1882,
  vargas: 1954,
});

const STOPWORDS = new Set([
  'a','o','as','os','de','da','do','das','dos','e','em','um','uma','que','como',
  'por','para','com','sem','sobre','foi','era','ser','ter','seu','sua','meu','minha',
  'the','and','of','to','in','was','were','el','la','los','las','del','con','una',
]);

const OPENINGS = Object.freeze({
  herodoto: 'Assim recolhi em minhas investigações:',
  aristoteles: 'É necessário distinguir o que sabemos do que apenas supomos:',
  alexandre: 'Uma decisão só pode ser julgada diante do terreno e das forças disponíveis:',
  cesar: 'Examinemos os fatos como quem examina uma campanha:',
  cleopatra: 'Antes de julgar, é preciso reconhecer os interesses de cada poder:',
  pedro2: 'Convém que eu seja exato, inclusive sobre as contradições do Império:',
  luisgama: 'Comecemos pela evidência, pois a lei sem realidade é apenas papel:',
  vargas: 'A política precisa ser medida por seus efeitos concretos sobre o povo:',
});

const CLOSINGS = Object.freeze({
  herodoto: 'Entre versões e testemunhos, qual explicação te parece mais bem sustentada?',
  aristoteles: 'Que distinção precisas fazer antes de formular uma conclusão?',
  alexandre: 'Diante dessas condições, que decisão tomarias?',
  cesar: 'Qual causa consideras decisiva, e que evidência sustenta teu julgamento?',
  cleopatra: 'Que acordo seria possível sem ignorar a desigualdade entre os envolvidos?',
  pedro2: 'Como julgar um regime que produziu realizações e preservou injustiças?',
  luisgama: 'Agora inverte a perspectiva: como esse fato seria vivido por quem não tinha poder?',
  vargas: 'Quem ganhou proteção, quem pagou o custo e quem permaneceu sem voz?',
});

const ANACHRONISM_TERMS = Object.freeze({
  herodoto: ['internet','cristianismo','roma imperial','brasil','segunda guerra','capitalismo'],
  aristoteles: ['internet','cristianismo','brasil','segunda guerra','capitalismo'],
  alexandre: ['internet','cristianismo','brasil','segunda guerra'],
  cesar: ['internet','brasil','segunda guerra','revolução industrial'],
  cleopatra: ['internet','brasil','segunda guerra','revolução industrial'],
  pedro2: ['internet','primeira guerra','segunda guerra','getúlio','ditadura de 1964'],
  luisgama: ['internet','república velha','getúlio','ditadura de 1964'],
  vargas: ['internet','ditadura de 1964','constituição de 1988','união europeia'],
});

let activePersona = null;
let evidenceCache = [];
let semanticClient = null;

export const PERSONAS = LEGACY_PERSONAS.map(persona => ({
  id: persona.id,
  name: persona.nome,
  period: persona.periodo,
  horizon: persona.horizonte,
  color: persona.cor,
  personalDataset: persona.jsonPessoal,
  contextDatasets: [...persona.jsons],
  reviewStatus: 'reviewed-v8',
  lastReviewed: '2026-10-10',
}));

function normalize(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function tokens(value) {
  return normalize(value).split(/[^a-z0-9]+/).filter(token => token.length > 1 && !STOPWORDS.has(token));
}

function localized(entity, field, language) {
  if (language === 'en') return entity[`${field}_en`] || entity[field] || '';
  if (language === 'es') return entity[`${field}_es`] || entity[field] || '';
  return entity[field] || '';
}

function lexicalScore(entity, queryTokens) {
  const title = normalize(entity.title);
  const body = normalize(`${entity.description} ${entity.importance} ${entity.tags.join(' ')}`);
  return queryTokens.reduce((score, token) => {
    if (title.includes(token)) score += 4;
    if (body.includes(token)) score += 1;
    return score;
  }, entity.personal ? 2 : 0);
}

function detectIntent(question) {
  const text = normalize(question);
  if (/compar|diferenc|semelh/.test(text)) return 'comparison';
  if (/por que|porque|causa|motivo/.test(text)) return 'cause';
  if (/consequ|resultado|efeito/.test(text)) return 'consequence';
  if (/opina|acha|pensa|visao/.test(text)) return 'interpretation';
  return 'explanation';
}

function detectAnachronism(personaId, question) {
  const text = normalize(question);
  const yearMatches = [...text.matchAll(/\b(\d{3,4})\b/g)].map(match => Number(match[1]));
  const cutoff = CUTOFF_YEARS[personaId];
  const laterYear = cutoff > 0 && yearMatches.find(year => year > cutoff);
  const term = (ANACHRONISM_TERMS[personaId] || []).find(item => text.includes(normalize(item)));
  return laterYear || term ? { laterYear, term } : null;
}

async function loadDataset(path, personal, language) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
  const data = await response.json();
  return (data.entidades || []).map((entity, index) => ({
    id: entity.id || `${path}#${index}`,
    title: localized(entity, 'nome', language),
    description: localized(entity, 'descricao', language),
    importance: localized(entity, 'importancia', language),
    start: entity.inicio,
    end: entity.fim,
    tags: Array.isArray(entity.tags) ? entity.tags : [],
    datasetId: path,
    sourceIds: [path],
    personal,
  })).filter(entity => entity.title && entity.description);
}

export async function preparePersona(personaId, language = 'pt') {
  const legacy = LEGACY_PERSONAS.find(item => item.id === personaId);
  if (!legacy) return { ok: false, reason: 'persona_not_found' };
  const paths = [legacy.jsonPessoal, ...legacy.jsons];
  const results = await Promise.allSettled(paths.map((path, index) => loadDataset(path, index === 0, language)));
  evidenceCache = results.flatMap(result => result.status === 'fulfilled' ? result.value : []);
  activePersona = legacy;
  return {
    ok: evidenceCache.length > 0,
    persona: PERSONAS.find(item => item.id === personaId),
    evidenceCount: evidenceCache.length,
    unavailableDatasets: results.filter(result => result.status === 'rejected').length,
  };
}

export function setSemanticClient(client) {
  semanticClient = client;
}

async function retrieve(question, limit = 5) {
  const queryTokens = tokens(question);
  const ranked = evidenceCache.map(entity => ({ ...entity, lexical: lexicalScore(entity, queryTokens), semantic: 0 }));
  if (semanticClient?.rank) {
    try {
      const semanticScores = await semanticClient.rank(question, ranked.map(item => `${item.title}. ${item.description}`));
      ranked.forEach((item, index) => { item.semantic = Number(semanticScores[index]) || 0; });
    } catch (error) {
      console.warn('[Vozes] Busca semântica indisponível; usando índice lexical.', error);
    }
  }
  ranked.sort((a, b) => (b.lexical + b.semantic * 4) - (a.lexical + a.semantic * 4));
  const hasLexicalMatch = ranked.some(item => item.lexical > (item.personal ? 2 : 0));
  return hasLexicalMatch || semanticClient ? ranked.slice(0, limit) : [];
}

function compose(persona, question, evidence, intent) {
  const primary = evidence[0];
  const secondary = evidence[1];
  const paragraphs = [OPENINGS[persona.id] || 'Examinemos o que os registros permitem afirmar:'];
  paragraphs.push(primary.description);
  if (secondary && secondary.id !== primary.id) paragraphs.push(`Outro registro relacionado acrescenta: ${secondary.description}`);
  if (intent === 'interpretation' && primary.importance) paragraphs.push(`Uma interpretação registrada é: ${primary.importance}`);
  paragraphs.push(CLOSINGS[persona.id] || 'Que conclusão tiras dessas evidências?');
  return paragraphs.join('\n\n');
}

export async function answerQuestion({ personaId, question, language = 'pt', conversationHistory = [] }) {
  if (!question?.trim()) return { text: '', evidence: [], sourceIds: [], confidence: 0, answerMode: 'out_of_scope', limitations: ['empty_question'], suggestedQuestions: [] };
  if (!activePersona || activePersona.id !== personaId) await preparePersona(personaId, language);
  if (!activePersona) return { text: '', evidence: [], sourceIds: [], confidence: 0, answerMode: 'out_of_scope', limitations: ['persona_not_found'], suggestedQuestions: [] };

  const anachronism = detectAnachronism(personaId, question);
  if (anachronism) {
    return {
      text: `Esse acontecimento está além do meu horizonte, ${activePersona.horizonte}. Posso compará-lo apenas com experiências e instituições que conheci em meu tempo.`,
      evidence: [], sourceIds: [], confidence: 1, answerMode: 'anachronism',
      limitations: ['historical_horizon'], suggestedQuestions: ['Que acontecimentos do seu tempo ajudam a fazer essa comparação?'],
    };
  }

  const evidence = await retrieve(question);
  if (!evidence.length) {
    return {
      text: 'Não encontro, entre os registros que me foram confiados, fundamento suficiente para responder com segurança.',
      evidence: [], sourceIds: [], confidence: 0, answerMode: 'uncertainty',
      limitations: ['insufficient_evidence'], suggestedQuestions: evidenceCache.slice(0, 3).map(item => item.title),
    };
  }

  const intent = detectIntent(question);
  return {
    text: compose(activePersona, question, evidence, intent),
    evidence: evidence.map(({ lexical, semantic, ...item }) => item),
    sourceIds: [...new Set(evidence.flatMap(item => item.sourceIds))],
    confidence: Math.min(1, 0.45 + evidence[0].lexical * 0.08 + evidence[0].semantic * 0.25),
    answerMode: intent === 'interpretation' ? 'interpretation' : 'grounded',
    limitations: ['pedagogical_dramatization', ...(semanticClient ? [] : ['lexical_retrieval'])],
    suggestedQuestions: evidence.slice(0, 3).map(item => `O que ${item.title} revela sobre esse período?`),
    conversationLength: conversationHistory.length,
  };
}

export async function generateGroundedAnswer(persona, question, evidence, history) {
  return compose(persona, question, evidence, detectIntent(question), history);
}
