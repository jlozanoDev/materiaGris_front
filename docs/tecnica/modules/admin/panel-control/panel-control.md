# Módulo de Administración

## Descripción
Panel de administración del sistema con gestión completa de usuarios, roles y permisos. Sigue Clean Architecture con módulos independientes por recurso.

## Rutas

| Ruta | Vista | Permiso Requerido |
|------|-------|-------------------|
| `/admin/users` | `UsersPage.vue` | `admin.user.view` |
| `/admin/roles` | `RolesPage.vue` | `admin.role.view` |
| `/admin/permissions` | `PermissionsPage.vue` | `admin.permission.view` |

## Submódulos

| Módulo | Documentación |
|--------|--------------|
| Usuarios | [users.md](./users.md) |
| Roles | [roles.md](./roles.md) |
| Permisos | [permissions.md](./permissions.md) |

## Estado General
⚠️ **Parcial**. La arquitectura y los componentes visuales están completos para los 3 submódulos. Sin embargo, la persistencia real (conexión API) no está verificada. Los componentes visuales existen y consumen contenedores de DI, pero no se ha confirmado que el backend correspondiente esté implementado.

## Pendientes Generales (Roadmap)

- [ ] Verificar integración end-to-end de cada submódulo (frontend → API → backend)
- [ ] Agregar indicadores de carga (loading states) en todas las tablas
- [ ] Manejo de errores consistente (toast de error en fallos de API)
- [ ] Confirmar que los permisos del sidebar matchean con rutas existentes
- [ ] El sidebar referencia rutas `/calendar`, `/chat` y `/clock` que NO existen en el router
- [ ] Tests unitarios para composables y componentes
