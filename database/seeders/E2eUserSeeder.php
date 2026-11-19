<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class E2eUserSeeder extends Seeder
{
    public function run(): void
    {
        $expectedDatabase = base_path(
            'playwright/.cache/database.sqlite'
        );

        $actualDatabase = DB::connection()->getDatabaseName();

        if (
            ! app()->environment('testing') ||
            DB::getDefaultConnection() !== 'sqlite' ||
            realpath($actualDatabase) !== realpath($expectedDatabase)
        ) {
            throw new RuntimeException(
                'E2E users can only be seeded into the isolated Playwright database.'
            );
        }

        User::factory()->create([
            'name' => 'E2E Saved Places User',
            'email' => 'saved-places-user@example.test',
            'email_verified_at' => now(),
            'password' => Hash::make('playwright-test-only-2026'),
        ]);
    }
}
