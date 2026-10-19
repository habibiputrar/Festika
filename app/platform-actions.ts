'use client';
import {z} from 'zod';
import {action,errorResult} from './actions';
import {transact,readUpload} from '@/lib/demo/store';
import {actor,audit,submitPayment,verifyPayment,synchronizeSchedule,cancelRegistration,type DemoState} from '@/lib/demo/model';
import {canAccess,contentPermission} from '@/lib/permissions';
import {validateContent,kinds,type CmsEntry,type Publication} from '@/lib/content-model';
import {accountPasswordSchema,passwordChangeValues} from '@/lib/account-security';
import type {ActionResult,FestikaEvent} from '@/lib/types';

export async function sendMessage(_previous:ActionResult,form:FormData){return action(state=>{
 const values=z.object({nama:z.string().trim().min(2).max(100),email:z.email(),subject:z.string().trim().min(3).max(160),message:z.string().trim().min(10).max(5000),website:z.literal('')}).parse(Object.fromEntries(form));
 state.messages.unshift({...values,id:crypto.randomUUID(),status:'baru',created_at:new Date().toISOString()});
},'Pesan demo tersimpan di Inbox lokal. Tidak ada email yang dikirim.');}
export async function updateInbox(id:string,status:string){return action((state,user)=>{actor(state,user,'inbox');if(!['baru','dibaca','ditangani','diarsipkan'].includes(status))throw Error('Status tidak valid.');const item=state.messages.find(item=>item.id===id);if(!item)throw Error('Pesan tidak ditemukan.');item.status=status as typeof item.status;audit(state,user,'Mengubah status Inbox');},'Status pesan demo tersimpan.');}
export async function reviewPayment(id:string,status:string,reason:string){return action((state,user)=>verifyPayment(state,user,id,status,reason),'Verifikasi pembayaran demo tersimpan.');}
async function payment(form:FormData,isTeam:boolean){
 try{const upload=await readUpload(form.get('bukti'),'receipt');await transact((state,user)=>{
  const team=isTeam?state.teams.find(item=>item.id===form.get('team_id')&&!item.archived):null;
  if(isTeam&&(!team||team.ketua_id!==user))throw Error('Bukti tim hanya diunggah oleh ketua.');
  const registration=isTeam?state.registrations.find(item=>item.event_id===team?.event_id&&item.user_id===user&&item.status==='pending'):state.registrations.find(item=>item.id===form.get('registration_id'));
  if(!registration)throw Error('Pendaftaran tidak ditemukan.');submitPayment(state,user,registration.id,upload.data);
 });return {ok:true,message:'Bukti demo tersimpan dan dapat diperiksa melalui akun admin.'};}catch(error){return errorResult(error);}
}
export async function submitTeamPayment(form:FormData){return payment(form,true);}
export async function submitParticipantPayment(form:FormData){return payment(form,false);}
export async function saveTeamMembers(form:FormData){return action((state,user)=>{
 const account=actor(state,user),team=state.teams.find(item=>item.id===form.get('team_id')&&!item.archived),event=state.events.find(item=>item.id===team?.event_id);
 if(!team||!event||team.ketua_id!==user&&!canAccess(account,'teams'))throw Error('Tim tidak dapat diubah dari akun ini.');
 if(team.payment_status==='verified'&&account.role==='user')throw Error('Tim yang terverifikasi hanya dapat diubah panitia.');
 const names=form.getAll('member_names').map(String).map(value=>value.trim()).filter(Boolean);
 if(names.some(name=>name.length<2||name.length>100)||names.length+1<(event.min_anggota||1)||names.length+1>(event.anggota_tim||1))throw Error('Nama dan jumlah anggota belum sesuai.');
 team.member_names=[team.member_names?.[0]||account.nama,...names];audit(state,user,'Memperbarui anggota tim demo');
},'Nama anggota demo tersimpan.');}
export async function cancelNamedTeam(id:string){return action((state,user)=>{const team=state.teams.find(item=>item.id===id&&!item.archived);if(!team||team.ketua_id!==user)throw Error('Hanya ketua yang dapat membatalkan tim.');const registration=state.registrations.find(item=>item.event_id===team.event_id&&item.user_id===user&&item.status!=='dibatalkan');if(registration)cancelRegistration(state,user,registration.id);team.archived=true;},'Tim demo dibatalkan.');}
export async function leaveTeam(id:string){return cancelNamedTeam(id);}
export async function updateAccount(form:FormData){return action((state,user)=>{
 const account=actor(state,user),mode=form.get('mode');
 if(mode==='profile'){
  account.nama=z.string().trim().min(2).max(100).parse(form.get('nama'));
  state.teams.filter(team=>team.ketua_id===user).forEach(team=>{if(team.member_names)team.member_names[0]=account.nama;});
 }else if(mode==='password'){
  const values=passwordChangeValues(form);if(values.current!==account.password)throw Error('Password saat ini tidak sesuai.');account.password=values.password;
 }else if(mode==='email'){
  if(form.get('current_password')!==account.password)throw Error('Password saat ini tidak sesuai.');
  const email=z.email().parse(String(form.get('email')).toLowerCase());if(state.accounts.some(item=>item.email===email&&item.id!==user))throw Error('Email sudah digunakan.');account.email=email;
 }else throw Error('Perubahan akun tidak dikenali.');audit(state,user,'Memperbarui akun demo');
},'Akun demo diperbarui secara lokal. Tidak ada email konfirmasi yang dikirim.');}

