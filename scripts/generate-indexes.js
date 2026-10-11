#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'data');
const files = fs.readdirSync(dataDir).filter(name => /^dados-.*\.json$/.test(name)).sort();
const catalog = [];
const timeline = [];
const seen = new Set();

for (const file of files) {
  const relative = `data/${file}`;
  const document = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
  const entities = document.entidades || [];
  catalog.push({
    id: file.replace(/^dados-|\.json$/g, ''),
    path: relative,
    title: document.meta?.tema || document.tema || file.replace(/^dados-|\.json$/g, '').replaceAll('-', ' '),
    entityCount: entities.length,
  });
  for (const entity of entities) {
    if (!entity.id || seen.has(entity.id) || !Number.isFinite(Number(entity.inicio))) continue;
    seen.add(entity.id);
    timeline.push({
      id: entity.id,
      datasetId: relative,
      collection: document.meta?.collection || null,
      nome: entity.nome,
      nome_en: entity.nome_en,
      nome_es: entity.nome_es,
      descricao: String(entity.descricao || '').slice(0, 420),
      importancia: String(entity.importancia || '').slice(0, 280),
      inicio: Number(entity.inicio),
      fim: entity.fim == null ? null : Number(entity.fim),
      type: entity.type || entity.tipo || 'political',
      tipo: entity.tipo,
      region: entity.region || 'Other',
      tags: Array.isArray(entity.tags) ? entity.tags.slice(0, 8) : [],
    });
  }
}

timeline.sort((a, b) => a.inicio - b.inicio || a.id.localeCompare(b.id));
fs.writeFileSync(path.join(dataDir, 'dataset-catalog.json'), `${JSON.stringify({ version: 1, datasets: catalog }, null, 2)}\n`);
fs.writeFileSync(path.join(dataDir, 'timeline-index.json'), `${JSON.stringify({ version: 1, generatedFrom: files.length, entities: timeline }, null, 2)}\n`);
console.log(`Generated ${catalog.length} dataset records and ${timeline.length} timeline entities.`);
