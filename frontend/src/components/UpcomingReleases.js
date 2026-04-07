import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReleases = async () => {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("releases")
        .select("*")
        .gte("release_date", today)
        .order("release_date", { ascending: true })
        .order("priority", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching releases:", error);
      } else {
        setReleases(data || []);
      }

      setLoading(false);
    };

    fetchReleases();
  }, []);

  const groupedReleases = groupReleasesByDate(
    releases.map((release) => ({
      ...release,
      releaseDate: release.release_date,
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

  const getReleaseItemClass = (release) => {
    let className = "release-item";

    if (release.nu_metal_umbrella) {
      className += " release-item--highlight";

      if (release.umbrella_category === "nu-metal") {
        className += " release-item--nu-metal";
      }

      if (release.umbrella_category === "adjacent") {
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
      release.spotify_url ||
      release.apple_url ||
      release.youtube_url;

    if (!hasLinks) return null;

    return (
      <div className="release-links">
        {release.spotify_url && (
          <a
            href={release.spotify_url}
            target="_blank"
            rel="noopener noreferrer"
            className="release-link"
          >
            Spotify
          </a>
        )}

        {release.apple_url && (
          <a
            href={release.apple_url}
            target="_blank"
            rel="noopener noreferrer"
            className="release-link"
          >
            Apple Music
          </a>
        )}

        {release.youtube_url && (
          <a
            href={release.youtube_url}
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
    return (
      <li key={release.id} className={getReleaseItemClass(release)}>
        <div className="release-item__top">
          <div className="release-item__main">
            <span className="release-bullet">•</span>

            <span
              className={`release-artist ${
                release.nu_metal_umbrella ? "release-artist--nu-metal" : ""
              }`}
            >
              {release.artist}
            </span>{" "}

            <span className="release-title">{release.title}</span>

            <span className="release-meta">
              - {getTypeLabel(release.type)}
              {release.label && ` [${release.label}]`}
            </span>
          </div>

          {release.presave && (
            <div className="release-item__actions">
              <a
                href={release.presave}
                target="_blank"
                rel="noopener noreferrer"
                className="release-link release-link--presave"
              >
                Pre-Save
              </a>
            </div>
          )}
        </div>

        {(release.genre ||
          release.notes ||
          release.spotify_url ||
          release.apple_url ||
          release.youtube_url) && (
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

  if (loading || groupedEntries.length === 0) {
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
        </div>

        <div className="upcoming-releases-groups">
          {groupedEntries.map(([date, items]) => (
            <div key={date} className="release-date-group">
              <h3 className="release-date-heading">
                {formatReleaseHeading(date)}
              </h3>

              <ul className="release-list">
                {items.map(renderReleaseItem)}
              </ul>
            </div>
          ))}
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