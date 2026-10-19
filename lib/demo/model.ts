import type {CmsEntry,Publication,ContactMessage,MediaAsset} from '../content-model';
import type {FestikaEvent,Registration,Team,Payment,RegistrationHistory,Profile} from '../types';
import {canAccess,type Permission} from '../permissions';
import {withEventSchedule} from '../event-schedule';
import {registrationOpen,activeRegistration} from '../business';

export const DEMO_PASSWORD='DemoFestika2026!';
export const DEMO_ACCOUNTS=[{id:'demo-admin',nama:'Admin Demo',email:'admin@festika.test',role:'admin' as const},{id:'demo-panitia',nama:'Panitia Demo',email:'panitia@festika.test',role:'panitia' as const},{id:'demo-peserta',nama:'Peserta Demo',email:'peserta@festika.test',role:'user' as const}];
export interface DemoAccount extends Profile {password:string;enabled:boolean}
export interface DemoState {version:1;accounts:DemoAccount[];events:FestikaEvent[];drafts:FestikaEvent[];entries:CmsEntry[];publications:Publication[];registrations:Registration[];teams:Team[];payments:Payment[];messages:ContactMessage[];media:MediaAsset[];files:Record<string,string>;history:RegistrationHistory[];audit:{id:string;action:string;actor:string;created_at:string}[];recoveries:{token:string;userId:string;expires:number}[]}
export function actor(state:DemoState,id:string|null,permission?:Permission){
 const account=state.accounts.find(item=>item.id===id&&item.enabled);
 if(!account)throw Error('Masuk ke akun demo terlebih dahulu.');
 if(permission&&!canAccess(account,permission))throw Error('Akun demo ini tidak memiliki akses ke modul tersebut.');
 return account;
}
export function requireAdmin(state:DemoState,id:string|null){const account=actor(state,id);if(account.role!=='admin')throw Error('Menu ini khusus admin demo.');return account;}
export function audit(state:DemoState,id:string|null,action:string){state.audit.unshift({id:crypto.randomUUID(),action,actor:state.accounts.find(item=>item.id===id)?.nama||'Pengunjung',created_at:new Date().toISOString()});state.audit=state.audit.slice(0,100);}
export function expire(state:DemoState,now=Date.now()){
 for(const registration of state.registrations)if(registration.status==='pending'&&registration.expires_at&&Date.parse(registration.expires_at)<=now){registration.status='dibatalkan';registration.reason='Batas pembayaran demo telah berakhir.';for(const team of state.teams.filter(team=>team.event_id===registration.event_id&&team.ketua_id===registration.user_id))team.archived=true;}
 state.recoveries=state.recoveries.filter(item=>item.expires>now);
}
export function capacity(state:DemoState,event:FestikaEvent,now=Date.now()){
 const registered=state.registrations.filter(row=>row.event_id===event.id&&activeRegistration(row,now));
 if(event.tipe==='tim')return Math.max(0,Math.min(event.maks_tim??Infinity,Math.floor((event.kuota??Infinity)/(event.anggota_tim||1)))-registered.length);
 return event.kuota==null?null:Math.max(0,event.kuota-registered.length);
}
export function publicEvents(state:DemoState){return state.events.filter(event=>event.is_published&&!event.archived).map(event=>({...withEventSchedule(event,state.publications),remaining:capacity(state,event)}));}
export function enroll(state:DemoState,id:string|null,eventId:number,namaTim:string,members:string[],now=Date.now()){
 const account=actor(state,id);if(account.role!=='user')throw Error('Gunakan akun peserta demo untuk mendaftar.');expire(state,now);
 const event=publicEvents(state).find(event=>event.id===eventId);if(!event||!registrationOpen(event,now))throw Error('Pendaftaran ditutup atau kuota sudah penuh.');
 if(state.registrations.some(row=>row.user_id===id&&row.event_id===eventId&&activeRegistration(row,now)))throw Error('Kamu sudah terdaftar pada kompetisi ini.');
 const names=members.map(name=>name.trim()).filter(Boolean);
 if(event.tipe==='tim'&&(!namaTim.trim()||namaTim.trim().length<2||names.some(name=>name.length<2||name.length>100)||names.length+1<(event.min_anggota||1)||names.length+1>(event.anggota_tim||1)))throw Error('Lengkapi nama tim dan jumlah anggota sesuai ketentuan.');
 const free=event.payment_basis==='free',expiry=free?null:new Date(now+86400000).toISOString();
 const registration:Registration={id:crypto.randomUUID(),user_id:account.id,event_id:eventId,status:free?'diterima':'pending',bukti_pembayaran:'',created_at:new Date(now).toISOString(),payment_status:free?'not_required':'pending',fee_snapshot:event.fee_amount||0,basis_snapshot:event.payment_basis,expires_at:expiry};
 state.registrations.unshift(registration);
 if(event.tipe==='tim')state.teams.unshift({id:crypto.randomUUID(),event_id:eventId,nama_tim:namaTim.trim(),kode_tim:'',ketua_id:account.id,created_at:registration.created_at,tim_anggota:[{tim_id:'',event_id:eventId,user_id:account.id}],member_names:[account.nama,...names],expires_at:expiry,payment_status:registration.payment_status});
 audit(state,id,'Mendaftar '+event.nama_event);return registration;
}
export function cancelRegistration(state:DemoState,id:string|null,registrationId:string){
 const account=actor(state,id),registration=state.registrations.find(row=>row.id===registrationId);if(!registration)throw Error('Pendaftaran tidak ditemukan.');
 if(registration.user_id!==id&&!canAccess(account,'registrations'))throw Error('Pendaftaran ini milik peserta lain.');
 registration.status='dibatalkan';registration.expires_at=null;
 state.teams.filter(team=>team.ketua_id===registration.user_id&&team.event_id===registration.event_id).forEach(team=>{team.archived=true;});audit(state,id,'Membatalkan pendaftaran');
}
export function submitPayment(state:DemoState,id:string|null,registrationId:string,receipt:string){
 const account=actor(state,id);expire(state);
 const registration=state.registrations.find(row=>row.id===registrationId&&row.user_id===account.id);
 if(!registration||registration.status!=='pending'||registration.payment_status==='verified')throw Error('Pendaftaran ini tidak menunggu pembayaran.');
 const event=state.events.find(event=>event.id===registration.event_id);if(!event||event.payment_basis==='free')throw Error('Kompetisi ini tidak membutuhkan pembayaran.');
 const team=state.teams.find(team=>!team.archived&&team.ketua_id===id&&team.event_id===event.id);
 if(event.tipe==='tim'&&(!team||(team.member_names?.length||0)<(event.min_anggota||1)))throw Error('Lengkapi anggota tim terlebih dahulu.');
 for(const payment of state.payments.filter(payment=>payment.registration_id===registrationId&&payment.status!=='verified'))payment.status='replaced';
 registration.bukti_pembayaran=receipt;registration.payment_status='pending';
 state.payments.unshift({id:crypto.randomUUID(),registration_id:registration.id,team_id:team?.id||null,event_id:event.id,submitted_by:account.id,amount:registration.fee_snapshot||0,status:'pending',reason:'',created_at:new Date().toISOString(),receipt_url:receipt});audit(state,id,'Mengunggah bukti pembayaran demo');
}
export function verifyPayment(state:DemoState,id:string|null,paymentId:string,status:string,reason:string){
 actor(state,id,'payments');expire(state);if(!['verified','rejected','pending'].includes(status))throw Error('Status pembayaran tidak valid.');
 const payment=state.payments.find(payment=>payment.id===paymentId),registration=state.registrations.find(row=>row.id===payment?.registration_id);
 if(!payment||payment.status==='verified'||payment.status==='replaced'||!registration||registration.status==='dibatalkan')throw Error('Pembayaran sudah selesai, diganti, atau slot telah berakhir.');
 if(status==='rejected'&&!reason.trim())throw Error('Isi alasan penolakan.');
 payment.status=status as Payment['status'];payment.reason=reason.trim();registration.payment_status=status;
 if(status==='verified'){registration.status='diterima';registration.expires_at=null;state.history.unshift({id:Date.now(),registration_id:registration.id,old_status:'pending',new_status:'diterima',reason,created_at:new Date().toISOString()});}
 const team=state.teams.find(team=>team.id===payment.team_id);if(team){team.payment_status=status;if(status==='verified')team.expires_at=null;}audit(state,id,'Memverifikasi pembayaran: '+status);
}
export function synchronizeSchedule(state:DemoState){
 state.events=state.events.map(event=>withEventSchedule(event,state.publications));
 state.drafts=state.drafts.map(event=>withEventSchedule(event,state.publications));
}
