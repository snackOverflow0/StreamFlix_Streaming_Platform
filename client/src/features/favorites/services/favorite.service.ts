import { apiRequest } from "@/services/api-client";
export type Favorite = { fav_id: number; user_id: number; profile_id: number; content_id: number; date_added: string };
export function getMyFavorites(profileId: number) { return apiRequest<Favorite[]>(`/favorites/me?profile_id=${profileId}`); }
export function createFavorite(contentId: number, profileId: number) { return apiRequest<Favorite>("/favorites", { method: "POST", body: JSON.stringify({ content_id: contentId, profile_id: profileId }) }); }
export function deleteFavorite(favoriteId: number, profileId: number) { return apiRequest<void>(`/favorites/${favoriteId}?profile_id=${profileId}`, { method: "DELETE" }); }
