import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('cuisine chips support multiple selections', async ({ page }) => {
    const filipino = page.getByRole('button', {
        name: 'Filipino',
        exact: true,
    });

    const indian = page.getByRole('button', {
        name: 'Indian',
        exact: true,
    });

    await expect(filipino).toHaveAttribute('aria-pressed', 'false');

    await filipino.click();
    await indian.click();

    await expect(filipino).toHaveAttribute('aria-pressed', 'true');
    await expect(indian).toHaveAttribute('aria-pressed', 'true');

    await filipino.click();

    await expect(filipino).toHaveAttribute('aria-pressed', 'false');
    await expect(indian).toHaveAttribute('aria-pressed', 'true');
});

test('halal statuses support independent selections', async ({ page }) => {
    const verified = page.getByRole('checkbox', {
        name: 'Verified certification',
    });

    const declared = page.getByRole('checkbox', {
        name: 'Self-declared halal',
    });

    const unknown = page.getByRole('checkbox', {
        name: 'Unknown status',
    });

    await verified.check();
    await declared.check();

    await expect(verified).toBeChecked();
    await expect(declared).toBeChecked();
    await expect(unknown).not.toBeChecked();

    await verified.uncheck();

    await expect(verified).not.toBeChecked();
    await expect(declared).toBeChecked();
});

test('clear filters resets both filter groups', async ({ page }) => {
    const filipino = page.getByRole('button', {
        name: 'Filipino',
        exact: true,
    });

    const verified = page.getByRole('checkbox', {
        name: 'Verified certification',
    });

    await filipino.click();
    await verified.check();

    await page.getByRole('button', { name: 'Clear filters' }).click();

    await expect(filipino).toHaveAttribute('aria-pressed', 'false');
    await expect(verified).not.toBeChecked();
});

test('changing halal status preserves cuisine selections', async ({ page }) => {
    const filipino = page.getByRole('button', {
        name: 'Filipino',
        exact: true,
    });

    await filipino.click();

    await page.getByRole('checkbox', { name: 'Unknown status' }).check();

    await expect(filipino).toHaveAttribute('aria-pressed', 'true');
});

test('filters remain usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });

    const filipino = page.getByRole('button', {
        name: 'Filipino',
        exact: true,
    });

    const verified = page.getByRole('checkbox', {
        name: 'Verified certification',
    });

    await filipino.click();
    await verified.check();

    await expect(filipino).toHaveAttribute('aria-pressed', 'true');
    await expect(verified).toBeChecked();

    const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
    );

    expect(hasHorizontalOverflow).toBe(false);
});
