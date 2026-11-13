import { expect, test } from '@playwright/test';

test('search input is accessible and visible', async ({ page }) => {
    await page.goto('/');

    await expect(
        page.getByRole('searchbox', {
            name: 'Search restaurants, dishes, or cuisines',
        }),
    ).toBeVisible();
});

test('search button requires a non-empty query', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByRole('searchbox', {
        name: 'Search restaurants, dishes, or cuisines',
    });
    const searchButton = page.getByRole('button', {
        name: 'Search',
        exact: true,
    });

    await expect(searchButton).toBeDisabled();

    await searchInput.fill('   ');
    await expect(searchButton).toBeDisabled();

    await searchInput.fill('Chicken biryani');
    await expect(searchButton).toBeEnabled();

    await searchInput.clear();
    await expect(searchButton).toBeDisabled();
});

test('submitting a query keeps the user on the homepage', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByRole('searchbox', {
        name: 'Search restaurants, dishes, or cuisines',
    });

    await searchInput.fill('Chicken biryani');
    await searchInput.press('Enter');

    await expect(page).toHaveURL('/');

    await expect(searchInput).toHaveValue('Chicken biryani');
});
