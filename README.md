# StreamFlix — integrated project

This archive contains three coordinated applications:

- `client/` — customer streaming interface (Vite/React/TypeScript)
- `admin/` — admin dashboard (Vite/React/TypeScript)
- `backend/` — Express/TypeScript API; Supabase/PostgreSQL is the source of truth

`StreamFlix Client Prototype.html` is a visual/interaction reference, not a production data source. The production client retains the React application and connects its catalog, authentication, profiles, reviews, playback progress, subscriptions, and merchandise workflows to Supabase through the Express API. Prototype-only sample titles and fake actions are not imported.

## Prerequisites

- Node.js 22+
- A configured Supabase project with the StreamFlix schema and required RLS/policies
- Stripe test credentials and webhook setup if testing card checkout

## Configure environment files

Copy the example files and fill them with your own project credentials:

- `client/.env.example` → `client/.env`
- `admin/.env.example` → `admin/.env`
- `backend/.env.example` → `backend/.env`

Use the same Supabase project URL and publishable key in both frontends. The backend requires the server-only Supabase secret key. Never put the secret key in a `VITE_` variable or commit `.env` files.

For local development, the API URL is `http://localhost:4000/api`. Set `FRONTEND_URL=http://localhost:5173,http://localhost:5174` in `backend/.env`. For hosted deployments, set each frontend's `VITE_API_URL` to the HTTPS backend API base and add the deployed frontend origins to `FRONTEND_URL`. Configure the backend host to bind to `0.0.0.0` where required by the hosting platform.

## Start locally (Windows Command Prompt)

Open three terminals:

**Terminal 1 — backend**
```cmd
cd backend
npm install
npm run dev
```
API health: http://localhost:4000/api/health
Database readiness: http://localhost:4000/api/ready

**Terminal 2 — client**
```cmd
cd client
npm install
npm run dev
```
Client: http://localhost:5173

**Terminal 3 — admin**
```cmd
cd admin
npm install
npm run dev
```
Admin: http://localhost:5174

The backend must be running and configured before authenticated app data can load. The `/api/health` endpoint checks the server process only; `/api/ready` checks database readiness.

## Supabase and OAuth

1. Configure the StreamFlix schema and required SQL migrations in Supabase before running the app. Review each migration before applying it to an existing database.
2. In Supabase Auth URL Configuration, add the local client callback `http://localhost:5173/oauth/callback` and the exact deployed client callback.
3. For Google OAuth, configure the Supabase callback URL shown in the Supabase dashboard with your Google OAuth credentials.
4. Keep user-facing access controlled by Supabase Auth and server-side backend authorization/RLS.

## Stripe

Use Stripe test keys first. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` only in the backend environment. Configure the webhook endpoint at `/api/payments/webhook` for the events required by `backend/src/stripe-webhook.ts` and `backend/src/payments.routes.ts`. Checkout requires a valid backend configuration; setting frontend keys alone does not enable payments.

## Validation

Run each app's build separately after installing dependencies:

```cmd
cd backend
npm run build
cd ..\client
npm run build
cd ..\admin
npm run build
```

The source archive does not include installed `node_modules` or your private environment credentials. Live Supabase, OAuth, and Stripe behavior must be tested against your own configured services.
