#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const personas = ['herodoto', 'aristoteles', 'alexandre', 'cesar', 'cleopatra', 'pedro2', 'luisgama', 'vargas'];
const questions = personas.flatMap(persona => {
  const document = JSON.parse(fs.readFileSync(path.join(root, 'data', 'vozes', `${persona}.json`), 'utf8'));
  return document.entidades.slice(0, 10).map(entity => ({
    personaId: persona,
    question: `O que os registros mostram sobre ${entity.nome}?`,
    expectedEvidenceId: entity.id,
  }));
});

if (questions.length !== 80) throw new Error(`Esperadas 80 perguntas douradas; encontradas ${questions.length}.`);
fs.writeFileSync(path.join(root, 'data', 'voices-golden.json'), `${JSON.stringify({ version: 1, generatedFrom: 'data/vozes/*.json', questions }, null, 2)}\n`);
console.log(`Generated ${questions.length} golden questions.`);
