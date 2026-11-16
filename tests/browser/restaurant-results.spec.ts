import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('homepage displays the three published E2E restaurants', async ({
    page,
}) => {
    const results = page.getByRole('region', {
        name: 'Restaurant results',
    });

    await expect(results.getByRole('article')).toHaveCount(3);

    await expect(results.getByText('3 restaurants found')).toBeVisible();

    for (const name of [
        'Demo Filipino Kitchen',
        'Demo Indian Table',
        'Demo Shawarma House',
    ]) {
        await expect(results.getByText(name)).toBeVisible();
    }
});

test('draft and archived restaurants are excluded from public discovery', async ({
    page,
}) => {
    await expect(page.getByText('Draft Restaurant')).toHaveCount(0);

    await expect(page.getByText('Archived Restaurant')).toHaveCount(0);
});

test('published restaurants do not imply halal certification', async ({
    page,
}) => {
    const results = page.getByRole('region', {
        name: 'Restaurant results',
    });

    await expect(results.getByText('Verified certification')).toHaveCount(0);

    await expect(results.getByText('Self-declared halal')).toHaveCount(0);
});

test('published restaurant cards remain visible on mobile', async ({
    page,
}) => {
    await page.setViewportSize({
        width: 390,
        height: 844,
    });

    const results = page.getByRole('region', {
        name: 'Restaurant results',
    });

    await expect(results.getByRole('article')).toHaveCount(3);

    const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
    );

    expect(hasHorizontalOverflow).toBe(false);
});
