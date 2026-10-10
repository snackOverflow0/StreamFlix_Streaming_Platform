import { getContentById } from "../content/content.service.js";
import { supabase } from "../../config/supabase.js";

export type Season = { season_id: number; content_id: number; season_number: number; season_title: string | null; release_date: string };

export async function getSeasonsByContent(contentId: number) {
  await getContentById(contentId);
  const { data, error } = await supabase.from("season").select("season_id, content_id, season_number, season_title, release_date").eq("content_id", contentId).order("season_number").returns<Season[]>();
  if (error) throw error;
  return data ?? [];
}
