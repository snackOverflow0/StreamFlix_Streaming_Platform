import { personalProfile } from "./utils/profile-scope.js";
import {getProfile} from "./modules/profiles/profile.service.js";
import {Router} from 'express';
import {supabase} from './config/supabase.js';
import {requireAuth} from './middleware/auth.middleware.js';
import {getCurrentAppUser} from './utils/ownership.js';
import {AppError} from './utils/errors.js';
import {parseId} from './utils/http.js';
import {listCatalog} from './modules/content/content.service.js';
export const clientRouter=Router();
clientRouter.get('/platform',async(_req,res,next)=>{try{const {data,error}=await supabase.from('admin_settings').select('settings').eq('id',1).maybeSingle();if(error)throw error;const settings=data?.settings??{};const text=(key:string,fallback:string,max=200)=>typeof settings[key]==='string'?String(settings[key]).trim().slice(0,max)||fallback:fallback;const color=(key:string,fallback:string)=>/^#[0-9a-f]{6}$/i.test(settings[key])?settings[key]:fallback;res.json({platformName:text('platformName','StreamFlix',80),tagline:text('tagline','Your next story starts here.'),supportEmail:text('supportEmail','',254),primaryColor:color('primaryColor','#7c3aed'),secondaryColor:color('secondaryColor','#60a5fa')});}catch(error){next(error);}});
clientRouter.post('/visitors/visit',async(req,res,next)=>{try{
 const key=req.body?.visitor_key;
 if(typeof key!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key))throw new AppError(400,'Invalid visitor key');
 const {error}=await supabase.rpc('record_streamflix_visit',{p_key:key});if(error)throw error;
 const {count,error:countError}=await supabase.from('site_visitors').select('visitor_key',{count:'exact',head:true});if(countError)throw countError;
 res.json({uniqueVisitors:count??0});
}catch(e){next(e);}});
clientRouter.use(['/notifications','/recommendations'],requireAuth);
clientRouter.patch('/notifications/read-all',async(req,res,next)=>{try{const user=await getCurrentAppUser(req);const profileId=await personalProfile(req,user.user_id);const {error}=await supabase.from('notifications').update({is_read:true}).eq('user_id',user.user_id).eq('profile_id',profileId).eq('is_read',false);if(error)throw error;res.json({success:true});}catch(e){next(e);}});
clientRouter.patch('/notifications/:id/read',async(req,res,next)=>{try{const user=await getCurrentAppUser(req);const profileId=await personalProfile(req,user.user_id);const {data,error}=await supabase.from('notifications').update({is_read:true}).eq('user_id',user.user_id).eq('profile_id',profileId).eq('notification_id',parseId(String(req.params.id))).select().maybeSingle();if(error)throw error;if(!data)throw new AppError(404,'Notification not found');res.json(data);}catch(e){next(e);}});
clientRouter.get('/recommendations',async(req,res,next)=>{try{
 const user = await getCurrentAppUser(req);
 const profileId = parseId(String(req.query.profile_id), 'profile_id');
 await getProfile(req, profileId);
 const [catalog, historyResult] = await Promise.all([
  listCatalog(),
  supabase.from('view_history').select('content_id,progress_percentage,watch_date').eq('user_id',user.user_id).eq('profile_id',profileId).gt('progress_percentage',0).order('watch_date',{ascending:false}).limit(100)
 ]);
 if(historyResult.error)throw historyResult.error;
 const history=historyResult.data??[],watched=new Set(history.map(x=>Number(x.content_id)));
 const byId=new Map(catalog.map(item=>[Number(item.content_id),item]));
 const weights=new Map<number,number>();
 const interest=(id:number,weight:number)=>{const genre=byId.get(Number(id))?.genre_id;if(genre!=null)weights.set(genre,(weights.get(genre)??0)+weight);};
 const unique=new Set<number>();history.forEach((row,index)=>{const id=Number(row.content_id);if(unique.has(id))return;unique.add(id);interest(id,Math.max(1,5-index*.2));});
 // Viewing recommendations are based only on this profile's history.
 const unseen=catalog.filter(item=>!watched.has(Number(item.content_id)));
 const quality=(a:typeof catalog[number],b:typeof catalog[number])=>b.rating-a.rating||b.review_count-a.review_count||Number(b.content_id)-Number(a.content_id);
 const personalized=[...unseen].sort((a,b)=>(weights.get(b.genre_id)??0)-(weights.get(a.genre_id)??0)||quality(a,b));
 const latestWatched=history.map(row=>byId.get(Number(row.content_id))).find(item=>item!=null);
 const latestGenre=latestWatched?.genre_id;
 res.json({becauseYouWatchedSource:latestWatched?{content_id:latestWatched.content_id,title:latestWatched.title,genre_id:latestWatched.genre_id}:null,becauseYouWatched:latestGenre==null?[]:unseen.filter(item=>item.genre_id===latestGenre).sort(quality).slice(0,12),basedOnYourGenres:personalized.filter(item=>(weights.get(item.genre_id)??0)>0).slice(0,12),recommendedForYou:personalized.slice(0,12)});
}catch(e){next(e);}});
