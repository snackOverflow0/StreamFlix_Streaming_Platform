import { apiRequest } from "./api-client";

export type BootstrapProfile = {
  profile_id: number; user_id: number; profile_name: string; avatar_url: string | null; device: string | null; created_at: string;
};
export type BootstrapFavorite = { fav_id: number; user_id: number; content_id: number; date_added: string };
export type BootstrapWatchList = { list_id: number; user_id: number; content_id: number; episode_id: number | null; progress: number | null; date_added: string; watchlist_status: string };
export type BootstrapHistory = { history_id: number; user_id: number; content_id: number; episode_id: number | null; watch_date: string; progress_percentage: number };
export type BootstrapSubscription = { subscription_id: number; subscription_user_id: number; plan_id: number; start_date: string; end_date: string | null; status: string; created_at: string };
export type BootstrapPlan = { plan_id: number; plan_name: string; max_members: number; monthly_price: number; is_active: boolean; quality: string };
export type BootstrapProduct = { product_id: number; product_name: string; category: string; price: number; listing_status: string; image_url: string | null; stock_label: string | null; stock: number; description: string; variants: string[] };
export type BootstrapContent = {
  content_id: number; genre_id: number; license_id: number; title: string; description: string; release_date: string; director: string | null; cast: string | null; synopsis: string; type: string; age_rating: string; created_at: string; deleted_at: string | null; trailer_url: string | null; video_url?: string | null;
  genre_name: string | null; licensor_name: string | null; license_expiration: string | null; rating: number; review_count: number; poster_url: string | null; preview_url: string | null; hero_url: string | null; duration_label: string | null; is_featured: boolean;
};
export type BootstrapReview = { rev_id: number; user_id: number; content_id: number; rating_value: number; review_comment: string | null; review_date: string };
export type BootstrapData = {
  auth: { auth_user_id: string; email: string | null };
  user: { user_id: number; full_name: string; email: string; phone_number: string | null; date_of_birth: string | null; account_status: string; created_at: string; updated_at: string; deleted_at: string | null };
  profiles: BootstrapProfile[]; favorites: BootstrapFavorite[]; watchlist: BootstrapWatchList[]; history: BootstrapHistory[]; subscriptions: BootstrapSubscription[]; myReviews: BootstrapReview[];
  activeSubscription: BootstrapSubscription | null; activePlan: BootstrapPlan | null; content: BootstrapContent[]; genres: Array<{ genre_id: number; genre_name: string }>; plans: BootstrapPlan[]; products: BootstrapProduct[]; featured: BootstrapContent | null;
};

export function getBootstrap() { return apiRequest<BootstrapData>("/auth/bootstrap"); }
