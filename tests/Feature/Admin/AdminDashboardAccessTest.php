<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Fortify;
use PragmaRX\Google2FA\Google2FA;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('administrator without MFA assurance cannot access admin dashboard', function () {
    $admin = User::factory()->create();

    $admin->assignRole('administrator');

    expect($admin->hasRole('administrator'))->toBeTrue();

    // actingAs() bypasses the actual Fortify MFA challenge.
    $this->actingAs($admin)
        ->get('/admin')
        ->assertForbidden();
});

test('ordinary user cannot access admin dashboard', function () {
    $user = User::factory()->create();

    $user->assignRole('user');

    expect($user->hasRole('user'))->toBeTrue()
        ->and($user->hasRole('administrator'))->toBeFalse();

    $this->actingAs($user)
        ->get('/admin')
        ->assertForbidden();
});

test('moderator with valid MFA cannot access admin dashboard', function () {
    $moderator = User::factory()->create();

    $moderator->assignRole('moderator');

    app(EnableTwoFactorAuthentication::class)(
        $moderator
    );

    $moderator->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    expect($moderator->hasRole('moderator'))->toBeTrue()
        ->and($moderator->hasRole('administrator'))->toBeFalse();

    // Perform a real Fortify login.
    $this->post('/login', [
        'email' => $moderator->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    $secret = Fortify::currentEncrypter()
        ->decrypt($moderator->fresh()->two_factor_secret);

    $code = app(Google2FA::class)
        ->getCurrentOtp($secret);

    $this->post('/two-factor-challenge', [
        'code' => $code,
    ])->assertRedirect();

    $this->assertAuthenticatedAs($moderator);

    // Verify Fortify established MFA assurance.
    $this->assertSame(
        $moderator->getAuthIdentifier(),
        session('auth.mfa_verified_user_id')
    );

    // MFA assurance must not grant Administrator permissions.
    $this->get('/admin')
        ->assertForbidden();
});

test('guest is redirected to login when accessing admin dashboard', function () {
    $this->get('/admin')
        ->assertRedirect(route('login'));

    $this->assertGuest();
});

test('suspended administrator cannot access admin dashboard', function () {
    $admin = User::factory()->create();

    $admin->assignRole('administrator');

    $admin->forceFill([
        'account_status' => 'suspended',
    ])->save();

    expect($admin->hasRole('administrator'))->toBeTrue();

    $this->actingAs($admin)
        ->get('/admin')
        ->assertForbidden();
});

test('administrator with valid MFA can access admin dashboard', function () {
    $admin = User::factory()->create();

    $admin->assignRole('administrator');

    // Enroll the Administrator in Fortify MFA.
    app(EnableTwoFactorAuthentication::class)(
        $admin
    );

    $admin->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    // Step 1: Authenticate with email and password.
    $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    $this->assertGuest();

    // Step 2: Generate the valid TOTP for this test account.
    $secret = Fortify::currentEncrypter()
        ->decrypt($admin->fresh()->two_factor_secret);

    $code = app(Google2FA::class)
        ->getCurrentOtp($secret);

    // Step 3: Complete the real Fortify MFA challenge.
    $this->post('/two-factor-challenge', [
        'code' => $code,
    ])->assertRedirect();

    $this->assertAuthenticatedAs($admin);

    // Step 4: Verify session assurance belongs to this account.
    $this->assertSame(
        $admin->getAuthIdentifier(),
        session('auth.mfa_verified_user_id')
    );

    // Step 5: Verify the real Inertia Admin dashboard.
    $this->get('/admin')
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('admin/dashboard')
                ->where('metrics.totalRestaurants', 0)
                ->where('metrics.publishedRestaurants', 0)
        );
});
