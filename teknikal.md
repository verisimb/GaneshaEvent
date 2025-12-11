# Dokumentasi Teknis Ganesha Event

Dokumen ini menjelaskan secara rinci **bagaimana kode bekerja** untuk setiap fitur utama dalam aplikasi, lengkap dengan lokasi file tempat kode tersebut diimplementasikan.

## 1. Fitur Pendaftaran Event (User)

Fitur ini memungkinkan pengguna untuk mendaftar ke sebuah event.

**Lokasi File Utama:**
- **Frontend UI**: `fe-ganesha-event/src/pages/frontpages/EventDetailPage.jsx`
- **Frontend Logic**: `fe-ganesha-event/src/store/useEventStore.js`
- **Backend Controller**: `be-ganesha-event/app/Http/Controllers/Api/TicketController.php`
- **Backend Routes**: `be-ganesha-event/routes/api.php`

**Alur Logika Detail:**

1.  **Input Data (Frontend)**
    - **File**: `fe-ganesha-event/src/pages/frontpages/EventDetailPage.jsx`
    - **Proses**: User mengisi form state `formData` (Nama, Email, dll).
    - **Validasi Frontend**: Di dalam fungsi `handleSubmit`, kode mengecek apakah `event.price > 0` dan `paymentProof` kosong.

2.  **Request API (Frontend)**
    - **File**: `fe-ganesha-event/src/store/useEventStore.js` (Fungsi `registerEvent`)
    - **Proses**: Data dikemas dalam `FormData` untuk mendukung upload file.
    - **Kode**:
      ```javascript
      // src/store/useEventStore.js
      const payload = new FormData();
      payload.append('event_id', eventId);
      // ... append data lainnya
      const response = await api.post('/tickets', payload);
      ```

3.  **Routing (Backend)**
    - **File**: `be-ganesha-event/routes/api.php`
    - **Endpoint**: `Route::post('/tickets', [TicketController::class, 'store']);`

4.  **Validasi & Penyimpanan (Backend)**
    - **File**: `be-ganesha-event/app/Http/Controllers/Api/TicketController.php` (Method `store`)
    - **Validasi User**: Cek duplikasi pendaftaran.
      ```php
      $exists = Ticket::where('user_id', $userId)->where('event_id', $validated['event_id'])->exists();
      ```
    - **Upload Gambar**:
      ```php
      $path = $request->file('payment_proof')->store('payments', 'public');
      ```
    - **Create Ticket**: Insert ke tabel `tickets`.
      ```php
      Ticket::create([...]);
      ```

## 2. Fitur Autentikasi (Login & Register)

Menggunakan **Laravel Sanctum**.

**Lokasi File Utama:**
- **Frontend**: `fe-ganesha-event/src/pages/frontpages/LoginPage.jsx` & `RegisterPage.jsx`
- **Axios Config**: `fe-ganesha-event/src/lib/axios.js`
- **Backend Controller**: `be-ganesha-event/app/Http/Controllers/Api/AuthController.php`

**Alur Logika Detail:**

1.  **Login Request (Frontend)**
    - **File**: `fe-ganesha-event/src/pages/frontpages/LoginPage.jsx`
    - **Proses**: Mengirim POST email & password ke `/login`.

2.  **Validasi Credential (Backend)**
    - **File**: `be-ganesha-event/app/Http/Controllers/Api/AuthController.php` (Method `login`)
    - **Kode**:
      ```php
      if (!Auth::attempt($request->only('email', 'password'))) { ... }
      $token = $user->createToken('auth_token')->plainTextToken;
      ```

3.  **Token Storage (Frontend)**
    - **File**: `fe-ganesha-event/src/store/useAuthStore.js` (atau logic di Login Page)
    - **Proses**: Token yang diterima disimpan ke `localStorage.setItem('token', token)`.

4.  **Protected Requests (Frontend)**
    - **File**: `fe-ganesha-event/src/lib/axios.js`
    - **Interceptor**: Kode ini otomatis menyisipkan token ke setiap request berikutnya.
      ```javascript
      api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      });
      ```

## 3. Fitur Verifikasi / Absensi (Admin Scanner)

**Lokasi File Utama:**
- **Frontend**: `fe-ganesha-event/src/pages/adminpages/AttendancePage.jsx`
- **Backend Controller**: `be-ganesha-event/app/Http/Controllers/Api/TicketController.php`

**Alur Logika Detail:**

1.  **Scanning (Frontend)**
    - **File**: `fe-ganesha-event/src/pages/adminpages/AttendancePage.jsx`
    - **Library**: `html5-qrcode` digunakan di `useEffect` dan `startScanner`.
    - **Proses**: Callback `onScanSuccess` menerima `decodedText` (Kode Tiket).

