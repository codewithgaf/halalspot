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

    await expect(navigation.getByRole('link', { name: 'Home' })).toBeVisible();

    await expect(
        navigation.getByRole('link', { name: 'Log in' }),
    ).toBeVisible();

    await expect(
        navigation.getByRole('link', { name: 'Register' }),
    ).toBeVisible();

    await expect(
        page.getByRole('button', {
            name: 'Open navigation menu',
        }),
    ).toBeHidden();
});
