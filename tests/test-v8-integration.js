'use strict';

const fs = require('fs');
const path = require('path');
const A = require('./assert');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sw = read('sw.js');
const html = read('index.html');
const main = read('js/main.js');
const index = JSON.parse(read('data/timeline-index.json'));

A.suite('Herodoto V8 — reversible integration', () => {
  A.it('guards every rollout area with a feature switch', () => {
    const features = read('js/features.js');
    for (const flag of ['mobileShellV8', 'voicesV8', 'timelineV8', 'lusophoneDatasetsV8']) A.ok(features.includes(flag));
    A.ok(features.includes("get('legacy') === '1'"));
  });

  A.it('disables controls inside unavailable feature regions', () => {
    A.ok(main.includes('control.disabled = !enabled'));
    A.ok(html.includes('data-feature="lusophoneDatasetsV8"'));
  });

  A.it('marks Lusophone index entities for independent fallback', () => {
    const lusophone = index.entities.filter(entity => entity.collection === 'mundo-lusofono-v8');
    A.equal(lusophone.length, 108);
  });
});

A.suite('Herodoto V8 — offline shell', () => {
  A.it('uses a V8 cache and resilient installation', () => {
    A.ok(sw.includes("CACHE_VERSION = 'herodoto-v8-0'"));
    A.ok(sw.includes('Promise.allSettled'));
  });

  A.it('pre-caches the new local interface modules', () => {
    for (const asset of ['vozes-historia-v8.html', 'mobile-v8.css', 'timeline-mobile.css', 'voices-grounded.js', 'timeline-index.json']) A.ok(sw.includes(asset));
  });
});
