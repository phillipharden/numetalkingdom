import { useEffect, useState } from "react";
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
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState(emptyForm);

  const fetchReleases = async () => {
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

    setMessage("Image uploaded successfully. Click Update Release to save it.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      artist: form.artist,
      title: form.title,
      type: form.type,
      label: form.label,
      release_date: form.release_date,
      genre: form.genre,
      slug: form.slug,
      featured: form.featured,
      nu_metal_umbrella: form.nu_metal_umbrella,
      umbrella_category: form.umbrella_category,
      priority: Number(form.priority) || 1,
      presave: form.presave,
      spotify_url: form.spotify_url,
      apple_url: form.apple_url,
      youtube_url: form.youtube_url,
      notes: form.notes,
      cover_url: form.cover_url,
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("releases")
        .update(payload)
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("releases")
        .insert([payload]);
    }

    if (result.error) {
      console.error("Save release error:", result.error);
      setMessage(result.error.message);
      return;
    }

    setMessage(
      editingId ? "Release updated successfully." : "Release added successfully."
    );

    resetForm();
    await fetchReleases();
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this release?")) return;

    const { error } = await supabase
      .from("releases")
      .delete()
      .eq("id", id);

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
    <section className="admin-container">
      <div className="admin-card">
        <h1 className="admin-title">Manage Releases</h1>

        {message && (
          <div className="admin-status">
            <strong>Status:</strong> {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-group">
            <label>Artist</label>
            <input
              name="artist"
              value={form.artist}
              onChange={handleChange}
              required
            />
          </div>

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
            <label>Release Date</label>
            <input
              type="date"
              name="release_date"
              value={form.release_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Type</label>
            <select
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
            <label>Label</label>
            <input
              name="label"
              value={form.label}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label>Genre</label>
            <input
              name="genre"
              value={form.genre}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label>Slug</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label>Release Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          {form.cover_url && (
            <div className="admin-form-group">
              <label>Preview</label>
              <img
                src={form.cover_url}
                alt="Preview"
                className="admin-image-preview"
              />
            </div>
          )}

          <div className="admin-form-group">
            <label>Image URL</label>
            <input
              name="cover_url"
              value={form.cover_url}
              onChange={handleChange}
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

          <div className="admin-form-group">
            <label>Priority</label>
            <input
              type="number"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            />
          </div>

          <div className="admin-actions">
            <button className="admin-btn">
              {editingId ? "Update Release" : "Add Release"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="admin-btn admin-btn-outline"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-card mt-4">
        <h2>Existing Releases</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="admin-band-grid">
            {releases.map((release) => (
              <div key={release.id} className="admin-band-item">
                <strong>{release.artist}</strong> — {release.title}

                <div className="admin-actions">
                  <button
                    type="button"
                    onClick={() => handleEdit(release)}
                    className="admin-btn admin-btn-outline"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(release.id)}
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

export default AdminReleasesScreen;