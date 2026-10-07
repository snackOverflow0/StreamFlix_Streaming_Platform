import type { Request } from "express";
import { supabase } from "../../config/supabase.js";
import { getCurrentAppUser } from "../../utils/ownership.js";

const contentColumns = "content_id, genre_id, license_id, title, description, release_date, director, cast, synopsis, type, age_rating, created_at, deleted_at, trailer_url, poster_url, preview_url, hero_url, duration_label";

type ContentRow = Record<string, any>;

async function loadContent(ids?: number[]) {
  let query = supabase.from("content").select(contentColumns).is("deleted_at", null);
  if (ids?.length) query = query.in("content_id", ids);
  const { data, error } = await query.order("release_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContentRow[];
}

export async function getRecommendations(req: Request) {
  const user = await getCurrentAppUser(req);
  const [historyResult, favoritesResult, watchlistResult, genresResult, allContent] = await Promise.all([
    supabase.from("view_history").select("content_id, progress_percentage, watch_date").eq("user_id", user.user_id).order("watch_date", { ascending: false }).limit(100),
    supabase.from("favorites").select("content_id").eq("user_id", user.user_id),
    supabase.from("watch_list").select("content_id").eq("user_id", user.user_id),
    supabase.from("genre").select("genre_id, genre_name"),
    loadContent(),
  ]);
  for (const result of [historyResult, favoritesResult, watchlistResult, genresResult]) if (result.error) throw result.error;

  const history = historyResult.data ?? [];
  const favorites = new Set((favoritesResult.data ?? []).map((x) => Number(x.content_id)));
  const watchlist = new Set((watchlistResult.data ?? []).map((x) => Number(x.content_id)));
  const genres = new Map((genresResult.data ?? []).map((x) => [Number(x.genre_id), String(x.genre_name)]));
  const selectedIds = allContent.map((x) => Number(x.content_id));
  const { data: reviewRows, error: reviewError } = selectedIds.length
    ? await supabase.from("review").select("content_id, rating_value").in("content_id", selectedIds)
    : { data: [], error: null };
  if (reviewError) throw reviewError;
  const ratingMap = new Map<number, { sum: number; count: number }>();
  for (const row of reviewRows ?? []) {
    const id = Number(row.content_id);
    const current = ratingMap.get(id) ?? { sum: 0, count: 0 };
    current.sum += Number(row.rating_value);
    current.count += 1;
    ratingMap.set(id, current);
  }
  const completed = new Set(history.filter((x) => Number(x.progress_percentage) >= 95).map((x) => Number(x.content_id)));
  const watched = new Set(history.map((x) => Number(x.content_id)));
  const historyIds = history.map((x) => Number(x.content_id));
  const contentById = new Map(allContent.map((x) => [Number(x.content_id), x]));

  const genreScores = new Map<number, number>();
  for (const id of [...historyIds, ...favorites, ...watchlist]) {
    const row = contentById.get(Number(id));
    if (!row) continue;
    genreScores.set(Number(row.genre_id), (genreScores.get(Number(row.genre_id)) ?? 0) + (favorites.has(Number(id)) ? 3 : 1));
  }

  const ranked = allContent
    .filter((row) => !completed.has(Number(row.content_id)))
    .map((row) => {
      const id = Number(row.content_id);
      const genreScore = genreScores.get(Number(row.genre_id)) ?? 0;
      const affinity = genreScore * 10 + (favorites.has(id) ? 8 : 0) + (watchlist.has(id) ? 5 : 0);
      const recency = Date.parse(String(row.release_date ?? row.created_at ?? "")) || 0;
      return { row, score: affinity + recency / 1e13 };
    })
    .sort((a, b) => b.score - a.score);

  const latestWatched = historyIds.map((id) => contentById.get(id)).find(Boolean);
  const because = latestWatched ? ranked.filter(({ row }) => Number(row.genre_id) === Number(latestWatched.genre_id) && Number(row.content_id) !== Number(latestWatched.content_id)).slice(0, 12) : [];
  const used = new Set(because.map(({ row }) => Number(row.content_id)));
  const genreBased = ranked.filter(({ row }) => !used.has(Number(row.content_id)) && (genreScores.get(Number(row.genre_id)) ?? 0) > 0).slice(0, 12);
  for (const item of genreBased) used.add(Number(item.row.content_id));
  const recommended = ranked.filter(({ row }) => !used.has(Number(row.content_id))).slice(0, 12);
  const fallback = ranked.filter(({ row }) => !used.has(Number(row.content_id))).slice(0, 12);

  const map = (items: { row: ContentRow }[]) => items.map(({ row }) => { const rating = ratingMap.get(Number(row.content_id)); return { ...row, genre_name: genres.get(Number(row.genre_id)) ?? null, rating: rating?.count ? Number((rating.sum / rating.count).toFixed(1)) : 0, review_count: rating?.count ?? 0 }; });

  return {
    becauseYouWatched: map(because),
    basedOnYourGenres: map(genreBased),
    recommendedForYou: map(recommended.length ? recommended : fallback),
  };
}
