<?php

use App\Models\Place;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Gate;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function makeTestPlace(): Place
{
    return Place::create([
        'name' => 'Sample Restaurant',
        'slug' => 'sample-restaurant',
        'city' => 'Sample City',
    ]);
}

it('allows guests to view published places', function () {
    $place = makeTestPlace();

    $place->publication_status = 'published';
    $place->address = 'Sample Street';
    $place->latitude = 8;
    $place->longitude = 124;
    $place->published_at = now();
    $place->save();

    expect(Gate::forUser(null)->allows('view', $place))->toBeTrue();
});

it('denies guests access to draft places', function () {
    $place = makeTestPlace();

    expect(Gate::forUser(null)->allows('view', $place))->toBeFalse();
});

it('denies ordinary users place creation', function () {
    $user = User::factory()->create();
    $user->assignRole('user');

    expect(Gate::forUser($user)->allows('create', Place::class))
        ->toBeFalse();
});

it('allows administrators place creation', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    expect(Gate::forUser($admin)->allows('create', Place::class))
        ->toBeTrue();
});

it('denies ordinary users place publication', function () {
    $user = User::factory()->create();
    $user->assignRole('user');

    expect(Gate::forUser($user)->allows('publish', makeTestPlace()))
        ->toBeFalse();
});

it('allows administrators to authorize publication', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    expect(Gate::forUser($admin)->allows('publish', makeTestPlace()))
        ->toBeTrue();
});
