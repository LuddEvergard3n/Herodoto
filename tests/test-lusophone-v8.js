'use strict';

const fs = require('fs');
const path = require('path');
const A = require('./assert');

const root = path.join(__dirname, '..');
const slugs = [
  'portugal-formacao-medieval', 'portugal-expansao-estado-india',
  'imperio-atlantico-portugues', 'portugal-uniao-iberica-restauracao',
  'portugal-reformas-pombalinas', 'portugal-liberalismo-republica',
  'portugal-estado-novo-cravos', 'kongo-angola-precolonial',
  'angola-colonial-independencia', 'mocambique-historia',
  'africa-lusofona-cabral', 'timor-leste',
];
const documents = slugs.map(slug => JSON.parse(fs.readFileSync(path.join(root, 'data', `dados-${slug}.json`), 'utf8')));

A.suite('Mundo Lusófono V8 — inventory', () => {
  A.it('contains 12 datasets and 108 entities', () => {
    A.equal(documents.length, 12);
    A.equal(documents.reduce((total, document) => total + document.entidades.length, 0), 108);
  });

  A.it('uses unique deterministic entity IDs', () => {
    const ids = documents.flatMap(document => document.entidades.map(entity => entity.id));
    A.equal(new Set(ids).size, ids.length);
    A.ok(ids.every(id => /^[a-z0-9-]+-\d{2}$/.test(id)));
  });
});

A.suite('Mundo Lusófono V8 — editorial contract', () => {
  A.it('has review metadata and resolvable sources', () => {
    for (const document of documents) {
      A.ok(/^\d{4}-\d{2}-\d{2}$/.test(document.meta.lastReviewed));
      const sourceIds = new Set(document.sources.map(source => source.id));
      for (const entity of document.entidades) A.ok(entity.sourceIds.every(id => sourceIds.has(id)));
    }
  });

  A.it('provides Portuguese, English and Spanish content', () => {
    for (const entity of documents.flatMap(document => document.entidades)) {
      A.ok(entity.nome && entity.nome_en && entity.nome_es);
      A.ok(entity.descricao && entity.descricao_en && entity.descricao_es);
      A.ok(entity.importancia && entity.importancia_en && entity.importancia_es);
    }
  });

  A.it('keeps temporal, territorial and perspective fields', () => {
    for (const entity of documents.flatMap(document => document.entidades)) {
      A.ok(Number.isFinite(entity.inicio));
      A.ok(entity.temporalPrecision && entity.territorio && entity.type);
      A.ok(entity.perspectives.length >= 2);
    }
  });
});
