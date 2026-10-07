import { Router } from "express";
import { supabase } from "../../config/supabase.js";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { AppError } from "../../utils/errors.js";
import { parseId, requireString } from "../../utils/http.js";
import { allRows, databaseError, managementRouter, validateManaged, validDate } from "./management.js";
import { uploadRouter } from "./uploads.js";

const router = Router();
router.use(requireAuth);

router.use(async (req, _res, next) => {
  try {
    const authUserId = (req as AuthenticatedRequest).auth.authUserId;
    const { data, error } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (error) throw new AppError(503, "Admin setup is incomplete. Apply the StreamFlix admin migration first.");
    if (data?.role !== "administrator") throw new AppError(403, "Administrator access required");
    next();
  } catch (error) { next(error); }
});

router.use(uploadRouter);
router.use(managementRouter);

const resources = {
  content: { table: "content", id: "content_id", fields: ["genre_id", "license_id", "title", "description", "release_date", "director", "cast", "synopsis", "type", "age_rating", "trailer_url", "poster_url", "preview_url", "hero_url", "duration_label"] },
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

const contentSelect = "content_id,genre_id,license_id,title,description,release_date,director,cast_info,synopsis,type,age_rating,created_at,deleted_at,is_active,trailer_url,poster_url,preview_url,hero_url,duration_label";

async function listAdminContent() {
  const [{ data, error }, { data: genres, error: genresError }, { data: licenses, error: licensesError }, { data: reviews, error: reviewsError }] = await Promise.all([
    supabase.from("content").select(contentSelect).is("deleted_at", null).order("release_date", { ascending: false }),
    supabase.from("genre").select("genre_id,genre_name"),
    supabase.from("content_license").select("license_id,licensor_name,expiration_date"),
    supabase.from("review").select("content_id,rating_value"),
  ]);
  if (error) throw error;
  if (genresError) throw genresError;
  if (licensesError) throw licensesError;
  if (reviewsError) throw reviewsError;

  const genreMap = new Map((genres ?? []).map(row => [row.genre_id, row.genre_name]));
  const licenseMap = new Map((licenses ?? []).map(row => [row.license_id, row]));
  const ratingMap = new Map<number, { sum: number; count: number }>();
  for (const row of reviews ?? []) {
    const current = ratingMap.get(Number(row.content_id)) ?? { sum: 0, count: 0 };
    current.sum += Number(row.rating_value);
    current.count += 1;
    ratingMap.set(Number(row.content_id), current);
  }

  return (data ?? []).map((row: any) => {
    const rating = ratingMap.get(Number(row.content_id));
    return {
      ...row,
      cast: row.cast_info ?? null,
      genre_name: genreMap.get(row.genre_id) ?? null,
      licensor_name: licenseMap.get(row.license_id)?.licensor_name ?? null,
      license_expiration: licenseMap.get(row.license_id)?.expiration_date ?? null,
      rating: rating?.count ? Number((rating.sum / rating.count).toFixed(1)) : 0,
      review_count: rating?.count ?? 0,
    };
  });
}

function normalizeContentPayload(input: Record<string, unknown>) {
  const payload = { ...input };
  if (Object.prototype.hasOwnProperty.call(payload, "cast")) {
    payload.cast_info = payload.cast;
    delete payload.cast;
  }
  return payload;
}

function validateContent(body: Record<string, unknown>, create: boolean) {
  const normalized = normalizeContentPayload(body);
  const output: Record<string, unknown> = {};
  const allowedDbFields = ["genre_id", "license_id", "title", "description", "release_date", "director", "cast_info", "synopsis", "type", "age_rating", "trailer_url", "poster_url", "preview_url", "hero_url", "duration_label"];

  if (!normalized || typeof normalized !== "object" || Array.isArray(normalized)) throw new AppError(400, "Invalid record");

  for (const field of allowedDbFields) {
    if (normalized[field] === undefined) continue;
    const value = normalized[field];

    if (["genre_id", "license_id"].includes(field)) output[field] = parseId(String(value), field);
    else if (field === "release_date") output[field] = validDate(value, field);
    else if (field === "type") {
      const type = String(value).toLowerCase();
      if (!["movie", "series"].includes(type)) throw new AppError(400, "type must be movie or series");
      output[field] = type;
    } else if (["trailer_url", "poster_url", "preview_url", "hero_url"].includes(field)) {
      if (value === null || value === "") output[field] = null;
     
      else {
        try {
          const url = new URL(String(value));
          if (!["http:", "https:"].includes(url.protocol)) throw new Error();
          output[field] = url.toString();
        } catch { throw new AppError(400, "Invalid media URL"); }
      }
    } else if (field === "duration_label") {
      if (value !== null && (typeof value !== "string" || value.length > 50)) throw new AppError(400, "Invalid duration label");
      output[field] = value === "" ? null : value;
    } else if (["title", "director", "cast_info", "age_rating"].includes(field)) {
      if (value === null && ["director", "cast_info"].includes(field)) output[field] = null;
      else output[field] = requireString(value, field, field === "title" ? 150 : field === "director" ? 100 : field === "age_rating" ? 20 : 5000);
    } else if (["description", "synopsis"].includes(field)) {
      output[field] = requireString(value, field, 10000);
    }
  }

  if (create) {
    for (const field of ["genre_id", "license_id", "title", "description", "release_date", "synopsis", "type", "age_rating"]) {
      if (output[field] === undefined) throw new AppError(400, `${field} is required`);
    }
  }

  if (!Object.keys(output).length) throw new AppError(400, "No editable fields supplied");
  return output;
}

router.get("/bootstrap", async (_req, res, next) => {
  try {
    const content = await listAdminContent();
    const [genres, licenses, users, assets, subscriptions, plans, settings] = await Promise.all([
      allRows("genre", "*", "genre_id"),
      allRows("content_license", "*", "license_id"),
      allRows("users", "user_id,full_name,email,phone_number,date_of_birth,account_status,created_at,updated_at,deleted_at,auth_user_id", "user_id"),
      allRows("admin_media_assets", "*", "asset_id"),
      allRows("subscriptions", "subscription_id,subscription_user_id,plan_id,start_date,end_date,status,created_at", "subscription_id"),
      allRows("plans", "plan_id,plan_name,max_members,monthly_price,is_active", "plan_id"),
      supabase.from("admin_settings").select("settings").eq("id", 1).maybeSingle(),
    ]);
    if (settings.error) throw settings.error;
    res.json({ content, genres, licenses, users, assets, subscriptions, plans, settings: settings.data?.settings ?? {} });
  } catch (error) { next(error); }
});

router.get("/assets/:id/url", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("admin_media_assets").select("url").eq("asset_id", parseId(String(req.params.id))).maybeSingle();
    if (error) throw error;
    if (!data) throw new AppError(404, "Asset not found");
    if (String(data.url).startsWith("storage://streamflix-videos/")) {
      const path = String(data.url).slice("storage://streamflix-videos/".length);
      const { data: signed, error: signError } = await supabase.storage.from("streamflix-videos").createSignedUrl(path, 3600);
      if (signError) throw signError;
      res.json({ url: signed.signedUrl });
      return;
    }
    res.json({ url: data.url });
  } catch (error) { next(error); }
});

