-- StreamFlix admin workspace integration.
-- The browser never receives the Supabase service-role key.
-- All admin table access is performed by backend /api/admin routes after
-- verifying the caller is a Supabase-authenticated administrator.

create table if not exists public.admin_roles (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('administrator'))
);

create table if not exists public.admin_media_assets (
  asset_id bigint generated always as identity primary key,
  upload_id uuid unique,
  name text not null,
  url text not null,
  kind text not null,
  folder text not null default 'Library',
  created_at timestamptz not null default now()
);

create table if not exists public.admin_settings (
  id integer primary key check (id = 1),
  settings jsonb not null default '{}'::jsonb
);

create table if not exists public.admin_uploads (
  upload_id uuid primary key,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null,
  path text not null unique,
  name text not null,
  mime_type text not null,
  size bigint not null check (size > 0 and size <= 536870912),
  asset_id bigint references public.admin_media_assets(asset_id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- The user-facing feedback service already sends these fields; keep them in
-- the database so administrators can track resolution state.
alter table public.feedback
  add column if not exists type varchar(50) not null default 'general';

alter table public.feedback
  add column if not exists status varchar(30) not null default 'pending';

-- Admin merchandise management uses the current stock_quantity column and
-- adds a description field without replacing the existing commerce schema.
alter table public.merchandise_product
  add column if not exists description text not null default '';

create index if not exists idx_admin_uploads_actor_created
  on public.admin_uploads(auth_user_id, created_at desc);

alter table public.admin_roles enable row level security;
alter table public.admin_media_assets enable row level security;
alter table public.admin_settings enable row level security;
alter table public.admin_uploads enable row level security;

revoke all on public.admin_roles from anon, authenticated;
revoke all on public.admin_media_assets from anon, authenticated;
revoke all on public.admin_settings from anon, authenticated;
revoke all on public.admin_uploads from anon, authenticated;

grant all on public.admin_roles to service_role;
grant all on public.admin_media_assets to service_role;
grant all on public.admin_settings to service_role;
grant all on public.admin_uploads to service_role;
grant usage, select on sequence public.admin_media_assets_asset_id_seq to service_role;

insert into public.admin_settings (id, settings)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

-- Public artwork bucket for uploaded posters/product images.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'streamflix-media',
  'streamflix-media',
  true,
  536870912,
  array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- The media bucket is intentionally public-read. Uploads still use signed
-- upload URLs created by the trusted backend.
drop policy if exists streamflix_media_public_read on storage.objects;
create policy streamflix_media_public_read
on storage.objects
for select
using (bucket_id = 'streamflix-media');

-- Granting no direct authenticated read policy for streamflix-videos keeps it
-- private; the service-role backend creates short-lived signed URLs.

-- To grant administrator access to an existing Supabase Auth user:
-- insert into public.admin_roles(auth_user_id, role)
-- select id, 'administrator' from auth.users
-- where email = 'YOUR_ADMIN_EMAIL'
-- on conflict (auth_user_id) do update set role = excluded.role;
