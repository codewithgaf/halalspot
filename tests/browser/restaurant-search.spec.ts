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

for (const width of [320, 390, 768, 1280]) {
    test(`search controls fit at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/');

        const search = page.getByRole('search');
        const location = page.getByRole('button', { name: 'Set location' });
        const searchBounds = await search.boundingBox();
        const locationBounds = await location.boundingBox();
        expect(searchBounds).not.toBeNull();
        expect(locationBounds).not.toBeNull();
        expect(searchBounds!.width).toBeGreaterThan(150);
        expect(locationBounds!.height).toBe(searchBounds!.height);
        expect(locationBounds!.y).toBeCloseTo(searchBounds!.y, 1);
        expect(locationBounds!.x).toBeGreaterThanOrEqual(
            searchBounds!.x + searchBounds!.width,
        );
        expect(searchBounds!.x).toBeGreaterThanOrEqual(0);
        expect(locationBounds!.x + locationBounds!.width).toBeLessThanOrEqual(
            width,
        );

        await location.click();
        const panel = page.getByRole('region', { name: 'Location options' });
        await expect(panel).toBeVisible();
        const panelBounds = await panel.boundingBox();
        expect(panelBounds!.x).toBeGreaterThanOrEqual(0);
        expect(panelBounds!.x + panelBounds!.width).toBeLessThanOrEqual(width);
        expect(
            await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width);

        await page.keyboard.press('Escape');
        await expect(panel).toBeHidden();
        await expect(location).toBeFocused();

        await location.click();
        await page.getByRole('heading', { level: 1 }).click();
        await expect(panel).toBeHidden();
    });
}

test('location applies a city and radius and discards unapplied changes', async ({
    page,
}) => {
    await page.goto('/');
    const trigger = page.getByRole('button', {
        name: /^(Set location|.+, within \d+ km)$/,
    });
    await trigger.click();

    const city = page.getByRole('textbox', {
        name: 'City or area',
        exact: true,
    });
    const radius = page.getByRole('slider', { name: 'Search radius' });
    const apply = page.getByRole('button', { name: 'Apply location' });
    await expect(apply).toBeDisabled();
    await city.fill('   ');
    await expect(apply).toBeDisabled();
    await city.fill('  Manila  ');
    await radius.focus();
    await page.keyboard.press('Home');
    await expect(radius).toHaveAttribute('aria-valuetext', '1 kilometer');
    await page.keyboard.press('ArrowRight');
    await expect(radius).toHaveAttribute('aria-valuetext', '2 kilometers');
    await apply.click();

    await expect(
        page.getByRole('region', { name: 'Location options' }),
    ).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('title', 'Manila, within 2 km');
    await trigger.click();
    await expect(city).toHaveValue('Manila');
    await expect(radius).toHaveValue('2');
    await city.fill('Cebu');
    await page.keyboard.press('Escape');
    await trigger.click();
    await expect(city).toHaveValue('Manila');
});

test('current location can be selected and applied', async ({
    page,
    context,
}) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 14.5995, longitude: 120.9842 });
    await page.goto('/');
    const trigger = page.getByRole('button', {
        name: /^(Set location|.+, within \d+ km)$/,
    });
    await trigger.click();
    await page.getByRole('button', { name: 'Use my current location' }).click();
    await expect(
        page.getByText('Current location selected.', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Apply location' }).click();
    await expect(trigger).toHaveAttribute(
        'title',
        'Current location, within 10 km',
    );
    await trigger.click();
    await expect(
        page.getByText('Current location selected.', { exact: true }),
    ).toBeVisible();
    await page
        .getByRole('textbox', { name: 'City or area', exact: true })
        .fill('Manila');
    await expect(
        page.getByText('Current location selected.', { exact: true }),
    ).toBeHidden();
});

test('location permission errors allow city entry', async ({ page }) => {
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'geolocation', {
            value: {
                getCurrentPosition: (
                    _success: unknown,
                    failure: (error: { code: number }) => void,
                ) => failure({ code: 1 }),
            },
        });
    });
    await page.goto('/');
    await page
        .getByRole('button', { name: 'Set location', exact: true })
        .click();
    await page.getByRole('button', { name: 'Use my current location' }).click();
    await expect(page.getByRole('alert')).toContainText(
        'Location access was denied',
    );
    await page
        .getByRole('textbox', { name: 'City or area', exact: true })
        .fill('Manila');
    await expect(
        page.getByRole('button', { name: 'Apply location' }),
    ).toBeEnabled();
});
