import { useCallback, useEffect, useMemo, useState } from "react";
import {apiRequest} from "@/services/api-client";
import { supabase } from "@/lib/supabase";
import { backendAsset } from "@/lib/backend-asset";
import { getBootstrap, type BootstrapData } from "@/services/bootstrap.service";
import { createFavorite, deleteFavorite } from "@/services/favorite.service";
import { addWatchList, deleteWatchList } from "@/services/watch-list.service";
import { createReview, updateReview } from "@/services/review.service";
import { saveViewProgress } from "@/services/view-history.service";
import { createFeedback } from "@/services/feedback.service";
import { createSubscription } from "@/services/subscription.service";
import { createProfile, deleteProfile } from "@/services/profile.service";
import { createTransaction, getTransactions, type MerchandiseTransaction } from "@/services/merchandise.service";
import { getSeasonsByContent, type Season } from "@/services/season.service";
import { getEpisodesBySeason, type Episode } from "@/services/episode.service";
import { notify } from "../utils";
import type { AppNotification, AuthStage, BackendPlan, Content, FooterPanel, MerchProduct, RegisteredAccount, Transaction, View, ViewerProfile } from "../types";


function mapContent(item: BootstrapData["content"][number]): Content {
  const releaseYear = Number(item.release_date?.slice(0, 4)) || new Date().getFullYear();
  return {
    id: item.content_id,
    title: item.title,
    type: item.type.toLowerCase() === "series" ? "Series" : "Movie",
    year: releaseYear,
    rating: Number(item.rating ?? 0),
    reviewCount: Number(item.review_count ?? 0),
    genre: item.genre_name ?? "Uncategorized",
    poster: backendAsset(item.poster_url),
    preview: backendAsset(item.preview_url),
    hero: backendAsset(item.hero_url ?? item.preview_url ?? item.poster_url),
    description: item.description || item.synopsis,
    synopsis: item.synopsis,
    cast: item.cast ? item.cast.split(",").map((name) => name.trim()).filter(Boolean) : [],
    progress: 0,
    maturity: item.age_rating,
    duration: item.duration_label ?? "—",
    license: item.licensor_name ?? "License information unavailable",
    licenseExpiration: item.license_expiration,
    director: item.director,
    isFeatured: item.is_featured,
    videoUrl: item.video_url ? backendAsset(item.video_url) : undefined,
    trailerUrl: item.trailer_url ? backendAsset(item.trailer_url) : undefined,
  };
}

