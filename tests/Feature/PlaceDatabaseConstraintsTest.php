
<?php

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

function insertTestPlace(array $overrides = []): void
{
    DB::table('places')->insert(array_merge([
        'name' => 'Sample Restaurant',
        'slug' => 'sample-restaurant',
        'city' => 'Sample City',
        'publication_status' => 'draft',
        'created_at' => now(),
        'updated_at' => now(),
    ], $overrides));
}

it('has the places table', function () {
    expect(Schema::hasTable('places'))->toBeTrue();
});

it('allows a valid draft without coordinates', function () {
    insertTestPlace();

    $this->assertDatabaseHas('places', [
        'slug' => 'sample-restaurant',
        'publication_status' => 'draft',
    ]);
});

it('rejects an invalid latitude', function () {
    expect(fn () => insertTestPlace([
        'latitude' => 91,
        'longitude' => 124,
    ]))->toThrow(QueryException::class);
});

it('rejects an invalid longitude', function () {
    expect(fn () => insertTestPlace([
        'latitude' => 8,
        'longitude' => 181,
    ]))->toThrow(QueryException::class);
});

it('rejects incomplete coordinate pairs', function () {
    expect(fn () => insertTestPlace([
        'latitude' => 8,
        'longitude' => null,
    ]))->toThrow(QueryException::class);
});

it('rejects an invalid publication status', function () {
    expect(fn () => insertTestPlace([
        'publication_status' => 'invalid',
    ]))->toThrow(QueryException::class);
});

it('rejects publication without coordinates', function () {
    expect(fn () => insertTestPlace([
        'address' => 'Sample Street',
        'publication_status' => 'published',
        'published_at' => now(),
    ]))->toThrow(QueryException::class);
});

it('rejects publication without an address', function () {
    expect(fn () => insertTestPlace([
        'latitude' => 8,
        'longitude' => 124,
        'publication_status' => 'published',
        'published_at' => now(),
    ]))->toThrow(QueryException::class);
});

it('allows a complete published place', function () {
    insertTestPlace([
        'address' => 'Sample Street',
        'latitude' => 8,
        'longitude' => 124,
        'publication_status' => 'published',
        'published_at' => now(),
    ]);

    $this->assertDatabaseHas('places', [
        'slug' => 'sample-restaurant',
        'publication_status' => 'published',
    ]);
});

it('rejects duplicate place slugs', function () {
    insertTestPlace();

    expect(fn () => insertTestPlace([
        'name' => 'Another Restaurant',
    ]))->toThrow(QueryException::class);
});

it('rejects places without a name', function () {
    expect(fn () => insertTestPlace([
        'name' => null,
    ]))->toThrow(QueryException::class);
});

it('rejects places without a city', function () {
    expect(fn () => insertTestPlace([
        'city' => null,
    ]))->toThrow(QueryException::class);
});
