import {initialEvents,initialPublications} from '../initial-content';
import type {Publication} from '../content-model';
import {DEMO_ACCOUNTS,DEMO_PASSWORD,type DemoState} from './model';
import {withEventSchedule} from '../event-schedule';

export function seedState(now=Date.now()):DemoState{
 const day=(offset:number)=>new Date(now+offset*86400000).toISOString().slice(0,10);
 const publications=initialPublications().filter(item=>!['past_event','gallery','contact','guidebook'].includes(item.kind));
 for(const item of publications){
  if(item.kind==='hero')item.payload={...item.payload,title:'FESTIKA'};
  if(item.kind==='timeline'){
   const registration=item.slug.endsWith('-pendaftaran'),final=item.slug.endsWith('-final');
   item.payload={...item.payload,start:day(registration?-1:final?21:14+item.sort_order),end:registration?day(14):'',description:'',schedule_role:registration?'registration':final?'event':'other'};
  }
 }
 const contact:Publication={id:'demo-contact',kind:'contact',slug:'kontak-demo',title:'Kontak demo',parent_id:null,event_id:null,sort_order:1,published_at:new Date(now).toISOString(),payload:{name:'Panitia Demo',phone:'',email:'panitia@festika.test',address:'Universitas Andalas · Padang',socials:'',message:'',button:'Kirim pesan demo'}};
 publications.push(contact,{...contact,id:'demo-album',kind:'past_event',slug:'arsip-contoh',title:'Arsip contoh FESTIKA',payload:{year:2025,description:'Galeri ini berisi ilustrasi untuk memperlihatkan pengelompokan dokumentasi. Ganti gambar melalui menu Media dan Konten Website saat mengembangkan proyek.',image:'/branding/demo/archive-1.svg',image_alt:'Ilustrasi dokumentasi demo',image_category:'Pembukaan'}});
 for(let index=1;index<=6;index++)publications.push({...contact,id:'demo-gallery-'+index,kind:'gallery',slug:'galeri-contoh-'+index,title:'Ilustrasi '+index,parent_id:'demo-album',sort_order:index,payload:{image:'/branding/demo/archive-'+index+'.svg',category:['Pembukaan','Web Design','Capture The Flag'][Math.floor((index-1)/2)],alt:'Ilustrasi arsip contoh '+index,caption:'Ilustrasi demo; bukan foto acara.'}});
 const events=initialEvents.map(event=>withEventSchedule({...event,created_at:new Date(now).toISOString(),tipe:event.tipe||'individu',registration_state:'open',status:'upcoming',is_published:true,archived:false,kuota:event.tipe==='tim'?30:25,maks_tim:event.tipe==='tim'?10:null,team_entry_mode:'names',payment_basis:event.tipe==='tim'?'team':'free',fee_amount:event.tipe==='tim'?100000:0,payment_instructions:'Simulasi pembayaran. Unggah file contoh; jangan melakukan transfer uang.',payment_form_url:'',guidebook:'/branding/demo/panduan-demo.pdf',contact:'Panitia Demo | ',poster:''},publications));
 publications.push({...contact,id:'demo-guidebook',kind:'guidebook',slug:'panduan-demo',title:'Panduan demo',payload:{file:'/branding/demo/panduan-demo.pdf',description:'Petunjuk penggunaan demo lokal.'}});
 return {version:1,accounts:DEMO_ACCOUNTS.map(account=>({...account,password:DEMO_PASSWORD,enabled:true,permissions:account.role==='panitia'?['registrations','teams','inbox']:[]})),events,drafts:structuredClone(events),publications,entries:publications.map(item=>({...item,draft_data:structuredClone(item.payload),visible:true,updated_at:item.published_at})),registrations:[],teams:[],payments:[],messages:[{id:'demo-message',nama:'Pengunjung Demo',email:'pengunjung@example.test',subject:'Contoh pesan pengunjung',message:'Ini merupakan pesan contoh. Coba kirim pesan dari halaman Message untuk melihat alur Inbox.',status:'baru',created_at:new Date(now).toISOString()}],media:[],files:{},history:[],audit:[],recoveries:[]};
}
