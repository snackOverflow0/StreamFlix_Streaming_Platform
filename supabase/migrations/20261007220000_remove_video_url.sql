-- Remove legacy playback columns that are not part of the current StreamFlix schema.

alter table public.content
  drop column if exists video_url;

alter table public.episodes
  drop column if exists video_url;
