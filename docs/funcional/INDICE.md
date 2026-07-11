# Documentación Funcional — MateriaGris Frontend

> Propósito de negocio, funcionalidades, reglas de negocio, flujos de usuario y glosario.
> Para documentación técnica ir a [`docs/tecnica/`](../tecnica/INDICE.md).

---

## Transversales

| Archivo | Descripción |
|---------|-------------|
| [`vision-general.md`](./vision-general.md) | ¿Qué es MateriaGris? Propósito, objetivos y alcance del sistema |
| [`glosario-terminos.md`](./glosario-terminos.md) | Definiciones de términos de negocio (paciente, consulta, rol, permiso…) |
| [`perfiles-de-usuario.md`](./perfiles-de-usuario.md) | Actores del sistema: médico, administrador, recepcionista |
| [`prompt-ia-documentacion-funcional.md`](./prompt-ia-documentacion-funcional.md) | Prompt para IA: auditar y generar documentación funcional |

## Módulos funcionales

| Módulo | Archivo | ¿Qué cubre? |
|--------|---------|-------------|
| Autenticación | [`modulos/autenticacion.md`](./modulos/autenticacion.md) | Login, recuperación de contraseña, cierre de sesión |
| Dashboard | [`modulos/dashboard.md`](./modulos/dashboard.md) | Panel principal, widgets, estadísticas, calendario |
| Pacientes | [`modulos/pacientes.md`](./modulos/pacientes.md) | Alta, búsqueda, edición de pacientes |
| Admin — Usuarios | [`modulos/administracion/usuarios.md`](./modulos/administracion/usuarios.md) | CRUD de usuarios del sistema |
| Admin — Roles | [`modulos/administracion/roles.md`](./modulos/administracion/roles.md) | Roles y asignación de permisos |
| Admin — Permisos | [`modulos/administracion/permisos.md`](./modulos/administracion/permisos.md) | Catálogo de permisos del sistema |
| Admin — Clínica | [`modulos/administracion/clinica.md`](./modulos/administracion/clinica.md) | Datos institucionales: nombre, dirección, contacto, CUIT |
| Admin — Informes | [`modulos/administracion/informes.md`](./modulos/administracion/informes.md) | Configuración de campos de plantillas de informes |
| Admin — Cabecera/Pie informes | [`modulos/admin-report-template.md`](./modulos/admin-report-template.md) | Cabecera y pie configurables en plantillas |
| Reports (Informes) | [`modulos/reports.md`](./modulos/reports.md) | Creación, edición, firma, archivado e impresión de informes |

## Flujos de usuario

| Flujo | Archivo | Descripción |
|-------|---------|-------------|
| Login y acceso | [`flujos/login.md`](./flujos/login.md) | Desde que el usuario llega hasta que accede al sistema |
| Gestión de pacientes | [`flujos/gestion-pacientes.md`](./flujos/gestion-pacientes.md) | Buscar, crear y editar pacientes |
| Administración del sistema | [`flujos/administracion-sistema.md`](./flujos/administracion-sistema.md) | Crear usuario, asignar rol, gestionar permisos |
| Firma e impresión de informes | Pendiente | Crear, firmar e imprimir un informe clínico |

## Estado de cobertura

| Funcionalidad | Docs | Implementación | Prioridad |
|---------------|------|----------------|-----------|
| Autenticación | ✅ Documentado | ✅ Completo | Alta |
| Dashboard | ✅ Documentado | ⚠️ Parcial (datos dummy) | Alta |
| Pacientes | ✅ Documentado | ⚠️ Parcial | Alta |
| Admin — Usuarios | ✅ Documentado | ⚠️ Parcial | Alta |
| Admin — Roles | ✅ Documentado | ⚠️ Parcial | Alta |
| Admin — Permisos | ✅ Documentado | ✅ Completo | Media |
| Admin — Informes (campos) | ✅ Documentado | ✅ Completo | Alta |
| Admin — Clínica | ✅ Documentado | ✅ Completo | Alta |
| Admin — Cabecera/Pie informes | ✅ Documentado | ✅ Completo | Media |
| Reports (Informes) | ✅ Documentado | ⚠️ Parcial (impresión deshabilitada) | Alta |
| Consultas médicas | ❌ Pendiente | ❌ No implementado | Futura |

✅ Documentado / Implementado · ⚠️ Parcial / En progreso · ❌ No existe / No implementado
