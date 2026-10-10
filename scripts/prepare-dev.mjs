import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import path from 'node:path';
const root=process.cwd(),file=path.join(root,'index.html');
if(!existsSync(path.join(root,'src/main.tsx')))throw new Error('Run npm run dev from the client or admin folder.');
let html=readFileSync(file,'utf8');
// Recover a source entry accidentally overwritten by dist/index.html during extraction.
if(/<script\b[^>]*\bsrc=["']\/?assets\//i.test(html)){
 html=html.replace(/<script\b[^>]*\bsrc=["']\/?assets\/[^"']+["'][^>]*>\s*<\/script>/gi,'').replace(/<link\b[^>]*(?:href=["']\/?assets\/[^"']+["'])[^>]*>/gi,'');
 html=html.replace('</body>','  <script type="module" src="/src/main.tsx"></script>\n</body>');writeFileSync(file,html);
 console.log('Restored the development HTML entry. Production assets stay in dist.');
}
if(!html.includes('/src/main.tsx'))throw new Error('index.html must load /src/main.tsx for development.');
