import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FaSpotify } from "react-icons/fa";

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

  if (loading) {
    return (
      <section className="container py-5">
        <h1 className="mb-4">Playlists</h1>
        <p>Loading playlists...</p>
      </section>
    );
  }

  return (
    <section className="container py-5">
      <h1 className="mb-4">Playlists</h1>

      {playlists.length === 0 ? (
        <p>No playlists found.</p>
      ) : (
        <div className="row">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="col-12 mb-5">
              <div className="playlist-card">
                <div className="row align-items-start">
                  <div className="col-12 col-md-4 mb-4 mb-md-0">
                    {playlist.image_url && (
                      <img
                        src={playlist.image_url}
                        alt={playlist.title}
                        className="playlist-image"
                      />
                    )}
                  </div>

                  <div className="col-12 col-md-8">
                    <h2>{playlist.title}</h2>

                    {playlist.description && <p>{playlist.description}</p>}

                    {playlist.external_url && (
                      <a
                        href={playlist.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="playlist-btn"
                      >
                        <FaSpotify />
                        Open Playlist
                      </a>
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
                        ></iframe>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PlaylistsScreen;