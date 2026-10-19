export const permissionOptions=[
 {key:'events',label:'Kelola event'},{key:'registrations',label:'Verifikasi pendaftaran'},
 {key:'teams',label:'Kelola tim'},{key:'payments',label:'Verifikasi pembayaran'},
 {key:'content',label:'Konten website'},{key:'inbox',label:'Inbox pesan'},
 {key:'media',label:'Media dan unggahan'},{key:'settings',label:'Pengaturan website'}
] as const;
export type Permission=typeof permissionOptions[number]['key'];
export const defaultStaffPermissions:Permission[]=['registrations','teams','inbox'];
export function portalRoot(role:string){return role==='admin'?'/admin':role==='panitia'?'/panitia':'/dashboard';}
export function canAccess(profile:{role:string;permissions?:Permission[]},permission:Permission){return profile.role==='admin'||profile.role==='panitia'&&!!profile.permissions?.includes(permission);}
export function sectionPermission(section:string):Permission|null{
 const key=section.split('/')[0];
 return ({event:'events',pendaftaran:'registrations',tim:'teams',pembayaran:'payments',konten:'content',inbox:'inbox',media:'media',pengaturan:'settings'} as Record<string,Permission>)[key]||null;
}
export function contentPermission(kind:string):Permission{return ['identity','hero','contact','footer','navigation','guidebook'].includes(kind)?'settings':'content';}
