<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ContributorPrivacySettingsController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'public_profile_enabled' => ['required', 'boolean'],
            'share_bio' => ['required', 'boolean'],
            'share_city' => ['required', 'boolean'],
        ]);

        // The master privacy setting takes priority.
        if (! (bool) $validated['public_profile_enabled']) {
            $validated['share_bio'] = false;
            $validated['share_city'] = false;
        }

        // Only update the authenticated user's profile.
        $request->user()
            ->profile()
            ->updateOrCreate([], $validated);

        return to_route('profile.edit');
    }
}
