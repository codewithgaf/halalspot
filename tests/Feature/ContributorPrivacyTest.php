<?php

use App\Models\User;

test('new contributor profiles are private by default', function () {
    // Arrange: Create a new user.
    $user = User::factory()->create();

    // Create the user's existing private profile record.
    $profile = $user->profile()->create([]);

    $storedProfile = $profile->fresh();

    expect($storedProfile->public_profile_enabled)->toBeFalse()
        ->and($storedProfile->share_bio)->toBeFalse()
        ->and($storedProfile->share_city)->toBeFalse();
});
