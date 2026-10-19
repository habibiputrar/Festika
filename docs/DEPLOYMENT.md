# Deployment Situs Demo

## 1. Hasil build

`npm run build` menghasilkan direktori `out/` yang berisi HTML, JavaScript, CSS, font, dan aset publik. Deployment tidak membutuhkan database maupun environment secret.

`out/` tidak disimpan dalam repository. Hosting atau workflow membangunnya dari source dan lockfile.

Lifecycle `postbuild` membuat alias file segment-prefetch Next 16 dan marker `.nojekyll`. Gunakan `npm run build`, bukan menjalankan `next build` secara terpisah, agar persiapan hasil statis ini ikut dilakukan.

## 2. Netlify

1. Hubungkan repository `habibiputrar/Festika`.
2. Pilih branch `main`.
3. Gunakan build command `npm run build`.
4. Gunakan publish directory `out`.
5. Gunakan Node.js 24. Konfigurasi tersedia pada `netlify.toml`.

Jangan menggunakan publish directory `.next` untuk versi demo ini. Jangan menyalin environment Supabase, Resend, atau Web3Forms dari website produksi. `NEXT_PUBLIC_BASE_PATH` dibiarkan kosong untuk domain root Netlify.

## 3. GitHub Pages

Workflow `.github/workflows/pages.yml` membangun aplikasi dengan base path sesuai nama repository, kemudian mengunggah `out/` sebagai artefak Pages.

Aktifkan **Settings → Pages → Build and deployment → Source: GitHub Actions**. Push ke `main` atau jalankan workflow melalui **Actions → Deploy demo → Run workflow**.

Untuk repository ini, URL Pages yang diharapkan adalah `https://habibiputrar.github.io/Festika/`. URL tersebut baru dapat digunakan setelah fitur Pages aktif dan workflow berhasil. Jika nama repository berubah, workflow memakai nama baru pada build berikutnya.

Workflow memerlukan izin `pages: write` dan `id-token: write` pada job deployment. Secret layanan aplikasi tidak diperlukan; token sementara workflow disediakan oleh GitHub.

## 4. Base path

Default base path adalah string kosong. Untuk hosting pada subpath, isi `NEXT_PUBLIC_BASE_PATH` ketika build. Nilai diawali `/` dan tidak diakhiri `/`.

PowerShell:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = '/Festika'
npm run build
npm start
```

Bash:

```bash
NEXT_PUBLIC_BASE_PATH=/Festika npm run build
NEXT_PUBLIC_BASE_PATH=/Festika npm start
```

Server pratinjau menggunakan environment yang sama untuk menghapus prefix sebelum mencari file pada `out/`. Buka `http://127.0.0.1:3000/Festika/`.

`assetPath()` menyesuaikan alamat branding dan panduan. Next Link menangani base path navigasi internal. URL blob unggahan dan link eksternal tidak diberi prefix.

## 5. Server pratinjau lokal

```bash
npm run build
npm start
```

Default host `127.0.0.1` dan port `3000`. `PORT` dan `HOST` dapat diubah untuk kebutuhan pengujian. Server ini menyajikan GET/HEAD dan memeriksa agar path file tetap berada di dalam `out/`; server tidak menjalankan operasi bisnis.

Untuk akses perangkat lain di jaringan lokal, atur `HOST=0.0.0.0` secara eksplisit dan sesuaikan firewall. Data browser tiap perangkat tetap terpisah.

## 6. Pemeriksaan setelah deploy

- Beranda, logo, font, ilustrasi, dan PDF contoh dapat dibuka.
- URL dashboard dapat di-refresh langsung.
- Ketiga akun demo dapat dipakai.
- Pendaftaran, upload, pergantian peran, dan verifikasi berjalan pada origin yang sama.
- Timeline publik dan dashboard menampilkan tanggal yang sama.
- Reset demo memulihkan akun dan data awal.
- Tidak ada request ke Supabase atau layanan email produksi.

Pengunjung lain tidak melihat perubahan yang dilakukan pada browser Anda. Hal ini merupakan perilaku penyimpanan lokal, bukan kegagalan deployment.

## 7. Mengatasi masalah

| Gejala | Pemeriksaan |
| --- | --- |
| Tampilan tanpa CSS atau logo hilang di Pages | Pastikan base path sama dengan nama repository dan build dilakukan ulang |
| Halaman hilang saat refresh | Pastikan semua isi `out/` diunggah dan hosting melayani `index.html` pada direktori rute |
| Data lama masih muncul setelah deploy | Data berada di browser; gunakan Reset demo |
| Akun bawaan tidak dapat login | Akun mungkin diubah dalam demo; lakukan reset |
| Upload ditolak | Periksa format dan batas 350 KB serta kapasitas penyimpanan |
| Halaman hanya menampilkan pemuatan | Pastikan JavaScript dan penyimpanan browser diizinkan |
| Deploy Pages gagal sebelum build | Pastikan sumber Pages adalah GitHub Actions dan izin workflow tidak dibatasi organisasi |
