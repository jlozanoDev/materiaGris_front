# Administración de Roles

## Descripción
CRUD de roles del sistema con editor visual de permisos. Permite crear roles, asignar permisos con grant (+1/-1) y visualizar la estructura jerárquica de categorías de permisos.

## Ruta
| Ruta | Vista | Permiso |
|------|-------|---------|
| `/admin/roles` | `RolesPage.vue` | `admin.role.view` |

## Componentes Relacionados

| Componente | Ubicación | Propósito |
|------------|-----------|-----------|
| `RolesPage.vue` | `modules/admin/roles/presentation/pages/` | Listado de roles con opciones CRUD |
| `RolePermissionsEditor.vue` | `modules/admin/roles/presentation/components/` | Editor jerárquico de permisos por categoría |
| `PermissionCategoryNode.vue` | `modules/admin/roles/presentation/components/` | Nodo recursivo del árbol de categorías (expandir/colapsar, toggle grant) |
| `UiVuetifyDataTable.vue` | `shared/components/` | Tabla de listado de roles |

## Lógica de Estado

### Composable: `useRoles` (`modules/admin/roles/presentation/composables/useRoles.js`)

Estado reactivo local para la gestión de roles.

### Casos de Uso (Domain)

| Use Case | Método | Propósito |
|----------|--------|-----------|
| `GetRolesUseCase` | `execute()` | Obtener todos los roles |
| `GetRoleUseCase` | `execute(id)` | Obtener un rol por ID (con permisos) |
| `CreateRoleUseCase` | `execute(roleData)` | Crear nuevo rol |
| `UpdateRoleUseCase` | `execute(id, data)` | Actualizar rol (con permisos asociados) |
| `DeleteRoleUseCase` | `execute(id)` | Eliminar rol |

### Infraestructura

| Clase | Propósito |
|-------|-----------|
| `ApiRoleRepository` | Implementación HTTP del repositorio de roles |

### Contenedor (DI)

| Contenedor | Exporta |
|------------|---------|
| `rolesContainer.js` | `provideGetRolesUseCase()`, `provideGetRoleUseCase()`, `provideCreateRoleUseCase()`, `provideUpdateRoleUseCase()`, `provideDeleteRoleUseCase()` |

### Entidad: `Role` (`domain/entities/Role.js`)

Atributos: `id`, `name`, `slug`, `description`, `isSystem`, `permissions` (colección).

## Estado de Desarrollo
⚠️ **Parcial**. La estructura de capas y componentes visuales está completa. El editor de permisos con árbol jerárquico y permisos grant/deny está implementado en el frontend. Pendiente verificar la conexión real con API.

## Pendientes (Roadmap)

- [ ] Verificar que `GetRolesUseCase` carga roles correctamente desde la API
- [ ] Verificar que `UpdateRoleUseCase` envía correctamente la matriz de permisos (con grant +1/-1)
- [ ] Confirmar que `RolePermissionsEditor.vue` maneja correctamente permisos anidados
- [ ] Confirmar que `PermissionCategoryNode.vue` renderiza correctamente el árbol desde la API
- [ ] Agregar confirmación antes de eliminar un rol (especialmente roles de sistema `is_system`)
- [ ] Bloquear eliminación de roles de sistema (`is_system = true`)
- [ ] Notificaciones toast de éxito/error en cada operación CRUD
- [ ] Tests unitarios para `RolePermissionsEditor`, `PermissionCategoryNode`, use cases
