import RecentArticles from "../components/RecentNews";
import UpcomingReleases from "../components/UpcomingReleases";

const AboutScreen = () => {
  return (
    <section className="about-page py-5">
      <div className="container">
        <div className="row g-5">
          
          <div className="col-12 col-xl-8">
            <div className="about-main">
              <div className="mb-4">
                <h1 className="page-title">About Nu Metal Kingdom</h1>
              </div>

              <div className="about-content">
                <p>
                  <strong>Nu Metal Kingdom</strong> exists to spotlight Christian nu metal,
                  rap rock, and adjacent heavy music for fans who want to discover bands,
                  follow the scene, and stay connected to new releases.
                </p>

                <p>
                  This site was created to be a central place for Christian nu metal culture.
                  From foundational bands and underground discoveries to modern artists carrying
                  the sound forward, Nu Metal Kingdom is here to celebrate the music, highlight
                  the artists, and help listeners find something new.
                </p>

                <p>
                  Whether you grew up on the early 2000s wave or you are just now exploring
                  Christian heavy music, this platform is built to make discovery easy. You can
                  browse bands, explore sub-genres, look through different eras, and dive deeper
                  into the artists that helped shape the sound.
                </p>

                <p>
                  Nu Metal Kingdom is more than just a band list. It is a growing resource for
                  Christian nu metal news, new music, artist discovery, and scene culture. The
                  goal is to give both well-known and lesser-known bands a place to be seen while
                  helping fans connect with music that is heavy, honest, and rooted in faith.
                </p>

                <p>
                  <strong>Christian Nu Metal Lives.</strong><br />
                  New bands. Heavy faith. Real sound.<br />
                  Welcome to the Kingdom 👑
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <aside className="about-sidebar">
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

export default AboutScreen;