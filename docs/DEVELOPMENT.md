# Panduan Pengembangan

## 1. Persiapan

Gunakan Node.js 24. Jalankan `npm ci`, kemudian `npm run dev`. API key tidak diperlukan. Instal editor yang mendukung TypeScript agar perubahan kontrak antarkomponen segera terdeteksi.

Sebelum mengubah bagian aplikasi, baca dokumen pada `node_modules/next/dist/docs/` yang sesuai dengan versi Next.js terpasang. Repository menggunakan App Router dan static export; contoh implementasi yang membutuhkan server tidak dapat langsung dipakai.

## 2. Kontrak utama

| File | Tanggung jawab |
| --- | --- |
| `lib/demo/model.ts` | Validasi aktor, aturan kuota, pendaftaran, pembayaran, dan sinkronisasi jadwal |
| `lib/demo/store.ts` | Pembacaan dan penulisan state, batas penyimpanan, sesi, file, serta event perubahan |
| `lib/demo/seed.ts` | Akun, konten, event, dan jadwal awal |
| `app/actions.ts` | Adapter formulir akun, event, pendaftaran, dan tim |
| `app/platform-actions.ts` | Adapter konten, pembayaran, media, Inbox, dan pengaturan akun |
| `app/staff-actions.ts` | Akun panitia serta izin modul |
| `components/demo-app.tsx` | Pemilihan halaman dan penyusunan props untuk komponen presentasi |

Adapter mengembalikan `{ ok, message }`. Pemulihan password juga dapat mengembalikan `resetUrl`. Formulir menggunakan hasil tersebut untuk menampilkan status. Jangan menulis langsung ke `localStorage` dari komponen formulir; gunakan adapter dan `transact()`.

## 3. Menambah operasi bisnis

1. Definisikan tipe dan invariant pada `lib/demo/model.ts` atau file model tersendiri.
2. Periksa aktor melalui `actor()`, `requireAdmin()`, atau izin modul yang relevan.
3. Validasi input dengan Zod atau pemeriksaan domain yang eksplisit.
4. Jalankan perubahan melalui `transact()`. Hindari `await` di dalam callback transaksi; lakukan pembacaan file sebelumnya.
5. Tambahkan audit jika operasi mengubah data yang dikelola admin atau panitia.
6. Hubungkan adapter ke komponen formulir.
7. Tambahkan pengujian untuk jalur berhasil, input tidak valid, dan akses yang ditolak.

Kesalahan harus melempar `Error` sebelum state disimpan. Adapter mengubah kesalahan menjadi feedback; jangan mengembalikan pesan berhasil jika operasi belum selesai.

## 4. Menambah modul dashboard

1. Tambahkan key izin pada `permissionOptions` di `lib/permissions.ts`.
2. Petakan rute melalui `sectionPermission()`.
3. Tambahkan menu pada `components/dashboard-frame.tsx`.
4. Tambahkan rute statis pada `generateStaticParams()`.
5. Hubungkan komponen modul pada `DemoApp`.
6. Terapkan pemeriksaan izin pada adapter, bukan hanya pada menu.
7. Uji akun panitia dengan izin aktif, dicabut, dan akun dinonaktifkan.

Jika izin baru perlu menjadi akses awal, ubah `defaultStaffPermissions` dan akun panitia pada seed secara bersamaan.

## 5. Menambah jenis konten

Daftarkan kind pada `kinds`, field pada `contentConfig`, dan aturan pada `validateContent()` di `lib/content-model.ts`. Setelah itu tambahkan rendering jenis konten pada komponen publik serta data contoh jika diperlukan.

Gunakan field bertipe `select` untuk pilihan terkontrol dan `date` untuk tanggal tanpa jam. `safeUrl()` menolak protokol berbahaya; jangan memperluasnya untuk menerima HTML atau SVG unggahan secara bebas.

Konten `gallery` memerlukan album `past_event` melalui `parent_id`. Timeline dan panduan dapat dihubungkan ke event melalui `event_id`.

