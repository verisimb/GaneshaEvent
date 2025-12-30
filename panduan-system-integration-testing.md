# Panduan System Integration Testing (SIT)
## Website Ganesha Event

---

## 📋 Daftar Isi
1. [Pengantar](#pengantar)
2. [Persiapan Testing](#persiapan-testing)
3. [Skenario Testing](#skenario-testing)
4. [Template Dokumentasi](#template-dokumentasi)
5. [Cara Eksekusi Testing](#cara-eksekusi-testing)

---

## Pengantar

### Apa itu System Integration Testing?
System Integration Testing (SIT) adalah pengujian yang memverifikasi bahwa berbagai komponen sistem bekerja bersama dengan benar. Dalam konteks Ganesha Event, SIT menguji integrasi antara:
- **Frontend (React)** ↔ **Backend API (Laravel)** ↔ **Database (MySQL)**

### Tujuan SIT
- Memastikan aliran data antar komponen berjalan dengan benar
- Memverifikasi bahwa fitur end-to-end berfungsi sesuai spesifikasi
- Mendeteksi masalah integrasi sebelum deployment

---

## Persiapan Testing

### 1. Setup Environment Lokal

**Backend (Laravel):**
```bash
cd be-ganesha-event
php artisan serve
# Akan berjalan di http://localhost:8000
```

**Frontend (React):**
```bash
cd fe-ganesha-event
npm run dev
# Akan berjalan di http://localhost:5173
```

**Database:**
- Pastikan MySQL sudah running
- Database sudah di-migrate dan di-seed
```bash
cd be-ganesha-event
php artisan migrate:fresh --seed
```

### 2. Persiapan Data Testing

**Akun Admin:**
- Email: `admin@example.com`
- Password: `password`

**Akun User/Mahasiswa:**
- Email: `user@example.com`
- Password: `password`

*(Sesuaikan dengan data seeder Anda)*

### 3. Tools yang Dibutuhkan
- Browser (Chrome/Firefox dengan DevTools)
- Postman/Insomnia (opsional, untuk testing API langsung)
- Screenshot tool
- Spreadsheet atau markdown editor untuk dokumentasi

---

## Skenario Testing

### Skenario 1: Siklus Autentikasi Lengkap

**Tujuan:** Memverifikasi bahwa user dapat register, login, dan mengakses dashboard

**Alur Data:**
```
User Input (FE) → POST /api/register → DB Insert → Return Success → 
Redirect ke Login → POST /api/login → Generate Token → 
Store Token → GET /api/me → Return User Data → Show Dashboard
```

**Langkah Testing:**

1. **Register User Baru**
   - Buka `http://localhost:5173/register`
   - Isi form dengan data:
     - Nama: `Test User SIT`
     - Email: `testuser@sit.com`
     - NIM: `123456789`
     - Phone: `081234567890`
     - Password: `password123`
     - Confirm Password: `password123`
   - Klik tombol "Register"
   - **Expected:** Redirect ke halaman login dengan notifikasi sukses

2. **Verifikasi Data di Database**
   - Buka database MySQL
   - Query: `SELECT * FROM users WHERE email = 'testuser@sit.com'`
   - **Expected:** Data user ditemukan dengan role 'user'

3. **Login dengan Akun Baru**
   - Di halaman login, masukkan:
     - Email: `testuser@sit.com`
     - Password: `password123`
   - Klik "Login"
   - **Expected:** Redirect ke dashboard, nama user muncul di navbar

4. **Verifikasi Token Authentication**
   - Buka DevTools → Application/Storage → Local Storage
   - **Expected:** Token tersimpan dengan key `auth-token` atau sesuai implementasi

5. **Akses Protected Route**
   - Navigasi ke `/dashboard`
   - **Expected:** Halaman dashboard dapat diakses tanpa redirect ke login

6. **Logout**
   - Klik tombol "Logout"
   - **Expected:** Token terhapus, redirect ke halaman utama

**Dokumentasi Hasil:**
| Step | Action | Expected Result | Actual Result | Status | Screenshot |
|------|--------|-----------------|---------------|--------|------------|
| 1 | Register user baru | Redirect ke login | ✓ Sesuai | PASS | [link] |
| 2 | Data tersimpan di DB | User ditemukan | ✓ Sesuai | PASS | [link] |
| 3 | Login berhasil | Redirect ke dashboard | ✓ Sesuai | PASS | [link] |
| 4 | Token tersimpan | Token ada di localStorage | ✓ Sesuai | PASS | [link] |
| 5 | Akses dashboard | Halaman terbuka | ✓ Sesuai | PASS | [link] |
| 6 | Logout | Token terhapus | ✓ Sesuai | PASS | [link] |

---

### Skenario 2: Siklus Pendaftaran Event Gratis

**Tujuan:** Memverifikasi bahwa user dapat mendaftar event gratis dan mendapatkan tiket

**Alur Data:**
```
User Login → Browse Events (GET /api/events) → 
Select Event → POST /api/tickets → DB Insert → 
Return Ticket Data → Show in Dashboard → Generate QR Code
```

**Langkah Testing:**

1. **Login sebagai User**
   - Login dengan akun: `testuser@sit.com`

2. **Browse Event List**
   - Buka halaman utama atau `/events`
   - **Expected:** Daftar event muncul dengan informasi lengkap

3. **Pilih Event Gratis**
   - Cari event dengan harga Rp 0 (gratis)
   - Klik event untuk melihat detail
   - **Expected:** Halaman detail event terbuka dengan tombol "Daftar"

4. **Daftar Event**
   - Klik tombol "Daftar" atau "Register"
   - **Expected:** 
     - Notifikasi sukses muncul
     - Tombol berubah menjadi "Sudah Terdaftar" atau disabled

5. **Verifikasi Data di Database**
   - Query: `SELECT * FROM tickets WHERE user_id = [user_id] AND event_id = [event_id]`
   - **Expected:** 
     - Data ticket ditemukan
     - Status: `dikonfirmasi` (karena gratis, langsung dikonfirmasi)
     - `ticket_code` ter-generate (UUID/unique string)

6. **Cek Dashboard User**
   - Navigasi ke `/dashboard` atau `/my-tickets`
   - **Expected:** 
     - Tiket muncul di daftar "My Tickets"
     - Status: "Dikonfirmasi"
     - QR Code ter-generate dan tampil

7. **Verifikasi QR Code**
   - Scan QR Code dengan QR reader
   - **Expected:** QR Code berisi `ticket_code` yang valid

**Dokumentasi Hasil:**
| Step | Action | Expected Result | Actual Result | Status | Screenshot |
|------|--------|-----------------|---------------|--------|------------|
| 1 | Login user | Dashboard terbuka | ✓ Sesuai | PASS | [link] |
| 2 | Browse events | Event list muncul | ✓ Sesuai | PASS | [link] |
| 3 | Buka detail event | Detail lengkap tampil | ✓ Sesuai | PASS | [link] |
| 4 | Klik daftar | Notifikasi sukses | ✓ Sesuai | PASS | [link] |
| 5 | Data di DB | Ticket tersimpan | ✓ Sesuai | PASS | [link] |
| 6 | Tiket di dashboard | Tiket muncul dengan QR | ✓ Sesuai | PASS | [link] |
| 7 | QR Code valid | Berisi ticket_code | ✓ Sesuai | PASS | [link] |

---

### Skenario 3: Siklus Pendaftaran Event Berbayar

**Tujuan:** Memverifikasi alur pendaftaran event berbayar dengan upload bukti pembayaran dan verifikasi admin

**Alur Data:**
```
User Daftar Event Berbayar → POST /api/tickets (status: menunggu_konfirmasi) → 
Upload Bukti Bayar → PUT /api/tickets/{id} → 
Admin Verifikasi → PUT /api/tickets/{id}/status → 
Status = dikonfirmasi → Generate QR Code → Notifikasi User
```

**Langkah Testing:**

1. **Login sebagai User**
   - Login dengan: `testuser@sit.com`

2. **Pilih Event Berbayar**
   - Browse event dengan harga > 0
   - Klik detail event
   - **Expected:** Info pembayaran muncul (Bank, No. Rek, Pemilik)

3. **Daftar Event Berbayar**
   - Klik "Daftar"
   - **Expected:** 
     - Modal/form upload bukti pembayaran muncul
     - Atau redirect ke halaman upload

4. **Upload Bukti Pembayaran**
   - Upload file gambar (JPG/PNG)
   - Submit
   - **Expected:** 
     - Upload berhasil
     - Notifikasi "Menunggu verifikasi admin"

5. **Verifikasi Data di Database**
   - Query: `SELECT * FROM tickets WHERE user_id = [user_id] AND event_id = [event_id]`
   - **Expected:**
     - Status: `menunggu_konfirmasi`
     - `payment_proof`: path file tersimpan
     - QR Code belum ada/tidak aktif

6. **Login sebagai Admin**
   - Logout dari user
   - Login dengan: `admin@example.com`

7. **Verifikasi Pembayaran**
   - Navigasi ke halaman admin/event management
   - Pilih event yang bersangkutan
   - Lihat daftar pendaftar
   - **Expected:** User `testuser@sit.com` muncul dengan status "Menunggu Konfirmasi"

8. **Approve Pembayaran**
   - Klik tombol "Verifikasi" atau "Approve"
   - **Expected:** 
     - Status berubah menjadi "Dikonfirmasi"
     - Notifikasi sukses

9. **Verifikasi Data di Database (Setelah Approve)**
   - Query: `SELECT * FROM tickets WHERE id = [ticket_id]`
   - **Expected:**
     - Status: `dikonfirmasi`
     - `ticket_code`: ter-generate

10. **Login Kembali sebagai User**
    - Logout admin, login sebagai user
    - Cek dashboard/my tickets
    - **Expected:**
      - Status tiket: "Dikonfirmasi"
      - QR Code muncul dan dapat di-scan

**Dokumentasi Hasil:**
| Step | Action | Expected Result | Actual Result | Status | Screenshot |
|------|--------|-----------------|---------------|--------|------------|
| 1 | Login user | Dashboard terbuka | ✓ Sesuai | PASS | [link] |
| 2 | Pilih event berbayar | Info pembayaran tampil | ✓ Sesuai | PASS | [link] |
| 3 | Klik daftar | Form upload muncul | ✓ Sesuai | PASS | [link] |
| 4 | Upload bukti bayar | Upload sukses | ✓ Sesuai | PASS | [link] |
| 5 | Data di DB | Status: menunggu_konfirmasi | ✓ Sesuai | PASS | [link] |
| 6 | Login admin | Admin dashboard terbuka | ✓ Sesuai | PASS | [link] |
| 7 | Lihat pendaftar | User muncul di list | ✓ Sesuai | PASS | [link] |
| 8 | Approve pembayaran | Status berubah | ✓ Sesuai | PASS | [link] |
| 9 | Data di DB updated | Status: dikonfirmasi | ✓ Sesuai | PASS | [link] |
| 10 | User cek tiket | QR Code muncul | ✓ Sesuai | PASS | [link] |

---

### Skenario 4: Manajemen Event oleh Admin (CRUD)

**Tujuan:** Memverifikasi bahwa admin dapat mengelola event (Create, Read, Update, Delete)

**Alur Data:**
```
Admin Login → POST /api/events (Create) → DB Insert → 
GET /api/events (Read) → PUT /api/events/{id} (Update) → 
DELETE /api/events/{id} → DB Delete
```

**Langkah Testing:**

1. **Login sebagai Admin**
   - Login dengan: `admin@example.com`

2. **Create Event Baru**
   - Navigasi ke halaman "Create Event" atau "Tambah Event"
   - Isi form:
     - Title: `Event SIT Testing`
     - Slug: `event-sit-testing`
     - Description: `Event untuk testing SIT`
     - Date: `2025-01-15`
     - Time: `10:00`
     - Location: `Aula Kampus`
     - Organizer: `Panitia SIT`
     - Price: `0` (gratis)
     - Upload banner/image
   - Submit
   - **Expected:** 
     - Notifikasi sukses
     - Redirect ke daftar event atau detail event

3. **Verifikasi Event di Database**
   - Query: `SELECT * FROM events WHERE slug = 'event-sit-testing'`
   - **Expected:** Event ditemukan dengan data sesuai input

4. **Verifikasi Event di Frontend Public**
   - Logout dari admin
   - Buka halaman utama (tanpa login)
   - **Expected:** Event "Event SIT Testing" muncul di daftar event publik

5. **Login Kembali sebagai Admin**

6. **Update Event**
   - Navigasi ke daftar event admin
   - Pilih event "Event SIT Testing"
   - Klik "Edit"
   - Ubah:
     - Title: `Event SIT Testing (Updated)`
     - Price: `50000`
   - Submit
   - **Expected:** 
     - Notifikasi sukses
     - Data ter-update

7. **Verifikasi Update di Database**
   - Query: `SELECT * FROM events WHERE slug = 'event-sit-testing'`
   - **Expected:** 
     - Title: `Event SIT Testing (Updated)`
     - Price: `50000`

8. **Verifikasi Update di Frontend**
   - Buka detail event di halaman publik
   - **Expected:** Perubahan title dan harga tampil

9. **Delete Event**
   - Kembali ke admin panel
   - Pilih event "Event SIT Testing (Updated)"
   - Klik "Delete" atau "Hapus"
   - Konfirmasi penghapusan
   - **Expected:** 
     - Notifikasi sukses
     - Event hilang dari daftar

10. **Verifikasi Delete di Database**
    - Query: `SELECT * FROM events WHERE slug = 'event-sit-testing'`
    - **Expected:** Event tidak ditemukan (soft delete) atau benar-benar terhapus

11. **Verifikasi Delete di Frontend**
    - Buka halaman publik
    - **Expected:** Event tidak muncul lagi

**Dokumentasi Hasil:**
| Step | Action | Expected Result | Actual Result | Status | Screenshot |
|------|--------|-----------------|---------------|--------|------------|
| 1 | Login admin | Admin dashboard terbuka | ✓ Sesuai | PASS | [link] |
| 2 | Create event | Event tersimpan | ✓ Sesuai | PASS | [link] |
| 3 | Data di DB | Event ditemukan | ✓ Sesuai | PASS | [link] |
| 4 | Event di frontend | Event muncul publik | ✓ Sesuai | PASS | [link] |
| 5 | Login admin | Dashboard terbuka | ✓ Sesuai | PASS | [link] |
| 6 | Update event | Data ter-update | ✓ Sesuai | PASS | [link] |
| 7 | Data di DB updated | Perubahan tersimpan | ✓ Sesuai | PASS | [link] |
| 8 | Update di frontend | Perubahan tampil | ✓ Sesuai | PASS | [link] |
| 9 | Delete event | Event terhapus | ✓ Sesuai | PASS | [link] |
| 10 | Data di DB deleted | Event tidak ada | ✓ Sesuai | PASS | [link] |
| 11 | Delete di frontend | Event tidak muncul | ✓ Sesuai | PASS | [link] |

---

### Skenario 5: Validasi Kuota Event Penuh

**Tujuan:** Memverifikasi bahwa sistem menolak pendaftaran ketika kuota event sudah penuh

**Alur Data:**
```
User Daftar Event → Check Kuota di DB → 
If (Jumlah Pendaftar >= Kuota) → Return Error → 
Show Error Message di Frontend
```

**Langkah Testing:**

1. **Setup Event dengan Kuota Terbatas**
   - Login sebagai admin
   - Create event baru atau edit event existing
   - Set kuota: `2` (untuk testing mudah)
   - Simpan

2. **Daftar User Pertama**
   - Login sebagai user1
   - Daftar event tersebut
   - **Expected:** Berhasil terdaftar

3. **Verifikasi Jumlah Pendaftar**
   - Query: `SELECT COUNT(*) FROM tickets WHERE event_id = [event_id] AND status = 'dikonfirmasi'`
   - **Expected:** Count = 1

4. **Daftar User Kedua**
   - Logout, login sebagai user2 (atau buat akun baru)
   - Daftar event yang sama
   - **Expected:** Berhasil terdaftar

5. **Verifikasi Kuota Penuh**
   - Query: `SELECT COUNT(*) FROM tickets WHERE event_id = [event_id] AND status = 'dikonfirmasi'`
   - **Expected:** Count = 2 (kuota penuh)

6. **Coba Daftar User Ketiga (Seharusnya Ditolak)**
   - Logout, login sebagai user3 (atau buat akun baru)
   - Coba daftar event yang sama
   - **Expected:** 
     - Pendaftaran ditolak
     - Error message: "Event sudah penuh" atau "Kuota habis"
     - Tombol "Daftar" disabled atau tidak muncul

7. **Verifikasi Data di Database**
   - Query: `SELECT COUNT(*) FROM tickets WHERE event_id = [event_id] AND status = 'dikonfirmasi'`
   - **Expected:** Count tetap = 2 (tidak bertambah)

8. **Verifikasi UI di Detail Event**
   - Buka detail event (tanpa login atau dengan user3)
   - **Expected:** 
     - Badge "Event Penuh" atau "Sold Out" muncul
     - Tombol daftar disabled/tidak ada

**Dokumentasi Hasil:**
| Step | Action | Expected Result | Actual Result | Status | Screenshot |
|------|--------|-----------------|---------------|--------|------------|
| 1 | Setup event kuota 2 | Event tersimpan | ✓ Sesuai | PASS | [link] |
| 2 | User1 daftar | Berhasil | ✓ Sesuai | PASS | [link] |
| 3 | Cek DB | Count = 1 | ✓ Sesuai | PASS | [link] |
| 4 | User2 daftar | Berhasil | ✓ Sesuai | PASS | [link] |
| 5 | Cek DB | Count = 2 | ✓ Sesuai | PASS | [link] |
| 6 | User3 coba daftar | Ditolak dengan error | ✓ Sesuai | PASS | [link] |
| 7 | Cek DB | Count tetap 2 | ✓ Sesuai | PASS | [link] |
| 8 | UI event penuh | Badge/disabled button | ✓ Sesuai | PASS | [link] |

---

### Skenario 6: Download Sertifikat

**Tujuan:** Memverifikasi bahwa user yang hadir dapat mengunduh sertifikat setelah event selesai

**Alur Data:**
```
Event Selesai (is_completed = true) → User Hadir (is_attended = true) → 
GET /api/tickets/{id}/certificate/download → 
Generate PDF dengan Template → Return File
```

**Langkah Testing:**

1. **Setup Event yang Sudah Selesai**
   - Login sebagai admin
   - Edit event (atau buat event baru)
   - Set `is_completed` = true (atau ubah di database langsung)
   - Upload certificate template (jika ada fitur ini)

2. **Setup User yang Sudah Hadir**
   - Pastikan ada tiket dengan:
     - `event_id` = event yang sudah selesai
     - `status` = `dikonfirmasi`
     - `is_attended` = `true`
   - Jika perlu, update manual di database:
     ```sql
     UPDATE tickets 
     SET is_attended = true 
     WHERE id = [ticket_id]
     ```

3. **Login sebagai User**
   - Login dengan user yang memiliki tiket tersebut

4. **Navigasi ke Dashboard/My Tickets**
   - Buka halaman tiket saya
   - **Expected:** 
     - Tiket event yang sudah selesai muncul
     - Tombol "Download Sertifikat" atau "Download Certificate" aktif

5. **Download Sertifikat**
   - Klik tombol download
   - **Expected:** 
     - File PDF ter-download
     - Nama file: `certificate-[event-slug]-[user-name].pdf` (atau sesuai format)

6. **Verifikasi Isi Sertifikat**
   - Buka file PDF
   - **Expected:** 
     - Nama user tercetak dengan benar
     - Nama event tercetak dengan benar
     - Template sertifikat sesuai

7. **Test Negative Case: User Tidak Hadir**
   - Buat tiket lain dengan `is_attended` = `false`
   - Login dengan user tersebut
   - **Expected:** 
     - Tombol download tidak muncul atau disabled
     - Atau muncul pesan "Anda belum hadir di event ini"

8. **Test Negative Case: Event Belum Selesai**
   - Buat tiket untuk event yang belum selesai (`is_completed` = false)
   - **Expected:** 
     - Tombol download tidak muncul
     - Atau muncul pesan "Sertifikat belum tersedia"

**Dokumentasi Hasil:**
| Step | Action | Expected Result | Actual Result | Status | Screenshot |
|------|--------|-----------------|---------------|--------|------------|
| 1 | Setup event selesai | is_completed = true | ✓ Sesuai | PASS | [link] |
| 2 | Setup user hadir | is_attended = true | ✓ Sesuai | PASS | [link] |
| 3 | Login user | Dashboard terbuka | ✓ Sesuai | PASS | [link] |
| 4 | Lihat my tickets | Tombol download muncul | ✓ Sesuai | PASS | [link] |
| 5 | Download sertifikat | PDF ter-download | ✓ Sesuai | PASS | [link] |
| 6 | Buka PDF | Data benar | ✓ Sesuai | PASS | [link] |
| 7 | User tidak hadir | Tombol disabled/tidak ada | ✓ Sesuai | PASS | [link] |
| 8 | Event belum selesai | Tombol tidak muncul | ✓ Sesuai | PASS | [link] |

---

### Skenario 7: Fitur Search/Filter Event

**Tujuan:** Memverifikasi bahwa user dapat mencari event berdasarkan keyword

**Alur Data:**
```
User Input Search → GET /api/events?search=[keyword] → 
Filter di Backend → Return Filtered Events → Display di Frontend
```

**Langkah Testing:**

1. **Persiapan Data**
   - Pastikan ada beberapa event dengan title berbeda:
     - "Workshop React"
     - "Seminar AI"
     - "Kompetisi Programming"

2. **Akses Halaman Event**
   - Buka halaman utama atau `/events`
   - **Expected:** Semua event muncul

3. **Search dengan Keyword Spesifik**
   - Ketik "React" di search box
   - **Expected:** 
     - Hanya event "Workshop React" yang muncul
     - Event lain hilang dari tampilan

4. **Search dengan Keyword Umum**
   - Ketik "Seminar"
   - **Expected:** Hanya event "Seminar AI" yang muncul

5. **Search dengan Keyword Tidak Ditemukan**
   - Ketik "Blockchain"
   - **Expected:** 
     - Tidak ada event yang muncul
     - Pesan "Tidak ada event ditemukan" atau "No results"

6. **Clear Search**
   - Hapus keyword atau klik tombol clear
   - **Expected:** Semua event muncul kembali

**Dokumentasi Hasil:**
| Step | Action | Expected Result | Actual Result | Status | Screenshot |
|------|--------|-----------------|---------------|--------|------------|
| 1 | Persiapan data | 3 event tersedia | ✓ Sesuai | PASS | [link] |
| 2 | Buka halaman event | Semua event muncul | ✓ Sesuai | PASS | [link] |
| 3 | Search "React" | Hanya 1 event muncul | ✓ Sesuai | PASS | [link] |
| 4 | Search "Seminar" | Hanya 1 event muncul | ✓ Sesuai | PASS | [link] |
| 5 | Search tidak ada | No results message | ✓ Sesuai | PASS | [link] |
| 6 | Clear search | Semua event kembali | ✓ Sesuai | PASS | [link] |

---

## Template Dokumentasi

### Template Tabel Ringkasan SIT

Gunakan template ini untuk merangkum hasil semua skenario:

```markdown
## Hasil System Integration Testing

| No | Skenario Integrasi | Alur Data | Hasil | Keterangan |
|----|-------------------|-----------|-------|------------|
| 1  | Siklus Autentikasi Lengkap | User (FE) → POST /api/register → DB Insert → POST /api/login → Token → Dashboard | **PASS** | Semua tahap autentikasi berjalan lancar |
| 2  | Pendaftaran Event Gratis | User → GET /api/events → POST /api/tickets → DB Insert → QR Generate | **PASS** | Tiket langsung dikonfirmasi, QR muncul |
| 3  | Pendaftaran Event Berbayar | User → POST /api/tickets → Upload Proof → Admin Verify → Status Update → QR Generate | **PASS** | Alur verifikasi admin berfungsi dengan baik |
| 4  | CRUD Event oleh Admin | Admin → POST/PUT/DELETE /api/events → DB Update → Frontend Sync | **PASS** | Semua operasi CRUD berhasil |
| 5  | Validasi Kuota Event | User → POST /api/tickets → Check Kuota → Reject if Full | **PASS** | Sistem menolak pendaftaran saat kuota penuh |
| 6  | Download Sertifikat | User → GET /api/tickets/{id}/certificate → Generate PDF → Download | **PASS** | Sertifikat ter-generate dengan data benar |
| 7  | Search/Filter Event | User → GET /api/events?search=keyword → Filter → Display | **PASS** | Pencarian event berfungsi akurat |
```

### Template Screenshot Documentation

Buat folder untuk menyimpan screenshot:
```
/UAS/
  /screenshots/
    /sit/
      /skenario-1-autentikasi/
        01-register-form.png
        02-register-success.png
        03-login-form.png
        04-dashboard.png
      /skenario-2-event-gratis/
        01-event-list.png
        02-event-detail.png
        03-register-success.png
        04-my-tickets.png
        05-qr-code.png
      /skenario-3-event-berbayar/
        ...
```

### Template Laporan Detail per Skenario

```markdown
### Skenario [Nomor]: [Nama Skenario]

**Tanggal Testing:** [DD/MM/YYYY]  
**Tester:** [Nama Anda]  
**Environment:** Local Development

**Tujuan:**
[Jelaskan tujuan testing]

**Prasyarat:**
- [List prasyarat]

**Langkah Eksekusi:**
1. [Step 1]
2. [Step 2]
...

**Hasil:**
| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| 1 | ... | ... | PASS |

**Screenshot:**
![Step 1](screenshots/sit/skenario-x/01-step.png)

**Kesimpulan:**
[PASS/FAIL] - [Penjelasan singkat]

**Bug/Issue (jika ada):**
- [Deskripsi bug]
- Severity: [High/Medium/Low]
- Status: [Open/Fixed]
```

---

## Cara Eksekusi Testing

### Metode 1: Manual Testing (Direkomendasikan untuk Pemula)

1. **Buat Checklist**
   - Print atau buka panduan ini di layar kedua
   - Siapkan spreadsheet untuk dokumentasi

2. **Jalankan Skenario Satu per Satu**
   - Ikuti langkah-langkah secara berurutan
   - Screenshot setiap step penting
   - Catat hasil di tabel

3. **Dokumentasi**
   - Simpan screenshot dengan nama yang jelas
   - Isi tabel hasil testing
   - Tulis kesimpulan

### Metode 2: Automated Testing dengan Postman

1. **Setup Postman Collection**
   - Buat collection "Ganesha Event SIT"
   - Tambahkan request untuk setiap endpoint

2. **Buat Test Scripts**
   ```javascript
   // Contoh test script di Postman
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });
   
   pm.test("Response has token", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData.token).to.exist;
   });
   ```

3. **Run Collection**
   - Jalankan collection secara berurutan
   - Export hasil testing

### Metode 3: Automated Testing dengan Laravel Feature Test

1. **Buat Test File**
   ```bash
   cd be-ganesha-event
   php artisan make:test SystemIntegrationTest
   ```

2. **Tulis Test Cases**
   ```php
   public function test_complete_registration_flow()
   {
       // Register
       $response = $this->postJson('/api/register', [
           'name' => 'Test User',
           'email' => 'test@sit.com',
           'password' => 'password123',
           // ...
       ]);
       
       $response->assertStatus(201);
       $this->assertDatabaseHas('users', [
           'email' => 'test@sit.com'
       ]);
       
       // Login
       $loginResponse = $this->postJson('/api/login', [
           'email' => 'test@sit.com',
           'password' => 'password123'
       ]);
       
       $loginResponse->assertStatus(200)
                    ->assertJsonStructure(['token']);
   }
   ```

3. **Run Tests**
   ```bash
   php artisan test --filter SystemIntegrationTest
   ```

---

## Tips & Best Practices

### 1. Persiapan
- ✅ Gunakan data dummy yang konsisten
- ✅ Reset database sebelum testing (`php artisan migrate:fresh --seed`)
- ✅ Gunakan browser incognito untuk menghindari cache

### 2. Eksekusi
- ✅ Test satu skenario sampai selesai sebelum lanjut ke skenario berikutnya
- ✅ Screenshot setiap step penting (terutama yang menunjukkan hasil)
- ✅ Catat waktu eksekusi (untuk performance testing nanti)

### 3. Dokumentasi
- ✅ Gunakan nama file screenshot yang deskriptif
- ✅ Tambahkan timestamp pada dokumentasi
- ✅ Catat versi aplikasi yang di-test

### 4. Bug Reporting
- ✅ Jika menemukan bug, dokumentasikan dengan detail:
  - Langkah reproduksi
  - Expected vs Actual result
  - Screenshot/video
  - Error message (jika ada)

---

## Checklist Eksekusi

Gunakan checklist ini untuk memastikan semua skenario sudah di-test:

- [ ] Skenario 1: Siklus Autentikasi Lengkap
- [ ] Skenario 2: Pendaftaran Event Gratis
- [ ] Skenario 3: Pendaftaran Event Berbayar
- [ ] Skenario 4: CRUD Event oleh Admin
- [ ] Skenario 5: Validasi Kuota Event
- [ ] Skenario 6: Download Sertifikat
- [ ] Skenario 7: Search/Filter Event
- [ ] Dokumentasi screenshot lengkap
- [ ] Tabel hasil testing terisi
- [ ] Kesimpulan ditulis

---

## Contoh Output untuk Laporan

Setelah selesai testing, Anda bisa copy hasil ini ke laporan:

```markdown
### A. System Integration Testing

Pengujian integrasi dilakukan untuk memverifikasi bahwa komponen Frontend (React), Backend API (Laravel), dan Database (MySQL) bekerja bersama dengan baik. Pengujian dilakukan secara manual dengan mengikuti skenario end-to-end yang mencerminkan alur bisnis utama aplikasi.

**Tanggal Pengujian:** 30 Desember 2025  
**Environment:** Local Development (localhost)  
**Tester:** [Nama Anda]

**Hasil Pengujian:**

| No | Skenario Integrasi | Alur Data | Hasil | Keterangan |
|----|-------------------|-----------|-------|------------|
| 1  | Siklus Autentikasi Lengkap | User (FE) → POST /api/register → DB Insert → POST /api/login → Generate Token → Store Token → GET /api/me → Dashboard | **PASS** | Semua tahap autentikasi berjalan lancar. Token tersimpan di localStorage dan dapat digunakan untuk akses protected routes. |
| 2  | Pendaftaran Event Gratis | User Login → GET /api/events → Select Event → POST /api/tickets → DB Insert → Return Success → QR Code Generate | **PASS** | Tiket langsung dikonfirmasi untuk event gratis. QR Code ter-generate otomatis dan muncul di dashboard user. |
| 3  | Pendaftaran Event Berbayar dengan Verifikasi | User → POST /api/tickets (status: menunggu) → Upload Proof → Admin Login → PUT /api/tickets/{id}/status → Status = dikonfirmasi → QR Generate | **PASS** | Alur verifikasi admin berfungsi dengan baik. Status tiket berubah real-time setelah admin approve. |
| 4  | CRUD Event oleh Admin | Admin → POST /api/events → DB Insert → GET /api/events → PUT /api/events/{id} → DELETE /api/events/{id} | **PASS** | Semua operasi Create, Read, Update, Delete berhasil. Perubahan langsung ter-reflect di frontend public. |
| 5  | Validasi Kuota Event Penuh | User → POST /api/tickets → Backend Check Kuota → If Full Return Error → Frontend Show Message | **PASS** | Sistem berhasil menolak pendaftaran ketika kuota event sudah penuh. Error message informatif ditampilkan. |
| 6  | Download Sertifikat | Event Completed → User Attended → GET /api/tickets/{id}/certificate/download → Generate PDF → Return File | **PASS** | Sertifikat ter-generate dengan data user dan event yang benar. File PDF dapat di-download. |
| 7  | Search/Filter Event | User Input → GET /api/events?search=keyword → Backend Filter → Return Results → Display | **PASS** | Fitur pencarian berfungsi akurat. Hasil filter sesuai dengan keyword yang diinput. |

**Screenshot Dokumentasi:**
- [Skenario 1 - Autentikasi](screenshots/sit/skenario-1/)
- [Skenario 2 - Event Gratis](screenshots/sit/skenario-2/)
- [Skenario 3 - Event Berbayar](screenshots/sit/skenario-3/)
- [Skenario 4 - CRUD Admin](screenshots/sit/skenario-4/)
- [Skenario 5 - Validasi Kuota](screenshots/sit/skenario-5/)
- [Skenario 6 - Sertifikat](screenshots/sit/skenario-6/)
- [Skenario 7 - Search](screenshots/sit/skenario-7/)

**Kesimpulan:**
Semua skenario System Integration Testing berhasil (PASS) dengan total 7 skenario yang diuji. Integrasi antara Frontend, Backend API, dan Database berjalan dengan baik tanpa ditemukan bug kritis. Alur data end-to-end berfungsi sesuai dengan spesifikasi yang telah dirancang.
```

---

## Troubleshooting

### Masalah Umum dan Solusi

**1. CORS Error saat Frontend akses Backend**
```
Solusi:
- Pastikan CORS sudah dikonfigurasi di Laravel
- Cek file config/cors.php
- Pastikan frontend URL ada di allowed_origins
```

**2. Token tidak tersimpan di localStorage**
```
Solusi:
- Cek DevTools Console untuk error
- Pastikan response login mengembalikan token
- Cek implementasi Zustand store
```

**3. Upload file gagal**
```
Solusi:
- Cek max upload size di php.ini
- Cek permission folder storage/
- Cek validasi file di backend
```

**4. QR Code tidak muncul**
```
Solusi:
- Cek apakah ticket_code sudah ter-generate
- Cek library qrcode.react sudah terinstall
- Cek console untuk error rendering
```

---

## Penutup

Panduan ini memberikan framework lengkap untuk melakukan System Integration Testing pada aplikasi Ganesha Event. Sesuaikan skenario dengan fitur yang ada di aplikasi Anda.

**Langkah Selanjutnya:**
1. Eksekusi semua skenario testing
2. Dokumentasikan hasil dengan screenshot
3. Buat tabel ringkasan
4. Masukkan ke laporan akhir
5. Lanjut ke White Box (Performance) Testing

**Kontak:**
Jika ada pertanyaan atau menemukan skenario yang perlu ditambahkan, silakan diskusikan dengan dosen pembimbing atau tim.

---

**Good Luck! 🚀**
