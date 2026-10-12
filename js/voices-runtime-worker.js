let generator = null;
let activeTier = 'deterministic';
let cancelled = false;

function post(type, detail = {}) {
  self.postMessage({ type, ...detail });
}

async function prepare(message) {
  cancelled = false;
  const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1');
  env.allowLocalModels = false;
  if (cancelled) return;
  generator = await pipeline('text-generation', message.model.id, {
    revision: message.model.revision,
    device: 'webgpu',
    dtype: message.model.dtype,
    progress_callback: progress => post('progress', { progress }),
  });
  if (cancelled) return;
  activeTier = message.tier;
  post('ready', { tier: activeTier });
}

async function generate(message) {
  if (!generator) throw new Error('runtime_not_ready');
  cancelled = false;
  const output = await generator(message.messages, {
    max_new_tokens: 140,
    do_sample: false,
    repetition_penalty: 1.1,
  });
  if (cancelled) return;
  const generated = output?.[0]?.generated_text;
  const text = Array.isArray(generated) ? generated.at(-1)?.content : generated;
  post('generated', { requestId: message.requestId, text: String(text || '').trim(), tier: activeTier });
}

self.addEventListener('message', event => {
  const message = event.data || {};
  if (message.type === 'cancel') {
    cancelled = true;
    return;
  }
  const operation = message.type === 'prepare' ? prepare(message) : message.type === 'generate' ? generate(message) : null;
  if (operation) operation.catch(error => post('error', { requestId: message.requestId, error: error?.message || String(error) }));
});
