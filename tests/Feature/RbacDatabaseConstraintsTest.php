
<?php

use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

it('creates the five required RBAC tables', function () {
    $tables = [
        'roles',
        'permissions',
        'model_has_roles',
        'model_has_permissions',
        'role_has_permissions',
    ];

    foreach ($tables as $table) {
        expect(Schema::hasTable($table))->toBeTrue();
    }
});

it('enforces unique role names within each guard', function () {
    DB::table('roles')->insert([
        'name' => 'moderator',
        'guard_name' => 'web',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    expect(fn () => DB::table('roles')->insert([
        'name' => 'moderator',
        'guard_name' => 'web',
        'created_at' => now(),
        'updated_at' => now(),
    ]))->toThrow(QueryException::class);
});
