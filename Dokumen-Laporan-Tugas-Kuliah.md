# LAPORAN PENGEMBANGAN PROYEK  
## Website Ganesha Event

---

## Pendahuluan

### Latar Belakang
Bagian ini menjelaskan konteks permasalahan yang melatarbelakangi pengembangan website **Ganesha Event**.

Di lingkungan kampus, kegiatan atau seminar merupakan salah satu hal penting dalam pengembangan diri mahasiswa. Namun, saat ini pengelolaan event kampus seringkali masih dilakukan secara manual atau semi-manual. Informasi mengenai seminar, workshop, atau kompetisi seringkali hanya tersebar melalui instagram penyelenggara atau pesan di grup WhatsApp yang mudah tenggelam oleh pesan lain. Hal ini menyebabkan penyebaran informasi menjadi tidak merata dan tidak efisien.

Selain itu, proses pendaftaran peserta yang seringkali masih menggunakan Google Form secara terpisah untuk setiap acara menyulitkan panitia dalam melakukan rekapitulasi data dan memverifikasi kehadiran. Bagi mahasiswa, tidak adanya platform terpusat membuat mereka kesulitan mencari informasi event yang sesuai dengan minat mereka, serta tidak memiliki riwayat kegiatan yang pernah diikuti secara otomatis.

Oleh karena itu, diperlukan sebuah solusi berbasis teknologi berupa website Ganesha Event. Solusi ini dirancang untuk menjadi pusat informasi dan manajemen kegiatan kampus yang terintegrasi, memudahkan penyelenggara (admin) dalam mempublikasikan acara, serta memudahkan mahasiswa dalam menemukan dan mendaftar acara dalam satu platform. Pengembangan aplikasi ini juga merupakan implementasi nyata dari keterampilan analisis sistem, perancangan basis data, dan pemrograman web (Full Stack) yang telah dipelajari dalam perkuliahan.

---

### Tujuan Proyek
Bagian ini menjelaskan tujuan utama dari proyek pengembangan website **Ganesha Event**.

Tujuan dari pengembangan sistem ini adalah:
1.  **Sentralisasi Informasi**: Membangun platform terpusat yang mewadahi publikasi seluruh kegiatan atau event di lingkungan kampus, sehingga informasi dapat diakses dengan mudah oleh seluruh mahasiswa.
2.  **Efisiensi Manajemen Event**: Menyediakan alat bagi penyelenggara (admin) untuk mengelola event, memantau jumlah pendaftar, mempermudah absensi peserta, serta memberikan sertifikat otomatis yang dapat di unduh didalam aplikasi
3.  **Kemudahan Akses**: Memberikan kemudahan bagi pengguna (mahasiswa) untuk melihat detail acara, mendaftar secara online, melihat riwayat pendaftaran mereka, dan sertifikat otomatis yang dapat di unduh didalam aplikasi
4.  **Implementasi Teknis**: Mengimplementasikan keterampilan pengembangan aplikasi berbasis web menggunakan arsitektur modern (Frontend React dan Backend Laravel/API) yang sudah dipelajari di mata kuliah pemrograman web

---

### Ruang Lingkup Proyek
Bagian ini menjelaskan batasan proyek agar pengembangan tetap terfokus.

Adapun ruang lingkup pengembangan proyek **Ganesha Event** meliputi:
1.  **Platform Berbasis Web**: Aplikasi dibangun sebagai aplikasi berbasis web yang dapat diakses melalui browser (desktop maupun mobile).
2.  **Fitur Pengguna (User)**:
    - Autentikasi (Register, Login).
    - Melihat daftar event (*Event Listing*) dan detail event.
    - Melakukan pendaftaran event.
    - Mencari event (Search).
    - Mengunduh sertifikat.
3.  **Fitur Admin**:
    - Manajemen event (Create, Read, Update, Delete).
    - Manajemen peserta
4.  **Batasan**:
    - Proyek ini tidak mencakup pembuatan aplikasi *mobile native* (Android/iOS).
    - Pembayaran tiket (jika ada event berbayar) belum diintegrasikan dengan *payment gateway* eksternal pada tahap ini.

---

