begin;
alter table public.episodes add column if not exists trailer_url text;
alter table public.merchandise_product add column if not exists description text not null default '';
alter table public.merchandise_product add column if not exists variants jsonb not null default '[]'::jsonb;
create table if not exists public.integration_checkouts (
 session_id text primary key, user_id integer not null references public.users(user_id),
 kind text not null check(kind in ('subscription','merchandise')), plan_id integer references public.plans(plan_id),
 items jsonb not null default '[]', delivery jsonb not null default '{}', amount numeric not null,
 fulfilled boolean not null default false, created_at timestamptz not null default now()
);
alter table public.integration_checkouts enable row level security;
revoke all on public.integration_checkouts from anon,authenticated;
grant all on public.integration_checkouts to service_role;
create or replace function public.record_streamflix_visit(p_key text) returns void language sql security invoker set search_path='' as $$
 insert into public.site_visitors(visitor_key) values(p_key)
 on conflict(visitor_key) do update set last_seen_at=now(),visit_count=public.site_visitors.visit_count+1;
$$;
revoke all on function public.record_streamflix_visit(text) from public,anon,authenticated;
grant execute on function public.record_streamflix_visit(text) to service_role;
create or replace function public.streamflix_order(p_user integer,p_items jsonb,p_delivery jsonb,p_session text default null) returns setof public.merchandise_transaction
language plpgsql security invoker set search_path='' as $$
declare item jsonb; product public.merchandise_product; tx public.merchandise_transaction; qty integer;
begin
 if jsonb_array_length(p_items) not between 1 and 30 then raise exception 'Invalid cart'; end if;
 for item in select value from jsonb_array_elements(p_items) order by (value->>'product_id')::integer loop
  qty=(item->>'quantity')::integer;
  if qty not between 1 and 100 then raise exception 'Invalid quantity'; end if;
  select * into product from public.merchandise_product where product_id=(item->>'product_id')::integer for update;
  if not found or product.listing_status<>'active' or product.stock_quantity<qty then raise exception 'Product unavailable or insufficient stock'; end if;
  if p_session is not null and product.price<>(item->>'price')::numeric then raise exception 'Price changed; administrator must resolve the paid order'; end if;
  update public.merchandise_product set stock_quantity=stock_quantity-qty,listing_status=case when stock_quantity=qty then 'sold_out'::public.listing_status_enum else listing_status end,updated_at=now() where product_id=product.product_id;
  insert into public.merchandise_transaction(user_id,product_id,quantity,total_amount,price_at_purchase,payment_method,payment_status,order_status,delivery_method,delivery_name,delivery_phone,delivery_address,stripe_checkout_session_id)
  values(p_user,product.product_id,qty,round(product.price*qty,2),product.price,case when p_session is null then 'Cash on Delivery' else 'Card' end,case when p_session is null then 'pending' else 'paid' end,'pending',p_delivery->>'delivery_method',p_delivery->>'delivery_name',p_delivery->>'delivery_phone',p_delivery->>'delivery_address',p_session) returning * into tx;
  return next tx;
 end loop;
end;$$;
revoke all on function public.streamflix_order(integer,jsonb,jsonb,text) from public,anon,authenticated;
grant execute on function public.streamflix_order(integer,jsonb,jsonb,text) to service_role;
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
 insert into public.notifications(user_id,type,title,message) values(checkout.user_id,'payment','Payment confirmed',case when checkout.kind='subscription' then 'Your StreamFlix subscription is active.' else 'Your merchandise order has been received.' end);
end;$$;
revoke all on function public.fulfill_streamflix_checkout(text,text) from public,anon,authenticated;
grant execute on function public.fulfill_streamflix_checkout(text,text) to service_role;
create table if not exists public.admin_uploads (
 upload_id uuid primary key, auth_user_id uuid not null references auth.users(id), path text not null unique,
 name text not null,mime_type text not null,size bigint not null,bucket text not null,
 asset_id bigint references public.admin_media_assets(asset_id),completed_at timestamptz,created_at timestamptz not null default now()
);
alter table public.admin_uploads enable row level security;
revoke all on public.admin_uploads from anon,authenticated;
grant all on public.admin_uploads to service_role;
alter table public.admin_media_assets add column if not exists upload_id uuid unique;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('streamflix-media','streamflix-media',true,536870912,array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime']),
 ('streamflix-videos','streamflix-videos',false,536870912,array['video/mp4','video/webm','video/quicktime'])
on conflict(id) do nothing;
grant select on public.admin_roles to authenticated;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='admin_roles' and policyname='streamflix_admin_read_own_role') then
  create policy streamflix_admin_read_own_role on public.admin_roles for select to authenticated using (auth_user_id=(select auth.uid()));
 end if;
end $$;
-- Resumable uploads require ownership of the folder and a verified administrator role.
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='streamflix_admin_upload') then
  create policy streamflix_admin_upload on storage.objects for insert to authenticated with check (
   bucket_id in ('streamflix-media','streamflix-videos') and (storage.foldername(name))[1]=(select auth.uid())::text
   and exists(select 1 from public.admin_roles where auth_user_id=(select auth.uid()) and role='administrator'));
 end if;
end $$;

commit;
