import {mediaBuckets} from '../../utils/trailer-url.js';
import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { supabase } from '../../config/supabase.js';
import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { AppError } from '../../utils/errors.js';
export const uploadRouter=Router();
const bucket='streamflix-media';
const extensions:Record<string,string>={'video/mp4':'mp4','video/webm':'webm','video/quicktime':'mov','image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
uploadRouter.post('/uploads/sign',async(req,res,next)=>{try{
 const {name,mimeType,size,purpose}=req.body||{};const targetBucket=String(mimeType).startsWith('video/')?(mimeType==='video/mp4'?'Trailers':'streamflix-videos'):purpose==='product'?'products':'images';if(purpose==='playback'&&!String(mimeType).startsWith('video/'))throw new AppError(400,'Playback requires a video file');
 if(typeof name!=='string'||!name.trim()||name.length>250||!extensions[mimeType]||!Number.isSafeInteger(size)||size<1||size>536870912)throw new AppError(400,'Choose an MP4, WebM, MOV, JPG, PNG, or WebP file up to 512 MB. Your Supabase project limit may be lower.');
 const id=randomUUID(),actor=(req as unknown as AuthenticatedRequest).auth.authUserId;
 const path=`${actor}/${id}.${extensions[mimeType]}`;
 const {error:saveError}=await supabase.from('admin_uploads').insert({upload_id:id,auth_user_id:actor,path,name,mime_type:mimeType,size,bucket:targetBucket});
 if(saveError)throw saveError;
 const {data,error}=await supabase.storage.from(targetBucket).createSignedUploadUrl(path);
 if(error||!data)throw error||new AppError(503,'Storage unavailable');
 res.json({uploadId:id,bucket:targetBucket,path,token:data.token});
 }catch(e){next(e);}});
uploadRouter.post('/uploads/:id/complete',async(req,res,next)=>{try{
 const id=String(req.params.id);if(!/^[0-9a-f-]{36}$/i.test(id))throw new AppError(400,'Invalid upload ID');
 const {data:upload,error}=await supabase.from('admin_uploads').select('*').eq('upload_id',id).eq('auth_user_id',(req as unknown as AuthenticatedRequest).auth.authUserId).maybeSingle();
 if(error)throw error;if(!upload)throw new AppError(404,'Upload not found');
 const {data:files,error:listError}=await supabase.storage.from(upload.bucket).list(upload.path.split('/')[0],{search:upload.path.split('/')[1],limit:10});
 if(listError)throw listError;const file=files?.find(f=>f.name===upload.path.split('/')[1]);
 if(!file||Number(file.metadata?.size)!==Number(upload.size)||file.metadata?.mimetype!==upload.mime_type)throw new AppError(400,'Upload is incomplete or does not match the selected file');
 const url=`storage://${upload.bucket}/${upload.path}`;
 // Deterministic name plus unique upload ID makes completion retries idempotent.
 const {data:asset,error:assetError}=await supabase.from('admin_media_assets').upsert({upload_id:id,name:upload.name,url,kind:upload.mime_type.startsWith('video/')?'Video':'Image',folder:'Uploads'},{onConflict:'upload_id'}).select('*').single();
 if(assetError)throw assetError;
 const {error:doneError}=await supabase.from('admin_uploads').update({asset_id:asset.asset_id,completed_at:new Date().toISOString()}).eq('upload_id',id);if(doneError)throw doneError;
 res.json({url,asset});
 }catch(e){next(e);}});

uploadRouter.get('/storage/files',async(req,res,next)=>{try{
 const bucket=String(req.query.bucket??''),folder=String(req.query.folder??''),offset=Number(req.query.offset??0);
 if(!mediaBuckets.has(bucket)||folder.split('/').some(p=>p==='..'||p==='.')||!Number.isSafeInteger(offset)||offset<0)throw new AppError(400,'Invalid storage location');
 const {data,error}=await supabase.storage.from(bucket).list(folder,{limit:100,offset,sortBy:{column:'name',order:'asc'}});if(error)throw error;
 res.json({files:(data??[]).map(file=>({name:file.name,isFolder:!file.id,path:folder?folder+'/'+file.name:file.name,reference:`storage://${bucket}/${folder?folder+'/':''}${file.name}`})),hasMore:(data??[]).length===100});
}catch(error){next(error);}});
