import { expect, test } from '@playwright/test';

test('guest can open and close saved places', async ({ page }) => {
    await page.goto('/');

    const trigger = page.getByRole('button', {
        name: 'Open saved places',
    });

    await expect(trigger).toBeVisible();
    await trigger.click();

    const panel = page.getByRole('region', {
        name: 'Saved places',
    });

    // The component uses a named section landmark.
    await expect(panel).toBeVisible();
    await expect(panel.getByText('Save places you love')).toBeVisible();

    await expect(
        panel.getByRole('link', {
            name: 'Create free account',
        }),
    ).toHaveAttribute('href', '/register');

    await expect(panel.getByRole('link', { name: 'Sign in' })).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(panel).toBeHidden();

    await expect(
        page.getByRole('button', {
            name: 'Open saved places',
        }),
    ).toBeFocused();
});

for (const width of [320, 390, 768, 1280]) {
    test(`floating saved places fits at ${width}px`, async ({ page }) => {
        await page.setViewportSize({
            width,
            height: 700,
        });

        await page.goto('/');

        await page
            .getByRole('button', {
                name: 'Open saved places',
            })
            .click();

        const panel = page.getByRole('region', {
            name: 'Saved places',
        });

        await expect(panel).toBeVisible();

        const bounds = await panel.boundingBox();

        expect(bounds).not.toBeNull();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
        expect(bounds!.y).toBeGreaterThanOrEqual(0);
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(700);
    });
}

test('clicking outside closes saved places', async ({ page }) => {
    await page.goto('/');

    await page
        .getByRole('button', {
            name: 'Open saved places',
        })
        .click();

    const panel = page.getByRole('region', {
        name: 'Saved places',
    });

    await expect(panel).toBeVisible();

    await page.mouse.click(10, 100);

    await expect(panel).toBeHidden();
});
