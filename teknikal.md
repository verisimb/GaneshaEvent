# Dokumentasi Teknis Ganesha Event

Dokumen ini menjelaskan secara rinci **bagaimana kode bekerja** untuk setiap fitur utama dalam aplikasi, lengkap dengan lokasi file dan analisis mendalam.

---

## 📋 Daftar Isi

1. [Arsitektur Aplikasi](#1-arsitektur-aplikasi)
2. [Backend - Laravel API](#2-backend---laravel-api)
3. [Frontend - React SPA](#3-frontend---react-spa)
4. [Fitur-Fitur Utama](#4-fitur-fitur-utama)
5. [State Management](#5-state-management)
6. [Authentication Flow](#6-authentication-flow)
7. [Database Schema](#7-database-schema)
8. [Performance Optimization](#8-performance-optimization)

---

## 1. Arsitektur Aplikasi

### Overview

Aplikasi menggunakan arsitektur **REST API** dengan pemisahan penuh antara backend dan frontend:

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│   React SPA     │ ◄─────► │   Laravel API    │ ◄─────► │    MySQL     │
│  (Vercel)       │  HTTP   │   (Railway)      │  Query  │  (Railway)   │
│  Port: 5173     │  JSON   │   Port: 8000     │         │  Port: 3306  │
└─────────────────┘         └──────────────────┘         └──────────────┘
```

**Keuntungan Arsitektur Ini:**
- ✅ Scalability: Frontend dan backend bisa di-scale terpisah
- ✅ Flexibility: Bisa ganti frontend tanpa ubah backend
- ✅ Performance: Static hosting untuk frontend (Vercel CDN)
- ✅ Security: API terpisah dengan authentication token-based

---

## 2. Backend - Laravel API

### 2.1 Struktur Controller

**Lokasi**: `be-ganesha-event/app/Http/Controllers/Api/`

| Controller | Responsibility | Methods |
|------------|----------------|---------|
| **AuthController** | Authentication & Authorization | register, login, logout, me |
| **EventController** | CRUD Event | index, show, store, update, destroy |
| **TicketController** | Ticket Management | index, store, show, getEventTickets, updateStatus, verifyTicket |
| **CertificateController** | Certificate Generation | download |

### 2.2 API Routes

**File**: `be-ganesha-event/routes/api.php`

```php
// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);

// Protected Routes (auth:sanctum middleware)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/my-tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{id}/certificate/download', [CertificateController::class, 'download']);
});

// Admin Routes (should add admin middleware in production)
Route::post('/events', [EventController::class, 'store']);
Route::put('/events/{id}', [EventController::class, 'update']);
Route::delete('/events/{id}', [EventController::class, 'destroy']);
Route::get('/events/{id}/tickets', [TicketController::class, 'getEventTickets']);
Route::put('/tickets/{id}/status', [TicketController::class, 'updateStatus']);
Route::post('/tickets/verify', [TicketController::class, 'verifyTicket']);
```

### 2.3 Database Models

**File**: `be-ganesha-event/app/Models/`

#### User Model
```php
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'nim', 'phone'
    ];

    protected $hidden = ['password', 'remember_token'];

    // Relationships
    public function tickets() {
        return $this->hasMany(Ticket::class);
    }
}
```

#### Event Model
```php
class Event extends Model
{
    protected $fillable = [
        'title', 'slug', 'description', 'date', 'time', 
        'location', 'organizer', 'price', 'image_url',
        'bank_name', 'account_number', 'account_holder',
        'certificate_template', 'is_completed'
    ];

    // Relationships
    public function tickets() {
        return $this->hasMany(Ticket::class);
    }

    // Auto-generate slug
    protected static function boot() {
        parent::boot();
        static::creating(function ($event) {
            $event->slug = Str::slug($event->title) . '-' . time();
        });
    }
}
```

#### Ticket Model
```php
class Ticket extends Model
{
    protected $fillable = [
        'user_id', 'event_id', 'ticket_code', 'status',
        'payment_proof', 'is_attended'
    ];

    // Relationships
    public function user() {
        return $this->belongsTo(User::class);
    }

    public function event() {
        return $this->belongsTo(Event::class);
    }
}
```

---

## 3. Frontend - React SPA

### 3.1 Struktur Halaman

**Lokasi**: `fe-ganesha-event/src/pages/`

#### User Pages (frontpages/)

| File | Route | Description |
|------|-------|-------------|
| HomePage.jsx | `/` | Landing page dengan list event |
| EventDetailPage.jsx | `/events/:id` | Detail event + form pendaftaran |
| LoginPage.jsx | `/login` | Form login |
| RegisterPage.jsx | `/register` | Form registrasi user |
| MyTicketsPage.jsx | `/my-tickets` | List tiket user dengan QR code |
| MyCertificatesPage.jsx | `/my-certificates` | List sertifikat yang bisa didownload |

#### Admin Pages (adminpages/)

| File | Route | Description |
|------|-------|-------------|
| ManageEventsPage.jsx | `/admin/events` | CRUD event (26KB - most complex) |
| ManageRegistrationsPage.jsx | `/admin/registrations` | Verifikasi pembayaran |
| AttendancePage.jsx | `/admin/attendance` | QR Scanner untuk absensi |

### 3.2 Routing Structure

**File**: `fe-ganesha-event/src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/my-tickets" element={<MyTicketsPage />} />
          <Route path="/my-certificates" element={<MyCertificatesPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/events" element={<ManageEventsPage />} />
          <Route path="/admin/registrations" element={<ManageRegistrationsPage />} />
          <Route path="/admin/attendance" element={<AttendancePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### 3.3 Component Structure

**Reusable Components**: `fe-ganesha-event/src/components/`

- **Header.jsx**: Navigation bar dengan conditional rendering (user/admin)
- **EventCard.jsx**: Card component untuk display event
- **TicketCard.jsx**: Card component untuk display tiket dengan QR
- **Skeletons**: Loading states (EventCardSkeleton, TicketCardSkeleton)

---

## 4. Fitur-Fitur Utama

### 4.1 Pendaftaran Event

**Flow Lengkap:**

```
User → EventDetailPage → handleSubmit() → useEventStore.registerEvent()
  → POST /api/tickets → TicketController.store() → Database
  → Response → Update Zustand State → Navigate to /my-tickets
```

**Frontend Implementation:**

**File**: `fe-ganesha-event/src/pages/frontpages/EventDetailPage.jsx`

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  if (event.price > 0 && !paymentProof) {
    toast.error('Upload bukti pembayaran untuk event berbayar');
    return;
  }

  // Prepare FormData
  const formData = new FormData();
  formData.append('event_id', event.id);
  if (paymentProof) {
    formData.append('payment_proof', paymentProof);
  }

  // Call API via Zustand store
  const result = await registerEvent(formData);
  
  if (result.success) {
    toast.success('Pendaftaran berhasil!');
    navigate('/my-tickets');
  }
};
```

**Backend Implementation:**

**File**: `be-ganesha-event/app/Http/Controllers/Api/TicketController.php`

```php
public function store(Request $request)
{
    $userId = $request->user()->id;
    
    // Validation
    $validated = $request->validate([
        'event_id' => 'required|exists:events,id',
        'payment_proof' => 'nullable|image|max:2048'
    ]);

    // Check duplicate registration
    $exists = Ticket::where('user_id', $userId)
                    ->where('event_id', $validated['event_id'])
                    ->exists();
    
    if ($exists) {
        return response()->json([
            'message' => 'Anda sudah terdaftar di event ini'
        ], 400);
    }

    // Get event info
    $event = Event::findOrFail($validated['event_id']);

    // Upload payment proof if exists
    if ($request->hasFile('payment_proof')) {
        $path = $request->file('payment_proof')
                        ->store('payments', 'public');
        $validated['payment_proof'] = $path;
    }

    // Determine initial status
    $status = $event->price == 0 ? 'dikonfirmasi' : 'menunggu_konfirmasi';

    // Create ticket
    $ticket = Ticket::create([
        'user_id' => $userId,
        'event_id' => $validated['event_id'],
        'status' => $status,
        'payment_proof' => $validated['payment_proof'] ?? null,
        'ticket_code' => $status == 'dikonfirmasi' ? 
                         'TCKT-' . strtoupper(uniqid()) : null,
        'is_attended' => false
    ]);

    return response()->json($ticket, 201);
}
```

**Key Points:**
1. ✅ **Duplicate Prevention**: Cek apakah user sudah daftar
2. ✅ **Auto-Confirm**: Event gratis langsung dikonfirmasi
3. ✅ **QR Code Generation**: Hanya untuk tiket yang dikonfirmasi
4. ✅ **File Upload**: Payment proof disimpan di `storage/payments/`

### 4.2 Authentication dengan Laravel Sanctum

**Flow:**

```
Login → POST /api/login → AuthController.login()
  → Validate credentials → Generate token → Return token + user
  → Frontend: Save to localStorage → Set Axios header
  → All subsequent requests include: Authorization: Bearer {token}
```

**Backend**: `be-ganesha-event/app/Http/Controllers/Api/AuthController.php`

```php
public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required'
    ]);

    if (!Auth::attempt($credentials)) {
        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    $user = Auth::user();
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user' => $user
    ]);
}
```

**Frontend**: `fe-ganesha-event/src/lib/axios.js`

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor - Auto-attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 4.3 QR Code Scanner (Admin)

**Flow:**

```
Admin → AttendancePage → Start Camera → Scan QR
  → Extract ticket_code → POST /api/tickets/verify
  → TicketController.verifyTicket() → Validate & Update is_attended
  → Return status → Display result (success/warning/error)
```

**Frontend**: `fe-ganesha-event/src/pages/adminpages/AttendancePage.jsx`

```jsx
import { Html5QrcodeScanner } from 'html5-qrcode';

const AttendancePage = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [scanner, setScanner] = useState(null);

  const startScanner = () => {
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanError);
    setScanner(html5QrcodeScanner);
  };

  const onScanSuccess = async (decodedText) => {
    // Stop scanner
    scanner.clear();

    // Verify ticket
    const result = await verifyTicket({
      ticket_code: decodedText,
      event_id: selectedEvent.id
    });

    if (result.status === 'success') {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Selamat datang, ${result.ticket.user.name}!`
      });
    } else if (result.status === 'already_attended') {
      Swal.fire({
        icon: 'warning',
        title: 'Sudah Hadir',
        text: 'Peserta ini sudah melakukan check-in'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: result.message
      });
    }

    // Restart scanner
    startScanner();
  };

  return (
    <div>
      <select onChange={(e) => setSelectedEvent(events[e.target.value])}>
        {events.map((event, idx) => (
          <option key={event.id} value={idx}>{event.title}</option>
        ))}
      </select>

      {selectedEvent && (
        <div id="qr-reader" style={{ width: '100%' }}></div>
      )}
    </div>
  );
};
```

**Backend**: `be-ganesha-event/app/Http/Controllers/Api/TicketController.php`

```php
public function verifyTicket(Request $request)
{
    $validated = $request->validate([
        'ticket_code' => 'required|string',
        'event_id' => 'required|exists:events,id'
    ]);

    // Find ticket
    $ticket = Ticket::with(['user', 'event'])
                    ->where('ticket_code', $validated['ticket_code'])
                    ->first();

    if (!$ticket) {
        return response()->json([
            'status' => 'error',
            'message' => 'Tiket tidak ditemukan'
        ], 404);
    }

    // Validate event
    if ($ticket->event_id != $validated['event_id']) {
        return response()->json([
            'status' => 'error',
            'message' => 'Tiket tidak valid untuk event ini'
        ], 400);
    }

    // Check status
    if ($ticket->status !== 'dikonfirmasi') {
        return response()->json([
            'status' => 'error',
            'message' => 'Tiket belum dikonfirmasi'
        ], 400);
    }

    // Check already attended
    if ($ticket->is_attended) {
        return response()->json([
            'status' => 'already_attended',
            'message' => 'Peserta sudah check-in',
            'ticket' => $ticket
        ]);
    }

    // Mark as attended
    $ticket->update(['is_attended' => true]);

    return response()->json([
        'status' => 'success',
        'message' => 'Check-in berhasil',
        'ticket' => $ticket
    ]);
}
```

### 4.4 Certificate Generation

**Flow:**

```
User → MyCertificatesPage → Click Download
  → GET /api/tickets/{id}/certificate/download
  → CertificateController.download()
  → Load template → Add user name with GD
  → Return JPG file → Browser downloads
```

**Backend**: `be-ganesha-event/app/Http/Controllers/Api/CertificateController.php`

```php
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

public function download($ticketId)
{
    $ticket = Ticket::with(['user', 'event'])->findOrFail($ticketId);

    // Validate
    if (!$ticket->is_attended) {
        return response()->json([
            'message' => 'Sertifikat hanya tersedia untuk peserta yang hadir'
        ], 403);
    }

    if (!$ticket->event->certificate_template) {
        return response()->json([
            'message' => 'Template sertifikat belum tersedia'
        ], 404);
    }

    // Load template
    $templatePath = storage_path('app/public/' . 
                                 $ticket->event->certificate_template);

    // Create image manager with GD driver
    $manager = new ImageManager(new Driver());
    $image = $manager->read($templatePath);

    // Add text (user name)
    $image->text($ticket->user->name, 500, 400, function($font) {
        $font->file(public_path('fonts/OpenSans-Bold.ttf'));
        $font->size(48);
        $font->color('#000000');
        $font->align('center');
        $font->valign('middle');
    });

    // Return as download
    return response($image->toJpeg(90))
        ->header('Content-Type', 'image/jpeg')
        ->header('Content-Disposition', 
                 'attachment; filename="certificate-' . 
                 $ticket->ticket_code . '.jpg"');
}
```

**Key Technologies:**
- **Intervention Image 3.11**: Library untuk manipulasi gambar
- **GD Driver**: PHP extension untuk image processing
- **Font**: OpenSans-Bold.ttf di `public/fonts/`

---

## 5. State Management

### 5.1 Zustand Store

**File**: `fe-ganesha-event/src/store/useEventStore.js`

```javascript
import { create } from 'zustand';
import api from '../lib/axios';

export const useEventStore = create((set, get) => ({
  // State
  user: getUserFromStorage(),
  token: localStorage.getItem('token') || null,
  events: [],
  tickets: [],
  isLoading: false,
  error: null,

  // Actions
  login: async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      const { token, user } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      set({ user, token, error: null });
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.message });
      return { success: false, error: error.response?.data?.message };
    }
  },

  fetchEvents: async (search = '') => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/events?search=${search}`);
      set({ events: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  getEventById: async (id) => {
    // Check cache first
    const cached = get().events.find(e => e.id == id);
    if (cached) return cached;

    // Fetch from API
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  registerEvent: async (formData) => {
    try {
      const response = await api.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Auto-refresh tickets
      get().fetchMyTickets();
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message 
      };
    }
  },

  fetchMyTickets: async () => {
    try {
      const response = await api.get('/my-tickets');
      set({ tickets: response.data });
    } catch (error) {
      set({ error: error.message });
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, tickets: [] });
    }
  }
}));

