<?php

use App\Http\Middleware\EnsurePrivilegedMfa;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Fortify;
use PragmaRX\Google2FA\Google2FA;

uses(RefreshDatabase::class);
function loginWithConfirmedMfa($testCase, User $user): void
{
    // Begin real Fortify login.
    $testCase->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    $testCase->assertGuest();

    // Generate a valid TOTP for the enrolled account.
    $secret = Fortify::currentEncrypter()
        ->decrypt($user->fresh()->two_factor_secret);

    $code = app(Google2FA::class)
        ->getCurrentOtp($secret);

    // Complete the actual Fortify challenge.
    $testCase->post('/two-factor-challenge', [
        'code' => $code,
    ])->assertRedirect();

    $testCase->assertAuthenticatedAs($user);

    // Verify identity-bound MFA session assurance.
    $testCase->assertSame(
        $user->getAuthIdentifier(),
        session('auth.mfa_verified_user_id')
    );
}

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    // Administrator
    Route::middleware([
        'web',
        'auth',
        EnsurePrivilegedMfa::class,
    ])->get('/_test/security/privileged-publish', function () {
        abort_unless(
            auth()->user()->can('places.publish'),
            403
        );

        return response('Authorized');
    });

    // Moderator
    Route::middleware([
        'web',
        'auth',
        EnsurePrivilegedMfa::class,
    ])->get('/_test/security/privileged-moderate', function () {
        abort_unless(
            auth()->user()->can('reviews.moderate'),
            403
        );

        return response('Authorized');
    });

    // Ordinary User
    Route::middleware([
        'web',
        'auth',
        EnsurePrivilegedMfa::class,
    ])->get('/_test/security/ordinary-action', function () {
        abort_unless(
            auth()->user()->hasRole('user'),
            403
        );

        return response('Authorized');
    });
});

test('administrator without confirmed MFA cannot access privileged operations', function () {
    $admin = User::factory()->create();

    $admin->assignRole('administrator');

    expect($admin->can('places.publish'))->toBeTrue();

    $this->actingAs($admin)
        ->get('/_test/security/privileged-publish')
        ->assertForbidden();
});

test('administrator with confirmed MFA can access privileged operations', function () {
    $admin = User::factory()->create();

    $admin->assignRole('administrator');

    app(EnableTwoFactorAuthentication::class)(
        $admin
    );

    $admin->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    loginWithConfirmedMfa($this, $admin);

    $this->get('/_test/security/privileged-publish')
        ->assertOk()
        ->assertSee('Authorized');
});

test('moderator without confirmed MFA cannot access privileged operations', function () {
    $moderator = User::factory()->create();

    $moderator->assignRole('moderator');

    expect($moderator->can('reviews.moderate'))->toBeTrue();

    $this->actingAs($moderator)
        ->get('/_test/security/privileged-moderate')
        ->assertForbidden();
});

test('moderator with confirmed MFA can access privileged operations', function () {
    $moderator = User::factory()->create();

    $moderator->assignRole('moderator');

    app(EnableTwoFactorAuthentication::class)(
        $moderator
    );

    $moderator->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    loginWithConfirmedMfa($this, $moderator);

    $this->get('/_test/security/privileged-moderate')
        ->assertOk()
        ->assertSee('Authorized');
});

test('administrator with unconfirmed MFA enrollment cannot access privileged operations', function () {
    $admin = User::factory()->create();

    $admin->assignRole('administrator');

    app(EnableTwoFactorAuthentication::class)(
        $admin
    );

    $admin->refresh();

    expect($admin->two_factor_secret)->not->toBeNull()
        ->and($admin->two_factor_confirmed_at)->toBeNull()
        ->and($admin->can('places.publish'))->toBeTrue();

    $this->actingAs($admin)
        ->get('/_test/security/privileged-publish')
        ->assertForbidden();
});

test('ordinary user without MFA can access permitted operations', function () {
    $user = User::factory()->create();

    $user->assignRole('user');

    expect($user->hasAnyRole([
        'administrator',
        'moderator',
    ]))->toBeFalse();

    expect($user->two_factor_confirmed_at)->toBeNull();

    $this->actingAs($user)
        ->get('/_test/security/ordinary-action')
        ->assertOk()
        ->assertSee('Authorized');
});

test('administrator loses privileged access after disabling MFA', function () {
    $admin = User::factory()->create();

    $admin->assignRole('administrator');

    app(EnableTwoFactorAuthentication::class)(
        $admin
    );

    $admin->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    // Establish a genuine MFA-authenticated session.
    loginWithConfirmedMfa($this, $admin);

    // Privileged access is initially permitted.
    $this->get('/_test/security/privileged-publish')
        ->assertOk();

    // Simulate MFA being disabled while the session remains active.
    $admin->forceFill([
        'two_factor_secret' => null,
        'two_factor_recovery_codes' => null,
        'two_factor_confirmed_at' => null,
    ])->save();

    // The same session must immediately lose privileged access.
    $this->get('/_test/security/privileged-publish')
        ->assertForbidden();
});

test('existing session cannot gain privileged access after role promotion without MFA challenge', function () {
    $user = User::factory()->create();

    $user->assignRole('user');

    app(EnableTwoFactorAuthentication::class)(
        $user
    );

    $user->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    // Simulate an already-authenticated session.
    // actingAs() does not perform Fortify's MFA challenge.
    $this->actingAs($user);

    // The account receives a privileged role while its
    // existing authenticated session remains active.
    $user->assignRole('administrator');

    expect($user->can('places.publish'))->toBeTrue();

    $this->get('/_test/security/privileged-publish')
        ->assertForbidden();
});

