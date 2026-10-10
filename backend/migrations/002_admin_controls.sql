-- Run AFTER 001_admin.sql. The backend service role remains the write boundary.
-- Prevent direct browser writes from bypassing administrator account/subscription controls.
revoke insert, update, delete on public.users, public.subscriptions from anon, authenticated;
revoke select on public.users from anon, authenticated;
grant select (user_id, full_name, email, phone_number, date_of_birth, account_status,
  created_at, updated_at, deleted_at, auth_user_id) on public.users to authenticated;
-- The supplied backup allowed every authenticated user to read all viewing history.
drop policy if exists "view_history-owner" on public.view_history;
create policy "view_history-owner" on public.view_history for select to authenticated
  using (user_id = public.current_app_user_id());