router.patch("/content/:id/visibility", async (req, res, next) => {
  try {
    if (typeof req.body?.is_active !== "boolean" || Object.keys(req.body).some(key => key !== "is_active")) throw new AppError(400, "Supply only a boolean is_active");
    const { data, error } = await supabase.from("content").update({ is_active: req.body.is_active }).eq("content_id", parseId(String(req.params.id))).is("deleted_at", null).select("content_id,is_active").maybeSingle();
    if (error) databaseError(error);
    if (!data) throw new AppError(404, "Content not found");
    res.json(data);
  } catch (error) { next(error); }
});

router.patch("/settings", async (req, res, next) => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new AppError(400, "Invalid settings");
    const fields = ["platformName", "tagline", "supportEmail", "language", "timezone", "primaryColor", "secondaryColor", "autoPublish", "ratings", "subtitles"];
    const values = Object.fromEntries(fields.filter(key => body[key] !== undefined).map(key => [key, body[key]]));
    const { data: previous, error: readError } = await supabase.from("admin_settings").select("settings").eq("id", 1).maybeSingle();
    if (readError) throw readError;
    const { data, error } = await supabase.from("admin_settings").upsert({ id: 1, settings: { ...(previous?.settings ?? {}), ...values } }).select("settings").single();
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
      if (!["active", "cancelled"].includes(String(body.status))) throw new AppError(400, "Status must be active or cancelled");
      updates.status = body.status;
    }
    if (body.end_date !== undefined) {
      const date = validDate(body.end_date, "end_date");
      if (date < String(existing.start_date)) throw new AppError(400, "Expiry must be on or after the start date");
      updates.end_date = date;
    }
    if (!Object.keys(updates).length) throw new AppError(400, "No valid fields supplied");
    const today = new Date().toISOString().slice(0, 10);
    if (String(updates.status ?? existing.status) === "active") {
      const expiry = updates.end_date ?? existing.end_date;
      if (expiry && String(expiry) < today) throw new AppError(400, "Renew the expiry date before turning this subscription on");
      if (String(existing.start_date) > today) throw new AppError(400, "Subscription has not started yet");
    }
    const { data, error } = await supabase.from("subscriptions").update(updates).eq("subscription_id", id).select("*").single();
    if (error) databaseError(error);
    res.json(data);
  } catch (error) { next(error); }
});

