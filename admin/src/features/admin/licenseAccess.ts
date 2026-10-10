import {manilaDate} from './subscriptionAccess';
export function licenseStatus(expiration: unknown, today = manilaDate()) {
 const end = String(expiration || '').slice(0,10);
 if (!/^\d{4}-\d{2}-\d{2}$/.test(end)) return 'Missing license';
 if (end < today) return 'License expired';
 return 'Active';
}
export function catalogPage(total:number, offset:number, size=10) {
 const pages=Math.max(1,Math.ceil(total/size));
 const start=Math.min(Math.max(0,offset), (pages-1)*size);
 return {pages,offset:start,page:Math.floor(start/size)+1,first:total?start+1:0,last:Math.min(start+size,total)};
}
