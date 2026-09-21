import { supabase } from "../../config/supabase.js";

export async function getAllGenres() {
  const { data, error } = await supabase
    .from("genre")
    .select("genre_id, genre_name")
    .order("genre_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}