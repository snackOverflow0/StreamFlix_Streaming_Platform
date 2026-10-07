# StreamFlix Backend

Express + TypeScript backend for the StreamFlix Supabase/PostgreSQL database. The backend is the source of truth for application data consumed by the frontend.

## Responsibilities

- Validate Supabase access tokens
- Resolve the authenticated user to `public.users`
- Bootstrap account, profile, subscription, catalog, favorites, watch list, view history, reviews, plans, and merchandise data
- Read all content metadata and server-side presentation metadata
- Save playback progress to `view_history`
- Create/update reviews with 1–5 rating validation
- Protect user-owned records with backend ownership checks
- Serve the StreamFlix artwork bundle at `/streamflix/*`

## Folder structure

```text
src/
├── config/
├── middleware/
├── modules/
│   ├── auth/
│   ├── content/
│   ├── genres/
│   ├── seasons/
│   ├── episodes/
│   ├── users/
│   ├── profiles/
│   ├── subscriptions/
│   ├── members/
│   ├── favorites/
│   ├── watch-list/
│   ├── reviews/
│   ├── view-history/
│   ├── feedback/
│   └── merchandise/
├── utils/
├── app.ts
└── server.ts
```

## Environment

Create `.env` from `.env.example`:

```env
PORT=4000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://qlpyjglxifzwvcxrkaqo.supabase.co
SUPABASE_SECRET_KEY=YOUR_SERVER_ONLY_SECRET_KEY
```

`SUPABASE_SECRET_KEY` must stay on the backend. Never expose it in frontend code or a `VITE_` variable.

`FRONTEND_URL` accepts a comma-separated list of allowed frontend origins.

## Run

```cmd
npm install
npm run dev
```

API health check:

```text
GET http://localhost:4000/api/health
```

Database connectivity check:

```text
GET http://localhost:4000/api/test-db
```

## Auth bootstrap endpoint

```text
GET /api/auth/me
GET /api/auth/bootstrap
```

`/api/auth/bootstrap` is the main authenticated payload used by the frontend. It returns the current StreamFlix application user and the backend-loaded data required to render the app.

## Important authenticated endpoints

```text
GET  /api/content
GET  /api/genres
GET  /api/seasons/content/:contentId
GET  /api/episodes/season/:seasonId
GET  /api/reviews/ratings
GET  /api/reviews/content/:contentId
POST /api/reviews
GET  /api/view-history/me
POST /api/view-history/progress
GET  /api/favorites/user/:userId
POST /api/favorites/user/:userId
DELETE /api/favorites/:favoriteId
GET  /api/watch-list/user/:userId
POST /api/watch-list/user/:userId
PATCH /api/watch-list/:listId
DELETE /api/watch-list/:listId
GET  /api/profiles/user/:userId
POST /api/profiles/user/:userId
DELETE /api/profiles/:profileId
GET  /api/subscriptions/plans
POST /api/subscriptions/user/:userId
GET  /api/merchandise/products
GET  /api/merchandise/transactions/user/:userId
POST /api/merchandise/transactions/user/:userId
POST /api/feedback
```

## Authentication architecture

Supabase Auth owns login identity, password handling, sessions, and Google OAuth. StreamFlix `public.users` continues to hold application/business data. The current bridge resolves the `public.users` record by the authenticated Supabase email and automatically creates the application row when a newly authenticated Supabase user does not yet have one.

The backend never sends its Supabase secret key to the browser.
