import { expect, test } from '@playwright/test';

test('user can manage contributor privacy settings', async ({ page }) => {
    // 1. Sign in with an isolated E2E account.
    await page.goto('/login');

    await page
        .getByRole('textbox', { name: 'Email address' })
        .fill('dashboard-user@example.test');

    await page
        .getByLabel('Password', { exact: true })
        .fill('playwright-test-only-2026');

    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/dashboard(?:[?#]|$)/);

    // 2. Open Profile Settings.
    await page.goto('/settings/profile');

    const privacy = page.getByRole('region', {
        name: 'Contributor privacy',
    });

    await expect(privacy).toBeVisible();

    const publicProfile = privacy.getByRole('checkbox', {
        name: 'Enable public contributor profile',
    });

    const shareBio = privacy.getByRole('checkbox', {
        name: 'Share my bio',
    });

    const shareCity = privacy.getByRole('checkbox', {
        name: 'Share my city',
    });

    // 3. Verify private defaults.
    await expect(publicProfile).not.toBeChecked();
    await expect(shareBio).toBeDisabled();
    await expect(shareCity).toBeDisabled();

    // 4. Explicitly enable public sharing.
    await publicProfile.check();
    await shareBio.check();

    await expect(shareCity).not.toBeChecked();

    // 5. Save preferences.
    await privacy
        .getByRole('button', { name: 'Save privacy settings' })
        .click();

    // 6. Reload to verify persistence.
    await page.reload();

    await expect(publicProfile).toBeChecked();
    await expect(shareBio).toBeChecked();
    await expect(shareCity).not.toBeChecked();

    // 7. Disable public visibility.
    await publicProfile.uncheck();

    // Sharing must be disabled and unchecked.
    await expect(shareBio).not.toBeChecked();
    await expect(shareBio).toBeDisabled();
    await expect(shareCity).not.toBeChecked();
    await expect(shareCity).toBeDisabled();

    // 8. Save the private preferences.
    await privacy
        .getByRole('button', { name: 'Save privacy settings' })
        .click();

    await expect(privacy.getByRole('status')).toHaveText(
        'Privacy settings saved.',
    );

    // 9. Reload to verify that privacy was restored.
    await page.reload();

    await expect(publicProfile).not.toBeChecked();
    await expect(shareBio).not.toBeChecked();
    await expect(shareCity).not.toBeChecked();
});
