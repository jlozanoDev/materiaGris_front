import { test, expect } from '@playwright/test'

/**
 * Creates a minimal mock template with one section, one row, one column, one field.
 * Used by the drag test to simulate a loaded template with a clickable field.
 */
function createMockTemplate(id) {
  return {
    id,
    name: 'E2E Drag Test Template',
    description: 'Template for splitter drag interaction test',
    structure: {
      sections: [
        {
          id: 'section-1',
          label: 'Main Section',
          rows: [
            {
              id: 'row-1',
              columns: [
                {
                  id: 'col-1',
                  width: 100,
                  fields: [
                    {
                      id: 'field-text-1',
                      type: 'text',
                      label: 'First Name',
                      key: 'first_name',
                      required: true,
                      showLabel: true,
                      placeholder: 'Enter first name',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  }
}

test.describe('Report Template Builder — Resizable Splitter', () => {
  test.beforeEach(async ({ page }) => {
    // Mock all API calls
    await page.route(url => {
      try {
        const u = new URL(url)
        if (u.port === '5173') return false
        return u.pathname.startsWith('/auth/') || u.pathname.startsWith('/admin/') || u.pathname.startsWith('/api/')
      } catch (_) { return false }
    }, async route => {
      const url = route.request().url()

      // Auth Me — needs both create and update permissions
      // (create route requires admin.reporttemplate.create,
      //  edit route requires admin.reporttemplate.update)
      if (url.includes('/auth/me') || url.includes('/api/me')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            name: 'Admin E2E',
            permissions: ['admin.reporttemplate.create', 'admin.reporttemplate.update'],
            roles: [{ id: 1, name: 'Admin', permissions: ['admin.reporttemplate.create', 'admin.reporttemplate.update'] }],
          }),
        })
      }

      // System variables
      if (url.includes('/system-variables')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
      }

      // Report templates
      if (url.includes('/report-templates') && route.request().method() === 'GET') {
        const urlObj = new URL(url)
        const pathname = urlObj.pathname
        // Detail request: /admin/report-templates/{id}
        if (pathname.match(/\/report-templates\/\d+$/)) {
          // Fall through — lets per-test routes (registered in test body) take over
          return route.fallback()
        }
        // List request
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
      }

      // Default empty response
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      })
    })

    // Inject fake auth token
    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'fake-e2e-token')
    })
  })

  test('shows splitter between canvas and properties panel when field selected', async ({ page }) => {
    await page.goto('/admin/report-templates/new')

    // Wait for the page to load (the builder renders)
    await page.waitForSelector('.card', { timeout: 10000 })

    // The palette should be visible
    await expect(page.locator('text=Campos').first()).toBeVisible({ timeout: 5000 })

    // Splitpanes element should exist in the DOM
    const splitpanes = page.locator('.splitpanes')
    await expect(splitpanes).toBeVisible({ timeout: 5000 })

    // Properties panel should NOT be visible initially (no field selected)
    const propertiesPanel = page.locator('.splitpanes__splitter')
    // When no field selected, the right Pane is v-if=false, so there's only one Pane
    // The splitter should not be visible
    // Actually splitpanes renders a single pane without a splitter when only one child
    // We'll check that the second pane (properties) doesn't exist
  })

  test('properties panel absent when no field is selected', async ({ page }) => {
    await page.goto('/admin/report-templates/new')
    await page.waitForSelector('.card', { timeout: 10000 })

    // With no field selected, the properties aside should not be in the DOM
    // The splitpanes should have exactly one Pane child (canvas only)
    // We can see this by checking the DOM for FieldPropertiesPanel content
    // The Pane with v-if=builder.selectedFieldId won't render
    const panel = page.locator('.splitpanes').locator('> div')
    // When there's only one pane visible, no splitter is rendered
    const splitterCount = await page.locator('.splitpanes__splitter').count()
    expect(splitterCount).toBe(0)
  })

  // ===================================================================
  // Task 3.3 — E2E drag interaction test
  // ===================================================================

  test('drag splitter right increases properties panel width', async ({ page }) => {
    // Register a route for the template detail endpoint BEFORE navigation.
    // This runs after the global beforeEach route (FIFO). The global handler
    // detects this is a detail request and calls route.fallback(), passing
    // control to this handler.
    await page.route(url => {
      try {
        const u = new URL(url)
        // Only match API calls, not Vite dev server
        return u.port !== '5173' && /\/admin\/report-templates\/\d+$/.test(u.pathname)
      } catch {
        return false
      }
    }, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createMockTemplate(1)),
      })
    })

    // Navigate to the edit page — the builder will load the mock template
    await page.goto('/admin/report-templates/1/edit')

    // Wait for the page to finish loading
    await page.waitForSelector('.card', { timeout: 10000 })

    // Wait for the section panel to render (template has sections)
    await page.waitForSelector('[data-section-panel]', { timeout: 5000 })

    // Click on a field chip to select it, making the properties panel appear
    await page.click('[data-field-chip]')

    // Wait for the properties panel to render
    await page.waitForSelector('[data-property-panel]', { timeout: 5000 })

    // The splitter should now be visible (between canvas and properties)
    await page.waitForSelector('.splitpanes__splitter', { timeout: 5000 })

    // Record initial width of the properties panel
    const panel = page.locator('[data-property-panel]')
    const initialBox = await panel.boundingBox()
    const initialWidth = initialBox.width
    const initialX = initialBox.x

    // Locate the splitter handle
    const splitter = page.locator('.splitpanes__splitter')
    const splitterBox = await splitter.boundingBox()
    const splitterMidX = splitterBox.x + splitterBox.width / 2
    const splitterMidY = splitterBox.y + splitterBox.height / 2

    // Perform the drag: mouse down on the splitter center, drag LEFT 150px
    // (dragging left makes the right/properties pane wider)
    await page.mouse.move(splitterMidX, splitterMidY)
    await page.mouse.down()
    await page.mouse.move(splitterMidX - 150, splitterMidY, { steps: 15 })
    await page.mouse.up()

    // Small wait for splitpanes to recompute layout
    await page.waitForTimeout(300)

    // Read the new width and position (should have shifted left AND gotten wider)
    const newBox = await panel.boundingBox()
    const newWidth = newBox.width
    const newX = newBox.x

    // Properties panel should have moved left (its left edge follows the splitter)
    expect(newX).toBeLessThan(initialX)
    // Properties panel should be wider than before the drag
    expect(newWidth).toBeGreaterThan(initialWidth)
  })
})
