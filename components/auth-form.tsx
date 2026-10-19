'use client';
import {useActionState,useState} from 'react';
import Link from 'next/link';
import {authAction} from '@/app/actions';
import {Icon} from './icon';
const initial:{ok:boolean;message:string;resetUrl?:string}={ok:false,message:''};
export function AuthForm({mode,preview,next}:{mode:string;preview:boolean;next?:string}){
 const [state,action,pending]=useActionState(authAction,initial),[visible,setVisible]=useState(false);
 const register=mode==='register',reset=mode==='reset-password',forgot=mode==='forgot-password';
 return <>
  {preview&&<div className="notice"><Icon name="eye"/><div><strong>Pratinjau lokal</strong><p>Desain bisa dilihat sekarang. Login dan penyimpanan data aktif setelah Supabase dihubungkan.</p></div></div>}
  <form action={action} className="form-stack">
   <input type="hidden" name="mode" value={mode}/><input type="hidden" name="next" value={next||''}/>
   {register&&<label>Nama lengkap<input name="nama" autoComplete="name" placeholder="Nama lengkap kamu" required maxLength={100}/></label>}
   {!reset&&<label>Alamat email<input name="email" type="email" autoComplete="email" placeholder="nama@email.com" required/></label>}
   {!forgot&&<label><span className="label-line">Password{mode==='login'&&<Link href="/lupa-password">Lupa password?</Link>}</span><span className="password-input"><input name="password" type={visible?'text':'password'} autoComplete={mode==='login'?'current-password':'new-password'} minLength={register||reset?8:1} placeholder={register||reset?'Minimal 8 karakter':'Masukkan password'} required/><button type="button" className="icon-button" onClick={()=>setVisible(!visible)} aria-label={visible?'Sembunyikan password':'Tampilkan password'} aria-pressed={visible}><Icon name="eye"/></button></span></label>}
   {(register||reset)&&<><label>Konfirmasi password<input name="password2" type={visible?'text':'password'} autoComplete="new-password" placeholder="Ulangi password" minLength={8} required/></label><p className="field-hint">Gunakan huruf besar, huruf kecil, dan angka.</p></>}
   {state.resetUrl&&<Link className="button secondary" href={state.resetUrl}>Buka tautan reset simulasi</Link>}{state.message&&<p className={'feedback '+(state.ok?'success':'error')} role={state.ok?'status':'alert'}>{state.message}</p>}
   <button className="button primary full" disabled={pending||preview}>{pending?'Memproses…':register?'Buat akun':reset?'Simpan password':forgot?'Kirim tautan reset':'Masuk ke akun'}<Icon name="arrow" size={18}/></button>
  </form>
  <p className="auth-switch">{register?<>Sudah punya akun? <Link href="/masuk">Masuk sekarang</Link></>:forgot||reset?<Link href="/masuk">Kembali ke login</Link>:<>Belum punya akun? <Link href="/daftar">Daftar sekarang</Link></>}</p>
  {preview&&<div className="preview-links"><Link href="/demo/user/dashboard" className="button secondary">Preview peserta <Icon name="arrow" size={16}/></Link><Link href="/demo/admin/dashboard" className="text-link">Preview admin</Link></div>}
 </>;
}
