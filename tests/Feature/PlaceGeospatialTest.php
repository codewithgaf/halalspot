<?php

use App\Models\Place;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();

    $this->davaoPlace = Place::factory()->create(['created_by' => $this->user->id]);
    $this->davaoPlace->location = ['latitude' => 7.0731, 'longitude' => 125.6128];
    $this->davaoPlace->save();

    $this->manilaPlace = Place::factory()->create(['created_by' => $this->user->id]);
    $this->manilaPlace->location = ['latitude' => 14.5995, 'longitude' => 120.9842];
    $this->manilaPlace->save();
});

test('location get/set accessor round-trips correctly', function () {
    $this->davaoPlace->refresh();

    expect($this->davaoPlace->location['latitude'])->toBe(7.0731);
    expect($this->davaoPlace->location['longitude'])->toBe(125.6128);
});

test('nearby scope finds a place within radius and excludes one outside it', function () {
    $results = Place::nearby(7.0736, 125.6135, 5000)->pluck('name');

    expect($results)->toContain($this->davaoPlace->name);
    expect($results)->not->toContain($this->manilaPlace->name);
});

test('nearbyWithDistance orders results closest-first and reports distance', function () {
    $results = Place::nearbyWithDistance(7.0736, 125.6135, 2_000_000)->get();

    expect($results->first()->id)->toBe($this->davaoPlace->id);
    expect($results->last()->id)->toBe($this->manilaPlace->id);
    expect($results->first()->distance_meters)->toBeLessThan(1000);
    expect($results->last()->distance_meters)->toBeGreaterThan(900_000);
});

test('inViewport finds a place inside the bounding box and excludes one outside it', function () {
    $results = Place::inViewport(6.9, 125.4, 7.2, 125.8)->pluck('name');

    expect($results)->toContain($this->davaoPlace->name);
    expect($results)->not->toContain($this->manilaPlace->name);
});
