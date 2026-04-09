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

            ctaText: data.cta_text || "",
            ctaUrl: data.cta_url || "",

            bandImage: data.band_image || "",
            bandImageAlt: data.band_image_alt || "",
            bandWebsite: data.band_website || "",
            bandFacebook: data.band_facebook || "",
            bandInstagram: data.band_instagram || "",
            bandX: data.band_x || "",
            bandYoutube: data.band_youtube || "",
            bandSpotify: data.band_spotify || "",
            bandAppleMusic: data.band_apple_music || "",
            bandTiktok: data.band_tiktok || "",
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