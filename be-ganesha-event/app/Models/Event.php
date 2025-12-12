<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Event extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'date',
        'time',
        'location',
        'organizer',
        'price',
        'image_url',
        'bank_name',
        'account_number',
        'account_holder',
        'certificate_template',
        'is_completed',
    ];

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    protected static function booted()
    {
        static::creating(function ($event) {
            $event->slug = Str::slug($event->title) . '-' . Str::random(6);
        });

        static::updating(function ($event) {
            if ($event->isDirty('title')) {
                $event->slug = Str::slug($event->title) . '-' . Str::random(6);
            }
        });
    }
}
