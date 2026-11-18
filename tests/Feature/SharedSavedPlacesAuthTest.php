<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SharedSavedPlacesAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_use_saved_places(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.user', null)
                ->where('auth.canSavePlaces', false)
            );
    }

    public function test_unverified_user_cannot_use_saved_places(): void
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.user.id', $user->id)
                ->where('auth.canSavePlaces', false)
            );
    }

    public function test_verified_user_can_use_saved_places(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.user.id', $user->id)
                ->where('auth.canSavePlaces', true)
            );
    }
}
