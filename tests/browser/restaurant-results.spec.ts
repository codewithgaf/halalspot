import { expect, test } from '@playwright/test';

test('homepage displays three demo restaurants', async ({ page }) => {
    await page.goto('/');

    const results = page.getByRole('region', {
        name: 'Restaurant results',
    });

    await expect(results.getByRole('article')).toHaveCount(3);
    await expect(results.getByText('3 restaurants found')).toBeVisible();
});

test('unknown status filters restaurant results', async ({ page }) => {
    await page.goto('/');

    await page
        .getByRole('checkbox', {
            name: 'Unknown status',
        })
        .check();

    const results = page.getByRole('region', {
        name: 'Restaurant results',
    });

    await expect(results.getByRole('article')).toHaveCount(2);
    await expect(results.getByText('Demo Shawarma House')).toBeVisible();
    await expect(results.getByText('Demo Indian Table')).toBeVisible();
    await expect(results.getByText('Demo Filipino Kitchen')).toHaveCount(0);
});

test('verified certification shows empty results', async ({ page }) => {
    await page.goto('/');

    await page
        .getByRole('checkbox', {
            name: 'Verified certification',
        })
        .check();

    await expect(page.getByText('No restaurants found')).toBeVisible();
});

test('save buttons are visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const saveButtons = page.getByRole('button', {
        name: /^Save Demo/,
    });

    await expect(saveButtons).toHaveCount(3);

    for (const button of await saveButtons.all()) {
        await expect(button).toBeVisible();
    }
});
