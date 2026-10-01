const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const { dependencies } = require('./package.json');

// Tailwind: react-scripts 5 wires the tailwindcss PostCSS plugin itself when
// tailwind.config.js exists. The old `style.postcss.plugins` override here used
// the CRACO 6 API, which CRACO 7 ignores — and it left the @tailwind directives
// unprocessed in the shipped CSS.
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 'auto' derives chunk URLs from the running bundle's own URL, so the
      // same build serves Vercel and a local preview. Dev keeps CRA's '/'.
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.output.publicPath = 'auto';
      }

      webpackConfig.plugins.push(
        new ModuleFederationPlugin({
          name: 'ParentApp',
          // No static `remotes`: containers are loaded at runtime from
          // src/remotes.json (see src/lib/remoteLoaders.js). Declaring them
          // here makes webpack fetch every remoteEntry during share-scope init.
          // React must be a singleton across host + remotes — two copies break
          // hooks. Eager on the host because the shell renders before any
          // remote is negotiated.
          shared: {
            react: { singleton: true, eager: true, requiredVersion: dependencies.react },
            'react-dom': { singleton: true, eager: true, requiredVersion: dependencies['react-dom'] },
          },
        }),
      );
      return webpackConfig;
    },
  },
};
