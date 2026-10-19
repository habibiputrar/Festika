import {safeUrl,text,type Publication} from '@/lib/content-model';
import {Gallery} from './public-widgets';

export function FlashbackSection({content,archivePage=false}:{content:Publication[];archivePage?:boolean}){
 const archives=content.filter(item=>item.kind==='past_event'&&safeUrl(item.payload.image)).sort((a,b)=>Number(b.payload.year||0)-Number(a.payload.year||0)||a.sort_order-b.sort_order);
 if(!archives.length)return null;
 return <section className="public-section flashback-section" id="past-events">
  {!archivePage&&<div className="editorial-heading"><h2>Flashback FESTIKA</h2><span/></div>}
  {archives.map(item=>{
   const images=[{src:safeUrl(item.payload.image),alt:text(item.payload,'image_alt',item.title),caption:item.title,category:text(item.payload,'image_category','Kegiatan lainnya')||'Kegiatan lainnya'},...content.filter(photo=>photo.kind==='gallery'&&photo.parent_id===item.id&&safeUrl(photo.payload.image)).map(photo=>({src:safeUrl(photo.payload.image),alt:text(photo.payload,'alt',photo.title),caption:text(photo.payload,'caption'),category:text(photo.payload,'category','Kegiatan lainnya')||'Kegiatan lainnya'}))];
   const categories=[...new Set(images.map(image=>image.category))];
   return <article className="flashback-event" key={item.id}>
    <div className="flashback-intro"><div><span className="eyebrow">DOKUMENTASI {text(item.payload,'year')}</span><h3>{item.title}</h3></div><p>{text(item.payload,'description')}</p></div>
    {categories.map(category=><section className="flashback-group" key={category} aria-label={category}><h4>{category}</h4><Gallery images={images.filter(image=>image.category===category)} hideCaptions/></section>)}
   </article>;
  })}
 </section>;
}
