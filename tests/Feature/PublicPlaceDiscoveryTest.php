<?php

use App\Models\Place;
use Inertia\Testing\AssertableInertia as Assert;

it('returns only published places for public discovery', function () {
    $draft = Place::create([
        'name' => 'Draft Restaurant',
        'slug' => 'draft-restaurant',
        'city' => 'Iligan City',
    ]);

    $published = Place::create([
        'name' => 'Published Restaurant',
        'slug' => 'published-restaurant',
        'city' => 'Iligan City',
        'address' => 'Sample Street',
        'latitude' => 8.228,
        'longitude' => 124.245,
    ]);

    $published->publication_status = 'published';
    $published->published_at = now();
    $published->save();

    $archived = Place::create([
        'name' => 'Archived Restaurant',
        'slug' => 'archived-restaurant',
        'city' => 'Iligan City',
    ]);

    $archived->publication_status = 'archived';
    $archived->save();

    $results = Place::query()
        ->where('publication_status', 'published')
        ->get();

    expect($results->pluck('id')->all())
        ->toContain($published->id)
        ->not->toContain($draft->id)
        ->not->toContain($archived->id);
});

it('provides only published places to public homepage visitors', function () {
    Place::create([
        'name' => 'Draft Restaurant',
        'slug' => 'homepage-draft',
        'city' => 'Iligan City',
    ]);

    $published = Place::create([
        'name' => 'Published Restaurant',
        'slug' => 'homepage-published',
        'city' => 'Iligan City',
        'address' => 'Sample Street',
        'latitude' => 8.228,
        'longitude' => 124.245,
    ]);

    $published->publication_status = 'published';
    $published->published_at = now();
    $published->save();

    $archived = Place::create([
        'name' => 'Archived Restaurant',
        'slug' => 'homepage-archived',
        'city' => 'Iligan City',
    ]);

    $archived->publication_status = 'archived';
    $archived->save();

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('places', 1)
            ->where('places.0.slug', 'homepage-published')
            ->where('places.0.name', 'Published Restaurant')
            ->missing('places.0.publication_status')
            ->missing('places.0.published_at')
            ->missing('places.0.latitude')
            ->missing('places.0.longitude')
        );
});
