// parent-app/craco.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
module.exports = {
  style: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.output.publicPath = 'http://localhost:3000/';
      
      webpackConfig.plugins.push(
        new ModuleFederationPlugin({
          name: 'ParentApp',
          remotes: {
            AnimalApp: 'AnimalApp@http://localhost:3001/remoteEntry.js',
            ArtworkApp: 'ArtworkApp@http://localhost:3002/remoteEntry.js',
            BooksApp: 'BooksApp@http://localhost:3003/remoteEntry.js',
            CuisinesApp: 'CuisinesApp@http://localhost:3004/remoteEntry.js',
            MoviesApp: 'MoviesApp@http://localhost:3005/remoteEntry.js',
            NewsApp: 'NewsApp@http://localhost:3006/remoteEntry.js',
            PhotosApp: 'PhotosApp@http://localhost:3007/remoteEntry.js',
            PokemonApp: 'PokemonApp@http://localhost:3008/remoteEntry.js',
            QuotesApp: 'QuotesApp@http://localhost:3009/remoteEntry.js',
          },
          shared: {
            react: { eager: true },
            'react-dom': { eager: true },
            'tailwindcss': { eager: true }
          },
        })
      );
      return webpackConfig;
    },
  },
};