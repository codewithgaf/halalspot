import { expect, test } from '@playwright/test';

test('authenticated desktop sidebar links to profile settings', async ({
    page,
}) => {
    await page.setViewportSize({
        width: 1440,
        height: 900,
    });

    // Sign in using the isolated dashboard E2E account.
    await page.goto('/login');

    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('dashboard-user@example.test');

    await page
        .getByLabel('Password', { exact: true })
        .fill('playwright-test-only-2026');

    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/dashboard(?:[?#]|$)/);

    // Find navigation inside the desktop sidebar.
    const sidebar = page.locator('[data-sidebar="sidebar"]');

    const profileLink = sidebar.getByRole('link', {
        name: 'Profile',
        exact: true,
    });

    // Profile should be a real sidebar destination.
    await expect(profileLink).toBeVisible();

    await expect(profileLink).toHaveAttribute('href', '/settings/profile');

    // Verify the link actually works.
    await profileLink.click();

    await expect(page).toHaveURL(/\/settings\/profile$/);
});

test('authenticated desktop sidebar links to restaurant discovery', async ({
    page,
}) => {
    await page.setViewportSize({
        width: 1440,
        height: 900,
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

    const sidebar = page.locator('[data-sidebar="sidebar"]');

    const exploreLink = sidebar.getByRole('link', {
        name: 'Explore Restaurants',
        exact: true,
    });

    await expect(exploreLink).toBeVisible();
    await expect(exploreLink).toHaveAttribute('href', '/');

    await exploreLink.click();

    await expect(page).toHaveURL('/');

    await expect(
        page.getByRole('region', {
            name: 'Restaurant results',
        }),
    ).toBeVisible();
});

test('authenticated desktop sidebar opens private Saved Places', async ({
    page,
}) => {
    await page.setViewportSize({
        width: 1440,
        height: 900,
    });

    // Sign in with our existing isolated E2E account.
    await page.goto('/login');

    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('dashboard-user@example.test');

    await page
        .getByLabel('Password', { exact: true })
        .fill('playwright-test-only-2026');

    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/dashboard(?:[?#]|$)/);

    // Find the Saved Places link inside the desktop sidebar.
    const sidebar = page.locator('[data-sidebar="sidebar"]');

    const savedPlacesLink = sidebar.getByRole('link', {
        name: 'Saved Places',
        exact: true,
    });

    await expect(savedPlacesLink).toBeVisible();

    // The destination must be the private Inertia page,
    // not the existing /saved-places JSON endpoint.
    await expect(savedPlacesLink).toHaveAttribute(
        'href',
        '/account/saved-places',
    );

    await savedPlacesLink.click();

    // Verify navigation and page content.
    await expect(page).toHaveURL(/\/account\/saved-places$/);

    await expect(
        page.getByRole('heading', {
            name: 'My Saved Places',
            level: 1,
        }),
    ).toBeVisible();

    await expect(page.getByText('Private to your account')).toBeVisible();
});
