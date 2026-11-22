<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Support\PhilippineLocalityDirectory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request, PhilippineLocalityDirectory $directory): Response
    {
        $user = $request->user();
        $profile = $user->profile;
        $avatarPath = $profile?->avatar_path;

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'profile' => [
                'bio' => $profile?->bio,
                'locality_code' => $profile?->locality_code,
                'city' => $profile?->locality_code
                    ? $directory->find($profile->locality_code)
                    : null,
                'avatar_url' => is_string($avatarPath) && $avatarPath !== ''
                    ? route('profile.avatar.show', [
                        'v' => hash('sha256', $avatarPath),
                    ])
                    : null,
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        DB::transaction(function () use ($user, $validated): void {
            $user->fill([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }

            $user->save();

            $profileData = array_intersect_key(
                $validated,
                ['bio' => true, 'locality_code' => true],
            );

            if ($profileData !== []) {
                $user->profile()->updateOrCreate(
                    [],
                    $profileData
                );
            }
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Profile updated.'),
        ]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Capture the path before database cascading deletes
        // remove the associated user_profiles record.
        $avatarPath = $user->profile?->avatar_path;

        // Logout saves the remember token, so it must happen before deletion.
        Auth::logout();

        $user->delete();

        // Filesystem operations are separate from database deletion.
        if (is_string($avatarPath) && $avatarPath !== '') {
            try {
                if (! Storage::disk('local')->delete($avatarPath)) {
                    Log::warning(
                        'Avatar cleanup failed after account deletion.',
                        ['path' => $avatarPath]
                    );
                }
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
