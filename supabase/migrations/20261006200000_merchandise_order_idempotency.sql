-- StreamFlix merchandise checkout hardening.
-- Keeps stock decrement atomic and prevents duplicate Stripe webhook delivery
-- from decrementing stock more than once.

create unique index if not exists uq_merch_payment_reference
  on public.merchandise_transaction(payment_reference)
  where payment_reference is not null;

create unique index if not exists uq_merch_stripe_session_product
  on public.merchandise_transaction(stripe_checkout_session_id, product_id)
  where stripe_checkout_session_id is not null;

create or replace function public.create_merchandise_order(
  p_delivery_address text,
  p_delivery_method text,
  p_delivery_name text,
  p_delivery_phone text,
  p_payment_method text,
  p_product_id integer,
  p_quantity integer,
  p_user_id integer,
  p_payment_reference text default null,
  p_stripe_checkout_session_id text default null
) returns public.merchandise_transaction
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.merchandise_product%rowtype;
  v_total numeric(10,2);
  v_row public.merchandise_transaction;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  -- Idempotency check happens before locking/decrementing stock.
  if p_payment_reference is not null then
    select * into v_row
    from public.merchandise_transaction
    where payment_reference = p_payment_reference
    limit 1;

    if found then
      return v_row;
    end if;
  end if;

  select * into v_product
  from public.merchandise_product
  where product_id = p_product_id
  for update;

  if not found then
    raise exception 'Product not found';
  end if;

  -- Re-check after acquiring the product lock. This closes the race where two
  -- duplicate Stripe webhook deliveries arrive at exactly the same time.
  if p_payment_reference is not null then
    select * into v_row
    from public.merchandise_transaction
    where payment_reference = p_payment_reference
    limit 1;

    if found then
      return v_row;
    end if;
  end if;

  if coalesce(v_product.listing_status, 'active') <> 'active' then
    raise exception 'Product is not available';
  end if;

  if coalesce(v_product.stock_quantity, 0) < p_quantity then
    raise exception 'Insufficient stock';
  end if;

  update public.merchandise_product
  set stock_quantity = stock_quantity - p_quantity,
      updated_at = now()
  where product_id = p_product_id;

  v_total := round(v_product.price * p_quantity, 2);

  insert into public.merchandise_transaction (
    user_id,
    product_id,
    quantity,
    total_amount,
    price_at_purchase,
    payment_method,
    payment_status,
    order_status,
    delivery_method,
    delivery_name,
    delivery_phone,
    delivery_address,
    payment_reference,
    stripe_checkout_session_id
  ) values (
    p_user_id,
    p_product_id,
    p_quantity,
    v_total,
    round(v_product.price, 2),
    p_payment_method,
    case
      when lower(p_payment_method) = 'cash on delivery' then 'pending'
      else 'paid'
    end,
    case
      when lower(p_payment_method) = 'cash on delivery' then 'pending'
      else 'processing'
    end,
    p_delivery_method,
    p_delivery_name,
    p_delivery_phone,
    p_delivery_address,
    p_payment_reference,
    p_stripe_checkout_session_id
  )
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.create_merchandise_order(text,text,text,text,text,integer,integer,integer,text,text) from public;
grant execute on function public.create_merchandise_order(text,text,text,text,text,integer,integer,integer,text,text) to service_role;
