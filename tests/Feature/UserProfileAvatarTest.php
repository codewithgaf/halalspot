<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('a private profile can store an avatar path', function () {
    $user = User::factory()->create();

    $profile = $user->profile()->create([
        'bio' => 'I enjoy exploring halal restaurants.',
    ]);

    $profile->avatar_path = 'profile-avatars/example.webp';
    $profile->save();

    expect($profile->fresh()->avatar_path)
        ->toBe('profile-avatars/example.webp');
});

test('user can upload a private avatar', function () {
    Storage::fake('local');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar.store'), [
            'avatar' => UploadedFile::fake()->image('avatar.png'),
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $path = $user->fresh()->profile?->avatar_path;

    expect($path)
        ->toBeString()
        ->toStartWith('profile-avatars/');

    Storage::disk('local')->assertExists((string) $path);
});

test('avatar upload rejects a non-image file', function () {
    Storage::fake('local');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar.store'), [
            'avatar' => UploadedFile::fake()->create(
                'document.pdf',
                100,
                'application/pdf'
            ),
        ])
        ->assertSessionHasErrors('avatar');

    expect($user->fresh()->profile)->toBeNull();
});

test('avatar upload rejects images larger than 2 MiB', function () {
    Storage::fake('local');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar.store'), [
            'avatar' => UploadedFile::fake()
                ->image('large.png')
                ->size(2049),
        ])
        ->assertSessionHasErrors('avatar');

    expect($user->fresh()->profile)->toBeNull();
});

test('guest cannot upload an avatar', function () {
    Storage::fake('local');

    $this->post(route('profile.avatar.store'), [
        'avatar' => UploadedFile::fake()->image('avatar.png'),
    ])->assertRedirect(route('login'));
});

test('uploading a replacement removes the previous avatar', function () {
    Storage::fake('local');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar.store'), [
            'avatar' => UploadedFile::fake()->image('first.png'),
        ])
        ->assertSessionHasNoErrors();

    $firstPath = (string) $user->fresh()->profile?->avatar_path;

    $this->actingAs($user)
        ->post(route('profile.avatar.store'), [
            'avatar' => UploadedFile::fake()->image('second.png'),
        ])
        ->assertSessionHasNoErrors();

    $secondPath = (string) $user->fresh()->profile?->avatar_path;

    expect($secondPath)->not->toBe($firstPath);

    Storage::disk('local')->assertMissing($firstPath);
    Storage::disk('local')->assertExists($secondPath);

    $this->assertDatabaseCount('user_profiles', 1);
});

test('owner can retrieve their private avatar', function () {
    Storage::fake('local');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar.store'), [
            'avatar' => UploadedFile::fake()->image('avatar.png'),
        ])
        ->assertSessionHasNoErrors();

    $response = $this->actingAs($user)
        ->get(route('profile.avatar.show'))
        ->assertOk()
        ->assertHeader('X-Content-Type-Options', 'nosniff');

    $cacheControl = (string) $response->headers->get('Cache-Control');

    $directives = array_map(
        'trim',
        explode(',', $cacheControl)
    );

    expect($directives)
        ->toContain('private')
        ->toContain('no-store')
        ->toContain('max-age=0');
});

test('another user cannot retrieve or remove the owners avatar', function () {
    Storage::fake('local');

    $owner = User::factory()->create();
    $otherUser = User::factory()->create();

    $this->actingAs($owner)
        ->post(route('profile.avatar.store'), [
            'avatar' => UploadedFile::fake()->image('avatar.png'),
        ])
        ->assertSessionHasNoErrors();

    $path = (string) $owner->fresh()->profile?->avatar_path;

    $this->actingAs($otherUser)
        ->get(route('profile.avatar.show'))
        ->assertNotFound();

    $this->actingAs($otherUser)
        ->delete(route('profile.avatar.destroy'))
        ->assertRedirect(route('profile.edit'));

    Storage::disk('local')->assertExists($path);

    expect($owner->fresh()->profile?->avatar_path)
        ->toBe($path);
});

test('owner can remove their private avatar', function () {
    Storage::fake('local');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar.store'), [
            'avatar' => UploadedFile::fake()->image('avatar.png'),
        ])
        ->assertSessionHasNoErrors();

    $path = (string) $user->fresh()->profile?->avatar_path;

    $this->actingAs($user)
        ->delete(route('profile.avatar.destroy'))
        ->assertRedirect(route('profile.edit'));

    Storage::disk('local')->assertMissing($path);

    expect($user->fresh()->profile?->avatar_path)
        ->toBeNull();
});

test('removing an avatar twice is safe', function () {
    Storage::fake('local');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->delete(route('profile.avatar.destroy'))
        ->assertRedirect(route('profile.edit'));

    $this->actingAs($user)
        ->delete(route('profile.avatar.destroy'))
        ->assertRedirect(route('profile.edit'));
});

test('guests cannot retrieve or remove private avatars', function () {
    $this->get(route('profile.avatar.show'))
        ->assertRedirect(route('login'));

    $this->delete(route('profile.avatar.destroy'))
        ->assertRedirect(route('login'));
});

test('suspended users cannot access avatar endpoints', function () {
    Storage::fake('local');

    $user = User::factory()->create();

    $path = 'profile-avatars/existing.png';

    Storage::disk('local')->put($path, 'test-image');

    $profile = $user->profile()->create([]);

    $profile->avatar_path = $path;
    $profile->save();

    $user->forceFill([
        'account_status' => 'suspended',
    ])->save();

    $this->actingAs($user)
        ->get(route('profile.avatar.show'))
        ->assertForbidden();

    $this->actingAs($user)
        ->post(route('profile.avatar.store'), [
            'avatar' => UploadedFile::fake()->image('new.png'),
        ])
        ->assertForbidden();

    $this->actingAs($user)
        ->delete(route('profile.avatar.destroy'))
        ->assertForbidden();

    Storage::disk('local')->assertExists($path);

    expect($user->fresh()->profile?->avatar_path)
        ->toBe($path);
});

test('deleting an account removes its private avatar', function () {
    Storage::fake('local');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar.store'), [
            'avatar' => UploadedFile::fake()->image('avatar.png'),
        ])
        ->assertSessionHasNoErrors();

    $path = (string) $user->fresh()->profile?->avatar_path;

    Storage::disk('local')->assertExists($path);

    $this->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    Storage::disk('local')->assertMissing($path);

    $this->assertDatabaseMissing('user_profiles', [
        'user_id' => $user->id,
    ]);

    $this->assertDatabaseMissing('users', [
        'id' => $user->id,
    ]);

    $this->assertGuest();
});

test('incorrect password preserves the account avatar', function () {
    Storage::fake('local');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.avatar.store'), [
            'avatar' => UploadedFile::fake()->image('avatar.png'),
        ])
        ->assertSessionHasNoErrors();

    $path = (string) $user->fresh()->profile?->avatar_path;

    $this->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ])
        ->assertSessionHasErrors('password');

    Storage::disk('local')->assertExists($path);

    expect($user->fresh()->profile?->avatar_path)
        ->toBe($path);
});
