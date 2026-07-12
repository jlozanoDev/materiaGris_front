# Tasks: Revisión Completa del README.md

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~200 (60 deleted + ~150 added) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | N/A |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: N/A
400-line budget risk: Low

## Phase 1: Estructura del documento

- [x] 1.1 Crear el esqueleto de secciones en `README.md`: título, descripción, stack, instalación, estructura, funcionalidades, credenciales, comandos, enlaces
- [x] 1.2 Definir placeholder `<!-- TODO -->` en cada sección para llenar en Phase 2 (completado directamente en Phase 2)

## Phase 2: Contenido por sección

- [x] 2.1 Escribir sección "Descripción": qué es MateriaGris, qué problema resuelve (3-4 líneas, español profesional)
- [x] 2.2 Escribir sección "Stack tecnológico": tabla con Vue 3.5, Vite 8, Pinia 3, Vuetify 4, Tailwind 4, TypeScript 5.9, TipTap, Lucide, sin versiones hardcodeadas (disclaimer: "consultar `package.json`")
- [x] 2.3 Escribir sección "Requisitos previos": Node.js ≥18, URL del repo backend (`github.com/jlozanoDev/materiaGris_api.git`)
- [x] 2.4 Escribir sección "Instalación y ejecución": `git clone`, `npm install`, crear `.env` con `VITE_API_BASE_URL` (corregir de `VITE_API_URL`), `npm run dev`
- [x] 2.5 Escribir sección "Variables de entorno": `VITE_API_BASE_URL`, `VITE_WEATHER_DEFAULT_LAT`, `VITE_WEATHER_DEFAULT_LON`
- [x] 2.6 Escribir sección "Estructura del proyecto": árbol `src/modules/<feature>/` con capas domain/infra/application/presentation
- [x] 2.7 Escribir sección "Funcionalidades principales": tabla con módulos (auth, pacientes, dashboard, admin/users, admin/roles, admin/permissions) + rutas + perfiles RBAC
- [x] 2.8 Escribir sección "Credenciales de prueba": nota explícita de que las define el backend vía seeders, link al repo backend
- [x] 2.9 Escribir sección "Comandos": tabla completa con `dev`, `build`, `preview`, `test`, `test:run`, `test:coverage`, `lint`, `lint:fix`, `typecheck`, `format`, `test:e2e`, `quality`, `verify`
- [x] 2.10 Escribir sección "Documentación": enlaces a `docs/INDICE.md` e `instructions.md` con descripción de cada uno
- [x] 2.11 Agregar enlace bidireccional en `instructions.md` hacia el README (si no existe ya)

## Phase 3: Verificación

- [x] 3.1 Verificar que `VITE_API_URL` NO aparece en el nuevo README (se reemplazó por `VITE_API_BASE_URL`)
- [x] 3.2 Verificar que la URL del repo backend está presente: `github.com/jlozanoDev/materiaGris_api.git`
- [x] 3.3 Verificar que los enlaces a `docs/INDICE.md` e `instructions.md` están presentes y resuelven
- [x] 3.4 Verificar tono profesional: sin expresiones coloquiales, sin "si quieres, puedo añadir", sin primera persona
- [x] 3.5 Verificar tabla de comandos: los 13 scripts de `package.json` están listados
- [x] 3.6 Revisión final contra los 7 success criteria de la propuesta (ver proposal.md §Success Criteria)
