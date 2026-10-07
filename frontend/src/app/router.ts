import type { View } from "@/features/streamflix/types";

export function getViewTitle(view: View, query: string) {
  if (query) return `Search results for “${query}”`;
  if (view === "my-list") return "My List";
  if (view === "shows") return "TV Shows";
  if (view === "new-releases") return "New Releases";
  if (view === "store") return "Merch Hub";
  return "Movies";
}
