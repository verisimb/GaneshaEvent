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
4.  **Auth Bypass (Dev Mode)**: Saat ini, endpoint event dan tiket bersifat publik untuk memudahkan testing, namun endpoint login/register tetap tersedia.

---

## 📡 API Endpoints (Ringkasan)

**Base URL:** `http://localhost:8000/api`

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/events` | List semua event |
| `POST` | `/events` | Buat event baru (Dev Mode: Public) |
| `GET` | `/my-tickets` | List tiket user (Dev Mode: Hardcoded User ID 1) |
| `POST` | `/tickets` | Daftar event (Body: `event_id`, `payment_proof`) |

*Catatan: Dokumentasi lengkap API dan cara menggunakan Postman tersedia di file `postman_guide.md` (jika ada) atau artifact terpisah.*

---

## 🛠️ Catatan Pengembang
- **QR Code**: Digenerate otomatis saat tiket dibuat di backend.
- **Sertifikat**: Link sertifikat disimpan di tabel `events`. Fitur download hanya aktif jika admin menandai `is_attended = 1` pada tiket user di database.
- **Gambar Event**: Disimpan di `storage/app/public/events`.
- **Bukti Bayar**: Disimpan di `storage/app/public/payments`.

---

## 👤 Akun Testing (Seeder)
- **User**: `test@example.com` (Password default factory Laravel / 'password')
- **Admin**: (Belum diimplementasikan, akses langsung via Database/API)

---

## 🔮 Future Roadmap: Admin Panel

Panduan pengembangan selanjutnya untuk membangun halaman Admin (**Admin Page**).

### 1. Menu "Kelola Kegiatan" (Manage Events)
Menu ini berfungsi untuk CRUD Event dan mengelola data event.
- **Tampilan Utama**: Menampilkan **Card List** dari event yang sudah dibuat.
- **Fitur Detail**:
    - **Create Event**: Form untuk membuat event baru (Judul, Deskripsi, Tanggal, Jam, Lokasi, Harga, Gambar, Info Bank).
    - **Detail Event (Klik Card)**: Masuk ke halaman detail/edit event.
    - **Edit/Delete**: Admin bisa mengubah info event atau menghapusnya.
    - **Upload Link Sertifikat**: Di halaman detail/edit, sediakan kolom input untuk memasukkan Link GDrive sertifikat (`certificate_link`). Link ini nantinya akan tampil di halaman user yang hadir.

### 2. Menu "Kelola Pendaftar" (Manage Registrations)
Menu ini berfungsi untuk memverifikasi pembayaran dan pendaftaran peserta.
- **Tampilan Utama**: Menampilkan **Card List** (sama seperti Kelola Kegiatan), admin memilih event mana yang ingin dicek.
- **Halaman Detail Pendaftar**:
    - Setelah klik event, muncul **Tabel/List Peserta** yang mendaftar di event tersebut.
    - **Kolom Tabel**: Nama, Email, Tanggal Daftar, Status Pembayaran, **Bukti Bayar (Button Lihat)**.
    - **Action**: Tombol untuk mengubah status tiket:
        - `Menunggu Konfirmasi` -> **`Dikonfirmasi`** (Jika bukti bayar valid).
        - `Ditolak` (Jika bukti bayar tidak valid).

### 3. Menu "Absensi" (Attendance)
Menu ini digunakan saat hari-H acara untuk mencatat kehadiran peserta via QR Code.
- **Tampilan Utama**: List Event yang sedang/akan berlangsung.
- **Fitur Scan**:
    - Saat event diklik, masuk ke mode **Scan QR**.
    - Admin menggunakan kamera/scanner untuk scan QR Code tiket peserta (`TCKT-XXX`).
    - **Sistem**: Jika QR valid, sistem otomatis update kolom `is_attended` di tabel `tickets` menjadi `true`.
- **List Kehadiran**: Di halaman ini juga tampilkan tabel siapa saja yang sudah scan/hadir.
- **Efek**: Peserta yang sudah ditandai hadir (`is_attended = true`) otomatis bisa melihat tombol "Download Sertifikat" di halaman user mereka (asalkan link sertifikat sudah diinput di menu Kelola Kegiatan).
