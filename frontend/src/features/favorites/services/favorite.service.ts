import { apiRequest } from "@/services/api-client";
export type Favorite = { fav_id: number; user_id: number; content_id: number; date_added: string };
export function getMyFavorites() { return apiRequest<Favorite[]>("/favorites/me"); }
export function createFavorite(contentId: number) { return apiRequest<Favorite>("/favorites", { method: "POST", body: JSON.stringify({ content_id: contentId }) }); }
export function deleteFavorite(favoriteId: number) { return apiRequest<void>(`/favorites/${favoriteId}`, { method: "DELETE" }); }
