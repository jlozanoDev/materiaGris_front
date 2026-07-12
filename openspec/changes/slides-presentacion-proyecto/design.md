# Technical Design — Project Presentation Slides

## Architecture

### Module Structure
```
src/modules/presentation/
  presentation/
    pages/
      SlidesPage.vue              # Orchestrator: full-screen slideshow container
    components/
      SlidePortada.vue            # Slide 1: Logo + particle network + tagline
      SlideProblema.vue           # Slide 2: Pain points of traditional clinic mgmt
      SlideSolucion.vue           # Slide 3: 3 pillars solution overview
      SlidePacientes.vue          # Slide 4: Patient management showcase
      SlideInformes.vue           # Slide 5: AI report pipeline
      SlideWorkflow.vue           # Slide 6: 6-step workflow visualization
      SlideAdmin.vue              # Slide 7: RBAC admin panel
      SlideStack.vue              # Slide 8: Tech stack + links
      SlideNav.vue                # Bottom nav: progress bar + slide counter + arrows
    composables/
      useSlideShow.ts             # Slide state machine + anime.js transitions
```

### Route
```typescript
{ path: "/slides", name: "Slides", component: () => import("@/modules/presentation/presentation/pages/SlidesPage.vue") }
```
Meta: no `requiresAuth`, no permissions.

## Component Design

### SlidesPage.vue (Orchestrator)
```
┌──────────────────────────────────────┐
│  Full-screen container (h-screen)     │
│  Dark bg: #0f0a1e                     │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  CURRENT SLIDE (v-if)           │ │
│  │  Transition via anime.js         │ │
│  │  Full viewport                   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  SlideNav (bottom overlay)       │ │
│  │  - Progress bar                  │ │
│  │  - "N / 8" counter              │ │
│  │  - Arrow controls                │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Logo watermark (bottom-left)    │ │
│  └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Data Flow

```
useSlideShow composable
├── currentSlide: Ref<number> (0-indexed, 0-7)
├── totalSlides: 8
├── direction: Ref<'next' | 'prev'>  (for animation direction)
├── isAnimating: Ref<boolean>        (lock during transition)
│
├── goNext(): void
│   └── anime.js transition → currentSlide++
├── goPrev(): void
│   └── anime.js transition → currentSlide--
├── goTo(index: number): void
│   └── anime.js transition → currentSlide = index
│
├── progress: Computed<number>       // (currentSlide + 1) / totalSlides
├── slideLabel: Computed<string>     // "N / 8"
│
├── initKeyboard(): void             // Arrow key listeners
├── initClickZones(): void           // Click left/right halves
├── destroy(): void                  // Cleanup on unmount
│
└── ANIMATION ENGINE (anime.js)
    ├── transitionOut(slideEl, direction)
    │   ├── 3D card-flip: rotateY(90deg) + scale(0.9) + translateZ
    │   └── duration: 400ms, easing: easeInOutCubic
    ├── transitionIn(slideEl, direction)
    │   ├── 3D card-flip: rotateY(-90deg) → 0deg + scale(0.9 → 1)
    │   └── duration: 500ms, easing: easeOutCubic
    ├── staggerIn(elements)
    │   ├── Each child fades up with delay stagger
    │   └── stagger: 80ms, translateY(30px → 0)
    └── reducedMotion: boolean
        └── If true → simple crossfade (opacity 0→1, 300ms)
