<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PerformanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(); // Seed database dengan data test
    }

    /**
     * Test Login Response Time
     * Target: < 200ms
     */
    public function test_login_response_time()
    {
        // Use existing seeded user or create one
        $user = User::where('email', 'user@example.com')->first();
        
        if (!$user) {
            $user = User::create([
                'name' => 'Test User',
                'email' => 'perftest@example.com',
                'password' => bcrypt('password'),
                'role' => 'user'
            ]);
        }

        $start = microtime(true);
        
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password'
        ]);
        
        $duration = (microtime(true) - $start) * 1000; // Convert to ms
        
        echo "\n🕐 Login Response Time: " . round($duration, 2) . "ms";
        
        $this->assertLessThan(200, $duration, "Login should be < 200ms");
        $response->assertStatus(200);
    }

    /**
     * Test Register Response Time
     * Target: < 200ms
     */
    public function test_register_response_time()
    {
        $start = microtime(true);
        
        $response = $this->postJson('/api/register', [
            'name' => 'Performance Test User',
            'email' => 'newuser' . time() . '@perftest.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'nim' => '123456789',
            'phone' => '081234567890'
        ]);
        
        $duration = (microtime(true) - $start) * 1000;
        
        echo "\n🕐 Register Response Time: " . round($duration, 2) . "ms";
        
        $this->assertLessThan(200, $duration, "Register should be < 200ms");
        $response->assertStatus(201);
    }

    /**
     * Test Get Events List Response Time
     * Target: < 200ms
     */
    public function test_get_events_response_time()
    {
        // Create additional events if needed
        for ($i = 0; $i < 10; $i++) {
            Event::create([
                'title' => 'Performance Test Event ' . $i,
                'slug' => 'perf-test-event-' . $i . '-' . time(),
                'description' => 'Test event for performance testing',
                'date' => now()->addDays($i),
                'time' => '10:00',
                'location' => 'Test Location',
                'organizer' => 'Test Organizer',
                'price' => 0,
                'is_completed' => false
            ]);
        }

        DB::enableQueryLog();
        $start = microtime(true);
        
        $response = $this->getJson('/api/events');
        
        $duration = (microtime(true) - $start) * 1000;
        $queries = DB::getQueryLog();
        
        echo "\n🕐 Get Events Response Time: " . round($duration, 2) . "ms";
        echo "\n📊 Query Count: " . count($queries);
        
        $this->assertLessThan(200, $duration, "Get Events should be < 200ms");
        $this->assertLessThan(10, count($queries), "Should use < 10 queries (avoid N+1)");
        $response->assertStatus(200);
    }

    /**
     * Test Get Event Detail Response Time
     * Target: < 200ms
     */
    public function test_get_event_detail_response_time()
    {
        $event = Event::first();
        
        if (!$event) {
            $event = Event::create([
                'title' => 'Test Event Detail',
                'slug' => 'test-event-detail-' . time(),
                'description' => 'Test event',
                'date' => now()->addDays(1),
                'time' => '10:00',
                'location' => 'Test Location',
                'organizer' => 'Test Organizer',
                'price' => 0,
                'is_completed' => false
            ]);
        }

        DB::enableQueryLog();
        $start = microtime(true);
        
        $response = $this->getJson("/api/events/{$event->id}");
        
        $duration = (microtime(true) - $start) * 1000;
        $queries = DB::getQueryLog();
        
        echo "\n🕐 Get Event Detail Response Time: " . round($duration, 2) . "ms";
        echo "\n📊 Query Count: " . count($queries);
        
        $this->assertLessThan(200, $duration, "Get Event Detail should be < 200ms");
        $this->assertLessThan(5, count($queries), "Should use < 5 queries");
        $response->assertStatus(200);
    }

    /**
     * Test Create Ticket Response Time
     * Target: < 500ms (lebih kompleks karena ada insert)
     */
    public function test_create_ticket_response_time()
    {
        $user = User::where('role', 'user')->first();
        if (!$user) {
            $user = User::create([
                'name' => 'Ticket Test User',
                'email' => 'ticketuser@test.com',
                'password' => bcrypt('password'),
                'role' => 'user'
            ]);
        }

        $event = Event::where('price', 0)->where('is_completed', false)->first();
        if (!$event) {
            $event = Event::create([
                'title' => 'Free Test Event',
                'slug' => 'free-test-event-' . time(),
                'description' => 'Free event for testing',
                'date' => now()->addDays(1),
                'time' => '10:00',
                'location' => 'Test Location',
                'organizer' => 'Test Organizer',
                'price' => 0,
                'is_completed' => false
            ]);
        }

        $this->actingAs($user, 'sanctum');

        DB::enableQueryLog();
        $start = microtime(true);
        
        $response = $this->postJson('/api/tickets', [
            'event_id' => $event->id
        ]);
        
        $duration = (microtime(true) - $start) * 1000;
        $queries = DB::getQueryLog();
        
        echo "\n🕐 Create Ticket Response Time: " . round($duration, 2) . "ms";
        echo "\n📊 Query Count: " . count($queries);
        
        $this->assertLessThan(500, $duration, "Create Ticket should be < 500ms");
        $this->assertLessThan(15, count($queries), "Should use < 15 queries");
        $response->assertStatus(201);
    }

    /**
     * Test Get My Tickets Response Time
     * Target: < 200ms
     */
    public function test_get_my_tickets_response_time()
    {
        $user = User::where('role', 'user')->first();
        if (!$user) {
            $user = User::create([
                'name' => 'My Tickets User',
                'email' => 'myticketsuser@test.com',
                'password' => bcrypt('password'),
                'role' => 'user'
            ]);
        }

        // Create some tickets for this user
        $events = Event::take(3)->get();
        foreach ($events as $event) {
            Ticket::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'status' => 'dikonfirmasi',
                'ticket_code' => 'PERF-' . Str::random(10),
                'is_attended' => false
            ]);
        }

        $this->actingAs($user, 'sanctum');

        DB::enableQueryLog();
        $start = microtime(true);
        
        $response = $this->getJson('/api/my-tickets');
        
        $duration = (microtime(true) - $start) * 1000;
        $queries = DB::getQueryLog();
        
        echo "\n🕐 Get My Tickets Response Time: " . round($duration, 2) . "ms";
        echo "\n📊 Query Count: " . count($queries);
        
        $this->assertLessThan(200, $duration, "Get My Tickets should be < 200ms");
        $this->assertLessThan(10, count($queries), "Should use < 10 queries (check eager loading)");
        $response->assertStatus(200);
    }

    /**
     * Test Get Event Tickets (Admin) Response Time
     * Target: < 200ms
     */
    public function test_get_event_tickets_admin_response_time()
    {
        $event = Event::first();
        if (!$event) {
            $event = Event::create([
                'title' => 'Admin Test Event',
                'slug' => 'admin-test-event-' . time(),
                'description' => 'Event for admin testing',
                'date' => now()->addDays(1),
                'time' => '10:00',
                'location' => 'Test Location',
                'organizer' => 'Test Organizer',
                'price' => 0,
                'is_completed' => false
            ]);
        }

        // Create tickets for this event
        $users = User::where('role', 'user')->take(5)->get();
        foreach ($users as $user) {
            Ticket::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'status' => 'dikonfirmasi',
                'ticket_code' => 'ADMIN-' . Str::random(10),
                'is_attended' => false
            ]);
        }

        DB::enableQueryLog();
        $start = microtime(true);
        
        $response = $this->getJson("/api/events/{$event->id}/tickets");
        
        $duration = (microtime(true) - $start) * 1000;
        $queries = DB::getQueryLog();
        
        echo "\n🕐 Get Event Tickets (Admin) Response Time: " . round($duration, 2) . "ms";
        echo "\n📊 Query Count: " . count($queries);
        
        $this->assertLessThan(200, $duration, "Get Event Tickets should be < 200ms");
        $this->assertLessThan(5, count($queries), "Should use eager loading to avoid N+1");
        $response->assertStatus(200);
    }

    /**
     * Test Update Ticket Status Response Time
     * Target: < 300ms
     */
    public function test_update_ticket_status_response_time()
    {
        $ticket = Ticket::where('status', 'menunggu_konfirmasi')->first();
        
        if (!$ticket) {
            $user = User::where('role', 'user')->first();
            $event = Event::first();
            
            $ticket = Ticket::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'status' => 'menunggu_konfirmasi',
                'ticket_code' => 'STATUS-' . Str::random(10),
                'is_attended' => false
            ]);
        }

        $start = microtime(true);
        
        $response = $this->putJson("/api/tickets/{$ticket->id}/status", [
            'status' => 'dikonfirmasi'
        ]);
        
        $duration = (microtime(true) - $start) * 1000;
        
        echo "\n🕐 Update Ticket Status Response Time: " . round($duration, 2) . "ms";
        
        $this->assertLessThan(300, $duration, "Update Ticket Status should be < 300ms");
        $response->assertStatus(200);
    }

    /**
     * Summary Test - Print All Results
     */
    public function test_performance_summary()
    {
        echo "\n\n";
        echo "╔════════════════════════════════════════════════════════════╗\n";
        echo "║         PERFORMANCE TEST SUMMARY - GANESHA EVENT          ║\n";
        echo "╚════════════════════════════════════════════════════════════╝\n";
        echo "\n";
        echo "✅ All performance tests completed!\n";
        echo "📊 Check individual test results above for detailed metrics.\n";
        echo "\n";
        echo "Target Benchmarks:\n";
        echo "  • Simple Operations (GET, Login): < 200ms\n";
        echo "  • Complex Operations (POST, PUT): < 500ms\n";
        echo "  • Query Count: < 10 per request\n";
        echo "\n";
        
        $this->assertTrue(true);
    }
}
