# Documentación Técnica — MateriaGris Frontend

> Arquitectura, componentes, stores, casos de uso e infraestructura.
> Para documentación funcional ir a [`docs/funcional/`](../funcional/INDICE.md).

---

## Generales

| Archivo | Descripción |
|---------|-------------|
| [`arquitectura-clean-architecture.md`](./arquitectura-clean-architecture.md) | Clean Architecture: 4 capas, flujo de datos, DI, estructura de módulos |
| [`modelo-permisos-roles.md`](./modelo-permisos-roles.md) | Modelo RBAC: grant +1/-1, overrides, caché, auditoría, contrato `/api/me` |
| [`guia-acl-frontend.md`](./guia-acl-frontend.md) | Guía rápida ACL: `hasPermission()`, `v-has-permission`, guards de router |
| [`auditoria-gaps-criticos.md`](./auditoria-gaps-criticos.md) | Vacíos críticos detectados: bugs, deuda técnica, funcionalidad faltante |
| [`prompt-ia-documentacion.md`](./prompt-ia-documentacion.md) | Prompt para IA: auditar y generar documentación técnica |

## Módulos

| Módulo | Archivos |
|--------|----------|
| **Autenticación** | [`modules/auth/modulo-autenticacion.md`](./modules/auth/modulo-autenticacion.md) |
| **Dashboard** | [`modules/dashboard/panel-principal.md`](./modules/dashboard/panel-principal.md) |
| **Pacientes** | [`modules/patients/modulo-gestion.md`](./modules/patients/modulo-gestion.md) |
| **Admin — General** | [`modules/admin/panel-control/panel-control.md`](./modules/admin/panel-control/panel-control.md) |
| **Admin — Usuarios** | [`modules/admin/usuarios-crud/usuarios-crud.md`](./modules/admin/usuarios-crud/usuarios-crud.md) |
| **Admin — Roles** | [`modules/admin/roles-editor/roles-editor.md`](./modules/admin/roles-editor/roles-editor.md) |
| **Admin — Permisos** | [`modules/admin/permisos-sistema/permisos-sistema.md`](./modules/admin/permisos-sistema/permisos-sistema.md) |
| **Admin — Informes: Campos** | [`modules/admin/report-template-campos/report-template-campos.md`](./modules/admin/report-template-campos/report-template-campos.md) |
| **Admin — Informes: Menú** | [`modules/admin/report-templates-menu/report-templates-menu.md`](./modules/admin/report-templates-menu/report-templates-menu.md) |
| **Admin — Informes: Cabecera/Pie** | [`modulos/admin-report-template.md`](./modulos/admin-report-template.md) |

## Referencia cruzada con funcional

| Módulo técnico | Docs técnicas | Docs funcionales |
|----------------|---------------|------------------|
| auth | `tecnica/modules/auth/` | [`funcional/modulos/autenticacion.md`](../funcional/modulos/autenticacion.md) |
| dashboard | `tecnica/modules/dashboard/` | [`funcional/modulos/dashboard.md`](../funcional/modulos/dashboard.md) |
| patients | `tecnica/modules/patients/` | [`funcional/modulos/pacientes.md`](../funcional/modulos/pacientes.md) |
| admin — users | `tecnica/modules/admin/usuarios-crud/` | [`funcional/modulos/administracion/usuarios.md`](../funcional/modulos/administracion/usuarios.md) |
| admin — roles | `tecnica/modules/admin/roles-editor/` | [`funcional/modulos/administracion/roles.md`](../funcional/modulos/administracion/roles.md) |
| admin — permissions | `tecnica/modules/admin/permisos-sistema/` | [`funcional/modulos/administracion/permisos.md`](../funcional/modulos/administracion/permisos.md) |
| admin — report template fields | `tecnica/modules/admin/report-template-campos/` | [`funcional/modulos/administracion/informes.md`](../funcional/modulos/administracion/informes.md) |
| admin — report templates menu | `tecnica/modules/admin/report-templates-menu/` | [`funcional/modulos/administracion/informes.md`](../funcional/modulos/administracion/informes.md) |
| admin — report header/footer | `tecnica/modulos/admin-report-template.md` | [`funcional/modulos/admin-report-template.md`](../funcional/modulos/admin-report-template.md) |
