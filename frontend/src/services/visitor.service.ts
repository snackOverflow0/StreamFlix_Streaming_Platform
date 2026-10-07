import { API_URL } from "./api-client";

export async function trackVisitor() {
  const response = await fetch(`${API_URL}/visitors/visit`, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Visitor tracking failed");
  return response.json() as Promise<{ uniqueVisitors: number }>;
}
