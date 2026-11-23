<?php

use App\Models\Place;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access the private saved places page', function () {
    $this->get('/account/saved-places')
        ->assertRedirect(route('login'));
});

test('active users can open their private saved places page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('account.saved-places'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('account/saved-places')
            ->etc()
        );
});

test('users see only their own published saved places', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    // Create two published restaurants.
    $ownPlace = Place::query()->create([
        'name' => 'My Saved Restaurant',
        'slug' => 'my-saved-restaurant',
        'city' => 'Iligan City',
        'address' => '123 Test Road',
        'latitude' => 8.228,
        'longitude' => 124.245,
    ]);

    $otherPlace = Place::query()->create([
        'name' => 'Another Users Restaurant',
        'slug' => 'another-users-restaurant',
        'city' => 'Marawi City',
        'address' => '456 Test Road',
        'latitude' => 8.0,
        'longitude' => 124.3,
    ]);

    foreach ([$ownPlace, $otherPlace] as $place) {
        $place->forceFill([
            'publication_status' => 'published',
            'published_at' => now(),
        ])->save();
    }

    // Each user saves a different restaurant.
    $user->savedPlaces()->attach($ownPlace->id);
    $otherUser->savedPlaces()->attach($otherPlace->id);

    // User A should receive only their own saved restaurant.
    $this->actingAs($user)
        ->get(route('account.saved-places'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('account/saved-places')
            ->has('savedPlaces', 1)
            ->where(
                'savedPlaces.0.slug',
                'my-saved-restaurant'
            )
            ->etc()
        );
});

test('private saved places page excludes draft and archived restaurants', function () {
    $user = User::factory()->create();

    foreach (['published', 'draft', 'archived'] as $status) {
        $place = Place::query()->create([
            'name' => ucfirst($status).' Restaurant',
            'slug' => 'saved-page-'.$status,
            'city' => 'Iligan City',
            'address' => '123 Test Road, Iligan City',
            'latitude' => 8.228,
            'longitude' => 124.245,
        ]);

        $place->forceFill([
            'publication_status' => $status,
            'published_at' => $status === 'published'
                ? now()
                : null,
        ])->save();

        $user->savedPlaces()->attach($place->id);
    }

    $this->actingAs($user)
        ->get(route('account.saved-places'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('account/saved-places')
            ->has('savedPlaces', 1)
            ->where(
                'savedPlaces.0.slug',
                'saved-page-published'
            )
            ->etc()
        );
});

test('private saved places page returns an empty array for new users', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('account.saved-places'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('account/saved-places')
            ->where('savedPlaces', [])
            ->etc()
        );
});

test('private saved places are ordered newest first', function () {
    $user = User::factory()->create();

    for ($i = 1; $i <= 3; $i++) {
        $place = Place::query()->create([
            'name' => 'Restaurant '.$i,
            'slug' => 'saved-order-'.$i,
            'city' => 'Iligan City',
            'address' => '123 Test Road',
            'latitude' => 8.228,
            'longitude' => 124.245,
        ]);

        $place->forceFill([
            'publication_status' => 'published',
            'published_at' => now(),
        ])->save();

        $savedAt = now()->subDays(3 - $i);

        $user->savedPlaces()->attach($place->id, [
            'created_at' => $savedAt,
            'updated_at' => $savedAt,
        ]);
    }

    $this->actingAs($user)
        ->get(route('account.saved-places'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('account/saved-places')
            ->has('savedPlaces', 3)
            ->where('savedPlaces.0.slug', 'saved-order-3')
            ->where('savedPlaces.1.slug', 'saved-order-2')
            ->where('savedPlaces.2.slug', 'saved-order-1')
            ->etc()
        );
});

test('suspended users cannot access their private saved places page', function () {
    $user = User::factory()->create();

    $user->forceFill([
        'account_status' => 'suspended',
    ])->save();

    $this->actingAs($user)
        ->get(route('account.saved-places'))
        ->assertForbidden();
});
