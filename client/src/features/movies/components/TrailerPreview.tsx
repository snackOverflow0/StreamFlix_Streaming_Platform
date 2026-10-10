import {useEffect,useId,useRef,useState} from 'react';
import {Volume2,VolumeX} from 'lucide-react';
import {PLAYER_EVENT,PREVIEW_EVENT,trailerSource} from '../utils/trailer';
export function TrailerPreview({url,poster,title,active=true,className='',delay=0}:{url?:string;poster:string;title:string;active?:boolean;className?:string;delay?:number}){
 const id=useId(),ref=useRef<HTMLVideoElement>(null),surface=useRef<HTMLDivElement>(null),startTimer=useRef<number|null>(null);
 const [inView,setInView]=useState(false);
 useEffect(()=>{
  const element=surface.current;if(!element)return;
  const observer=new IntersectionObserver(([entry])=>{
   const visible=entry.isIntersecting && entry.intersectionRatio>=0.35;
   if(!visible){ref.current?.pause();setAllowed(false);setReady(false);setMuted(true);}
   setInView(visible);
  },{threshold:[0,0.35]});
  observer.observe(element);return()=>observer.disconnect();
 },[]);
 const [ready,setReady]=useState(false),[muted,setMuted]=useState(true),[allowed,setAllowed]=useState(false),[failed,setFailed]=useState(false);
 const source=trailerSource(url);
 useEffect(()=>{
  setReady(false);setFailed(false);setMuted(true);setAllowed(false);
  if(document.hidden||!inView||!active||!source||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  startTimer.current=window.setTimeout(()=>{startTimer.current=null;window.dispatchEvent(new CustomEvent(PREVIEW_EVENT,{detail:id}));setAllowed(true);},delay);
  return()=>{if(startTimer.current!==null)window.clearTimeout(startTimer.current);startTimer.current=null;};
 },[active,inView,source,delay,id]);
 useEffect(()=>{
  const stop=(event:Event)=>{if(event.type===PLAYER_EVENT||(event as CustomEvent).detail!==id){if(startTimer.current!==null)window.clearTimeout(startTimer.current);startTimer.current=null;setAllowed(false);ref.current?.pause();}};
  const visibility=()=>{if(document.hidden){if(startTimer.current!==null)window.clearTimeout(startTimer.current);startTimer.current=null;ref.current?.pause();setAllowed(false);}};
  window.addEventListener(PREVIEW_EVENT,stop);window.addEventListener(PLAYER_EVENT,stop);document.addEventListener('visibilitychange',visibility);
  return()=>{window.removeEventListener(PREVIEW_EVENT,stop);window.removeEventListener(PLAYER_EVENT,stop);document.removeEventListener('visibilitychange',visibility);};
 },[id]);
 useEffect(()=>{const video=ref.current;if(!video)return;if(allowed){video.muted=true;void video.play().catch(()=>setFailed(true));}else video.pause();return()=>video.pause();},[allowed]);
 return <div ref={surface} className={`sf-trailer-surface ${className}`}>
  <img src={poster} alt={`${title} artwork`} className="h-full w-full object-cover"/>
  {source&&allowed&&!failed&&<video ref={ref} src={source} poster={poster} muted={muted} playsInline loop preload="auto" aria-label={`${title} trailer preview`} onLoadedData={()=>setReady(true)} onPlaying={()=>setReady(true)} onError={()=>{setFailed(true);setReady(false);}} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${ready?'opacity-100':'opacity-0'}`}/>}
  {source&&allowed&&!failed&&<button type="button" className="sf-preview-sound" aria-label={muted?'Unmute trailer preview':'Mute trailer preview'} aria-pressed={!muted} onClick={e=>{e.stopPropagation();const next=!muted;setMuted(next);if(ref.current)ref.current.muted=next;}}>{muted?<VolumeX size={17}/>:<Volume2 size={17}/>}</button>}
 </div>;
}
