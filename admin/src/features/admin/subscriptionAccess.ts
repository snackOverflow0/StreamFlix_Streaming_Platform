import type {ManagedRow} from './ManagementWorkspace';
export function manilaDate(now=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const value=(key:string)=>parts.find(p=>p.type===key)?.value;return `${value('year')}-${value('month')}-${value('day')}`;}
export function subscriptionAccess(sub:ManagedRow|undefined,today=manilaDate()){
 if(!sub)return 'No subscription';
 if(sub.end_date&&String(sub.end_date)<today)return 'Expired';
 if(sub.status!=='active')return 'Inactive';
 if(sub.start_date&&String(sub.start_date)>today)return 'Upcoming';
 return 'Active';
}
