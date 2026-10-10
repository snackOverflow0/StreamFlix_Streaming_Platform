-- Apply after profile-history.sql and profile-commerce.sql.
-- Legacy personal items belong to the first profile; new profiles start empty.
begin;
alter table public.favorites add column if not exists profile_id integer;
alter table public.watch_list add column if not exists profile_id integer;
alter table public.notifications add column if not exists profile_id integer;
alter table public.notifications add column if not exists notification_scope text not null default 'account' check (notification_scope in ('account','profile'));
update public.favorites f set profile_id=(select min(profile_id) from public.profiles p where p.user_id=f.user_id) where profile_id is null;
update public.watch_list f set profile_id=(select min(profile_id) from public.profiles p where p.user_id=f.user_id) where profile_id is null;
update public.notifications f set profile_id=(select min(profile_id) from public.profiles p where p.user_id=f.user_id) where profile_id is null;
alter table public.favorites drop constraint if exists favorites_user_id_content_id_key;
alter table public.watch_list drop constraint if exists watch_list_user_id_content_id_key;
do $$ begin if not exists(select 1 from pg_constraint where conrelid='public.favorites'::regclass and conname='favorites_profile_content_key') then alter table public.favorites add constraint favorites_profile_content_key unique(profile_id,content_id); end if; end $$;
do $$ begin if not exists(select 1 from pg_constraint where conrelid='public.watch_list'::regclass and conname='watch_list_profile_content_key') then alter table public.watch_list add constraint watch_list_profile_content_key unique(profile_id,content_id); end if; end $$;
do $$ begin if not exists(select 1 from pg_constraint where conrelid='public.favorites'::regclass and conname='favorites_profile_owner_fkey') then alter table public.favorites add constraint favorites_profile_owner_fkey foreign key(profile_id,user_id) references public.profiles(profile_id,user_id) on delete cascade; end if; end $$;
do $$ begin if not exists(select 1 from pg_constraint where conrelid='public.watch_list'::regclass and conname='watch_list_profile_owner_fkey') then alter table public.watch_list add constraint watch_list_profile_owner_fkey foreign key(profile_id,user_id) references public.profiles(profile_id,user_id) on delete cascade; end if; end $$;
do $$ begin if not exists(select 1 from pg_constraint where conrelid='public.notifications'::regclass and conname='notifications_profile_owner_fkey') then alter table public.notifications add constraint notifications_profile_owner_fkey foreign key(profile_id,user_id) references public.profiles(profile_id,user_id) on delete cascade; end if; end $$;
create index if not exists favorites_profile_recent on public.favorites(profile_id,date_added desc);
create index if not exists watch_list_profile_recent on public.watch_list(profile_id,date_added desc);
create index if not exists notifications_profile_recent on public.notifications(profile_id,created_at desc);

-- Content and account notices get a distinct inbox row/read state per existing profile.
-- Explicitly targeted notices (e.g. merchandise receipts) never broadcast.
create or replace function public.scope_streamflix_notification() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.profile_id is not null then
  new.notification_scope='profile';
 else
  new.notification_scope='account';
  select min(profile_id) into new.profile_id from public.profiles where user_id=new.user_id;
 end if;
 return new;
end;$$;
create or replace function public.broadcast_streamflix_notification() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.notification_scope='account' then
  insert into public.notifications(user_id,profile_id,type,title,message,is_read,created_at)
  select new.user_id,p.profile_id,new.type,new.title,new.message,new.is_read,new.created_at
  from public.profiles p where p.user_id=new.user_id and p.profile_id is distinct from new.profile_id;
 end if;
 return new;
end;$$;
drop trigger if exists scope_streamflix_notification on public.notifications;
create trigger scope_streamflix_notification before insert on public.notifications for each row execute function public.scope_streamflix_notification();
drop trigger if exists broadcast_streamflix_notification on public.notifications;
create trigger broadcast_streamflix_notification after insert on public.notifications for each row execute function public.broadcast_streamflix_notification();

-- Preserve old account data when its first profile is created; later profiles start empty.
create or replace function public.claim_streamflix_personal_data() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if (select min(profile_id) from public.profiles where user_id=new.user_id)=new.profile_id then
  update public.favorites set profile_id=new.profile_id where user_id=new.user_id and profile_id is null;
  update public.watch_list set profile_id=new.profile_id where user_id=new.user_id and profile_id is null;
  update public.notifications set profile_id=new.profile_id where user_id=new.user_id and profile_id is null;
 end if;
 return new;
end;$$;
drop trigger if exists claim_streamflix_personal_data on public.profiles;
create trigger claim_streamflix_personal_data after insert on public.profiles for each row execute function public.claim_streamflix_personal_data();
revoke all on function public.scope_streamflix_notification(),public.broadcast_streamflix_notification(),public.claim_streamflix_personal_data() from public,anon,authenticated;

-- Subscription receipts are account notices; merchandise receipts target the purchasing profile.
create or replace function public.fulfill_streamflix_checkout(p_session text,p_payment text) returns void
language plpgsql security invoker set search_path='' as $$
declare checkout public.integration_checkouts; sid integer; today date=(now() at time zone 'Asia/Manila')::date; expiry date;
begin
 select * into checkout from public.integration_checkouts where session_id=p_session for update;
 if not found then raise exception 'Checkout not found'; end if;
 if checkout.fulfilled then return; end if;
 if checkout.kind='merchandise' then
  perform public.streamflix_order(checkout.user_id,checkout.items,checkout.delivery,p_session);
 else
  perform 1 from public.users where user_id=checkout.user_id for update;
  select greatest(today,coalesce(max(end_date),today)) into expiry from public.subscriptions where subscription_user_id=checkout.user_id and status='active';
  update public.subscriptions set status='cancelled',updated_at=now() where subscription_user_id=checkout.user_id and status='active';
  insert into public.subscriptions(subscription_user_id,plan_id,start_date,end_date,status,payment_method,payment_status,transaction_reference,paid_at,stripe_checkout_session_id)
  values(checkout.user_id,checkout.plan_id,today,expiry+30,'active','Card','paid',p_payment,now(),p_session) returning subscription_id into sid;
  insert into public.payment_transactions(user_id,plan_id,subscription_id,gateway,gateway_payment_id,gateway_session_id,amount,currency,payment_method,status,paid_at)
  values(checkout.user_id,checkout.plan_id,sid,'stripe',p_payment,p_session,checkout.amount,'PHP','Card','paid',now());
 end if;
 update public.integration_checkouts set fulfilled=true where session_id=p_session;
 if checkout.kind='subscription' or checkout.profile_id is not null then
 insert into public.notifications(user_id,profile_id,type,title,message) values(checkout.user_id,case when checkout.kind='merchandise' then checkout.profile_id else null end,'payment','Payment confirmed',case when checkout.kind='subscription' then 'Your StreamFlix subscription is active.' else 'Your merchandise order has been received.' end);
 end if;
end;$$;
revoke all on function public.fulfill_streamflix_checkout(text,text) from public,anon,authenticated;
grant execute on function public.fulfill_streamflix_checkout(text,text) to service_role;

notify pgrst, 'reload schema';
commit;
