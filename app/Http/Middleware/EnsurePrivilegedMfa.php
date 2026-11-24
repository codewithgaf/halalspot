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

        // Load the current database state, not a potentially stale user object
        // held by the authentication guard during this request or test.
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

            if (
                $request->session()->get('auth.mfa_verified_user_id')
                !== $user->getAuthIdentifier()
            ) {
                abort(403, 'MFA verification is required for this session.');
            }
        }

        return $next($request);
    }
}
