<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Event;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
        }

        if ($request->has('admin') && $request->admin == 'true') {
             // Admin sees all events
        } else {
             // Public sees only active events
             $query->where('is_completed', 0);
        }

        return response()->json($query->orderBy('date', 'asc')->get());
    }

    public function show($id)
    {
        if (is_numeric($id)) {
            $event = Event::findOrFail($id);
        } else {
            $event = Event::where('slug', $id)->firstOrFail();
        }
        return response()->json($event);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'date' => 'required|date',
            'time' => 'required',
            'location' => 'required|string',
            'organizer' => 'required|string',
            'price' => 'numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'bank_name' => 'nullable|string',
            'account_number' => 'nullable|string',
            'account_holder' => 'nullable|string',
            'certificate_template' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'is_completed' => 'boolean',
        ]);

        if ($request->hasFile('certificate_template')) {
             $path = $request->file('certificate_template')->store('certificates/templates', 'public');
             $validated['certificate_template'] = $path;
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('events', 'public');
            $validated['image_url'] = url('storage/' . $path);
        }

        $event = Event::create($validated);
        return response()->json($event, 201);
    }

    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'string',
            'description' => 'string',
            'date' => 'date',
            'time' => 'string',
            'location' => 'string',
            'organizer' => 'string',
            'price' => 'numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'bank_name' => 'nullable|string',
            'account_number' => 'nullable|string',
            'account_holder' => 'nullable|string',
            'certificate_template' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'is_completed' => 'boolean',
        ]);

        if ($request->hasFile('certificate_template')) {
             if ($event->certificate_template) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($event->certificate_template);
             }
             $path = $request->file('certificate_template')->store('certificates/templates', 'public');
             $validated['certificate_template'] = $path;
        }

        if ($request->hasFile('image')) {
            // Delete old image if exists and is not a seed URL
            if ($event->image_url && strpos($event->image_url, 'http') === false) {
                 $oldPath = str_replace(url('storage/'), '', $event->image_url);
                 \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('events', 'public');
            $validated['image_url'] = url('storage/' . $path);
        }

        $event->update($validated);
        return response()->json($event);
    }

    public function destroy($id)
    {
        Event::destroy($id);
        return response()->json(null, 204);
    }
}
