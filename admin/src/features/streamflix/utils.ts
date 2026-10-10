import type { Content, ViewerProfile } from "./types";

export function getViewingMeta(item: Content) {
  return item.type === "Series" ? `Series • ${item.duration}` : item.duration;
}

export function formatDateAdded(value?: string) {
  const parsedDate = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate);
}

export function getEpisodeReleaseDate(item: Content, _season: number, _episodeIndex: number) {
  return item.year.toString();
}

export function getProfileRole(profile: ViewerProfile) {
  return profile.isKids ? "Kids profile" : "Member profile";
}

export async function notify(type: "success" | "info", message: string) {
  const { toast } = await import("sonner");
  toast[type](message);
}
