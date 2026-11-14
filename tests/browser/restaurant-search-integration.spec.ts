import { expect, test } from '@playwright/test';

test('search filters restaurants by name', async ({ page }) => {
    await page.goto('/');

    const search = page.getByRole('searchbox', {
        name: 'Search restaurants or cuisines',
    });

    await search.fill('shawarma');
    await search.press('Enter');

    await expect(page.getByText('Demo Shawarma House')).toBeVisible();

    await expect(page.getByText('Demo Indian Table')).toHaveCount(0);
});

test('search matches cuisines regardless of case', async ({ page }) => {
    await page.goto('/');

    const search = page.getByRole('searchbox', {
        name: 'Search restaurants or cuisines',
    });

    await search.fill('INDIAN');
    await search.press('Enter');

    await expect(page.getByText('Demo Indian Table')).toBeVisible();

    await expect(page.getByText('Demo Shawarma House')).toHaveCount(0);
});

test('clearing search restores all demo restaurants', async ({ page }) => {
    await page.goto('/');

    const search = page.getByRole('searchbox', {
        name: 'Search restaurants or cuisines',
    });

    await search.fill('shawarma');
    await search.press('Enter');

    await expect(page.getByText('Demo Shawarma House')).toBeVisible();

    await page.getByRole('button', { name: 'Clear search' }).click();

    await expect(search).toHaveValue('');

    for (const restaurant of [
        'Demo Filipino Kitchen',
        'Demo Shawarma House',
        'Demo Indian Table',
    ]) {
        await expect(page.getByText(restaurant)).toBeVisible();
    }
});

test('clear remains available after manually deleting the query', async ({
    page,
}) => {
    await page.goto('/');

    const search = page.getByRole('searchbox', {
        name: 'Search restaurants or cuisines',
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

test('search combines with halal status filters', async ({ page }) => {
    await page.goto('/');

    const search = page.getByRole('searchbox', {
        name: 'Search restaurants or cuisines',
    });

    await search.fill('Indian');
    await search.press('Enter');

    await expect(page.getByText('Demo Indian Table')).toBeVisible();

    await page
        .getByRole('checkbox', {
            name: 'Unknown status',
            exact: true,
        })
        .check();

    await expect(page.getByText('Demo Indian Table')).toBeVisible();

    await expect(page.getByText('Demo Filipino Kitchen')).toHaveCount(0);
});

test('clearing search preserves halal status filters', async ({ page }) => {
    await page.goto('/');

    await page
        .getByRole('checkbox', {
            name: 'Unknown status',
            exact: true,
        })
        .check();

    const search = page.getByRole('searchbox', {
        name: 'Search restaurants or cuisines',
    });

    await search.fill('Indian');
    await search.press('Enter');

    await page
        .getByRole('button', {
            name: 'Clear search',
        })
        .click();

    await expect(page.getByText('Demo Indian Table')).toBeVisible();

    await expect(page.getByText('Demo Shawarma House')).toBeVisible();

    await expect(page.getByText('Demo Filipino Kitchen')).toHaveCount(0);
});
