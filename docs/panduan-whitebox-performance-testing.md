# Panduan White Box & Performance Testing
## Website Ganesha Event

---

## 📋 Daftar Isi
1. [Pengantar](#pengantar)
2. [Aspek yang Diuji](#aspek-yang-diuji)
3. [Tools yang Digunakan](#tools-yang-digunakan)
4. [Pengujian Query Database](#pengujian-query-database)
5. [Pengujian Response Time API](#pengujian-response-time-api)
6. [Pengujian Frontend Performance](#pengujian-frontend-performance)
7. [Template Dokumentasi](#template-dokumentasi)

---

## Pengantar

### Apa itu White Box Testing?
White Box Testing adalah pengujian yang memeriksa **struktur internal kode** dan **efisiensi eksekusi**. Berbeda dengan Black Box yang hanya melihat input-output, White Box melihat bagaimana kode bekerja di dalamnya.

### Apa itu Performance Testing?
Performance Testing mengukur **kecepatan** dan **efisiensi** aplikasi, termasuk:
- Response time API
- Query database efficiency
- Page load time
- Resource usage

### Tujuan
- Memastikan kode berjalan efisien
- Mengidentifikasi bottleneck
- Memvalidasi bahwa aplikasi cukup cepat untuk production

---

## Aspek yang Diuji

### 1. Efisiensi Query Database
- **N+1 Query Problem**: Cek apakah ada query berulang yang tidak perlu
- **Query Complexity**: Analisis query yang kompleks (JOIN, subquery)
- **Indexing**: Pastikan kolom yang sering di-query memiliki index
- **Execution Time**: Ukur waktu eksekusi query

### 2. Response Time API
- **Target**: < 200ms untuk operasi sederhana, < 500ms untuk operasi kompleks
- **Endpoints yang diuji**:
  - Login/Register
  - Get Events List
  - Get Event Detail
  - Create Ticket
  - Get My Tickets

### 3. Frontend Performance
- **Page Load Time**: Waktu loading halaman
- **Bundle Size**: Ukuran file JavaScript/CSS
- **Lighthouse Score**: Performance, Accessibility, Best Practices, SEO
- **First Contentful Paint (FCP)**
- **Time to Interactive (TTI)**

---

## Tools yang Digunakan

### Backend Testing
1. **Laravel Debugbar** - Monitor query dan performance
2. **PHPUnit** - Automated testing dengan timing
3. **Postman** - Manual API testing dengan response time
4. **MySQL EXPLAIN** - Analisis query execution plan

### Frontend Testing
1. **Chrome DevTools Lighthouse** - Audit performa
2. **Network Tab** - Monitor load time
3. **Performance Tab** - Profiling
4. **React DevTools Profiler** - Component rendering analysis

---

## Pengujian Query Database

### A. Install Laravel Debugbar (Development Only)

```bash
cd be-ganesha-event
composer require barryvdh/laravel-debugbar --dev
```

**Konfigurasi** (`.env`):
```
APP_DEBUG=true
DEBUGBAR_ENABLED=true
```

### B. Identifikasi N+1 Query Problem

**Contoh Masalah N+1:**
```php
// ❌ BAD - N+1 Query
$events = Event::all(); // 1 query
foreach ($events as $event) {
    echo $event->tickets->count(); // N queries (1 per event)
}
// Total: 1 + N queries
```

**Solusi dengan Eager Loading:**
```php
// ✅ GOOD - 2 Queries Only
$events = Event::withCount('tickets')->get(); // 2 queries total
foreach ($events as $event) {
    echo $event->tickets_count;
}
```

### C. Cek Query di Proyek Ganesha Event

**1. EventController - Get Events List**

Buka file: `be-ganesha-event/app/Http/Controllers/Api/EventController.php`

Cek method `index()`:
```php
public function index(Request $request)
{
    $query = Event::query();
    
    // ✅ GOOD: Eager load relationships
    $events = $query->with(['tickets'])->get();
    
    // Atau gunakan withCount untuk performa lebih baik
    $events = $query->withCount('tickets')->get();
}
```

**2. TicketController - Get My Tickets**

Cek method `index()`:
```php
public function index()
{
    // ✅ GOOD: Eager load user dan event
    $tickets = Ticket::with(['event', 'user'])
        ->where('user_id', auth()->id())
        ->get();
}
```

### D. Analisis Query dengan EXPLAIN

**Cara 1: Menggunakan Laravel Tinker**
```bash
cd be-ganesha-event
php artisan tinker
```

```php
// Di tinker:
DB::enableQueryLog();
Event::with('tickets')->get();
DB::getQueryLog();
```

**Cara 2: Langsung di MySQL**
```sql
EXPLAIN SELECT * FROM events WHERE slug = 'workshop-react';
EXPLAIN SELECT * FROM tickets WHERE event_id = 1;
```

**Interpretasi EXPLAIN:**
- `type: ALL` = Full table scan (SLOW) ❌
- `type: index` = Index scan (BETTER) ⚠️
- `type: ref` = Index lookup (GOOD) ✅
- `type: const` = Primary key lookup (BEST) ✅✅

### E. Tambahkan Index pada Kolom Penting

**Cek Migration Files:**

File: `database/migrations/xxxx_create_events_table.php`
```php
// ✅ Pastikan ada index pada kolom yang sering di-query
$table->string('slug')->unique(); // Sudah ada index (unique)
$table->date('date')->index();    // Tambahkan index
```

File: `database/migrations/xxxx_create_tickets_table.php`
```php
$table->string('ticket_code')->unique(); // Index
$table->foreignId('user_id')->constrained(); // Foreign key = index
$table->foreignId('event_id')->constrained(); // Foreign key = index
```

**Jika belum ada, buat migration baru:**
```bash
php artisan make:migration add_indexes_to_events_table
```

```php
public function up()
{
    Schema::table('events', function (Blueprint $table) {
        $table->index('date');
        $table->index('is_completed');
    });
}
```

### F. Dokumentasi Hasil Query Testing

**Template Tabel:**

| No | Query/Endpoint | Jumlah Query | Execution Time | Optimasi | Status |
|----|----------------|--------------|----------------|----------|--------|
| 1 | GET /api/events | 2 queries | 15ms | Eager loading `withCount('tickets')` | PASS |
| 2 | GET /api/my-tickets | 3 queries | 8ms | Eager loading `with(['event', 'user'])` | PASS |
| 3 | POST /api/tickets | 5 queries | 12ms | Transaction, validation | PASS |
| 4 | GET /api/events/{id} | 2 queries | 5ms | Eager loading | PASS |

**Kriteria:**
- ✅ PASS: < 10 queries per request, < 50ms execution time
- ⚠️ WARNING: 10-20 queries, 50-100ms
- ❌ FAIL: > 20 queries, > 100ms

---

## Pengujian Response Time API

### A. Menggunakan Laravel Feature Test

**Buat Test File:**
```bash
cd be-ganesha-event
php artisan make:test PerformanceTest
```

**File:** `tests/Feature/PerformanceTest.php`

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PerformanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(); // Seed database dengan data test
    }

    public function test_login_response_time()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password')
        ]);

        $start = microtime(true);
        
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password'
        ]);
        
        $duration = (microtime(true) - $start) * 1000; // Convert to ms
        
        echo "\n🕐 Login Response Time: " . round($duration, 2) . "ms\n";
        
        $this->assertLessThan(200, $duration, "Login should be < 200ms");
        $response->assertStatus(200);
    }

    public function test_get_events_response_time()
    {
        Event::factory()->count(20)->create();

        $start = microtime(true);
        
        $response = $this->getJson('/api/events');
        
        $duration = (microtime(true) - $start) * 1000;
        
        echo "\n🕐 Get Events Response Time: " . round($duration, 2) . "ms\n";
        
        $this->assertLessThan(200, $duration, "Get Events should be < 200ms");
        $response->assertStatus(200);
    }

    public function test_create_ticket_response_time()
    {
        $user = User::factory()->create();
        $event = Event::factory()->create(['price' => 0]);

        $this->actingAs($user, 'sanctum');

        $start = microtime(true);
        
        $response = $this->postJson('/api/tickets', [
            'event_id' => $event->id
        ]);
        
        $duration = (microtime(true) - $start) * 1000;
        
        echo "\n🕐 Create Ticket Response Time: " . round($duration, 2) . "ms\n";
        
        $this->assertLessThan(500, $duration, "Create Ticket should be < 500ms");
        $response->assertStatus(201);
    }

    public function test_get_my_tickets_response_time()
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $start = microtime(true);
        
        $response = $this->getJson('/api/my-tickets');
        
        $duration = (microtime(true) - $start) * 1000;
        
        echo "\n🕐 Get My Tickets Response Time: " . round($duration, 2) . "ms\n";
        
        $this->assertLessThan(200, $duration, "Get My Tickets should be < 200ms");
        $response->assertStatus(200);
    }
}
```

**Jalankan Test:**
```bash
php artisan test --filter PerformanceTest
```

**Expected Output:**
```
🕐 Login Response Time: 35ms
🕐 Get Events Response Time: 12ms
🕐 Create Ticket Response Time: 18ms
🕐 Get My Tickets Response Time: 8ms

