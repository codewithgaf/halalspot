<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;
use PragmaRX\Google2FA\Google2FA;

uses(RefreshDatabase::class);

test('authenticated user can start MFA enrollment after password confirmation', function () {
    $this->skipUnlessFortifyHas(
        Features::twoFactorAuthentication()
    );

    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession([
            'auth.password_confirmed_at' => time(),
        ])
        ->from(route('security.edit'))
        ->post(route('two-factor.enable'))
        ->assertRedirect(route('security.edit'));

    $user->refresh();

    // Enrollment has started.
    expect($user->two_factor_secret)->not->toBeNull();

    // The authenticator code has not been confirmed.
    expect($user->two_factor_confirmed_at)->toBeNull();
});

test('MFA enrollment requires recent password confirmation', function () {
    $this->skipUnlessFortifyHas(
        Features::twoFactorAuthentication()
    );

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('two-factor.enable'))
        ->assertRedirect(route('password.confirm'));

    // A rejected request must not generate MFA credentials.
    $user->refresh();

    expect($user->two_factor_secret)->toBeNull()
        ->and($user->two_factor_confirmed_at)->toBeNull();
});

test('pending MFA enrollment provides an authenticator QR code', function () {
    $this->skipUnlessFortifyHas(
        Features::twoFactorAuthentication()
    );

    $user = User::factory()->create();

    // Begin enrollment with Fortify.
    app(EnableTwoFactorAuthentication::class)(
        $user
    );

    $this->actingAs($user)
        ->withSession([
            'auth.password_confirmed_at' => time(),
        ])
        ->get(route('two-factor.qr-code'))
        ->assertOk()
        ->assertJsonStructure(['svg']);
});

test('QR code requires recent password confirmation', function () {
    $this->skipUnlessFortifyHas(
        Features::twoFactorAuthentication()
    );

    $user = User::factory()->create();

    // Begin enrollment.
    app(EnableTwoFactorAuthentication::class)(
        $user
    );

    // Authenticated, but password has not been confirmed.
    $this->actingAs($user)
        ->get(route('two-factor.qr-code'))
        ->assertRedirect(route('password.confirm'));
});

test('user can confirm MFA enrollment using a valid authenticator code', function () {
    $this->skipUnlessFortifyHas(
        Features::twoFactorAuthentication()
    );

    $user = User::factory()->create();

    // Start MFA enrollment through Fortify.
    app(EnableTwoFactorAuthentication::class)(
        $user
    );

    // Enrollment must initially be unconfirmed.
    expect($user->fresh()->two_factor_confirmed_at)->toBeNull();

    // Generate a valid TOTP for this test account only.
    $secret = Fortify::currentEncrypter()
        ->decrypt($user->fresh()->two_factor_secret);

    $code = app(Google2FA::class)
        ->getCurrentOtp($secret);

    // Submit the code to Fortify's confirmation endpoint.
    $this->actingAs($user)
        ->withSession([
            'auth.password_confirmed_at' => time(),
        ])
        ->from(route('security.edit'))
        ->post(route('two-factor.confirm'), [
            'code' => $code,
        ])
        ->assertRedirect(route('security.edit'));

    // Fortify must mark enrollment as confirmed.
    expect($user->fresh()->two_factor_confirmed_at)
        ->not->toBeNull();
});

test('invalid authenticator code cannot confirm MFA enrollment', function () {
    $this->skipUnlessFortifyHas(
        Features::twoFactorAuthentication()
    );

    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)(
        $user
    );

    expect($user->fresh()->two_factor_confirmed_at)->toBeNull();

    $this->actingAs($user)
        ->withSession([
            'auth.password_confirmed_at' => time(),
        ])
        ->from(route('security.edit'))
        ->post(route('two-factor.confirm'), [
            'code' => 'not-a-valid-code',
        ])
        ->assertRedirect(route('security.edit'))
        ->assertSessionHasErrors(
            ['code'],
            null,
            'confirmTwoFactorAuthentication'
        );

    // Rejected confirmation must leave MFA unconfirmed.
    expect($user->fresh()->two_factor_confirmed_at)->toBeNull();
});

test('confirmed MFA user can retrieve recovery codes after password confirmation', function () {
    $this->skipUnlessFortifyHas(
        Features::twoFactorAuthentication()
    );

    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)(
        $user
    );

    $user->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    $response = $this->actingAs($user)
        ->withSession([
            'auth.password_confirmed_at' => time(),
        ])
        ->get(route('two-factor.recovery-codes'));

    $response->assertOk();

    // Verify codes exist without printing their values.
    expect($response->json())
        ->toBeArray()
        ->not->toBeEmpty();
});

