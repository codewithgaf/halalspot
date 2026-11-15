<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Laravel\Fortify\Features;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());

    $this->seed(RolePermissionSeeder::class);
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('new users receive the ordinary user role', function () {
    $this->seed(RolePermissionSeeder::class);

    $this->post(route('register.store'), [
        'name' => 'Regular User',
        'email' => 'regular@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));

    $user = User::where(
        'email',
        'regular@example.com'
    )->firstOrFail();

    expect($user->hasRole('user'))->toBeTrue()
        ->and($user->getRoleNames()->all())->toBe(['user'])
        ->and($user->can('roles.manage'))->toBeFalse();
});

test('registration cannot assign privileged roles or permissions', function () {
    $this->seed(RolePermissionSeeder::class);

    $this->post(route('register.store'), [
        'name' => 'Untrusted User',
        'email' => 'untrusted@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'administrator',
        'roles' => ['administrator'],
        'permissions' => ['certifications.verify', 'roles.manage'],
    ])->assertRedirect(route('dashboard', absolute: false));

    $user = User::where(
        'email',
        'untrusted@example.com'
    )->firstOrFail();

    expect($user->getRoleNames()->all())->toBe(['user'])
        ->and($user->hasPermissionTo('roles.manage'))->toBeFalse()
        ->and($user->hasPermissionTo('certifications.verify'))->toBeFalse();
});

test('registration rolls back when the default role is missing', function () {
    Role::findByName('user', 'web')->delete();

    $this->post(route('register.store'), [
        'name' => 'Missing Role User',
        'email' => 'missing-role@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertDatabaseMissing('users', [
        'email' => 'missing-role@example.com',
    ]);
});
