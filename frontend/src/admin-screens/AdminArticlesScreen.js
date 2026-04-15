import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

const ARTICLE_IMAGE_BUCKET = "article-images";

const emptyForm = {
  title: "",
  slug: "",
  date: "",
  category: "",
  excerpt: "",
  content_html: "",
  banner_image_url: "",
  footer_media_type: "none",
  footer_image_url: "",
  footer_youtube_url: "",
  cta_label: "",
  cta_url: "",
  band_name: "",
  band_slug: "",
};

const AdminArticlesScreen = () => {
  const [articles, setArticles] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingArticle, setEditingArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState("");
  const [message, setMessage] = useState("");

  const [bandMatches, setBandMatches] = useState([]);
  const [searchingBands, setSearchingBands] = useState(false);
  const [showBandMatches, setShowBandMatches] = useState(false);

  const bandSearchTimeout = useRef(null);

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

  useEffect(() => {
    const query = formData.band_name.trim();

    if (!query) {
      setBandMatches([]);
      setSearchingBands(false);
      setShowBandMatches(false);
      return;
    }

    if (bandSearchTimeout.current) {
      clearTimeout(bandSearchTimeout.current);
    }

    bandSearchTimeout.current = setTimeout(() => {
      searchBands(query);
    }, 250);

    return () => {
      if (bandSearchTimeout.current) {
        clearTimeout(bandSearchTimeout.current);
      }
    };
  }, [formData.band_name]);

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
    setUploadingField("");
    setBandMatches([]);
    setShowBandMatches(false);
    setSearchingBands(false);
  };

  const slugify = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const searchBands = async (query) => {
    try {
      setSearchingBands(true);

      const { data, error } = await supabase
        .from("bands")
        .select("name, slug")
        .ilike("name", `%${query}%`)
        .order("name", { ascending: true })
        .limit(8);

      if (error) {
        console.error("Error searching bands:", error);
        setBandMatches([]);
        return;
      }

      setBandMatches(data || []);
      setShowBandMatches(true);
    } catch (error) {
      console.error("Band search failed:", error);
      setBandMatches([]);
    } finally {
      setSearchingBands(false);
    }
  };

  const applyBandToForm = (band) => {
    setFormData((prev) => ({
      ...prev,
      band_name: band.name || "",
      band_slug: band.slug || "",
    }));

    setBandMatches([]);
    setShowBandMatches(false);
    setMessage(`Band selected: ${band.name}`);
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

      if (name === "footer_media_type" && value !== "image") {
        updated.footer_image_url = "";
      }

      if (name === "footer_media_type" && value !== "youtube") {
        updated.footer_youtube_url = "";
      }

      if (name === "band_name") {
        updated.band_slug = "";
      }

      return updated;
    });

    if (name === "band_name") {
      setShowBandMatches(true);
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setMessage("");

    setFormData({
      title: article.title || "",
      slug: article.slug || "",
      date: article.date || "",
      category: article.category || "",
      excerpt: article.excerpt || "",
      content_html: article.content_html || "",
      banner_image_url: article.banner_image_url || "",
      footer_media_type: article.footer_media_type || "none",
      footer_image_url: article.footer_image_url || "",
      footer_youtube_url: article.footer_youtube_url || "",
      cta_label: article.cta_label || "",
      cta_url: article.cta_url || "",
      band_name: article.band_name || "",
      band_slug: article.band_slug || "",
    });

    setBandMatches([]);
    setShowBandMatches(false);

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

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingField(fieldName);
      setMessage("");

      const fileExt = file.name.split(".").pop();
      const safeSlug = slugify(formData.slug || formData.title || "article-image");
      const fileName = `${Date.now()}-${safeSlug}-${fieldName}.${fileExt}`;
      const filePath = `articles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(ARTICLE_IMAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(ARTICLE_IMAGE_BUCKET).getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        [fieldName]: publicUrl,
      }));

      setMessage("Image uploaded successfully.");
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      setMessage(error.message || "Image upload failed.");
    } finally {
      setUploadingField("");
      e.target.value = "";
    }
  };

  const renderImagePreview = (label, url, altText = "Preview image") => {
    if (!url) return null;

    return (
      <div className="admin-form-group">
        <label>{label} Preview</label>
        <div className="admin-item-card">
          <div className="admin-item-card__content">
            <img src={url} alt={altText} className="admin-item-thumb" />
            <div>
              <strong>{label}</strong>
              <span>{url}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const articleData = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        date: formData.date || null,
        category: formData.category.trim(),
        excerpt: formData.excerpt.trim(),
        content_html: formData.content_html,
        banner_image_url: formData.banner_image_url.trim(),
        footer_media_type: formData.footer_media_type.trim() || "none",
        footer_image_url:
          formData.footer_media_type === "image"
            ? formData.footer_image_url.trim()
            : "",
        footer_youtube_url:
          formData.footer_media_type === "youtube"
            ? formData.footer_youtube_url.trim()
            : "",
        cta_label: formData.cta_label.trim(),
        cta_url: formData.cta_url.trim(),
        band_name: formData.band_name.trim(),
        band_slug: formData.band_slug.trim(),
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

      const wasEditing = Boolean(editingArticle);

      resetForm();
      await fetchArticles();

      setMessage(
        wasEditing
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
            <Link to="/admin" className="admin-back-link">
              ← Back to Admin Dashboard
            </Link>
            <p className="admin-eyebrow">Nu Metal Kingdom Admin</p>
            <h1 className="admin-page-title">
              {editingArticle ? "Edit Article" : "Add Article"}
            </h1>
            <p className="admin-page-subtitle">
              Create, edit, and manage article content.
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
              <p>Main content and article body.</p>
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

              <div className="admin-form-group admin-band-search-group">
                <label htmlFor="band_name">Band Name</label>
                <input
                  id="band_name"
                  name="band_name"
                  type="text"
                  value={formData.band_name}
                  onChange={handleChange}
                  onFocus={() => {
                    if (bandMatches.length > 0) setShowBandMatches(true);
                  }}
                  autoComplete="off"
                  placeholder="Start typing to search bands..."
                />

                {searchingBands && (
                  <div className="admin-muted-text mt-2">Searching bands...</div>
                )}

                {showBandMatches && bandMatches.length > 0 && (
                  <div className="admin-band-search-results">
                    {bandMatches.map((band) => (
                      <button
                        key={band.slug}
                        type="button"
                        className="admin-band-search-result"
                        onClick={() => applyBandToForm(band)}
                      >
                        <strong>{band.name}</strong>
                        <span>{band.slug}</span>
                      </button>
                    ))}
                  </div>
                )}

                {formData.band_slug && (
                  <div className="admin-muted-text mt-2">
                    Connected band slug: <strong>{formData.band_slug}</strong>
                  </div>
                )}
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
              <p>Upload images or paste image URLs. Previews show automatically.</p>
            </div>

            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="banner_image_url">Article Banner Image URL</label>
                <input
                  id="banner_image_url"
                  name="banner_image_url"
                  type="text"
                  value={formData.banner_image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="admin-file-upload">
                <input
                  id="banner-image-upload"
                  type="file"
                  className="admin-file-input"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "banner_image_url")}
                />

                <label htmlFor="banner-image-upload" className="admin-file-label">
                  <span className="admin-file-btn">Choose File</span>
                  <span className="admin-file-text">Upload Banner Image</span>
                </label>
              </div>

              {renderImagePreview(
                "Article Banner",
                formData.banner_image_url,
                formData.title || "Article banner preview"
              )}

              <div className="admin-form-group">
                <label htmlFor="footer_media_type">Footer Media Type</label>
                <select
                  id="footer_media_type"
                  name="footer_media_type"
                  value={formData.footer_media_type}
                  onChange={handleChange}
                >
                  <option value="none">None</option>
                  <option value="image">Image</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              {formData.footer_media_type === "image" && (
                <>
                  <div className="admin-form-group">
                    <label htmlFor="footer_image_url">Footer Image URL</label>
                    <input
                      id="footer_image_url"
                      name="footer_image_url"
                      type="text"
                      value={formData.footer_image_url}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="admin-file-upload">
                    <input
                      id="footer-image-upload"
                      type="file"
                      className="admin-file-input"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "footer_image_url")}
                    />

                    <label htmlFor="footer-image-upload" className="admin-file-label">
                      <span className="admin-file-btn">Choose File</span>
                      <span className="admin-file-text">Upload Footer Image</span>
                    </label>
                  </div>

                  {renderImagePreview(
                    "Footer Image",
                    formData.footer_image_url,
                    formData.title || "Footer image preview"
                  )}
                </>
              )}

              {formData.footer_media_type === "youtube" && (
                <div className="admin-form-group">
                  <label htmlFor="footer_youtube_url">Footer YouTube URL</label>
                  <input
                    id="footer_youtube_url"
                    name="footer_youtube_url"
                    type="text"
                    value={formData.footer_youtube_url}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              )}
            </div>
          </div>

          <div className="admin-section-card">
            <div className="admin-section-header">
              <h2>Article Button / CTA</h2>
              <p>Add an optional button at the end of the article.</p>
            </div>

            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="cta_label">Button Text</label>
                <input
                  id="cta_label"
                  name="cta_label"
                  type="text"
                  value={formData.cta_label}
                  onChange={handleChange}
                  placeholder="Read More"
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
                    {article.banner_image_url ? (
                      <img
                        src={article.banner_image_url}
                        alt={article.title}
                        className="admin-item-thumb"
                      />
                    ) : null}

                    <div>
                      <strong>{article.title}</strong>
                      <span>Slug: {article.slug}</span>
                      {article.band_name && <span>Band: {article.band_name}</span>}
                      {article.band_slug && <span>Band Slug: {article.band_slug}</span>}
                      {article.category && <span>Category: {article.category}</span>}
                      {article.date && <span>Date: {article.date}</span>}
                      {article.cta_label && article.cta_url && (
                        <span>CTA: {article.cta_label}</span>
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