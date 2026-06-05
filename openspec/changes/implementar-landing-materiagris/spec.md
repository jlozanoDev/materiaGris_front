# Spec: implementar-landing-materiagris

## 1. Design System Updates

### Tailwind Config — colores personalizados

Agregar a `tailwind.config.cjs` en `theme.extend.colors`:

```js
colors: {
  'mg': {
    'bg-dark': '#0f0a1e',
    'bg': '#f6f7fb',
    'surface': '#ffffff',
    'fg': '#0b0817',
    'fg-on-dark': '#e8e4f0',
    'muted': '#6b6b7b',
    'muted-on-dark': '#9690a8',
    'border': '#e2e0e8',
    'border-glass': 'rgba(255,255,255,0.10)',
    'accent': '#7c3aed',
    'accent-hover': '#6d28d9',
    'accent-soft': 'rgba(124,58,237,0.10)',
    'accent-glow': '#a78bfa',
    'cyan': '#06b6d4',
    'cyan-glow': 'rgba(6,182,212,0.25)',
    'cyan-soft': 'rgba(6,182,212,0.08)',
    'success': '#10b981',
    'warn': '#f59e0b',
    'danger': '#ef4444',
  }
}
```

### Tipografía

- Display/headings: `'Inter', -apple-system, system-ui, sans-serif`, weight 700-800
- Body: `'Inter', -apple-system, system-ui, sans-serif`, weight 400
- Mono: `'JetBrains Mono', ui-monospace, monospace` para métricas y datos
- La fuente Inter ya está importada en `index.html` del frontend o vía Google Fonts en el entry point

### Glassmorphism utility classes

Crear utilidades globales o componentes base para glassmorphism (backdrop-filter: blur, bg semitransparente, border sutil). Reutilizables en módulos, métricas y cards de seguridad.

---

## 2. Landing Module Structure

```
src/modules/landing/
  presentation/
    pages/
      LandingPage.vue      ← container que importa todos los componentes
    components/
      LandingHeader.vue     ← topnav fijo
      LandingHero.vue       ← hero con dark bg, logo cerebro, gradiente
      LandingTagline.vue    ← barra con gradiente y texto
      LandingModules.vue    ← 3 glass-cards (informes, diagnóstico, gestión)
      LandingMetrics.vue    ← sección oscura con estadísticas
      LandingSecurity.vue   ← seguridad + integración + HCE
      LandingPricing.vue    ← tabla de planes (3 columnas)
      LandingCta.vue        ← call-to-action final
      LandingFooter.vue     ← footer con links y copyright
  application/
    containers/            ← vacío por ahora (landing estática)
```

LandingPage.vue es el contenedor que importa y renderiza los sub-componentes en orden.

---

## 3. Component Specs

### 3.1 LandingHeader

| Prop | Descripción |
|------|-------------|
| `sticky` | Nav fija al tope con backdrop-filter |
| Logo | `mq11fb1b-logo.svg` + texto "MaterIA Gris" |
| Nav links | Plataforma, Precios, Blog, Documentación |
| Acciones | Botón "Acceder" (ghost) + "Solicitar demo" (primary) |

Comportamiento responsive: nav links se ocultan en mobile (< 768px).

### 3.2 LandingHero

| Prop | Descripción |
|------|-------------|
| Background | `#0f0a1e` con glow orbs (purple + cyan) |
| Logo cerebro | `mq11fb1b-logo.svg` 72x72 |
| Eyebrow | "Plataforma clínica con inteligencia artificial" |
| Título | "Tu socio de IA para una<br><span>práctica clínica optimizada y humana</span>" |
| CTAs | "Solicitar demo gratuita" (primary) + "Ver plataforma" (ghost) |
| Background image | Decorativa a la derecha (`mq11lx90-mq119973-logo-imagen.png`) en desktop |
| Altura | 100vh minimum |

### 3.3 LandingTagline

Barra con gradiente violeta→cyan sutil. Dos columnas: marca (logo + nombre) + texto de valor.

