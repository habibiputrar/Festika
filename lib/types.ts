import type {Publication,MediaAsset} from './content-model';
import type {Permission} from './permissions';
export type Role='admin'|'panitia'|'user';
export type EventStatus='upcoming'|'ongoing'|'selesai';
export type RegistrationStatus='pending'|'diterima'|'ditolak'|'dibatalkan';
export interface Profile {id:string;nama:string;email:string;role:Role;permissions?:Permission[]}
export interface FestikaEvent {schedule?:Publication[];schedule_managed?:{date:boolean;registration:boolean};team_entry_mode?:'names'|'accounts';payment_form_url?:string;theme?:string;prizes?:string[];stages?:string[];id:number;nama_event:string;deskripsi:string; tanggal:string|null;lokasi:string;kuota:number|null;status:EventStatus;tipe:'individu'|'tim'|null;maks_tim:number|null;anggota_tim:number|null;created_at:string;slug?:string;is_published?:boolean;archived?:boolean;registration_state?:'open'|'closed'|'paused';registration_start?:string|null;registration_end?:string|null;fee_amount?:number|null;payment_basis?:'free'|'participant'|'team'|'unconfirmed';payment_instructions?:string;requirements?:string[];format?:'online'|'offline'|'hybrid'|'unconfirmed';poster?:string;guidebook?:string;contact?:string;min_anggota?:number|null;details?:string;media_ids?:string[];remaining?:number|null}
export interface Registration {id:string;user_id:string;event_id:number;status:RegistrationStatus;bukti_pembayaran:string;created_at:string;profiles?:Pick<Profile,'nama'|'email'>;receipt_url?:string;payment_status?:string;fee_snapshot?:number;basis_snapshot?:string;expires_at?:string|null;reason?:string}
export interface TeamMember {tim_id:string;event_id:number;user_id:string}
export interface Team {member_names?:string[];id:string;event_id:number;nama_tim:string;kode_tim:string;ketua_id:string;created_at:string;tim_anggota:TeamMember[];archived?:boolean;expires_at?:string|null;payment_status?:string}
export interface Payment {id:string;registration_id:string|null;team_id:string|null;event_id:number;submitted_by:string;amount:number;status:'pending'|'verified'|'rejected'|'replaced';reason:string;created_at:string;receipt_url?:string}
export interface RegistrationHistory {id:number;registration_id:string;old_status:string|null;new_status:string;reason:string;created_at:string}
export interface PortalData {automaticRegistration?:boolean;media?:MediaAsset[];brandingLogo?:string;preview:boolean;profile:Profile;events:FestikaEvent[];registrations:Registration[];teams:Team[];profiles:Profile[];payments?:Payment[];history?:RegistrationHistory[];total?:number;totals?:{events:number;registrations:number;accepted:number;ongoing:number};page?:number}
export interface ActionResult {ok:boolean;message:string}
