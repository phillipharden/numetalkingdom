import Logo from "../assets/images/logo.png";
import {
  SiInstagram,
  SiYoutube,
  SiTiktok,
  SiFacebook,
  SiSpotify
} from "react-icons/si";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Logo */}
        <div className="footer-brand text-center">
          <img
            src={Logo}
            alt="Nu Metal Kingdom logo"
            className="footer-logo"
          />
          <p className="footer-tagline">
            Christian Nu Metal Lives
          </p>
        </div>

        {/* Social Links */}
        <div className="footer-social">
          <a href="https://www.instagram.com/numetalkingdom" target="_blank" rel="noreferrer">
            <SiInstagram />
          </a>

          <a href="https://www.youtube.com/@NuMetalKingdom" target="_blank" rel="noreferrer">
            <SiYoutube />
          </a>

          <a href="https://www.tiktok.com/@numetalkingdom" target="_blank" rel="noreferrer">
            <SiTiktok />
          </a>

          <a href="https://www.facebook.com/numetalkingdom" target="_blank" rel="noreferrer">
            <SiFacebook />
          </a>

          <a href="https://open.spotify.com/user/kw1mvjf3tz4c3k0azfw3j6zzr?si=780cd43337814ace" target="_blank" rel="noreferrer">
            <SiSpotify />
          </a>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>&copy; {year} Nu Metal Kingdom. All Rights Reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;