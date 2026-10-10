-- Review, then run after integration.sql. No existing rows are deleted or rewritten.
begin;
-- Legacy SECURITY DEFINER order functions accept arbitrary account/payment inputs.
-- Restrict every overload; current Express checkout uses streamflix_order instead.
do $$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('create_merchandise_order','release_merchandise_orders') loop
  execute format('revoke execute on function %s from public, anon, authenticated',f.signature);
  execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $$;

-- Both integrated apps use Express for private records. Keep service-role access
-- while closing legacy direct-browser table access (including unrestricted
-- history reads and editable financial/account fields). Auth and Storage use
-- their own schemas and are unaffected. Admin role self-read is retained.
do $$ declare name text; begin
 foreach name in array array['users','profiles','members','favorites','watch_list','view_history','feedback','notifications','subscriptions','payment_transactions','merchandise_transaction','integration_checkouts','admin_settings','admin_uploads','admin_media_assets','site_visitors'] loop
  if to_regclass(format('public.%I',name)) is not null then
   execute format('revoke all privileges on table public.%I from public,anon,authenticated',name);
   execute format('grant all privileges on table public.%I to service_role',name);
  end if;
 end loop;
end $$;

-- Serialize profile creation on the owning account so concurrent requests cannot
-- both claim the final slot. Expired accounts keep existing profiles but cannot
-- create beyond the fallback limit of one until access is renewed.
create or replace function public.enforce_streamflix_profile_limit() returns trigger
language plpgsql security definer set search_path='' as $$
declare capacity integer; today date=(now() at time zone 'Asia/Manila')::date;
begin
 if TG_OP='UPDATE' and new.user_id=old.user_id then return new; end if;
 perform 1 from public.users where user_id=new.user_id and account_status='active' and deleted_at is null for update;
 if not found then raise exception 'Profile owner is not active' using errcode='23514'; end if;
 select p.max_members into capacity from public.subscriptions s join public.plans p on p.plan_id=s.plan_id where s.subscription_user_id=new.user_id and s.status='active' and s.start_date<=today and (s.end_date is null or s.end_date>=today) order by s.created_at desc limit 1;
 if (select count(*) from public.profiles where user_id=new.user_id)>=coalesce(capacity,1) then raise exception 'Profile limit reached for this plan' using errcode='23514'; end if;
 return new;
end $$;
revoke execute on function public.enforce_streamflix_profile_limit() from public,anon,authenticated;
drop trigger if exists streamflix_profile_limit on public.profiles;
create trigger streamflix_profile_limit before insert or update of user_id on public.profiles for each row execute function public.enforce_streamflix_profile_limit();

create or replace function public.enforce_streamflix_member_limit() returns trigger
language plpgsql security definer set search_path='' as $$
declare owner_id integer; capacity integer; today date=(now() at time zone 'Asia/Manila')::date;
begin
 if TG_OP='UPDATE' and new.subscription_id=old.subscription_id and new.user_id=old.user_id then return new; end if;
 select s.subscription_user_id,p.max_members into owner_id,capacity from public.subscriptions s join public.plans p on p.plan_id=s.plan_id where s.subscription_id=new.subscription_id and s.status='active' and s.start_date<=today and (s.end_date is null or s.end_date>=today) for update of s;
 if not found then raise exception 'Subscription is not active' using errcode='23514'; end if;
 if new.user_id=owner_id then raise exception 'Owner already belongs to the subscription' using errcode='23514'; end if;
 if not exists(select 1 from public.users where user_id=new.user_id and account_status='active' and deleted_at is null) then raise exception 'Member account is not active' using errcode='23514'; end if;
 if exists(select 1 from public.members where subscription_id=new.subscription_id and user_id=new.user_id) then raise exception 'Member already belongs to this subscription' using errcode='23505'; end if;
 if (select count(*) from public.members where subscription_id=new.subscription_id and user_id<>owner_id)>=capacity-1 then raise exception 'Member limit reached for this plan' using errcode='23514'; end if;
 return new;
end $$;
revoke execute on function public.enforce_streamflix_member_limit() from public,anon,authenticated;
drop trigger if exists streamflix_member_limit on public.members;
create trigger streamflix_member_limit before insert or update of subscription_id,user_id on public.members for each row execute function public.enforce_streamflix_member_limit();
-- Serialize progress upserts without deleting or reindexing older history rows.
create or replace function public.save_streamflix_progress(p_user integer,p_content integer,p_episode integer,p_progress numeric) returns public.view_history
language plpgsql set search_path='' as $$
declare saved public.view_history;
begin
 if p_progress is null or p_progress<0 or p_progress>100 then raise exception 'Invalid progress' using errcode='23514'; end if;
 perform 1 from public.users where user_id=p_user and account_status='active' and deleted_at is null for update;
 if not found then raise exception 'Account is not active' using errcode='23514'; end if;
 select * into saved from public.view_history where user_id=p_user and content_id=p_content and episode_id is not distinct from p_episode order by watch_date desc,history_id desc limit 1;
 if found then
  update public.view_history set progress_percentage=p_progress,watch_date=now() where history_id=saved.history_id returning * into saved;
 else
  insert into public.view_history(user_id,content_id,episode_id,progress_percentage,watch_date) values(p_user,p_content,p_episode,p_progress,now()) returning * into saved;
 end if;
 return saved;
end $$;
revoke execute on function public.save_streamflix_progress(integer,integer,integer,numeric) from public,anon,authenticated;
grant execute on function public.save_streamflix_progress(integer,integer,integer,numeric) to service_role;

notify pgrst,'reload schema';
commit;