## Studi Literatur
Bagian ini memuat kajian singkat terhadap konsep dan teknologi yang digunakan dalam pengembangan sistem **Ganesha Event**.

### 1. Sistem Informasi Berbasis Web
Sistem informasi berbasis web adalah sistem informasi yang menggunakan teknologi web (seperti browser dan protokol HTTP) untuk mengirimkan dan mengakses informasi. Aplikasi ini memungkinkan pengguna untuk mengakses layanan dari berbagai lokasi selama terhubung dengan internet, tanpa perlu menginstal aplikasi khusus di perangkat mereka.

### 2. React.js
React.js adalah pustaka (*library*) JavaScript bersifat *open-source* yang dikembangkan oleh Facebook untuk membangun antarmuka pengguna (UI), khususnya untuk aplikasi satu halaman (*Single Page Application*). React memungkinkan pengembang untuk membuat komponen UI yang dapat digunakan kembali (*reusable*) dan mengelola keadaan (*state*) aplikasi secara efisien. Dalam proyek ini, React digunakan sebagai fondasi utama di sisi *Frontend*.

### 3. Laravel Framework
Laravel adalah kerangka kerja (*framework*) aplikasi web berbasis PHP yang menggunakan konsep Model-View-Controller (MVC). Laravel dikenal dengan sintaks yang ekspresif dan elegan, serta menyediakan berbagai fitur bawaan seperti autentikasi, *routing*, dan manajemen database (Eloquent ORM) yang mempercepat proses pengembangan. Dalam proyek ini, Laravel berfungsi sebagai *Backend* yang menyediakan API untuk diakses oleh Frontend.

### 4. RESTful API
*Representational State Transfer* (REST) adalah gaya arsitektur perangkat lunak yang menyediakan standar komunikasi antar sistem komputer melalui web. RESTful API menggunakan metode HTTP standar (GET, POST, PUT, DELETE) untuk melakukan operasi CRUD (*Create, Read, Update, Delete*) pada sumber daya data. Arsitektur ini digunakan untuk menghubungkan antarmuka React dengan basis data melalui Laravel.

### 5. MySQL
MySQL adalah sistem manajemen basis data relasional (RDBMS) yang bersifat *open-source*. MySQL menggunakan bahasa SQL (*Structured Query Language*) untuk mengelola data. Database ini dipilih karena kehandalannya, performa yang cepat, dan kompatibilitas yang baik dengan PHP/Laravel untuk menyimpan data pengguna, event, dan transaksi pendaftaran.

---

## Analisis Sistem

### Analisis Kebutuhan Pengguna
Berdasarkan pengamatan dan analisis, kebutuhan pengguna dalam sistem ini dibagi menjadi dua aktor utama:

1.  **Pengguna Umum (Mahasiswa)**:
    - Dapat mendaftar akun dan masuk (login) ke dalam sistem.
    - Dapat melihat daftar event yang tersedia beserta detailnya (deskripsi, waktu, lokasi, harga).
    - Dapat mendaftar (*register*) ke suatu event.
    - Dapat mengunggah bukti pembayaran jika event berbayar.
    - Dapat melihat status pendaftaran (menunggu konfirmasi, dikonfirmasi, atau ditolak).
    - Dapat melihat tiket elektronik dan QR Code jika pendaftaran diterima.
    - Dapat mengunduh sertifikat setelah event selesai.

2.  **Administrator (Penyelenggara)**:
    - Dapat mengelola data event (menambah, mengubah, menghapus).
    - Dapat melihat daftar pendaftar untuk setiap event.
    - Dapat memverifikasi bukti pembayaran peserta (terima/tolak).
    - Dapat melakukan absensi peserta dengan memindai atau memverifikasi tiket.

---

### Use Case Diagram
Diagram berikut menggambarkan interaksi antara aktor (Mahasiswa dan Administrator) dengan fitur-fitur yang ada di dalam sistem Ganesha Event.

*(Masukkan gambar hasil generate dari usecase_diagram.puml di sini)*

---

### Flow Diagram (Alur Pendaftaran)
Flow diagram berikut menjelaskan alur kerja (*workflow*) dari proses pendaftaran event, mulai dari mahasiswa memilih event hingga mendapatkan tiket.

