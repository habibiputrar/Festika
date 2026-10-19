'use client';
import {seedState} from './seed';
import {expire,type DemoState} from './model';
export const DATA_KEY='festika-demo:data:v1',SESSION_KEY='festika-demo:session:v1',CHANGE_EVENT='festika-demo:change';
export const MAX_STORAGE_BYTES=4_000_000;
const notice=()=>window.dispatchEvent(new Event(CHANGE_EVENT));
export function currentId(){return sessionStorage.getItem(SESSION_KEY);}
export function setSession(id:string|null){if(id)sessionStorage.setItem(SESSION_KEY,id);else sessionStorage.removeItem(SESSION_KEY);notice();}
export function readState():DemoState{
 const saved=localStorage.getItem(DATA_KEY);
 if(saved){try{const state=JSON.parse(saved);if(state.version!==1||!Array.isArray(state.accounts)||!Array.isArray(state.events)||!Array.isArray(state.publications))throw Error();return state;}catch{throw Error('Data demo tidak dapat dibaca. Gunakan Reset demo untuk memulai ulang.');}}
 const seed=seedState();localStorage.setItem(DATA_KEY,JSON.stringify(seed));return seed;
}
export async function transact<T>(operation:(state:DemoState,id:string|null)=>T):Promise<T>{
 const perform=()=>{
  const state=structuredClone(readState());expire(state);const result=operation(state,currentId());
  const serialized=JSON.stringify(state);if(new Blob([serialized]).size>MAX_STORAGE_BYTES)throw Error('Penyimpanan demo penuh. Hapus file yang tidak dipakai atau reset demo.');
  try{localStorage.setItem(DATA_KEY,serialized);}catch{throw Error('Browser tidak dapat menyimpan data demo. Periksa izin penyimpanan atau kurangi file unggahan.');}
  notice();return result;
 };
 return navigator.locks? navigator.locks.request('festika-demo:write',perform):perform();
}
export function resetDemo(){const serialized=JSON.stringify(seedState());localStorage.setItem(DATA_KEY,serialized);sessionStorage.removeItem(SESSION_KEY);notice();}
export function subscribe(listener:()=>void){window.addEventListener(CHANGE_EVENT,listener);window.addEventListener('storage',listener);return()=>{window.removeEventListener(CHANGE_EVENT,listener);window.removeEventListener('storage',listener);};}
export function getSnapshot(){try{return JSON.stringify([localStorage.getItem(DATA_KEY),sessionStorage.getItem(SESSION_KEY)]);}catch{return '["storage-unavailable",null]';}}
export function initializeStore(){try{readState();}finally{notice();}}
export async function readUpload(file:FormDataEntryValue|null,purpose:'receipt'|'media'){
 if(!(file instanceof File)||!file.size)throw Error('Pilih file terlebih dahulu.');
 if(file.size>350_000)throw Error('Batas file demo 350 KB agar penyimpanan browser tetap ringan.');
 const bytes=new Uint8Array(await file.arrayBuffer());
 const pdf=bytes[0]===37&&bytes[1]===80&&bytes[2]===68&&bytes[3]===70;
 const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71&&bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10;
 const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 const webp=String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 const type=pdf?'application/pdf':png?'image/png':jpeg?'image/jpeg':webp&&purpose==='media'?'image/webp':null;
 if(!type||file.type!==type)throw Error('Format file tidak sesuai. Gunakan JPG, PNG, PDF, atau WebP untuk Media.');
 const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('File gagal dibaca.'));reader.readAsDataURL(file);});
 return {data,type,name:file.name,size:file.size};
}
const objectUrls=new Map<string,{data:string;url:string}>();
export function localFileUrl(data:string){
 if(!data.startsWith('data:'))return data;
 const cached=objectUrls.get(data);if(cached)return cached.url;
 const [header,encoded]=data.split(','),binary=atob(encoded),bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
 const url=URL.createObjectURL(new Blob([bytes],{type:header.slice(5,header.indexOf(';'))}));objectUrls.set(data,{data,url});return url;
}
export function clearFileUrls(){for(const entry of objectUrls.values())URL.revokeObjectURL(entry.url);objectUrls.clear();}
