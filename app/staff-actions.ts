'use client';
import {z} from 'zod';
import {action} from './actions';
import {requireAdmin,audit} from '@/lib/demo/model';
import {permissionOptions,type Permission} from '@/lib/permissions';
import {accountPasswordSchema} from '@/lib/account-security';
export async function saveStaffAccount(form:FormData){return action((state,user)=>{
 requireAdmin(state,user);const permissions=[...new Set(form.getAll('permissions').map(String))];
 if(permissions.some(permission=>!permissionOptions.some(option=>option.key===permission)))throw Error('Hak akses tidak valid.');
 const enabled=form.get('enabled')==='on';
 if(form.get('id')){const account=state.accounts.find(item=>item.id===form.get('id')&&item.role==='panitia');if(!account)throw Error('Akun panitia tidak ditemukan.');account.permissions=permissions as Permission[];account.enabled=enabled;}
 else{
  const nama=z.string().trim().min(2).max(100).parse(form.get('nama')),email=z.email().parse(String(form.get('email')).toLowerCase()),password=accountPasswordSchema.parse(form.get('password'));
  if(password!==form.get('password2'))throw Error('Konfirmasi password belum sama.');if(state.accounts.some(item=>item.email===email))throw Error('Email sudah digunakan.');
  state.accounts.push({id:crypto.randomUUID(),nama,email,password,role:'panitia',permissions:permissions as Permission[],enabled});
 }audit(state,user,'Mengatur akun dan akses panitia demo');
},'Akun dan izin panitia demo tersimpan.');}
