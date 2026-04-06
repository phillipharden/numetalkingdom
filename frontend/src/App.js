// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import ScrollToTop from "./components/ScrollToTop";

// import Header from "./components/Header";
// import Footer from "./components/Footer";
// import HomeScreen from "./screens/HomeScreen";
// import BandsScreen from "./screens/BandsScreen";
// import BandDetailScreen from "./screens/BandDetailsScreen";
// import NewMusicScreen from "./screens/NewMusicScreen";
// import DiscoverScreen from "./screens/DiscoverScreen";
// import AboutScreen from "./screens/AboutScreen";
// import ReleasesPage from "./screens/ReleasesPage";
// import ArticlesScreen from "./screens/ArticlesScreen";
// import ArticleDetailsScreen from "./screens/ArticleDetailsScreen";
// import PlaylistsScreen from "./screens/PlaylistsScreen";



// function App() {
//   return (
//     <Router>
//       <ScrollToTop />
//       <Header />
//       <Routes>
//         <Route path="/" element={<HomeScreen />} />
//         <Route path="/bands" element={<BandsScreen />} />
//         <Route path="/bands/:slug" element={<BandDetailScreen />} />
//         <Route path="/new-music" element={<NewMusicScreen />} />
//         <Route path="/playlists" element={<PlaylistsScreen />} />
//         <Route path="/about" element={<AboutScreen />} />
//         <Route path="/releases" element={<ReleasesPage />} />
//         <Route path="/articles" element={<ArticlesScreen />} />
//         <Route path="/articles/:slug" element={<ArticleDetailsScreen />} />
//       </Routes>
//       <Footer />

//     </Router>
//   );
// }

// export default App;


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminLoginScreen from "./screens/AdminLoginScreen";
import AdminScreen from "./screens/AdminScreen";
import AdminBandsScreen from "./screens/AdminBandsScreen";
import AdminReleasesScreen from "./screens/AdminReleasesScreen";
import AdminArticlesScreen from "./screens/AdminArticlesScreen";

import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeScreen from "./screens/HomeScreen";
import BandsScreen from "./screens/BandsScreen";
import BandDetailScreen from "./screens/BandDetailsScreen";
import NewMusicScreen from "./screens/NewMusicScreen";
import AboutScreen from "./screens/AboutScreen";
import ReleasesPage from "./screens/ReleasesPage";
import ArticlesScreen from "./screens/ArticlesScreen";
import ArticleDetailsScreen from "./screens/ArticleDetailsScreen";
import PlaylistsScreen from "./screens/PlaylistsScreen";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/bands" element={<BandsScreen />} />
        <Route path="/bands/:slug" element={<BandDetailScreen />} />
        <Route path="/new-music" element={<NewMusicScreen />} />
        <Route path="/playlists" element={<PlaylistsScreen />} />
        <Route path="/about" element={<AboutScreen />} />
        <Route path="/releases" element={<ReleasesPage />} />
        <Route path="/articles" element={<ArticlesScreen />} />
        <Route path="/articles/:slug" element={<ArticleDetailsScreen />} />

        <Route path="/admin-login" element={<AdminLoginScreen />} />
         <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminScreen />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin-bands" element={
          <ProtectedAdminRoute>
            <AdminBandsScreen />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin-releases" element={
          <ProtectedAdminRoute>
            <AdminReleasesScreen />
          </ProtectedAdminRoute>
        } />
        <Route
          path="/admin-articles" element={
            <ProtectedAdminRoute>
              <AdminArticlesScreen />
            </ProtectedAdminRoute>
          } />






      </Routes>
      <Footer />
    </Router>
  );
}

export default App;