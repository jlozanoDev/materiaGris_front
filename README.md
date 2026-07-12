# MateriaGris Frontend

**MateriaGris** es una aplicación web de gestión clínica que permite a profesionales de la salud administrar su práctica diaria de forma digital. Ofrece:

- **Gestión de pacientes:** alta, edición, baja y ficha clínica completa con datos personales, historial y documentos asociados.
- **Informes médicos:** creación de informes con un editor de texto enriquecido (TipTap), previsualización en tiempo real, firma digital y exportación a impresión.
- **Asistente de IA para informes:** pipeline completo que graba la consulta en audio, la transcribe mediante reconocimiento de voz con diarización de hablantes (médico/paciente), extrae datos clínicos estructurados con un LLM y los presenta en un panel de revisión campo por campo con indicadores de confianza (alto/medio/bajo) para que el profesional acepte, rechace o edite cada sugerencia antes de rellenar el informe. Soporta tres modos de entrada: grabación con micrófono, subida de archivo de audio o pegado directo de texto.
- **Control de acceso (RBAC):** tres perfiles de usuario — Médico, Administrador y Recepcionista — con permisos granulares que restringen el acceso a funcionalidades y rutas según el rol.
- **Panel de administración:** gestión de usuarios, roles, permisos, configuración de la clínica y plantillas de informes personalizables.
- **Dashboard:** panel principal con información relevante y widget de clima.

Desarrollada como SPA con Vue 3 + Composition API, sigue los principios de **Clean Architecture hexagonal** con inversión de dependencias, separación en capas (domain, application, infrastructure, presentation) y testing automatizado (unitario y end-to-end).

Consume la API REST de [`MateriaGris_api`](https://github.com/jlozanoDev/materiaGris_api.git).

**Producción:** [materiagrisfront-production.up.railway.app](https://materiagrisfront-production.up.railway.app/welcome)

## Stack tecnológico

| Tecnología | Versión |
|---|---|
| Vue | ^3.5 |
| Vite | ^8 |
| Pinia | ^3 |
| Vue Router | ^4 |
| Vuetify | ^4 |
| Tailwind CSS | ^4 |
| TypeScript | ~5.9 |
| TipTap Editor | ^3 |
| Lucide (iconos) | ^1 |
| Vitest | ^1 |
| Playwright | ^1 |
| ESLint | ^8 |
| Prettier | ^2 |

> Consulta `package.json` para las versiones exactas.

## Requisitos previos

- **Node.js ≥ 18**
- **npm** o **pnpm**
- Repositorio backend: [`github.com/jlozanoDev/materiaGris_api.git`](https://github.com/jlozanoDev/materiaGris_api.git) (debe estar levantado para el funcionamiento completo)

## Instalación y ejecución

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd MateriaGris_front

# Instalar dependencias
npm install

# Crear archivo de entorno (ajustar según tu configuración)
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

El servidor de desarrollo se inicia en `http://localhost:5173`.

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API Laravel | `http://localhost` |
| `VITE_WEATHER_DEFAULT_LAT` | Latitud por defecto para el widget de clima | `40.4168` |
| `VITE_WEATHER_DEFAULT_LON` | Longitud por defecto para el widget de clima | `-3.7038` |

Copia `.env.example` a `.env.local` o `.env` y ajusta los valores según tu entorno.

## Estructura del proyecto

```
src/
├── core/                   # Configuración global (router, store, api)
├── modules/                # Módulos funcionales (Clean Architecture)
│   ├── auth/               # Autenticación
│   ├── dashboard/          # Panel principal
│   ├── landing/            # Páginas públicas
│   ├── patients/           # Gestión de pacientes
│   ├── reports/            # Informes médicos
│   └── admin/              # Administración
│       ├── users/          # Usuarios del sistema
│       ├── roles/          # Roles
│       ├── permissions/    # Permisos
│       ├── clinic/         # Configuración de clínica
│       └── report-template/ # Plantillas de informes
├── assets/
├── composables/
├── services/
└── utils/
```

Cada módulo sigue los principios de **Clean Architecture** con hasta cuatro capas:

| Capa | Responsabilidad |
|---|---|
| `domain/` | Entidades, repositorios (interfaces), lógica de negocio |
| `application/` | Casos de uso, DTOs |
| `infrastructure/` | Implementaciones concretas (API, persistencia) |
| `presentation/` | Componentes Vue, páginas, stores específicas del módulo |

## Funcionalidades principales

| Módulo | Rutas | Perfiles RBAC |
|---|---|---|
| **Landing** | `/welcome`, `/legal-notice`, `/privacy`, `/terms` | Público |
| **Auth** | `/login`, `/forgot-password`, `/reset-password` | Público |
| **Dashboard** | `/` | Médico, Administrador, Recepcionista |
| **Pacientes** | `/patients`, `/patients/:id` | Médico, Administrador, Recepcionista |
| **Informes** | `/reports`, `/reports/:id`, `/reports/:id/edit`, `/reports/:id/print`, `/patients/:id/report/new` | Médico, Administrador |
| **Admin - Usuarios** | `/admin/users` | Administrador |
| **Admin - Roles** | `/admin/roles` | Administrador |
| **Admin - Permisos** | `/admin/permissions` | Administrador |
| **Admin - Clínica** | `/admin/clinic` | Administrador |
| **Admin - Plantillas** | `/admin/report-templates`, `/admin/report-templates/new`, `/admin/report-templates/:id/edit` | Administrador |

La aplicación cuenta con **22 rutas** y un sistema de permisos granular que restringe el acceso a funcionalidades según el rol del usuario.

## Credenciales de prueba

El backend incluye seeders que crean los siguientes usuarios de prueba:

| Email | Contraseña | Rol |
|---|---|---|
| `test@materiagris.local` | `secret123` | Administrador |
| `testprofesional@materiagris.local` | `secret123` | Profesional (Médico) |

> Estas credenciales solo funcionan si ejecutaste los seeders del backend (`php artisan db:seed`). Consulta el [`README del backend`](https://github.com/jlozanoDev/materiaGris_api.git) para más detalles sobre la configuración inicial.

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo (Vite) |
| `npm run build` | Compila para producción (typecheck + Vite build) |
| `npm run preview` | Previsualiza el build de producción |
| `npm run test` | Ejecuta tests unitarios en modo watch (Vitest) |
| `npm run test:run` | Ejecuta tests unitarios una sola vez |
| `npm run test:coverage` | Ejecuta tests con informe de cobertura |
| `npm run test:e2e` | Ejecuta tests end-to-end (Playwright) |
| `npm run lint` | Verifica el código con ESLint |
| `npm run lint:fix` | Corrige automáticamente problemas de ESLint |
| `npm run typecheck` | Verifica tipos con vue-tsc |
| `npm run format` | Formatea el código con Prettier |
| `npm run quality` | Ejecuta lint + typecheck + tests unitarios |
| `npm run verify` | Ejecuta quality + tests e2e + build |

## Documentación

El proyecto cuenta con documentación completa en la carpeta `docs/`:

- **[Índice de documentación](docs/INDICE.md)** — Punto de entrada a toda la documentación técnica y funcional del proyecto.
- **[Instrucciones de desarrollo](instructions.md)** — Guía rápida para desarrolladores con convenciones, comandos frecuentes y configuración del entorno.
