# Proposal: Revisión Completa del README.md

## Intent

Reescribir `README.md` de un stub informal de 60 líneas a un punto de entrada profesional que refleje la madurez real del proyecto: Clean Architecture hexagonal, 6 módulos, 22 rutas, 139+ tests, RBAC granular, y 38+ archivos de documentación. Corregir errores factuales (`VITE_API_URL` → `VITE_API_BASE_URL`) y eliminar tono coloquial.

## Scope

### In Scope
- Descripción funcional: qué es MateriaGris, qué problema resuelve
- Tabla completa del stack tecnológico (Vue 3.5, Vite 8, Pinia 3, Vuetify 4, Tailwind 4, TypeScript 5.9, TipTap, etc.)
- Requisitos previos: Node ≥18 recomendado, URL del repo backend
- Variables de entorno: `VITE_API_BASE_URL`, `VITE_WEATHER_DEFAULT_LAT`, `VITE_WEATHER_DEFAULT_LON`
- Instalación y ejecución: clone, `npm install`, `.env`, `npm run dev`
- Estructura del proyecto: árbol de módulos + capas (4 por módulo)
- Funcionalidades principales: tabla de módulos, rutas, perfiles RBAC (Médico, Administrador, Recepcionista)
- Credenciales de prueba: nota explícita de que el backend las define vía seeders
- Tabla completa de comandos npm: dev, build, preview, test, test:e2e, lint, format, typecheck, quality, verify
- Enlaces: `docs/INDICE.md`, `instructions.md` (referencia mutua)

### Out of Scope
- Detalles de arquitectura → ya en `docs/tecnica/`
- Modelo RBAC → ya en `docs/tecnica/modelo-permisos-roles.md`
- Flujos de usuario → ya en `docs/funcional/flujos/`
- Instrucciones de backend → pertenecen al repo backend
- Modificar `instructions.md`

## Capabilities

### New Capabilities
None — documentation-only change.

### Modified Capabilities
None — documentation-only change.

## Approach

Reescritura completa en español profesional. Tablas sobre prosa para escaneabilidad. Versiones con disclaimer: "consultar `package.json` para versiones exactas". Referencia mutua con `instructions.md`. Sin duplicar contenido de `docs/` — solo enlaces.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `README.md` | Rewritten | Reemplazo completo (~150-200 líneas) |
| `instructions.md` | Referenced | Agregar enlace bidireccional README ↔ instructions |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Version rot: dependencias en README se desactualizan | Medium | Disclaimer "ver `package.json` para versiones exactas" |
| Credential gap: backend define usuarios de prueba, no el frontend | High | Nota explícita + link al repo backend y sus seeders |
| Divergencia con `instructions.md` | Low | Enlaces mutuos; README es entrypoint, instructions.md es para devs activos |

## Rollback Plan

`git checkout HEAD -- README.md` restaura el original. Sin dependencias de código sobre el README.

## Dependencies

Ninguna. Cambio puramente documental.

## Success Criteria

- [ ] Secciones cubiertas: descripción, stack, instalación, estructura, funcionalidades, credenciales
- [ ] Error `VITE_API_URL` corregido a `VITE_API_BASE_URL`
- [ ] URL del repo backend presente: `github.com/jlozanoDev/materiaGris_api.git`
- [ ] Enlaces a `docs/INDICE.md` e `instructions.md` presentes
- [ ] Tono profesional, sin lenguaje informal
- [ ] Tabla de comandos completa (10 scripts npm)
- [ ] Tabla de funcionalidades con módulos, rutas y perfiles
