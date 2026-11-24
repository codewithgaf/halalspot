<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PublicPlaceController;
use App\Http\Controllers\SavedPlaceController;
use App\Http\Controllers\SavedPlacesPageController;
use App\Http\Middleware\EnsureAccountIsActive;
use App\Http\Middleware\EnsurePrivilegedMfa;
use Illuminate\Support\Facades\Route;

Route::get('/', [PublicPlaceController::class, 'index'])
    ->name('home');

Route::inertia('/about', 'about')
    ->name('about');

Route::get(
    '/restaurants/{slug}',
    [PublicPlaceController::class, 'show']
)->name('restaurants.show');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', EnsureAccountIsActive::class])
    ->name('dashboard');

Route::get('/account/saved-places', [SavedPlacesPageController::class, 'index'])
    ->middleware(['auth', EnsureAccountIsActive::class])
    ->name('account.saved-places');

Route::middleware(['auth', EnsureAccountIsActive::class])->group(function () {
    Route::get(
        '/saved-places',
        [SavedPlaceController::class, 'index']
    )->name('saved-places.index');

    Route::post(
        '/saved-places/{place}',
        [SavedPlaceController::class, 'store']
    )->name('saved-places.store');

    Route::delete(
        '/saved-places/{place}',
        [SavedPlaceController::class, 'destroy']
    )->name('saved-places.destroy');
});

Route::get('/admin', [AdminDashboardController::class, 'index'])
    ->middleware([
        'auth',
        EnsureAccountIsActive::class,
        EnsurePrivilegedMfa::class,
        'role:administrator',
    ])
    ->name('admin.dashboard');

require __DIR__.'/settings.php';
