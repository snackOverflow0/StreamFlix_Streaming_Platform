-- Profile-specific viewing history. Existing history belongs to the first profile.
ALTER TABLE public.view_history ADD COLUMN IF NOT EXISTS profile_id integer;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_profile_owner_key ON public.profiles(profile_id,user_id);
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='view_history_profile_owner_fkey') THEN
  ALTER TABLE public.view_history ADD CONSTRAINT view_history_profile_owner_fkey
   FOREIGN KEY(profile_id,user_id) REFERENCES public.profiles(profile_id,user_id) ON DELETE CASCADE;
 END IF;
END $$;
UPDATE public.view_history h SET profile_id=(SELECT p.profile_id FROM public.profiles p WHERE p.user_id=h.user_id ORDER BY p.created_at,p.profile_id LIMIT 1) WHERE h.profile_id IS NULL;
CREATE INDEX IF NOT EXISTS view_history_profile_recent_idx ON public.view_history(profile_id,watch_date DESC);
CREATE OR REPLACE FUNCTION public.save_streamflix_profile_progress(p_user integer,p_profile integer,p_content integer,p_episode integer,p_progress numeric) RETURNS public.view_history
LANGUAGE plpgsql SET search_path='' AS $$
DECLARE saved public.view_history;
BEGIN
 IF p_progress IS NULL OR p_progress<0 OR p_progress>100 THEN RAISE EXCEPTION 'Invalid progress' USING errcode='23514'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.users WHERE user_id=p_user AND account_status='active' AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Account is not active' USING errcode='23514'; END IF;
 PERFORM 1 FROM public.profiles WHERE profile_id=p_profile AND user_id=p_user FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Profile does not belong to this account' USING errcode='23514'; END IF;
 SELECT * INTO saved FROM public.view_history WHERE user_id=p_user AND profile_id=p_profile AND content_id=p_content AND episode_id IS NOT DISTINCT FROM p_episode ORDER BY watch_date DESC,history_id DESC LIMIT 1;
 IF FOUND THEN
  UPDATE public.view_history SET progress_percentage=p_progress,watch_date=now() WHERE history_id=saved.history_id RETURNING * INTO saved;
 ELSE
  INSERT INTO public.view_history(user_id,profile_id,content_id,episode_id,progress_percentage,watch_date) VALUES(p_user,p_profile,p_content,p_episode,p_progress,now()) RETURNING * INTO saved;
 END IF;
 RETURN saved;
END $$;
REVOKE EXECUTE ON FUNCTION public.save_streamflix_profile_progress(integer,integer,integer,integer,numeric) FROM public,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_streamflix_profile_progress(integer,integer,integer,integer,numeric) TO service_role;
-- Older installations write only to the first profile, never to a shared history.
CREATE OR REPLACE FUNCTION public.save_streamflix_progress(p_user integer,p_content integer,p_episode integer,p_progress numeric) RETURNS public.view_history
LANGUAGE plpgsql SET search_path='' AS $$
DECLARE target_profile integer;
BEGIN
 SELECT profile_id INTO target_profile FROM public.profiles WHERE user_id=p_user ORDER BY created_at,profile_id LIMIT 1;
 RETURN public.save_streamflix_profile_progress(p_user,target_profile,p_content,p_episode,p_progress);
END $$;
REVOKE EXECUTE ON FUNCTION public.save_streamflix_progress(integer,integer,integer,numeric) FROM public,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_streamflix_progress(integer,integer,integer,numeric) TO service_role;
