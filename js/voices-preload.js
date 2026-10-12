import { prepareVoiceRuntime } from './voices-runtime.js';
import { featureEnabled } from './features.js';

let scheduled = false;

function schedulePreparation() {
  if (scheduled || !featureEnabled('voicesV8')) return;
  scheduled = true;
  const run = () => prepareVoiceRuntime({ preferredTier: 'lite', automatic: true }).catch(() => {});
  if ('requestIdleCallback' in globalThis) requestIdleCallback(run, { timeout: 12000 });
  else setTimeout(run, 4000);
}

addEventListener('pointerdown', schedulePreparation, { once: true, passive: true });
addEventListener('keydown', schedulePreparation, { once: true });
