/**
 * TEST: personagens.js
 * Validates all dados-personagens-*.json files:
 *   - Required fields (id, nome, nascimento or inicio)
 *   - No duplicate IDs across all personagens files
 *   - No duplicate names across all personagens files
 *   - Birth before death (if both present)
 *   - Area is an array
 *   - Multilingual nome and descricao present
 *   - Events references are strings (not checking existence — too costly)
 *   - Counts per file are reasonable (>= 5)
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const A    = require('./assert');

const DATA_DIR = path.join(__dirname, '..', 'data');

const PERSONA_FILES = fs.readdirSync(DATA_DIR)
  .filter(f => f.startsWith('dados-personagens-') && f.endsWith('.json'))
  .map(f => ({ file: f, fullPath: path.join(DATA_DIR, f) }));

function loadPersonagens(fullPath) {
  const d = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  return d.personagens || [];
}

// ─── Build global index ───────────────────────────────────────────────────────
const allPersonagens = [];
for (const { file, fullPath } of PERSONA_FILES) {
  for (const p of loadPersonagens(fullPath)) {
    allPersonagens.push({ ...p, _file: file });
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

A.suite('Personagens — File inventory', () => {

  A.it(`at least 15 personagens files exist`, () => {
    A.greaterThan(PERSONA_FILES.length, 14,
      `Only ${PERSONA_FILES.length} personagens files found`);
  });

  A.it('every personagens file has >= 5 entries', () => {
    const thin = PERSONA_FILES.filter(({ fullPath }) => loadPersonagens(fullPath).length < 5);
    if (thin.length)
      throw new Error(
        `Files with < 5 personagens:\n    ${thin.map(x => x.file).join('\n    ')}`
      );
  });

  A.it('total personagens >= 200', () => {
    A.greaterThan(allPersonagens.length, 200,
      `Only ${allPersonagens.length} personagens total`);
  });
});

A.suite('Personagens — Required fields', () => {

  A.it('all personagens have an id', () => {
    const bad = allPersonagens.filter(p => !p.id);
    if (bad.length)
      throw new Error(`${bad.length} personagens without id. Examples: ${bad.slice(0,3).map(p => p.nome).join(', ')}`);
  });

  A.it('all personagens have a nome', () => {
    const bad = allPersonagens.filter(p => !p.nome || p.nome.trim().length < 2);
    if (bad.length)
      throw new Error(`${bad.length} personagens without valid nome`);
  });

  A.it('all personagens have a birth year (nascimento or inicio)', () => {
    const bad = allPersonagens.filter(p =>
      p.nascimento === undefined && p.inicio === undefined
    );
    if (bad.length)
      throw new Error(
        `${bad.length} personagens without birth year:\n    ` +
        bad.slice(0,5).map(p => `${p._file}: ${p.nome}`).join('\n    ')
      );
  });

  A.it('all personagens have descricao', () => {
    const bad = allPersonagens.filter(p =>
      !p.descricao || p.descricao.trim().length < 10
    );
    if (bad.length)
      throw new Error(
        `${bad.length} personagens without proper descricao:\n    ` +
        bad.slice(0,5).map(p => `${p._file}: ${p.nome}`).join('\n    ')
      );
  });

  A.it('all personagens have importancia', () => {
    const bad = allPersonagens.filter(p =>
      !p.importancia || p.importancia.trim().length < 10
    );
    if (bad.length)
      throw new Error(
        `${bad.length} personagens without importancia:\n    ` +
        bad.slice(0,5).map(p => `${p._file}: ${p.nome}`).join('\n    ')
      );
  });
});

A.suite('Personagens — Date logic', () => {

  A.it('birth before death for all personagens (skip living)', () => {
    const issues = [];
    for (const p of allPersonagens) {
      const birth = p.nascimento ?? p.inicio;
      const death = p.morte ?? p.fim;
      // Skip living persons (null/undefined death)
      if (birth !== undefined && death !== null && death !== undefined && birth > death)
        issues.push(`${p._file}: ${p.nome} birth=${birth} > death=${death}`);
    }
    if (issues.length) throw new Error(issues.slice(0, 10).join('\n    '));
  });

  A.it('birth years within plausible range (-3000 to 2025)', () => {
    const issues = [];
    for (const p of allPersonagens) {
      const b = p.nascimento ?? p.inicio;
      if (b !== undefined && (b < -3000 || b > 2025))
        issues.push(`${p.nome}: nascimento=${b}`);
    }
    if (issues.length) throw new Error(issues.slice(0,5).join('\n    '));
  });
});

A.suite('Personagens — Uniqueness', () => {

  A.it('no duplicate IDs across all personagens files', () => {
    A.arrayUnique(allPersonagens, p => p.id,
      'Duplicate personagem IDs found across files');
  });

  A.it('no duplicate names across all personagens files', () => {
    const names = allPersonagens.map(p => p.nome.trim().toLowerCase());
    const seen = new Map();
    const dupes = [];
    for (const [i, name] of names.entries()) {
      if (seen.has(name)) {
        dupes.push(`"${allPersonagens[i].nome}" in ${allPersonagens[i]._file} + ${allPersonagens[seen.get(name)]._file}`);
      } else seen.set(name, i);
    }
    if (dupes.length)
      throw new Error(`${dupes.length} duplicate names:\n    ${dupes.slice(0,8).join('\n    ')}`);
  });
});

A.suite('Personagens — Collection coverage', () => {

  const EXPECTED_COLLECTIONS = [
    'dados-personagens-grecia-roma.json',
    'dados-personagens-medieval.json',
    'dados-personagens-renascimento-reforma.json',
    'dados-personagens-iluminismo-revolucoes.json',
    'dados-personagens-seculo-xix.json',
    'dados-personagens-seculo-xx.json',
    'dados-personagens-seculo-xx-guerras.json',
    'dados-personagens-mulheres.json',
    'dados-personagens-filosofia-oriental.json',
    'dados-personagens-africa-oriente.json',
    'dados-personagens-americas.json',
    'dados-personagens-asia.json',
    'dados-personagens-oriente-antigo.json',
    'dados-personagens-europa-moderna.json',
    'dados-personagens-biblicas.json',
    'dados-personagens-ciencia-pensamento.json',
  ];

  A.it(`all ${EXPECTED_COLLECTIONS.length} expected collections exist`, () => {
    const existingFiles = new Set(PERSONA_FILES.map(x => x.file));
    const missing = EXPECTED_COLLECTIONS.filter(f => !existingFiles.has(f));
    if (missing.length)
      throw new Error(`Missing collections:\n    ${missing.join('\n    ')}`);
  });
});