PASS  Tests\Feature\PerformanceTest
✓ login response time
✓ get events response time
✓ create ticket response time
✓ get my tickets response time

Tests:    4 passed (4 assertions)
Duration: 0.15s
```

### B. Menggunakan Postman

**1. Setup Collection**
- Buat collection "Ganesha Event Performance"
- Tambahkan request untuk setiap endpoint

**2. Tambahkan Test Script**

Di tab "Tests" setiap request:
```javascript
// Log response time
console.log("Response Time:", pm.response.responseTime, "ms");

// Assert response time
pm.test("Response time is less than 200ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(200);
});
```

**3. Run Collection**
- Klik "Run Collection"
- Pilih iterations (misal: 10x)
- Lihat average response time

### C. Dokumentasi Hasil Response Time

**Template Tabel:**

| No | Endpoint | Method | Avg Response Time | Min | Max | Target | Status |
|----|----------|--------|-------------------|-----|-----|--------|--------|
| 1 | /api/login | POST | 35ms | 28ms | 45ms | < 200ms | PASS ✅ |
| 2 | /api/register | POST | 42ms | 35ms | 55ms | < 200ms | PASS ✅ |
| 3 | /api/events | GET | 12ms | 8ms | 18ms | < 200ms | PASS ✅ |
| 4 | /api/events/{id} | GET | 8ms | 5ms | 12ms | < 200ms | PASS ✅ |
| 5 | /api/tickets | POST | 18ms | 15ms | 25ms | < 500ms | PASS ✅ |
| 6 | /api/my-tickets | GET | 10ms | 7ms | 15ms | < 200ms | PASS ✅ |

**Catatan:**
- Test dilakukan di environment **lokal** (localhost)
- Untuk production (Railway), response time akan sedikit lebih lambat (tambah ~50-100ms)
- Hasil di atas menunjukkan performa **sangat baik**

---

## Pengujian Frontend Performance

### A. Lighthouse Audit (Chrome DevTools)

**Langkah:**

1. **Buka aplikasi di Chrome**
   - URL: `http://localhost:5173` atau `https://ganesha-event.vercel.app`

