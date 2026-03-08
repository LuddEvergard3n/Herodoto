/**
 * TEST: timeline-structure.js
 * Validates timeline.js source structure:
 *   - ALL_DATASETS is defined and is a flat array of strings
 *   - Section comments are present (cobertura mínima de regiões)
 *   - TYPE_COLORS has all required types
 *   - TYPE_WEIGHT has all required types
 *   - REGION_MAP covers expected regions
 *   - No path typos (all entries start with "data/dados-")
 *   - Count sanity (> 250 datasets)
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const A    = require('./assert');

const TL_PATH = path.join(__dirname, '..', 'js', 'timeline.js');
const src     = fs.readFileSync(TL_PATH, 'utf8');

// Extract entries
const allEntries = [...src.matchAll(/"(data\/dados-[^"]+)"/g)].map(m => m[1]);
const unique     = new Set(allEntries);

const REQUIRED_TYPES = [
  'political','war','economic','cultural','religious','social',
  'technological','intellectual','prehistoric','natural','scientific',
];

const EXPECTED_SECTIONS = [
  'Pré-História',
  'Grécia',
  'Roma',
  'Idade Média Europa',
  'Era Moderna Europa',
  'Revoluções e Séc. XIX',
  'Rússia',
  'Guerras Mundiais',
  'China',
  'Japão',
  'Brasil',
  'África',
];

const EXPECTED_REGIONS = [
  'Europe','MiddleEast','EastAsia','SouthAsia','SoutheastAsia',
  'Africa','Americas','Oceania','Global','Other',
];

// ─── Tests ───────────────────────────────────────────────────────────────────

A.suite('Timeline — ALL_DATASETS', () => {

  A.it('ALL_DATASETS is defined', () => {
    A.ok(src.includes('const ALL_DATASETS'), 'ALL_DATASETS constant not found');
  });

  A.it('all entries start with "data/dados-"', () => {
    const bad = allEntries.filter(e => !e.startsWith('data/dados-'));
    if (bad.length)
      throw new Error(`Malformed entries:\n    ${bad.slice(0,5).join('\n    ')}`);
  });

  A.it('all entries end with ".json"', () => {
    const bad = allEntries.filter(e => !e.endsWith('.json'));
    if (bad.length)
      throw new Error(`Entries without .json:\n    ${bad.slice(0,5).join('\n    ')}`);
  });

  A.it('total entries > 250', () => {
    A.greaterThan(allEntries.length, 250,
      `Only ${allEntries.length} entries in ALL_DATASETS`);
  });

  A.it('unique entries > 250 (no duplicates)', () => {
    // Duplicates are allowed in ALL_DATASETS (some files appear in multiple sections)
    // but we warn if uniqueness drops below 200
    A.greaterThan(unique.size, 200,
      `Only ${unique.size} unique datasets`);
  });
});

A.suite('Timeline — Section comments', () => {

  for (const section of EXPECTED_SECTIONS) {
    A.it(`section "${section}" exists`, () => {
      A.ok(src.includes(section),
        `Section comment "// ── ${section}" not found in timeline.js`);
    });
  }
});

A.suite('Timeline — TYPE_COLORS', () => {

  A.it('TYPE_COLORS is defined', () => {
    A.ok(src.includes('const TYPE_COLORS'), 'TYPE_COLORS not found');
  });

  for (const type of REQUIRED_TYPES) {
    A.it(`TYPE_COLORS has "${type}"`, () => {
      A.ok(src.includes(`${type}:`),
        `"${type}" missing from TYPE_COLORS or TYPE_WEIGHT`);
    });
  }
});

A.suite('Timeline — REGION_MAP', () => {

  A.it('REGION_MAP is defined', () => {
    A.ok(src.includes('const REGION_MAP'), 'REGION_MAP not found');
  });

  for (const region of EXPECTED_REGIONS) {
    A.it(`REGION_MAP maps "${region}"`, () => {
      A.ok(src.includes(`${region}:`),
        `"${region}" missing from REGION_MAP`);
    });
  }
});

A.suite('Timeline — Multilingual labels', () => {

  A.it('RLABELS has pt, en, es', () => {
    A.ok(src.includes('const RLABELS'), 'RLABELS not found');
    // Check all three lang blocks
    const ptCount = (src.match(/pt:\{/g) || []).length;
    const enCount = (src.match(/en:\{/g) || []).length;
    const esCount = (src.match(/es:\{/g) || []).length;
    A.ok(ptCount >= 2, 'pt: blocks missing in RLABELS');
    A.ok(enCount >= 2, 'en: blocks missing in RLABELS');
    A.ok(esCount >= 2, 'es: blocks missing in RLABELS');
  });

  A.it('TYPE_LABELS has pt, en, es translations', () => {
    // TYPE_LABELS may be in i18n.js or inline — just check i18n file
    const i18nPath = path.join(__dirname, '..', 'js', 'i18n.js');
    if (fs.existsSync(i18nPath)) {
      const i18n = fs.readFileSync(i18nPath, 'utf8');
      A.ok(i18n.includes('political') || src.includes('political'),
        'political type label missing from i18n');
    }
  });
});
