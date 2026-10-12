# Herodoto 8.1: Grounded Generative Voices

## Design boundary

The local language model is a writer, not a historical source. Every answer starts with lexical retrieval from `data/voices-retrieval-index.json`. The model receives only the selected evidence, a short conversation history and the persona's editorial style. If generation is unavailable or fails grounding validation, the deterministic composer answers from the same evidence.

The V7 page remains available through `?legacy=1`. Legacy persona datasets and the former semantic runtime remain in the branch until the generative runtime is validated on a real WebGPU browser. Removing the semantic encoder is a separate reversible checkpoint.

## Generated data

Run:

```powershell
node scripts/generate-voices-81.js
```

The command recreates:

- `data/voices-dossiers/*.json`;
- `data/voices-sources.json`;
- `data/voices-retrieval-index.json`;
- `data/voices-golden.json`.

The generator never changes the historical datasets or includes local paths. The current dossier records are a structural migration of V8 content and carry `migrated-for-editorial-review`; this status must become `reviewed` only after claim-by-claim editorial verification against the cited locator.

## Runtime tiers

`deterministic` requires no model. `lite` uses the pinned SmolLM2 135M q4f16 artifact. `enhanced` uses the pinned Qwen2.5 0.5B q4f16 artifact. Both execute in a module Worker through Transformers.js and WebGPU.

Automatic lite preparation requires a visible page, an active non-slow connection, disabled data saver, WebGPU, sufficient estimated storage and at least 4 GB of reported device memory when that API exists. A missing capability prevents automatic download and leaves a manual action. Enhanced preparation is always manual, desktop-only and recommends 8 GB of memory.

The browser cache is managed by Transformers.js. The interface can cancel an active Worker and remove recognized model caches. Questions and answers are never sent to a server.

## Grounding validation

Generation uses deterministic decoding and is limited to 140 new tokens and 180 displayed words. Dates, numbers, multiword proper names and quoted text must occur in the question, persona description or selected evidence. Repeated fragments, abnormally long tokens, very low lexical diversity and malformed text are also rejected. One invalid answer triggers a stricter regeneration. A second failure returns to the deterministic composer.

This validator reduces unsupported details but is not a proof of historical truth. Source quality and locator review remain editorial responsibilities.

## Validation

```powershell
node scripts/generate-voices-81.js
node scripts/benchmark-voices.js
node tests/runner.js
```

The lexical benchmark contains 160 questions, twenty per persona, and requires at least 90 percent top-five retrieval. The optional model also requires a separate human Portuguese benchmark before the old semantic encoder can be removed or the runtime can be described as fully approved.