test('recovery codes require recent password confirmation', function () {
    $this->skipUnlessFortifyHas(
        Features::twoFactorAuthentication()
    );

    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)(
        $user
    );

    $user->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    $this->actingAs($user)
        ->get(route('two-factor.recovery-codes'))
        ->assertRedirect(route('password.confirm'));
});

test('user without MFA cannot retrieve recovery codes', function () {
    $this->skipUnlessFortifyHas(
        Features::twoFactorAuthentication()
    );

    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->withSession([
            'auth.password_confirmed_at' => time(),
        ])
        ->get(route('two-factor.recovery-codes'));

    $response
        ->assertOk()
        ->assertExactJson([]);
});

test('confirmed MFA user can regenerate recovery codes', function () {
    $this->skipUnlessFortifyHas(
        Features::twoFactorAuthentication()
    );

    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)(
        $user
    );

    $user->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    $previousCodes = $user->fresh()->recoveryCodes();

    $this->actingAs($user)
        ->withSession([
            'auth.password_confirmed_at' => time(),
        ])
        ->from(route('security.edit'))
        ->post(route('two-factor.regenerate-recovery-codes'))
        ->assertRedirect(route('security.edit'));

    $newCodes = $user->fresh()->recoveryCodes();

    expect($newCodes)
        ->not->toBeEmpty()
        ->not->toEqual($previousCodes);
});

test('recovery code regeneration requires recent password confirmation', function () {
    $this->skipUnlessFortifyHas(
        Features::twoFactorAuthentication()
    );

    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)(
        $user
    );

    $user->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    $originalCodes = $user->fresh()->recoveryCodes();

    $this->actingAs($user)
        ->post(route('two-factor.regenerate-recovery-codes'))
        ->assertRedirect(route('password.confirm'));

    // Rejected requests must not rotate recovery credentials.
    expect($user->fresh()->recoveryCodes())
        ->toEqual($originalCodes);
});

test('user can cancel pending MFA enrollment', function () {
    $this->skipUnlessFortifyHas(
        Features::twoFactorAuthentication()
    );

    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)(
        $user
    );

    expect($user->fresh()->two_factor_secret)->not->toBeNull()
        ->and($user->fresh()->two_factor_confirmed_at)->toBeNull();

    $this->actingAs($user)
        ->withSession([
            'auth.password_confirmed_at' => time(),
        ])
        ->from(route('security.edit'))
        ->delete(route('two-factor.disable'))
        ->assertRedirect(route('security.edit'));

    $user->refresh();

    expect($user->two_factor_secret)->toBeNull()
        ->and($user->two_factor_recovery_codes)->toBeNull()
        ->and($user->two_factor_confirmed_at)->toBeNull();
});

test('confirmed MFA user can disable MFA after password confirmation', function () {
    $this->skipUnlessFortifyHas(
        Features::twoFactorAuthentication()
    );

    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)(
        $user
    );

    $user->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    expect($user->fresh()->two_factor_confirmed_at)
        ->not->toBeNull();

    $this->actingAs($user)
        ->withSession([
            'auth.password_confirmed_at' => time(),
        ])
        ->from(route('security.edit'))
        ->delete(route('two-factor.disable'))
        ->assertRedirect(route('security.edit'));

    $user->refresh();

    expect($user->two_factor_secret)->toBeNull()
        ->and($user->two_factor_recovery_codes)->toBeNull()
        ->and($user->two_factor_confirmed_at)->toBeNull();
});

test('confirmed MFA cannot be disabled without recent password confirmation', function () {
    $this->skipUnlessFortifyHas(
        Features::twoFactorAuthentication()
    );

    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)(
        $user
    );

    $user->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    $before = $user->fresh();

    $originalSecret = $before->two_factor_secret;
    $originalCodes = $before->two_factor_recovery_codes;
    $originalConfirmation = $before->two_factor_confirmed_at;

    $this->actingAs($user)
        ->delete(route('two-factor.disable'))
        ->assertRedirect(route('password.confirm'));

    $after = $user->fresh();

    expect($after->two_factor_secret)->toBe($originalSecret)
        ->and($after->two_factor_recovery_codes)->toBe($originalCodes)
        ->and($after->two_factor_confirmed_at)
        ->toEqual($originalConfirmation);
});
