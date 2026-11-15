
<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

it('allows assigning a role to a user', function () {
    $user = User::factory()->create();

    Role::findOrCreate('moderator', 'web');

    $user->assignRole('moderator');

    expect($user->hasRole('moderator'))->toBeTrue();
});

it('does not grant administrator privileges by default', function () {
    $user = User::factory()->create();

    Role::findOrCreate('administrator', 'web');

    expect($user->hasRole('administrator'))->toBeFalse();
});
