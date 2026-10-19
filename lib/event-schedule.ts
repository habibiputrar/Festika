import type {Publication} from './content-model';
import type {FestikaEvent} from './types';

export function scheduleRole(item:Publication):'registration'|'event'|'other'{
 const role=item.payload.schedule_role;
 if(role==='registration'||role==='event'||role==='other')return role;
 if(/-pendaftaran$/.test(item.slug)||item.title.trim().toLowerCase()==='pendaftaran')return 'registration';
 if(/-final$/.test(item.slug)||/^final(?:\s|$)/i.test(item.title.trim())||/^semi-final dan grand-final$/i.test(item.title.trim()))return 'event';
 return 'other';
}
export function withEventSchedule(event:FestikaEvent,content:Publication[]):FestikaEvent{
 const schedule=content.filter(item=>item.kind==='timeline'&&item.event_id===event.id).toSorted((a,b)=>a.sort_order-b.sort_order||a.id.localeCompare(b.id));
 const roles=schedule.map(item=>({item,role:scheduleRole(item)}));
 const registration=roles.filter(row=>row.role==='registration'),activity=roles.filter(row=>row.role==='event');
 // Ambiguous or invalid schedules must never silently pick a new registration period.
 if(registration.length>1||activity.length>1)throw Error('Ada lebih dari satu jadwal utama pada '+event.nama_event+'. Periksa Timeline.');
 const date=(value:unknown)=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value?value:null;
 const period=registration[0]?.item.payload,start=date(period?.start),end=date(period?.end)||start;
 const day=date(activity[0]?.item.payload.start);
 if(registration.length&&(!start||!end||end<start)||activity.length&&!day)throw Error('Jadwal '+event.nama_event+' tidak valid. Periksa Timeline.');
 return {...event,schedule,schedule_managed:{date:!!day,registration:!!start&&!!end},
  ...(day?{tanggal:day}:{}),
  ...(start&&end?{registration_start:start+'T00:00:00+07:00',registration_end:end+'T23:59:59+07:00'}:{})};
}
