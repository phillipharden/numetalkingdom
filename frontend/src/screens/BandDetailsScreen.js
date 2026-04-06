import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import SocialLinks from "../components/SocialLinks";

const BandDetailScreen = () => {
  const { slug } = useParams();

  const [band, setBand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBand = async () => {
      const { data, error } = await supabase
        .from("bands")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.error("Error loading band:", error.message);
        setBand(null);
        setLoading(false);
        return;
      }

      setBand(data || null);
      setLoading(false);
    };

    loadBand();
  }, [slug]);

  if (loading) {
    return (
      <section className="band-detail container py-5">
        <h1>Loading...</h1>
      </section>
    );
  }

  if (!band) {
    return (
      <section className="band-detail container py-5">
        <h1>Band Not Found</h1>
        <p>We couldn't find that band.</p>
        <Link to="/bands" className="back-link">
          ← Back to Bands
        </Link>
      </section>
    );
  }

  const socials = {
    instagram: band.instagram || "",
    facebook: band.facebook || "",
    x: band.x || "",
    youtube: band.youtube || "",
    spotify: band.spotify || "",
    appleMusic: band.apple_music || "",
    tiktok: band.tiktok || "",
    website: band.website || "",
  };

  const hasSocials = Object.values(socials).some(Boolean);

  return (
    <section className="band-detail container py-5">
      <Link to="/bands" className="back-link">
        ← Back to Bands
      </Link>

      <div className="row align-items-start mt-4">
        <div className="col-12 col-md-5 mb-4 mb-md-0">
          {band.image_url ? (
            <img
              src={band.image_url}
              alt={`${band.name} band`}
              className="band-detail-img"
            />
          ) : (
            <div className="band-detail-placeholder">
              <div className="placeholder-content">
                <h3>{band.name}</h3>
                <p>Image Coming Soon</p>
              </div>
            </div>
          )}
        </div>

        <div className="col-12 col-md-7">
          <h1>{band.name}</h1>

          {band.description && (
            <div
              className="band-detail-description"
              dangerouslySetInnerHTML={{ __html: band.description }}
            />
          )}

          {band.location && (
            <p>
              <strong>Location:</strong> {band.location}
            </p>
          )}

          {band.years_active && (
            <p>
              <strong>Years Active:</strong> {band.years_active}
            </p>
          )}

          {Array.isArray(band.era) && band.era.length > 0 && (
            <p>
              <strong>Era:</strong> {band.era.join(", ")}
            </p>
          )}

          {Array.isArray(band.subgenres) && band.subgenres.length > 0 && (
            <div className="band-tags mb-4">
              {band.subgenres.map((genre) => (
                <span key={genre} className="band-tag">
                  {genre}
                </span>
              ))}
            </div>
          )}

          {Array.isArray(band.essentialSongs) &&
            band.essentialSongs.length > 0 && (
              <div className="mb-4">
                <h3>Essential Songs</h3>
                <ul className="band-list">
                  {band.essentialSongs.map((song) => (
                    <li key={song}>{song}</li>
                  ))}
                </ul>
              </div>
            )}

          {Array.isArray(band.members) && band.members.length > 0 && (
            <div className="mb-4">
              <h3>Members</h3>
              <ul className="band-list">
                {band.members.map((member) => (
                  <li key={member}>{member}</li>
                ))}
              </ul>
            </div>
          )}

          {hasSocials && (
            <SocialLinks
              socials={socials}
              title={`Connect with ${band.name}`}
              className="band-socials"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default BandDetailScreen;