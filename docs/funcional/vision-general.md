# Visión General de MateriaGris

## ¿Qué es MateriaGris?

MateriaGris es un sistema de gestión de pacientes y consultas médicas diseñado para clínicas y consultorios. Proporciona una plataforma centralizada para administrar el ciclo de vida completo de la atención al paciente, desde el registro inicial hasta el seguimiento de consultas, recetas y órdenes médicas.

## Objetivo de Negocio

Digitalizar y optimizar la gestión diaria de un consultorio médico, eliminando el papel y centralizando la información del paciente en un solo lugar. Esto permite:

- Reducir tiempos de búsqueda de expedientes
- Minimizar errores por datos duplicados o desactualizados
- Facilitar la colaboración entre múltiples médicos y personal administrativo
- Proveer trazabilidad completa de la atención médica

## Alcance del Sistema

### Lo que hace
- Gestión de pacientes (alta, búsqueda, edición)
- Autenticación segura con roles y permisos
- Dashboard con resumen de actividad diaria
- Administración de usuarios del sistema
- Control de acceso basado en roles (RBAC) con permisos finos

### Lo que NO hace (a corto plazo)
- Gestión de citas y agenda (planificado)
- Chat o mensajería interna (planificado)
- Módulo de consultas médicas completo con recetas, laboratorio e imagenología (planificado)
- Historial clínico electrónico completo
- Facturación / módulo contable
- Integración con sistemas externos (laboratorios, farmacias)

## Perfiles de Usuario

| Perfil | Descripción |
|--------|-------------|
| **Médico** | Usuario principal. Accede al dashboard, gestiona pacientes y consultas |
| **Administrador** | Gestiona usuarios del sistema, roles y permisos |
| **Recepcionista** | Da de alta pacientes y gestiona la agenda (futuro) |

## Stack Tecnológico (visión funcional)

| Capa | Tecnología |
|------|------------|
| Frontend | Aplicación web SPA (Vue 3) |
| Backend | API REST (Laravel) |
| Base de datos | MySQL |
| Autenticación | JWT (JSON Web Tokens) |
