import {supabase} from '@/lib/supabase';
import {API_URL} from './api-client';
export function subscribeChanges(onChange:(topic:string)=>void){
 let stopped=false;let controller:AbortController|null=null;let timer:number|undefined;let retries=0;
 async function connect(){
  if(stopped||document.hidden)return;
  controller=new AbortController();
  try{
   const {data}=await supabase.auth.getSession();if(!data.session)return;
   const response=await fetch(`${API_URL}/events`,{headers:{Authorization:`Bearer ${data.session.access_token}`},signal:controller.signal,credentials:'omit'});
   if(!response.ok||!response.body)throw new Error('Change stream unavailable');
   retries=0;const reader=response.body.getReader(),decoder=new TextDecoder();let pending='';
   while(!stopped){const chunk=await reader.read();if(chunk.done)break;pending+=decoder.decode(chunk.value,{stream:true});let split;
    while((split=pending.indexOf('\n\n'))>=0){const frame=pending.slice(0,split);pending=pending.slice(split+2);const line=frame.split('\n').find(row=>row.startsWith('data: '));if(!line)continue;try{const payload=JSON.parse(line.slice(6));if(typeof payload.topic==='string'){onChange(payload.topic);window.dispatchEvent(new CustomEvent('streamflix-data-change',{detail:payload.topic}));}}catch{/* Ignore malformed frames, reconnect remains available. */}}
   }
  }catch{/* Normal reconnection and background polling cover interruptions. */}
  finally{controller=null;if(!stopped&&!document.hidden)timer=window.setTimeout(()=>void connect(),Math.min(30000,1000*2**Math.min(retries++,5)));}
 }
 function visibility(){if(document.hidden){window.clearTimeout(timer);controller?.abort();}else if(!controller){window.clearTimeout(timer);void connect();}}
 document.addEventListener('visibilitychange',visibility);void connect();
 return()=>{stopped=true;window.clearTimeout(timer);controller?.abort();document.removeEventListener('visibilitychange',visibility);};
}
