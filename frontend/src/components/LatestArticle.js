import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const LatestArticle = () => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestArticle = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching latest article:", error);
        setArticle(null);
      } else {
        setArticle(data);
      }

      setLoading(false);
    };

    fetchLatestArticle();
  }, []);

  if (loading) {
    return (
      <section className="featured-latest-article">
        <p>Loading latest article...</p>
      </section>
    );
  }

  if (!article) {
    return null;
  }

  const imageUrl =
    article.card_image || article.og_image_url || article.bottom_image_url || "";

  return (
    <section className="featured-latest-article">
      <div className="featured-latest-article-card">
        <p className="featured-latest-article-label">Newest Article</p>

        <h2 className="featured-latest-article-title">
          <Link to={`/articles/${article.slug}`}>{article.title}</Link>
        </h2>

        {article.artist && (
          <p className="featured-latest-article-artist">{article.artist}</p>
        )}

        {article.date && (
          <p className="featured-latest-article-date">{article.date}</p>
        )}

        {imageUrl && (
          <Link
            to={`/articles/${article.slug}`}
            className="featured-latest-article-image-link"
          >
            <img
              src={imageUrl}
              alt={article.card_image_alt || article.title}
              className="featured-latest-article-image"
            />
          </Link>
        )}

        {article.excerpt && (
          <p className="featured-latest-article-excerpt">{article.excerpt}</p>
        )}

        <Link
          to={`/articles/${article.slug}`}
          className="featured-latest-article-button"
        >
          Read Article →
        </Link>
      </div>
    </section>
  );
};

export default LatestArticle;