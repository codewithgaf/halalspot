<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Fortify;
use PragmaRX\Google2FA\Google2FA;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('admin dashboard displays accurate restaurant counts', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    app(EnableTwoFactorAuthentication::class)(
        $admin
    );

    $admin->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    // Complete the real Fortify login flow.
    $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    $secret = Fortify::currentEncrypter()
        ->decrypt($admin->fresh()->two_factor_secret);

    $code = app(Google2FA::class)
        ->getCurrentOtp($secret);

    $this->post('/two-factor-challenge', [
        'code' => $code,
    ])->assertRedirect();

    $this->assertAuthenticatedAs($admin);

    // Create six restaurants with known publication statuses.
    $statuses = [
        'draft',
        'draft',
        'published',
        'published',
        'published',
        'archived',
    ];

    foreach ($statuses as $index => $status) {
        DB::table('places')->insert([
            'name' => "Test Restaurant {$index}",
            'slug' => "test-restaurant-{$index}",
            'city' => 'Iligan City',
            'address' => 'Test Street, Iligan City',
            'latitude' => 8.2280000,
            'longitude' => 124.2450000,
            'publication_status' => $status,
            'published_at' => $status === 'published'
                ? now()
                : null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    $this->get('/admin')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('metrics.totalRestaurants', 6)
            ->where('metrics.publishedRestaurants', 3)
            ->where('metrics.draftRestaurants', 2)
            ->where('metrics.archivedRestaurants', 1)
        );
});
