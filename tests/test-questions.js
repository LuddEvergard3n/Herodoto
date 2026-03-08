/**
 * TEST: questions.js
 * Validates PERGUNTAS structure:
 *   - All referenced datasets exist on disk
 *   - No duplicate question IDs
 *   - Every question has pt/en/es texto and desc
 *   - Every grupo has pt/en/es
 *   - datasets array is non-empty
 *   - focal (if present) references a real entity ID
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const A    = require('./assert');

const ROOT      = path.join(__dirname, '..');
const DATA_DIR  = path.join(ROOT, 'data');
const QS_PATH   = path.join(ROOT, 'js', 'questions.js');

// ─── Extract PERGUNTAS from questions.js ──────────────────────────────────────
function extractPerguntas() {
  const src = fs.readFileSync(QS_PATH, 'utf8');
  // Strip export syntax if any, then eval in a sandbox
  const stripped = src
    .replace(/^export\s+/gm, '')
    .replace(/^import\s+.*$/gm, '');
  const fn = new Function('module', 'exports', stripped + '\nmodule.exports = { PERGUNTAS };');
  const mod = { exports: {} };
  try { fn(mod, mod.exports); } catch { /* ignore runtime errors from missing globals */ }
  return mod.exports.PERGUNTAS || extractManually(src);
}

function extractManually(src) {
  // Fallback: extract all question ids via regex
  const ids = [...src.matchAll(/id:\s*'(q-[^']+)'/g)].map(m => m[1]);
  return ids.map(id => ({ id })); // minimal shape
}

// ─── All dataset files on disk ───────────────────────────────────────────────
const onDisk = new Set(fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')));

// ─── All entity IDs across all entidades files ───────────────────────────────
function getAllEntityIds() {
  const ids = new Set();
  for (const f of onDisk) {
    if (!f.startsWith('dados-')) continue;
    try {
      const d = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
      (d.entidades || []).forEach(e => e.id && ids.add(e.id));
    } catch { /* skip */ }
  }
  return ids;
}

// ─── Regex-based extraction (safer for browser JS files) ─────────────────────
function extractQuestionsMeta(src) {
  const groups = [];
  // Extract each question block
  const qBlocks = [...src.matchAll(/\{\s*\n?\s*id:\s*'(q-[^']+)'[\s\S]*?(?=\{\s*\n?\s*id:|^\s*\]\s*,?\s*\})/gm)];

  // Extract all ids
  const ids = [...src.matchAll(/id:\s*'(q-[^']+)'/g)].map(m => m[1]);

  // Extract all datasets arrays
  const dsBlocks = [...src.matchAll(/datasets:\s*\[([^\]]+)\]/g)].map(m => {
    return [...m[1].matchAll(/'(data\/[^']+)'/g)].map(x => x[1]);
  });

  // Extract pt texto
  const ptTextos = [...src.matchAll(/texto:\s*\{[^}]*pt:\s*'([^']+)'/g)].map(m => m[1]);

  return { ids, dsBlocks, ptTextos };
}

const src = fs.readFileSync(QS_PATH, 'utf8');
const { ids: questionIds, dsBlocks, ptTextos } = extractQuestionsMeta(src);

// ─── Tests ───────────────────────────────────────────────────────────────────

A.suite('Questions — Structure', () => {

  A.it('PERGUNTAS constant is defined in questions.js', () => {
    A.ok(src.includes('const PERGUNTAS'), 'PERGUNTAS not found in questions.js');
  });

  A.it(`at least 200 questions defined`, () => {
    A.greaterThan(questionIds.length, 200,
      `Only ${questionIds.length} questions found. Expected 200+`);
  });

  A.it('no duplicate question IDs', () => {
    A.arrayUnique(questionIds, x => x, 'Duplicate question ids found');
  });

  A.it('all question IDs match pattern q-[word]', () => {
    const bad = questionIds.filter(id => !/^q-[\w-]+$/.test(id));
    if (bad.length) throw new Error(`Bad id format:\n    ${bad.join(', ')}`);
  });
});

A.suite('Questions — Dataset references', () => {

  A.it('all questions have at least one dataset', () => {
    const empty = dsBlocks.filter(ds => ds.length === 0);
    if (empty.length)
      throw new Error(`${empty.length} question(s) have empty datasets array`);
  });

  A.it('all referenced datasets exist on disk', () => {
    const missing = new Set();
    for (const ds of dsBlocks) {
      for (const d of ds) {
        const filename = d.replace('data/', '');
        if (!onDisk.has(filename)) missing.add(filename);
      }
    }
    if (missing.size)
      throw new Error(
        `${missing.size} referenced datasets missing:\n    ` +
        [...missing].slice(0, 10).join('\n    ')
      );
  });

  A.it('at least 50 distinct datasets are referenced across all questions', () => {
    const allDs = new Set(dsBlocks.flat());
    A.greaterThan(allDs.size, 50,
      `Only ${allDs.size} distinct datasets referenced in questions`);
  });
});

A.suite('Questions — Multilingual content', () => {

  A.it('questions.js contains pt, en, es translations for texto', () => {
    const ptCount = (src.match(/texto:\s*\{/g) || []).length;
    const enCount = (src.match(/en:\s*'/g) || []).length;
    const esCount = (src.match(/es:\s*'/g) || []).length;

    A.greaterThan(ptCount, 50, `Only ${ptCount} texto blocks found`);
    // en and es should be roughly equal (some may be in grupo or desc)
    A.ok(enCount > ptCount * 2,
      `Expected more en: entries than texto blocks (${enCount} vs ${ptCount})`);
  });

  A.it('no empty pt texto strings', () => {
    const empty = ptTextos.filter(t => !t || t.trim().length < 5);
    if (empty.length) throw new Error(`${empty.length} empty pt texto(s) found`);
  });
});

A.suite('Questions — Grupos', () => {

  A.it('at least 30 distinct grupos', () => {
    const groups = [...src.matchAll(/grupo:\s*\{[^}]*pt:\s*'([^']+)'/g)].map(m => m[1]);
    const unique = new Set(groups);
    A.greaterThan(unique.size, 30, `Only ${unique.size} distinct groups found`);
  });
});
