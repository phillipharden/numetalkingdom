import { useEffect, useMemo, useState } from "react";
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
};

const AdminBandsScreen = () => {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("Checking admin access...");
  const [loading, setLoading] = useState(true);

  const [bands, setBands] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState(emptyForm);

  const filteredBands = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return [];

    return bands.filter((band) =>
      (band.name || "").toLowerCase().includes(term)
    );
  }, [bands, search]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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
      console.error("UPLOAD ERROR:", uploadError);
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

    setMessage("Image uploaded successfully. Click Update Band to save it.");
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setMessage("Ready");
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
        setMessage(error.message);
        return;
      }

      if (!data || data.length === 0) {
        keepGoing = false;
      } else {
        allBands = [...allBands, ...data];
        from += pageSize;

        if (data.length < pageSize) {
          keepGoing = false;
        }
      }
    }

    setBands(allBands);
  };

  const handleAddBand = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      subgenres: formData.subgenres
        ? formData.subgenres
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      era: formData.era
        ? formData.era
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("bands")
        .update(payload)
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("bands")
        .insert([payload]);
    }

    const { error } = result;

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      editingId ? "Band updated successfully" : "Band added successfully"
    );

    resetForm();
    await loadBands();
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
    });

    setMessage(`Editing ${band.name}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async () => {
    if (!editingId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this band?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("bands")
      .delete()
      .eq("id", editingId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Band deleted successfully");
    resetForm();
    await loadBands();
  };

  const checkAdmin = async (user) => {
    if (!user) {
      setSession(null);
      setIsAdmin(false);
      setMessage("No active session");
      setLoading(false);
      return;
    }

    setSession({ user });

    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && data?.is_admin) {
      setIsAdmin(true);
      setMessage("Admin check passed");
      await loadBands();
    } else {
      setIsAdmin(false);
      setMessage("Admin check failed");
    }

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        checkAdmin(session?.user ?? null);
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <section className="container py-5">
        <h1>Admin</h1>
        <p>Loading...</p>
        <p>{message}</p>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="container py-5">
        <h1>Admin</h1>
        <p>You are not logged in.</p>
        <p>{message}</p>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="container py-5">
        <h1>Admin</h1>
        <p>You are logged in, but not authorized.</p>
        <p>{message}</p>
      </section>
    );
  }

  return (
    <section className="admin-container">
      <div className="admin-card">
        <h1 className="admin-title">Band Admin</h1>
        <p className="admin-subtitle">Manage bands for Nu Metal Kingdom</p>

        <div className="admin-status">
          <strong>Status:</strong> {message}
        </div>

        <div className="admin-band-list">
          <h3>Edit Existing Band</h3>

          <input
            type="text"
            placeholder="Search bands..."
            className="admin-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {!search ? (
            <p>Start typing to search bands...</p>
          ) : filteredBands.length === 0 ? (
            <p>No bands found.</p>
          ) : (
            <div className="admin-band-grid">
              {filteredBands.map((band) => (
                <button
                  key={band.id}
                  type="button"
                  className="admin-band-item"
                  onClick={() => handleEdit(band)}
                >
                  {band.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleAddBand} className="admin-form">
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

          <div className="admin-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="band_image">Upload Image</label>
            <input
              id="band_image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="image_url">Image URL</label>
            <input
              id="image_url"
              name="image_url"
              type="text"
              value={formData.image_url}
              onChange={handleChange}
            />
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

          <div className="admin-form-group">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              value={formData.website}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="instagram">Instagram</label>
            <input
              id="instagram"
              name="instagram"
              type="text"
              value={formData.instagram}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="facebook">Facebook</label>
            <input
              id="facebook"
              name="facebook"
              type="text"
              value={formData.facebook}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="x">X</label>
            <input
              id="x"
              name="x"
              type="text"
              value={formData.x}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="youtube">YouTube</label>
            <input
              id="youtube"
              name="youtube"
              type="text"
              value={formData.youtube}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="spotify">Spotify</label>
            <input
              id="spotify"
              name="spotify"
              type="text"
              value={formData.spotify}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="apple_music">Apple Music</label>
            <input
              id="apple_music"
              name="apple_music"
              type="text"
              value={formData.apple_music}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="tiktok">TikTok</label>
            <input
              id="tiktok"
              name="tiktok"
              type="text"
              value={formData.tiktok}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="subgenres">Subgenres (comma separated)</label>
            <input
              id="subgenres"
              name="subgenres"
              type="text"
              value={formData.subgenres}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="era">Era (comma separated)</label>
            <input
              id="era"
              name="era"
              type="text"
              value={formData.era}
              onChange={handleChange}
            />
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
          </div>

          <div className="admin-actions">
            <button type="submit" className="admin-btn">
              {editingId ? "Update Band" : "Add Band"}
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

            <button
              type="button"
              className="admin-btn admin-btn-outline"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AdminBandsScreen;