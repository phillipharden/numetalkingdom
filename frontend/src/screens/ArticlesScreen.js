import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import UpcomingReleases from "../components/UpcomingReleases";

const ArticlesScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error loading articles:", error);
      } else {
        setArticles(data || []);
      }

      setLoading(false);
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <section className="articles-screen py-6">
        <div className="container text-center">
          <h2>Loading Articles...</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="articles-screen py-6">
      <div className="container">
        <div className="row g-5">
          <div className="col-12 col-xl-8">
            <div className="articles-main">
              <div className="articles-screen-header mb-5">
                <p className="section-kicker">News / Features / Releases</p>
                <h1>Articles</h1>
                <p className="section-subtitle">
                  The latest from Nu Metal Kingdom featuring new releases,
                  band news, interviews, and heavy music updates.
                </p>
              </div>

              <div className="row g-4">
                {articles.map((article) => (
                  <div
                    key={article.id || article.slug}
                    className="col-12 col-md-6"
                  >
                    <article className="article-card h-100">
                      <Link
                        to={`/articles/${article.slug}`}
                        className="article-card-image-link"
                      >
                        <img
                          src={
                            article.banner_image_url ||
                            "/images/articles/default.jpg"
                          }
                          alt={article.title}
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

                        {article.band_name && (
                          <p className="article-card-artist">
                            {article.band_name}
                          </p>
                        )}

                        {article.excerpt && (
                          <p className="article-card-excerpt">
                            {article.excerpt}
                          </p>
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
          </div>

          <div className="col-12 col-xl-4">
            <aside className="articles-sidebar">
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

export default ArticlesScreen;