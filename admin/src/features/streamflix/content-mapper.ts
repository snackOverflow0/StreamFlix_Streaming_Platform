import { CATALOG } from "./data";
import type { Content } from "./types";

type ContentRecord = {
  content_id: number;
  genre_id: number;
  license_id: number;

  title: string;
  description: string | null;
  release_date: string | null;

  director: string | null;
  cast: string | null;
  synopsis: string | null;

  type: string;
  age_rating: string;

  created_at: string;
  deleted_at: string | null;

  trailer_url: string | null;
};

type GenreRecord = {
  genre_id: number;
  genre_name: string;
};

function getSafeTrailerUrl(
  value: string | null,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol !== "https:") {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}

/*
 * IMPORTANT:
 *
 * First try content ID.
 * This keeps the existing local posters,
 * previews, ratings, duration, etc.
 *
 * Title is only a fallback.
 */
const presentationById = new Map(
  CATALOG.map((item) => [
    item.id,
    item,
  ]),
);

const presentationByTitle = new Map(
  CATALOG.map((item) => [
    item.title.trim().toLowerCase(),
    item,
  ]),
);

function parseCast(
  value: string | null,
): string[] | undefined {
  if (!value) {
    return undefined;
  }

  const cast = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return cast.length > 0
    ? cast
    : undefined;
}

function normalizeType(
  value: string,
): Content["type"] {
  return value.trim().toLowerCase() ===
    "series"
    ? "Series"
    : "Movie";
}

export function mapContentRecord(
  record: ContentRecord,
  genres: GenreRecord[],
): Content {
  /*
   * Match presentation data by database ID first.
   */
  const presentation =
    presentationById.get(
      record.content_id,
    ) ??
    presentationByTitle.get(
      record.title.trim().toLowerCase(),
    );

  const releaseYear = Number.parseInt(
    record.release_date?.slice(0, 4) ?? "",
    10,
  );

  const genre = genres.find(
    (item) =>
      item.genre_id === record.genre_id,
  );

  return {
    /*
     * DATABASE DATA
     */
    id: record.content_id,

    title: record.title,

    description:
      record.description ??
      record.synopsis ??
      presentation?.description ??
      "",

    synopsis:
      record.synopsis ??
      record.description ??
      presentation?.synopsis ??
      presentation?.description ??
      "",

    type: normalizeType(record.type),

    year: Number.isNaN(releaseYear)
      ? presentation?.year ?? 0
      : releaseYear,

    maturity: record.age_rating,

    cast:
      parseCast(record.cast) ??
      presentation?.cast,

    /*
     * PRESENTATION DATA
     *
     * Keep the existing local UI images
     * and metadata.
     */
    poster:
      presentation?.poster ??
      "/streamflix/logo.png",

    preview:
      presentation?.preview,

    rating:
      presentation?.rating ?? 0,

    reviewCount:
      presentation?.reviewCount ?? 0,

    duration:
      presentation?.duration ?? "",

    license:
      presentation?.license ??
      "Available on StreamFlix",

    genre:
      genre?.genre_name ??
      presentation?.genre ??
      "Uncategorized",

    /*
     * DATABASE TRAILER
     *
     * Supabase:
     * trailer_url
     *
     * Frontend:
     * trailerUrl
     */
    trailerUrl:
      getSafeTrailerUrl(
        record.trailer_url,
      ),

    /*
     * Keep any existing presentation
     * progress as a fallback.
     */
    progress:
      presentation?.progress ?? 0,
  };
}