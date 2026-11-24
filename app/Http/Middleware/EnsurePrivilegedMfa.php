<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePrivilegedMfa
{
    public function handle(Request $request, Closure $next): Response
    {
        $authenticatedUser = $request->user();

        if ($authenticatedUser === null) {
            abort(401);
        }

        // Read current database state to detect MFA revocation.
        $user = $authenticatedUser->fresh();

        if ($user === null) {
            abort(403);
        }

        if ($user->hasAnyRole(['administrator', 'moderator'])) {
            if (
                $user->two_factor_secret === null ||
                $user->two_factor_confirmed_at === null
            ) {
                abort(403, 'Two-factor authentication is required.');
            }

            // Verify that this session completed MFA for this user.
            if (
                $request->session()->get('auth.mfa_verified_user_id')
                !== $user->getAuthIdentifier()
            ) {
                abort(403, 'MFA verification is required for this session.');
            }

            // Verify that the MFA enrollment has not been replaced.
            $encryptedSecret = $user->getRawOriginal('two_factor_secret');

            $sessionFingerprint = $request->session()->get(
                'auth.mfa_verified_secret_fingerprint'
            );

            if (
                ! is_string($encryptedSecret) ||
                $encryptedSecret === '' ||
                ! is_string($sessionFingerprint) ||
                ! hash_equals(
                    hash('sha256', $encryptedSecret),
                    $sessionFingerprint
                )
            ) {
                abort(403, 'MFA re-verification is required.');
            }
        }

        return $next($request);
    }
}
