import { supabase } from "../../config/supabase.js";
export type Episode = { episode_id: number; season_id: number; episode_number: number; episode_title: string; duration: number; release_date: string };
export async function getEpisodesBySeason(seasonId: number) {
  const { data, error } = await supabase.from("episodes").select("episode_id, season_id, episode_number, episode_title, duration, release_date").eq("season_id", seasonId).order("episode_number").returns<Episode[]>();
  if (error) throw error;
  return data ?? [];
}
