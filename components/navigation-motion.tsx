'use client';
import Image from 'next/image';
import {assetPath} from '@/lib/demo/paths';
import {createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';

const NavigationContext=createContext<()=>void>(()=>{});
export const useNavigationMotion=()=>useContext(NavigationContext);
const defaultLogo=assetPath('/branding/Logo_Festika-04.webp');

export function NavigationMotion({children}:{children:React.ReactNode}){
 const pathname=usePathname(),[phase,setPhase]=useState<'idle'|'cover'|'leave'>('idle'),[logo,setLogo]=useState(defaultLogo);
 const route=useRef(pathname),active=useRef(false),started=useRef(0),timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const clear=useCallback(()=>{timers.current.forEach(clearTimeout);timers.current=[];},[]);
 const finish=useCallback(()=>{clear();active.current=false;delete document.documentElement.dataset.navigationMotion;window.dispatchEvent(new Event('festika:navigation-ready'));setPhase('leave');timers.current.push(setTimeout(()=>setPhase('idle'),180));},[clear]);
 const start=useCallback(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  clear();active.current=true;started.current=performance.now();document.documentElement.dataset.navigationMotion='cover';
  const brand=document.querySelector<HTMLImageElement>('.public-header .brand img,.auth-top .brand img');
  setLogo(brand?.currentSrc||defaultLogo);setPhase('cover');
  // The curtain never blocks navigation or remains over a failed/slow request.
  timers.current.push(setTimeout(finish,1400));
 },[clear,finish]);
 useEffect(()=>{
  const changed=route.current!==pathname;route.current=pathname;
  if(active.current&&changed){clear();timers.current.push(setTimeout(finish,Math.max(0,380-(performance.now()-started.current))));}
 },[pathname,clear,finish]);
 useEffect(()=>{
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const disable=()=>{if(preference.matches)finish();};
  const back=()=>{if(location.pathname!==route.current&&document.querySelector('.public-site'))start();};
  preference.addEventListener('change',disable);window.addEventListener('popstate',back);
  return()=>{clear();delete document.documentElement.dataset.navigationMotion;preference.removeEventListener('change',disable);window.removeEventListener('popstate',back);};
 },[clear,finish,start]);
 return <NavigationContext.Provider value={start}>{children}<div className={'route-curtain route-curtain-'+phase} data-route-transition={phase} hidden={phase==='idle'} aria-hidden="true"><div className="route-signature"><Image src={logo} alt="" width={82} height={82} unoptimized/><div className="route-wordmark"><strong><span>FEST</span><span>IKA</span></strong><span className="route-signature-line"/></div></div></div></NavigationContext.Provider>;
}
