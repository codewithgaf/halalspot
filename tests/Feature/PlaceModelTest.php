<?php

use App\Models\Place;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('creates a draft place using Eloquent', function () {
    $place = Place::create([
        'name' => 'Sample Restaurant',
        'slug' => 'sample-restaurant',
        'city' => 'Sample City',
        'latitude' => 8.228,
        'longitude' => 124.245,
    ]);

    expect($place->exists)->toBeTrue()
        ->and($place->publication_status)->toBe('draft')
        ->and($place->latitude)->toBe('8.2280000')
        ->and($place->longitude)->toBe('124.2450000');
});

it('does not mass assign publication fields', function () {
    $place = Place::create([
        'name' => 'Another Restaurant',
        'slug' => 'another-restaurant',
        'city' => 'Sample City',
        'publication_status' => 'published',
        'published_at' => now(),
    ]);

    expect($place->publication_status)->toBe('draft')
        ->and($place->published_at)->toBeNull();
});
