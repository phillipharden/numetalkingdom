import { Link } from "react-router-dom";
import articles from "../assets/data/articles-data";

const RecentArticles = ({ limit = 5 }) => {
  const recentArticles = articles.slice(0, limit);

  return (
    <div className="recent-articles pb-5">
      <h3 className="recent-articles-title">Recent Articles</h3>

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

      <div className="recent-articles-footer">
        <Link to="/articles" className="recent-articles-view-all">
          View All Articles →
        </Link>
      </div>
    </div>
  );
};

export default RecentArticles;