import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const cacheDir = resolve(projectRoot, 'playwright/.cache');
const database = resolve(cacheDir, 'database.sqlite');
const configCache = resolve(cacheDir, 'config.php');

if (existsSync(cacheDir) && lstatSync(cacheDir).isSymbolicLink()) {
    throw new Error('Refusing to use a symlinked E2E cache directory.');
}

mkdirSync(cacheDir, { recursive: true });

for (const path of [database, configCache]) {
    if (existsSync(path)) {
        if (!lstatSync(path).isFile()) {
            throw new Error(`Unsafe E2E file: ${path}`);
        }

        rmSync(path);
    }
}

const env = {
    ...process.env,
    APP_ENV: 'testing',
    DB_CONNECTION: 'sqlite',
    DB_DATABASE: database,
    DB_URL: '',
    APP_CONFIG_CACHE: configCache,
    SESSION_DRIVER: 'file',
    CACHE_STORE: 'array',
    QUEUE_CONNECTION: 'sync',
};

function artisan(args) {
    execFileSync('php', ['artisan', ...args], {
        cwd: projectRoot,
        env,
        stdio: 'inherit',
    });
}

console.log('Preparing isolated Playwright SQLite database...');

artisan(['migrate', '--force', '--no-interaction']);

artisan(['db:seed', '--class=E2ePlaceSeeder', '--force', '--no-interaction']);

artisan(['db:seed', '--class=E2eUserSeeder', '--force', '--no-interaction']);

console.log('E2E database prepared successfully.');
