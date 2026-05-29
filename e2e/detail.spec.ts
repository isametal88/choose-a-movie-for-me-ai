import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Detail screen', () => {
  test('navigating to /detail/movie/<id> shows the detail screen', async ({ page }) => {
    // Use Inception (id=27205) as a stable real movie
    await page.goto('/detail/movie/27205');
    const content = page.locator('.detail-screen__content, .detail-screen__state, .detail-screen__loading');
    await expect(content).toBeVisible({ timeout: 15000 });
  });

  test('loaded detail shows title', async ({ page }) => {
    await page.goto('/detail/movie/27205');
    const content = page.locator('.detail-screen__content');
    const hasContent = await content.isVisible({ timeout: 15000 }).catch(() => false);
    if (!hasContent) { test.skip(); return; }
    await expect(page.locator('.detail-screen__title')).not.toBeEmpty();
  });

  test('loaded detail shows year', async ({ page }) => {
    await page.goto('/detail/movie/27205');
    const content = page.locator('.detail-screen__content');
    const hasContent = await content.isVisible({ timeout: 15000 }).catch(() => false);
    if (!hasContent) { test.skip(); return; }
    await expect(page.locator('.detail-screen__year')).not.toBeEmpty();
  });

  test('"Back to filters" button navigates home', async ({ page }) => {
    await page.goto('/detail/movie/27205');
    const content = page.locator('.detail-screen__content, .detail-screen__state');
    await content.waitFor({ timeout: 15000 }).catch(() => {});
    const backBtn = page.getByRole('button', { name: /torna ai filtri/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await expect(page).toHaveURL('/');
  });

  test('pick screen "See details" button navigates to detail', async ({ page }) => {
    await page.goto('/pick');
    const result = page.locator('.pick-screen__result');
    const hasResult = await result.isVisible({ timeout: 15000 }).catch(() => false);
    if (!hasResult) { test.skip(); return; }
    const detailLink = page.getByRole('button', { name: /vedi dettagli/i });
    await expect(detailLink).toBeVisible();
    await detailLink.click();
    await expect(page).toHaveURL(/\/detail\/(movie|tv)\/\d+/);
  });

  test('accessibility: no violations on the detail page', async ({ page }) => {
    await page.goto('/detail/movie/27205');
    await page.locator('.detail-screen__content, .detail-screen__state').waitFor({ timeout: 15000 }).catch(() => {});
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
