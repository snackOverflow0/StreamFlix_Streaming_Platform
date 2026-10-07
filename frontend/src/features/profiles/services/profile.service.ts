import { apiRequest } from "@/services/api-client";
export type Profile = { profile_id: number; user_id: number; profile_name: string; avatar_url: string | null; device: string | null; created_at: string };
export function createProfile(data: Pick<Profile, "profile_name" | "avatar_url" | "device">) { return apiRequest<Profile>("/profiles/me", { method: "POST", body: JSON.stringify(data) }); }
export function updateProfile(profileId: number, data: Partial<Pick<Profile, "profile_name" | "avatar_url" | "device">>) { return apiRequest<Profile>(`/profiles/${profileId}`, { method: "PATCH", body: JSON.stringify(data) }); }
export function deleteProfile(profileId: number) { return apiRequest<void>(`/profiles/${profileId}`, { method: "DELETE" }); }
