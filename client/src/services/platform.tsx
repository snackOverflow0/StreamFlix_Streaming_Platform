import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {apiRequest} from './api-client';
type Platform={platformName:string;tagline:string;supportEmail:string;primaryColor:string;secondaryColor:string};
const defaults:Platform={platformName:'StreamFlix',tagline:'Your next story starts here.',supportEmail:'',primaryColor:'#7c3aed',secondaryColor:'#60a5fa'};
const Context=createContext(defaults);
export function PlatformProvider({children}:{children:ReactNode}){
 const [settings,setSettings]=useState(defaults);
 useEffect(()=>{let alive=true,busy=false;async function reload(){if(busy||document.hidden)return;busy=true;try{const value=await apiRequest<Platform>('/platform');if(alive){setSettings(value);document.title=value.platformName;document.documentElement.style.setProperty('--sf-accent',value.primaryColor);document.documentElement.style.setProperty('--sf-secondary',value.secondaryColor);}}catch{/* Retain the last branding while connectivity recovers. */}finally{busy=false;}}
 const changed=(event:Event)=>{if((event as CustomEvent).detail==='catalog')void reload();};void reload();window.addEventListener('streamflix-data-change',changed);window.addEventListener('focus',reload);const timer=window.setInterval(()=>void reload(),60000);return()=>{alive=false;window.clearInterval(timer);window.removeEventListener('streamflix-data-change',changed);window.removeEventListener('focus',reload);};},[]);
 return <Context.Provider value={settings}>{children}</Context.Provider>;
}
export function usePlatform(){return useContext(Context);}
