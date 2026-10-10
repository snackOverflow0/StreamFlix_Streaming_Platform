import {Router,type RequestHandler,type Response} from 'express';
import {requireAuth,type AuthenticatedRequest} from './middleware/auth.middleware.js';
import {getCurrentAppUser} from './utils/ownership.js';
import {supabase} from './config/supabase.js';
import {invalidateCatalog} from './utils/cache.js';
import {AppError} from './utils/errors.js';
const listeners=new Map<Response,{admin:boolean;userId:number|null}>();
export function publishChange(topic:string,userId:number|null=null){
 for(const [res,actor] of listeners){if(res.destroyed){listeners.delete(res);continue;}if(topic!=='catalog'&&!actor.admin&&actor.userId!==userId)continue;
  if(res.writableLength>65536){res.end();continue;}
  res.write(`data: ${JSON.stringify({topic})}\n\n`);
 }
}
export const mutationEvents:RequestHandler=(req,res,next)=>{
 const original=res.json.bind(res);let owner:number|null=null;
 res.json=(body:unknown)=>{const row=Array.isArray(body)?body[0]:body;if(row&&typeof row==='object'){const r=row as Record<string,unknown>;const id=Number(r.user_id??r.subscription_user_id);if(Number.isSafeInteger(id)&&id>0)owner=id;}return original(body);};
 res.on('finish',()=>{
  if(!['POST','PATCH','DELETE'].includes(req.method)||res.statusCode<200||res.statusCode>=300)return;
  const path=req.originalUrl.split('?')[0]??'';
  if(/^\/api\/admin\/(content|genres|licenses|seasons|episodes|products|plans|settings|assets|uploads|reviews)(\/|$)/.test(path)||/^\/api\/reviews(\/|$)/.test(path)){
   invalidateCatalog();publishChange('catalog');
  }else if(!/\/visitors\/|\/auth\/|\/view-history\//.test(path)&&path.startsWith('/api/')){
   publishChange('account',owner??res.locals.changeUserId??null);if(/^\/api\/merchandise\/(orders|transactions)(\/|$)/.test(path))publishChange('catalog');
  }
 });next();
};
export const eventsRouter=Router();
eventsRouter.get('/events',requireAuth,async(req,res,next)=>{try{
 const {data,error}=await supabase.from('admin_roles').select('role').eq('auth_user_id',(req as AuthenticatedRequest).auth.authUserId).maybeSingle();if(error)throw error;
 const admin=data?.role==='administrator';let userId:number|null=null;
 if(!admin)userId=(await getCurrentAppUser(req)).user_id;
 if(listeners.size>=100)throw new AppError(503,'Change stream capacity reached');
 res.status(200).set({'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});res.flushHeaders();
 listeners.set(res,{admin,userId});res.write('data: {"topic":"connected"}\n\n');
 const heartbeat=setInterval(()=>{if(!res.destroyed)res.write(': keepalive\n\n');},20000);
 // Reconnect periodically to revalidate identity and account access.
 const lifetime=setTimeout(()=>res.end(),300000);
 res.on('close',()=>{clearInterval(heartbeat);clearTimeout(lifetime);listeners.delete(res);});
}catch(error){next(error);}});
