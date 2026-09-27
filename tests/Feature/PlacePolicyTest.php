<?php

use App\Models\Place;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([RoleSeeder::class, PermissionSeeder::class]);
});

test('owner can update their own pending place', function () {
    $owner = User::factory()->create();
    $place = Place::factory()->create(['created_by' => $owner->id]);

    expect($owner->can('update', $place))->toBeTrue();
});

test('a random user cannot update someone else\'s place', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $place = Place::factory()->create(['created_by' => $owner->id]);

    expect($otherUser->can('update', $place))->toBeFalse();
});

test('owner can delete their own pending place, but not once approved', function () {
    $owner = User::factory()->create();
    $pendingPlace = Place::factory()->create(['created_by' => $owner->id]);
    $approvedPlace = Place::factory()->approved()->create(['created_by' => $owner->id]);

    expect($owner->can('delete', $pendingPlace))->toBeTrue();
    expect($owner->can('delete', $approvedPlace))->toBeFalse();
});

test('a regular user can never approve a place', function () {
    $user = User::factory()->create();
    $place = Place::factory()->create();

    expect($user->can('approve', $place))->toBeFalse();
});

test('a moderator can approve a place', function () {
    $moderator = User::factory()->create();
    $moderator->assignRole('moderator');
    $place = Place::factory()->create();

    expect($moderator->can('approve', $place))->toBeTrue();
});

test('a moderator cannot approve an official certificate verification', function () {
    $moderator = User::factory()->create();
    $moderator->assignRole('moderator');

    expect($moderator->can('verification.approve'))->toBeFalse();
});

test('an admin can approve an official certificate verification', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    expect($admin->can('verification.approve'))->toBeTrue();
});

test('a moderator cannot directly edit place content', function () {
    $moderator = User::factory()->create();
    $moderator->assignRole('moderator');
    $place = Place::factory()->create();

    expect($moderator->can('update', $place))->toBeFalse();
});

test('everyone can view a published place', function () {
    $randomUser = User::factory()->create();
    $publishedPlace = Place::factory()->approved()->create();

    expect($randomUser->can('view', $publishedPlace))->toBeTrue();
});

test('a stranger cannot view someone else\'s pending place', function () {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();
    $pendingPlace = Place::factory()->create(['created_by' => $owner->id]);

    expect($stranger->can('view', $pendingPlace))->toBeFalse();
});
