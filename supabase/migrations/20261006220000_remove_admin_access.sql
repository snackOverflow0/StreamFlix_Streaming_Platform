-- StreamFlix: remove the custom application-admin feature.
-- This only rolls back the role column/index/constraint introduced by
-- 20261006210000_admin_access.sql. It does not touch Supabase's internal
-- auth.admin APIs or PostgreSQL service roles.

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check;

DROP INDEX IF EXISTS public.idx_users_role;

ALTER TABLE public.users
  DROP COLUMN IF EXISTS role;
