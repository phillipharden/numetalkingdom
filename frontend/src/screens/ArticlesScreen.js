import { Link } from "react-router-dom";
import articles from "../assets/data/articles-data";

const ArticlesScreen = () => {
  console.log("articles on listing page:", articles);

  return (
    <section className="articles-screen py-6">
      <div className="container">
        <div className="articles-screen-header text-center mb-5">
          <p className="section-kicker">News / Features / Releases</p>
          <h1>Articles</h1>
          <p className="section-subtitle">
            The latest from Numetal Kingdom featuring new releases,
            band news, interviews, and heavy music updates.
          </p>
        </div>

        <div className="row g-4">
          {articles.map((article) => (
            <div
              key={article.id || article.slug}
              className="col-12 col-md-6 col-lg-4"
            >
              <article className="article-card h-100">
                <Link
                  to={`/articles/${article.slug}`}
                  className="article-card-image-link"
                >
                  <img
                    src={article.cardImage || "/images/articles/default.jpg"}
                    alt={article.cardImageAlt || article.title}
                    className="article-card-image"
                  />
                </Link>

                <div className="article-card-body">
                  <p className="article-card-meta">
                    <span>{article.category || "News"}</span>
                    {article.date && <span> • {article.date}</span>}
                  </p>

                  <h2 className="article-card-title">
                    <Link to={`/articles/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>

                  {article.artist && (
                    <p className="article-card-artist">{article.artist}</p>
                  )}

                  {article.excerpt && (
                    <p className="article-card-excerpt">{article.excerpt}</p>
                  )}

                  <Link
                    to={`/articles/${article.slug}`}
                    className="article-card-link"
                  >
                    Read Article
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArticlesScreen;