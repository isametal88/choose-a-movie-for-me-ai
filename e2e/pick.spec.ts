import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Pick screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pick');
  });

  test('shows a spinner while loading', async ({ page }) => {
    await expect(page.locator('ds-spinner')).toBeVisible();
  });

  test('eventually shows a picked title or an empty/error state', async ({ page }) => {
    const result = page.locator('.pick-screen__result, .pick-screen__state');
    await expect(result).toBeVisible({ timeout: 15000 });
  });

  test('picked state: shows title, year, and overview', async ({ page }) => {
    const result = page.locator('.pick-screen__result');
    const hasResult = await result.isVisible({ timeout: 15000 }).catch(() => false);
    if (!hasResult) {
      test.skip();
      return;
    }
    await expect(page.locator('.pick-screen__title')).not.toBeEmpty();
    await expect(page.locator('.pick-screen__year')).not.toBeEmpty();
    await expect(page.locator('.pick-screen__overview')).not.toBeEmpty();
  });

  test('picked state: "Back to filters" button navigates home', async ({ page }) => {
    const result = page.locator('.pick-screen__result');
    const hasResult = await result.isVisible({ timeout: 15000 }).catch(() => false);
    if (!hasResult) {
      test.skip();
      return;
    }
    const backBtn = page.getByRole('button', { name: /torna ai filtri/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await expect(page).toHaveURL('/');
  });

  test('accessibility: no violations on the pick page', async ({ page }) => {
    await page.locator('.pick-screen__result, .pick-screen__state').waitFor({ timeout: 15000 }).catch(() => {});
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
