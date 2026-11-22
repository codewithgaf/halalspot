import { expect, test } from '@playwright/test';

test('user can upload, replace, and remove a private avatar', async ({
    page,
}) => {
    // Valid 2x2 PNG images used only for testing.
    const firstPhoto = {
        name: 'first.png',
        mimeType: 'image/png',
        buffer: Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR4nGP8z8Dwn4GBgYGJAQoAHxcCAk+Uzr4AAAAASUVORK5CYII=',
            'base64',
        ),
    };

    const secondPhoto = {
        name: 'second.png',
        mimeType: 'image/png',
        buffer: Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR4nGNk2MLwn4GBgYGJAQoAGWgBt13hwL4AAAAASUVORK5CYII=',
            'base64',
        ),
    };

    // Log in using the isolated E2E test account.
    await page.goto('/login');

    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('saved-places-user@example.test');

    await page
        .getByLabel('Password', { exact: true })
        .fill('playwright-test-only-2026');

    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/dashboard(?:[?#]|$)/);

    // 1. Verify the default avatar.
    await page.goto('/settings/profile');

    const avatar = page.getByRole('img', {
        name: 'Your profile photo',
    });

    await expect(page.getByText('ES', { exact: true })).toBeVisible();

    // 2. Upload the first photo.
    await page.getByLabel('Choose a photo').setInputFiles(firstPhoto);

    await expect(avatar).toBeVisible();

    await page.getByRole('button', { name: 'Save photo' }).click();

    await expect(
        page.getByRole('button', { name: 'Remove saved photo' }),
    ).toBeVisible();

    await expect(avatar).toHaveAttribute(
        'src',
        /\/settings\/profile\/avatar\?v=/,
    );

    await expect(avatar).toHaveJSProperty('naturalWidth', 2);

    const firstSrc = await avatar.getAttribute('src');

    // 3. Verify persistence after refresh.
    await page.reload();

    await expect(avatar).toHaveAttribute('src', firstSrc!);
    await expect(avatar).toHaveJSProperty('naturalWidth', 2);

    // 4. Replace the photo.
    await page.getByLabel('Choose a photo').setInputFiles(secondPhoto);

    await page.getByRole('button', { name: 'Save photo' }).click();

    await expect(avatar).toHaveAttribute(
        'src',
        /\/settings\/profile\/avatar\?v=/,
    );

    await expect(avatar).not.toHaveAttribute('src', firstSrc!);

    const secondSrc = await avatar.getAttribute('src');

    await page.reload();

    await expect(avatar).toHaveAttribute('src', secondSrc!);
    await expect(avatar).toHaveJSProperty('naturalWidth', 2);

    // 5. Remove the saved photo.
    await page.getByRole('button', { name: 'Remove saved photo' }).click();

    await expect(avatar).toHaveCount(0);
    await expect(page.getByText('ES', { exact: true })).toBeVisible();

    // 6. Confirm removal persists.
    await page.reload();

    await expect(avatar).toHaveCount(0);
    await expect(page.getByText('ES', { exact: true })).toBeVisible();
});
