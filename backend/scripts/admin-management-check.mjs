import assert from 'node:assert/strict';
process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SECRET_KEY='test-secret';
const {default:app}=await import('../dist/app.js');const {supabase}=await import('../dist/config/supabase.js');
const db={admin_roles:[{auth_user_id:'admin',role:'administrator'}],content:[{content_id:1,type:'series',title:'Test Series',genre_id:1,license_id:1,release_date:'2026-01-01',deleted_at:null,is_active:true}],genre:[{genre_id:1,genre_name:'Drama'}],content_license:[{license_id:1,licensor_name:'Test',region:'PH',expiration_date:'2099-12-31'}],users:[{user_id:1,full_name:'Test User',email:'test@example.com',account_status:'active',password_hash:'MUST_NOT_LEAK',deleted_at:null}],admin_media_assets:[],admin_uploads:[],admin_settings:[{id:1,settings:{platformName:'StreamFlix',ratings:true}}],plans:[{plan_id:1,plan_name:'Standard',max_members:1,monthly_price:299,is_active:true}],subscriptions:[],season:[],episodes:[],review:[{rev_id:1,user_id:1,content_id:1,rating_value:4}],feedback:[{feedback_id:1,user_id:1,subject:'Help',message:'Test',status:'pending'}],merchandise_product:[],merchandise_transaction:[],profiles:[],members:[],view_history:[]};
let administrator=true;
supabase.auth.getUser=async()=>({data:{user:{id:'admin',email:'test@example.com'}},error:null});
supabase.from=table=>{let columns='*',filters=[],op='',values,range,singleResult=false;
 const q={select(c='*'){columns=c;return q},eq(k,v){filters.push(r=>String(r[k])===String(v));return q},is(k,v){filters.push(r=>r[k]===v);return q},order(){return q},limit(n){range=[0,n-1];return q},range(a,b){range=[a,b];return q},returns(){return q},update(v){op='update';values=v;return q},insert(v){op='insert';values=v;return q},upsert(v){op='upsert';values=v;return q},delete(){op='delete';return q},maybeSingle(){singleResult=true;return q},single(){singleResult=true;return q},then(a,b){return run(singleResult).then(a,b)}};
 async function run(single){let rows=(table==='admin_roles'&&!administrator?[]:db[table]||[]).filter(r=>filters.every(f=>f(r)));
 if(op==='insert'){const key={season:'season_id',episodes:'episode_id',plans:'plan_id',merchandise_product:'product_id',subscriptions:'subscription_id'}[table];const row={...values,[key]:(db[table]?.length||0)+1};db[table].push(row);rows=[row];}
 if(op==='update'){rows.forEach(r=>Object.assign(r,values));}
 if(op==='upsert'){if(rows[0])Object.assign(rows[0],values);else{db[table].push(values);rows=[values];}}
 if(op==='delete'){if(table==='season'&&db.episodes.some(r=>rows.some(s=>s.season_id===r.season_id)))return {data:null,error:{code:'23503'}};db[table]=db[table].filter(r=>!rows.includes(r));}
 if(range)rows=rows.slice(range[0],range[1]+1);
 const result=rows.map(r=>columns==='*'?{...r}:Object.fromEntries(columns.split(',').map(k=>[k.trim(),r[k.trim()]])));
 return {data:single?result[0]||null:result,error:null};}
 return q;
};
const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}/api/admin`;
async function request(path,method='GET',body){return fetch(base+path,{method,headers:{Authorization:'Bearer test','Content-Type':'application/json'},...(body&&method!=='GET'?{body:JSON.stringify(body)}:{})});}
try{
 assert.equal((await fetch(base+'/management')).status,401);administrator=false;for(const [p,m] of [['/management','GET'],['/seasons','POST'],['/feedback/1','PATCH'],['/reviews/1','DELETE'],['/content/1/restore','PATCH']])assert.equal((await request(p,m,{})).status,403);administrator=true;
 const bootstrap=await request('/bootstrap');assert.equal(bootstrap.status,200);assert.equal(JSON.stringify(await bootstrap.json()).includes('MUST_NOT_LEAK'),false);
 assert.equal((await request('/management')).status,200);
 assert.equal((await request('/seasons','POST',{content_id:1,season_number:1,release_date:'2026-02-30'})).status,400);
 assert.equal((await request('/seasons','POST',{content_id:1,season_number:1,release_date:'2026-02-20'})).status,201);
 db.content[0].type='movie';assert.equal((await request('/seasons','POST',{content_id:1,season_number:2,release_date:'2026-02-20'})).status,400);db.content[0].type='series';
 assert.equal((await request('/episodes','POST',{season_id:1,episode_number:1,episode_title:'Pilot',duration:-5,release_date:'2026-02-20'})).status,400);
 assert.equal((await request('/episodes','POST',{season_id:1,episode_number:1,episode_title:'Pilot',duration:45,release_date:'2026-02-20'})).status,201);
 assert.equal((await request('/seasons/1','DELETE')).status,409);
 assert.equal((await request('/plans','POST',{plan_name:'Bad',max_members:0,monthly_price:100,is_active:true})).status,400);
 assert.equal((await request('/products','POST',{product_name:'Shirt',category:'Apparel',price:-1,listing_status:'active'})).status,400);
 assert.equal((await request('/products','POST',{product_name:'Shirt',category:'Apparel',price:100,listing_status:'active',stock:12,description:'Cotton',variants:['S','M']})).status,201);
 assert.equal(db.merchandise_product[0].stock,12);assert.deepEqual(db.merchandise_product[0].variants,['S','M']);
 assert.equal((await request('/products/1','PATCH',{stock:-1})).status,400);
 assert.equal((await request('/products/1','PATCH',{variants:'S,M'})).status,400);
 assert.equal((await request('/products/1','PATCH',{stock:0,description:'Updated',variants:[]})).status,200);
 assert.equal((await request('/products/1','DELETE')).status,200);assert.equal(db.merchandise_product.length,1);assert.equal(db.merchandise_product[0].listing_status,'removed');
 assert.equal((await request('/episodes/1','PATCH',{video_url:'javascript:alert(1)'})).status,400);
 assert.equal((await request('/episodes/1','PATCH',{video_url:'https://example.supabase.co/video.mp4'})).status,200);
 assert.equal((await request('/uploads/sign','POST',{name:'bad.svg',mimeType:'image/svg+xml',size:10})).status,400);
 assert.equal((await request('/uploads/sign','POST',{name:'large.mp4',mimeType:'video/mp4',size:536870913})).status,400);
 administrator=false;assert.equal((await request('/uploads/sign','POST',{name:'test.mp4',mimeType:'video/mp4',size:100})).status,403);administrator=true;
 supabase.storage.from=()=>({createSignedUploadUrl:async path=>({data:{path,token:'signed-token'},error:null}),list:async()=>({data:db.admin_uploads.map(u=>({name:u.path.split('/')[1],metadata:{size:u.size,mimetype:u.mime_type}})),error:null}),createSignedUrl:async path=>({data:{signedUrl:'https://example.supabase.co/signed/'+path},error:null}),getPublicUrl:path=>({data:{publicUrl:'https://example.supabase.co/storage/v1/object/public/streamflix-media/'+path}})});
 const signed=await request('/uploads/sign','POST',{name:'movie.mp4',mimeType:'video/mp4',size:100});assert.equal(signed.status,200);const ticket=await signed.json();assert.equal(ticket.token,'signed-token');assert.equal(ticket.bucket,'streamflix-media');
 assert.equal((await request('/uploads/'+ticket.uploadId+'/complete','POST')).status,200);assert.equal(db.admin_media_assets[0].kind,'Video');assert.equal(db.admin_uploads[0].completed_at!==undefined,true);
 assert.equal((await request('/uploads/'+ticket.uploadId+'/complete','POST')).status,200);assert.equal(db.admin_media_assets.length,1);
 assert.equal((await request('/uploads/00000000-0000-0000-0000-000000000000/complete','POST')).status,404);
 console.log('V2 checks passed: direct upload authorization/completion/retries, media attachment validation, merchandise fields and soft deletion, no admin history payload.');


 assert.equal((await request('/feedback/1','PATCH',{status:'resolved'})).status,200);assert.equal(db.feedback[0].status,'resolved');
 assert.equal((await request('/feedback/1','PATCH',{message:'Overwrite user message'})).status,400);
 assert.equal((await request('/orders/1','PATCH',{total_amount:0})).status,400);
 assert.equal((await request('/reviews/1','PATCH',{rating_value:5})).status,400);assert.equal((await request('/reviews/1','DELETE')).status,200);
 assert.equal((await request('/subscriptions','POST',{subscription_user_id:1,plan_id:1,start_date:'2020-01-01',end_date:'2099-12-31',status:'active'})).status,201);
 assert.equal((await request('/subscriptions','POST',{subscription_user_id:1,plan_id:1,start_date:'2020-01-01',end_date:'2020-01-02',status:'active'})).status,400);
 assert.equal((await request('/licenses','POST',{licensor_name:'New',expiration_date:'2099-01-01'})).status,400);
 assert.equal((await request('/users/1','PATCH',{account_status:'invalid'})).status,400);
 const updated=await request('/users/1','PATCH',{account_status:'suspended'});assert.equal(updated.status,200);assert.equal(JSON.stringify(await updated.json()).includes('MUST_NOT_LEAK'),false);
 assert.equal((await request('/settings','PATCH',{tagline:'Saved'})).status,200);assert.equal(db.admin_settings[0].settings.ratings,true);
 administrator=false;assert.equal((await request('/content/1/visibility','PATCH',{is_active:false})).status,403);administrator=true;
 assert.equal((await request('/content/1/visibility','PATCH',{is_active:'false'})).status,400);
 assert.equal((await request('/content/1/visibility','PATCH',{is_active:false,title:'overwrite'})).status,400);
 assert.equal((await request('/content/999/visibility','PATCH',{is_active:false})).status,404);
 assert.equal((await request('/content/1/visibility','PATCH',{is_active:false})).status,200);assert.equal(db.content[0].is_active,false);assert.equal(db.content[0].deleted_at,null);
 const {listCatalog,listContent,searchContent,getContentById}=await import('../dist/modules/content/content.service.js');
 assert.equal((await listCatalog()).length,0);assert.equal((await listContent({})).length,0);assert.equal((await searchContent({})).length,0);await assert.rejects(()=>getContentById(1),/Content not found/);
 assert.equal((await(await request('/bootstrap')).json()).content.length,1);
 assert.equal((await request('/content/1','DELETE')).status,400);
 assert.equal((await request('/content/1/visibility','PATCH',{is_active:true})).status,200);assert.equal((await listCatalog()).length,1);assert.equal((await getContentById(1)).content_id,1);
 console.log('Visibility checks passed: admin-only boolean switch, content retained, inactive hidden from catalog/search/detail, admin retains access, reactivation works.');

 db.view_history=Array.from({length:501},(_,i)=>({history_id:i+1,user_id:1,content_id:1}));const all=await(await request('/management')).json();assert.equal('history' in all,false);db.profiles=Array.from({length:501},(_,i)=>({profile_id:i+1,user_id:1,profile_name:'Profile'}));assert.equal((await(await request('/management')).json()).profiles.length,501);
 db.users[0].account_status='active';
 const api=base.replace(/\/admin$/,'');const userRequest=(path,body)=>fetch(api+path,{method:'PATCH',headers:{Authorization:'Bearer test','Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await userRequest('/subscriptions/1',{status:'active'})).status,403);
 assert.equal((await userRequest('/subscriptions/1',{end_date:'2099-12-31'})).status,403);
 assert.equal((await userRequest('/subscriptions/1',{status:'cancelled'})).status,200);
 assert.equal((await userRequest('/users/1',{account_status:'active'})).status,403);

 db.subscriptions[0].status='active';db.subscriptions[0].end_date='2099-12-31';db.content[0].video_url='storage://streamflix-videos/admin/private.mp4';
 const play=(body={})=>fetch(api+'/content/1/playback',{method:'POST',headers:{Authorization:'Bearer test','Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await fetch(api+'/content/1/playback',{method:'POST'})).status,401);
 assert.equal((await play()).status,200);const result=await(await play()).json();assert.equal(result.url,'https://example.supabase.co/signed/admin/private.mp4');
 db.subscriptions[0].status='cancelled';assert.equal((await play()).status,403);db.subscriptions[0].status='active';
 db.subscriptions[0].end_date='2000-01-01';assert.equal((await play()).status,403);db.subscriptions[0].end_date='2099-12-31';
 db.users[0].account_status='suspended';assert.equal((await play()).status,403);db.users[0].account_status='active';
 db.content[0].is_active=false;assert.equal((await play()).status,404);db.content[0].is_active=true;
 console.log('Playback checks passed: auth, active subscription dates, account suspension, content visibility and private signed playback.');
 console.log('User controls passed: cancellation allowed; self-reactivation, expiry changes and account reactivation rejected.');
 console.log('Management checks passed: admin permissions, safe user fields, CRUD, parent validation, dates/prices/statuses, feedback moderation, read-only records, subscription assignment, settings merge, archive/restore, and pagination beyond 500 rows.');
}finally{server.close();}
