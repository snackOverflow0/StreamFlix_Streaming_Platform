# StreamFlix Admin

The admin dashboard is a separate React + TypeScript + Vite application. It uses Supabase Auth for sessions and calls the Express backend for administrative data and mutations. Authorization is enforced by the backend; hiding admin controls in the UI is not a security boundary.

## Environment

Copy `.env.example` to `.env` and set:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
VITE_API_URL=http://localhost:4000/api
```

Only a Supabase publishable key belongs in frontend variables. Never place a Supabase secret/service-role key in the admin app.

## Run locally

Start the backend first, then from this folder:

```cmd
npm install
npm run dev
```

Vite uses port `5174` by default: http://localhost:5174

## Deployment

Set `VITE_API_URL` to the deployed backend's HTTPS API base (ending in `/api`) and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the hosting provider. Add the admin origin to the backend's comma-separated `FRONTEND_URL` allowlist. Add the correct OAuth callback/redirect URLs in Supabase Auth.

## Security notes

- The backend must validate the Supabase access token and enforce admin-role checks on every protected route.
- The frontend's role checks are for presentation only.
- Keep server secrets in `backend/.env` or the backend host's secret manager.
