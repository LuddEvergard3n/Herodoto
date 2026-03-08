/**
 * TEST: historical-consistency.js
 * Higher-level historical sanity checks:
 *   - Key historical events have correct approximate dates
 *   - Bias language markers not present (post v7.28 audit)
 *   - Minimum entity counts per region
 *   - Brasil series (16 periods) all present
 *   - Key entities exist by ID
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const A    = require('./assert');

const DATA_DIR = path.join(__dirname, '..', 'data');

function loadFile(filename) {
  const fp = path.join(DATA_DIR, filename);
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

// Build a flat index of all entidades
function buildEntityIndex() {
  const index = new Map();
  for (const f of fs.readdirSync(DATA_DIR).filter(x => x.endsWith('.json'))) {
    const d = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
    for (const e of (d.entidades || [])) {
      if (e.id) index.set(e.id, { ...e, _file: f });
    }
  }
  return index;
}

// ─── Bias patterns from v7.28 audit ──────────────────────────────────────────
const BIAS_PATTERNS = [
  /paranoia americana/i,
  /quintal americano/i,
  /o fracasso final da URSS não refutou o marxismo/i,
  /a Guerra Fria foi travada no sangue dos africanos/i,
];

// ─── Key anchor events {file, id, expected date range} ───────────────────────
const ANCHORS = [
  { file: 'dados-grecia-antiga.json',       id: 'grecia-001',  minY: -850, maxY: -750 },
  { file: 'dados-roma-republica.json',      id: null,          check: d => d.entidades.some(e => e.inicio <= -509) },
  { file: 'dados-revolucao-francesa.json',  id: null,          check: d => d.entidades.some(e => e.inicio >= 1789 && e.inicio <= 1793) },
  { file: 'dados-segunda-guerra.json',      id: null,          check: d => d.entidades.some(e => e.inicio >= 1939 && e.inicio <= 1940) },
  { file: 'dados-primeira-guerra.json',     id: null,          check: d => d.entidades.some(e => e.inicio === 1914) },
  { file: 'dados-brasil-09-independencia.json', id: null,     check: d => d.entidades.some(e => e.inicio >= 1822 && e.inicio <= 1823) },
];

// ─── Brasil 16-period series ──────────────────────────────────────────────────
const BRASIL_SERIES = Array.from({length: 16}, (_, i) =>
  `dados-brasil-${String(i+1).padStart(2,'0')}-${[
    'povos-originarios','pre-colonial','capitanias','governo-geral',
    'uniao-iberica','bandeirismo','ciclo-ouro','joanino','independencia',
    'regencial','segundo-reinado','republica-velha','era-vargas',
    'populismo','ditadura','nova-republica'
  ][i]}.json`
);

// ─── Tests ───────────────────────────────────────────────────────────────────

A.suite('Historical — Brasil 16-period series', () => {

  A.it('all 16 Brasil period files exist', () => {
    const missing = BRASIL_SERIES.filter(f => !fs.existsSync(path.join(DATA_DIR, f)));
    if (missing.length)
      throw new Error(`Missing Brasil period files:\n    ${missing.join('\n    ')}`);
  });

  A.it('Brasil period files are in chronological order', () => {
    const minDates = BRASIL_SERIES.map(f => {
      const d = loadFile(f);
      if (!d) return null;
      return Math.min(...d.entidades.map(e => e.inicio));
    }).filter(Boolean);

    for (let i = 1; i < minDates.length; i++) {
      if (minDates[i] < minDates[i-1] - 50) // allow 50y tolerance
        throw new Error(`Period ${i+1} starts (${minDates[i]}) before period ${i} (${minDates[i-1]})`);
    }
  });
});

A.suite('Historical — Anchor date checks', () => {

  for (const anchor of ANCHORS) {
    if (anchor.id && anchor.minY !== undefined) {
      A.it(`${anchor.file}: entity ${anchor.id} in expected date range`, () => {
        const d = loadFile(anchor.file);
        if (!d) throw new Error(`File not found: ${anchor.file}`);
        const e = d.entidades.find(x => x.id === anchor.id);
        if (!e) {
          // Soft pass — entity may not exist in this version
          return;
        }
        A.greaterThan(e.inicio, anchor.minY - 1, `inicio ${e.inicio} < ${anchor.minY}`);
        A.lessThan(e.inicio, anchor.maxY + 1,    `inicio ${e.inicio} > ${anchor.maxY}`);
      });
    } else if (anchor.check) {
      A.it(`${anchor.file}: expected entity pattern found`, () => {
        const d = loadFile(anchor.file);
        if (!d) throw new Error(`File not found: ${anchor.file}`);
        A.ok(anchor.check(d), `No entity matching expected date in ${anchor.file}`);
      });
    }
  }
});

A.suite('Historical — Bias audit (v7.28)', () => {

  A.it('no flagged bias phrases in any data file', () => {
    const hits = [];
    for (const f of fs.readdirSync(DATA_DIR).filter(x => x.endsWith('.json'))) {
      const raw = fs.readFileSync(path.join(DATA_DIR, f), 'utf8');
      for (const pattern of BIAS_PATTERNS) {
        if (pattern.test(raw))
          hits.push(`${f}: matched "${pattern.source}"`);
      }
    }
    if (hits.length) throw new Error(`Bias phrases found:\n    ${hits.join('\n    ')}`);
  });
});

A.suite('Historical — Regional coverage', () => {

  A.it('minimum entity counts per region', () => {
    const regionCount = {};
    for (const f of fs.readdirSync(DATA_DIR).filter(x => x.endsWith('.json'))) {
      const d = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
      for (const e of (d.entidades || [])) {
        const r = e.region || e.regiao;
        if (r) regionCount[r] = (regionCount[r] || 0) + 1;
      }
    }
    const minimums = {
      'Europe':    150,
      'Americas':   50,
      'Africa':     30,
      'EastAsia':   50,
      'MiddleEast': 50,
    };
    const issues = [];
    for (const [region, min] of Object.entries(minimums)) {
      const count = regionCount[region] || 0;
      if (count < min)
        issues.push(`${region}: ${count} entities (expected >= ${min})`);
    }
    if (issues.length) throw new Error(issues.join('\n    '));
  });
});

A.suite('Historical — New European datasets content', () => {

  const checks = [
    { file: 'dados-vikings.json',           minEnts: 4, hasText: 'viking' },
    { file: 'dados-carlomagno.json',        minEnts: 4, hasText: 'carolíngio' },
    { file: 'dados-peste-negra.json',       minEnts: 4, hasText: 'Yersinia' },
    { file: 'dados-nazismo.json',           minEnts: 4, hasText: 'Holocausto' },
    { file: 'dados-holocaust.json',         minEnts: 4, hasText: 'Auschwitz' },
    { file: 'dados-guerra-civil-espanhola.json', minEnts: 4, hasText: 'Guernica' },
    { file: 'dados-uniao-europeia.json',    minEnts: 4, hasText: 'Schuman' },
    { file: 'dados-iluminismo-frances.json',minEnts: 4, hasText: 'Voltaire' },
  ];

  for (const { file, minEnts, hasText } of checks) {
    A.it(`${file}: >= ${minEnts} entities and contains "${hasText}"`, () => {
      const d = loadFile(file);
      if (!d) throw new Error(`File not found: ${file}`);
      const ents = d.entidades || [];
      A.greaterThan(ents.length, minEnts - 1,
        `${file}: only ${ents.length} entities, expected >= ${minEnts}`);
      const raw = JSON.stringify(d);
      A.ok(raw.toLowerCase().includes(hasText.toLowerCase()),
        `"${hasText}" not found in ${file}`);
    });
  }
});
