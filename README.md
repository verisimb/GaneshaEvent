# 🎓 Ganesha Event - Platform Manajemen Event Kampus

<div align="center">

![Performance](https://img.shields.io/badge/Performance-97%2F100-brightgreen)
![SEO](https://img.shields.io/badge/SEO-100%2F100-brightgreen)
![Best%20Practices](https://img.shields.io/badge/Best%20Practices-96%2F100-brightgreen)
![Laravel](https://img.shields.io/badge/Laravel-12.0-red)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![PHP](https://img.shields.io/badge/PHP-8.2-purple)

**Platform modern untuk manajemen event kampus dengan sistem tiket QR Code dan sertifikat digital otomatis**

[Demo Live](https://ganesha-event.vercel.app) · [API Docs](#-api-endpoints) · [Report Bug](https://github.com/verisimb/GaneshaEvent/issues)

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [Deployment](#-deployment)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Dokumentasi](#-dokumentasi)

---

## 🎯 Tentang Proyek

**Ganesha Event** adalah platform manajemen event kampus yang memungkinkan mahasiswa untuk:
- 📝 Mendaftar event (gratis/berbayar)
- 🎫 Mendapatkan tiket QR Code unik
- ✅ Scan QR untuk absensi
- 🏆 Download sertifikat digital otomatis

Aplikasi ini dikembangkan sebagai tugas akhir mata kuliah **Pengembangan Aplikasi Web** dengan arsitektur **REST API** (Laravel) dan **SPA** (React).

### 🎨 Screenshots

<details>
<summary>Lihat Screenshots</summary>

- **Home Page**: Landing page dengan daftar event
- **Event Detail**: Informasi lengkap event dan form pendaftaran
- **Dashboard User**: Tiket saya dan sertifikat
- **Admin Panel**: Kelola event, verifikasi pembayaran, scan QR

</details>

---

## ✨ Fitur Utama

### 👤 Fitur User

| Fitur | Deskripsi |
|-------|-----------|
| **Pendaftaran Event** | Daftar event gratis (auto-confirm) atau berbayar (upload bukti bayar) |
| **Tiket QR Code** | Setiap tiket memiliki QR Code unik (format: `TCKT-XXXXX`) |
| **My Tickets** | Lihat semua tiket yang dimiliki dengan status real-time |
| **Sertifikat Digital** | Download sertifikat otomatis dengan nama tercetak (untuk peserta yang hadir) |
| **Search & Filter** | Cari event berdasarkan judul atau lokasi |

### 👨‍💼 Fitur Admin

| Fitur | Deskripsi |
|-------|-----------|
| **Kelola Event** | CRUD event lengkap dengan upload banner dan template sertifikat |
| **Verifikasi Pembayaran** | Approve/reject pendaftaran event berbayar |
| **QR Scanner** | Scan tiket peserta untuk absensi hari-H (dengan kamera atau input manual) |
| **Generate Sertifikat** | Upload template, sistem otomatis cetak nama peserta |
| **Dashboard Analytics** | Statistik event, pendaftar, dan kehadiran |

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Laravel 12.0
- **Language**: PHP 8.2+
- **Database**: MySQL 8.0
- **Authentication**: Laravel Sanctum (Token-based)
- **Image Processing**: Intervention Image 3.11 (GD Driver)
- **Testing**: PHPUnit 11.5

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 7.2
- **Styling**: Tailwind CSS 3.4
- **State Management**: Zustand 5.0
- **Routing**: React Router DOM 7.10
- **HTTP Client**: Axios 1.13 + TanStack Query 5.90
- **QR Code**: html5-qrcode 2.3, qrcode.react 4.2
- **UI Components**: Lucide React, SweetAlert2, React Hot Toast
- **SEO**: React Helmet Async 2.0
- **Analytics**: React GA4 2.1

### DevOps & Deployment
- **Backend**: Railway (https://ganeshaevent-production.up.railway.app)
- **Frontend**: Vercel (https://ganesha-event.vercel.app)
- **CI/CD**: GitHub Actions (auto-deploy on push)
- **Database**: Railway MySQL

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL >= 8.0

# Optional
- Git
```

### 1. Clone Repository

```bash
git clone https://github.com/verisimb/GaneshaEvent.git
cd GaneshaEvent
```

### 2. Setup Backend (Laravel)

```bash
cd be-ganesha-event

# Install dependencies
composer install

# Setup environment
cp .env.example .env
# Edit .env: set DB_DATABASE, DB_USERNAME, DB_PASSWORD

# Generate application key
php artisan key:generate

# Run migrations & seeders
php artisan migrate:fresh --seed

# Link storage (for uploads)
php artisan storage:link

# Start server
php artisan serve
```

Backend akan berjalan di: **http://localhost:8000**

### 3. Setup Frontend (React)

```bash
cd fe-ganesha-event

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env: set VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

Frontend akan berjalan di: **http://localhost:5173**

### 4. Akun Testing

Setelah seeding, gunakan akun berikut:

| Role | Email | Password |
|------|-------|----------|
| **User** | user@example.com | password |
| **Admin** | admin@example.com | password |

---

## 🌐 Deployment

### Backend (Railway)

1. Push ke GitHub
2. Connect repository di Railway
3. Set environment variables:
   ```
   APP_URL=https://your-app.railway.app
   FORCE_HTTPS=true
   DB_CONNECTION=mysql
   DB_HOST=<railway-mysql-host>
   DB_DATABASE=<database-name>
   DB_USERNAME=<username>
   DB_PASSWORD=<password>
   ```
4. Deploy otomatis saat push ke `main`

### Frontend (Vercel)

1. Connect repository di Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
5. Deploy otomatis saat push ke `main`

---

## 📡 API Endpoints

**Base URL**: `https://ganeshaevent-production.up.railway.app/api`

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Register user baru |
| `POST` | `/login` | Login user |
| `GET` | `/events` | List semua event (support `?search=`) |
| `GET` | `/events/{id}` | Detail event |

### Protected Endpoints (Require Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/logout` | Logout user |
| `GET` | `/me` | Get current user info |
| `GET` | `/my-tickets` | List tiket user |
| `POST` | `/tickets` | Daftar event |
| `GET` | `/tickets/{id}` | Detail tiket |
| `GET` | `/tickets/{id}/certificate/download` | Download sertifikat |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/events` | Create event |
| `PUT` | `/events/{id}` | Update event |
| `DELETE` | `/events/{id}` | Delete event |
| `GET` | `/events/{id}/tickets` | List pendaftar event |
| `PUT` | `/tickets/{id}/status` | Update status tiket |
| `POST` | `/tickets/verify` | Verify QR code |

**Authentication**: Gunakan header `Authorization: Bearer {token}`

---

## 🧪 Testing

### Backend Testing

```bash
cd be-ganesha-event

# Run all tests
php artisan test

# Run performance tests
php artisan test --filter=PerformanceTest

# Run with coverage
php artisan test --coverage
```

**Test Results**:
- ✅ 9/9 tests passed
- ✅ Response time: < 30ms average
- ✅ Query efficiency: 1-4 queries per request

### Frontend Testing

```bash
cd fe-ganesha-event

# Build for production
npm run build

# Preview production build
npm run preview
```

**PageSpeed Insights Results**:
- ✅ Performance: 97/100
- ✅ Accessibility: 89/100
- ✅ Best Practices: 96/100
- ✅ SEO: 100/100

---

## 📚 Dokumentasi

### Dokumentasi Lengkap

| Dokumen | Deskripsi |
|---------|-----------|
| [teknikal.md](teknikal.md) | Dokumentasi teknis detail (kode, arsitektur, flow) |
| [panduan-system-integration-testing.md](panduan-system-integration-testing.md) | Panduan SIT dengan 7 skenario testing |
| [panduan-whitebox-performance-testing.md](panduan-whitebox-performance-testing.md) | Panduan performance testing |
| [hasil-whitebox-performance-testing.md](hasil-whitebox-performance-testing.md) | Hasil testing lengkap |

### Diagram

- **Use Case Diagram**: `usecase_diagram.puml`
- **ERD**: `erd_diagram.puml`
- **Flow Diagram**: `flow_diagram.puml`

---

## 🏗️ Arsitektur Proyek

```
GaneshaEvent/
├── be-ganesha-event/          # Laravel Backend
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── EventController.php
│   │   │   ├── TicketController.php
│   │   │   └── CertificateController.php
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Event.php
│   │       └── Ticket.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── tests/Feature/
│       └── PerformanceTest.php
│
└── fe-ganesha-event/          # React Frontend
    ├── src/
    │   ├── pages/
    │   │   ├── frontpages/    # 6 halaman user
    │   │   └── adminpages/    # 3 halaman admin
    │   ├── components/        # Reusable components
    │   ├── store/             # Zustand state management
    │   ├── lib/               # Axios config
    │   └── hooks/             # Custom React hooks
    └── public/
```

---

## 🔧 Troubleshooting

### Backend Issues

**Error: GD extension not found**
```bash
# Mac
brew install php@8.2-gd

# Ubuntu/Debian
sudo apt-get install php8.2-gd

# Restart server
php artisan serve
```

**Error: Storage link not found**
```bash
php artisan storage:link
```

### Frontend Issues

**Error: API connection failed**
- Cek `VITE_API_URL` di `.env`
- Pastikan backend running
- Cek CORS settings di Laravel

**Error: Module not found**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Catatan Pengembang

### Database Schema

**Tabel `users`**:
- `id`, `name`, `email`, `password`, `role` (enum: user/admin), `nim`, `phone`

**Tabel `events`**:
- `id`, `title`, `slug`, `description`, `date`, `time`, `location`, `organizer`, `price`, `image_url`, `certificate_template`, `is_completed`

**Tabel `tickets`**:
- `id`, `user_id`, `event_id`, `ticket_code`, `status` (enum: menunggu_konfirmasi/dikonfirmasi/ditolak), `payment_proof`, `is_attended`

### File Storage

- **Event Images**: `storage/app/public/events/`
- **Payment Proofs**: `storage/app/public/payments/`
- **Certificate Templates**: `storage/app/public/certificates/templates/`

### Environment Variables

**Backend (.env)**:
```env
APP_URL=https://your-backend.railway.app
FORCE_HTTPS=true
DB_CONNECTION=mysql
SANCTUM_STATEFUL_DOMAINS=your-frontend.vercel.app
```

**Frontend (.env)**:
```env
VITE_API_URL=https://your-backend.railway.app
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

- **Developer**: [Your Name]
- **Institution**: Universitas Ganesha
- **Course**: Pengembangan Aplikasi Web
- **Year**: 2025

---

## 🙏 Acknowledgments

- Laravel Framework
- React.js
- Tailwind CSS
- Railway & Vercel for hosting
- All open-source libraries used in this project

---

<div align="center">

**Made with ❤️ for Universitas Ganesha**

[⬆ Back to Top](#-ganesha-event---platform-manajemen-event-kampus)

</div>