function publishEntry(state:DemoState,user:string|null,id:string,publish:boolean){
 const entry=state.entries.find(item=>item.id===id);if(!entry)throw Error('Konten tidak ditemukan.');actor(state,user,contentPermission(entry.kind));
 if(publish){
  if(!entry.visible)throw Error('Aktifkan visibilitas sebelum publikasi.');
  if(entry.parent_id&&!state.publications.some(item=>item.id===entry.parent_id))throw Error('Publikasikan album induk terlebih dahulu.');
  const publication:Publication={...entry,payload:structuredClone(entry.draft_data),published_at:new Date().toISOString()};
  state.publications=[...state.publications.filter(item=>item.id!==id),publication];
 }else{
  if(state.publications.some(item=>item.parent_id===id))throw Error('Batalkan publikasi foto dalam album terlebih dahulu.');
  state.publications=state.publications.filter(item=>item.id!==id);
 }
 synchronizeSchedule(state);audit(state,user,publish?'Mempublikasikan konten demo':'Membatalkan publikasi konten demo');
}
export async function saveContent(form:FormData){return action((state,user)=>{
 const kind=z.enum(kinds).parse(form.get('kind'));actor(state,user,contentPermission(kind));
 if(form.get('id')){const existing=state.entries.find(item=>item.id===form.get('id'));if(!existing)throw Error('Konten tidak ditemukan.');actor(state,user,contentPermission(existing.kind));}
 const id=String(form.get('id')||crypto.randomUUID()),title=z.string().trim().min(1).max(160).parse(form.get('title')),slug=z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).parse(form.get('slug'));
 if(state.entries.some(item=>item.slug===slug&&item.id!==id))throw Error('Slug konten sudah digunakan.');
 if(kind==='contact'&&form.has('social_label'))form.set('socials',form.getAll('social_label').map((label,index)=>String(label)+' | '+String(form.getAll('social_url')[index]||'')).filter(line=>line.split('|')[1].trim()).join('\n'));
 const payload=validateContent(kind,Object.fromEntries(form)),eventId=form.get('event_id')?Number(form.get('event_id')):null;
 if(eventId&&!state.drafts.some(event=>event.id===eventId))throw Error('Event terkait tidak ditemukan.');
 const parentId=String(form.get('parent_id')||'')||null;if(kind==='gallery'&&!state.entries.some(item=>item.id===parentId&&item.kind==='past_event'))throw Error('Pilih album induk.');
 const entry:CmsEntry={id,kind,title,slug,draft_data:payload,parent_id:parentId,event_id:eventId,sort_order:z.coerce.number().int().min(0).max(10000).parse(form.get('sort_order')||0),visible:form.get('visible')==='on',updated_at:new Date().toISOString()};
 state.entries=[...state.entries.filter(item=>item.id!==id),entry];if(form.get('intent')==='publish')publishEntry(state,user,id,true);else audit(state,user,'Menyimpan Draft konten demo');
},form.get('intent')==='publish'?'Konten demo dipublikasikan.':'Draft konten demo tersimpan.');}
export async function publishContent(id:string,publish:boolean){return action((state,user)=>publishEntry(state,user,id,publish),publish?'Konten demo dipublikasikan.':'Publikasi demo dibatalkan.');}
export async function deleteContent(id:string){return action((state,user)=>{
 const item=state.entries.find(item=>item.id===id);if(!item)throw Error('Konten tidak ditemukan.');actor(state,user,contentPermission(item.kind));
 if(state.publications.some(item=>item.id===id)||state.entries.some(item=>item.parent_id===id))throw Error('Konten masih diterbitkan atau memiliki foto anak.');
 state.entries=state.entries.filter(item=>item.id!==id);audit(state,user,'Menghapus Draft konten demo');
},'Draft demo dihapus.');}
function validateOpenEvent(event:FestikaEvent){
 if(event.registration_state==='open'&&(!event.registration_start||!event.registration_end||!event.tipe||!event.kuota||!event.payment_basis||event.payment_basis==='unconfirmed'||event.payment_basis!=='free'&&(!event.fee_amount||!event.payment_instructions)))throw Error('Lengkapi periode, jenis peserta, kuota, dan pembayaran sebelum membuka pendaftaran.');
}
export async function publishEvent(id:number,publish:boolean){return action((state,user)=>{
 actor(state,user,'events');const draft=state.drafts.find(event=>event.id===id);if(!draft)throw Error('Draft event tidak ditemukan.');
 if(publish){validateOpenEvent(draft);state.events=[...state.events.filter(event=>event.id!==id),{...structuredClone(draft),is_published:true}];synchronizeSchedule(state);}
 else state.events.filter(event=>event.id===id).forEach(event=>{event.is_published=false;event.registration_state='closed';});audit(state,user,publish?'Mempublikasikan event demo':'Membatalkan publikasi event demo');
},'Publikasi event demo diperbarui.');}
export async function uploadMedia(form:FormData){
 try{const file=await readUpload(form.get('file'),'media');return await action((state,user)=>{
  actor(state,user,'media');const id=crypto.randomUUID(),path='/media/'+id,purpose=z.enum(['poster','logo','gallery','sponsor','committee','guidebook']).parse(form.get('purpose'));
  if((purpose==='guidebook')!==(file.type==='application/pdf'))throw Error('Gunakan PDF untuk panduan dan gambar untuk penggunaan lainnya.');
  state.files[path]=file.data;state.media.unshift({id,object_path:path,mime_type:file.type,bytes:file.size,alt:String(form.get('alt')||'').slice(0,500),original_name:file.name,purpose,pending_delete:false,created_at:new Date().toISOString()});audit(state,user,'Mengunggah media demo');
 },'Media demo tersimpan di browser.');}catch(error){return errorResult(error);}
}
export async function deleteMedia(id:string){return action((state,user)=>{
 actor(state,user,'media');const path='/media/'+id;
 if(state.entries.some(item=>Object.values(item.draft_data).includes(path))||state.publications.some(item=>Object.values(item.payload).includes(path))||[...state.events,...state.drafts].some(item=>item.poster===path||item.guidebook===path))throw Error('Media masih digunakan oleh konten atau event.');
 state.media=state.media.filter(item=>item.id!==id);delete state.files[path];audit(state,user,'Menghapus media demo');
},'Media demo dihapus.');}
export {accountPasswordSchema};
