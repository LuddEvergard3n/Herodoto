#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const golden = JSON.parse(fs.readFileSync(path.join(root, 'data', 'voices-golden.json'), 'utf8'));
const stopwords = new Set(['a','o','as','os','de','da','do','das','dos','e','em','um','uma','que','como','por','para','com','sem','sobre','foi','era','ser','ter','seu','sua','meu','minha']);
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const tokens = value => normalize(value).split(/[^a-z0-9]+/).filter(token => token.length > 1 && !stopwords.has(token));
const index = JSON.parse(fs.readFileSync(path.join(root, 'data', 'voices-retrieval-index.json'), 'utf8'));
const corpus = personaId => index.chunks.filter(chunk => chunk.personaIds.includes(personaId));

function rank(personaId, question) {
  const query = tokens(question);
  return corpus(personaId).map(entity => {
    const title = normalize(entity.text.split('.')[0]);
    const body = normalize(`${entity.text} ${(entity.keywords || []).join(' ')}`);
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
if (rate < 0.9) process.exitCode = 1;
