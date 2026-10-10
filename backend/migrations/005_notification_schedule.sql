-- Enable pg_cron in Supabase Dashboard > Database > Extensions first.
-- UTC hourly check. One reminder per subscription/end date, within 3 days of expiry.
select cron.schedule('streamflix-expiry-notifications','0 * * * *','select public.notify_subscription_expiry();');
