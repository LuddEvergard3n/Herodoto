/**
 * TEST: dataset-registry.js
 * Cross-checks:
 *   - All files in ALL_DATASETS exist on disk
 *   - No file on disk is orphaned (not in ALL_DATASETS)
 *   - No duplicate entries in ALL_DATASETS
 *   - Every registered dataset has a label in DATASET_LABELS
 *   - Every label key corresponds to a registered dataset
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const A    = require('./assert');

const ROOT     = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const TL_PATH  = path.join(ROOT, 'js', 'timeline.js');
const LB_PATH  = path.join(ROOT, 'js', 'dataset-labels.js');

// ─── Extract ALL_DATASETS entries from timeline.js ───────────────────────────
function extractAllDatasets() {
  const src = fs.readFileSync(TL_PATH, 'utf8');
  const matches = [...src.matchAll(/"data\/(dados-[^"]+\.json)"/g)];
  return matches.map(m => m[1]);
}

// ─── Extract DATASET_LABELS keys from dataset-labels.js ──────────────────────
function extractLabelKeys() {
  const src = fs.readFileSync(LB_PATH, 'utf8');
  // Match  "key-name":   { pt: ...
  const matches = [...src.matchAll(/^\s+"([\w-]+)"\s*:/gm)];
  return matches.map(m => m[1]);
}

// ─── Disk files ──────────────────────────────────────────────────────────────
function diskFiles() {
  return fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
}

// ─── Key from filename ───────────────────────────────────────────────────────
function fileToKey(filename) {
  return filename.replace(/^dados-/, '').replace(/\.json$/, '');
}

// ─── Tests ───────────────────────────────────────────────────────────────────

const registered = extractAllDatasets();
const labelKeys  = new Set(extractLabelKeys());
const onDisk     = new Set(diskFiles());
const regSet     = new Set(registered);

A.suite('Registry — ALL_DATASETS completeness', () => {

  A.it('no duplicate entries in ALL_DATASETS', () => {
    A.arrayUnique(registered, x => x, 'Duplicate dataset entries in timeline.js');
  });

  A.it('every registered file exists on disk', () => {
    const missing = registered.filter(f => !onDisk.has(f));
    if (missing.length)
      throw new Error(`Registered but missing on disk:\n    ${missing.join('\n    ')}`);
  });

  A.it('no orphaned files on disk (missing from ALL_DATASETS)', () => {
    const orphans = [...onDisk].filter(f => !regSet.has(f));
    if (orphans.length)
      throw new Error(`On disk but not in ALL_DATASETS:\n    ${orphans.join('\n    ')}`);
  });

  A.it(`total registered datasets >= 200`, () => {
    A.greaterThan(registered.length, 200, `Only ${registered.length} datasets registered`);
  });
});

A.suite('Registry — DATASET_LABELS coverage', () => {

  A.it('every registered dataset has a label', () => {
    const missing = registered
      .map(fileToKey)
      .filter(k => !labelKeys.has(k));
    if (missing.length)
      throw new Error(
        `${missing.length} datasets without labels:\n    ` +
        missing.slice(0, 15).join('\n    ') +
        (missing.length > 15 ? `\n    ...and ${missing.length - 15} more` : '')
      );
  });

  A.it('every label has a pt, en, es translation', () => {
    const src = fs.readFileSync(LB_PATH, 'utf8');
    // Quick check: count occurrences of pt:, en:, es: — they should be equal
    const pts = (src.match(/\bpt\s*:/g) || []).length;
    const ens = (src.match(/\ben\s*:/g) || []).length;
    const ess = (src.match(/\bes\s*:/g) || []).length;
    if (pts !== ens || pts !== ess)
      throw new Error(`Mismatched language counts — pt:${pts} en:${ens} es:${ess}`);
    A.greaterThan(pts, 150, `Only ${pts} label translations found`);
  });

  A.it('no orphaned labels (key exists but no corresponding dataset)', () => {
    const registeredKeys = new Set(registered.map(fileToKey));
    const orphanedLabels = [...labelKeys].filter(k => !registeredKeys.has(k));
    // Some keys in labels.js are intentionally generic or comments — allow ≤5
    if (orphanedLabels.length > 5)
      throw new Error(
        `${orphanedLabels.length} labels without matching dataset:\n    ` +
        orphanedLabels.slice(0, 10).join('\n    ')
      );
  });
});

A.suite('Registry — European expansion v7.30', () => {
  const euNew = [
    'dados-grecia-helenismo.json',
    'dados-roma-emperadores.json',
    'dados-roma-crise-terceiro-seculo.json',
    'dados-roma-queda-ocidente.json',
    'dados-roma-teologia-direito.json',
    'dados-vikings.json',
    'dados-carlomagno.json',
    'dados-peste-negra.json',
    'dados-guerra-cem-anos.json',
    'dados-reforma-calvino.json',
    'dados-contrarreforma.json',
    'dados-guerras-religiao.json',
    'dados-habsburgos.json',
    'dados-franca-ancien-regime.json',
    'dados-ingles-revolucao.json',
    'dados-holanda-seculo-de-ouro.json',
    'dados-guerra-trinta-anos.json',
    'dados-iluminismo-frances.json',
    'dados-iluminismo-britanico.json',
    'dados-iluminismo-alemao.json',
    'dados-napoleao-europa.json',
    'dados-congresso-viena.json',
    'dados-revolucoes-1848.json',
    'dados-unificacao-italia.json',
    'dados-unificacao-alemanha.json',
    'dados-belle-epoque.json',
    'dados-frente-ocidental-1914.json',
    'dados-tratado-versalhes.json',
    'dados-republica-weimar.json',
    'dados-nazismo.json',
    'dados-fascismo-italiano.json',
    'dados-guerra-civil-espanhola.json',
    'dados-frente-oriental.json',
    'dados-holocaust.json',
    'dados-europa-pos-guerra.json',
    'dados-uniao-europeia.json',
    'dados-guerra-fria-europa.json',
    'dados-desintegracao-urss.json',
    'dados-balcas-guerras.json',
    'dados-europa-contemporanea.json',
    'dados-russia-imperio.json',
    'dados-imperialismo-britanico.json',
    'dados-industrializacao-europa.json',
    'dados-1968-europa.json',
    'dados-austria-prussia.json',
    'dados-humanismo-erasmo.json',
    'dados-imperialismo-frances.json',
  ];

  A.it(`all ${euNew.length} new European files exist on disk`, () => {
    const missing = euNew.filter(f => !onDisk.has(f));
    if (missing.length)
      throw new Error(`Missing European files:\n    ${missing.join('\n    ')}`);
  });

  A.it(`all ${euNew.length} new European files registered in ALL_DATASETS`, () => {
    const missing = euNew.filter(f => !regSet.has(f));
    if (missing.length)
      throw new Error(`Not registered:\n    ${missing.join('\n    ')}`);
  });

  A.it(`all ${euNew.length} new European files have labels`, () => {
    const missing = euNew.map(fileToKey).filter(k => !labelKeys.has(k));
    if (missing.length)
      throw new Error(`Missing labels:\n    ${missing.join('\n    ')}`);
  });
});

// ── NEW: validate index.html checkboxes ──────────────────────────────────────

const HTML_PATH = path.join(ROOT, 'index.html');

function extractHtmlDatasets() {
  const src = fs.readFileSync(HTML_PATH, 'utf8');
  return [...src.matchAll(/value="data\/(dados-[^"]+\.json)"/g)].map(m => m[1]);
}

A.suite('Registry — index.html checkboxes', () => {
  const htmlRefs  = extractHtmlDatasets();
  const htmlSet   = new Set(htmlRefs);
  const onDiskSet = new Set(fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')));

  A.it('no duplicate checkboxes in index.html', () => {
    A.arrayUnique(htmlRefs, x => x, 'Duplicate checkbox values in index.html');
  });

  A.it('all checkbox dataset values exist on disk', () => {
    const missing = htmlRefs.filter(f => !onDiskSet.has(f));
    if (missing.length)
      throw new Error(`Checkboxes pointing to non-existent files:\n    ${missing.join('\n    ')}`);
  });

  A.it('all non-personagens datasets in ALL_DATASETS have a checkbox in index.html', () => {
    const tl = fs.readFileSync(path.join(ROOT, 'js', 'timeline.js'), 'utf8');
    const tlDatasets = new Set([...tl.matchAll(/"data\/(dados-[^"]+\.json)"/g)].map(m => m[1]));
    const missing = [...tlDatasets].filter(f => !f.includes('personagens') && !htmlSet.has(f));
    if (missing.length)
      throw new Error(
        `${missing.length} datasets in ALL_DATASETS but no checkbox in index.html:\n    ` +
        missing.slice(0, 10).join('\n    ')
      );
  });

  A.it('index.html has >= 250 dataset checkboxes', () => {
    A.greaterThan(htmlRefs.length, 250,
      `Only ${htmlRefs.length} checkboxes in index.html`);
  });
});
