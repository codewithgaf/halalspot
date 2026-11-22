<?php

use App\Http\Controllers\Settings\LocalitySearchController;
use App\Http\Controllers\Settings\ProfileAvatarController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Middleware\EnsureAccountIsActive;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', EnsureAccountIsActive::class])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::get('settings/localities/search', [LocalitySearchController::class, 'index'])->name('localities.search');

    // Avatar Uploads
    Route::get('settings/profile/avatar', [ProfileAvatarController::class, 'show'])->name('profile.avatar.show');
    Route::post('settings/profile/avatar', [ProfileAvatarController::class, 'store'])->name('profile.avatar.store');
    Route::delete('settings/profile/avatar', [ProfileAvatarController::class, 'destroy'])->name('profile.avatar.destroy');
});

Route::middleware(['auth', 'verified', EnsureAccountIsActive::class])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});
