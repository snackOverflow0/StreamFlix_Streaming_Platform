import { flushSync } from "react-dom";
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
import { emitActionFeedback } from "../components/ActionFeedback";
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
    title: item.title,
    type: String(item.type).toLowerCase() === "series" ? "Series" : "Movie",
    year: releaseYear,
    rating: Number(item.rating ?? 0),
    reviewCount: Number(item.review_count ?? 0),
    genre: item.genre_name ?? "Uncategorized",
    poster: backendAsset(item.poster_url),
    preview: backendAsset(item.preview_url),
    hero: backendAsset(
      item.hero_url ?? item.preview_url ?? item.poster_url
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
    isKids: item.profile_name.toLowerCase().includes("kid"),
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
  const stock = Number(item.stock_quantity ?? 0);

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
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [footerPanel, setFooterPanel] = useState<FooterPanel>(null);

  const favoritePending = useRef(new Set<number>());
  const watchlistPending = useRef(new Set<number>());
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoriteDates, setFavoriteDates] =
    useState<Record<number, string>>({});
  const [favoriteRows, setFavoriteRows] =
    useState<BootstrapData["favorites"]>([]);

  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [watchlistDates, setWatchlistDates] =
    useState<Record<number, string>>({});
  const [watchlistRows, setWatchlistRows] =
    useState<BootstrapData["watchlist"]>([]);

  const [historyRows, setHistoryRows] =
    useState<BootstrapData["history"]>([]);
  const [myReviews, setMyReviews] =
    useState<BootstrapData["myReviews"]>([]);

  const [catalog, setCatalog] = useState<Content[]>([]);
  const [plans, setPlans] = useState<BackendPlan[]>([]);
  const [products, setProducts] = useState<MerchProduct[]>([]);

  const [subscriptions, setSubscriptions] =
    useState<BootstrapData["subscriptions"]>([]);
  const [activeSubscription, setActiveSubscription] =
    useState<BootstrapData["activeSubscription"]>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cart, setCart] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem("streamflix-merch-cart");
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return Object.fromEntries(
        Object.entries(parsed).filter(
          ([, quantity]) =>
            typeof quantity === "number" &&
            Number.isInteger(quantity) &&
            quantity > 0,
        ),
      ) as Record<string, number>;
    } catch {
      return {};
    }
  });
  const [notifications, setNotifications] =
    useState<AppNotification[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState("");
  const [plan, setPlan] = useState("");

  const refreshBootstrap = useCallback(
    async (keepStage = true) => {
      setContentLoading(true);
      setContentError("");
      try {
        const data = await getBootstrap();

      const mappedCatalog = data.content.map(mapContent);
      const history = data.history ?? [];

      const progressByContent = new Map<
        number,
        { at: number; progress: number }
      >();

      for (const row of history) {
        const at = new Date(row.watch_date).getTime();
        const existing = progressByContent.get(row.content_id);

        if (!existing || at >= existing.at) {
          progressByContent.set(row.content_id, {
            at,
            progress: Number(row.progress_percentage) || 0,
          });
        }
      }

      for (const item of mappedCatalog) {
        item.progress =
          progressByContent.get(item.id)?.progress ?? 0;
      }

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

      setFavorites(
        data.favorites.map((row) => row.content_id)
      );

      setFavoriteRows(data.favorites);

      setFavoriteDates(
        Object.fromEntries(
          data.favorites.map((row) => [
            row.content_id,
            row.date_added,
          ])
        )
      );

      setWatchlist(
        data.watchlist.map((row) => row.content_id)
      );

      setWatchlistRows(data.watchlist);

      setWatchlistDates(
        Object.fromEntries(
          data.watchlist.map((row) => [
            row.content_id,
            row.date_added,
          ])
        )
      );

      setHistoryRows(history);
      setMyReviews(data.myReviews);
      setNotifications((data.notifications ?? []).map((item) => ({ id: String(item.notification_id), backendId: item.notification_id, title: item.title, message: item.message, time: formatDate(item.created_at), unread: !item.is_read, type: item.type })));

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
            planId?: string;
          };
          pendingPlanId = pending.planId ?? "";
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

      if (!keepStage) return data;

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

      if (saved) {
        setActiveProfile(saved);
        setAuthStage("app");
      } else if (
        data.activeSubscription?.status === "active"
      ) {
        setAuthStage("profiles");
      } else if (pendingPlanId || savedSelectedPlan) {
        setAuthStage("subscription-payment");
      } else {
        setAuthStage("plans");
      }

        setContentError("");
        return data;
      } catch (error) {
        setContentError(error instanceof Error ? error.message : "Unable to load StreamFlix content.");
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
          setCart({});
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
    try {
      localStorage.setItem("streamflix-merch-cart", JSON.stringify(cart));
    } catch {
      // Storage can be unavailable in private/restricted browser contexts.
    }
  }, [cart]);

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
  }, [products]);

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
    void trackVisitor().then((result) => setVisitorCount(result.uniqueVisitors)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (authStage !== "app" || !currentUserId) return;
    let cancelled = false;
    void getRecommendations().then((data) => { if (!cancelled) setRecommendations(data); }).catch(() => undefined);

    const channel = supabase
      .channel(`streamflix-notifications-${currentUserId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${currentUserId}` }, (payload) => {
        const item = payload.new as any;
        setNotifications((current) => [{ id: String(item.notification_id), backendId: Number(item.notification_id), title: String(item.title), message: String(item.message), time: formatDate(item.created_at), unread: !item.is_read, type: String(item.type) }, ...current].slice(0, 30));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${currentUserId}` }, (payload) => {
        const item = payload.new as any;
        setNotifications((current) => current.map((notification) => notification.backendId === Number(item.notification_id) ? { ...notification, title: String(item.title), message: String(item.message), unread: !item.is_read, time: formatDate(item.created_at) } : notification));
      })
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [authStage, currentUserId]);

  const markNotificationsRead = useCallback(async () => {
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
    try { await markAllNotificationsRead(); recordMutation("NotificationsReadAll", "All notifications marked as read"); } catch (error) { recordMutation("NotificationsReadAllError", error instanceof Error ? error.message : "Unable to mark notifications as read"); }
  }, []);

  const markNotification = useCallback(async (id: number) => {
    setNotifications((current) => current.map((item) => item.backendId === id ? { ...item, unread: false } : item));
    try { await markNotificationRead(id); recordMutation("NotificationRead", "Notification marked as read"); } catch (error) { recordMutation("NotificationReadError", error instanceof Error ? error.message : "Unable to mark notification as read"); }
  }, []);

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

  const continueWatching = useMemo(
    () =>
      catalog
        .filter(
          (item) =>
            Number(item.progress) > 0 &&
            Number(item.progress) < 100
        )
        .sort(
          (a, b) =>
            Number(b.progress) -
            Number(a.progress)
        ),
    [catalog]
  );

  const recentlyWatched = useMemo(() => {
    const seen = new Set<number>();
    const result: Content[] = [];

    for (const row of historyRows) {
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
      return scoreB - scoreA || b.id - a.id;
    });
  }, [catalog]);

  const topTenItems = useMemo(() => rankedCatalog.slice(0, 10), [rankedCatalog]);
  const featuredTitle = useMemo(() => rankedCatalog[0] ?? catalog[0] ?? null, [rankedCatalog, catalog]);

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
      .sort((a, b) => score(b) - score(a) || b.year - a.year || b.id - a.id)
      .slice(0, 12);
  }, [catalog, continueWatching]);

  const sections = useMemo(() => {
    const byPopularity = (items: Content[]) => [...items].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount || b.year - a.year);
    const mapRecommendationItems = (items: any[]) => items.map((item) => mapContent(item as BootstrapData["content"][number]));
    const used = new Set<number>([...continueWatching.map((item) => item.id), ...trendingNow.map((item) => item.id)]);
    const addUnique = (items: Content[], limit = 12) => items.filter((item) => !used.has(item.id)).slice(0, limit).map((item) => { used.add(item.id); return item; });

    const recommendationBecause = recommendations?.becauseYouWatched?.length
      ? mapRecommendationItems(recommendations.becauseYouWatched)
      : [];

    const latestWatched = recentlyWatched[0] ?? continueWatching[0] ?? null;
    const fallbackBecause = latestWatched
      ? byPopularity(catalog.filter((item) => item.id !== latestWatched.id && item.genre.toLowerCase() === latestWatched.genre.toLowerCase()))
      : [];

    const becauseSource = recommendationBecause.length ? recommendationBecause : fallbackBecause;
    const because = addUnique(becauseSource);
    const recommended = recommendations?.recommendedForYou?.length
      ? addUnique(mapRecommendationItems(recommendations.recommendedForYou))
      : [];

    const preTopSections = [
      ...(continueWatching.length ? [{ title: "Continue Watching", items: continueWatching.slice(0, 12) }] : []),
      ...(trendingNow.length ? [{ title: "Trending Now", items: trendingNow }] : []),
      ...(because.length ? [{ title: latestWatched ? `Because You Watched ${latestWatched.title}` : "Because You Watched", items: because }] : []),
      ...(recommended.length ? [{ title: "Recommended For You", items: recommended }] : []),
    ];

    const topTenIds = new Set(topTenItems.map((item) => item.id));
    const genreGroups = new Map<string, Content[]>();
    for (const movie of catalog.filter((item) => item.type === "Movie" && !topTenIds.has(item.id))) {
      const genre = movie.genre?.trim();
      if (!genre) continue;
      genreGroups.set(genre, [...(genreGroups.get(genre) ?? []), movie]);
    }
    const genreSections = [...genreGroups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([genre, items]) => ({ title: genre, items: byPopularity(items).slice(0, 12) }))
      .filter((section) => section.items.length >= 2);

    return { preTopSections, genreSections };
  }, [catalog, continueWatching, recommendations, recentlyWatched, topTenItems, trendingNow]);

  function recordMutation(operation: string, message: string) {
    const type = operation.endsWith("Error") ? "error" : "success";
    emitActionFeedback(type, message);
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
      setAuthError("");

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
        },
      });

      if (error) {
        throw error;
      }
      recordMutation("GoogleLogin", "Opening Google sign-in");
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Google login failed"
      );

      throw error;
    }
  }

  async function toggleFavorite(id: number) {
    if (!currentUserId || favoritePending.current.has(id)) return;
    favoritePending.current.add(id);
    const row = favoriteRows.find((item) => item.content_id === id);
    const previousFavorites = favorites;
    const previousRows = favoriteRows;
    const nextRows = row ? favoriteRows.filter((item) => item.fav_id !== row.fav_id) : favoriteRows;
    setFavorites(row ? favorites.filter((contentId) => contentId !== id) : [...favorites, id]);
    setFavoriteRows(nextRows);
    try {
      const created = row
        ? null
        : await createFavorite(id);
      if (row) await deleteFavorite(row.fav_id);
      if (created) setFavoriteRows((current) => [created, ...current]);
      recordMutation("ToggleFavorite", row ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      setFavorites(previousFavorites);
      setFavoriteRows(previousRows);
      recordMutation("ToggleFavoriteError", error instanceof Error ? error.message : "Unable to update favorites");
    } finally {
      favoritePending.current.delete(id);
    }
  }

  async function toggleWatchlist(id: number) {
    if (!currentUserId || watchlistPending.current.has(id)) return;
    watchlistPending.current.add(id);
    const row = watchlistRows.find((item) => item.content_id === id);
    const previousWatchlist = watchlist;
    const previousRows = watchlistRows;
    setWatchlist(row ? watchlist.filter((contentId) => contentId !== id) : [...watchlist, id]);
    setWatchlistRows(row ? watchlistRows.filter((item) => item.list_id !== row.list_id) : watchlistRows);
    try {
      const created = row ? null : await addWatchList(id);
      if (row) await deleteWatchList(row.list_id);
      if (created) {
        setWatchlistRows((current) => [
          { ...created, watchlist_status: created.watchlist_status ?? "planned" },
          ...current,
        ]);
      }
      recordMutation("ToggleWatchlist", row ? "Removed from Watchlist" : "Added to Watchlist");
    } catch (error) {
      setWatchlist(previousWatchlist);
      setWatchlistRows(previousRows);
      recordMutation("ToggleWatchlistError", error instanceof Error ? error.message : "Unable to update watchlist");
    } finally {
      watchlistPending.current.delete(id);
    }
  }

  function openTitle(item: Content) {
    setSelected(item);
    setSelectedSeason(1);
    setSelectedEpisodeId(null);
    setReviewRating(0);
    setReviewComment("");
    setDetailOpen(true);
  }

  function play(
    item: Content,
    episodeId: number | null = null
  ) {
    setSelected(item);
    setSelectedEpisodeId(episodeId);
    setDetailOpen(false);

    // Mount the same custom player shell used in normal playback. Do not
    // fullscreen the raw <video> element because that replaces StreamFlix's
    // controls with browser/native media controls. The player component owns
    // fullscreen so the minimized and fullscreen designs stay identical.
    flushSync(() => {
      setWatchOpen(true);
    });

    recordMutation(
      "PlaybackStarted",
      `${item.title}${
        episodeId
          ? ` episode ${episodeId}`
          : ""
      } playback started`
    );
  }

  const updatePlaybackProgress = useCallback(
    async (
      contentId: number,
      progressPercentage: number,
      episodeId: number | null = null
    ) => {
      const rounded = Math.max(
        0,
        Math.min(
          100,
          Math.round(progressPercentage)
        )
      );

      try {
        await saveViewProgress(
          contentId,
          rounded,
          episodeId
        );

        setCatalog((current) =>
          current.map((item) =>
            item.id === contentId
              ? {
                  ...item,
                  progress: rounded,
                }
              : item
          )
        );

        setHistoryRows((current) => {
          const idx = current.findIndex(
            (row) =>
              row.content_id === contentId &&
              row.episode_id === episodeId
          );

          const row = {
            history_id:
              idx >= 0
                ? current[idx].history_id
                : Date.now(),
            user_id:
              idx >= 0
                ? current[idx].user_id
                : 0,
            content_id: contentId,
            episode_id: episodeId,
            watch_date:
              new Date().toISOString(),
            progress_percentage: rounded,
          };

          if (idx < 0) {
            return [row, ...current];
          }

          const next = [...current];
          next[idx] = row;
          return next;
        });
      } catch {
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
  }) {
    try {
      if (!currentUserId) throw new Error("You must be signed in to create a profile.");

      const created = await createProfile({
        profile_name: data.name,
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
    if (!currentUserId) throw new Error("You must be signed in to checkout.");
    const deliveryDetails = details ?? { name: account.name, phone: account.phone, address: "" };
    if (!deliveryDetails.name || !deliveryDetails.phone || !deliveryDetails.address) throw new Error("Complete delivery name, phone, and address before checkout.");
    const items = cartItems.map((item) => ({ product_id: Number(item.id), quantity: cart[item.id] ?? 1 }));
    if (!items.length) throw new Error("Your merchandise bag is empty");
    if (paymentMethod === "Card") {
      const result = await createMerchandiseCardCheckout(currentUserId, items, { delivery_name: deliveryDetails.name, delivery_phone: deliveryDetails.phone, delivery_address: deliveryDetails.address, delivery_method: deliveryMethod });
      if (!result.checkout_url) throw new Error("Stripe did not return a checkout URL.");
      recordMutation("MerchandiseCheckoutRedirect", `Opening secure Stripe checkout for ₱${total.toLocaleString()}`);
      window.location.assign(result.checkout_url);
      return;
    }
    const rows = (await createMerchandiseCodOrder(currentUserId, items, { delivery_name: deliveryDetails.name, delivery_phone: deliveryDetails.phone, delivery_address: deliveryDetails.address, delivery_method: deliveryMethod })) as import("@/services/merchandise.service").MerchandiseTransaction[];
    setTransactions(rows.map((row) => {
      const product = products.find((item) => item.id === String(row.product_id));
      return { id: `SF-${row.transaction_id}`, items: [{ id: String(row.product_id), name: product?.name ?? `Product ${row.product_id}`, price: product?.price ?? Number(row.total_amount) / row.quantity, quantity: row.quantity }], total: Number(row.total_amount), createdAt: formatDate(row.created_at), paymentMethod: row.payment_method ?? paymentMethod, deliveryMethod: row.delivery_method ?? deliveryMethod, status: "Completed" as const };
    }));
    setCart({});
    setCartOpen(false);
    await refreshBootstrap(false);
    recordMutation("CreateMerchandiseOrder", "Order placed and stock updated in the database");
  }

  async function loadTransactions() {
    try {
      if (!currentUserId) return;
      const rows = await getTransactions(currentUserId);

      setTransactions(
        rows.map((row) => {
          const product = products.find(
            (item) =>
              item.id ===
              String(row.product_id)
          );

          return {
            id: `SF-${row.transaction_id}`,
            items: [
              {
                id: String(row.product_id),
                name:
                  product?.name ??
                  `Product ${row.product_id}`,
                price:
                  product?.price ??
                  Number(row.total_amount) /
                    row.quantity,
                quantity: row.quantity,
              },
            ],
            total: Number(
              row.total_amount
            ),
            createdAt: formatDate(
              row.created_at
            ),
            paymentMethod:
              "Backend record",
            deliveryMethod:
              "Standard delivery",
            status: "Completed" as const,
          };
        })
      );
    } catch {
      setTransactions([]);
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
    recordMutation("Navigate", `Opened ${next === "home" ? "Home" : next.replaceAll("-", " ")}`);

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
    const nextQuantity = current + 1;
    setCart((items) => ({ ...items, [id]: nextQuantity }));
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
    setNotifications,
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