const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const ENV = {
  apiUrl: apiUrl.replace(/\/$/, ""),
} as const;
