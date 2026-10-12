const MANIFEST_URL = 'data/voices-models.json';
const CACHE_NAMES = ['transformers-cache', 'onnx-community'];

let worker = null;
let manifest = null;
let requestSequence = 0;
let status = Object.freeze({ tier: 'deterministic', state: 'idle', progress: 0, error: null });
const listeners = new Set();
const pending = new Map();

function update(next) {
  status = Object.freeze({ ...status, ...next });
  listeners.forEach(listener => listener(status));
}

async function loadManifest() {
  if (manifest) return manifest;
  const response = await fetch(MANIFEST_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${MANIFEST_URL}`);
  manifest = await response.json();
  return manifest;
}

function ensureWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('./voices-runtime-worker.js', import.meta.url), { type: 'module' });
  worker.addEventListener('message', event => {
    const message = event.data || {};
    if (message.type === 'progress') {
      const value = Number(message.progress?.progress ?? message.progress ?? 0);
      update({ state: 'loading', progress: Number.isFinite(value) ? value : status.progress });
    } else if (message.type === 'ready') {
      update({ tier: message.tier, state: 'ready', progress: 1, error: null });
      pending.get('prepare')?.resolve(status);
      pending.delete('prepare');
    } else if (message.type === 'generated' || message.type === 'error') {
      const operation = pending.get(message.requestId);
      if (!operation) return;
      pending.delete(message.requestId);
      if (message.type === 'error') operation.reject(new Error(message.error));
      else operation.resolve(message);
    }
  });
  worker.addEventListener('error', event => {
    update({ tier: 'deterministic', state: 'error', error: event.message || 'worker_error' });
    pending.get('prepare')?.reject(new Error(status.error));
    pending.delete('prepare');
  });
  return worker;
}

export function getVoiceRuntimeStatus() {
  return status;
}

export function onVoiceRuntimeStatus(listener) {
  listeners.add(listener);
  listener(status);
  return () => listeners.delete(listener);
}

export async function inspectVoiceRuntimeEligibility(tier = 'lite', automatic = false) {
  const models = await loadManifest();
  const model = models.models[tier];
  if (!model) return { eligible: false, reason: 'unknown_tier' };
  if (!globalThis.isSecureContext || !('gpu' in navigator)) return { eligible: false, reason: 'webgpu_unavailable' };
  if (tier === 'enhanced' && matchMedia('(pointer: coarse)').matches) return { eligible: false, reason: 'desktop_required' };
  if (automatic) {
    if (document.visibilityState !== 'visible' || !navigator.onLine) return { eligible: false, reason: 'page_or_network_unavailable' };
    const connection = navigator.connection;
    if (!connection) return { eligible: false, reason: 'connection_api_unavailable' };
    if (connection.saveData || ['slow-2g', '2g', '3g'].includes(connection.effectiveType)) return { eligible: false, reason: 'metered_or_slow_connection' };
    if (navigator.deviceMemory != null && navigator.deviceMemory < model.recommendedMemoryGb) return { eligible: false, reason: 'memory_below_recommendation' };
  }
  if (!navigator.storage?.estimate) {
    return automatic ? { eligible: false, reason: 'storage_api_unavailable' } : { eligible: true, model, storageUnknown: true };
  }
  const estimate = await navigator.storage.estimate();
  const free = Math.max(0, (estimate.quota || 0) - (estimate.usage || 0));
  if (free < model.minimumStorageBytes) return { eligible: false, reason: 'insufficient_storage', freeBytes: free };
  return { eligible: true, model, freeBytes: free };
}

export async function prepareVoiceRuntime({ preferredTier = 'lite', automatic = false } = {}) {
  if (preferredTier === 'deterministic') {
    cancelVoiceRuntimePreparation();
    update({ tier: 'deterministic', state: 'ready', progress: 1, error: null });
    return status;
  }
  if (status.state === 'ready' && status.tier === preferredTier) return status;
  const eligibility = await inspectVoiceRuntimeEligibility(preferredTier, automatic);
  if (!eligibility.eligible) {
    update({ tier: 'deterministic', state: 'manual', progress: 0, error: eligibility.reason });
    return status;
  }
  update({ tier: preferredTier, state: 'loading', progress: 0, error: null });
  return new Promise((resolve, reject) => {
    pending.set('prepare', { resolve, reject });
    ensureWorker().postMessage({ type: 'prepare', tier: preferredTier, model: eligibility.model });
  });
}

export function cancelVoiceRuntimePreparation() {
  worker?.terminate();
  worker = null;
  pending.forEach(operation => operation.reject(new Error('cancelled')));
  pending.clear();
  update({ tier: 'deterministic', state: 'cancelled', progress: 0, error: null });
}

export async function clearVoiceModelCache() {
  cancelVoiceRuntimePreparation();
  if (!('caches' in globalThis)) return 0;
  const names = await caches.keys();
  const targets = names.filter(name => CACHE_NAMES.some(fragment => name.toLowerCase().includes(fragment)));
  await Promise.all(targets.map(name => caches.delete(name)));
  update({ tier: 'deterministic', state: 'idle', progress: 0, error: null });
  return targets.length;
}

export async function generateWithVoiceRuntime(messages, options = {}) {
  if (status.state !== 'ready' || status.tier === 'deterministic') throw new Error('runtime_not_ready');
  const requestId = `voice-${++requestSequence}`;
  return new Promise((resolve, reject) => {
    pending.set(requestId, { resolve, reject });
    ensureWorker().postMessage({ type: 'generate', requestId, messages, temperature: options.temperature });
  });
}
