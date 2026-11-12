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

    webServer: {
        command: 'composer dev',
        url: 'http://127.0.0.1:8000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
