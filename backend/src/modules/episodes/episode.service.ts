import { supabase } from "../../config/supabase.js";

export async function getEpisodesBySeason(seasonId: number) {
  const { data, error } = await supabase
    .from("episodes")
    .select(
      "episode_id, season_id, episode_number, episode_title, duration, release_date"
    )
    .eq("season_id", seasonId)
    .order("episode_number", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}