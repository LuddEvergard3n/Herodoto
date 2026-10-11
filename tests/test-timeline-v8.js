'use strict';

const fs = require('fs');
const path = require('path');
const A = require('./assert');

const root = path.join(__dirname, '..');
const index = JSON.parse(fs.readFileSync(path.join(root, 'data', 'timeline-index.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'data', 'dataset-catalog.json'), 'utf8'));
const timelineSource = fs.readFileSync(path.join(root, 'js', 'timeline.js'), 'utf8');
const mobileSource = fs.readFileSync(path.join(root, 'js', 'timeline-mobile.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

A.suite('Timeline V8 — derived indexes', () => {
  A.it('catalog indexes every historical dataset', () => {
    const files = fs.readdirSync(path.join(root, 'data')).filter(name => /^dados-.*\.json$/.test(name));
    A.equal(catalog.datasets.length, files.length);
  });

  A.it('timeline IDs are unique', () => {
    A.equal(new Set(index.entities.map(entity => entity.id)).size, index.entities.length);
  });

  A.it('index remains a lightweight summary', () => {
    A.ok(fs.statSync(path.join(root, 'data', 'timeline-index.json')).size < 3_500_000);
    A.ok(index.entities.every(entity => !Object.hasOwn(entity, 'relations')));
  });
});

A.suite('Timeline V8 — adaptive interface', () => {
  A.it('loads the derived index with a legacy fallback', () => {
    A.ok(timelineSource.includes("fetch('data/timeline-index.json')"));
    A.ok(timelineSource.includes('Promise.all(ALL_DATASETS'));
  });

  A.it('dispatches the mobile timeline behind its feature switch', () => {
    A.ok(timelineSource.includes("featureEnabled('timelineV8')"));
    A.ok(timelineSource.includes('openMobileTimeline'));
  });

  A.it('supports pagination, Escape and focus restoration', () => {
    A.ok(mobileSource.includes('visibleCount += 80'));
    A.ok(mobileSource.includes("event.key === 'Escape'"));
    A.ok(mobileSource.includes('returnFocus?.focus()'));
  });

  A.it('loads the mobile stylesheet', () => {
    A.ok(html.includes('css/timeline-mobile.css'));
  });
});
