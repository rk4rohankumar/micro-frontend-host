# Micro Frontend Platform — host shell

A container that loads **nine independently built and deployed React apps at runtime** with Webpack Module Federation. Each child lives in its own repo and its own Vercel project; the host only knows their `remoteEntry.js` URLs.

Live: https://micro-frontend-host-khaki.vercel.app

## What the shell does

- **One route per remote** (`/animals`, `/books`, …). Deep links and reloads land on the right app; the browser back button works.
- **Loads on demand, at runtime.** Remotes are not declared to webpack. The shell injects a remote's `remoteEntry.js` when you first route to it, hands it the host's share scope and asks the container for the exposed module. Opening the shell no longer downloads nine bundles, and re-pointing a remote is a JSON edit.
- **Fails in isolation.** Each remote renders inside an error boundary. A dead or slow deployment shows a retry card; the other eight keep working.
- **Shows its own plumbing.** The status strip reports every remote's host, lifecycle (idle → loading → ready/failed) and load time, measured around the federated import.
- **Shares React as a singleton** so host and remotes run one copy (two copies break hooks).

## Layout

```
src/remotes.json            runtime manifest: key, scope, exposed module, label, deploy URL, repo
src/lib/remoteLoaders.js    runtime container loading (script inject → init share scope → get)
src/lib/remoteRegistry.js   lifecycle + timing store behind the status strip
src/components/             RemoteBoundary, RemoteStatusStrip, loading / failed / 404 states
src/App.js                  router + shell
craco.config.js             ModuleFederationPlugin: shared React singleton only, no static remotes
vercel.json                 SPA rewrite so /books resolves on a static host
```

## Remotes

| Route | Scope | Repo |
| --- | --- | --- |
| /animals | AnimalApp | [animal-child-app](https://github.com/rk4rohankumar/animal-child-app) |
| /books | BooksApp | [books-child-app](https://github.com/rk4rohankumar/books-child-app) |
| /artwork | ArtworkApp | [artwork-child-app](https://github.com/rk4rohankumar/artwork-child-app) |
| /cuisines | CuisinesApp | [cuisines-child-app](https://github.com/rk4rohankumar/cuisines-child-app) |
| /movies | MoviesApp | [movies-child-app](https://github.com/rk4rohankumar/movies-child-app) |
| /news | NewsApp | [news-child-app](https://github.com/rk4rohankumar/news-child-app) |
| /photos | PhotosApp | [photos-child-app](https://github.com/rk4rohankumar/photos-child-app) |
| /pokemon | PokemonApp | [pokemon-child-app](https://github.com/rk4rohankumar/pokemon-child-app) |
| /quotes | QuotesApp | [qoutes-child-app](https://github.com/rk4rohankumar/qoutes-child-app) |

Each child exposes `./<Scope>` from `src/App` via its own `ModuleFederationPlugin` and serves `remoteEntry.js` from its deployment root.

## Run

```bash
npm install
npm start        # http://localhost:3000, loads the live remotes
npm run build    # production bundle in build/
```

To point a route at a local child, change its `url` in `src/remotes.json` (e.g. `http://localhost:3001`). No webpack config changes needed.

## Stack

React 19 · react-router 7 · Webpack 5 Module Federation · CRACO · Tailwind CSS 3 · Ant Design 5
