import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import bands from "../frontend/src/assets/data/bands-data.js";

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

console.log("SUPABASE_URL:", supabaseUrl || "missing");
console.log(
  "SUPABASE_SERVICE_ROLE:",
  supabaseKey ? "loaded" : "missing"
);

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in root .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const transformedBands = bands.map((band) => ({
  name: band.name || "",
  slug: band.slug || "",
  era: Array.isArray(band.era) ? band.era : [],
  subgenres: Array.isArray(band.subgenres) ? band.subgenres : [],
  location: band.location || "",
  years_active: band.yearsActive || band.years_active || "",
  description: band.description || "",
  image_path: band.image || band.image_path || "",
  website: band.website || "",
  instagram: band.socials?.instagram || "",
  facebook: band.socials?.facebook || "",
  x: band.socials?.x || "",
  youtube: band.socials?.youtube || "",
  spotify: band.socials?.spotify || "",
  apple_music: band.socials?.appleMusic || band.socials?.apple_music || "",
  tiktok: band.socials?.tiktok || "",
  link_tree: band.link_tree || band.socials?.linkTree || "",
}));

// REMOVE DUPLICATE SLUGS
const uniqueBands = Object.values(
  transformedBands.reduce((acc, band) => {
    acc[band.slug] = band;
    return acc;
  }, {})
);

async function seedBands() {
  const { data, error } = await supabase
    .from("bands")
    .upsert(uniqueBands, { onConflict: "slug" });

  if (error) {
    console.error("Error uploading bands:", error);
    return;
  }

  console.log("Bands uploaded successfully");
}

seedBands();