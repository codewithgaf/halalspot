import { expect, test } from '@playwright/test';

test('desktop navigation highlights the active page', async ({ page }) => {
    await page.setViewportSize({
        width: 1440,
        height: 900,
    });

    await page.goto('/');

    const navigation = page.getByRole('navigation', {
        name: 'Primary navigation',
    });

    const discoverLink = navigation.getByRole('link', {
        name: 'Discover',
    });

    const aboutLink = navigation.getByRole('link', {
        name: 'About',
    });

    await expect(discoverLink).toHaveAttribute('aria-current', 'page');

    await expect(aboutLink).not.toHaveAttribute('aria-current', 'page');

    await aboutLink.click();

    await expect(page).toHaveURL(/\/about$/);

    await expect(aboutLink).toHaveAttribute('aria-current', 'page');

    await expect(discoverLink).not.toHaveAttribute('aria-current', 'page');
});

test('mobile navigation highlights the active page', async ({ page }) => {
    await page.setViewportSize({
        width: 375,
        height: 812,
    });

    await page.goto('/');

    const menuButton = page.getByRole('button', {
        name: 'Open navigation menu',
    });

    await menuButton.click();

    const navigation = page.getByRole('navigation', {
        name: 'Mobile navigation',
    });

    const discoverLink = navigation.getByRole('link', {
        name: 'Discover',
    });

    await expect(discoverLink).toHaveAttribute('aria-current', 'page');

    await navigation
        .getByRole('link', {
            name: 'About',
        })
        .click();

    await expect(page).toHaveURL(/\/about$/);

    await menuButton.click();

    await expect(
        navigation.getByRole('link', { name: 'About' }),
    ).toHaveAttribute('aria-current', 'page');

    await expect(
        navigation.getByRole('link', { name: 'Discover' }),
    ).not.toHaveAttribute('aria-current', 'page');
});
