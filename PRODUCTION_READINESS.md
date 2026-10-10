# StreamFlix production readiness — 9 October 2026

This package is hardened for staging. Public production sign-off still requires a deployed HTTPS environment, real browser tests, Stripe test-mode end-to-end tests and measured load tests.

## Changes

- API requests have generated request IDs, private no-store responses, bounded per-IP limits (300/minute), safe structured production request/error logs, and a Retry-After response on limits. The webhook is exempt so Stripe retries are not blocked. Supabase Auth handles login directly: configure its own rate limits and CAPTCHA separately.
- Public database diagnostic endpoint removed; readiness exposes status rather than database internals.
- HTTP response CSP now includes frame-ancestors; removed the ineffective meta directive. Static server retains ETags, immutable fingerprinted assets, gzip and media range support.
- Frontend bundles split into application, Supabase, UI and icons. This improves reuse of cached dependencies; total first-load download still needs real measurement.
- Backend has finite HTTP timeouts and SIGTERM/SIGINT drain with a ten-second deadline.
- Existing admin role checks, ownership tests and conservative Kids playback rules retained. Kids profiles use name detection, and do not provide parental PIN protection.

## Deploy

1. Keep backend secret keys only in server environment variables. Build frontend with the intended VITE_API_URL and Supabase publishable key; check each app's .env.example for names. Never include backend/.env in source control or public images. Use locked installs: npm ci in all three applications, then npm run build and node scripts/compress-assets.mjs from the root.
2. Serve client/dist and admin/dist through an HTTPS static host/CDN. Copy the CSP from scripts/frontend-server.mjs to host response headers, substituting your exact HTTPS API origin for localhost:4000. Replace the corresponding API origin in each index.html meta CSP too: both policies apply. Set HTML no-cache and hashed assets immutable for one year. Keep private API responses and signed media URL responses out of shared caches.
3. Run backend/dist/server.js with NODE_ENV=production, HOST=0.0.0.0, PORT and FRONTEND_URL set to the exact client/admin HTTPS origins. CLIENT_URL must be the real client origin for payment redirects. Configure TRUST_PROXY only with your own reverse proxy addresses/CIDRs; never trust all forwarded headers. Keep the backend inaccessible except through that proxy. The bundled Windows launcher is for local use.
4. Enable TLS and HSTS on the ingress, body limits, shared rate limits, request timeouts, and process/container restart policies. Forward X-Request-ID to the log collector. Never log Authorization, payment payloads or personal data.
5. Use /api/health for process liveness and /api/ready for database readiness. Alert on 5xx, latency, readiness failure, worker failures and undelivered email. Validate alerts with a deliberate staging failure.
6. Start with one backend instance. Cache, request limits and change-event fanout are process-local. Before replicas, add a shared limiter and event bus, and verify checkout/email worker lease behavior. Do not claim horizontal scaling until this is tested.
7. Configure real Stripe test-mode webhook endpoint and secret; test signature rejection, success, declined payment, expired reservation and duplicate webhook delivery before switching to live mode. A build does not verify payments.
8. Enable Supabase backups/PITR as appropriate to the plan, test restoring into a separate project, document RPO/RTO, and retain the prior release for rollback. Never test restore against production.

## Live database audit

Supabase security advisors reported no critical warnings, but leaked-password protection is disabled. Enable it in Auth settings: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

Six service-only tables have RLS enabled without policies: admin_uploads, email_delivery_log, integration_checkouts, payment_transactions, site_visitors and transactional_email_outbox. Keep them inaccessible to browser roles; no blanket public policies should be added.

Performance advisors reported 14 unindexed foreign keys, five duplicate index groups, two per-row auth policy evaluations and four overlapping policy findings. Review a migration against actual query plans in staging; do not remove unique indexes blindly. Advisor links:
- https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys
- https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan
- https://supabase.com/docs/guides/database/database-linter?lint=0009_duplicate_index

No live schema or Auth configuration was changed by this update.

## Release checks

Run backend build, admin-security-check.mjs, kids-profile-check.mjs and client-library-check.mjs from backend; run scripts/production-check.mjs from root; build client and admin. Then perform browser acceptance tests and a staging load test of browse, search, playback and checkout. Record p95 latency, errors and resource use against an explicit target before production approval.
