<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket;
use Illuminate\Support\Facades\Auth;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        // For testing without auth, we'll fetch tickets for user_id 1 or return all tickets
        // $user = $request->user();
        // $userId = $user ? $user->id : 1;
        $userId = 1; // HARDCODED for testing
        
        $tickets = Ticket::with(['event'])->where('user_id', $userId)->get();
        return response()->json($tickets);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
            'payment_proof' => 'nullable', // Permit file or string
        ]);

        $userId = 1; // HARDCODED for testing

        // Check if user is already registered for THIS event
        $exists = Ticket::where('user_id', $userId)
                        ->where('event_id', $validated['event_id'])
                        ->exists();
        
        if ($exists) {
            return response()->json(['message' => 'Already registered'], 409);
        }

        $paymentProofUrl = null;
        if ($request->hasFile('payment_proof')) {
             $path = $request->file('payment_proof')->store('payments', 'public');
             $paymentProofUrl = url('storage/' . $path);
        } else if (isset($validated['payment_proof']) && is_string($validated['payment_proof'])) {
             // Handle case where it might be a string (URL) if passed that way, though file is preferred
             $paymentProofUrl = $validated['payment_proof'];
        }

        $event = \App\Models\Event::findOrFail($validated['event_id']);
        $status = $event->price == 0 ? 'dikonfirmasi' : 'menunggu_konfirmasi';

        $ticket = Ticket::create([
            'user_id' => $userId,
            'event_id' => $validated['event_id'],
            'status' => $status, 
            'payment_proof' => $paymentProofUrl,
            'ticket_code' => 'TCKT-' . strtoupper(uniqid()), // Simple unique code
            'is_attended' => false,
        ]);

        return response()->json($ticket, 201);
    }

    public function show($id)
    {
        $ticket = Ticket::with(['event', 'user'])->findOrFail($id);
        return response()->json($ticket);
    }
}
