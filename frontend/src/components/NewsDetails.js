import { Link } from "react-router-dom";
import {
  SiApplemusic,
  SiFacebook,
  SiInstagram,
  SiSpotify,
  SiTiktok,
  SiYoutube,
  SiX,
} from "react-icons/si";
import { FaGlobe } from "react-icons/fa";
import "../styles/newsdetails.css";

const formatNewsDate = (dateString) => {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-");
  const localDate = new Date(Number(year), Number(month) - 1, Number(day));

  return localDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;

  if (url.includes("youtube.com/embed/")) return url;

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  const watchMatch = url.match(/[?&]v=([^?&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  return null;
};

const NewsDetails = ({ news }) => {
  if (!news) return null;

  const band = news.band || null;
  const bandSlug = band?.slug || "";
  const bandName =
    band?.name ||
    news.band_name ||
    news.artist ||
    "";

  const bannerImage =
    news.hero_image ||
    news.banner_image_url ||
    news.card_image ||
    news.image ||
    null;

  const footerImage =
    news.bottom_image ||
    news.bottom_image_url ||
    news.footer_image ||
    news.footer_image_url ||
    null;

  const videoEmbedUrl =
    getYouTubeEmbedUrl(news.bottom_youtube_url) ||
    getYouTubeEmbedUrl(news.footer_youtube_url) ||
    getYouTubeEmbedUrl(news.video_embed_url) ||
    getYouTubeEmbedUrl(news.youtube_url) ||
    getYouTubeEmbedUrl(news.video_url) ||
    getYouTubeEmbedUrl(news.embed_url) ||
    null;

  const bandLinks = [
    {
      key: "website",
      label: "Website",
      url: band?.website,
      icon: <FaGlobe />,
      className: "website",
    },
    {
      key: "facebook",
      label: "Facebook",
      url: band?.facebook,
      icon: <SiFacebook />,
      className: "facebook",
    },
    {
      key: "instagram",
      label: "Instagram",
      url: band?.instagram,
      icon: <SiInstagram />,
      className: "instagram",
    },
    {
      key: "x",
      label: "X",
      url: band?.x,
      icon: <SiX />,
      className: "x",
    },
    {
      key: "youtube",
      label: "YouTube",
      url: band?.youtube,
      icon: <SiYoutube />,
      className: "youtube",
    },
    {
      key: "spotify",
      label: "Spotify",
      url: band?.spotify,
      icon: <SiSpotify />,
      className: "spotify",
    },
    {
      key: "apple_music",
      label: "Apple Music",
      url: band?.apple_music,
      icon: <SiApplemusic />,
      className: "apple-music",
    },
    {
      key: "tiktok",
      label: "TikTok",
      url: band?.tiktok,
      icon: <SiTiktok />,
      className: "tiktok",
    },
  ].filter((link) => link.url);

  const showBandSection = bandName && (band?.image_path || bandLinks.length > 0);

  return (
    <article className="news-details">
      {bannerImage && (
        <div className="news-banner-wrap">
          <img
            src={bannerImage}
            alt={news.title || "News banner"}
            className="news-banner-image"
          />
        </div>
      )}

      <header className="news-header">
        {news.category && (
          <p className="news-category">{news.category}</p>
        )}

        <h1 className="news-title">{news.title}</h1>

        <div className="news-meta">
          {news.date && (
            <span className="news-date">{formatNewsDate(news.date)}</span>
          )}

          {bandName && (
            <span className="news-band-name-wrap">
              {bandSlug ? (
                <Link to={`/bands/${bandSlug}`} className="news-band-name-link">
                  {bandName}
                </Link>
              ) : (
                <span className="news-band-name-link">{bandName}</span>
              )}
            </span>
          )}
        </div>

        {news.excerpt && (
          <p className="news-excerpt">{news.excerpt}</p>
        )}
      </header>

      {news.content_html ? (
        <div
          className="news-content"
          dangerouslySetInnerHTML={{ __html: news.content_html }}
        />
      ) : news.content ? (
        <div
          className="news-content"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />
      ) : null}

      {news.cta_label && news.cta_url && (
        <div className="news-cta-wrap">
          <a
            href={news.cta_url}
            target="_blank"
            rel="noreferrer"
            className="news-cta-button"
          >
            {news.cta_label}
          </a>
        </div>
      )}

      {footerImage && (
        <div className="news-footer-media">
          <img
            src={footerImage}
            alt={news.title || "News image"}
            className="news-footer-image"
          />
        </div>
      )}

      {videoEmbedUrl && (
        <div className="news-footer-media">
          <div className="news-video-embed">
            <iframe
              src={videoEmbedUrl}
              title={news.title || "Embedded video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {showBandSection && (
        <section className="news-band-section">
          <div className="news-band-card">
            {band?.image_path && (
              <div className="news-band-image-wrap">
                {bandSlug ? (
                  <Link to={`/bands/${bandSlug}`}>
                    <img
                      src={band.image_path}
                      alt={bandName}
                      className="news-band-image"
                    />
                  </Link>
                ) : (
                  <img
                    src={band.image_path}
                    alt={bandName}
                    className="news-band-image"
                  />
                )}
              </div>
            )}

            <div className="news-band-content">
              <p className="news-band-heading">Connect With the Artist</p>

              {bandSlug ? (
                <Link to={`/bands/${bandSlug}`} className="news-band-title-link">
                  {bandName}
                </Link>
              ) : (
                <p className="news-band-title">{bandName}</p>
              )}

              {bandLinks.length > 0 && (
                <div className="news-band-links">
                  {bandLinks.map((link) => (
                    <a
                      key={link.key}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`news-band-link ${link.className}`}
                    >
                      <span className="news-band-link-icon">{link.icon}</span>
                      <span className="news-band-link-text">{link.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </article>
  );
};

export default NewsDetails;