## 6. Mengubah jadwal

Tanggal operasional berasal dari Timeline yang terbit. Gunakan `schedule_role` untuk menyatakan makna jadwal, bukan menambah logika berdasarkan nomor urut kartu. Periode pendaftaran dan hari pelaksanaan utama tidak boleh memiliki lebih dari satu penanggung jawab tanggal dalam event yang sama.

Perubahan Draft Timeline tidak memengaruhi event sampai publikasi. Setelah perubahan publik, `synchronizeSchedule()` memperbarui tanggal dalam event publik dan Draft. Uji pula publikasi ulang event agar tanggal lama tidak kembali.

## 7. Menambah rute publik

Semua path harus tercantum pada `generateStaticParams()`. Rute data dinamis sebaiknya menggunakan halaman statis dengan parameter query seperti `/kompetisi/detail?slug=...`. Jika memilih path dinamis untuk setiap item, proses build harus mengetahui seluruh parameternya.

Gunakan `next/link` untuk navigasi. Untuk file dalam `public/branding`, gunakan `assetPath()` agar hosting pada `/Festika` tetap berfungsi. Jangan menambahkan URL domain produksi sebagai fallback.

## 8. Menyesuaikan desain

- `app/globals.css`: dasar layout, formulir, tabel, dashboard, serta variabel tema.
- `app/festival.css`: halaman publik, hero, timeline, galeri, dan footer.
- `app/motion.css`: transisi navigasi dan animasi kemunculan.
- `app/schedule.css`: panel jadwal pada kartu dan editor event.
- `app/demo.css`: penanda demo serta daftar akun contoh.

Gunakan variabel warna yang sudah tersedia. Periksa ukuran 390 px dan desktop serta kedua tema. Komponen dialog memakai elemen `dialog`; pertahankan dukungan Escape, fokus, dan pemulihan scroll. Animasi harus menghormati `prefers-reduced-motion`.

## 9. Mengubah seed

`seedState()` harus menghasilkan data baru tanpa layanan eksternal. Akun menggunakan domain `.test`, sedangkan pesan contoh menggunakan `example.test`. Jangan menyalin ekspor produksi atau file `.env` ke seed.

Setelah mengubah seed, tekan Reset demo pada browser. Mengedit file seed tidak otomatis menimpa data yang sudah tersimpan. Gunakan pengujian untuk memastikan jadwal awal tetap terbuka dan akun bawaan tetap tersedia.

## 10. Mengganti penyimpanan dengan backend

Adapter browser dapat menjadi batas awal migrasi, tetapi tidak boleh dianggap sebagai backend yang sudah aman. Untuk produksi:

1. Pindahkan autentikasi dan otorisasi ke server.
2. Ganti `transact()` dengan transaksi database dan batasan unik yang sesuai.
3. Hitung kuota dan kedaluwarsa pada server, termasuk perlindungan pendaftaran bersamaan.
4. Simpan file pada object storage privat; gunakan URL bertanda tangan untuk bukti pembayaran.
5. Gunakan penyimpanan password dan sesi dari penyedia autentikasi atau implementasi yang telah diaudit.
6. Implementasikan verifikasi email, pemulihan password, rate limit, audit, serta retensi data.
7. Lindungi setiap endpoint. Menghilangkan menu saja tidak membatasi akses.
8. Gunakan database dan kredensial baru untuk pengembangan; jangan menghubungkan repo publik ke produksi secara tidak sengaja.

Jangan mengimpor modul `store.ts` ke Server Component. Jangan menambahkan secret dengan awalan `NEXT_PUBLIC_`.

## 11. Pemeriksaan sebelum pull request

Jalankan `npm run lint`, `npm run typecheck`, `npm test`, dan `npm run build`. Jalankan browser test jika perubahan menyentuh alur formulir, navigasi, izin, file, atau layout. Sertakan skenario dan batas hasil pengujian pada deskripsi pull request.
