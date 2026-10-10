import { apiRequest } from "@/services/api-client";
export type ViewHistory = { history_id: number; user_id: number; profile_id: number | null; content_id: number; episode_id: number | null; watch_date: string; progress_percentage: number };
export function getMyViewHistory(profileId: number) { return apiRequest<ViewHistory[]>(`/view-history/me?profile_id=${profileId}`); }
export function saveViewProgress(contentId: number, progressPercentage: number, episodeId: number | null, profileId: number) { return apiRequest<ViewHistory>("/view-history/progress", { method: "POST", body: JSON.stringify({ profile_id: profileId, content_id: contentId, episode_id: episodeId, progress_percentage: progressPercentage }) }); }
