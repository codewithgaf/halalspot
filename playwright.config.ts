import { defineConfig, devices } from '@playwright/test';

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
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
        },
        ...(!process.env.CI
            ? [
                  {
                      command:
                          'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
                      url: 'http://127.0.0.1:5173/@vite/client',
                      reuseExistingServer: true,
                      timeout: 120_000,
                  },
              ]
            : []),
    ],
});
