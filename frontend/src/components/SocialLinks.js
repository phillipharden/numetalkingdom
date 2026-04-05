import {
  SiInstagram,
  SiYoutube,
  SiSpotify,
  SiFacebook,
  SiX,
  SiTiktok,
  SiApplemusic,
  SiBandcamp,
  SiSoundcloud,
  SiPandora,
  SiTidal,
  SiThreads,
  SiPatreon,
  SiDiscord,
  SiReddit,
  SiLinktree,
} from "react-icons/si";
import { FaGlobe, FaAmazon } from "react-icons/fa";

const socialIconMap = {
  website: FaGlobe,
  instagram: SiInstagram,
  youtube: SiYoutube,
  spotify: SiSpotify,
  facebook: SiFacebook,
  x: SiX,
  twitter: SiX,
  tiktok: SiTiktok,
  appleMusic: SiApplemusic,
  amazonMusic: FaAmazon,
  bandcamp: SiBandcamp,
  soundcloud: SiSoundcloud,
  pandora: SiPandora,
  tidal: SiTidal,
  threads: SiThreads,
  patreon: SiPatreon,
  discord: SiDiscord,
  reddit: SiReddit,
  linktree: SiLinktree,
  deezer: FaGlobe,
};

const socialLabelMap = {
  website: "Website",
  instagram: "Instagram",
  youtube: "YouTube",
  spotify: "Spotify",
  facebook: "Facebook",
  x: "X",
  twitter: "X",
  tiktok: "TikTok",
  appleMusic: "Apple Music",
  amazonMusic: "Amazon Music",
  bandcamp: "Bandcamp",
  soundcloud: "SoundCloud",
  pandora: "Pandora",
  tidal: "TIDAL",
  threads: "Threads",
  patreon: "Patreon",
  discord: "Discord",
  reddit: "Reddit",
  linktree: "Linktree",
  deezer: "Deezer",
};

const platformOrder = [
  "website",
  "instagram",
  "facebook",
  "x",
  "youtube",
  "spotify",
  "appleMusic",
  "amazonMusic",
  "bandcamp",
  "soundcloud",
  "pandora",
  "tidal",
  "deezer",
  "tiktok",
  "threads",
  "discord",
  "patreon",
  "reddit",
  "linktree",
];

function SocialLinks({ socials = {}, title = "Follow the Band", className = "" }) {
  const entries = Object.entries(socials)
    .filter(([, value]) => value)
    .sort(([a], [b]) => {
      const aIndex = platformOrder.indexOf(a);
      const bIndex = platformOrder.indexOf(b);

      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

  if (!entries.length) return null;

  return (
    <div className={`article-socials ${className}`.trim()}>
      <h3>{title}</h3>

      <div className="article-social-links">
        {entries.map(([platform, url]) => {
          const Icon = socialIconMap[platform] || FaGlobe;
          const label = socialLabelMap[platform] || platform;

          return (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className={`social-link social-${platform}`}
            >
              <Icon />
              <span>{label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default SocialLinks;