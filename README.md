# FESTIKA UNAND — Public Demo

Website informasi kompetisi dan simulasi pendaftaran FESTIKA UNAND. Repository ini menyediakan versi mandiri untuk mempelajari antarmuka, alur peserta, pengelolaan acara, dan pembagian akses admin serta panitia.

Demo menggunakan data contoh di browser. Tidak diperlukan Docker, database server, Supabase, SMTP, atau API key. Kode produksi dan data peserta sebenarnya tidak disertakan.

## Menjalankan proyek

Prasyarat: Node.js 24 dan npm. Gunakan versi Node yang sama untuk pengembangan dan build.

```bash
git clone https://github.com/habibiputrar/Festika.git
cd Festika
npm ci
npm run dev
```

Buka `http://127.0.0.1:3000`. Bila port sedang dipakai:

```bash
npm run dev -- --port 3001
```

Tidak perlu membuat `.env.local`. Instalasi paket pertama membutuhkan koneksi internet. Setelah dependensi terpasang, aplikasi tidak membutuhkan layanan eksternal untuk menjalankan alur demo; font dan aset contoh disertakan secara lokal.

## Akun demo

| Peran | Email | Password |
| --- | --- | --- |
| Admin | `admin@festika.test` | `DemoFestika2026!` |
| Panitia | `panitia@festika.test` | `DemoFestika2026!` |
| Peserta | `peserta@festika.test` | `DemoFestika2026!` |

Form login mendukung email dan password tersebut. Halaman login juga menyediakan tombol untuk langsung mencoba setiap peran. Tombol akses cepat merupakan fasilitas demonstrasi, bukan mekanisme autentikasi produksi.

Panitia mendapatkan akses awal ke Pendaftaran, Tim, dan Inbox. Admin dapat menambah akun panitia, menonaktifkan akun, serta mengatur izin modul melalui toggle.

Gunakan identitas dan password contoh. Data akun demo, termasuk password, berada di penyimpanan browser dan dapat dibaca atau diubah melalui developer tools. Jangan memakai password atau informasi pribadi sebenarnya.

## Skenario penggunaan

1. Masuk sebagai peserta dan buka **Jelajah Event**.
2. Daftar **Capture The Flag**, isi nama tim dan dua nama anggota.
3. Pada **Pembayaran**, unggah [bukti-demo.pdf](public/branding/demo/bukti-demo.pdf).
4. Buka **Akun demo**, kemudian masuk sebagai admin menggunakan browser dan alamat situs yang sama.
5. Buka **Pembayaran**, pilih **Terverifikasi**, lalu simpan.
6. Masuk kembali sebagai peserta. Status pendaftaran berubah menjadi **Terdaftar**.
7. Coba kirim formulir **Message**, kemudian baca hasilnya melalui Inbox admin atau panitia.

Pendaftaran lomba gratis langsung diterima. Pendaftaran berbayar menahan satu slot selama 24 jam; tidak ada transaksi uang dalam demo. Satu pembayaran CTF mencakup seluruh tim.

## Fitur yang dapat dicoba

| Bagian | Fitur |
| --- | --- |
| Publik | Beranda, daftar dan detail kompetisi, timeline per lomba, FAQ, galeri berkelompok, formulir pesan |
| Akun | Login, pembuatan akun peserta, perubahan profil dan password, simulasi reset password |
| Peserta | Pendaftaran individu/tim, pengisian anggota, upload bukti contoh, status pembayaran, pembatalan |
| Admin | Draft/publikasi event, kuota, biaya, periode pendaftaran, konten, media, Inbox, akun panitia, audit lokal |
| Panitia | Dashboard dengan modul sesuai izin yang diberikan admin |
| Tampilan | Tema terang/gelap, layout responsif, animasi navigasi dan kemunculan elemen |

Jadwal beranda dan dashboard memakai Timeline yang dipublikasikan. Pilih **Konten Website → Timeline**, tentukan event dan kegunaan jadwal, ubah tanggal, lalu publikasikan. Draft tidak langsung mengubah halaman publik.

## Penyimpanan dan batas demo

