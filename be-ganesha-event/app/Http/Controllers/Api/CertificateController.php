<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class CertificateController extends Controller
{
    public function download($ticketId)
    {
        $ticket = Ticket::with(['event', 'user'])->findOrFail($ticketId);
        $event = $ticket->event;
        $user = $ticket->user;

        // 1. Authorization & Validation
        // Ensure the logged-in user owns this ticket
        if ($ticket->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Ensure ticket is valid for certificate
        if (!$ticket->is_attended) {
            return response()->json(['message' => 'Anda belum menghadiri event ini.'], 403);
        }

        if (!$event->is_completed) {
            return response()->json(['message' => 'Event belum diselesaikan oleh panitia.'], 403);
        }

        if (!$event->certificate_template) {
            return response()->json(['message' => 'Template sertifikat belum tersedia.'], 404);
        }

        $templatePath = storage_path('app/public/' . $event->certificate_template);

        if (!file_exists($templatePath)) {
            return response()->json(['message' => 'File template tidak ditemukan di server.'], 404);
        }

        try {
            // 2. Image Processing
            $manager = new ImageManager(new Driver());
            $image = $manager->read($templatePath);

            // Add Name to Certificate
            $image->text($user->name, $image->width() / 2, $image->height() / 2, function ($font) {
                $fontPath = realpath(public_path('fonts/OpenSans-Bold.ttf'));
                if (!$fontPath || !file_exists($fontPath)) {
                    throw new \Exception("Font file missing at: " . public_path('fonts/OpenSans-Bold.ttf'));
                }
                $font->file($fontPath);
                $font->size(60); 
                $font->color('#000000');
                $font->align('center');
                $font->valign('middle');
            });

            // 3. Return Download Response
            $filename = 'Sertifikat-' . str_replace(' ', '-', $event->title) . '.jpg';
            
            return response($image->toJpeg(90))->header('Content-Type', 'image/jpeg')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal generate sertifikat: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString() 
            ], 500);
        }
    }
}
