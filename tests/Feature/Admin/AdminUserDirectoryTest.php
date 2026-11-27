<?php

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Fortify;
use PragmaRX\Google2FA\Google2FA;

uses(RefreshDatabase::class);
beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

function loginAdminWithMfa(User $admin): void
{
    $test = test();

    app(EnableTwoFactorAuthentication::class)($admin);

    $admin->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

    $test->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect('/two-factor-challenge');

    $secret = Fortify::currentEncrypter()
        ->decrypt($admin->fresh()->two_factor_secret);

    $code = app(Google2FA::class)
        ->getCurrentOtp($secret);

    $test->post('/two-factor-challenge', [
        'code' => $code,
    ])->assertRedirect();

    $test->assertAuthenticatedAs($admin);
}

it('prevents guests from viewing the admin user directory', function () {
    $this->get('/admin/users')
        ->assertRedirect(route('login'));
});

it('prevents ordinary users from viewing the admin directory', function () {
    $user = User::factory()->create();
    $user->assignRole('user');

    $this->actingAs($user)
        ->get('/admin/users')
        ->assertForbidden();
});

it('prevents moderators from viewing the admin directory', function () {
    $moderator = User::factory()->create();
    $moderator->assignRole('moderator');

    $this->actingAs($moderator)
        ->get('/admin/users')
        ->assertForbidden();
});

it('prevents administrators without MFA assurance from viewing the user directory', function () {
    $admin = User::factory()->create();

    $admin->assignRole('administrator');

    // actingAs() authenticates the user but does not
    // complete the Fortify MFA challenge.
    $this->actingAs($admin)
        ->get('/admin/users')
        ->assertForbidden();
});

it('allows administrators with valid MFA assurance to view the user directory', function () {
    $admin = User::factory()->create();

    $admin->assignRole('administrator');

    app(EnableTwoFactorAuthentication::class)($admin);

    $admin->forceFill([
        'two_factor_confirmed_at' => now(),
    ])->save();

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

    $this->get('/admin/users')
        ->assertOk();
});

it('filters directory users by name', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    User::factory()->create([
        'name' => 'Amina Hassan',
        'email' => 'amina@example.test',
    ]);

    User::factory()->create([
        'name' => 'Omar Rahman',
        'email' => 'omar@example.test',
    ]);

    loginAdminWithMfa($admin);

    $this->get('/admin/users?search=amina')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->has('users.data', 1)
            ->where('users.data.0.name', 'Amina Hassan')
        );
});

it('filters directory users by account status', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    $active = User::factory()->create([
        'name' => 'Active Member',
    ]);

    User::factory()->create([
        'name' => 'Suspended Member',
        'account_status' => 'suspended',
    ]);

    loginAdminWithMfa($admin);

    $this->get('/admin/users?status=suspended')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->has('users.data', 1)
            ->where(
                'users.data.0.account_status',
                'suspended'
            )
            ->where(
                'users.data.0.name',
                'Suspended Member'
            )
        );
});

it('filters directory users by role', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    $member = User::factory()->create([
        'name' => 'Amina Hassan',
    ]);
    $member->assignRole('user');

    $moderator = User::factory()->create([
        'name' => 'Fatimah Ali',
    ]);
    $moderator->assignRole('moderator');

    loginAdminWithMfa($admin);

    $this->get('/admin/users?role=moderator')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->has('users.data', 1)
            ->where('users.data.0.id', $moderator->id)
            ->where('users.data.0.name', 'Fatimah Ali')
            ->where('users.data.0.roles', ['moderator'])
            ->where('filters.role', 'moderator')
        );
});

it('rejects invalid account status filters', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    loginAdminWithMfa($admin);

    $this->get('/admin/users?status=deleted')
        ->assertSessionHasErrors('status');
});

it('paginates directory users with 15 records per page', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    User::factory()->count(20)->create();

    loginAdminWithMfa($admin);

    $this->get('/admin/users')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->has('users.data', 15)
            ->where('users.current_page', 1)
            ->where('users.per_page', 15)
            ->where('users.total', 21)
            ->where('users.last_page', 2)
        );

    $this->get('/admin/users?page=2')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->has('users.data', 6)
            ->where('users.current_page', 2)
            ->where('users.total', 21)
        );
});

it('preserves search and status filters in pagination links', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    User::factory()->count(18)->create([
        'name' => 'Amina Example',
        'account_status' => 'active',
    ]);

    User::factory()->create([
        'name' => 'Unrelated User',
        'account_status' => 'suspended',
    ]);

    loginAdminWithMfa($admin);

    $this->get('/admin/users?search=amina&status=active')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->has('users.data', 15)
            ->where('users.total', 18)
            ->where('users.last_page', 2)
            ->where('filters.search', 'amina')
            ->where('filters.status', 'active')
            ->where('users.current_page', 1)
        );

    $this->get('/admin/users?search=amina&status=active&page=2')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->has('users.data', 3)
            ->where('users.current_page', 2)
            ->where('users.total', 18)
        );
});

it('rejects invalid role filters', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    loginAdminWithMfa($admin);

    $this->get('/admin/users?role=superadmin')
        ->assertRedirect()
        ->assertSessionHasErrors('role');
});

it('shows unfiltered active account goal counts', function () {
    $admin = User::factory()->create();
    $admin->assignRole('administrator');

    User::factory()->count(2)->create(['account_status' => 'active', 'name' => 'Sample Active']);
    User::factory()->create(['account_status' => 'suspended', 'name' => 'Sample Suspended']);

    loginAdminWithMfa($admin);

    $this->get('/admin/users?search=Sample%20Suspended&status=suspended')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->where('users.total', 1)
            ->where('stats.totalAccounts', 4)
            ->where('stats.activeAccounts', 3)
            ->where('stats.suspendedAccounts', 1)
        );
});

it('does not expose global account metrics to guests', function () {
    $this->get('/admin/users')->assertRedirect(route('login'));
});
