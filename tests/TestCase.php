<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }

    /**
     * @return array<string, mixed>
     */
    protected function setUpTraits()
    {
        $this->assertSafeTestingDatabase();

        return parent::setUpTraits();
    }

    protected function assertSafeTestingDatabase(): void
    {
        if (! app()->environment('testing')) {
            throw new \RuntimeException(
                'Database tests require the testing environment.'
            );
        }

        $connections = property_exists($this, 'connectionsToTransact') ? $this->connectionsToTransact : [null];

        if ($connections !== [null]) {
            throw new \RuntimeException(
                'Database tests may transact only the default connection.'
            );
        }

        $connection = config('database.default');

        if ($connection === 'sqlite') {
            if (config('database.connections.sqlite.database') !== ':memory:') {
                throw new \RuntimeException(
                    'SQLite tests must use an in-memory database.'
                );
            }

            return;
        }

        if ($connection !== 'pgsql') {
            throw new \RuntimeException(
                'Unsupported database driver for automated tests.'
            );
        }

        $database = config('database.connections.pgsql.database');
        $username = config('database.connections.pgsql.username');

        if (
            $database !== 'halalspot_testing_clean'
            || $username !== 'halalspot_testing_user'
        ) {
            throw new \RuntimeException(
                'Unsafe PostgreSQL testing database configuration.'
            );
        }

        $identity = DB::connection('pgsql')
            ->selectOne(
                'SELECT current_database() AS database, current_user AS username'
            );

        if (
            $identity->database !== 'halalspot_testing_clean'
            || $identity->username !== 'halalspot_testing_user'
        ) {
            throw new \RuntimeException(
                'Unsafe PostgreSQL connection identity.'
            );
        }
    }
}
