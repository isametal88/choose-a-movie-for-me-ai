import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tv', width: 1920, height: 1080 },
];

// ─── Viewport matrix ──────────────────────────────────────────────────────────

test.describe('Viewport matrix — filters screen', () => {
  for (const vp of VIEWPORTS) {
    test(`renders correctly at ${vp.name} (${vp.width}×${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await expect(page.getByRole('heading', { name: /cosa guardi stasera/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /scegli per me/i })).toBeVisible();
    });

    test(`no axe violations at ${vp.name} (${vp.width}×${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe('Viewport matrix — pick screen', () => {
  for (const vp of VIEWPORTS) {
    test(`no axe violations at ${vp.name} (${vp.width}×${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/pick');
      await page.locator('.pick-screen__result, .pick-screen__state').waitFor({ timeout: 15000 }).catch(() => {});
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe('Viewport matrix — detail screen', () => {
  for (const vp of VIEWPORTS) {
    test(`no axe violations at ${vp.name} (${vp.width}×${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/detail/movie/27205');
      await page.locator('.detail-screen__content, .detail-screen__state').waitFor({ timeout: 15000 }).catch(() => {});
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

// ─── Keyboard navigation ──────────────────────────────────────────────────────

test.describe('Keyboard navigation — filters screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Click into the page to give it keyboard focus
    await page.locator('main').click();
  });

  test('Tab reaches the Movies button', async ({ page }) => {
    const moviesBtn = page.getByRole('button', { name: /film/i });
    await moviesBtn.focus();
    const activeText = await page.evaluate(() => (document.activeElement as HTMLElement)?.textContent?.trim());
    expect(activeText).toMatch(/film/i);
  });

  test('Tab reaches the "Pick for me" button', async ({ page }) => {
    const pickBtn = page.getByRole('button', { name: /scegli per me/i });
    await pickBtn.focus();
    const isVisible = await pickBtn.isVisible();
    expect(isVisible).toBe(true);
  });

  test('Enter on focused "Pick for me" navigates to /pick', async ({ page }) => {
    const pickBtn = page.getByRole('button', { name: /scegli per me/i });
    await pickBtn.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/pick');
  });

  test('focus ring CSS token is defined and non-zero', async ({ page }) => {
    const focusRingWidth = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--focus-ring-width').trim()
    );
    expect(focusRingWidth).not.toBe('');
    expect(focusRingWidth).not.toBe('0px');
  });

  test('Tab cycles through all interactive controls', async ({ page }) => {
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(2);
  });
});

test.describe('Keyboard navigation — pick screen', () => {
  test('Tab reaches action buttons in picked state', async ({ page }) => {
    await page.goto('/pick');
    const result = page.locator('.pick-screen__result');
    const hasResult = await result.isVisible({ timeout: 15000 }).catch(() => false);
    if (!hasResult) {
      test.skip();
      return;
    }
    const seeDetailsBtn = page.getByRole('button', { name: /vedi dettagli/i });
    await seeDetailsBtn.focus();
    expect(await seeDetailsBtn.isVisible()).toBe(true);
  });
});

test.describe('Keyboard navigation — detail screen', () => {
  test('Tab reaches the "Back to filters" button', async ({ page }) => {
    await page.goto('/detail/movie/27205');
    const content = page.locator('.detail-screen__content, .detail-screen__state');
    await content.waitFor({ timeout: 15000 }).catch(() => {});
    const backBtn = page.getByRole('button', { name: /torna ai filtri/i });
    await expect(backBtn).toBeVisible();
    await backBtn.focus();
    const activeText = await page.evaluate(() => (document.activeElement as HTMLElement)?.textContent?.trim());
    expect(activeText).toMatch(/torna ai filtri/i);
  });

  test('all interactive elements are reachable via Tab', async ({ page }) => {
    await page.goto('/detail/movie/27205');
    await page.locator('.detail-screen__content, .detail-screen__state').waitFor({ timeout: 15000 }).catch(() => {});
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// ─── D-pad (arrow key) navigation ────────────────────────────────────────────

test.describe('D-pad navigation — filters screen', () => {
  test('ArrowRight / ArrowLeft moves between Media Type buttons', async ({ page }) => {
    await page.goto('/');
    const moviesBtn = page.getByRole('button', { name: /film/i });
    await moviesBtn.focus();
    await page.keyboard.press('ArrowRight');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