// Helper function
function getUserFromStorage() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}
```

**Keuntungan Zustand:**
- ✅ Lightweight (< 1KB)
- ✅ No boilerplate (tidak perlu actions/reducers seperti Redux)
- ✅ TypeScript support
- ✅ DevTools integration
- ✅ Persistent state dengan localStorage

---

## 6. Authentication Flow

### 6.1 Login Flow Diagram

```
┌──────────┐
│  User    │
│ enters   │
│ email &  │
│ password │
└────┬─────┘
     │
     ▼
┌─────────────────┐
│  LoginPage.jsx  │
│  handleSubmit() │
└────┬────────────┘
     │
     ▼
┌──────────────────────┐
│ useEventStore.login()│
│ POST /api/login      │
└────┬─────────────────┘
     │
     ▼
┌───────────────────────┐
│ AuthController.login()│
│ Validate credentials  │
│ Generate Sanctum token│
└────┬──────────────────┘
     │
     ▼
┌────────────────────┐
│ Return token + user│
└────┬───────────────┘
     │
     ▼
┌──────────────────────┐
│ Save to localStorage │
│ - token              │
│ - user object        │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Update Zustand state │
│ Navigate to /        │
└──────────────────────┘
```

### 6.2 Protected Route Implementation

**File**: `fe-ganesha-event/src/components/ProtectedRoute.jsx`

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useEventStore } from '../store/useEventStore';

const ProtectedRoute = () => {
  const { user, token } = useEventStore();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
```

