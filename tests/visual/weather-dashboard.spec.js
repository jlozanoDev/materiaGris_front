import { test, expect } from '@playwright/test';

test.describe('Weather Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Set auth token to bypass login
    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'fake-e2e-token');
    });

    // Mock the auth/user endpoint
    await page.route('**/api/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          name: 'Dr. Test',
          email: 'dr@test.com',
          permissions: { 'report.edit': 1 },
        }),
      });
    });

    // Mock dashboard stats
    await page.route('**/patients/find*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/reports?status=draft', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Mock Open-Meteo API
    await page.route('**/api.open-meteo.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          current: {
            temperature_2m: 22.3,
            weather_code: 0,
          },
        }),
      });
    });
  });

  test('DashboardPage mount → HeroCard shows weather data from Open-Meteo', async ({ page }) => {
    await page.goto('/');

    // Wait for dashboard to load
    await page.waitForSelector('.hero-card');

    // Verify weather data is rendered
    await expect(page.locator('.hero-card')).toContainText('22°C');
    await expect(page.locator('.hero-card')).toContainText('Despejado');
  });

  test('Weather display shows error state when Open-Meteo fails', async ({ page }) => {
    // Override the Open-Meteo mock to return an error
    await page.route('**/api.open-meteo.com/**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/');
    await page.waitForSelector('.hero-card');

    // Should show "No disponible" error text
    await expect(page.locator('.hero-card')).toContainText('No disponible', { timeout: 15000 });
  });
});
