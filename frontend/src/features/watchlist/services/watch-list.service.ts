import { apiRequest } from "@/services/api-client";
export type WatchListItem = { list_id: number; user_id: number; content_id: number; episode_id: number | null; progress: number | null; date_added: string; watchlist_status?: string };
export function getMyWatchList() { return apiRequest<WatchListItem[]>("/watch-list/me"); }
export function addWatchList(contentId: number, episodeId: number | null = null) { return apiRequest<WatchListItem>("/watch-list", { method: "POST", body: JSON.stringify({ content_id: contentId, episode_id: episodeId, progress: 0 }) }); }
export function updateWatchList(listId: number, data: Partial<Pick<WatchListItem, "progress">>) { return apiRequest<WatchListItem>(`/watch-list/${listId}`, { method: "PATCH", body: JSON.stringify(data) }); }
export function deleteWatchList(listId: number) { return apiRequest<void>(`/watch-list/${listId}`, { method: "DELETE" }); }
