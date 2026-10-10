import {startCheckoutWorker} from './payments.routes.js';
import {startEmailWorker} from './transactional-email.js';
import {importBundledMedia} from './media-import.js';
import app from "./app.js";
import { env } from "./config/env.js";

startEmailWorker();
startCheckoutWorker();
void importBundledMedia();
const server=app.listen(env.port,process.env.HOST ?? "127.0.0.1", () => {
  console.log(`StreamFlix backend running on http://localhost:${env.port}`);
});

server.headersTimeout=15000;
server.requestTimeout=30000;
server.keepAliveTimeout=5000;
let stopping=false;
for(const signal of ["SIGTERM","SIGINT"] as const)process.on(signal,()=>{
 if(stopping)return;stopping=true;
 const deadline=setTimeout(()=>process.exit(1),10000);deadline.unref();
 server.close(()=>{clearTimeout(deadline);process.exit(0);});
 server.closeIdleConnections();
});
