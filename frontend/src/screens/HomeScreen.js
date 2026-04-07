import { Link } from "react-router-dom";
import BackgroundVideo from "../components/BackgroundVideo";
import UpcomingReleases from "../components/UpcomingReleases";
import SpotifyPlaylist from "../components/SpotifyPlaylist";
import RecentArticles from "../components/RecentArticles";
import LatestArticle from "../components/LatestArticle";

const HomeScreen = () => {
  return (
    <>
      <BackgroundVideo />

     
      <section id="homescreen" className="hero-section container py-5">
        <div className="row">
          <div className="col-12 col-md-8">

            <div className="hero-content">
              <p className="hero-kicker">Christian Rock • Metal • Nu Metal</p>

              <h1 className="hero-title">
                Where Christian Heavy
                <span className="hero-title-accent"> Music Lives</span>
              </h1>

              <p className="hero-text">
                Nu Metal Kingdom covers upcoming releases, band discovery,
                and heavy music news from across Christian nu metal,
                hard rock, metalcore, and beyond.
              </p>

              <div className="hero-actions">
                <Link to="/releases" className="hero-btn hero-btn-primary">
                  Browse Releases
                </Link>

                <Link to="/bands" className="hero-btn hero-btn-secondary">
                  Explore Bands
                </Link>
              </div>
            </div>
            <LatestArticle />
            <SpotifyPlaylist />
          </div>
          <div className="col-12 col-md-4">
            
            <RecentArticles />
            <UpcomingReleases />
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeScreen;