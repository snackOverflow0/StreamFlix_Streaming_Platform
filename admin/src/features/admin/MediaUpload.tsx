import {useEffect,useRef,useState} from 'react';
import {Upload as TusUpload} from 'tus-js-client';
import {UploadCloud,CheckCircle2,FileVideo,Image as ImageIcon,LoaderCircle} from 'lucide-react';
import {apiRequest} from '@/services/api-client';
import {supabase} from '@/lib/supabase';
type Ticket={uploadId:string;bucket:string;path:string;token:string};
export default function MediaUpload({name,value='',accept='image/*,video/*',preview=false,onUploaded,onBusy}:{name:string;value?:string;accept?:string;preview?:boolean;onUploaded?:(url:string,asset?:{asset_id:number;name:string;kind:string})=>Promise<void>|void;onBusy?:(busy:boolean)=>void}){
 const [url,setUrl]=useState(value),[progress,setProgress]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState(''),[filename,setFilename]=useState('');
 const [stored,setStored]=useState<{name:string;path:string;reference:string;isFolder:boolean}[]>([]),[folder,setFolder]=useState(''),[storageOpen,setStorageOpen]=useState(false),[storageOffset,setStorageOffset]=useState(0),[hasMore,setHasMore]=useState(false);
 const storageBucket=accept.startsWith('video/')?'Trailers':name==='image_url'?'products':'images';
 async function browseStorage(nextFolder='',offset=0){setError('');try{const result=await apiRequest<{files:typeof stored;hasMore:boolean}>(`/admin/storage/files?bucket=${storageBucket}&folder=${encodeURIComponent(nextFolder)}&offset=${offset}`);setFolder(nextFolder);setStorageOffset(offset);setStored(result.files);setHasMore(result.hasMore);setStorageOpen(true);}catch(error){setError((error as Error).message);}}
 const picker=useRef<HTMLInputElement|null>(null);
 const active=useRef<TusUpload|null>(null),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;void active.current?.abort();};},[]);
 async function choose(file?:File){if(!file)return;setError('');setFilename(file.name);setProgress(0);setBusy(true);onBusy?.(true);
 try{
  if(preview){setUrl(URL.createObjectURL(file));setProgress(100);return;}
  const MAX_UPLOAD = 512 * 1024 * 1024;
  if(file.size>MAX_UPLOAD)throw new Error('Maximum upload size is 512 MB. Compress the trailer before uploading.');
  if(!file.size)throw new Error('The selected file is empty.');
  const allowed=['video/mp4','video/webm','video/quicktime','image/jpeg','image/png','image/webp'];
  const mime=file.type || ({mp4:'video/mp4',webm:'video/webm',mov:'video/quicktime',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'} as Record<string,string>)[file.name.split('.').pop()?.toLowerCase()||''];
  if(!allowed.includes(mime))throw new Error('Choose an MP4, WebM, MOV, JPG, PNG or WebP file.');
  if(accept.startsWith('video/')&&!mime.startsWith('video/'))throw new Error('Select a supported trailer video.');
  if(accept.startsWith('image/')&&!mime.startsWith('image/'))throw new Error('Select a supported image.');
  const ticket=await apiRequest<Ticket>('/admin/uploads/sign',{method:'POST',body:JSON.stringify({name:file.name,mimeType:mime,size:file.size,purpose:name==='image_url'?'product':mime.startsWith('video/')?'trailer':'artwork'})});
  if(file.size<=6*1024*1024){const {error}=await supabase.storage.from(ticket.bucket).uploadToSignedUrl(ticket.path,ticket.token,file,{contentType:mime});if(error)throw error;setProgress(100);}
  else await new Promise<void>((resolve,reject)=>{
   const base=new URL(import.meta.env.VITE_SUPABASE_URL);if(base.hostname.endsWith('.supabase.co'))base.hostname=base.hostname.replace('.supabase.co','.storage.supabase.co');
   active.current=new TusUpload(file,{endpoint:base.origin+'/storage/v1/upload/resumable',retryDelays:[0,1000,3000,5000,10000],headers:{'x-signature':ticket.token},metadata:{bucketName:ticket.bucket,objectName:ticket.path,contentType:mime,cacheControl:'3600'},chunkSize:6*1024*1024,uploadDataDuringCreation:true,removeFingerprintOnSuccess:true,onError:(error)=>reject(new Error('Large video upload failed: '+error.message+'. Check Supabase Storage file limits and network connection.')),onSuccess:()=>resolve(),onProgress:(sent,total)=>{if(mounted.current)setProgress(Math.round(sent/total*100));}});active.current.start();
  });
  const done=await apiRequest<{url:string;asset:{asset_id:number;name:string;kind:string}}>('/admin/uploads/'+ticket.uploadId+'/complete',{method:'POST'});
  if(mounted.current)setUrl(done.url);await onUploaded?.(done.url,done.asset);
 }catch(e){if(mounted.current)setError((e as Error).message);}finally{if(mounted.current)setBusy(false);onBusy?.(false);}
 }
 const videoOnly=accept.startsWith('video/');
 const helper=videoOnly?'MP4, WebM or MOV':accept.includes('video/')?'Images or video':'JPG, PNG or WebP';
 const FileIcon=videoOnly?FileVideo:ImageIcon;
 return <div className={`media-uploader ${busy?'is-uploading':''}`}>
  <input type="hidden" name={name} value={url}/>
  <input ref={picker} className="upload-file-input" type="file" aria-label={`Choose ${name.replaceAll('_',' ')} file`} accept={accept} disabled={busy} tabIndex={-1} onChange={e=>{void choose(e.target.files?.[0]);e.target.value='';}}/>
  <div className="upload-drop">
   <span className="upload-icon">{busy?<LoaderCircle size={22} className="upload-spinner"/>:<UploadCloud size={22}/>}</span>
   <div className="upload-copy"><strong>{busy?'Uploading your file…':filename?'File selected':'Upload from your device'}</strong><small>{helper}</small></div>
   <button type="button" className="upload-browse" disabled={busy} onClick={e=>{e.preventDefault();picker.current?.click();}}>{busy?'Uploading…':url?'Replace file':'Browse files'}</button>
   {(filename||url)&&<div className="upload-file-summary"><FileIcon size={16}/><span title={filename||'Current file'}>{filename||'Current file attached'}</span>{!busy&&!error&&<CheckCircle2 size={16} className="upload-file-check"/>}</div>}
   {busy&&<div className="upload-progress"><progress max={100} value={progress}/><small role="status">{progress}% · Keep this window open</small></div>}
  </div>
  {url&&!busy&&!error&&<div className="upload-success"><CheckCircle2 size={14}/><span>{preview?'Selected for preview':onUploaded?'Uploaded and saved':'Uploaded · save this record to attach'}</span>{!url.startsWith('storage://')&&<a href={url} target="_blank" rel="noreferrer">View file</a>}</div>}
  {!preview&&<div className="storage-picker"><button type="button" disabled={busy} onClick={()=>void browseStorage()}>Choose from Supabase {storageBucket}</button><label>Or paste a media URL / storage reference<input aria-label={`Media reference for ${name}`} value={url} onChange={event=>setUrl(event.target.value)} placeholder={`storage://${storageBucket}/filename`}/></label></div>}
  {storageOpen&&<div className="storage-file-list"><strong>{storageBucket}/{folder}</strong><button type="button" onClick={()=>setStorageOpen(false)}>Close</button>{folder&&<button type="button" onClick={()=>void browseStorage(folder.split('/').slice(0,-1).join('/'))}>Back to parent folder</button>}{stored.map(file=><button type="button" key={file.path} onClick={()=>{if(file.isFolder)void browseStorage(file.path);else{setUrl(file.reference);setFilename(file.name);setStorageOpen(false);}}}>{file.isFolder?'Folder: ':''}{file.name}</button>)}{!stored.length&&<p>No files in this folder.</p>}<div>{storageOffset>0&&<button type="button" onClick={()=>void browseStorage(folder,storageOffset-100)}>Previous</button>}{hasMore&&<button type="button" onClick={()=>void browseStorage(folder,storageOffset+100)}>Next</button>}</div><small>Save the record to attach the selected file.</small></div>}
  {error&&<p role="alert" className="error">{error}</p>}
 </div>;
}
