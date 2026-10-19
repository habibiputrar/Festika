# Lingkup Keamanan Demo

## 1. Tujuan

Aplikasi ini disediakan untuk demonstrasi dan pengembangan antarmuka. Data dan seluruh aturan akses berada di browser pengunjung. Tidak ada batas kepercayaan antara akun demo, penyimpanan lokal, dan pemilik browser.

## 2. Autentikasi dan izin

Password akun contoh tersedia secara publik dan disimpan sebagai string pada state lokal. Tombol akun demo dapat membuka peran tanpa mengetik password. Pengguna dapat mengubah state melalui developer tools.

Pemeriksaan peran pada komponen dan adapter berguna untuk memperagakan alur izin serta mencegah kesalahan penggunaan antarmuka. Pemeriksaan tersebut bukan pengganti otorisasi server. Jangan menyajikan demo ini sebagai sistem yang dapat melindungi data peserta sebenarnya.

## 3. Pemulihan password

Tautan pemulihan dibuat dan diverifikasi secara lokal, berlaku 15 menit, serta dihapus setelah dipakai. Tidak ada pembuktian kepemilikan email atau pengiriman email. Siapa pun yang menguasai browser juga menguasai data dan token demo.

## 4. File

Gunakan berkas contoh yang tidak berisi data pribadi. Signature dan MIME diperiksa untuk konsistensi format, tetapi isi file tidak dipindai. PDF tidak dikonversi menjadi HTML oleh aplikasi. Object URL disediakan hanya untuk melihat file yang tersimpan dalam browser tersebut.

## 5. Data yang tidak disertakan

Repository tidak memuat `.env.local`, kredensial layanan, database produksi, akun admin sebenarnya, pesan pengunjung sebenarnya, bukti pembayaran sebenarnya, atau album foto produksi. Galeri demo memakai ilustrasi SVG dan dokumen contoh yang dapat dibuat ulang dari script.

## 6. Persyaratan sebelum penggunaan produksi

Implementasikan autentikasi server, hash password yang sesuai, pengelolaan sesi, otorisasi endpoint/database, validasi input server, transaksi kuota, penyimpanan file privat, rate limit, pemulihan berbasis verifikasi identitas, audit, serta kebijakan retensi. Rencana pemindahan adapter ada pada [DEVELOPMENT.md](DEVELOPMENT.md).

## 7. Pelaporan

Gunakan fitur pelaporan kerentanan privat GitHub jika tersedia pada repository. Jangan menaruh kredensial, token, atau data pribadi di issue publik. Temuan yang hanya menunjukkan kemampuan pemilik browser mengubah localStorage merupakan batas demo yang telah didokumentasikan.

## 8. Audit dependency pengembangan

`npm audit` melaporkan rantai dependency pengembangan `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces` untuk [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). Rekomendasi otomatis npm memerlukan downgrade konfigurasi Next ke versi mayor berbeda, sehingga tidak diterapkan dengan `--force`. Dependency ini dipakai untuk lint source, bukan sebagai layanan runtime pada hasil ekspor statis. Tinjau pembaruan upstream sebelum mengubah atau menerima konfigurasi glob yang tidak dipercaya.
