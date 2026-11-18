import { expect, test } from '@playwright/test';

test('guest sees sign-in prompt when saving a restaurant', async ({ page }) => {
    await page.goto('/');

    const saveButton = page
        .getByRole('region', { name: 'Restaurant results' })
        .getByRole('button', { name: /^Save / })
        .first();

    const restaurantName = (
        await saveButton.getAttribute('aria-label')
    )?.replace(/^Save /, '');

    expect(restaurantName).toBeTruthy();

    await saveButton.click();

    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible();

    await expect(
        dialog.getByRole('heading', {
            name: 'Sign in to save this place',
        }),
    ).toBeVisible();

    await expect(
        dialog.getByText(restaurantName!, { exact: false }),
    ).toBeVisible();

    await expect(
        dialog.getByRole('link', { name: 'Create free account' }),
    ).toHaveAttribute('href', '/register');

    await expect(dialog.getByRole('link', { name: 'Sign in' })).toBeVisible();
});

test('guest can cancel saving a restaurant', async ({ page }) => {
    await page.goto('/');

    const saveButton = page
        .getByRole('region', { name: 'Restaurant results' })
        .getByRole('button', { name: /^Save / })
        .first();

    await saveButton.click();

    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(dialog).toBeHidden();
    await expect(saveButton).toBeFocused();
});

test('Escape closes the guest save dialog', async ({ page }) => {
    await page.goto('/');

    const saveButton = page
        .getByRole('region', { name: 'Restaurant results' })
        .getByRole('button', { name: /^Save / })
        .first();

    await saveButton.click();

    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(dialog).toBeHidden();
    await expect(saveButton).toBeFocused();
});

test('guest save prompt fits on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });

    await page.goto('/');

    await page
        .getByRole('region', { name: 'Restaurant results' })
        .getByRole('button', { name: /^Save / })
        .first()
        .click();

    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible();

    const bounds = await dialog.boundingBox();

    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(700);
});
