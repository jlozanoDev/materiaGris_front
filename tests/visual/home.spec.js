import { test, expect } from '@playwright/test';

test('homepage visual snapshot', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('access_token', 'fake-e2e-token')
  })
  await page.goto('/')
  await page.waitForSelector('.sidebar')
  await expect(page).toHaveScreenshot('home.png', { fullPage: true })
});
