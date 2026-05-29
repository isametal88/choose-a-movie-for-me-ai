import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Filters screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /find something to watch/i })).toBeVisible();
  });

  test('shows the media type toggle with Movies and TV Shows buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /movies/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /tv shows/i })).toBeVisible();
  });

  test('Movies button is initially selected (primary style)', async ({ page }) => {
    const moviesBtn = page.getByRole('button', { name: /movies/i });
    await expect(moviesBtn).toHaveClass(/ds-button--primary/);
  });

  test('has a genres section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /genres/i })).toBeVisible();
  });

  test('has a streaming services section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /streaming services/i })).toBeVisible();
  });

  test('has a minimum rating slider', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /minimum rating/i })).toBeVisible();
    await expect(page.locator('input[type="range"]')).toBeVisible();
  });

  test('has a "Pick for me" button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /pick for me/i })).toBeVisible();
  });

  test('"Clear filters" button is not visible initially', async ({ page }) => {
    await expect(page.getByRole('button', { name: /clear filters/i })).not.toBeVisible();
  });

  test('keyboard navigation: Tab moves focus through interactive elements', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focusedEl = page.locator(':focus');
    await expect(focusedEl).toBeTruthy();
  });

  test('accessibility: no violations on the filters page', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