| Elemento | Detalle |
|----------|---------|
| Logo | `mq11tk1f-mq11fb1b-logo.svg` |
| Texto | "Diagnóstico asistido, informes inteligentes y gestión integral del paciente en una sola plataforma." |
| Highlight | "Procesamiento en menos de 60 segundos." en violeta |

### 3.4 LandingModules

3 glass-cards en grid (3 columnas desktop, 1 columna mobile):

1. **Generación de Informes Inteligentes**
   - Icono: file-text SVG
   - Descripción: "La IA redacta informes clínicos estructurados..."
   - Preview visual

2. **Diagnóstico Asistido**
   - Icono: activity/pulse SVG (cyan accent)
   - Descripción: "El motor de IA analiza síntomas..."
   - Preview con dots animados

3. **Gestión Integral del Paciente**
   - Icono: clock SVG
   - Descripción: "Historial clínico unificado..."
   - Timeline preview

Fondo: imagen `mq126pyl-sangre-bg.png` como background decorativo (opacity 0.15).

### 3.5 LandingMetrics

Sección oscura (`section-dark`). 3 columnas con estadísticas:

| Métrica | Valor |
|---------|-------|
| Informes generados | +2.400 |
| Reducción errores | 80% |
| Tiempo promedio | <60s |

Números grandes (clamp 48px-72px), etiquetas en muted.

### 3.6 LandingSecurity

Dos columnas:
- **Izquierda**: eyebrow + título + descripción + 2 cards glass (Seguridad de Datos, Integración Fluida)
- **Derecha**: card glass destacada con "Conexión directa con tu HCE" + tags (Epic, Cerner, InterSystems, SAP Health)

Cada card incluye:
- Imagen decorativa (de las Gemini-generated)
- Icono SVG
- Título
- Descripción breve

### 3.7 LandingPricing

3 pricing cards: Básico ($0), Avanzado ($149), Hospital (a medida).

Card Avanzado destacada con el label "Recomendado" y borde violeta.

Cada card tiene:
- Nombre del plan
- Texto descriptivo
- Precio
- Lista de features con checkmarks
- Botón CTA

### 3.8 LandingCta

Sección oscura centrada:
- Eyebrow "Comienza hoy"
- Título "Transforma tu práctica clínica con inteligencia artificial"
- Lead "Únete a más de 300 profesionales..."
- Botones: "Solicitar demo gratuita" + "Hablar con ventas"

### 3.9 LandingFooter

Footer oscuro con:
- Logo + nombre + tagline
- Links: Aviso legal, Privacidad, Términos
- Copyright © 2026

---

## 4. Router Update

En `src/core/router/index.ts`:

```ts
// Cambiar de:
{ path: "/welcome", name: "Landing", component: () => import("@/modules/auth/presentation/pages/LandingPage.vue") },

// a:
{ path: "/welcome", name: "Landing", component: () => import("@/modules/landing/presentation/pages/LandingPage.vue") },
```

Y eliminar el archivo viejo: `src/modules/auth/presentation/pages/LandingPage.vue`.

---

## 5. Assets

Copiar estos archivos de `maqueta/` a `src/assets/`:

| Origen | Destino |
|--------|---------|
| `mq11fb1b-logo.svg` | `logo-materiagris.svg` |
| `mq11lx90-mq119973-logo-imagen.png` | `hero-bg-right.png` |
| `mq126pyl-sangre-bg.png` | `sangre-bg.png` |
| `mq12fw42-Gemini_Generated_Image_j8zv0qj8zv0qj8zv.png` | `hce-connection.png` |
| `mq12qc8g-Gemini_Generated_Image_49ah1y49ah1y49ah.png` | `security-data.png` |
| `mq12wiqn-Gemini_Generated_Image_xuiajnxuiajnxuia.png` | `integration-fluid.png` |

Ignorar archivos duplicados en maqueta (sufijos con hash).

---

## 6. No scope (no implementar en esta fase)

- Lógica de negocio en botones (son placeholders UI)
- Integración con API
- Autenticación real
- Páginas internas del dashboard