2. **Buka DevTools**
   - Tekan `F12` atau `Cmd+Option+I` (Mac)

3. **Pilih tab "Lighthouse"**

4. **Konfigurasi:**
   - Mode: Desktop atau Mobile
   - Categories: ✅ Performance, ✅ Accessibility, ✅ Best Practices, ✅ SEO
   - Klik "Analyze page load"

5. **Tunggu hasil** (30-60 detik)

6. **Screenshot hasil** untuk dokumentasi

**Interpretasi Score:**
- 90-100: Excellent ✅
- 50-89: Needs Improvement ⚠️
- 0-49: Poor ❌

**Metrics Penting:**
- **First Contentful Paint (FCP)**: < 1.8s ✅
- **Largest Contentful Paint (LCP)**: < 2.5s ✅
- **Total Blocking Time (TBT)**: < 200ms ✅
- **Cumulative Layout Shift (CLS)**: < 0.1 ✅
- **Speed Index**: < 3.4s ✅

### B. Network Analysis

**Langkah:**

1. **Buka DevTools → Network tab**

2. **Reload halaman** (Cmd+R atau Ctrl+R)

3. **Lihat metrics:**
   - **DOMContentLoaded**: Waktu sampai DOM siap
   - **Load**: Waktu sampai semua resource loaded
   - **Finish**: Total waktu request

4. **Analisis:**
   - Berapa banyak request?
   - Ukuran total transfer?
   - File mana yang paling besar?

**Target:**
- Total requests: < 50
- Total size: < 2MB
- Load time: < 3s

### C. Bundle Size Analysis

**Install Vite Bundle Visualizer:**
```bash
cd fe-ganesha-event
npm install --save-dev rollup-plugin-visualizer
```

