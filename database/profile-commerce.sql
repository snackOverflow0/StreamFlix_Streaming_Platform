begin;
alter table public.integration_checkouts add column if not exists profile_id integer references public.profiles(profile_id) on delete set null;
alter table public.integration_checkouts add column if not exists profile_name text;
alter table public.merchandise_transaction add column if not exists profile_id integer references public.profiles(profile_id) on delete set null;
alter table public.merchandise_transaction add column if not exists profile_name text;
-- Existing account orders belong to its earliest profile; new profiles start empty.
update public.integration_checkouts c set profile_id=p.profile_id,profile_name=p.profile_name from public.profiles p where c.kind='merchandise' and c.profile_id is null and c.profile_name is null and p.user_id=c.user_id and p.profile_id=(select min(p2.profile_id) from public.profiles p2 where p2.user_id=c.user_id);
update public.merchandise_transaction c set profile_id=p.profile_id,profile_name=p.profile_name from public.profiles p where c.profile_id is null and c.profile_name is null and p.user_id=c.user_id and p.profile_id=(select min(p2.profile_id) from public.profiles p2 where p2.user_id=c.user_id);
create index if not exists merchandise_profile_history on public.merchandise_transaction(user_id,profile_id,created_at desc);
create or replace function public.check_streamflix_purchase_profile() returns trigger
language plpgsql security invoker set search_path='' as $$
declare owner_id integer; name text;
begin
 if new.profile_id is not null then
  select user_id,profile_name into owner_id,name from public.profiles where profile_id=new.profile_id;
  if not found or owner_id is distinct from new.user_id then raise exception 'Purchasing profile does not belong to this account'; end if;
  if new.profile_name is null then new.profile_name=name; end if;
 end if;
 return new;
end;$$;
revoke all on function public.check_streamflix_purchase_profile() from public,anon,authenticated;
drop trigger if exists check_purchase_profile on public.integration_checkouts;
create trigger check_purchase_profile before insert or update of profile_id,user_id on public.integration_checkouts for each row execute function public.check_streamflix_purchase_profile();
drop trigger if exists check_purchase_profile on public.merchandise_transaction;
create trigger check_purchase_profile before insert or update of profile_id,user_id on public.merchandise_transaction for each row execute function public.check_streamflix_purchase_profile();
create or replace function public.reserve_streamflix_checkout(p_session text,p_user integer,p_items jsonb,p_delivery jsonb,p_amount numeric,p_expires timestamptz) returns void
language plpgsql security invoker set search_path='' as $$
declare item jsonb; product public.merchandise_product; qty integer; total numeric=0; purchase_profile integer; purchase_name text;
begin
 perform 1 from public.users where user_id=p_user for update;
 if not found then raise exception 'User not found'; end if;
 purchase_profile=coalesce((p_delivery->>'profile_id')::integer,(select min(profile_id) from public.profiles where user_id=p_user));
 select profile_name into purchase_name from public.profiles where profile_id=purchase_profile and user_id=p_user for key share;
 if not found then raise exception 'Select a profile belonging to this account'; end if;
 if p_expires is null or p_expires<=now() or p_expires>now()+interval '1 hour' then raise exception 'Invalid checkout expiry'; end if;
 if (select count(*) from public.integration_checkouts where user_id=p_user and reservation_status='reserved' and fulfilled=false)>=3 then raise exception 'Finish or wait for your existing checkouts to expire'; end if;
 if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 30 then raise exception 'Invalid cart'; end if;
 if exists(select 1 from public.integration_checkouts where session_id=p_session) then raise exception 'Checkout already saved'; end if;
 if (select count(distinct value->>'product_id') from jsonb_array_elements(p_items))<>jsonb_array_length(p_items) then raise exception 'Duplicate cart products'; end if;
 for item in select value from jsonb_array_elements(p_items) order by (value->>'product_id')::integer loop
  qty=(item->>'quantity')::integer;
  if qty is null or qty not between 1 and 100 then raise exception 'Invalid quantity'; end if;
  select * into product from public.merchandise_product where product_id=(item->>'product_id')::integer for update;
  if not found or product.listing_status<>'active' or product.stock_quantity<qty or (item->>'price') is null or product.price<>(item->>'price')::numeric then raise exception 'Product price or stock changed'; end if;
  total=total+round(product.price*qty,2);
  update public.merchandise_product set stock_quantity=stock_quantity-qty,listing_status=case when stock_quantity=qty then 'sold_out'::public.listing_status_enum else listing_status end,updated_at=now() where product_id=product.product_id;
 end loop;
 if p_amount is null or total<>p_amount or total<=0 then raise exception 'Checkout total does not match'; end if;
 insert into public.integration_checkouts(session_id,user_id,kind,items,delivery,amount,reservation_status,expires_at,profile_id,profile_name)
 values(p_session,p_user,'merchandise',p_items,p_delivery,p_amount,'reserved',p_expires,purchase_profile,purchase_name);
