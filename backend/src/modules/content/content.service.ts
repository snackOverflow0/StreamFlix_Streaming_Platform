import { supabase } from "../../config/supabase.js";

export async function getAllContent() {
  const { data, error } = await supabase
    .from("content_catalog")
    .select(
      "content_id, title, type, genre_name, licensor_name, release_date, director, age_rating"
    )
    .order("release_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getContentById(contentId: number) {
  const { data, error } = await supabase
    .from("content_catalog")
    .select(
      "content_id, title, type, genre_name, licensor_name, release_date, director, age_rating"
    )
    .eq("content_id", contentId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message);
  }

  return data;
}