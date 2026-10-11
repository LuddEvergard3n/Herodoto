#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const golden = JSON.parse(fs.readFileSync(path.join(root, 'data', 'voices-golden.json'), 'utf8'));
const stopwords = new Set(['a','o','as','os','de','da','do','das','dos','e','em','um','uma','que','como','por','para','com','sem','sobre','foi','era','ser','ter','seu','sua','meu','minha']);
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const tokens = value => normalize(value).split(/[^a-z0-9]+/).filter(token => token.length > 1 && !stopwords.has(token));
const corpora = new Map();

function corpus(personaId) {
  if (!corpora.has(personaId)) {
    const document = JSON.parse(fs.readFileSync(path.join(root, 'data', 'vozes', `${personaId}.json`), 'utf8'));
    corpora.set(personaId, document.entidades || []);
  }
  return corpora.get(personaId);
}

function rank(personaId, question) {
  const query = tokens(question);
  return corpus(personaId).map(entity => {
    const title = normalize(entity.nome);
    const body = normalize(`${entity.descricao || ''} ${entity.importancia || ''} ${(entity.tags || []).join(' ')}`);
    const score = query.reduce((total, token) => total + (title.includes(token) ? 4 : 0) + (body.includes(token) ? 1 : 0), 2);
    return { id: entity.id, score };
  }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

let hits = 0;
for (const item of golden.questions) {
  if (rank(item.personaId, item.question).slice(0, 5).some(result => result.id === item.expectedEvidenceId)) hits += 1;
}
const rate = hits / golden.questions.length;
console.log(JSON.stringify({ questions: golden.questions.length, top5Hits: hits, top5Rate: rate }));
if (rate < 0.85) process.exitCode = 1;
