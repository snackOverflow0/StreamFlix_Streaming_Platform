import {existsSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {gzipSync} from 'node:zlib';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const app of ['client','admin'])for(const entry of readdirSync(path.join(root,app,'dist'),{recursive:true})){const file=path.join(root,app,'dist',entry);if(/\.(js|css|html|svg)$/.test(file)){const data=readFileSync(file);if(data.length>1000||existsSync(file+'.gz'))writeFileSync(file+'.gz',gzipSync(data,{level:9}));}}
console.log('Production assets compressed.');
