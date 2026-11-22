import { expect, test } from '@playwright/test';

test('dashboard reflects saved places and works across screen sizes', async ({
    page,
}) => {
    // 1. Sign in with a dedicated E2E account.
    await page.goto('/login');

    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('dashboard-user@example.test');

    await page
        .getByLabel('Password', { exact: true })
        .fill('playwright-test-only-2026');

    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/dashboard(?:[?#]|$)/);

    const overview = page.getByRole('region', {
        name: 'Account overview',
    });

    // 2. New accounts start with no saved restaurants.
    await expect(
        page.getByRole('heading', { name: 'Your dashboard' }),
    ).toBeVisible();

    await expect(overview.getByText('0', { exact: true })).toBeVisible();

    await expect(
        page.getByRole('heading', { name: 'No saved places yet' }),
    ).toBeVisible();

    // 3. Save a published restaurant.
    await page
        .getByRole('link', {
            name: 'Explore restaurants',
        })
        .first()
        .click();

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

    // 4. The dashboard must reflect the database change.
    await page.goto('/dashboard');

    await expect(overview.getByText('1', { exact: true })).toBeVisible();

    const restaurantLink = page.getByRole('link', {
        name: /Demo Filipino Kitchen/,
    });

    await expect(restaurantLink).toHaveAttribute(
        'href',
        '/restaurants/e2e-filipino-kitchen',
    );

    // 5. Changes must persist after a full refresh.
    await page.reload();

    await expect(overview.getByText('1', { exact: true })).toBeVisible();

    await expect(restaurantLink).toBeVisible();

    // 6. Check responsive layouts.
    for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({
            width,
            height: 900,
        });

        await expect(
            page.getByRole('heading', { name: 'Your dashboard' }),
        ).toBeVisible();

        const hasHorizontalOverflow = await page.evaluate(
            () =>
                document.documentElement.scrollWidth >
                document.documentElement.clientWidth,
        );

        expect(hasHorizontalOverflow, `Horizontal overflow at ${width}px`).toBe(
            false,
        );
    }

    // 7. Restaurant details remain navigable.
    await restaurantLink.click();

    await expect(page).toHaveURL(/\/restaurants\/e2e-filipino-kitchen$/);
});
