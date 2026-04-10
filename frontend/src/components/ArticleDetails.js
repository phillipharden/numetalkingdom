import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const ArticleDetails = ({ article }) => {
  if (!article) {
    return (
      <article className="article-details">
        <p>Article not found.</p>
      </article>
    );
  }

  const {
    title,
    slug,
    date,
    category,
    excerpt,
    content_html,
    banner_image_url,
    footer_media_type,
    footer_image_url,
    footer_youtube_url,
    cta_label,
    cta_url,
    band_name,
    band_image_url,
    band_website,
    band_facebook,
    band_instagram,
    band_x,
    band_youtube,
    band_spotify,
    band_apple_music,
    band_tiktok,
  } = article;

  const siteUrl = "https://numetalkingdom.com";
  const articleUrl = `${siteUrl}/articles/${slug}`;
  const shareImage =
    banner_image_url || `${siteUrl}/images/articles/default.jpg`;

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";

    if (url.includes("youtube.com/embed/")) return url;

    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch?.[1]) {
      return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }

    const shortMatch = url.match(/youtu\.be\/([^?&/]+)/);
    if (shortMatch?.[1]) {
      return `https://www.youtube.com/embed/${shortMatch[1]}`;
    }

    return "";
  };

  const footerYouTubeEmbedUrl =
    footer_media_type === "youtube"
      ? getYouTubeEmbedUrl(footer_youtube_url)
      : "";

  const bandLinks = [
    { label: "Website", url: band_website },
    { label: "Facebook", url: band_facebook },
    { label: "Instagram", url: band_instagram },
    { label: "X", url: band_x },
    { label: "YouTube", url: band_youtube },
    { label: "Spotify", url: band_spotify },
    { label: "Apple Music", url: band_apple_music },
    { label: "TikTok", url: band_tiktok },
  ].filter((link) => link.url);

  return (
    <>
      <Helmet>
        <title>{title} | Nu Metal Kingdom</title>
        <meta name="description" content={excerpt || title} />

        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Nu Metal Kingdom" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={excerpt || title} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:image" content={shareImage} />
        <meta property="og:image:alt" content={title} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={excerpt || title} />
        <meta name="twitter:image" content={shareImage} />
      </Helmet>

      <article className="article-details">
        <Link to="/articles" className="back-link">
          ← Back to Articles
        </Link>

        <div className="article-meta">
          {category && <span className="article-category">{category}</span>}
          {date && <span className="article-date"> • {date}</span>}
        </div>

        <h1 className="article-title">{title}</h1>

        {band_name && <div className="article-artist">{band_name}</div>}

        {banner_image_url && (
          <div className="article-hero">
            <img
              src={banner_image_url}
              alt={title}
              className="article-hero-image"
            />
          </div>
        )}

        {content_html && (
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: content_html }}
          />
        )}

        {footer_media_type === "image" && footer_image_url && (
          <div className="article-bottom-image-wrap">
            <img
              src={footer_image_url}
              alt={title}
              className="article-bottom-image"
            />
          </div>
        )}

        {footer_media_type === "youtube" && footerYouTubeEmbedUrl && (
          <div className="article-bottom-video-wrap">
            <div className="article-video">
              <iframe
                className="article-video-embed"
                src={footerYouTubeEmbedUrl}
                title={`${title} video`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {cta_label && cta_url && (
          <div className="article-cta-wrap">
            <a
              href={cta_url}
              target="_blank"
              rel="noreferrer"
              className="article-cta-button"
            >
              {cta_label}
            </a>
          </div>
        )}

        {(band_image_url || band_name || bandLinks.length > 0) && (
          <section className="article-band-section">
            <h3 className="article-band-section-title">About the Artist</h3>

            <div className="article-band-card">
              {band_image_url && (
                <div className="article-band-image-wrap">
                  <img
                    src={band_image_url}
                    alt={band_name || title}
                    className="article-band-image"
                  />
                </div>
              )}

              <div className="article-band-content">
                {band_name && <h4 className="article-band-name">{band_name}</h4>}

                {bandLinks.length > 0 && (
                  <div className="article-band-links">
                    {bandLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="article-band-link"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
};

export default ArticleDetails;