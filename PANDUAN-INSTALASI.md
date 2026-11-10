# Panduan Instalasi — ProKer Waka Kur

Aplikasi ini terdiri dari dua bagian yang dipasang terpisah:

| Bagian | Isi | Dipasang di |
|---|---|---|
| **Backend** | 18 berkas `.gs` + `appsscript.json` | Google Apps Script (akun Google Waka Kurikulum) |
| **Frontend** | `proker-waka-kur.zip` (index.html, css/, js/) | GitHub Pages |

Kerjakan **urut: Backend dulu, baru Frontend.**

---

## Bagian A — Backend (Google Apps Script)

1. Buka <https://script.google.com> → **Proyek baru**. Beri nama `ProKer Waka Kur`.
2. Hapus isi `Code.gs` bawaan. Untuk **setiap** berkas `.gs` yang saya kirim (Kode.gs, Config.gs, Db.gs, Auth.gs, …): klik **＋ → Skrip**, beri nama yang sama (tanpa `.gs`), tempel isinya.
   *Tidak masalah urutannya, semua berkas dibaca sekaligus.*
3. Buka **Setelan proyek (ikon roda gigi)** → centang **Tampilkan berkas manifes "appsscript.json" di editor**. Kembali ke editor, buka `appsscript.json`, ganti seluruh isinya dengan berkas `appsscript.json` yang saya kirim.
4. Pilih fungsi **`setupAwal`** di menu atas → **Jalankan**. Izinkan akses Google saat diminta (Lanjutan → Buka … → Izinkan).
   Setup ini aman diulang. Ia otomatis membuat: Spreadsheet database (26 sheet), folder Drive, `SESSION_SECRET`, pengaturan awal, dan mendaftarkan **akun Anda sebagai Waka Kurikulum**. Hasilnya tampil di **Log eksekusi** — salin tautan Spreadsheet-nya.
5. (Opsional, untuk mencoba) jalankan **`isiDataContoh`** untuk mengisi 10 program, jadwal, dan contoh data. Hapus/ganti nanti lewat menu **Impor Data**.
6. Jalankan **`pasangTrigger`** (antrean notifikasi tiap beberapa menit, pengingat harian, pemanasan server).
7. **Terapkan → Deployment baru → jenis: Aplikasi web**
   - Jalankan sebagai: **Saya**
   - Yang memiliki akses: **Siapa saja**
   - Klik **Terapkan**, salin **URL aplikasi web** (berakhiran `/exec`). **Simpan — dipakai di Bagian B.**

> Setiap kali Anda mengubah kode backend: **Terapkan → Kelola deployment → ✏️ → Versi baru → Terapkan**. URL tetap sama.

### Login Google (Client ID)

1. Buka <https://console.cloud.google.com> → buat/ pilih proyek → **API & Layanan → Kredensial → Buat kredensial → ID klien OAuth**.
2. Jenis aplikasi: **Aplikasi web**. Pada **Asal JavaScript yang diizinkan** tambahkan alamat situs Anda, mis. `https://USERNAME.github.io` (tanpa garis miring di akhir).
3. Salin **Client ID** (berakhiran `.apps.googleusercontent.com`). Nanti diisi lewat aplikasi (menu **Pengguna & Log → Keamanan**) — **bukan** ditulis di kode.

---

## Bagian B — Frontend (GitHub Pages)

### B1. Siapkan folder
1. Ekstrak `proker-waka-kur.zip`. Hasilnya **satu folder bernama `proker-waka-kur`** yang berisi `index.html`, `css`, `js`.
2. Buka `js/config.js` dengan Notepad. Ganti `GANTI_DENGAN_URL_EXEC_APPS_SCRIPT` dengan URL `/exec` dari langkah A7. Simpan.
   *Hanya URL itu yang ada di file ini — tidak ada kata sandi atau token.*

### B2. Push ke GitHub (lewat terminal)
> **Folder kerja Anda adalah `proker-waka-kur` itu sendiri** — folder yang langsung berisi `index.html`. Di sinilah `git init` dijalankan. Jangan naik satu level, jangan masuk lebih dalam.

