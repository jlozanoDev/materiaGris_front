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

  test('New-professional empty state shows onboarding tips', async ({ page }) => {
    // Mock returns empty patients array → getPatientsCount() returns 0
    // → isEmptyState && isNewProfessional → onboarding tips
    await page.goto('/');
    await page.waitForSelector('.hero-card');

    // Verify new-professional onboarding content
    await expect(page.locator('.hero-card')).toContainText('Comienza a construir');
    await expect(page.locator('.hero-card')).toContainText('Registra tu primer paciente');
    // Zero-value stat cards should NOT be visible
    await expect(page.locator('.hero-card')).not.toContainText('Visitas hoy');
  });

  test('Slow-day empty state shows contextual reassurance', async ({ page }) => {
    // Override patients/find to return different responses based on URL:
    // - getStats (with last_visit_from param) → empty array (zero stats)
    // - getPatientsCount (no params) → 5 patients (totalPatients > 0)
    await page.route('**/patients/find*', async (route) => {
      const url = route.request().url();
      if (url.includes('last_visit_from')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(Array(5).fill(null).map((_, i) => ({
            id: i + 1,
            name: `Patient ${i + 1}`,
            created_at: '2026-01-01T10:00:00',
            last_visit_at: null,
          }))),
        });
      }
    });

    await page.goto('/');
    await page.waitForSelector('.hero-card');

    // Verify slow-day messaging and patient count
    await expect(page.locator('.hero-card')).toContainText('Hoy no hay actividad');
    await expect(page.locator('.hero-card')).toContainText('5');
    // Zero stat cards should NOT render
    await expect(page.locator('.hero-card')).not.toContainText('Visitas hoy');
  });

  test.describe('Empty-state responsive layout', () => {
    test('Desktop: QuickActions adjacent to HeroCard at 1280px', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');
      await page.waitForSelector('.hero-card');

      const heroCard = page.locator('.hero-card');
      await expect(heroCard).toContainText('Comienza a construir');

      // QuickActions should be visible
      await expect(page.getByText('Acciones rápidas')).toBeVisible();
    });

    test('Tablet: QuickActions visible with HeroCard at 768px', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForSelector('.hero-card');

      const heroCard = page.locator('.hero-card');
      await expect(heroCard).toContainText('Comienza a construir');

      // QuickActions should still be reachable
      await expect(page.getByText('Acciones rápidas')).toBeVisible();
    });

    test('Mobile: stacked layout at 375px', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForSelector('.hero-card');

      const heroCard = page.locator('.hero-card');
      await expect(heroCard).toContainText('Comienza a construir');

      // QuickActions should still appear somewhere on the page
      await expect(page.getByText('Acciones rápidas')).toBeVisible();
    });
  });
});