*(Masukkan gambar hasil generate dari flow_diagram.puml di sini)*

---

### Data Requirement
Sistem membutuhkan pengelolaan data sebagai berikut:
1.  **Data User**: Menyimpan informasi identitas pengguna, yang meliputi Nama Lengkap, Alamat Email, Nomor Induk Mahasiswa (NIM), Nomor Telepon, Password, dan Peran (*Role*) pengguna (sebagai Admin atau Mahasiswa).
2.  **Data Event**: Menyimpan informasi detail acara, meliputi Judul Event, URL Slug yang ramah pengguna, Deskripsi, Tanggal dan Waktu pelaksanaan, Lokasi, Harga Tiket, Banner/Gambar Event, serta Template Sertifikat. Untuk event berbayar, juga menyimpan informasi rekening bank (Nama Bank, Nomor Rekening, Pemilik).
3.  **Data Pendaftaran (Ticket)**: Menyimpan data transaksi pendaftaran yang menghubungkan User dan Event. Data ini mencakup Status Pendaftaran (Menunggu Konfirmasi/Dikonfirmasi/Ditolak), Bukti Pembayaran (untuk event berbayar), Kode Tiket Unik, dan Status Kehadiran (Absensi).

---

### Spesifikasi Fungsional & Non-Fungsional

#### Spesifikasi Fungsional
1.  **Sistem Autentikasi**: Sistem memfasilitasi pendaftaran akun baru, proses login yang aman, dan pengelolaan sesi pengguna berdasarkan peran (Admin dan Mahasiswa).
2.  **Manajemen Event**: Sistem memungkinkan admin untuk membuat, mengubah, dan menghapus event, termasuk mengelola informasi detail seperti poster, lokasi, harga, dan template sertifikat.
3.  **Sistem Pendaftaran & Pembayaran**: Sistem mendukung pendaftaran event baik gratis maupun berbayar. Untuk event berbayar, sistem menyediakan antarmuka untuk mengunggah bukti pembayaran.
4.  **Tiket & QR Code**: Sistem secara otomatis menghasilkan tiket digital yang dilengkapi dengan kode unik (QR Code) setelah pendaftaran dikonfirmasi.
5.  **Verifikasi & Absensi**: Sistem memfasilitasi admin untuk memverifikasi bukti pembayaran peserta dan mengubah status pendaftaran, serta melakukan pencatatan kehadiran (absensi).
6.  **Penerbitan Sertifikat**: Sistem menyediakan fitur bagi peserta yang hadir untuk mengunduh sertifikat elektronik secara mandiri setelah event selesai.

#### Spesifikasi Non-Fungsional
1.  **Security (Keamanan)**:
    - Autentikasi berbasis Token (Laravel Sanctum) untuk melindungi akses API.
    - Enkripsi password pengguna menggunakan algoritma *hashing* yang standar.
2.  **Usability (Kebergunaan)**:
    - Antarmuka pengguna (*User Interface*) yang responsif, dapat diakses dengan baik melalui perangkat *desktop* maupun *mobile*.
    - Alur navigasi yang intuitif untuk memudahkan pengguna awam.
3.  **Reliability (Keandalan)**:
    - Sistem mampu menangani validasi data input untuk mencegah kesalahan data (misal: format email, file upload).
4.  **Performance (Kinerja)**:
    - Waktu muat halaman (*load time*) yang cepat berkat arsitektur *Single Page Application* (SPA) menggunakan React.

---

## Perancangan Sistem (Desain)

### Arsitektur Sistem
Sistem dibangun dengan arsitektur **Client-Server** yang terpisah (*Decoupled Architecture*) menggunakan protokol REST API:
1.  **Frontend (Client)**: Dibangun menggunakan React.js. Bertugas menangani antarmuka pengguna, logika tampilan, dan komunikasi HTTP ke server.
2.  **Backend (Server)**: Dibangun menggunakan Laravel. Bertugas menyediakan endpoint API, logika bisnis, validasi, dan autentikasi.
3.  **Database**: Menggunakan MySQL sebagai tempat penyimpanan data relasional.

