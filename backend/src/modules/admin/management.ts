import { Router } from "express";
import { supabase } from "../../config/supabase.js";
import { AppError } from "../../utils/errors.js";
import { parseId } from "../../utils/http.js";

export const managed = {
  seasons: { table: "season", id: "season_id", fields: ["content_id", "season_number", "season_title", "release_date"], required: ["content_id", "season_number", "release_date"] },
  episodes: { table: "episodes", id: "episode_id", fields: ["season_id", "episode_number", "episode_title", "duration", "release_date"], required: ["season_id", "episode_number", "episode_title", "duration", "release_date"] },
  plans: { table: "plans", id: "plan_id", fields: ["plan_name", "max_members", "monthly_price", "is_active"], required: ["plan_name", "max_members", "monthly_price", "is_active"] },
  products: { table: "merchandise_product", id: "product_id", fields: ["product_name", "category", "price", "listing_status", "stock_quantity", "image_url", "description"], required: ["product_name", "category", "price", "listing_status"] },
  feedback: { table: "feedback", id: "feedback_id", fields: ["status"], required: [] },
  reviews: { table: "review", id: "rev_id", fields: [], required: [] },
  orders: { table: "merchandise_transaction", id: "transaction_id", fields: [], required: [] },
  profiles: { table: "profiles", id: "profile_id", fields: [], required: [] },
  members: { table: "members", id: "member_id", fields: [], required: [] },
} as const;

export type ManagedName = keyof typeof managed;
export type ManagedRow = Record<string, unknown>;

export async function allRows(table: string, columns = "*", id?: string) {
  const result: ManagedRow[] = [];
  for (let offset = 0; ; offset += 500) {
    let query = supabase.from(table).select(columns);
    if (id) query = query.order(id);
    const { data, error } = await query.range(offset, offset + 499);
    if (error) throw error;
    result.push(...((data ?? []) as ManagedRow[]));
    if ((data ?? []).length < 500) return result;
  }
}

export function validDate(value: unknown, field: string) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) {
    throw new AppError(400, `${field} must be a valid YYYY-MM-DD date`);
  }
  return value;
}

function mediaValue(field: string, value: unknown) {
  if (value === null || value === "") return null;
  const stringValue = String(value);
  try {
    const url = new URL(stringValue);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    return url.toString();
  } catch {
    throw new AppError(400, "Invalid media URL");
  }
}

export function validateManaged(name: ManagedName, body: unknown, create: boolean) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new AppError(400, "Invalid record");
  const config = managed[name];
  const input = body as Record<string, unknown>;
  const values: ManagedRow = {};

  for (const field of config.fields) {
    if (input[field] === undefined) continue;
    const value = input[field];

    if (field.endsWith("_id")) values[field] = parseId(String(value), field);
    else if (field === "stock_quantity") {
      const n = Number(value);
      if (!Number.isSafeInteger(n) || n < 0) throw new AppError(400, "Stock must be a nonnegative integer");
      values[field] = n;
    } else if (field === "description") {
      if (typeof value !== "string" || value.length > 5000) throw new AppError(400, "Description too long");
      values[field] = value.trim();
    } else if (field === "image_url") {
      values[field] = mediaValue(field, value);
    } else if (["season_number", "episode_number", "duration", "max_members"].includes(field)) {
      const n = Number(value);
      if (!Number.isSafeInteger(n) || n < 1 || n > 1000000) throw new AppError(400, `${field} must be a positive integer`);
      values[field] = n;
    } else if (["price", "monthly_price"].includes(field)) {
      const n = Number(value);
      if (!Number.isFinite(n) || n < 0 || n > 99999999.99 || Math.abs(n * 100 - Math.round(n * 100)) > 0.00001) throw new AppError(400, "Price must be nonnegative with at most two decimals");
      values[field] = n;
    } else if (field === "is_active") {
      if (typeof value !== "boolean") throw new AppError(400, "is_active must be boolean");
      values[field] = value;
    } else if (field === "release_date") {
      values[field] = validDate(value, field);
    } else {
      if (typeof value !== "string" || !value.trim() || value.length > (field === "season_title" || field === "episode_title" ? 150 : 100)) {
        throw new AppError(400, `Invalid ${field}`);
      }
      values[field] = value.trim();
    }
  }

  if (!Object.keys(values).length) throw new AppError(400, "No editable fields supplied");
  if (create) for (const field of config.required) if (values[field] === undefined) throw new AppError(400, `${field} is required`);
  if (values.listing_status && !["active", "sold_out", "removed"].includes(String(values.listing_status))) throw new AppError(400, "Invalid listing status");
  if (values.status && !["pending", "in_progress", "resolved", "closed"].includes(String(values.status))) throw new AppError(400, "Invalid feedback status");

  return values;
}

export function databaseError(error: { code?: string; message?: string }) {
  if (error.code === "23503") throw new AppError(409, "This record is linked to other records. Remove or reassign those links first.");
  if (error.code === "23505") throw new AppError(409, "A record with these values already exists.");
  throw error;
}

