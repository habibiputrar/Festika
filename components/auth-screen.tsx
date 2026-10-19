import Image from 'next/image';
import Link from './motion-link';

import {Brand} from '@/components/brand';
import {AuthForm} from '@/components/auth-form';
import {Icon} from '@/components/icon';
import {ThemeSelect} from '@/components/theme';
import {assetPath} from '@/lib/demo/paths';

const titles:Record<string,[string,string]>={login:['Selamat datang kembali','Masuk untuk menemukan event dan mengelola pendaftaranmu.'],register:['Mulai perjalananmu','Buat akun dan ambil bagian dalam Festival Informatika.'],'forgot-password':['Lupa password?','Masukkan email akunmu. Tautan reset simulasi akan ditampilkan di halaman ini.'],'reset-password':['Buat password baru','Gunakan password yang kuat untuk menjaga keamanan akunmu.']};
export function AuthScreen({mode,error,next}:{mode:string;error?:string;next?:string}){
 const logo=assetPath('/branding/Logo_Festika-04.webp');
 return <main className="auth-page" id="main-content"><header className="auth-top"><Brand logo={logo}/><span className="edition">UNIVERSITAS ANDALAS · FESTIKA 2026</span><ThemeSelect/></header><nav className="auth-return" aria-label="Kembali ke website"><Link className="button secondary detail-back" href="/"><Icon name="arrow" size={17}/>Kembali ke beranda</Link></nav><div className="auth-layout"><section className="auth-story"><span className="eyebrow">SATU FESTIVAL, BANYAK PELUANG</span><div className="auth-logo-stage"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><Image src={logo||'/branding/Logo_Festika-04.webp'} unoptimized alt="Logo Festival Informatika" width={180} height={180} priority/></div><h1>Temukan potensimu.<br/><span>Wujudkan karyamu.</span></h1><p>Ruang untuk belajar, berkompetisi, dan bertumbuh bersama di Festival Informatika.</p><div className="story-tags"><span>Kompetisi</span><span>Workshop</span><span>Kolaborasi</span></div><div className="story-bottom"><Icon name="location" size={17}/><span>Universitas Andalas, Padang</span></div></section><section className="auth-panel"><div className="auth-panel-content"><span className="eyebrow teal">AKUN FESTIKA</span><h2>{titles[mode][0]}</h2><p className="subtitle">{titles[mode][1]}</p>{error&&<p className="feedback error" role="alert">Tautan konfirmasi tidak valid atau sudah kedaluwarsa. Silakan coba lagi.</p>}<AuthForm mode={mode} next={next} preview={false}/><div className="auth-security"><Icon name="shield" size={16}/>Akunmu, ruang kolaborasimu.</div></div></section></div><footer className="auth-footer">© 2026 FESTIKA · Festival Informatika Universitas Andalas</footer></main>;
}
