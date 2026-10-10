begin;
alter table public.content add column if not exists video_url text;
alter table public.episodes add column if not exists video_url text;
alter table public.merchandise_product add column if not exists stock integer not null default 0 check(stock >= 0);
alter table public.merchandise_product add column if not exists image_url text;
alter table public.merchandise_product add column if not exists description text not null default '';
alter table public.merchandise_product add column if not exists variants jsonb not null default '[]'::jsonb check(jsonb_typeof(variants)='array');
-- Public delivery matches the existing catalog URLs. Only server-authorized signed uploads can write.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('streamflix-media','streamflix-media',true,536870912,array['video/mp4','video/webm','video/quicktime','image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('streamflix-videos','streamflix-videos',false,536870912,array['video/mp4','video/webm','video/quicktime']) on conflict(id) do update set public=false;
alter table public.admin_media_assets add column if not exists upload_id uuid unique;
create table if not exists public.admin_uploads (
 upload_id uuid primary key, auth_user_id uuid not null references auth.users(id),
 bucket text not null default 'streamflix-media', path text not null unique, name text not null, mime_type text not null, size bigint not null,
 created_at timestamptz not null default now(), asset_id bigint, completed_at timestamptz
);
alter table public.admin_uploads enable row level security;
revoke all on public.admin_uploads from anon,authenticated;
grant all on public.admin_uploads to service_role;
-- Protect private video reads even when the project has a broad existing read policy.
drop policy if exists streamflix_private_video_read on storage.objects;
create policy streamflix_private_video_read on storage.objects as restrictive for select to anon,authenticated using(bucket_id<>'streamflix-videos');
create table if not exists public.client_notifications (
 notification_id bigint generated always as identity primary key,
 user_id bigint references public.users(user_id) on delete cascade,
 kind text not null, title text not null, message text not null,
 event_key text not null unique, created_at timestamptz not null default now()
);
create index if not exists client_notifications_recipient_date on public.client_notifications(user_id,created_at desc);
create table if not exists public.client_notification_reads (
 notification_id bigint references public.client_notifications(notification_id) on delete cascade,
 auth_user_id uuid references auth.users(id) on delete cascade,
 read_at timestamptz not null default now(), primary key(notification_id,auth_user_id)
);
alter table public.client_notifications enable row level security;
alter table public.client_notification_reads enable row level security;
revoke all on public.client_notifications,public.client_notification_reads from anon,authenticated;
grant select on public.client_notifications,public.client_notification_reads to authenticated;
grant insert on public.client_notification_reads to authenticated;
grant all on public.client_notifications,public.client_notification_reads to service_role;
-- Matches the existing API's application-user mapping by verified Auth email.
-- Definer access allows suspended users to read their own status notification.
create or replace function public.notification_app_user_id() returns integer language sql stable security definer set search_path=public as $$
 select u.user_id from public.users u where u.email=auth.jwt()->>'email' limit 1;
$$;
revoke all on function public.notification_app_user_id() from public,anon;
grant execute on function public.notification_app_user_id() to authenticated;
drop policy if exists notification_recipient on public.client_notifications;
create policy notification_recipient on public.client_notifications for select to authenticated
 using(user_id is null or user_id=public.notification_app_user_id());
drop policy if exists notification_read_owner on public.client_notification_reads;
create policy notification_read_owner on public.client_notification_reads for select to authenticated using(auth_user_id=auth.uid());
drop policy if exists notification_mark_read on public.client_notification_reads;
create policy notification_mark_read on public.client_notification_reads for insert to authenticated with check(auth_user_id=auth.uid() and exists(select 1 from public.client_notifications n where n.notification_id=client_notification_reads.notification_id));
create or replace function public.notify_catalog_change() returns trigger language plpgsql security definer set search_path=public as $$
declare series_title text; begin
 if tg_table_name='content' then
  if lower(new.type)='movie' and new.deleted_at is null and new.is_active then
   insert into client_notifications(kind,title,message,event_key) values('movie','New movie',new.title||' is now in the catalog.','movie:'||new.content_id) on conflict do nothing;
  end if;
 else
  select c.title into series_title from season s join content c on c.content_id=s.content_id where s.season_id=new.season_id and c.deleted_at is null and c.is_active;
  if series_title is not null then
   insert into client_notifications(kind,title,message,event_key) values('episode','New episode',series_title||' — '||new.episode_title||' has been added.','episode:'||new.episode_id) on conflict do nothing;
  end if;
 end if; return new;
end $$;
drop trigger if exists notify_new_movie on public.content;
create trigger notify_new_movie after insert or update of is_active on public.content for each row execute function public.notify_catalog_change();
drop trigger if exists notify_new_episode on public.episodes;
create trigger notify_new_episode after insert on public.episodes for each row execute function public.notify_catalog_change();
create or replace function public.notify_account_change() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.account_status is distinct from old.account_status and new.account_status in ('suspended','deactivated') then
  insert into client_notifications(user_id,kind,title,message,event_key) values(new.user_id,'account','Account '||new.account_status,'Your StreamFlix account has been '||new.account_status||'. Please contact support for assistance.','account:'||new.user_id||':'||gen_random_uuid());
 end if; return new;
end $$;
drop trigger if exists notify_account_status on public.users;
create trigger notify_account_status after update of account_status on public.users for each row execute function public.notify_account_change();
create or replace function public.notify_subscription_expiry() returns integer language plpgsql security definer set search_path=public as $$
declare inserted_count integer; begin
 insert into client_notifications(user_id,kind,title,message,event_key)
 select s.subscription_user_id,'expiry','Subscription expiring soon','Your StreamFlix subscription ends on '||s.end_date||'. Renew to keep watching.','expiry:'||s.subscription_id||':'||s.end_date
 from subscriptions s join users u on u.user_id=s.subscription_user_id
 where s.status='active' and s.start_date<=current_date and s.end_date between current_date and current_date+3 and u.account_status='active' and u.deleted_at is null
 on conflict do nothing;
 get diagnostics inserted_count=row_count; return inserted_count;
end $$;
revoke all on function public.notify_catalog_change(),public.notify_account_change(),public.notify_subscription_expiry() from public,anon,authenticated;
grant execute on function public.notify_subscription_expiry() to service_role;
-- Atomic stock deduction protects against simultaneous purchases and overselling.
create or replace function public.reserve_merchandise_stock() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.quantity is null or new.quantity<1 then raise exception 'Quantity must be positive'; end if;
 update merchandise_product set stock=stock-new.quantity where product_id=new.product_id and listing_status='active' and stock>=new.quantity;
 if not found then raise exception 'Product unavailable or insufficient stock'; end if;
 return new;
end $$;
revoke all on function public.reserve_merchandise_stock() from public,anon,authenticated;
drop trigger if exists reserve_merchandise_stock on public.merchandise_transaction;
create trigger reserve_merchandise_stock before insert on public.merchandise_transaction for each row execute function public.reserve_merchandise_stock();
select public.notify_subscription_expiry();
commit;

