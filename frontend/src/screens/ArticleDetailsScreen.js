import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ArticleDetails from "../components/ArticleDetails";

const ArticleDetailsScreen = () => {
  const { slug } = useParams();
  const cleanSlug = decodeURIComponent(slug || "").trim();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      console.log("URL slug:", slug);
      console.log("Clean slug:", cleanSlug);

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", cleanSlug)
        .maybeSingle();

      console.log("SUPABASE DATA:", data);
      console.log("SUPABASE ERROR:", error);

      if (error) {
        console.error("Error loading article:", error);
        setArticle(null);
      } else {
        const normalizedArticle = data
          ? {
              ...data,
              cardImage: data.card_image || "",
              cardImageAlt: data.card_image_alt || "",
              contentHtml: data.content_html || "",
              heroMedia: data.hero_media || {},
              bottomImageUrl: data.bottom_image_url || "",
              ogImageUrl: data.og_image_url || "",
              video: data.video || {},
            }
          : null;

        setArticle(normalizedArticle);
      }

      setLoading(false);
    };

    fetchArticle();
  }, [slug, cleanSlug]);

  if (loading) {
    return (
      <section className="py-6">
        <div className="container">
          <h1>Loading Article...</h1>
        </div>
      </section>
    );
  }

  if (!article) {
    return (
      <section className="py-6">
        <div className="container">
          <h1>Article Not Found</h1>
          <p>We couldn’t find that article.</p>
          <p><strong>Slug:</strong> {cleanSlug}</p>
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