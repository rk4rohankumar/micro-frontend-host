import { lazy } from 'react';
import { registry } from './remoteRegistry';

// Lazy components are cached OUTSIDE React. Creating them during render
// (even under useMemo) breaks under transitions: a render that suspends never
// commits, so the memo is discarded, the retry creates a fresh lazy, which
// calls the loader again — an infinite load loop. One lazy per
// (remote, generation); bumping the generation is how "Retry" gets a clean
// component after a rejected load.
const cache = new Map();

export function lazyRemote(key, generation = 0) {
  const id = `${key}#${generation}`;
  if (!cache.has(id)) cache.set(id, lazy(() => registry.load(key)));
  return cache.get(id);
}
