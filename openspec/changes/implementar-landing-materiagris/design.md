# Design: implementar-landing-materiagris

## 1. Component Tree

```
App.vue
└── <router-view>
    └── LandingPage.vue           (container layout)
         ├── LandingHeader.vue     (fixed topnav)
         ├── LandingHero.vue       (100vh hero)
         ├── LandingTagline.vue    (gradient bar)
         ├── LandingModules.vue    (3 glass cards grid)
         ├── LandingMetrics.vue    (dark stats section)
         ├── LandingSecurity.vue   (2-col: security cards + HCE)
         ├── LandingPricing.vue    (3 pricing cards)
         ├── LandingCta.vue        (dark CTA section)
         └── LandingFooter.vue     (footer)
```

LandingPage.vue es el layout container. Renderiza los componentes secuencialmente, sin lógica de negocio. No usa Pinia ni fetching — es UI estática.

## 2. Arquitectura de Componentes

### Principios

- **Sin dependencias externas**: no se importan stores, servicios, composables de la app. La landing es autónoma.
- **Props down, events up**: la landing no maneja estado complejo. Cada botón emite un evento o usa router-link directo.
- **Scoped styles**: cada componente usa `<style scoped>` para encapsular sus estilos. Las variables CSS globales (tailwind mg-*) son la excepción.
- **Sin lógica de negocio**: los botones tienen `@click` mínimo (router.push o placeholder comment).

### Contratos de Componentes

| Componente | Props | Events | Slots |
|------------|-------|--------|-------|
| `LandingHeader` | none | `@login`, `@demo` | — |
| `LandingHero` | none | `@demo`, `@view-platform` | — |
| `LandingTagline` | none | — | — |
| `LandingModules` | none | — | — |
| `LandingMetrics` | none | — | — |
| `LandingSecurity` | none | — | — |
| `LandingPricing` | none | `@select-plan` | — |
| `LandingCta` | none | `@demo`, `@sales` | — |
| `LandingFooter` | none | — | — |

Ningún componente recibe props porque la landing es contenido estático. Si en el futuro se necesitan datos dinámicos (ej. precios desde API), se agregan props.

## 3. Responsive Strategy

Se usan las utility classes responsive de Tailwind:

| Breakpoint | Tailwind | Layout |
|------------|----------|--------|
| < 640px | `max-sm:` | 1 columna, hero compacto, nav links ocultos |
| 640-768px | `sm:` a `md:` | 2 columnas en grids |
| 768-1024px | `md:` a `lg:` | 2-3 columnas |
| 1024px+ | `lg:` | Layout completo, 3 columnas |

Grid de módulos y pricing:
- `grid-cols-1` → `md:grid-cols-2` → `lg:grid-cols-3`

Header nav:
- Desktop: nav links visibles
- `< 768px`: solo logo y botones de acción

## 4. Design Tokens Implementation

Los tokens de la maqueta se agregan al `tailwind.config.cjs` como colores `mg-*`.

Uso en componentes:
```html
<!-- Ejemplo: botón primary -->
<button class="bg-mg-accent text-white rounded-[10px] px-6 py-3 font-semibold
               hover:bg-mg-accent-hover shadow-[0_1px_12px_rgba(124,58,237,0.30)]">
```

Para glassmorphism, crear una clase utilitaria global en `src/style.css`:
```css
.glass {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 20px;
}
```

## 5. Assets Management

Copiar assets de `maqueta/` a `src/assets/` con nombres limpiados. Importarlos en los componentes Vue usando el alias `@/assets/`.

```ts
import logoSvg from '@/assets/logo-materiagris.svg'
```

No se requiere optimización adicional (los SVGs ya son livianos). Los PNGs se sirven como están.

## 6. Router Integration

Un solo cambio en `src/core/router/index.ts`:

```diff
- { path: "/welcome", name: "Landing", component: () => import("@/modules/auth/presentation/pages/LandingPage.vue") },
+ { path: "/welcome", name: "Landing", component: () => import("@/modules/landing/presentation/pages/LandingPage.vue") },
```

La lógica de redirects existente (no-auth → `/welcome`, auth → `/dashboard`) sigue intacta.

## 7. Eliminación de código legacy

- Borrar `src/modules/auth/presentation/pages/LandingPage.vue`
- La landing vieja usaba `lucide-vue-next` y `gsap`. Si ningún otro componente los usa, considerar desinstalarlos (fuera de scope por ahora).

## 8. Testing

Al ser UI estática sin lógica:
- **Build check**: `npm run build` debe pasar sin errores
- **Visual check**: manual o Playwright screenshot
- **Unit tests**: no requeridos para componentes puramente presentacionales
- **Strict TDD**: no aplica (no hay lógica que testear)

## 9. Estados de componentes

| Componente | Estado único |
|------------|--------------|
| Todos | Render estático. Sin loading, empty, error. |
| Botones | Hover + active vía Tailwind (`hover:`, `active:`) |

No se implementan estados de carga porque la landing no consume APIs.
