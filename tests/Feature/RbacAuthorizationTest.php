
<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;

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

beforeEach(function () {
    Route::middleware(['web', 'auth'])
        ->get('/_test/rbac/places-publish', function () {
            abort_unless(
                auth()->user()->can('places.publish'),
                403
            );

            return response('Authorized');
        });
});

it('redirects unauthenticated users from a protected route', function () {
    $this->get('/_test/rbac/places-publish')
        ->assertRedirect(route('login'));
});

it('forbids ordinary users from publishing places', function () {
    $user = User::factory()->create();
    $user->assignRole('user');

    $this->actingAs($user)
        ->get('/_test/rbac/places-publish')
        ->assertForbidden();
});

it('allows administrators to access a publishing route', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    $this->actingAs($admin)
        ->get('/_test/rbac/places-publish')
        ->assertOk();
});

it('does not let the administrator role inherit certification verification', function () {
    $this->seed(RolePermissionSeeder::class);

    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    expect($admin->can('roles.manage'))->toBeTrue()
        ->and($admin->can('certifications.verify'))->toBeFalse();
});
