<?php

declare(strict_types=1);

require dirname(__DIR__) . '/vendor/autoload.php';

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

$expectedDatabase = 'halalspot_testing_clean';
$expectedUsername = 'halalspot_testing_user';

$fail = static function (string $reason): never {
    fwrite(STDERR, "PostgreSQL test safety check failed: {$reason}\n");

    exit(1);
};

if (getenv('APP_ENV') !== 'testing' && ($_ENV['APP_ENV'] ?? null) !== 'testing') {
    $fail('APP_ENV must be testing.');
}

$app = require dirname(__DIR__) . '/bootstrap/app.php';

$app->make(Kernel::class)->bootstrap();

if (! $app->environment('testing')) {
    $fail('Laravel is not running in the testing environment.');
}

if (config('database.default') !== 'pgsql') {
    $fail('The PostgreSQL test suite requires the pgsql driver.');
}

if (
    config('database.connections.pgsql.database') !== $expectedDatabase
    || config('database.connections.pgsql.username') !== $expectedUsername
) {
    $fail('Unexpected PostgreSQL database or username.');
}

try {
    $identity = DB::connection('pgsql')->selectOne(
        'SELECT current_database() AS database, current_user AS username'
    );
} catch (\Throwable $exception) {
    $fail('Cannot verify the PostgreSQL connection.');
}

if (
    $identity?->database !== $expectedDatabase
    || $identity?->username !== $expectedUsername
) {
    $fail('The connected PostgreSQL database identity is unsafe.');
}

\Illuminate\Foundation\Bootstrap\HandleExceptions::flushState();

fwrite(STDOUT, "PostgreSQL test safety check passed.\n");
