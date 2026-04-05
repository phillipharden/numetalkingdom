import playlists from "../assets/data/playlists-data";

const getPlatformClass = (platform) => {
  switch (platform.toLowerCase()) {
    case "spotify":
      return "platform-badge spotify";
    case "apple music":
      return "platform-badge apple";
    case "youtube":
      return "platform-badge youtube";
    default:
      return "platform-badge";
  }
};

const PlaylistsScreen = () => {
  const featuredPlaylists = playlists.filter((playlist) => playlist.featured);
  const otherPlaylists = playlists.filter((playlist) => !playlist.featured);

  return (
    <section className="playlists-screen container py-5">
      <div className="page-header text-center mb-5">
        <h1 className="page-title">Playlists</h1>
        <p className="page-subtitle">
          Explore Nu Metal Kingdom playlists across Spotify, Apple Music, and
          YouTube.
        </p>
      </div>

      {featuredPlaylists.length > 0 && (
        <div className="featured-playlists mb-5">
          <h2 className="section-title mb-4">Featured Playlists</h2>

          <div className="row g-4">
            {featuredPlaylists.map((playlist) => (
              <div className="col-12" key={playlist.id}>
                <article className="playlist-card featured">
                  <div className="row align-items-center">
                    <div className="col-12 col-lg-4 mb-4 mb-lg-0">
                      <div className="playlist-image-wrap">
                        <img
                          src={playlist.image}
                          alt={`${playlist.title} cover`}
                          className="playlist-image"
                        />
                      </div>
                    </div>

                    <div className="col-12 col-lg-8">
                      <div className="playlist-content">
                        <span className={getPlatformClass(playlist.platform)}>
                          {playlist.platform}
                        </span>

                        <h3 className="playlist-title mt-3">
                          {playlist.title}
                        </h3>

                        <p className="playlist-description">
                          {playlist.description}
                        </p>

                        <div className="playlist-actions mb-4">
                          <a
                            href={playlist.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn playlist-btn"
                          >
                            Open Playlist
                          </a>
                        </div>

                        {playlist.platform === "Spotify" && playlist.embedUrl && (
                          <div className="playlist-embed">
                            <iframe
                              style={{ borderRadius: "12px" }}
                              src={playlist.embedUrl}
                              width="100%"
                              height="352"
                              frameBorder="0"
                              allowFullScreen=""
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                              title={playlist.title}
                            ></iframe>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      )}

      {otherPlaylists.length > 0 && (
        <div className="all-playlists">
          <h2 className="section-title mb-4">More Playlists</h2>

          <div className="row g-4">
            {otherPlaylists.map((playlist) => (
              <div className="col-12 col-md-6 col-xl-4 mb-5" key={playlist.id}>
                <article className="playlist-card h-100">
                  <div className="playlist-image-wrap">
                    <img
                      src={playlist.image}
                      alt={`${playlist.title} cover`}
                      className="playlist-image"
                    />
                  </div>

                  <div className="playlist-content">
                    <span className={getPlatformClass(playlist.platform)}>
                      {playlist.platform}
                    </span>

                    <h3 className="playlist-title mt-3">{playlist.title}</h3>

                    <p className="playlist-description">
                      {playlist.description}
                    </p>

                    <a
                      href={playlist.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn playlist-btn mt-3"
                    >
                      Open Playlist
                    </a>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default PlaylistsScreen;