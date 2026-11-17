<?php

use App\Http\Controllers\PublicPlaceController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::get('/', [PublicPlaceController::class, 'index'])
    ->name('home');

Route::inertia('/about', 'about')->name('about');

Route::get('/restaurants/{slug}', [PublicPlaceController::class, 'show']
)->name('restaurants.show');

require __DIR__.'/settings.php';
