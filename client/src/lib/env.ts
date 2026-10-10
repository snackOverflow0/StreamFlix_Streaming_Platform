const apiUrl =
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000/api";

const stripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

export const ENV = {
  apiUrl: apiUrl.replace(/\/$/, ""),
  stripePublishableKey,
} as const;