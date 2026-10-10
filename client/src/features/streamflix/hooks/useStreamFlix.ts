import {isKidsSuitable} from "../kids-policy";
import {cartKey,readCart,writeCart,subtractPurchased,type ProfileCart} from "../profile-commerce";
import {subscribeChanges} from '@/services/change-events';
import {orderStatus} from "@/services/merchandise.service";
import {apiRequest,ApiError} from "@/services/api-client";
import {PLAYER_EVENT} from "@/features/movies/utils/trailer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { supabase } from "@/lib/supabase";
import { backendAsset } from "@/lib/backend-asset";
import { getBootstrap, type BootstrapData } from "@/services/bootstrap.service";
import { createFavorite, deleteFavorite } from "@/features/favorites/services/favorite.service";
import { addWatchList, deleteWatchList } from "@/features/watchlist/services/watch-list.service";
import { createReview, updateReview } from "@/features/reviews/services/review.service";
import { saveViewProgress } from "@/features/player/services/view-history.service";
import { createFeedback } from "@/services/feedback.service";
import { createProfile, deleteProfile, updateProfile } from "@/features/profiles/services/profile.service";
import { createMerchandiseCardCheckout, createMerchandiseCodOrder, getMerchandiseCardCheckoutStatus } from "@/services/payment.service";
import { getTransactions } from "@/services/merchandise.service";
import { getSeasonsByContent, type Season } from "@/services/season.service";
import { getEpisodesBySeason, type Episode } from "@/services/episode.service";
import { markAllNotificationsRead, markNotificationRead } from "@/features/notifications/services/notification.service";
import { getRecommendations, type RecommendationResponse } from "@/features/recommendations/services/recommendation.service";
import { trackVisitor } from "@/services/visitor.service";
import { notify } from "../utils";
import type {
  AppNotification,
  AuthStage,
  BackendPlan,
  Content,
  FooterPanel,
  MerchProduct,
  RegisteredAccount,
  Transaction,
  View,
  ViewerProfile,
  SubscriptionReceipt,
} from "../types";

function mapContent(item: BootstrapData["content"][number]): Content {
  const releaseYear =
    Number(item.release_date?.slice(0, 4)) || new Date().getFullYear();

  return {
    id: item.content_id,
    title: item.title.trim(),
    weeklyViews: item.weekly_views ?? 0,
    isFeatured: item.is_featured ?? false,
    type: String(item.type).toLowerCase() === "series" ? "Series" : "Movie",
    year: releaseYear,
    rating: Number(item.rating ?? 0),
    reviewCount: Number(item.review_count ?? 0),
    genre: item.genre_name ?? "Uncategorized",
    poster: backendAsset(item.title.trim() === "Minions and Monsters" ? "/streamflix/titles/minions-and-monsters.webp" : item.poster_url),
    preview: backendAsset(item.title.trim() === "Minions and Monsters" ? "/streamflix/titles/minions-and-monsters-preview.webp" : item.preview_url),
    hero: backendAsset(
      item.title.trim() === "Minions and Monsters" ? "/streamflix/titles/minions-and-monsters-preview.webp" : item.hero_url ?? item.preview_url ?? item.poster_url
    ),
    description: item.description || item.synopsis,
    synopsis: item.synopsis,
    cast: item.cast
      ? item.cast
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean)
      : [],
    progress: 0,
    maturity: item.age_rating,
    kidsApproved: item.is_kids_suitable,
    duration: item.duration_label ?? "—",
    license: item.licensor_name ?? "License information unavailable",
    licenseExpiration: item.license_expiration,
    director: item.director,
    trailerUrl: item.trailer_url
      ? backendAsset(item.trailer_url)
      : undefined,
  };
}

