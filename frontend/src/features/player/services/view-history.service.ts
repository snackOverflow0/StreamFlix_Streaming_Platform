import { apiRequest } from "@/services/api-client";
export type ViewHistory = { history_id: number; user_id: number; content_id: number; episode_id: number | null; watch_date: string; progress_percentage: number };
export function getMyViewHistory() { return apiRequest<ViewHistory[]>("/view-history/me"); }
export function saveViewProgress(contentId: number, progressPercentage: number, episodeId: number | null = null) { return apiRequest<ViewHistory>("/view-history/progress", { method: "POST", body: JSON.stringify({ content_id: contentId, episode_id: episodeId, progress_percentage: progressPercentage }) }); }
