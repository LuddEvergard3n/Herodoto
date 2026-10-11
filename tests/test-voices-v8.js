'use strict';

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const A = require('./assert');

const root = path.join(__dirname, '..');
const engine = fs.readFileSync(path.join(root, 'js', 'voices-grounded.js'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'js', 'semantic-worker.js'), 'utf8');
const page = fs.readFileSync(path.join(root, 'vozes-historia-v8.html'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data', 'model-manifest.json'), 'utf8'));
const golden = JSON.parse(fs.readFileSync(path.join(root, 'data', 'voices-golden.json'), 'utf8'));

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
    A.ok(worker.includes(manifest.revision));
    A.equal(manifest.sha256.length, 64);
    A.equal(manifest.optional, true);
    A.equal(manifest.fallback, 'lexical');
    A.ok(engine.includes('semanticClient?.rank'));
  });

  A.it('passes the 80-question persona retrieval benchmark', () => {
    A.equal(golden.questions.length, 80);
    const output = childProcess.execFileSync(process.execPath, [path.join(root, 'scripts', 'benchmark-voices.js')], { encoding: 'utf8' });
    const result = JSON.parse(output);
    A.ok(result.top5Rate >= 0.85, `Top-5 retrieval rate was ${result.top5Rate}`);
  });

  A.it('page discloses pedagogical dramatization', () => {
    A.ok(page.includes('dramatização pedagógica'));
  });
});
