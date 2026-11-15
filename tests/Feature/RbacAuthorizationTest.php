
<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

it('allows a moderator to moderate reviews', function () {
    $moderator = User::factory()->create();
    $moderator->assignRole('moderator');

    expect($moderator->can('reviews.moderate'))->toBeTrue();
});

it('denies review moderation to ordinary users', function () {
    $user = User::factory()->create();
    $user->assignRole('user');

    expect($user->can('reviews.moderate'))->toBeFalse();
});

it('denies place publication to ordinary users', function () {
    $user = User::factory()->create();
    $user->assignRole('user');

    expect($user->can('places.publish'))->toBeFalse();
});

it('allows an administrator to publish places', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    expect($admin->can('places.publish'))->toBeTrue();
});

it('does not give administrators certification verification by default', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    expect($admin->can('certifications.verify'))->toBeFalse();
});
