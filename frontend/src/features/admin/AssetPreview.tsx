import {useEffect,useState} from 'react';
import {apiRequest} from '@/services/api-client';
export default function AssetPreview({id,kind,name,url}:{id:number;kind:string;name:string;url:string}){
 const [resolved,setResolved]=useState(''),[error,setError]=useState('');
 useEffect(()=>{let alive=true;setResolved('');setError('');if(!url.startsWith('storage://')){setResolved(url);return;}void apiRequest<{url:string}>(`/admin/assets/${id}/url`).then(r=>{if(alive)setResolved(r.url);}).catch(e=>{if(alive)setError(e.message);});return()=>{alive=false;};},[id,url]);
 return <>{error&&<p className="error">{error}</p>}{resolved? <>{kind.toLowerCase()==='video'?<video className="asset-preview" src={resolved} controls/>:kind.toLowerCase()==='image'?<img className="asset-preview" src={resolved} alt={name}/>:null}<a href={resolved} target="_blank" rel="noreferrer">Open original file</a></>:!error&&<p>Loading asset…</p>}</>;
}
