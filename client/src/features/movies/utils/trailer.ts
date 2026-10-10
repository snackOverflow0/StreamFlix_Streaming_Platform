export function trailerSource(url?:string|null):string|null {
 if(!url)return null;
 try { const parsed=new URL(url,window.location.origin);return ['https:','http:'].includes(parsed.protocol)?parsed.href:null; } catch{return null;}
}
export const PREVIEW_EVENT='streamflix:preview-active';
export const PLAYER_EVENT='streamflix:player-open';
