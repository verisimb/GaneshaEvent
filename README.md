# Ganesha Event - Project Documentation

## Deskripsi
Ganesha Event adalah platform manajemen event kampus yang memungkinkan mahasiswa mendaftar event, mendapatkan tiket QR Code, dan mengunduh sertifikat secara digital. Aplikasi ini dikembangkan menggunakan **Laravel 11** (Backend, sebagai API) dan **React + Vite** (Frontend).

---

## 🏗️ Tech Stack
- **Backend**: Laravel 11, MySQL, PHP 8.2+
- **Frontend**: React.js, Vite, Tailwind CSS, Zustand (State Management)
- **Database**: MySQL

---

## 🚀 Cara Menjalankan Project

### 1. Backend (Laravel)
Pastikan Anda berada di folder `be-ganesha-event`.
```bash
# Install dependencies
composer install

# Setup Environment (.env)
cp .env.example .env
# (Lalu sesuaikan DB_DATABASE=ganesha_event, DB_USERNAME, DB_PASSWORD di file .env)

# Generate Key
php artisan key:generate

# Migrasi Database & Seeding
php artisan migrate:fresh --seed

# Link Storage (Untuk upload gambar)
php artisan storage:link

# Jalankan Server
php artisan serve
```
Backend akan berjalan di: `http://localhost:8000`

### 2. Frontend (React)
Pastikan Anda berada di folder `fe-ganesha-event`.
```bash
# Install dependencies
npm install

# Jalankan Frontend
npm run dev
```
Frontend akan berjalan di: `http://localhost:5173`

---

## 🔑 Fitur Utama
1.  **Pendaftaran Event**: User bisa mendaftar event gratis (otomatis dikonfirmasi) atau berbayar (menunggu konfirmasi).
2.  **Manajemen Tiket**: Tiket memiliki QR Code unik (`TCKT-XXX`). Status tiket: `menunggu_konfirmasi`, `dikonfirmasi`, `ditolak`.
3.  **Sertifikat Digital**: User yang **sudah hadir** (`is_attended = 1`) dan event memiliki link sertifikat, dapat mengunduh sertifikat di menu "Sertifikat Saya".
4.  **Role-Based Access Control (RBAC)**: Sistem membedakan hak akses antara **User** (Pendaftar) dan **Admin** (Pengelola). Halaman Admin terlindungi dan tidak bisa diakses oleh user biasa.
5.  **Autentikasi Aman**: Menggunakan Laravel Sanctum untuk keamanan API. Login & Register wajib untuk mengakses fitur tiket.

---

## 📡 API Endpoints (Ringkasan)

