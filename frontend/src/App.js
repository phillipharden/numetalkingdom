import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminLoginScreen from "./admin-screens/AdminLoginScreen";
import AdminScreen from "./admin-screens/AdminScreen";
import AdminBandsScreen from "./admin-screens/AdminBandsScreen";
import AdminReleasesScreen from "./admin-screens/AdminReleasesScreen";
import AdminArticlesScreen from "./admin-screens/AdminArticlesScreen";
import AdminPlaylistsScreen from "./admin-screens/AdminPlaylistsScreen";

import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeScreen from "./screens/HomeScreen";
import BandsScreen from "./screens/BandsScreen";
import BandDetailScreen from "./screens/BandDetailsScreen";
import AboutScreen from "./screens/AboutScreen";
import ReleasesPage from "./screens/ReleasesPage";
import ArticlesScreen from "./screens/NewsScreen";
import ArticleDetailsScreen from "./screens/NewsDetailsScreen";
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
        <Route path="/playlists" element={<PlaylistsScreen />} />
        <Route path="/about" element={<AboutScreen />} />
        <Route path="/releases" element={<ReleasesPage />} />
        <Route path="/news" element={<ArticlesScreen />} />
        <Route path="/news/:slug" element={<ArticleDetailsScreen />} />

        <Route path="/admin-login" element={<AdminLoginScreen />} />
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminScreen />
          </ProtectedAdminRoute>
        }
        />
        <Route path="/admin-bands" element={
          <ProtectedAdminRoute>
            <AdminBandsScreen />
          </ProtectedAdminRoute>
        }
        />
        <Route path="/admin-releases" element={
          <ProtectedAdminRoute>
            <AdminReleasesScreen />
          </ProtectedAdminRoute>
        }
        />
        <Route
          path="/admin-articles" element={
            <ProtectedAdminRoute>
              <AdminArticlesScreen />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-playlists"
          element={
            <ProtectedAdminRoute>
              <AdminPlaylistsScreen />
            </ProtectedAdminRoute>
          }
        />






      </Routes>
      <Footer />
    </Router>
  );
}

export default App;