async function checkParent(name: ManagedName, values: ManagedRow) {
  if (name === "seasons" && values.content_id) {
    const { data, error } = await supabase.from("content").select("type,deleted_at").eq("content_id", values.content_id).maybeSingle();
    if (error) throw error;
    if (!data || data.deleted_at || String(data.type).toLowerCase() !== "series") throw new AppError(400, "Seasons must belong to an existing TV series");
  }
  if (name === "episodes" && values.season_id) {
    const { data, error } = await supabase.from("season").select("season_id").eq("season_id", values.season_id).maybeSingle();
    if (error) throw error;
    if (!data) throw new AppError(400, "Select an existing season");
  }
}

export const managementRouter = Router();

managementRouter.get("/management", async (_req, res, next) => {
  try {
    const result: Record<string, unknown> = {};
    for (const [key, config] of Object.entries(managed)) result[key] = await allRows(config.table, "*", config.id);
    result.archived = await allRows("content", "content_id,title,type,deleted_at", "content_id").then(rows => rows.filter(row => row.deleted_at));
    res.json(result);
  } catch (error) { next(error); }
});

managementRouter.patch("/content/:id/restore", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("content").update({ deleted_at: null }).eq("content_id", parseId(String(req.params.id))).select("content_id").maybeSingle();
    if (error) throw error;
    if (!data) throw new AppError(404, "Content not found");
    res.json(data);
  } catch (error) { next(error); }
});

managementRouter.post("/subscriptions", async (req, res, next) => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new AppError(400, "Invalid subscription");
    const user = parseId(String(body.subscription_user_id), "subscription_user_id");
    const plan = parseId(String(body.plan_id), "plan_id");
    const start = validDate(body.start_date, "start_date");
    const end = validDate(body.end_date, "end_date");
    if (end < start) throw new AppError(400, "Expiry must be on or after start");
    if (!["active", "cancelled"].includes(String(body.status))) throw new AppError(400, "Status must be active or cancelled");
    const today = new Date().toISOString().slice(0, 10);
    if (body.status === "active" && (start > today || end < today)) throw new AppError(400, "Active subscriptions must be within their start and expiry dates");
    const { data: planRow, error: planError } = await supabase.from("plans").select("is_active").eq("plan_id", plan).maybeSingle();
    if (planError) throw planError;
    if (!planRow?.is_active) throw new AppError(400, "Select an active plan");
    const { data: userRow, error: userError } = await supabase.from("users").select("account_status,deleted_at").eq("user_id", user).maybeSingle();
    if (userError) throw userError;
    if (!userRow || userRow.deleted_at || userRow.account_status !== "active") throw new AppError(400, "Select an active user");
    const { data, error } = await supabase.from("subscriptions").insert({ subscription_user_id: user, plan_id: plan, start_date: start, end_date: end, status: body.status }).select("*").single();
    if (error) databaseError(error);
    res.status(201).json(data);
  } catch (error) { next(error); }
});

managementRouter.post("/:resource", async (req, res, next) => {
  const name = String(req.params.resource) as ManagedName;
  if (!managed[name]) return next();
  try {
    if (!["seasons", "episodes", "plans", "products"].includes(name)) throw new AppError(405, "Records are created through the user application");
    const values = validateManaged(name, req.body, true);
    await checkParent(name, values);
    const { data, error } = await supabase.from(managed[name].table).insert(values).select("*").single();
    if (error) databaseError(error);
    res.status(201).json(data);
  } catch (error) { next(error); }
});

managementRouter.patch("/:resource/:id", async (req, res, next) => {
  const name = String(req.params.resource) as ManagedName;
  if (!managed[name]) return next();
  try {
    const values = validateManaged(name, req.body, false);
    await checkParent(name, values);
    const { data, error } = await supabase.from(managed[name].table).update(values).eq(managed[name].id, parseId(String(req.params.id))).select("*").maybeSingle();
    if (error) databaseError(error);
    if (!data) throw new AppError(404, "Record not found");
    res.json(data);
  } catch (error) { next(error); }
});

managementRouter.delete("/:resource/:id", async (req, res, next) => {
  const name = String(req.params.resource) as ManagedName;
  if (!managed[name]) return next();
  try {
    if (!["seasons", "episodes", "reviews", "products"].includes(name)) throw new AppError(405, "Deactivate this record instead of deleting it");
    const id = parseId(String(req.params.id));
    const { data, error } = name === "products"
      ? await supabase.from(managed[name].table).update({ listing_status: "removed" }).eq(managed[name].id, id).select(managed[name].id)
      : await supabase.from(managed[name].table).delete().eq(managed[name].id, id).select(managed[name].id);
    if (error) databaseError(error);
    if (!data?.length) throw new AppError(404, "Record not found");
    res.json({ deleted: true });
  } catch (error) { next(error); }
});