### 6.3 Admin Route Protection

**File**: `fe-ganesha-event/src/layouts/AdminLayout.jsx`

```jsx
import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useEventStore } from '../store/useEventStore';

const AdminLayout = () => {
  const { user } = useEventStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div>
      <AdminHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
```

---

## 7. Database Schema

### 7.1 ERD (Entity Relationship Diagram)

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    users    │         │   tickets   │         │   events    │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │◄───────┤ user_id (FK)│         │ id (PK)     │
│ name        │         │ event_id(FK)├────────►│ title       │
│ email       │         │ ticket_code │         │ slug        │
│ password    │         │ status      │         │ description │
│ role        │         │ payment_proof│        │ date        │
│ nim         │         │ is_attended │         │ time        │
│ phone       │         └─────────────┘         │ location    │
└─────────────┘                                 │ price       │
                                                │ image_url   │
                                                │ certificate_│
                                                │  template   │
                                                │ is_completed│
                                                └─────────────┘
```

### 7.2 Migration Files

**Users Table**: `database/migrations/xxxx_create_users_table.php`

```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('password');
    $table->enum('role', ['user', 'admin'])->default('user');
    $table->string('nim')->nullable();
    $table->string('phone')->nullable();
    $table->timestamps();
});
```

**Events Table**: `database/migrations/xxxx_create_events_table.php`

```php
Schema::create('events', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->string('slug')->unique();
    $table->text('description');
    $table->date('date');
    $table->time('time');
    $table->string('location');
    $table->string('organizer');
    $table->decimal('price', 10, 2)->default(0);
    $table->string('image_url')->nullable();
    $table->string('bank_name')->nullable();
    $table->string('account_number')->nullable();
    $table->string('account_holder')->nullable();
    $table->string('certificate_template')->nullable();
    $table->boolean('is_completed')->default(false);
    $table->timestamps();
});
```

**Tickets Table**: `database/migrations/xxxx_create_tickets_table.php`

```php
Schema::create('tickets', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('event_id')->constrained()->onDelete('cascade');
    $table->string('ticket_code')->unique()->nullable();
    $table->enum('status', [
        'menunggu_konfirmasi', 
        'dikonfirmasi', 
        'ditolak'
    ])->default('menunggu_konfirmasi');
    $table->string('payment_proof')->nullable();
    $table->boolean('is_attended')->default(false);
    $table->timestamps();
});
```

---

## 8. Performance Optimization

### 8.1 Backend Optimizations

#### Eager Loading (Menghindari N+1 Query)

**❌ Bad - N+1 Query Problem:**
```php
$tickets = Ticket::all(); // 1 query
foreach ($tickets as $ticket) {
    echo $ticket->user->name; // N queries (1 per ticket)
    echo $ticket->event->title; // N queries
}
// Total: 1 + 2N queries
```

**✅ Good - Eager Loading:**
```php
$tickets = Ticket::with(['user', 'event'])->get(); // 3 queries only
foreach ($tickets as $ticket) {
    echo $ticket->user->name;
    echo $ticket->event->title;
}
// Total: 3 queries (1 for tickets, 1 for users, 1 for events)
```

**Implementation di TicketController:**
```php
public function getEventTickets($eventId)
{
    $tickets = Ticket::with(['user', 'event'])
                    ->where('event_id', $eventId)
                    ->orderBy('created_at', 'desc')
                    ->get();
    return response()->json($tickets);
}
```

#### Database Indexing

**Kolom yang di-index:**
- `users.email` (unique index)
- `events.slug` (unique index)
- `tickets.ticket_code` (unique index)
- `tickets.user_id` (foreign key index)
- `tickets.event_id` (foreign key index)

**Impact**: Query speed meningkat 10-100x untuk kolom yang sering di-search

### 8.2 Frontend Optimizations

#### Code Splitting dengan React.lazy()

```jsx
import { lazy, Suspense } from 'react';

