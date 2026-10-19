'use client';
import {z} from 'zod';
import {transact,readState,setSession,currentId,readUpload} from '@/lib/demo/store';
import {actor,requireAdmin,enroll,cancelRegistration,submitPayment,audit,synchronizeSchedule} from '@/lib/demo/model';
import {portalRoot,canAccess} from '@/lib/permissions';
import {eventFormData} from '@/lib/event-schema';
import {accountPasswordSchema} from '@/lib/account-security';
import {withEventSchedule} from '@/lib/event-schedule';
import {navigate} from '@/lib/demo/navigation';
import type {ActionResult, FestikaEvent} from '@/lib/types';

export function errorResult(error:unknown):ActionResult{return {ok:false,message:error instanceof z.ZodError?error.issues[0].message:error instanceof Error?error.message:'Perubahan demo gagal disimpan.'};}
export async function action(operation:Parameters<typeof transact>[0],message:string):Promise<ActionResult>{try{await transact(operation);return {ok:true,message};}catch(error){return errorResult(error);}}
function password(form:FormData){const value=accountPasswordSchema.parse(form.get('password'));if(value!==form.get('password2'))throw Error('Konfirmasi password belum sama.');return value;}
export async function authAction(_previous:ActionResult,form:FormData):Promise<ActionResult&{resetUrl?:string}>{
 try{
  const mode=String(form.get('mode'));
  if(mode==='reset-password'){
   const token=new URLSearchParams(location.search).get('token'),value=password(form);
   await transact(state=>{const reset=state.recoveries.find(item=>item.token===token&&item.expires>Date.now());if(!reset)throw Error('Tautan simulasi tidak valid atau sudah kedaluwarsa.');const account=state.accounts.find(item=>item.id===reset.userId);if(!account)throw Error('Akun tidak ditemukan.');account.password=value;state.recoveries=state.recoveries.filter(item=>item.userId!==account.id);});
   return {ok:true,message:'Password demo diperbarui. Silakan masuk kembali.'};
  }
  const email=z.email().parse(String(form.get('email')||'').trim().toLowerCase());
  if(mode==='forgot-password'){
   const token=crypto.randomUUID();
   await transact(state=>{const account=state.accounts.find(item=>item.email===email&&item.enabled);if(!account)throw Error('Gunakan email salah satu akun demo yang terdaftar.');state.recoveries=state.recoveries.filter(item=>item.userId!==account.id);state.recoveries.push({token,userId:account.id,expires:Date.now()+15*60000});});
   return {ok:true,message:'Tautan simulasi tersedia di bawah. Demo tidak mengirim email.',resetUrl:'/reset-password?token='+token};
  }
  if(mode==='register'){
   const nama=z.string().trim().min(2).max(100).parse(form.get('nama')),value=password(form),id=crypto.randomUUID();
   await transact(state=>{if(state.accounts.some(item=>item.email===email))throw Error('Email demo sudah digunakan.');state.accounts.push({id,nama,email,password:value,role:'user',enabled:true,permissions:[]});audit(state,id,'Membuat akun peserta demo');});
   setSession(id);navigate('/dashboard');return {ok:true,message:'Akun demo dibuat.'};
  }
  const account=readState().accounts.find(item=>item.email===email&&item.password===form.get('password')&&item.enabled);
  if(!account)throw Error('Email atau password demo tidak sesuai, atau akun dinonaktifkan.');
  setSession(account.id);
  const next=String(form.get('next')||''),root=portalRoot(account.role);
  navigate(next.startsWith(root+'/')||next===root?next:root);return {ok:true,message:'Masuk ke demo.'};
 }catch(error){return errorResult(error);}
}
export async function logout(){setSession(null);navigate('/masuk');}
export async function registerEvent(form:FormData):Promise<ActionResult>{
 try{
  const eventId=Number(form.get('event_id')),event=readState().events.find(item=>item.id===eventId);
  const upload=event?.payment_basis==='participant'?await readUpload(form.get('bukti'),'receipt'):null;
  await transact((state,id)=>{const registration=enroll(state,id,eventId,String(form.get('nama_tim')||''),form.getAll('member_names').map(String));if(upload)submitPayment(state,id,registration.id,upload.data);});
  return {ok:true,message:'Pendaftaran demo tersimpan. Lanjutkan ke halaman pembayaran jika diperlukan.'};
 }catch(error){return errorResult(error);}
}
export async function saveEvent(form:FormData):Promise<ActionResult>{
 return action((state,id)=>{
  actor(state,id,'events');const document=eventFormData(form),eventId=form.get('id')?Number(form.get('id')):Math.max(0,...state.drafts.map(event=>event.id))+1;
  const existing=state.drafts.find(item=>item.id===eventId);if(state.drafts.some(item=>item.slug===document.slug&&item.id!==eventId))throw Error('Slug sudah digunakan.');
  if(state.events.some(item=>item.id===eventId&&item.slug!==document.slug))throw Error('Slug event yang sudah terbit tidak dapat diubah.');
  const event=withEventSchedule({...document,id:eventId,created_at:existing?.created_at||new Date().toISOString(),is_published:!!state.events.find(item=>item.id===eventId)?.is_published} as FestikaEvent,state.publications);
  state.drafts=[...state.drafts.filter(item=>item.id!==eventId),event];
  if(form.get('intent')==='publish'){state.events=[...state.events.filter(item=>item.id!==eventId),{...event,is_published:true,archived:false}];synchronizeSchedule(state);}
  audit(state,id,form.get('intent')==='publish'?'Mempublikasikan event demo':'Menyimpan Draft event demo');
 },form.get('intent')==='publish'?'Event demo dipublikasikan.':'Draft event demo tersimpan.');
}
export async function removeRecord(kind:string,recordId:string):Promise<ActionResult>{return action((state,id)=>{
 const account=actor(state,id);
 if(kind==='registration')cancelRegistration(state,id,recordId);
 else if(kind==='team'){
  const team=state.teams.find(item=>item.id===recordId);if(!team)throw Error('Tim tidak ditemukan.');
  if(team.ketua_id!==id&&!canAccess(account,'teams'))throw Error('Akses tim tidak diizinkan.');
  team.archived=true;const registration=state.registrations.find(item=>item.event_id===team.event_id&&item.user_id===team.ketua_id&&item.status!=='dibatalkan');if(registration){registration.status='dibatalkan';registration.expires_at=null;}
 }else if(kind==='event'){
  actor(state,id,'events');const event=state.events.find(item=>item.id===Number(recordId));if(event){event.archived=true;event.is_published=false;event.registration_state='closed';}state.drafts=state.drafts.filter(item=>item.id!==Number(recordId));
 }else throw Error('Jenis data tidak dikenali.');audit(state,id,'Mengarsipkan '+kind);
},'Perubahan demo tersimpan.');}
export async function reviewRegistration(id:string,status:string,reason:string){void[id,status,reason];return {ok:false,message:'Status pendaftaran diperbarui melalui verifikasi pembayaran demo.'};}
export async function manageTeam(form:FormData){
 return action((state,id)=>{const account=actor(state,id),eventId=Number(form.get('event_id')),registration=state.registrations.find(item=>item.user_id===id&&item.event_id===eventId&&item.status!=='dibatalkan'),event=state.events.find(item=>item.id===eventId);if(!registration||!event)throw Error('Daftar kompetisi terlebih dahulu.');if(state.teams.some(item=>!item.archived&&item.ketua_id===id&&item.event_id===eventId))throw Error('Tim sudah tersedia.');const names=form.getAll('member_names').map(String).map(value=>value.trim()).filter(Boolean);if(names.length+1<(event.min_anggota||1)||names.length+1>(event.anggota_tim||1))throw Error('Jumlah anggota belum sesuai.');const name=z.string().trim().min(2).max(100).parse(form.get('nama_tim'));state.teams.push({id:crypto.randomUUID(),event_id:eventId,nama_tim:name,kode_tim:'',ketua_id:account.id,created_at:new Date().toISOString(),member_names:[account.nama,...names],tim_anggota:[],payment_status:registration.payment_status,expires_at:registration.expires_at});audit(state,id,'Membuat tim demo');},'Tim demo tersimpan.');
}
export {currentId,requireAdmin};