test('successful Fortify MFA challenge establishes privileged session assurance', function () {
    $admin = User::factory()->create();

    $admin->assignRole('administrator');

    app(EnableTwoFactorAuthentication::class)(
        $admin
    );

    $admin->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    // Step 1: Valid password must lead to the MFA challenge.
    $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    $this->assertGuest();

    // Step 2: Generate a valid TOTP code.
    $secret = Fortify::currentEncrypter()
        ->decrypt($admin->fresh()->two_factor_secret);

    $code = app(Google2FA::class)
        ->getCurrentOtp($secret);

    // Step 3: Complete Fortify's actual MFA challenge.
    $this->post('/two-factor-challenge', [
        'code' => $code,
    ])->assertRedirect();

    $this->assertAuthenticatedAs($admin);

    // Step 4: Confirm the backend established MFA session evidence.
    $this->assertSame(
        $admin->getAuthIdentifier(),
        session('auth.mfa_verified_user_id')
    );

    // Step 5: Privileged access should now be permitted.
    $this->get('/_test/security/privileged-publish')
        ->assertOk()
        ->assertSee('Authorized');
});

test('invalid Fortify MFA challenge does not establish session assurance', function () {
    $admin = User::factory()->create();

    $admin->assignRole('administrator');

    app(EnableTwoFactorAuthentication::class)(
        $admin
    );

    $admin->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    // Password verification creates a pending MFA challenge.
    $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    $this->assertGuest();

    // An invalid second factor must not authenticate the user.
    $this->post('/two-factor-challenge', [
        'code' => 'not-a-valid-code',
    ])->assertSessionHasErrors('code');

    $this->assertGuest();

    // The server must not create privileged MFA evidence.
    $this->assertNull(
        session('auth.mfa_verified_user_id')
    );

    // Privileged access must remain unavailable.
    $this->get('/_test/security/privileged-publish')
        ->assertRedirect(route('login'));
});

test('logout clears privileged MFA session assurance', function () {
    $admin = User::factory()->create();

    $admin->assignRole('administrator');

    app(EnableTwoFactorAuthentication::class)(
        $admin
    );

    $admin->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    // Complete a real Fortify login and MFA challenge.
    $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    $secret = Fortify::currentEncrypter()
        ->decrypt($admin->fresh()->two_factor_secret);

    $code = app(Google2FA::class)
        ->getCurrentOtp($secret);

    $this->post('/two-factor-challenge', [
        'code' => $code,
    ])->assertRedirect();

    $this->assertAuthenticatedAs($admin);

    $this->assertSame(
        $admin->getAuthIdentifier(),
        session('auth.mfa_verified_user_id')
    );

    // Logging out must invalidate the trusted session evidence.
    $this->post('/logout')->assertRedirect();

    $this->assertGuest();

    $this->assertNull(
        session('auth.mfa_verified_user_id')
    );

    $this->get('/_test/security/privileged-publish')
        ->assertRedirect(route('login'));
});

test('MFA assurance from one administrator cannot authorize another administrator', function () {
    $adminA = User::factory()->create();
    $adminB = User::factory()->create();

    foreach ([$adminA, $adminB] as $admin) {
        $admin->assignRole('administrator');

        app(EnableTwoFactorAuthentication::class)(
            $admin
        );

        $admin->forceFill([
            'two_factor_confirmed_at' => now(),
        ])->save();
    }

    // Complete Fortify MFA for Administrator A.
    $this->post('/login', [
        'email' => $adminA->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    $secret = Fortify::currentEncrypter()
        ->decrypt($adminA->fresh()->two_factor_secret);

    $code = app(Google2FA::class)
        ->getCurrentOtp($secret);

    $this->post('/two-factor-challenge', [
        'code' => $code,
    ])->assertRedirect();

    $this->assertAuthenticatedAs($adminA);

    // Simulate a server-side account switch without
    // completing MFA for Administrator B.
    $this->actingAs($adminB);

    expect(session('auth.mfa_verified_user_id'))
        ->toBe($adminA->getAuthIdentifier());

    $this->get('/_test/security/privileged-publish')
        ->assertForbidden();
});

test('successful recovery code establishes privileged MFA session assurance', function () {
    $admin = User::factory()->create();

    $admin->assignRole('administrator');

    app(EnableTwoFactorAuthentication::class)(
        $admin
    );

    $admin->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    $recoveryCode = $admin->recoveryCodes()[0];

    // Password authentication begins the MFA challenge.
    $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    $this->assertGuest();

    // Complete the challenge using a valid recovery code.
    $this->post('/two-factor-challenge', [
        'recovery_code' => $recoveryCode,
    ])->assertRedirect();

    $this->assertAuthenticatedAs($admin);

    // The recovery-code challenge must establish session assurance.
    $this->assertSame(
        $admin->getAuthIdentifier(),
        session('auth.mfa_verified_user_id')
    );

    // A recovery code must be single-use.
    expect($admin->fresh()->recoveryCodes())
        ->not->toContain($recoveryCode);

    // Privileged access is now permitted.
    $this->get('/_test/security/privileged-publish')
        ->assertOk()
        ->assertSee('Authorized');
});
