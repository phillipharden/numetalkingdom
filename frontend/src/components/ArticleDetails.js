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
  } = article;

  const siteUrl = "https://numetalkingdom.com";
  const articleUrl = `${siteUrl}/articles/${slug}`;
  const shareImage = `${siteUrl}${cardImage}`;

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

        {heroMedia?.type === "image" && heroMedia?.src && (
          <div className="article-hero">
            <img
              src={heroMedia.src}
              alt={heroMedia.alt || title}
              className="article-hero-image"
            />
          </div>
        )}

        {heroMedia?.type === "youtube" && heroMedia?.url && (
          <div className="article-hero">
            <div className="article-video">
              <iframe
                className="article-video-embed"
                src={heroMedia.url}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {contentHtml && (
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        )}
      </article>
    </>
  );
};

export default ArticleDetails;