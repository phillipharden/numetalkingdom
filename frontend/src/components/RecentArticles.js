import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const RecentArticles = ({ limit = 5 }) => {
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecentArticles = async () => {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title, date")
        .order("date", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching recent articles:", error);
        setError("Could not load recent articles.");
        setRecentArticles([]);
      } else {
        setRecentArticles(data || []);
      }

      setLoading(false);
    };

    fetchRecentArticles();
  }, [limit]);

  return (
    <div className="recent-articles pb-5">
      <h3 className="recent-articles-title">Recent Articles</h3>

      {loading ? (
        <p>Loading articles...</p>
      ) : error ? (
        <p>{error}</p>
      ) : recentArticles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        <ul className="recent-articles-list">
          {recentArticles.map((article) => (
            <li key={article.id} className="recent-articles-item">
              <Link
                to={`/articles/${article.slug}`}
                className="recent-articles-link"
              >
                {article.title}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="recent-articles-footer">
        <Link to="/articles" className="recent-articles-view-all">
          View All Articles →
        </Link>
      </div>
    </div>
  );
};

export default RecentArticles;