import { apiRequest } from "./api-client";

export type Season = {
  season_id: number;
  content_id: number;
  season_number: number;
  season_title: string | null;
  release_date: string;
};

export function getSeasonsByContent(contentId: number) {
  return apiRequest<Season[]>(`/seasons/content/${contentId}`);
}
