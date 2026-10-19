// One reviewed source for previews and the INSERT-only publishing tool.
import material from './initial-material.json';
import copy from './content-revisions.json';
import details from './competition-details.json';
import timelines from './competition-timelines.json';
import type {ContentKind,Publication} from './content-model';
import type {FestikaEvent} from './types';
import {withEventSchedule} from './event-schedule';
const revisions=copy as Record<string,{title?:string;payload:Record<string,unknown>}>;
export const initialContent=material.content.map(entry=>({...entry,title:revisions[entry.slug]?.title||entry.title,payload:{...entry.payload,...revisions[entry.slug]?.payload},kind:entry.kind as ContentKind}));
const baseEvents:FestikaEvent[]=material.events.map((event,i)=>({...event,...(details as Record<string,unknown>)[event.slug] as object,id:i+1,created_at:'2026-10-19T00:00:00Z',is_published:true}) as FestikaEvent);
export const initialEvents=baseEvents.map(event=>withEventSchedule(event,initialPublications()));
export function initialPublications():Publication[]{
 const content:Publication[]=initialContent.map((entry,i)=>({...entry,id:'00000000-0000-0000-0001-'+String(i+1).padStart(12,'0'),parent_id:null,event_id:null,published_at:'2026-10-19T00:00:00Z'}));
 for(const [slug,items] of Object.entries(timelines))for(const [index,item] of items.entries())content.push({id:'00000000-0000-0000-0002-'+String(content.length+1).padStart(12,'0'),kind:'timeline',title:item.title,slug:item.slug,parent_id:null,event_id:baseEvents.find(event=>event.slug===slug)?.id||null,sort_order:index+1,payload:{start:item.start,end:'end' in item?item.end:'',description:'description' in item?item.description:''},published_at:'2026-10-19T00:00:00Z'});
 return content;
}