Data berada pada `localStorage` dengan key `festika-demo:data:v1`. Sesi akun memakai `sessionStorage` dengan key `festika-demo:session:v1`.

- Data bertahan setelah refresh dalam browser dan origin yang sama.
- Akun peserta, panitia, dan admin melihat data contoh yang sama apabila memakai origin yang sama. Tab berbeda dapat memakai sesi akun berbeda.
- Data tidak dibagikan ke pengunjung lain, perangkat lain, atau domain lain.
- Batas aplikasi adalah sekitar 4 MB data JSON dan 350 KB untuk setiap unggahan. Browser dapat menerapkan batas lebih kecil.
- Bukti pembayaran menerima JPEG, PNG, dan PDF. Media juga menerima WebP.
- Email, WhatsApp, pembayaran, dan verifikasi identitas sebenarnya tidak dijalankan.
- Hak akses hanya simulasi pada sisi klien. Aplikasi ini tidak memiliki keamanan backend.
- Tombol **Reset demo** menghapus seluruh aktivitas lokal dan mengembalikan akun serta materi contoh.

Saat seed pertama dibuat atau demo direset, periode pendaftaran disusun relatif terhadap waktu browser agar fitur dapat langsung dicoba. Ini bukan jadwal resmi acara.

## Build dan hosting

```bash
npm run build
npm start
```

Hasil build berupa situs statis dalam `out/`. `npm start` menjalankan server pratinjau lokal; perintah ini tidak membuat database atau menjalankan backend.

Untuk Netlify, gunakan build command `npm run build` dan publish directory `out`. Workflow GitHub Pages tersedia di `.github/workflows/pages.yml`; aktifkan **Settings → Pages → Source: GitHub Actions** pada repository. Petunjuk root domain dan subpath ada pada [panduan deployment](docs/DEPLOYMENT.md).

## Perintah pengembangan

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan pengembangan Next.js |
| `npm run build` | Memeriksa tipe dan menghasilkan situs statis |
| `npm start` | Menyajikan hasil build lokal |
| `npm run typecheck` | Pemeriksaan TypeScript |
| `npm run lint` | Pemeriksaan ESLint |
| `npm test` | Pengujian model data dan aturan demo |
| `npm run test:browser` | Pengujian browser; membutuhkan server lokal dan browser Playwright |
| `node scripts/create-demo-assets.mjs` | Membuat ulang ilustrasi dan PDF contoh; aset sudah disertakan |

Pengujian browser secara default memakai Microsoft Edge dan port 3001. Lihat [panduan pengujian](docs/TESTING.md) untuk Chromium dan alamat server lain.

## Dokumentasi pengembang

| Dokumen | Isi |
| --- | --- |
| [Arsitektur](docs/ARCHITECTURE.md) | Lapisan aplikasi, rendering, routing, dan aliran perubahan |
| [Model data](docs/DATA-MODEL.md) | Struktur penyimpanan, relasi, status, jadwal, dan unggahan |
| [Panduan pengembangan](docs/DEVELOPMENT.md) | Menambah fitur, modul, peran, konten, dan adapter backend |
| [Pengujian](docs/TESTING.md) | Unit test, browser test, cakupan, dan pemeriksaan manual |
| [Deployment](docs/DEPLOYMENT.md) | Build statis, Netlify, GitHub Pages, dan konfigurasi subpath |
| [Batas keamanan](docs/SECURITY.md) | Lingkup simulasi, data yang tidak boleh digunakan, dan kebutuhan produksi |
| [Kontribusi](CONTRIBUTING.md) | Alur perubahan dan persyaratan pull request |
| [Aset dan atribusi](docs/ASSETS.md) | Logo, font, ilustrasi, serta batas lisensi aset |

## Teknologi

Next.js App Router, React, TypeScript, Tailwind CSS, CSS global, Zod, Lucide, dan Playwright. Versi paket dikunci pada `package-lock.json`.

## Lisensi

Kode aplikasi menggunakan [MIT License](LICENSE). Logo FESTIKA dan identitas institusi tidak termasuk dalam pemberian lisensi kode. Penggunaan identitas tersebut mengikuti hak pemilik masing-masing; lihat [catatan aset](docs/ASSETS.md).
