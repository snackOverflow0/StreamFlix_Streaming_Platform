-- Additive production readiness and query acceleration. No application data is rewritten.
begin;
create index if not exists streamflix_progress_lookup_idx on public.view_history(user_id,content_id,episode_id,watch_date desc,history_id desc);
create index if not exists streamflix_recent_views_idx on public.view_history(watch_date desc,content_id,user_id) where progress_percentage>=50;
-- Trigger functions are not public RPC endpoints. Public rating summaries remain intentionally readable.
alter function public.get_content_rating_summaries() security invoker;
revoke execute on function public.notify_new_content() from public,anon,authenticated;
create or replace function public.streamflix_readiness() returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('ready',
 to_regprocedure('public.save_streamflix_progress(integer,integer,integer,numeric)') is not null
 and to_regprocedure('public.fulfill_streamflix_checkout(text,text)') is not null
 and to_regprocedure('public.streamflix_order(integer,jsonb,jsonb,text)') is not null
 and to_regprocedure('public.streamflix_weekly_views()') is not null
 and to_regprocedure('public.streamflix_view_stats()') is not null
 and to_regprocedure('public.reserve_streamflix_checkout(text,integer,jsonb,jsonb,numeric,timestamp with time zone)') is not null
 and to_regprocedure('public.release_streamflix_checkout(text)') is not null
 and to_regprocedure('public.claim_streamflix_emails()') is not null
 and to_regclass('public.transactional_email_outbox') is not null
 and not has_table_privilege('authenticated','public.view_history','SELECT')
 and (select count(*)=2 from pg_trigger where tgname in ('streamflix_profile_limit','streamflix_member_limit') and not tgisinternal),
 'progress',to_regprocedure('public.save_streamflix_progress(integer,integer,integer,numeric)') is not null,
 'checkout',to_regprocedure('public.fulfill_streamflix_checkout(text,text)') is not null,
 'emailReceipts',to_regclass('public.transactional_email_outbox') is not null and to_regprocedure('public.claim_streamflix_emails()') is not null,
 'inventoryReservations',to_regprocedure('public.reserve_streamflix_checkout(text,integer,jsonb,jsonb,numeric,timestamp with time zone)') is not null,
 'privateHistory',not has_table_privilege('authenticated','public.view_history','SELECT'));
$$;
revoke execute on function public.streamflix_readiness() from public,anon,authenticated;
grant execute on function public.streamflix_readiness() to service_role;
notify pgrst,'reload schema';
commit;
