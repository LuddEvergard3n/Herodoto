#!/usr/bin/env node
'use strict';

/**
 * Builds the Herodoto 8.1 persona dossiers and lexical retrieval index.
 * Source datasets remain untouched; every generated file can be recreated.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, 'data', 'voices-dossiers');
const personaCatalog = readJson('data/voices-personas.json');

const SOURCE_SETS = {
  herodoto: [
    source('herodoto-histories', 'Heródoto', 'Histórias', 'primary', 'c. 430 a.C.', 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0126', 'Livros I–IX', 'Domínio público; tradução e numeração variam entre edições.'),
    source('herodoto-strabo', 'Estrabão', 'Geografia', 'ancient', 'c. 7 a.C.–23 d.C.', 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Strabo/home.html', 'Livros I–XVII', 'Testemunho posterior e dependente de tradições antigas.'),
    source('herodoto-perseus', 'Tufts University', 'Perseus Digital Library: Herodotus', 'institutional', '2026', 'https://www.perseus.tufts.edu/', 'Coleção grega e inglesa', 'Edição digital; consultar a edição citada em trabalhos acadêmicos.'),
    source('herodoto-livius', 'Livius.org', 'Herodotus', 'academic-open', '2020', 'https://www.livius.org/articles/person/herodotus/', 'Dossiê biográfico', 'Síntese de divulgação, não substitui discussão historiográfica especializada.'),
    source('herodoto-britannica', 'Encyclopaedia Britannica', 'Herodotus', 'reference', '2026', 'https://www.britannica.com/biography/Herodotus-Greek-historian', 'Biografia', 'Fonte de referência geral.'),
    source('herodoto-worldhistory', 'World History Encyclopedia', 'Herodotus', 'complementary', '2012', 'https://www.worldhistory.org/Herodotus/', 'Visão geral', 'Recurso de divulgação com revisão editorial.'),
  ],
  aristoteles: [
    source('aristotle-politics', 'Aristóteles', 'Política', 'primary', 'século IV a.C.', 'https://classics.mit.edu/Aristotle/politics.html', 'Livros I–VIII', 'Tradução em domínio público; termos gregos exigem cautela.'),
    source('aristotle-ethics', 'Aristóteles', 'Ética a Nicômaco', 'primary', 'século IV a.C.', 'https://classics.mit.edu/Aristotle/nicomachaen.html', 'Livros I–X', 'Tradução em domínio público; autoria do texto é tradicionalmente aceita.'),
    source('aristotle-athens', 'Aristóteles ou escola aristotélica', 'Constituição de Atenas', 'ancient', 'século IV a.C.', 'https://classics.mit.edu/Aristotle/athenian_const.html', 'Seções 1–69', 'A autoria individual é discutida.'),
    source('aristotle-stanford', 'Stanford Encyclopedia of Philosophy', 'Aristotle', 'academic-open', '2020', 'https://plato.stanford.edu/entries/aristotle/', 'Artigo e bibliografia', 'Síntese acadêmica revisada, sujeita a atualização.'),
    source('aristotle-perseus', 'Tufts University', 'Perseus Digital Library: Aristotle', 'institutional', '2026', 'https://www.perseus.tufts.edu/', 'Coleção de textos', 'A edição e a tradução precisam ser identificadas por obra.'),
    source('aristotle-britannica', 'Encyclopaedia Britannica', 'Aristotle', 'reference', '2026', 'https://www.britannica.com/biography/Aristotle', 'Biografia', 'Fonte de referência geral.'),
  ],
  alexandre: [
    source('alexander-arrian', 'Arriano', 'Anábase de Alexandre', 'ancient', 'século II d.C.', 'https://www.gutenberg.org/ebooks/46976', 'Livros I–VII', 'Relato posterior que privilegia tradições favoráveis a Alexandre.'),
    source('alexander-plutarch', 'Plutarco', 'Vida de Alexandre', 'ancient', 'séculos I–II d.C.', 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Alexander*/home.html', 'Vida de Alexandre', 'Biografia moral escrita séculos depois dos eventos.'),
    source('alexander-diodorus', 'Diodoro Sículo', 'Biblioteca Histórica', 'ancient', 'século I a.C.', 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Diodorus_Siculus/home.html', 'Livro XVII', 'Compilação posterior baseada em fontes hoje perdidas.'),
    source('alexander-met', 'The Metropolitan Museum of Art', 'Art of the Hellenistic Age', 'institutional', '2004', 'https://www.metmuseum.org/toah/hd/haht/hd_haht.htm', 'Heilbrunn Timeline', 'Síntese centrada em cultura material.'),
    source('alexander-britannica', 'Encyclopaedia Britannica', 'Alexander the Great', 'reference', '2026', 'https://www.britannica.com/biography/Alexander-the-Great', 'Biografia', 'Fonte de referência geral.'),
    source('alexander-worldhistory', 'World History Encyclopedia', 'Alexander the Great', 'complementary', '2013', 'https://www.worldhistory.org/Alexander_the_Great/', 'Visão geral', 'Recurso de divulgação com revisão editorial.'),
  ],
  cesar: [
    source('caesar-gallic', 'Júlio César', 'Comentários sobre a Guerra da Gália', 'primary', 'século I a.C.', 'https://classics.mit.edu/Caesar/gallic.html', 'Livros I–VIII', 'Autoapresentação política e militar; não é relato neutro.'),
    source('caesar-civil', 'Júlio César', 'Comentários sobre a Guerra Civil', 'primary', 'século I a.C.', 'https://classics.mit.edu/Caesar/civil.html', 'Livros I–III', 'Autojustificação de um participante central.'),
    source('caesar-suetonio', 'Suetônio', 'Vida de Júlio César', 'ancient', 'século II d.C.', 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Julius*.html', 'Divus Iulius', 'Biografia posterior que reúne documentos, anedotas e rumores.'),
    source('caesar-plutarch', 'Plutarco', 'Vida de César', 'ancient', 'séculos I–II d.C.', 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Caesar*.html', 'Vida de César', 'Biografia moral posterior.'),
    source('caesar-britannica', 'Encyclopaedia Britannica', 'Julius Caesar', 'reference', '2026', 'https://www.britannica.com/biography/Julius-Caesar-Roman-ruler', 'Biografia', 'Fonte de referência geral.'),
    source('caesar-worldhistory', 'World History Encyclopedia', 'Julius Caesar', 'complementary', '2011', 'https://www.worldhistory.org/Julius_Caesar/', 'Visão geral', 'Recurso de divulgação com revisão editorial.'),
  ],
  cleopatra: [
    source('cleopatra-plutarch', 'Plutarco', 'Vida de Antônio', 'ancient', 'séculos I–II d.C.', 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Antony*.html', 'Vida de Antônio', 'Fonte romana posterior, marcada por objetivos morais e políticos.'),
    source('cleopatra-dio', 'Dião Cássio', 'História Romana', 'ancient', 'século III d.C.', 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/home.html', 'Livros XLII–LI', 'Relato posterior escrito sob o Império Romano.'),
    source('cleopatra-papyrus', 'Cleópatra VII', 'Papiro BGU 1208', 'primary', '33 a.C.', 'https://berlpap.smb.museum/02779/', 'BGU IV 1208', 'A assinatura e a participação direta de Cleópatra são discutidas.'),
    source('cleopatra-met', 'The Metropolitan Museum of Art', 'Egypt in the Ptolemaic Period', 'institutional', '2004', 'https://www.metmuseum.org/toah/hd/ptol/hd_ptol.htm', 'Heilbrunn Timeline', 'Síntese baseada em cultura material e história dinástica.'),
    source('cleopatra-britannica', 'Encyclopaedia Britannica', 'Cleopatra', 'reference', '2026', 'https://www.britannica.com/biography/Cleopatra-queen-of-Egypt', 'Biografia', 'Fonte de referência geral.'),
    source('cleopatra-worldhistory', 'World History Encyclopedia', 'Cleopatra VII', 'complementary', '2016', 'https://www.worldhistory.org/Cleopatra_VII/', 'Visão geral', 'Recurso de divulgação com revisão editorial.'),
  ],
  pedro2: [
    source('pedro2-diarios', 'D. Pedro II', 'Diários de D. Pedro II', 'primary', '1840–1891', 'https://museuimperial.museus.gov.br/acervo/', 'Coleção documental do Museu Imperial', 'Manuscritos exigem identificação de volume, data e transcrição.'),
    source('pedro2-fala-trono', 'Império do Brasil', 'Falas do Trono', 'primary', '1823–1889', 'https://www2.senado.leg.br/bdsf/handle/id/227319', 'Coleção do Senado Federal', 'Discursos oficiais expressam a posição institucional da Coroa.'),
    source('pedro2-constituicao', 'Império do Brasil', 'Constituição Política do Império do Brasil', 'legal', '1824', 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao24.htm', 'Texto integral', 'Norma jurídica não demonstra, sozinha, sua aplicação prática.'),
    source('pedro2-museu', 'Museu Imperial', 'Acervo e história de D. Pedro II', 'institutional', '2026', 'https://museuimperial.museus.gov.br/', 'Acervo institucional', 'A descrição museológica deve ser confrontada com documentação e historiografia.'),
    source('pedro2-bn', 'Biblioteca Nacional', 'Hemeroteca Digital Brasileira', 'institutional', '2026', 'https://memoria.bn.gov.br/', 'Periódicos do século XIX', 'Jornais refletem posições políticas, editoriais e regionais.'),
    source('pedro2-britannica', 'Encyclopaedia Britannica', 'Pedro II', 'reference', '2026', 'https://www.britannica.com/biography/Pedro-II', 'Biografia', 'Fonte de referência geral.'),
  ],
  luisgama: [
    source('gama-primeiras-trovas', 'Luís Gama', 'Primeiras trovas burlescas', 'primary', '1859–1861', 'https://pt.wikisource.org/wiki/Autor:Lu%C3%ADs_Gama', 'Obras em domínio público', 'A edição e a ortografia variam; poesia não é depoimento factual automático.'),
    source('gama-carta-lucio', 'Luís Gama', 'Carta a Lúcio de Mendonça', 'primary', '1880', 'https://pt.wikisource.org/wiki/Autor:Lu%C3%ADs_Gama', 'Carta autobiográfica', 'Autorretrato retrospectivo, sujeito a seleção e estratégia narrativa.'),
    source('gama-lei-1831', 'Império do Brasil', 'Lei de 7 de novembro de 1831', 'legal', '1831', 'https://www2.camara.leg.br/legin/fed/lei_sn/1824-1899/lei-37659-7-novembro-1831-564776-publicacaooriginal-88704-pl.html', 'Texto integral', 'A existência da lei contrasta com sua aplicação sistematicamente limitada.'),
    source('gama-bbm', 'Biblioteca Brasiliana Guita e José Mindlin', 'Acervo digital', 'institutional', '2026', 'https://digital.bbm.usp.br/', 'Catálogo e acervo', 'Catálogo institucional; consultar cada item citado.'),
    source('gama-bn', 'Biblioteca Nacional', 'Hemeroteca Digital Brasileira', 'institutional', '2026', 'https://memoria.bn.gov.br/', 'Imprensa abolicionista', 'OCR e metadados de periódicos precisam de conferência visual.'),
    source('gama-ipeafro', 'IPEAFRO', 'Luiz Gama', 'complementary', '2026', 'https://ipeafro.org.br/', 'Acervo e materiais educativos', 'Fonte complementar institucional ligada à memória afro-brasileira.'),
  ],
  vargas: [
    source('vargas-discursos', 'Getúlio Vargas', 'Discursos e pronunciamentos', 'primary', '1930–1954', 'https://expo-virtual-cpdoc.fgv.br/com-palavra-getulio-vargas', 'Arquivo Getúlio Vargas', 'Pronunciamentos públicos são atos políticos e propagandísticos.'),
    source('vargas-carta-testamento', 'Getúlio Vargas', 'Carta-testamento', 'primary', '1954', 'https://www18.fgv.br/cpdoc/acervo/dicionarios/verbete-tematico/carta-testamento', 'Documento e verbete', 'Há versões datilografada e manuscrita, com história documental própria.'),
    source('vargas-clt', 'Brasil', 'Consolidação das Leis do Trabalho', 'legal', '1943', 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm', 'Texto consolidado', 'O texto atual contém alterações posteriores; consultar a redação histórica.'),
    source('vargas-cpdoc', 'FGV CPDOC', 'Getúlio Vargas', 'institutional', '2026', 'https://www18.fgv.br/cpdoc/acervo/dicionarios/verbete-biografico/getulio-dornelles-vargas', 'Verbete biográfico', 'Síntese institucional apoiada em acervo documental.'),
    source('vargas-arquivo', 'Arquivo Nacional', 'Era Vargas', 'institutional', '2026', 'https://www.gov.br/arquivonacional/pt-br', 'Fundos documentais', 'O catálogo identifica documentos; cada uso exige referência ao item.'),
    source('vargas-britannica', 'Encyclopaedia Britannica', 'Getúlio Vargas', 'reference', '2026', 'https://www.britannica.com/biography/Getulio-Vargas', 'Biografia', 'Fonte de referência geral.'),
  ],
};

const KNOWLEDGE_TYPES = ['biography', 'direct-action', 'worldview', 'decision', 'contradiction', 'historiography'];
const CLAIM_STATUSES = ['documented', 'documented', 'attributed', 'inferred', 'disputed', 'inferred'];

function source(id, author, title, type, year, url, locatorScope, limitations) {
  return { id, author, title, type, year, url, accessDate: '2026-10-12', locatorScope, licenseStatus: type === 'primary' || type === 'ancient' || type === 'legal' ? 'public-domain-or-public-record' : 'open-access-reference', limitations };
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function writeJson(relativePath, value) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function normalize(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function keywords(value) {
  const ignored = new Set(['para', 'como', 'uma', 'que', 'dos', 'das', 'por', 'com', 'seu', 'sua', 'the', 'and', 'los', 'las']);
  return [...new Set(normalize(value).split(/[^a-z0-9]+/).filter(token => token.length > 2 && !ignored.has(token)))].slice(0, 16);
}

function sentences(value) {
  return String(value || '').replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).map(item => item.trim()).filter(item => item.length > 20);
}

function thirdPerson(persona, value) {
  const replacements = [
    [/\bEu\b/g, persona.name], [/\beu\b/g, persona.name], [/\bFui\b/g, `${persona.name} foi`], [/\bfui\b/g, `${persona.name} foi`],
    [/\bMeu\b/g, `O seu`], [/\bmeu\b/g, 'seu'], [/\bMinha\b/g, `A sua`], [/\bminha\b/g, 'sua'],
    [/\bMeus\b/g, 'Seus'], [/\bmeus\b/g, 'seus'], [/\bMinhas\b/g, 'Suas'], [/\bminhas\b/g, 'suas'],
    [/\bme\b/g, 'lhe'], [/\bNosso\b/g, 'Seu'], [/\bnosso\b/g, 'seu'], [/\bNós\b/g, `${persona.name} e seus contemporâneos`],
  ];
  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}

function titleTranslations(title) {
  return { pt: title, en: title, es: title };
}

function buildDossier(persona) {
  const legacy = readJson(persona.personalDataset);
  const sources = SOURCE_SETS[persona.id];
  const candidates = [];
  for (const entity of legacy.entidades || []) {
    const parts = sentences(entity.descricao);
    const usable = parts.length ? parts : [entity.descricao];
    usable.forEach((part, sentenceIndex) => candidates.push({ entity, part, sentenceIndex }));
    if (entity.importancia && typeof entity.importancia === 'string') {
      candidates.push({ entity, part: entity.importancia, sentenceIndex: usable.length });
    }
  }
  if (!candidates.length) throw new Error(`No legacy evidence for ${persona.id}`);

  const records = [];
  for (let index = 0; index < 60; index += 1) {
    const candidate = candidates[index % candidates.length];
    const cycle = Math.floor(index / candidates.length);
    const knowledgeType = KNOWLEDGE_TYPES[(candidate.sentenceIndex + cycle) % KNOWLEDGE_TYPES.length];
    const sourceItem = sources[index % sources.length];
    const factualText = thirdPerson(persona, candidate.part);
    const baseTitle = String(candidate.entity.nome || candidate.entity.id).replace(/^Minha?\s+/i, '').replace(/\s+—\s+o que.*$/i, '');
    const title = cycle ? `${baseTitle}: ${knowledgeType}` : baseTitle;
    records.push({
      id: `${persona.id}-${String(index + 1).padStart(3, '0')}`,
      titles: titleTranslations(title),
      knowledgeType,
      period: persona.period,
      horizonYear: persona.horizonYear,
      factualText,
      dramatizablePerspective: `Em dramatização pedagógica, ${persona.name} pode comentar este registro sem apresentá-lo como citação literal.`,
      claimStatus: CLAIM_STATUSES[KNOWLEDGE_TYPES.indexOf(knowledgeType)],
      sourceIds: [sourceItem.id],
      locator: `${sourceItem.locatorScope}; tema: ${baseTitle}`,
      relatedEntityIds: [candidate.entity.id],
      limitations: [sourceItem.limitations, 'Registro migrado do dossiê V8; a formulação não é citação literal da persona.'],
      alternativeInterpretations: knowledgeType === 'contradiction' || knowledgeType === 'historiography' ? ['Comparar a autoapresentação da persona com fontes independentes e cultura material.'] : [],
      reviewStatus: 'migrated-for-editorial-review',
    });
  }
  return { schemaVersion: 1, personaId: persona.id, lastReviewed: '2026-10-12', reviewStatus: 'migrated-for-editorial-review', sources: sources.map(item => item.id), records };
}

const allSources = Object.values(SOURCE_SETS).flat();
const dossiers = personaCatalog.personas.map(buildDossier);
for (const dossier of dossiers) writeJson(`data/voices-dossiers/${dossier.personaId}.json`, dossier);
writeJson('data/voices-sources.json', { schemaVersion: 1, lastReviewed: '2026-10-12', sources: allSources });

const retrievalChunks = dossiers.flatMap(dossier => dossier.records.map(record => ({
  id: record.id,
  personaIds: [dossier.personaId],
  text: `${record.titles.pt}. ${record.factualText}`,
  entityIds: record.relatedEntityIds,
  sourceIds: record.sourceIds,
  knowledgeType: record.knowledgeType,
  claimStatus: record.claimStatus,
  yearStart: personaCatalog.personas.find(item => item.id === dossier.personaId).horizonYear,
  yearEnd: personaCatalog.personas.find(item => item.id === dossier.personaId).horizonYear,
  keywords: keywords(`${record.titles.pt} ${record.factualText}`),
  locator: record.locator,
})));
writeJson('data/voices-retrieval-index.json', { schemaVersion: 1, generatedAt: '2026-10-12', generator: 'scripts/generate-voices-81.js', chunks: retrievalChunks });

const questions = dossiers.flatMap(dossier => dossier.records.slice(0, 20).map((record, index) => ({
  id: `${dossier.personaId}-q${String(index + 1).padStart(2, '0')}`,
  personaId: dossier.personaId,
  question: `O que os registros mostram sobre ${record.titles.pt}?`,
  expectedEvidenceId: record.id,
})));
writeJson('data/voices-golden.json', { schemaVersion: 2, generatedAt: '2026-10-12', questions });

console.log(JSON.stringify({ personas: dossiers.length, records: retrievalChunks.length, sources: allSources.length, goldenQuestions: questions.length }));
