import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const PAGE_SIZE = 1000;

const BandsScreen = () => {
  const [bands, setBands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

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

      console.log("Total bands fetched:", allBands.length);
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

  const filteredBands = useMemo(() => {
    let filtered = sortedBands;
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (selectedLetter === "0-9") {
      filtered = filtered.filter((band) => /^[0-9]/.test(band.name));
    } else if (selectedLetter !== "ALL") {
      filtered = filtered.filter(
        (band) => band.name.charAt(0).toUpperCase() === selectedLetter
      );
    }

    if (normalizedSearch !== "") {
      filtered = filtered.filter((band) =>
        band.name.toLowerCase().startsWith(normalizedSearch)
      );
    }

    return filtered;
  }, [selectedLetter, searchTerm, sortedBands]);

  return (
    <section className="bands-directory container py-5">
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

      <div className="bands-filter mb-4">
        <button
          onClick={() => setSelectedLetter("ALL")}
          className={`filter-btn ${selectedLetter === "ALL" ? "active" : ""}`}
        >
          All
        </button>

        <button
          onClick={() => setSelectedLetter("0-9")}
          className={`filter-btn ${selectedLetter === "0-9" ? "active" : ""}`}
        >
          0-9
        </button>

        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => setSelectedLetter(letter)}
            className={`filter-btn ${selectedLetter === letter ? "active" : ""}`}
          >
            {letter}
          </button>
        ))}
      </div>

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
    </section>
  );
};

export default BandsScreen;