end;$$;
revoke all on function public.reserve_streamflix_checkout(text,integer,jsonb,jsonb,numeric,timestamptz) from public,anon,authenticated;
grant execute on function public.reserve_streamflix_checkout(text,integer,jsonb,jsonb,numeric,timestamptz) to service_role;

create or replace function public.streamflix_order(p_user integer,p_items jsonb,p_delivery jsonb,p_session text default null) returns setof public.merchandise_transaction
language plpgsql security invoker set search_path='' as $$
declare item jsonb; product public.merchandise_product; tx public.merchandise_transaction; qty integer; checkout public.integration_checkouts; reserved boolean=false; unit_price numeric; purchase_profile integer; purchase_name text;
begin
 if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 30 then raise exception 'Invalid cart'; end if;
 if p_session is not null then
  select * into checkout from public.integration_checkouts where session_id=p_session for update;
  if not found or checkout.user_id<>p_user or checkout.kind<>'merchandise' or checkout.items<>p_items or checkout.fulfilled or checkout.reservation_status in ('released','consumed') then raise exception 'Invalid paid checkout'; end if;
  reserved=checkout.reservation_status='reserved';
  purchase_profile=checkout.profile_id; purchase_name=checkout.profile_name;
  -- A deleted profile retains its purchase-name snapshot; never reassign a paid order.
 else
  purchase_profile=coalesce((p_delivery->>'profile_id')::integer,(select min(profile_id) from public.profiles where user_id=p_user));
  select profile_name into purchase_name from public.profiles where profile_id=purchase_profile and user_id=p_user for key share;
  if not found then raise exception 'Select a profile belonging to this account'; end if;
 end if;
 for item in select value from jsonb_array_elements(p_items) order by (value->>'product_id')::integer loop
  qty=(item->>'quantity')::integer;
  if qty is null or qty not between 1 and 100 then raise exception 'Invalid quantity'; end if;
  select * into product from public.merchandise_product where product_id=(item->>'product_id')::integer for update;
  if not found or (not reserved and (product.listing_status<>'active' or product.stock_quantity<qty)) then raise exception 'Product unavailable or insufficient stock'; end if;
  unit_price=case when p_session is null then product.price else (item->>'price')::numeric end;
  if unit_price is null or unit_price<0 then raise exception 'Invalid price'; end if;
  if not reserved then
   update public.merchandise_product set stock_quantity=stock_quantity-qty,listing_status=case when stock_quantity=qty then 'sold_out'::public.listing_status_enum else listing_status end,updated_at=now() where product_id=product.product_id;
  end if;
  insert into public.merchandise_transaction(user_id,product_id,quantity,total_amount,price_at_purchase,payment_method,payment_status,order_status,delivery_method,delivery_name,delivery_phone,delivery_address,stripe_checkout_session_id,profile_id,profile_name)
  values(p_user,product.product_id,qty,round(unit_price*qty,2),unit_price,case when p_session is null then 'Cash on Delivery' else 'Card' end,case when p_session is null then 'pending' else 'paid' end,'pending',p_delivery->>'delivery_method',p_delivery->>'delivery_name',p_delivery->>'delivery_phone',p_delivery->>'delivery_address',p_session,purchase_profile,purchase_name) returning * into tx;
  return next tx;
 end loop;
 if reserved then update public.integration_checkouts set reservation_status='consumed' where session_id=p_session; end if;
end;$$;
revoke all on function public.streamflix_order(integer,jsonb,jsonb,text) from public,anon,authenticated;
grant execute on function public.streamflix_order(integer,jsonb,jsonb,text) to service_role;

notify pgrst, 'reload schema';
commit;
