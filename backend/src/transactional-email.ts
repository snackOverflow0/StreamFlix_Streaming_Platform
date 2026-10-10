import {supabase} from './config/supabase.js';
export type EmailJob={id:string;event_key:string;user_id:number;kind:string;recipient:string;recipient_name:string;payload:Record<string,unknown>;attempts:number;lock_token:string;first_attempt_at:string;status:string};
export const emailConfiguration=()=>({configured:Boolean(process.env.BREVO_API_KEY?.trim()&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.BREVO_SENDER_EMAIL?.trim()||'')),provider:'Brevo'});
const escape=(value:unknown)=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
const money=(value:unknown)=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP'}).format(Number(value)||0);
export function receiptMessage(job:EmailJob){
 const p=job.payload;const subscription=job.kind==='subscription_receipt',update=job.kind==='order_update',paid=p.payment_status==='paid';
 const subject=subscription?'Your StreamFlix subscription is active':update?`StreamFlix order #${p.order_id}: ${String(p.order_status)}`:paid?'Your StreamFlix payment and order are confirmed':`Your StreamFlix order #${p.order_id} is received`;
 const lines=subscription?[`Plan: ${p.plan_name}`,`Access: ${p.start_date} to ${p.end_date}`,`Paid: ${money(p.amount)}`,`Reference: ${p.session_id}`]:Array.isArray(p.items)?(p.items as Array<Record<string,unknown>>).map(item=>`${item.name} × ${item.quantity} — ${money(Number(item.price)*Number(item.quantity))}`).concat([`Total paid: ${money(p.amount)}`,`Orders: ${Array.isArray(p.order_ids)?p.order_ids.join(', '):''}`,`Delivery: ${(p.delivery as Record<string,unknown>)?.delivery_method||''}`,`Reference: ${p.session_id}`]):[`Order: #${p.order_id}`,`${p.product_name} × ${p.quantity}`,`Total: ${money(p.amount)}`,`Payment: ${p.payment_status} (${p.payment_method})`,`Order status: ${p.order_status}`,`Delivery: ${p.delivery_method}`];
 const message=subscription?'Your membership is ready. Your access dates and payment reference are below.':paid?'Payment confirmed. You can track fulfillment in your StreamFlix account.':'Your order is saved. Payment is due on delivery or collection; this is not a paid receipt.';
 const textContent=[`Hello ${job.recipient_name||'there'},`,subject,message,...lines,'Thank you for choosing StreamFlix.'].join('\n\n');
 const htmlContent=`<!doctype html><html><body style="margin:0;background:#100d15;font-family:Arial,sans-serif;color:#f5f0fa"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:32px 16px"><table role="presentation" width="100%" style="max-width:560px;margin:auto;background:#1c1624;border:1px solid #3c2c48;border-radius:16px" cellpadding="28"><tr><td><p style="color:#f5ad75;letter-spacing:2px;font-size:13px">STREAMFLIX</p><h1 style="font-size:26px;line-height:1.3">${escape(subject)}</h1><p>Hello ${escape(job.recipient_name||'there')},</p><p style="color:#bdb0c8;line-height:1.7">${escape(message)}</p><div style="padding:16px;background:#130f1a;border-radius:10px;line-height:1.9">${lines.map(line=>`<div>${escape(line)}</div>`).join('')}</div><p style="font-size:12px;color:#a393b0;margin-top:24px">Keep this confirmation for your records. Thank you for choosing StreamFlix.</p></td></tr></table></td></tr></table></body></html>`;
 return {subject,htmlContent,textContent};
}
export async function sendBrevo(job:EmailJob){
 const message=receiptMessage(job);
 const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':process.env.BREVO_API_KEY!.trim(),'Content-Type':'application/json',accept:'application/json'},body:JSON.stringify({sender:{email:process.env.BREVO_SENDER_EMAIL!.trim(),name:process.env.BREVO_SENDER_NAME?.trim()||'StreamFlix'},...message,headers:{idempotencyKey:job.id},messageVersions:[{to:[{email:job.recipient,name:job.recipient_name||undefined}],...message}],tags:['streamflix',job.kind]}),signal:AbortSignal.timeout(12000)});
 const data=await response.json().catch(()=>({})) as {messageId?:string;messageIds?:string[];code?:string};
 if(response.ok)return {accepted:true,messageId:data.messageId||data.messageIds?.[0]||null};
 if(data.code==='duplicate_parameter')return {accepted:true,messageId:null};
 // Never log provider response bodies (they may contain addresses or credentials).
 return {accepted:false,retry:response.status===429||response.status>=500,ambiguous:response.status>=500,error:`Brevo HTTP ${response.status}`};
}
let running=false;
export async function processEmails(){
 if(running||!emailConfiguration().configured)return;running=true;
 try{
  const {data,error}=await supabase.rpc('claim_streamflix_emails');if(error)throw error;
  await Promise.all((data as EmailJob[]||[]).map(async job=>{
   let values:Record<string,unknown>;
   try{const result=await sendBrevo(job);values=result.accepted?{status:'sent',sent_at:new Date().toISOString(),provider_message_id:result.messageId,last_error:null}:{status:result.retry&&job.attempts<6?'pending':result.ambiguous?'uncertain':'failed',last_error:result.error,available_at:new Date(Date.now()+Math.min(120000,10000*2**job.attempts)).toISOString()};}
   catch{values={status:job.attempts<6?'pending':'uncertain',last_error:'Brevo response interrupted; acceptance could not be confirmed',available_at:new Date(Date.now()+30000).toISOString()};}
   // Ambiguous retries must stay inside provider's 30-minute deduplication window.
   if(values.status==='pending'&&Date.now()-Date.parse(job.first_attempt_at)>25*60*1000)values.status='uncertain';
   const {error:saveError}=await supabase.from('transactional_email_outbox').update({...values,lock_token:null}).eq('id',job.id).eq('lock_token',job.lock_token);
   if(saveError)throw saveError;
  }));
 }catch{console.error('Receipt queue unavailable. Check database setup; payment fulfillment remains independent.');}finally{running=false;}
}
export function startEmailWorker(){if(!emailConfiguration().configured)console.log('Brevo not configured: receipt emails remain queued. Set BREVO_API_KEY and BREVO_SENDER_EMAIL in backend/.env.');void processEmails();const timer=setInterval(()=>void processEmails(),10000);timer.unref();return timer;}
export async function receiptStatus(session:string,userId:number){try{const {data,error}=await supabase.from('transactional_email_outbox').select('status').eq('event_key','checkout:'+session).eq('user_id',userId).maybeSingle();if(error)return {email_sent:false,email_status:'unavailable'};return {email_sent:data?.status==='sent',email_status:data?.status??'not_queued'};}catch{return {email_sent:false,email_status:'unavailable'};}}