**Update `vite.config.js`:**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
});
```

**Build dan Analisis:**
```bash
npm run build
```

Browser akan otomatis membuka visualisasi bundle size.

**Target:**
- Main bundle: < 500KB
- Vendor bundle: < 1MB
- Total: < 2MB

### D. React DevTools Profiler

**Langkah:**

1. **Install React DevTools** (Chrome Extension)

2. **Buka aplikasi**

3. **Buka DevTools → Profiler tab**

4. **Klik "Record"**

5. **Lakukan interaksi** (navigasi, klik button, dll)

6. **Stop recording**

7. **Analisis:**
   - Component mana yang paling lama render?
   - Apakah ada re-render yang tidak perlu?

**Optimasi:**
- Gunakan `React.memo()` untuk component yang jarang berubah
- Gunakan `useMemo()` dan `useCallback()` untuk expensive computations

### E. Dokumentasi Hasil Frontend Performance

**Template Tabel Lighthouse:**

| Page | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT |
|------|-------------|---------------|----------------|-----|-----|-----|-----|
| Home | 95 | 98 | 100 | 100 | 0.8s | 1.2s | 50ms |
| Events List | 92 | 98 | 100 | 95 | 1.0s | 1.5s | 80ms |
| Event Detail | 90 | 95 | 100 | 95 | 1.1s | 1.6s | 90ms |
| Dashboard | 88 | 98 | 100 | 90 | 1.2s | 1.8s | 120ms |

**Template Tabel Network:**

| Page | Requests | Size (Transferred) | Size (Resources) | Load Time | DOMContentLoaded |
|------|----------|-------------------|------------------|-----------|------------------|
| Home | 15 | 450 KB | 1.2 MB | 1.5s | 0.8s |
| Events | 18 | 520 KB | 1.4 MB | 1.8s | 1.0s |
| Dashboard | 22 | 680 KB | 1.8 MB | 2.2s | 1.2s |

---

## Template Dokumentasi

### Template Laporan Lengkap

```markdown
## B. White Box & Performance Testing

Pengujian ini dilakukan untuk memastikan efisiensi kode dan performa aplikasi yang optimal.

**Tanggal Pengujian:** 30 Desember 2025  
**Environment:** Local Development + Production (Railway & Vercel)  
**Tester:** [Nama Anda]

### 1. Efisiensi Query Database

#### A. Analisis N+1 Query Problem

Dilakukan pengecekan pada controller utama untuk memastikan tidak ada N+1 query problem:

| Controller | Method | Query Count | Optimasi | Status |
|------------|--------|-------------|----------|--------|
| EventController | index() | 2 queries | `withCount('tickets')` | PASS ✅ |
| TicketController | index() | 3 queries | `with(['event', 'user'])` | PASS ✅ |
| TicketController | store() | 5 queries | Transaction, validation | PASS ✅ |

**Kesimpulan:** Semua endpoint sudah menggunakan Eager Loading untuk menghindari N+1 query problem.

#### B. Indexing Database

Kolom-kolom berikut sudah memiliki index untuk mempercepat query:

**Tabel `events`:**
- `id` (Primary Key)
- `slug` (Unique Index)

**Tabel `tickets`:**
- `id` (Primary Key)
- `ticket_code` (Unique Index)
- `user_id` (Foreign Key Index)
- `event_id` (Foreign Key Index)

**Tabel `users`:**
- `id` (Primary Key)
- `email` (Unique Index)

### 2. Response Time API

Pengujian dilakukan menggunakan Laravel Feature Test dengan 10 iterasi per endpoint.

| No | Endpoint | Method | Avg Time | Min | Max | Target | Status |
|----|----------|--------|----------|-----|-----|--------|--------|
| 1 | /api/login | POST | 35ms | 28ms | 45ms | < 200ms | PASS ✅ |
| 2 | /api/register | POST | 42ms | 35ms | 55ms | < 200ms | PASS ✅ |
| 3 | /api/events | GET | 12ms | 8ms | 18ms | < 200ms | PASS ✅ |
| 4 | /api/events/{id} | GET | 8ms | 5ms | 12ms | < 200ms | PASS ✅ |
| 5 | /api/tickets | POST | 18ms | 15ms | 25ms | < 500ms | PASS ✅ |
| 6 | /api/my-tickets | GET | 10ms | 7ms | 15ms | < 200ms | PASS ✅ |

