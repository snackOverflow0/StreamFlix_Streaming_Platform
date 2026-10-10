import assert from 'node:assert/strict';
process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SECRET_KEY='test-secret';process.env.FRONTEND_URL='http://localhost:5173,http://localhost:5174';delete process.env.STRIPE_SECRET_KEY;
const {default:app}=await import('../dist/app.js');const {supabase}=await import('../dist/config/supabase.js');
const user={user_id:7,email:'viewer@example.com',full_name:'Viewer',account_status:'active',deleted_at:null};
let queried=[],updates=[],rpc=[],subscriptionActive=false,wrongEpisode=false;
const products=[{product_id:1,product_name:"Database Hoodie",category:"Apparel",price:1299,listing_status:"active",stock_quantity:25,image_url:null,description:"From Supabase",variants:[]}];
supabase.auth.getUser=async()=>({data:{user:{id:'verified-id',email:user.email}},error:null});
supabase.rpc=async(name,args)=>{rpc.push({name,args});return {data:name==='save_streamflix_profile_progress'?{history_id:9,user_id:7,profile_id:args.p_profile,content_id:args.p_content,episode_id:args.p_episode,progress_percentage:args.p_progress,watch_date:new Date().toISOString()}:null,error:null};};
supabase.from=(table)=>{let filters=[],column='',method='get';const chain={
 select(c){column=c;queried.push({table,column:c});return this;},eq(k,v){filters.push([k,v]);return this;},is(){return this;},neq(){return this;},gte(){return this;},gt(){return this;},order(){return this;},limit(){return this;},range(){return this;},returns(){return this;},update(v){method='update';updates.push({table,v,filters});return this;},
 maybeSingle(){const promise=Promise.resolve({data:table==='profiles'?{profile_id:filters.find(([k])=>k==='profile_id')?.[1]??1,user_id:filters.find(([k])=>k==='profile_id')?.[1]===2?999:7}:table==='users'?user:table==='plans'?{plan_id:1,plan_name:'Standard',monthly_price:299,is_active:true}:table==='season'?{content_id:wrongEpisode?999:1}:table==='content'?{content_id:1,genre_id:1,license_id:1,title:'Test',type:'series',is_active:true,trailer_url:'https://media.example.com/title.mp4'}:table==='episodes'?{season_id:1,trailer_url:null}:table==='notifications'?{notification_id:4,user_id:7,is_read:true}:null,error:null});promise.returns=()=>promise;return promise;},
 then(resolve,reject){return Promise.resolve({data:table==='merchandise_product'?products:table==='subscriptions'?(subscriptionActive?[{status:'active',start_date:'2020-01-01',end_date:'2099-01-01'}]:[]):table==='content_license'?[{license_id:1,expiration_date:'2099-01-01'}]:[],count:1,error:null}).then(resolve,reject);}
};return chain;};
const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}/api`;
const call=(path,method='GET',body,auth=true)=>fetch(base+path,{method,headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer test'}:{}),Origin:'http://localhost:5173'},...(body?{body:JSON.stringify(body)}:{})});
try{
 let result=await call('/health','GET',undefined,false);assert.equal(result.status,200);assert.equal(result.headers.get('access-control-allow-origin'),'http://localhost:5173');
 assert.equal((await call('/content','GET',undefined,false)).status,200);
 result=await call('/visitors/visit','POST',{visitor_key:'123e4567-e89b-42d3-a456-426614174000'},false);assert.equal(result.status,200);assert.equal(rpc.at(-1).name,'record_streamflix_visit');
 assert.equal((await call('/visitors/visit','POST',{visitor_key:'invalid'},false)).status,400);
 assert.equal((await call('/notifications/read-all','PATCH',{},false)).status,401);
 assert.equal((await call('/notifications/4/read?profile_id=1','PATCH',{})).status,200);assert.ok(updates.at(-1).filters.some(([k,v])=>k==='user_id'&&v===7));assert.ok(updates.at(-1).filters.some(([k,v])=>k==='profile_id'&&v===1));
 assert.equal((await call('/recommendations?profile_id=1')).status,200);
 assert.equal((await call('/payments/subscription-checkout','POST',{user_id:999,plan_id:1})).status,403);
 assert.equal((await call('/payments/subscription-checkout','POST',{user_id:7,plan_id:1})).status,503);
 assert.equal((await call('/subscriptions/user/7','POST',{plan_id:1})).status,403);
 assert.equal((await call('/content/1/playback','POST',{},false)).status,401);
 assert.equal((await call('/content/1/playback','POST',{})).status,403);
 subscriptionActive=true;
 result=await call('/content/1/playback','POST',{});assert.equal(result.status,200);assert.equal((await result.json()).url,'https://media.example.com/title.mp4');
 result=await call('/content/1/playback','POST',{episode_id:1});assert.equal(result.status,200);assert.equal((await result.json()).url,'https://media.example.com/title.mp4');
 wrongEpisode=true;assert.equal((await call('/view-history/progress','POST',{profile_id:1,content_id:1,episode_id:1,progress_percentage:50})).status,400);wrongEpisode=false;
 result=await call('/view-history/progress','POST',{profile_id:1,content_id:1,episode_id:1,progress_percentage:47});assert.equal(result.status,200);assert.equal((await result.json()).history_id,9);assert.equal(rpc.at(-1).name,'save_streamflix_profile_progress');
 assert.equal((await call('/profiles/user/7','POST',{profile_name:'Viewer',avatar_url:'javascript:alert(1)'})).status,400);
 assert.equal((await call('/view-history/progress','POST',{profile_id:2,content_id:1,progress_percentage:40})).status,403);
 assert.equal((await call('/view-history/progress','POST',{content_id:1,progress_percentage:40})).status,400);
 assert.equal((await call('/recommendations?profile_id=2')).status,403);
 assert.equal(rpc.find(x=>x.name==='save_streamflix_profile_progress').args.p_profile,1);
 const {resolveTrailerUrl}=await import('../dist/utils/trailer-url.js');
 let signed;supabase.storage.from=bucket=>({createSignedUrl:async(path,seconds)=>{signed={bucket,path,seconds};return {data:{signedUrl:'https://example.supabase.co/fresh-trailer.mp4'},error:null};}});
 assert.equal(await resolveTrailerUrl('https://example.supabase.co/storage/v1/object/sign/Trailers/title.mp4?token=expired'),'https://example.supabase.co/fresh-trailer.mp4');assert.deepEqual(signed,{bucket:'Trailers',path:'title.mp4',seconds:3600});
 await call('/episodes/season/1');
 result=await call('/merchandise/products','GET',undefined,false);let merch=await result.json();assert.equal(merch[0].stock_quantity,25);assert.equal(merch[0].stock,25);assert.equal(merch[0].stock_label,null);
 products[0].stock_quantity=3;merch=await (await call('/merchandise/products','GET',undefined,false)).json();assert.equal(merch[0].stock_quantity,3);assert.equal(merch[0].stock_label,'Low stock');
 products[0].listing_status='sold_out';merch=await (await call('/merchandise/products','GET',undefined,false)).json();assert.equal(merch[0].stock_label,'Sold out');

 assert.ok(queried.some(x=>x.table==='episodes'&&x.column.includes('video_url:trailer_url')));
 assert.ok(queried.some(x=>x.table==='merchandise_product'&&x.column.includes('stock_quantity')));
 assert.ok(queried.filter(x=>x.table==='content').every(x=>!x.column.includes('video_url')));
 console.log('Integration checks passed: public routes, CORS, visitors, notification ownership, recommendations, checkout ownership, missing Stripe configuration, subscription activation restriction, schema projections, trailer access, episode fallback, signed URL refresh.');
}finally{server.close();}
