<?php

namespace Tests\Feature;

use App\Models\Place;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SavedPlaceDatabaseTest extends TestCase
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

    public function test_user_can_save_a_place(): void
    {
        $user = User::factory()->create();
        $place = $this->createPlace('test-restaurant');

        $user->savedPlaces()->attach($place->id);

        $this->assertDatabaseHas('saved_places', [
            'user_id' => $user->id,
            'place_id' => $place->id,
        ]);
    }

    public function test_duplicate_saved_place_is_rejected(): void
    {
        $user = User::factory()->create();
        $place = $this->createPlace('duplicate-restaurant');

        $user->savedPlaces()->attach($place->id);

        $this->expectException(QueryException::class);

        $user->savedPlaces()->attach($place->id);
    }

    public function test_different_users_can_save_the_same_place(): void
    {
        $firstUser = User::factory()->create();
        $secondUser = User::factory()->create();
        $place = $this->createPlace('shared-restaurant');

        $firstUser->savedPlaces()->attach($place->id);
        $secondUser->savedPlaces()->attach($place->id);

        $this->assertDatabaseCount('saved_places', 2);
    }

    public function test_deleting_a_user_removes_their_saved_places(): void
    {
        $user = User::factory()->create();
        $place = $this->createPlace('user-cascade-restaurant');

        $user->savedPlaces()->attach($place->id);

        $user->delete();

        $this->assertDatabaseMissing('saved_places', [
            'user_id' => $user->id,
            'place_id' => $place->id,
        ]);
    }

    public function test_deleting_a_place_removes_saved_entries(): void
    {
        $user = User::factory()->create();
        $place = $this->createPlace('place-cascade-restaurant');

        $user->savedPlaces()->attach($place->id);

        $place->delete();

        $this->assertDatabaseMissing('saved_places', [
            'user_id' => $user->id,
            'place_id' => $place->id,
        ]);
    }

    public function test_saved_places_relationship_returns_correct_places(): void
    {
        $user = User::factory()->create();
        $place = $this->createPlace('relationship-restaurant');

        $user->savedPlaces()->attach($place->id);

        $this->assertTrue(
            $user->savedPlaces()
                ->whereKey($place->id)
                ->exists()
        );

        $this->assertTrue(
            $place->savedByUsers()
                ->whereKey($user->id)
                ->exists()
        );
    }
}
