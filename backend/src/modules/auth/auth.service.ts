import type { Request } from "express";
import { supabase } from "../../config/supabase.js";
import { AppError } from "../../utils/errors.js";
import { getAuthContext } from "../../utils/ownership.js";
import { listCatalog } from "../content/content.service.js";
import { listGenres } from "../genres/genre.service.js";
import { getPlans } from "../subscriptions/subscription.service.js";
import { listProducts } from "../merchandise/merchandise.service.js";

export async function ensureAppUser(req: Request) {
  const auth = getAuthContext(req);
  if (!auth.email) throw new AppError(403, "Authenticated user has no email address");

  const columns = "user_id, auth_user_id, full_name, email, phone_number, date_of_birth, account_status, created_at, updated_at, deleted_at";
  let { data: existing, error: existingError } = await supabase
    .from("users")
    .select(columns)
    .eq("auth_user_id", auth.authUserId)
    .maybeSingle();
  if (existingError) throw existingError;

  if (!existing) {
    const byEmail = await supabase
      .from("users")
      .select(columns)
      .eq("email", auth.email)
      .maybeSingle();
    if (byEmail.error) throw byEmail.error;
    existing = byEmail.data;
    if (existing && existing.auth_user_id && existing.auth_user_id !== auth.authUserId) {
      throw new AppError(403, "This StreamFlix account is linked to a different authentication identity");
    }
    if (existing && !existing.auth_user_id) {
      const linked = await supabase
        .from("users")
        .update({ auth_user_id: auth.authUserId })
        .eq("user_id", existing.user_id)
        .is("auth_user_id", null)
        .select(columns)
        .single();
      if (linked.error) throw linked.error;
      existing = linked.data;
    }
  }

  if (existing) return existing;

  const authUser = (await supabase.auth.admin.getUserById(auth.authUserId)).data.user;
  const fullName = String(authUser?.user_metadata?.full_name ?? authUser?.user_metadata?.name ?? auth.email.split("@")[0]).trim().slice(0, 100) || "StreamFlix User";
  const phone = typeof authUser?.user_metadata?.phone === "string" ? authUser.user_metadata.phone : null;
  const dob = typeof authUser?.user_metadata?.date_of_birth === "string" ? authUser.user_metadata.date_of_birth : null;

  const { data, error } = await supabase
    .from("users")
    .insert({ auth_user_id: auth.authUserId, full_name: fullName, email: auth.email, phone_number: phone, date_of_birth: dob, account_status: "active" })
    .select(columns)
    .single();
  if (error) {
    if (error.code === "23505") {
      const { data: retry, error: retryError } = await supabase.from("users").select(columns).eq("auth_user_id", auth.authUserId).single();
      if (retryError) throw retryError;
      return retry;
    }
    throw error;
  }
  return data;
}

export async function getCurrentUser(req: Request) {
  return ensureAppUser(req);
}

export async function bootstrap(req: Request) {
  const user = await ensureAppUser(req);
  const [{ data: profiles, error: profilesError }, { data: favorites, error: favoritesError }, { data: watchlist, error: watchlistError }, { data: history, error: historyError }, { data: subscriptions, error: subscriptionsError }, { data: myReviews, error: reviewsError }, { data: notifications, error: notificationsError }, content, genres, plans, products] = await Promise.all([
    supabase.from("profiles").select("profile_id, user_id, profile_name, avatar_url, device, created_at").eq("user_id", user.user_id).order("profile_id"),
    supabase.from("favorites").select("fav_id, user_id, content_id, date_added").eq("user_id", user.user_id).order("date_added", { ascending: false }),
    supabase.from("watch_list").select("list_id, user_id, content_id, episode_id, progress, date_added, watchlist_status").eq("user_id", user.user_id).order("date_added", { ascending: false }),
    supabase.from("view_history").select("history_id, user_id, content_id, episode_id, watch_date, progress_percentage").eq("user_id", user.user_id).order("watch_date", { ascending: false }),
    supabase.from("subscriptions").select("subscription_id, subscription_user_id, plan_id, start_date, end_date, status, created_at").eq("subscription_user_id", user.user_id).order("created_at", { ascending: false }),
    supabase.from("review").select("rev_id, user_id, content_id, rating_value, review_comment, review_date").eq("user_id", user.user_id).order("review_date", { ascending: false }),
    supabase.from("notifications").select("notification_id, user_id, type, title, message, is_read, created_at").eq("user_id", user.user_id).order("created_at", { ascending: false }).limit(30),
    listCatalog(),
    listGenres(),
    getPlans(),
    listProducts(),
  ]);
  if (profilesError) throw profilesError;
  if (favoritesError) throw favoritesError;
  if (watchlistError) throw watchlistError;
  if (historyError) throw historyError;
  if (subscriptionsError) throw subscriptionsError;
  if (reviewsError) throw reviewsError;
  if (notificationsError && notificationsError.code !== "42P01") throw notificationsError;

  const today = new Date().toISOString().slice(0, 10);
  const activeSubscription = (subscriptions ?? []).find((subscription) => subscription.status === "active" && (!subscription.end_date || subscription.end_date >= today)) ?? null;
  const activePlan = activeSubscription ? (plans ?? []).find((plan) => plan.plan_id === activeSubscription.plan_id) ?? null : null;
  const featured = content[0] ?? null;

  return {
    auth: { auth_user_id: getAuthContext(req).authUserId, email: getAuthContext(req).email },
    user, profiles: profiles ?? [], favorites: favorites ?? [], watchlist: watchlist ?? [], history: history ?? [], subscriptions: subscriptions ?? [], myReviews: myReviews ?? [], notifications: notifications ?? [],
    activeSubscription, activePlan, content, genres, plans, products, featured,
  };
}
