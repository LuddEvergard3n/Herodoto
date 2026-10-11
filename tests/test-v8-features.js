'use strict';

const fs = require('fs');
const path = require('path');
const A = require('./assert');

const featurePath = path.join(__dirname, '..', 'js', 'features.js');
const source = fs.readFileSync(featurePath, 'utf8');
const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

A.suite('Herodoto 8 — reversible features', () => {
  for (const name of ['mobileShellV8', 'voicesV8', 'timelineV8', 'lusophoneDatasetsV8']) {
    A.it(`declares ${name}`, () => A.ok(source.includes(`${name}: true`), `${name} missing`));
  }

  A.it('supports the documented legacy query switch', () => {
    A.ok(source.includes("get('legacy') === '1'"), 'legacy=1 switch missing');
  });

  A.it('keeps Voices behind its independent switch', () => {
    A.ok(index.includes('data-feature="voicesV8"'), 'Voices feature marker missing');
  });
});
