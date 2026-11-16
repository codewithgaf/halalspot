<?php

use App\Models\Place;
use App\Models\User;
use App\Services\Places\PublishPlace;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

it('allows an administrator to publish a complete draft place', function () {
    // Arrange: create an authorized administrator.
    $administrator = User::factory()->create();
    $administrator->assignRole('administrator');

    // Arrange: create a complete draft restaurant.
    $place = Place::create([
        'name' => 'Sample Halal Restaurant',
        'slug' => 'sample-halal-restaurant',
        'description' => 'Sample restaurant used for testing.',
        'address' => 'Sample Street, Iligan City',
        'city' => 'Iligan City',
        'country_code' => 'PH',
        'latitude' => 8.228,
        'longitude' => 124.245,
    ]);

    // Act: request publication.
    $publishedPlace = app(PublishPlace::class)->publish(
        $administrator,
        $place
    );

    // Assert: publication succeeds.
    expect($publishedPlace->publication_status)
        ->toBe('published')
        ->and($publishedPlace->published_at)
        ->not->toBeNull();

    $this->assertDatabaseHas('places', [
        'id' => $place->id,
        'publication_status' => 'published',
    ]);
});

it('rejects publication by an ordinary user', function () {
    $user = User::factory()->create();
    $user->assignRole('user');

    $place = Place::create([
        'name' => 'Unauthorized Publication Test',
        'slug' => 'unauthorized-publication-test',
        'city' => 'Iligan City',
        'address' => 'Sample Street',
        'latitude' => 8.228,
        'longitude' => 124.245,
    ]);

    expect(fn () => app(PublishPlace::class)->publish(
        $user,
        $place
    ))->toThrow(AuthorizationException::class);

    $place->refresh();

    expect($place->publication_status)->toBe('draft')
        ->and($place->published_at)->toBeNull();
});

it('rejects publication without an address', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    $place = Place::create([
        'name' => 'Missing Address Test',
        'slug' => 'missing-address-test',
        'city' => 'Iligan City',
        'latitude' => 8.228,
        'longitude' => 124.245,
    ]);

    expect(fn () => app(PublishPlace::class)->publish(
        $admin,
        $place
    ))->toThrow(ValidationException::class);

    $place->refresh();

    expect($place->publication_status)->toBe('draft')
        ->and($place->published_at)->toBeNull();
});

it('rejects publication without coordinates', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    $place = Place::create([
        'name' => 'Missing Coordinates Test',
        'slug' => 'missing-coordinates-test',
        'city' => 'Iligan City',
        'address' => 'Sample Street',
    ]);

    expect(fn () => app(PublishPlace::class)->publish(
        $admin,
        $place
    ))->toThrow(ValidationException::class);

    $place->refresh();

    expect($place->publication_status)->toBe('draft')
        ->and($place->published_at)->toBeNull();
});

it('preserves the original publication timestamp when published again', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    $place = Place::create([
        'name' => 'Idempotent Publication Test',
        'slug' => 'idempotent-publication-test',
        'city' => 'Iligan City',
        'address' => 'Sample Street',
        'latitude' => 8.228,
        'longitude' => 124.245,
    ]);

    $this->travelTo(now()->startOfSecond());

    $service = app(PublishPlace::class);

    $firstPublication = $service->publish($admin, $place);

    $originalPublishedAt = $firstPublication->published_at->toISOString();

    // Simulate another request five minutes later.
    $this->travel(5)->minutes();

    $secondPublication = $service->publish($admin, $place);

    expect($secondPublication->publication_status)->toBe('published')
        ->and($secondPublication->published_at->toISOString())
        ->toBe($originalPublishedAt);
});

it('rejects publication of an archived place', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    $place = Place::create([
        'name' => 'Archived Publication Test',
        'slug' => 'archived-publication-test',
        'city' => 'Iligan City',
        'address' => 'Sample Street',
        'latitude' => 8.228,
        'longitude' => 124.245,
    ]);

    // Simulate an already archived restaurant.
    $place->publication_status = 'archived';
    $place->save();

    expect(fn () => app(PublishPlace::class)->publish(
        $admin,
        $place
    ))->toThrow(ValidationException::class);

    $place->refresh();

    expect($place->publication_status)->toBe('archived')
        ->and($place->published_at)->toBeNull();
});

it('rejects publication when a previously loaded draft has been archived', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    $place = Place::create([
        'name' => 'Stale Publication Test',
        'slug' => 'stale-publication-test',
        'city' => 'Iligan City',
        'address' => 'Sample Street',
        'latitude' => 8.228,
        'longitude' => 124.245,
    ]);

    // Simulate another operation changing the database
    // after the original Place model was loaded.
    Place::query()
        ->whereKey($place->id)
        ->update([
            'publication_status' => 'archived',
        ]);

    // The original model is still stale.
    expect($place->publication_status)->toBe('draft');

    expect(fn () => app(PublishPlace::class)->publish(
        $admin,
        $place
    ))->toThrow(ValidationException::class);

    // The archived state must remain unchanged.
    $place->refresh();

    expect($place->publication_status)->toBe('archived')
        ->and($place->published_at)->toBeNull();
});

it('rejects publication when a previously loaded draft loses its address', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    $place = Place::create([
        'name' => 'Stale Location Test',
        'slug' => 'stale-location-test',
        'city' => 'Iligan City',
        'address' => 'Sample Street',
        'latitude' => 8.228,
        'longitude' => 124.245,
    ]);

    // Another operation removes the address.
    Place::query()
        ->whereKey($place->id)
        ->update([
            'address' => null,
        ]);

    // The original model still has the old address.
    expect($place->address)->toBe('Sample Street');

    expect(fn () => app(PublishPlace::class)->publish(
        $admin,
        $place
    ))->toThrow(ValidationException::class);

    $place->refresh();

    expect($place->publication_status)->toBe('draft')
        ->and($place->address)->toBeNull();
});

it('denies an ordinary user even when the place is already published', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    $user = User::factory()->create();
    $user->assignRole('user');

    $place = Place::create([
        'name' => 'Published Authorization Test',
        'slug' => 'published-authorization-test',
        'city' => 'Iligan City',
        'address' => 'Sample Street',
        'latitude' => 8.228,
        'longitude' => 124.245,
    ]);

    $service = app(PublishPlace::class);
    $service->publish($admin, $place);

    $originalTimestamp = $place->fresh()
        ->published_at
        ->toISOString();

    expect(fn () => $service->publish(
        $user,
        $place
    ))->toThrow(AuthorizationException::class);

    $place->refresh();

    expect($place->publication_status)->toBe('published')
        ->and($place->published_at->toISOString())
        ->toBe($originalTimestamp);
});

it('rolls back publication when saving triggers an exception', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    $place = Place::create([
        'name' => 'Rollback Publication Test',
        'slug' => 'rollback-publication-test',
        'city' => 'Iligan City',
        'address' => 'Sample Street',
        'latitude' => 8.228,
        'longitude' => 124.245,
    ]);

    // Simulate an unexpected failure after the database update.
    Place::saved(function (Place $savedPlace) use ($place) {
        if ($savedPlace->id === $place->id) {
            throw new RuntimeException('Simulated save failure');
        }
    });

    expect(fn () => app(PublishPlace::class)->publish(
        $admin,
        $place
    ))->toThrow(RuntimeException::class, 'Simulated save failure');

    // Verify persisted data, not only the in-memory model.
    $place->refresh();

    expect($place->publication_status)->toBe('draft')
        ->and($place->published_at)->toBeNull();
});
