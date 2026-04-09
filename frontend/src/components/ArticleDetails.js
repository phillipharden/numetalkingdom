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
    artist,
    date,
    category,
    heroMedia,
    contentHtml,
    excerpt,
    cardImage,
    cardImageAlt,
    slug,
    ogImageUrl,
    bottomImageUrl,
    video,

    ctaText,
    ctaUrl,

    bandImage,
    bandImageAlt,
    bandWebsite,
    bandFacebook,
    bandInstagram,
    bandX,
    bandYoutube,
    bandSpotify,
    bandAppleMusic,
    bandTiktok,
  } = article;

  const siteUrl = "https://numetalkingdom.com";
  const articleUrl = `${siteUrl}/articles/${slug}`;

  const shareImage =
    ogImageUrl || cardImage || `${siteUrl}/images/articles/default.jpg`;

  const heroImageUrl = heroMedia?.url || heroMedia?.src || "";

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

  const youtubeUrl = video?.url || "";
  const youtubeEmbedUrl = getYouTubeEmbedUrl(youtubeUrl);

  const bandLinks = [
    { label: "Website", url: bandWebsite },
    { label: "Facebook", url: bandFacebook },
    { label: "Instagram", url: bandInstagram },
    { label: "X", url: bandX },
    { label: "YouTube", url: bandYoutube },
    { label: "Spotify", url: bandSpotify },
    { label: "Apple Music", url: bandAppleMusic },
    { label: "TikTok", url: bandTiktok },
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
        <meta property="og:image:alt" content={cardImageAlt || title} />

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

        {artist && <div className="article-artist">{artist}</div>}

        {youtubeEmbedUrl ? (
          <div className="article-hero">
            <div className="article-video">
              <iframe
                className="article-video-embed"
                src={youtubeEmbedUrl}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        ) : heroImageUrl ? (
          <div className="article-hero">
            <img
              src={heroImageUrl}
              alt={heroMedia?.alt || cardImageAlt || title}
              className="article-hero-image"
            />
          </div>
        ) : null}

        {contentHtml && (
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        )}

        {bottomImageUrl && (
          <div className="article-bottom-image-wrap">
            <img
              src={bottomImageUrl}
              alt={title}
              className="article-bottom-image"
            />
          </div>
        )}

        {ctaText && ctaUrl && (
          <div className="article-cta-wrap">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noreferrer"
              className="article-cta-button"
            >
              {ctaText}
            </a>
          </div>
        )}

        {(bandImage || artist || bandLinks.length > 0) && (
          <section className="article-band-section">
            <h3 className="article-band-section-title">About the Artist</h3>

            <div className="article-band-card">
              {bandImage && (
                <div className="article-band-image-wrap">
                  <img
                    src={bandImage}
                    alt={bandImageAlt || artist || title}
                    className="article-band-image"
                  />
                </div>
              )}

              <div className="article-band-content">
                {artist && <h4 className="article-band-name">{artist}</h4>}

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