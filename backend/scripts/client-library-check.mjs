import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SECRET_KEY='test-secret';process.env.FRONTEND_URL='http://localhost:5173,http://127.0.0.1:5188';
export async function startFixture(){
 const {default:app}=await import('../dist/app.js');const {supabase}=await import('../dist/config/supabase.js');
 const user={auth_user_id:'verified',user_id:7,email:'viewer@example.com',full_name:'Viewer',account_status:'active',deleted_at:null};
 const state={favorites:[],watch_list:[],notifications:[{notification_id:11,user_id:7,profile_id:1,is_read:false},{notification_id:12,user_id:7,profile_id:3,is_read:false}],history:[{history_id:1,user_id:7,profile_id:1,content_id:1,progress_percentage:30,watch_date:'2026-10-09T02:00:00Z'},{history_id:2,user_id:7,profile_id:1,content_id:4,progress_percentage:20,watch_date:'2026-10-09T03:00:00Z'}]};let nextId=100;
 const content=[1,2,3,4,5,6].map(id=>({content_id:id,title:`Title ${id}`,genre_id:id<=3?1:2,license_id:1,is_active:true,deleted_at:null,type:id%2?'movie':'series',release_date:'2025-01-01',cast:'',description:'',synopsis:'',director:'',trailer_url:null,poster_url:null,preview_url:null,hero_url:null}));
 supabase.auth.getUser=async()=>({data:{user:{id:'verified',email:user.email}},error:null});supabase.rpc=async()=>({data:[],error:null});
 supabase.from=table=>{let filters=[],method='get',input,sortKey,ascending=true;const rows=()=>table==='users'?[user]:table==='profiles'?[{profile_id:1,user_id:7},{profile_id:2,user_id:999},{profile_id:3,user_id:7}]:table==='content'?content:table==='genre'?[{genre_id:1,genre_name:'Action'},{genre_id:2,genre_name:'Fantasy'}]:table==='content_license'?[{license_id:1,expiration_date:'2099-12-31'}]:table==='view_history'?state.history:state[table]??[];
 const run=()=>{let data=rows().filter(row=>filters.every(([k,v,op])=>op==='gt'?Number(row[k])>Number(v):op==='is'?row[k]==v:row[k]===v));if(method==='insert'){const existing=rows().find(row=>row.user_id===input.user_id&&row.profile_id===input.profile_id&&row.content_id===input.content_id);if(existing)return {data:null,error:{code:'23505'}};const row={...input,[table==='favorites'?'fav_id':'list_id']:++nextId,date_added:new Date().toISOString()};state[table].push(row);data=[row];}if(method==='update'){for(const row of data)Object.assign(row,input);}if(method==='delete'){state[table]=state[table].filter(row=>!data.includes(row));data=[];}if(sortKey)data=[...data].sort((a,b)=>String(a[sortKey]).localeCompare(String(b[sortKey]))*(ascending?1:-1));return {data,error:null}};
 const single=()=>{const result=run();const promise=Promise.resolve({...result,data:result.data?.[0]??null});promise.returns=()=>promise;return promise;};
 const chain={select(){return this},eq(k,v){filters.push([k,v,'eq']);return this},is(k,v){filters.push([k,v,'is']);return this},gt(k,v){filters.push([k,v,'gt']);return this},order(k,options){sortKey=k;ascending=options?.ascending!==false;return this},range(){return this},limit(){return this},returns(){return this},insert(v){method='insert';input=v;return this},update(v){method='update';input=v;return this},delete(){method='delete';return this},single,maybeSingle:single,then(resolve,reject){return Promise.resolve(run()).then(resolve,reject)}};return chain;};
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));return {server,base:`http://127.0.0.1:${server.address().port}/api`,state};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const {server,base,state}=await startFixture();const call=(path,method='GET',body,auth=true)=>fetch(base+path,{method,headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer test'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 try{
 for(const [route,key,idKey] of [['favorites','favorites','fav_id'],['watch-list','watch_list','list_id']]){
  assert.equal((await call('/'+route,'POST',{content_id:2},false)).status,401);
  let response=await call('/'+route,'POST',{content_id:2,user_id:999,profile_id:1});assert.equal(response.status,201);const saved=await response.json();assert.equal(saved.user_id,7);assert.equal(saved.content_id,2);
  response=await call('/'+route,'POST',{content_id:2,profile_id:1});assert.equal(response.status,201);assert.equal((await response.json())[idKey],saved[idKey]);assert.equal(state[key].length,1);
  response=await call('/'+route+'/me?profile_id=1');assert.equal(response.status,200);assert.equal((await response.json()).length,1);
  assert.equal((await call('/'+route+'/user/999')).status,403);
  assert.equal((await call('/'+route+'/'+saved[idKey]+'?profile_id=1','DELETE')).status,204);assert.equal(state[key].length,0);
  assert.equal((await call('/'+route,'POST',{content_id:2})).status,400);
  assert.equal((await call('/'+route,'POST',{content_id:2,profile_id:2})).status,403);
  const first=await (await call('/'+route,'POST',{content_id:2,profile_id:1})).json();
  const second=await (await call('/'+route,'POST',{content_id:2,profile_id:3})).json();
  assert.notEqual(first[idKey],second[idKey]);assert.equal(state[key].length,2);
  assert.equal((await (await call('/'+route+'/me?profile_id=3')).json()).length,1);
  assert.equal((await call('/'+route+'/'+first[idKey]+'?profile_id=3','DELETE')).status,404);
  assert.equal((await call('/'+route+'/'+first[idKey]+'?profile_id=1','DELETE')).status,204);
  assert.equal(state[key].length,1);assert.equal(state[key][0].profile_id,3);
 
 }
 assert.equal((await call('/notifications/read-all','PATCH')).status,400);
 assert.equal((await call('/notifications/read-all?profile_id=2','PATCH')).status,403);
 assert.equal((await call('/notifications/11/read?profile_id=3','PATCH')).status,404);
 assert.equal((await call('/notifications/read-all?profile_id=1','PATCH')).status,200);
 assert.equal(state.notifications[0].is_read,true);assert.equal(state.notifications[1].is_read,false);
 assert.equal((await call('/notifications/12/read?profile_id=3','PATCH')).status,200);assert.equal(state.notifications[1].is_read,true);
 let response=await call('/recommendations?profile_id=1');assert.equal(response.status,200);let data=await response.json();assert.equal(data.becauseYouWatchedSource.title,'Title 4');assert.deepEqual(data.becauseYouWatched.map(x=>x.content_id).sort(),[5,6]);
 state.history[0].watch_date='2026-10-09T04:00:00Z';data=await (await call('/recommendations?profile_id=1')).json();assert.equal(data.becauseYouWatchedSource.title,'Title 1');assert.deepEqual(data.becauseYouWatched.map(x=>x.content_id).sort(),[2,3]);
 assert.equal((await call('/recommendations?profile_id=2')).status,403);
 console.log('Passed: per-profile save/read/delete, identical titles saved independently, missing/foreign profile rejection, notification read/read-all isolation, actual client Favorites/Watchlist paths, authenticated owner, persistence/readback/remove, repeated-save idempotency, latest rewatched title, matching movie/series genre recommendations and profile ownership.');
 }finally{server.closeAllConnections();server.close();}
}
