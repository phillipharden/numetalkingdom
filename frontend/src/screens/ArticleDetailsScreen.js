import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ArticleDetails from "../components/ArticleDetails";
import RecentArticles from "../components/RecentArticles";
import UpcomingReleases from "../components/UpcomingReleases";

const ArticleDetailsScreen = () => {
  const { slug } = useParams();
  const cleanSlug = decodeURIComponent(slug || "").trim();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (error) {
        console.error("Error loading article:", error);
        setArticle(null);
      } else {
        setArticle(data || null);
      }

      setLoading(false);
    };

    fetchArticle();
  }, [cleanSlug]);

  if (loading) {
    return (
      <section className="article-details-page py-6">
        <div className="container">
          <h1>Loading Article...</h1>
        </div>
      </section>
    );
  }

  if (!article) {
    return (
      <section className="article-details-page py-6">
        <div className="container">
          <h1>Article Not Found</h1>
          <p>We couldn’t find that article.</p>
          <p>
            <strong>Slug:</strong> {cleanSlug}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="article-details-page py-6">
      <div className="container">
        <div className="row g-5">
          <div className="col-12 col-xl-8">
            <div className="article-details-main">
              <ArticleDetails article={article} />
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <aside className="article-details-sidebar">
              <RecentArticles limit={4} />
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

export default ArticleDetailsScreen;