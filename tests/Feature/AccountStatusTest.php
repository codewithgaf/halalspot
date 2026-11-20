<?php

use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

test('new user accounts are active by default', function () {
    $user = User::factory()->create();

    expect($user->fresh()->account_status)->toBe('active');
});

test('suspended user cannot access dashboard', function () {
    $user = User::factory()->create();

    $user->forceFill([
        'account_status' => 'suspended',
    ])->save();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertForbidden();
});

test('suspended user cannot list saved places', function () {
    $user = User::factory()->create();

    $user->forceFill([
        'account_status' => 'suspended',
    ])->save();

    $this->actingAs($user)
        ->getJson('/saved-places')
        ->assertForbidden();
});

test('suspended user cannot access profile settings', function () {
    $user = User::factory()->create();

    $user->forceFill([
        'account_status' => 'suspended',
    ])->save();

    $this->actingAs($user)
        ->get(route('profile.edit'))
        ->assertForbidden();
});

test('suspended user cannot update their profile', function () {
    $user = User::factory()->create();
    $originalName = $user->name;

    $user->forceFill([
        'account_status' => 'suspended',
    ])->save();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Unauthorized Name',
            'email' => $user->email,
        ])
        ->assertForbidden();

    expect($user->fresh()->name)->toBe($originalName);
});

test('suspended user cannot change their password', function () {
    $user = User::factory()->create();

    $user->forceFill([
        'account_status' => 'suspended',
    ])->save();

    $this->actingAs($user)
        ->put(route('user-password.update'), [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
        ->assertForbidden();

    expect(Hash::check('password', $user->fresh()->password))
        ->toBeTrue();
});

test('suspended user cannot delete their account', function () {
    $user = User::factory()->create();

    $user->forceFill([
        'account_status' => 'suspended',
    ])->save();

    $this->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ])
        ->assertForbidden();

    expect($user->fresh())->not->toBeNull();
});

test('suspended users cannot log in', function () {
    $user = User::factory()->create();

    $user->forceFill([
        'account_status' => 'suspended',
    ])->save();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertGuest();

    $response->assertSessionHasErrors('email');
});

test('suspended user is logged out on their next request', function () {
    $user = User::factory()->create();

    // Log in while the account is active.
    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();

    // Simulate an administrator suspending the account.
    User::query()
        ->whereKey($user->id)
        ->update(['account_status' => 'suspended']);

    // User visits a public page with their existing session.
    $this->get(route('home'))->assertOk();

    // The suspended account must no longer be authenticated.
    $this->assertGuest();
});

test('suspended user is logged out when accessing a protected route', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();

    // Account is suspended after login.
    User::query()
        ->whereKey($user->id)
        ->update(['account_status' => 'suspended']);

    $this->get(route('dashboard'))
        ->assertForbidden();

    $this->assertGuest();

    // The revoked session cannot access the dashboard again.
    $this->get(route('dashboard'))
        ->assertRedirect(route('login'));
});

test('active user remains logged in across requests', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($user);

    $this->get(route('home'))->assertOk();
    $this->get(route('dashboard'))->assertOk();

    $this->assertAuthenticatedAs($user);
});

test('database rejects invalid account statuses', function () {
    $user = User::factory()->create();

    expect(fn () => DB::transaction(
        fn () => DB::table('users')
            ->where('id', $user->id)
            ->update(['account_status' => 'unknown'])
    ))->toThrow(QueryException::class);

    expect($user->fresh()->account_status)->toBe('active');
});
