alter table public.profiles add column if not exists is_kids boolean not null default false;
alter table public.content add column if not exists is_kids_suitable boolean not null default false;
update public.profiles set is_kids=true where lower(trim(profile_name))='kids';
update public.content set is_kids_suitable=true where title in ('Toy Story 5','Minions and Monsters') and age_rating='PG' and genre_id in (select genre_id from public.genre where lower(genre_name)='animation');
notify pgrst,'reload schema';
