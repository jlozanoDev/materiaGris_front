## Exploration: Módulo de Configuración y Generación de Informes Dinámicos

### Current State
- **Existe un esqueleto del admin `report-template`**: ruta `/admin/report-template`, sidebar entry gated by `admin.report-template.view`, página placeholder `ReportTemplatePage.vue` con solo título estático (21 líneas, sin lógica).
- **No hay domain entities, repos, use cases, composables, ni infraestructura** para report-template. Es puro placeholder UI.
- **No existe ningún código de reports/informes** (módulo doctor-facing). Ni APIs, ni stores, ni componentes.
- **No hay librerías de drag-drop, firma digital (canvas), ni PDF viewer** instaladas en `package.json`.
- **Stack actual**: Vue 3.5 + Composition API, Vite 8, Tailwind 4, Vuetify 4, PrimeVue 4.5, Pinia 3, @tanstack/vue-table, lucide-vue-next.
- **Arquitectura**: Hexagonal/Clean con módulos feature-based bajo `src/modules/<feature>/domain|infrastructure|application|presentation/`.
- **HTTP client**: `fetchClient` desde `@/core/api/httpClient.ts`. No axios.
- **DI**: Contenedores `provideX()` en `application/containers/`.
- **Tests**: 64 spec files en `tests/`, Vitest con `jsdom`, 26 unit specs según openspec config. Mockean `global.fetch` o inyectan repo mock directamente.

### Gaps (lo que hay que construir de cero)
1. **Domain layer completo** para `admin/report-template` (entidad ReportTemplate, repositorio, use cases CRUD)
2. **Domain layer completo** para `modules/reports` (entidad PatientReport, repositorio, use cases para borrador/firma/cierre)
3. **Template Builder UI**: drag-and-drop jerárquico (secciones → filas → columnas → campos) — no existe nada similar en el codebase
4. **Conditional Logic Engine**: evaluador de expresiones en runtime (`SI campo_x == valor` → mostrar/ocultar)
5. **Dynamic Form Renderer**: renderiza un formulario a partir de un JSON de estructura en runtime
6. **Signature Capture**: componente canvas con `signature_pad` o vanilla canvas
7. **Report Lifecycle**: orquestación de estados borrador → firmado → cerrado con validaciones
8. **PDF Preview/Viewer**: renderizado cliente del informe antes de enviar a backend
9. **PDF Generation**: backend (Laravel) genera PDF desde snapshot + values — frontend solo recibe blob/url
10. **Dynamic Tables**: componente especial que permite añadir filas dinámicamente en un formulario
11. **Permissions**: nuevos slugs (`reports.view`, `reports.create`, `reports.sign`, etc.)
12. **Snapshot versioning logic**: al iniciar informe, copiar `structure` de template → `template_structure_snapshot`

### Affected Areas
- `src/modules/admin/report-template/` — expandir de placeholder a módulo completo con CRUD + builder
- `src/modules/reports/` — módulo NUEVO (doctor-facing, llenado de informes)
- `src/core/router/index.ts` — nuevas rutas para reports
- `src/shared/types/index.ts` — nuevos tipos ReportTemplate, PatientReport, ReportField
- `src/shared/components/AppSidebar.vue` — nuevas entradas de navegación para reports
- `docs/funcional/` — nuevo documento funcional del módulo
- `docs/tecnica/` — nuevo documento técnico del módulo
- `tests/` — ~15 nuevos archivos de test

### Approaches
1. **Módulo único monolítico `modules/reports/` que incluya admin + doctor** — NO recomendado.
   - Pros: Menos archivos, navegación más simple
   - Cons: Viola separación de concerns admin vs médico, mezcla permisos, código acoplado
   - Effort: Medium

2. **Dos módulos separados: `admin/report-template` (admin) + `modules/reports` (doctor) — RECOMENDADO**
   - Pros: Sigue patrón existente (admin tiene sub-módulos users/roles/permissions), separación clara de permisos, cada módulo testeable independientemente
   - Cons: Más archivos totales, necesita coordinación de tipos compartidos entre módulos
   - Effort: High

