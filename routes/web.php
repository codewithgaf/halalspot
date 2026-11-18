
<?php

use App\Http\Controllers\PublicPlaceController;
use App\Http\Controllers\SavedPlaceController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PublicPlaceController::class, 'index'])
    ->name('home');

Route::inertia('/about', 'about')
    ->name('about');

Route::get(
    '/restaurants/{slug}',
    [PublicPlaceController::class, 'show']
)->name('restaurants.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('/dashboard', 'dashboard')
        ->name('dashboard');

    Route::post(
        '/saved-places/{place}',
        [SavedPlaceController::class, 'store']
    )->name('saved-places.store');
});

require __DIR__.'/settings.php';
