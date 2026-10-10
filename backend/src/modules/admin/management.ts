import {isStorageReference,resolveTrailerUrl,stableMediaReference} from '../../utils/trailer-url.js';
import {orderUpdate} from './order-state.js';
import {manilaDate} from "../../utils/subscription-date.js";
import { Router } from 'express';
import { supabase } from '../../config/supabase.js';
import { AppError } from '../../utils/errors.js';
import { parseId } from '../../utils/http.js';
export const managed = {
 seasons: {table:'season',id:'season_id',fields:['content_id','season_number','season_title','release_date'],required:['content_id','season_number','release_date']},
 episodes: {table:'episodes',id:'episode_id',fields:['season_id','episode_number','episode_title','duration','release_date','video_url'],required:['season_id','episode_number','episode_title','duration','release_date']},
 plans: {table:'plans',id:'plan_id',fields:['plan_name','max_members','monthly_price','is_active'],required:['plan_name','max_members','monthly_price','is_active']},
 products: {table:'merchandise_product',id:'product_id',fields:['product_name','category','price','listing_status','stock','image_url','description','variants'],required:['product_name','category','price','listing_status']},
 feedback: {table:'feedback',id:'feedback_id',fields:['status'],required:[]},
 reviews: {table:'review',id:'rev_id',fields:[],required:[]},
 orders: {table:'merchandise_transaction',id:'transaction_id',fields:[],required:[]},
 profiles: {table:'profiles',id:'profile_id',fields:[],required:[]},
 members: {table:'members',id:'member_id',fields:[],required:[]},
} as const;
export async function allRows(table:string,columns='*',id?:string,newest?:string) {
 const result:Record<string,unknown>[]=[];
 for(let offset=0;;offset+=500) {let q=supabase.from(table).select(columns);if(newest)q=q.order(newest,{ascending:false});if(id)q=q.order(id,{ascending:!newest});const {data,error}=await q.range(offset,offset+499);if(error)throw error;result.push(...((data??[]) as unknown as Record<string,unknown>[]));if((data??[]).length<500)return result;}
}
export function validDate(value:unknown,field:string) {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)throw new AppError(400,field+' must be a valid YYYY-MM-DD date');return value;
}
export function validateManaged(name:keyof typeof managed,body:unknown,create:boolean) {
 if(!body||typeof body!=='object'||Array.isArray(body))throw new AppError(400,'Invalid record');
 const c=managed[name],input=body as Record<string,unknown>,values:Record<string,unknown>={};
 for(const field of c.fields)if(input[field]!==undefined){const value=input[field];
  if(field.endsWith('_id'))values[field]=parseId(String(value),field);
  else if(field==='stock'){const n=Number(value);if(value===''||value===null||!Number.isSafeInteger(n)||n<0)throw new AppError(400,'Stock must be a nonnegative integer');values[field]=n;}
  else if(field==='variants'){if(!Array.isArray(value)||value.length>100||value.some(v=>typeof v!=='string'||!v.trim()||v.length>100))throw new AppError(400,'Variants must be a list of up to 100 names');values[field]=[...new Set(value.map(v=>v.trim()))];}
  else if(field==='description'){if(typeof value!=='string'||value.length>5000)throw new AppError(400,'Description too long');values[field]=value.trim();}
  else if(['image_url','video_url'].includes(field)){if(value===null||value==='')values[field]=null;else if(isStorageReference(String(value)))values[field]=value;else {let u:URL;try{u=new URL(String(value));}catch{throw new AppError(400,'Invalid media URL');}if(!['http:','https:'].includes(u.protocol))throw new AppError(400,'Invalid media URL');values[field]=stableMediaReference(u.toString());}}
  else if(['season_number','episode_number','duration','max_members'].includes(field)){const n=Number(value);if(!Number.isSafeInteger(n)||n<1||n>1000000)throw new AppError(400,field+' must be a positive integer');values[field]=n;}
  else if(['price','monthly_price'].includes(field)){const n=Number(value);if(value===''||value===null||!Number.isFinite(n)||n<0||n>99999999.99||Math.abs(n*100-Math.round(n*100))>0.00001)throw new AppError(400,'Price must be nonnegative with at most two decimals');values[field]=n;}
  else if(field==='is_active'){if(typeof value!=='boolean')throw new AppError(400,'is_active must be boolean');values[field]=value;}
  else if(field==='release_date')values[field]=validDate(value,field);
  else {if(typeof value!=='string'||!value.trim()||value.length>(field==='season_title'||field==='episode_title'?150:100))throw new AppError(400,'Invalid '+field);values[field]=value.trim();}
 }
 if(!Object.keys(values).length)throw new AppError(400,'No editable fields supplied');
 if(create)for(const field of c.required)if(values[field]===undefined)throw new AppError(400,field+' is required');
 if(values.listing_status&&!['active','sold_out','removed'].includes(String(values.listing_status)))throw new AppError(400,'Invalid listing status');
 if(values.status&&!['pending','in_progress','resolved','closed'].includes(String(values.status)))throw new AppError(400,'Invalid feedback status');
 if (name === "episodes" && values.video_url !== undefined) { values.trailer_url = values.video_url; delete values.video_url; }
 if (name === "products" && values.stock !== undefined) {values.stock_quantity = values.stock; delete values.stock;}
 return values;
}
export function databaseError(error:{code?:string;message?:string}){if(error.code==='23503')throw new AppError(409,'This record is linked to other records. Remove or reassign those links first.');if(error.code==='23505')throw new AppError(409,'A record with these values already exists.');throw error;}
async function checkParent(name:string,values:Record<string,unknown>){
 if(name==='seasons'&&values.content_id){const {data,error}=await supabase.from('content').select('type,deleted_at').eq('content_id',values.content_id).maybeSingle();if(error)throw error;if(!data||data.deleted_at||String(data.type).toLowerCase()!=='series')throw new AppError(400,'Seasons must belong to an existing TV series');}
 if(name==='episodes'&&values.season_id){const {data,error}=await supabase.from('season').select('season_id').eq('season_id',values.season_id).maybeSingle();if(error)throw error;if(!data)throw new AppError(400,'Select an existing season');}
}
export const managementRouter=Router();
managementRouter.get('/management',async(_req,res,next)=>{try{const result:Record<string,unknown>={};await Promise.all([
 ...Object.entries(managed).map(async([key,c])=>{result[key]=await Promise.all((await allRows(c.table,'*',c.id,key==='reviews'?'review_date':key==='feedback'?'created_date':undefined)).map(async row=>key==='episodes'?{...row,video_url:row.trailer_url}:key==='products'?{...row,image_url:await resolveTrailerUrl(String(row.image_url||'')).catch(()=>null),stock:row.stock_quantity}:row));}),
 allRows('content','content_id,title,type,deleted_at,is_active','content_id').then(rows=>{result.archived=rows.filter(r=>r.deleted_at||r.is_active===false);}),
 (async()=>{const {data,error}=await supabase.rpc('streamflix_view_stats');if(error)throw error;result.viewStats=(data??[]).map((row:{content_id:number;views:number;unique_viewers:number})=>({...row,views:Number(row.views),unique_viewers:Number(row.unique_viewers)}));})(),
]);res.json(result);}catch(e){next(e);}});
managementRouter.patch('/content/:id/restore',async(req,res,next)=>{try{const {data,error}=await supabase.from('content').update({deleted_at:null,is_active:true}).eq('content_id',parseId(String(req.params.id))).select('content_id').maybeSingle();if(error)throw error;if(!data)throw new AppError(404,'Content not found');res.json(data);}catch(e){next(e);}});
managementRouter.post('/subscriptions',async(req,res,next)=>{try{
 const body=req.body;if(!body||typeof body!=='object'||Array.isArray(body))throw new AppError(400,'Invalid subscription');
 const user=parseId(String(body.subscription_user_id)),plan=parseId(String(body.plan_id));const start=validDate(body.start_date,'start_date'),end=validDate(body.end_date,'end_date');if(end<start)throw new AppError(400,'Expiry must be on or after start');
 if(!['active','cancelled'].includes(body.status))throw new AppError(400,'Status must be active or cancelled');
 const today=manilaDate();if(body.status==='active'&&(start>today||end<today))throw new AppError(400,'Active subscriptions must be within their start and expiry dates');
 const {data:p,error:pe}=await supabase.from('plans').select('is_active').eq('plan_id',plan).maybeSingle();if(pe)throw pe;if(!p?.is_active)throw new AppError(400,'Select an active plan');
 const {data:u,error:ue}=await supabase.from('users').select('account_status,deleted_at').eq('user_id',user).maybeSingle();if(ue)throw ue;if(!u||u.deleted_at||u.account_status!=='active')throw new AppError(400,'Select an active user');
 const {data,error}=await supabase.from('subscriptions').insert({subscription_user_id:user,plan_id:plan,start_date:start,end_date:end,status:body.status}).select('*').single();if(error)databaseError(error);res.status(201).json(data);
 }catch(e){next(e);}});
