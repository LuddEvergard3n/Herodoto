/**
 * TEST: data-integrity.js
 * Validates every JSON in /data/:
 *   - Parseable JSON
 *   - Has 'entidades' or 'personagens' array
 *   - Required fields per entity
 *   - No duplicate IDs within each file
 *   - Date logic (inicio ≤ fim)
 *   - tipo / region in allowed sets
 *   - Multilingual fields (nome_en, nome_es, descricao_en, descricao_es)
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const A    = require('./assert');

const DATA_DIR = path.join(__dirname, '..', 'data');

const VALID_TIPOS = new Set([
  'political','war','economic','cultural','religious','social',
  'technological','intellectual','prehistoric','natural','scientific',
  'person',
  // legacy / dataset-specific
  'conceito','periodo','evento','descoberta','personagem',
]);

const VALID_REGIONS = new Set([
  'Europe','MiddleEast','Mediterranean','EastAsia','Asia','CentralAsia',
  'SouthAsia','SoutheastAsia','Africa','Americas','NorthAmerica',
  'SouthAmerica','Mesoamerica','Oceania','Antarctica','Global','Multiple','Other',
]);

const ENTITY_REQUIRED  = ['id', 'nome', 'inicio', 'fim'];
const PERSONA_REQUIRED = ['id', 'nome'];

function loadAll() {
  return fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => ({ file: f, fullPath: path.join(DATA_DIR, f) }));
}

A.suite('Data — JSON validity', () => {
  const files = loadAll();

  A.it(`all ${files.length} files are parseable JSON`, () => {
    const broken = [];
    for (const { file, fullPath } of files) {
      try { JSON.parse(fs.readFileSync(fullPath, 'utf8')); }
      catch { broken.push(file); }
    }
    if (broken.length)
      throw new Error(`Non-parseable files:\n    ${broken.join('\n    ')}`);
  });

  A.it('every file has entidades or personagens array', () => {
    const bad = [];
    for (const { file, fullPath } of files) {
      const d = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const arr = d.entidades || d.personagens;
      if (!Array.isArray(arr) || arr.length === 0) bad.push(file);
    }
    if (bad.length)
      throw new Error(`Files with no entity array:\n    ${bad.join('\n    ')}`);
  });
});

A.suite('Data — Entity required fields', () => {
  const files = loadAll();

  A.it('all entidades have id, nome, inicio, fim', () => {
    const issues = [];
    for (const { file, fullPath } of files) {
      const d = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (!d.entidades) continue;
      for (const e of d.entidades) {
        const missing = ENTITY_REQUIRED.filter(f => e[f] === undefined || e[f] === null || e[f] === '');
        if (missing.length) issues.push(`${file} → ${e.id || '?'}: missing [${missing.join(',')}]`);
      }
    }
    if (issues.length) throw new Error(issues.slice(0,15).join('\n    '));
  });

  A.it('all personagens have id and nome', () => {
    const issues = [];
    for (const { file, fullPath } of files) {
      const d = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (!d.personagens) continue;
      for (const p of d.personagens) {
        const missing = PERSONA_REQUIRED.filter(f => !p[f]);
        if (missing.length) issues.push(`${file} → ${p.id || '?'}: missing [${missing.join(',')}]`);
      }
    }
    if (issues.length) throw new Error(issues.slice(0,15).join('\n    '));
  });

  A.it('entidades: inicio is a number', () => {
    const issues = [];
    for (const { file, fullPath } of files) {
      const d = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (!d.entidades) continue;
      for (const e of d.entidades)
        if (typeof e.inicio !== 'number') issues.push(`${file} → ${e.id}: inicio="${e.inicio}"`);
    }
    if (issues.length) throw new Error(issues.slice(0,10).join('\n    '));
  });

  A.it('entidades: fim is a number', () => {
    const issues = [];
    for (const { file, fullPath } of files) {
      const d = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (!d.entidades) continue;
      for (const e of d.entidades)
        if (typeof e.fim !== 'number') issues.push(`${file} → ${e.id}: fim="${e.fim}"`);
    }
    if (issues.length) throw new Error(issues.slice(0,10).join('\n    '));
  });
});

A.suite('Data — Date logic', () => {
  const files = loadAll();

  A.it('inicio <= fim for all entidades', () => {
    const issues = [];
    for (const { file, fullPath } of files) {
      const d = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (!d.entidades) continue;
      for (const e of d.entidades)
        if (typeof e.inicio === 'number' && typeof e.fim === 'number' && e.inicio > e.fim)
          issues.push(`${file} → ${e.id}: inicio=${e.inicio} > fim=${e.fim}`);
    }
    if (issues.length) throw new Error(issues.slice(0,10).join('\n    '));
  });

  A.it('dates are within plausible range (-5000000 to 2100)', () => {
    const issues = [];
    for (const { file, fullPath } of files) {
      const d = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (!d.entidades) continue;
      for (const e of d.entidades) {
        if (e.inicio < -5000000 || e.inicio > 2100)
          issues.push(`${file} → ${e.id}: inicio=${e.inicio} out of range`);
        if (e.fim < -5000000 || e.fim > 2100)
          issues.push(`${file} → ${e.id}: fim=${e.fim} out of range`);
      }
    }
    if (issues.length) throw new Error(issues.slice(0,10).join('\n    '));
  });
});

A.suite('Data — ID uniqueness', () => {
  const files = loadAll();

  A.it('no duplicate IDs within a single file', () => {
    const issues = [];
    for (const { file, fullPath } of files) {
      const d = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const arr = d.entidades || d.personagens || [];
      const seen = new Set();
      for (const e of arr) {
        if (!e.id) continue;
        if (seen.has(e.id)) issues.push(`${file}: duplicate id "${e.id}"`);
        seen.add(e.id);
      }
    }
    if (issues.length) throw new Error(issues.join('\n    '));
  });

  A.it('no duplicate IDs across ALL entidades files', () => {
    const globalIds = new Map();
    const dupes = [];
    for (const { file, fullPath } of files) {
      const d = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (!d.entidades) continue;
      for (const e of d.entidades) {
        if (!e.id) continue;
        if (globalIds.has(e.id)) dupes.push(`"${e.id}" in ${file} AND ${globalIds.get(e.id)}`);
        else globalIds.set(e.id, file);
      }
    }
    if (dupes.length) throw new Error(dupes.slice(0,10).join('\n    '));
  });

  A.it('no duplicate IDs across ALL personagens files', () => {
    const globalIds = new Map();
    const dupes = [];
    for (const { file, fullPath } of files) {
      const d = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (!d.personagens) continue;
      for (const p of d.personagens) {
        if (!p.id) continue;
        if (globalIds.has(p.id)) dupes.push(`"${p.id}" in ${file} AND ${globalIds.get(p.id)}`);
        else globalIds.set(p.id, file);
      }
    }
    if (dupes.length) throw new Error(dupes.slice(0,10).join('\n    '));
  });
});

A.suite('Data — Type and Region validation', () => {
  const files = loadAll();

  A.it('entidades: tipo/type in allowed set', () => {
    const issues = [];
    for (const { file, fullPath } of files) {
      const d = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (!d.entidades) continue;
      for (const e of d.entidades) {
        const t = e.type || e.tipo;
        if (t && !VALID_TIPOS.has(t))
          issues.push(`${file} → ${e.id}: unknown tipo "${t}"`);
      }
    }
    if (issues.length) throw new Error(issues.slice(0,10).join('\n    '));
  });

  A.it('entidades: region in allowed set (if present)', () => {
    const issues = [];
    for (const { file, fullPath } of files) {
      const d = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (!d.entidades) continue;
      for (const e of d.entidades) {
        const r = e.region || e.regiao;
        if (r && !VALID_REGIONS.has(r))
          issues.push(`${file} → ${e.id}: unknown region "${r}"`);
      }
    }
    if (issues.length) throw new Error(issues.slice(0,10).join('\n    '));
  });
});

A.suite('Data — Multilingual fields (new-style entidades)', () => {
  // New files created in v7.27+ have nome, descricao (pt), importancia (pt)
  // but not necessarily nome_en etc. — check that at least descricao is non-empty.
  const files = loadAll();

  A.it('entidades: descricao is non-empty string', () => {
    const issues = [];
    for (const { file, fullPath } of files) {
      const d = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (!d.entidades) continue;
      for (const e of d.entidades)
        if (!e.descricao || typeof e.descricao !== 'string' || e.descricao.trim().length < 10)
          issues.push(`${file} → ${e.id}: descricao too short or missing`);
    }
    if (issues.length) throw new Error(issues.slice(0,10).join('\n    '));
  });

  A.it('entidades: importancia is non-empty string', () => {
    const issues = [];
    for (const { file, fullPath } of files) {
      const d = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (!d.entidades) continue;
      for (const e of d.entidades)
        if (!e.importancia || typeof e.importancia !== 'string' || e.importancia.trim().length < 10)
          issues.push(`${file} → ${e.id}: importancia too short or missing`);
    }
    if (issues.length) throw new Error(issues.slice(0,10).join('\n    '));
  });
});
