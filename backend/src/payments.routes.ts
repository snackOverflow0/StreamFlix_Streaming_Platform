import {invalidateCatalog} from './utils/cache.js';
import {receiptStatus} from './transactional-email.js';
import {publishChange} from './change-events.js';
import {Router} from 'express';
import {supabase} from './config/supabase.js';
import {requireAuth} from './middleware/auth.middleware.js';
import {ensureUserOwnsResource} from './utils/ownership.js';
import {AppError} from './utils/errors.js';
import {parseId,requireString,optionalString} from './utils/http.js';
import {getPlan} from './modules/subscriptions/subscription.service.js';
import {getProfile} from './modules/profiles/profile.service.js';
import {getProduct} from './modules/merchandise/merchandise.service.js';
type Session={id:string;url:string|null;status:string;payment_status:string;payment_intent:string|null;amount_total:number;currency:string;client_reference_id:string;metadata:Record<string,string>;expires_at?:number};
type Checkout={session_id:string;user_id:number;kind:string;profile_id:number|null;profile_name:string|null;plan_id:number|null;items:Array<{product_id:number;quantity:number;price:number;name:string}>;delivery:Record<string,string>;amount:number;fulfilled:boolean};
export const paymentRouter=Router();

// Public Stripe return bridge: Chrome can load this HTTP(S) page, while the
// Capacitor WebView is not reachable from an external browser.
paymentRouter.get('/payments/mobile-return', (req,res) => {
  const kind = req.query.kind === 'merchandise' ? 'merchandise' : req.query.kind === 'subscription' ? 'subscription' : '';
  const status = req.query.status === 'cancel' ? 'cancel' : 'success';
  const sessionId = String(req.query.session_id ?? '');
  if (!kind || (status === 'success' && !/^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(sessionId))) return res.status(400).send('Invalid checkout return.');
  const deeplink = `streamflix://payment/${status}?kind=${encodeURIComponent(kind)}${status === 'success' ? `&session_id=${encodeURIComponent(sessionId)}` : ''}`;
  const safe = JSON.stringify(deeplink).replace(/</g,'\\u003c');
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'");
  res.send(`<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Return to StreamFlix</title></head><body style="margin:0;background:#070b1a;color:#fff;font:16px system-ui;display:grid;min-height:100vh;place-content:center;text-align:center;padding:24px"><h2>${status === 'success' ? 'Checkout complete' : 'Checkout cancelled'}</h2><p>Return to StreamFlix to ${status === 'success' ? 'verify your payment' : 'continue'}.</p><a id="open" style="display:block;padding:15px 24px;border-radius:12px;background:#714bdf;color:white;text-decoration:none" href="${deeplink}">Open StreamFlix</a><script>setTimeout(function(){location.href=${safe}},400);</script></body></html>`);
});
function mobileReturnBase() {
  const input = process.env.MOBILE_RETURN_BASE_URL?.trim();
  if (!input) throw new AppError(503,'MOBILE_RETURN_BASE_URL is required for APK card checkout. Set it to an HTTP(S) URL reachable on your phone.');
  const url = new URL(input);
  if (!['http:','https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new AppError(503,'MOBILE_RETURN_BASE_URL must be an HTTP(S) origin ending in /.');
  if (['localhost','127.0.0.1','0.0.0.0'].includes(url.hostname)) throw new AppError(503,'Mobile return URL cannot use localhost. Use the PC hotspot IP or a public HTTPS domain.');
  return url.origin;
}

paymentRouter.use(['/payments','/merchandise/orders'],requireAuth);
paymentRouter.get('/payments/config',(_req,res)=>{
 const keyConfigured=Boolean(process.env.STRIPE_SECRET_KEY?.trim());
 const webhookConfigured=Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
 res.json({card:keyConfigured&&webhookConfigured,cod:true,subscriptionBilling:'one-time-30-days',unavailableReason:!keyConfigured?'payment-provider-not-configured':!webhookConfigured?'payment-confirmation-not-configured':null});
});
async function stripe(path:string,body?:URLSearchParams):Promise<Session>{
 const key=process.env.STRIPE_SECRET_KEY?.trim();if(!key)throw new AppError(503,'Card checkout is unavailable. Please contact support or use cash on delivery for merchandise.');
 const response=await fetch(`https://api.stripe.com/v1/checkout/sessions${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${key}`,...(body?{'Content-Type':'application/x-www-form-urlencoded'}:{})},body,signal:AbortSignal.timeout(15000)});
 const data=await response.json() as Session & {error?:{message:string}};
 if(!response.ok)throw new AppError(response.status===404?404:502,data.error?.message??'Stripe checkout unavailable');return data;
}
function clientURL(){const url=new URL(process.env.CLIENT_URL??'http://localhost:5173');if(!['http:','https:'].includes(url.protocol))throw new AppError(503,'CLIENT_URL must use HTTP or HTTPS');return url.origin;}
async function saveCheckout(userId:number,kind:string,items:Checkout['items'],delivery:Record<string,string>,planId:number|null,email:string,mobile=false){
 if(!process.env.STRIPE_WEBHOOK_SECRET?.trim())throw new AppError(503,'Card checkout is unavailable until payment confirmation is configured.');
 const amount=items.reduce((sum,item)=>sum+Math.round(item.price*100)*item.quantity,0)/100;
 if(amount<=0)throw new AppError(400,'Checkout amount must be positive');
 const redirectBase = mobile ? `${mobileReturnBase()}/api/payments/mobile-return` : null;
 const successUrl = mobile ? `${redirectBase}?kind=${kind}&status=success&session_id={CHECKOUT_SESSION_ID}` : `${clientURL()}/?${kind==='subscription'?'subscription':'merch'}_session_id={CHECKOUT_SESSION_ID}`;
 const cancelUrl = mobile ? `${redirectBase}?kind=${kind}&status=cancel` : `${clientURL()}/`;
 const params=new URLSearchParams({mode:'payment',success_url:successUrl,cancel_url:cancelUrl,client_reference_id:String(userId),customer_email:email,'metadata[kind]':kind});
 if(kind==='merchandise')params.set('metadata[profile_id]',delivery.profile_id!);
 params.set('payment_method_types[0]','card');
 params.set('expires_at',String(Math.floor(Date.now()/1000)+31*60));
 items.forEach((item,i)=>{params.set(`line_items[${i}][price_data][currency]`,'php');params.set(`line_items[${i}][price_data][unit_amount]`,String(Math.round(item.price*100)));params.set(`line_items[${i}][price_data][product_data][name]`,item.name);params.set(`line_items[${i}][quantity]`,String(item.quantity));});
 const session=await stripe('',params);
 const {error}=kind==='merchandise'?await supabase.rpc('reserve_streamflix_checkout',{p_session:session.id,p_user:userId,p_items:items,p_delivery:delivery,p_amount:amount,p_expires:new Date((session.expires_at??Math.floor(Date.now()/1000)+31*60)*1000).toISOString()}):await supabase.from('integration_checkouts').insert({session_id:session.id,user_id:userId,kind,plan_id:planId,items,delivery,amount});
 if(error){await stripe(`/${encodeURIComponent(session.id)}/expire`,new URLSearchParams()).catch(()=>undefined);if(kind==='merchandise')throw new AppError(409,'Stock or price changed, or too many checkouts are open. Refresh your bag and try again after an existing checkout expires.');throw error;}
 if(kind==='merchandise'){invalidateCatalog();publishChange('catalog');}
 return session;
}
export async function verifyCheckout(sessionId:string,userId:number,kind:string){
 if(!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sessionId))throw new AppError(400,'Invalid checkout session');
 const {data,error}=await supabase.from('integration_checkouts').select('*').eq('session_id',sessionId).eq('user_id',userId).eq('kind',kind).maybeSingle();if(error)throw error;if(!data)throw new AppError(404,'Checkout not found');
 const checkout=data as Checkout,session=await stripe(`/${encodeURIComponent(sessionId)}`);
 if(kind==='merchandise'&&checkout.profile_id!==null&&session.metadata.profile_id&&session.metadata.profile_id!==String(checkout.profile_id))throw new AppError(409,'Purchasing profile does not match checkout');
 if(session.client_reference_id!==String(userId)||session.metadata.kind!==kind||session.currency!=='php'||session.amount_total!==Math.round(checkout.amount*100))throw new AppError(409,'Checkout details do not match');
 if(session.payment_status==='paid'&&session.status==='complete'&&!checkout.fulfilled){const {error:fulfillError}=await supabase.rpc('fulfill_streamflix_checkout',{p_session:sessionId,p_payment:session.payment_intent??sessionId});if(fulfillError)throw new AppError(409,'Payment confirmed, but fulfillment needs administrator review. Do not pay again.');checkout.fulfilled=true;publishChange("account",userId);if(kind==="merchandise")publishChange("catalog");}
 return {checkout,session};
}
paymentRouter.post('/payments/subscription-checkout',async(req,res,next)=>{try{
 const userId=parseId(String(req.body?.user_id)),user=await ensureUserOwnsResource(req,userId),plan=await getPlan(parseId(String(req.body?.plan_id)));
 if(!plan.is_active)throw new AppError(400,'Selected plan is inactive');
 const session=await saveCheckout(userId,'subscription',[{product_id:0,quantity:1,price:Number(plan.monthly_price),name:`StreamFlix ${plan.plan_name} — 30 days`}],{},plan.plan_id,String(user.email),req.body?.mobile_checkout===true);res.json({checkout_url:session.url,session_id:session.id,plan});
}catch(e){next(e);}});
paymentRouter.get('/payments/subscription-checkout-status',async(req,res,next)=>{try{
 const {getCurrentAppUser}=await import('./utils/ownership.js');const user=await getCurrentAppUser(req);
 const {checkout,session}=await verifyCheckout(String(req.query.session_id??''),user.user_id,'subscription');
 const plan=await getPlan(checkout.plan_id!);
 const [{data:subscription,error:subError},{data:payment,error:payError}]=await Promise.all([supabase.from('subscriptions').select('*').eq('subscription_user_id',user.user_id).eq('stripe_checkout_session_id',session.id).maybeSingle(),supabase.from('payment_transactions').select('*').eq('user_id',user.user_id).eq('gateway_session_id',session.id).maybeSingle()]);if(subError)throw subError;if(payError)throw payError;
 res.json({complete:checkout.fulfilled,checkout_status:session.status,payment_status:session.payment_status,subscription,payment,plan,...await receiptStatus(session.id,user.user_id)});
}catch(e){next(e);}});
async function cart(body:Record<string,unknown>){
 if(!Array.isArray(body.items)||body.items.length<1||body.items.length>30)throw new AppError(400,'Cart must have 1–30 items');
 const counts=new Map<number,number>();
 for(const row of body.items){const id=parseId(String(row?.product_id)),quantity=Number(row?.quantity);if(!Number.isSafeInteger(quantity)||quantity<1||quantity>100)throw new AppError(400,'Quantity must be 1–100');counts.set(id,(counts.get(id)??0)+quantity);}
 const items:Checkout['items']=[];
 for(const [id,quantity]of counts){const product=await getProduct(id);if(quantity>100||product.listing_status!=='active'||product.stock<quantity)throw new AppError(409,'Product unavailable or insufficient stock');items.push({product_id:id,quantity,price:Number(product.price),name:product.product_name});}
 if(!['Standard Delivery (3-5 days)','Store Pickup'].includes(String(body.delivery_method)))throw new AppError(400,'Choose a supported delivery method');
 const delivery={delivery_method:String(body.delivery_method),delivery_name:requireString(body.delivery_name,'delivery_name',100),delivery_phone:requireString(body.delivery_phone,'delivery_phone',100),delivery_address:body.delivery_method==='Store Pickup'?(optionalString(body.delivery_address,'delivery_address',1000)??''):requireString(body.delivery_address,'delivery_address',1000)};if(!/^\d{10,15}$/.test(delivery.delivery_phone))throw new AppError(400,'Delivery phone must contain 10 to 15 digits');return {items,delivery};
}
paymentRouter.post('/merchandise/orders/cod/user/:userId',async(req,res,next)=>{try{const id=parseId(String(req.params.userId));await ensureUserOwnsResource(req,id);const {items,delivery}=await cart(req.body);const profile=await getProfile(req,parseId(String(req.body?.profile_id),'profile_id'));if(profile.user_id!==id)throw new AppError(403,'Profile does not belong to this account');const ownedDelivery={...delivery,profile_id:String(profile.profile_id)};const {data,error}=await supabase.rpc('streamflix_order',{p_user:id,p_items:items,p_delivery:ownedDelivery,p_session:null});if(error)throw new AppError(409,'Unable to place order: product unavailable or insufficient stock');res.status(201).json(data);}catch(e){next(e);}});
paymentRouter.post('/merchandise/orders/card/user/:userId/checkout',async(req,res,next)=>{try{const id=parseId(String(req.params.userId)),user=await ensureUserOwnsResource(req,id),{items,delivery}=await cart(req.body);const profile=await getProfile(req,parseId(String(req.body?.profile_id),'profile_id'));if(profile.user_id!==id)throw new AppError(403,'Profile does not belong to this account');const session=await saveCheckout(id,'merchandise',items,{...delivery,profile_id:String(profile.profile_id)},null,String(user.email),req.body?.mobile_checkout===true);res.json({checkout_url:session.url,session_id:session.id});}catch(e){next(e);}});
paymentRouter.get('/merchandise/orders/card/status',async(req,res,next)=>{try{const id=parseId(String(req.query.user_id));await ensureUserOwnsResource(req,id);const {checkout,session}=await verifyCheckout(String(req.query.session_id??''),id,'merchandise');res.json({found:true,profile_id:checkout.profile_id,profile_name:checkout.profile_name,paid:session.payment_status==='paid',fulfilled:checkout.fulfilled,order_count:checkout.fulfilled?checkout.items.length:0,checkout_status:session.status,payment_status:session.payment_status,...await receiptStatus(session.id,id)});}catch(e){next(e);}});

