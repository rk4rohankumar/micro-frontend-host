import remotes from '../remotes.json';
import { loadRemoteModule } from './remoteLoaders';

// Tracks every remote's lifecycle (idle → loading → ready | failed) with the
// time its remoteEntry + exposed module took to arrive, whether it was
// prefetched on hover, a simulated outage switch, and the version each remote
// published. Also records events remotes broadcast on the window bus.
// Exposed as an external store so the console re-renders without prop drilling.
const byKey = Object.fromEntries(remotes.map((r) => [r.key, r]));

export const BUS_EVENT = 'mfe:event';

let snapshot = {
  ...Object.fromEntries(
    remotes.map((r) => [
      r.key,
      { state: 'idle', ms: null, error: null, attempts: 0, prefetched: false, outage: false, epoch: 0, version: null },
    ]),
  ),
  events: [],
  favourites: {},
};
const listeners = new Set();
const pending = new Map(); // key -> in-flight or settled load promise

function emit() {
  listeners.forEach((l) => l());
}

function set(key, patch) {
  snapshot = { ...snapshot, [key]: { ...snapshot[key], ...patch } };
  emit();
}

function start(key, { prefetch }) {
  const t0 = performance.now();
  set(key, { state: 'loading', error: null, attempts: snapshot[key].attempts + 1, prefetched: prefetch });
  const p = (snapshot[key].outage
    ? Promise.reject(new Error('Simulated outage: the remote is unreachable.'))
    : loadRemoteModule(byKey[key])
  ).then(
    (mod) => {
      set(key, { state: 'ready', ms: Math.round(performance.now() - t0) });
      return mod;
    },
    (err) => {
      pending.delete(key);
      set(key, { state: 'failed', ms: Math.round(performance.now() - t0), error: err?.message || String(err) });
      throw err;
    },
  );
  pending.set(key, p);
  return p;
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
  // A load already under way (or done) is reused, so a hover prefetch makes the click instant.
  load(key) {
    return pending.get(key) ?? start(key, { prefetch: false });
  },
  prefetch(key) {
    const s = snapshot[key];
    if (s.outage || pending.has(key) || s.state === 'failed') return;
    start(key, { prefetch: true }).catch(() => {});
  },
  setOutage(key, outage) {
    pending.delete(key);
    // A new epoch gives the route a fresh lazy component, so the next mount really reloads.
    set(key, { outage, state: 'idle', error: null, attempts: 0, prefetched: false, epoch: snapshot[key].epoch + 1 });
  },
  // Each remote publishes /version.json at build time; fetched once, off the critical path.
  loadVersions() {
    remotes.forEach((r) => {
      fetch(`${r.url}/version.json`, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((v) => v && set(r.key, { version: v }))
        .catch(() => {});
    });
  },
  record(detail) {
    const favourites = { ...snapshot.favourites };
    if (detail?.type === 'favourite') {
      if (detail.on) favourites[`${detail.app}:${detail.id}`] = detail.name;
      else delete favourites[`${detail.app}:${detail.id}`];
    }
    snapshot = { ...snapshot, favourites, events: [{ ...detail, at: Date.now() }, ...snapshot.events].slice(0, 6) };
    emit();
  },
};

if (typeof window !== 'undefined') {
  // The event bus: remotes dispatch a CustomEvent; neither side imports the other.
  window.addEventListener(BUS_EVENT, (e) => registry.record(e.detail));
  if (process.env.NODE_ENV !== 'production') window.__mfeRegistry = registry;
}
