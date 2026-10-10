import http from 'node:http';
import {createReadStream,existsSync,statSync} from 'node:fs';
import path from 'node:path';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2','.mp4':'video/mp4','.webm':'video/webm'};
export function createFrontendServer(folder){const root=path.resolve(folder),publicRoot=path.resolve(root,'../public');return http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
 let file=path.resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 if(!existsSync(file)){const asset=path.resolve(publicRoot,'.'+pathname);if(asset.startsWith(publicRoot+path.sep)&&existsSync(asset)&&statSync(asset).isFile())file=asset;}
 if(!existsSync(file)||statSync(file).isDirectory()){if(path.extname(pathname)){res.writeHead(404);res.end();return;}file=path.join(root,'index.html');}
 if(!existsSync(file)){res.writeHead(503);res.end('Run the rebuild command first.');return;}
 const original=file;const compressed=!req.headers.range&&/\bgzip\b/.test(req.headers['accept-encoding']??'')&&existsSync(file+'.gz');if(compressed)file+='.gz';
 const stats=statSync(file);const etag=`"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;
 const headers={'Content-Type':types[path.extname(original)]??'application/octet-stream','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; connect-src 'self' http://localhost:4000 https://*.supabase.co; img-src 'self' data: blob: http://localhost:4000 https://*.supabase.co; media-src 'self' blob: http://localhost:4000 https://*.supabase.co; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self' data:;",Vary:'Accept-Encoding',ETag:etag,'Cache-Control':original.startsWith(path.join(root,'assets')+path.sep)?'public, max-age=31536000, immutable':'no-cache'};
 if(compressed)headers['Content-Encoding']='gzip';
 if(req.headers['if-none-match']===etag){res.writeHead(304,headers);res.end();return;}
 let start=0,end=stats.size-1,status=200;
 if(req.headers.range){const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${stats.size}`});res.end();return;}if(!match[1])start=Math.max(0,stats.size-Number(match[2]));else{start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>end||start>=stats.size){res.writeHead(416,{'Content-Range':`bytes */${stats.size}`});res.end();return;}status=206;headers['Content-Range']=`bytes ${start}-${end}/${stats.size}`;}
 headers['Content-Length']=Math.max(0,end-start+1);headers['Accept-Ranges']='bytes';res.writeHead(status,headers);if(req.method==='HEAD'||stats.size===0){res.end();return;}
 const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
 });}
