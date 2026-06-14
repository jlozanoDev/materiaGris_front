# Menú Admin: Plantillas de Informes

## Descripción

Menú de administración para gestionar plantillas de informes clínicos. Permite al administrador crear, editar y listar plantillas que definen la estructura de formularios que los médicos usarán al generar informes de pacientes.

## Ubicación en la Interfaz

El menú se encuentra en el **sidebar lateral izquierdo**, dentro del dropdown "Ajustes":

```
Sidebar
├── Inicio (Dashboard)
├── Pacientes
└── Ajustes (dropdown)
    ├── Usuarios
    ├── Roles
    ├── Permisos
    └── Plantillas de informes  ←── Este menú
```

### Componente de UI

- **Archivo**: `src/shared/components/AppSidebar.vue`
- **Posición**: Líneas 235-252
- **Elemento**: Botón dentro del dropdown de "Ajustes"

## Control de Acceso

### Permiso Requerido

| Permiso | Descripción |
|---------|-------------|
| `admin.reporttemplate.view` | Ver plantillas de informes |

### Lógica de Visibilidad

```vue
<li v-if="authStore.hasPermission('admin.reporttemplate.view')">
  <button
    title="Plantillas de informes"
    aria-label="Plantillas de informes"
    @click.prevent="openAdminRoute({ name: 'AdminReportTemplate' })"
  >
    <i class="pi pi-file"></i>
    <span>Plantillas de informes</span>
  </button>
</li>
```

El menú solo es visible para usuarios con el permiso `admin.reporttemplate.view`.

## Rutas Asociadas

| Ruta | Nombre | Componente | Permiso | Descripción |
|------|--------|------------|---------|-------------|
| `/admin/report-templates` | `AdminReportTemplate` | `ReportTemplateListPage.vue` | `admin.reporttemplate.view` | Lista de plantillas |
| `/admin/report-templates/nuevo` | `AdminReportTemplateCreate` | `ReportTemplateBuilderPage.vue` | `admin.reporttemplate.create` | Crear nueva plantilla |
| `/admin/report-templates/:id/editar` | `AdminReportTemplateEdit` | `ReportTemplateBuilderPage.vue` | `admin.reporttemplate.update` | Editar plantilla existente |

### Configuración de Rutas

**Archivo**: `src/core/router/index.ts` (líneas 14-31)

```typescript
{
  path: "/admin/report-templates",
  name: "AdminReportTemplate",
  component: () => import("@/modules/admin/report-template/presentation/pages/ReportTemplateListPage.vue"),
  meta: { requiresAuth: true, permissions: 'admin.reporttemplate.view' },
},
{
  path: "/admin/report-templates/nuevo",
  name: "AdminReportTemplateCreate",
  component: () => import("@/modules/admin/report-template/presentation/pages/ReportTemplateBuilderPage.vue"),
  meta: { requiresAuth: true, permissions: 'admin.reporttemplate.create' },
},
{
  path: "/admin/report-templates/:id/editar",
  name: "AdminReportTemplateEdit",
  component: () => import("@/modules/admin/report-template/presentation/pages/ReportTemplateBuilderPage.vue"),
  meta: { requiresAuth: true, permissions: 'admin.reporttemplate.update' },
},
```

## Páginas

### 1. Lista de Plantillas (`ReportTemplateListPage.vue`)

**Archivo**: `src/modules/admin/report-template/presentation/pages/ReportTemplateListPage.vue`

**Funcionalidad**:
- Muestra tabla con todas las plantillas de informes
- Permite buscar y filtrar plantillas
- Botón para crear nueva plantilla
- Acciones de editar y eliminar por cada plantilla

**Elementos de UI**:
- Tabla con columnas: Nombre, Descripción, Estado, Acciones
- Botón "Nueva Plantilla" (navega a `/admin/report-templates/nuevo`)
- Ícono de editar (navega a `/admin/report-templates/:id/editar`)
- Ícono de eliminar (con confirmación)

### 2. Constructor de Plantillas (`ReportTemplateBuilderPage.vue`)

**Archivo**: `src/modules/admin/report-template/presentation/pages/ReportTemplateBuilderPage.vue`

