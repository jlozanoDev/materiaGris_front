# Exploration: Revisión Completa del README.md

## Current State

### README actual (`README.md`, 60 líneas)

**Lo que TIENE:**
- Título y descripción básica: "Frontend SPA desarrollado con Vue 3 y Vite"
- Requisitos: Node.js 16+/18+, npm o pnpm
- Comandos de desarrollo, build, preview, tests, lint y format
- Variables de entorno: `VITE_API_URL` (pero el código usa `VITE_API_BASE_URL` — **error en el README**)
- Nota sobre API (`MateriaGris_api`) y mención de Docker

**Lo que FALTA:**
- ❌ Descripción funcional del proyecto: ¿qué es MateriaGris? ¿qué hace?
- ❌ Stack tecnológico detallado (Vue 3.5, Pinia 3, Vuetify 4, Tailwind 4, Vite 8, TypeScript 5.9, etc.) — solo menciona "Vue 3 y Vite"
- ❌ Estructura del proyecto (Clean Architecture, módulos, capas)
- ❌ Funcionalidades principales / módulos (auth, pacientes, informes, admin)
- ❌ Referencia explícita al repositorio backend (`materiaGris_api`)
- ❌ Credenciales de prueba
- ❌ Enlace a documentación (`docs/`)
- ❌ Versión de Node requerida en formato explícito (`.nvmrc` no existe)
- ❌ Enlace a `instructions.md` que ya existe en el repo
- ❌ Badges (build, coverage, etc.)
- ❌  `VITE_API_BASE_URL` es el nombre real de la variable (el README dice `VITE_API_URL` — **incorrecto**)

---

## Affected Areas

- `README.md` — archivo a reescribir completamente
- `instructions.md` — ya tiene información útil que debería estar en el README (no duplicar, sino referenciar)
- `docs/` — la documentación existente debe referenciarse desde el README

---

## Hallazgos de la Investigación

### 1. Stack Tecnológico Real

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | Vue 3 | 3.5.30 |
| Build | Vite | 8.0.1 |
| State | Pinia | 3.0.4 |
| Router | Vue Router | 4.6.4 |
| UI Framework | Vuetify | 4.0.1 |
| CSS | Tailwind CSS | 4.2.2 |
| Icons | Lucide Vue Next | 1.0.0 |
| Icons | PrimeIcons | 7.0.0 |
| HTTP Client | fetchClient propio | (no axios) |
| Rich Text | TipTap | 3.26.1 |
| PDF | html2pdf.js, pagedjs | 0.14.0, 0.4.3 |
| Animations | Anime.js | 4.4.1 |
| Drag & Drop | VueDraggable | 4.1.0 |
| Split Panes | Splitpanes | 4.1.2 |
| Tables | @tanstack/vue-table | 8.21.3 |
| Language | TypeScript | 5.9.0 |
| Node | 16+/18+ | (sin `.nvmrc`) |
| Testing | Vitest + Playwright | 1.1.4 / 1.42.0 |
| Lint | ESLint + Prettier | 8.x / 2.8 |
| Git Hooks | Husky + lint-staged | 8.x / 14.x |

### 2. Instalación y Ejecución

- **`.env.example`** existe con 3 variables:
  - `VITE_API_BASE_URL=http://localhost` ← nombre real
  - `VITE_WEATHER_DEFAULT_LAT=40.4168`
  - `VITE_WEATHER_DEFAULT_LON=-3.7038`
- **`.env`** existe (no en .gitignore aparentemente)
- Scripts disponibles en `package.json`:
  - `dev` / `build` / `preview`
  - `test` / `test:run` / `test:coverage`
  - `lint` / `lint:fix` / `format`
  - `typecheck` (vue-tsc)
  - `test:e2e` (playwright)
  - `quality` (lint + typecheck + test)
  - `verify` (quality + e2e + build)
- **`instructions.md`** tiene instrucciones de desarrollo más completas que deberían referenciarse
- No hay Docker para frontend (se ejecuta con Node local)

### 3. Arquitectura y Estructura del Proyecto

El proyecto sigue **Clean Architecture** con 4 capas por módulo:

