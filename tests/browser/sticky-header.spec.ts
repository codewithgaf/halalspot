import { expect, test } from '@playwright/test';

for (const width of [320, 390, 768, 1280]) {
    test(`header stays sticky at ${width}px`, async ({ page }) => {
        await page.setViewportSize({
            width,
            height: 700,
        });

        await page.goto('/');

        const header = page.locator('header').first();

        await expect(header).toBeVisible();

        // Scroll to the bottom of the homepage.
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });

        // Confirm that the page actually scrolled.
        await expect
            .poll(() => page.evaluate(() => window.scrollY))
            .toBeGreaterThan(0);

        // The header must remain at the top of the viewport.
        await expect
            .poll(() =>
                header.evaluate((element) =>
                    Math.round(element.getBoundingClientRect().top),
                ),
            )
            .toBe(0);

        const location = page.getByRole('button', {
            name: 'Set location',
            exact: true,
        });

        await location.click();

        const panel = page.getByRole('region', {
            name: 'Location options',
        });

        await expect(panel).toBeVisible();

        const bounds = await panel.boundingBox();

        expect(bounds).not.toBeNull();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);

        // Escape must close the popup and return focus.
        await page.keyboard.press('Escape');

        await expect(panel).toBeHidden();
        await expect(location).toBeFocused();
    });
}
