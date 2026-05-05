# Materiagris Frontend (Vue 3 + Vite)

Frontend SPA desarrollado con Vue 3 y Vite. Consume la API en `MateriaGris_api` para gestionar usuarios, pacientes y permisos.

## Requisitos
- Node.js (recomendado: 16+ / 18+)
- npm o pnpm

## Desarrollo local

Instalar dependencias:

```bash
npm install
```

Iniciar servidor de desarrollo:

```bash
npm run dev
```

Por defecto Vite sirve en `http://localhost:5173`.

## Variables de entorno
- `VITE_API_URL` — URL base de la API (ejemplo: `http://localhost` si nginx de la API está en `:80`).

Puedes crear un archivo `.env.local` con la variable anterior o configurar en `vite.config.js` según tu entorno.

## Construir para producción

```bash
npm run build
# ver resultado en: dist/
```

Previsualizar build:

```bash
npm run preview
```

## Tests
- Unitarios/Integración: `npm run test` (Vitest)
- Tests E2E/Visual: Playwright está configurado en `playwright.config.cjs` (si corresponde)

## Lint / Formato

```bash
npm run lint
npm run format
```

## Notas
- Asegúrate de que la API (`MateriaGris_api`) esté levantada para que la app funcione correctamente en desarrollo.
- Si quieres, puedo añadir un `docker-compose.override.yml` para servir el frontend también por Docker o un `Dockerfile` de producción.

---

Archivo actualizado con pasos de desarrollo y comandos frecuentes.
