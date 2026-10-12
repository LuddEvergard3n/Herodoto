'use strict';

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const A = require('./assert');

const root = path.join(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const json = relative => JSON.parse(read(relative));
const engine = read('js/voices-grounded.js');
const runtime = read('js/voices-runtime.js');
const worker = read('js/voices-runtime-worker.js');
const page = read('vozes-historia-v8.html');
const personas = json('data/voices-personas.json').personas;
const sources = json('data/voices-sources.json').sources;
const index = json('data/voices-retrieval-index.json').chunks;
const models = json('data/voices-models.json').models;
const golden = json('data/voices-golden.json');
const sourceIds = new Set(sources.map(source => source.id));

A.suite('Voices 8.1 — grounded generative runtime', () => {
  A.it('preserves the eight validated personas outside JavaScript', () => {
    A.equal(personas.length, 8);
    A.arrayUnique(personas, persona => persona.id);
    personas.forEach(persona => A.hasFields(persona, ['id','name','horizonYear','knowledgeCutoff','allowedDatasets','style','pedagogicalStrategy','anachronismTerms','prohibitedClaims','reviewStatus','lastReviewed'], persona.id));
  });

  A.it('provides at least 60 dossier records for every persona', () => {
    personas.forEach(persona => {
      const dossier = json(`data/voices-dossiers/${persona.id}.json`);
      A.ok(dossier.records.length >= 60, `${persona.id} has ${dossier.records.length} records`);
      A.arrayUnique(dossier.records, record => record.id);
      dossier.records.forEach(record => {
        A.hasFields(record, ['id','titles','knowledgeType','period','horizonYear','factualText','dramatizablePerspective','claimStatus','sourceIds','locator','relatedEntityIds','limitations','reviewStatus'], record.id);
        A.hasFields(record.titles, ['pt','en','es'], record.id);
        record.sourceIds.forEach(id => A.ok(sourceIds.has(id), `${record.id} references missing source ${id}`));
      });
    });
    A.equal(index.length, 480);
    A.arrayUnique(index, chunk => chunk.id);
  });

  A.it('provides six traceable sources for every persona', () => {
    A.equal(sources.length, 48);
    A.arrayUnique(sources, source => source.id);
    sources.forEach(source => A.hasFields(source, ['id','author','title','type','year','url','accessDate','locatorScope','licenseStatus','limitations'], source.id));
  });

  A.it('publishes no local library paths', () => {
    const published = [read('data/voices-personas.json'), read('data/voices-sources.json'), read('data/voices-retrieval-index.json'), ...personas.map(persona => read(`data/voices-dossiers/${persona.id}.json`))].join('\n');
    A.ok(!/[A-Z]:\\|Pasta com Pastass|\\Livros\\/i.test(published));
  });

  A.it('exposes the complete public runtime interface', () => {
    for (const name of ['preparePersona','answerQuestion','generateGroundedAnswer','prepareVoiceRuntime','getVoiceRuntimeStatus','cancelVoiceRuntimePreparation','clearVoiceModelCache']) {
      A.ok(engine.includes(name), `Missing API ${name}`);
    }
    A.ok(engine.includes('runtimeTier'));
    A.ok(engine.includes('generationStatus'));
    A.ok(engine.includes('groundingStatus'));
  });

  A.it('pins both optional models and keeps enhanced manual', () => {
    A.equal(models.lite.sizeBytes, 117266133);
    A.equal(models.enhanced.sizeBytes, 483003582);
    A.equal(models.lite.sha256.length, 64);
    A.equal(models.enhanced.sha256.length, 64);
    A.equal(models.lite.automatic, true);
    A.equal(models.enhanced.automatic, false);
    A.ok(worker.includes('@huggingface/transformers@4.3.1'));
    A.ok(runtime.includes("effectiveType"));
    A.ok(runtime.includes("saveData"));
    A.ok(runtime.includes("navigator.storage"));
    A.ok(runtime.includes("navigator.deviceMemory"));
  });

  A.it('keeps deterministic fallback and validates generated details', () => {
    A.ok(engine.includes('unsupportedDetails'));
    A.ok(engine.includes("'deterministic_fallback'"));
    A.ok(engine.includes('attempt < 2'));
    A.ok(engine.includes('historical_horizon'));
    A.ok(!worker.toLowerCase().includes('webllm'));
  });

  A.it('passes the 160-question lexical retrieval benchmark', () => {
    A.equal(golden.questions.length, 160);
    const output = childProcess.execFileSync(process.execPath, [path.join(root, 'scripts', 'benchmark-voices.js')], { encoding: 'utf8' });
    const result = JSON.parse(output);
    A.ok(result.top5Rate >= 0.9, `Top-5 retrieval rate was ${result.top5Rate}`);
  });

  A.it('discloses dramatization, model sizes, progress and cancellation', () => {
    A.ok(page.includes('dramatização pedagógica'));
    A.ok(page.includes('117 MB'));
    A.ok(page.includes('483 MB'));
    A.ok(page.includes('runtime-progress'));
    A.ok(page.includes('cancel-runtime'));
  });
});
