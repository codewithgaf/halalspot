<?php

use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

test('user cannot have more than one profile', function () {
    $user = User::factory()->create();

    $user->profile()->create([
        'bio' => 'My first profile',
    ]);

    expect(fn () => DB::transaction(
        fn () => $user->profile()->create([
            'bio' => 'My second profile',
        ])
    ))->toThrow(QueryException::class);

    expect($user->profile()->count())->toBe(1);
});

test('deleting a user also deletes their private profile', function () {
    $user = User::factory()->create();

    $profile = $user->profile()->create([
        'bio' => 'My private profile',
    ]);

    $user->delete();

    $this->assertDatabaseMissing('user_profiles', [
        'id' => $profile->id,
    ]);
});

test('profile bio cannot exceed 500 characters', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'bio' => str_repeat('a', 501),
        ])
        ->assertSessionHasErrors('bio');

    expect($user->fresh()->profile)->toBeNull();
});

test('authenticated user can save their profile bio', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'bio' => 'I enjoy exploring halal restaurants.',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $this->assertDatabaseHas('user_profiles', [
        'user_id' => $user->id,
        'bio' => 'I enjoy exploring halal restaurants.',
    ]);
});

test('user can update their existing profile bio', function () {
    $user = User::factory()->create();

    $profile = $user->profile()->create([
        'bio' => 'My original bio',
    ]);

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'bio' => 'My updated bio',
        ])
        ->assertSessionHasNoErrors();

    expect($profile->fresh()->bio)->toBe('My updated bio');

    $this->assertDatabaseCount('user_profiles', 1);
});

test('user can clear their profile bio', function () {
    $user = User::factory()->create();

    $user->profile()->create([
        'bio' => 'My existing bio',
    ]);

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'bio' => null,
        ])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->profile->bio)->toBeNull();

    $this->assertDatabaseCount('user_profiles', 1);
});

test('omitting bio preserves the existing biography', function () {
    $user = User::factory()->create();

    $user->profile()->create([
        'bio' => 'My existing biography',
    ]);

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
        ])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->profile->bio)
        ->toBe('My existing biography');

    $this->assertDatabaseCount('user_profiles', 1);
});

test('user cannot modify another users private profile', function () {
    $owner = User::factory()->create();
    $attacker = User::factory()->create();

    $owner->profile()->create([
        'bio' => 'Private owner biography',
    ]);

    $this->actingAs($attacker)
        ->patch(route('profile.update'), [
            'name' => $attacker->name,
            'email' => $attacker->email,
            'user_id' => $owner->id,
            'bio' => 'Unauthorized change',
        ])
        ->assertSessionHasNoErrors();

    expect($owner->fresh()->profile->bio)
        ->toBe('Private owner biography');

    expect($attacker->fresh()->profile->bio)
        ->toBe('Unauthorized change');
});

test('user can have a profile with bio and city code', function () {
    $user = User::factory()->create();

    $user->profile()->create([
        'bio' => 'I enjoy discovering halal restaurants.',
        'locality_code' => '1030900000',
    ]);

    $profile = $user->fresh()->profile;

    expect($profile)
        ->not->toBeNull()
        ->and($profile->bio)
        ->toBe('I enjoy discovering halal restaurants.')
        ->and($profile->locality_code)
        ->toBe('1030900000');
});

test('authenticated user can save their selected city', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'locality_code' => '1030900000',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $this->assertDatabaseHas('user_profiles', [
        'user_id' => $user->id,
        'locality_code' => '1030900000',
    ]);
});

test('user can update their selected city', function () {
    $user = User::factory()->create();

    $profile = $user->profile()->create([
        'locality_code' => '1030900000',
    ]);

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'locality_code' => '1130700000',
        ])
        ->assertSessionHasNoErrors();

    expect($profile->fresh()->locality_code)
        ->toBe('1130700000');

    $this->assertDatabaseCount('user_profiles', 1);
});

test('user can clear their selected city', function () {
    $user = User::factory()->create();

    $user->profile()->create([
        'locality_code' => '1030900000',
    ]);

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'locality_code' => null,
        ])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->profile->locality_code)
        ->toBeNull();

    $this->assertDatabaseCount('user_profiles', 1);
});

test('omitting city preserves the existing selection', function () {
    $user = User::factory()->create();

    $user->profile()->create([
        'locality_code' => '1030900000',
    ]);

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
        ])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->profile->locality_code)
        ->toBe('1030900000');
});

test('profile update rejects an unknown city code', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'locality_code' => '9999999999',
        ])
        ->assertSessionHasErrors('locality_code');

    $this->assertDatabaseMissing('user_profiles', [
        'user_id' => $user->id,
        'locality_code' => '9999999999',
    ]);
});

test('profile update accepts a recognized municipality code', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'locality_code' => '1003522000',
        ])
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('user_profiles', [
        'user_id' => $user->id,
        'locality_code' => '1003522000',
    ]);
});

test('profile settings displays the authenticated users private profile', function () {
    $user = User::factory()->create();

    $user->profile()->create([
        'bio' => 'I enjoy discovering halal restaurants.',
        'locality_code' => '1030900000',
    ]);

    $this->actingAs($user)
        ->get(route('profile.edit'))
        ->assertOk()
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('settings/profile')
                ->where(
                    'profile.bio',
                    'I enjoy discovering halal restaurants.'
                )
                ->where('profile.locality_code', '1030900000')
                ->where('profile.city.code', '1030900000')
                ->where('profile.city.name', 'City of Iligan')
                ->etc()
        );
});

test('user can save a municipality using locality_code', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'locality_code' => '1003522000',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $this->actingAs($user)
        ->get(route('profile.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/profile')
            ->where('profile.locality_code', '1003522000')
            ->etc()
        );
});
