import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import RecentArticles from "../components/RecentNews";
import UpcomingReleases from "../components/UpcomingReleases";

const PAGE_SIZE = 1000;

const BandsScreen = () => {
  const [bands, setBands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState("ALL");
  const [selectedGenre, setSelectedGenre] = useState("ALL");
  const [selectedEra, setSelectedEra] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    const fetchAllBands = async () => {
      let allBands = [];
      let from = 0;
      let keepGoing = true;

      while (keepGoing) {
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await supabase
          .from("bands")
          .select("*")
          .order("name", { ascending: true })
          .range(from, to);

        if (error) {
          console.error("Error fetching bands:", error);
          setBands([]);
          setLoading(false);
          return;
        }

        const batch = data || [];
        allBands = [...allBands, ...batch];

        if (batch.length < PAGE_SIZE) {
          keepGoing = false;
        } else {
          from += PAGE_SIZE;
        }
      }

      setBands(allBands);
      setLoading(false);
    };

    fetchAllBands();
  }, []);

  const sortedBands = useMemo(() => {
    const uniqueBands = Object.values(
      bands.reduce((acc, band) => {
        acc[band.slug] = band;
        return acc;
      }, {})
    );

    return uniqueBands.sort((a, b) => a.name.localeCompare(b.name));
  }, [bands]);

  const genreOptions = useMemo(() => {
    const genres = sortedBands.flatMap((band) =>
      Array.isArray(band.subgenres) ? band.subgenres : []
    );

    return [...new Set(genres)].sort((a, b) => a.localeCompare(b));
  }, [sortedBands]);

  const eraOptions = useMemo(() => {
    const eras = sortedBands.flatMap((band) =>
      Array.isArray(band.era) ? band.era : []
    );

    return [...new Set(eras)].sort((a, b) => a.localeCompare(b));
  }, [sortedBands]);

  const filteredBands = useMemo(() => {
    let filtered = sortedBands;
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (selectedStatus === "ACTIVE") {
      filtered = filtered.filter((band) => band.active !== false);
    }

    if (selectedStatus === "INACTIVE") {
      filtered = filtered.filter((band) => band.active === false);
    }

    if (selectedLetter === "0-9") {
      filtered = filtered.filter((band) => /^[0-9]/.test(band.name));
    } else if (selectedLetter !== "ALL") {
      filtered = filtered.filter(
        (band) => band.name.charAt(0).toUpperCase() === selectedLetter
      );
    }

    if (selectedGenre !== "ALL") {
      filtered = filtered.filter(
        (band) =>
          Array.isArray(band.subgenres) &&
          band.subgenres.includes(selectedGenre)
      );
    }

    if (selectedEra !== "ALL") {
      filtered = filtered.filter(
        (band) => Array.isArray(band.era) && band.era.includes(selectedEra)
      );
    }

    if (normalizedSearch !== "") {
      filtered = filtered.filter((band) =>
        band.name.toLowerCase().includes(normalizedSearch)
      );
    }

    return filtered;
  }, [
    selectedLetter,
    selectedGenre,
    selectedEra,
    selectedStatus,
    searchTerm,
    sortedBands,
  ]);

  return (
    <section className="bands-directory py-5">
      <div className="container">
        <div className="row g-5">
          <div className="col-12 col-xl-8">
            <div className="bands-main">
              <h1 className="page-title">Band Directory</h1>

              <div className="bands-search-wrap mb-4">
                <input
                  type="text"
                  className="bands-search-input"
                  placeholder="Search bands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="bands-filter-toggle-wrap mb-4">
                <button
                  type="button"
                  className="filter-btn"
                  onClick={() => setShowAdvancedFilters((prev) => !prev)}
                >
                  {showAdvancedFilters ? "Hide Filters" : "More Filters"}
                </button>
              </div>

              {showAdvancedFilters && (
                <>
                  <div className="bands-advanced-filters mb-4">
                    <div className="bands-filter-group">
                      <label className="bands-filter-label">Status</label>
                      <select
                        className="bands-filter-select"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <option value="ALL">All Bands</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>

                    <div className="bands-filter-group">
                      <label className="bands-filter-label">Sub-Genre</label>
                      <select
                        className="bands-filter-select"
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                      >
                        <option value="ALL">All Genres</option>
                        {genreOptions.map((genre) => (
                          <option key={genre} value={genre}>
                            {genre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bands-filter-group">
                      <label className="bands-filter-label">Era</label>
                      <select
                        className="bands-filter-select"
                        value={selectedEra}
                        onChange={(e) => setSelectedEra(e.target.value)}
                      >
                        <option value="ALL">All Eras</option>
                        {eraOptions.map((era) => (
                          <option key={era} value={era}>
                            {era}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bands-filter mb-4">
                    <button
                      onClick={() => setSelectedLetter("ALL")}
                      className={`filter-btn ${
                        selectedLetter === "ALL" ? "active" : ""
                      }`}
                    >
                      All
                    </button>

                    <button
                      onClick={() => setSelectedLetter("0-9")}
                      className={`filter-btn ${
                        selectedLetter === "0-9" ? "active" : ""
                      }`}
                    >
                      0-9
                    </button>

                    {alphabet.map((letter) => (
                      <button
                        key={letter}
                        onClick={() => setSelectedLetter(letter)}
                        className={`filter-btn ${
                          selectedLetter === letter ? "active" : ""
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="bands-directory-list">
                {loading ? (
                  <p className="no-results">Loading bands...</p>
                ) : filteredBands.length > 0 ? (
                  filteredBands.map((band) => (
                    <Link
                      key={band.slug}
                      to={`/bands/${band.slug}`}
                      className="bands-directory-link"
                    >
                      {band.name}
                    </Link>
                  ))
                ) : (
                  <p className="no-results">No bands found.</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <aside className="bands-sidebar">
              <RecentArticles limit={4} />
              <div className="mt-5">
                <UpcomingReleases limit={5} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BandsScreen;