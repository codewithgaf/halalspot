<?php

namespace Tests\Feature;

use App\Models\Place;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListSavedPlacesTest extends TestCase
{
    use RefreshDatabase;

    private function createPlace(
        string $slug,
        string $status = 'published'
    ): Place {
        $place = Place::query()->create([
            'name' => 'Test Restaurant',
            'slug' => $slug,
            'city' => 'General Santos',
            'address' => '123 Test Street, General Santos City',
            'latitude' => 6.1164,
            'longitude' => 125.1716,
        ]);

        $place->forceFill([
            'publication_status' => $status,
            'published_at' => now(),
        ])->save();

        return $place;
    }

    public function test_guest_cannot_list_saved_places(): void
    {
        $this->getJson('/saved-places')
            ->assertUnauthorized();
    }

    public function test_unverified_user_cannot_list_saved_places(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->getJson('/saved-places')
            ->assertForbidden();
    }

    public function test_user_sees_only_their_own_saved_places(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $ownPlace = $this->createPlace('my-saved-place');
        $otherPlace = $this->createPlace('other-saved-place');

        $user->savedPlaces()->attach($ownPlace->id);
        $otherUser->savedPlaces()->attach($otherPlace->id);

        $this->actingAs($user)
            ->getJson('/saved-places')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', (string) $ownPlace->id);
    }

    public function test_draft_and_archived_places_are_excluded(): void
    {
        $user = User::factory()->create();

        $published = $this->createPlace('published-place');
        $draft = $this->createPlace('draft-place', 'draft');
        $archived = $this->createPlace('archived-place', 'archived');

        $user->savedPlaces()->attach([
            $published->id,
            $draft->id,
            $archived->id,
        ]);

        $this->actingAs($user)
            ->getJson('/saved-places')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', (string) $published->id);
    }

    public function test_empty_saved_collection_returns_empty_array(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/saved-places')
            ->assertOk()
            ->assertExactJson([
                'data' => [],
            ]);
    }

    public function test_saved_places_include_fields_needed_by_frontend(): void
    {
        $user = User::factory()->create();
        $place = $this->createPlace('restaurant-detail-link');

        $user->savedPlaces()->attach($place->id);

        $this->actingAs($user)
            ->getJson('/saved-places')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'city',
                    ],
                ],
            ])
            ->assertJsonPath('data.0.id', (string) $place->id)
            ->assertJsonPath('data.0.name', 'Test Restaurant')
            ->assertJsonPath('data.0.slug', 'restaurant-detail-link')
            ->assertJsonPath('data.0.city', 'General Santos');
    }

    public function test_saved_places_are_ordered_newest_first(): void
    {
        $user = User::factory()->create();

        $olderPlace = $this->createPlace('older-saved-place');
        $newerPlace = $this->createPlace('newer-saved-place');

        $user->savedPlaces()->attach($olderPlace->id, [
            'created_at' => now()->subDay(),
            'updated_at' => now()->subDay(),
        ]);

        $user->savedPlaces()->attach($newerPlace->id, [
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($user)
            ->getJson('/saved-places')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', (string) $newerPlace->id)
            ->assertJsonPath('data.1.id', (string) $olderPlace->id);
    }
}
