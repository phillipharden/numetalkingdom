import { supabase } from "./supabase";

export const getUpcomingReleases = async () => {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .gte("release_date", today)
    .order("release_date", { ascending: true })
    .order("priority", { ascending: false });

  if (error) {
    console.error("Error fetching releases:", error);
    return [];
  }

  return data;
};

export const getArchivedReleases = async () => {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .lt("release_date", today)
    .order("release_date", { ascending: false })
    .order("priority", { ascending: false });

  if (error) {
    console.error("Error fetching archive:", error);
    return [];
  }

  return data;
};