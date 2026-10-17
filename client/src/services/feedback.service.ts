import { apiRequest } from "./api-client";
export type Feedback = { feedback_id: number; user_id: number | null; subject: string; message: string; created_date: string; type: string; status: string };
export function createFeedback(subject: string, message: string, type = "general") { return apiRequest<Feedback>("/feedback", { method: "POST", body: JSON.stringify({ subject, message, type }) }); }
export function getMyFeedback(userId: number) { return apiRequest<Feedback[]>(`/feedback/user/${userId}`); }
