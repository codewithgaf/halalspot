<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PlaceController;
Route::inertia('/', 'Welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'Dashboard')->name('dashboard');
});
Route::get('/explore', [PlaceController::class, 'index'])->name('explore');
require __DIR__.'/settings.php';
