<?php

use App\Http\Controllers\PlaceController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'Welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'Dashboard')->name('dashboard');
});
Route::get('/explore', [PlaceController::class, 'index'])->name('explore');
require __DIR__.'/settings.php';
