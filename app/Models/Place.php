<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name',
    'slug',
    'description',
    'address',
    'city',
    'province',
    'country_code',
    'latitude',
    'longitude',
    'image_path',
])]
class Place extends Model
{
    protected $attributes = [
        'publication_status' => 'draft',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'published_at' => 'immutable_datetime',
        ];
    }
}
