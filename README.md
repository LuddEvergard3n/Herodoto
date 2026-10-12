# Herodoto

Interactive history learning platform with a knowledge graph, chronological navigation, and contextual connections across events and periods.

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=000)](https://developer.mozilla.org/docs/Web/JavaScript)
[![D3.js](https://img.shields.io/badge/D3.js-v7-F9A03C?logo=d3dotjs&logoColor=white)](https://d3js.org/)
[![HTML5](https://img.shields.io/badge/HTML5-Semantic-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![PWA](https://img.shields.io/badge/PWA-Offline-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/explore/progressive-web-apps)
[![Tests](https://img.shields.io/badge/Tests-149%20passing-2EA44F)](#tests)

> "Herodotus of Halicarnassus presents here the results of his inquiry, so that time may not erase the deeds of humankind." — *Histories*, c. 440 BCE

## Overview

Herodoto is a browser-based teaching tool for history students and educators. It combines two primary views:

- **Knowledge graph:** historical events and people rendered as connected nodes through causal, thematic, and chronological relationships.
- **Interactive timeline:** an SVG timeline with zoom, pan, multidimensional filters, regional grouping, and contextual navigation.

The dataset spans human history from the earliest hominins to the present, with deeper coverage of Brazil and Europe.

## Current dataset

| Metric | Value |
|---|---:|
| JSON datasets | 340 |
| Historical entities | 2,676 |
| Guiding questions | 311 across 66 groups |
| Languages | Portuguese, English, Spanish |
| Bibliography topics | 38 |
| Bibliographic references | Approximately 500 |
| Automated tests | 149 passing |

## Highlights

- Timeline zoom, horizontal pan, regional navigation, and collapsible rows.
- Filters for historical era, event type, region, and free-text search.
- D3 force-directed graph with dataset-aware clustering.
- Global search across names, descriptions, historiographic importance, and tags.
- Side-by-side event comparison and two-level causal or consequence chains.
- Guided narratives and 311 question-driven dataset selections.
- 236 historical figures across 18 regional and thematic collections.
- Topic-organized bibliography, teacher guide, help pages, and offline PWA support.
- Responsive layouts for desktop, tablet, and mobile landscape.
- Mobile-first guided entry, bottom navigation, accessible filter drawer, and vertical timeline.
- Grounded Voices of History with eight personas, lexical retrieval, optional semantic reranking, and visible evidence.
- Twelve connected datasets on Portugal, Atlantic history, Lusophone Africa, and Timor-Leste.

## Content coverage

Brazil is organized into 16 chronological periods, from Indigenous peoples before 1500 through the New Republic. Cross-period themes include slavery, quilombos, Indigenous history, Jesuit missions, independence, economic cycles, culture, and redemocratization.

European coverage includes Greece, Rome, the Middle Ages, the Reformation, the Enlightenment, industrialization, the world wars, the Cold War, European integration, contemporary Europe, and Imperial Russia.

World coverage includes the Middle East, Egypt, Islam, India, China, Japan, Korea, Southeast Asia, Africa, Mesoamerica, the Andes, the United States, Latin America, Oceania, and Antarctica.

## Run locally

No build step is required. Use a small static server because ES modules, workers, fetched datasets, and the service worker do not run reliably from a `file://` URL:

```bash
npx http-server .
```

Then open the local address printed by the server.

## Project structure

```text
herodoto/
|-- index.html                 Main application
|-- fontes.html               Bibliography browser
|-- guia-professor.html       Teacher guide and activities
|-- sobre.html                Project overview
|-- ajuda.html                Navigation guide and FAQ
|-- manifest.json             PWA manifest
|-- sw.js                     Offline service worker
|-- css/                      Layout and component styles
|-- js/
|   |-- graph.js              D3 knowledge graph
|   |-- timeline.js           SVG timeline and dataset registry
|   |-- timeline-mobile.js    Semantic vertical timeline for small screens
|   |-- voices-grounded.js    Deterministic grounded-answer engine
|   |-- semantic-worker.js    Optional local semantic reranking worker
|   |-- features.js           Temporary reversible V8 switches
|   |-- data.js               Data loading and normalization
|   |-- search.js             Global search
|   |-- compare.js            Event comparison
|   |-- causal-chain.js       Cause traversal
|   |-- consequence-chain.js  Consequence traversal
|   |-- questions.js          Guiding questions
|   |-- personagens.js        Historical figures
|   `-- i18n.js               PT, EN, and ES translations
|-- data/                     Historical datasets
|-- fontes/                   Bibliographic datasets
`-- tests/                    Dependency-free Node.js test suite
```

## Data model

Historical entities use stable IDs, multilingual names and descriptions, dates, event types, regions, tags, historiographic context, and optional end dates. Supported event types include political, military, economic, cultural, religious, social, technological, intellectual, prehistoric, natural, and scientific events.

## Tests

The test runner has no third-party dependencies.

```bash
node tests/runner.js
node tests/runner.js data
node tests/runner.js personagens
node tests/runner.js registry
node tests/runner.js questions
node tests/runner.js historical
node tests/runner.js --list
```

The suite validates JSON structure, required fields, chronology, global ID uniqueness, dataset registration, translations, regional coverage, historical figures, and guiding-question references.

Regenerate the derived catalog and timeline index after changing datasets:

```bash
node scripts/generate-indexes.js
```

Regenerate and run the deterministic Voices retrieval benchmark:

```bash
node scripts/generate-voices-golden.js
node scripts/benchmark-voices.js
```

The optional semantic model is pinned and documented in `data/model-manifest.json`. The lexical engine remains the offline fallback when the model cannot be downloaded or executed.

## Herodoto 8 and rollback

The V8 rollout is isolated on `feat/herodoto-8-mobile-vozes`. Four temporary switches control the mobile shell, Voices, adaptive timeline, and Lusophone datasets. Add `?legacy=1` to the main URL to disable every V8 surface without changing stored preferences.

The safety tag `herodoto-v7.64-pre-revamp` identifies the exact pre-reform commit. Functional checkpoints are independent and can be undone with `git revert <commit>`. No legacy module was removed. See [docs/HERODOTO-8.md](docs/HERODOTO-8.md) for architecture and validation limits.

Herodoto 8.1 adds a local, grounded drafting layer to Voices of History. Historical datasets and persona dossiers remain the only factual sources; the optional language model may only rewrite retrieved evidence. The 117 MB lite model is prepared automatically only when browser capability, connection and storage checks pass. The 483 MB enhanced model is manual and desktop-only. Both use WebGPU in a Worker and fall back to the deterministic composer. Model identity, revision, license, size and artifact hash are pinned in `data/voices-models.json`. See [docs/HERODOTO-8.1-VOICES.md](docs/HERODOTO-8.1-VOICES.md).

## Editorial principles

- **Balance:** controversial events present multiple documented perspectives.
- **Rigor:** the content distinguishes evidence, scholarly debate, and current consensus.
- **Historiographic classification:** event categories reflect the primary historical nature of each entity.
- **Teaching accessibility:** every entity includes a factual description and a statement of historical importance.
- **Multilingual coverage:** interface and core content support Portuguese, English, and Spanish.

## Related educational projects

| Project | Subject |
|---|---|
| [Euclides](https://luddevergard3n.github.io/euclides/) | Mathematics |
| [Quintiliano](https://luddevergard3n.github.io/quintiliano/) | Portuguese language and literature |
| [Johnson English](https://luddevergard3n.github.io/johnson-english/) | English language learning |
| [Lavoisier](https://luddevergard3n.github.io/lavoisier/) | Chemistry |
| [Humboldt](https://luddevergard3n.github.io/humboldt/) | Geography |

## Technology

- D3.js v7 for the graph and force simulation.
- Native SVG for the timeline.
- Vanilla JavaScript ES6+ with no production framework.
- CSS custom properties for theming.
- Service Worker and web app manifest for offline PWA behavior.
- Node.js only for the dependency-free test runner.
