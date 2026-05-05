import { test, expect } from '@playwright/test'

test('Usuarios CRUD (mocked API)', async ({ page }) => {
  // in-memory fake DB for the duration of the test
  let users = []
  let nextId = 100

  // Mock any API call to prevent 401 logouts
  await page.route(url => url.href.includes('api.materiagris.local'), async route => {
    const url = route.request().url()
    
    // Auth Me
    if (url.includes('/auth/me')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, name: 'E2E User', permissions: ['admin.user.view','admin.user.create','admin.user.update','admin.user.delete'] })
      })
    }

    // Users Collection
    if (url.includes('/admin/users') && !url.match(/\/admin\/users\/\d+/)) {
      const method = route.request().method()
      if (method === 'GET') {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(users) })
      }
      if (method === 'POST') {
        const body = JSON.parse(await route.request().postData())
        const user = { id: nextId++, ...body }
        users.push(user)
        return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(user) })
      }
    }

    // User Items (PUT/DELETE)
    const idMatch = url.match(/\/admin\/users\/(\d+)/)
    if (idMatch) {
      const id = Number(idMatch[1])
      const method = route.request().method()
      if (method === 'PUT') {
        const body = JSON.parse(await route.request().postData())
        const idx = users.findIndex(u => u.id === id)
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...body }
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(users[idx]) })
        }
        return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'Not found' }) })
      }
      if (method === 'DELETE') {
        users = users.filter(u => u.id !== id)
        return route.fulfill({ status: 204, body: '' })
      }
    }

    // Default for any other API call
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({})
    })
  })

  // Start test flow
  await page.addInitScript(() => {
    window.localStorage.setItem('access_token', 'fake-e2e-token')
  })
  await page.goto('/admin/users')

  // Click add user
  await page.locator('button', { hasText: 'Agregar usuario' }).click()

  // Fill modal inputs
  await page.getByPlaceholder('Nombre').fill('Prueba E2E')
  await page.getByPlaceholder('Email').fill('e2e@example.com')

  // Submit create
  await Promise.all([
    page.waitForResponse(resp => resp.url().endsWith('/admin/users') && resp.request().method() === 'POST'),
    page.getByRole('button', { name: 'Guardar' }).click()
  ])

  // Ensure the user was added in the mocked DB
  expect(users.some(u => u.email === 'e2e@example.com')).toBeTruthy()

  const created = users.find(u => u.email === 'e2e@example.com')

  // Edit the user
  // Edit the user via UI
  const row = page.locator('tr', { hasText: 'e2e@example.com' })
  await expect(row).toBeVisible()
  await row.getByLabel('Editar').click()
  
  await page.getByPlaceholder('Nombre').fill('Prueba E2E Editada')
  
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes(`/admin/users/${created.id}`) && resp.request().method() === 'PUT'),
    page.getByRole('button', { name: 'Guardar' }).click()
  ])

  // Verify update in mocked DB
  expect(users.find(u => u.id === created.id).name).toBe('Prueba E2E Editada')

  // Delete the user via UI
  page.on('dialog', dialog => dialog.accept())
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes(`/admin/users/${created.id}`) && resp.request().method() === 'DELETE'),
    row.getByLabel('Desactivar').click()
  ])

  expect(users.find(u => u.id === created.id)).toBeUndefined()
})
