# Checklist Kebutuhan Proyek UAS

Dokumen ini berisi hasil pengecekan terhadap spesifikasi tugas yang diberikan.

| Kebutuhan | Status | Bukti Implementasi / Catatan |
| :--- | :---: | :--- |
| **Backend Laravel** | ✅ | Folder `be-ganesha-event` adalah project Laravel 11 (`composer.json`). API routes di `routes/api.php`. |
| **Single Page App (SPA)** | ✅ | Menggunakan **React Router DOM** di `src/App.jsx`. Navigasi antar halaman tidak me-refresh browser. |
| **Progresive Web App (PWA)** | ❌ | **Belum Terimplementasi**. Tidak ditemukan konfigurasi `vite-plugin-pwa` di `vite.config.js` ataupun `manifest.json`. |
| **Dynamic SEO** | ✅ | Menggunakan library **`react-helmet-async`**. <br>Lokasi: `src/pages/frontpages/EventDetailPage.jsx` (meta description berubah sesuai event). |
| **Online (Analytics)** | ❌ | **Belum Terimplementasi**. Tidak ditemukan script Google Analytics/Mastertools di `index.html`. |
| **React** | ✅ | Project berbasis React 19 + Vite (`package.json`). |
| **Zustand** | ✅ | Digunakan untuk State Management. <br>Lokasi: `src/store/useEventStore.js` dan `useAuthStore.js`. |
| **Local Storage** | ✅ | Digunakan untuk menyimpan Token Auth. <br>Lokasi: `src/lib/axios.js` (Token diambil dari localStorage untuk Authorization Header). |
| **Frontpage (User)** | ✅ | Tersedia di `src/pages/frontpages/`. Fitur: Home, Detail Event, Tiketku. |
| **Admin (Backpage)** | ✅ | Tersedia di `src/pages/adminpages/`. Fitur: Manage Events, Registrations, Attendance. |

---

## Detail Pengecekan

### 1. Dynamic SEO
Diterapkan menggunakan komponen `Helmet` untuk mengubah Title dan Meta Description secara dinamis berdasarkan data event yang sedang dibuka.
- **File**: `fe-ganesha-event/src/pages/frontpages/EventDetailPage.jsx`
- **Kode**:
  ```jsx
  <Helmet>
    <title>{event.title} - Ganesha Event</title>
    <meta name="description" content={event.description} />
  </Helmet>
  ```

### 2. Local Storage
Digunakan sebagai persistensi session login user (menyimpan JWT Token).
- **File**: `fe-ganesha-event/src/lib/axios.js`
- **Kode**:
  ```javascript
  const token = localStorage.getItem('token');
  ```

### 3. Zustand
Digunakan sebagai global state management untuk memisahkan logic bisnis dari UI.
- **File**: `fe-ganesha-event/src/store/useEventStore.js`
- **Kode**:
  ```javascript
  export const useEventStore = create((set) => ({ ... }))
  ```

### 4. Kekurangan (To-Do)
Fitur berikut diminta namun **belum ada** di codebase saat ini:
1.  **PWA**: Perlu install `vite-plugin-pwa` dan konfigurasi service worker.
2.  **Google Analytics**: Perlu mambahkan Tracking ID di `index.html`.
