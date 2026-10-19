'use client';
import {useEffect,useSyncExternalStore} from 'react';
import Link from 'next/link';
import {usePathname,useRouter,useSearchParams} from 'next/navigation';
import {PublicHome,PublicFrame,CompetitionCard} from './public-site';
import {CompetitionDetail} from './competition-detail';
import {FlashbackSection} from './flashback-section';
import {MessageForm} from './public-widgets';
import {AuthScreen} from './auth-screen';
import {Portal} from './portal';
import {DashboardFrame} from './dashboard-frame';
import {RegistrationWorkspace} from './registration-workspace';
import {AccountWorkspace} from './account-workspace';
import {CmsWorkspace} from './cms-workspace';
import {InboxWorkspace} from './inbox-workspace';
import {MediaWorkspace} from './media-workspace';
import {StaffWorkspace} from './staff-workspace';
import {DEMO_ACCOUNTS,DEMO_PASSWORD,publicEvents,expire,type DemoState} from '@/lib/demo/model';
import {subscribe,getSnapshot,initializeStore,resetDemo,setSession,localFileUrl,clearFileUrls} from '@/lib/demo/store';
import {canAccess,portalRoot,sectionPermission,contentPermission,permissionOptions} from '@/lib/permissions';
import {kinds,type Publication} from '@/lib/content-model';
import {withEventSchedule} from '@/lib/event-schedule';
import type {PortalData,Profile,Role} from '@/lib/types';
import {navigate} from '@/lib/demo/navigation';
import {assetPath} from '@/lib/demo/paths';

