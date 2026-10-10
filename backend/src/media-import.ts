import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {supabase} from './config/supabase.js';
import {invalidateCatalog} from './utils/cache.js';
import {publishChange} from './change-events.js';
type ImportEntry={content_id:number;file:string;replace_existing?:boolean};
export async function importBundledMedia(){
 const root=path.resolve(process.cwd(),'..');let entries:ImportEntry[];
 try{entries=JSON.parse(await readFile(path.join(root,'media-imports.json'),'utf8'));if(!Array.isArray(entries)||entries.length>100)throw new Error();}catch{console.error('Media import manifest unavailable or invalid; upload media in Admin instead.');return;}
 for(const entry of entries){try{
  if(!Number.isSafeInteger(entry.content_id)||entry.content_id<1||typeof entry.file!=='string')throw new Error('Invalid title mapping');
  const file=path.resolve(root,entry.file),relative=path.relative(root,file);if(relative.startsWith('..')||path.isAbsolute(relative)||!['.mp4','.webm','.mov'].includes(path.extname(file).toLowerCase()))throw new Error('Invalid media path');
  const {data:content,error:lookupError}=await supabase.from('content').select('content_id,trailer_url').eq('content_id',entry.content_id).is('deleted_at',null).maybeSingle();if(lookupError)throw lookupError;if(!content)throw new Error('Title not found');
  if(content.trailer_url&&!String(content.trailer_url).startsWith('/trailers/')&&!entry.replace_existing)continue;
  const info=await stat(file);if(!info.isFile()||info.size<1||info.size>67108864)throw new Error('Automatic imports require files under 64 MB');
  const bytes=await readFile(file),extension=path.extname(file).toLowerCase(),bucket=extension==='.mp4'?'Trailers':'streamflix-videos',object=`streamflix-imports/${createHash('sha256').update(bytes).digest('hex')}${extension}`;
  const {data:existing,error:listError}=await supabase.storage.from(bucket).list('streamflix-imports',{search:path.basename(object),limit:10});if(listError)throw listError;
  if(!existing?.some(row=>row.name===path.basename(object))){const {error:uploadError}=await supabase.storage.from(bucket).upload(object,bytes,{contentType:extension==='.mp4'?'video/mp4':extension==='.webm'?'video/webm':'video/quicktime',upsert:false});if(uploadError)throw uploadError;}
  let update=supabase.from('content').update({trailer_url:`storage://${bucket}/${object}`}).eq('content_id',entry.content_id);
  update=content.trailer_url===null?update.is('trailer_url',null):update.eq('trailer_url',content.trailer_url);
  const {data:changed,error:updateError}=await update.select('content_id');if(updateError)throw updateError;if(changed?.length){invalidateCatalog();publishChange('catalog');console.log(`Imported trailer for catalog title #${entry.content_id}`);}
 }catch{console.error(`Trailer import for title #${entry.content_id} could not complete. Check the mapped file and Storage permissions; existing catalog records are preserved.`);}}
}
