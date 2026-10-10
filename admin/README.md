# StreamFlix Frontend

This frontend is backend-driven. The browser uses Supabase Auth only for authentication/session handling. Application data is read and written through the StreamFlix Express backend.

## Data flow

```text
Supabase Auth
   ↓ access token
React/Vite frontend
   ↓ Authorization: Bearer <token>
Express backend
   ↓ server-only Supabase client
StreamFlix PostgreSQL tables
```

The frontend no longer uses a hardcoded movie catalog, hardcoded plans, hardcoded merchandise list, fake ratings, or fake login state.

## Environment

Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:4000/api
VITE_SUPABASE_URL=https://qlpyjglxifzwvcxrkaqo.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Only the Supabase publishable key belongs in a `VITE_` variable. Never place the service-role/secret key here.

## Supabase Auth configuration

For local development, add this Redirect URL in Supabase Authentication → URL Configuration:

```text
http://localhost:5173/oauth/callback
```

For Google OAuth, the Google Cloud OAuth application's authorized redirect URI is the Supabase callback URL:

```text
https://qlpyjglxifzwvcxrkaqo.supabase.co/auth/v1/callback
```

The frontend itself redirects to `/oauth/callback`; Supabase completes the OAuth exchange and the app then loads the authenticated StreamFlix data from `/api/auth/bootstrap`.

## Run

```cmd
npm install
npm run dev
```

The default frontend is:

```text
http://localhost:5173
```

## Supported frontend features

- Supabase email/password login
- Supabase signup
- Supabase Google OAuth
- Backend bootstrap after authentication
- Backend content catalog and presentation data
- Backend ratings and review counts
- Backend seasons and episodes
- Backend Continue Watching progress via `view_history`
- Backend favorites and watch list
- Backend profiles
- Backend subscriptions and plans
- Backend merchandise and transaction history
- Backend feedback
- Supabase session persistence and sign-out

A real payment gateway is not included. Selecting a subscription activates a database subscription record for the project/demo, and merchandise checkout records transactions in the backend database without charging a real payment provider.
