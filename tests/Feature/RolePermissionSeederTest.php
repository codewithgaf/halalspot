
<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

it('creates the expected roles and permissions', function () {
    $this->seed(RolePermissionSeeder::class);

    expect(Role::count())->toBe(3)
        ->and(Permission::count())->toBe(12);

    foreach (['user', 'moderator', 'administrator'] as $role) {
        expect(Role::findByName($role, 'web'))->toBeInstanceOf(Role::class);
    }
});

it('is safe to run more than once', function () {
    $this->seed(RolePermissionSeeder::class);
    $this->seed(RolePermissionSeeder::class);

    expect(Role::count())->toBe(3)
        ->and(Permission::count())->toBe(12);
});

it('grants ordinary users only their intended permissions', function () {
    $this->seed(RolePermissionSeeder::class);

    $user = Role::findByName('user', 'web');

    expect($user->hasPermissionTo('reviews.create'))->toBeTrue()
        ->and($user->hasPermissionTo('reviews.update'))->toBeTrue()
        ->and($user->hasPermissionTo('submissions.create'))->toBeTrue()
        ->and($user->hasPermissionTo('reports.create'))->toBeTrue()
        ->and($user->hasPermissionTo('reviews.moderate'))->toBeFalse()
        ->and($user->hasPermissionTo('places.publish'))->toBeFalse()
        ->and($user->hasPermissionTo('roles.manage'))->toBeFalse();
});

it('grants moderators moderation permissions without administrator access', function () {
    $this->seed(RolePermissionSeeder::class);

    $moderator = Role::findByName('moderator', 'web');

    expect($moderator->hasPermissionTo('reviews.moderate'))->toBeTrue()
        ->and($moderator->hasPermissionTo('reports.moderate'))->toBeTrue()
        ->and($moderator->hasPermissionTo('submissions.review'))->toBeTrue()
        ->and($moderator->hasPermissionTo('places.publish'))->toBeFalse()
        ->and($moderator->hasPermissionTo('roles.manage'))->toBeFalse();
});

it('does not automatically grant certification verification', function () {
    $this->seed(RolePermissionSeeder::class);

    $verificationPermission = Permission::findByName(
        'certifications.verify',
        'web'
    );

    expect($verificationPermission->roles()->count())->toBe(0);

    foreach (Role::all() as $role) {
        expect($role->hasPermissionTo('certifications.verify'))->toBeFalse();
    }
});

it('does not automatically create or promote user accounts', function () {
    $this->seed(RolePermissionSeeder::class);

    expect(User::count())->toBe(0);
});
