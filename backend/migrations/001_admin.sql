-- Apply using the Supabase SQL editor. Only server service-role queries access these tables.
create table if not exists public.admin_roles (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('administrator'))
);
create table if not exists public.admin_media_assets (
  asset_id bigint generated always as identity primary key,
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
alter table public.admin_roles enable row level security;
alter table public.admin_media_assets enable row level security;
alter table public.admin_settings enable row level security;
revoke all on public.admin_roles, public.admin_media_assets, public.admin_settings from anon, authenticated;
grant all on public.admin_roles, public.admin_media_assets, public.admin_settings to service_role;
grant usage, select on sequence public.admin_media_assets_asset_id_seq to service_role;
-- Grant access to an EXISTING authenticated user, replacing their email:
-- insert into public.admin_roles(auth_user_id, role)
-- select id, 'administrator' from auth.users where email = 'YOUR_ADMIN_EMAIL'
-- on conflict (auth_user_id) do update set role = excluded.role;

-- Persist artwork for new content without relying on a title-name lookup.
alter table public.content add column if not exists poster_url text;
alter table public.content add column if not exists preview_url text;
alter table public.content add column if not exists hero_url text;
alter table public.content add column if not exists duration_label text;
