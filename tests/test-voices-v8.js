'use strict';

const fs = require('fs');
const path = require('path');
const A = require('./assert');

const root = path.join(__dirname, '..');
const engine = fs.readFileSync(path.join(root, 'js', 'voices-grounded.js'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'js', 'semantic-worker.js'), 'utf8');
const page = fs.readFileSync(path.join(root, 'vozes-historia-v8.html'), 'utf8');

A.suite('Voices v8 — grounded engine', () => {
  A.it('preserves all eight personas', () => {
    for (const id of ['herodoto','aristoteles','alexandre','cesar','cleopatra','pedro2','luisgama','vargas']) {
      A.ok(engine.includes(`${id}:`), `Missing persona behavior: ${id}`);
    }
  });

  A.it('exposes the planned public interface', () => {
    A.ok(engine.includes('export async function preparePersona'));
    A.ok(engine.includes('export async function answerQuestion'));
    A.ok(engine.includes('export async function generateGroundedAnswer'));
  });

  A.it('returns evidence and limitations', () => {
    A.ok(engine.includes('evidence:'));
    A.ok(engine.includes('sourceIds:'));
    A.ok(engine.includes('limitations:'));
  });

  A.it('contains no WebLLM dependency', () => {
    A.ok(!engine.toLowerCase().includes('webllm'));
    A.ok(!worker.toLowerCase().includes('webllm'));
  });

  A.it('semantic model is version-pinned and optional', () => {
    A.ok(worker.includes('@huggingface/transformers@4.3.1'));
    A.ok(engine.includes('semanticClient?.rank'));
  });

  A.it('page discloses pedagogical dramatization', () => {
    A.ok(page.includes('dramatização pedagógica'));
  });
});
