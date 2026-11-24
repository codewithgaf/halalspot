<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Laravel\Fortify\Events\ValidTwoFactorAuthenticationCodeProvided;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        Event::listen(
            ValidTwoFactorAuthenticationCodeProvided::class,
            function (ValidTwoFactorAuthenticationCodeProvided $event): void {
                $user = $event->user->fresh();

                if ($user === null) {
                    return;
                }

                $encryptedSecret = $user->getRawOriginal('two_factor_secret');

                if (! is_string($encryptedSecret) || $encryptedSecret === '') {
                    return;
                }

                // Bind MFA assurance to both the user and current enrollment.
                session()->put([
                    'auth.mfa_verified_user_id' => $user->getAuthIdentifier(),
                    'auth.mfa_verified_secret_fingerprint' => hash(
                        'sha256',
                        $encryptedSecret
                    ),
                ]);
            }
        );
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn (): ?Password => app()->isProduction()
                ? Password::min(12)
                    ->mixedCase()
                    ->letters()
                    ->numbers()
                    ->symbols()
                    ->uncompromised()
                : null,
        );
    }
}