---

### Desain Basis Data
Perancangan basis data menggunakan model relasional dengan tabel-tabel utama yang telah disesuaikan dengan kebutuhan sistem:

1.  **Tabel `users`**:
    - `id` (PK, BigInt)
    - `name` (String), `email` (String, Unique)
    - `password` (String)
    - `nim` (String, Nullable), `phone` (String, Nullable)
    - `role` (Enum: 'user', 'admin')
    - `timestamps`

2.  **Tabel `events`**:
    - `id` (PK, BigInt)
    - `title` (String), `slug` (String, Unique)
    - `description` (Text)
    - `date` (Date), `time` (Time), `location` (String)
    - `organizer` (String), `price` (Integer)
    - `image_url` (String, Nullable)
    - `bank_name`, `account_number`, `account_holder` (String, Nullable - untuk pembayaran)
    - `certificate_template` (String, Nullable - path file)
    - `is_completed` (Boolean)
    - `timestamps`

3.  **Tabel `tickets`**:
    - `id` (PK, BigInt)
    - `user_id` (FK -> users.id)
    - `event_id` (FK -> events.id)
    - `status` (Enum: 'menunggu_konfirmasi', 'dikonfirmasi', 'ditolak')
    - `payment_proof` (String, Nullable - path bukti bayar)
    - `ticket_code` (String, Unique)
    - `is_attended` (Boolean)
    - `timestamps`

*(Masukkan gambar hasil generate dari erd_diagram.puml di sini)*

---

### Wireframe / Mockup UI
Rancangan antarmuka pengguna meliputi:
1.  **Halaman Utama (Landing Page)**: Menampilkan *hero section* dengan statistik event dan daftar event terbaru dalam bentuk kartu (*grid*).
2.  **Halaman Detail Event**: Menampilkan informasi lengkap event, tombol daftar, dan form upload bukti pembayaran (jika berbayar).
3.  **Halaman Dashboard Mahasiswa**: Menampilkan daftar tiket saya (My Tickets), status pendaftaran, dan opsi download sertifikat.
4.  **Halaman Admin**: Dashboard untuk manajemen event (Create/Edit/Delete) dan verifikasi pendaftaran peserta.

---

### Desain API
Aplikasi menggunakan RESTful API yang dibangun dengan Laravel. Berikut adalah daftar endpoint utama:

*   **Authentication**:
    *   `POST /api/register` : Registrasi pengguna baru.
    *   `POST /api/login` : Autentikasi dan pengambilan token ses.
    *   `POST /api/logout` : Menghapus token sesi (Logout).
    *   `GET /api/me` : Mendapatkan data user yang sedang login.

*   **Events (Public)**:
    *   `GET /api/events` : Mengambil daftar semua event.
    *   `GET /api/events/{id}` : Mengambil detail event berdasarkan ID.

*   **Event Management (Admin)**:
    *   `POST /api/events` : Menambah data event baru.
    *   `PUT /api/events/{id}` : Memperbarui data event.
    *   `DELETE /api/events/{id}` : Menghapus event.

*   **Tickets & Transaction**:
    *   `POST /api/tickets` : Melakukan pendaftaran event (User).
    *   `GET /api/my-tickets` : Melihat riwayat tiket pengguna (User).
    *   `GET /api/events/{id}/tickets` : Melihat daftar peserta per event (Admin).
    *   `PUT /api/tickets/{id}/status` : Memverifikasi proes pendaftaran (Admin).
    *   `POST /api/tickets/verify` : Verifikasi tiket/absensi (Admin).
    *   `GET /api/tickets/{id}/certificate/download` : Mengunduh sertifikat elektronik (User).

---

## 5. Implementasi

### 5.1. Teknologi & Tools
Pengembangan sistem **Ganesha Event** menggunakan serangkaian teknologi modern untuk memastikan kinerja yang optimal dan kemudahan pengembangan. Berikut adalah rincian spesifikasi teknis yang digunakan:

1.  **Backend**:
    - **Framework**: Laravel v12.0
    - **Bahasa**: PHP v8.2
    - **Database**: MySQL
    - **API Library**: Laravel Sanctum (untuk autentikasi token)
    - **Image Processing**: Intervention Image v3.11

