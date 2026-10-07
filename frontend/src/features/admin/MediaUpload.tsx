import {useEffect,useRef,useState} from 'react';
import {Upload as TusUpload} from 'tus-js-client';
import {UploadCloud,CheckCircle2,FileVideo,Image as ImageIcon,LoaderCircle} from 'lucide-react';
import {apiRequest} from '@/services/api-client';
import {supabase} from '@/lib/supabase';
type Ticket={uploadId:string;bucket:string;path:string;token:string};
export default function MediaUpload({name,value='',accept='image/*,video/*',onUploaded,onBusy}:{name:string;value?:string;accept?:string;onUploaded?:(url:string,asset?:{asset_id:number;name:string;kind:string})=>Promise<void>|void;onBusy?:(busy:boolean)=>void}){
 const [url,setUrl]=useState(value),[progress,setProgress]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState(''),[filename,setFilename]=useState('');
 const picker=useRef<HTMLInputElement|null>(null);
 const active=useRef<TusUpload|null>(null),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;void active.current?.abort();};},[]);
 async function choose(file?:File){if(!file)return;setError('');setFilename(file.name);setProgress(0);setBusy(true);onBusy?.(true);
 try{
  const ticket=await apiRequest<Ticket>('/admin/uploads/sign',{method:'POST',body:JSON.stringify({name:file.name,mimeType:file.type,size:file.size,purpose:'promotional'})});
  if(file.size<=6*1024*1024){const {error}=await supabase.storage.from(ticket.bucket).uploadToSignedUrl(ticket.path,ticket.token,file,{contentType:file.type});if(error)throw error;setProgress(100);}
  else await new Promise<void>((resolve,reject)=>{
   const base=new URL(import.meta.env.VITE_SUPABASE_URL);if(base.hostname.endsWith('.supabase.co'))base.hostname=base.hostname.replace('.supabase.co','.storage.supabase.co');
   active.current=new TusUpload(file,{endpoint:base.origin+'/storage/v1/upload/resumable',retryDelays:[0,1000,3000,5000,10000],headers:{'x-signature':ticket.token},metadata:{bucketName:ticket.bucket,objectName:ticket.path,contentType:file.type,cacheControl:'3600'},chunkSize:6*1024*1024,uploadDataDuringCreation:true,removeFingerprintOnSuccess:true,onError:reject,onSuccess:()=>resolve(),onProgress:(sent,total)=>{if(mounted.current)setProgress(Math.round(sent/total*100));}});active.current.start();
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
  {url&&!busy&&!error&&<div className="upload-success"><CheckCircle2 size={14}/><span>{onUploaded?'Uploaded and saved':'Uploaded · save this record to attach'}</span>{!url.startsWith('storage://')&&<a href={url} target="_blank" rel="noreferrer">View file</a>}</div>}
  {error&&<p role="alert" className="error">{error}</p>}
 </div>;
}
