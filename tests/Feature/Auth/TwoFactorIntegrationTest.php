<?php

use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Contracts\TwoFactorChallengeViewResponse;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\TwoFactorAuthenticatable;
use PragmaRX\Google2FA\Google2FA;

test('user model supports Fortify two-factor authentication', function () {
    expect(class_uses_recursive(User::class))
        ->toContain(TwoFactorAuthenticatable::class);
});

test('Fortify stores two-factor credentials securely', function () {
    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)($user);

    $user->refresh();

    $encryptedSecret = $user->getRawOriginal(
        'two_factor_secret'
    );

    $encryptedRecoveryCodes = $user->getRawOriginal(
        'two_factor_recovery_codes'
    );

    expect($encryptedSecret)->toBeString();
    expect($encryptedRecoveryCodes)->toBeString();

    $encrypter = Fortify::currentEncrypter();

    expect($encrypter->decrypt($encryptedSecret))
        ->toBeString()
        ->not->toBe($encryptedSecret);

    expect(json_decode(
        $encrypter->decrypt($encryptedRecoveryCodes),
        true
    ))->toBe($user->recoveryCodes());

    expect($user->toArray())
        ->not->toHaveKey('two_factor_secret')
        ->not->toHaveKey('two_factor_recovery_codes');

    expect($user->two_factor_confirmed_at)->toBeNull();
});

test('two-factor confirmation timestamp is cast to datetime', function () {
    $user = User::factory()->create();

    $user->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    $user->refresh();

    expect($user->two_factor_confirmed_at)
        ->toBeInstanceOf(CarbonInterface::class);
});

test('Fortify requires secure two-factor enrollment', function () {
    $feature = Features::twoFactorAuthentication();

    expect(Features::enabled($feature))->toBeTrue();

    expect(Features::optionEnabled($feature, 'confirm'))
        ->toBeTrue();

    expect(Features::optionEnabled($feature, 'confirmPassword'))
        ->toBeTrue();
});

test('suspended users with confirmed MFA cannot log in', function () {
    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)($user);

    $user->forceFill([
        'two_factor_confirmed_at' => now(),
        'account_status' => 'suspended',
    ])->save();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('Fortify registers a two-factor challenge view', function () {
    expect(app()->bound(TwoFactorChallengeViewResponse::class))
        ->toBeTrue();
});

test('Fortify has a dedicated two-factor challenge rate limiter', function () {
    expect(config('fortify.limiters.two-factor'))
        ->toBe('two-factor');

    expect(RateLimiter::limiter('two-factor'))
        ->not->toBeNull();
});

test('two-factor challenge limit is five attempts per minute per account', function () {
    $request = Request::create(
        '/two-factor-challenge',
        'POST'
    );

    $request->setLaravelSession(
        app('session')->driver()
    );

    $request->session()->put('login.id', 42);

    $limiter = RateLimiter::limiter('two-factor');

    expect($limiter)->not->toBeNull();

    $limit = $limiter($request);

    expect($limit->maxAttempts)->toBe(5)
        ->and($limit->decaySeconds)->toBe(60)
        ->and((string) $limit->key)->toBe('42');
});

test('user with confirmed MFA must complete challenge before login', function () {
    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)($user);

    $user->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect('/two-factor-challenge');

    $response->assertSessionHas('login.id', $user->id);

    $this->assertGuest();
});

test('valid TOTP code completes two-factor login', function () {
    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)($user);

    $user->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    $this->assertGuest();

    $secret = Fortify::currentEncrypter()->decrypt(
        $user->fresh()->two_factor_secret
    );

    $code = app(
        Google2FA::class
    )->getCurrentOtp($secret);

    $response = $this->post('/two-factor-challenge', [
        'code' => $code,
    ]);

    $response->assertRedirect();

    $this->assertAuthenticatedAs($user);
});

test('invalid TOTP code cannot complete two-factor login', function () {
    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)($user);

    $user->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    $this->assertGuest();

    $response = $this->post('/two-factor-challenge', [
        'code' => 'not-a-valid-code',
    ]);

    $response->assertSessionHasErrors('code');

    $this->assertGuest();
});

