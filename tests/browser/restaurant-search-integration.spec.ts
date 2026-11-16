import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('search filters published restaurants by name', async ({ page }) => {
    const search = page.getByRole('searchbox', {
        name: 'Search restaurants or cities',
    });

    await search.fill('shawarma');
    await search.press('Enter');

    await expect(page.getByText('Demo Shawarma House')).toBeVisible();
    await expect(page.getByText('Demo Indian Table')).toHaveCount(0);
    await expect(page.getByText('Demo Filipino Kitchen')).toHaveCount(0);
});

test('search matches restaurant names regardless of case', async ({ page }) => {
    const search = page.getByRole('searchbox', {
        name: 'Search restaurants or cities',
    });

    await search.fill('INDIAN');
    await search.press('Enter');

    await expect(page.getByText('Demo Indian Table')).toBeVisible();
    await expect(page.getByText('Demo Shawarma House')).toHaveCount(0);
});

test('search filters published restaurants by city', async ({ page }) => {
    const search = page.getByRole('searchbox', {
        name: 'Search restaurants or cities',
    });

    await search.fill('Davao City');
    await search.press('Enter');

    await expect(page.getByText('Demo Indian Table')).toBeVisible();
    await expect(page.getByText('Demo Filipino Kitchen')).toHaveCount(0);
    await expect(page.getByText('Demo Shawarma House')).toHaveCount(0);
});

test('search never exposes draft or archived restaurants', async ({ page }) => {
    const search = page.getByRole('searchbox', {
        name: 'Search restaurants or cities',
    });

    await search.fill('Restaurant');
    await search.press('Enter');

    await expect(page.getByText('Draft Restaurant')).toHaveCount(0);
    await expect(page.getByText('Archived Restaurant')).toHaveCount(0);

    await expect(page.getByText('No restaurants found')).toBeVisible();
});

test('clearing search restores published restaurants', async ({ page }) => {
    const search = page.getByRole('searchbox', {
        name: 'Search restaurants or cities',
    });

    await search.fill('shawarma');
    await search.press('Enter');

    await expect(page.getByText('Demo Shawarma House')).toBeVisible();

    await page.getByRole('button', { name: 'Clear search' }).click();

    await expect(search).toHaveValue('');

    for (const name of [
        'Demo Filipino Kitchen',
        'Demo Indian Table',
        'Demo Shawarma House',
    ]) {
        await expect(page.getByText(name)).toBeVisible();
    }
});

test('clear remains available after deleting search input', async ({
    page,
}) => {
    const search = page.getByRole('searchbox', {
        name: 'Search restaurants or cities',
    });

    await search.fill('shawarma');
    await search.press('Enter');

    await search.clear();

    await expect(
        page.getByRole('button', { name: 'Clear search' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Clear search' }).click();

    await expect(page.getByText('Demo Indian Table')).toBeVisible();
});

test('search with no matches shows an empty state', async ({ page }) => {
    const search = page.getByRole('searchbox', {
        name: 'Search restaurants or cities',
    });

    await search.fill('Nonexistent Restaurant');
    await search.press('Enter');

    await expect(page.getByText('No restaurants found')).toBeVisible();
    await expect(page.getByText('0 restaurants found')).toBeVisible();
});
