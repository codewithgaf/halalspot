import { expect, test } from '@playwright/test';

test('mobile account navigation uses bottom tabs without a drawer', async ({
    page,
}) => {
    await page.setViewportSize({
        width: 390,
        height: 844,
    });

    // Log in using our existing isolated E2E account.
    await page.goto('/login');

    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('dashboard-user@example.test');

    await page
        .getByLabel('Password', { exact: true })
        .fill('playwright-test-only-2026');

    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/dashboard(?:[?#]|$)/);

    // Mobile users should see persistent bottom navigation.
    const bottomNav = page.getByRole('navigation', {
        name: 'Account navigation',
    });

    await expect(bottomNav).toBeVisible();

    // All four tabs must lead to real pages.
    for (const [name, href] of [
        ['Explore', '/'],
        ['Home', '/dashboard'],
        ['Saved', '/account/saved-places'],
        ['Profile', '/settings/profile'],
    ]) {
        await expect(
            bottomNav.getByRole('link', {
                name,
                exact: true,
            }),
        ).toHaveAttribute('href', href);
    }

    // The active page must be identifiable.
    await expect(bottomNav.getByRole('link', { name: 'Home' })).toHaveAttribute(
        'aria-current',
        'page',
    );

    // Mobile must not show the old sidebar toggle.
    await expect(
        page.getByRole('button', {
            name: 'Toggle sidebar',
        }),
    ).toBeHidden();

    // Verify navigation to the private Saved Places page.
    await bottomNav.getByRole('link', { name: 'Saved' }).click();

    await expect(page).toHaveURL(/\/account\/saved-places$/);

    await expect(
        bottomNav.getByRole('link', { name: 'Saved' }),
    ).toHaveAttribute('aria-current', 'page');

    await expect(
        page.getByRole('heading', {
            name: 'My Saved Places',
            level: 1,
        }),
    ).toBeVisible();
});

test('account navigation adapts to mobile and desktop widths', async ({
    page,
}) => {
    await page.goto('/login');

    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('dashboard-user@example.test');

    await page
        .getByLabel('Password', { exact: true })
        .fill('playwright-test-only-2026');

    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/dashboard(?:[?#]|$)/);

    const bottomNav = page.getByRole('navigation', {
        name: 'Account navigation',
    });

    // Small mobile and regular mobile.
    for (const width of [320, 390]) {
        await page.setViewportSize({
            width,
            height: 844,
        });

        await expect(bottomNav).toBeVisible();
        await expect(bottomNav).toHaveCSS('position', 'fixed');

        const bounds = await bottomNav.boundingBox();

        expect(bounds).not.toBeNull();

        // Navigation stays attached to the viewport bottom.
        expect(Math.abs(bounds!.y + bounds!.height - 844)).toBeLessThanOrEqual(
            2,
        );

        const hasOverflow = await page.evaluate(
            () =>
                document.documentElement.scrollWidth >
                document.documentElement.clientWidth,
        );

        expect(hasOverflow, `Horizontal overflow at ${width}px`).toBe(false);
    }

    // Tablet and desktop use the existing sidebar.
    for (const width of [768, 1440]) {
        await page.setViewportSize({
            width,
            height: 900,
        });

        await expect(bottomNav).toBeHidden();

        const sidebar = page.locator('[data-sidebar="sidebar"]');

        await expect(sidebar).toBeVisible();

        await expect(
            sidebar.getByRole('link', {
                name: 'Saved Places',
                exact: true,
            }),
        ).toBeVisible();
    }
});

test('mobile bottom navigation does not cover the last dashboard content', async ({
    page,
}) => {
    await page.setViewportSize({
        width: 390,
        height: 844,
    });

    await page.goto('/login');

    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('dashboard-user@example.test');

    await page
        .getByLabel('Password', { exact: true })
        .fill('playwright-test-only-2026');

    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/dashboard(?:[?#]|$)/);

    const bottomNav = page.getByRole('navigation', {
        name: 'Account navigation',
    });

    const lastContent = page.getByText(
        'Only your published saved restaurants are shown here.',
        { exact: true },
    );

    // Scroll to the actual bottom of the page.
    await page.evaluate(() => {
        const root = document.scrollingElement;

        if (root) {
            root.scrollTop = root.scrollHeight;
        }
    });

    // Confirm we reached maximum scroll.
    await expect
        .poll(() =>
            page.evaluate(() => {
                const root = document.scrollingElement;

                if (!root) {
                    return Infinity;
                }

                return Math.abs(
                    root.scrollHeight - root.clientHeight - root.scrollTop,
                );
            }),
        )
        .toBeLessThanOrEqual(2);

    const navBox = await bottomNav.boundingBox();
    const contentBox = await lastContent.boundingBox();

    expect(navBox).not.toBeNull();
    expect(contentBox).not.toBeNull();

    // The final content must remain above the fixed bar.
    expect(contentBox!.y + contentBox!.height).toBeLessThanOrEqual(
        navBox!.y - 8,
    );
});

test('mobile account navigation cannot open the old sidebar drawer', async ({
    page,
}) => {
    await page.setViewportSize({
        width: 390,
        height: 844,
    });

    await page.goto('/login');

    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('dashboard-user@example.test');

    await page
        .getByLabel('Password', { exact: true })
        .fill('playwright-test-only-2026');

    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/dashboard(?:[?#]|$)/);

    const bottomNav = page.getByRole('navigation', {
        name: 'Account navigation',
    });

    await expect(bottomNav).toBeVisible();

    // Try the old sidebar keyboard shortcut.
    await page.keyboard.press('Control+b');

    // No mobile sidebar sheet should be mounted.
    await expect(
        page.locator('[data-sidebar="sidebar"][data-mobile="true"]'),
    ).toHaveCount(0);

    // The bottom navigation should remain usable.
    await expect(bottomNav).toBeVisible();

    await bottomNav.getByRole('link', { name: 'Profile' }).click();

    await expect(page).toHaveURL(/\/settings\/profile(?:[?#]|$)/);

    await expect(
        bottomNav.getByRole('link', { name: 'Profile' }),
    ).toHaveAttribute('aria-current', 'page');
});

test('mobile bottom navigation remains available on Explore', async ({
    page,
}) => {
    await page.setViewportSize({
        width: 390,
        height: 844,
    });

    await page.goto('/login');

    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('dashboard-user@example.test');

    await page
        .getByLabel('Password', { exact: true })
        .fill('playwright-test-only-2026');

    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/dashboard(?:[?#]|$)/);

    const bottomNav = page.getByRole('navigation', {
        name: 'Account navigation',
    });

    await bottomNav.getByRole('link', { name: 'Explore', exact: true }).click();

    await expect(page).toHaveURL('/');

    // The navigation should persist on restaurant discovery.
    await expect(bottomNav).toBeVisible();

    await expect(
        bottomNav.getByRole('link', {
            name: 'Explore',
            exact: true,
        }),
    ).toHaveAttribute('aria-current', 'page');

    // The floating bookmark must not be hidden by bottom tabs.
    const bookmarkButton = page.getByRole('button', {
        name: 'Open saved places',
    });

    await expect(bookmarkButton).toBeVisible();

    const navBox = await bottomNav.boundingBox();
    const bookmarkBox = await bookmarkButton.boundingBox();

    expect(navBox).not.toBeNull();
    expect(bookmarkBox).not.toBeNull();

    expect(bookmarkBox!.y + bookmarkBox!.height).toBeLessThanOrEqual(
        navBox!.y - 8,
    );

    // The floating saved places panel must still work.
    await bookmarkButton.click();

    await expect(
        page.getByRole('complementary', {
            name: 'Saved places',
        }),
    ).toBeVisible();
});

test('guests retain public navigation without account bottom tabs', async ({
    page,
}) => {
    await page.setViewportSize({
        width: 390,
        height: 844,
    });

    await page.goto('/');

    // Guests must not see private account navigation.
    await expect(
        page.getByRole('navigation', {
            name: 'Account navigation',
        }),
    ).toHaveCount(0);

    // Existing public navigation must still work.
    await expect(
        page.getByRole('button', {
            name: 'Open navigation menu',
        }),
    ).toBeVisible();

    // Guests retain access to the floating Saved Places panel.
    const bookmarkButton = page.getByRole('button', {
        name: 'Open saved places',
    });

    await expect(bookmarkButton).toBeVisible();

    await bookmarkButton.click();

    await expect(
        page.getByRole('complementary', {
            name: 'Saved places',
        }),
    ).toBeVisible();
});
