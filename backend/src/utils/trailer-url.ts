import {cached,cacheHit} from './cache.js';
import {supabase} from '../config/supabase.js';
import {env} from '../config/env.js';
export const mediaBuckets = new Set(['Trailers','images','products','streamflix-media','streamflix-videos']);
export function isStorageReference(value:string){if(!value.startsWith('storage://'))return false;const parts=value.slice(10).split('/'),bucket=parts.shift();return Boolean(bucket&&mediaBuckets.has(bucket)&&parts.length&&parts.every(part=>part&&part!=='.'&&part!=='..')&&!/[\u0000-\u001f]/.test(value));}
export function stableMediaReference(value:string){
 if(isStorageReference(value))return value;
 try{const url=new URL(value);if(url.origin!==new URL(env.supabaseUrl).origin)return value;const match=url.pathname.match(/^\/storage\/v1\/object\/(?:sign|authenticated|public)\/([^/]+)\/(.+)$/);if(!match)return value;const reference=`storage://${decodeURIComponent(match[1]!)}/${decodeURIComponent(match[2]!)}`;return isStorageReference(reference)?reference:value;}catch{return value;}
}
export async function resolveTrailerUrl(value:string|null|undefined):Promise<string|null>{
 if(!value)return null;
 if(value.startsWith("/trailers/"))return value;
 let bucket:string|undefined,path:string|undefined;
 if(value.startsWith('storage://')){if(!isStorageReference(value))return null;const parts=value.slice(10).split('/');bucket=parts.shift();path=parts.join('/');}
 else {try{const url=new URL(value);if(url.origin===new URL(env.supabaseUrl).origin){const match=url.pathname.match(/^\/storage\/v1\/object\/(?:sign|authenticated|public)\/([^/]+)\/(.+)$/);if(match){bucket=decodeURIComponent(match[1]!);path=decodeURIComponent(match[2]!);}}}catch{return null;}}
 if(bucket&&path){const targetBucket=bucket,targetPath=path;return cached('signed:'+targetBucket+'/'+targetPath,3000000,async()=>{const {data,error}=await supabase.storage.from(targetBucket).createSignedUrl(targetPath,3600);if(error)throw error;return data?.signedUrl??null;});}
 if(/^\/(streamflix|admin-design)\//.test(value))return value;
 if(/^https?:\/\//i.test(value)||value.startsWith('/trailers/'))return value;
 return null;
}

// Batch cold catalog signing by bucket instead of one Storage request per image.
export async function warmMediaUrls(values:(string|null|undefined)[]){
 const groups=new Map<string,Set<string>>();
 for(const value of values){if(!value)continue;let bucket:string|undefined,path:string|undefined;
  if(isStorageReference(value)){const parts=value.slice(10).split('/');bucket=parts.shift();path=parts.join('/');}
  else{try{const url=new URL(value);if(url.origin===new URL(env.supabaseUrl).origin){const match=url.pathname.match(/^\/storage\/v1\/object\/(?:sign|authenticated|public)\/([^/]+)\/(.+)$/);if(match){bucket=decodeURIComponent(match[1]!);path=decodeURIComponent(match[2]!);}}}catch{}}
  if(bucket&&path&&!cacheHit('signed:'+bucket+'/'+path)){if(!groups.has(bucket))groups.set(bucket,new Set());groups.get(bucket)!.add(path);}
 }
 const writes:Promise<unknown>[]=[];
 for(const [bucket,paths] of groups){let group:Promise<Map<string,string>>|undefined;const load=()=>group??=(async()=>{const {data,error}=await supabase.storage.from(bucket).createSignedUrls([...paths],3600);if(error)throw error;return new Map((data??[]).filter(row=>!row.error&&row.path&&row.signedUrl).map(row=>[row.path!,row.signedUrl!]));})();
  for(const path of paths)writes.push(cached('signed:'+bucket+'/'+path,3000000,async()=>{const url=(await load()).get(path);if(!url)throw new Error('Storage file unavailable');return url;}));
 }
 await Promise.allSettled(writes);
}