2.  **Frontend**:
    - **Library**: React.js v18.3.1
    - **Build Tool**: Vite v7.2.4
    - **Styling**: Tailwind CSS v3.4.17
    - **Routing**: React Router DOM v7.10.1
    - **HTTP Client**: Axios v1.13.2
    - **State Management**: Zustand v5.0.9
    - **QR Code**: html5-qrcode & qrcode.react

### 5.2. Implementasi Modul Utama

#### 1. Modul Autentikasi
Modul ini menangani proses pendaftaran dan login pengguna. Di sisi backend, `AuthController` menangani validasi kredensial dan penerbitan token akses. Di sisi frontend, antarmuka Login dan Register dibuat responsif dan memberikan umpan balik langsung (*sweetalert2*) jika terjadi kesalahan input.

#### 2. Modul Manajemen Event
Modul ini memungkinkan Admin untuk mengelola data event. Implementasi melibatkan CRUD (*Create, Read, Update, Delete*) pada tabel `events`. Fitur unggulan meliputi upload poster event dan pengaturan kuota peserta. Di halaman depan, event ditampilkan menggunakan komponen `EventCard.jsx` yang menyajikan ringkasan informasi secara menarik.

#### 3. Modul Pendaftaran & Tiket
Ini adalah inti dari sistem, di mana mahasiswa dapat mendaftar ke event.
- **Pendaftaran**: Data disimpan ke tabel `tickets` dengan status awal "Menunggu Konfirmasi" (untuk event berbayar) atau langsung "Dikonfirmasi" (untuk event gratis).
- **QR Code**: Setelah dikonfirmasi, sistem membuat kode unik (slug/UUID) yang digenerate menjadi QR Code menggunakan library `qrcode.react`, yang nantinya digunakan untuk absensi.

### Implementasi Antarmuka
Berikut adalah tangkapan layar (*screenshot*) dari antarmuka sistem yang telah dikembangkan:

1.  **Halaman Utama (Landing Page)**
    *(Masukkan screenshot halaman utama yang menampilkan daftar event)*

2.  **Halaman Login & Register**
    *(Masukkan screenshot halaman form login/register)*

3.  **Halaman Detail Event**
    *(Masukkan screenshot halaman detail event beserta tombol daftar)*

4.  **Halaman Dashboard Mahasiswa**
    *(Masukkan screenshot dashboard mahasiswa yang menampilkan tiket)*

5.  **Halaman Admin (Manajemen Event)**
    *(Masukkan screenshot halaman admin untuk kelola event)*

### 5.3. Pengujian Sistem
Pengujian sistem dilakukan untuk memastikan seluruh komponen berjalan sesuai spesifikasi, baik secara integrasi maupun performa internal kode (*White Box*).

#### A. System Integration Testing
Pengujian integrasi berfokus pada aliran data antar modul (Frontend - Backend - Database) untuk memastikan fitur-fitur kompleks berjalan mulus.

| No | Skenario Integrasi | Alur Data | Hasil |
|----|--------------------|-----------|-------|
| 1  | **Siklus Pendaftaran Lengkap** | User (FE) -> API Ticket (BE) -> DB Insert -> Return Success -> Update UI Dashboard | **Berhasil** (Data tiket muncul real-time di dashboard mahasiswa dan admin) |
| 2  | **Verifikasi Pembayaran** | Admin Upload Status (FE) -> API Update (BE) -> Trigger Generate QR -> Return Updated Ticket | **Berhasil** (QR Code otomatis muncul setelah status dikonfirmasi) |
| 3  | **Validasi Kuota Event** | User Daftar -> Cek Kuota di DB (BE) -> Jika Penuh reject request -> Show Error di FE | **Berhasil** (Pendaftaran ditolak saat kuota habis) |

