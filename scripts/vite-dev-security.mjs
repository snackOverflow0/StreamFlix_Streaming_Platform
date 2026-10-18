/**
 * Shared development-only security headers for the StreamFlix Vite apps.
 * Production headers are configured separately in each deployment config.
 */
export function developmentSecurity() {
  return {
    name: "streamflix-development-security",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        res.setHeader("X-Frame-Options", "SAMEORIGIN");
        res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
        next();
      });
    },
  };
}
