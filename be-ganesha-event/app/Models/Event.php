<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'title',
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
}
