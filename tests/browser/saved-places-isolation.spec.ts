import { expect, test } from '@playwright/test';

test('switching accounts keeps saved places private', async ({ page }) => {
    async function signIn(email: string) {
        await page.goto('/login');
        await page.getByRole('textbox', { name: 'Email address' }).fill(email);
        await page
            .getByLabel('Password', { exact: true })
            .fill('playwright-test-only-2026');
        await page.getByRole('button', { name: 'Log in' }).click();
        await expect(page).toHaveURL(/\/dashboard(?:[?#]|$)/);
    }

    // User A saves a restaurant.
    await signIn('isolation-a@example.test');
    await page.goto('/');

    const results = page.getByRole('region', {
        name: 'Restaurant results',
    });

    await results
        .getByRole('button', {
            name: 'Save Demo Indian Table',
        })
        .click();

    await expect(
        results.getByRole('button', {
            name: 'Unsave Demo Indian Table',
        }),
    ).toHaveAttribute('aria-pressed', 'true');

    // Sign out through the real dashboard UI.
    await page.goto('/dashboard');
    await page.locator('[data-test="sidebar-menu-button"]').click();
    await page.locator('[data-test="logout-button"]').click();

    // User B signs in using the same browser.
    await signIn('isolation-b@example.test');
    await page.goto('/');

    await page
        .getByRole('button', {
            name: 'Open saved places',
        })
        .click();

    const panel = page.getByRole('complementary', {
        name: 'Saved places',
    });

    // User B must not see User A's collection.
    await expect(
        panel.getByRole('heading', {
            name: 'No saved places yet',
        }),
    ).toBeVisible();

    await expect(
        panel.getByRole('link', {
            name: /Demo Indian Table/,
        }),
    ).toHaveCount(0);
});
