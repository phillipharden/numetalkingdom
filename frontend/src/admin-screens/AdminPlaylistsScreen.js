import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";



const generateSpotifyEmbed = (url) => {
    if (!url) return "";

    const match = url.match(/spotify\.com\/(playlist|album|track|artist)\/([a-zA-Z0-9]+)/);

    if (!match) return "";

    const type = match[1];
    const id = match[2];

    return `https://open.spotify.com/embed/${type}/${id}`;
};

const emptyForm = {
    title: "",
    slug: "",
    description: "",
    platform: "Spotify",
    url: "",
    embed_url: "",
    image_url: "",
    featured: false,
};

const makeSlug = (text) =>
    (text || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const AdminPlaylistsScreen = () => {
    const [playlists, setPlaylists] = useState([]);
    const [formData, setFormData] = useState({ ...emptyForm });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [imageName, setImageName] = useState("");

    const [showPlaylists, setShowPlaylists] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        setFetching(true);
        setLoading(true);

        const { data, error } = await supabase
            .from("playlists")
            .select("*")
            .order("featured", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching playlists:", error);
            setMessage(
                error.message ||
                error.details ||
                error.hint ||
                "Failed to load playlists."
            );
        } else {
            setPlaylists(data || []);
        }

        setFetching(false);
        setLoading(false);
    };

    const filteredPlaylists = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return playlists;

        return playlists.filter((playlist) => {
            const title = (playlist.title || "").toLowerCase();
            const slug = (playlist.slug || "").toLowerCase();
            const platform = (playlist.platform || "").toLowerCase();
            const description = (playlist.description || "").toLowerCase();

            return (
                title.includes(term) ||
                slug.includes(term) ||
                platform.includes(term) ||
                description.includes(term)
            );
        });
    }, [playlists, search]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => {
            const next = {
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            };

            // Auto slug
            if (name === "title" && !prev.slug.trim()) {
                next.slug = makeSlug(value);
            }

            // Auto Spotify embed
            if (name === "url" && value.includes("spotify.com")) {
                next.embed_url = generateSpotifyEmbed(value);
            }

            return next;
        });
    };

    const resetForm = () => {
        setFormData({ ...emptyForm });
        setEditingId(null);
        setImageName("");
        setMessage("Ready.");
    };

    const handleEdit = (playlist) => {
        setEditingId(playlist.id);
        setFormData({
            title: playlist.title || "",
            slug: playlist.slug || "",
            description: playlist.description || "",
            platform: playlist.platform || "Spotify",
            url: playlist.url || "",
            embed_url: playlist.embed_url || "",
            image_url: playlist.image_url || "",
            featured: !!playlist.featured,
        });

        setImageName("");
        setMessage(`Editing ${playlist.title}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageName(file.name);
        setMessage("Uploading image...");

        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const safeName = (formData.slug || formData.title || "playlist")
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");

        const fileName = `${safeName || "playlist"}-${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
            .from("playlist-images")
            .upload(filePath, file, {
                cacheControl: "3600",
                contentType: file.type,
            });

        if (uploadError) {
            console.error("Playlist image upload error:", uploadError);
            setMessage(
                uploadError.message ||
                uploadError.details ||
                uploadError.hint ||
                "Image upload failed."
            );
            return;
        }

        const { data } = supabase.storage
            .from("playlist-images")
            .getPublicUrl(filePath);

        setFormData((prev) => ({
            ...prev,
            image_url: data.publicUrl,
        }));

        setMessage("Image uploaded successfully.");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        const payload = {
            title: formData.title.trim(),
            slug: formData.slug.trim() || makeSlug(formData.title),
            description: formData.description.trim(),
            platform: formData.platform.trim(),
            url: formData.url.trim(),
            embed_url: formData.embed_url.trim(),
            image_url: formData.image_url.trim(),
            featured: formData.featured,
        };

        console.log("Saving playlist:", payload);

        let result;

        if (editingId) {
            result = await supabase
                .from("playlists")
                .update(payload)
                .eq("id", editingId)
                .select();
        } else {
            result = await supabase.from("playlists").insert([payload]).select();
        }

        if (result.error) {
            console.error("Save error:", result.error);
            setMessage(
                result.error.message ||
                result.error.details ||
                result.error.hint ||
                "Failed to save playlist."
            );
            setSaving(false);
            return;
        }

        setMessage(
            editingId
                ? "Playlist updated successfully."
                : "Playlist added successfully."
        );

        resetForm();
        await fetchPlaylists();
        setSaving(false);
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this playlist?"
        );

        if (!confirmed) return;

        const { error } = await supabase.from("playlists").delete().eq("id", id);

        if (error) {
            console.error("Delete error:", error);
            setMessage(
                error.message ||
                error.details ||
                error.hint ||
                "Failed to delete playlist."
            );
            return;
        }

        setMessage("Playlist deleted successfully.");

        if (editingId === id) {
            resetForm();
        }

        await fetchPlaylists();
    };

    if (loading) {
        return (
            <section className="admin-shell">
                <div className="admin-panel">
                    <h1 className="admin-page-title">Loading Playlists...</h1>
                    <p className="admin-page-subtitle">Fetching playlist data.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="admin-shell">
            <div className="admin-panel">
                <div className="admin-page-header">
                    <div>
                        <Link to="/admin" className="admin-back-link">
                            ← Back to Admin Dashboard
                        </Link>
                        <p className="admin-eyebrow">Content Manager</p>
                        <h1 className="admin-page-title">Manage Playlists</h1>
                        <p className="admin-page-subtitle">
                            Add, edit, and organize playlists for Nu Metal Kingdom.
                        </p>
                    </div>
                </div>

                {message && <div className="admin-status">{message}</div>}

                <div className="admin-toolbar">
                    <button
                        type="button"
                        className="admin-btn admin-btn-outline"
                        onClick={() => setShowPlaylists((prev) => !prev)}
                    >
                        {showPlaylists
                            ? "Hide Existing Playlists"
                            : "Show Existing Playlists"}
                    </button>
                </div>

                {showPlaylists && (
                    <div className="admin-section-card">
                        <div className="admin-section-header">
                            <h2>Existing Playlists</h2>
                            <p>Search and select a playlist to edit.</p>
                        </div>

                        <div className="admin-form-group">
                            <label htmlFor="playlist-search">Search Playlists</label>
                            <input
                                id="playlist-search"
                                type="text"
                                className="admin-search"
                                placeholder="Search by title, slug, platform, or description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {fetching ? (
                            <p className="admin-muted-text">Loading playlists...</p>
                        ) : filteredPlaylists.length === 0 ? (
                            <p className="admin-muted-text">No playlists found.</p>
                        ) : (
                            <div className="admin-item-grid">
                                {filteredPlaylists.map((playlist) => (
                                    <div key={playlist.id} className="admin-item-card">
                                        <div className="admin-item-card__content">
                                            {playlist.image_url ? (
                                                <img
                                                    src={playlist.image_url}
                                                    alt={playlist.title}
                                                    className="admin-item-thumb"
                                                />
                                            ) : null}

                                            <div>
                                                <strong>{playlist.title}</strong>
                                                {playlist.slug ? <span>Slug: {playlist.slug}</span> : null}
                                                {playlist.platform ? <span>{playlist.platform}</span> : null}
                                                {playlist.featured ? <span>Featured Playlist</span> : null}
                                            </div>
                                        </div>

                                        <div className="admin-item-card__actions">
                                            <button
                                                type="button"
                                                className="admin-btn admin-btn-outline"
                                                onClick={() => handleEdit(playlist)}
                                            >
                                                Edit
                                            </button>

                                            {playlist.url && (
                                                <a
                                                    href={playlist.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="admin-btn admin-btn-outline"
                                                >
                                                    Open Playlist
                                                </a>
                                            )}

                                            <button
                                                type="button"
                                                className="admin-btn admin-btn-danger"
                                                onClick={() => handleDelete(playlist.id)}
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
                        <h2>{editingId ? "Edit Playlist" : "Add Playlist"}</h2>
                        <p>
                            {editingId
                                ? "Update the fields below and save your changes."
                                : "Fill out the fields below to add a new playlist."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="admin-form-grid admin-form-grid--two">
                            <div className="admin-form-group">
                                <label htmlFor="title">Title</label>
                                <input
                                    id="title"
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="platform">Platform</label>
                                <select
                                    id="platform"
                                    name="platform"
                                    value={formData.platform}
                                    onChange={handleChange}
                                >
                                    <option value="Spotify">Spotify</option>
                                    <option value="Apple Music">Apple Music</option>
                                    <option value="YouTube">YouTube</option>
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="slug">Slug</label>
                                <input
                                    id="slug"
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
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

                        <div className="admin-form-grid admin-form-grid--two">
                            <div className="admin-form-group">
                                <label htmlFor="url">Playlist URL</label>
                                <input
                                    id="url"
                                    type="url"
                                    name="url"
                                    value={formData.url}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="embed_url">Embed URL</label>
                                <input
                                    id="embed_url"
                                    type="url"
                                    name="embed_url"
                                    value={formData.embed_url}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="admin-form-grid admin-form-grid--two">
                            <div className="admin-form-group">
                                <label>Upload Image</label>

                                <div className="admin-file-upload">
                                    <label htmlFor="playlist-image-upload" className="admin-file-label">
                                        <input
                                            id="playlist-image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="admin-file-input"
                                        />

                                        <span className="admin-file-btn">Upload Image</span>

                                        <span className="admin-file-text">
                                            {imageName || "Choose an image file..."}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label htmlFor="image_url">Image URL</label>
                                <input
                                    id="image_url"
                                    type="url"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {formData.image_url && (
                            <div className="admin-form-group">
                                <label>Playlist Image Preview</label>
                                <img
                                    src={formData.image_url}
                                    alt="Playlist preview"
                                    className="admin-image-preview"
                                />
                            </div>
                        )}

                        <div className="admin-checkbox-row">
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

                        <div className="admin-toolbar">
                            <button type="submit" className="admin-btn" disabled={saving}>
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Playlist"
                                        : "Add Playlist"}
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
                                        Delete Playlist
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

export default AdminPlaylistsScreen;