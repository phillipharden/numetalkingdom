import { Link } from "react-router-dom";
import releases from "../assets/data/releases-data";
import {
  formatReleaseHeading,
  groupReleasesByDate,
} from "../utils/releaseHelpers";

const parseLocalDate = (dateString) => {
  if (!dateString || typeof dateString !== "string") return null;

  const parts = dateString.split("-").map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;

  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
};

const UpcomingReleases = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingReleases = releases
    .filter((release) => {
      const parsedDate = parseLocalDate(release.releaseDate);
      return parsedDate && parsedDate >= today;
    })
    .sort((a, b) => {
      const dateA = parseLocalDate(a.releaseDate);
      const dateB = parseLocalDate(b.releaseDate);
      return dateA - dateB;
    })
    .slice(0, 10);

  const groupedReleases = groupReleasesByDate(
    upcomingReleases.map((release) => ({
      ...release,
      date: release.releaseDate,
    }))
  );

  const groupedEntries = Object.entries(groupedReleases).sort(
    ([dateA], [dateB]) => {
      const parsedA = parseLocalDate(dateA);
      const parsedB = parseLocalDate(dateB);
      return parsedA - parsedB;
    }
  );

  const getTypeLabel = (type) => {
    switch (type) {
      case "album":
        return "Album";
      case "ep":
        return "EP";
      case "single":
        return "Single";
      default:
        return type;
    }
  };

  const getUmbrellaBadgeText = (release) => {
    if (!release.nuMetalUmbrella) return null;

    switch (release.umbrellaCategory) {
      case "nu-metal":
        return "Spotlight";
      case "adjacent":
        return "Featured";
      default:
        return "Featured";
    }
  };

  const getReleaseItemClass = (release) => {
    let className = "release-item";

    if (release.nuMetalUmbrella) {
      className += " release-item--highlight";

      if (release.umbrellaCategory === "nu-metal") {
        className += " release-item--nu-metal";
      }

      if (release.umbrellaCategory === "adjacent") {
        className += " release-item--adjacent";
      }
    } else {
      className += " release-item--standard";
    }

    if (release.featured) {
      className += " release-item--featured";
    }

    return className;
  };

  const renderReleaseLinks = (release) => {
    const hasLinks =
      release.presave ||
      release.spotifyUrl ||
      release.appleUrl ||
      release.youtubeUrl;

    if (!hasLinks) return null;

    return (
      <div className="release-links">
        {release.presave && (
          <a
            href={release.presave}
            target="_blank"
            rel="noopener noreferrer"
            className="release-link release-link--presave"
          >
            Pre-Save
          </a>
        )}

        {release.spotifyUrl && (
          <a
            href={release.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="release-link"
          >
            Spotify
          </a>
        )}

        {release.appleUrl && (
          <a
            href={release.appleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="release-link"
          >
            Apple Music
          </a>
        )}

        {release.youtubeUrl && (
          <a
            href={release.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="release-link"
          >
            YouTube
          </a>
        )}
      </div>
    );
  };

  const renderReleaseItem = (release) => {
    const badgeText = getUmbrellaBadgeText(release);

    return (
      <li key={release.id} className={getReleaseItemClass(release)}>
        <div className="release-item__top">
          <div className="release-item__main">
            <span className="release-bullet">•</span>

            <span
              className={`release-artist ${
                release.nuMetalUmbrella ? "release-artist--nu-metal" : ""
              }`}
            >
              {release.artist}
            </span>{" "}

            <span className="release-title">{release.title}</span>

            <span className="release-meta">
              {" "}
              - {getTypeLabel(release.type)} [{release.label}]
            </span>
          </div>

          <div className="release-item__badges">
            {badgeText && (
              <span
                className={`release-badge ${
                  release.umbrellaCategory === "nu-metal"
                    ? "release-badge--nu-metal"
                    : release.umbrellaCategory === "adjacent"
                    ? "release-badge--adjacent"
                    : ""
                }`}
              >
                {badgeText}
              </span>
            )}

            {release.featured && (
              <span className="release-badge release-badge--featured">
                Featured
              </span>
            )}
          </div>
        </div>

        {(release.genre ||
          release.notes ||
          release.presave ||
          release.spotifyUrl ||
          release.appleUrl ||
          release.youtubeUrl) && (
          <div className="release-item__details">
            {release.genre && (
              <span className="release-genre">{release.genre}</span>
            )}

            {release.notes && (
              <p className="release-notes">{release.notes}</p>
            )}

            {renderReleaseLinks(release)}
          </div>
        )}
      </li>
    );
  };

  if (groupedEntries.length === 0) {
    return (
      <section className="upcoming-releases-section">
        <div className="container">
          <div className="upcoming-releases-header">
            <p className="section-kicker">New Music</p>
            <h2 className="section-title">Upcoming Releases</h2>
            <p className="section-subtitle">
              No upcoming releases are listed right now.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="upcoming-releases-section">
      <div className="container">
        <div className="upcoming-releases-header">
          <p className="section-kicker">New Music</p>
          <h2 className="section-title">Upcoming Releases</h2>
          <p className="section-subtitle">
            Nu metal umbrella releases are visually emphasized.
          </p>
        </div>

        <div className="upcoming-releases-groups">
          {groupedEntries.map(([date, items]) => {
            const sortedItems = [...items].sort((a, b) => {
              const priorityA = a.priority ?? 1;
              const priorityB = b.priority ?? 1;

              if (priorityB !== priorityA) {
                return priorityB - priorityA;
              }

              return a.artist.localeCompare(b.artist);
            });

            const albumsAndEps = sortedItems.filter(
              (item) => item.type === "album" || item.type === "ep"
            );

            const singles = sortedItems.filter(
              (item) => item.type === "single"
            );

            return (
              <div key={date} className="release-date-group">
                <h3 className="release-date-heading">
                  {formatReleaseHeading(date)}
                </h3>

                {albumsAndEps.length > 0 && (
                  <div className="release-group-block">
                    <h4 className="release-type-heading">Albums & EPs</h4>
                    <ul className="release-list">
                      {albumsAndEps.map(renderReleaseItem)}
                    </ul>
                  </div>
                )}

                {singles.length > 0 && (
                  <div className="release-group-block">
                    <h4 className="release-type-heading">Singles</h4>
                    <ul className="release-list">
                      {singles.map(renderReleaseItem)}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="see-more-releases">
          <Link to="/releases" className="see-more-link">
            See More Releases →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UpcomingReleases;