**Kesimpulan:** Semua endpoint memiliki response time yang sangat baik, jauh di bawah target yang ditetapkan.

### 3. Frontend Performance

#### A. Lighthouse Audit

| Page | Performance | Accessibility | Best Practices | SEO | FCP | LCP |
|------|-------------|---------------|----------------|-----|-----|-----|
| Home | 95 | 98 | 100 | 100 | 0.8s | 1.2s |
| Events | 92 | 98 | 100 | 95 | 1.0s | 1.5s |
| Dashboard | 88 | 98 | 100 | 90 | 1.2s | 1.8s |

**Screenshot:** [Masukkan screenshot Lighthouse]

#### B. Bundle Size

- **Main Bundle:** 420 KB (gzipped: 145 KB)
- **Vendor Bundle:** 850 KB (gzipped: 280 KB)
- **Total:** 1.27 MB (gzipped: 425 KB)

**Status:** ✅ PASS - Di bawah target 2MB

#### C. Network Performance

| Metric | Home Page | Events Page | Dashboard |
|--------|-----------|-------------|-----------|
| Requests | 15 | 18 | 22 |
| Size | 450 KB | 520 KB | 680 KB |
| Load Time | 1.5s | 1.8s | 2.2s |

**Status:** ✅ PASS - Semua halaman load < 3s

### 4. Kesimpulan Performance Testing

Berdasarkan hasil pengujian White Box & Performance Testing:

✅ **Query Database:** Efisien dengan penggunaan Eager Loading dan indexing yang tepat  
✅ **API Response Time:** Sangat cepat (rata-rata < 50ms untuk operasi sederhana)  
✅ **Frontend Performance:** Lighthouse score > 88 untuk semua halaman  
✅ **Bundle Size:** Optimal dengan total < 2MB  

**Tidak ditemukan bottleneck** yang signifikan. Aplikasi siap untuk production deployment.
```

---

## Checklist Eksekusi

Gunakan checklist ini untuk memastikan semua aspek sudah diuji:

### Backend
- [ ] Install Laravel Debugbar (optional)
- [ ] Cek N+1 Query di EventController
- [ ] Cek N+1 Query di TicketController
- [ ] Verifikasi indexing di migration files
- [ ] Buat PerformanceTest.php
- [ ] Run performance test
- [ ] Dokumentasikan hasil query efficiency
- [ ] Dokumentasikan hasil response time

### Frontend
- [ ] Run Lighthouse audit untuk Home page
- [ ] Run Lighthouse audit untuk Events page
- [ ] Run Lighthouse audit untuk Dashboard
- [ ] Analisis Network tab
- [ ] Install bundle visualizer
- [ ] Build dan cek bundle size
- [ ] Screenshot semua hasil
- [ ] Dokumentasikan hasil

### Dokumentasi
- [ ] Buat tabel hasil query testing
- [ ] Buat tabel hasil response time
- [ ] Buat tabel hasil Lighthouse
- [ ] Buat tabel hasil Network
- [ ] Screenshot Lighthouse reports
- [ ] Screenshot bundle visualizer
- [ ] Tulis kesimpulan

---

## Tips & Best Practices

### 1. Testing di Environment yang Konsisten
- Gunakan data yang sama untuk setiap test
- Close aplikasi lain saat testing
- Gunakan incognito mode untuk Lighthouse

### 2. Interpretasi Hasil
- Jangan hanya fokus pada angka
- Pahami **kenapa** suatu metric lambat
- Prioritaskan optimasi yang berdampak besar

### 3. Dokumentasi
- Screenshot adalah bukti penting
- Catat environment (local vs production)
- Jelaskan optimasi yang sudah dilakukan

### 4. Realistic Expectations
- Local testing akan lebih cepat dari production
- Network latency di production normal
- Target response time harus realistis

---

## Troubleshooting

### "Test terlalu cepat, hasilnya 0ms"
- Gunakan data yang lebih banyak (seed lebih banyak events)
- Jalankan test multiple times dan ambil rata-rata

### "Lighthouse score rendah"
- Cek apakah ada blocking scripts
- Optimize images (compress, lazy load)
- Enable caching
- Minify CSS/JS

### "Bundle size terlalu besar"
- Gunakan code splitting
- Lazy load components
- Remove unused dependencies
- Use tree shaking

---

**Good Luck! 🚀**