3. **Tres módulos: `admin/report-template`, `modules/reports`, `shared/builder` (componentes compartidos)**
   - Pros: Máxima reutilización del builder y renderer, el dynamic form renderer podría servir para otros formularios en el futuro
   - Cons: Over-engineering para una V1, añade complejidad de arquitectura prematura
   - Effort: Very High (no recomendado para MVP)

### Recommendation
**Approach 2** — Dos módulos separados siguiendo el patrón existente del proyecto. El módulo `admin/report-template` extiende el esqueleto existente. `modules/reports` es nuevo y encapsula toda la lógica doctor-facing.

Los tipos compartidos (ReportFieldType, TemplateStructure, etc.) van en `src/shared/types/index.ts` para que ambos módulos los consuman sin acoplarse entre sí.

### Risks
- **Snapshot race condition**: si admin edita plantilla mientras médico inicia informe. Backend debe copiar `structure` atómicamente. Frontend debe mostrar advertencia si la plantilla cambió.
- **Conditional logic security**: NUNCA usar `eval()` o `new Function()`. Implementar evaluador limitado con scope controlado.
- **PDF rendering fidelity**: diseño de columnas + campos omitidos + tablas dinámicas + firma incrustada. Probar múltiples combinaciones.
- **Digital signature legal validity**: verificar requisitos regulatorios (¿firma simple o avanzada?).
- **Performance con estructuras grandes**: un template con 50+ campos y condicionales puede ser lento. Lazy evaluation.
- **UX del template builder**: 4 niveles de jerarquía (sección→fila→columna→campo) requiere affordances visuales claros.
- **Presupuesto C1 excedido**: ~6600 líneas estimadas vs 400 del presupuesto C1. Requiere chained PRs (6 PRs recomendados).
- **Drag-drop jerárquico anidado**: componente de mayor riesgo técnico. Considerar PoC antes del PR3.

### Estimated Scope
| Área | Archivos | Líneas (est.) |
|------|----------|---------------|
| admin/report-template domain | 6 | ~250 |
| admin/report-template infra | 1 | ~120 |
| admin/report-template app | 1 | ~30 |
| admin/report-template presentation | 6 | ~1500 |
| reports domain | 8 | ~350 |
| reports infra | 1 | ~200 |
| reports app | 1 | ~40 |
| reports presentation | 9 | ~2000 |
| shared components | 3 | ~500 |
| router changes | 1 | ~20 |
| types additions | 1 | ~80 |
| tests (unit + integration) | ~15 | ~1500 |
| **TOTAL** | **~53** | **~6600** |

### Recommended Chained PR Split
1. **PR1** — Domain layer base: interfaces, entidades, types, permisos, rutas vacías (~15 archivos)
2. **PR2** — `admin/report-template`: CRUD de plantillas sin builder visual (~10 archivos)
3. **PR3** — Template Builder con drag-drop (~8 archivos, mayor riesgo)
4. **PR4** — `modules/reports`: dynamic form renderer, borrador, ciclo de vida (~12 archivos)
5. **PR5** — Signature capture, PDF preview, report view cerrado (~8 archivos)
6. **PR6** — Tests completos + documentación (~15 archivos)

### Technical Dependencies Needed
| Necesidad | Librería | Instalada? |
|-----------|----------|------------|
| Drag & Drop | `vuedraggable@next` | NO |
| Firma digital | `signature_pad` | NO |
| PDF viewer | `pdfjs-dist` | NO |
| Conditional evaluator | Custom (sin eval) | N/A |

### Ready for Proposal
**YES** — con advertencias:
1. Confirmar tipo de firma digital (simple vs avanzada)
2. Confirmar librería PDF del backend (afecta preview)
3. REQUIERE chained PRs (excede 400 líneas C1 por ~16x)
4. Drag-drop jerárquico es el mayor riesgo — considerar spike/PoC
