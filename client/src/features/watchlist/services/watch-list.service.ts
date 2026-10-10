import { apiRequest } from "@/services/api-client";
export type WatchListItem = { list_id: number; user_id: number; profile_id: number; content_id: number; episode_id: number | null; progress: number | null; date_added: string; watchlist_status?: string };
export function getMyWatchList(profileId: number) { return apiRequest<WatchListItem[]>(`/watch-list/me?profile_id=${profileId}`); }
export function addWatchList(contentId: number, profileId: number, episodeId: number | null = null) { return apiRequest<WatchListItem>("/watch-list", { method: "POST", body: JSON.stringify({ content_id: contentId, profile_id: profileId, episode_id: episodeId, progress: 0 }) }); }
export function updateWatchList(listId: number, profileId: number, data: Partial<Pick<WatchListItem, "progress">>) { return apiRequest<WatchListItem>(`/watch-list/${listId}?profile_id=${profileId}`, { method: "PATCH", body: JSON.stringify(data) }); }
export function deleteWatchList(listId: number, profileId: number) { return apiRequest<void>(`/watch-list/${listId}?profile_id=${profileId}`, { method: "DELETE" }); }
