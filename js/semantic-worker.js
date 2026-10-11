const MODULE_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1/+esm';
const MODEL_ID = 'Xenova/multilingual-e5-small';
const MODEL_REVISION = '761b726dd34fb83930e26aab4e9ac3899aa1fa78';

let extractor = null;
let cancelled = false;

function cosine(a, b) {
  let dot = 0;
  let aa = 0;
  let bb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  return dot / (Math.sqrt(aa) * Math.sqrt(bb) || 1);
}

async function initialize() {
  if (extractor) return;
  const { pipeline, env } = await import(MODULE_URL);
  env.allowLocalModels = false;
  extractor = await pipeline('feature-extraction', MODEL_ID, {
    dtype: 'q8',
    revision: MODEL_REVISION,
    progress_callback: progress => postMessage({ type: 'progress', progress }),
  });
}

async function embed(texts) {
  const output = await extractor(texts, { pooling: 'mean', normalize: true });
  return output.tolist();
}

self.addEventListener('message', async event => {
  const { type, id, question, documents } = event.data || {};
  if (type === 'cancel') { cancelled = true; return; }
  if (type !== 'rank') return;
  cancelled = false;
  try {
    await initialize();
    if (cancelled) return;
    const vectors = await embed([`query: ${question}`, ...documents.map(text => `passage: ${text}`)]);
    if (cancelled) return;
    const scores = vectors.slice(1).map(vector => cosine(vectors[0], vector));
    postMessage({ type: 'result', id, scores });
  } catch (error) {
    postMessage({ type: 'error', id, message: error.message });
  }
});
