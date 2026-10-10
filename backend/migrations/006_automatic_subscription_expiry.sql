-- Run once in Supabase SQL Editor. Uses the existing cancelled status.
-- End dates are inclusive in Asia/Manila; expire at the next midnight.
create or replace function public.expire_streamflix_subscriptions()
returns integer language plpgsql security definer set search_path = public as $$
declare changed integer;
begin
 update public.subscriptions set status='cancelled'
 where status='active' and end_date is not null
 and end_date < (now() at time zone 'Asia/Manila')::date;
 get diagnostics changed = row_count;
 return changed;
end;
$$;
revoke all on function public.expire_streamflix_subscriptions() from public,anon,authenticated;
grant execute on function public.expire_streamflix_subscriptions() to service_role;
-- Enable pg_cron under Database > Extensions before running this section.
select cron.unschedule(jobid) from cron.job where jobname='streamflix-auto-expiry';
select cron.schedule('streamflix-auto-expiry','* * * * *','select public.expire_streamflix_subscriptions();');
select public.expire_streamflix_subscriptions();
