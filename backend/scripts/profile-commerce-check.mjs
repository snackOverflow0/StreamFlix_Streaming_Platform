import assert from 'node:assert/strict';
process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SECRET_KEY='test-secret';process.env.STRIPE_SECRET_KEY='test-stripe';process.env.STRIPE_WEBHOOK_SECRET='test-webhook';
const {default:app}=await import('../dist/app.js');const {supabase}=await import('../dist/config/supabase.js');
const user={user_id:7,email:'viewer@example.com',account_status:'active',deleted_at:null};
const profiles=[{profile_id:1,user_id:7,profile_name:'First'},{profile_id:2,user_id:7,profile_name:'Second'},{profile_id:3,user_id:999,profile_name:'Other account'}];
const product={product_id:1,product_name:'Hoodie',price:100,listing_status:'active',stock_quantity:25};
let checkouts=[],orders=[],calls=[],counter=0;
supabase.auth.getUser=async()=>({data:{user:{id:'verified-id',email:user.email}},error:null});
supabase.from=table=>{let filters=[];const chain={select(){return this},is(){return this},eq(k,v){filters.push([k,v]);return this},neq(){return this},order(){return this},returns(){return this},maybeSingle(){const data=table==='users'?user:table==='profiles'?profiles.find(p=>filters.every(([k,v])=>p[k]===v)):table==='integration_checkouts'?checkouts.find(c=>filters.every(([k,v])=>c[k]===v)):null;const promise=Promise.resolve({data,error:null});promise.returns=()=>promise;return promise},then(resolve,reject){return Promise.resolve({data:table==='merchandise_product'?[product]:table==='merchandise_transaction'?orders.filter(o=>filters.every(([k,v])=>o[k]===v)):[],error:null}).then(resolve,reject)}};return chain;};
supabase.rpc=async(name,args)=>{calls.push({name,args});if(name==='reserve_streamflix_checkout'){checkouts.push({session_id:args.p_session,user_id:args.p_user,kind:'merchandise',items:args.p_items,delivery:args.p_delivery,amount:args.p_amount,fulfilled:false,profile_id:Number(args.p_delivery.profile_id),profile_name:profiles.find(p=>p.profile_id===Number(args.p_delivery.profile_id)).profile_name});return {data:null,error:null}}
if(name==='fulfill_streamflix_checkout'){checkouts.find(c=>c.session_id===args.p_session).fulfilled=true;return {data:null,error:null}}
if(name==='streamflix_order'){const profile=profiles.find(p=>p.profile_id===Number(args.p_delivery.profile_id));const row={transaction_id:++counter,user_id:args.p_user,profile_id:profile.profile_id,profile_name:profile.profile_name,product_id:1,quantity:1,total_amount:100};orders.push(row);return {data:[row],error:null}}return {data:null,error:null};};
const originalFetch=globalThis.fetch;globalThis.fetch=async(url,options)=>{if(String(url).startsWith('https://api.stripe.com/')){const params=options?.body;const saved=checkouts[0];return new Response(JSON.stringify(params?{id:'cs_test_profileone',url:'https://checkout.stripe.com/test',expires_at:Math.floor(Date.now()/1000)+1800}:{id:saved.session_id,client_reference_id:'7',metadata:{kind:'merchandise',profile_id:'1'},currency:'php',amount_total:10000,payment_status:'paid',status:'complete',payment_intent:'pi_test'}),{status:200,headers:{'Content-Type':'application/json'}})}return originalFetch(url,options)};
const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}/api`;
const call=(path,body)=>fetch(base+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer test','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
const delivery={items:[{product_id:1,quantity:1}],delivery_name:'Recipient',delivery_phone:'12345',delivery_address:'Address',delivery_method:'Standard Delivery (3-5 days)'};
try{
 assert.equal((await call('/merchandise/orders/cod/user/7',delivery)).status,400);
 assert.equal((await call('/merchandise/orders/cod/user/7',{...delivery,profile_id:3})).status,403);
 for(const id of [1,2]){const response=await call('/merchandise/orders/cod/user/7',{...delivery,profile_id:id});assert.equal(response.status,201);assert.equal((await response.json())[0].profile_id,id)}
 for(const id of [1,2]){const rows=await (await call(`/merchandise/transactions/user/7?profile_id=${id}`)).json();assert.equal(rows.length,1);assert.equal(rows[0].profile_id,id)}
 assert.equal((await call('/merchandise/transactions/user/7')).status,400);
 assert.equal((await call('/merchandise/transactions/user/7?profile_id=3')).status,403);
 assert.equal((await call('/merchandise/orders/card/user/7/checkout',{...delivery,profile_id:3})).status,403);
 assert.equal((await call('/merchandise/orders/card/user/7/checkout',{...delivery,profile_id:1})).status,200);
 const status=await (await call('/merchandise/orders/card/status?user_id=7&session_id=cs_test_profileone')).json();assert.equal(status.profile_id,1);assert.equal(status.profile_name,'First');assert.equal(status.fulfilled,true);
 await call('/merchandise/orders/card/status?user_id=7&session_id=cs_test_profileone');assert.equal(calls.filter(c=>c.name==='fulfill_streamflix_checkout').length,1);
 console.log('Passed: profile required, foreign-account profile rejected, COD attribution, separate profile order histories, card profile reservation, origin-profile payment return, fulfillment idempotency.');
}finally{globalThis.fetch=originalFetch;server.closeAllConnections();server.close();}
