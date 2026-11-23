import { expect, test } from '@playwright/test';

test('user can view their private saved restaurant collection', async ({
    page,
}) => {
    // 1. Sign in.
    await page.goto('/login');

    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('saved-page-user@example.test');

    await page
        .getByLabel('Password', { exact: true })
        .fill('playwright-test-only-2026');

    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/dashboard(?:[?#]|$)/);

    // 2. Verify the initial empty state.
    await page.goto('/account/saved-places');

    await expect(
        page.getByRole('heading', {
            name: 'My Saved Places',
            level: 1,
        }),
    ).toBeVisible();

    await expect(
        page.getByRole('heading', {
            name: 'No saved places yet',
        }),
    ).toBeVisible();

    await expect(
        page.getByText('0 restaurants', { exact: true }),
    ).toBeVisible();

    // 3. Save a restaurant through public discovery.
    await page.goto('/');

    const results = page.getByRole('region', {
        name: 'Restaurant results',
    });

    await results
        .getByRole('button', {
            name: 'Save Demo Filipino Kitchen',
        })
        .click();

    await expect(
        results.getByRole('button', {
            name: 'Unsave Demo Filipino Kitchen',
        }),
    ).toHaveAttribute('aria-pressed', 'true');

    // 4. Verify the new Saved Places page.
    await page.goto('/account/saved-places');

    await expect(page.getByText('1 restaurant', { exact: true })).toBeVisible();

    const restaurantLink = page.getByRole('link', {
        name: /Demo Filipino Kitchen/,
    });

    await expect(restaurantLink).toBeVisible();

    await expect(restaurantLink).toHaveAttribute(
        'href',
        '/restaurants/e2e-filipino-kitchen',
    );

    // 5. Verify persistence after refreshing.
    await page.reload();

    await expect(restaurantLink).toBeVisible();

    // 6. Check responsive widths.
    for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({
            width,
            height: 900,
        });

        await expect(restaurantLink).toBeVisible();

        const hasHorizontalOverflow = await page.evaluate(
            () =>
                document.documentElement.scrollWidth >
                document.documentElement.clientWidth,
        );

        expect(hasHorizontalOverflow, `Horizontal overflow at ${width}px`).toBe(
            false,
        );
    }

    // 7. Verify navigation to restaurant details.
    await restaurantLink.click();

    await expect(page).toHaveURL(/\/restaurants\/e2e-filipino-kitchen$/);
});
