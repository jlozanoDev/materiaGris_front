import { test, expect } from '@playwright/test';

test('homepage visual snapshot', async ({ page }) => {
  await page.goto('/');
  // Take a full page screenshot and compare to baseline
  await expect(page).toHaveScreenshot('home.png', { fullPage: true });
});
