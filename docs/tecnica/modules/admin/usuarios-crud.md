# Administración de Usuarios

## Descripción
CRUD de usuarios del sistema. Permite crear, editar, cambiar contraseña, gestionar direcciones y asignar roles/permisos.

## Ruta
| Ruta | Vista | Permiso |
|------|-------|---------|
| `/admin/users` | `UsersPage.vue` | `admin.user.view` |

## Componentes Relacionados

| Componente | Ubicación | Propósito |
|------------|-----------|-----------|
| `UsersPage.vue` | `modules/admin/users/presentation/pages/` | Listado de usuarios (DataTable) |
| `EditUserModal.vue` | `modules/admin/users/presentation/components/` | Modal de creación/edición: nombre, email, roles, permisos individuales |
| `ChangePasswordModal.vue` | `modules/admin/users/presentation/components/` | Modal de cambio de contraseña |
| `AddressesModal.vue` | `modules/admin/users/presentation/components/` | Modal de gestión de direcciones (multiple, con DataTable) |
| `UiVuetifyDataTable.vue` | `shared/components/` | Tabla de listado |

## Lógica de Estado

### Composable: `useUsers` (`modules/admin/users/presentation/composables/useUsers.js`)

Estado reactivo local para la gestión de usuarios.

### Casos de Uso (Domain)

| Use Case | Método | Propósito |
|----------|--------|-----------|
| `GetAllUsersUseCase` | `execute()` | Obtener listado de usuarios |
| `CreateUserUseCase` | `execute(userData)` | Crear nuevo usuario |
| `UpdateUserUseCase` | `execute(id, data)` | Actualizar usuario existente |
| `DeleteUserUseCase` | `execute(id)` | Eliminar (soft-delete) usuario |

### Infraestructura

| Clase | Propósito |
|-------|-----------|
| `ApiAdminUserRepository` | Implementación HTTP del repositorio de usuarios admin |

### Contenedor (DI)

| Contenedor | Exporta |
|------------|---------|
| `usersContainer.js` | `provideGetAllUsersUseCase()` (y otros) |

### Entidad: `User` (`domain/entities/User.js`)

Atributos: `id`, `name`, `email`, `roles`, `permissions`, `isActive`, `addresses`.

## Estado de Desarrollo
⚠️ **Parcial**. La estructura de capas y componentes visuales está completa. Pendiente verificar la conexión real con la API de backend y que los permisos se reflejen correctamente en la UI.

## Pendientes (Roadmap)

- [ ] Verificar que `GetAllUsersUseCase` se conecta correctamente con la API
- [ ] Verificar funcionalidad de `CreateUserUseCase` y `UpdateUserUseCase`
- [ ] Confirmar que `DeleteUserUseCase` implementa soft-delete
- [ ] Confirmar que `EditUserModal.vue` envía roles y permisos correctamente
- [ ] Validar que `ChangePasswordModal.vue` funciona end-to-end
- [ ] En `AddressesModal.vue`, confirmar que las direcciones se persisten correctamente
- [ ] Agregar paginación en el listado de usuarios
- [ ] Agregar filtros de búsqueda por nombre, email, rol
- [ ] Notificaciones toast de éxito/error en cada operación CRUD
- [ ] Tests unitarios para use cases y composable
