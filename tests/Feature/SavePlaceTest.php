<?php

namespace Tests\Feature;

use App\Models\Place;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SavePlaceTest extends TestCase
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
            'address' => 'Sample Street',
            'latitude' => 6.1164,
            'longitude' => 125.1716,
        ]);

        $place->publication_status = $status;

        if ($status === 'published') {
            $place->published_at = now();
        }

        $place->save();

        return $place;
    }

    public function test_guest_cannot_save_a_place(): void
    {
        $place = $this->createPlace('guest-restaurant');

        $this->post("/saved-places/{$place->id}")
            ->assertRedirect('/login');

        $this->assertDatabaseCount('saved_places', 0);
    }

    public function test_authenticated_user_can_save_a_published_place(): void
    {
        $user = User::factory()->create();
        $place = $this->createPlace('published-restaurant');

        $this->actingAs($user)
            ->post("/saved-places/{$place->id}")
            ->assertRedirect();

        $this->assertDatabaseHas('saved_places', [
            'user_id' => $user->id,
            'place_id' => $place->id,
        ]);
    }

    public function test_user_cannot_save_a_draft_place(): void
    {
        $user = User::factory()->create();
        $place = $this->createPlace(
            'draft-restaurant',
            'draft'
        );

        $this->actingAs($user)
            ->post("/saved-places/{$place->id}")
            ->assertNotFound();

        $this->assertDatabaseCount('saved_places', 0);
    }

    public function test_saving_the_same_place_twice_creates_one_entry(): void
    {
        $user = User::factory()->create();
        $place = $this->createPlace('duplicate-restaurant');

        $this->actingAs($user)
            ->post("/saved-places/{$place->id}")
            ->assertRedirect();

        $this->actingAs($user)
            ->post("/saved-places/{$place->id}")
            ->assertRedirect();

        $this->assertDatabaseCount('saved_places', 1);
    }

    public function test_user_cannot_save_an_archived_place(): void
    {
        $user = User::factory()->create();

        $place = $this->createPlace(
            'archived-restaurant',
            'archived'
        );

        $this->actingAs($user)
            ->post("/saved-places/{$place->id}")
            ->assertNotFound();

        $this->assertDatabaseCount('saved_places', 0);
    }

    public function test_user_cannot_save_on_behalf_of_another_user(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();

        $place = $this->createPlace('ownership-restaurant');

        $this->actingAs($owner)
            ->post("/saved-places/{$place->id}", [
                'user_id' => $otherUser->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('saved_places', [
            'user_id' => $owner->id,
            'place_id' => $place->id,
        ]);

        $this->assertDatabaseMissing('saved_places', [
            'user_id' => $otherUser->id,
            'place_id' => $place->id,
        ]);
    }

    public function test_unverified_user_can_save_a_published_place(): void
    {
        $user = User::factory()->unverified()->create();
        $place = $this->createPlace('unverified-restaurant');

        $this->actingAs($user)
            ->postJson("/saved-places/{$place->id}")
            ->assertRedirect();

        $this->assertDatabaseHas('saved_places', [
            'user_id' => $user->id,
            'place_id' => $place->id,
        ]);
    }

    public function test_user_cannot_save_a_nonexistent_place(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/saved-places/999999999')
            ->assertNotFound();

        $this->assertDatabaseCount('saved_places', 0);
    }
}
