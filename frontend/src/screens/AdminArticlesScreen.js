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
  } = article;

  const siteUrl = "https://numetalkingdom.com";
  const articleUrl = `${siteUrl}/articles/${slug}`;

  const shareImage =
    ogImageUrl ||
    cardImage ||
    `${siteUrl}/images/articles/default.jpg`;

  const heroImageUrl = heroMedia?.url || heroMedia?.src || "";

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";

    if (url.includes("youtube.com/embed/")) return url;

    const regExp =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/;

    const match = url.match(regExp);

    if (!match?.[1]) return "";

    return `https://www.youtube.com/embed/${match[1]}`;
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(video?.url);

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

        {artist && (
          <div className="article-artist">{artist}</div>
        )}

        {/* YouTube FIRST */}
        {youtubeEmbedUrl ? (
          <div className="article-hero">
            <div className="article-video">
              <iframe
                className="article-video-embed"
                src={youtubeEmbedUrl}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
      </article>
    </>
  );
};

export default ArticleDetails;