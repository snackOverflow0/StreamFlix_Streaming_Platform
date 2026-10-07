import { apiRequest } from "@/services/api-client";
export type RecommendationResponse = { becauseYouWatched: any[]; basedOnYourGenres: any[]; recommendedForYou: any[] };
export function getRecommendations() { return apiRequest<RecommendationResponse>("/recommendations"); }