function mapProfile(item: BootstrapData["profiles"][number]): ViewerProfile {
  const initials =
    item.profile_name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return {
    id: String(item.profile_id),
    backendId: item.profile_id,
    name: item.profile_name,
    image: backendAsset(item.avatar_url),
    initials,
    addedAt: new Date(item.created_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    deviceType: item.device?.split(" • ")[0] ?? "Device",
    deviceName:
      item.device?.split(" • ").slice(1).join(" • ") ||
      item.device ||
      "Registered device",
    colors: "from-blue-500 via-cyan-400 to-indigo-700",
    isKids: item.is_kids === true,
  };
}

function mapPlan(item: BootstrapData["plans"][number]): BackendPlan {
  return {
    id: String(item.plan_id),
    backendId: item.plan_id,
    name: item.plan_name,
    price: Number(item.monthly_price),
    maxMembers: Number(item.max_members),
    memberText: `${item.max_members} simultaneous member${
      item.max_members === 1 ? "" : "s"
    }`,
    quality: item.quality,
  };
}

function mapProduct(item: BootstrapData["products"][number]): MerchProduct {
  const status = item.listing_status === "active" ? undefined : "sold-out";
  const stock = Number(item.stock_quantity ?? item.stock ?? 0);

  return {
    id: String(item.product_id),
    name: item.product_name,
    category: item.category,
    price: Number(item.price),
    image: backendAsset(item.image_url),
    stockStatus: status === "sold-out" || stock <= 0 ? "sold-out" : stock <= 5 ? "low" : undefined,
    stockLabel: status === "sold-out" || stock <= 0 ? "Sold out" : stock <= 5 ? `${stock} left` : `${stock} in stock`,
    stockQuantity: stock,
  };
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function useStreamFlix() {
  const progressSaveWarned=useRef(false);
  const [authStage, setAuthStage] = useState<AuthStage>("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [account, setAccount] = useState<RegisteredAccount>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });

  const [registeredName, setRegisteredName] = useState("");
  const [profiles, setProfiles] = useState<ViewerProfile[]>([]);
  const [activeProfile, setActiveProfile] =
    useState<ViewerProfile | null>(null);

  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState<Content | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([]);
  const [selectedEpisodes, setSelectedEpisodes] = useState<Episode[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] =
    useState<number | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [watchOpen, setWatchOpen] = useState(false);
  const [playbackBusy, setPlaybackBusy] = useState(false);
  const playbackPending = useRef(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [footerPanel, setFooterPanel] = useState<FooterPanel>(null);

  const progressWrites = useRef(new Map<string, Promise<Awaited<ReturnType<typeof saveViewProgress>>>>());
  const listRevision = useRef(0);
  const favoritePending = useRef(new Set<string>());
  const watchlistPending = useRef(new Set<string>());
  const [allFavoriteRows, setFavoriteRows] = useState<BootstrapData["favorites"]>([]);
  const [allWatchlistRows, setWatchlistRows] = useState<BootstrapData["watchlist"]>([]);
  const favoriteRows = allFavoriteRows.filter(row => row.user_id === currentUserId && row.profile_id === activeProfile?.backendId);
  const watchlistRows = allWatchlistRows.filter(row => row.user_id === currentUserId && row.profile_id === activeProfile?.backendId);
  const favorites = favoriteRows.map(row => row.content_id);
  const watchlist = watchlistRows.map(row => row.content_id);
  const favoriteDates = Object.fromEntries(favoriteRows.map(row => [row.content_id, row.date_added]));
  const watchlistDates = Object.fromEntries(watchlistRows.map(row => [row.content_id, row.date_added]));

  const [allHistoryRows, setHistoryRows] =
    useState<BootstrapData["history"]>([]);
  const [myReviews, setMyReviews] =
    useState<BootstrapData["myReviews"]>([]);

  const [baseCatalog, setCatalog] = useState<Content[]>([]);
  const historyRows = useMemo(() => allHistoryRows.filter(row => row.profile_id === activeProfile?.backendId), [allHistoryRows, activeProfile?.backendId]);
  const catalog = useMemo(() => {
    const progress = new Map<number, {at: number; value: number}>();
    for (const row of historyRows) {
      const at = new Date(row.watch_date).getTime();
      if (!progress.has(row.content_id) || at >= progress.get(row.content_id)!.at) progress.set(row.content_id, {at, value: Number(row.progress_percentage)});
    }
    return baseCatalog.filter(item => !activeProfile?.isKids || isKidsSuitable(item.maturity,item.kidsApproved)).map(item => ({...item, progress: progress.get(item.id)?.value ?? 0}));
  }, [baseCatalog, historyRows, activeProfile?.isKids]);
  const activeProfileIdRef = useRef<number | null>(null);
  activeProfileIdRef.current = activeProfile?.backendId ?? null;
  const [playbackProfileId, setPlaybackProfileId] = useState<number | null>(null);
  const [plans, setPlans] = useState<BackendPlan[]>([]);
  const [products, setProducts] = useState<MerchProduct[]>([]);

  const [subscriptions, setSubscriptions] =
    useState<BootstrapData["subscriptions"]>([]);
  const [activeSubscription, setActiveSubscription] =
    useState<BootstrapData["activeSubscription"]>(null);

  const [allTransactions, setTransactions] = useState<Transaction[]>([]);
  const transactions = allTransactions.filter(row=>row.userId===currentUserId && row.profileId===activeProfile?.backendId);
  const [profileCarts,setProfileCarts] = useState<Record<string,ProfileCart>>({});
  const commerceKey = currentUserId && activeProfile ? cartKey(currentUserId,activeProfile.backendId) : null;
  const cart = useMemo(()=>commerceKey ? profileCarts[commerceKey] ?? readCart(commerceKey) : {},[commerceKey,profileCarts]);
  const updateProfileCart = useCallback((key:string,update:ProfileCart|((value:ProfileCart)=>ProfileCart))=>{
    const stored=readCart(key);
    setProfileCarts(previous=>{const before=previous[key]??stored;const next=typeof update==='function'?update(before):update;return {...previous,[key]:next};});
  },[]);
  useEffect(()=>{for(const [key,value] of Object.entries(profileCarts))writeCart(key,value);},[profileCarts]);
  const setCart = useCallback((update:ProfileCart|((value:ProfileCart)=>ProfileCart))=>{
    if(commerceKey)updateProfileCart(commerceKey,update);
  },[commerceKey,updateProfileCart]);
  const [allNotifications, setNotifications] = useState<BootstrapData["notifications"]>([]);
  const notificationRevision = useRef(0);
  const notificationPending = useRef(0);
  const notifications: AppNotification[] = allNotifications
    .filter(item => item.user_id === currentUserId && item.profile_id === activeProfile?.backendId)
    .map(item => ({ id: String(item.notification_id), backendId: item.notification_id, title: item.title, message: item.message, time: formatDate(item.created_at), unread: !item.is_read, type: item.type }));
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState("");
  const [plan, setPlan] = useState("");

  const refreshBootstrap = useCallback(
    async (keepStage = true) => {
      if(keepStage)setContentLoading(true);
      setContentError("");
      try {
        const requestListRevision=listRevision.current;
        const requestNotificationRevision=notificationRevision.current;
        const data = await getBootstrap();
      if (window.location.pathname === "/oauth/callback") {
        const url = new URL(window.location.href);
        window.history.replaceState({}, document.title, `/${url.search}`);
        window.scrollTo(0, 0);
      }

      const mappedCatalog = data.content.map(mapContent);
      const history = data.history ?? [];

      const mappedProfiles = data.profiles.map(mapProfile);

      setCurrentUserId(Number(data.user.user_id));
      setCatalog(mappedCatalog);
      setProfiles(mappedProfiles);

      setAccount({
        name: data.user.full_name,
        email: data.user.email,
        phone: data.user.phone_number ?? "",
        dateOfBirth: data.user.date_of_birth ?? "",
      });

      setRegisteredName(data.user.full_name);

      if(requestListRevision===listRevision.current && !favoritePending.current.size && !watchlistPending.current.size) {
      setFavoriteRows(data.favorites);
      setWatchlistRows(data.watchlist);
      }
      setHistoryRows(history);
      setMyReviews(data.myReviews);
      if (requestNotificationRevision === notificationRevision.current && !notificationPending.current) setNotifications(data.notifications ?? []);

      setPlans(
        data.plans
          .filter((item) => item.is_active)
          .map(mapPlan)
      );

      setProducts(data.products.map(mapProduct));
      setSubscriptions(data.subscriptions);
      setActiveSubscription(data.activeSubscription);

      const pendingPaymentRaw = localStorage.getItem(
        "streamflix-pending-payment"
      );
      let pendingPlanId = "";

      if (pendingPaymentRaw) {
        try {
          const pending = JSON.parse(pendingPaymentRaw) as {
            planId?: string; userId?: number; sessionId?: string;
          };
          pendingPlanId = pending.userId === data.user.user_id && pending.sessionId ? pending.planId ?? "" : "";
        } catch {
          localStorage.removeItem("streamflix-pending-payment");
        }
      }

      const savedSelectedPlan =
        localStorage.getItem("streamflix-selected-plan") ?? "";

      const restoredPlan =
        data.activePlan
          ? String(data.activePlan.plan_id)
          : pendingPlanId || savedSelectedPlan;

      setPlan(restoredPlan);

      if (!keepStage) {
        const savedId=localStorage.getItem("streamflix-active-profile");
        const current=mappedProfiles.find(item=>String(item.backendId)===savedId);
        setActiveProfile(current??null);
        if(!data.activeSubscription&&!new URLSearchParams(window.location.search).has("subscription_session_id")){setWatchOpen(false);setAuthStage("plans");}
        else if(!current&&data.activeSubscription){setWatchOpen(false);setAuthStage("profiles");}
        return data;
      }

      const subscriptionSessionId = new URLSearchParams(window.location.search).get("subscription_session_id");
      if (subscriptionSessionId) {
        setAuthStage("subscription-payment");
        return data;
      }

      const savedProfileId = localStorage.getItem(
        "streamflix-active-profile"
      );

      const saved = mappedProfiles.find(
        (item) =>
          String(item.backendId) === savedProfileId
      );

      if (saved && data.activeSubscription?.status === "active") {
        setActiveProfile(saved);
        setAuthStage("app");
      } else if (
        data.activeSubscription?.status === "active"
      ) {
        setAuthStage("profiles");
      } else if (pendingPlanId) {
        setAuthStage("subscription-payment");
      } else {
        setAuthStage("plans");
      }

        setContentError("");
        return data;
      } catch (error) {
        setContentError(error instanceof Error ? error.message : "Unable to load StreamFlix content.");
        if(error instanceof ApiError&&error.status===403){setAuthError(error.message);setWatchOpen(false);setActiveProfile(null);setCurrentUserId(null);setAuthStage("login");setCatalog([]);}
        throw error;
      } finally {
        setContentLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      if (!mounted) return;

      const explicitlyLoggedOut =
        localStorage.getItem(
          "streamflix-explicitly-logged-out"
        );

      if (explicitlyLoggedOut === "true") {
        setAuthStage("login");
        return;
      }

      try {
        setAuthBusy(true);
        setAuthError("");

        const {
          data,
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!data.session) {
          // Stripe returns to the same browser session. Give Supabase one
          // refresh attempt before ever sending a checkout return to login.
          const refreshed = await supabase.auth.refreshSession();
          if (refreshed.error || !refreshed.data.session) {
            const checkoutReturn =
              new URLSearchParams(window.location.search).has("merch_session_id") ||
              new URLSearchParams(window.location.search).has("subscription_session_id");

            if (checkoutReturn) {
              setAuthError("Your checkout completed, but the login session needs to be restored. Please wait and try again.");
              return;
            }

            setAuthStage("login");
            return;
          }
        }

        await refreshBootstrap();
      } catch (error) {
        if (mounted) {
          setAuthStage("login");
          setAuthError(
            error instanceof Error
              ? error.message
              : "Unable to load StreamFlix."
          );
        }
      } finally {
        if (mounted) {
          setAuthBusy(false);
        }
      }
    }

    void initialize();

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          localStorage.setItem(
            "streamflix-explicitly-logged-out",
            "true"
          );

          localStorage.removeItem(
            "streamflix-active-profile"
          );

          localStorage.removeItem(
            "streamflix-selected-plan"
          );

          localStorage.removeItem(
            "streamflix-pending-payment"
          );

          setActiveProfile(null);
          setCurrentUserId(null);
          setAuthStage("login");
          setCatalog([]);
          setProfiles([]);
          setPlans([]);
          setSubscriptions([]);
          setActiveSubscription(null);
          setPlan("");

          setAccount({
            name: "",
            email: "",
            phone: "",
            dateOfBirth: "",
          });

          return;
        }

        // The initial getSession() above is the single bootstrap entry point.
        // SIGNED_IN is handled by the explicit login/register flow and
        // TOKEN_REFRESHED must never refetch the entire application bootstrap.
        if (event === "TOKEN_REFRESHED" && !session) {
          setAuthStage("login");
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [refreshBootstrap]);

  useEffect(() => {
    if (!currentUserId) return;
    let pending = false,queued=false;
    const reload = async () => { if(document.hidden)return;if(pending){queued=true;return;}pending=true;try{await refreshBootstrap(false);}catch{/* Error is displayed by bootstrap. */}finally{pending=false;if(queued){queued=false;window.setTimeout(()=>void reload(),0);}} };
    window.addEventListener("focus", reload);
    const timer = window.setInterval(reload, 60000);
    let debounce:number|undefined;
    const unsubscribe=subscribeChanges(()=>{window.clearTimeout(debounce);debounce=window.setTimeout(()=>{void reload();void loadTransactions();},400);});
    return () => {unsubscribe();window.clearTimeout(debounce);window.removeEventListener("focus", reload);window.clearInterval(timer);};
  }, [currentUserId, activeProfile?.backendId, refreshBootstrap]);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("merch_session_id");
    if (!sessionId) return;

    let attempts = 0;
    let timer: number | undefined;
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      attempts += 1;

      try {
        let session = (await supabase.auth.getSession()).data.session;
        if (!session) {
          const refreshed = await supabase.auth.refreshSession();
          session = refreshed.data.session;
        }

        if (!session) {
          if (attempts < 15) {
            timer = window.setTimeout(poll, 2000);
          }
          return;
        }

        if (!currentUserId) return;
        const status = await getMerchandiseCardCheckoutStatus(
          currentUserId,
          sessionId,
        );

        await loadTransactions();

        if (status.fulfilled) {
          // Only clear the local bag after the backend confirms the Stripe
          // webhook created the order. This prevents losing a cart on an
          // abandoned/failed checkout.
          if(cancelled)return;
          const pendingKey=`streamflix-merch-checkout:${sessionId}`;
          try {
            const pending=JSON.parse(localStorage.getItem(pendingKey)||"null");
            if(pending && pending.userId===currentUserId && pending.profileId===status.profile_id) {
              updateProfileCart(cartKey(currentUserId,pending.profileId),before=>subtractPurchased(before,pending.items));
              localStorage.removeItem(pendingKey);
            }
          } catch { /* A missing checkout snapshot must not clear another profile's bag. */ }
          await refreshBootstrap(false);
          setAuthStage("app");
          window.history.replaceState({}, "", window.location.pathname);
          recordMutation(
            "MerchandisePaymentCompleted",
            "Merchandise payment confirmed and your stock was updated.",
          );
          return;
        }

        if (attempts < 15) {
          timer = window.setTimeout(poll, 2000);
        } else {
          window.history.replaceState({}, "", window.location.pathname);
          recordMutation(
            "MerchandisePaymentPending",
            status.paid
              ? "Payment received. Your order is still being finalized."
              : "Merchandise checkout was not completed.",
          );
        }
      } catch (error) {
        console.error("Merchandise checkout status error:", error);
        if (attempts < 15) {
          timer = window.setTimeout(poll, 2000);
        }
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [authStage, refreshBootstrap, currentUserId]);

  useEffect(() => {
    if (!products.length) return;

    setCart((current) => {
      const next: Record<string, number> = {};
      for (const product of products) {
        const quantity = current[product.id] ?? 0;
        if (quantity > 0) {
          next[product.id] = Math.min(quantity, product.stockQuantity);
        }
      }
      return next;
    });
  }, [products, setCart]);

  useEffect(() => {
    async function loadSeries() {
      if (!selected || selected.type !== "Series") {
        setSelectedSeasons([]);
        setSelectedEpisodes([]);
        return;
      }

      try {
        const seasons = await getSeasonsByContent(
          selected.id
        );

        setSelectedSeasons(seasons);

        const validSeason =
          seasons.find(
            (item) =>
              item.season_number === selectedSeason
          )?.season_number ??
          seasons[0]?.season_number ??
          1;

        if (validSeason !== selectedSeason) {
          setSelectedSeason(validSeason);
        }
      } catch {
        setSelectedSeasons([]);
        setSelectedEpisodes([]);
      }
    }

    void loadSeries();
  }, [selected]);

  useEffect(() => {
    async function loadEpisodes() {
      const season = selectedSeasons.find(
        (item) =>
          item.season_number === selectedSeason
      );

      if (!season) {
        setSelectedEpisodes([]);
        return;
      }

      try {
        setSelectedEpisodes(
          await getEpisodesBySeason(season.season_id)
        );
      } catch {
        setSelectedEpisodes([]);
      }
    }

    void loadEpisodes();
  }, [selectedSeasons, selectedSeason]);

  useEffect(() => {
    void trackVisitor().then((result) => setVisitorCount(Number.isFinite(result.uniqueVisitors) ? result.uniqueVisitors : null)).catch(() => undefined);
  }, []);

  const recommendationKey = [...new Set(historyRows.filter(row => Number(row.progress_percentage) > 0).map(row => Number(row.content_id)))].sort((a,b)=>a-b).join(',') + '|' + [...favorites].sort((a,b)=>a-b).join(',') + '|' + [...watchlist].sort((a,b)=>a-b).join(',');
  useEffect(() => {
    if (authStage !== "app" || !currentUserId || !activeProfile) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {void getRecommendations(activeProfile.backendId).then(data => {if (!cancelled) setRecommendations(data);}).catch(() => undefined);}, 350);
    return () => {cancelled = true; window.clearTimeout(timer);};
  }, [authStage, currentUserId, activeProfile?.backendId, recommendationKey, catalog]);



  const markNotificationsRead = useCallback(async () => {
    const profileId = activeProfile?.backendId;
    if (!profileId) return;
    const unreadIds = new Set(notifications.filter(item => item.unread).map(item => item.backendId));
    notificationRevision.current++; notificationPending.current++;
    setNotifications(current => current.map(item => unreadIds.has(item.notification_id) ? {...item, is_read: true} : item));
    try { await markAllNotificationsRead(profileId); recordMutation("NotificationsReadAll", "This profile’s notifications marked as read"); }
    catch (error) { setNotifications(current => current.map(item => unreadIds.has(item.notification_id) ? {...item, is_read: false} : item)); recordMutation("NotificationsReadAllError", error instanceof Error ? error.message : "Unable to mark notifications as read"); }
    finally { notificationRevision.current++; notificationPending.current--; }
  }, [notifications, activeProfile?.backendId]);

  const markNotification = useCallback(async (id: number) => {
    const profileId = activeProfile?.backendId;
    if (!profileId || !notifications.some(item => item.backendId === id && item.unread)) return;
    notificationRevision.current++; notificationPending.current++;
    setNotifications(current => current.map(item => item.notification_id === id ? {...item, is_read: true} : item));
    try { await markNotificationRead(id, profileId); recordMutation("NotificationRead", "Notification marked as read"); }
    catch (error) { setNotifications(current => current.map(item => item.notification_id === id ? {...item, is_read: false} : item)); recordMutation("NotificationReadError", error instanceof Error ? error.message : "Unable to mark notification as read"); }
    finally { notificationRevision.current++; notificationPending.current--; }
  }, [notifications, activeProfile?.backendId]);

  const visibleCatalog = useMemo(() => {
    let result = catalog;

    if (view === "shows") {
      result = result.filter(
        (item) => item.type === "Series"
      );
    }

    if (view === "movies") {
      result = result.filter(
        (item) => item.type === "Movie"
      );
    }

    if (view === "new-releases") {
      result = [...result].sort(
        (a, b) =>
          b.year - a.year || b.id - a.id
      );
    }

    if (query.trim()) {
      const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);

      result = result.filter((item) => {
        const haystack = `${item.title} ${item.genre} ${item.description} ${item.synopsis} ${item.director ?? ""} ${(item.cast ?? []).join(" ")}`.toLowerCase();
        return tokens.every((token) => haystack.includes(token));
      });
    }

    return result;
  }, [catalog, query, view]);

  useEffect(() => {
    if (!selected || (!detailOpen && !watchOpen)) return;
    const current = catalog.find(item => item.id === selected.id);
    if (!current) {
      setWatchOpen(false);setDetailOpen(false);setSelected(null);
      void notify('info','This title is no longer available in the catalog.');
    } else if (detailOpen) {
      setSelected(previous => previous?.id === current.id ? {...previous,...current} : previous);
    }
  }, [catalog, selected?.id, detailOpen, watchOpen]);

  const favoriteItems = useMemo(
    () =>
      catalog.filter((item) =>
        favorites.includes(item.id)
      ),
    [catalog, favorites]
  );

  const watchlistItems = useMemo(
    () =>
      catalog.filter((item) =>
        watchlist.includes(item.id)
      ),
    [catalog, watchlist]
  );

  const continueWatching = useMemo(() => {
    const latest = new Map<number, {at: number; progress: number}>();
    for (const row of historyRows) {
      const at = new Date(row.watch_date).getTime();
      if (!latest.has(row.content_id) || at >= latest.get(row.content_id)!.at)
        latest.set(row.content_id, {at, progress: Number(row.progress_percentage)});
    }
    return catalog.filter(item => {const progress = latest.get(item.id)?.progress ?? Number(item.progress); return progress > 0 && progress < 100;})
      .map(item => ({...item, progress: latest.get(item.id)?.progress ?? item.progress}))
      .sort((a,b) => (latest.get(b.id)?.at ?? 0) - (latest.get(a.id)?.at ?? 0));
  }, [catalog, historyRows]);

  const recentlyWatched = useMemo(() => {
    const seen = new Set<number>();
    const result: Content[] = [];

    for (const row of [...historyRows].filter(row=>Number(row.progress_percentage)>0).sort((a,b)=>new Date(b.watch_date).getTime()-new Date(a.watch_date).getTime() || b.history_id-a.history_id)) {
      if (seen.has(row.content_id)) continue;

      const item = catalog.find(
        (content) =>
          content.id === row.content_id
      );

      if (item) {
        result.push(item);
        seen.add(row.content_id);
      }
    }

    return result;
  }, [catalog, historyRows]);

  const myList = useMemo(() => {
    const ids = new Set([
      ...favorites,
      ...watchlist,
    ]);

    return catalog.filter((item) =>
      ids.has(item.id)
    );
  }, [catalog, favorites, watchlist]);

  const cartItems = useMemo(
    () =>
      products.filter(
        (item) => (cart[item.id] ?? 0) > 0
      ),
    [cart, products]
  );

  const cartCount = useMemo(
    () =>
      Object.values(cart).reduce(
        (sum, qty) => sum + qty,
        0
      ),
    [cart]
  );

  const total = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum +
          item.price *
            (cart[item.id] ?? 0),
        0
      ),
    [cart, cartItems]
  );

  const rankedCatalog = useMemo(() => {
    return [...catalog].sort((a, b) => {
      const scoreA = a.rating * 20 + Math.log1p(a.reviewCount) * 8 + a.year * 0.05;
      const scoreB = b.rating * 20 + Math.log1p(b.reviewCount) * 8 + b.year * 0.05;
      return (b.weeklyViews ?? 0) - (a.weeklyViews ?? 0) || scoreB - scoreA || b.id - a.id;
    });
  }, [catalog]);

  const topTenItems = useMemo(() => rankedCatalog.slice(0, 10), [rankedCatalog]);
  const featuredTitle = useMemo(() => catalog.find(item=>item.isFeatured) ?? rankedCatalog[0] ?? catalog[0] ?? null, [rankedCatalog, catalog]);

  const trendingNow = useMemo(() => {
    const watchedIds = new Set(continueWatching.map((item) => item.id));
    const score = (item: Content) => {
      const ageBoost = Math.max(0, item.year - 2020) * 1.4;
      const ratingBoost = item.rating * 18;
      const reviewBoost = Math.log1p(item.reviewCount) * 7;
      const movieBoost = item.type === "Movie" ? 2 : 0;
      return ratingBoost + reviewBoost + ageBoost + movieBoost;
    };

    return [...catalog]
      .filter((item) => !watchedIds.has(item.id))
      .sort((a, b) => (b.weeklyViews ?? 0) - (a.weeklyViews ?? 0) || score(b) - score(a) || b.year - a.year || b.id - a.id)
      .slice(0, 12);
  }, [catalog, continueWatching]);

  const sections = useMemo(() => {
    const byPopularity = (items: Content[]) => [...items].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount || b.year - a.year);
    const mapRecommendationItems = (items: any[]) => items.filter(item => catalog.some(allowed => allowed.id === item.content_id)).map((item) => mapContent(item as BootstrapData["content"][number]));
    const uniqueItems = (items: Content[]) => [...new Map(items.map(item => [item.id, item])).values()].slice(0, 12);
    const watchedIds = new Set([...recentlyWatched, ...continueWatching].map(item => item.id));
    const interestIds = new Set([...watchedIds, ...favorites, ...watchlist]);
    const interestGenres = new Set(catalog.filter(item => interestIds.has(item.id)).map(item => item.genre.trim().toLowerCase()).filter(Boolean));
    const unseen = catalog.filter(item => !watchedIds.has(item.id));
    const genreMatches = byPopularity(unseen.filter(item => interestGenres.has(item.genre.trim().toLowerCase())));
    const basedOnGenres = uniqueItems([
      ...mapRecommendationItems(recommendations?.basedOnYourGenres ?? []),
      ...genreMatches,
    ]);

    const latestWatched = recentlyWatched[0] ?? null;
    const latestGenre = latestWatched?.genre.trim().toLowerCase();
    const sameLatestGenre = (item:Content)=>Boolean(latestGenre) && item.genre.trim().toLowerCase()===latestGenre && !watchedIds.has(item.id);
    const recommendationBecause = recommendations?.becauseYouWatchedSource?.content_id===latestWatched?.id
      ? mapRecommendationItems(recommendations?.becauseYouWatched ?? []).filter(sameLatestGenre) : [];
    const fallbackBecause = byPopularity(unseen.filter(sameLatestGenre));
    const because = uniqueItems([...recommendationBecause,...fallbackBecause]);
    const recommended = uniqueItems([
      ...basedOnGenres,
      ...mapRecommendationItems(recommendations?.recommendedForYou ?? []),
      ...byPopularity(unseen),
    ]);

    const preTopSections = [
      
      ...(because.length ? [{ title: `Because You Watched ${latestWatched!.title}`, items: because }] : []),
      ...(basedOnGenres.length ? [{ title: "Based on Your Favorite Genres", items: basedOnGenres }] : []),
      ...(recommended.length ? [{ title: "Recommended For You", items: recommended }] : []),
    ];

    const genreGroups = new Map<string, Content[]>();
    for (const movie of catalog) {
      const genre = movie.genre?.trim();
      if (!genre) continue;
      genreGroups.set(genre, [...(genreGroups.get(genre) ?? []), movie]);
    }
    const genreSections = [...genreGroups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([genre, items]) => ({ title: genre, items: byPopularity(items).slice(0, 12) }))
      .filter((section) => section.items.length >= 2);

    const newReleases = [...catalog].sort((a,b)=>b.year-a.year).slice(0,12);
    return { preTopSections, genreSections, newReleases };
  }, [catalog, continueWatching, recommendations, recentlyWatched, favorites, watchlist]);

  function recordMutation(operation: string, message: string) {
    const type = operation.endsWith("Error") ? "error" : "success";
    void notify(type, message);
  }

  async function login(
    email: string,
    password: string
  ) {
    try {
      setAuthBusy(true);
      setAuthError("");

      localStorage.removeItem(
        "streamflix-explicitly-logged-out"
      );

      const {
        error,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      await refreshBootstrap();
      recordMutation("Login", "Welcome back to StreamFlix");
    } catch (error) {
      setAuthError(
        error instanceof Error && /invalid login credentials|email not confirmed|too many requests/i.test(error.message)
          ? error.message
          : "Unable to sign in. Check your email and password and try again."
      );

      throw error;
    } finally {
      setAuthBusy(false);
    }
  }

  async function register(
    details: RegisteredAccount,
    password: string
  ) {
    try {
      setAuthBusy(true);
      setAuthError("");

      localStorage.removeItem(
        "streamflix-explicitly-logged-out"
      );

      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email: details.email.trim(),
        password,
        options: {
          data: {
            full_name: details.name.trim(),
            phone:
              details.phone.trim() || null,
            date_of_birth:
              details.dateOfBirth || null,
          },
        },
      });

      if (error) {
        throw error;
      }

      setAccount(details);
      setRegisteredName(details.name);

      if (!data.session) {
        setAuthError(
          "Account created. Check your email to confirm your account, then sign in."
        );
        recordMutation("Register", "Your StreamFlix account was created. Check your email to confirm it.");

        return false;
      }

      await refreshBootstrap();
      recordMutation("Register", "Your StreamFlix account was created successfully");

      return true;
    } catch (error) {
      setAuthError(
        error instanceof Error && /already registered|invalid|password|email|too many requests/i.test(error.message)
          ? error.message
          : "Unable to create your account. Please check your details and try again."
      );

      throw error;
    } finally {
      setAuthBusy(false);
    }
  }

  async function loginWithGoogle() {
    try {
      setAuthBusy(true);
      setAuthError("");
      // Plan selection belongs to the previous sign-in, not the chosen Google account.
      localStorage.removeItem("streamflix-selected-plan");
      localStorage.removeItem("streamflix-pending-payment");

      localStorage.removeItem(
        "streamflix-explicitly-logged-out"
      );

      const {
        error,
      } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            `${window.location.origin}/oauth/callback`,
          queryParams: { prompt: "select_account" },
        },
      });

      if (error) {
        throw error;
      }
      recordMutation("GoogleLogin", "Opening Google sign-in");
    } catch (error) {
      setAuthBusy(false);
      setAuthError(
        error instanceof Error
          ? error.message
          : "Google login failed"
      );

      throw error;
    }
  }

  async function toggleFavorite(id: number) {
    const profileId = activeProfile?.backendId, userId = currentUserId;
    const key = `${userId}:${profileId}:${id}`;
    if (!userId || !profileId || favoritePending.current.has(key)) return;
    favoritePending.current.add(key); listRevision.current++;
    const row = favoriteRows.find(item => item.content_id === id);
    const belongs = (item: BootstrapData["favorites"][number]) => item.user_id === userId && item.profile_id === profileId && item.content_id === id;
    const optimistic = {fav_id: -id, user_id: userId, profile_id: profileId, content_id: id, date_added: new Date().toISOString()};
    setFavoriteRows(current => [...current.filter(item => !belongs(item)), ...(row ? [] : [optimistic])]);
    try {
      if (row) await deleteFavorite(row.fav_id, profileId);
      else {
        const created = await createFavorite(id, profileId);
        setFavoriteRows(current => [created, ...current.filter(item => !belongs(item))]);
      }
      recordMutation("ToggleFavorite", row ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      setFavoriteRows(current => [...current.filter(item => !belongs(item)), ...(row ? [row] : [])]);
      recordMutation("ToggleFavoriteError", error instanceof Error ? error.message : "Unable to update favorites");
    } finally { listRevision.current++; favoritePending.current.delete(key); }
  }

  async function toggleWatchlist(id: number) {
    const profileId = activeProfile?.backendId, userId = currentUserId;
    const key = `${userId}:${profileId}:${id}`;
    if (!userId || !profileId || watchlistPending.current.has(key)) return;
    watchlistPending.current.add(key); listRevision.current++;
    const row = watchlistRows.find(item => item.content_id === id);
    const belongs = (item: BootstrapData["watchlist"][number]) => item.user_id === userId && item.profile_id === profileId && item.content_id === id;
    const optimistic = {list_id: -id, user_id: userId, profile_id: profileId, content_id: id, episode_id: null, progress: 0, watchlist_status: "planned", date_added: new Date().toISOString()};
    setWatchlistRows(current => [...current.filter(item => !belongs(item)), ...(row ? [] : [optimistic])]);
    try {
      if (row) await deleteWatchList(row.list_id, profileId);
      else {
        const created = await addWatchList(id, profileId);
        setWatchlistRows(current => [{...created, watchlist_status: created.watchlist_status ?? "planned"}, ...current.filter(item => !belongs(item))]);
      }
      recordMutation("ToggleWatchlist", row ? "Removed from Watchlist" : "Added to Watchlist");
    } catch (error) {
      setWatchlistRows(current => [...current.filter(item => !belongs(item)), ...(row ? [row] : [])]);
      recordMutation("ToggleWatchlistError", error instanceof Error ? error.message : "Unable to update watchlist");
    } finally { listRevision.current++; watchlistPending.current.delete(key); }
  }

  function openTitle(item: Content) {
    window.dispatchEvent(new Event(PLAYER_EVENT));
    setSelected(item);
    setSelectedSeason(1);
    setSelectedEpisodeId(null);
    setReviewRating(0);
    setReviewComment("");
    setDetailOpen(true);
  }

  async function play(item: Content, episodeId?: number | null) {
    if(playbackPending.current || !activeProfile)return;
    const profileId = activeProfile.backendId;
    playbackPending.current=true;setPlaybackBusy(true);
    window.dispatchEvent(new Event(PLAYER_EVENT));
    try {
      const resumeRows = historyRows.filter(row => row.content_id === item.id).sort((a,b)=>new Date(b.watch_date).getTime()-new Date(a.watch_date).getTime());
      const targetEpisode = episodeId === undefined ? resumeRows[0]?.episode_id ?? null : episodeId;
      const savedProgress = resumeRows.find(row => row.episode_id === targetEpisode)?.progress_percentage ?? 0;
      const result=await apiRequest<{url:string}>(`/content/${item.id}/playback`,{method:"POST",body:JSON.stringify({profile_id:profileId,...(targetEpisode?{episode_id:targetEpisode}:{})})});
      if (activeProfileIdRef.current !== profileId) return;
      setPlaybackProfileId(profileId);
      const episode=selectedEpisodes.find(row=>row.episode_id===targetEpisode);
      setSelected({...item,progress:Number(savedProgress),trailerUrl:backendAsset(result.url),title:episode?`${item.title} · ${episode.episode_title}`:item.title});
      setSelectedEpisodeId(targetEpisode);setDetailOpen(false);setWatchOpen(true);
      recordMutation("PlaybackStarted", `${item.title} trailer started`);
    } catch(error) {
      notify("error",error instanceof Error?error.message:"Unable to open this trailer. Please try again.");
    } finally {playbackPending.current=false;setPlaybackBusy(false);}
  }

  const updatePlaybackProgress = useCallback(
    async (
      contentId: number,
      progressPercentage: number,
      episodeId: number | null,
      profileId: number | null
    ) => {
      if (!profileId) return;
      const rounded = Math.max(
        0,
        Math.min(
          100,
          progressPercentage > 0 ? Math.max(1, Math.round(progressPercentage)) : 0
        )
      );

      try {
        const key = `${profileId}:${contentId}:${episodeId ?? 'title'}`;
        const previous = progressWrites.current.get(key) ?? Promise.resolve();
        const write = previous.catch(() => undefined).then(() => saveViewProgress(contentId, rounded, episodeId, profileId));
        progressWrites.current.set(key, write);
        let saved: Awaited<ReturnType<typeof saveViewProgress>>;
        try {saved = await write;} finally {if (progressWrites.current.get(key) === write) progressWrites.current.delete(key);}


        setHistoryRows((current) => {
          const idx = current.findIndex(
            (row) =>
              row.profile_id === profileId &&
              row.content_id === contentId &&
              row.episode_id === episodeId
          );

          const row = saved;

          if (idx < 0) {
            return [row, ...current];
          }

          const next = [...current];
          next[idx] = row;
          return next;
        });
        progressSaveWarned.current=false;
      } catch {
        if(!progressSaveWarned.current){notify("warning","Your trailer will keep playing, but its progress could not be saved.");progressSaveWarned.current=true;}
      }
    },
    []
  );

  async function submitReview() {
    if (!selected || reviewRating < 1 || reviewRating > 5) {
      return false;
    }

    try {
      const existing = myReviews.find(
        (review) =>
          review.content_id === selected.id
      );

      const review = existing
        ? await updateReview(
            existing.rev_id,
            reviewRating,
            reviewComment
          )
        : await createReview(
            selected.id,
            reviewRating,
            reviewComment
          );

      setMyReviews((current) =>
        existing
          ? current.map((row) =>
              row.rev_id === existing.rev_id
                ? review
                : row
            )
          : [review, ...current]
      );

      setCatalog((current) =>
        current.map((item) => {
          if (item.id !== selected.id) {
            return item;
          }

          const oldCount = item.reviewCount;
          const newCount = existing
            ? oldCount
            : oldCount + 1;

          const oldTotal =
            item.rating * oldCount;

          const newTotal = existing
            ? oldTotal -
              existing.rating_value +
              review.rating_value
            : oldTotal +
              review.rating_value;

          return {
            ...item,
            reviewCount: newCount,
            rating: newCount
              ? Number(
                  (
                    newTotal / newCount
                  ).toFixed(1)
                )
              : review.rating_value,
          };
        })
      );

      setSelected((current) =>
        current &&
        current.id === selected.id
          ? {
              ...current,
              reviewCount: existing
                ? current.reviewCount
                : current.reviewCount + 1,
              rating: (() => {
                const count =
                  current.reviewCount;
                const total =
                  current.rating * count;
                const newCount = existing
                  ? count
                  : count + 1;

                const newTotal = existing
                  ? total -
                    existing.rating_value +
                    review.rating_value
                  : total +
                    review.rating_value;

                return Number(
                  (
                    newTotal / newCount
                  ).toFixed(1)
                );
              })(),
            }
          : current
      );

      setReviewOpen(false);

      recordMutation(
        "CreateReview",
        existing
          ? "Your review was updated"
          : "Your review was saved to StreamFlix"
      );
      return true;
    } catch (error) {
      recordMutation(
        "CreateReviewError",
        error instanceof Error
          ? error.message
          : "Unable to save review"
      );
      return false;
    }
  }

  async function submitFeedback(
    subject: string,
    message: string
  ) {
    try {
      await createFeedback(
        subject,
        message
      );

      setFeedbackOpen(false);

      recordMutation(
        "SubmitFeedback",
        "Feedback sent to the StreamFlix team"
      );
      return true;
    } catch (error) {
      recordMutation(
        "SubmitFeedbackError",
        error instanceof Error
          ? error.message
          : "Unable to send feedback"
      );
      return false;
    }
  }

  async function selectPlan(planId: string): Promise<void> {
    const selectedPlan = plans.find(
      (item) => item.id === planId
    );

    if (!selectedPlan) {
      recordMutation(
        "SelectPlanError",
        "Selected plan is not available"
      );
      return;
    }

    setPlan(planId);
    setPlansOpen(false);

    localStorage.setItem(
      "streamflix-selected-plan",
      planId
    );

    localStorage.removeItem(
      "streamflix-pending-payment"
    );

    setAuthStage("subscription-payment");

    recordMutation("SelectPlan", `${selectedPlan.name} plan selected`);
  }

  function handleSubscriptionPaid(receipt: SubscriptionReceipt) {
    setPlan(receipt.planId);
    localStorage.removeItem("streamflix-pending-payment");
    localStorage.removeItem("streamflix-selected-plan");
    setAuthStage("profiles");
    void refreshBootstrap(false);
    recordMutation("SubscriptionPaid", `${receipt.planId} subscription payment confirmed`);
  }

  async function addProfile(data: {
    name: string;
    deviceType: string;
    deviceName: string;
    avatarUrl: string | null;
    isKids: boolean;
  }) {
    try {
      if (!currentUserId) throw new Error("You must be signed in to create a profile.");

      const created = await createProfile({
        profile_name: data.name,
        is_kids: data.isKids,
        avatar_url: data.avatarUrl,
        device: `${data.deviceType} • ${data.deviceName}`,
      });

      await refreshBootstrap();

      recordMutation(
        "CreateProfile",
        `${created.profile_name} profile added`
      );
    } catch (error) {
      recordMutation("CreateProfileError", error instanceof Error ? error.message : "Unable to create profile");
      throw error;
    }
  }

  async function editProfile(profile: ViewerProfile, data: { profile_name?: string; avatar_url?: string | null; device?: string | null }) {
    try {
      if (data.avatar_url) {
        const parsed = new URL(data.avatar_url, window.location.origin);
        if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Avatar URL must use HTTP or HTTPS.");
        data = { ...data, avatar_url: parsed.toString() };
      }
      const updated = await updateProfile(profile.backendId, data);
      setProfiles((current) => current.map((item) => item.backendId === updated.profile_id ? mapProfile({ ...updated, created_at: updated.created_at }) : item));
      setActiveProfile((current) => current && current.backendId === updated.profile_id ? mapProfile({ ...updated, created_at: updated.created_at }) : current);
      recordMutation("UpdateProfile", `${updated.profile_name} profile updated`);
      return updated;
    } catch (error) {
      recordMutation("UpdateProfileError", error instanceof Error ? error.message : "Unable to update profile");
      throw error;
    }
  }

  async function removeProfile(
    profile: ViewerProfile
  ) {
    try {
      await deleteProfile(profile.backendId);

      const wasActive =
        activeProfile?.backendId ===
        profile.backendId;

      await refreshBootstrap();

      if (wasActive) {
        setActiveProfile(null);
      }

      recordMutation("DeleteProfile", `${profile.name} profile deleted`);
    } catch (error) {
      recordMutation("DeleteProfileError", error instanceof Error ? error.message : "Unable to delete profile");
      throw error;
    }
  }

  async function checkout(
    paymentMethod: string,
    deliveryMethod: string,
    details?: { name: string; phone: string; address: string }
  ) {
    if (!currentUserId || !activeProfile) throw new Error("Select your profile before checkout.");
    const profileId=activeProfile.backendId;
    const deliveryDetails = details ?? { name: account.name, phone: account.phone, address: "" };
    if (!deliveryDetails.name.trim() || !deliveryDetails.phone.trim() || (deliveryMethod !== "Store Pickup" && !deliveryDetails.address.trim())) throw new Error("Complete delivery name, phone, and address before checkout.");
    const items = cartItems.map((item) => ({ product_id: Number(item.id), quantity: cart[item.id] ?? 1 }));
    if (!items.length) throw new Error("Your merchandise bag is empty");
    if (paymentMethod === "Card") {
      const result = await createMerchandiseCardCheckout(currentUserId, items, { profile_id: profileId, delivery_name: deliveryDetails.name, delivery_phone: deliveryDetails.phone, delivery_address: deliveryDetails.address, delivery_method: deliveryMethod });
      if (!result.checkout_url) throw new Error("Stripe did not return a checkout URL.");
      recordMutation("MerchandiseCheckoutRedirect", `Opening secure Stripe checkout for ₱${total.toLocaleString()}`);
      try { localStorage.setItem(`streamflix-merch-checkout:${result.session_id}`,JSON.stringify({userId:currentUserId,profileId,items})); } catch { /* Checkout can continue without local storage; do not clear bags without a snapshot. */ }
      window.location.assign(result.checkout_url);
      return;
    }
    const rows = (await createMerchandiseCodOrder(currentUserId, items, { profile_id: profileId, delivery_name: deliveryDetails.name, delivery_phone: deliveryDetails.phone, delivery_address: deliveryDetails.address, delivery_method: deliveryMethod })) as import("@/services/merchandise.service").MerchandiseTransaction[];
    setTransactions(previous=>[...previous.filter(tx=>!rows.some(row=>tx.id===`SF-${row.transaction_id}`)),...rows.map((row) => {
      const product = products.find((item) => item.id === String(row.product_id));
      return { userId:row.user_id,profileId:row.profile_id,id: `SF-${row.transaction_id}`, items: [{ id: String(row.product_id), name: product?.name ?? `Product ${row.product_id}`, price: Number(row.price_at_purchase ?? Number(row.total_amount) / row.quantity), quantity: row.quantity }], total: Number(row.total_amount), createdAt: formatDate(row.created_at), paymentMethod: row.payment_method ?? paymentMethod, deliveryMethod: row.delivery_method ?? deliveryMethod, status: orderStatus(row.order_status) };
    })]);
    setCart(before=>subtractPurchased(before,items));
    if(activeProfileIdRef.current===profileId)setCartOpen(false);
    await refreshBootstrap(false);
    recordMutation("CreateMerchandiseOrder", "Order placed and stock updated in the database");
  }

  async function loadTransactions() {
    try {
      if (!currentUserId || !activeProfile) return;
      const userId=currentUserId,profileId=activeProfile.backendId;
      const rows = await getTransactions(userId,profileId);

      setTransactions(previous=>[...previous.filter(row=>row.userId!==userId || row.profileId!==profileId),
        ...rows.map((row) => {
          const product = products.find(
            (item) =>
              item.id ===
              String(row.product_id)
          );

          return {
            userId:row.user_id,
            profileId:row.profile_id,
            id: `SF-${row.transaction_id}`,
            items: [
              {
                id: String(row.product_id),
                name:
                  product?.name ??
                  `Product ${row.product_id}`,
                price:
                  Number(row.price_at_purchase ?? Number(row.total_amount) / row.quantity),
                quantity: row.quantity,
              },
            ],
            total: Number(
              row.total_amount
            ),
            createdAt: formatDate(
              row.created_at
            ),
            paymentMethod: row.payment_method ?? "Cash on Delivery",
            deliveryMethod: row.delivery_method ?? "Standard delivery",
            status: orderStatus(row.order_status),
          };
        })]
      );
    } catch {
      // Keep existing profile orders on temporary connection failure.
    }
  }

  async function logout() {
    try {
      setAuthBusy(true);
      setAuthError("");

      localStorage.setItem(
        "streamflix-explicitly-logged-out",
        "true"
      );

      localStorage.removeItem(
        "streamflix-active-profile"
      );

      localStorage.removeItem(
        "streamflix-selected-plan"
      );

      localStorage.removeItem(
        "streamflix-pending-payment"
      );

      const { error } =
        await supabase.auth.signOut({
          scope: "local",
        });

      if (error) {
        throw error;
      }

      recordMutation("Logout", "You have been signed out of StreamFlix");
      setActiveProfile(null);
      setAuthStage("login");
      setCatalog([]);
      setProfiles([]);
      setPlans([]);
      setSubscriptions([]);
      setActiveSubscription(null);
      setPlan("");

      setAccount({
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
      });
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Unable to sign out."
      );
    } finally {
      setAuthBusy(false);
    }
  }

  function selectProfile(
    profile: ViewerProfile
  ) {
    setWatchOpen(false);
    setDetailOpen(false);
    setCartOpen(false);
    setAccountOpen(false);
    setRecommendations(null);
    setActiveProfile(profile);

    localStorage.setItem(
      "streamflix-active-profile",
      String(profile.backendId)
    );

    setAuthStage("app");

    recordMutation("SelectProfile", `${profile.name} profile selected`);
  }

  function navigate(next: View) {
    setView(next);
    setQuery("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function addToCart(id: string) {
    const product = products.find((item) => item.id === id);
    if (!product) {
      recordMutation("AddToCartError", "Product is no longer available");
      return;
    }
    const current = cart[id] ?? 0;
    if (current >= product.stockQuantity) {
      recordMutation("AddToCartError", `${product.name}: maximum available stock already in your bag`);
      return;
    }
    setCart((items) => ({ ...items, [id]: Math.min(product.stockQuantity, (items[id] ?? 0) + 1) }));
    recordMutation("AddToCart", `${product.name} added to your bag`);
  }

  function setLocalCartQuantity(id: string, quantity: number) {
    const product = products.find((item) => item.id === id);
    setCart((items) => {
      const next = { ...items };
      const max = product?.stockQuantity ?? 0;
      const safeQuantity = Math.min(Math.max(0, Math.floor(quantity)), max);

      if (safeQuantity <= 0) {
        delete next[id];
      } else {
        next[id] = safeQuantity;
      }

      return next;
    });
    if (product) {
      if (quantity <= 0) recordMutation("RemoveFromCart", `${product.name} removed from your bag`);
      else recordMutation("UpdateCartQuantity", `${product.name} quantity updated to ${Math.min(Math.max(0, Math.floor(quantity)), product.stockQuantity)}`);
    }
  }

  const favoriteLabels: Record<
    number,
    string
  > = Object.fromEntries(
    favoriteItems.map((item) => [
      item.id,
      `Date Added: ${formatDate(
        favoriteDates[item.id]
      )}`,
    ])
  );

  const watchlistLabels: Record<
    number,
    string
  > = Object.fromEntries(
    watchlistItems.map((item) => {
      const row = watchlistRows.find(
        (entry) =>
          entry.content_id === item.id
      );

      return [
        item.id,
        `${row?.watchlist_status ?? "planned"}
Date Added: ${formatDate(
          watchlistDates[item.id]
        )}`,
      ];
    })
  );

  const recentlyWatchedLabels: Record<
    number,
    string
  > = Object.fromEntries(
    recentlyWatched.map((item) => {
      const row = historyRows.find(
        (entry) =>
          entry.content_id === item.id
      );

      return [
        item.id,
        row
          ? `${
              row.episode_id
                ? `Episode ${row.episode_id}`
                : "Movie"
            }
${formatDate(row.watch_date)}`
          : item.title,
      ];
    })
  );

  const currentPlan =
    plans.find(
      (item) => item.id === plan
    ) ??
    (activeSubscription
      ? plans.find(
          (item) =>
            item.backendId ===
            activeSubscription.plan_id
        )
      : undefined);

  return {
    currentUserId,
    authStage,
    setAuthStage,
    authBusy,
    authError,
    setAuthError,
    login,
    register,
    loginWithGoogle,

    registeredName,
    setRegisteredName,
    account,
    setAccount,
    profiles,
    setProfiles,
    activeProfile,
    setActiveProfile,

    view,
    setView,
    query,
    setQuery,
    searchOpen,
    setSearchOpen,
    selected,
    setSelected,
    selectedSeason,
    setSelectedSeason,
    selectedSeasons,
    selectedEpisodes,
    selectedEpisodeId,

    detailOpen,
    setDetailOpen,
    playbackBusy,
    watchOpen,
    setWatchOpen,
    reviewOpen,
    setReviewOpen,
    reviewRating,
    setReviewRating,
    reviewComment,
    setReviewComment,
    feedbackOpen,
    setFeedbackOpen,
    plansOpen,
    setPlansOpen,
    accountOpen,
    setAccountOpen,
    cartOpen,
    setCartOpen,
    footerPanel,
    setFooterPanel,

    favorites,
    watchlist,
    cart,
    setCart,

    notifications,
    markNotificationsRead,
    markNotification,
    recommendations,
    visitorCount,
    transactions,
    setTransactions,

    plan,
    setPlan,
    plans,
    products,
    activeSubscription,
    currentPlan,

    catalog,
    visibleCatalog,
    myList,
    continueWatching,
    favoriteItems,
    watchlistItems,
    recentlyWatched,

    favoriteLabels,
    watchlistLabels,
    recentlyWatchedLabels,

    myReviews,
    cartItems,
    cartCount,
    total,

    sections,
    homeSections: sections,
    genreSections: sections.genreSections,
    featuredTitle,
    topTenItems,
    trendingNow,

    refreshBootstrap,
    recordMutation,
    openTitle,
    play,

    contentLoading,
    contentError,

    toggleFavorite,
    toggleWatchlist,
    updatePlaybackProgress,
    playbackProfileId,
    submitReview,
    submitFeedback,
    selectPlan,
    handleSubscriptionPaid,
    addProfile,
    editProfile,
    removeProfile,
    checkout,
    addToCart,
    loadTransactions,
    setLocalCartQuantity,
    logout,
    selectProfile,
    navigate,
  };
}

export type StreamFlixController =
  ReturnType<typeof useStreamFlix>;