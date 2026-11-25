import React, { useSyncExternalStore } from 'react';
import remotes from '../remotes.json';
import { registry } from '../lib/remoteRegistry';

const DOT = {
  idle: 'bg-slate-600',
  loading: 'bg-amber-400 animate-pulse',
  ready: 'bg-emerald-500',
  failed: 'bg-red-500',
};

function describe(s) {
  if (s.state === 'ready') return `${s.ms} ms`;
  if (s.state === 'loading') return 'loading…';
  if (s.state === 'failed') return `failed${s.attempts > 1 ? ` · ${s.attempts} tries` : ''}`;
  return 'not loaded';
}

export function RemoteStatusStrip({ activeKey }) {
  const snap = useSyncExternalStore(registry.subscribe, registry.getSnapshot);
  // Load bars are scaled to the slowest remote loaded so far.
  const slowest = Math.max(1, ...remotes.map((r) => (snap[r.key].state === 'ready' ? snap[r.key].ms : 0)));
  const loaded = remotes.filter((r) => snap[r.key].state === 'ready').length;
  return (
    <section aria-label="Runtime" className="mb-5 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
    <p className="mb-2 flex justify-between px-1 text-xs text-slate-400">
      <span>Remotes</span>
      <span>{loaded} of {remotes.length} fetched</span>
    </p>
    <ul
      aria-label="Remote status"
      className="grid grid-cols-3 gap-2 text-xs sm:grid-cols-5 lg:grid-cols-9"
    >
      {remotes.map((r) => {
        const s = snap[r.key];
        const active = r.key === activeKey;
        return (
          <li
            key={r.key}
            className={`rounded-md border px-2 py-1.5 ${
              active ? 'border-emerald-400/60 bg-emerald-400/10' : 'border-slate-800 bg-slate-950'
            }`}
            aria-current={active ? 'true' : undefined}
          >
            <div className="flex items-center gap-1.5">
              <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${DOT[s.state]}`} />
              <span className="truncate font-medium text-slate-100">{r.label}</span>
            </div>
            <div className="mt-0.5 truncate text-slate-500" title={r.url}>
              {new URL(r.url).host}
            </div>
            <div className="mt-0.5 text-slate-300" aria-live={active ? 'polite' : undefined}>
              {describe(s)}
            </div>
            <div aria-hidden="true" className="mt-1 h-0.5 rounded bg-slate-800">
              <div className="h-full rounded bg-emerald-400" style={{ width: s.state === 'ready' ? `${(s.ms / slowest) * 100}%` : 0 }} />
            </div>
          </li>
        );
      })}
    </ul>
    </section>
  );
}

// The open remote, framed with which container is mounted and where it came from.
export function RemoteViewport({ remoteKey, children }) {
  const snap = useSyncExternalStore(registry.subscribe, registry.getSnapshot);
  const remote = remotes.find((r) => r.key === remoteKey);
  const s = remote && snap[remote.key];
  return (
    <main id="remote-outlet" className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      {remote && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-slate-800 bg-slate-900 px-4 py-2 font-mono text-xs text-slate-400">
          <span className={`h-2 w-2 rounded-full ${DOT[s.state]}`} aria-hidden="true" />
          <span className="text-slate-200">{remote.scope}{remote.module.slice(1)}</span>
          <span className="truncate">{new URL(remote.url).host}/remoteEntry.js</span>
          <span className="ml-auto">{describe(s)}</span>
        </div>
      )}
      {/* Remotes ship their own light styling, so the mount point stays light. */}
      <div className="bg-white p-2 text-gray-900 sm:p-4" style={{ colorScheme: 'light' }}>{children}</div>
    </main>
  );
}
