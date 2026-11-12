import { expect, test } from '@playwright/test';

test.use({
    viewport: { width: 375, height: 812 },
});

test('guest can open and close mobile navigation', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', {
        name: 'Open navigation menu',
    });

    await expect(menuButton).toBeVisible();

    await menuButton.click();

    const navigation = page.getByRole('navigation', {
        name: 'Mobile navigation',
    });

    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(
        navigation.getByRole('link', { name: 'Log in' }),
    ).toBeVisible();
    await expect(
        navigation.getByRole('link', { name: 'Register' }),
    ).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(navigation).not.toBeVisible();
});

test('mobile navigation supports keyboard interaction', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.getByRole('button', {
        name: 'Open navigation menu',
    });

    await menuButton.focus();
    await expect(menuButton).toBeFocused();

    await page.keyboard.press('Enter');

    const navigation = page.getByRole('navigation', {
        name: 'Mobile navigation',
    });

    await expect(navigation).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(navigation).not.toBeVisible();
    await expect(menuButton).toBeFocused();
});
