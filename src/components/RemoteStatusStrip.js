import React, { useSyncExternalStore } from 'react';
import remotes from '../remotes.json';
import { registry } from '../lib/remoteRegistry';

const DOT = {
  idle: 'bg-gray-300',
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
  return (
    <ul
      aria-label="Remote status"
      className="mb-4 grid grid-cols-3 gap-2 text-xs sm:grid-cols-5 lg:grid-cols-9"
    >
      {remotes.map((r) => {
        const s = snap[r.key];
        const active = r.key === activeKey;
        return (
          <li
            key={r.key}
            className={`rounded-md border px-2 py-1.5 ${
              active ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
            aria-current={active ? 'true' : undefined}
          >
            <div className="flex items-center gap-1.5">
              <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${DOT[s.state]}`} />
              <span className="truncate font-medium text-gray-900">{r.label}</span>
            </div>
            <div className="mt-0.5 truncate text-gray-600" title={r.url}>
              {new URL(r.url).host}
            </div>
            <div className="mt-0.5 text-gray-700" aria-live={active ? 'polite' : undefined}>
              {describe(s)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