```

### Per-slide content structure

#### Slide 1 — Portada
```
┌──────────────────────────────────────┐
│  Particle network canvas (full)      │
│  ┌────────────────────────────────┐  │
│  │  Logo SVG (72px)               │  │
│  │  "MaterIA Gris" (huge)        │  │
│  │  Tagline (subtle)              │  │
│  └────────────────────────────────┘  │
│  Gradient glow orbs                 │
└──────────────────────────────────────┘
```
- Reuses `useParticleNetwork` composable
- Content centered, animated in with stagger

#### Slide 2 — El Problema
```
┌──────────────────────────────────────┐
│  Title: "El desafío de la gestión    │
│          clínica tradicional"         │
│                                       │
│  4 pain-point cards (glassmorphism): │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │📋  │ │⏱️  │ │❌  │ │📄  │       │
│  │Papel│ │Tiempo│ │Errores│ │Archivo│
│  └────┘ └────┘ └────┘ └────┘       │
│  Each with expanded description       │
└──────────────────────────────────────┘
```

#### Slide 3 — La Solución
```
┌──────────────────────────────────────┐
│  Title: "Tres pilares, una           │
│          plataforma"                  │
│  Subtitle with cyan accent            │
│                                       │
│  3 columns (like LandingModules):     │
│  ┌────────┐┌────────┐┌────────┐     │
│  │Informes││Diag.   ││Consultas│     │
│  │ IA     ││Asistido││Grabadas │     │
│  │(doc icon)│(pulse)││(mic)   │     │
│  └────────┘└────────┘└────────┘     │
│  Expanded text per pillar             │
│  Subtle sangre-bg.png overlay         │
└──────────────────────────────────────┘
```

#### Slides 4-7 follow similar pattern
Each slide has:
- Title with mono badge
- Content cards or layout specific to topic
- Staggered entrance on activation
- Project visuals where relevant

#### Slide 8 — Stack y Cierre
```
┌──────────────────────────────────────┐
│  Title: "Stack tecnológico"          │
│                                       │
│  Tech badges grid:                    │
│  Vue 3 · Vite 8 · Pinia · Router     │
│  Vuetify · Tailwind · TypeScript     │
│  Anime.js · Vitest · Playwright      │
│                                       │
│  Divider                              │
│  CTA: "Producción" button             │
│  Links to repo + production URL       │
│  Small logo bottom-right              │
└──────────────────────────────────────┘
```

## Animation Architecture

### Transition flow (anime.js)

```
goNext() called
  │
  ├─ isAnimating = true
  ├─ Capture current slide element
  ├─ direction = 'next'
  │
  ├─ anime({ targets: outgoingSlide,
  │          rotateY: [0, -90],
  │          scale: [1, 0.9],
  │          opacity: [1, 0],
  │          duration: 400,
  │          easing: 'easeInOutCubic' })
  │
  ├─ AFTER complete:
  │   ├─ Remove outgoing slide from DOM
  │   ├─ Mount incoming slide (v-if)
  │   ├─ anime({ targets: incomingSlide,
  │   │          rotateY: [90, 0],
  │   │          scale: [0.9, 1],
  │   │          opacity: [0, 1],
  │   │          duration: 500,
  │   │          easing: 'easeOutCubic' })
  │   ├─ staggerIn() for content children
  │   └─ isAnimating = false
```

### Animation variants by slide
- **Slide 1**: Particle network runs continuously. Content animates in on mount.
- **Slides 2-7**: Glass cards stagger in with `translateY(30px) → 0` + `opacity: 0→1`
- **Slide 8**: Badges stagger with scale bounce effect

### Reduced motion
```typescript
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (reducedMotion) {
  // Use opacity crossfade instead of 3D transforms
  // Reduce all durations to 200ms
  // Disable stagger animations
}
```

## States

### Empty / Loading
- No loading state needed (all content is static/bundled)
- Particle network has internal initialization (canvas mount)

### Edge Cases
- **Browser without canvas support**: Slide 1 shows static dots instead of particle network
- **Very small viewport (<480px)**: Slides stack vertically, text scales down
- **Reduced motion**: All 3D transforms become opacity fades
- **Keyboard only**: All navigation works via arrow keys, visible focus indicators
- **Print**: Basic print styles hide animations, show all slides stacked

### Error States
- N/A — no external data fetching in the presentation

## Dependencies

### Internal
- `vue-router` — navigation (already present)
- `useParticleNetwork` composable (already exists at `auth/presentation/composables/`)

### External
- `animejs` (v4.4.1, already in `package.json`)
- `lucide-vue-next` (already in `package.json`)

### No new npm dependencies required

## Documentation

### New file
```
docs/presentacion/PRESENTACION.md
```
Contains: presentation URL, slide list, how to access, how to modify.

### Updated files
- `docs/INDICE.md` — add entry for presentation module
