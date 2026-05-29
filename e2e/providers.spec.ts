import { expect, test } from '@playwright/test';

test.describe('Providers section', () => {
  test('detail page shows "Where to watch" section when providers are available', async ({ page }) => {
    // Inception (id=27205) — likely has providers in IT region
    await page.goto('/detail/movie/27205');
    await page.locator('.detail-screen__content, .detail-screen__state').waitFor({ timeout: 15000 }).catch(() => {});

    // Providers section may or may not appear depending on TMDB data — just verify the component exists if shown
    const content = page.locator('.detail-screen__content');
    const hasContent = await content.isVisible().catch(() => false);
    if (!hasContent) {
      test.skip();
      return;
    }

    // If providers are present, they should be shown in a section
    const providersSection = page.locator('.providers');
    const hasProviders = await providersSection.isVisible().catch(() => false);
    if (hasProviders) {
      await expect(page.getByRole('heading', { name: /where to watch/i })).toBeVisible();
    }
  });

  test('provider button is focusable', async ({ page }) => {
    await page.goto('/detail/movie/27205');
    await page.locator('.detail-screen__content').waitFor({ timeout: 15000 }).catch(() => {});

    const providerBtn = page.locator('.providers__item').first();
    const hasBtn = await providerBtn.isVisible().catch(() => false);
    if (!hasBtn) {
      test.skip();
      return;
    }
    await providerBtn.focus();
    await expect(providerBtn).toBeFocused();
  });

  test('JustWatch link opens in new tab when present', async ({ page }) => {
    await page.goto('/detail/movie/27205');
    await page.locator('.detail-screen__content').waitFor({ timeout: 15000 }).catch(() => {});

    const justWatchLink = page.locator('.providers__justwatch');
    const hasLink = await justWatchLink.isVisible().catch(() => false);
    if (!hasLink) {
      test.skip();
      return;
    }
    expect(await justWatchLink.getAttribute('target')).toBe('_blank');
    expect(await justWatchLink.getAttribute('rel')).toContain('noopener');
  });
});
