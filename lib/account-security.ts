import {z} from 'zod';
export const accountPasswordSchema=z.string().min(8,'Password baru minimal 8 karakter.').regex(/[A-Z]/,'Password baru perlu minimal satu huruf besar.').regex(/[a-z]/,'Password baru perlu minimal satu huruf kecil.').regex(/[0-9]/,'Password baru perlu minimal satu angka.');
export function passwordChangeValues(form:FormData){
 const current=z.string().min(1,'Password saat ini wajib diisi.').parse(form.get('current_password'));
 const password=accountPasswordSchema.parse(form.get('password'));
 if(password!==form.get('password2'))throw Error('Konfirmasi password baru belum sama.');
 if(password===current)throw Error('Password baru harus berbeda dari password saat ini.');
 return {current,password};
}
export function accountAuthError(error:{code?:string;status?:number},operation:'password'|'verify'|'email'){
 if(error.code==='invalid_credentials'||error.code==='incorrect_password')return 'Password saat ini tidak sesuai. Periksa kembali atau gunakan Lupa password.';
 if(error.code==='same_password')return 'Password baru harus berbeda dari password saat ini.';
 if(error.code==='weak_password')return 'Password baru belum memenuhi kebijakan keamanan. Gunakan password yang lebih kuat dan hindari password yang umum.';
 if(error.code==='reauthentication_needed'||error.code==='reauthentication_not_valid'||error.code==='session_not_found'||error.code==='refresh_token_not_found'||error.status===401)return 'Sesi perlu diperbarui. Silakan keluar, masuk kembali, lalu coba lagi.';
 if(error.code==='over_request_rate_limit'||error.status===429)return 'Terlalu banyak percobaan. Tunggu beberapa saat sebelum mencoba kembali.';
 if(error.code==='request_timeout'||error.status===0||(error.status||0)>=500)return 'Layanan akun belum dapat dihubungi. Silakan coba kembali beberapa saat lagi.';
 return operation==='password'?'Password belum dapat diperbarui. Silakan coba kembali.':operation==='email'?'Email belum dapat diperbarui.':'Password belum dapat diverifikasi. Silakan coba kembali.';
}
