import { getContentById } from "../content/content.service.js";
import { AppError } from "../../utils/errors.js";
import { supabase } from "../../config/supabase.js";
export type Episode = { episode_id: number; season_id: number; episode_number: number; episode_title: string; duration: number; release_date: string; video_url: string | null };
export async function getEpisodesBySeason(seasonId: number) {
  const {data:season,error:seasonError}=await supabase.from('season').select('content_id').eq('season_id',seasonId).maybeSingle();
  if(seasonError)throw seasonError;if(!season)throw new AppError(404,'Season not found');await getContentById(season.content_id);
  const { data, error } = await supabase.from("episodes").select("episode_id, season_id, episode_number, episode_title, duration, release_date, video_url:trailer_url").eq("season_id", seasonId).order("episode_number").returns<Episode[]>();
  if (error) throw error;
  return data ?? [];
}
