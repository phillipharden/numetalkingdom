import { useEffect, useState } from "react";
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
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(emptyForm);

  const fetchArticles = async () => {
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

    setMessage("Image uploaded successfully. Click Update Article to save it.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalSlug = form.slug.trim() || makeSlug(form.title);

    if (!finalSlug) {
      setMessage("Slug is required.");
      return;
    }

    const payload = {
      title: form.title,
      artist: form.artist,
      date: form.date,
      category: form.category,
      excerpt: form.excerpt,
      slug: finalSlug,
      content_html: form.content_html,
      card_image: form.card_image,
      card_image_alt: form.card_image_alt,
      og_image_url: form.og_image_url,
      bottom_image_url: form.bottom_image_url,
      hero_media: form.hero_media_url
        ? {
          type: "image",
          url: form.hero_media_url,
          alt: form.hero_media_alt || form.title,
        }
        : null,
      video: form.video_url
        ? {
          url: form.video_url,
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
      result = await supabase
        .from("articles")
        .insert([payload]);
    }

    if (result.error) {
      console.error("Save article error:", result.error);
      setMessage(result.error.message);
      return;
    }

    setMessage(
      editingId ? "Article updated successfully." : "Article added successfully."
    );

    resetForm();
    await fetchArticles();
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

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id);

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
    <section className="admin-container">
      <div className="admin-card">
        <h1 className="admin-title">Manage Articles</h1>

        {message && (
          <div className="admin-status">
            <strong>Status:</strong> {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-group">
            <label>Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Artist</label>
            <input
              name="artist"
              value={form.artist}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label>Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label>Excerpt</label>
            <textarea
              name="excerpt"
              rows="3"
              value={form.excerpt}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label>Slug</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="article-slug"
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Content HTML</label>
            <textarea
              name="content_html"
              rows="14"
              value={form.content_html}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label>Upload Card Image</label>

            <div className="admin-file-upload">
              <input
                id="card-image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "card_image")}
                className="admin-file-input"
              />

              <label htmlFor="card-image-upload" className="admin-file-label">
                <span className="admin-file-btn">Choose Image</span>
                <span className="admin-file-text">No file chosen</span>
              </label>
            </div>
          </div>

          <div className="admin-form-group">
            <label>Card Image URL</label>
            <input
              name="card_image"
              value={form.card_image}
              onChange={handleChange}
            />
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

          <div className="admin-form-group">
            <label>Card Image Alt</label>
            <input
              name="card_image_alt"
              value={form.card_image_alt}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label>OG Image URL</label>
            <input
              name="og_image_url"
              value={form.og_image_url}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label>Bottom Image URL</label>
            <input
              name="bottom_image_url"
              value={form.bottom_image_url}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label>Hero Media URL</label>
            <input
              name="hero_media_url"
              value={form.hero_media_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="admin-form-group">
            <label>Hero Media Alt</label>
            <input
              name="hero_media_alt"
              value={form.hero_media_alt}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label>YouTube / Video URL</label>
            <input
              name="video_url"
              value={form.video_url}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
            />
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

          <div className="admin-actions">
            <button type="submit" className="admin-btn">
              {editingId ? "Update Article" : "Add Article"}
            </button>

            {editingId && (
              <>
                <button
                  type="button"
                  onClick={resetForm}
                  className="admin-btn admin-btn-outline"
                >
                  Cancel
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

      <div className="admin-card mt-4">
        <h2>Existing Articles</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="admin-band-grid">
            {articles.map((article) => (
              <div key={article.id} className="admin-band-item">
                <strong>{article.title}</strong>
                {article.artist ? ` — ${article.artist}` : ""}

                <div style={{ marginTop: "8px", fontSize: "14px", opacity: 0.8 }}>
                  Slug: {article.slug}
                </div>

                <div className="admin-actions">
                  <button
                    type="button"
                    onClick={() => handleEdit(article)}
                    className="admin-btn admin-btn-outline"
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
                    onClick={() => handleDelete(article.id)}
                    className="admin-btn admin-btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminArticlesScreen;