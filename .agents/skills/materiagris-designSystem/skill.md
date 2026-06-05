# Design System Specification

## Overview
This design system focuses on a soft, modern aesthetic utilizing a vibrant, high-energy palette for the app interface, and a distinct dark theme for the public-facing landing and legal pages. It balances high-performance typography with a friendly, approachable interface through significant corner rounding and balanced spacing.

---

## App Theme (Light Mode)

### Color Palette
The system utilizes a light mode configuration with a **vibrant** variant for the authenticated application.

| Token       | Value    | Usage                                        |
|-------------|----------|----------------------------------------------|
| Primary     | #5860fe  | High-emphasis actions, key brand moments     |
| Primary-600 | #4858e6  | Primary hover state                          |
| Primary-700 | #384ad6  | Primary active state                         |
| Secondary   | #7867d2  | Supporting UI, secondary interactive         |
| Tertiary    | #b75395  | Vibrant highlights, decorative accents       |
| Accent      | #60a5fa  | Accent highlights, stats gradients           |
| Danger      | #fb7185  | Destructive actions, errors                  |
| Muted       | #79729d  | Neutral text, subdued labels                 |
| Page-bg     | #f7fbf9  | Page background                              |

### Layout
- Sidebar: gradient `linear-gradient(180deg, #3d2ab5 0%, #6448f8 100%)`
- Hero sections: gradient `linear-gradient(135deg, #5ba6ff 0%, #7b52f4 100%)`
- Stats bars: gradient `linear-gradient(90deg, #60a5fa 0%, #7c3aed 100%)`

### Buttons
- `.btn`: inline-flex, rounded-3xl, px-4 py-2, text-sm font-medium
- `.btn-primary`: white text on primary color
- `.btn-outline`: transparent bg with primary border
- `.btn-sm`: compact variant
- `.btn-ghost`: transparent bg, hover state

### Cards
- `.card`: white bg, rounded-2xl, p-4, `var(--shadow-card)`
- `.glass`: rgba white bg with blur, 20px radius, used for overlay cards
- `.glass-card`: rgba white bg with blur, 20px radius, 32px padding, hover lift effect

### Form Inputs
- `.form-input`: rounded-xl, white bg, soft shadow
- Active state: indigo-500 border, elevated shadow, -1px translateY
- Disabled/readonly: slate-100 bg, muted border, not-allowed cursor

### Shadows
- `--shadow-soft`: `0 4px 20px rgba(30, 35, 80, 0.07)`
- `--shadow-card`: `0 8px 32px rgba(30, 35, 80, 0.1)`

---

## Landing & Legal Pages (Dark Theme)

Used on `/welcome`, `/aviso-legal`, `/privacidad`, `/terminos`.

### Color Palette (Dark)

| Token              | Value    | Usage                                      |
|--------------------|----------|--------------------------------------------|
| Background         | #0f0a1e  | Page and footer background                 |
| Text heading       | #ffffff  | Titles, h1, h2, strong labels              |
| Text body          | #c8c4d8  | Paragraph text on dark bg                  |
| Text subdued       | #9690a8  | Metadata, secondary text, footer links     |
| Link/accent        | #7c3aed  | Inline links, CTA button bg                |
| Link/accent glow   | #7c3aed  | CTA box-shadow: `0 1px 12px rgba(124,58,237,0.30)` |
| Border subtle      | rgba(255,255,255,0.06) | Header bottom border, dividers  |

### Header (LandingHeader.vue)
- Fixed position, z-100, full-width
- Background: solid `#0f0a1e` (no transparency)
- Height: h-16, horizontal padding px-7
- Max-width wrapper: 1140px
- Logo: `RouterLink` to `/welcome` — always links home
- Nav links: `RouterLink` to `/welcome#modulos`, `/welcome#precios`, `/welcome` (Blog, Documentación)
- Login button: transparent bg, white/10 border, `#9690a8` text
- Demo CTA: `#7c3aed` bg with purple glow shadow

### Footer (LandingFooter.vue)
- Background: `#0f0a1e`, padding-block: 56px
- Top border: `1px solid rgba(255,255,255,0.06)`
- Text color: `#9690a8`, font-size: 13px
- Legal links: `RouterLink` to `/aviso-legal`, `/privacidad`, `/terminos`
- Logo left, links right (flex wrap)

### Legal Pages Pattern
Each legal page (LegalNoticePage, PrivacyPage, TermsPage) follows:
```html
<div class="w-full overflow-x-hidden font-sans bg-white">
  <LandingHeader @login="goLogin" @demo="goDemo" />
  <main class="px-7 pt-32 pb-20 mx-auto" style="max-width: 800px;">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Title</h1>
    <p class="text-sm mb-10" style="color: #9690a8;">Last update date</p>
    <section class="space-y-8 text-sm leading-relaxed text-gray-700">
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Section title</h2>
        <p>Content...</p>
      </div>
    </section>
  </main>
  <LandingFooter />
</div>
```

### Glassmorphism Utilities (style.css)
```css
.glass {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 20px;
}
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 32px;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}
.glass-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 40px rgba(124, 58, 237, 0.15);
}
```

### Landing Section IDs (hash navigation)
| Nav link     | Target section      | Component           |
|-------------|---------------------|----------------------|
| Plataforma  | `#modulos`          | LandingModules.vue   |
| Precios     | `#precios`          | LandingPricing.vue   |
| Blog        | `/welcome` (home)   | —                    |
| Documentación | `/welcome` (home) | —                    |

Hash scrolling is handled by Vue Router `scrollBehavior` (see `core/router/index.ts`).

---

## Typography

- **Font family**: `Inter`, ui-sans-serif, system-ui (set via `--font-sans` Tailwind token)
- **Headings**: Bold, white (dark bg) or gray-900 (light bg)
- **Body**: 14px (text-sm), leading-relaxed
- **Subdued**: 13px, `#9690a8` on dark, or `#9690a8` on light

---

## Shape and Geometry

The interface prioritizes a soft, organic feel. Components use **Maximum Roundedness (Level 3)**, resulting in pill-shaped buttons, containers with large radii, and a friendly visual language.

| Element      | Border radius |
|-------------|---------------|
| Buttons     | 10px (rounded-xl / rounded-3xl) |
| Cards       | 20px (rounded-2xl) / 24px (rounded-3xl) |
| Glass cards | 20px |
| Inputs      | 12px (rounded-xl) |
| Modals      | 16px (rounded-2xl) |

---

## Spacing and Layout

The system adheres to a **Normal Spacing (Level 2)** rhythm. Key spacing values:

| Context     | Value |
|-------------|-------|
| Section padding block | clamp(48px, 8vw, 96px) |
| Page horizontal padding (mobile-first) | 28px (px-7) |
| Header height | 64px (h-16) |
| Content max-width (legal) | 800px |
| Content max-width (landing) | 1140px |

---

## Toasts (Global)

Fixed at top center, z-9998. Three variants:
- `toast--success`: primary gradient, white text
- `toast--error`: red-500 bg, white text
- `toast--info`: gray-900 bg, white text

Managed by `useToast` composable + `toastPlugin`.
