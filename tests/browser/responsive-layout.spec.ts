import { expect, test } from '@playwright/test';

const viewports = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
];

for (const viewport of viewports) {
    test(`homepage fits ${viewport.name} viewport`, async ({ page }) => {
        await page.setViewportSize({
            width: viewport.width,
            height: viewport.height,
        });

        await page.goto('/');

        await expect(
            page.getByRole('heading', {
                name: 'Find your next halal spot.',
            }),
        ).toBeVisible();

        const hasHorizontalOverflow = await page.evaluate(() => {
            return (
                document.documentElement.scrollWidth >
                document.documentElement.clientWidth
            );
        });

        expect(hasHorizontalOverflow).toBe(false);
    });
}
