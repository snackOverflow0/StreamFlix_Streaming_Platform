import {cached} from '../../utils/cache.js';
import {resolveTrailerUrl,warmMediaUrls} from "../../utils/trailer-url.js";
import { supabase } from "../../config/supabase.js";
import { AppError } from "../../utils/errors.js";
import type { ContentPresentation } from "../../config/content-presentation.js";
import { getContentPresentation } from "../../config/content-presentation.js";
import type { ContentRecord } from "./content.types.js";

import { manilaDate } from "../../utils/subscription-date.js";
import { licenseAvailable } from "../../utils/license-access.js";

const contentColumns = "content_id, genre_id, license_id, title, description, release_date, director, cast, synopsis, type, age_rating, is_kids_suitable, created_at, deleted_at, is_active, trailer_url, poster_url, preview_url, hero_url, duration_label";

async function getReferenceMapsUncached() {
  const genres: {genre_id:number;genre_name:string}[] = [];
  const licenses: {license_id:number;licensor_name:string;expiration_date:string}[] = [];
  await Promise.all([
    (async () => {for(let offset=0;;offset+=500){
      const {data,error}=await supabase.from("genre").select("genre_id, genre_name").order("genre_id").range(offset,offset+499);
      if(error)throw error; genres.push(...(data??[])); if((data??[]).length<500)break;
    }})(),
    (async () => {for(let offset=0;;offset+=500){
      const {data,error}=await supabase.from("content_license").select("license_id, licensor_name, expiration_date").order("license_id").range(offset,offset+499);
      if(error)throw error; licenses.push(...(data??[])); if((data??[]).length<500)break;
    }})(),
  ]);
  return {
    genres: new Map((genres ?? []).map((item) => [item.genre_id, item.genre_name])),
    licenses: new Map((licenses ?? []).map((item) => [item.license_id, item])),
  };
}

async function getRatingMapUncached() {
 const {data,error}=await supabase.rpc('get_content_rating_summaries');if(error)throw error;
 return new Map<number,{sum:number;count:number}>((data??[]).map((row:{content_id:number;average_rating:number;review_count:number})=>[row.content_id,{sum:Number(row.average_rating)*Number(row.review_count),count:Number(row.review_count)}]));
}
async function getWeeklyViewMapUncached() {
 const {data,error}=await supabase.rpc('streamflix_weekly_views');if(error)throw error;
 return new Map<number,number>((data??[]).map((row:{content_id:number;weekly_views:number})=>[row.content_id,Number(row.weekly_views)]));
}

function getReferenceMaps(){return cached('catalog:references',15000,getReferenceMapsUncached);}
function getRatingMap(){return cached('catalog:ratings',15000,getRatingMapUncached);}
function getWeeklyViewMap(){return cached('catalog:views',15000,getWeeklyViewMapUncached);}
export async function listContent(filters: { genre?: number; type?: string }) {
  let query = supabase.from("content").select(contentColumns).is("deleted_at", null).eq("is_active", true).order("content_id", { ascending: false });
  if (filters.genre) query = query.eq("genre_id", filters.genre);
  if (filters.type) query = query.eq("type", filters.type);
  const { data, error } = await query.returns<ContentRecord[]>();
  if (error) throw error;
  return enrichContent(data ?? [], true);
}

async function listCatalogUncached(includeInactive = false) {
  let query = supabase.from("content").select(contentColumns).is("deleted_at", null).order("release_date", { ascending: false });
  if (!includeInactive) query = query.eq("is_active", true);
  const rows: ContentRecord[] = [];
  for (let offset = 0; ; offset += 500) {
    const {data, error} = await query.order("content_id", {ascending: true}).range(offset, offset + 499).returns<ContentRecord[]>();
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data ?? []).length < 500) break;
  }
  return enrichContent(rows, !includeInactive);
}

export function listCatalog(includeInactive=false){return cached('catalog:list:'+includeInactive+':'+manilaDate(),15000,()=>listCatalogUncached(includeInactive));}
export async function getContentById(contentId: number) {
  const { data, error } = await supabase.from("content").select(contentColumns).eq("content_id", contentId).is("deleted_at", null).eq("is_active", true).maybeSingle().returns<ContentRecord | null>();
  if (error) throw error;
  if (!data) throw new AppError(404, "Content not found");
  const enriched = (await enrichContent([data]))[0];
  if (!enriched || !enriched.license_available) throw new AppError(403, "This title is unavailable because its license has expired or is missing. Please contact support.");
  return enriched;
}

export async function searchContent(params: { q?: string; genre?: number; type?: string }) {
  let query = supabase.from("content").select(contentColumns).is("deleted_at", null).eq("is_active", true).order("title", { ascending: true });
  if (params.q) {
    const term = params.q.replaceAll(",", " ").trim();
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,synopsis.ilike.%${term}%`);
  }
  if (params.genre) query = query.eq("genre_id", params.genre);
  if (params.type) query = query.eq("type", params.type);
  const { data, error } = await query.returns<ContentRecord[]>();
  if (error) throw error;
  return enrichContent(data ?? [], true);
}

async function enrichContent(rows: ContentRecord[], availableOnly = false) {
  if (!rows.length) return [];
  const [{ genres, licenses }, ratings,weeklyViews] = await Promise.all([getReferenceMaps(), getRatingMap(),getWeeklyViewMap()]);
  const today = manilaDate();
  await warmMediaUrls(rows.flatMap(row=>[row.trailer_url,row.poster_url,row.preview_url,row.hero_url]));
  return Promise.all(rows.filter(row => !availableOnly || licenseAvailable(licenses.get(row.license_id)?.expiration_date, today)).map(async (row) => {
    const presentation: ContentPresentation = getContentPresentation(row.title);
    const rating = ratings.get(row.content_id);
    return {
      ...row,
      trailer_url: await resolveTrailerUrl(row.trailer_url).catch(() => null),
      weekly_views: weeklyViews.get(row.content_id) ?? 0,
      genre_name: genres.get(row.genre_id) ?? null,
      licensor_name: licenses.get(row.license_id)?.licensor_name ?? null,
      license_available: licenseAvailable(licenses.get(row.license_id)?.expiration_date, today),
      license_expiration: licenses.get(row.license_id)?.expiration_date ?? null,
      rating: rating && rating.count ? Number((rating.sum / rating.count).toFixed(1)) : 0,
      review_count: rating?.count ?? 0,
      poster_url: await resolveTrailerUrl(row.poster_url || presentation.poster_url).catch(() => null),
      preview_url: await resolveTrailerUrl(row.preview_url || presentation.preview_url).catch(() => null),
      hero_url: await resolveTrailerUrl(row.hero_url || presentation.hero_url).catch(() => null),
      duration_label: row.duration_label || presentation.duration_label,
      is_featured: Boolean(presentation.is_featured),
    };
  }));
}
