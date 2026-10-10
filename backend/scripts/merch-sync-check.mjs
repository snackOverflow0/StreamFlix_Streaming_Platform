import assert from 'node:assert/strict';
process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_SECRET_KEY='test-secret';
const {default:app}=await import('../dist/app.js');const {supabase}=await import('../dist/config/supabase.js');
let product={product_id:1,product_name:'Database Hoodie',category:'Apparel',price:1299,listing_status:'active',stock_quantity:25,image_url:null,description:'',variants:[]};
supabase.auth.getUser=async()=>({data:{user:{id:'verified-admin',email:'admin@example.com'}},error:null});
supabase.from=table=>{let values=null;const chain={select(){return this},eq(){return this},neq(){return this},order(){return this},update(v){values=v;return this},maybeSingle:async()=>{if(table==='admin_roles')return {data:{role:'administrator'},error:null};if(table==='merchandise_product'){if(values)product={...product,...values};return {data:product,error:null}}return {data:null,error:null}},then(resolve,reject){return Promise.resolve({data:table==='merchandise_product'?[product]:[],error:null}).then(resolve,reject)}};return chain};
const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}/api`;const controller=new AbortController();let reader;
try{
 const events=await fetch(base+'/events',{headers:{Authorization:'Bearer test'},signal:controller.signal});assert.equal(events.status,200);reader=events.body.getReader();await reader.read();
 const result=await fetch(base+'/admin/products/1',{method:'PATCH',headers:{Authorization:'Bearer test','Content-Type':'application/json'},body:JSON.stringify({stock:8,price:1399})});assert.equal(result.status,200);assert.equal((await result.json()).stock_quantity,8);
 const event=await Promise.race([reader.read(),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new Error('No catalog change notification')),2000);timer.unref()})]);assert.match(new TextDecoder().decode(event.value),/"topic":"catalog"/);
 const products=await (await fetch(base+'/merchandise/products')).json();assert.equal(products[0].stock_quantity,8);assert.equal(products[0].stock,8);assert.equal(products[0].price,1399);
 console.log('Passed: admin stock/price update persists through the database adapter, emits a catalog notification, and public merchandise reads the updated values');
}finally{controller.abort();await reader?.cancel().catch(()=>{});server.closeAllConnections();server.close();}
