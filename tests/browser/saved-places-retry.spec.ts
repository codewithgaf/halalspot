import { expect, test } from '@playwright/test';

test('saved places recovers after a temporary server error', async ({
    page,
}) => {
    await page.goto('/login');

    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('isolation-b@example.test');

    await page
        .getByLabel('Password', { exact: true })
        .fill('playwright-test-only-2026');

    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/dashboard(?:[?#]|$)/);

    // Simulate a failure on the first Saved Places request.
    let failFirstRequest = true;

    await page.route('**/saved-places', async (route) => {
        if (failFirstRequest) {
            failFirstRequest = false;
            await route.fulfill({
                status: 503,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Temporary outage' }),
            });
            return;
        }

        await route.continue();
    });

    await page.goto('/');

    await page
        .getByRole('button', {
            name: 'Open saved places',
        })
        .click();

    const panel = page.getByRole('complementary', {
        name: 'Saved places',
    });

    // User sees a useful error message.
    await expect(panel.getByRole('alert')).toContainText(
        'Unable to refresh saved places',
    );

    // User retries, and the real server responds.
    await panel
        .getByRole('button', {
            name: 'Try again',
        })
        .click();

    await expect(
        panel.getByRole('heading', {
            name: 'No saved places yet',
        }),
    ).toBeVisible();

    await expect(panel.getByRole('alert')).toHaveCount(0);
});
