<?php

namespace Database\Factories;

use App\Enums\PlaceStatus;
use App\Enums\VerificationStatus;
use App\Models\Place;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Place>
 */
class PlaceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'city' => fake()->randomElement(['Davao City', 'Cebu City', 'Manila', 'Iloilo City']),
            'address_line' => fake()->streetAddress(),
            'phone' => fake()->phoneNumber(),
            'status' => PlaceStatus::Pending,
            'verification_status' => VerificationStatus::NotVerified,
            'created_by' => User::factory(),
        ];
    }

    /**
     * State: an approved, publicly-visible place.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PlaceStatus::Approved,
            'published_at' => now(),
        ]);
    }

    /**
     * State: a place with an active Verified Halal certificate.
     */
    public function verifiedHalal(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => VerificationStatus::VerifiedHalal,
        ]);
    }
}
