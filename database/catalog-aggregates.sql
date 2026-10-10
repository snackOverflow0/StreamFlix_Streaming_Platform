begin;
create or replace function public.streamflix_weekly_views() returns table(content_id integer,weekly_views bigint)
language sql stable set search_path='' as $$
 select h.content_id,count(distinct h.user_id) from public.view_history h
 where h.watch_date>=now()-interval '7 days' and h.progress_percentage>=50 group by h.content_id;
$$;
create or replace function public.streamflix_view_stats() returns table(content_id integer,views bigint,unique_viewers bigint)
language sql stable set search_path='' as $$
 select h.content_id,count(*),count(distinct h.user_id) from public.view_history h where h.progress_percentage>0 group by h.content_id;
$$;
revoke execute on function public.streamflix_weekly_views(),public.streamflix_view_stats() from public,anon,authenticated;
grant execute on function public.streamflix_weekly_views(),public.streamflix_view_stats() to service_role;
notify pgrst,'reload schema';
commit;
