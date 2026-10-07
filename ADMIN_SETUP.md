# StreamFlix Administrator Setup

The admin workspace is available at `/admin` in the same frontend app.

## 1. Apply the database migration

Apply:

`supabase/migrations/20261007210000_streamflix_admin_workspace.sql`

in the StreamFlix Supabase project.

## 2. Grant administrator access

Create or use an existing Supabase Auth account, then run:

```sql
insert into public.admin_roles(auth_user_id, role)
select id, 'administrator'
from auth.users
where email = 'YOUR_ADMIN_EMAIL'
on conflict (auth_user_id) do update set role = excluded.role;
```

## 3. Start the project

Backend:

```cmd
cd backend
npm install
npm run dev
```

Frontend:

```cmd
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/admin`.

## What was integrated

The admin archive was reduced to the administrator feature itself. The duplicate application shell, duplicate user-facing pages, mock preview data, academic SQL demo scripts, design-preview files, and seed copies were not merged into the current project.

The integrated admin workspace uses the current StreamFlix backend, Supabase auth, current billing/merchandise schema, and current frontend services.
