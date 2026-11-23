<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('account owners can update their contributor privacy settings', function () {
    // Arrange: Create a user with private defaults.
    $user = User::factory()->create();

    $user->profile()->create([]);

    // Act: The authenticated user updates their preferences.
    $this->actingAs($user)
        ->patch('/settings/profile/privacy', [
            'public_profile_enabled' => true,
            'share_bio' => true,
            'share_city' => false,
        ])
        ->assertRedirect(route('profile.edit'));

    // Assert: Only the intended profile is updated.
    $this->assertDatabaseHas('user_profiles', [
        'user_id' => $user->id,
        'public_profile_enabled' => true,
        'share_bio' => true,
        'share_city' => false,
    ]);
});

test('guests cannot update contributor privacy settings', function () {
    $this->patch('/settings/profile/privacy', [
        'public_profile_enabled' => true,
        'share_bio' => true,
        'share_city' => true,
    ])->assertRedirect(route('login'));
});

test('suspended users cannot update contributor privacy settings', function () {
    // Arrange: Create a user and their private profile.
    $user = User::factory()->create();

    $user->profile()->create([]);

    // Suspend the account.
    $user->forceFill([
        'account_status' => 'suspended',
    ])->save();

    // Act: Attempt to make the profile public.
    $this->actingAs($user)
        ->patch('/settings/profile/privacy', [
            'public_profile_enabled' => true,
            'share_bio' => true,
            'share_city' => true,
        ])
        ->assertForbidden();

    // Assert: The failed request did not alter privacy settings.
    $this->assertDatabaseHas('user_profiles', [
        'user_id' => $user->id,
        'public_profile_enabled' => false,
        'share_bio' => false,
        'share_city' => false,
    ]);
});

test('invalid privacy settings are rejected without changing the profile', function () {
    // Arrange: Create a user with private defaults.
    $user = User::factory()->create();

    $user->profile()->create([]);

    // Act: Submit an invalid value.
    $this->actingAs($user)
        ->patch('/settings/profile/privacy', [
            'public_profile_enabled' => 'make-everything-public',
            'share_bio' => true,
            'share_city' => false,
        ])
        ->assertSessionHasErrors([
            'public_profile_enabled',
        ]);

    // Assert: Privacy preferences remain unchanged.
    $this->assertDatabaseHas('user_profiles', [
        'user_id' => $user->id,
        'public_profile_enabled' => false,
        'share_bio' => false,
        'share_city' => false,
    ]);
});

test('users cannot change another accounts privacy settings', function () {
    // Arrange: Create two separate accounts.
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    // Both profiles begin private.
    $userA->profile()->create([]);
    $userB->profile()->create([]);

    // Act: User A attempts to target User B.
    $this->actingAs($userA)
        ->patch(route('profile.privacy.update'), [
            'user_id' => $userB->id,
            'public_profile_enabled' => true,
            'share_bio' => true,
            'share_city' => false,
        ])
        ->assertRedirect(route('profile.edit'));

    // User A can only update their own preferences.
    $this->assertDatabaseHas('user_profiles', [
        'user_id' => $userA->id,
        'public_profile_enabled' => true,
        'share_bio' => true,
        'share_city' => false,
    ]);

    // User B must remain completely private.
    $this->assertDatabaseHas('user_profiles', [
        'user_id' => $userB->id,
        'public_profile_enabled' => false,
        'share_bio' => false,
        'share_city' => false,
    ]);
});

test('privacy settings can be saved when the user has no profile', function () {
    // Arrange: Create a user without a profile record.
    $user = User::factory()->create();

    expect($user->profile()->exists())->toBeFalse();

    // Act: The user explicitly enables public visibility.
    $this->actingAs($user)
        ->patch(route('profile.privacy.update'), [
            'public_profile_enabled' => true,
            'share_bio' => false,
            'share_city' => false,
        ])
        ->assertRedirect(route('profile.edit'));

    // Assert: A profile was created for this user.
    $this->assertDatabaseHas('user_profiles', [
        'user_id' => $user->id,
        'public_profile_enabled' => true,
        'share_bio' => false,
        'share_city' => false,
    ]);

    // The user must have exactly one profile.
    expect($user->profile()->count())->toBe(1);
});

test('profile settings show private defaults when no profile exists', function () {
    // Arrange: A new user without a profile record.
    $user = User::factory()->create();

    expect($user->profile()->exists())->toBeFalse();

    // Act: Open the authenticated profile settings page.
    $this->actingAs($user)
        ->get(route('profile.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/profile')
            ->where('profile.public_profile_enabled', false)
            ->where('profile.share_bio', false)
            ->where('profile.share_city', false)
            ->etc()
        );
});

test('profile settings show previously saved privacy preferences', function () {
    // Arrange: Create a user with saved privacy preferences.
    $user = User::factory()->create();

    $user->profile()->create([
        'public_profile_enabled' => true,
        'share_bio' => true,
        'share_city' => false,
    ]);

    // Act: Reload the profile settings page.
    $this->actingAs($user)
        ->get(route('profile.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/profile')
            ->where('profile.public_profile_enabled', true)
            ->where('profile.share_bio', true)
            ->where('profile.share_city', false)
            ->etc()
        );
});

test('disabling a public profile clears sharing preferences', function () {
    // Arrange: A user previously enabled all sharing.
    $user = User::factory()->create();

    $user->profile()->create([
        'public_profile_enabled' => true,
        'share_bio' => true,
        'share_city' => true,
    ]);

    // Act: Submit a request with the public profile disabled,
    // but with both individual sharing flags still enabled.
    $this->actingAs($user)
        ->patch(route('profile.privacy.update'), [
            'public_profile_enabled' => false,
            'share_bio' => true,
            'share_city' => true,
        ])
        ->assertRedirect(route('profile.edit'));

    // Assert: The master privacy setting takes priority.
    $this->assertDatabaseHas('user_profiles', [
        'user_id' => $user->id,
        'public_profile_enabled' => false,
        'share_bio' => false,
        'share_city' => false,
    ]);
});
