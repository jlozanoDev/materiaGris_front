# Delta Spec — Project Presentation Slides

## ADDED Requirements

### slides-route: Route & Access

| # | Requirement | Strength |
|---|-------------|----------|
| SL-ROUTE-01 | A new route `/slides` MUST be added to Vue Router with lazy-loaded component | MUST |
| SL-ROUTE-02 | The slides route SHALL be public (no `requiresAuth` meta) | MUST |
| SL-ROUTE-03 | The slides page MUST render in full-screen mode without sidebar, header, or app chrome | MUST |
| SL-ROUTE-04 | The presentation MUST be accessible at `{baseUrl}/slides` | MUST |
| SL-ROUTE-05 | A documentation entry MUST be added to `docs/funcional/modulos/` and `docs/INDICE.md` with the public URL for the presentation | MUST |

#### Scenario: Navigate to slides
- GIVEN a browser at the application root
- WHEN the user navigates to `/slides`
- THEN the slideshow loads full-screen with no sidebar, no topbar, no app chrome
- AND the URL is `{baseUrl}/slides`

#### Scenario: Slides are public
- GIVEN a user who is not authenticated
- WHEN they access `/slides`
- THEN the slides render without redirecting to login

### slides-content: Slide Deck Content

| # | Requirement | Strength |
|---|-------------|----------|
| SL-CONT-01 | The slideshow MUST present 8 slides in sequence | MUST |
| SL-CONT-02 | Each slide MUST fill the full viewport (`100vh x 100vw`) | MUST |
| SL-CONT-03 | **Slide 1 (Portada)**: MUST show the MaterIA Gris logo (`logo-materiagris.svg`), the project name, and tagline "Tu socio de IA para una clínica inteligente y humana" with animated particle network background | MUST |
| SL-CONT-04 | **Slide 2 (El Problema)**: MUST describe pain points of traditional clinic management — paper records, lost files, typing errors, slow report generation — using visual icons and expanded text | MUST |
| SL-CONT-05 | **Slide 3 (La Solución)**: MUST present the 3 pillars (Informes Inteligentes, Diagnóstico Asistido, Consultas Grabadas) with brief expanded descriptions, using `sangre-bg.png` as subtle background | MUST |
| SL-CONT-06 | **Slide 4 (Gestión de Pacientes)**: MUST showcase patient management — search, create, edit, clinical records — with relevant icons and `doctor.png` or similar visual | MUST |
| SL-CONT-07 | **Slide 5 (Informes con IA)**: MUST explain the AI report pipeline — recording → transcription → structured data extraction → confidence review → signing — with detailed text | MUST |
| SL-CONT-08 | **Slide 6 (Workflow)**: MUST illustrate the 6-step workflow (buscar → plantilla → grabar → IA → revisar → firmar) in a clean visual layout | MUST |
| SL-CONT-09 | **Slide 7 (Admin RBAC)**: MUST describe the role-based access system — Médico, Administrador, Recepcionista — with permission granularity | MUST |
| SL-CONT-10 | **Slide 8 (Stack y Cierre)**: MUST display the technology stack (Vue 3, Vite 8, Pinia, Vuetify, Tailwind, TypeScript, Anime.js, Vitest, Playwright) and links to repo/production | MUST |

#### Scenario: All slides render in order
- GIVEN the slideshow is loaded
- WHEN the user navigates through all 8 slides
- THEN each slide displays its expected content with full viewport coverage

### slides-navigation: Controls & Interaction

| # | Requirement | Strength |
|---|-------------|----------|
| SL-NAV-01 | Keyboard navigation MUST work: ArrowRight / ArrowDown → next, ArrowLeft / ArrowUp → previous | MUST |
| SL-NAV-02 | Slide indicator (current/total) MUST be visible, e.g. "3 / 8" | MUST |
| SL-NAV-03 | A progress bar at the bottom MUST show overall slide progress | MUST |
| SL-NAV-04 | Auto-advance MAY be available with configurable interval (default: disabled) | MAY |
| SL-NAV-05 | Click/tap on right half of slide SHALL advance, left half SHALL go back | SHOULD |

#### Scenario: Keyboard navigation
- GIVEN slide 1 is displayed
- WHEN the user presses ArrowRight
- THEN slide 2 appears with a transition animation

#### Scenario: Progress indicator
- GIVEN any slide is displayed
- WHEN the user looks at the navigation chrome
- THEN they see "N / 8" and a progress bar at the bottom

### slides-animations: Visual Effects

| # | Requirement | Strength |
|---|-------------|----------|
| SL-ANIM-01 | Slide transitions MUST use Anime.js for 3D/transform effects between slides | MUST |
| SL-ANIM-02 | Slide 1 MUST include the existing `useParticleNetwork` canvas animation | MUST |
| SL-ANIM-03 | Cards and text elements MUST animate in (staggered) when each slide becomes active | SHOULD |
| SL-ANIM-04 | Transitions SHALL use a 3D card-flip or cube-rotate effect (not simple fade) | SHOULD |
| SL-ANIM-05 | Animated gradient backgrounds MAY shift subtly during the presentation | MAY |
| SL-ANIM-06 | `prefers-reduced-motion` MUST be respected — fall back to fade transitions | MUST |

#### Scenario: Slide transition animates
- GIVEN the user is on slide N
- WHEN they navigate to slide N+1
- THEN the transition uses a 3D card-flip animation powered by Anime.js (duration ~600ms)

#### Scenario: Reduced motion
- GIVEN the user has `prefers-reduced-motion: reduce` enabled
- WHEN slides change
- THEN transitions use simple crossfade (no 3D effects)

### slides-branding: Design & Visual Identity

| # | Requirement | Strength |
|---|-------------|----------|
| SL-BRAND-01 | The presentation MUST use the project's design tokens: purple `#7c3aed`, cyan `#06b6d4`, dark bg `#0f0a1e` | MUST |
| SL-BRAND-02 | Typography MUST use Inter (the project's font family) | MUST |
| SL-BRAND-03 | The project logo MUST appear on every slide (small, top-left or bottom-left) | SHOULD |
| SL-BRAND-04 | Project images (`doctor.png`, `hero-bg-right.png`, `sangre-bg.png`) SHOULD be used where relevant | SHOULD |
| SL-BRAND-05 | Glassmorphism effects (`.glass`, `.glass-card`) SHOULD be used for content cards | SHOULD |
| SL-BRAND-06 | Lucide icons MUST be used for feature illustrations | SHOULD |

### slides-documentation: Docs & URL

| # | Requirement | Strength |
|---|-------------|----------|
| SL-DOC-01 | A file `docs/presentacion/PRESENTACION.md` MUST be created documenting the presentation URL and how to access it | MUST |
| SL-DOC-02 | `docs/INDICE.md` MUST be updated with an entry for the presentation | MUST |

## Technical Context

### Module structure (new)
```
src/modules/presentation/
  presentation/
    pages/
      SlidesPage.vue     # Main slideshow component
    composables/
      useSlideShow.ts     # Slide navigation + anime.js controller
    components/
      SlidePortada.vue
      SlideProblema.vue
      SlideSolucion.vue
      SlidePacientes.vue
      SlideInformes.vue
      SlideWorkflow.vue
      SlideAdmin.vue
      SlideStack.vue
```

### Stack additions
- `animejs` (already in `package.json` — v4.4.1)
- No new dependencies required

### Route
```typescript
{ path: "/slides", name: "Slides", component: () => import("@/modules/presentation/presentation/pages/SlidesPage.vue") }
```
