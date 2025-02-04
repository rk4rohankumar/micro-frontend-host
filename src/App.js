import React from "react";

import {Tabs} from  'antd'
const { TabPane } = Tabs;

const AnimalApp = React.lazy(() => import("AnimalApp/AnimalApp"));
const ArtWorkApp = React.lazy(() => import("ArtworkApp/ArtworkApp"));
const BooksApp = React.lazy(() => import("BooksApp/BooksApp"));
const CuisinesApp = React.lazy(() => import("CuisinesApp/CuisinesApp"));
const MoviesApp = React.lazy(() => import("MoviesApp/MoviesApp"));
const NewsApp = React.lazy(() => import("NewsApp/NewsApp"));
const PhotosApp = React.lazy(() => import("PhotosApp/PhotosApp"));
const PokemonApp = React.lazy(() => import("PokemonApp/PokemonApp"));
const QuotesApp = React.lazy(() => import("QuotesApp/QuotesApp"));

function App() {
  return (
    <div className="max-w-6xl mx-auto p-4"> 

      <Tabs defaultActiveKey="1" >
      <TabPane tab="Animal" key="1" c>
        <React.Suspense fallback="Loading Animal App...">
          <AnimalApp />
        </React.Suspense>
      </TabPane>
      <TabPane tab="Books" key="2">
        <React.Suspense fallback="Loading Books App...">
          <BooksApp />
        </React.Suspense>
      </TabPane>
      <TabPane tab="Artwork" key="3">
        <React.Suspense fallback="Loading Artwork App...">
          <ArtWorkApp />
        </React.Suspense>
      </TabPane>
      <TabPane tab="Cuisines" key="4">
        <React.Suspense fallback="Loading Cuisines App...">
          <CuisinesApp />
        </React.Suspense>
      </TabPane>
      <TabPane tab="Movies" key="5">
        <React.Suspense fallback="Loading Movies App...">
          <MoviesApp />
        </React.Suspense>
      </TabPane>
      <TabPane tab="News" key="6">
        <React.Suspense fallback="Loading News App...">
          <NewsApp />
        </React.Suspense>
      </TabPane>
      <TabPane tab="Photos" key="7">
        <React.Suspense fallback="Loading Photos App...">
          <PhotosApp />
        </React.Suspense>
      </TabPane>
      <TabPane tab="Pokemon" key="8">
        <React.Suspense fallback="Loading Pokemon App...">
          <PokemonApp />
        </React.Suspense>
      </TabPane>
      <TabPane tab="Quotes" key="9">
        <React.Suspense fallback="Loading Quotes App...">
          <QuotesApp />
        </React.Suspense>
      </TabPane>
    </Tabs>
    </div>
    
  );
}

export default App;