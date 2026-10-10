import {randomUUID} from "node:crypto";
import type {RequestHandler} from "express";

export const requestContext:RequestHandler=(req,res,next)=>{
 const id=randomUUID();res.locals.requestId=id;res.setHeader("X-Request-ID",id);
 res.setHeader("Cache-Control","no-store");
 const start=performance.now();res.on("finish",()=>{if(process.env.NODE_ENV==="production")console.log(JSON.stringify({event:"request",requestId:id,method:req.method,route:req.route?.path??"unmatched",status:res.statusCode,durationMs:Math.round(performance.now()-start)}));});next();
};
// Bounded single-process protection. Enforce shared limits at the ingress for replicas.
export function createRateLimiter(limit=300,windowMs=60000):RequestHandler{
 const clients=new Map<string,{count:number;reset:number}>();
 return(req,res,next)=>{
  if(req.method==="OPTIONS"||["/health","/ready","/payments/webhook"].includes(req.path)){next();return;}
  const now=Date.now(),key=req.ip??req.socket.remoteAddress??"unknown";
  for(const [ip,bucket]of clients)if(bucket.reset<=now)clients.delete(ip);
  let bucket=clients.get(key);
  if(!bucket){if(clients.size>=10000){res.status(503).json({message:"Server busy. Try again shortly."});return;}bucket={count:0,reset:now+windowMs};clients.set(key,bucket);}
  bucket.count++;if(bucket.count>limit){res.setHeader("Retry-After",Math.max(1,Math.ceil((bucket.reset-now)/1000)));res.status(429).json({message:"Too many requests. Try again shortly."});return;}next();
 };
}
