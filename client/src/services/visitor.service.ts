import { API_URL } from "./api-client";
export async function trackVisitor() {
 let key = localStorage.getItem("streamflix-visitor-key");
 if (!key) { key = crypto.randomUUID(); localStorage.setItem("streamflix-visitor-key", key); }
 const response = await fetch(`${API_URL}/visitors/visit`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({visitor_key:key})});
 if (!response.ok) throw new Error("Visitor tracking failed");
 return response.json() as Promise<{uniqueVisitors:number}>;
}
