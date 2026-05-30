---
name: materiagris-e2e
description: "Sub-skill de tests e2e con Playwright para Materiagris Front. Úsala al escribir o modificar tests e2e/visual, mockear APIs, manejar snapshots o ejecutar la suite de Playwright."
argument-hint: "Tarea de test e2e con Playwright, visual testing, mocking de API"
user-invocable: true
---

# E2E Testing con Playwright — Materiagris Front

Usá esta skill cuando trabajes con tests e2e/visual sobre la SPA de Materiagris.

## Archivos Clave

| Archivo | Propósito |
|---|---|
| `playwright.config.cjs` | Config: chromium, viewport 1280x800, baseURL localhost:5173, testDir `tests/visual` |
| `tests/visual/` | Directorio donde viven todos los tests e2e |
| `tests/visual/home.spec.js` | Snapshot visual de homepage |
| `tests/visual/users.crud.spec.js` | CRUD completo de usuarios con API mockeada |

## Comandos

```bash
npm run test:visual                          # Ejecuta toda la suite Playwright
npx playwright test --ui                     # Modo interactivo (útil para debug)
npx playwright test tests/visual/mi-test     # Test específico
npx playwright test --update-snapshots       # Actualiza snapshots visuales
```

## Patrones del Proyecto

### Mockeo de API

Siempre usá `page.route()` para interceptar llamadas a `api.materiagris.local`. Nunca dependas del backend real.

```js
await page.route(url => url.href.includes('api.materiagris.local'), async route => {
  const url = route.request().url()
  const method = route.request().method()

  if (url.includes('/auth/me')) {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 1, name: 'Test User', permissions: [...] })
    })
  }
  // ... resto de rutas
})
```

### Fake DB In-Memory

Usá un array mutable como base de datos falsa para tests de CRUD:

```js
let items = []
let nextId = 1
// Mutá items en los handlers de POST/PUT/DELETE
// Verificá el estado final con expect()
```

### Autenticación

Inyectá el token JWT falso antes de navegar:

```js
await page.addInitScript(() => {
  window.localStorage.setItem('access_token', 'fake-e2e-token')
})
await page.goto('/ruta-protegida')
```

### Esperar Respuestas de Red

Usá `page.waitForResponse()` para sincronizarte con llamadas async:

```js
await Promise.all([
  page.waitForResponse(resp => resp.url().includes('/admin/users') && resp.request().method() === 'POST'),
  page.getByRole('button', { name: 'Guardar' }).click()
])
```

## Convenciones

- Test files en `tests/visual/` con sufijo `.spec.js`
- Usá `import { test, expect } from '@playwright/test'`
- Mockeá SIEMPRE `/auth/me` para evitar redirecciones por 401
- No uses datos reales de API — todo mockeado en `page.route()`
- Verificá el estado de la fake DB con `expect()` después de cada operación
- Usá `toHaveScreenshot()` para tests de regresión visual con `fullPage: true`

## Referencias

- `tests/visual/home.spec.js` — test base de snapshot
- `tests/visual/users.crud.spec.js` — test CRUD completo con mocking
- `playwright.config.cjs` — configuración del proyecto
