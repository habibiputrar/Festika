import {test} from 'node:test';
import assert from 'node:assert/strict';
import {load} from './load-typescript.mjs';
const model=load('lib/demo/model.ts'),{seedState}=load('lib/demo/seed.ts');
test('seed contains only sample accounts and has an open, consistent schedule',()=>{
 const state=seedState();assert.equal(state.accounts.length,3);assert.equal(model.publicEvents(state).length,3);
 for(const event of model.publicEvents(state)){assert.equal(event.registration_state,'open');assert.ok(Date.parse(event.registration_start)<Date.now());assert.ok(Date.parse(event.registration_end)>Date.now());assert.equal(event.contact,'Panitia Demo | ');assert.ok(event.schedule.length);}
 assert.equal(state.messages[0].email,'pengunjung@example.test');
});
test('team registration is complete, unique, one fee per team and respects quota',()=>{
 const state=seedState(),event=state.events.find(event=>event.tipe==='tim'),user='demo-peserta';
 assert.throws(()=>model.enroll(state,user,event.id,'Incomplete',['One']),/Lengkapi/);assert.equal(state.registrations.length,0);
 const registration=model.enroll(state,user,event.id,'Tim Aurora',['Anggota Kedua','Anggota Ketiga']);
 assert.equal(state.teams[0].member_names.length,3);assert.equal(registration.fee_snapshot,100000);assert.equal(registration.status,'pending');
 assert.throws(()=>model.enroll(state,user,event.id,'Duplicate',['Two','Three']),/sudah terdaftar/);
 state.events.find(item=>item.id===event.id).maks_tim=1;
 state.accounts.push({id:'extra-user',nama:'Extra',email:'extra@example.test',role:'user',password:'Example123!',enabled:true});
 assert.throws(()=>model.enroll(state,'extra-user',event.id,'Over quota',['Two','Three']),/kuota/);
 model.cancelRegistration(state,user,registration.id);assert.equal(model.capacity(state,state.events.find(item=>item.id===event.id)),1);
});
test('free enrollment is automatic; verified paid enrollment keeps its slot',()=>{
 const state=seedState(),free=state.events.find(event=>event.payment_basis==='free'),paid=state.events.find(event=>event.tipe==='tim');
 assert.equal(model.enroll(state,'demo-peserta',free.id,'',[]).status,'diterima');
 const reg=model.enroll(state,'demo-peserta',paid.id,'Team',['Member Two','Member Three']);
 model.submitPayment(state,'demo-peserta',reg.id,'data:application/pdf;base64,JVBERi0=');
 assert.equal(state.payments[0].amount,100000);
 assert.throws(()=>model.verifyPayment(state,'demo-panitia',state.payments[0].id,'verified',''),/akses/);
 model.verifyPayment(state,'demo-admin',state.payments[0].id,'verified','Contoh verifikasi');assert.equal(reg.status,'diterima');assert.equal(reg.expires_at,null);assert.equal(state.teams[0].payment_status,'verified');
 assert.throws(()=>model.verifyPayment(state,'demo-admin',state.payments[0].id,'rejected','After approval'),/selesai/);
});
test('expired payment slot cannot be verified and can be reused',()=>{
 const state=seedState(),event=state.events.find(event=>event.tipe==='tim'),reg=model.enroll(state,'demo-peserta',event.id,'Expired',['Two','Three']);
 model.submitPayment(state,'demo-peserta',reg.id,'data:application/pdf;base64,JVBERi0=');reg.expires_at=new Date(Date.now()-1).toISOString();
 assert.throws(()=>model.verifyPayment(state,'demo-admin',state.payments[0].id,'verified',''),/berakhir/);assert.equal(reg.status,'dibatalkan');
 assert.ok(model.enroll(state,'demo-peserta',event.id,'Replacement',['Two','Three']));
});
test('permission checks respond to revocation and suspension',()=>{
 const state=seedState();assert.throws(()=>model.actor(state,null),/Masuk/);assert.throws(()=>model.requireAdmin(state,'demo-peserta'),/khusus/);
 const committee=state.accounts.find(account=>account.role==='panitia');assert.equal(model.actor(state,committee.id,'inbox').id,committee.id);
 committee.permissions=[];assert.throws(()=>model.actor(state,committee.id,'inbox'),/akses/);committee.enabled=false;assert.throws(()=>model.actor(state,committee.id),/Masuk/);
});
test('timeline changes propagate to both drafts and public event dates',()=>{
 const state=seedState(),event=state.events[0],phase=state.publications.find(item=>item.event_id===event.id&&item.payload.schedule_role==='event');
 phase.payload.start='2030-04-24';model.synchronizeSchedule(state);assert.equal(state.events[0].tanggal,'2030-04-24');assert.equal(state.drafts[0].tanggal,'2030-04-24');
});
