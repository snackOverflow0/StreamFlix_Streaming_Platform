import assert from 'node:assert/strict';
process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SECRET_KEY='test-secret';
const {default:app}=await import('../dist/app.js');const {supabase}=await import('../dist/config/supabase.js');
let admin=true,updates;const existing={subscription_id:1,subscription_user_id:1,plan_id:1,start_date:'2026-01-01',end_date:'2026-02-01',status:'active'};
supabase.auth.getUser=async()=>({data:{user:{id:'test-admin'}},error:null});
supabase.from=table=>({select(){return this},eq(){return this},update(v){updates=v;return this},maybeSingle:async()=>({data:table==='admin_roles'?{role:admin?'administrator':'viewer'}:table==='plans'?{is_active:true}:existing,error:null}),single:async()=>({data:{...existing,...updates},error:null})});
const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const url=`http://127.0.0.1:${server.address().port}/api/admin/subscriptions/1`;
const patch=(body,auth=true)=>fetch(url,{method:'PATCH',headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer test'}:{})},body:JSON.stringify(body)});
try{assert.equal((await patch({status:'cancelled'},false)).status,401);admin=false;assert.equal((await patch({status:'cancelled'})).status,403);admin=true;for(const body of [{status:'active'},{status:'banana'},{end_date:'2026-02-30'},{end_date:'2025-12-01'}])assert.equal((await patch(body)).status,400);assert.equal((await patch({status:'cancelled'})).status,200);assert.equal(updates.status,'cancelled');assert.equal((await patch({status:'active',end_date:'2099-01-01'})).status,200);assert.equal(updates.end_date,'2099-01-01');console.log('Subscription checks passed: auth/admin, expiry and date validation, off, renewal.')}finally{server.close()}
