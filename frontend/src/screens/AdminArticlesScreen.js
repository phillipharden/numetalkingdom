import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const emptyForm = {
  title: "",
  slug: "",
  artist: "",
  date: "",
  category: "",
  excerpt: "",
  content_html: "",
  card_image: "",
  card_image_alt: "",
  hero_media: "",
  og_image_url: "",
  bottom_image_url: "",
  video: "",

  cta_text: "",
  cta_url: "",

  band_image: "",
  band_image_alt: "",
  band_website: "",
  band_facebook: "",
  band_instagram: "",
  band_x: "",
  band_youtube: "",
  band_spotify: "",
  band_apple_music: "",
  band_tiktok: "",
};

const AdminArticlesScreen = () => {
  const [articles, setArticles] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingArticle, setEditingArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => {
      const aDate = a?.date || "";
      const bDate = b?.date || "";
      return bDate.localeCompare(aDate);
    });
  }, [articles]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching articles:", error);
      setMessage(`Error loading articles: ${error.message}`);
    } else {
      setArticles(data || []);
    }

    setLoading(false);
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingArticle(null);
    setMessage("");
  };

  const slugify = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const safeParseJson = (value, fallback = {}) => {
    if (!value || !value.trim()) return fallback;

    try {
      return JSON.parse(value);
    } catch {
      throw new Error(
        "One of your JSON fields is invalid. Please check Hero Media or Video."
      );
    }
  };

  const formatJsonForTextarea = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "title" && !editingArticle) {
        updated.slug = slugify(value);
      }

      return updated;
    });
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setMessage("");

    setFormData({
      title: article.title || "",
      slug: article.slug || "",
      artist: article.artist || "",
      date: article.date || "",
      category: article.category || "",
      excerpt: article.excerpt || "",
      content_html: article.content_html || "",
      card_image: article.card_image || "",
      card_image_alt: article.card_image_alt || "",
      hero_media: formatJsonForTextarea(article.hero_media),
      og_image_url: article.og_image_url || "",
      bottom_image_url: article.bottom_image_url || "",
      video: formatJsonForTextarea(article.video),

      cta_text: article.cta_text || "",
      cta_url: article.cta_url || "",

      band_image: article.band_image || "",
      band_image_alt: article.band_image_alt || "",
      band_website: article.band_website || "",
      band_facebook: article.band_facebook || "",
      band_instagram: article.band_instagram || "",
      band_x: article.band_x || "",
      band_youtube: article.band_youtube || "",
      band_spotify: article.band_spotify || "",
      band_apple_music: article.band_apple_music || "",
      band_tiktok: article.band_tiktok || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (articleId) => {
    const confirmed = window.confirm("Are you sure you want to delete this article?");
    if (!confirmed) return;

    setMessage("");

    const { error } = await supabase.from("articles").delete().eq("id", articleId);

    if (error) {
      console.error("Error deleting article:", error);
      setMessage(`Error deleting article: ${error.message}`);
      return;
    }

    setArticles((prev) => prev.filter((article) => article.id !== articleId));

    if (editingArticle?.id === articleId) {
      resetForm();
    }

    setMessage("Article deleted successfully.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const articleData = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        artist: formData.artist.trim(),
        date: formData.date || null,
        category: formData.category.trim(),
        excerpt: formData.excerpt.trim(),
        content_html: formData.content_html,
        card_image: formData.card_image.trim(),
        card_image_alt: formData.card_image_alt.trim(),
        hero_media: safeParseJson(formData.hero_media, {}),
        og_image_url: formData.og_image_url.trim(),
        bottom_image_url: formData.bottom_image_url.trim(),
        video: safeParseJson(formData.video, {}),

        cta_text: formData.cta_text.trim(),
        cta_url: formData.cta_url.trim(),

        band_image: formData.band_image.trim(),
        band_image_alt: formData.band_image_alt.trim(),
        band_website: formData.band_website.trim(),
        band_facebook: formData.band_facebook.trim(),
        band_instagram: formData.band_instagram.trim(),
        band_x: formData.band_x.trim(),
        band_youtube: formData.band_youtube.trim(),
        band_spotify: formData.band_spotify.trim(),
        band_apple_music: formData.band_apple_music.trim(),
        band_tiktok: formData.band_tiktok.trim(),
      };

      if (!articleData.title) throw new Error("Title is required.");
      if (!articleData.slug) throw new Error("Slug is required.");

      let response;

      if (editingArticle) {
        response = await supabase
          .from("articles")
          .update(articleData)
          .eq("id", editingArticle.id)
          .select()
          .single();
      } else {
        response = await supabase
          .from("articles")
          .insert([articleData])
          .select()
          .single();
      }

      if (response.error) {
        throw new Error(response.error.message);
      }

      resetForm();
      await fetchArticles();

      setMessage(
        editingArticle
          ? "Article updated successfully."
          : "Article created successfully."
      );
    } catch (error) {
      console.error("Error saving article:", error);
      setMessage(error.message || "Failed to save article.");
    }

    setSaving(false);
  };

  return (
    <section className="admin-shell">
      <div className="admin-panel">
        <div className="admin-page-header">
          <div>
            <p className="admin-eyebrow">Nu Metal Kingdom Admin</p>
            <h1 className="admin-page-title">
              {editingArticle ? "Edit Article" : "Add Article"}
            </h1>
            <p className="admin-page-subtitle">
              Create, edit, and manage article content, CTA links, and band info.
            </p>
          </div>
        </div>

        {message && <div className="admin-status">{message}</div>}

        <div className="admin-toolbar">
          {editingArticle && (
            <button
              type="button"
              className="admin-btn admin-btn-outline"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-section-card">
            <div className="admin-section-header">
              <h2>Article Details</h2>
              <p>Main content, metadata, and article body.</p>
            </div>

            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="slug">Slug</label>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="artist">Artist / Band Name</label>
                <input
                  id="artist"
                  name="artist"
                  type="text"
                  value={formData.artist}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="category">Category</label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="News, Review, Feature, Release"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="excerpt">Excerpt</label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  rows="4"
                  value={formData.excerpt}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="content_html">Content HTML</label>
              <textarea
                id="content_html"
                name="content_html"
                rows="14"
                value={formData.content_html}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="admin-section-card">
            <div className="admin-section-header">
              <h2>Images / Media</h2>
              <p>Card image, Open Graph image, hero media, and video JSON.</p>
            </div>

            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="card_image">Card Image URL</label>
                <input
                  id="card_image"
                  name="card_image"
                  type="text"
                  value={formData.card_image}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="card_image_alt">Card Image Alt</label>
                <input
                  id="card_image_alt"
                  name="card_image_alt"
                  type="text"
                  value={formData.card_image_alt}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="og_image_url">OG Image URL</label>
                <input
                  id="og_image_url"
                  name="og_image_url"
                  type="text"
                  value={formData.og_image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="bottom_image_url">Bottom Image URL</label>
                <input
                  id="bottom_image_url"
                  name="bottom_image_url"
                  type="text"
                  value={formData.bottom_image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="hero_media">Hero Media JSON</label>
                <textarea
                  id="hero_media"
                  name="hero_media"
                  rows="8"
                  value={formData.hero_media}
                  onChange={handleChange}
                  placeholder={`{\n  "url": "https://...jpg",\n  "alt": "Band image"\n}`}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="video">Video JSON</label>
                <textarea
                  id="video"
                  name="video"
                  rows="8"
                  value={formData.video}
                  onChange={handleChange}
                  placeholder={`{\n  "url": "https://www.youtube.com/watch?v=xxxxx"\n}`}
                />
              </div>
            </div>
          </div>

          <div className="admin-section-card">
            <div className="admin-section-header">
              <h2>Article Button / CTA</h2>
              <p>Add an optional button at the end of the article.</p>
            </div>

            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="cta_text">Button Text</label>
                <input
                  id="cta_text"
                  name="cta_text"
                  type="text"
                  value={formData.cta_text}
                  onChange={handleChange}
                  placeholder="Pre-Save This Single"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="cta_url">Button Link</label>
                <input
                  id="cta_url"
                  name="cta_url"
                  type="text"
                  value={formData.cta_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="admin-section-card">
            <div className="admin-section-header">
              <h2>Band / Artist Info</h2>
              <p>Add optional artist image and social/profile links.</p>
            </div>

            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="band_image">Band Image URL</label>
                <input
                  id="band_image"
                  name="band_image"
                  type="text"
                  value={formData.band_image}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="band_image_alt">Band Image Alt Text</label>
                <input
                  id="band_image_alt"
                  name="band_image_alt"
                  type="text"
                  value={formData.band_image_alt}
                  onChange={handleChange}
                  placeholder="Band promo photo"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="band_website">Band Website</label>
                <input
                  id="band_website"
                  name="band_website"
                  type="text"
                  value={formData.band_website}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="band_facebook">Facebook</label>
                <input
                  id="band_facebook"
                  name="band_facebook"
                  type="text"
                  value={formData.band_facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="band_instagram">Instagram</label>
                <input
                  id="band_instagram"
                  name="band_instagram"
                  type="text"
                  value={formData.band_instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="band_x">X</label>
                <input
                  id="band_x"
                  name="band_x"
                  type="text"
                  value={formData.band_x}
                  onChange={handleChange}
                  placeholder="https://x.com/..."
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="band_youtube">YouTube</label>
                <input
                  id="band_youtube"
                  name="band_youtube"
                  type="text"
                  value={formData.band_youtube}
                  onChange={handleChange}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="band_spotify">Spotify</label>
                <input
                  id="band_spotify"
                  name="band_spotify"
                  type="text"
                  value={formData.band_spotify}
                  onChange={handleChange}
                  placeholder="https://open.spotify.com/..."
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="band_apple_music">Apple Music</label>
                <input
                  id="band_apple_music"
                  name="band_apple_music"
                  type="text"
                  value={formData.band_apple_music}
                  onChange={handleChange}
                  placeholder="https://music.apple.com/..."
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="band_tiktok">TikTok</label>
                <input
                  id="band_tiktok"
                  name="band_tiktok"
                  type="text"
                  value={formData.band_tiktok}
                  onChange={handleChange}
                  placeholder="https://tiktok.com/@..."
                />
              </div>
            </div>
          </div>

          <div className="admin-toolbar">
            <button type="submit" className="admin-btn" disabled={saving}>
              {saving
                ? "Saving..."
                : editingArticle
                ? "Update Article"
                : "Add Article"}
            </button>

            {editingArticle && (
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={resetForm}
              >
                Clear Form
              </button>
            )}
          </div>
        </form>

        <div className="admin-section-card">
          <div className="admin-section-header">
            <h2>Existing Articles</h2>
            <p>Edit or delete articles already in your database.</p>
          </div>

          {loading ? (
            <p className="admin-muted-text">Loading articles...</p>
          ) : sortedArticles.length === 0 ? (
            <p className="admin-muted-text">No articles yet.</p>
          ) : (
            <div className="admin-item-grid">
              {sortedArticles.map((article) => (
                <div key={article.id} className="admin-item-card">
                  <div className="admin-item-card__content">
                    {article.card_image ? (
                      <img
                        src={article.card_image}
                        alt={article.title}
                        className="admin-item-thumb"
                      />
                    ) : null}

                    <div>
                      <strong>{article.title}</strong>
                      <span>Slug: {article.slug}</span>
                      {article.artist && <span>Artist: {article.artist}</span>}
                      {article.category && <span>Category: {article.category}</span>}
                      {article.date && <span>Date: {article.date}</span>}
                      {article.cta_text && article.cta_url && (
                        <span>CTA: {article.cta_text}</span>
                      )}
                    </div>
                  </div>

                  <div className="admin-item-card__actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-outline"
                      onClick={() => handleEdit(article)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleDelete(article.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminArticlesScreen;