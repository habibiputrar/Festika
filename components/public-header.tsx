'use client';
import {useState} from 'react';
import Link from './motion-link';
import {Brand} from './brand';
import {Icon} from './icon';
import {ThemeSelect} from './theme';
import {portalRoot} from '@/lib/permissions';
import type {Role} from '@/lib/types';
export function PublicHeader({links,profile,demo=false,logo}:{links:{label:string;href:string}[];profile:{nama:string;role:Role}|null;demo?:boolean;logo?:string}){
 const [open,setOpen]=useState(false),main=links.slice(0,3),extra=links.slice(3);
 return <header className="public-header"><div className="public-nav"><Brand logo={logo}/><button className="icon-button public-menu" aria-label="Buka menu publik" aria-controls="public-links" aria-expanded={open} onClick={()=>setOpen(!open)}><Icon name={open?'close':'menu'}/></button><nav id="public-links" className={'public-links '+(open?'open':'')} aria-label="Navigasi publik"><Link href={demo?'/demo':'/'} onClick={()=>setOpen(false)}>Beranda</Link>{main.map(link=><Link key={link.href} href={link.href} onClick={()=>setOpen(false)}>{link.label}</Link>)}{extra.length>0&&<details className="more-menu"><summary>Jelajahi <Icon name="down" size={14}/></summary><div>{extra.map(link=><Link key={link.href} href={link.href} onClick={()=>setOpen(false)}>{link.label}</Link>)}</div></details>}<Link href="/message" onClick={()=>setOpen(false)}>Message</Link></nav><div className="public-nav-actions">{profile?<Link className="button primary" href={portalRoot(profile.role)}>Dashboard</Link>:<Link className="button primary account-entry" href="/masuk"><Icon name="user" size={17}/>Akun</Link>}<ThemeSelect/></div></div></header>;
}
