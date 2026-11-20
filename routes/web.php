
<?php

use App\Http\Controllers\PublicPlaceController;
use App\Http\Controllers\SavedPlaceController;
use App\Http\Middleware\EnsureAccountIsActive;
use Illuminate\Support\Facades\Route;

Route::get('/', [PublicPlaceController::class, 'index'])
    ->name('home');

Route::inertia('/about', 'about')
    ->name('about');

Route::get(
    '/restaurants/{slug}',
    [PublicPlaceController::class, 'show']
)->name('restaurants.show');

Route::inertia('/dashboard', 'dashboard')
    ->middleware(['auth', EnsureAccountIsActive::class])
    ->name('dashboard');

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

require __DIR__.'/settings.php';
