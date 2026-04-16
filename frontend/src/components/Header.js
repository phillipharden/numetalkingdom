import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import {
  SiApplemusic,
  SiSpotify,
  SiTiktok,
  SiYoutube,
  SiInstagram,
  SiX,
} from "react-icons/si";
import { MdEmail } from "react-icons/md";
import { TfiFacebook } from "react-icons/tfi";
import { IoShareSocial } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";

const Header = () => {
  const [showSocialMenu, setShowSocialMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);

  const toggleSocialMenu = () => setShowSocialMenu(!showSocialMenu);
  const toggleNavMenu = () => setShowNavMenu(!showNavMenu);

  const closeMenus = () => {
    setShowNavMenu(false);
    setShowSocialMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo timed-shake">
          <Link to="/" onClick={closeMenus}>
            <img src={Logo} alt="Nu Metal Kingdom" className="navbar-logo" />
          </Link>
        </div>

        <ul className={`main-nav ${showNavMenu ? "active" : ""}`}>
          <li>
            <NavLink to="/" onClick={closeMenus}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/news" onClick={closeMenus}>
              News
            </NavLink>
          </li>
          <li>
            <NavLink to="/bands" onClick={closeMenus}>
              Bands
            </NavLink>
          </li>
          <li>
            <NavLink to="/playlists" onClick={closeMenus}>
              Playlists
            </NavLink>
          </li>
       
          <li>
            <NavLink to="/releases" onClick={closeMenus}>
              Releases
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" onClick={closeMenus}>
              About
            </NavLink>
          </li>
        </ul>

        <ul className={`social-links ${showSocialMenu ? "active" : ""}`}>
          <li>
            <a
              href="https://www.facebook.com/numetalkingdom"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <TfiFacebook />
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/numetalkingdom"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <SiInstagram />
            </a>
          </li>
          <li>
            <a
              href="https://www.x.com/NuMetalKingdom"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
            >
              <SiX />
            </a>
          </li>
          <li>
            <a
              href="https://www.tiktok.com/@numetalkingdom"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <SiTiktok />
            </a>
          </li>
          <li>
            <a
              href="https://www.youtube.com/@NuMetalKingdom"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <SiYoutube />
            </a>
          </li>
          {/* <li>
            <a
              href="https://music.apple.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Apple Music"
            >
              <SiApplemusic />
            </a>
          </li> */}
          <li>
            <a
              href="https://open.spotify.com/user/kw1mvjf3tz4c3k0azfw3j6zzr?si=780cd43337814ace"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Spotify"
            >
              <SiSpotify />
            </a>
          </li>
          <li>
            <a href="mailto:submit@numetalkingdom.com" aria-label="Email">
              <MdEmail />
            </a>
          </li>
        </ul>
      </div>

      <div className="menu-toggles">
        <button
          type="button"
          className="hamburger nav-toggle"
          onClick={toggleNavMenu}
          aria-label="Toggle navigation menu"
        >
          <GiHamburgerMenu />
        </button>

        <button
          type="button"
          className="hamburger social-toggle"
          onClick={toggleSocialMenu}
          aria-label="Toggle social menu"
        >
          <IoShareSocial />
        </button>
      </div>
    </nav>
  );
};

export default Header;