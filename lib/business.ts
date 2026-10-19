import type {FestikaEvent,Registration} from './types';
export function registrationOpen(event:FestikaEvent,now=Date.now()){
 return event.is_published===true&&!event.archived&&event.registration_state==='open'&&event.status!=='selesai'&&!!event.registration_start&&!!event.registration_end&&Date.parse(event.registration_start)<=now&&Date.parse(event.registration_end)>=now&&!!event.tipe&&event.payment_basis!=='unconfirmed'&&event.payment_basis!=null&&event.kuota!=null&&(event.remaining==null||event.remaining>0);
}
export function activeRegistration(reg:Registration,now=Date.now()){return reg.status==='diterima'||reg.status==='pending'&&!!reg.expires_at&&Date.parse(reg.expires_at)>now;}
export function eventPrice(event:FestikaEvent){return event.payment_basis==='free'?'Gratis':event.fee_amount!=null&&event.payment_basis!=='unconfirmed'?new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(event.fee_amount)+(event.payment_basis==='team'?' / tim':' / peserta'):'Biaya akan diumumkan';}
export function localDestination(value:unknown,fallback='/dashboard'){if(typeof value!=='string'||!/^\/(kompetisi\/[a-z0-9-]+|dashboard(?:\/[a-z0-9/-]+)?)$/.test(value))return fallback;return value;}
