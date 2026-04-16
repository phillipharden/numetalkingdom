import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import UpcomingReleases from "../components/UpcomingReleases";
import "../styles/newsscreen.css";

const NewsScreen = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error loading news:", error);
      } else {
        setNewsList(data || []);
      }

      setLoading(false);
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <section className="news-screen py-6">
        <div className="container text-center">
          <h2>Loading News...</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="news-screen py-6">
      <div className="container">
        <div className="row g-5">
          <div className="col-12 col-xl-8">
            <div className="news-main">
              <div className="news-screen-header mb-5">
                <p className="section-kicker">News / Features / Releases</p>
                <h1>News</h1>
                <p className="section-subtitle">
                  The latest from Nu Metal Kingdom featuring new releases,
                  band news, interviews, and heavy music updates.
                </p>
              </div>

              <div className="row g-5">
                {newsList.map((news) => {
                  const formattedDate = news.date
                    ? new Date(news.date + "T00:00:00").toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "";

                  return (
                    <div
                      key={news.id || news.slug}
                      className="col-12 col-md-6 mb-4"
                    >
                      <article className="news-card h-100">
                        <Link
                          to={`/news/${news.slug}`}
                          className="news-card-image-link"
                        >
                          <img
                            src={
                              news.banner_image_url ||
                              "/images/articles/default.jpg"
                            }
                            alt={news.title}
                            className="news-card-image"
                          />
                        </Link>

                        <div className="news-card-body">
                          <p className="news-card-meta">
                            <span>{news.category || "News"}</span>
                            {formattedDate && <span> • {formattedDate}</span>}
                          </p>

                          <h2 className="news-card-title">
                            <Link to={`/news/${news.slug}`}>{news.title}</Link>
                          </h2>

                          {news.band_name && (
                            <p className="news-card-artist">{news.band_name}</p>
                          )}

                          {news.excerpt && (
                            <p className="news-card-excerpt">{news.excerpt}</p>
                          )}

                          <Link
                            to={`/news/${news.slug}`}
                            className="news-card-button"
                          >
                            Read News →
                          </Link>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <aside className="news-sidebar">
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

export default NewsScreen;