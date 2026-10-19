import {Suspense} from 'react';
import {DemoApp} from '@/components/demo-app';
export const dynamicParams=false;
export function generateStaticParams(){
 const paths=['','masuk','daftar','lupa-password','reset-password','kompetisi','kompetisi/detail','kompetisi/web-design','kompetisi/capture-the-flag','kompetisi/karya-tulis-ilmiah','message','past-events'];
 for(const root of ['dashboard','admin','panitia'])for(const section of ['', 'event','pendaftaran','tim','pembayaran','akun',...(root==='dashboard'?[]:['event/new','event/edit','konten','pengaturan','inbox','media','preview']),...(root==='admin'?['panitia','audit']:[])])paths.push(root+(section?'/'+section:''));
 return paths.map(path=>({path:path?path.split('/'):[]}));
}
export default function Page(){return <Suspense fallback={<main className="page-wrap"><p>Memuat demo…</p></main>}><DemoApp/></Suspense>;}
