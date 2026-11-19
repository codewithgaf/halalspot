import { expect, test } from '@playwright/test';

test.describe('Saved Places floating panel — guest', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('opens, displays guest actions, and closes', async ({ page }) => {
        const openButton = page.getByRole('button', {
            name: 'Open saved places',
        });

        const panel = page.getByRole('complementary', {
            name: 'Saved places',
        });

        await expect(openButton).toBeVisible();
        await expect(panel).toHaveCount(0);

        await openButton.click();

        await expect(panel).toBeVisible();

        await expect(
            panel.getByRole('heading', {
                name: 'Saved places',
            }),
        ).toBeVisible();

        await expect(
            panel.getByRole('link', {
                name: 'Sign in',
            }),
        ).toBeVisible();

        await expect(
            panel.getByRole('link', {
                name: 'Create free account',
            }),
        ).toBeVisible();

        await panel
            .getByRole('button', {
                name: 'Close saved places panel',
            })
            .click();

        await expect(panel).toHaveCount(0);
        await expect(openButton).toBeFocused();
    });

    test('closes with Escape and restores focus', async ({ page }) => {
        const openButton = page.getByRole('button', {
            name: 'Open saved places',
        });

        const panel = page.getByRole('complementary', {
            name: 'Saved places',
        });

        await openButton.click();
        await expect(panel).toBeVisible();

        const closeButton = panel.getByRole('button', {
            name: 'Close saved places panel',
        });

        await expect(closeButton).toBeFocused();

        await page.keyboard.press('Escape');

        await expect(panel).toHaveCount(0);
        await expect(openButton).toBeFocused();
    });

    test('closes when clicking outside the panel', async ({ page }) => {
        const openButton = page.getByRole('button', {
            name: 'Open saved places',
        });

        const panel = page.getByRole('complementary', {
            name: 'Saved places',
        });

        await openButton.click();
        await expect(panel).toBeVisible();

        // Click near the top-left corner, outside the panel.
        await page.mouse.click(1, 1);

        await expect(panel).toHaveCount(0);
    });

    test('fits within a mobile viewport', async ({ page }) => {
        await page.setViewportSize({
            width: 375,
            height: 667,
        });

        await page
            .getByRole('button', {
                name: 'Open saved places',
            })
            .click();

        const panel = page.getByRole('complementary', {
            name: 'Saved places',
        });

        await expect(panel).toBeVisible();

        const bounds = await panel.boundingBox();

        expect(bounds).not.toBeNull();

        if (!bounds) {
            return;
        }

        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(376);
    });
});
