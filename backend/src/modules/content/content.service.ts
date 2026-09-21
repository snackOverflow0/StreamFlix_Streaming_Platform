import { supabase } from "../../config/supabase.js";

export async function getAllContent() {
  const { data, error } = await supabase
  .from("content_catalog")
  .select("content_id, title, type, genre_name, licensor_name, release_date, director, age_rating")
  .order("release_date", {ascending: false});

  if (error) {
    throw new Error(error.message);
  }

  return data;
}