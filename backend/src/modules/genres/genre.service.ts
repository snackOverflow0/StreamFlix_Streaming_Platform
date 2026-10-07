import { supabase } from "../../config/supabase.js";

export type Genre = { genre_id: number; genre_name: string };

export async function listGenres() {
  const { data, error } = await supabase.from("genre").select("genre_id, genre_name").order("genre_name").returns<Genre[]>();
  if (error) throw error;
  return data ?? [];
}
