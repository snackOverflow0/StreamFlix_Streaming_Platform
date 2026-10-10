import { apiRequest } from "./api-client";
export type WatchListItem = { list_id: number; user_id: number; content_id: number; episode_id: number | null; progress: number | null; date_added: string; watchlist_status: string };
export function getWatchList(userId: number) { return apiRequest<WatchListItem[]>(`/watch-list/user/${userId}`); }
export function addWatchList(userId: number, contentId: number, episodeId: number | null = null) { return apiRequest<WatchListItem>(`/watch-list/user/${userId}`, { method: "POST", body: JSON.stringify({ content_id: contentId, episode_id: episodeId, progress: 0, watchlist_status: "planned" }) }); }
export function updateWatchList(listId: number, data: Partial<Pick<WatchListItem, "progress" | "watchlist_status">>) { return apiRequest<WatchListItem>(`/watch-list/${listId}`, { method: "PATCH", body: JSON.stringify(data) }); }
export function deleteWatchList(listId: number) { return apiRequest<void>(`/watch-list/${listId}`, { method: "DELETE" }); }
