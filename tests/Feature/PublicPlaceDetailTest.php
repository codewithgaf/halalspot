<?php

use App\Models\Place;
use Inertia\Testing\AssertableInertia as Assert;

it('shows a published restaurant detail page to a guest', function () {
    $place = Place::create([
        'name' => 'Sample Iligan Restaurant',
        'slug' => 'sample-iligan-restaurant',
        'description' => 'A fictional restaurant for testing.',
        'address' => 'Sample Street, Iligan City',
        'city' => 'Iligan City',
        'country_code' => 'PH',
        'latitude' => 8.228,
        'longitude' => 124.245,
    ]);

    $place->publication_status = 'published';
    $place->published_at = now();
    $place->save();

    $this->get('/restaurants/sample-iligan-restaurant')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('restaurants/show')
            ->where('place.slug', 'sample-iligan-restaurant')
            ->where('place.name', 'Sample Iligan Restaurant')
            ->where('place.city', 'Iligan City')
            ->missing('place.publication_status')
            ->missing('place.published_at'));
});

it('hides draft restaurant details from guests', function () {
    Place::create([
        'name' => 'Draft Restaurant',
        'slug' => 'draft-restaurant',
        'city' => 'Iligan City',
    ]);

    $this->get('/restaurants/draft-restaurant')
        ->assertNotFound();
});

it('hides archived restaurant details from guests', function () {
    $place = Place::create([
        'name' => 'Archived Restaurant',
        'slug' => 'archived-restaurant',
        'city' => 'Iligan City',
    ]);

    $place->publication_status = 'archived';
    $place->save();

    $this->get('/restaurants/archived-restaurant')
        ->assertNotFound();
});

it('returns 404 for nonexistent restaurant slugs', function () {
    $this->get('/restaurants/does-not-exist')
        ->assertNotFound();
});
