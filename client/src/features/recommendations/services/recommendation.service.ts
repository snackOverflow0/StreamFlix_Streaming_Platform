import { apiRequest } from "@/services/api-client";
export type RecommendationResponse = { becauseYouWatchedSource?: {content_id:number;title:string;genre_id:number} | null; becauseYouWatched: any[]; basedOnYourGenres: any[]; recommendedForYou: any[] };
export function getRecommendations(profileId: number) { return apiRequest<RecommendationResponse>(`/recommendations?profile_id=${profileId}`); }
