# Administración de Permisos

## Descripción
Visualización del catálogo completo de permisos del sistema, organizados por categorías jerárquicas. Módulo de solo lectura (consulta).

## Ruta
| Ruta | Vista | Permiso |
|------|-------|---------|
| `/admin/permissions` | `PermissionsPage.vue` | `admin.permission.view` |

## Componentes Relacionados

| Componente | Ubicación | Propósito |
|------------|-----------|-----------|
| `PermissionsPage.vue` | `modules/admin/permissions/presentation/pages/` | Listado de permisos agrupados por categoría |
| `UiVuetifyDataTable.vue` | `shared/components/` | Tabla de listado de permisos |

## Lógica de Estado

### Composable: `usePermissions` (`modules/admin/permissions/presentation/composables/usePermissions.js`)

Estado reactivo local para permisos.

### Casos de Uso (Domain)

| Use Case | Método | Propósito |
|----------|--------|-----------|
| `GetAllPermissionsUseCase` | `execute()` | Obtener todos los permisos del sistema |

### Infraestructura

| Clase | Propósito |
|-------|-----------|
| `ApiPermissionRepository` | Implementación HTTP del repositorio de permisos |

### Contenedor (DI)

| Contenedor | Exporta |
|------------|---------|
| `permissionsContainer.js` | `provideGetAllPermissionsUseCase()` |

### Entidad: `Permission` (`domain/entities/Permission.js`)

Atributos: `id`, `name`, `slug`, `action` (view, create, update, delete), `categoryId`, `description`.

### Categorías de permisos (backend)

| Categoría | Slug | Permisos |
|-----------|------|----------|
| Administración | `admin` | (categoría padre) |
| └── Usuarios | `conf-users` | `admin.user.view`, `admin.user.create`, `admin.user.update`, `admin.user.delete` |
| └── Roles y Permisos | `conf-roles` | `admin.role.view/create/update/delete`, `admin.permission.view` |
| Pacientes | `pacientes` | `patient.view`, `patient.create`, `patient.update` |

## Estado de Desarrollo
✅ **Completo (frontend)**. La estructura de capas está completa y el backend tiene las migraciones necesarias con datos sembrados. Pendiente verificar la conexión frontend-backend.

## Pendientes (Roadmap)

- [ ] Verificar que `GetAllPermissionsUseCase` carga permisos con sus categorías desde la API
- [ ] Agregar visualización jerárquica de categorías (padre → hijos) en la página
- [ ] Confirmar que los permisos se muestran correctamente en el editor de roles (`RolePermissionsEditor`)
- [ ] Tests unitarios para `GetAllPermissionsUseCase` y `usePermissions`