2.  **Verifikasi Tiket (Backend)**
    - **File**: `be-ganesha-event/app/Http/Controllers/Api/TicketController.php` (Method `verifyTicket`)
    - **Logic Pengecekan**:
      ```php
      // 1. Cari Tiket
      $ticket = Ticket::where('ticket_code', ...)->first();
      // 2. Cek Status
      if ($ticket->status !== 'dikonfirmasi') return error...
      // 3. Cek Sudah Hadir?
      if ($ticket->is_attended) return response(['status' => 'already_attended'...]);
      ```
    - **Update**: `is_attended` di set ke `true`.

## 4. Fitur Kelola Event (Admin CRUD)

**Lokasi File Utama:**
- **Frontend**: `fe-ganesha-event/src/pages/adminpages/ManageEventsPage.jsx`
- **Backend Controller**: `be-ganesha-event/app/Http/Controllers/Api/EventController.php`

**Alur Logika Detail:**

1.  **Upload & Method Spoofing (Frontend)**
    - **File**: `fe-ganesha-event/src/pages/adminpages/ManageEventsPage.jsx`
    - **Proses Update Event**: Karena browser/axios memiliki keterbatasan dengan PUT + Multipart, kita menggunakan POST dengan `_method: PUT`.
      ```javascript
      // handleSubmit function
      payload.append('_method', 'PUT');
      await api.post(`/events/${currentEvent.id}`, payload, ...);
      ```

2.  **Handling Upload (Backend Controller)**
    - **File**: `be-ganesha-event/app/Http/Controllers/Api/EventController.php` (Method `update`)
    - **Proses**:
      ```php
      if ($request->hasFile('image')) {
          // Hapus gambar lama
          Storage::disk('public')->delete($event->image);
          // Simpan gambar baru
          $path = $request->file('image')->store('events', 'public');
          $validated['image'] = $path;
      }
      ```

## 5. Fitur Konfirmasi Pembayaran (Admin)

**Lokasi File Utama:**
- **Frontend**: `fe-ganesha-event/src/pages/adminpages/ManageRegistrationsPage.jsx`
- **Backend Controller**: `be-ganesha-event/app/Http/Controllers/Api/TicketController.php`

**Alur Logika Detail:**

1.  **Update Status (Frontend)**
    - **File**: `fe-ganesha-event/src/pages/adminpages/ManageRegistrationsPage.jsx`
    - **Fungsi**: `handleUpdateStatus(ticketId, newStatus)`
    - **API Call**: `api.put(/tickets/${ticketId}/status, { status: newStatus })`

2.  **Generate QR Code (Backend)**
    - **File**: `be-ganesha-event/app/Http/Controllers/Api/TicketController.php` (Method `updateStatus`)
    - **Logic**: QR Code baru digenerate HANYA jika status berubah jadi dikonfirmasi.
      ```php
      if ($ticket->status == 'dikonfirmasi' && !$ticket->ticket_code) {
           $ticket->ticket_code = 'TCKT-' . strtoupper(uniqid());
      }
      ```

---


## 6. Analisis Pemenuhan Fitur (Checklist)

Analisis teknis terhadap pemenuhan persyaratan tugas.

### 1. Backend Laravel
- **Status**: Terpenuhi.
- **Implementasi**: Project menggunakan **Laravel 11**.
- **Bukti**: Folder `be-ganesha-event` berisi struktur standar Laravel (`app`, `routes`, `composer.json`). Semua logic API berada di `app/Http/Controllers/Api`.

### 2. Single Page App (SPA) / PWA
- **Status**: SPA Terpenuhi. (PWA Belum).
- **Implementasi**: Frontend menggunakan **React Router DOM** untuk navigasi client-side tanpa reload halaman.
- **File**: `fe-ganesha-event/src/App.jsx`.
- **Kode**:
  ```jsx
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/admin" element={<AdminLayout />} />
  </Routes>
  ```
- **Catatan PWA**: Belum ada `manifest.json` dan Service Worker (`vite-plugin-pwa`).

### 3. Dynamic SEO
- **Status**: Terpenuhi.
- **Implementasi**: Menggunakan **React Helmet Async**. Setiap halaman (terutama Detail Event) meng-update tag `<title>` dan `<meta>` di `<head>`.
- **File**: `fe-ganesha-event/src/pages/frontpages/EventDetailPage.jsx`
- **Kode**:
  ```jsx
  <Helmet>
    <title>{event.title} - Ganesha Event</title>
    <meta name="description" content={event.description} />
  </Helmet>
  ```

