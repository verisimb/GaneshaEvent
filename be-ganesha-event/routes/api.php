<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\PublicController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/public-stats', [PublicController::class, 'stats']);
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // User Tickets
    Route::get('/my-tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
});

// Admin Events (Keep public/admin specific for now or move if admin auth is ready, but request was for Login/Register features first)
// Admin routes often need admin middleware, but for now let's leave them public as they were "Temporarily Public" in the original file, or wait, the plan said "Move /my-tickets and /tickets (POST) into auth:sanctum".
// I will just move the ticket routes.

// Admin Events
Route::post('/events', [EventController::class, 'store']);
Route::put('/events/{id}', [EventController::class, 'update']);
Route::delete('/events/{id}', [EventController::class, 'destroy']);

// Admin Registrations
Route::get('/events/{id}/tickets', [TicketController::class, 'getEventTickets']);
Route::put('/tickets/{id}/status', [TicketController::class, 'updateStatus']);
Route::post('/tickets/verify', [TicketController::class, 'verifyTicket']);
