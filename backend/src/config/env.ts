import "dotenv/config";

function requireEnv(name: string): string { const value = process.env[name]?.trim(); if (!value) throw new Error(`${name} is missing`); if(name==="SUPABASE_SECRET_KEY"&&value.startsWith("sb_publishable_"))throw new Error("Use your server secret in backend/.env, not a publishable key"); if (value.startsWith("REPLACE_")) throw new Error(`${name}: set your server secret in backend/.env (never the publishable key)`); return value; }
export const env = {
  port: Number(process.env.PORT ?? 4000),
  frontendOrigins: (process.env.FRONTEND_URL ?? "http://localhost:5173").split(",").map((item) => item.trim()).filter(Boolean),
  supabaseUrl: requireEnv("SUPABASE_URL"),
  supabaseSecretKey: requireEnv("SUPABASE_SECRET_KEY"),
};
if (!Number.isInteger(env.port) || env.port <= 0 || env.port > 65535) throw new Error("PORT must be a valid TCP port");