### 4. Online (Analytics)
- **Status**: Belum Terpenuhi.
- **Detail**: Script Google Analytics / Search Console belum ditambahkan di `index.html`.

### 5. React & Zustand
- **Status**: Terpenuhi.
- **Implementasi**:
  - **React 19**: Library UI utama.
  - **Zustand**: State management ringan untuk menyimpan data Event dan Auth secara global.
- **File Store**: `fe-ganesha-event/src/store/useEventStore.js`.
- **Kode**:
  ```javascript
  import { create } from 'zustand';
  export const useEventStore = create((set) => ({ ... }));
  ```

### 6. Local Storage
- **Status**: Terpenuhi.
- **Implementasi**: Digunakan untuk menyimpan Token JWT agar user tetap login saat refresh halaman.
- **File**: `fe-ganesha-event/src/lib/axios.js`.
- **Kode**:
  ```javascript
  const token = localStorage.getItem('token');
  ```

### 7. Halaman User & Admin
- **Status**: Terpenuhi.
- **Implementasi**: Routing dipisah menjadi dua main path.
  - **User**: `/` (Home), `/event/:id`, `/my-tickets`.
  - **Admin**: `/admin/events`, `/admin/attendance`.
- **Pemisahan Layout**: Menggunakan component `MainLayout` untuk user dan `AdminLayout` untuk admin (di `src/layouts/`).



## 7. Implementasi Detail State Management (Zustand)

Aplikasi ini menggunakan **Zustand** sebagai _Centralized Store_ untuk mengelola Authentication, Events, dan Tickets. Logic ini disatukan dalam satu file store untuk kemudahan akses.

**Lokasi File:** `fe-ganesha-event/src/store/useEventStore.js`

### A. Struktur Store

Store dibuat menggunakan fungsi `create` dari Zustand (Line 14) dan bersifat **Async** karena berinteraksi langsung dengan API.

```javascript
/* src/store/useEventStore.js - Line 14 */
export const useEventStore = create((set, get) => ({
  // 1. Initial State (Lines 15-20)
  user: getUserFromStorage(),  // Mengambil dari localStorage (Line 4)
  token: localStorage.getItem('token') || null,
  events: [],
  tickets: [],
  isLoading: false,
  error: null,
  ...
}));
```

### B. Penjelasan State & Actions

Berikut adalah breakdown super detail dari setiap action:

#### 1. Authentication (`login`, `register`, `logout`)
Action ini menangani logika masuk/keluar user dan sinkronisasi dengan `localStorage`.

- **Login (`login`)** - Line 23:
    - Menerima `email` & `password`.
    - **API Call**: `await api.post('/login', ...)` (Line 26).
    - **Side Effect**:
        - Menyimpan `token` dan `user` object ke `localStorage` (Lines 29-30).
        - Mengupdate state Zustand global `set({ user, token, ... })` (Line 32).

- **Logout (`logout`)** - Line 63:
    - **API Call**: `await api.post('/logout')` (Line 65).
    - **Cleanup**: Menghapus data dari `localStorage` (Lines 69-70) dan mereset state (Line 71).

#### 2. Event Management (`fetchEvents`)
Action ini digunakan untuk mengambil data event dari backend.

- **Lokasi**: Line 76 (`fetchEvents`).
- **Flow**:
    1. Set `isLoading: true` (Line 77).
    2. **API Call**: `api.get('/events?search=...')` (Line 79).
    3. Update state `events` dengan data dari server (Line 80).

#### 3. Caching Sederhana (`getEventById`)
Action ini digunakan di halaman **Detail Event** untuk menghemat request.

- **Lokasi**: Line 86.
- **Logika Cerdas**:
    - **Cek Cache (Line 88)**: `const event = get().events.find(e => e.id == id);`
    - Jika ketemu, return langsung (Line 89). Ini membuat navigasi terasa instan.
    - Jika tidak ketemu, baru panggil API `api.get('/events/${id}')` (Line 93).

#### 4. Booking System (`registerEvent`)
Action ini menangani pendaftaran event dengan upload file (FormData).

- **Lokasi**: Line 112.
- **Teknis Upload**:
    - Membuat instance `new FormData()` (Line 115).
    - Append data event ID dan file gambar (Lines 116-119).
    - **Header Khusus**: Mengirim request dengan `Content-Type: multipart/form-data` (Lines 121-125).
- **Auto-Refresh**: Setelah sukses, fungsi memanggil `get().fetchMyTickets()` (Line 126) agar data di halaman "Tiketku" langsung update tanpa refresh browser.
