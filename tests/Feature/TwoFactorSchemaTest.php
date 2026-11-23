<?php

use App\Models\User;
use Illuminate\Support\Facades\Schema;

test('users table has the required two-factor authentication columns', function () {
    expect(Schema::hasColumns('users', [
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ]))->toBeTrue();
});

test('new users have no two-factor authentication data by default', function () {
    $user = User::factory()->create();

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'two_factor_secret' => null,
        'two_factor_recovery_codes' => null,
        'two_factor_confirmed_at' => null,
    ]);
});

test('two-factor migration can be rolled back and reapplied', function () {
    $columns = [
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    $files = glob(database_path(
        'migrations/*_add_two_factor_authentication_columns_to_users_table.php'
    )) ?: [];

    expect($files)->toHaveCount(1);

    $migration = require $files[0];

    try {
        $migration->down();

        foreach ($columns as $column) {
            expect(Schema::hasColumn('users', $column))
                ->toBeFalse();
        }
    } finally {
        $migration->up();
    }

    expect(Schema::hasColumns('users', $columns))
        ->toBeTrue();
});
