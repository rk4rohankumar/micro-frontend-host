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
      webpackConfig.output.publicPath = 'https://micro-frontend-host-khaki.vercel.app/';
      
      webpackConfig.plugins.push(
        new ModuleFederationPlugin({
          name: 'ParentApp',
          remotes: {
            AnimalApp: 'AnimalApp@https://animal-child-app.vercel.app/remoteEntry.js',
            ArtworkApp: 'ArtworkApp@https://artwork-child-app.vercel.app/remoteEntry.js',
            BooksApp: 'BooksApp@https://books-child-app.vercel.app/remoteEntry.js',
            CuisinesApp: 'CuisinesApp@https://cuisines-child-app.vercel.app/remoteEntry.js',
            MoviesApp: 'MoviesApp@https://movies-child-app.vercel.app/remoteEntry.js',
            NewsApp: 'NewsApp@https://news-child-app.vercel.app/remoteEntry.js',
            PhotosApp: 'PhotosApp@https://photos-child-app.vercel.app/remoteEntry.js',
            PokemonApp: 'PokemonApp@https://pokemon-child-app.vercel.app/remoteEntry.js',
            QuotesApp: 'QuotesApp@https://qoutes-child-app.vercel.app/remoteEntry.js',
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