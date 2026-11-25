import React, { useEffect, useSyncExternalStore } from 'react';
import { ConfigProvider, Switch, theme } from 'antd';
import remotes from '../remotes.json';
import { registry } from '../lib/remoteRegistry';

const DOT = {
  idle: 'bg-slate-600',
  loading: 'bg-amber-400 animate-pulse',
  ready: 'bg-emerald-500',
  failed: 'bg-red-500',
};

function describe(s) {
  if (s.state === 'ready') return `${s.prefetched ? 'prefetched · ' : ''}${s.ms} ms`;
  if (s.state === 'loading') return s.prefetched ? 'prefetching…' : 'loading…';
  if (s.state === 'failed') return `failed${s.attempts > 1 ? ` · ${s.attempts} tries` : ''}`;
  return s.outage ? 'offline (simulated)' : 'not loaded';
}

function ago(iso) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(m)) return '';
  if (m < 60) return `${Math.max(m, 1)} min ago`;
  if (m < 48 * 60) return `${Math.round(m / 60)} h ago`;
  return `${Math.round(m / 1440)} d ago`;
}

function useRegistry() {
  return useSyncExternalStore(registry.subscribe, registry.getSnapshot);
}

export function RemoteStatusStrip({ activeKey }) {
  const snap = useRegistry();
  useEffect(() => registry.loadVersions(), []);
  // Load bars are scaled to the slowest remote loaded so far.
  const slowest = Math.max(1, ...remotes.map((r) => (snap[r.key].state === 'ready' ? snap[r.key].ms : 0)));
  const loaded = remotes.filter((r) => snap[r.key].state === 'ready').length;
  return (
    <section aria-label="Runtime" className="mb-5 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
      <p className="mb-2 flex justify-between px-1 text-xs text-slate-400">
        <span>Remotes · each deployed on its own</span>
        <span>{loaded} of {remotes.length} fetched</span>
      </p>
      <ul aria-label="Remote status" className="grid grid-cols-3 gap-2 text-xs sm:grid-cols-5 lg:grid-cols-9">
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
                <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${s.outage ? 'bg-red-500' : DOT[s.state]}`} />
                <span className="truncate font-medium text-slate-100">{r.label}</span>
              </div>
              <div className="mt-0.5 truncate font-mono text-[11px] text-slate-500" title={s.version ? `${s.version.commit} · built ${s.version.builtAt}` : r.url}>
                {s.version ? `${s.version.commit.slice(0, 7)} · ${ago(s.version.builtAt)}` : new URL(r.url).host}
              </div>
              <div className="mt-0.5 truncate text-slate-300" aria-live={active ? 'polite' : undefined}>
                {describe(s)}
              </div>
              <div aria-hidden="true" className="mt-1 h-0.5 rounded bg-slate-800">
                <div
                  className="h-full rounded bg-emerald-400"
                  style={{ width: s.state === 'ready' ? `${(s.ms / slowest) * 100}%` : 0 }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <EventBus />
    </section>
  );
}

// Events remotes broadcast on window; the shell listens without importing them.
function EventBus() {
  const { events, favourites } = useRegistry();
  const count = Object.keys(favourites).length;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-800 px-1 pt-2 text-xs text-slate-400">
      <span className="text-slate-300">
        Event bus · <span className="text-emerald-300">{count} favourite{count === 1 ? '' : 's'}</span>
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-[11px]" aria-live="polite">
        {events.length
          ? events.map((e) => `${e.app} → ${e.type}${e.name ? `(${e.name})` : ''}${e.on === false ? ' off' : ''}`).join('  ·  ')
          : 'waiting for a remote to publish (try ♡ on a breed)'}
      </span>
    </div>
  );
}

// The shared design system: tokens the host serves to every remote at runtime.
// Remotes read them with fallbacks, so they still look right when run standalone.
const TOKENS = {
  colorScheme: 'light',
  '--mfe-surface': '#ffffff',
  '--mfe-sunken': '#f8fafc',
  '--mfe-ink': '#0f172a',
  '--mfe-muted': '#475569',
  '--mfe-border': '#e2e8f0',
  '--mfe-accent': '#047857',
  '--mfe-accent-soft': '#ecfdf5',
  '--mfe-accent-ink': '#065f46',
  '--mfe-radius': '12px',
};

// The open remote, framed with which container is mounted and where it came from.
export function RemoteViewport({ remoteKey, children }) {
  const snap = useRegistry();
  const remote = remotes.find((r) => r.key === remoteKey);
  const s = remote && snap[remote.key];
  return (
    <main id="remote-outlet" className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      {remote && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-slate-800 bg-slate-900 px-4 py-2 font-mono text-xs text-slate-400">
          <span className={`h-2 w-2 rounded-full ${s.outage ? 'bg-red-500' : DOT[s.state]}`} aria-hidden="true" />
          <span className="text-slate-200">{remote.scope}{remote.module.slice(1)}</span>
          <span className="truncate">{new URL(remote.url).host}/remoteEntry.js</span>
          <span className="ml-auto">{describe(s)}</span>
          <label className="flex items-center gap-2 font-sans text-slate-300">
            <Switch size="small" checked={s.outage} onChange={(on) => registry.setOutage(remote.key, on)} />
            Simulate outage
          </label>
        </div>
      )}
      {/* Remotes ship their own light styling, so the mount point and its fallbacks stay light. */}
      <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm, token: { colorPrimary: '#047857', colorBgBase: '#ffffff', colorTextBase: '#0f172a' } }}>
        <div className="bg-white p-2 text-gray-900 sm:p-4" style={TOKENS}>{children}</div>
      </ConfigProvider>
    </main>
  );
}