**Funcionalidad**:
- Interfaz de drag & drop para diseñar formularios
- Paleta de tipos de campo (texto, número, fecha, selección, texto fijo, tabla dinámica)
- Canvas donde se arrastran y organizan los campos
- Panel de propiedades para configurar cada campo
- Guardado de la estructura como JSON

**Layout de 3 Columnas**:
```
┌─────────────┬─────────────────┬─────────────────┐
│   Paleta    │     Canvas      │   Propiedades   │
│  (izq)      │    (centro)     │    (der)        │
├─────────────┼─────────────────┼─────────────────┤
│ Tipos de    │ Campos arrastr- │ Configuración   │
│ campo       │ ados y ordena-  │ del campo       │
│ disponibles │ dos             │ seleccionado    │
└─────────────┴─────────────────┴─────────────────┘
```

## Permisos Requeridos

| Permiso | Acción | Ruta |
|---------|--------|------|
| `admin.reporttemplate.view` | Ver lista de plantillas | `/admin/report-templates` |
| `admin.reporttemplate.create` | Crear nueva plantilla | `/admin/report-templates/nuevo` |
| `admin.reporttemplate.update` | Editar plantilla existente | `/admin/report-templates/:id/editar` |
| `admin.reporttemplate.delete` | Eliminar plantilla | Acción desde la lista |

## API Endpoints

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| `GET` | `/api/admin/report-templates` | `admin.reporttemplate.view` | Listar plantillas |
| `POST` | `/api/admin/report-templates` | `admin.reporttemplate.create` | Crear plantilla |
| `GET` | `/api/admin/report-templates/{id}` | `admin.reporttemplate.view` | Obtener plantilla |
| `PUT` | `/api/admin/report-templates/{id}` | `admin.reporttemplate.update` | Actualizar plantilla |
| `DELETE` | `/api/admin/report-templates/{id}` | `admin.reporttemplate.delete` | Eliminar plantilla |

## Estructura de Datos

### Plantilla (ReportTemplate)

```typescript
interface ReportTemplate {
  id: number | string;
  name: string;                    // Nombre de la plantilla
  description: string | null;      // Descripción opcional
  is_active: boolean;              // Estado activo/inactivo
  structure: FieldConfig[];        // Array de campos configurados
  created_at: string;
  updated_at: string;
}
```

### Campo (FieldConfig)

Cada plantilla contiene un array de `FieldConfig` que define los campos del formulario. Ver documentación detallada en `report-template-campos.md`.

## Integración con Otros Módulos

### Módulo de Reportes

Las plantillas definidas aquí son consumidas por el módulo de reportes (`/informes`) para:
- Renderizar formularios dinámicos para los médicos
- Validar campos requeridos al firmar informes
- Pre-llenar variables de sistema automáticamente

### Variables de Sistema

El constructor de plantillas permite usar variables de sistema (ej: `{paciente.nombre}`) en campos de texto fijo. Estas se resuelven automáticamente al generar un informe.

## Archivos Relacionados

| Archivo | Propósito |
|---------|-----------|
| `src/shared/components/AppSidebar.vue` | Menú sidebar con item de navegación |
| `src/core/router/index.ts` | Definición de rutas |
| `src/modules/admin/report-template/presentation/pages/ReportTemplateListPage.vue` | Página de lista |
| `src/modules/admin/report-template/presentation/pages/ReportTemplateBuilderPage.vue` | Página del constructor |
| `src/modules/admin/report-template/infrastructure/ApiReportTemplateRepository.ts` | Repositorio API |
| `docs/tecnica/modules/admin/report-template-campos.md` | Documentación técnica de campos |
| `docs/funcional/modulos/administracion/informes.md` | Documentación funcional |

## Notas de Implementación

1. **Lazy Loading**: Todos los componentes de página usan lazy loading via `() => import(...)` para optimizar el bundle inicial.

2. **Permisos Granulares**: Cada ruta tiene su propio permiso, permitiendo control fino de acceso (ver vs crear vs editar).

3. **Componente Reutilizable**: `ReportTemplateBuilderPage.vue` se usa tanto para crear como para editar, diferenciando por la presencia del parámetro `:id` en la ruta.

4. **Estado de UI**: El sidebar mantiene estado del item activo basado en la ruta actual mediante un watcher.

5. **Click Outside**: El dropdown de "Ajustes" se cierra automáticamente al hacer click fuera del menú.
