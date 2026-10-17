/* Bad-word filter for reviews (English + Filipino). Matches common spellings and l33t substitutions,
   e.g. "f*ck", "sh1t", "put@ngina". The backend runs the same check, so the API can't be bypassed. */
const WORDS = ["fuck", "fck", "fuk", "shit", "bitch", "asshole", "bastard", "dick", "pussy", "cunt", "slut", "whore", "motherfucker", "nigger", "nigga", "retard",
  "putangina", "puta", "tangina", "tangna", "gago", "gaga", "tanga", "bobo", "ulol", "tarantado", "leche", "pakyu", "kupal", "punyeta", "hinayupak", "tarantada", "inutil", "pokpok", "kantot", "titi", "puke", "burat"];
const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "@": "a", "$": "s", "5": "s", "7": "t", "!": "i", "*": "" };
const norm = (s: string) => s.toLowerCase().replace(/[01345@$7!*]/g, c => LEET[c] ?? c).replace(/(.)\1{2,}/g, "$1$1");
const RE = new RegExp(`(^|[^a-z])(${WORDS.join("|")})(?=[^a-z]|$)`, "i");
export function hasProfanity(text: string) { return RE.test(norm(text)) || RE.test(norm(text).replace(/[^a-z\s]/g, "")); }
