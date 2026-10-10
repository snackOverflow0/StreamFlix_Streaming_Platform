import {emailDeliveryRouter} from './email-delivery.js';
import {isStorageReference,resolveTrailerUrl,stableMediaReference} from '../../utils/trailer-url.js';
import {manilaDate} from "../../utils/subscription-date.js";
import { Router } from "express";
import { supabase } from "../../config/supabase.js";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { AppError } from "../../utils/errors.js";
import { parseId, requireString } from "../../utils/http.js";
import { listCatalog } from "../content/content.service.js";

import { managementRouter, allRows, validDate, databaseError } from "./management.js";
import {uploadRouter} from './uploads.js';
const router = Router();
router.use(requireAuth);
router.use(async (req, _res, next) => {
  try {
    const { data, error } = await supabase.from("admin_roles").select("role").eq("auth_user_id", (req as AuthenticatedRequest).auth.authUserId).maybeSingle();
    if (error) throw new AppError(503, "Admin setup is incomplete. Apply the admin migration.");
    if (data?.role !== "administrator") throw new AppError(403, "Administrator access required");
    next();
  } catch (error) { next(error); }
});
router.use(emailDeliveryRouter);
router.use(uploadRouter);
router.use(managementRouter);
const resources = {
  content: { table: "content", id: "content_id", fields: ["genre_id", "license_id", "title", "description", "release_date", "director", "cast", "synopsis", "type", "age_rating", "is_kids_suitable", "trailer_url", "poster_url", "preview_url", "hero_url", "duration_label", "video_url"] },
  genres: { table: "genre", id: "genre_id", fields: ["genre_name"] },
  licenses: { table: "content_license", id: "license_id", fields: ["licensor_name", "expiration_date", "region"] },
  users: { table: "users", id: "user_id", fields: ["full_name", "phone_number", "account_status"] },
  assets: { table: "admin_media_assets", id: "asset_id", fields: ["name", "url", "kind", "folder"] },
} as const;
function config(name: string) {
  const result = resources[name as keyof typeof resources];
  if (!result) throw new AppError(404, "Unknown admin resource");
  return result;
}
router.get("/bootstrap", async (_req, res, next) => {
  try {
    const names = ["genres", "licenses", "users", "assets"] as const;
    const result: Record<string, unknown> = {};
    await Promise.all([
      listCatalog(true).then(content=>{result.content=content.map(row=>({...row,video_url:row.trailer_url}));}),
      ...names.map(async name=>{const rows=await allRows(resources[name].table,name==="users"?"user_id,full_name,email,phone_number,date_of_birth,account_status,created_at,updated_at,deleted_at":"*",resources[name].id);result[name]=name==="assets"?await Promise.all(rows.map(async row=>({...row,url:await resolveTrailerUrl(String(row.url||'')).catch(()=>null)}))):rows;}),
      allRows("subscriptions","subscription_id,subscription_user_id,plan_id,start_date,end_date,status,created_at","subscription_id").then(rows=>{result.subscriptions=rows;}),
      allRows("plans","plan_id,plan_name,max_members,monthly_price,is_active","plan_id").then(rows=>{result.plans=rows;}),
      (async()=>{const {data,error}=await supabase.from("admin_settings").select("settings").eq("id",1).maybeSingle();if(error)throw error;result.settings=data?.settings??{};})(),
    ]);
    res.json(result);
  } catch (error) { next(error); }
});
router.get('/assets/:id/url',async(req,res,next)=>{try{const {data,error}=await supabase.from('admin_media_assets').select('url').eq('asset_id',parseId(String(req.params.id))).maybeSingle();if(error)throw error;if(!data)throw new AppError(404,'Asset not found');const url=await resolveTrailerUrl(String(data.url));if(!url)throw new AppError(404,'Asset has no accessible file');res.json({url});}catch(e){next(e);}});
router.patch('/content/:id/visibility', async(req,res,next)=>{
 try {
  if(typeof req.body?.is_active !== 'boolean' || Object.keys(req.body).some(key=>key!=='is_active')) throw new AppError(400,'Supply only a boolean is_active');
  const {data,error}=await supabase.from('content').update({is_active:req.body.is_active}).eq('content_id',parseId(String(req.params.id))).is('deleted_at',null).select('content_id,is_active').maybeSingle();
  if(error)databaseError(error);if(!data)throw new AppError(404,'Content not found');res.json(data);
 }catch(error){next(error);}
});
router.patch("/settings", async (req, res, next) => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new AppError(400, "Invalid settings");
    const fields = ["platformName", "tagline", "supportEmail", "language", "timezone", "primaryColor", "secondaryColor", "autoPublish", "ratings", "subtitles"];
    const values = Object.fromEntries(fields.filter(key => body[key] !== undefined).map(key => [key, body[key]]));
    const {data:previous,error:readError}=await supabase.from("admin_settings").select("settings").eq("id",1).maybeSingle();
    if(readError)throw readError;
    const { data, error } = await supabase.from("admin_settings").upsert({ id: 1, settings: {...previous?.settings,...values} }).select("settings").single();
    if (error) throw error;
    res.json(data.settings);
  } catch (error) { next(error); }
});
router.patch("/subscriptions/:id", async (req, res, next) => {
  try {
    const id = parseId(String(req.params.id));
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new AppError(400, "Invalid subscription update");
    const { data: existing, error: lookupError } = await supabase.from("subscriptions").select("*").eq("subscription_id", id).maybeSingle();
    if (lookupError) throw lookupError;
    if (!existing) throw new AppError(404, "Subscription not found");
    const updates: Record<string, unknown> = {};
    if (body.status !== undefined) {
      if (!["active", "cancelled"].includes(body.status)) throw new AppError(400, "Status must be active or cancelled");
      updates.status = body.status;
    }
    if (body.end_date !== undefined) {
      const date = body.end_date;
      if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date) throw new AppError(400, "Use a valid expiry date in YYYY-MM-DD format");
      if (date < String(existing.start_date)) throw new AppError(400, "Expiry must be on or after the start date");
      updates.end_date = date;
    }
    if (!Object.keys(updates).length) throw new AppError(400, "No valid fields supplied");
    if ((updates.status ?? existing.status) === "active") {
      const today = manilaDate();
      const expiry = updates.end_date ?? existing.end_date;
      if (expiry && String(expiry) < today) throw new AppError(400, "Renew the expiry date before turning this subscription on");
      if (String(existing.start_date) > today) throw new AppError(400, "Subscription has not started yet");
      const { data: plan, error: planError } = await supabase.from("plans").select("is_active").eq("plan_id", existing.plan_id).maybeSingle();
      if (planError) throw planError;
      if (!plan?.is_active) throw new AppError(400, "This plan is inactive");
    }
    const { data, error } = await supabase.from("subscriptions").update(updates).eq("subscription_id", id).select("subscription_id, subscription_user_id, plan_id, start_date, end_date, status, created_at").single();
    if (error?.code === "23505") throw new AppError(409, "This user already has another active subscription");
    if (error) throw error;
    res.json(data);
  } catch (error) { next(error); }
});
router.post("/:resource", async (req, res, next) => {
  try {
    const name = String(req.params.resource), c = config(name);
    if (name === "users") throw new AppError(400, "Users register through Supabase Auth");
    const values = validate(name, req.body, true);
    const { data, error } = await supabase.from(c.table).insert(values).select("*").single();
    if (error) databaseError(error);
    res.status(201).json(data);
  } catch (error) { next(error); }
});
router.patch("/:resource/:id", async (req, res, next) => {
  try {
    const name = String(req.params.resource), c = config(name);
    const { data, error } = await supabase.from(c.table).update(validate(name, req.body, false)).eq(c.id, parseId(String(req.params.id))).select(name === "users" ? "user_id,full_name,email,phone_number,account_status,created_at" : "*").maybeSingle();
    if (error) databaseError(error);
    if (!data) throw new AppError(404, "Record not found");
    res.json(data);
  } catch (error) { next(error); }
});
router.delete("/:resource/:id", async (req, res, next) => {
  try {
    const name = String(req.params.resource), c = config(name), id = parseId(String(req.params.id));
    if (name === "users") throw new AppError(400, "Update account status instead of deleting users");
    if (name === "content") throw new AppError(400, "Use the content visibility switch instead of deleting content");
    const query = name === "content" ? supabase.from(c.table).update({ deleted_at: new Date().toISOString() }) : supabase.from(c.table).delete();
    const { data, error } = await query.eq(c.id, id).select(c.id);
    if (error) databaseError(error);
    if (!data?.length) throw new AppError(404, "Record not found");
    res.json({ deleted: true });
  } catch (error) { next(error); }
});
function validate(name: string, body: Record<string, unknown>, create: boolean) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new AppError(400, "Invalid record");
  const values: Record<string, unknown> = {};
  for (const field of config(name).fields) if (body[field] !== undefined) {
    if (field.endsWith("_id")) values[field] = parseId(String(body[field]), field);
    else if (body[field] === null && ["director","cast","trailer_url","poster_url","preview_url","hero_url","duration_label","video_url","phone_number"].includes(field)) values[field] = null;
    else if(field === "is_kids_suitable") { if(typeof body[field]!=="boolean")throw new AppError(400,"is_kids_suitable must be a boolean"); values[field]=body[field]; }
    else values[field] = requireString(body[field], field, ({title:150,director:100,age_rating:20,genre_name:50,licensor_name:100,region:50,full_name:100,phone_number:20} as Record<string,number>)[field]||5000);
  }
  if (!Object.keys(values).length) throw new AppError(400, "No valid fields supplied");
  if (create) {
    const required = name === "content" ? ["title", "type", "genre_id", "license_id", "description", "synopsis", "release_date", "age_rating"] : name === "genres" ? ["genre_name"] : name === "licenses" ? ["licensor_name", "expiration_date", "region"] : ["name", "url", "kind"];
    for (const key of required) if (!values[key]) throw new AppError(400, key + " is required");
  }
  if (values.url || values.trailer_url) {
    for (const field of ["url", "trailer_url"]) if (values[field]) {
      if(isStorageReference(String(values[field])))continue;
      let url: URL;
      try { url = new URL(String(values[field])); } catch { throw new AppError(400, "Invalid URL"); }
      if (!["http:", "https:"].includes(url.protocol)) throw new AppError(400, "Use an HTTP or HTTPS URL");
    }
  }
  for (const field of ["poster_url", "preview_url", "hero_url", "video_url"]) if (values[field]) {
    const value = String(values[field]);
    if(isStorageReference(value))continue;
    if (!/^\/(streamflix|admin-design)\//.test(value)) {
      let url: URL;
      try { url = new URL(value); } catch { throw new AppError(400, field + " must be a valid URL"); }
      if (!["http:", "https:"].includes(url.protocol)) throw new AppError(400, "Use HTTP or HTTPS artwork URLs");
    }
  }
  for(const field of ["url","trailer_url","poster_url","preview_url","hero_url","video_url"])if(values[field])values[field]=stableMediaReference(String(values[field]));
  for (const field of ["expiration_date", "release_date"]) if (values[field]) validDate(values[field], field);
  if(values.type) { values.type=String(values.type).toLowerCase(); if(!["movie","series"].includes(String(values.type)))throw new AppError(400,"Type must be movie or series"); }
  if(values.account_status&&! ["active","suspended","deactivated"].includes(String(values.account_status)))throw new AppError(400,"Invalid account status");
  if(values.kind&&! ["Image","Video","Audio","Document"].includes(String(values.kind)))throw new AppError(400,"Invalid asset kind");
  if (name === "content" && values.video_url !== undefined) { values.trailer_url = values.video_url; delete values.video_url; }
  return values;
}
export default router;
