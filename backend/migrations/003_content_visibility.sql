-- Preserve all existing titles; admins control visibility without deleting.
alter table public.content add column if not exists is_active boolean not null default true;
revoke insert, update, delete on public.content from anon, authenticated;
-- A restrictive policy also protects direct Supabase client reads.
drop policy if exists content_visibility on public.content;
create policy content_visibility on public.content as restrictive for select to anon, authenticated
using (is_active = true and deleted_at is null);
