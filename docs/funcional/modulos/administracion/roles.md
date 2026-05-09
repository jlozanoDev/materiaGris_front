# Módulo Funcional: Administración — Roles

## Propósito de Negocio
Definir los roles del sistema y asignar los permisos que cada rol concede o deniega. Permite configurar el control de acceso de forma granular y flexible.

## Actores
- Administrador

## Funcionalidades
| Funcionalidad | Estado |
|--------------|--------|
| Listado de roles del sistema | ✅ Implementado |
| Creación de nuevo rol | ✅ Implementado |
| Edición de rol (nombre, descripción) | ✅ Implementado |
| Asignación de permisos al rol (grant/deny) | ✅ Implementado |
| Editor visual de permisos por categorías (árbol jerárquico) | ✅ Implementado |
| Eliminación de roles | ⚠️ Parcial |
| Protección de roles de sistema (no eliminables) | ⚠️ Pendiente |

## Criterios de Aceptación
- Solo los administradores pueden gestionar roles
- Al crear un rol, se debe especificar nombre y slug
- Los permisos se asignan mediante un árbol visual de categorías
- Cada permiso puede tener estado: no asignado, grant (+1) o deny (-1)
- Los roles de sistema (`is_system = true`) no deben poder eliminarse

## Reglas de Negocio
- El slug del rol debe ser único
- Los roles con `is_system = true` son protegidos y no pueden eliminarse
- Un permiso con deny (-1) en un rol siempre prevalece sobre grant (+1)
- Los permisos se organizan en categorías jerárquicas (ej: Admin > Usuarios > Permisos)
- Al eliminar un rol, los usuarios que lo tenían asignado pierden los permisos de ese rol

## Flujo Principal
1. Administrador navega a `/admin/roles`
2. Ve el listado de roles existentes
3. Crea un nuevo rol o edita uno existente
4. En el editor, navega por el árbol de categorías de permisos
5. Para cada permiso, selecciona: conceder (+1), denegar (-1) o no asignado
6. Guarda el rol → los cambios aplican a todos los usuarios con ese rol

## Dependencias
- API de roles (`/admin/roles`)
- API de permisos (`/admin/permissions`)
- Módulo de Permisos

## Estado
⚠️ **Parcial.** Interfaz completa con editor jerárquico de permisos. Pendiente verificar conexión con API y protección de roles de sistema.

## Pendientes (Roadmap)
- [ ] Verificar integración end-to-end con API
- [ ] Bloquear eliminación de roles de sistema
- [ ] Agregar confirmación antes de eliminar un rol
- [ ] Vista previa de usuarios afectados al modificar un rol
- [ ] Historial de cambios en roles (auditoría)
