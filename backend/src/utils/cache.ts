type Entry={expires:number;value:Promise<unknown>};
const entries=new Map<string,Entry>();
export function cached<T>(key:string,ttl:number,load:()=>Promise<T>):Promise<T>{
 const existing=entries.get(key);if(existing&&existing.expires>Date.now())return existing.value as Promise<T>;
 const entry:Entry={expires:Date.now()+ttl,value:Promise.resolve().then(load)};
 entries.set(key,entry);
 entry.value.catch(()=>{if(entries.get(key)===entry)entries.delete(key);});
 if(entries.size>500){for(const [id,item] of entries)if(item.expires<=Date.now())entries.delete(id);while(entries.size>500){const oldest=entries.keys().next().value;if(oldest)entries.delete(oldest);else break;}}
 return entry.value as Promise<T>;
}
export function invalidateCatalog(){for(const key of entries.keys())if(!key.startsWith('signed:'))entries.delete(key);}

export function cacheHit<T>(key:string):Promise<T>|undefined{const entry=entries.get(key);return entry&&entry.expires>Date.now()?entry.value as Promise<T>:undefined;}
