<?php

namespace Tests\Feature;

use App\Models\Place;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UnsavePlaceTest extends TestCase
{
    use RefreshDatabase;

    private function createPlace(string $slug): Place
    {
        return Place::query()->create([
            'name' => 'Test Restaurant',
            'slug' => $slug,
            'city' => 'General Santos',
        ]);
    }

    public function test_guest_cannot_unsave_a_place(): void
    {
        $place = $this->createPlace('guest-unsave');

        $this->delete("/saved-places/{$place->id}")
            ->assertRedirect('/login');

        $this->assertDatabaseCount('saved_places', 0);
    }

    public function test_user_can_unsave_their_own_place(): void
    {
        $user = User::factory()->create();
        $place = $this->createPlace('own-unsave');

        $user->savedPlaces()->attach($place->id);

        $this->actingAs($user)
            ->delete("/saved-places/{$place->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('saved_places', [
            'user_id' => $user->id,
            'place_id' => $place->id,
        ]);
    }

    public function test_unsaving_twice_is_safe(): void
    {
        $user = User::factory()->create();
        $place = $this->createPlace('repeat-unsave');

        $user->savedPlaces()->attach($place->id);

        $this->actingAs($user)
            ->delete("/saved-places/{$place->id}")
            ->assertRedirect();

        $this->actingAs($user)
            ->delete("/saved-places/{$place->id}")
            ->assertRedirect();

        $this->assertDatabaseCount('saved_places', 0);
    }

    public function test_user_cannot_remove_another_users_saved_place(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $place = $this->createPlace('ownership-unsave');

        $owner->savedPlaces()->attach($place->id);

        $this->actingAs($otherUser)
            ->delete("/saved-places/{$place->id}")
            ->assertRedirect();

        $this->assertDatabaseHas('saved_places', [
            'user_id' => $owner->id,
            'place_id' => $place->id,
        ]);
    }

    public function test_unsaving_does_not_delete_the_restaurant(): void
    {
        $user = User::factory()->create();
        $place = $this->createPlace('preserve-place');

        $user->savedPlaces()->attach($place->id);

        $this->actingAs($user)
            ->delete("/saved-places/{$place->id}")
            ->assertRedirect();

        $this->assertDatabaseHas('places', [
            'id' => $place->id,
        ]);
    }

    public function test_unverified_user_cannot_unsave_a_place(): void
    {
        $user = User::factory()->unverified()->create();
        $place = $this->createPlace('unverified-unsave');

        $user->savedPlaces()->attach($place->id);

        $this->actingAs($user)
            ->deleteJson("/saved-places/{$place->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('saved_places', [
            'user_id' => $user->id,
            'place_id' => $place->id,
        ]);
    }

    public function test_user_can_unsave_an_archived_place(): void
    {
        $user = User::factory()->create();
        $place = $this->createPlace('archived-unsave');

        $user->savedPlaces()->attach($place->id);

        $place->publication_status = 'archived';
        $place->save();

        $this->actingAs($user)
            ->delete("/saved-places/{$place->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('saved_places', [
            'user_id' => $user->id,
            'place_id' => $place->id,
        ]);
    }
}
