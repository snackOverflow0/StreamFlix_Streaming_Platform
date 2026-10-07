# StreamFlix Admin Integration

The administrator workspace from the separate admin package is integrated into the current StreamFlix application instead of replacing the current frontend/backend.

## Integrated

- `/admin` route inside the existing React application
- Supabase-authenticated administrator login (email/password + Google OAuth)
- Administrator role check through `public.admin_roles`
- Admin bootstrap and management APIs under `/api/admin`
- Dashboard, analytics, catalog, movies, TV series, seasons, episodes, genres, licensing, media assets, archived content, users, subscriptions, plans, feedback, reviews, merchandise, orders, and settings workspaces
- Signed media upload flow, including resumable TUS uploads for large files
- Private `streamflix-videos` bucket for playback files
- Public `streamflix-media` bucket for artwork and supported generic media assets
- Content visibility toggle and archive/restore support
- Current merchandise `stock_quantity` schema and billing/order schema preserved
- Current frontend routing, StreamFlix user experience, cookies, playback, recommendations, watchlist, favorites, reviews, feedback, and commerce code preserved

## Intentionally not merged

The admin archive also contained a second copy of the whole frontend/backend application, an older application shell and routes, mock/design preview files, demo/academic SQL scripts, duplicate seeds, duplicate configuration/package manifests, and unrelated setup documents. Those were excluded so the current project remains the source of truth.

## Supabase setup

Apply:

`supabase/migrations/20261007210000_streamflix_admin_workspace.sql`

Then grant administrator access to an existing Supabase Auth user with the SQL in `ADMIN_SETUP.md`.
