# StreamFlix

Production-style streaming platform with separate StreamFlix user and administrator experiences.

## Frontend routes

- `/login` — user authentication
- `/` — StreamFlix catalog
- `/admin/login` — separate administrator authentication screen
- `/admin` — protected administrator console

## Admin security

Administrator authorization is enforced by the backend through `users.role = 'admin'`. The frontend route alone does not grant access.

After creating the administrator's Supabase Auth account, promote its application user:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@example.com';
```

Do not put admin credentials in source code or migrations.
