# Presentación del Proyecto — MaterIA Gris

## URL de acceso

```
{baseUrl}/slides
```

Ejemplo en producción: [https://materiagrisfront-production.up.railway.app/slides](https://materiagrisfront-production.up.railway.app/slides)

## Slides

| # | Título | Descripción |
|---|--------|-------------|
| 1 | Portada | Logo + partículas animadas + tagline |
| 2 | El Problema | Pain points de la gestión clínica tradicional |
| 3 | La Solución | Tres pilares: Informes IA, Diagnóstico Asistido, Consultas Grabadas |
| 4 | Gestión de Pacientes | CRUD de pacientes, fichas clínicas, búsqueda |
| 5 | Informes con IA | Pipeline completo: grabación → transcripción → extracción → revisión → firma |
| 6 | Workflow | 6 pasos: buscar → plantilla → grabar → IA → revisar → firmar |
| 7 | Admin RBAC | Perfiles: Médico, Administrador, Recepcionista. Permisos granulares |
| 8 | Stack y Cierre | Stack tecnológico + enlaces a producción y GitHub |

## Navegación

| Acción | Control |
|--------|---------|
| Siguiente slide | → Flecha derecha / ↓ / Click mitad derecha |
| Slide anterior | ← Flecha izquierda / ↑ / Click mitad izquierda |
| Indicador | "N / 8" + barra de progreso abajo |

## Stack técnico de la presentación

- **Framework**: Vue 3 + Composition API
- **Animaciones**: Anime.js v4 (transiciones 3D card-flip)
- **Partículas**: Canvas + useParticleNetwork composable
- **Estilos**: Design system del proyecto (Tailwind tokens + glassmorphism)
- **Assets**: Logos SVG, imágenes del proyecto (doctor.png, sangre-bg, hero-bg-right)

## Desarrollo local

```bash
npm run dev
# Abrir http://localhost:5173/slides
```

## Modificar

Agregar/quitar slides en `src/modules/presentation/presentation/pages/SlidesPage.vue`.
Cada slide es un componente independiente en `src/modules/presentation/presentation/components/Slide*.vue`.
