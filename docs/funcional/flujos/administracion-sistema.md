# Flujo de Usuario: Administración del Sistema

## Descripción
Proceso completo de gestión de usuarios, roles y permisos del sistema por parte del administrador.

## Diagrama de flujo

```
Administrador → Navega a /admin/
  │
  ├── /admin/users — Gestión de Usuarios
  │     ├── Listado de usuarios
  │     │     └── Filtros (futuro: por rol, activo/inactivo)
  │     ├── Crear usuario
  │     │     └── Formulario: nombre, email, contraseña, roles, permisos
  │     ├── Editar usuario
  │     │     └── Modificar datos, roles, permisos individuales
  │     ├── Cambiar contraseña
  │     │     └── Modal: contraseña actual + nueva contraseña
  │     └── Gestionar direcciones
  │           └── Modal: CRUD de direcciones del usuario
  │
  ├── /admin/roles — Gestión de Roles
  │     ├── Listado de roles
  │     ├── Crear rol
  │     │     └── Formulario: nombre, slug, descripción
  │     ├── Editar rol
  │     │     └── Editor de permisos: árbol por categorías
  │     │           ├── Expandir/colapsar categorías
  │     │           └── Toggle: no asignado / grant (+1) / deny (-1)
  │     └── Eliminar rol (con confirmación)
  │
  └── /admin/permissions — Visualización de Permisos
        └── Listado agrupado por categorías (solo lectura)
```

## Pasos detallados

### Crear un usuario
1. Administrador navega a `/admin/users`
2. Hace clic en "Nuevo Usuario"
3. Rellena: nombre, email, contraseña
4. Selecciona roles (puede elegir múltiples)
5. Opcional: asigna permisos individuales (override)
6. Guarda → toast de éxito → el usuario aparece en el listado

### Asignar permisos a un rol
1. Administrador navega a `/admin/roles`
2. Hace clic en un rol existente o crea uno nuevo
3. Se abre el editor visual con el árbol de categorías
4. Expande las categorías para ver los permisos disponibles
5. Para cada permiso, elige: conceder (+1) o denegar (-1)
6. Guarda → toast de éxito → los cambios aplican a todos los usuarios con ese rol

## Reglas de negocio aplicadas
- Deny (-1) tiene prioridad sobre grant (+1)
- Un usuario puede tener múltiples roles
- Los roles de sistema (`is_system = true`) no pueden eliminarse
- Override: los permisos asignados directamente al usuario prevalecen sobre los del rol
- Slug de rol único
- Email de usuario único
