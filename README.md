# Microfrontend Parent Application

A container application that orchestrates multiple microfrontends using Webpack Module Federation.

## 🚀 Features
- Integrates 9 independent microfrontends
- Dynamic loading of child applications
- Shared dependency management (React, Tailwind CSS)
- Production-ready configuration
- Styled with Tailwind CSS and Ant Design

## 📦 Integrated Child Applications
1. **Animal App** - `AnimalApp@[URL]`
2. **Artwork App** - `ArtworkApp@[URL]`
3. **Books App** - `BooksApp@[URL]`
4. **Cuisines App** - `CuisinesApp@[URL]`
5. **Movies App** - `MoviesApp@[URL]`
6. **News App** - `NewsApp@[URL]`
7. **Photos App** - `PhotosApp@[URL]`
8. **Pokemon App** - `PokemonApp@[URL]`
9. **Quotes App** - `QuotesApp@[URL]`

## 🛠️ Technology Stack
- React 19
- Webpack Module Federation
- Tailwind CSS 3
- Ant Design
- CRACO (Create React App Configuration Override)

## ⚙️ Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Ensure all child applications are deployed and accessible at their respective URLs

## 🔧 Configuration
The core configuration is in `craco.config.js`:
```javascript
module.exports = {
  // PostCSS configuration for Tailwind
  style: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  
  // Webpack Module Federation setup
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.output.publicPath = 'https://micro-frontend-host-khaki.vercel.app/';
      
      webpackConfig.plugins.push(
        new ModuleFederationPlugin({
          name: 'ParentApp',
          remotes: {
            // List of all remote applications
            AnimalApp: 'AnimalApp@[URL]',
            // ... other remotes
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
```

## 🏃 Running the Application
```bash
npm start
```

## 🏗️ Production Build
```bash
npm run build
```

## 🌐 Deployment
The application is configured for deployment to Vercel:
1. Set environment variables:
```bash
VERCEL_URL=https://micro-frontend-host-khaki.vercel.app/
```

2. Ensure all child applications are deployed before parent app

## 🎨 Styling
- Uses Tailwind CSS for core styling
- Ant Design components for UI elements
- Shared Tailwind configuration across microfrontends
- CSS isolation through container scoping

## 🔄 Dependency Management
Shared across all microfrontends:
- React 19
- React DOM 19
- Tailwind CSS 3.4

## 🚨 Troubleshooting
Common issues and solutions:

1. **Failed to load remote entry**
   - Verify child applications are running
   - Check CORS headers on child applications
   - Ensure correct URLs in `craco.config.js`

2. **Style conflicts**
   - Verify Tailwind prefix configurations
   - Check container scoping in child apps

3. **Build errors**
   - Ensure consistent dependency versions
   - Clear node_modules and rebuild

## 📄 License
MIT License
```

Key elements included:
1. Clear project structure overview
2. Configuration details specific to your setup
3. Deployment instructions for Vercel
4. Troubleshooting common microfrontend issues
5. Dependency management information
6. Styling approach documentation

Would you like me to add any specific sections or modify any existing content?