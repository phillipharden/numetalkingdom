import { useParams } from "react-router-dom";
import articles from "../assets/data/articles-data";
import ArticleDetails from "../components/ArticleDetails";

const ArticleDetailsScreen = () => {
  const params = useParams();
  const slug = decodeURIComponent(params.slug || "").trim();

  console.log("params:", params);
  console.log("slug from URL:", slug);
  console.log(
    "available slugs:",
    articles.map((item) => item.slug)
  );

  const article = articles.find(
    (item) => String(item.slug || "").trim() === slug
  );

  console.log("matched article:", article);

  if (!article) {
    return (
      <section className="py-6">
        <div className="container">
          <h1>Article Not Found</h1>
          <p>We couldn’t find that article.</p>
          <p><strong>Slug from URL:</strong> {slug}</p>
          <p><strong>Available slugs:</strong></p>
          <pre>{JSON.stringify(articles.map((item) => item.slug), null, 2)}</pre>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6">
      <div className="container">
        <ArticleDetails article={article} />
      </div>
    </section>
  );
};

export default ArticleDetailsScreen;