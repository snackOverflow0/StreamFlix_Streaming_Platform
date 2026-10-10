import { apiRequest } from "./api-client";
export type Favorite = { fav_id: number; user_id: number; content_id: number; date_added: string };
export function getFavoritesByUser(userId: number) { return apiRequest<Favorite[]>(`/favorites/user/${userId}`); }
export function createFavorite(userId: number, contentId: number) { return apiRequest<Favorite>(`/favorites/user/${userId}`, { method: "POST", body: JSON.stringify({ content_id: contentId }) }); }
export function deleteFavorite(favoriteId: number) { return apiRequest<void>(`/favorites/${favoriteId}`, { method: "DELETE" }); }
