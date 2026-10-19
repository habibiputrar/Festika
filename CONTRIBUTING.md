# Kontribusi

## Ruang lingkup

Kontribusi dapat berupa perbaikan aksesibilitas, konsistensi data contoh, alur formulir, dokumentasi, pengujian, atau adapter penyimpanan yang terpisah. Pertahankan kemampuan menjalankan demo tanpa API key.

## Alur perubahan

1. Fork repository dan buat branch dengan nama yang menjelaskan perubahan.
2. Jalankan proyek dan baca dokumentasi arsitektur serta modul yang terkait.
3. Buat perubahan dengan lingkup yang dapat ditinjau.
4. Jalankan pemeriksaan yang relevan.
5. Buka pull request dengan masalah, perilaku setelah perbaikan, dan hasil pengujian.

## Pemeriksaan

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Jalankan browser test jika mengubah formulir, rute, hak akses, media, atau layout. Tidak perlu menambahkan tes yang sekadar menyalin implementasi; uji perilaku dan kegagalan yang bermakna.

## Konvensi

- Gunakan TypeScript dan kontrak tipe yang sudah tersedia.
- Tulis aturan bisnis pada model atau adapter, bukan pada markup komponen.
- Gunakan `transact()` untuk perubahan state.
- Pertahankan pemisahan Draft dan publikasi.
- Terapkan akses modul pada adapter selain menyembunyikan menu.
- Gunakan domain `.test` atau `example.test` untuk identitas contoh.
- Perbarui dokumentasi jika kontrak data, perintah, atau perilaku berubah.
- Jangan commit `.env`, file unggahan pengguna, hasil build, dan laporan pengujian lokal.

## Deskripsi pull request

Jelaskan pemicu masalah dan perubahan perilakunya. Sebutkan pengujian yang benar-benar dijalankan serta batas yang belum diperiksa. Jika menambahkan dependency, jelaskan kebutuhan dan pengaruhnya pada build statis atau ukuran bundle.