```
src/
├── main.ts                        # Composition root (DI wiring)
├── App.vue                        # Root component (router-view + toast)
├── core/                          # Infraestructura global
│   ├── api/httpClient.ts          # fetchClient con JWT, 401/403 handlers
│   ├── config/env.ts              # API_BASE desde VITE_API_BASE_URL
│   ├── router/index.ts            # Rutas lazy-loaded + guards RBAC
│   ├── services/serviceRegistry.ts # DI container global
│   └── store/                     # Pinia stores (auth, clinic)
├── modules/                       # Módulos de negocio (Clean Architecture)
│   ├── auth/                      # domain/infra/application/presentation
│   ├── dashboard/                 # Panel principal (datos reales + dummy)
│   ├── landing/                   # Landing page pública
│   ├── patients/                  # Gestión de pacientes
│   ├── reports/                   # Informes clínicos
│   └── admin/                     # Panel de administración
│       ├── users/                 # CRUD de usuarios
│       ├── roles/                 # Editor de roles y permisos
│       ├── permissions/           # Catálogo de permisos
│       ├── clinic/                # Configuración de clínica
│       └── report-template/       # Plantillas de informes dinámicos
├── plugins/                       # Vuetify plugin
└── shared/                        # Componentes/composables/directivas compartidos
    ├── components/
    ├── composables/
    ├── directives/                # v-has-permission
    ├── types/                     # Tipos TypeScript compartidos
    └── utils/
```

Cada módulo sigue:
```
modules/<feature>/
  domain/          # entities + repository interfaces + use cases + services
  infrastructure/  # Api*Repository (implementaciones concretas)
  application/     # containers (fábricas DI provideX)
  presentation/    # pages + components + composables Vue
```

### 4. Funcionalidades Principales (rutas confirmadas)

| Ruta | Módulo | Funcionalidad |
|------|--------|---------------|
| `/` | Dashboard | Panel principal con KPIs, pacientes del día, calendario |
| `/welcome` | Landing | Landing page pública |
| `/login` | Auth | Inicio de sesión |
| `/forgot-password` | Auth | Recuperar contraseña |
| `/reset-password` | Auth | Restablecer contraseña |
| `/patients` | Patients | Listado y búsqueda de pacientes |
| `/patients/:id` | Patients | Detalle de paciente |
| `/reports` | Reports | Listado de informes |
| `/reports/:id` | Reports | Visualización de informe |
| `/reports/:id/edit` | Reports | Edición de informe |
| `/reports/:id/print` | Reports | Impresión de informe |
| `/patients/:id/report/new` | Reports | Nuevo informe para paciente |
| `/admin/users` | Admin | CRUD de usuarios del sistema |
| `/admin/roles` | Admin | Gestión de roles |
| `/admin/permissions` | Admin | Catálogo de permisos |
| `/admin/clinic` | Admin | Datos de la clínica |
| `/admin/report-templates` | Admin | Listado de plantillas de informes |
| `/admin/report-templates/new` | Admin | Crear plantilla (builder) |
| `/admin/report-templates/:id/edit` | Admin | Editar plantilla (builder) |
| `/legal-notice` | Landing | Aviso legal |
| `/privacy` | Landing | Política de privacidad |
| `/terms` | Landing | Términos y condiciones |

**Perfiles de usuario:** Médico, Administrador, Recepcionista
**Autenticación:** JWT con RBAC (Role-Based Access Control) granular por permisos

### 5. Credenciales de Prueba — HALLAZGO CRÍTICO

- **No existen credenciales de prueba en el frontend.** 
- El grep por `seed`, `password.*test`, `mock.*user`, `defaultPassword` solo encontró:
  - La palabra "credenciales" en textos legales (TermsPage.vue, LoginView.vue)
  - Un mock en tests de report-template (`mockResolvedValue`)
- No hay seeders, datos mock, ni usuarios predefinidos en el código frontend.
- **Las credenciales viven en el backend.** El repo `materiaGris_api` tiene seeders de Laravel (DatabaseSeeder, etc.) que crean usuarios de prueba.
- **Este es un gap importante** para quien quiera probar la app: necesita saber que las credenciales las define el backend.

### 6. Repositorio Backend

- **URL confirmada:** `https://github.com/jlozanoDev/materiaGris_api.git`
- **El README actual** menciona "MateriaGris_api" de pasada pero sin URL ni instrucciones
- **El `instructions.md`** dice: "La API debe estar levantada (normalmente vía Docker en el repo hermano)"
- El backend está en `/home/j-loz/proyectos/MateriaGris_api` (directorio hermano)
- Stack backend: Laravel 12, MySQL, Docker, Nginx, Redis, Mailhog
- La variable `VITE_API_BASE_URL` apunta a `http://localhost` (nginx del backend)

