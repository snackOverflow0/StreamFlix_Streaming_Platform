import { apiRequest } from "./api-client";

export type Episode = {
  episode_id: number;
  season_id: number;
  episode_number: number;
  episode_title: string;
  duration: number;
  release_date: string;
  video_url?: string | null;
};

export function getEpisodesBySeason(seasonId: number) {
  return apiRequest<Episode[]>(`/episodes/season/${seasonId}`);
}
