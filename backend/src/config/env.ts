import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is missing`);
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),

  frontendOrigins: (process.env.FRONTEND_URL ?? "http://localhost:5173")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),

  supabaseUrl: requireEnv("SUPABASE_URL"),

  supabaseSecretKey: requireEnv("SUPABASE_SECRET_KEY"),

  stripeSecretKey: requireEnv("STRIPE_SECRET_KEY"),
};

if (
  !Number.isInteger(env.port) ||
  env.port <= 0 ||
  env.port > 65535
) {
  throw new Error("PORT must be a valid TCP port");
}