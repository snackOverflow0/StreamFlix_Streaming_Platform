// Conservative catalog policy: ambiguous, parental-guidance and missing ratings are excluded.
const kidsRatings = new Set(['G', 'TV-Y', 'TV-Y7', 'TV-Y7-FV', 'TV-G', 'U', 'ALL', '0+', '6+', '7+']);
export function isKidsSuitable(rating: unknown, approved = false): boolean {
  return typeof rating === 'string' && ((approved === true && rating.trim().toUpperCase() === 'PG') || kidsRatings.has(rating.trim().toUpperCase().replace(/\s+/g, '')));
}
