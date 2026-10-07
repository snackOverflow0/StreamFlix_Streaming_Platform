import { apiRequest } from "@/services/api-client";

export type Notification = { notification_id: number; user_id: number; type: string; title: string; message: string; is_read: boolean; created_at: string };
export function markNotificationRead(id: number) { return apiRequest<Notification>(`/notifications/${id}/read`, { method: "PATCH" }); }
export function markAllNotificationsRead() { return apiRequest<{ success: boolean }>("/notifications/read-all", { method: "PATCH" }); }
