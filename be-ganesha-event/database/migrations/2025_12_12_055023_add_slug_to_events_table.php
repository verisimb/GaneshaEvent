<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Event;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('slug')->unique()->nullable()->after('title');
        });

        // Populate existing events
        // Using model or DB query
        $events = DB::table('events')->get();
        foreach ($events as $event) {
            $slug = Str::slug($event->title) . '-' . $event->id; // Append ID to ensure uniqueness for existing
            DB::table('events')->where('id', $event->id)->update(['slug' => $slug]);
        }
        
        // Optional: Make it not nullable now if every row has a slug
        // Schema::table('events', function (Blueprint $table) {
        //    $table->string('slug')->nullable(false)->change();
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
