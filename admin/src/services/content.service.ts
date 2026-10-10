import { apiRequest } from "./api-client";

export type Content = {
  content_id: number;
  genre_id: number;
  license_id: number;
  title: string;
  description: string;
  release_date: string;
  director: string | null;
  cast: string | null;
  synopsis: string;
  type: string;
  age_rating: string;
  created_at: string;
  deleted_at: string | null;
  trailer_url: string | null;
};

export function getContent() {
  return apiRequest<Content[]>("/content");
}

export function getContentById(contentId: number) {
  return apiRequest<Content>(`/content/${contentId}`);
}

export function searchContent(query: string) {
  const params = new URLSearchParams({ q: query });
  return apiRequest<Content[]>(`/content/search?${params.toString()}`);
}
