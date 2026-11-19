import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

export default defineConfig({
    testDir: './tests/browser',

    fullyParallel: true,

    reporter: 'list',

    use: {
        baseURL: 'http://127.0.0.1:8000',
        trace: 'on-first-retry',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    webServer: [
        {
            command: 'php artisan serve --host=127.0.0.1 --port=8000',
            url: 'http://127.0.0.1:8000',
            reuseExistingServer: false,
            timeout: 120_000,
            env: {
                APP_ENV: 'testing',
                DB_CONNECTION: 'sqlite',
                DB_DATABASE: resolve('playwright/.cache/database.sqlite'),
                DB_URL: '',
                APP_CONFIG_CACHE: resolve('playwright/.cache/config.php'),
                SESSION_DRIVER: 'file',
                CACHE_STORE: 'array',
                QUEUE_CONNECTION: 'sync',
            },
        },
        ...(!process.env.CI
            ? [
                  {
                      command:
                          'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
                      url: 'http://127.0.0.1:5173/@vite/client',
                      reuseExistingServer: false,
                      timeout: 120_000,
                  },
              ]
            : []),
    ],
});
