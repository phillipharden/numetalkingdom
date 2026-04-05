const SpotifyPlaylist = () => {
  return (
    <div className="spotify-playlist">
      <iframe
        data-testid="embed-iframe"
        src="https://open.spotify.com/embed/playlist/0U0YcIKrih4xZTs3PAUKyS?utm_source=generator"
        width="100%"
        height="352"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="spotify-embed"
        title="Nu Metal Kingdom Spotify Playlist"
      ></iframe>
    </div>
  );
};

export default SpotifyPlaylist;