<?php

use App\Models\User;

test('authenticated user can search Philippine localities', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/settings/localities/search?q=Iligan')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.code', '1030900000')
        ->assertJsonPath('data.0.name', 'City of Iligan');
});

test('guest cannot search localities through the settings endpoint', function () {
    $this->getJson(route('localities.search', [
        'q' => 'Iligan',
    ]))->assertUnauthorized();
});

test('suspended user cannot search localities', function () {
    $user = User::factory()->create();

    $user->forceFill([
        'account_status' => 'suspended',
    ])->save();

    $this->actingAs($user)
        ->getJson(route('localities.search', [
            'q' => 'Iligan',
        ]))
        ->assertForbidden();
});

test('city search is case insensitive', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('localities.search', [
            'q' => 'iligan',
        ]))
        ->assertOk()
        ->assertJsonPath('data.0.code', '1030900000');
});

test('city search returns at most 10 suggestions', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->getJson(route('localities.search', [
            'q' => 'City',
        ]))
        ->assertOk();

    $response->assertJsonCount(10, 'data');
});

test('city search rejects queries shorter than 2 characters', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('localities.search', [
            'q' => 'I',
        ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('q');
});

test('location search includes municipalities', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('localities.search', [
            'q' => 'Adams',
        ]))
        ->assertOk()
        ->assertJsonFragment([
            'code' => '0102801000',
            'name' => 'Adams',
            'province' => 'Ilocos Norte',
        ]);
});

test('location search returns Tubod municipalities in different provinces', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('localities.search', [
            'q' => 'Tubod',
        ]))
        ->assertOk()
        ->assertJsonFragment([
            'code' => '1003522000',
            'name' => 'Tubod',
            'province' => 'Lanao del Norte',
        ])
        ->assertJsonFragment([
            'code' => '1606727000',
            'name' => 'Tubod',
            'province' => 'Surigao del Norte',
        ]);
});
