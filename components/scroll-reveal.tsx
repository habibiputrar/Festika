'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

const selector=[
 '.hero-copy > *','.hero-poster','.festival-intro > *','.public-page-heading > *',
 '.editorial-heading','.competition-card','.participant-banner','.about-intro > *','.about-prose > p','.about-story',
 '.timeline-section-heading > *','.timeline-grid > li','.sponsor-grid > div','.committee-grid > article',
 '.public-main .public-panel','.flashback-intro > *','.flashback-group > h4','.past-gallery > button',
 '.competition-detail h1','.competition-detail article > section','.competition-contacts'
].join(',');

export function ScrollReveal(){
 const path=usePathname();
 useEffect(()=>{
  const preference=matchMedia('(prefers-reduced-motion: reduce)'),root=document.querySelector('.public-site');
  if(preference.matches||!root||!('IntersectionObserver' in window))return;
  const nodes=new Set<HTMLElement>(),waiting=new Set<HTMLElement>(),listeners=new Map<HTMLElement,(event:AnimationEvent)=>void>();
  const clearNode=(node:HTMLElement)=>{node.classList.remove('reveal-pending','is-revealed');node.style.removeProperty('--reveal-delay');const handler=listeners.get(node);if(handler){node.removeEventListener('animationend',handler);listeners.delete(node);}};
  const reveal=(node:HTMLElement,instant=false)=>{
   node.classList.remove('reveal-pending');
   if(instant){clearNode(node);return;}
   if(document.documentElement.dataset.navigationMotion==='cover'){node.classList.add('reveal-pending');waiting.add(node);return;}
   node.classList.add('is-revealed');
   const done=(event:AnimationEvent)=>{if(event.target===node)clearNode(node);};
   node.addEventListener('animationend',done);listeners.set(node,done);
  };
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){reveal(entry.target as HTMLElement);observer.unobserve(entry.target);}},{threshold:0.05,rootMargin:'0px 0px -16px 0px'});
  const scan=()=>{
   for(const node of root.querySelectorAll<HTMLElement>(selector)){
    if(nodes.has(node)||node.getClientRects().length===0)continue;
    nodes.add(node);const rect=node.getBoundingClientRect();if(rect.bottom<=0)continue;
    const siblings=Array.from(node.parentElement?.children||[]).filter(sibling=>sibling.matches(selector));
    node.style.setProperty('--reveal-delay',Math.min(Math.max(siblings.indexOf(node),0)*60,240)+'ms');
    if(rect.top<innerHeight-16)reveal(node);else{node.classList.add('reveal-pending');observer.observe(node);}
   }
  };
  scan();
  const updates=new MutationObserver(scan);updates.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','open']});
  const ready=()=>{for(const node of waiting){if(node.isConnected)reveal(node);}waiting.clear();};
  window.addEventListener('festika:navigation-ready',ready);
  const disable=()=>{if(preference.matches){waiting.clear();nodes.forEach(node=>clearNode(node));observer.disconnect();updates.disconnect();}};
  const focus=(event:Event)=>{if(event.target instanceof Element){const node=event.target.closest<HTMLElement>('.reveal-pending');if(node){reveal(node,true);observer.unobserve(node);}}};
  root.addEventListener('focusin',focus);preference.addEventListener('change',disable);
  return()=>{observer.disconnect();updates.disconnect();window.removeEventListener('festika:navigation-ready',ready);root.removeEventListener('focusin',focus);preference.removeEventListener('change',disable);nodes.forEach(clearNode);};
 },[path]);
 return null;
}