#### B. White Box & Performance Testing
Pengujian ini dilakukan dengan memeriksa struktur internal kode dan efisiensi eksekusi untuk memastikan performa yang optimal.
1.  **Efisiensi Query Database**:
    - Menggunakan *Eager Loading* (`with(['tickets', 'events'])`) pada Laravel Eloquent untuk mengatasi masalah *N+1 Query Problem* saat memuat daftar event beserta jumlah pendaftarnya.
    - Menambahkan *Indexing* pada kolom yang sering dicari seperti `slug`, `email`, dan `ticket_code` untuk mempercepat pencarian data.
2.  **Response Time API (Hasil Pengujian Lokal)**:
    - Berdasarkan hasil *automated testing* menggunakan `RealSystemTest.php`, diperoleh rata-rata waktu respons yang sangat cepat:
        - **Login**: ~35 ms
        - **Get Events List**: ~1 ms (karena penggunaan cache dan query efisien)
        - **Register Event**: ~8 ms (termasuk validasi dan transaksi database)
    - Hal ini menunjukkan arsitektur aplikasi sangat efisien untuk menangani beban kerja target.
3.  **Security Filtering**:
    - Memastikan semua input *request* divalidasi menggunakan `FormRequest` Laravel untuk mencegah injeksi data berbahaya (SQL Injection/XSS).

---

## 6. Deployment

### 6.1. Proses Konfigurasi Online Web
Aplikasi **Ganesha Event** dideploy dengan strategi pemisahan antara Frontend dan Backend (*Decoupled Deployment*) menggunakan layanan cloud modern:

1.  **Frontend (Vercel)**:
    - Menghubungkan akun **Vercel** dengan repository **GitHub**.
    - Mengimpor direktori project `fe-ganesha-event`.
    - Mengatur *Environment Variable* `VITE_API_URL` yang diarahkan ke URL backend Railway.
    - Vercel secara otomatis mendeteksi konfigurasi Vite dan menjalankan perintah build (`npm run build`).
    - **SEO & Verifikasi**: Menambahkan *meta tag* Google Search Console pada file `index.html` untuk verifikasi kepemilikan situs dan indexing di mesin pencari.

2.  **Backend & Database (Railway)**:
    - Menghubungkan akun **Railway** dengan repository **GitHub**.
    - Mengimpor direktori project `be-ganesha-event`.
    - Railway secara otomatis mendeteksi file `composer.json` dan menyiapkan lingkungan PHP.
    - Menambahkan layanan **MySQL Database** di dalam project Railway yang sama.
    - Mengonfigurasi variabel lingkungan (`APP_KEY`, `DB_CONNECTION`, `DB_HOST`, dll) di dashboard Railway agar aplikasi Laravel dapat terhubung ke database.

### 6.2. Proses Release Apps Mobile ke Playstore
(Bagian ini tidak dilakukan karena fokus pengembangan saat ini adalah platform berbasis Web).

---

## 7. Simpulan

### 7.1. Hasil yang Telah Dicapai
Proyek **Ganesha Event** telah berhasil dikembangkan sesuai dengan tujuan awal, yaitu menciptakan platform manajemen event kampus yang terintegrasi. Fitur-fitur utama seperti autentikasi pengguna, manajemen CRUD event oleh admin, pendaftaran peserta, upload bukti pembayaran, hingga penerbitan tiket QR Code dan sertifikat elektronik telah berfungsi dengan baik.

### 7.2. Manfaat Sistem
Sistem ini memberikan manfaat signifikan bagi dua pihak:
- **Bagi Penyelenggara (Admin)**: Memudahkan pengelolaan data peserta, verifikasi pembayaran, dan absensi yang lebih efisien tanpa perlu rekapitulasi manual.
- **Bagi Mahasiswa**: Memberikan kemudahan akses informasi event satu pintu, pendaftaran yang praktis dari mana saja, serta penyimpanan riwayat keikutsertaan event yang rapi.

### 7.3. Potensi Pengembangan di Masa Depan
Untuk pengembangan selanjutnya, sistem ini memiliki potensi untuk ditingkatkan dengan fitur:
- Integrasi *Payment Gateway* otomatis (Midtrans/Xendit) untuk verifikasi pembayaran *real-time*.
- Fitur notifikasi via Email atau WhatsApp Gateway.
- Implementasi aplikasi Mobile Native (React Native/Flutter) untuk pengalaman akses yang lebih personal.
