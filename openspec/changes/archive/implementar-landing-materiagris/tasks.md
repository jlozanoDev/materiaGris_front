# Tasks: implementar-landing-materiagris

## Review Workload Forecast
- Estimated changed lines: ~500-700
- 400-line budget risk: Yes
- Chained PRs recommended: No (size:exception approved)
- Decision needed before apply: No

## Tareas

### T1 — Configurar design tokens y utilidad glass
- Agregar colores `mg-*` a `tailwind.config.cjs`
- Agregar clase `.glass` en `src/style.css`
- Archivos: `tailwind.config.cjs`, `src/style.css`
- Verificación: build sin errores

### T2 — Copiar assets de maqueta
- Copiar 6 archivos de `maqueta/` a `src/assets/` con nombres limpios
- Archivos nuevos en `src/assets/`
- Verificación: imports funcionan en componentes

### T3 — LandingHeader
- Componente `src/modules/landing/presentation/components/LandingHeader.vue`
- Nav fija con glass effect, logo, links, botones
- Responsive: ocultar nav links en <768px

### T4 — LandingHero
- Componente `src/modules/landing/presentation/components/LandingHero.vue`
- Fondo oscuro, glow orbs, logo cerebro, título con gradiente, CTAs

### T5 — LandingTagline
- Componente `src/modules/landing/presentation/components/LandingTagline.vue`
- Barra con gradiente, logo + texto de valor

### T6 — LandingModules
- Componente `src/modules/landing/presentation/components/LandingModules.vue`
- 3 glass-cards en grid responsive
- Fondo decorativo `sangre-bg.png`

### T7 — LandingMetrics
- Componente `src/modules/landing/presentation/components/LandingMetrics.vue`
- Sección oscura con 3 estadísticas grandes

### T8 — LandingSecurity
- Componente `src/modules/landing/presentation/components/LandingSecurity.vue`
- 2 columnas: cards de seguridad + card HCE destacada

### T9 — LandingPricing
- Componente `src/modules/landing/presentation/components/LandingPricing.vue`
- 3 pricing cards, Avanzado destacado con label "Recomendado"

### T10 — LandingCta
- Componente `src/modules/landing/presentation/components/LandingCta.vue`

### T11 — LandingFooter
- Componente `src/modules/landing/presentation/components/LandingFooter.vue`

### T12 — LandingPage container y router
- Crear `src/modules/landing/presentation/pages/LandingPage.vue` (importa los 9 componentes)
- Actualizar `src/core/router/index.ts` para apuntar al nuevo módulo

### T13 — Limpiar landing vieja
- Eliminar `src/modules/auth/presentation/pages/LandingPage.vue`
- Verificar que no haya imports rotos

### T14 — Verificación final
- `npm run build` sin errores
- Revisar que la ruta `/welcome` carga correctamente
