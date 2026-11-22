<?php

use App\Models\Place;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('unverified user can access dashboard', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk();
});

test('dashboard shows only the users own published saved places', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $ownPlace = Place::query()->create([
        'name' => 'Demo Kitchen',
        'slug' => 'dashboard-own-kitchen',
        'city' => 'Iligan City',
        'address' => '123 Test Road, Iligan City',
        'latitude' => 8.228,
        'longitude' => 124.245,
    ]);

    $ownPlace->forceFill([
        'publication_status' => 'published',
        'published_at' => now(),
    ])->save();

    $otherPlace = Place::query()->create([
        'name' => 'Another User Restaurant',
        'slug' => 'dashboard-other-kitchen',
        'city' => 'Iligan City',
        'address' => '456 Test Road, Iligan City',
        'latitude' => 8.229,
        'longitude' => 124.246,
    ]);

    $otherPlace->forceFill([
        'publication_status' => 'published',
        'published_at' => now(),
    ])->save();

    $user->savedPlaces()->attach($ownPlace->id);
    $otherUser->savedPlaces()->attach($otherPlace->id);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('savedPlacesCount', 1)
            ->has('recentSavedPlaces', 1)
            ->where(
                'recentSavedPlaces.0.slug',
                'dashboard-own-kitchen'
            )
            ->etc()
        );
});

test('dashboard handles users with no saved places', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('savedPlacesCount', 0)
            ->has('recentSavedPlaces', 0)
            ->etc()
        );
});

test('dashboard excludes draft and archived saved places', function () {
    $user = User::factory()->create();

    foreach (['published', 'draft', 'archived'] as $status) {
        $place = Place::query()->create([
            'name' => ucfirst($status).' Restaurant',
            'slug' => 'dashboard-'.$status,
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
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('savedPlacesCount', 1)
            ->has('recentSavedPlaces', 1)
            ->where(
                'recentSavedPlaces.0.slug',
                'dashboard-published'
            )
            ->etc()
        );
});

test('dashboard shows the three most recently saved published places', function () {
    $user = User::factory()->create();

    // Create four published restaurants.
    for ($i = 1; $i <= 4; $i++) {
        $place = Place::query()->create([
            'name' => 'Restaurant '.$i,
            'slug' => 'recent-restaurant-'.$i,
            'city' => 'Iligan City',
            'address' => '123 Test Road, Iligan City',
            'latitude' => 8.228,
            'longitude' => 124.245,
        ]);

        $place->forceFill([
            'publication_status' => 'published',
            'published_at' => now(),
        ])->save();

        // Give each save a different timestamp.
        $savedAt = now()->subDays(4 - $i);

        $user->savedPlaces()->attach($place->id, [
            'created_at' => $savedAt,
            'updated_at' => $savedAt,
        ]);
    }

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('savedPlacesCount', 4)
            ->has('recentSavedPlaces', 3)
            ->where(
                'recentSavedPlaces.0.slug',
                'recent-restaurant-4'
            )
            ->where(
                'recentSavedPlaces.1.slug',
                'recent-restaurant-3'
            )
            ->where(
                'recentSavedPlaces.2.slug',
                'recent-restaurant-2'
            )
            ->etc()
        );
});