1. Buat repository baru di github.com: **Public**, nama bebas (mis. `proker-waka-kur`), **jangan** centang README/.gitignore/license.
2. Buka terminal **di dalam folder `proker-waka-kur`** (Windows: buka folder di File Explorer → klik address bar → ketik `powershell` → Enter).
3. Pastikan `index.html` terlihat di daftar:
   ```
   dir        # Windows PowerShell
   ls -la     # Mac / Linux / Git Bash
   ```
4. Jalankan (ganti `USERNAME` dan `NAMA-REPO`):
   ```
   git init
   git add .
   git commit -m "ProKer Waka Kur"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
   Saat diminta *password*, tempel **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens → centang `repo`). Karakter tidak tampil saat diketik — itu normal.
5. Di repository: **Settings → Pages → Source: Deploy from a branch → Branch `main` / folder `/ (root)` → Save.** Tunggu 1–2 menit; alamat situs: `https://USERNAME.github.io/NAMA-REPO/`.

### B3. Update di kemudian hari
Ubah berkas → di folder yang sama: `git add .` → `git commit -m "update"` → `git push`.

---

## Bagian C — Pengaturan pertama (di dalam aplikasi)

Masuk dengan akun Google yang sama dengan pemilik skrip (otomatis berperan **Waka Kurikulum**). Jika Client ID belum diisi, sementara tidak bisa masuk dengan Google — jalankan fungsi `cekSetup` di editor Apps Script untuk melihat langkah yang tersisa, atau isi lewat Script Properties (lihat tabel).

| Rahasia | Diisi oleh | Cara |
|---|---|---|
| `SESSION_SECRET` | **Otomatis** (setup) | — |
| `SPREADSHEET_ID`, `ROOT_FOLDER_ID` | **Otomatis** (setup) | — |
| `GOOGLE_CLIENT_ID` | **Anda** | Editor Apps Script → Setelan proyek → **Properti skrip** → tambah `GOOGLE_CLIENT_ID` (sekali, untuk login pertama). Selanjutnya bisa diganti di menu Keamanan |
| `FONNTE_TOKEN` (WhatsApp) | **Anda** (opsional) | Menu **Pengguna & Log → Keamanan** |
| Sandi akses darurat | **Anda** (opsional) | Menu **Keamanan** — cadangan jika login Google bermasalah; terkunci 10 menit setelah 5 kali salah |

Lalu:
1. **Pengguna & Log → Pengaturan Sekolah**: isi nama sekolah, alamat, nama Waka & Kepsek, tahun ajaran/semester, **APP_URL** (alamat situs GitHub Pages, agar tautan di notifikasi benar), dan unggah logo.
2. **Pengguna & Log → Pengguna**: tambah guru & Kepala Sekolah (email Google mereka), atau **Impor Data** dari CSV.
3. **WA & Notifikasi**: saklar WhatsApp dan Email **mati secara bawaan**. Setelah token Fonnte diisi, nyalakan saklar dan pilih kejadian yang mengirim pesan. Semua pesan lewat antrean — tidak memperlambat aplikasi.
4. (Opsional) **Template laporan**: buat Google Docs berisi `{{NAMA_SEKOLAH}}`, `{{JUDUL}}`, `{{NOMOR}}`, `{{PERIODE}}`, `{{RINGKASAN}}`, `{{PROGRAM}}`, `{{HASIL}}`, `{{KENDALA}}`, `{{REKOMENDASI}}`, lalu isi ID-nya pada pengaturan `DE_TEMPLATE_LAPORAN_ID`. Tanpa template, PDF dibuat otomatis dengan kop standar.

Verifikasi keaslian laporan: setiap PDF terbit memuat QR yang membuka `…/#/verifikasi/KODE` (halaman publik tanpa login).

## Masalah umum

| Gejala | Penyebab / solusi |
|---|---|
| Situs 404 | `index.html` tidak di root repo → ulangi B2 dari folder yang benar |
| "URL API belum diisi" | `js/config.js` belum diganti |
| Tombol Google tidak muncul / "origin tidak diizinkan" | Tambahkan `https://USERNAME.github.io` di Asal JavaScript yang diizinkan |
| "Akun … belum terdaftar" | Tambahkan emailnya di menu Pengguna |
| Perubahan backend tidak berefek | Terapkan **versi baru** pada deployment yang sama |
