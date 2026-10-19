'use client';
import {useState,useTransition} from 'react';

import {saveTeamMembers} from '@/app/platform-actions';
import type {Team,ActionResult} from '@/lib/types';
export function TeamRosterEditor({team,preview=false}:{team:Team;preview?:boolean}){
 const [feedback,setFeedback]=useState<ActionResult|null>(null),[pending,startTransition]=useTransition();
 if(!team.member_names?.length)return null;
 return <details className="roster-editor"><summary>Perbaiki nama anggota</summary><form className="form-stack" onSubmit={event=>{event.preventDefault();if(preview)return;const form=new FormData(event.currentTarget);startTransition(async()=>{try{const result=await saveTeamMembers(form);setFeedback(result);}catch{setFeedback({ok:false,message:'Nama anggota belum tersimpan.'});}});}}><input type="hidden" name="team_id" value={team.id}/><label>Ketua tim<input readOnly value={team.member_names[0]}/></label>{team.member_names.slice(1).map((name,index)=><label key={index}>Nama anggota {index+2}<input name="member_names" defaultValue={name} required minLength={2} maxLength={100}/></label>)}{feedback&&<p className={'feedback '+(feedback.ok?'success':'error')} role={feedback.ok?'status':'alert'}>{feedback.message}</p>}<button className="button secondary small" disabled={pending||preview}>{pending?'Menyimpan...':'Simpan nama anggota'}</button></form></details>;
}
