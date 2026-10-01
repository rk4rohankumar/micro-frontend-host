import remotes from '../remotes.json';
import { loadRemoteModule } from './remoteLoaders';

// Tracks every remote's lifecycle (idle → loading → ready | failed) with the
// time its remoteEntry + exposed module took to arrive. Exposed as an
// external store so the status strip re-renders without prop drilling.
const byKey = Object.fromEntries(remotes.map((r) => [r.key, r]));

let snapshot = Object.fromEntries(
  remotes.map((r) => [r.key, { state: 'idle', ms: null, error: null, attempts: 0 }]),
);
const listeners = new Set();

function set(key, patch) {
  snapshot = { ...snapshot, [key]: { ...snapshot[key], ...patch } };
  listeners.forEach((l) => l());
}

export const registry = {
  // Exposed in development for debugging and Playwright assertions.
  ...(process.env.NODE_ENV !== 'production' ? { _debug: () => snapshot } : {}),
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return snapshot;
  },
  load(key) {
    const t0 = performance.now();
    set(key, { state: 'loading', error: null, attempts: snapshot[key].attempts + 1 });
    return loadRemoteModule(byKey[key]).then(
      (mod) => {
        set(key, { state: 'ready', ms: Math.round(performance.now() - t0) });
        return mod;
      },
      (err) => {
        set(key, {
          state: 'failed',
          ms: Math.round(performance.now() - t0),
          error: err?.message || String(err),
        });
        throw err;
      },
    );
  },
};

if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  window.__mfeRegistry = registry;
}
