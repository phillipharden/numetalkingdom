import relentArticleImg from "../images/articles/relent-suffer-tracklist.jpg";
import xiiiMinutesArticleImg from "../images/articles/xiii-minutes-panic.png";
import blamedArticleImg from "../images/articles/the-blamed-teaser-cover.jpg";

const articles = [
  {
    id: "relent-suffer-ep-april-17-2026",
    slug: "relent-suffer-ep-april-17-2026",
    title: "Relent Announces New EP 'Suffer' Releasing April 17",
    artist: "Relent",
    date: "2026-04-01",
    category: "News",
    excerpt:
      "Texas nu-metal band Relent has announced their upcoming EP 'Suffer,' arriving April 17.",

    cardImage: relentArticleImg,
    cardImageAlt: "Relent Suffer EP track list announcement",

    heroMedia: {
      type: "image",
      src: relentArticleImg,
      alt: "Relent Suffer EP track list announcement",
    },

    socials: {
      website: "https://relentmusic.com/",
      instagram: "https://www.instagram.com/relentofficial/",
      youtube: "https://www.youtube.com/@relentofficial",
      spotify: "https://open.spotify.com/artist/3BcuUq1rwq2xlcyab2w3lu",
      facebook: "",
      x: "",
      tiktok: "",
      appleMusic: "",
      amazonMusic: "",
      bandcamp: "",
      soundcloud: "",
    },

    video: {
      title: 'Latest Single: "Holy Forever"',
      url: "https://www.youtube.com/embed/tMnxa6dHack",
      type: "youtube",
    },

    contentHtml: `
      <p class="article-intro">
        Texas nu-metal band <strong>Relent</strong> is getting ready to make some noise again with their upcoming EP
        <strong><em>Suffer</em></strong>, set to drop on <strong>April 17</strong>.
      </p>

      <p>
        The band recently shared the track list for the release and told fans,
        <em>“Track List for our EP ‘Suffer’! Mark your calendars for April 17th! This whole thing drops!”</em>
      </p>

      <h2>Who Is Relent?</h2>

      <p>
        Formed by <strong>Miggy Sanchez of Ill Niño</strong> in 2016, Relent blends hard rock and nu-metal with an
        emotionally charged lyrical approach. The band has built a reputation around heavy songs, intense live shows,
        and music that hits with both aggression and purpose.
      </p>

      <p>
        According to the band’s official bio, Relent has toured across North America, played major festivals, and gained
        attention through releases like <em>Heavy</em> and <em>World War Me</em>. Their sound continues to fuse modern
        heaviness with the kind of emotional weight that helped define nu-metal in the first place.
      </p>

      <h2>Why <em>Suffer</em> Matters</h2>

      <p>
        Relent has already shown they can balance heavy riffs, anthemic choruses, and real-life subject matter. If
        <em>Suffer</em> follows that same path, this EP could be another strong step forward for a band that keeps
        pushing deeper into the modern nu-metal conversation.
      </p>

      <p>
        For fans of hard-hitting, emotionally driven music, April 17 is definitely a date to circle.
      </p>

      <h2>Stay Connected with Relent</h2>

      <p>
        Follow Relent on their official platforms to keep up with the EP release, new music, videos, and tour updates.
      </p>
    `,
  },



  {
    id: "xiii-minutes-panic-single-april-10-2026",
    slug: "xiii-minutes-panic-single-april-10-2026",
    title: 'XIII Minutes Announces New Single "Panic" Releasing April 10',
    artist: "XIII Minutes",
    date: "2026-04-02",
    category: "News",
    excerpt:
      'XIII Minutes is back with a new single, "Panic," arriving Friday, April 10, 2026 via NRT Music.',

    cardImage: xiiiMinutesArticleImg,
    cardImageAlt: 'Promotional image for XIII Minutes single "Panic"',

    heroMedia: {
      type: "image",
      src: xiiiMinutesArticleImg,
      alt: 'Promotional image for XIII Minutes single "Panic"',
    },

    socials: {
      website: "",
      instagram: "",
      youtube: "",
      spotify: "",
      facebook: "",
      x: "",
      tiktok: "",
      appleMusic: "",
      amazonMusic: "",
      bandcamp: "",
      soundcloud: "",
    },

    contentHtml: `
    <p class="article-intro">
      Alternative metal band <strong>XIII Minutes</strong> is officially back with new music. The band has announced their
      upcoming single <strong>"Panic"</strong>, releasing <strong>Friday, April 10, 2026</strong> via <strong>NRT Music</strong>.
    </p>

    <p>
      After a period of quiet, XIII Minutes has returned with renewed energy and a refreshed lineup, signaling a new chapter
      for the band.
    </p>

    <h2>A Strong Return After Silence</h2>

    <p>
      XIII Minutes originally gained attention with their 2019 release <em>Obsessed</em> through Rottweiler Records.
    </p>

    <h2>A New Lineup, Same Intensity</h2>

    <p>
      The band's current lineup brings both familiarity and fresh energy.
    </p>

    <h2>Release Date</h2>

    <p>
      <strong>XIII Minutes — "Panic"</strong><br />
      <strong>Release Date:</strong> Friday, April 10, 2026<br />
      <strong>Label:</strong> NRT Music
    </p>
    `,
  },





{
  id: "the-blamed-new-music-teaser-2026",
  slug: "the-blamed-new-music-teaser-2026",
  title: 'The Blamed Tease New Music with Upcoming Split 7" Release',
  artist: "The Blamed",
  date: "2026-04-02",
  category: "News",
  excerpt: "Veteran Christian hardcore band The Blamed have released a teaser for their upcoming split 7-inch with Teeth For Eyes.",
  cardImage: blamedArticleImg,
  cardImageAlt: "The Blamed teaser artwork",
  heroMedia: {
  type: "youtube",
  url: "https://www.youtube.com/embed/v9Rz6kSLX0c",
},
  socials: {},
  contentHtml: `   <p class="article-intro">
      Veteran Christian hardcore band <strong>The Blamed</strong> have teased new music tied to an upcoming
      split 7-inch release with <strong>Teeth For Eyes</strong>.
    </p>

    <p>
      The teaser gives fans a first listen at new material and signals a return from one of the
      long-standing names in Christian hardcore.
    </p>

    <h2>New Music Incoming</h2>

    <p>
      The upcoming split 7-inch will feature new material from both bands and continues
      The Blamed's legacy in the underground hardcore scene.
    </p>

    <p>
      Fans of classic Christian hardcore should keep an eye out for additional announcements
      regarding release dates and availability.
    </p>`,
}

].sort((a, b) => new Date(b.date) - new Date(a.date));

export default articles;