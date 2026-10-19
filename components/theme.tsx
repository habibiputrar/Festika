'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {Icon} from './icon';
export type ThemeChoice='light'|'dark'|'system';
const Context=createContext<{choice:ThemeChoice;change:(choice:ThemeChoice)=>void}>({choice:'system',change:()=>{}});
export function ThemeProvider({initial,children}:{initial:ThemeChoice;children:React.ReactNode}){
 const [choice,setChoice]=useState(initial);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  const apply=()=>{document.documentElement.dataset.theme=choice==='system'?(media.matches?'dark':'light'):choice;};
  apply();media.addEventListener('change',apply);return()=>media.removeEventListener('change',apply);
 },[choice]);
 function change(value:ThemeChoice){setChoice(value);document.cookie='festika-theme='+value+'; Path=/; Max-Age=31536000; SameSite=Lax';}
 return <Context.Provider value={{choice,change}}>{children}</Context.Provider>;
}
export function ThemeSelect(){const {choice,change}=useContext(Context);return <label className="theme-select"><Icon name={choice==='light'?'sun':choice==='dark'?'moon':'system'} size={18}/><span className="sr-only">Tema tampilan</span><select value={choice} onChange={e=>change(e.target.value as ThemeChoice)} aria-label="Tema tampilan"><option value="light">Terang</option><option value="dark">Gelap</option><option value="system">Ikuti sistem</option></select></label>;}
export const themeScript="(()=>{try{let m=document.cookie.match(/(?:^|; )festika-theme=(light|dark|system)(?:;|$)/),p=m?m[1]:'system';document.documentElement.dataset.theme=p==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p}catch{document.documentElement.dataset.theme='light'}})()";
