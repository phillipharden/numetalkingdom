import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import NewsDetails from "../components/NewsDetails";
import RecentNews from "../components/RecentNews";
import UpcomingReleases from "../components/UpcomingReleases";
import "../styles/newsdetailsscreen.css";

const NewsDetailsScreen = () => {
  const { slug } = useParams();
  const cleanSlug = decodeURIComponent(slug || "").trim();

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (error) {
        console.error("Error loading news:", error);
        setNews(null);
        setLoading(false);
        return;
      }

      if (!data) {
        setNews(null);
        setLoading(false);
        return;
      }

      let band = null;

      if (data.band_id) {
        const { data: bandData, error: bandError } = await supabase
          .from("bands")
          .select("*")
          .eq("id", data.band_id)
          .maybeSingle();

        if (bandError) {
          console.error("Error loading band by id:", bandError);
        } else {
          band = bandData || null;
        }
      } else if (data.band_name) {
        const { data: bandData, error: bandError } = await supabase
          .from("bands")
          .select("*")
          .ilike("name", data.band_name)
          .maybeSingle();

        if (bandError) {
          console.error("Error loading band by name:", bandError);
        } else {
          band = bandData || null;
        }
      }

      setNews({
        ...data,
        band,
      });

      setLoading(false);
    };

    fetchNews();
  }, [cleanSlug]);

  if (loading) {
    return (
      <section className="news-details-page py-6">
        <div className="container">
          <h1>Loading News...</h1>
        </div>
      </section>
    );
  }

  if (!news) {
    return (
      <section className="news-details-page py-6">
        <div className="container">
          <h1>News Not Found</h1>
          <p>We couldn’t find that news item.</p>
          <p>
            <strong>Slug:</strong> {cleanSlug}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="news-details-page py-6">
      <div className="container">
        <div className="row g-5">
          <div className="col-12 col-xl-8">
            <div className="news-details-main">
              <NewsDetails news={news} />
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <aside className="news-details-sidebar">
              <RecentNews limit={4} />
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

export default NewsDetailsScreen;