import {spawn} from 'node:child_process';
import {existsSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createFrontendServer} from './frontend-server.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const children=[],servers=[];
const envPath=path.join(root,'backend/.env');
if(!existsSync(envPath)||!/SUPABASE_SECRET_KEY\s*=\s*(?!REPLACE_)[^\s\r\n]+/.test(readFileSync(envPath,'utf8'))){console.error('Copy your working backend/.env into this folder before starting. The downloaded placeholder is not a server key.');process.exit(1);}
for(const file of ['backend/dist/server.js','backend/node_modules/@supabase/supabase-js/package.json','client/dist/index.html','admin/dist/index.html'])if(!existsSync(path.join(root,file))){console.error('First run setup-windows.bat. If compiled files are missing, run rebuild-windows.bat.');process.exit(1);}
let stopping=false;function stop(code=0){if(stopping)return;stopping=true;for(const server of servers)server.close();for(const child of children)child.kill();setTimeout(()=>process.exit(code),300).unref();}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
const backend=spawn(process.execPath,['dist/server.js'],{cwd:path.join(root,'backend'),env:{...process.env,NODE_ENV:'production',HOST:'127.0.0.1',PORT:'4000',CLIENT_URL:'http://localhost:5173',FRONTEND_URL:'http://localhost:5173,http://localhost:5174'},stdio:'inherit'});children.push(backend);backend.on('error',error=>{console.error(error.message);stop(1);});backend.on('exit',code=>{if(!stopping){console.error('Backend stopped. Check its .env settings and port 4000.');stop(code||1);}});
let ready=false;for(let attempt=0;attempt<12&&!stopping;attempt++){try{const response=await fetch('http://localhost:4000/api/ready',{signal:AbortSignal.timeout(5000)});if(response.ok&&(await response.json()).ready){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,1000));}
if(!ready){console.error('Startup stopped: the backend could not confirm database readiness. Check backend/.env and the setup instructions.');stop(1);}else{
 for(const [app,port] of [['client',5173],['admin',5174]]){const server=createFrontendServer(path.join(root,app,'dist'));servers.push(server);server.on('error',error=>{console.error(`${app}: ${error.message}`);stop(1);});server.listen(port,'127.0.0.1',()=>console.log(`${app==='client'?'Client':'Admin'}: http://localhost:${port}`));}
 console.log('Database connected. Keep this window open; press Ctrl+C to stop all three services.');
}