router.post("/:resource", async (req, res, next) => {
  try {
    const name = String(req.params.resource);
    const configValue = config(name);
    if (name === "users") throw new AppError(400, "Users register through Supabase Auth");
    const values = name === "content" ? validateContent(req.body, true) : validateSimpleResource(name, req.body, true);
    const { data, error } = await supabase.from(configValue.table).insert(values).select("*").single();
    if (error) databaseError(error);
    res.status(201).json(data);
  } catch (error) { next(error); }
});

router.patch("/:resource/:id", async (req, res, next) => {
  try {
    const name = String(req.params.resource);
    const configValue = config(name);
    const values = name === "content" ? validateContent(req.body, false) : validateSimpleResource(name, req.body, false);
    const { data, error } = await supabase.from(configValue.table).update(values).eq(configValue.id, parseId(String(req.params.id))).select("*").maybeSingle();
    if (error) databaseError(error);
    if (!data) throw new AppError(404, "Record not found");
    res.json(data);
  } catch (error) { next(error); }
});

router.delete("/:resource/:id", async (req, res, next) => {
  try {
    const name = String(req.params.resource);
    const configValue = config(name);
    const id = parseId(String(req.params.id));
    if (name === "users") throw new AppError(400, "Update account status instead of deleting users");
    if (name === "content") {
      const { data, error } = await supabase.from("content").update({ deleted_at: new Date().toISOString(), is_active: false }).eq("content_id", id).select("content_id");
      if (error) databaseError(error);
      if (!data?.length) throw new AppError(404, "Record not found");
      res.json({ deleted: true });
      return;
    }
    const { data, error } = await supabase.from(configValue.table).delete().eq(configValue.id, id).select(configValue.id);
    if (error) databaseError(error);
    if (!data?.length) throw new AppError(404, "Record not found");
    res.json({ deleted: true });
  } catch (error) { next(error); }
});

function validateSimpleResource(name: string, body: Record<string, unknown>, create: boolean) {
  const c = config(name);
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new AppError(400, "Invalid record");
  const values: Record<string, unknown> = {};
  for (const field of c.fields) {
    if (body[field] === undefined) continue;
    const value = body[field];
    if (field.endsWith("_id")) values[field] = parseId(String(value), field);
    else if (value === null && ["phone_number"].includes(field)) values[field] = null;
    else if (field === "account_status") {
      if (!["active", "suspended", "deactivated"].includes(String(value))) throw new AppError(400, "Invalid account status");
      values[field] = value;
    } else if (field === "url") {
      try { const url = new URL(String(value)); if (!["http:", "https:"].includes(url.protocol)) throw new Error(); values[field] = url.toString(); } catch { throw new AppError(400, "Invalid media URL"); }
    } else if (field === "expiration_date") values[field] = validDate(value, field);
    else values[field] = requireString(value, field, field === "genre_name" ? 50 : field === "licensor_name" ? 100 : field === "full_name" ? 100 : 255);
  }
  if (create) {
    for (const required of c.fields.filter(field => ["genre_name", "licensor_name", "expiration_date", "region", "name", "url"].includes(field))) if (values[required] === undefined) throw new AppError(400, `${required} is required`);
  }
  if (!Object.keys(values).length) throw new AppError(400, "No editable fields supplied");
  return values;
}

export default router;
