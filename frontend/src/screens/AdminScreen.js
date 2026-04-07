import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const adminSections = [
  {
    title: "Bands",
    description: "Add, edit, and delete bands.",
    to: "/admin-bands",
  },
  {
    title: "Releases",
    description: "Manage upcoming and past releases.",
    to: "/admin-releases",
  },
  {
    title: "Articles",
    description: "Create and manage articles.",
    to: "/admin-articles",
  },
  {
    title: "Playlists",
    description: "Manage playlists.",
    to: "/admin-playlists",
  },
];

const AdminScreen = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/admin-login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (error || !data?.is_admin) {
        navigate("/");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  if (loading) {
    return (
      <section className="admin-shell">
        <div className="admin-panel admin-panel--narrow">
          <h1 className="admin-page-title">Loading Admin...</h1>
          <p className="admin-page-subtitle">Checking access.</p>
        </div>
      </section>
    );
  }

  if (!isAdmin) return null;

  return (
    <section className="admin-shell">
      <div className="admin-panel">
        <div className="admin-page-header">
          <div>
            <p className="admin-eyebrow">Admin Dashboard</p>
            <h1 className="admin-page-title">Nu Metal Kingdom Admin</h1>
            <p className="admin-page-subtitle">
              Manage bands, releases, articles, and playlists.
            </p>
          </div>
        </div>

        <div className="admin-dashboard-grid">
          {adminSections.map((section) => (
            <Link
              key={section.to}
              to={section.to}
              className="admin-dashboard-card"
            >
              <h2>{section.title}</h2>
              <p>{section.description}</p>
              <span className="admin-card-link-text">Open Section →</span>
            </Link>
          ))}
        </div>

        <div className="admin-toolbar admin-toolbar--end">
          <button
            type="button"
            onClick={handleLogout}
            className="admin-btn admin-btn-outline"
          >
            Log Out
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdminScreen;