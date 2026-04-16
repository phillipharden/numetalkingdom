import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/latestnews.css";

const LatestNews = () => {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestNews = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching latest news:", error);
        setNews(null);
      } else {
        setNews(data);
      }

      setLoading(false);
    };

    fetchLatestNews();
  }, []);

  if (loading) {
    return (
      <section className="featured-latest-news">
        <p>Loading latest news...</p>
      </section>
    );
  }

  if (!news) return null;

  const imageUrl = news.banner_image_url || "";

  const formattedDate = news.date
    ? new Date(news.date + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <section className="featured-latest-news">
      <div className="featured-latest-news-card">
        <p className="featured-latest-news-label">Newest News</p>

        <h2 className="featured-latest-news-title">
          <Link to={`/news/${news.slug}`}>{news.title}</Link>
        </h2>

        {news.band_name && (
          <p className="featured-latest-news-artist">{news.band_name}</p>
        )}

        {formattedDate && (
          <p className="featured-latest-news-date">{formattedDate}</p>
        )}

        {imageUrl && (
          <Link
            to={`/news/${news.slug}`}
            className="featured-latest-news-image-link"
          >
            <img
              src={imageUrl}
              alt={news.title}
              className="featured-latest-news-image"
            />
          </Link>
        )}

        {news.excerpt && (
          <p className="featured-latest-news-excerpt">{news.excerpt}</p>
        )}

        <Link
          to={`/news/${news.slug}`}
          className="featured-latest-news-button"
        >
          Read News →
        </Link>
      </div>
    </section>
  );
};

export default LatestNews;