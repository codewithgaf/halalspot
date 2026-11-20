<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RevokeInactiveSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (
            $user !== null &&
            User::query()
                ->whereKey($user->getAuthIdentifier())
                ->value('account_status') !== 'active'
        ) {
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Preserve 403 responses on protected routes.
            if (in_array(
                EnsureAccountIsActive::class,
                $request->route()?->gatherMiddleware() ?? [],
                true
            )) {
                abort(403);
            }
        }

        return $next($request);
    }
}
