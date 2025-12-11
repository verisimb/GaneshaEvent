<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;
use App\Models\User;
use App\Models\Ticket;

class PublicController extends Controller
{
    public function stats()
    {
        $activeEvents = Event::count();
        $totalUsers = User::where('role', 'user')->count();
        $totalCertificates = Ticket::where('is_attended', true)->count();

        // Ensure reasonable minimums for display if DB is empty
        // Or just return actuals. Let's return actuals.
        
        return response()->json([
            'events' => $activeEvents,
            'users' => $totalUsers,
            'certificates' => $totalCertificates
        ]);
    }
}
