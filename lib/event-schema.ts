import {z} from 'zod';
import {safeUrl} from './content-model';
const nullableInteger=(min:number,max:number)=>z.preprocess(v=>v===''||v==null?null:v,z.coerce.number().int().min(min).max(max).nullable());
const nullableDate=z.preprocess(v=>v===''||v==null?null:v,z.iso.date().nullable());
const nullableTime=z.preprocess(v=>v===''||v==null?null:v,z.string().refine(v=>Number.isFinite(Date.parse(v)),'Waktu tidak valid.').nullable());
const asset=z.string().default('').refine(v=>!v||v.startsWith('/media/')||v.startsWith('/branding/'),'Gunakan aset Media atau branding lokal.');
export function normalizePaymentFormUrl(value:string){const trimmed=value.trim();return /^(forms\.gle\/|docs\.google\.com\/forms\/)/i.test(trimmed)?'https://'+trimmed:trimmed;}
export const fullEventSchema=z.object({
 team_entry_mode:z.enum(['names','accounts']).default('names'),payment_form_url:z.string().max(2000).default('').transform(normalizePaymentFormUrl).refine(value=>{if(!value)return true;try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&((url.hostname==='forms.gle'&&url.pathname.length>1)||url.hostname==='docs.google.com'&&url.pathname.startsWith('/forms/'));}catch{return false;}},'Gunakan tautan Google Forms yang valid, misalnya forms.gle/kode atau https://docs.google.com/forms/...'),
 theme:z.string().trim().max(300).default(''),prizes:z.array(z.string().max(300)).max(20).default([]),stages:z.array(z.string().max(500)).max(30).default([]),
 nama_event:z.string().trim().min(3).max(150),slug:z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/,'Slug memakai huruf kecil, angka, dan tanda hubung.'),deskripsi:z.string().trim().max(1000).default(''),details:z.string().trim().max(20000).default(''),
 tanggal:nullableDate,lokasi:z.string().trim().max(200).default(''),kuota:nullableInteger(1,100000),status:z.enum(['upcoming','ongoing','selesai']),tipe:z.preprocess(v=>v===''||v==null?null:v,z.enum(['individu','tim']).nullable()),
 maks_tim:nullableInteger(1,10000),anggota_tim:nullableInteger(2,100),min_anggota:nullableInteger(1,100),
 registration_state:z.enum(['open','closed','paused']),registration_start:nullableTime,registration_end:nullableTime,payment_basis:z.enum(['free','participant','team','unconfirmed']),fee_amount:nullableInteger(0,100000000),payment_instructions:z.string().trim().max(5000).default(''),
 format:z.enum(['online','offline','hybrid','unconfirmed']),poster:asset,guidebook:z.string().default('').refine(v=>!v||!!safeUrl(v),'Tautan panduan tidak valid.'),contact:z.string().trim().max(500).default(''),requirements:z.array(z.string().trim().max(1000)).max(50),media_ids:z.array(z.uuid()).max(10),
}).superRefine((event,ctx)=>{
 const problem=(message:string)=>ctx.addIssue({code:'custom',message});
 if(event.registration_start&&event.registration_end&&Date.parse(event.registration_start)>=Date.parse(event.registration_end))problem('Waktu penutupan harus setelah pembukaan.');
 if(event.tipe==='tim'&&(!event.maks_tim||!event.anggota_tim||!event.min_anggota||event.min_anggota>event.anggota_tim))problem('Lengkapi kapasitas tim dan anggota minimum/maksimum.');
 if(event.payment_basis==='free'&&event.fee_amount!==0)problem('Event gratis harus memiliki biaya 0.');
 if(event.payment_basis==='team'&&event.tipe!=='tim')problem('Biaya per tim hanya untuk event beregu.');

});
export function eventFormData(form:FormData){const values=Object.fromEntries(form);const event=fullEventSchema.parse({...values,prizes:String(form.get('prizes')||'').split('\n').map(s=>s.trim()).filter(Boolean),stages:String(form.get('stages')||'').split('\n').map(s=>s.trim()).filter(Boolean),requirements:String(form.get('requirements')||'').split('\n').map(s=>s.trim()).filter(Boolean),media_ids:[...new Set([form.get('poster'),form.get('guidebook')].map(v=>String(v||'').match(/^\/media\/([0-9a-f-]{36})$/)?.[1]).filter((v):v is string=>!!v))]});if(form.get('intent')==='publish'&&event.registration_state==='open'){const missing=[!event.registration_start&&'waktu pembukaan',!event.registration_end&&'waktu penutupan',!event.kuota&&'kuota peserta',!event.tipe&&'jenis peserta',event.payment_basis==='unconfirmed'&&'dasar biaya',event.payment_basis!=='free'&&!event.fee_amount&&'nominal biaya',event.payment_basis!=='free'&&!event.payment_instructions&&'instruksi pembayaran'].filter(Boolean);if(missing.length)throw Error('Pendaftaran belum bisa dibuka. Lengkapi '+missing.join(', ')+'. Untuk menyimpan perubahan tanpa membuka pendaftaran, pilih status Ditutup atau Simpan Draft.');}return event;}
