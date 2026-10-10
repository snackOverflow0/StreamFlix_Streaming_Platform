import {personalProfile} from '../../utils/profile-scope.js';
import {isKidsSuitable} from '../../utils/kids-policy.js';
import {resolveTrailerUrl} from '../../utils/trailer-url.js';
import {manilaDate} from "../../utils/subscription-date.js";
import {Router} from 'express';
import {requireAuth} from '../../middleware/auth.middleware.js';
import {getCurrentAppUser} from '../../utils/ownership.js';
import {parseId} from '../../utils/http.js';
import {AppError} from '../../utils/errors.js';
import {supabase} from '../../config/supabase.js';
import {getContentById} from './content.service.js';
export const playbackRouter=Router();
playbackRouter.post('/:contentId/playback',requireAuth,async(req,res,next)=>{try{
 const user=await getCurrentAppUser(req),content=await getContentById(parseId(String(req.params.contentId)));
 if(!content)throw new AppError(404,'Content not found');
 const profileId=await personalProfile(req,user.user_id);
 const {data:profile,error:profileError}=await supabase.from('profiles').select('profile_name,is_kids').eq('profile_id',profileId).eq('user_id',user.user_id).single();
 if(profileError)throw profileError;
 if(profile.is_kids===true&&!isKidsSuitable(content.age_rating,content.is_kids_suitable))throw new AppError(403,'This title is not available for Kids profiles.');
 const {data:subs,error:subError}=await supabase.from('subscriptions').select('status,start_date,end_date').eq('subscription_user_id',user.user_id).eq('status','active');if(subError)throw subError;
 const today=manilaDate();if(!subs?.some(s=>s.start_date<=today&&(!s.end_date||s.end_date>=today)))throw new AppError(403,'Renew your subscription to keep watching.');
 let url=content.trailer_url;
 if(req.body?.episode_id!==undefined){if(String(content.type).toLowerCase()!=='series')throw new AppError(400,'Episodes belong to TV series');const {data:episode,error}=await supabase.from('episodes').select('trailer_url,season_id').eq('episode_id',parseId(String(req.body.episode_id))).maybeSingle();if(error)throw error;if(!episode)throw new AppError(404,'Episode not found');const {data:season,error:seasonError}=await supabase.from('season').select('content_id').eq('season_id',episode.season_id).maybeSingle();if(seasonError)throw seasonError;if(season?.content_id!==content.content_id)throw new AppError(404,'Episode not found for this title');url=episode.trailer_url||content.trailer_url;}
 if(!url)throw new AppError(404,'No playback file has been uploaded yet.');
 url=await resolveTrailerUrl(url);if(!url)throw new AppError(404,'No trailer is available for this title yet.');
 res.json({url,expiresIn:3600});
}catch(e){next(e);}});
