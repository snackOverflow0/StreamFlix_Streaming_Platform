import { supabase } from "../../config/supabase.js";
import { AppError } from "../../utils/errors.js";
import type { ContentRecord } from "./content.types.js";

const contentColumns = "content_id, genre_id, license_id, title, description, release_date, director, cast, synopsis, type, age_rating, created_at, deleted_at, trailer_url, poster_url, preview_url, hero_url, duration_label";

async function getReferenceMaps() {
  const [{ data: genres, error: genreError }, { data: licenses, error: licenseError }] = await Promise.all([
    supabase.from("genre").select("genre_id, genre_name"),
    supabase.from("content_license").select("license_id, licensor_name, expiration_date"),
  ]);
  if (genreError) throw genreError;
  if (licenseError) throw licenseError;
  return {
    genres: new Map((genres ?? []).map((item) => [item.genre_id, item.genre_name])),
    licenses: new Map((licenses ?? []).map((item) => [item.license_id, item])),
  };
}

async function getRatingMap() {
  const rpc = await supabase.rpc("get_content_rating_summaries");
  if (!rpc.error) {
    return new Map<number, { average: number; count: number }>((rpc.data ?? []).map((row: any) => [Number(row.content_id), { average: Number(row.average_rating ?? 0), count: Number(row.review_count ?? 0) }]));
  }
  const fallback = await supabase.from("review").select("content_id, rating_value");
  if (fallback.error) throw rpc.error;
  const map = new Map<number, { average: number; count: number }>();
  for (const row of fallback.data ?? []) {
    const current = map.get(Number(row.content_id)) ?? { average: 0, count: 0 };
    current.average += Number(row.rating_value);
    current.count += 1;
    map.set(Number(row.content_id), current);
  }
  for (const entry of map.values()) entry.average = entry.count ? Number((entry.average / entry.count).toFixed(1)) : 0;
  return map;
}

export async function listContent(filters: { genre?: number; type?: string }) {
  let query = supabase.from("content").select(contentColumns).is("deleted_at", null).order("content_id", { ascending: false });
  if (filters.genre) query = query.eq("genre_id", filters.genre);
  if (filters.type) query = query.eq("type", String(filters.type).toLowerCase());
  const { data, error } = await query.returns<ContentRecord[]>();
  if (error) throw error;
  return enrichContent(data ?? []);
}

export async function listCatalog() {
  const { data, error } = await supabase.from("content").select(contentColumns).is("deleted_at", null).order("release_date", { ascending: false }).returns<ContentRecord[]>();
  if (error) throw error;
  return enrichContent(data ?? []);
}

export async function getContentById(contentId: number) {
  const { data, error } = await supabase.from("content").select(contentColumns).eq("content_id", contentId).is("deleted_at", null).maybeSingle().returns<ContentRecord | null>();
  if (error) throw error;
  if (!data) throw new AppError(404, "Content not found");
  return (await enrichContent([data]))[0];
}

export async function searchContent(params: { q?: string; genre?: number; type?: string }) {
  let query = supabase.from("content").select(contentColumns).is("deleted_at", null).order("title", { ascending: true });
  if (params.q) {
    const tokens = params.q
      .normalize("NFKC")
      .toLowerCase()
      .split(/\s+/)
      .map((token) => token.replace(/[^a-z0-9_-]/g, ""))
      .filter(Boolean)
      .slice(0, 8);
    for (const token of tokens) {
      query = query.or(`title.ilike.%${token}%,description.ilike.%${token}%,synopsis.ilike.%${token}%`);
    }
  }
  if (params.genre) query = query.eq("genre_id", params.genre);
  if (params.type) query = query.eq("type", String(params.type).toLowerCase());
  const { data, error } = await query.returns<ContentRecord[]>();
  if (error) throw error;
  return enrichContent(data ?? []);
}

async function enrichContent(rows: ContentRecord[]) {
  if (!rows.length) return [];
  const [{ genres, licenses }, ratings] = await Promise.all([getReferenceMaps(), getRatingMap()]);
  return rows.map((row) => {
    const rating = ratings.get(row.content_id);
    return {
      ...row,
      cast: (row as any).cast ?? null,
      genre_name: genres.get(row.genre_id) ?? null,
      licensor_name: licenses.get(row.license_id)?.licensor_name ?? null,
      license_expiration: licenses.get(row.license_id)?.expiration_date ?? null,
      rating: rating?.average ?? 0,
      review_count: rating?.count ?? 0,
      poster_url: row.poster_url ?? null,
      preview_url: row.preview_url ?? null,
      hero_url: row.hero_url ?? row.preview_url ?? row.poster_url ?? null,
      duration_label: row.duration_label ?? null,
    };
  });
}
