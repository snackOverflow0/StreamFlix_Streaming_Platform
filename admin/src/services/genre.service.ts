import { apiRequest } from "./api-client";

export type Genre = { genre_id: number; genre_name: string };

export function getGenres() {
  return apiRequest<Genre[]>("/genres");
}
