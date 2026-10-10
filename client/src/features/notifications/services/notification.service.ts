import { apiRequest } from "@/services/api-client";

export type Notification = { notification_id: number; user_id: number; profile_id: number | null; type: string; title: string; message: string; is_read: boolean; created_at: string };
export function markNotificationRead(id: number, profileId: number) { return apiRequest<Notification>(`/notifications/${id}/read?profile_id=${profileId}`, { method: "PATCH" }); }
export function markAllNotificationsRead(profileId: number) { return apiRequest<{ success: boolean }>(`/notifications/read-all?profile_id=${profileId}`, { method: "PATCH" }); }
