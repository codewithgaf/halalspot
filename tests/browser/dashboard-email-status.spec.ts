import { expect, test } from '@playwright/test';

test('verified user sees email verification status on dashboard', async ({
    page,
}) => {
    // Arrange: Sign in using our isolated E2E verified account.
    await page.goto('/login');

    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('dashboard-user@example.test');

    await page
        .getByLabel('Password', { exact: true })
        .fill('playwright-test-only-2026');

    await page.getByRole('button', { name: 'Log in' }).click();

    // Assert: Authentication succeeded.
    await expect(page).toHaveURL(/\/dashboard(?:[?#]|$)/);

    // Assert: The dashboard identifies the verified email.
    await expect(
        page.getByText('Email verified', { exact: true }),
    ).toBeVisible();

    // Verify the component at mobile, tablet, and desktop widths.
    for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({
            width,
            height: 900,
        });

        const status = page.getByRole('region', {
            name: 'Email verification',
        });

        await expect(status).toBeVisible();

        await expect(
            status.getByText('Email verified', { exact: true }),
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
});

test('unverified user sees correct email status on dashboard', async ({
    page,
}) => {
    // Arrange: Sign in with an unverified E2E account.
    await page.goto('/login');

    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('unverified-user@example.test');

    await page
        .getByLabel('Password', { exact: true })
        .fill('playwright-test-only-2026');

    await page.getByRole('button', { name: 'Log in' }).click();

    // Unverified users retain dashboard access.
    await expect(page).toHaveURL(/\/dashboard(?:[?#]|$)/);

    // The correct verification state must be displayed.
    await expect(
        page.getByText('Email not verified', { exact: true }),
    ).toBeVisible();

    // Never incorrectly describe this account as verified.
    await expect(page.getByText('Email verified', { exact: true })).toHaveCount(
        0,
    );
});
