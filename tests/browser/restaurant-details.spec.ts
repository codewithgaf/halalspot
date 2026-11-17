import { expect, test } from '@playwright/test';

test('guest can open a restaurant and return to discovery', async ({
    page,
}) => {
    await page.goto('/');

    const restaurant = page.getByText('Demo Filipino Kitchen', {
        exact: true,
    });

    await expect(restaurant).toBeVisible();

    await restaurant
        .locator('xpath=ancestor::article')
        .getByRole('link', { name: 'View details' })
        .click();

    await expect(page).toHaveURL(/\/restaurants\/e2e-filipino-kitchen$/);

    await expect(
        page.getByRole('heading', {
            name: 'Demo Filipino Kitchen',
            level: 1,
        }),
    ).toBeVisible();

    await page
        .getByRole('link', {
            name: 'Back to restaurants',
        })
        .click();

    await expect(page).toHaveURL('/');
});

test('guest cannot open an unknown restaurant', async ({ page }) => {
    const response = await page.goto(
        '/restaurants/this-restaurant-does-not-exist',
    );

    expect(response?.status()).toBe(404);
});
