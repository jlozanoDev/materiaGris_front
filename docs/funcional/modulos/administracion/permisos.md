# Módulo Funcional: Administración — Permisos

## Propósito de Negocio
Visualizar el catálogo completo de permisos del sistema, organizados por categorías, para entender qué acciones pueden realizarse y cómo se agrupan.

## Actores
- Administrador

## Funcionalidades
| Funcionalidad | Estado |
|--------------|--------|
| Listado de permisos del sistema | ✅ Implementado |
| Agrupación por categorías jerárquicas | ✅ Implementado |
| Visualización de slug, acción y descripción | ✅ Implementado |
| Edición de permisos | ❌ No planificado |

## Criterios de Aceptación
- La vista debe mostrar todos los permisos del sistema
- Los permisos deben agruparse por categorías (Admin, Pacientes, etc.)
- El usuario debe poder ver el slug, la acción y la descripción de cada permiso

## Reglas de Negocio
- Este módulo es de solo lectura (los permisos se crean mediante migraciones en backend)
- Las categorías pueden tener subcategorías (jerarquía padre-hijo)
- Cada permiso pertenece a una categoría y tiene una acción asociada (view, create, update, delete)

## Categorías de Permisos

| Categoría | Slug | Permisos incluidos |
|-----------|------|-------------------|
| Admin — Usuarios | `conf-users` | `admin.user.view`, `admin.user.create`, `admin.user.update`, `admin.user.delete` |
| Admin — Roles | `conf-roles` | `admin.role.view`, `admin.role.create`, `admin.role.update`, `admin.role.delete`, `admin.permission.view` |
| Pacientes | `pacientes` | `patient.view`, `patient.create`, `patient.update` |

## Flujo Principal
1. Administrador navega a `/admin/permissions`
2. Ve el listado completo de permisos agrupados por categorías
3. Puede identificar qué permisos existen para asignarlos a roles
4. (uso indirecto) Los permisos se seleccionan en el editor de roles

## Dependencias
- API de permisos (`/admin/permissions`)
- Módulo de Roles (consume esta información en el editor)

## Estado
✅ **Implementado.** Funcionalidad completa. Pendiente mejorar la visualización jerárquica.

## Pendientes (Roadmap)
- [ ] Mejorar visualización jerárquica (árbol expandible de categorías padre → hijo)
- [ ] Mostrar en qué roles está usado cada permiso
- [ ] Indicador visual de permisos del sistema (protegidos vs editables)
