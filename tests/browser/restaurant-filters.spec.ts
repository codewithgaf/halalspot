import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('unsupported cuisine filters are not displayed', async ({ page }) => {
    await expect(
        page.getByRole('button', {
            name: 'Filipino',
            exact: true,
        }),
    ).toHaveCount(0);

    await expect(
        page.getByRole('button', {
            name: 'Indian',
            exact: true,
        }),
    ).toHaveCount(0);
});

test('unsupported halal certification filters are not displayed', async ({
    page,
}) => {
    await expect(
        page.getByRole('checkbox', {
            name: 'Verified certification',
        }),
    ).toHaveCount(0);

    await expect(
        page.getByRole('checkbox', {
            name: 'Self-declared halal',
        }),
    ).toHaveCount(0);

    await expect(
        page.getByRole('checkbox', {
            name: 'Unknown status',
        }),
    ).toHaveCount(0);
});

test('public discovery remains available on mobile', async ({ page }) => {
    await page.setViewportSize({
        width: 320,
        height: 720,
    });

    await expect(
        page.getByRole('searchbox', {
            name: 'Search restaurants or cities',
        }),
    ).toBeVisible();

    await expect(
        page.getByRole('region', {
            name: 'Restaurant results',
        }),
    ).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
    );

    expect(hasHorizontalOverflow).toBe(false);
});