let releasing=false;
export async function releaseExpiredCheckouts(){
 if(releasing||!process.env.STRIPE_SECRET_KEY?.trim())return;releasing=true;
 try{const {data,error}=await supabase.from('integration_checkouts').select('session_id,user_id,kind').eq('reservation_status','reserved').eq('fulfilled',false).lt('expires_at',new Date().toISOString()).order('reservation_checked_at',{ascending:true,nullsFirst:true}).order('expires_at').limit(5);if(error)throw error;
 for(const checkout of data??[]){try{const {error:checkedError}=await supabase.from('integration_checkouts').update({reservation_checked_at:new Date().toISOString()}).eq('session_id',checkout.session_id);if(checkedError)throw checkedError;const session=await stripe('/'+encodeURIComponent(checkout.session_id));if(session.status==='expired'&&session.payment_status==='unpaid'){const {error:releaseError}=await supabase.rpc('release_streamflix_checkout',{p_session:checkout.session_id});if(releaseError)throw releaseError;publishChange('catalog');}else if(session.status==='complete'&&session.payment_status==='paid'){await verifyCheckout(checkout.session_id,checkout.user_id,checkout.kind);}}catch{console.error('An expired checkout needs reconciliation. Stock remains reserved until payment status is verified.');}}
 }catch{console.error('Checkout reservation reconciliation is pending. Reserved stock stays protected until Stripe status can be verified.');}finally{releasing=false;}
}
export function startCheckoutWorker(){void releaseExpiredCheckouts();const timer=setInterval(()=>void releaseExpiredCheckouts(),60000);timer.unref();return timer;}
