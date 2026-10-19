'use client';
import {useId,useState} from 'react';
import {CompetitionTimeline} from './competition-timeline';
import {Icon} from './icon';
import type {Publication} from '@/lib/content-model';
export function TimelineTabs({groups}:{groups:{id:number;name:string;items:Publication[]}[]}){
 const [active,setActive]=useState(0),id=useId();
 return <div className="festival-roadmap"><div className="roadmap-tabs" role="tablist" aria-label="Pilih timeline kompetisi">{groups.map((group,index)=><button key={group.id} type="button" role="tab" id={id+'-tab-'+index} aria-controls={id+'-panel-'+index} aria-selected={index===active} tabIndex={index===active?0:-1} onClick={()=>setActive(index)} onKeyDown={e=>{const next=e.key==='ArrowRight'?(index+1)%groups.length:e.key==='ArrowLeft'?(index-1+groups.length)%groups.length:e.key==='Home'?0:e.key==='End'?groups.length-1:null;if(next!==null){e.preventDefault();setActive(next);document.getElementById(id+'-tab-'+next)?.focus();}}}><Icon name={group.name.toLowerCase().includes('flag')?'shield':group.name.toLowerCase().includes('web')?'globe':'edit'} size={19}/><span>{group.name}</span><span className="roadmap-tab-count">{String(group.items.length).padStart(2,'0')}</span></button>)}</div>{groups.map((group,index)=><section key={group.id} role="tabpanel" id={id+'-panel-'+index} aria-labelledby={id+'-tab-'+index} hidden={active!==index} tabIndex={0} className="roadmap-panel"><div className="roadmap-panel-heading"><div><span className="eyebrow">DARI PERSIAPAN HINGGA PANGGUNG FINAL</span><h3>{group.name}</h3></div><span className="roadmap-phase-count"><strong>{String(group.items.length).padStart(2,'0')}</strong> tahapan</span></div><CompetitionTimeline items={group.items}/></section>)}</div>;
}
