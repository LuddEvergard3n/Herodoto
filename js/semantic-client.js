export function createSemanticClient(onProgress = () => {}) {
  const worker = new Worker('./semantic-worker.js', { type: 'module' });
  const pending = new Map();
  let sequence = 0;

  worker.addEventListener('message', event => {
    if (event.data.type === 'progress') { onProgress(event.data.progress); return; }
    const request = pending.get(event.data.id);
    if (!request) return;
    pending.delete(event.data.id);
    if (event.data.type === 'result') request.resolve(event.data.scores);
    else request.reject(new Error(event.data.message || 'Semantic worker failed'));
  });

  return {
    rank(question, documents) {
      const id = ++sequence;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        worker.postMessage({ type: 'rank', id, question, documents });
      });
    },
    destroy() {
      worker.postMessage({ type: 'cancel' });
      worker.terminate();
      pending.forEach(request => request.reject(new Error('Semantic client closed')));
      pending.clear();
    },
  };
}
