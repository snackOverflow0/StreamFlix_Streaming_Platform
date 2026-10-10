import {spawn} from 'node:child_process';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [major,minor]=process.versions.node.split('.').map(Number);
if(major<22||(major===22&&minor<12)){console.error('Install Node.js 22.12+ or 24, then run this command again.');process.exit(1);}
const rebuild=process.argv.includes('--rebuild');
async function npm(app,args){console.log(`${app}: npm ${args.join(' ')}`);await new Promise((resolve,reject)=>{const child=spawn(process.platform==='win32'?'npm.cmd':'npm',args,{cwd:path.join(root,app),stdio:'inherit',shell:process.platform==='win32'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`${app} command failed (${code})`)));});}
try{if(rebuild){for(const app of ['backend','client','admin']){await npm(app,['ci']);await npm(app,['run','build']);}await import('./compress-assets.mjs');}else{await npm('backend',['ci','--omit=dev']);}console.log('Setup complete. Run start-windows.bat.');}catch(error){console.error(error.message);process.exitCode=1;}
