# Herodoto 8 architecture

## Scope

Herodoto 8 adds a mobile exploration shell, adaptive timeline, grounded historical personas, and twelve Lusophone datasets. It preserves the V7 graph, horizontal timeline, datasets, public IDs, and local progress.

## Reversible switches

`js/features.js` owns four temporary switches:

- `mobileShellV8`
- `voicesV8`
- `timelineV8`
- `lusophoneDatasetsV8`

`?legacy=1` turns all four off for a diagnostic session. It does not modify local storage. Feature regions are hidden and their form controls disabled. The safety tag is `herodoto-v7.64-pre-revamp`.

## Grounded Voices

The stable path is lexical retrieval over the existing Herodoto records. `answerQuestion()` ranks local evidence, applies the persona horizon, and returns text, evidence, source IDs, confidence, answer mode, limitations, and suggested questions.

Semantic reranking is explicit opt-in. It loads a pinned Transformers.js module and `multilingual-e5-small` in a Web Worker. The generative model proposed in older versions is not required. If the worker, network, model, WebAssembly, or browser cache fails, the lexical answer remains available.

The first person is always labeled as pedagogical dramatization. Evidence panels distinguish generated narration from the historical records used. Conversation data is not sent or synchronized by Herodoto.

## Timeline indexes

The JSON datasets remain the source of truth. `node scripts/generate-indexes.js` produces:

- `data/dataset-catalog.json`
- `data/timeline-index.json`

The indexes are disposable and reproducible. Desktop keeps the horizontal SVG renderer. At 600 px or less, V8 opens a semantic HTML list with progressive loading and a bottom detail sheet.

## Dataset generation

`node scripts/generate-lusophone-datasets.js` reproduces the 12 V8 content files and 108 entities. Each file declares review metadata and sources; each entity has deterministic IDs, three languages, temporal precision, territory, evidence status, source IDs, and institutional plus social/local perspectives.

## Validation

Run:

```bash
node scripts/generate-indexes.js
node tests/runner.js
```

The browser validation covered the 390 px mobile shell, zero horizontal overflow, 80-item progressive timeline page, full `?legacy=1` fallback, and a grounded D. Pedro II answer that correctly attributes the Lei Aurea signature to Princess Isabel.

Not validated in this environment: Safari on macOS or iOS, a real touch device, offline model download after a cold cache, and WebGPU acceleration. These are release checks, not requirements for the lexical fallback.

## Rollback

Prefer a targeted rollback:

```bash
git revert <checkpoint-commit>
```

For immediate diagnosis without changing Git history, append `?legacy=1`. Do not delete the V7 modules or the safety tag until the published V8 has been approved.