managementRouter.post('/:resource',async(req,res,next)=>{const name=String(req.params.resource) as keyof typeof managed;if(!managed[name])return next();try{if(!['seasons','episodes','plans','products'].includes(name))throw new AppError(405,'Records are created through the user application');const values=validateManaged(name,req.body,true);await checkParent(name,values);const {data,error}=await supabase.from(managed[name].table).insert(values).select('*').single();if(error)databaseError(error);res.status(201).json(data);}catch(e){next(e);}});
managementRouter.patch('/orders/:id',async(req,res,next)=>{try{
 const id=parseId(String(req.params.id));
 if(!req.body||typeof req.body!=='object'||Array.isArray(req.body)||!Object.keys(req.body).length||Object.keys(req.body).some(k=>!['order_status','payment_status'].includes(k)))throw new AppError(400,'Only order and payment status can be updated');
 const {data:existing,error:readError}=await supabase.from('merchandise_transaction').select('*').eq('transaction_id',id).maybeSingle();if(readError)throw readError;if(!existing)throw new AppError(404,'Order not found');
 const values=orderUpdate(existing,req.body);
 const {data,error}=await supabase.from('merchandise_transaction').update(values).eq('transaction_id',id).eq('order_status',existing.order_status).eq('payment_status',existing.payment_status).select('*').maybeSingle();if(error)throw error;if(!data)throw new AppError(409,'Order changed. Refresh and try again.');res.json(data);
}catch(e){next(e);}});
managementRouter.patch('/:resource/:id',async(req,res,next)=>{const name=String(req.params.resource) as keyof typeof managed;if(!managed[name])return next();try{const values=validateManaged(name,req.body,false);await checkParent(name,values);const {data,error}=await supabase.from(managed[name].table).update(values).eq(managed[name].id,parseId(String(req.params.id))).select('*').maybeSingle();if(error)databaseError(error);if(!data)throw new AppError(404,'Record not found');res.json(data);}catch(e){next(e);}});
managementRouter.delete('/:resource/:id',async(req,res,next)=>{const name=String(req.params.resource) as keyof typeof managed;if(!managed[name])return next();try{if(!['seasons','episodes','reviews','products'].includes(name))throw new AppError(405,'Deactivate this record instead of deleting it');const {data,error}=await (name==='products'?supabase.from(managed[name].table).update({listing_status:'removed'}):supabase.from(managed[name].table).delete()).eq(managed[name].id,parseId(String(req.params.id))).select(managed[name].id);if(error)databaseError(error);if(!data?.length)throw new AppError(404,'Record not found');res.json({deleted:true});}catch(e){next(e);}});
