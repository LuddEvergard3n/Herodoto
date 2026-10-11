/**
 * Reversible feature switches for the Herodoto 8 rollout.
 * `?legacy=1` disables every v8 surface without changing stored preferences.
 */
const DEFAULTS = Object.freeze({
  mobileShellV8: true,
  voicesV8: true,
  timelineV8: true,
  lusophoneDatasetsV8: true,
});

const legacyRequested = new URLSearchParams(window.location.search).get('legacy') === '1';

export const FEATURES = Object.freeze(
  Object.fromEntries(Object.entries(DEFAULTS).map(([key, enabled]) => [key, legacyRequested ? false : enabled]))
);

export function featureEnabled(name) {
  return FEATURES[name] === true;
}

export function applyFeatureState(root = document.documentElement) {
  root.classList.toggle('legacy-mode', legacyRequested);
  root.dataset.herodotoVersion = legacyRequested ? '7' : '8';
  for (const [name, enabled] of Object.entries(FEATURES)) {
    root.classList.toggle(`feature-${name}`, enabled);
  }
}

export function legacyMode() {
  return legacyRequested;
}
