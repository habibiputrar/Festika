import {z} from 'zod';
export const kinds=['identity','hero','about','timeline','sponsor','committee','past_event','gallery','faq','contact','footer','navigation','guidebook'] as const;
export type ContentKind=typeof kinds[number];
export interface CmsEntry {id:string;kind:ContentKind;title:string;slug:string;parent_id:string|null;event_id:number|null;sort_order:number;visible:boolean;draft_data:Record<string,unknown>;updated_at:string}
export interface Publication {id:string;kind:ContentKind;title:string;slug:string;parent_id:string|null;event_id:number|null;sort_order:number;payload:Record<string,unknown>;published_at:string}
export interface MediaAsset {id:string;object_path:string;mime_type:string;bytes:number;alt:string;original_name:string;purpose:string;pending_delete:boolean;created_at:string}
export interface ContactMessage {id:string;nama:string;email:string;subject:string;message:string;status:'baru'|'dibaca'|'ditangani'|'diarsipkan';created_at:string}
export interface ContentField {key:string;label:string;type?:'textarea'|'number'|'url'|'datetime-local'|'date'|'image'|'file'|'select';options?:{value:string;label:string}[];required?:boolean;hint?:string}
export const contentConfig:Record<ContentKind,{label:string;singleton?:boolean;fields:ContentField[]}>= {
 identity:{label:'Identitas website',singleton:true,fields:[{key:'name',label:'Nama acara',required:true},{key:'year',label:'Tahun',type:'number',required:true},{key:'tagline',label:'Tagline'},{key:'logo',label:'Logo utama',type:'image'}]},
 hero:{label:'Beranda',singleton:true,fields:[{key:'eyebrow',label:'Label kecil'},{key:'title',label:'Judul',required:true},{key:'lead',label:'Kalimat pendukung'},{key:'theme',label:'Tema resmi',hint:'Biarkan kosong sampai tema telah dikonfirmasi.'},{key:'description',label:'Deskripsi singkat',type:'textarea',required:true},{key:'image',label:'Visual utama',type:'image'}]},
 about:{label:'Tentang FESTIKA',singleton:true,fields:[{key:'text',label:'Pengenalan',type:'textarea',required:true}]},
 timeline:{label:'Timeline',fields:[{key:'schedule_role',label:'Kegunaan jadwal',type:'select',options:[{value:'',label:'Otomatis dari nama tahapan'},{value:'registration',label:'Periode pendaftaran'},{value:'event',label:'Hari pelaksanaan / final'},{value:'other',label:'Tahapan lain'}],hint:'Periode pendaftaran dan hari pelaksanaan juga dipakai di dashboard. Pilih satu jadwal untuk masing-masing kegunaan dalam satu kompetisi.'},{key:'start',label:'Waktu mulai',type:'date',required:true},{key:'end',label:'Waktu selesai',type:'date'},{key:'description',label:'Keterangan',type:'textarea'}]},
 sponsor:{label:'Sponsor & media partner',fields:[{key:'category',label:'Kategori sponsor/partner',required:true},{key:'image',label:'Logo',type:'image',required:true},{key:'url',label:'Tautan',type:'url'}]},
 committee:{label:'Panitia',fields:[{key:'position',label:'Jabatan',required:true},{key:'division',label:'Divisi'},{key:'image',label:'Foto',type:'image'},{key:'url',label:'Media sosial',type:'url'}]},
 past_event:{label:'Past Events',fields:[{key:'year',label:'Tahun kegiatan',type:'number',required:true},{key:'description',label:'Deskripsi',type:'textarea',required:true},{key:'image',label:'Foto sampul',type:'image',required:true},{key:'image_alt',label:'Deskripsi foto sampul'},{key:'image_category',label:'Kategori foto sampul'},{key:'url',label:'Dokumentasi lengkap / Drive',type:'url'}]},
 gallery:{label:'Foto galeri',fields:[{key:'category',label:'Kategori kegiatan',required:true},{key:'image',label:'Foto',type:'image',required:true},{key:'alt',label:'Alt text',required:true},{key:'caption',label:'Caption'}]},
 faq:{label:'FAQ',fields:[{key:'answer',label:'Jawaban',type:'textarea',required:true}]},
 contact:{label:'Kontak & WhatsApp',singleton:true,fields:[{key:'name',label:'Nama kontak',required:true},{key:'phone',label:'Nomor WhatsApp',required:true},{key:'button',label:'Label tombol'},{key:'message',label:'Pesan awal WhatsApp',type:'textarea'},{key:'email',label:'Email kontak'},{key:'address',label:'Alamat',type:'textarea',required:true},{key:'maps',label:'Tautan Google Maps',type:'url'},{key:'socials',label:'Media sosial resmi',type:'textarea',hint:'Satu akun per baris: Nama | https://alamat. Jangan gunakan akun pembuat sebagai akun acara.'}]},
 footer:{label:'Footer',singleton:true,fields:[{key:'year',label:'Tahun copyright',type:'number',required:true},{key:'address',label:'Alamat footer',type:'textarea'},{key:'logo_hmif',label:'Logo HMIF',type:'image'},{key:'logo_hmif_label',label:'Nama di bawah logo HMIF'},{key:'logo_fti',label:'Logo BEMKM FTI',type:'image'},{key:'logo_fti_label',label:'Nama di bawah logo BEMKM FTI'},{key:'logo_unand',label:'Logo Universitas Andalas',type:'image'},{key:'logo_unand_label',label:'Nama di bawah logo Universitas Andalas'},{key:'sponsor_heading',label:'Judul area sponsor footer'},{key:'sponsor_logo',label:'Logo sponsor footer',type:'image'},{key:'sponsor_text',label:'Teks sponsor footer',type:'textarea'},{key:'credit_heading',label:'Judul kredit pembuat'},{key:'credit_label',label:'Nama pembuat'},{key:'credit_url',label:'Tautan kredit pembuat',type:'url'}]},
 navigation:{label:'Navigasi tambahan',fields:[{key:'target',label:'Bagian tujuan',required:true,hint:'tentang, kompetisi, timeline, sponsor, panitia, past-events, faq, atau message'}]},
 guidebook:{label:'Buku panduan',fields:[{key:'file',label:'PDF atau URL panduan',type:'file',required:true},{key:'description',label:'Keterangan',type:'textarea'}]},
};
export const credit={label:'Website & UI/UX: Habibi Putra Rizqullah',url:'https://www.instagram.com/hxputra_/'};
export const address='Fakultas Teknologi Informasi, Universitas Andalas, Kampus Limau Manis, Kota Padang, Sumatera Barat, Indonesia.';
export function text(payload:Record<string,unknown>,key:string,fallback=''){return typeof payload[key]==='string'?payload[key] as string:typeof payload[key]==='number'?String(payload[key]):fallback;}
export function safeUrl(value:unknown,relative=true){if(typeof value!=='string'||!value)return '';if(typeof window!=='undefined'&&value.startsWith('blob:'+window.location.origin+'/'))return value;try{const url=new URL(value,'https://festika.invalid');if(!['http:','https:'].includes(url.protocol)||url.username||url.password)return '';if(value.startsWith('/')&&!value.startsWith('//')&&relative)return value;if(/^https?:\/\//.test(value))return url.href;}catch{}return '';}
export function validateContent(kind:ContentKind,payload:Record<string,unknown>){
 const clean:Record<string,unknown>={};
 for(const field of contentConfig[kind].fields){
  const value=payload[field.key];
  if(field.required&&(value==null||String(value).trim()===''))throw Error(field.label+' wajib diisi.');
  if(value==null||String(value).trim()===''){clean[field.key]='';continue;}
  if(field.type==='select'&&!field.options?.some(option=>option.value===value))throw Error(field.label+' tidak valid.');
  if(field.type==='number'){clean[field.key]=z.coerce.number().int().min(1900).max(2200).parse(value);}
  else if(field.type==='date'){clean[field.key]=z.iso.date().parse(value);}
  else if(['url','image','file'].includes(field.type||'')){const url=safeUrl(value);if(!url)throw Error(field.label+' harus berupa URL HTTP/HTTPS atau path media yang valid.');if(field.type==='image'&&!url.startsWith('/media/')&&!url.startsWith('/branding/'))throw Error('Gunakan media website atau aset branding lokal.');clean[field.key]=url;}
  else {clean[field.key]=z.string().trim().max(field.type==='textarea'?10000:1000).parse(value);}
 }
 if(kind==='contact'){
  if(!/^\+?[0-9 ()-]{8,24}$/.test(String(clean.phone)))throw Error('Nomor WhatsApp tidak valid.');
  if(clean.email&&!z.email().safeParse(clean.email).success)throw Error('Email kontak tidak valid.');
  for(const line of String(clean.socials||'').split('\n').filter(Boolean)){const [label,url]=line.split('|').map(s=>s.trim());if(!label||!safeUrl(url,false))throw Error('Format media sosial: Nama | https://alamat');}
 }
 if(kind==='timeline'){const start=Date.parse(String(clean.start)),end=clean.end?Date.parse(String(clean.end)):null;if(!Number.isFinite(start)||(end!==null&&(!Number.isFinite(end)||end<start)))throw Error('Periode timeline tidak valid.');}
 if(kind==='navigation'&&!['tentang','kompetisi','timeline','sponsor','panitia','past-events','faq','message'].includes(String(clean.target)))throw Error('Bagian navigasi tidak valid.');
 return clean;
}
