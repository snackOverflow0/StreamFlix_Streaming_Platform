import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import express from '../backend/node_modules/express/index.js';
import {createRateLimiter,requestContext} from '../backend/dist/middleware/operations.js';
import {createFrontendServer} from './frontend-server.mjs';
const app=express();app.use(requestContext);app.use('/api',createRateLimiter(2));app.get('/api/sample',(_,res)=>res.json({ok:true}));app.get('/api/health',(_,res)=>res.json({ok:true}));
const api=app.listen(0,'127.0.0.1');await new Promise(r=>api.once('listening',r));const url=`http://127.0.0.1:${api.address().port}`;
let dir,web;
try{
 let response=await fetch(url+'/api/sample');assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');assert.ok(response.headers.get('x-request-id'));
 await fetch(url+'/api/sample');response=await fetch(url+'/api/sample',{headers:{'X-Forwarded-For':'1.2.3.4'}});assert.equal(response.status,429);assert.ok(response.headers.get('retry-after'));assert.equal((await fetch(url+'/api/health')).status,200);
 dir=mkdtempSync(path.join(tmpdir(),'streamflix-check-'));writeFileSync(path.join(dir,'index.html'),'<html>ok</html>');writeFileSync(path.join(dir,'movie.mp4'),'123456789');
 web=createFrontendServer(dir).listen(0,'127.0.0.1');await new Promise(r=>web.once('listening',r));const base=`http://127.0.0.1:${web.address().port}`;
 response=await fetch(base+'/');assert.ok(response.headers.get('content-security-policy').includes("frame-ancestors 'none'"));const tag=response.headers.get('etag');assert.equal((await fetch(base+'/',{headers:{'If-None-Match':tag}})).status,304);
 response=await fetch(base+'/movie.mp4',{headers:{Range:'bytes=2-4'}});assert.equal(response.status,206);assert.equal(await response.text(),'345');assert.equal((await fetch(base+'/movie.mp4',{headers:{Range:'bytes=99-100'}})).status,416);
 console.log('Production checks passed: limits, spoof resistance, request IDs, no-store, CSP, ETags and media ranges.');
}finally{api.closeAllConnections();api.close();web?.closeAllConnections();web?.close();if(dir)rmSync(dir,{recursive:true});}