**Base URL:** `http://localhost:8000/api`

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/events` | List semua event (Public) |
| `POST` | `/events` | Buat event baru (Admin Only) |
| `GET` | `/my-tickets` | List tiket user (Protected: User) |
| `POST` | `/tickets` | Daftar event (Protected: User) |

*Catatan: Dokumentasi lengkap API dan cara menggunakan Postman tersedia di file `postman_guide.md` (jika ada) atau artifact terpisah.*

---

## 🛠️ Catatan Pengembang
- **QR Code**: Digenerate otomatis saat tiket dibuat di backend.
- **Sertifikat**: Link sertifikat disimpan di tabel `events`. Fitur download hanya aktif jika admin menandai `is_attended = 1` pada tiket user di database.
- **Gambar Event**: Disimpan di `storage/app/public/events`.
- **Bukti Bayar**: Disimpan di `storage/app/public/payments`.

---

## 👤 Akun Testing (Seeder)
- **User**: `test@example.com` (Password: `password`)
- **Admin**: `admin@ganesha.com` (Password: `password`) - *Jalankan `php artisan migrate:fresh --seed` untuk membuat akun ini.*

---

## � Fitur Admin Panel

Halaman Admin dapat diakses melalui route `/admin`. Fitur ini memungkinkan administrator untuk mengelola event, pendaftar, dan absensi hari-H.

### 1. Kelola Kegiatan (Manage Events)
Route: `/admin/events`
Menu ini berfungsi untuk **CRUD Event** (Create, Read, Update, Delete).

- **Tampilan Utama**: Grid Cards event yang sudah dibuat.
- **Fitur**:
    - **Buat Event Baru**: Form lengkap untuk judul, deskripsi, waktu, lokasi, harga (Gratis/Berbayar), info pembayaran, dan upload banner.
    - **Sertifikat Digital**: Pada menu **Edit Event**, admin dapat memasukkan link GDrive/Sertifikat (`certificate_link`). Link ini akan muncul di dashboard user yang hadir.
    - **Edit & Hapus**: Mengubah informasi event yang sudah berjalan atau menghapusnya.

### 2. Kelola Pendaftar (Manage Registrations)
Route: `/admin/registrations`
Menu ini digunakan untuk memverifikasi pembayaran peserta event berbayar.

- **Alur**: Pilih Event -> Lihat Tabel Pendaftar.
- **Fitur Table**:
    - Menampilkan Nama, Email, dan Status Tiket.
    - **Cek Bukti Bayar**: Klik tombol "Lihat" (ikon mata) untuk melihat foto bukti transfer.
    - **Verifikasi**:
        - ✅ **Konfirmasi**: Mengubah status menjadi `Confirmed` (Tiket QR Code aktif).
        - ❌ **Tolak**: Mengubah status menjadi `Rejected` (Jika bukti bayar salah).

### 3. Absensi & QR Scanner (Attendance)
Route: `/admin/attendance`
Halaman ini dirancang untuk petugas registrasi saat hari-H acara.

- **Cara Kerja**:
    1. Pilih Event yang sedang berlangsung.
    2. Browser akan meminta izin akses **Kamera**.
    3. Arahkan kamera ke **QR Code Tiket** peserta.
    4. Sistem otomatis memverifikasi ke server.
- **Status Scan**:
    - 🟢 **Sukses**: Data valid, peserta ditandai hadir (`is_attended = 1`).
    - 🟡 **Peringatan**: Peserta sudah scan sebelumnya (sudah masuk).
    - 🔴 **Gagal**: QR Code tidak valid atau beda event.
- **Input Manual**: Jika kamera bermasalah, admin bisa mengetik Kode Tiket (misal `TCKT-123`) secara manual.

---

## 🏆 Sertifikat Otomatis (New Feature)

Fitur baru memungkinkan sistem menghasilkan sertifikat secara otomatis dengan nama peserta tercetak di atasnya.

### Cara Menggunakan (Admin)
1. Buka menu **Manage Events**.
2. Edit event yang diinginkan.
3. Upload **Template Sertifikat** (Gambar kosong, format PNG/JPG).
4. Saat event selesai, klik tombol **"Selesaikan Event"** (Complete Event).
5. Sistem akan menandai event sebagai selesai dan mengaktifkan download sertifikat bagi peserta yang hadir (`is_attended = 1`).

### Cara Menggunakan (User)
1. Pastikan sudah hadir dan discan tiketnya oleh panitia.
2. Buka menu **Sertifikat Saya**.
3. Klik **Download**. Sistem akan menempelkan nama Anda di atas template yang diupload admin.

---

## 🔄 Panduan Update Developer (Desember 2025)

Jika Anda baru saja menarik perubahan terbaru dari repository (`git pull`), jalankan perintah berikut untuk menyinkronkan project:

### 1. Update Backend
Folder: `be-ganesha-event`

```bash
# 1. Install Library baru (Intervention Image)
composer install

# 2. Update Database (Kolom baru: certificate_template, is_completed)
php artisan migrate

# 3. Pastikan Font tersedia
# File 'public/fonts/OpenSans-Bold.ttf' harus ada untuk generate sertifikat.
# Jika tidak ada, download font ttf apa saja dan rename menjadi OpenSans-Bold.ttf
```

### 2. Update Frontend
Folder: `fe-ganesha-event`

```bash
# 1. Install dependencies baru (jika ada)
npm install

# 2. Jalankan ulang server
npm run dev
```
