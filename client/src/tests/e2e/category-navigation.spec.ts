import { test, expect } from '@playwright/test';

test.describe('Category Navigation E2E', () => {
  test('section -> subsection -> leaf shows breadcrumbs and directory', async ({ page }) => {
    await page.goto('/fashion/women');
    await expect(page.getByTestId('category-directory-section')).toBeVisible();

    await page.getByRole('link', { name: 'Bags' }).first().click();
    await expect(page.getByTestId('category-directory-subsection')).toBeVisible();
    await expect(page.getByTestId('category-breadcrumbs')).toContainText('Women');
    await expect(page.getByTestId('category-breadcrumbs')).toContainText('Bags');

    await page.getByRole('link', { name: /totes/i }).first().click();
    await expect(page.getByTestId('category-breadcrumbs')).toContainText(/totes/i);
  });

  test('invalid slug routes to NotFound', async ({ page }) => {
    await page.goto('/fashion/not-a-section');
    await expect(page.getByText('404 Page Not Found')).toBeVisible();
  });

  test('top nav keyboard interaction opens/closes dropdown', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByTestId('nav-women');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu', { name: /women navigation menu/i })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('nav-women')).toBeFocused();
  });
});


