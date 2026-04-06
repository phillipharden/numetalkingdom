import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

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

      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!data?.is_admin) {
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
      <section className="admin-container">
        <div className="admin-card">
          <h1>Loading Admin...</h1>
        </div>
      </section>
    );
  }

  if (!isAdmin) return null;

  return (
    <section className="admin-container">
      <div className="admin-card">

        <h1 className="admin-title">Nu Metal Kingdom Admin</h1>
        <p className="admin-subtitle">
          Manage site content
        </p>

        <div className="admin-dashboard">

          <Link to="/admin-bands" className="admin-dashboard-card">
            <h3>Bands</h3>
            <p>Add, edit, and delete bands</p>
          </Link>

          <Link to="/admin-releases" className="admin-dashboard-card">
            <h3>Releases</h3>
            <p>Manage upcoming and past releases</p>
          </Link>

          <Link to="/admin-articles" className="admin-dashboard-card">
            <h3>Articles</h3>
            <p>Create and manage articles</p>
          </Link>

          <Link to="/admin-playlists" className="admin-dashboard-card">
            <h3>Playlists</h3>
            <p>Manage playlists</p>
          </Link>

        </div>

        <div className="admin-actions mt-4">
          <button
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