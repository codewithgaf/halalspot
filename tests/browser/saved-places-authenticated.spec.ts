import { expect, test } from '@playwright/test';

test('verified user can save and unsave a restaurant', async ({ page }) => {
    // 1. Authenticate through the real login page.
    await page.goto('/login');

    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('saved-places-user@example.test');

    await page
        .getByLabel('Password', { exact: true })
        .fill('playwright-test-only-2026');

    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/dashboard(?:[?#]|$)/);

    // 2. Visit the restaurant discovery page.
    await page.goto('/');

    const results = page.getByRole('region', {
        name: 'Restaurant results',
    });

    const saveButton = results.getByRole('button', {
        name: 'Save Demo Filipino Kitchen',
    });

    await expect(saveButton).toBeEnabled();
    await expect(saveButton).toHaveAttribute('aria-pressed', 'false');

    // 3. Save the restaurant.
    await saveButton.click();

    const unsaveButton = results.getByRole('button', {
        name: 'Unsave Demo Filipino Kitchen',
    });

    await expect(unsaveButton).toHaveAttribute('aria-pressed', 'true');

    // 4. Reload to verify server-side persistence.
    await page.reload();

    await expect(unsaveButton).toBeEnabled();

    await page.getByRole('button', { name: 'Open saved places' }).click();

    const panel = page.getByRole('complementary', {
        name: 'Saved places',
    });

    await expect(
        panel.getByText('1 saved restaurant', { exact: true }),
    ).toBeVisible();

    await expect(
        panel.getByRole('link', {
            name: /Demo Filipino Kitchen/,
        }),
    ).toBeVisible();

    // 5. Close the panel and unsave without confirmation.
    await panel
        .getByRole('button', {
            name: 'Close saved places panel',
        })
        .click();

    await unsaveButton.click();

    await expect(saveButton).toHaveAttribute('aria-pressed', 'false');

    // 6. Verify the restaurant remains unsaved after reload.
    await page.reload();

    await expect(saveButton).toBeEnabled();

    await page.getByRole('button', { name: 'Open saved places' }).click();

    await expect(
        panel.getByText('0 saved restaurants', { exact: true }),
    ).toBeVisible();

    await expect(
        panel.getByRole('heading', {
            name: 'No saved places yet',
        }),
    ).toBeVisible();
});
