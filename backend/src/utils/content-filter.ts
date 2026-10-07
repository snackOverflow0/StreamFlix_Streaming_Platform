const BLOCKED_TERMS = [
  "fuck", "fucker", "fucking", "motherfucker", "shit", "shitty",
  "bitch", "bastard", "asshole", "dickhead", "cocksucker", "piss",
  "slut", "whore", "nigger", "faggot",
];

const substitutions: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s",
};

export function normalizeUserText(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[013457@$]/g, (char) => substitutions[char] ?? char)
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findBlockedTerm(value: string) {
  const normalized = normalizeUserText(value);
  const padded = ` ${normalized} `;
  return BLOCKED_TERMS.find((term) => padded.includes(` ${term} `)) ?? null;
}

export function assertReviewIsAllowed(value: string | null | undefined) {
  if (!value) return;
  const term = findBlockedTerm(value);
  if (term) {
    const error = new Error("Your review contains language that is not allowed. Please revise it and try again.");
    (error as Error & { statusCode?: number; code?: string }).statusCode = 422;
    (error as Error & { statusCode?: number; code?: string }).code = "REVIEW_LANGUAGE_NOT_ALLOWED";
    throw error;
  }
}
