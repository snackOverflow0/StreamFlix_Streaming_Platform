import {createHmac,timingSafeEqual} from 'node:crypto';
import type {RequestHandler} from 'express';
import {AppError} from './utils/errors.js';
import {supabase} from './config/supabase.js';
import {verifyCheckout} from './payments.routes.js';

export function verifyStripeSignature(body:Buffer,header:string,secret:string,now=Date.now()) {
 const parts=header.split(',').map(value=>value.trim().split('='));
 const timestamp=parts.find(([key])=>key==='t')?.[1];
 if(!timestamp||!/^\d+$/.test(timestamp)||Math.abs(now/1000-Number(timestamp))>300)return false;
 const expected=createHmac('sha256',secret).update(timestamp+'.').update(body).digest();
 return parts.some(([key,value])=>key==='v1'&&/^[a-f0-9]{64}$/i.test(value??'')&&timingSafeEqual(expected,Buffer.from(value!,'hex')));
}

export const stripeWebhook:RequestHandler=async(req,res,next)=>{try{
 const secret=process.env.STRIPE_WEBHOOK_SECRET?.trim();
 if(!secret)throw new AppError(503,'Payment webhook is not configured');
 if(!Buffer.isBuffer(req.body)||!verifyStripeSignature(req.body,req.get('stripe-signature')??'',secret))throw new AppError(400,'Invalid webhook signature');
 let event;try{event=JSON.parse(req.body.toString('utf8'));}catch{throw new AppError(400,'Invalid webhook payload');}
 if(!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event?.type)){res.json({received:true});return;}
 const sessionId=event?.data?.object?.id;
 if(typeof sessionId!=='string'||!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sessionId))throw new AppError(400,'Invalid checkout session');
 const {data,error}=await supabase.from('integration_checkouts').select('user_id,kind').eq('session_id',sessionId).maybeSingle();
 if(error)throw error;
 // Ignore checkout sessions created by other applications on the same Stripe account.
 if(!data&&["subscription","merchandise"].includes(event?.data?.object?.metadata?.kind))throw new AppError(503,"Checkout record not available yet; retry delivery");
 if(data){
  res.locals.changeUserId=data.user_id;
  try{await verifyCheckout(sessionId,data.user_id,data.kind);}catch{throw new AppError(503,'Payment fulfillment pending; retry delivery');}
 }
 // The fulfillment RPC locks the checkout and commits orders/subscriptions once.
 res.json({received:true});
}catch(error){next(error);}};
