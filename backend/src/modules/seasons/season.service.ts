import { supabase } from "../../config/supabase.js";

export async function getSeasonsByContent(contentId: number) {
  const { data, error } = await supabase
    .from("season")
    .select(
      "season_id, content_id, season_number, season_title, release_date"
    )
    .eq("content_id", contentId)
    .order("season_number", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data;
}