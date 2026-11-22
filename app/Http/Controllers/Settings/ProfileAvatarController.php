<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StoreProfileAvatarRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class ProfileAvatarController extends Controller
{
    public function store(StoreProfileAvatarRequest $request): RedirectResponse
    {
        $avatar = $request->file('avatar');

        if (! $avatar instanceof UploadedFile) {
            abort(422, 'An avatar image is required.');
        }

        $newPath = $avatar->store('profile-avatars', 'local');

        if ($newPath === false) {
            throw new RuntimeException('Unable to store avatar.');
        }

        $user = $request->user();

        try {
            $previousPath = DB::transaction(
                function () use ($user, $newPath): ?string {
                    $profile = $user->profile()->firstOrCreate([]);

                    $oldPath = $profile->avatar_path;

                    $profile->avatar_path = $newPath;
                    $profile->save();

                    return is_string($oldPath) ? $oldPath : null;
                }
            );
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($newPath);

            throw $exception;
        }

        if (
            $previousPath !== null &&
            $previousPath !== $newPath
        ) {
            Storage::disk('local')->delete($previousPath);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Profile photo updated.',
        ]);

        return to_route('profile.edit');
    }

    /**
     * Display the authenticated user's private avatar.
     */
    public function show(Request $request): StreamedResponse
    {
        $path = $request->user()->profile?->avatar_path;

        if (
            ! is_string($path) ||
            ! Storage::disk('local')->exists($path)
        ) {
            abort(404);
        }

        return Storage::disk('local')->response(
            $path,
            null,
            [
                'Cache-Control' => 'private, no-store, max-age=0',
                'X-Content-Type-Options' => 'nosniff',
            ]
        );
    }

    /**
     * Remove the authenticated user's private avatar.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $previousPath = DB::transaction(
            function () use ($request): ?string {
                $profile = $request->user()->profile;

                if (
                    $profile === null ||
                    $profile->avatar_path === null
                ) {
                    return null;
                }

                $path = $profile->avatar_path;

                $profile->avatar_path = null;
                $profile->save();

                return $path;
            }
        );

        if ($previousPath !== null) {
            Storage::disk('local')->delete($previousPath);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Profile photo removed.',
        ]);

        return to_route('profile.edit');
    }
}
