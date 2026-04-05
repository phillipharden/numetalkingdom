import { Link, useParams } from "react-router-dom";
import bands from "../assets/data/bands-data";
import SocialLinks from "../components/SocialLinks";

const BandDetailScreen = () => {
  const { slug } = useParams();

  const band = bands.find((item) => item.slug === slug);

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

  return (
    <section className="band-detail container py-5">
      <Link to="/bands" className="back-link">
        ← Back to Bands
      </Link>

      <div className="row align-items-start mt-4">
        <div className="col-12 col-md-5 mb-4 mb-md-0">
          {band.image ? (
            <img
              src={band.image}
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

          {band.yearsActive && (
            <p>
              <strong>Years Active:</strong> {band.yearsActive}
            </p>
          )}

          {band.era && Array.isArray(band.era) && band.era.length > 0 && (
            <p>
              <strong>Era:</strong> {band.era.join(", ")}
            </p>
          )}

          {band.subgenres &&
            Array.isArray(band.subgenres) &&
            band.subgenres.length > 0 && (
              <div className="band-tags mb-4">
                {band.subgenres.map((genre) => (
                  <span key={genre} className="band-tag">
                    {genre}
                  </span>
                ))}
              </div>
            )}

          {band.essentialSongs &&
            Array.isArray(band.essentialSongs) &&
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

          {band.members &&
            Array.isArray(band.members) &&
            band.members.length > 0 && (
              <div className="mb-4">
                <h3>Members</h3>
                <ul className="band-list">
                  {band.members.map((member) => (
                    <li key={member}>{member}</li>
                  ))}
                </ul>
              </div>
            )}

          {band.socials && (
            <SocialLinks
              socials={band.socials}
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