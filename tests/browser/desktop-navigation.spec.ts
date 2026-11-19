import { expect, test } from '@playwright/test';

test.use({
    viewport: { width: 1440, height: 900 },
});

test('guest can access desktop navigation', async ({ page }) => {
    await page.goto('/');

    const navigation = page.getByRole('navigation', {
        name: 'Primary navigation',
    });

    await expect(navigation).toBeVisible();

    await expect(
        navigation.getByRole('link', { name: 'Discover' }),
    ).toBeVisible();

    await expect(navigation.getByRole('link', { name: 'About' })).toBeVisible();

    // Sign in belongs to the header actions,
    // not the primary navigation.
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();

    await expect(
        page.getByRole('button', {
            name: 'Open navigation menu',
        }),
    ).toBeHidden();
});
