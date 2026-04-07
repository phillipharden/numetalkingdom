import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import RecentArticles from "../components/RecentArticles";
import UpcomingReleases from "../components/UpcomingReleases";

const PlaylistsScreen = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching playlists:", error);
      } else {
        setPlaylists(data || []);
      }

      setLoading(false);
    };

    fetchPlaylists();
  }, []);

  const featuredPlaylist = playlists.find((playlist) => playlist.featured === true);
  const regularPlaylists = playlists.filter((playlist) => playlist.featured !== true);

  if (loading) {
    return (
      <section className="playlists-page py-5">
        <div className="container">
          <h1 className="page-title">Playlists</h1>
          <p>Loading playlists...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="playlists-page py-5">
      <div className="container">
        <div className="row g-5">
          <div className="col-12 col-xl-8">
            <div className="playlists-main">
              <h1 className="page-title">Playlists</h1>
              <p className="page-subtitle">
                Explore curated Christian rock, metal, nu metal, hardcore, and underground heavy music playlists.
              </p>

              {playlists.length === 0 ? (
                <p>No playlists found.</p>
              ) : (
                <>
                  {featuredPlaylist && (
                    <div className="featured-playlist mb-5">
                      <div className="playlist-card featured">
                        <div className="row align-items-start">
                          <div className="col-12 col-md-4 mb-4 mb-md-0">
                            {featuredPlaylist.image_url && (
                              <img
                                src={featuredPlaylist.image_url}
                                alt={featuredPlaylist.title}
                                className="playlist-image"
                              />
                            )}
                          </div>

                          <div className="col-12 col-md-8">
                            <p className="featured-label">Featured Playlist</p>
                            <h2>{featuredPlaylist.title}</h2>

                            {featuredPlaylist.description && (
                              <p>{featuredPlaylist.description}</p>
                            )}

                            {featuredPlaylist.embed_url && (
                              <div className="playlist-embed">
                                <iframe
                                  src={featuredPlaylist.embed_url}
                                  width="100%"
                                  height="352"
                                  frameBorder="0"
                                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                  loading="lazy"
                                  title={featuredPlaylist.title}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {regularPlaylists.length > 0 && (
                    <div className="row">
                      {regularPlaylists.map((playlist) => (
                        <div key={playlist.id} className="col-12 col-lg-6 mb-5">
                          <div className="playlist-card h-100">
                            <div className="col-12 mb-4">
                              {playlist.image_url && (
                                <img
                                  src={playlist.image_url}
                                  alt={playlist.title}
                                  className="playlist-image"
                                />
                              )}
                            </div>

                            <div className="col-12">
                              <h2>{playlist.title}</h2>

                              {playlist.description && (
                                <p>{playlist.description}</p>
                              )}

                              {playlist.embed_url && (
                                <div className="playlist-embed">
                                  <iframe
                                    src={playlist.embed_url}
                                    width="100%"
                                    height="352"
                                    frameBorder="0"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                    title={playlist.title}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <aside className="playlists-sidebar">
              <RecentArticles limit={4} />
              <div className="mt-5">
                <UpcomingReleases limit={5} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlaylistsScreen;