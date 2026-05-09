# Índice General de Documentación — MateriaGris Frontend

> Este archivo centraliza y organiza toda la documentación técnica del proyecto frontend. Usa las secciones para encontrar rápidamente lo que necesitas.

---

## 📄 Documentación del Proyecto

Archivos en la raíz de `docs/` que definen la arquitectura, los permisos y el contrato general del sistema.

| Archivo | Descripción | Para qué sirve |
|---------|-------------|----------------|
| [`INDICE.md`](./INDICE.md) | Índice general de la documentación | Saber qué documentación existe y dónde está |
| [`arquitectura-clean-architecture.md`](./arquitectura-clean-architecture.md) | Clean Architecture del frontend | Entender las 4 capas (Presentation, Application, Domain, Infrastructure), flujo de datos, DI y estructura de módulos |
| [`modelo-permisos-roles.md`](./modelo-permisos-roles.md) | Modelo de permisos y roles | Entender RBAC: grant +1/-1, overrides, caché, auditoría y contrato `/api/me` |
| [`auditoria-gaps-criticos.md`](./auditoria-gaps-criticos.md) | Vacíos críticos detectados | Ver qué falta por implementar o arreglar en el proyecto |

---

## ⚡ Guías Rápidas

Archivos de consulta inmediata mientras desarrollas.

| Archivo | Descripción | Para qué sirve |
|---------|-------------|----------------|
| [`guia-acl-frontend.md`](./guia-acl-frontend.md) | Guía rápida ACL (frontend) | Saber cómo usar `hasPermission()`, `v-has-permission`, y guards de router |
| [`prompt-ia-documentacion.md`](./prompt-ia-documentacion.md) | Prompt maestro para IA | Reutilizar el prompt para auditar y reorganizar documentación con IA |

---

## 🧩 Documentación por Módulos

Cada carpeta describe un módulo funcional del frontend (pantallas, componentes, estado, casos de uso y roadmap).

### `modules/auth/` — Autenticación
| Archivo | Descripción |
|---------|-------------|
| [`auth/modulo-autenticacion.md`](./modules/auth/modulo-autenticacion.md) | Login, landing, forgot/reset password, flujo de autenticación, store Pinia, AuthService |

### `modules/dashboard/` — Dashboard Principal
| Archivo | Descripción |
|---------|-------------|
| [`dashboard/panel-principal.md`](./modules/dashboard/panel-principal.md) | Pantalla principal con HeroCard, PatientList, ConsultationPanel, RightPanel (datos hardcoded) |

### `modules/patients/` — Gestión de Pacientes
| Archivo | Descripción |
|---------|-------------|
| [`patients/modulo-gestion.md`](./modules/patients/modulo-gestion.md) | Búsqueda, creación y actualización de pacientes (CRUD) |

### `modules/admin/` — Administración del Sistema
| Archivo | Descripción |
|---------|-------------|
| [`admin/panel-control.md`](./modules/admin/panel-control.md) | Visión general del panel de administración (users, roles, permissions) |
| [`admin/usuarios-crud.md`](./modules/admin/usuarios-crud.md) | CRUD de usuarios: crear, editar, cambiar contraseña, direcciones |
| [`admin/roles-editor.md`](./modules/admin/roles-editor.md) | CRUD de roles con editor jerárquico de permisos (grant +1/-1) |
| [`admin/permisos-sistema.md`](./modules/admin/permisos-sistema.md) | Visualización del catálogo de permisos por categoría |

---

## 🔗 Documentación del Backend (referenciada)

Estos archivos viven en el repositorio `MateriaGris_api/docs/` pero son referenciados aquí para facilitar la navegación completa del sistema.

| Archivo (API) | Descripción | Para qué sirve |
|---------------|-------------|----------------|
| `MateriaGris_api/docs/database-structure.md` | Esquema completo de base de datos (tablas, columnas, índices) | Conocer el modelo de datos del backend |
| `MateriaGris_api/docs/consultations-module.md` | Módulo de Consultas Médicas (diseño) | Entidad, tablas, migraciones, permisos y endpoints propuestos |
| `MateriaGris_api/docs/RBAC-Audit.md` | RBAC y Auditoría implementados | Resumen de permisos, middleware, servicios y ejemplos |
| `MateriaGris_api/docs/RBAC-Audit-Prompt.md` | Plan de implementación RBAC | Fases, decisiones técnicas y estimaciones |
| `MateriaGris_api/docs/permissions.md` | Resumen técnico permisos | Modelo de roles, overrides y contrato `/api/me` |

---

## 🗺️ Estado de Documentación por Módulo

| Módulo | Docs | Implementación | Prioridad |
|--------|------|----------------|-----------|
| Autenticación | ⚠️ Parcial | ✅ Completo | Alta |
| Dashboard | ✅ Documentado | ⚠️ Parcial (datos dummy) | Alta |
| Pacientes | ✅ Documentado | ⚠️ Parcial (solo frontend) | Alta |
| Admin - Usuarios | ✅ Documentado | ⚠️ Parcial (solo frontend) | Alta |
| Admin - Roles | ✅ Documentado | ⚠️ Parcial (solo frontend) | Alta |
| Admin - Permisos | ✅ Documentado | ✅ Completo | Media |
| Consultas | ✅ Documentado (API) | ❌ No implementado | Futura |
| Calendario | ❌ No existe | ❌ No implementado | Futura |
| Chat | ❌ No existe | ❌ No implementado | Futura |

### Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Documentado / Implementado |
| ⚠️ | Documentado parcialmente / En progreso |
| ❌ | No documentado / No implementado |