### 7. Documentación Existente

El proyecto tiene documentación extensa en `docs/`:
- **Funcional** (`docs/funcional/`): visión general, módulos, flujos de usuario, glosario, perfiles
- **Técnica** (`docs/tecnica/`): arquitectura, módulos, permisos, ACL, gaps
- **`docs/INDICE.md`**: índice maestro de documentación

El README actual **no enlaza a nada de esta documentación.**

### 8. Hallazgos Adicionales

- **Error en README**: dice `VITE_API_URL` pero la variable real es `VITE_API_BASE_URL`
- El Tone/Mensaje del README actual es informal ("Si quieres, puedo añadir un docker-compose...")
- `instructions.md` tiene contenido útil (conexión API, convenciones) que debería consolidarse o referenciarse
- No hay `.nvmrc` ni `.node-version` — Node 16+/18+ solo se menciona en texto
- La cobertura de tests es 80% threshold (139 test files entre `src/` y `tests/`)
- Las landing pages (`/welcome`, `/legal-notice`, `/privacy`, `/terms`) son funcionalidades públicas
- El dashboard tiene datos parcialmente dummy (ref: `sdd/refactorizar-dashboard`)
- Los informes (`reports/`) tienen impresión implementada con `pagedjs`

---

## Recomendaciones para la Propuesta

### Contenido que DEBE incluir el nuevo README

1. **Título + Badge de build/coverage + descripción funcional** (qué es MateriaGris, qué problema resuelve)
2. **Stack tecnológico** completo (tabla con versiones)
3. **Requisitos previos**: Node 16+/18+, npm/pnpm, backend levantado
4. **Variables de entorno**: tabla con `VITE_API_BASE_URL`, `VITE_WEATHER_DEFAULT_*` (CORREGIR `VITE_API_URL` → `VITE_API_BASE_URL`)
5. **Instalación y ejecución**: pasos claros (clone, `npm install`, `.env`, `npm run dev`)
6. **Repositorio backend**: URL explícita + instrucción de levantar backend primero
7. **Estructura del proyecto**: diagrama de capas + árbol de módulos
8. **Funcionalidades principales**: tabla de módulos con descripción y rutas
9. **Credenciales de prueba**: nota explícita de que las define el backend (remitir a la doc del backend)
10. **Comandos disponibles**: tabla completa de scripts npm
11. **Documentación**: enlace a `docs/INDICE.md`
12. **Convenciones de código**: enlace a `instructions.md` o resumen inline
13. **Tests**: breve mención de Vitest + Playwright + comandos

### Errores a corregir en el README actual

| Error | Corrección |
|-------|-----------|
| `VITE_API_URL` | `VITE_API_BASE_URL` |
| "16+ / 18+" ambiguo | Especificar rango: Node >=18 recomendado, mínimo 16 |
| "Si quieres, puedo añadir un docker-compose..." | Eliminar — tono informal, fuera de lugar |
| Tests E2E descrito como "si corresponde" | Son funcionales, afirmar: `npm run test:e2e` (Playwright) |

### Lo que NO debe ir en el README (delegar a docs/)

- Detalles de arquitectura Clean Architecture → ya en `docs/tecnica/arquitectura-clean-architecture.md`
- Flujos de usuario → ya en `docs/funcional/flujos/`
- Modelo de permisos RBAC → ya en `docs/tecnica/modelo-permisos-roles.md`

---

## Risks

- **Credenciales de prueba**: el README no puede incluir credenciales reales. Debe remitir al backend. Si el backend no tiene documentación de seeders, seguirá siendo un gap.
- **Mantenimiento**: si las versiones de dependencias cambian, el README quedará desactualizado. Evaluar si se justifica mantener versiones exactas en README o solo mencionar las principales.
- **Divergencia con `instructions.md`**: hay solapamiento. Recomiendo que el README sea la puerta de entrada y `instructions.md` sea para desarrolladores activos, con enlace mutuo.

---

## Ready for Proposal

**Sí.** Hay suficiente información para una propuesta completa. El README actual es espartano (60 líneas, informal, con errores) y no refleja la madurez real del proyecto (Clean Architecture, 6 módulos, 139+ tests, RBAC granular, documentación extensa).
