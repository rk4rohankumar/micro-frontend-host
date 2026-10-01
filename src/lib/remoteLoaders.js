/* global __webpack_init_sharing__, __webpack_share_scopes__ */

// Runtime Module Federation: remotes are NOT declared to webpack. Each one is
// fetched when first routed to — inject its remoteEntry.js, hand it the host's
// share scope (so it reuses the host's React), then ask the container for the
// exposed module. Declaring remotes statically made webpack download all nine
// containers during share-scope init and cache a failed one forever; this way
// only the active app loads and a retry really retries.

const scripts = new Map(); // remoteEntry url -> Promise<void>

function loadScript(url) {
  if (scripts.has(url)) return scripts.get(url);
  const p = new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = url;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      el.remove();
      scripts.delete(url);
      reject(new Error(`Could not download ${url}`));
    };
    document.head.appendChild(el);
  });
  scripts.set(url, p);
  return p;
}

export async function loadRemoteModule({ scope, url, module }) {
  await loadScript(`${url}/remoteEntry.js`);
  const container = window[scope];
  if (!container) throw new Error(`${scope} did not register a container`);
  await __webpack_init_sharing__('default');
  if (!container.__hostInitialized) {
    await container.init(__webpack_share_scopes__.default);
    container.__hostInitialized = true;
  }
  const factory = await container.get(module);
  const mod = factory();
  if (!mod || typeof mod.default !== 'function') {
    throw new Error(`${scope} exposed ${module} without a default React component`);
  }
  return mod;
}