function DemoBar(){return <aside className="demo-bar" aria-label="Informasi demo"><span><strong>DEMO</strong> Data tersimpan di browser ini. Gunakan data contoh.</span><nav><Link href="/masuk">Akun demo</Link><button type="button" onClick={()=>{if(confirm('Reset seluruh akun, konten, pendaftaran, dan file demo di browser ini?')){clearFileUrls();resetDemo();navigate('/');}}}>Reset demo</button></nav></aside>;}
function AccountList(){const router=useRouter();return <section className="demo-accounts"><h2>Akun demo</h2><p>Password semua akun: <code>{DEMO_PASSWORD}</code></p><p className="field-hint">Gunakan password contoh. Identitas dan password demo tersimpan di browser, bukan di server.</p><div>{DEMO_ACCOUNTS.map(account=><button className="button secondary" key={account.id} onClick={()=>{setSession(account.id);router.push(portalRoot(account.role));}}><strong>{account.role==='user'?'Peserta':account.role==='admin'?'Admin':'Panitia'}</strong><small>{account.email}</small></button>)}</div><p className="field-hint">Jika akun diubah atau dinonaktifkan saat mencoba fitur, gunakan Reset demo untuk mengembalikan akun bawaan.</p></section>;}
function resolveFiles(state:DemoState,content:Publication[]){return content.map(item=>({...item,payload:Object.fromEntries(Object.entries(item.payload).map(([key,value])=>[key,typeof value==='string'&&state.files[value]?localFileUrl(state.files[value]):typeof value==='string'?assetPath(value):value]))}));}
function portalData(state:DemoState,profile:Profile,section:string,query:Record<string,string>):PortalData{
 const staff=profile.role!=='user',page=Math.max(1,Number(query.page)||1),events=(staff?state.drafts.filter(event=>!event.archived).map(event=>({...withEventSchedule(event,state.publications),is_published:state.events.find(item=>item.id===event.id)?.is_published})):publicEvents(state));
 let registrations=state.registrations.filter(row=>staff||row.user_id===profile.id).map(row=>({...row,profiles:state.accounts.find(account=>account.id===row.user_id),receipt_url:row.bukti_pembayaran?localFileUrl(row.bukti_pembayaran):undefined}));
 if(section==='pendaftaran'&&query.status)registrations=registrations.filter(row=>row.status===query.status);
 if(query.q)registrations=registrations.filter(row=>events.find(event=>event.id===row.event_id)?.nama_event.toLowerCase().includes(query.q.toLowerCase()));
 let payments=state.payments.filter(payment=>staff||payment.submitted_by===profile.id).map(payment=>({...payment,receipt_url:payment.receipt_url?localFileUrl(payment.receipt_url):undefined}));
 if(section==='pembayaran'&&query.status)payments=payments.filter(payment=>payment.status===query.status);
 const teams=state.teams.filter(team=>!team.archived&&(staff||team.ketua_id===profile.id));
 return {profile,preview:false,automaticRegistration:true,events,registrations:section==='pendaftaran'?registrations.slice((page-1)*25,page*25):registrations,teams:teams.slice((page-1)*25,page*25),payments:payments.slice((page-1)*25,page*25),profiles:state.accounts.map(({id,nama,email,role,permissions})=>({id,nama,email,role,permissions})),history:state.history.filter(item=>registrations.some(row=>row.id===item.registration_id)),total:registrations.length,page,media:state.media.map(item=>({...item,object_path:localFileUrl(state.files[item.object_path]||item.object_path)})),brandingLogo:assetPath('/branding/Logo_Festika-04.webp'),totals:{events:events.length,registrations:registrations.length,accepted:registrations.filter(row=>row.status==='diterima').length,ongoing:events.filter(event=>event.status==='ongoing').length}};
}
export function DemoApp(){
 const snapshot=useSyncExternalStore(subscribe,getSnapshot,()=>null),path=usePathname().replace(/\/$/,'')||'/',search=useSearchParams(),router=useRouter();
 useEffect(()=>{try{initializeStore();}catch{/* The reader below offers the reset control. */}},[]);
 useEffect(()=>{const handler=(event:Event)=>router.push((event as CustomEvent<string>).detail);window.addEventListener('festika-demo:navigate',handler);return()=>window.removeEventListener('festika-demo:navigate',handler);},[router]);
 if(!snapshot)return <><DemoBar/><main id="main-content" className="page-wrap"><h1>Memuat demo FESTIKA…</h1><p>Aktifkan JavaScript dan penyimpanan browser untuk mencoba fitur.</p></main></>;
 let parsed:{state:DemoState;session:string|null}|null=null,empty=false;
 try{const [saved,id]=JSON.parse(snapshot);if(!saved)empty=true;else{const value=JSON.parse(saved);if(value.version!==1||!['accounts','events','drafts','publications','entries','registrations','teams','payments','messages','media','audit','history','recoveries'].every(key=>Array.isArray(value[key])))throw Error();expire(value);parsed={state:value,session:id};}}catch{/* Render recovery controls below; no JSX is created inside this guard. */}
 if(empty)return <><DemoBar/><main className="page-wrap"><p>Menyiapkan data contoh…</p></main></>;
 if(!parsed)return <><DemoBar/><main className="page-wrap"><h1>Penyimpanan demo tidak tersedia</h1><p>Izinkan penyimpanan browser. Jika data lama rusak, gunakan Reset demo untuk memulai ulang.</p></main></>;
 const {state,session}=parsed;
 const account=state.accounts.find(item=>item.id===session&&item.enabled),profile:Profile|null=account?{id:account.id,nama:account.nama,email:account.email,role:account.role,permissions:account.permissions}:null;
 const events=publicEvents(state).map(event=>({...event,poster:state.files[event.poster||'']?localFileUrl(state.files[event.poster||'']):assetPath(event.poster||''),guidebook:state.files[event.guidebook||'']?localFileUrl(state.files[event.guidebook||'']):assetPath(event.guidebook||'')}));
 const content=resolveFiles(state,state.publications),authModes:Record<string,string>={'/masuk':'login','/daftar':'register','/lupa-password':'forgot-password','/reset-password':'reset-password'};
 const query=Object.fromEntries(search.entries());
 let body:React.ReactNode;
 if(authModes[path])body=<><AuthScreen mode={authModes[path]} next={query.next}/><AccountList/></>;
 else if(/^\/(dashboard|admin|panitia)(\/|$)/.test(path)){
  const [,root,...parts]=path.split('/'),role:Role=root==='admin'?'admin':root==='panitia'?'panitia':'user',section=parts.join('/')||'dashboard',permission=sectionPermission(section);
  if(!profile)body=<main id="main-content" className="page-wrap"><h1>Masuk ke akun demo</h1><p>Pilih akun untuk membuka dashboard.</p><AccountList/><Link className="button primary" href={'/masuk?next='+encodeURIComponent(path)}>Form login</Link></main>;
  else if(profile.role!==role||role!=='user'&&permission&&!canAccess(profile,permission)||['panitia','audit'].includes(section)&&role!=='admin')body=<main id="main-content" className="page-wrap"><h1>Akses modul tidak tersedia</h1><p>Menu ini mengikuti peran dan izin akun demo yang sedang dipakai.</p><Link className="button primary" href={portalRoot(profile.role)}>Kembali ke dashboard</Link><AccountList/></main>;
  else{
   const data=portalData(state,profile,section,query);
   if(section==='preview'){
    const entry=state.entries.find(item=>item.id===query.entry);
    if(!entry||!canAccess(profile,contentPermission(entry.kind)))body=<main className="page-wrap"><h1>Pratinjau tidak tersedia</h1></main>;
    else{const previewContent=[...state.publications.filter(item=>item.id!==entry.id),{...entry,payload:entry.draft_data,published_at:entry.updated_at}];body=<PublicFrame content={resolveFiles(state,previewContent)} events={events} profile={profile}><p className="public-demo-bar">Pratinjau Draft lokal. Perubahan belum dipublikasikan.</p><PublicHome content={resolveFiles(state,previewContent)} events={events.map(event=>withEventSchedule(event,previewContent))}/></PublicFrame>;}
   }
   else if(['dashboard','event','event/new','event/edit'].includes(section)&&!(role==='panitia'&&section==='dashboard'))body=<Portal key={path} role={role} data={data} section={section} editId={query.id}/>;
   else{
    let workspace:React.ReactNode;
    if(section==='dashboard')workspace=<><div className="workspace-heading"><div><h1>Dashboard Panitia</h1><p>Pilih modul sesuai tugas yang diberikan admin.</p></div></div><div className="workspace-list">{permissionOptions.filter(option=>canAccess(profile,option.key)).map(option=><Link className="workspace-card" key={option.key} href={'/panitia/'+({events:'event',registrations:'pendaftaran',teams:'tim',payments:'pembayaran',content:'konten',inbox:'inbox',media:'media',settings:'pengaturan'}[option.key])}><h2>{option.label}</h2><p>Buka modul</p></Link>)}</div></>;
    else if(['pendaftaran','tim','pembayaran'].includes(section))workspace=<RegistrationWorkspace data={data} kind={section as 'pendaftaran'|'tim'|'pembayaran'} query={query}/>;
    else if(section==='akun')workspace=<AccountWorkspace profile={profile}/>;
    else if(section==='panitia')workspace=<StaffWorkspace ready accounts={state.accounts.filter(item=>item.role==='panitia').map(item=>({...item,permissions:item.permissions||[]}))}/>;
    else if(section==='audit')workspace=<><div className="workspace-heading"><div><h1>Riwayat audit demo</h1><p>100 perubahan terakhir di browser ini.</p></div></div><div className="workspace-list">{state.audit.map(item=><article className="workspace-card" key={item.id}><h2>{item.action}</h2><p>{item.actor} · {new Date(item.created_at).toLocaleString('id-ID')}</p></article>)}{!state.audit.length&&<p>Belum ada perubahan demo.</p>}</div></>;
    else if(section==='media')workspace=<MediaWorkspace media={data.media||[]}/>;
    else if(['konten','pengaturan'].includes(section))workspace=<CmsWorkspace key={path} entries={state.entries} published={state.publications} media={state.media} parents={state.entries.filter(item=>item.kind==='past_event')} events={state.drafts} allowedKinds={kinds.filter(kind=>canAccess(profile,contentPermission(kind)))} settings={section==='pengaturan'} selectedKind={section==='pengaturan'?'identity':canAccess(profile,'settings')?'hero':'about'}/>;
    else if(section==='inbox'){
     const messages=state.messages.filter(item=>(!query.status||item.status===query.status)&&(!query.q||(item.nama+' '+item.email+' '+item.subject).toLowerCase().includes(query.q.toLowerCase()))),page=Math.max(1,Number(query.page)||1);
     workspace=<InboxWorkspace list={messages.slice((page-1)*15,page*15)} selected={messages.find(item=>item.id===query.pesan)||null} total={messages.length} page={page} query={query}/>;
    }else workspace=<h1>Halaman demo tidak ditemukan</h1>;
    body=<DashboardFrame role={role} profile={profile}><main id="main-content" className="page-wrap">{workspace}</main></DashboardFrame>;
   }
  }
 }else{
  let page:React.ReactNode;
  if(path==='/')page=<PublicHome content={content} events={events}/>;
  else if(path==='/kompetisi')page=<main id="main-content" className="public-main"><header className="public-page-heading"><span className="eyebrow">PILIH TANTANGANMU</span><h1>Kompetisi FESTIKA</h1><p>Pendaftaran pada situs ini merupakan simulasi lokal.</p></header><div className="competition-grid">{events.map(event=><CompetitionCard key={event.id} event={event}/>)}</div></main>;
  else if(path.startsWith('/kompetisi/')){const event=events.find(event=>event.slug===(query.slug||path.split('/')[2]));page=event?<CompetitionDetail event={event} timeline={content.filter(item=>item.kind==='timeline'&&item.event_id===event.id)} registrationHref={profile?.role==='user'?'/dashboard/event':'/masuk?next=/dashboard/event'}/>:<main className="public-main"><h1>Kompetisi belum dipublikasikan</h1></main>;}
  else if(path==='/past-events')page=<main id="main-content" className="public-main"><header className="public-page-heading"><span className="eyebrow">ARSIP DEMO</span><h1>Flashback FESTIKA</h1><p>Ilustrasi contoh untuk memperlihatkan susunan galeri.</p></header><FlashbackSection content={content} archivePage/></main>;
  else if(path==='/message')page=<main id="main-content" className="public-main"><header className="public-page-heading"><span className="eyebrow">MESSAGE</span><h1>Kirim pesan demo</h1><p>Pesan masuk ke Inbox lokal. Tidak ada email atau pesan ke panitia sebenarnya.</p></header><MessageForm/></main>;
  else page=<main className="public-main"><h1>Halaman tidak ditemukan</h1><Link href="/">Kembali ke beranda</Link></main>;
  body=<PublicFrame content={content} events={events} profile={profile}>{page}</PublicFrame>;
 }
 return <><DemoBar/>{body}</>;
}