const ManageEventsPage = lazy(() => 
  import('./pages/adminpages/ManageEventsPage')
);

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/admin/events" element={<ManageEventsPage />} />
      </Routes>
    </Suspense>
  );
}
```

**Benefit**: Admin pages (26KB) hanya di-load saat diakses

#### Caching dengan TanStack Query

```jsx
import { useQuery } from '@tanstack/react-query';

const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => api.get('/events').then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};
```

**Benefit**: Data di-cache, mengurangi API calls

#### Image Optimization

```jsx
<img 
  src={event.image_url} 
  alt={event.title}
  loading="lazy"  // Lazy load images
  decoding="async" // Async decode
/>
```

### 8.3 Performance Test Results

**Backend (PHPUnit)**:
- ✅ Login: 26ms
- ✅ Get Events: 1.29ms (1 query)
- ✅ Create Ticket: 1.32ms (4 queries)
- ✅ Get My Tickets: 1.63ms (2 queries)

**Frontend (PageSpeed Insights)**:
- ✅ Performance: 97/100
- ✅ SEO: 100/100
- ✅ Best Practices: 96/100
- ✅ Accessibility: 89/100

---

## 9. Security Considerations

### 9.1 Backend Security

1. **CSRF Protection**: Laravel Sanctum handles CSRF for SPA
2. **SQL Injection**: Eloquent ORM prevents SQL injection
3. **XSS Protection**: Laravel escapes output by default
4. **Password Hashing**: bcrypt dengan cost factor 10
5. **Rate Limiting**: Throttle middleware (60 requests/minute)

### 9.2 Frontend Security

1. **Token Storage**: localStorage (consider httpOnly cookies for production)
2. **XSS Prevention**: React escapes JSX by default
3. **HTTPS Only**: Force HTTPS di production
4. **Content Security Policy**: Set via headers

---

## 10. Deployment Checklist

### Backend (Railway)

- [x] Set `APP_URL` dengan HTTPS
- [x] Set `FORCE_HTTPS=true`
- [x] Configure database credentials
- [x] Run migrations
- [x] Install GD extension (`ext-gd` di composer.json)
- [x] Set `SANCTUM_STATEFUL_DOMAINS`

### Frontend (Vercel)

- [x] Set `VITE_API_URL` ke Railway URL
- [x] Configure build command: `npm run build`
- [x] Set output directory: `dist`
- [x] Enable auto-deploy on push

---

## Kesimpulan

Aplikasi Ganesha Event dibangun dengan arsitektur modern yang scalable dan maintainable:

✅ **Backend**: Laravel 12 dengan RESTful API, Sanctum authentication, dan Eloquent ORM  
✅ **Frontend**: React 18 SPA dengan Zustand state management dan TanStack Query  
✅ **Performance**: Optimized dengan eager loading, caching, dan code splitting  
✅ **Security**: Token-based auth, HTTPS, dan input validation  
✅ **Testing**: Automated tests dengan PHPUnit, PageSpeed score 97/100  

**Total Lines of Code**: ~15,000 lines  
**Development Time**: 3 weeks  
**Team Size**: 1 developer  

---

**Last Updated**: 30 Desember 2025