test('valid recovery code completes two-factor login', function () {
    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)($user);

    $user->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    $recoveryCode = $user->recoveryCodes()[0];

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    $this->assertGuest();

    $response = $this->post('/two-factor-challenge', [
        'recovery_code' => $recoveryCode,
    ]);

    $response->assertRedirect();

    $this->assertAuthenticatedAs($user);

    expect($user->fresh()->recoveryCodes())
        ->not->toContain($recoveryCode);
});

test('used recovery code cannot authenticate twice', function () {
    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)($user);

    $user->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    $recoveryCode = $user->recoveryCodes()[0];

    // First login: recovery code should work.
    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    $this->post('/two-factor-challenge', [
        'recovery_code' => $recoveryCode,
    ]);

    $this->assertAuthenticatedAs($user);

    // Start a new login attempt.
    $this->post('/logout');

    $this->assertGuest();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    // Reusing the same recovery code must fail.
    $response = $this->post('/two-factor-challenge', [
        'recovery_code' => $recoveryCode,
    ]);

    $response->assertSessionHasErrors('recovery_code');

    $this->assertGuest();
});

test('two-factor challenge blocks excessive attempts', function () {
    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)($user);

    $user->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    $this->assertGuest();

    for ($attempt = 1; $attempt <= 5; $attempt++) {
        $this->post('/two-factor-challenge', [
            'code' => 'not-a-valid-code',
        ])->assertSessionHasErrors('code');
    }

    $this->post('/two-factor-challenge', [
        'code' => 'not-a-valid-code',
    ])->assertStatus(429);

    $this->assertGuest();
});

test('two-factor throttling isolates different accounts', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    foreach ([$userA, $userB] as $user) {
        app(EnableTwoFactorAuthentication::class)($user);

        $user->forceFill([
            'two_factor_confirmed_at' => now(),
        ])->save();
    }

    // Exhaust User A's MFA attempt allowance.
    $this->post('/login', [
        'email' => $userA->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this->post('/two-factor-challenge', [
            'code' => 'not-a-valid-code',
        ])->assertSessionHasErrors('code');
    }

    $this->post('/two-factor-challenge', [
        'code' => 'not-a-valid-code',
    ])->assertStatus(429);

    // Clear the pending challenge session.
    $this->flushSession();

    // User B should retain a separate allowance.
    $this->post('/login', [
        'email' => $userB->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    $this->post('/two-factor-challenge', [
        'code' => 'not-a-valid-code',
    ])->assertSessionHasErrors('code');

    $this->assertGuest();
});

test('two-factor limiter shares allowance across sessions for the same account', function () {
    $limiter = RateLimiter::limiter('two-factor');

    $makeRequest = function (string $sessionId) {
        $request = Request::create(
            '/two-factor-challenge',
            'POST'
        );

        $session = app('session')->driver();
        $session->setId($sessionId);
        $session->put('login.id', 42);

        $request->setLaravelSession($session);

        return $request;
    };

    $first = $limiter($makeRequest('first-session'));
    $second = $limiter($makeRequest('second-session'));

    expect((string) $first->key)
        ->toBe((string) $second->key);

    expect($first->maxAttempts)->toBe(5)
        ->and($second->maxAttempts)->toBe(5);
});

test('starting a new MFA login session does not reset the account limit', function () {
    $user = User::factory()->create();

    app(EnableTwoFactorAuthentication::class)($user);

    $user->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    $credentials = [
        'email' => $user->email,
        'password' => 'password',
    ];

    $this->post('/login', $credentials)
        ->assertRedirect('/two-factor-challenge');

    // Exhaust the allowance for this account.
    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this->post('/two-factor-challenge', [
            'code' => 'not-a-valid-code',
        ])->assertSessionHasErrors('code');
    }

    // Simulate a fresh session and login challenge.
    $this->app['session']->driver()->invalidate();

    $this->post('/login', $credentials)
        ->assertRedirect('/two-factor-challenge');

    // A new login must not reset the account's limit.
    $this->post('/two-factor-challenge', [
        'code' => 'not-a-valid-code',
    ])->assertStatus(429);

    $this->assertGuest();
});
