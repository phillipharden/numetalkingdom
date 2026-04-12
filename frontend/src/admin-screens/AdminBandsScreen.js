import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const emptyForm = {
  name: "",
  slug: "",
  location: "",
  years_active: "",
  description: "",
  image_url: "",
  website: "",
  instagram: "",
  facebook: "",
  x: "",
  youtube: "",
  spotify: "",
  apple_music: "",
  tiktok: "",
  subgenres: "",
  era: "",
  christian: true,
  featured: false,
  active: true,
};

const AdminBandsScreen = () => {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Checking admin access...");

  const [bands, setBands] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [showBands, setShowBands] = useState(false);
  const [search, setSearch] = useState("");

  const filteredBands = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return bands;

    return bands.filter((band) => {
      const name = (band.name || "").toLowerCase();
      const location = (band.location || "").toLowerCase();
      const yearsActive = (band.years_active || "").toLowerCase();
      const subgenres = Array.isArray(band.subgenres)
        ? band.subgenres.join(" ").toLowerCase()
        : "";
      const era = Array.isArray(band.era) ? band.era.join(" ").toLowerCase() : "";
      const activeStatus =
        band.active === false ? "inactive" : "active";

      return (
        name.includes(term) ||
        location.includes(term) ||
        yearsActive.includes(term) ||
        subgenres.includes(term) ||
        era.includes(term) ||
        activeStatus.includes(term)
      );
    });
  }, [bands, search]);

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Auto-generate slug when name changes
      if (name === "name") {
        updated.slug = generateSlug(value);
      }

      return updated;
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setMessage("Ready.");
  };

  const loadBands = async () => {
    let allBands = [];
    let from = 0;
    const pageSize = 1000;
    let keepGoing = true;

    while (keepGoing) {
      const { data, error } = await supabase
        .from("bands")
        .select("*")
        .order("name")
        .range(from, from + pageSize - 1);

      if (error) {
        console.error("Load bands error:", error);
        setMessage(error.message);
        return;
      }

      allBands = [...allBands, ...(data || [])];

      if (!data || data.length < pageSize) {
        keepGoing = false;
      } else {
        from += pageSize;
      }
    }

    setBands(allBands);
  };

  const checkAdmin = async (user) => {
    if (!user) {
      setSession(null);
      setIsAdmin(false);
      setLoading(false);
      navigate("/admin-login");
      return;
    }

    setSession({ user });

    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data?.is_admin) {
      setIsAdmin(false);
      setLoading(false);
      navigate("/");
      return;
    }

    setIsAdmin(true);
    await loadBands();
    setMessage("Ready.");
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      await checkAdmin(data?.user ?? null);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(() => {
        checkAdmin(nextSession?.user ?? null);
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = (formData.slug || formData.name || "band")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const fileName = `${safeName || "band"}-${Date.now()}.${fileExt}`;
    const filePath = `bands/${fileName}`;

    setMessage("Uploading image...");

    const { error: uploadError } = await supabase.storage
      .from("band-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Band image upload error:", uploadError);
      setMessage(`Upload failed: ${uploadError.message}`);
      return;
    }

    const { data } = supabase.storage
      .from("band-images")
      .getPublicUrl(filePath);

    setFormData((prev) => ({
      ...prev,
      image_url: data.publicUrl,
    }));

    setMessage("Image uploaded successfully. Save the band to keep it.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      location: formData.location.trim(),
      years_active: formData.years_active.trim(),
      description: formData.description.trim(),
      image_url: formData.image_url.trim(),
      website: formData.website.trim(),
      instagram: formData.instagram.trim(),
      facebook: formData.facebook.trim(),
      x: formData.x.trim(),
      youtube: formData.youtube.trim(),
      spotify: formData.spotify.trim(),
      apple_music: formData.apple_music.trim(),
      tiktok: formData.tiktok.trim(),
      subgenres: formData.subgenres
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      era: formData.era
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      christian: formData.christian,
      featured: formData.featured,
      active: formData.active,
    };

    let result;

    if (editingId) {
      result = await supabase.from("bands").update(payload).eq("id", editingId);
    } else {
      result = await supabase.from("bands").insert([payload]);
    }

    if (result.error) {
      console.error("Save band error:", result.error);
      setMessage(result.error.message);
      setSaving(false);
      return;
    }

    setMessage(editingId ? "Band updated successfully." : "Band added successfully.");
    resetForm();
    await loadBands();
    setSaving(false);
  };

  const handleEdit = (band) => {
    setEditingId(band.id);

    setFormData({
      name: band.name || "",
      slug: band.slug || "",
      location: band.location || "",
      years_active: band.years_active || "",
      description: band.description || "",
      image_url: band.image_url || "",
      website: band.website || "",
      instagram: band.instagram || "",
      facebook: band.facebook || "",
      x: band.x || "",
      youtube: band.youtube || "",
      spotify: band.spotify || "",
      apple_music: band.apple_music || "",
      tiktok: band.tiktok || "",
      subgenres: Array.isArray(band.subgenres) ? band.subgenres.join(", ") : "",
      era: Array.isArray(band.era) ? band.era.join(", ") : "",
      christian: !!band.christian,
      featured: !!band.featured,
      active: band.active !== false,
    });

    setMessage(`Editing ${band.name}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async () => {
    if (!editingId) return;

    const confirmed = window.confirm("Are you sure you want to delete this band?");
    if (!confirmed) return;

    const { error } = await supabase.from("bands").delete().eq("id", editingId);

    if (error) {
      console.error("Delete band error:", error);
      setMessage(error.message);
      return;
    }

    setMessage("Band deleted successfully.");
    resetForm();
    await loadBands();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  if (loading) {
    return (
      <section className="admin-shell">
        <div className="admin-panel">
          <h1 className="admin-page-title">Loading Bands Admin...</h1>
          <p className="admin-page-subtitle">Checking access and loading bands.</p>
        </div>
      </section>
    );
  }

  if (!session || !isAdmin) return null;

  return (
    <section className="admin-shell">
      <div className="admin-panel">
        <div className="admin-page-header">
          <div>
            <Link to="/admin" className="admin-back-link">
              ← Back to Admin Dashboard
            </Link>
            <p className="admin-eyebrow">Content Manager</p>
            <h1 className="admin-page-title">Manage Bands</h1>
            <p className="admin-page-subtitle">
              Add new bands, update existing entries, and manage image and social links.
            </p>
          </div>
        </div>

        {message && <div className="admin-status">{message}</div>}

        <div className="admin-toolbar">
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => setShowBands((prev) => !prev)}
          >
            {showBands ? "Hide Existing Bands" : "Show Existing Bands"}
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>

        {showBands && (
          <div className="admin-section-card">
            <div className="admin-section-header">
              <h2>Existing Bands</h2>
              <p>Search and select a band to edit.</p>
            </div>

            <div className="admin-form-group">
              <label htmlFor="band-search">Search Bands</label>
              <input
                id="band-search"
                type="text"
                className="admin-search"
                placeholder="Search by name, location, years, genre, era, or active status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {filteredBands.length === 0 ? (
              <p className="admin-muted-text">No bands found matching your search.</p>
            ) : (
              <div className="admin-item-grid">
                {filteredBands.map((band) => (
                  <button
                    key={band.id}
                    type="button"
                    className="admin-item-card admin-item-card--button"
                    onClick={() => handleEdit(band)}
                  >
                    <div className="admin-item-card__content">
                      {band.image_url ? (
                        <img
                          src={band.image_url}
                          alt={band.name}
                          className="admin-item-thumb"
                        />
                      ) : null}

                      <div>
                        <strong>{band.name}</strong>
                        {band.location ? <span>{band.location}</span> : null}
                        {Array.isArray(band.subgenres) && band.subgenres.length > 0 ? (
                          <span>{band.subgenres.join(", ")}</span>
                        ) : null}
                        <span>{band.active === false ? "Inactive" : "Active"}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="admin-section-card">
          <div className="admin-section-header">
            <h2>{editingId ? "Edit Band" : "Add Band"}</h2>
            <p>
              {editingId
                ? "Update the fields below and save your changes."
                : "Fill out the fields below to add a new band."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="name">Band Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
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
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="years_active">Years Active</label>
                <input
                  id="years_active"
                  name="years_active"
                  type="text"
                  value={formData.years_active}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="6"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="band_image">Upload Image</label>
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
                <label htmlFor="image_url">Image URL</label>
                <input
                  id="image_url"
                  name="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={handleChange}
                />
              </div>
            </div>

            {formData.image_url && (
              <div className="admin-form-group">
                <label>Image Preview</label>
                <img
                  src={formData.image_url}
                  alt="Band preview"
                  className="admin-image-preview"
                />
              </div>
            )}

            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="instagram">Instagram</label>
                <input
                  id="instagram"
                  name="instagram"
                  type="url"
                  value={formData.instagram}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="facebook">Facebook</label>
                <input
                  id="facebook"
                  name="facebook"
                  type="url"
                  value={formData.facebook}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="x">X</label>
                <input
                  id="x"
                  name="x"
                  type="url"
                  value={formData.x}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="youtube">YouTube</label>
                <input
                  id="youtube"
                  name="youtube"
                  type="url"
                  value={formData.youtube}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="spotify">Spotify</label>
                <input
                  id="spotify"
                  name="spotify"
                  type="url"
                  value={formData.spotify}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="apple_music">Apple Music</label>
                <input
                  id="apple_music"
                  name="apple_music"
                  type="url"
                  value={formData.apple_music}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="tiktok">TikTok</label>
                <input
                  id="tiktok"
                  name="tiktok"
                  type="url"
                  value={formData.tiktok}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="admin-form-grid admin-form-grid--two">
              <div className="admin-form-group">
                <label htmlFor="subgenres">Subgenres</label>
                <input
                  id="subgenres"
                  name="subgenres"
                  type="text"
                  value={formData.subgenres}
                  onChange={handleChange}
                  placeholder="nu metal, hard rock, alternative metal"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="era">Era</label>
                <input
                  id="era"
                  name="era"
                  type="text"
                  value={formData.era}
                  onChange={handleChange}
                  placeholder="90s, 2000s"
                />
              </div>
            </div>

            <div className="admin-checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="christian"
                  checked={formData.christian}
                  onChange={handleChange}
                />
                Christian
              </label>

              <label>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                Featured
              </label>

              <label>
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                />
                Active
              </label>
            </div>

            <div className="admin-toolbar">
              <button type="submit" className="admin-btn" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update Band" : "Add Band"}
              </button>

              {editingId && (
                <>
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    onClick={resetForm}
                  >
                    Cancel Edit
                  </button>

                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    onClick={handleDelete}
                  >
                    Delete Band
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

export default AdminBandsScreen;