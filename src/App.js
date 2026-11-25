import React, { Suspense, useState, useSyncExternalStore } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ConfigProvider, Tabs, theme } from 'antd';
import remotes from './remotes.json';
import { lazyRemote } from './lib/remoteComponents';
import { registry } from './lib/remoteRegistry';
import { RemoteBoundary } from './components/RemoteBoundary';
import { RemoteStatusStrip, RemoteViewport } from './components/RemoteStatusStrip';
import { RemoteFailed, RemoteLoading, NotFound } from './components/RemoteStates';

// A dark runtime console; emerald marks loaded remotes and the active tab.
const THEME = { algorithm: theme.darkAlgorithm, token: { colorPrimary: '#34d399', colorBgBase: '#020617' } };
const HOST_REPO = 'https://github.com/rk4rohankumar/micro-frontend-host';
const PORTFOLIO = 'https://saturofolio.vercel.app/projects/micro-frontend-platform';

function Shell() {
  const navigate = useNavigate();
  const { key } = useParams();
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">Module Federation · runtime console</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">Micro Frontend Platform</h1>
          <p className="mt-1 text-sm text-slate-400">
            One shell, nine React apps built and deployed on their own, loaded at runtime with
            Webpack Module Federation. Only the app you open is fetched.
          </p>
        </div>
        <nav aria-label="Project links" className="flex gap-4 text-sm">
          <a className="text-sky-300 hover:underline" href={HOST_REPO} target="_blank" rel="noopener noreferrer">
            Source
          </a>
          <a className="text-sky-300 hover:underline" href={PORTFOLIO} target="_blank" rel="noopener noreferrer">
            Case study
          </a>
        </nav>
      </header>

      <RemoteStatusStrip activeKey={key} />

      <Tabs
        activeKey={key}
        // flushSync opts out of the router's transition so the loading
        // skeleton shows at once instead of the previous app lingering.
        onChange={(k) => navigate(`/${k}`, { flushSync: true })}
        // Hovering or focusing a tab starts fetching that remote, so the click is instant.
        items={remotes.map((r) => ({
          key: r.key,
          label: (
            <span onMouseEnter={() => registry.prefetch(r.key)} onFocus={() => registry.prefetch(r.key)}>
              {r.label}
            </span>
          ),
        }))}
      />

      <RemoteViewport remoteKey={key}>
        <Outlet />
      </RemoteViewport>
    </div>
  );
}

function RemoteRoute() {
  const { key } = useParams();
  const remote = remotes.find((r) => r.key === key);
  // A rejected React.lazy stays rejected; Retry bumps the generation and
  // lazyRemote hands back a fresh, cached component for it.
  const [attempt, setAttempt] = useState(0);
  // Toggling the simulated outage remounts the remote with a fresh component.
  const epoch = useSyncExternalStore(registry.subscribe, () => (remote ? registry.getSnapshot()[remote.key].epoch : 0));

  if (!remote) return <NotFound />;
  const Remote = lazyRemote(remote.key, `${attempt}:${epoch}`);

  return (
    <RemoteBoundary
      resetKey={`${remote.key}:${attempt}:${epoch}`}
      fallback={(error) => (
        <RemoteFailed remote={remote} error={error} onRetry={() => setAttempt((a) => a + 1)} />
      )}
    >
      <Suspense fallback={<RemoteLoading remote={remote} />}>
        <Remote />
      </Suspense>
    </RemoteBoundary>
  );
}

export default function App() {
  return (
    <ConfigProvider theme={THEME}>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Navigate to={`/${remotes[0].key}`} replace />} />
            <Route path=":key" element={<RemoteRoute />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
