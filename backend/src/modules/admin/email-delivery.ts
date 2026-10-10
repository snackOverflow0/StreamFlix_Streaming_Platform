import {Router} from 'express';
import {supabase} from '../../config/supabase.js';
import {emailConfiguration,processEmails} from '../../transactional-email.js';
import {AppError} from '../../utils/errors.js';
export const emailDeliveryRouter=Router();
emailDeliveryRouter.get('/email-delivery',async(_req,res,next)=>{try{
 const {data,error}=await supabase.from('transactional_email_outbox').select('id,event_key,kind,recipient,status,attempts,last_error,created_at,sent_at,provider_message_id').order('created_at',{ascending:false}).limit(100);if(error)throw error;
 res.json({...emailConfiguration(),jobs:data??[],limit:100});
}catch(error){next(error);}});
emailDeliveryRouter.post('/email-delivery/:id/retry',async(req,res,next)=>{try{
 if(!/^[a-f0-9-]{36}$/i.test(String(req.params.id)))throw new AppError(400,'Invalid email ID');
 if(!emailConfiguration().configured)throw new AppError(503,'Configure the Brevo API key and verified sender in backend/.env first');
 const {data,error}=await supabase.from('transactional_email_outbox').select('status').eq('id',req.params.id).maybeSingle();if(error)throw error;if(!data)throw new AppError(404,'Email not found');
 if(!['failed','uncertain'].includes(data.status))throw new AppError(409,'Only failed or uncertain emails can be retried');
 if(data.status==='uncertain'&&req.body?.confirmed_not_sent!==true)throw new AppError(409,'Check Brevo logs and confirm the message was not accepted before retrying');
 const {data:updated,error:updateError}=await supabase.from('transactional_email_outbox').update({status:'pending',attempts:0,available_at:new Date().toISOString(),first_attempt_at:null,lock_token:null,last_error:null}).eq('id',req.params.id).eq('status',data.status).select('id').maybeSingle();if(updateError)throw updateError;if(!updated)throw new AppError(409,'Delivery changed; refresh before retrying');
 void processEmails();res.json({queued:true});
}catch(error){next(error);}});
