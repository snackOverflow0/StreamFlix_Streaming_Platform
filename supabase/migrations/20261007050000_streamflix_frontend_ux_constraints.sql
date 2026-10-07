-- StreamFlix UX hardening: keep profile/device data bounded at the database boundary
-- and make notification/subscription reads cheap for the Netflix-style shell.

alter table public.profiles
  drop constraint if exists chk_profiles_profile_name_length;
alter table public.profiles
  add constraint chk_profiles_profile_name_length
  check (char_length(trim(profile_name)) between 2 and 20)
  not valid;

alter table public.profiles
  drop constraint if exists chk_profiles_device_length;
alter table public.profiles
  add constraint chk_profiles_device_length
  check (device is null or char_length(device) <= 80)
  not valid;

create index if not exists idx_notifications_user_read_created
  on public.notifications(user_id, is_read, created_at desc);

create index if not exists idx_subscriptions_user_status_created
  on public.subscriptions(subscription_user_id, status, created_at desc);

create index if not exists idx_payment_transactions_user_session
  on public.payment_transactions(user_id, gateway_session_id, created_at desc);
