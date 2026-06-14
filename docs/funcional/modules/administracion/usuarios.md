# Módulo Funcional: Administración — Usuarios

## Propósito de Negocio
Gestionar las cuentas de usuario del sistema, permitiendo crear, editar, desactivar y asignar roles a las personas que operan el sistema.

## Actores
- Administrador

## Funcionalidades
| Funcionalidad | Estado |
|--------------|--------|
| Listado de usuarios del sistema | ✅ Implementado |
| Creación de nuevo usuario | ✅ Implementado |
| Edición de datos de usuario (nombre, email) | ✅ Implementado |
| Cambio de contraseña | ✅ Implementado |
| Asignación de roles a usuario | ✅ Implementado |
| Asignación de permisos individuales (override) | ✅ Implementado |
| Gestión de direcciones del usuario | ✅ Implementado |
| Eliminación de usuarios (soft delete) | ⚠️ Parcial |
| Paginación en listado | ❌ Pendiente |

## Criterios de Aceptación
- Solo los administradores pueden acceder a la gestión de usuarios
- Al crear un usuario, se debe asignar al menos un rol
- El email debe ser único en el sistema
- La contraseña debe cumplir requisitos de seguridad (longitud, complejidad)
- Los overrides de permisos deben respetar la regla "deny tiene prioridad"

## Reglas de Negocio
- El email de usuario es único
- Un usuario puede tener múltiples roles
- Los permisos asignados directamente a un usuario (override) tienen prioridad sobre los de sus roles
- Un permiso con deny (-1) anula cualquier grant (+1) del mismo permiso
- Los usuarios con rol de sistema no pueden eliminarse
- El cambio de contraseña requiere confirmación de la contraseña actual

## Flujo Principal
1. Administrador navega a `/admin/users`
2. Ve el listado de usuarios del sistema
3. Hace clic en "Nuevo Usuario"
4. Rellena nombre, email, contraseña
5. Asigna uno o varios roles
6. Opcionalmente asigna permisos individuales (override)
7. Guarda → el usuario ya puede iniciar sesión

## Dependencias
- API de administración de usuarios (`/admin/users`)
- API de roles (`/admin/roles`)
- Módulo de Roles y Permisos

## Estado
⚠️ **Parcial.** Interfaz completa. Pendiente verificar conexión real con API.

## Pendientes (Roadmap)
- [ ] Verificar integración end-to-end con API
- [ ] Agregar paginación en el listado
- [ ] Agregar filtros de búsqueda (por rol, activo/inactivo)
- [ ] Confirmación antes de eliminar usuario
- [ ] Historial de cambios del usuario (auditoría)