function mapProfile(item: BootstrapData["profiles"][number]): ViewerProfile {
  const initials = item.profile_name.trim().split(/\\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";
  return {
    id: String(item.profile_id),
    backendId: item.profile_id,
    name: item.profile_name,
    image: backendAsset(item.avatar_url),
    initials,
    addedAt: new Date(item.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    deviceType: item.device?.split(" • ")[0] ?? "Device",
    deviceName: item.device?.split(" • ").slice(1).join(" • ") || item.device || "Registered device",
    colors: "from-blue-500 via-cyan-400 to-indigo-700",
    isKids: item.profile_name.toLowerCase().includes("kid"),
  };
}

function mapPlan(item: BootstrapData["plans"][number]): BackendPlan {
  return {
    id: String(item.plan_id),
    backendId: item.plan_id,
    name: item.plan_name,
    price: Number(item.monthly_price),
    memberText: `${item.max_members} simultaneous member${item.max_members === 1 ? "" : "s"}`,
    quality: item.quality,
  };
}

function mapProduct(item: BootstrapData["products"][number]): MerchProduct {
  const status = item.listing_status === "active" ? undefined : "sold-out";
  return {
    id: String(item.product_id),
    name: item.product_name,
    category: item.category,
    price: Number(item.price),
    image: backendAsset(item.image_url),
    stockStatus: status === "sold-out" || item.stock_label?.toLowerCase().includes("sold out") ? "sold-out" : item.stock_label ? "low" : undefined,
    stock:item.stock,description:item.description,variants:item.variants,
    stockLabel: item.stock_label ?? (status === "sold-out" ? "Sold out" : undefined),
  };
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function useStreamFlix() {
  const [authStage, setAuthStage] = useState<AuthStage>("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [account, setAccount] = useState<RegisteredAccount>({ name: "", email: "", phone: "", dateOfBirth: "" });
  const [registeredName, setRegisteredName] = useState("");
  const [profiles, setProfiles] = useState<ViewerProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<ViewerProfile | null>(null);
  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState<Content | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([]);
  const [selectedEpisodes, setSelectedEpisodes] = useState<Episode[]>([]);
  const [playbackUrl,setPlaybackUrl]=useState<string|null>(null);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [watchOpen, setWatchOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [footerPanel, setFooterPanel] = useState<FooterPanel>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoriteDates, setFavoriteDates] = useState<Record<number, string>>({});
  const [favoriteRows, setFavoriteRows] = useState<BootstrapData["favorites"]>([]);
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [watchlistDates, setWatchlistDates] = useState<Record<number, string>>({});
  const [watchlistRows, setWatchlistRows] = useState<BootstrapData["watchlist"]>([]);
  const [historyRows, setHistoryRows] = useState<BootstrapData["history"]>([]);
  const [myReviews, setMyReviews] = useState<BootstrapData["myReviews"]>([]);
  const [catalog, setCatalog] = useState<Content[]>([]);
  const [plans, setPlans] = useState<BackendPlan[]>([]);
  const [products, setProducts] = useState<MerchProduct[]>([]);
  const [subscriptions, setSubscriptions] = useState<BootstrapData["subscriptions"]>([]);
  const [activeSubscription, setActiveSubscription] = useState<BootstrapData["activeSubscription"]>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [plan, setPlan] = useState("");

  const refreshBootstrap = useCallback(async (keepStage = true) => {
    const data = await getBootstrap();
    const mappedCatalog = data.content.map(mapContent);
    const history = data.history ?? [];
    const progressByContent = new Map<number, { at: number; progress: number }>();
    for (const row of history) {
      const at = new Date(row.watch_date).getTime();
      const existing = progressByContent.get(row.content_id);
      if (!existing || at >= existing.at) progressByContent.set(row.content_id, { at, progress: Number(row.progress_percentage) || 0 });
    }
    for (const item of mappedCatalog) item.progress = progressByContent.get(item.id)?.progress ?? 0;

    const mappedProfiles = data.profiles.map(mapProfile);
    setCatalog(mappedCatalog);
    setProfiles(mappedProfiles);
    setAccount({ name: data.user.full_name, email: data.user.email, phone: data.user.phone_number ?? "", dateOfBirth: data.user.date_of_birth ?? "" });
    setRegisteredName(data.user.full_name);
    setFavorites(data.favorites.map((row) => row.content_id));
    setFavoriteRows(data.favorites);
    setFavoriteDates(Object.fromEntries(data.favorites.map((row) => [row.content_id, row.date_added])));
    setWatchlist(data.watchlist.map((row) => row.content_id));
    setWatchlistRows(data.watchlist);
    setWatchlistDates(Object.fromEntries(data.watchlist.map((row) => [row.content_id, row.date_added])));
    setHistoryRows(history);
    setMyReviews(data.myReviews);
    setPlans(data.plans.filter((item) => item.is_active).map(mapPlan));
    setProducts(data.products.map(mapProduct));
    setSubscriptions(data.subscriptions);
    setActiveSubscription(data.activeSubscription);
    setPlan(data.activePlan ? String(data.activePlan.plan_id) : "");
    if (!keepStage) return data;
    const savedProfileId = localStorage.getItem("streamflix-active-profile");
    const saved = mappedProfiles.find((item) => String(item.backendId) === savedProfileId);
    if (saved) setActiveProfile(saved);
    if (saved) setAuthStage("app");
    else if (data.activeSubscription?.status === "active") setAuthStage("profiles");
    else setAuthStage("plans");
    return data;
  }, []);

  useEffect(() => {
    let mounted = true;
    async function initialize(sessionExists: boolean) {
      if (!sessionExists || !mounted) {
        setAuthStage("login");
        return;
      }
      try {
        setAuthBusy(true);
        setAuthError("");
        await refreshBootstrap();
      } catch (error) {
        if (mounted) { setAuthStage("login"); setAuthError(error instanceof Error ? error.message : "Unable to load StreamFlix."); }
      } finally { if (mounted) setAuthBusy(false); }
    }
    void supabase.auth.getSession().then(({ data }) => initialize(Boolean(data.session)));
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") { setActiveProfile(null); setAuthStage("login"); setCatalog([]); return; }
      if (session) void initialize(true);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [refreshBootstrap]);

  useEffect(() => {
    async function loadSeries() {
      if (!selected || selected.type !== "Series") { setSelectedSeasons([]); setSelectedEpisodes([]); return; }
      try {
        const seasons = await getSeasonsByContent(selected.id);
        setSelectedSeasons(seasons);
        const validSeason = seasons.find((item) => item.season_number === selectedSeason)?.season_number ?? seasons[0]?.season_number ?? 1;
        if (validSeason !== selectedSeason) setSelectedSeason(validSeason);
      } catch { setSelectedSeasons([]); setSelectedEpisodes([]); }
    }
    void loadSeries();
  }, [selected]);

  useEffect(() => {
    async function loadEpisodes() {
      const season = selectedSeasons.find((item) => item.season_number === selectedSeason);
      if (!season) { setSelectedEpisodes([]); return; }
      try { setSelectedEpisodes(await getEpisodesBySeason(season.season_id)); } catch { setSelectedEpisodes([]); }
    }
    void loadEpisodes();
  }, [selectedSeasons, selectedSeason]);

  const visibleCatalog = useMemo(() => {
    let result = catalog;
    if (view === "shows") result = result.filter((item) => item.type === "Series");
    if (view === "movies") result = result.filter((item) => item.type === "Movie");
    if (view === "new-releases") result = [...result].sort((a, b) => b.year - a.year || b.id - a.id);
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter((item) => `${item.title} ${item.genre} ${item.description} ${item.synopsis} ${item.director ?? ""} ${(item.cast ?? []).join(" ")}`.toLowerCase().includes(q));
    }
    return result;
  }, [catalog, query, view]);

  const favoriteItems = useMemo(() => catalog.filter((item) => favorites.includes(item.id)), [catalog, favorites]);
  const watchlistItems = useMemo(() => catalog.filter((item) => watchlist.includes(item.id)), [catalog, watchlist]);
  const continueWatching = useMemo(() => catalog.filter((item) => Number(item.progress) > 0 && Number(item.progress) < 100).sort((a, b) => Number(b.progress) - Number(a.progress)), [catalog]);
  const recentlyWatched = useMemo(() => {
    const seen = new Set<number>();
    const result: Content[] = [];
    for (const row of historyRows) { if (seen.has(row.content_id)) continue; const item = catalog.find((content) => content.id === row.content_id); if (item) { result.push(item); seen.add(row.content_id); } }
    return result;
  }, [catalog, historyRows]);
  const myList = useMemo(() => { const ids = new Set([...favorites, ...watchlist]); return catalog.filter((item) => ids.has(item.id)); }, [catalog, favorites, watchlist]);
  const cartItems = useMemo(() => products.filter((item) => (cart[item.id] ?? 0) > 0), [cart, products]);
  const cartCount = useMemo(() => Object.values(cart).reduce((sum, qty) => sum + qty, 0), [cart]);
  const total = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * (cart[item.id] ?? 0), 0), [cart, cartItems]);
  const featuredTitle = useMemo(() => catalog.find((item) => item.isFeatured) ?? catalog[0] ?? null, [catalog]);
  const sections = useMemo(() => [
    { title: "Trending Now", items: [...catalog].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount).slice(0, 12) },
    { title: "Popular Series", items: catalog.filter((item) => item.type === "Series").sort((a, b) => b.rating - a.rating) },
    { title: "Continue Watching", items: continueWatching },
    { title: "New Releases", items: [...catalog].sort((a, b) => b.year - a.year || b.id - a.id).slice(0, 12) },
  ], [catalog, continueWatching]);

  function recordMutation(_operation: string, message: string) { void notify("success", message); }

  async function login(email: string, password: string) {
    try { setAuthBusy(true); setAuthError(""); await supabase.auth.signInWithPassword({ email: email.trim(), password }); await refreshBootstrap(); } catch (error) { setAuthError(error instanceof Error ? error.message : "Login failed"); throw error; } finally { setAuthBusy(false); }
  }
  async function register(details: RegisteredAccount, password: string) {
    try {
      setAuthBusy(true); setAuthError("");
      const { data, error } = await supabase.auth.signUp({ email: details.email.trim(), password, options: { data: { full_name: details.name.trim(), phone: details.phone.trim() || null, date_of_birth: details.dateOfBirth || null } } });
      if (error) throw error;
      setAccount(details); setRegisteredName(details.name);
      if (!data.session) { setAuthError("Account created. Check your email to confirm your account, then sign in."); return false; }
      await refreshBootstrap();
      return true;
    } catch (error) { setAuthError(error instanceof Error ? error.message : "Registration failed"); throw error; } finally { setAuthBusy(false); }
  }
  async function loginWithGoogle() { setAuthError(""); const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/oauth/callback`, queryParams: { prompt: "select_account" } } }); if (error) { setAuthError(error.message); throw error; } }

  async function toggleFavorite(id: number) {
    try {
      const row = favoriteRows.find((item) => item.content_id === id);
      if (row) await deleteFavorite(row.fav_id); else await createFavorite(Number((await getBootstrap()).user.user_id), id);
      const data = await refreshBootstrap();
      recordMutation("ToggleFavorite", row ? "Removed from favorites" : "Added to favorites");
      return data;
    } catch (error) { recordMutation("ToggleFavoriteError", error instanceof Error ? error.message : "Unable to update favorites"); }
  }

  async function toggleWatchlist(id: number) {
    try {
      const row = watchlistRows.find((item) => item.content_id === id);
      if (row) await deleteWatchList(row.list_id); else await addWatchList(Number((await getBootstrap()).user.user_id), id);
      const data = await refreshBootstrap();
      recordMutation("ToggleWatchlist", row ? "Removed from Watchlist" : "Added to Watchlist");
      return data;
    } catch (error) { recordMutation("ToggleWatchlistError", error instanceof Error ? error.message : "Unable to update watchlist"); }
  }

  function openTitle(item: Content) { setSelected(item); setSelectedSeason(1); setSelectedEpisodeId(null); setReviewRating(0); setReviewComment(""); setDetailOpen(true); }
  async function play(item: Content, episodeId: number | null = null) {try{const result=await apiRequest<{url:string}>(`/content/${item.id}/playback`,{method:'POST',body:JSON.stringify(episodeId?{episode_id:episodeId}:{})});setPlaybackUrl(result.url);setSelected(item);setSelectedEpisodeId(episodeId);setDetailOpen(false);setWatchOpen(true);recordMutation("PlaybackStarted",`${item.title} playback started`);}catch(error){notify('info',error instanceof Error?error.message:'Please try again.');} }

  const updatePlaybackProgress = useCallback(async (contentId: number, progressPercentage: number, episodeId: number | null = null) => {
    const rounded = Math.max(0, Math.min(100, Math.round(progressPercentage)));
    try { await saveViewProgress(contentId, rounded, episodeId); setCatalog((current) => current.map((item) => item.id === contentId ? { ...item, progress: rounded } : item)); setHistoryRows((current) => { const idx = current.findIndex((row) => row.content_id === contentId && row.episode_id === episodeId); const row = { history_id: idx >= 0 ? current[idx].history_id : Date.now(), user_id: idx >= 0 ? current[idx].user_id : 0, content_id: contentId, episode_id: episodeId, watch_date: new Date().toISOString(), progress_percentage: rounded }; if (idx < 0) return [row, ...current]; const next = [...current]; next[idx] = row; return next; }); } catch { /* background progress save; playback stays usable */ }
  }, []);

  async function submitReview() {
    if (!selected || reviewRating < 1 || reviewRating > 5) return;
    try {
      const existing = myReviews.find((review) => review.content_id === selected.id);
      const review = existing ? await updateReview(existing.rev_id, reviewRating, reviewComment) : await createReview(selected.id, reviewRating, reviewComment);
      setMyReviews((current) => existing ? current.map((row) => row.rev_id === existing.rev_id ? review : row) : [review, ...current]);
      setCatalog((current) => current.map((item) => {
        if (item.id !== selected.id) return item;
        const oldCount = item.reviewCount;
        const newCount = existing ? oldCount : oldCount + 1;
        const oldTotal = item.rating * oldCount;
        const newTotal = existing ? oldTotal - existing.rating_value + review.rating_value : oldTotal + review.rating_value;
        return { ...item, reviewCount: newCount, rating: newCount ? Number((newTotal / newCount).toFixed(1)) : review.rating_value };
      }));
      setSelected((current) => current && current.id === selected.id ? { ...current, reviewCount: existing ? current.reviewCount : current.reviewCount + 1, rating: (() => { const count = current.reviewCount; const total = current.rating * count; const newCount = existing ? count : count + 1; const newTotal = existing ? total - existing.rating_value + review.rating_value : total + review.rating_value; return Number((newTotal / newCount).toFixed(1)); })() } : current);
      setReviewOpen(false); recordMutation("CreateReview", existing ? "Your review was updated" : "Your review was saved to StreamFlix");
    } catch (error) { recordMutation("CreateReviewError", error instanceof Error ? error.message : "Unable to save review"); }
  }

  async function submitFeedback(subject: string, message: string) { try { await createFeedback(subject, message); setFeedbackOpen(false); recordMutation("SubmitFeedback", "Feedback sent to the StreamFlix team"); } catch (error) { recordMutation("SubmitFeedbackError", error instanceof Error ? error.message : "Unable to send feedback"); } }

  async function selectPlan(planId: string) { const userData = await getBootstrap(); const newSubscription = await createSubscription(userData.user.user_id, Number(planId)); setActiveSubscription(newSubscription); setSubscriptions((current) => [newSubscription, ...current]); setPlan(String(newSubscription.plan_id)); setPlansOpen(false); setAuthStage("profiles"); recordMutation("ChangeSubscription", "Subscription activated from the StreamFlix backend"); await refreshBootstrap(); }

  async function addProfile(data: { name: string; deviceType: string; deviceName: string; avatarUrl: string }) { const boot = await getBootstrap(); const created = await createProfile(boot.user.user_id, { profile_name: data.name, avatar_url: data.avatarUrl, device: `${data.deviceType} • ${data.deviceName}` }); await refreshBootstrap(); recordMutation("CreateProfile", `${created.profile_name} profile added`); }
  async function removeProfile(profile: ViewerProfile) { await deleteProfile(profile.backendId); const wasActive = activeProfile?.backendId === profile.backendId; await refreshBootstrap(); if (wasActive) setActiveProfile(null); }

  async function checkout(paymentMethod: string, deliveryMethod: string) {
    const boot = await getBootstrap();
    const rows: MerchandiseTransaction[] = [];
    for (const item of cartItems) rows.push(await createTransaction(boot.user.user_id, Number(item.id), cart[item.id] ?? 1));
    const refreshed = await getTransactions(boot.user.user_id);
    const grouped = rows.map((row) => { const product = products.find((item) => item.id === String(row.product_id)); return { id: `SF-${row.transaction_id}`, items: [{ id: String(row.product_id), name: product?.name ?? `Product ${row.product_id}`, price: product?.price ?? Number(row.total_amount) / row.quantity, quantity: row.quantity }], total: Number(row.total_amount), createdAt: formatDate(row.created_at), paymentMethod, deliveryMethod, status: "Completed" as const }; });
    setTransactions(grouped.length ? grouped : refreshed.map((row) => { const product = products.find((item) => item.id === String(row.product_id)); return { id: `SF-${row.transaction_id}`, items: [{ id: String(row.product_id), name: product?.name ?? `Product ${row.product_id}`, price: product?.price ?? Number(row.total_amount) / row.quantity, quantity: row.quantity }], total: Number(row.total_amount), createdAt: formatDate(row.created_at), paymentMethod: "Backend record", deliveryMethod: "Standard delivery", status: "Completed" as const }; }));
    setCart({}); setCartOpen(false); recordMutation("CreateMerchandiseTransaction", "Order recorded in the StreamFlix database");
  }

  async function loadTransactions() { try { const boot = await getBootstrap(); const rows = await getTransactions(boot.user.user_id); setTransactions(rows.map((row) => { const product = products.find((item) => item.id === String(row.product_id)); return { id: `SF-${row.transaction_id}`, items: [{ id: String(row.product_id), name: product?.name ?? `Product ${row.product_id}`, price: product?.price ?? Number(row.total_amount) / row.quantity, quantity: row.quantity }], total: Number(row.total_amount), createdAt: formatDate(row.created_at), paymentMethod: "Backend record", deliveryMethod: "Standard delivery", status: "Completed" as const }; })); } catch { setTransactions([]); } }

  async function logout() { try { await supabase.auth.signOut(); } finally { setActiveProfile(null); setAuthStage("login"); } }
  function selectProfile(profile: ViewerProfile) { setActiveProfile(profile); localStorage.setItem("streamflix-active-profile", String(profile.backendId)); setAuthStage("app"); void notify("success", `Welcome, ${profile.name}`); }
  function navigate(next: View) { setView(next); setQuery(""); window.scrollTo({ top: 0, behavior: "smooth" }); }

  function setLocalCartQuantity(id: string, quantity: number) { setCart((items) => { const next = { ...items }; if (quantity <= 0) delete next[id]; else next[id] = quantity; return next; }); }

  const favoriteLabels: Record<number, string> = Object.fromEntries(favoriteItems.map((item) => [item.id, `Date Added: ${formatDate(favoriteDates[item.id])}`]));
  const watchlistLabels: Record<number, string> = Object.fromEntries(watchlistItems.map((item) => { const row = watchlistRows.find((entry) => entry.content_id === item.id); return [item.id, `${row?.watchlist_status ?? "planned"}\nDate Added: ${formatDate(watchlistDates[item.id])}`]; }));
  const recentlyWatchedLabels: Record<number, string> = Object.fromEntries(recentlyWatched.map((item) => { const row = historyRows.find((entry) => entry.content_id === item.id); return [item.id, row ? `${row.episode_id ? `Episode ${row.episode_id}` : "Movie"}\n${formatDate(row.watch_date)}` : item.title]; }));

  const currentPlan = plans.find((item) => item.id === plan) ?? (activeSubscription ? plans.find((item) => item.backendId === activeSubscription.plan_id) : undefined);

  return {
    authStage, setAuthStage, authBusy, authError, setAuthError, login, register, loginWithGoogle,
    registeredName, setRegisteredName, account, setAccount, profiles, setProfiles, activeProfile, setActiveProfile,
    view, setView, query, setQuery, searchOpen, setSearchOpen, selected, setSelected, selectedSeason, setSelectedSeason,
    playbackUrl,selectedSeasons, selectedEpisodes, selectedEpisodeId, detailOpen, setDetailOpen, watchOpen, setWatchOpen, reviewOpen, setReviewOpen,
    reviewRating, setReviewRating, reviewComment, setReviewComment, feedbackOpen, setFeedbackOpen, plansOpen, setPlansOpen,
    accountOpen, setAccountOpen, cartOpen, setCartOpen, footerPanel, setFooterPanel, favorites, watchlist, cart, setCart,
    notifications, setNotifications, transactions, setTransactions, plan, setPlan, plans, products, activeSubscription, currentPlan,
    visibleCatalog, myList, continueWatching, favoriteItems, watchlistItems, recentlyWatched, favoriteLabels, watchlistLabels,
    recentlyWatchedLabels, myReviews, cartItems, cartCount, total, sections, homeSections: sections, featuredTitle, refreshBootstrap, recordMutation, openTitle, play,
    contentLoading: false, contentError: "",
    toggleFavorite, toggleWatchlist, updatePlaybackProgress, submitReview, submitFeedback, selectPlan, addProfile, removeProfile,
    checkout, loadTransactions, setLocalCartQuantity, logout, selectProfile, navigate,
  };
}

export type StreamFlixController = ReturnType<typeof useStreamFlix>;
