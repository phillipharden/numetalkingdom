import releases from "../assets/data/releases-data";
import {
  formatReleaseHeading,
  getUpcomingReleases,
  groupReleasesByDate,
} from "../utils/releaseHelpers";

const ReleasesPage = () => {
  const upcomingReleases = getUpcomingReleases(releases);
  const groupedReleases = groupReleasesByDate(upcomingReleases);

  const groupedEntries = Object.entries(groupedReleases).sort(
    ([dateA], [dateB]) => new Date(dateA) - new Date(dateB)
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
        return "Nu Metal";
      case "adjacent":
        return "Adjacent";
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
      release.spotifyUrl || release.appleUrl || release.youtubeUrl;

    if (!hasLinks) return null;

    return (
      <div className="release-links">
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
        <div className="release-item__main">
          <span
            className={`release-artist ${
              release.umbrellaCategory === "nu-metal"
                ? "release-artist--nu-metal"
                : ""
            }`}
          >
            {release.artist}
          </span>{" "}
          <span className="release-title">{release.title}</span>{" "}
          <span className="release-meta">
            — {getTypeLabel(release.type)} [{release.label}]
          </span>

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
        </div>

        {(release.genre || release.notes || release.spotifyUrl || release.appleUrl || release.youtubeUrl) && (
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

  return (
    <section className="releases-page">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-8">
            <div className="releases-main">
              <header className="releases-page__header">
                <p className="releases-page__kicker">Nu Metal Kingdom</p>
                <h1 className="releases-page__title">Upcoming Christian Music Releases</h1>
                <p className="releases-page__subtitle">
                  All upcoming releases, with Nu Metal umbrella titles highlighted.
                </p>
              </header>

              {groupedEntries.length === 0 ? (
                <div className="releases-empty">
                  <p>No upcoming releases are listed right now.</p>
                </div>
              ) : (
                groupedEntries.map(([date, items]) => {
                  const sortedItems = [...items].sort((a, b) => {
                    const priorityA = a.priority ?? 1;
                    const priorityB = b.priority ?? 1;

                    if (priorityB !== priorityA) {
                      return priorityB - priorityA;
                    }

                    return a.artist.localeCompare(b.artist);
                  });

                  return (
                    <div key={date} className="release-date-group">
                      <h2 className="release-date-heading">
                        {formatReleaseHeading(date)}
                      </h2>

                      <ul className="release-list">
                        {sortedItems.map(renderReleaseItem)}
                      </ul>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="col-12 col-md-4">
            <aside className="releases-sidebar">
              <div className="releases-sidebar__card">
                <h3>About This Page</h3>
                <p>
                  This page lists all upcoming Christian music releases and gives
                  extra emphasis to Nu Metal Kingdom core coverage.
                </p>
              </div>

              <div className="releases-sidebar__card">
                <h3>Legend</h3>
                <p>
                  <span className="legend-swatch legend-swatch--nu-metal"></span>
                  Nu Metal umbrella release
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReleasesPage;