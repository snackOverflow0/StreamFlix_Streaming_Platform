# StreamFlix v24 — Frontend Redesign & UX Upgrade

## Scope

This pass builds on the existing StreamFlix v23 baseline instead of replacing working Supabase/Auth/Stripe/Brevo/merchandise behavior.

## Implemented

- Reorganized the active frontend into feature-oriented modules for movies, player, search, notifications, favorites, watchlist, reviews, profiles, recommendations, and subscriptions.
- Removed unused duplicate page/layout/media implementations and unused frontend service/lib files.
- Added a cinematic Netflix-style hero using the existing DB-driven `hero_url`/poster assets.
- Added horizontal rows with touch scrolling, desktop navigation arrows, lazy sections, and hover-safe vertical breathing room.
- Rebuilt movie cards with a 300ms hover-open / 180ms close interaction, scale/elevation, metadata, description, Play, Watchlist, and Favorite actions. Mobile keeps actions accessible without relying on hover.
- Added a dedicated custom player overlay with play/pause, seek ±10s, volume, progress, playback speed, fullscreen, optional browser remote/cast support, resume playback, auto-hiding controls, keyboard shortcuts, buffering and playback error UI.
- Kept playback delivery on the existing `trailer_url` field; no `video_url` or `is_featured` field was introduced.
- Added real Continue Watching progress persistence with reduced save frequency to avoid per-second network traffic.
- Added explicit Trending/Top 10 presentation while avoiding claims that cannot be supported by current data. The Top 10 row is based on current catalog engagement signals because the current schema does not contain a Philippines-specific audience ranking feed.
- Kept recommendation priority near the top of the homepage: Continue Watching, Because You Watched, Recommended For You, Based on Your Genres, Trending, then supporting rows.
- Added debounced local catalog search (300ms), suggestions, recent searches, input length limits, and no per-keystroke API traffic.
- Moved notifications into a reusable feature component while retaining Supabase Realtime updates and mark-read/mark-all-read behavior.
- Added review and feedback submitting states, character limits, and visible success/error feedback.
- Tightened profile editing/creation to 2–20 characters, server validation, and controlled automatically detected device labels.
- Added a backend `/profiles/me` creation endpoint so profile creation derives the authenticated app user server-side rather than trusting a client-supplied user id.
- Added stricter search/review/feedback API rate limits in addition to the existing general/mutation/auth limits.
- Added proxy awareness and additional security response headers.
- Added database constraints/indexes for profile bounds, notifications, subscriptions, and payment-session lookups.
- Preserved existing backend ownership checks, Supabase Auth, 401 refresh/retry behavior, Stripe webhook authority, Brevo confirmation flow, merchandise stock transactions, realtime notifications, and visitor aggregation.

## Verification

- TypeScript transpile/syntax check: **188 frontend/backend `.ts/.tsx` files checked, 0 syntax failures** (declaration files excluded because `transpileModule` cannot emit `.d.ts`).
- Local frontend import resolution: **117 files checked, 0 broken local imports**.
- `git diff --check`: passed.
- `npm run build`: blocked by the current environment's incomplete frontend dependency/type-definition tree (`TS2688` for missing React/Node/d3/etc. type definitions). This is an environment/dependency installation issue, not a source syntax result.
- `npm run lint`: blocked because the local `eslint` executable is not installed in the available dependency tree.
- `npm ci --ignore-scripts --no-audit --no-fund` could not complete before the execution transport timeout, so the dependency tree was not repaired inside this environment.

## Data-model notes

- The current application follows the actual StreamFlix database column `content.cast` in active backend/frontend code. The historical `20260913122724_remote_schema.sql` snapshot still contains `cast_info`; it is not treated as the current runtime contract.
- No `is_featured` or `video_url`/`videoUrl` field was added.
- The current schema does not provide a country-specific popularity/ranking table, so the new Top 10 visual is intentionally labeled `Top 10 on StreamFlix` rather than fabricating a Philippines-specific metric.

## Production follow-up

Run a clean `npm ci`, then `npm run build` and `npm run lint` in the target deployment environment. Verify Stripe webhook delivery, Brevo delivery, Supabase RLS/realtime, HLS/MP4 delivery, and multi-device profile limits against the real production configuration before release.
