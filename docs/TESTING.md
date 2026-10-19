# Pengujian

## 1. Pemeriksaan dasar

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Unit test memakai Node.js Test Runner. Helper `tests/load-typescript.mjs` mentranspilasi modul model untuk pengujian tanpa browser. Helper ini hanya dipakai pada tes dan tidak masuk ke bundle aplikasi.

## 2. Cakupan model

`tests/demo-model.test.mjs` memeriksa:

- Akun dan data seed serta periode pendaftaran yang dapat dicoba.
- Kelengkapan anggota, satu pendaftaran per ketua, satu biaya per tim, dan kuota.
- Pendaftaran gratis yang langsung diterima.
- Pembayaran yang hanya dapat diverifikasi oleh akun berizin.
- Slot yang kedaluwarsa dan tidak dapat diverifikasi.
- Pembatalan yang mengembalikan kapasitas.
- Pencabutan izin dan penonaktifan panitia.
- Konsistensi tanggal Timeline pada event publik dan Draft.

Unit test tidak membuktikan keamanan produksi. Tidak ada server autentikasi atau database bersama dalam demo ini.

## 3. Pengujian browser

Jalankan server pada terminal pertama:

```bash
npm run dev -- --port 3001
```

Pada terminal kedua:

```bash
npm run test:browser
```

Default browser adalah Microsoft Edge. Untuk memakai Chromium yang dikelola Playwright:

```bash
npx playwright install chromium
```

PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chromium'
$env:DEMO_BASE_URL = 'http://127.0.0.1:3001'
npm run test:browser
```

Bash:

```bash
PLAYWRIGHT_CHANNEL=chromium DEMO_BASE_URL=http://127.0.0.1:3001 npm run test:browser
```

Browser test menggunakan context baru. Tes mengirim formulir demo dan mereset state pada context tersebut. Tidak ada koneksi produksi dan tidak ada screenshot yang disimpan. Ringkasan hasil ditulis ke `validation/demo-browser.json`, yang dikecualikan dari Git.

## 4. Alur browser yang diperiksa

| Area | Pemeriksaan |
| --- | --- |
| Publik | Seed, hero, dan navigasi |
| Peserta | Login, penolakan halaman admin, pendaftaran CTF, anggota tim, upload file |
| Persistensi | Bukti tetap tersedia setelah reload |
| Admin | Verifikasi yang menerima pendaftaran secara otomatis |
| Pesan | Message masuk ke Inbox panitia tanpa pengiriman email |
| Hak akses | Panitia awal tidak dapat membuka Pembayaran |
| Timeline | Publikasi tanggal mengubah editor event dan menjadikan kolom tanggal baca saja |
| Akun panitia | Pembuatan akun dengan toggle izin |
| Media | Upload gambar, pemakaian pada footer, dan penolakan penghapusan file yang masih dirujuk |
| Event baru | Publikasi dan detail event baru melalui query tanpa menghasilkan HTML baru |
| Akun | Password saat ini diperiksa sebelum perubahan |
| Pemulihan | Token simulasi tersedia dan dapat dipakai untuk membuat password baru |
| Responsif | Tidak ada overflow halaman pada 390 px untuk modul utama dan dua tema |
| Reset | Aktivitas dibersihkan dan akun bawaan dipulihkan |
| Jaringan | Tidak ada request HTTP ke origin eksternal dalam alur pengujian |

## 5. Pemeriksaan manual tambahan

1. Unggah file yang lebih besar dari 350 KB dan pastikan formulir menolak.
2. Pilih file dengan MIME atau signature yang tidak sesuai.
3. Gunakan dua tab dengan akun berbeda untuk memeriksa pembaruan state.
4. Cabut izin panitia dan pastikan modul tidak lagi dapat dibuka.
5. Simpan Draft konten lalu pastikan beranda belum berubah.
6. Publikasikan konten dan periksa hasil setelah refresh.
7. Coba token reset setelah dipakai dan setelah kedaluwarsa.
8. Jalankan dengan reduced motion dan navigasi keyboard.
9. Uji batas penyimpanan browser serta pemulihan melalui Reset demo.

## 6. Build statis

Uji `npm run build` dan hasil `out/`, bukan hanya dev server. Jika deployment memakai subpath, build dengan `NEXT_PUBLIC_BASE_PATH` yang sama dan uji URL aset, login, galeri, panduan PDF, refresh dashboard, serta detail event baru melalui parameter query.
