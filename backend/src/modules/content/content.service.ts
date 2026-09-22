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
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function searchContent(
  search?: string,
  genre?: string,
  type?: string
) {
  let query = supabase
    .from("content_catalog")
    .select(
      "content_id, title, type, genre_name, licensor_name, release_date, director, age_rating"
    );

  if (search) {
    const safeSearch = search.replace(/[%_,()*]/g, "").trim();

    if (safeSearch) {
      query = query.or(
        `title.ilike.%${safeSearch}%,director.ilike.%${safeSearch}%,genre_name.ilike.%${safeSearch}%`
      );
    }
  }

  if (genre) {
    query = query.ilike("genre_name", genre);
  }

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query
    .order("release_date", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}