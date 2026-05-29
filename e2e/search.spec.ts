import { expect, test } from '@playwright/test';

test.describe('Text search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('filters page has a "Search by title" section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /search by title/i })).toBeVisible();
  });

  test('has a search input', async ({ page }) => {
    await expect(page.locator('ds-text-field input[type="search"]')).toBeVisible();
  });

  test('typing a query shows "Clear filters"', async ({ page }) => {
    await page.locator('ds-text-field input[type="search"]').fill('Inception');
    await expect(page.getByRole('button', { name: /clear filters/i })).toBeVisible();
  });

  test('"Clear filters" clears the search field', async ({ page }) => {
    const searchInput = page.locator('ds-text-field input[type="search"]');
    await searchInput.fill('Inception');
    await page.getByRole('button', { name: /clear filters/i }).click();
    await expect(searchInput).toHaveValue('');
  });

  test('"Pick for me" with a query navigates to /pick and shows a result', async ({ page }) => {
    await page.locator('ds-text-field input[type="search"]').fill('Inception');
    await page.getByRole('button', { name: /pick for me/i }).click();
    await expect(page).toHaveURL('/pick');
    const result = page.locator('.pick-screen__result, .pick-screen__state');
    await expect(result).toBeVisible({ timeout: 15000 });
  });
});
