# Guía rápida ACL (frontend)

Helpers:
- `authStore.hasPermission(slug)` — true si permiso = 1
- `authStore.hasPermissions([s1,s2], mode='any'|'all')`

Directiva:
- `v-has-permission="'patients.edit'"`
- `v-has-permission:all="['a','b']"` (arg opcional para modo)

Router:
- meta.permissions: array or string
- meta.permissionsMode: 'any'|'all'

Ejemplo:
```js
{
  path: '/admin/users',
  component: AdminUsers,
  meta: { requiresAuth: true, permissions: ['admin.user.view'] }
}
```
