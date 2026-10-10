import type {ManagementData} from './ManagementWorkspace';
export function managementPreview(base:ManagementData):ManagementData {
 const series=base.content?.find(r=>String(r.type).toLowerCase()==='series');const title=base.content?.[0];const user=base.users?.[0];const uid=user?.user_id??1,cid=title?.content_id??1;
 return {
 viewStats:(base.content||[]).map((c,i)=>({content_id:c.content_id,views:Math.max(12,248-i*31),unique_viewers:Math.max(8,186-i*23)})),
 seasons:series?[{season_id:1,content_id:series.content_id,season_number:1,season_title:'Season One',release_date:'2026-01-10'}]:[],
 episodes:series?[{episode_id:1,season_id:1,episode_number:1,episode_title:'The Beginning',duration:48,release_date:'2026-01-10'}]:[],
 plans:[{plan_id:1,plan_name:'Standard',max_members:1,monthly_price:299,is_active:true},{plan_id:2,plan_name:'Premium',max_members:4,monthly_price:499,is_active:true}],
 products:[{product_id:1,product_name:'StreamFlix T-shirt',category:'Apparel',price:399,stock:24,description:'Official StreamFlix cotton T-shirt.',variants:['Small','Medium','Large'],image_url:'/streamflix/merch/stranger-things-tumbler.webp',listing_status:'active'}],
 orders:[{transaction_id:1,user_id:uid,product_id:1,quantity:1,total_amount:399,created_at:new Date().toISOString()}],
 feedback:[{feedback_id:1,user_id:uid,subject:'Subtitle availability',message:'Could you add Filipino subtitles for more titles?',type:'suggestion',status:'pending',created_date:new Date().toISOString()}],
 reviews:[{rev_id:1,user_id:uid,content_id:cid,rating_value:4.5,review_comment:'Great movie and clear picture quality.',review_date:new Date().toISOString()}],
 profiles:[{profile_id:1,user_id:uid,profile_name:'Main Profile',avatar_url:null,device:'Web',created_at:new Date().toISOString()}],
 members:[],archived:[],
 };
}
