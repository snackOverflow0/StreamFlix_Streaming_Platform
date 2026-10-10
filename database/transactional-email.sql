begin;
-- Receipts are queued in the same transaction as verified checkout fulfillment.
create table if not exists public.transactional_email_outbox (
 id uuid primary key default gen_random_uuid(), event_key text not null unique,
 user_id integer not null references public.users(user_id), kind text not null,
 recipient text not null, recipient_name text not null default '', payload jsonb not null,
 status text not null default 'pending' check(status in ('pending','sending','sent','failed','uncertain')),
 attempts integer not null default 0, available_at timestamptz not null default now(),
 locked_at timestamptz, lock_token uuid, first_attempt_at timestamptz,
 provider_message_id text, last_error text, created_at timestamptz not null default now(), sent_at timestamptz
);
alter table public.transactional_email_outbox enable row level security;
revoke all on public.transactional_email_outbox from public,anon,authenticated;
grant select,insert,update,delete on public.transactional_email_outbox to service_role;
create index if not exists email_outbox_pending on public.transactional_email_outbox(available_at,created_at) where status in ('pending','sending');
create index if not exists email_outbox_user_event on public.transactional_email_outbox(user_id,event_key);

create or replace function public.queue_streamflix_checkout_email() returns trigger
language plpgsql security invoker set search_path='' as $$
declare customer public.users; receipt jsonb; membership public.subscriptions; plan_name text;
begin
 if new.fulfilled is not true or old.fulfilled is true then return new; end if;
 select * into customer from public.users where user_id=new.user_id;
 if customer.email is null or customer.email='' then return new; end if;
 receipt=jsonb_build_object('session_id',new.session_id,'amount',new.amount,'currency','PHP','items',new.items,'delivery',new.delivery,'payment_status','paid');
 if new.kind='subscription' then
  select * into membership from public.subscriptions where stripe_checkout_session_id=new.session_id;
  select p.plan_name into plan_name from public.plans p where p.plan_id=new.plan_id;
  receipt=receipt||jsonb_build_object('plan_name',plan_name,'start_date',membership.start_date,'end_date',membership.end_date,'subscription_id',membership.subscription_id);
 else
  receipt=receipt||jsonb_build_object('order_ids',(select jsonb_agg(t.transaction_id order by t.transaction_id) from public.merchandise_transaction t where t.stripe_checkout_session_id=new.session_id));
 end if;
 insert into public.transactional_email_outbox(event_key,user_id,kind,recipient,recipient_name,payload)
 values('checkout:'||new.session_id,new.user_id,new.kind||'_receipt',customer.email,coalesce(customer.full_name,''),receipt) on conflict(event_key) do nothing;
 return new;
end;$$;
revoke all on function public.queue_streamflix_checkout_email() from public,anon,authenticated;
grant execute on function public.queue_streamflix_checkout_email() to service_role;
drop trigger if exists streamflix_checkout_email on public.integration_checkouts;
create trigger streamflix_checkout_email after update of fulfilled on public.integration_checkouts for each row execute function public.queue_streamflix_checkout_email();

create or replace function public.queue_streamflix_order_email() returns trigger
language plpgsql security invoker set search_path='' as $$
declare customer public.users; product_name text; event_name text; email_kind text;
begin
 if tg_op='INSERT' then
  -- Card receipts are aggregated by checkout, after all order lines commit.
  if new.stripe_checkout_session_id is not null then return new; end if;
  event_name='order:'||new.transaction_id||':placed'; email_kind='order_confirmation';
 else
  if new.payment_status is not distinct from old.payment_status and new.order_status is not distinct from old.order_status then return new; end if;
  event_name='order:'||new.transaction_id||':'||new.payment_status||':'||new.order_status; email_kind='order_update';
 end if;
 select * into customer from public.users where user_id=new.user_id;
 if customer.email is null or customer.email='' then return new; end if;
 select p.product_name into product_name from public.merchandise_product p where p.product_id=new.product_id;
 insert into public.transactional_email_outbox(event_key,user_id,kind,recipient,recipient_name,payload)
 values(event_name,new.user_id,email_kind,customer.email,coalesce(customer.full_name,''),jsonb_build_object('order_id',new.transaction_id,'product_name',product_name,'quantity',new.quantity,'amount',new.total_amount,'currency','PHP','payment_status',new.payment_status,'order_status',new.order_status,'delivery_method',new.delivery_method,'payment_method',new.payment_method)) on conflict(event_key) do nothing;
 return new;
end;$$;
revoke all on function public.queue_streamflix_order_email() from public,anon,authenticated;
grant execute on function public.queue_streamflix_order_email() to service_role;
drop trigger if exists streamflix_order_email on public.merchandise_transaction;
create trigger streamflix_order_email after insert or update of payment_status,order_status on public.merchandise_transaction for each row execute function public.queue_streamflix_order_email();

create or replace function public.claim_streamflix_emails() returns setof public.transactional_email_outbox
language plpgsql security invoker set search_path='' as $$
begin
 -- A crash after provider acceptance is ambiguous. Do not resend after Brevo's deduplication window.
 update public.transactional_email_outbox set status='uncertain',last_error='Interrupted delivery outside the provider deduplication window; review Brevo logs before retrying',lock_token=null
 where status in ('sending','pending') and attempts>0 and first_attempt_at < now()-interval '25 minutes';
 return query with picked as (
  select id from public.transactional_email_outbox
  where (status='pending' and available_at<=now()) or (status='sending' and locked_at<now()-interval '2 minutes' and first_attempt_at>=now()-interval '25 minutes')
  order by created_at limit 5 for update skip locked
 ) update public.transactional_email_outbox e set status='sending',locked_at=now(),lock_token=gen_random_uuid(),first_attempt_at=coalesce(e.first_attempt_at,now()),attempts=e.attempts+1
 from picked where e.id=picked.id returning e.*;
end;$$;
revoke all on function public.claim_streamflix_emails() from public,anon,authenticated;
grant execute on function public.claim_streamflix_emails() to service_role;
commit;
