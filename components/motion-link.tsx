'use client';
import Link from 'next/link';
import type {ComponentProps} from 'react';
import {useNavigationMotion} from './navigation-motion';

export default function MotionLink({onNavigate,href,...props}:ComponentProps<typeof Link>){
 const start=useNavigationMotion();
 return <Link {...props} href={href} onNavigate={event=>{
  let cancelled=false;
  onNavigate?.({preventDefault:()=>{cancelled=true;event.preventDefault();}});
  if(cancelled)return;
  const value=typeof href==='string'?href:href.pathname;
  if(!value)return;
  const destination=new URL(value,location.href);
  if(destination.origin===location.origin&&destination.pathname!==location.pathname)start();
 }}/>;
}
