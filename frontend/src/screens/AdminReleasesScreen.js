import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const emptyForm = {
  artist: "",
  title: "",
  type: "single",
  label: "",
  release_date: "",
  genre: "",
  slug: "",
  featured: false,
  nu_metal_umbrella: false,
  umbrella_category: "outside",
  priority: 1,
  presave: "",
  spotify_url: "",
  apple_url: "",
  youtube_url: "",
  notes: "",
  cover_url: "",
};

const AdminReleasesScreen = () => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState(emptyForm);

  const [showReleases, setShowReleases] = useState(false);
  const [search, setSearch] = useState("");

  const filteredReleases = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return releases;

    return releases.filter((release) => {
      const artist = (release.artist || "").toLowerCase();
      const title = (release.title || "").toLowerCase();
      return artist.includes(term) || title.includes(term);
    });
  }, [releases, search]);

  const fetchReleases = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("releases")
      .select("*")
      .order("release_date", { ascending: false });

    if (error) {
      console.error("Fetch releases error:", error);
      setMessage(error.message);
    } else {
      setReleases(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "priority"
            ? Number(value)
            : value,
    }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setMessage("Ready.");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = (form.slug || form.title || form.artist || "release")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const fileName = `${safeName}-${Date.now()}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    setMessage("Uploading image...");

    const { error } = await supabase.storage
      .from("release-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
      });

    if (error) {
      console.error("Release upload error:", error);
      setMessage(`Upload failed: ${error.message}`);
      return;
    }

    const { data } = supabase.storage
      .from("release-images")
      .getPublicUrl(filePath);

    setForm((prev) => ({
      ...prev,
      cover_url: data.publicUrl,
    }));

    setMessage("Image uploaded successfully. Save the release to keep it.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      artist: form.artist.trim(),
      title: form.title.trim(),
      type: form.type,
      label: form.label.trim(),
      release_date: form.release_date,
      genre: form.genre.trim(),
      slug: form.slug.trim(),
      featured: form.featured,
      nu_metal_umbrella: form.nu_metal_umbrella,
      umbrella_category: form.umbrella_category,
      priority: Number(form.priority) || 1,
      presave: form.presave.trim(),
      spotify_url: form.spotify_url.trim(),
      apple_url: form.apple_url.trim(),
      youtube_url: form.youtube_url.trim(),
      notes: form.notes.trim(),
      cover_url: form.cover_url.trim(),
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("releases")
        .update(payload)
        .eq("id", editingId);
    } else {
      result = await supabase.from("releases").insert([payload]);
    }

    if (result.error) {
      console.error("Save release error:", result.error);
      setMessage(result.error.message);
      setSaving(false);
      return;
    }

    setMessage(
      editingId ? "Release updated successfully." : "Release added successfully."
    );

    resetForm();
    await fetchReleases();
    setSaving(false);
  };

  const handleEdit = (release) => {
    setForm({
      artist: release.artist || "",
      title: release.title || "",
      type: release.type || "single",
      label: release.label || "",
      release_date: release.release_date || "",
      genre: release.genre || "",
      slug: release.slug || "",
      featured: !!release.featured,
      nu_metal_umbrella: !!release.nu_metal_umbrella,
      umbrella_category: release.umbrella_category || "outside",
      priority: release.priority ?? 1,
      presave: release.presave || "",
      spotify_url: release.spotify_url || "",
      apple_url: release.apple_url || "",
      youtube_url: release.youtube_url || "",
      notes: release.notes || "",
      cover_url: release.cover_url || "",
    });

    setEditingId(release.id);
    setMessage(`Editing ${release.artist} — ${release.title}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this release?")) return;

    const { error } = await supabase.from("releases").delete().eq("id", id);

    if (error) {
      console.error("Delete release error:", error);
      setMessage(error.message);
      return;
    }

    setMessage("Release deleted successfully.");

    if (editingId === id) {
      resetForm();
    }

    await fetchReleases();
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
            <h1 className="admin-page-title">Manage Releases</h1>
            <p className="admin-page-subtitle">
              Add new releases, edit existing entries, and manage cover images and platform links.
            </p>
          </div>
        </div>

        {message && <div className="admin-status">{message}</div>}

        <div className="admin-toolbar">
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => setShowReleases((prev) => !prev)}
          >
            {showReleases ? "Hide Existing Releases" : "Show Existing Releases"}
          </button>
        </div>

        {showReleases && (
          <div className="admin-section-card">
            <div className="admin-section-header">
              <h2>Existing Releases</h2>
              <p>Search and select a release to edit.</p>
            </div>

            <div className="admin-form-group">
              <label htmlFor="release-search">Search Releases</label>
              <input
                id="release-search"
                type="text"
                className="admin-search"
                placeholder="Search by artist or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <p className="admin-muted-text">Loading releases...</p>
            ) : filteredReleases.length === 0 ? (
              <p className="admin-muted-text">No releases found.</p>
            ) : (
              <div className="admin-item-grid">
                {filteredReleases.map((release) => (
                  <div key={release.id} className="admin-item-card">
                    <div className="admin-item-card__content">
                      {release.cover_url ? (
                        <img
                          src={release.cover_url}
                          alt={`${release.artist} ${release.title} cover`}
                          className="admin-item-thumb"
                        />
                      ) : null}

                      <div>
                        <strong>
                          {release.artist} — {release.title}
                        </strong>
                        <span>
                          {release.release_date || "No date"} · {release.type || "release"}
                        </span>
                        {release.slug ? <span>Slug: {release.slug}</span> : null}
                      </div>
                    </div>

                    <div className="admin-item-card__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn-outline"
                        onClick={() => handleEdit(release)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={() => handleDelete(release.id)}
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
            <h2>{editingId ? "Edit Release" : "Add Release"}</h2>
            <p>
              {editingId
                ? "Update the fields below and save your changes."
                : "Fill out the fields below to add a new release."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="artist">Artist</label>
                <input
                  id="artist"
                  name="artist"
                  type="text"
                  value={form.artist}
                  onChange={handleChange}
                  required
                />
              </div>

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
                <label htmlFor="release_date">Release Date</label>
                <input
                  id="release_date"
                  type="date"
                  name="release_date"
                  value={form.release_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="single">Single</option>
                  <option value="ep">EP</option>
                  <option value="album">Album</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label htmlFor="label">Label</label>
                <input
                  id="label"
                  name="label"
                  type="text"
                  value={form.label}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="genre">Genre</label>
                <input
                  id="genre"
                  name="genre"
                  type="text"
                  value={form.genre}
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
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="priority">Priority</label>
                <input
                  id="priority"
                  type="number"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="presave">Presave Link</label>
                <input
                  id="presave"
                  type="url"
                  name="presave"
                  value={form.presave}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="spotify_url">Spotify URL</label>
                <input
                  id="spotify_url"
                  type="url"
                  name="spotify_url"
                  value={form.spotify_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="apple_url">Apple Music URL</label>
                <input
                  id="apple_url"
                  type="url"
                  name="apple_url"
                  value={form.apple_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="youtube_url">YouTube URL</label>
                <input
                  id="youtube_url"
                  type="url"
                  name="youtube_url"
                  value={form.youtube_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="release_image">Release Image</label>
                <div className="admin-file-upload">
                  <label className="admin-file-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
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
                <label htmlFor="cover_url">Image URL</label>
                <input
                  id="cover_url"
                  name="cover_url"
                  type="url"
                  value={form.cover_url}
                  onChange={handleChange}
                />
              </div>
            </div>

            {form.cover_url && (
              <div className="admin-form-group">
                <label>Cover Preview</label>
                <img
                  src={form.cover_url}
                  alt="Release cover preview"
                  className="admin-image-preview"
                />
              </div>
            )}

            <div className="admin-form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows="5"
                value={form.notes}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="umbrella_category">Umbrella Category</label>
                <select
                  id="umbrella_category"
                  name="umbrella_category"
                  value={form.umbrella_category}
                  onChange={handleChange}
                >
                  <option value="outside">Outside</option>
                  <option value="adjacent">Adjacent</option>
                  <option value="inside">Inside</option>
                </select>
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

              <label>
                <input
                  type="checkbox"
                  name="nu_metal_umbrella"
                  checked={form.nu_metal_umbrella}
                  onChange={handleChange}
                />
                Nu Metal Umbrella
              </label>
            </div>

            <div className="admin-toolbar">
              <button type="submit" className="admin-btn" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Release"
                    : "Add Release"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="admin-btn admin-btn-outline"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AdminReleasesScreen;