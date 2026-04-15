import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  SiFacebook,
  SiInstagram,
  SiX,
  SiYoutube,
  SiSpotify,
  SiApplemusic,
  SiTiktok,
} from "react-icons/si";

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return "";

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      if (parsed.pathname.includes("/embed/")) return url;
    }

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "").trim();
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    return "";
  } catch (error) {
    console.error("Invalid YouTube URL:", error);
    return "";
  }
};

const ArticleDetails = ({ article }) => {
  const [band, setBand] = useState(null);

  useEffect(() => {
    const fetchBand = async () => {
      if (!article?.band_slug) {
        setBand(null);
        return;
      }

      const { data, error } = await supabase
        .from("bands")
        .select(`
          name,
          slug,
          image_path,
          website,
          facebook,
          instagram,
          x,
          youtube,
          spotify,
          apple_music,
          tiktok
        `)
        .eq("slug", article.band_slug)
        .maybeSingle();

      if (error) {
        console.error("Error loading band:", error);
        setBand(null);
      } else {
        setBand(data || null);
      }
    };

    fetchBand();
  }, [article?.band_slug]);

  if (!article) return null;

  const {
    title,
    date,
    category,
    excerpt,
    content_html,
    banner_image_url,
    footer_media_type,
    footer_image_url,
    footer_youtube_url,
    cta_label,
    cta_url,
    band_name,
    band_slug,
  } = article;

  const embedUrl = getYouTubeEmbedUrl(footer_youtube_url);

  const socialLinks = [
    { href: band?.website, label: "Website", icon: null, className: "website" },
    { href: band?.facebook, label: "Facebook", icon: <SiFacebook />, className: "facebook" },
    { href: band?.instagram, label: "Instagram", icon: <SiInstagram />, className: "instagram" },
    { href: band?.x, label: "X", icon: <SiX />, className: "x" },
    { href: band?.youtube, label: "YouTube", icon: <SiYoutube />, className: "youtube" },
    { href: band?.spotify, label: "Spotify", icon: <SiSpotify />, className: "spotify" },
    { href: band?.apple_music, label: "Apple Music", icon: <SiApplemusic />, className: "apple-music" },
    { href: band?.tiktok, label: "TikTok", icon: <SiTiktok />, className: "tiktok" },
  ].filter((item) => item.href);

  return (
    <article className="article-details">
      {banner_image_url ? (
        <div className="article-banner-wrap">
          <img
            src={banner_image_url}
            alt={title || "Article banner"}
            className="article-banner-image"
          />
        </div>
      ) : null}

      <header className="article-header">
        {category ? <p className="article-category">{category}</p> : null}

        <h1 className="article-title">{title}</h1>

        <div className="article-meta">
          {date ? <span className="article-date">{formatDate(date)}</span> : null}

          {band_name ? (
            <span className="article-band-name-wrap">
              {band_slug ? (
                <Link to={`/bands/${band_slug}`} className="article-band-name-link">
                  {band_name}
                </Link>
              ) : (
                <span className="article-band-name-link">{band_name}</span>
              )}
            </span>
          ) : null}
        </div>

        {excerpt ? <p className="article-excerpt">{excerpt}</p> : null}
      </header>

      {content_html ? (
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: content_html }}
        />
      ) : null}

      {cta_label && cta_url ? (
        <div className="article-cta-wrap">
          <a
            href={cta_url}
            target="_blank"
            rel="noreferrer"
            className="article-cta-button"
          >
            {cta_label}
          </a>
        </div>
      ) : null}

      {footer_media_type === "image" && footer_image_url ? (
        <div className="article-footer-media">
          <img
            src={footer_image_url}
            alt={title || "Article footer"}
            className="article-footer-image"
          />
        </div>
      ) : null}

      {footer_media_type === "youtube" && embedUrl ? (
        <div className="article-footer-media">
          <div className="article-video-embed">
            <iframe
              src={embedUrl}
              title={title || "YouTube video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}

      {(band?.name || band?.image_path || socialLinks.length > 0) && (
        <section className="article-band-section">
          <div className="article-band-card">
            {band?.image_path ? (
              <div className="article-band-image-wrap">
                {band?.slug ? (
                  <Link to={`/bands/${band.slug}`}>
                    <img
                      src={band.image_path}
                      alt={band.name || "Band"}
                      className="article-band-image"
                    />
                  </Link>
                ) : (
                  <img
                    src={band.image_path}
                    alt={band.name || "Band"}
                    className="article-band-image"
                  />
                )}
              </div>
            ) : null}

            <div className="article-band-content">
              {band?.name ? (
                <>
                  <h3 className="article-band-heading">Connect with the Artist</h3>

                  {band?.slug ? (
                    <Link to={`/bands/${band.slug}`} className="article-band-title-link">
                      {band.name}
                    </Link>
                  ) : (
                    <h4 className="article-band-title">{band.name}</h4>
                  )}
                </>
              ) : null}

              {socialLinks.length > 0 ? (
                <div className="article-band-links">
                  {socialLinks.map((item) => (
                    <a
                      key={`${item.label}-${item.href}`}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className={`article-band-link ${item.className}`}
                      aria-label={item.label}
                      title={item.label}
                    >
                      {item.icon ? (
                        <>
                          <span className="article-band-link-icon">{item.icon}</span>
                          <span className="article-band-link-text">{item.label}</span>
                        </>
                      ) : (
                        <span className="article-band-link-text">{item.label}</span>
                      )}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      )}
    </article>
  );
};

export default ArticleDetails;