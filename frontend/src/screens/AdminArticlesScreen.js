import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const emptyForm = {
  title: "",
  artist: "",
  date: "",
  category: "",
  excerpt: "",
  slug: "",
  content_html: "",
  card_image: "",
  card_image_alt: "",
  og_image_url: "",
  bottom_image_url: "",
  hero_media_url: "",
  hero_media_alt: "",
  video_url: "",
  featured: false,
};

const AdminArticlesScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(emptyForm);

  const [showArticles, setShowArticles] = useState(false);
  const [search, setSearch] = useState("");

  const fetchArticles = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Fetch articles error:", error);
      setMessage(error.message);
    } else {
      setArticles(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return articles;

    return articles.filter((article) => {
      const title = (article.title || "").toLowerCase();
      const artist = (article.artist || "").toLowerCase();
      const slug = (article.slug || "").toLowerCase();

      return (
        title.includes(term) ||
        artist.includes(term) ||
        slug.includes(term)
      );
    });
  }, [articles, search]);

  const makeSlug = (text) =>
    (text || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "title" && !prev.slug.trim()) {
        next.slug = makeSlug(value);
      }

      return next;
    });
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setMessage("Ready.");
  };

  const handleImageUpload = async (e, field = "card_image") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = (form.slug || form.title || "article")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const fileName = `${safeName}-${field}-${Date.now()}.${fileExt}`;
    const filePath = `articles/${fileName}`;

    setMessage("Uploading image...");

    const { error } = await supabase.storage
      .from("article-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
      });

    if (error) {
      console.error("Article upload error:", error);
      setMessage(`Upload failed: ${error.message}`);
      return;
    }

    const { data } = supabase.storage
      .from("article-images")
      .getPublicUrl(filePath);

    setForm((prev) => ({
      ...prev,
      [field]: data.publicUrl,
    }));

    setMessage("Image uploaded successfully. Save the article to keep it.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const finalSlug = form.slug.trim() || makeSlug(form.title);

    if (!finalSlug) {
      setMessage("Slug is required.");
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      artist: form.artist.trim(),
      date: form.date,
      category: form.category.trim(),
      excerpt: form.excerpt.trim(),
      slug: finalSlug,
      content_html: form.content_html,
      card_image: form.card_image.trim(),
      card_image_alt: form.card_image_alt.trim(),
      og_image_url: form.og_image_url.trim(),
      bottom_image_url: form.bottom_image_url.trim(),
      hero_media: form.hero_media_url.trim()
        ? {
          type: "image",
          url: form.hero_media_url.trim(),
          alt: form.hero_media_alt.trim() || form.title.trim(),
        }
        : null,
      video: form.video_url.trim()
        ? {
          url: form.video_url.trim(),
        }
        : null,
      featured: form.featured,
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("articles")
        .update(payload)
        .eq("id", editingId);
    } else {
      result = await supabase.from("articles").insert([payload]);
    }

    if (result.error) {
      console.error("Save article error:", result.error);
      setMessage(result.error.message);
      setSaving(false);
      return;
    }

    setMessage(
      editingId ? "Article updated successfully." : "Article added successfully."
    );

    resetForm();
    await fetchArticles();
    setSaving(false);
  };

  const handleEdit = (article) => {
    setForm({
      title: article.title || "",
      artist: article.artist || "",
      date: article.date || "",
      category: article.category || "",
      excerpt: article.excerpt || "",
      slug: article.slug || "",
      content_html: article.content_html || "",
      card_image: article.card_image || "",
      card_image_alt: article.card_image_alt || "",
      og_image_url: article.og_image_url || "",
      bottom_image_url: article.bottom_image_url || "",
      hero_media_url: article.hero_media?.url || "",
      hero_media_alt: article.hero_media?.alt || "",
      video_url: article.video?.url || "",
      featured: !!article.featured,
    });

    setEditingId(article.id);
    setMessage(`Editing ${article.title}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article?")) return;

    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
      console.error("Delete article error:", error);
      setMessage(error.message);
      return;
    }

    setMessage("Article deleted successfully.");

    if (editingId === id) {
      resetForm();
    }

    await fetchArticles();
  };

  return (
    <section className="admin-shell">
      <div className="admin-panel">
        <div className="admin-page-header">
          <div>
            <Link to="/admin" className="admin-back-link">
              ← Back to Admin Dashboard
            </Link>
            <p className="admin-eyebrow">Content Manager</p>
            <h1 className="admin-page-title">Manage Articles</h1>
            <p className="admin-page-subtitle">
              Create articles, upload images, and manage article metadata and media.
            </p>
          </div>
        </div>

        {message && <div className="admin-status">{message}</div>}

        <div className="admin-toolbar">
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => setShowArticles((prev) => !prev)}
          >
            {showArticles ? "Hide Existing Articles" : "Show Existing Articles"}
          </button>
        </div>

        {showArticles && (
          <div className="admin-section-card">
            <div className="admin-section-header">
              <h2>Existing Articles</h2>
              <p>Search and select an article to edit.</p>
            </div>

            <div className="admin-form-group">
              <label htmlFor="article-search">Search Articles</label>
              <input
                id="article-search"
                type="text"
                className="admin-search"
                placeholder="Search by title, artist, or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <p className="admin-muted-text">Loading articles...</p>
            ) : filteredArticles.length === 0 ? (
              <p className="admin-muted-text">No articles found.</p>
            ) : (
              <div className="admin-item-grid">
                {filteredArticles.map((article) => (
                  <div key={article.id} className="admin-item-card">
                    <div className="admin-item-card__content">
                      {article.card_image ? (
                        <img
                          src={article.card_image}
                          alt={article.card_image_alt || article.title}
                          className="admin-item-thumb"
                        />
                      ) : null}

                      <div>
                        <strong>{article.title}</strong>
                        {article.artist ? <span>{article.artist}</span> : null}
                        {article.slug ? <span>Slug: {article.slug}</span> : null}
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

                      <a
                        href={`/articles/${article.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-btn admin-btn-outline"
                      >
                        View Live
                      </a>

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
        )}

        <div className="admin-section-card">
          <div className="admin-section-header">
            <h2>{editingId ? "Edit Article" : "Add Article"}</h2>
            <p>
              {editingId
                ? "Update the fields below and save your changes."
                : "Fill out the fields below to add a new article."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="artist">Artist</label>
                <input
                  id="artist"
                  name="artist"
                  type="text"
                  value={form.artist}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="category">Category</label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={form.category}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="slug">Slug</label>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="article-slug"
                  required
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="excerpt">Excerpt</label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows="3"
                value={form.excerpt}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="content_html">Content HTML</label>
              <textarea
                id="content_html"
                name="content_html"
                rows="14"
                value={form.content_html}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="card-image-upload">Upload Card Image</label>
                <div className="admin-file-upload">
                  <label htmlFor="card-image-upload" className="admin-file-label">
                    <input
                      id="card-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "card_image")}
                      className="admin-file-input"
                    />

                    <span className="admin-file-btn">
                      Upload Image
                    </span>

                    <span className="admin-file-text">
                      Choose an image file...
                    </span>
                  </label>
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="card_image">Card Image URL</label>
                <input
                  id="card_image"
                  name="card_image"
                  type="url"
                  value={form.card_image}
                  onChange={handleChange}
                />
              </div>
            </div>

            {form.card_image && (
              <div className="admin-form-group">
                <label>Card Image Preview</label>
                <img
                  src={form.card_image}
                  alt="Card preview"
                  className="admin-image-preview"
                />
              </div>
            )}

            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="card_image_alt">Card Image Alt</label>
                <input
                  id="card_image_alt"
                  name="card_image_alt"
                  type="text"
                  value={form.card_image_alt}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="og_image_url">OG Image URL</label>
                <input
                  id="og_image_url"
                  name="og_image_url"
                  type="url"
                  value={form.og_image_url}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="bottom_image_url">Bottom Image URL</label>
                <input
                  id="bottom_image_url"
                  name="bottom_image_url"
                  type="url"
                  value={form.bottom_image_url}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="hero_media_url">Hero Media URL</label>
                <input
                  id="hero_media_url"
                  name="hero_media_url"
                  type="url"
                  value={form.hero_media_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="hero_media_alt">Hero Media Alt</label>
                <input
                  id="hero_media_alt"
                  name="hero_media_alt"
                  type="text"
                  value={form.hero_media_alt}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="video_url">YouTube / Video URL</label>
                <input
                  id="video_url"
                  name="video_url"
                  type="url"
                  value={form.video_url}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            <div className="admin-checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                />
                Featured
              </label>
            </div>

            <div className="admin-toolbar">
              <button type="submit" className="admin-btn" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Article"
                    : "Add Article"}
              </button>

              {editingId && (
                <>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="admin-btn admin-btn-outline"
                  >
                    Cancel Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(editingId)}
                    className="admin-btn admin-btn-danger"
                  >
                    Delete Article
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AdminArticlesScreen;