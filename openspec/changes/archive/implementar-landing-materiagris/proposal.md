# Propuesta: implementar-landing-materiagris

## Intent

Implementar la landing page de MaterIA Gris desde la maqueta en `/maqueta/`, reemplazando la `LandingPage.vue` existente. La maqueta es un handoff de OpenDesign con diseño glassmorphism, paleta violeta/cyan, y 7 secciones.

## Estado actual

- Hay una `LandingPage.vue` en `src/modules/auth/presentation/pages/LandingPage.vue`
- Ruta `/welcome`, sin auth requerida. Usuarios no auth en `/` redirigen a `/welcome`.
- El diseño actual es diferente al de la maqueta: usa Tailwind, lucide-vue-next, gsap, y otra estructura.
- El stack: Vue 3.5 + Composition API, Vite 5, Tailwind CSS, TypeScript, Pinia.

## Alcance (in scope)

1. **Nuevo módulo `src/modules/landing/`** con estructura estándar (sin necesidad de domain/infra porque es una landing estática) o directamente en `presentation/pages/`.
2. **Header** — nav fija con logo, links, botones Acceder / Solicitar demo.
3. **Hero** — fondo oscuro, logo cerebro, gradiente violeta→cyan, tagline, CTAs.
4. **Tagline bar** — barra con gradiente y texto de valor.
5. **Módulos de análisis** — 3 glass-cards: Informes Inteligentes, Diagnóstico Asistido, Gestión del Paciente.
6. **Métricas** — sección oscura con +2.400, 80%, <60s.
7. **Seguridad e Integración** — cards glass con imágenes, iconos, lista de HCEs.
8. **Planes** — pricing grid: Básico ($0), Avanzado ($149), Hospital (a medida).
9. **CTA final + Footer**.
10. **Assets**: copiar SVG/PNG de maqueta a `src/assets/`.
11. **Router**: reemplazar ruta `/welcome` para que apunte al nuevo componente.
12. **Design tokens**: extraer tokens CSS de la maqueta (`--accent: #7c3aed`, `--cyan: #06b6d4`, etc.) e integrarlos con Tailwind.

## Fuera de alcance

- Páginas internas de la app (login, dashboard, patients, etc.)
- Funcionalidad de botones (solo UI estática, sin lógica de negocio)
- Integración real con API
- Responsive testing en los 9 viewports del handoff (se hará en verify)
- Animaciones avanzadas (solo hover/transition básicas)

## Approach

### Módulo landing

Crear `src/modules/landing/presentation/pages/LandingPage.vue` como un SFC autocontenido. A diferencia de otros módulos, no necesita domain/infra/application porque es una página de marketing estática. Si crece, se refactoriza.

### Estructura de componentes (opcional)

La landing tiene ~700 líneas de HTML. Para mantenerla mantenible, dividir en componentes:
- `LandingHeader.vue` — topnav
- `LandingHero.vue` — hero section
- `LandingTagline.vue` — tagline bar
- `LandingModules.vue` — 3 glass cards
- `LandingMetrics.vue` — stats section
- `LandingSecurity.vue` — seguridad + integración
- `LandingPricing.vue` — planes
- `LandingCta.vue` — call to action
- `LandingFooter.vue` — footer

O directamente en la página si la división es prematura. Decidir en design.

### Assets

Copiar de `maqueta/`:
- `mq11fb1b-logo.svg` → `src/assets/logo-materiagris.svg`
- `mq126pyl-sangre-bg.png` → `src/assets/sangre-bg.png`
- Las imágenes Gemini generadas → `src/assets/` con nombres descriptivos
- Limpiar archivos duplicados/derivados

### Design tokens

Extraer las variables CSS de la maqueta y agregarlas a `tailwind.config.cjs` como colores personalizados:
- `accent: '#7c3aed'`
- `accent-hover: '#6d28d9'`
- `cyan: '#06b6d4'`
- `bg-dark: '#0f0a1e'`
- etc.

### Router

Cambiar la ruta `/welcome` para que apunte al nuevo `LandingPage.vue` del módulo landing.

### Tests

Sin tests específicos para la landing (UI estática). El build de Vite como verificación.

## Riesgos

1. **Tamaño**: ~700 líneas de HTML + CSS → puede exceder 400 líneas cambiadas. Evaluar split en PRs.
2. **Assets grandes**: PNGs generados por Gemini pueden ser pesados. Optimizar si es necesario.
3. **Consistencia visual**: la maqueta usa CSS nativo con glassmorphism. El proyecto usa Tailwind. Habrá que mezclar ambos o mantener el CSS de la maqueta.
4. **Landing existente**: hay que asegurar que la ruta `/welcome` y el redirect `/` → `/welcome` sigan funcionando.

## Tamaño estimado

- ~8-10 archivos nuevos (componentes Vue + assets)
- ~2 archivos modificados (router, tailwind.config)
- ~500-700 líneas de código nuevas
- ~50 líneas de configuración
