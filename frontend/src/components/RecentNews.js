import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/recentnews.css";

const RecentNews = ({ limit = 5 }) => {
  const [recentNews, setRecentNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecentNews = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title, date")
        .order("date", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching recent news:", error);
        setError("Could not load recent news.");
        setRecentNews([]);
      } else {
        setRecentNews(data || []);
      }

      setLoading(false);
    };

    fetchRecentNews();
  }, [limit]);

  return (
    <div className="recent-news pb-5">
      <h3 className="recent-news-title">Recent News</h3>

      {loading ? (
        <p>Loading news...</p>
      ) : error ? (
        <p>{error}</p>
      ) : recentNews.length === 0 ? (
        <p>No news found.</p>
      ) : (
        <ul className="recent-news-list">
          {recentNews.map((news) => (
            <li key={news.id} className="recent-news-item">
              <Link to={`/news/${news.slug}`} className="recent-news-link">
                {news.title}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="recent-news-footer">
        <Link to="/news" className="recent-news-view-all">
          View All News →
        </Link>
      </div>
    </div>
  );
};

export default RecentNews;